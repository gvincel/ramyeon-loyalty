<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerQrCode;
use App\Models\PointTransaction;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => [
                'nullable',
                'string',
                'max:100',
            ],
            'date_from' => [
                'nullable',
                'date',
            ],
            'date_to' => [
                'nullable',
                'date',
                'after_or_equal:date_from',
            ],
        ]);

        $search = $validated['search'] ?? null;
        $dateFrom = $validated['date_from'] ?? null;
        $dateTo = $validated['date_to'] ?? null;

        $transactions = Transaction::with('customer')
            ->where('cashier_id', $request->user()->id)
            ->when($search, function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('receipt_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($query) use ($search) {
                            $query->where('customer_code', 'like', "%{$search}%")
                                ->orWhere('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhereRaw(
                                    "CONCAT(first_name, ' ', last_name) LIKE ?",
                                    ["%{$search}%"]
                                );
                        });
                });
            })
            ->when($dateFrom, fn ($q) => $q->whereDate('created_at', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->whereDate('created_at', '<=', $dateTo))
            ->latest('created_at')
            ->paginate(10)
            ->withQueryString();

        return inertia('Cashier/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $search,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function findCustomer(Request $request)
    {
        $validated = $request->validate([
            'qr_token' => [
                'required',
                'string',
                'size:64',
                'regex:/^[a-f0-9]{64}$/',
            ],
        ]);

        $qrCode = CustomerQrCode::with('customer')
            ->where('qr_token', $validated['qr_token'])
            ->where('is_active', true)
            ->first();

        if (!$qrCode || !$qrCode->customer || !$qrCode->customer->is_active) {
            return response()->json([
                'message' => 'Invalid or inactive customer QR code.',
            ], 404);
        }

        return response()->json([
            'customer' => [
                'id' => $qrCode->customer->id,
                'customer_code' => $qrCode->customer->customer_code,
                'first_name' => $qrCode->customer->first_name,
                'last_name' => $qrCode->customer->last_name,
                'phone_number' => $qrCode->customer->phone_number,
                'points' => $qrCode->customer->points,
            ],
        ]);
    }

    public function findCustomerByCode(Request $request)
    {
        $validated = $request->validate([
            'customer_code' => [
                'required',
                'string',
                'max:50',
            ],
        ]);

        $customer = Customer::query()
            ->where('customer_code', $validated['customer_code'])
            ->where('is_active', true)
            ->first();

        if (!$customer) {
            return response()->json([
                'message' => 'Customer not found or inactive.',
            ], 404);
        }

        return response()->json([
            'customer' => [
                'id' => $customer->id,
                'customer_code' => $customer->customer_code,
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'phone_number' => $customer->phone_number,
                'points' => $customer->points,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => [
                'required',
                'integer',
                'exists:customers,id',
            ],
            'receipt_number' => [
                'nullable',
                'string',
                'max:50',
            ],
            'purchase_amount' => [
                'required',
                'numeric',
                'min:0.01',
                'max:99999999.99',
            ],
            'points_used' => [
                'nullable',
                'integer',
                'min:0',
            ],
        ]);

        $result = DB::transaction(function () use ($validated, $request) {
            $customer = Customer::where('id', $validated['customer_id'])
                ->where('is_active', true)
                ->lockForUpdate()
                ->first();

            if (!$customer) {
                abort(404, 'Customer is inactive or does not exist.');
            }

            $previousPoints = $customer->points;

            $pointsUsed = $validated['points_used'] ?? 0;

            if ($pointsUsed > $customer->points) {
                throw ValidationException::withMessages([
                    'points_used' => 'The customer does not have enough points.',
                ]);
            }

            $purchaseAmountCents = (int) round(
                (float) $validated['purchase_amount'] * 100
            );

            $pointsUsedCents = $pointsUsed * 100;

            if ($pointsUsedCents > $purchaseAmountCents) {
                throw ValidationException::withMessages([
                    'points_used' => 'Points used cannot exceed the purchase amount.',
                ]);
            }

            $amountPaidCents = $purchaseAmountCents - $pointsUsedCents;

            $pointsEarned = intdiv($amountPaidCents, 10000);

            $newPoints = $previousPoints - $pointsUsed + $pointsEarned;

            $transaction = Transaction::create([
                'customer_id' => $customer->id,
                'cashier_id' => $request->user()->id,
                'receipt_number' => $validated['receipt_number'] ?? null,
                'purchase_amount' => $validated['purchase_amount'],
                'points_used' => $pointsUsed,
                'amount_paid' => $amountPaidCents / 100,
                'points_earned' => $pointsEarned,
                'created_at' => now(),
            ]);

            if ($pointsUsed > 0) {
                $customer->decrement('points', $pointsUsed);

                $customer->refresh();

                PointTransaction::create([
                    'customer_id' => $customer->id,
                    'transaction_id' => $transaction->id,
                    'redemption_id' => null,
                    'type' => 'redeemed',
                    'points' => -$pointsUsed,
                    'balance_after' => $customer->points,
                    'description' => 'Points used for purchase.',
                    'created_at' => now(),
                ]);
            }

            if ($pointsEarned > 0) {
                $customer->increment('points', $pointsEarned);

                $customer->refresh();

                PointTransaction::create([
                    'customer_id' => $customer->id,
                    'transaction_id' => $transaction->id,
                    'redemption_id' => null,
                    'type' => 'earned',
                    'points' => $pointsEarned,
                    'balance_after' => $customer->points,
                    'description' => 'Points earned from purchase.',
                    'created_at' => now(),
                ]);
            }

            return [
                'transaction' => $transaction,
                'points_earned' => $pointsEarned,
                'previous_points' => $previousPoints,
                'new_points' => $customer->points,
            ];
        });

        return response()->json([
            'message' => 'Transaction completed successfully.',
            'transaction' => $result['transaction'],
            'points_earned' => $result['points_earned'],
            'previous_points' => $result['previous_points'],
            'new_points' => $result['new_points'],
        ]);
    }
}