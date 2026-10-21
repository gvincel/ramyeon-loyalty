import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import StatCard from '@/Components/StatCard';
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

/* ------------------------------------------------------------------ */
/* Shared style tokens                                                 */
/* ------------------------------------------------------------------ */

const CHART = {
    brand: '#A31F2B',
    accent: '#F5C542',
    inkSubtle: '#78716C',
    line: '#E7E5E4',
};

const axisTick = { fontSize: 12, fill: CHART.inkSubtle };

const tooltipStyle = {
    borderRadius: '12px',
    border: `1px solid ${CHART.line}`,
    boxShadow: '0 4px 12px rgba(28, 25, 23, 0.08)',
    padding: '10px 12px',
};

const peso = (value: string | number) =>
    `₱${Number(value).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const n = (value: string | number) =>
    Number(value).toLocaleString('en-PH');

const formatRangeDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const statIcon = {
    className: 'h-5 w-5',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
};

const SalesIcon = () => (
    <svg {...statIcon}>
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 2h12M10 19a1 1 0 11-2 0m9 0a1 1 0 11-2 0" />
    </svg>
);

const ReceiptIcon = () => (
    <svg {...statIcon}>
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-3-2-2 2-2-2-2 2-2-2-3 2V4a1 1 0 0 1 1-1Z" />
        <path d="M9 8h6M9 12h6" />
    </svg>
);

const TrendIcon = () => (
    <svg {...statIcon}>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M14 7h7v7" />
    </svg>
);

const StarIcon = () => (
    <svg {...statIcon}>
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />
    </svg>
);

const TagIcon = () => (
    <svg {...statIcon}>
        <path d="M20 12l-8 8-8-8V4h8z" />
        <circle cx="8.5" cy="8.5" r="1.5" />
    </svg>
);

const GiftIcon = () => (
    <svg {...statIcon}>
        <path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7M2 7h20v5H2zM12 7v14" />
        <path d="M12 7H8.5a2.5 2.5 0 115-1c0 1.5-1.5 1-1.5 1z" />
        <path d="M12 7h3.5a2.5 2.5 0 10-5-1c0 1.5 1 1 1.5 1z" />
    </svg>
);

/* ------------------------------------------------------------------ */
/* Reusable pieces                                                     */
/* ------------------------------------------------------------------ */

function EmptyChart({ text }: { text: string }) {
    return (
        <div className="flex h-full items-center justify-center rounded-control border border-dashed border-line bg-canvas">
            <p className="text-small text-ink-muted">{text}</p>
        </div>
    );
}

function TableEmpty({ text }: { text: string }) {
    return (
        <div className="px-6 py-12 text-center">
            <p className="text-small text-ink-muted">{text}</p>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

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
    const [period, setPeriod] = useState<ReportFilters['period']>(filters.period);
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const periods: { value: ReportFilters['period']; label: string }[] = [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This week' },
        { value: 'month', label: 'This month' },
        { value: 'year', label: 'This year' },
        { value: 'custom', label: 'Custom' },
    ];

    const applyPeriod = () => {
        router.get(
            route('admin.reports.index'),
            {
                period,
                ...(period === 'custom' ? { start_date: startDate, end_date: endDate } : {}),
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const exportReport = () => {
        const params = new URLSearchParams({
            period,
            ...(period === 'custom' ? { start_date: startDate, end_date: endDate } : {}),
        });

        window.location.href = `${route('admin.reports.export')}?${params.toString()}`;
    };

    return (
        <AdminLayout>
            <Head title="Reports" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content">
                    <AdminPageHeader
                        eyebrow="Analytics"
                        title="Reports"
                        description="Review sales, transactions, loyalty activity, and reward performance."
                    />

                    {/* KPI cards — row 1 */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label="Total Sales"
                            value={peso(totalSales)}
                            icon={<SalesIcon />}
                            footer="Revenue generated in this period"
                        />
                        <StatCard
                            label="Total Transactions"
                            value={n(totalTransactions)}
                            icon={<ReceiptIcon />}
                            footer="Receipts generated in this period"
                        />
                        <StatCard
                            label="Average Transaction"
                            value={peso(averageTransaction)}
                            icon={<TrendIcon />}
                            tone="accent"
                            footer="Average spend per receipt"
                        />
                        <StatCard
                            label="Points Earned"
                            value={n(pointsEarned)}
                            icon={<StarIcon />}
                            footer="From customer purchases"
                        />
                    </div>

                    {/* KPI cards — row 2 */}
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard
                            label="Points Used for Purchases"
                            value={n(pointsUsedForPurchases)}
                            icon={<TagIcon />}
                            tone="accent"
                            footer="Used toward purchase payment"
                        />
                        <StatCard
                            label="Reward Redemptions"
                            value={n(rewardRedemptions)}
                            icon={<GiftIcon />}
                            tone="accent"
                            footer="Completed redemptions"
                        />
                        <div className="sm:col-span-2 lg:col-span-1">
                            <StatCard
                                label="Points Spent on Rewards"
                                value={n(pointsSpentOnRewards)}
                                icon={<GiftIcon />}
                                footer="Points used for completed reward redemptions"
                            />
                        </div>
                    </div>

                    {/* Report period — unified with the app's filter bar pattern */}
                    <section className="mt-6 panel" aria-labelledby="report-period-heading">
                        <div className="panel-header">
                            <h2 id="report-period-heading" className="panel-title">
                                Report period
                            </h2>
                            <p className="panel-desc">
                                Choose the date range that every report below should cover.
                            </p>
                        </div>

                        <div className="border-b border-line bg-surface-muted px-5 py-4 sm:px-6">
                            {/* Filter row: period pills + Apply */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div
                                    role="group"
                                    aria-label="Report period"
                                    className="flex flex-wrap gap-2"
                                >
                                    {periods.map((p) => {
                                        const isActive = period === p.value;
                                        return (
                                            <button
                                                key={p.value}
                                                type="button"
                                                aria-pressed={isActive}
                                                onClick={() => setPeriod(p.value)}
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-small font-medium transition-colors duration-base ease-standard ${
                                                    isActive
                                                        ? 'border-brand-200 bg-brand-50 text-brand-700 shadow-sm'
                                                        : 'border-line-strong bg-surface text-ink-muted hover:bg-canvas hover:text-ink'
                                                }`}
                                            >
                                                {isActive && (
                                                    <span
                                                        className="h-1.5 w-1.5 rounded-full bg-brand"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                {p.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    type="button"
                                    onClick={applyPeriod}
                                    className="btn-primary sm:ml-auto sm:shrink-0"
                                >
                                    <span
                                        className="material-symbols-outlined text-[18px]"
                                        aria-hidden="true"
                                    >
                                        refresh
                                    </span>
                                    Apply
                                </button>
                            </div>

                            {/* Custom date inputs — progressive disclosure */}
                            {period === 'custom' && (
                                <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="start-date" className="field-label">
                                            Start date
                                        </label>
                                        <input
                                            id="start-date"
                                            type="date"
                                            required
                                            max={endDate || undefined}
                                            value={startDate}
                                            onChange={(event) => setStartDate(event.target.value)}
                                            className="field-input"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="end-date" className="field-label">
                                            End date
                                        </label>
                                        <input
                                            id="end-date"
                                            type="date"
                                            required
                                            min={startDate || undefined}
                                            value={endDate}
                                            onChange={(event) => setEndDate(event.target.value)}
                                            className="field-input"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Currently showing — brand-tinted range chip */}
                            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                                <span className="text-caption font-medium text-ink-muted">
                                    Currently showing:
                                </span>
                                <span className="badge-brand">
                                    <span
                                        className="material-symbols-outlined text-[14px]"
                                        aria-hidden="true"
                                    >
                                        calendar_today
                                    </span>
                                    {formatRangeDate(filters.start_date)} – {formatRangeDate(filters.end_date)}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Sales and transaction trends */}
                    <section className="mt-6 panel">
                        <div className="panel-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="panel-title">Sales and transaction trends</h2>
                                <p className="panel-desc">
                                    Transactions recorded during the selected report period.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={exportReport}
                                className="btn-secondary shrink-0"
                            >
                                <span
                                    className="material-symbols-outlined text-[18px]"
                                    aria-hidden="true"
                                >
                                    download
                                </span>
                                Export CSV
                            </button>
                        </div>

                        <div className="p-6">
                            <div
                                className="h-72"
                                role="img"
                                aria-label="Line chart of sales and transaction trends"
                            >
                                {salesTrend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={salesTrend}
                                            margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke={CHART.line}
                                            />
                                            <XAxis
                                                dataKey="date"
                                                tick={axisTick}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                yAxisId="sales"
                                                tick={axisTick}
                                                tickLine={false}
                                                axisLine={false}
                                                width={64}
                                                tickFormatter={(value) =>
                                                    `₱${Number(value).toLocaleString('en-PH')}`
                                                }
                                            />
                                            <YAxis
                                                yAxisId="transactions"
                                                orientation="right"
                                                tick={axisTick}
                                                tickLine={false}
                                                axisLine={false}
                                                allowDecimals={false}
                                                width={36}
                                            />
                                            <Tooltip
                                                contentStyle={tooltipStyle}
                                                labelStyle={{
                                                    color: CHART.inkSubtle,
                                                    fontWeight: 600,
                                                }}
                                            />
                                            <Line
                                                yAxisId="sales"
                                                type="monotone"
                                                dataKey="total_sales"
                                                name="Sales"
                                                stroke={CHART.brand}
                                                strokeWidth={2.5}
                                                dot={false}
                                            />
                                            <Line
                                                yAxisId="transactions"
                                                type="monotone"
                                                dataKey="transaction_count"
                                                name="Transactions"
                                                stroke={CHART.accent}
                                                strokeWidth={2.5}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyChart text="No sales or transaction data for this period." />
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Purchase points activity */}
                    <section className="mt-6 panel">
                        <div className="panel-header">
                            <h2 className="panel-title">Purchase points activity</h2>
                            <p className="panel-desc">
                                Daily points earned and points used toward purchase payments.
                            </p>
                        </div>

                        <div className="p-6">
                            <div
                                className="h-72"
                                role="img"
                                aria-label="Line chart of purchase points activity"
                            >
                                {pointsActivity.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={pointsActivity}
                                            margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke={CHART.line}
                                            />
                                            <XAxis
                                                dataKey="date"
                                                tick={axisTick}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                tick={axisTick}
                                                tickLine={false}
                                                axisLine={false}
                                                allowDecimals={false}
                                                width={36}
                                            />
                                            <Tooltip
                                                contentStyle={tooltipStyle}
                                                labelStyle={{
                                                    color: CHART.inkSubtle,
                                                    fontWeight: 600,
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="points_earned"
                                                name="Points earned"
                                                stroke={CHART.brand}
                                                strokeWidth={2.5}
                                                dot={false}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="points_used"
                                                name="Points used for purchases"
                                                stroke={CHART.accent}
                                                strokeWidth={2.5}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyChart text="No purchase points activity for this period." />
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Top customers */}
                    <section className="mt-6 panel">
                        <div className="panel-header">
                            <h2 className="panel-title">Top customers by current points</h2>
                            <p className="panel-desc">
                                Customers with the highest current loyalty point balances.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            {pointsLeaderboard.length > 0 ? (
                                <table className="w-full text-left text-small">
                                    <thead className="border-b border-line bg-surface-muted">
                                        <tr>
                                            <th scope="col" className="table-th">
                                                Rank
                                            </th>
                                            <th scope="col" className="table-th">
                                                Customer
                                            </th>
                                            <th scope="col" className="table-th">
                                                Customer code
                                            </th>
                                            <th scope="col" className="table-th text-right">
                                                Current points
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {pointsLeaderboard.map((customer, index) => (
                                            <tr
                                                key={customer.id}
                                                className="transition-colors duration-base hover:bg-canvas/60"
                                            >
                                                <td className="px-6 py-4 font-semibold tabular-nums text-ink">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-ink">
                                                    {customer.first_name} {customer.last_name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="chip">
                                                        {customer.customer_code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-semibold tabular-nums text-ink">
                                                    {n(customer.points)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <TableEmpty text="No customers with loyalty points yet." />
                            )}
                        </div>
                    </section>

                    {/* Detailed transactions */}
                    <section className="mt-6 panel">
                        <div className="panel-header">
                            <h2 className="panel-title">Detailed transactions</h2>
                            <p className="panel-desc">
                                Transactions recorded during the selected report period.
                                {detailedTransactions.total > 0 && (
                                    <>
                                        {' '}Showing{' '}
                                        <span className="font-semibold text-ink">
                                            {n(detailedTransactions.total)}
                                        </span>{' '}
                                        transaction
                                        {detailedTransactions.total === 1 ? '' : 's'}.
                                    </>
                                )}
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            {detailedTransactions.data.length > 0 ? (
                                <table className="w-full min-w-[860px] text-left text-small">
                                    <thead className="border-b border-line bg-surface-muted">
                                        <tr>
                                            <th scope="col" className="table-th whitespace-nowrap">
                                                Date
                                            </th>
                                            <th scope="col" className="table-th whitespace-nowrap">
                                                Receipt
                                            </th>
                                            <th scope="col" className="table-th whitespace-nowrap">
                                                Customer
                                            </th>
                                            <th
                                                scope="col"
                                                className="table-th text-right whitespace-nowrap"
                                            >
                                                Purchase
                                            </th>
                                            <th
                                                scope="col"
                                                className="table-th text-right whitespace-nowrap"
                                            >
                                                Points used
                                            </th>
                                            <th
                                                scope="col"
                                                className="table-th text-right whitespace-nowrap"
                                            >
                                                Paid
                                            </th>
                                            <th
                                                scope="col"
                                                className="table-th text-right whitespace-nowrap"
                                            >
                                                Earned
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {detailedTransactions.data.map((transaction) => (
                                            <tr
                                                key={transaction.id}
                                                className="transition-colors duration-base hover:bg-canvas/60"
                                            >
                                                <td className="whitespace-nowrap px-6 py-4 text-ink-muted">
                                                    {new Date(
                                                        transaction.created_at,
                                                    ).toLocaleDateString('en-PH', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 font-medium text-ink">
                                                    {transaction.receipt_number}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {transaction.customer ? (
                                                        <div>
                                                            <p className="font-medium text-ink">
                                                                {transaction.customer.first_name}{' '}
                                                                {transaction.customer.last_name}
                                                            </p>
                                                            <p className="mt-0.5 text-caption text-ink-muted">
                                                                {transaction.customer.customer_code}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-ink-muted">
                                                            Walk-in customer
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-ink-muted">
                                                    {peso(transaction.purchase_amount)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-ink-muted">
                                                    {n(transaction.points_used)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right font-semibold tabular-nums text-ink">
                                                    {peso(transaction.amount_paid)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right font-semibold tabular-nums text-ink">
                                                    {n(transaction.points_earned)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <TableEmpty text="No transactions for this period." />
                            )}
                        </div>

                        {detailedTransactions.last_page > 1 && (
                            <nav
                                className="flex flex-wrap items-center justify-center gap-1 border-t border-line px-5 py-4 sm:justify-end sm:px-6"
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
                                        'flex min-h-10 min-w-10 items-center justify-center rounded-control px-3 text-small font-medium transition-colors',
                                        link.active
                                            ? 'bg-brand text-white'
                                            : link.url
                                              ? 'text-ink-muted hover:bg-canvas hover:text-ink'
                                              : 'cursor-not-allowed text-ink-subtle',
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
                    </section>

                    {/* Reward breakdown */}
                    <section className="mt-6 panel">
                        <div className="panel-header">
                            <h2 className="panel-title">Reward breakdown</h2>
                            <p className="panel-desc">
                                Completed reward redemptions for the selected period.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            {rewardBreakdown.length > 0 ? (
                                <table className="w-full text-left text-small">
                                    <thead className="border-b border-line bg-surface-muted">
                                        <tr>
                                            <th scope="col" className="table-th">
                                                Reward
                                            </th>
                                            <th scope="col" className="table-th text-right">
                                                Redemptions
                                            </th>
                                            <th scope="col" className="table-th text-right">
                                                Points used
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {rewardBreakdown.map((item) => (
                                            <tr
                                                key={item.reward_id}
                                                className="transition-colors duration-base hover:bg-canvas/60"
                                            >
                                                <td className="px-6 py-4 font-medium text-ink">
                                                    {item.reward.reward_name}
                                                </td>
                                                <td className="px-6 py-4 text-right tabular-nums text-ink-muted">
                                                    {n(item.redemption_count)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-semibold tabular-nums text-ink">
                                                    {n(item.points_used)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <TableEmpty text="No completed reward redemptions for this period." />
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}