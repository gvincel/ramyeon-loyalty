<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Reward;
use App\Models\RewardRedemption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RewardRedemptionController extends Controller
{
    /**
     * Get rewards that are currently available for a customer.
     */
    public function availableRewards(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
        ]);

        $customer = Customer::where('id', $validated['customer_id'])
            ->where('is_active', true)
            ->first();

        if (!$customer) {
            return response()->json([
                'message' => 'Customer is inactive or does not exist.',
            ], 404);
        }

        $today = now()->toDateString();

        $rewards = Reward::where('is_active', true)
            ->where(function ($query) use ($today) {
                $query->whereNull('start_date')
                    ->orWhereDate('start_date', '<=', $today);
            })
            ->where(function ($query) use ($today) {
                $query->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', $today);
            })
            ->orderBy('points_required')
            ->get();

        return response()->json([
            'rewards' => $rewards,
        ]);
    }

    /**
     * Redeem a reward for a customer.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'reward_id' => ['required', 'integer', 'exists:rewards,id'],
        ]);

        $result = DB::transaction(function () use ($validated, $request) {
            /*
             * Lock the customer row while checking and deducting points.
             * This prevents concurrent redemptions from spending
             * the same points.
             */
            $customer = Customer::where('id', $validated['customer_id'])
                ->where('is_active', true)
                ->lockForUpdate()
                ->first();

            if (!$customer) {
                abort(404, 'Customer is inactive or does not exist.');
            }

            $today = now()->toDateString();

            $reward = Reward::where('id', $validated['reward_id'])
                ->where('is_active', true)
                ->where(function ($query) use ($today) {
                    $query->whereNull('start_date')
                        ->orWhereDate('start_date', '<=', $today);
                })
                ->where(function ($query) use ($today) {
                    $query->whereNull('end_date')
                        ->orWhereDate('end_date', '>=', $today);
                })
                ->first();

            if (!$reward) {
                abort(404, 'Reward is inactive or unavailable.');
            }

            if ($customer->points < $reward->points_required) {
                abort(422, 'Customer does not have enough points for this reward.');
            }

            $redemption = RewardRedemption::create([
                'customer_id' => $customer->id,
                'reward_id' => $reward->id,
                'cashier_id' => $request->user()->id,
                'points_used' => $reward->points_required,
                'redeemed_at' => now(),
                'status' => 'completed',
            ]);

            $customer->decrement(
                'points',
                $reward->points_required
            );

            $customer->refresh();

            return [
                'redemption' => $redemption,
                'customer' => $customer,
            ];
        });

        return response()->json([
            'message' => 'Reward redeemed successfully.',
            'redemption' => $result['redemption'],
            'new_points' => $result['customer']->points,
        ]);
    }

    /**
     * Display a paginated, filterable list of redemptions
     * processed by the currently logged-in cashier.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'in:completed,cancelled'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $search = $validated['search'] ?? null;
        $status = $validated['status'] ?? null;
        $dateFrom = $validated['date_from'] ?? null;
        $dateTo = $validated['date_to'] ?? null;

        $redemptions = RewardRedemption::with([
            'customer',
            'reward',
            'cashier',
        ])
            ->where('cashier_id', $request->user()->id)
            ->when($search, function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->whereHas('customer', function ($query) use ($search) {
                            $query
                                ->where('customer_code', 'like', "%{$search}%")
                                ->orWhere('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhereRaw(
                                    "CONCAT(first_name, ' ', last_name) LIKE ?",
                                    ["%{$search}%"]
                                );
                        })
                        ->orWhereHas('reward', function ($query) use ($search) {
                            $query->where('reward_name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($dateFrom, fn ($q) => $q->whereDate('redeemed_at', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->whereDate('redeemed_at', '<=', $dateTo))
            ->latest('redeemed_at')
            ->paginate(10)
            ->withQueryString();

        return inertia('Cashier/RewardRedemptions/Index', [
            'redemptions' => $redemptions,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    /**
     * Cancel a redemption and refund the customer's points.
     *
     * Rules:
     * - Only the cashier who processed the redemption may cancel it.
     * - Only redemptions in "completed" status can be cancelled.
     * - Points are refunded atomically with row locking to prevent
     *   races with new redemptions.
     */
    public function cancel(Request $request, RewardRedemption $redemption)
    {
        if ($redemption->cashier_id !== $request->user()->id) {
            abort(403, 'You can only cancel your own redemptions.');
        }

        if ($redemption->status !== 'completed') {
            abort(422, 'Only completed redemptions can be cancelled.');
        }

        DB::transaction(function () use ($redemption) {
            /*
             * Lock the customer row before refunding points so a
             * simultaneous redemption cannot observe a stale balance.
             */
            $customer = Customer::where('id', $redemption->customer_id)
                ->lockForUpdate()
                ->first();

            if (!$customer) {
                abort(404, 'Customer not found.');
            }

            $redemption->update([
                'status' => 'cancelled',
            ]);

            $customer->increment('points', $redemption->points_used);
        });

        return redirect()
            ->route('cashier.reward-redemptions.index')
            ->with('success', 'Redemption cancelled and points refunded.');
    }
}