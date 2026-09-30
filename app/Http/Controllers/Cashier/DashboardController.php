<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\RewardRedemption;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $cashier = Auth::user();
        $today = now()->toDateString();

        $todayTransactions = Transaction::query()
            ->where('cashier_id', $cashier->id)
            ->whereDate('created_at', $today)
            ->count();

        $todaySales = (float) Transaction::query()
            ->where('cashier_id', $cashier->id)
            ->whereDate('created_at', $today)
            ->sum('amount_paid');

        $todayPointsEarned = (int) Transaction::query()
            ->where('cashier_id', $cashier->id)
            ->whereDate('created_at', $today)
            ->sum('points_earned');

        $todayRewardsRedeemed = RewardRedemption::query()
            ->where('cashier_id', $cashier->id)
            ->where('status', 'completed')
            ->whereDate('redeemed_at', $today)
            ->count();

        $recentTransactions = Transaction::query()
            ->with('customer')
            ->where('cashier_id', $cashier->id)
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Transaction $t) => [
                'id' => $t->id,
                'receipt_number' => $t->receipt_number,
                'purchase_amount' => (float) $t->purchase_amount,
                'amount_paid' => (float) $t->amount_paid,
                'points_earned' => (int) $t->points_earned,
                'created_at' => $t->created_at?->toIso8601String(),
                'customer' => $t->customer ? [
                    'first_name' => $t->customer->first_name,
                    'last_name' => $t->customer->last_name,
                    'customer_code' => $t->customer->customer_code,
                ] : null,
            ]);

        return Inertia::render('Cashier/Dashboard', [
            'stats' => [
                'todayTransactions' => $todayTransactions,
                'todaySales' => $todaySales,
                'todayPointsEarned' => $todayPointsEarned,
                'todayRewardsRedeemed' => $todayRewardsRedeemed,
            ],
            'recentTransactions' => $recentTransactions,
        ]);
    }
}