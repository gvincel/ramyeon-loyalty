import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface ReportFilters {
    period: 'today' | 'week' | 'month' | 'year' | 'custom';
    start_date: string;
    end_date: string;
}

interface ReportsProps {
    filters: ReportFilters;
    totalSales: number;
    totalTransactions: number;
    averageTransaction: number;
    pointsEarned: number;
    pointsUsedForPurchases: number;
    rewardRedemptions: number;
    pointsSpentOnRewards: number;
    pointsLeaderboard: Array<{
        id: number;
        customer_code: string;
        first_name: string;
        last_name: string;
        points: number;
    }>;
    rewardBreakdown: Array<{
        reward_id: number;
        redemption_count: number;
        points_used: number;
        reward: {
            id: number;
            reward_name: string;
        };
    }>;
    salesTrend: Array<{
        date: string;
        total_sales: number;
        transaction_count: number;
    }>;
    pointsActivity: Array<{
        date: string;
        points_earned: number;
        points_used: number;
    }>;
    detailedTransactions: {
        data: Array<{
            id: number;
            receipt_number: string;
            purchase_amount: number;
            points_used: number;
            amount_paid: number;
            points_earned: number;
            created_at: string;
            customer: {
                id: number;
                customer_code: string;
                first_name: string;
                last_name: string;
            } | null;
        }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
}

export default function Reports({
    filters,
    totalSales,
    totalTransactions,
    averageTransaction,
    pointsEarned,
    pointsUsedForPurchases,
    rewardRedemptions,
    pointsSpentOnRewards,
    pointsLeaderboard,
    rewardBreakdown,
    salesTrend,
    pointsActivity,
    detailedTransactions,
}: ReportsProps) {
    const [period, setPeriod] = useState<ReportFilters['period']>(
        filters.period,
    );

    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const applyPeriod = () => {
        router.get(
            route('admin.reports.index'),
            {
                period,
                ...(period === 'custom'
                    ? {
                        start_date: startDate,
                        end_date: endDate,
                    }
                    : {}),
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const exportReport = () => {
        const params = new URLSearchParams({
            period,
            ...(period === 'custom'
                ? {
                    start_date: startDate,
                    end_date: endDate,
                }
                : {}),
        });

        window.location.href = `${route('admin.reports.export')}?${params.toString()}`;
    };

    return (
        <AdminLayout>
            <Head title="Reports" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <AdminPageHeader
                        eyebrow="Analytics"
                        title="Reports"
                        description="Review sales, transactions, loyalty activity, and reward performance."
                    />

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="relative overflow-hidden rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
                            <div className="absolute left-0 top-0 h-full w-1 bg-red-600" />

                            <p className="text-sm font-medium text-gray-500">
                                Total Sales
                            </p>

                            <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                                ₱{Number(totalSales).toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </p>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="absolute left-0 top-0 h-full w-1 bg-red-600" />

                            <p className="text-sm font-medium text-gray-500">
                                Total Transactions
                            </p>

                            <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                                {Number(totalTransactions).toLocaleString('en-PH')}
                            </p>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="absolute left-0 top-0 h-full w-1 bg-yellow-500" />

                            <p className="text-sm font-medium text-gray-500">
                                Average Transaction
                            </p>

                            <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                                ₱{Number(averageTransaction).toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </p>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="absolute left-0 top-0 h-full w-1 bg-red-600" />

                            <p className="text-sm font-medium text-gray-500">
                                Points Earned
                            </p>

                            <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                                {Number(pointsEarned).toLocaleString('en-PH')}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                From customer purchases
                            </p>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="absolute left-0 top-0 h-full w-1 bg-yellow-500" />

                            <p className="text-sm font-medium text-gray-500">
                                Points Used for Purchases
                            </p>

                            <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                                {Number(pointsUsedForPurchases).toLocaleString('en-PH')}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Used toward purchase payment
                            </p>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="absolute left-0 top-0 h-full w-1 bg-yellow-500" />

                            <p className="text-sm font-medium text-gray-500">
                                Reward Redemptions
                            </p>

                            <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                                {Number(rewardRedemptions).toLocaleString('en-PH')}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Completed redemptions
                            </p>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:col-span-2">
                            <div className="absolute left-0 top-0 h-full w-1 bg-red-600" />

                            <p className="text-sm font-medium text-gray-500">
                                Points Spent on Rewards
                            </p>

                            <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                                {Number(pointsSpentOnRewards).toLocaleString('en-PH')}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Points used for completed reward redemptions
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                    Sales and Transaction Trends
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Transactions recorded during the selected report period.
                                    {detailedTransactions.total > 0 &&
                                        ` Showing ${detailedTransactions.total.toLocaleString('en-PH')} transaction${detailedTransactions.total === 1 ? '' : 's'}.`}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={exportReport}
                                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                Export CSV
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="h-72">
                                {salesTrend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={salesTrend}
                                            margin={{
                                                top: 8,
                                                right: 8,
                                                left: 8,
                                                bottom: 8,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                            />

                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                            />

                                            <YAxis
                                                yAxisId="sales"
                                                tick={{ fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                            />

                                            <YAxis
                                                yAxisId="transactions"
                                                orientation="right"
                                                tick={{ fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                                allowDecimals={false}
                                            />

                                            <Tooltip />

                                            <Line
                                                yAxisId="sales"
                                                type="monotone"
                                                dataKey="total_sales"
                                                name="Sales"
                                                stroke="#dc2626"
                                                strokeWidth={2.5}
                                                dot={false}
                                            />

                                            <Line
                                                yAxisId="transactions"
                                                type="monotone"
                                                dataKey="transaction_count"
                                                name="Transactions"
                                                stroke="#facc15"
                                                strokeWidth={2.5}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center rounded-xl bg-gray-50">
                                        <p className="text-sm text-gray-500">
                                            No sales or transaction data for this period.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                Purchase Points Activity
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Daily points earned and points used toward purchase payments.
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="h-72">
                                {pointsActivity.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={pointsActivity}
                                            margin={{
                                                top: 8,
                                                right: 8,
                                                left: 8,
                                                bottom: 8,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                            />

                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                            />

                                            <YAxis
                                                tick={{ fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                                allowDecimals={false}
                                            />

                                            <Tooltip />

                                            <Line
                                                type="monotone"
                                                dataKey="points_earned"
                                                name="Points Earned"
                                                stroke="#dc2626"
                                                strokeWidth={2.5}
                                                dot={false}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="points_used"
                                                name="Points Used for Purchases"
                                                stroke="#facc15"
                                                strokeWidth={2.5}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center rounded-xl bg-gray-50">
                                        <p className="text-sm text-gray-500">
                                            No purchase points activity for this period.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                Top Customers by Current Points
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Customers with the highest current loyalty point balances.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            {pointsLeaderboard.length > 0 ? (
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Rank
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Customer Code
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Current Points
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {pointsLeaderboard.map((customer, index) => (
                                            <tr key={customer.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                    {index + 1}
                                                </td>

                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {customer.first_name} {customer.last_name}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {customer.customer_code}
                                                </td>

                                                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                                    {Number(customer.points).toLocaleString('en-PH')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="px-6 py-10 text-center">
                                    <p className="text-sm text-gray-500">
                                        No customers with loyalty points yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                Detailed Transactions
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Transactions recorded during the selected report period.
                                {detailedTransactions.total > 0 &&
                                    ` Showing ${detailedTransactions.total.toLocaleString('en-PH')} transaction${detailedTransactions.total === 1 ? '' : 's'}.`}
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            {detailedTransactions.data.length > 0 ? (
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Date
                                            </th>
                                            <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Receipt
                                            </th>
                                            <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Customer
                                            </th>
                                            <th className="whitespace-nowrap px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Purchase
                                            </th>
                                            <th className="whitespace-nowrap px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Points Used
                                            </th>
                                            <th className="whitespace-nowrap px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Paid
                                            </th>
                                            <th className="whitespace-nowrap px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Earned
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {detailedTransactions.data.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                                    {new Date(transaction.created_at).toLocaleDateString(
                                                        'en-PH',
                                                        {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                    {transaction.receipt_number}
                                                </td>

                                                <td className="px-6 py-4 text-sm">
                                                    {transaction.customer ? (
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {transaction.customer.first_name}{' '}
                                                                {transaction.customer.last_name}
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-gray-500">
                                                                {transaction.customer.customer_code}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500">
                                                            Walk-in Customer
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-700">
                                                    ₱{Number(transaction.purchase_amount).toLocaleString(
                                                        'en-PH',
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        },
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-700">
                                                    {Number(transaction.points_used).toLocaleString('en-PH')}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                                    ₱{Number(transaction.amount_paid).toLocaleString(
                                                        'en-PH',
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        },
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                                    {Number(transaction.points_earned).toLocaleString('en-PH')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="px-6 py-10 text-center">
                                    <p className="text-sm text-gray-500">
                                        No transactions for this period.
                                    </p>
                                </div>
                            )}
                        </div>

                        {detailedTransactions.last_page > 1 && (
                            <nav
                                className="flex flex-wrap items-center justify-center gap-1 border-t border-gray-100 px-5 py-4 sm:justify-end sm:px-6"
                                aria-label="Detailed transactions pagination"
                            >
                                {detailedTransactions.links.map((link, index) => {
                                    const label = link.label
                                        .replace(/&laquo;/g, '«')
                                        .replace(/&raquo;/g, '»')
                                        .replace(/&amp;/g, '&')
                                        .replace(/&lt;/g, '<')
                                        .replace(/&gt;/g, '>');

                                    const className = [
                                        'flex min-h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition',
                                        link.active
                                            ? 'bg-red-700 text-white'
                                            : link.url
                                            ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            : 'cursor-not-allowed text-gray-300',
                                    ].join(' ');

                                    if (!link.url) {
                                        return (
                                            <span
                                                key={`${link.label}-${index}`}
                                                className={className}
                                                aria-disabled="true"
                                            >
                                                {label}
                                            </span>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={`${link.label}-${index}`}
                                            href={link.url}
                                            preserveScroll
                                            className={className}
                                            aria-current={link.active ? 'page' : undefined}
                                        >
                                            {label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        )}
                    </div>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                Reward Breakdown
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Completed reward redemptions for the selected period.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            {rewardBreakdown.length > 0 ? (
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Reward
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Redemptions
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Points Used
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {rewardBreakdown.map((item) => (
                                            <tr key={item.reward_id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {item.reward.reward_name}
                                                </td>

                                                <td className="px-6 py-4 text-right text-sm text-gray-700">
                                                    {Number(item.redemption_count).toLocaleString('en-PH')}
                                                </td>

                                                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                                    {Number(item.points_used).toLocaleString('en-PH')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="px-6 py-10 text-center">
                                    <p className="text-sm text-gray-500">
                                        No completed reward redemptions for this period.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-gray-950">
                                    Report Period
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Choose the date range for the report.
                                </p>
                            </div>

                            <div className="w-full sm:w-56">
                                <label
                                    htmlFor="report-period"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Period
                                </label>

                                <select
                                    id="report-period"
                                    value={period}
                                    onChange={(event) =>
                                        setPeriod(
                                            event.target
                                                .value as ReportFilters['period'],
                                        )
                                    }
                                    className="block w-full rounded-xl border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:ring-red-500"
                                >
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="year">This Year</option>
                                    <option value="custom">Custom Range</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={applyPeriod}
                                    className="mt-3 w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        {period === 'custom' && (
                            <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="start-date"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Start Date
                                    </label>

                                    <input
                                        id="start-date"
                                        type="date"
                                        required
                                        max={endDate || undefined}
                                        value={startDate}
                                        onChange={(event) => setStartDate(event.target.value)}
                                        className="block w-full rounded-xl border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:ring-red-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="end-date"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        End Date
                                    </label>

                                    <input
                                        id="end-date"
                                        type="date"
                                        required
                                        min={startDate || undefined}
                                        value={endDate}
                                        onChange={(event) => setEndDate(event.target.value)}
                                        className="block w-full rounded-xl border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-red-500 focus:ring-red-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}