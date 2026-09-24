<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Reward;
use App\Models\RewardRedemption;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalCustomers = Customer::count();

        $activeCustomers = Customer::where('is_active', true)->count();

        $totalCashiers = User::where('role', 'cashier')->count();

        $totalPurchaseAmount = Transaction::sum('purchase_amount');

        $totalPointsEarned = Transaction::sum('points_earned');

        $totalPointsRedeemed = RewardRedemption::where('status', 'completed')
            ->sum('points_used');

        $totalRedemptions = RewardRedemption::where('status', 'completed')
            ->count();

        $activeRewards = Reward::where('is_active', true)->count();

        $recentTransactions = Transaction::with([
            'customer',
            'cashier',
        ])
            ->latest('created_at')
            ->limit(5)
            ->get();

        $recentRedemptions = RewardRedemption::with([
            'customer',
            'reward',
            'cashier',
        ])
            ->where('status', 'completed')
            ->latest('redeemed_at')
            ->limit(5)
            ->get();

        $monthlyTransactions = Transaction::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('SUM(purchase_amount) as total_amount'),
            DB::raw('SUM(points_earned) as total_points'),
            DB::raw('COUNT(*) as transaction_count'),
        )
            ->whereYear('created_at', now()->year)
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->orderBy('month')
            ->get();

        $monthlyCustomers = Customer::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as customer_count'),
        )
            ->whereYear('created_at', now()->year)
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->orderBy('month')
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalCustomers' => $totalCustomers,
                'activeCustomers' => $activeCustomers,
                'totalCashiers' => $totalCashiers,
                'totalPurchaseAmount' => $totalPurchaseAmount,
                'totalPointsEarned' => $totalPointsEarned,
                'totalPointsRedeemed' => $totalPointsRedeemed,
                'totalRedemptions' => $totalRedemptions,
                'activeRewards' => $activeRewards,
            ],

            'recentTransactions' => $recentTransactions,

            'recentRedemptions' => $recentRedemptions,

            'monthlyTransactions' => $monthlyTransactions,

            'monthlyCustomers' => $monthlyCustomers,
        ]);
    }
}