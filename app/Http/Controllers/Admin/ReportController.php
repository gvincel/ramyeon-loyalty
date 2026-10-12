<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\RewardRedemption;
use App\Models\Transaction;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        $validated = request()->validate([
        'period' => [
            'nullable',
            'in:today,week,month,year,custom',
        ],
        'start_date' => [
            'required_if:period,custom',
            'date_format:Y-m-d',
        ],
        'end_date' => [
            'required_if:period,custom',
            'date_format:Y-m-d',
            'after_or_equal:start_date',
        ],
    ]);

        $reportDateRange = $this->getReportDateRange($validated);

        $period = $reportDateRange['period'];
        $startDate = $reportDateRange['startDate'];
        $endDate = $reportDateRange['endDate'];
        $totalSales = Transaction::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount_paid');

        $totalTransactions = Transaction::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $averageTransaction = $totalTransactions > 0
            ? $totalSales / $totalTransactions
            : 0;

        $pointsEarned = Transaction::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('points_earned');

        $pointsUsedForPurchases = Transaction::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('points_used');

        $rewardRedemptions = RewardRedemption::query()
            ->where('status', 'completed')
            ->whereBetween('redeemed_at', [$startDate, $endDate])
            ->count();

        $pointsSpentOnRewards = RewardRedemption::query()
            ->where('status', 'completed')
            ->whereBetween('redeemed_at', [$startDate, $endDate])
            ->sum('points_used');

        $pointsLeaderboard = Customer::query()
            ->select([
                'id',
                'customer_code',
                'first_name',
                'last_name',
                'points',
            ])
            ->orderByDesc('points')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit(10)
            ->get();

        $rewardBreakdown = RewardRedemption::query()
            ->selectRaw('reward_id, COUNT(*) as redemption_count, SUM(points_used) as points_used')
            ->with('reward:id,reward_name')
            ->where('status', 'completed')
            ->whereBetween('redeemed_at', [$startDate, $endDate])
            ->groupBy('reward_id')
            ->orderByDesc('redemption_count')
            ->get();

        $salesTrend = Transaction::query()
            ->selectRaw('DATE(created_at) as date, SUM(amount_paid) as total_sales, COUNT(*) as transaction_count')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        $pointsActivity = Transaction::query()
            ->selectRaw('DATE(created_at) as date, SUM(points_earned) as points_earned, SUM(points_used) as points_used')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        $detailedTransactions = Transaction::query()
            ->with('customer:id,customer_code,first_name,last_name')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Reports', [
            'filters' => [
                'period' => $period,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
            'totalSales' => $totalSales,
            'totalTransactions' => $totalTransactions,
            'averageTransaction' => $averageTransaction,
            'pointsEarned' => $pointsEarned,
            'pointsUsedForPurchases' => $pointsUsedForPurchases,
            'rewardRedemptions' => $rewardRedemptions,
            'pointsSpentOnRewards' => $pointsSpentOnRewards,
            'pointsLeaderboard' => $pointsLeaderboard,
            'rewardBreakdown' => $rewardBreakdown,
            'salesTrend' => $salesTrend,
            'pointsActivity' => $pointsActivity,
            'detailedTransactions' => $detailedTransactions,
        ]);
    }

    public function export()
    {
        $validated = request()->validate([
            'period' => [
                'nullable',
                'in:today,week,month,year,custom',
            ],
            'start_date' => [
                'required_if:period,custom',
                'date_format:Y-m-d',
            ],
            'end_date' => [
                'required_if:period,custom',
                'date_format:Y-m-d',
                'after_or_equal:start_date',
            ],
        ]);

        $reportDateRange = $this->getReportDateRange($validated);

        $startDate = $reportDateRange['startDate'];
        $endDate = $reportDateRange['endDate'];

        $transactions = Transaction::query()
            ->with('customer:id,customer_code,first_name,last_name')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->latest('created_at')
            ->get();

        $filename = 'ramyeon-corner-report-' .
            $startDate->toDateString() .
            '-to-' .
            $endDate->toDateString() .
            '.csv';

        return response()->streamDownload(function () use ($transactions) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Date',
                'Receipt',
                'Customer',
                'Customer Code',
                'Purchase Amount',
                'Points Used',
                'Amount Paid',
                'Points Earned',
            ]);

            foreach ($transactions as $transaction) {
                fputcsv($handle, [
                    $transaction->created_at?->format('Y-m-d H:i:s'),
                    $this->safeCsvText($transaction->receipt_number),
                    $this->safeCsvText(
                        $transaction->customer
                            ? $transaction->customer->first_name . ' ' . $transaction->customer->last_name
                            : 'Walk-in Customer'
                    ),
                    $this->safeCsvText($transaction->customer?->customer_code),
                    $transaction->purchase_amount,
                    $transaction->points_used,
                    $transaction->amount_paid,
                    $transaction->points_earned,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function getReportDateRange(array $validated): array
    {
        $period = $validated['period'] ?? 'month';
        $now = now();

        switch ($period) {
            case 'today':
                $startDate = $now->copy()->startOfDay();
                $endDate = $now->copy()->endOfDay();
                break;

            case 'week':
                $startDate = $now->copy()->startOfWeek();
                $endDate = $now->copy()->endOfWeek();
                break;

            case 'year':
                $startDate = $now->copy()->startOfYear();
                $endDate = $now->copy()->endOfYear();
                break;

            case 'custom':
                $startDate = \Carbon\Carbon::parse($validated['start_date'])->startOfDay();
                $endDate = \Carbon\Carbon::parse($validated['end_date'])->endOfDay();
                break;

            case 'month':
            default:
                $period = 'month';
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
                break;
        }

        return [
            'period' => $period,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ];
    }

    private function safeCsvText(?string $value): string
    {
        $value ??= '';

        if (preg_match('/^[\x00-\x20]*[=+\-@]/', $value)) {
            return "'" . $value;
        }

        return $value;
    }
}
