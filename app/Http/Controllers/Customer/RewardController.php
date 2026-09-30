<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Reward;
use App\Models\RewardRedemption;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RewardController extends Controller
{
    public function index(): Response
    {
        /** @var Customer $customer */
        $customer = Auth::guard('customer')->user();

        $today = now()->toDateString();

        $rewards = Reward::query()
            ->where('is_active', true)
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

        // Count this customer's completed redemptions per reward
        $counts = RewardRedemption::where('customer_id', $customer->id)
            ->where('status', 'completed')
            ->whereIn('reward_id', $rewards->pluck('id'))
            ->selectRaw('reward_id, COUNT(*) as total')
            ->groupBy('reward_id')
            ->pluck('total', 'reward_id');

        return Inertia::render('Customer/Rewards', [
            'rewards' => $rewards->map(function ($reward) use ($counts) {
                $timesRedeemed = (int) ($counts[$reward->id] ?? 0);

                return [
                    'id' => $reward->id,
                    'reward_name' => $reward->reward_name,
                    'reward_type' => $reward->reward_type,
                    'points_required' => $reward->points_required,
                    'reward_value' => $reward->reward_value,
                    'description' => $reward->description,
                    'start_date' => $reward->start_date?->toDateString(),
                    'end_date' => $reward->end_date?->toDateString(),
                    'redemption_limit' => $reward->redemption_limit,
                    'times_redeemed' => $timesRedeemed,
                    'is_maxed' => $reward->redemption_limit !== null
                        && $timesRedeemed >= $reward->redemption_limit,
                ];
            }),
        ]);
    }
}