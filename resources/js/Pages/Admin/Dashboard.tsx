import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import FlashMessage from '@/Components/FlashMessage';
import StatCard from '@/Components/StatCard';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Stats {
    totalCustomers: number;
    activeCustomers: number;
    totalCashiers: number;
    totalPurchaseAmount: string;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    totalRedemptions: number;
    activeRewards: number;
}

interface Customer {
    first_name: string;
    last_name: string;
    customer_code: string;
}

interface Cashier {
    name: string;
}

interface Transaction {
    id: number;
    purchase_amount: string;
    points_earned: number;
    created_at: string;
    customer: Customer;
    cashier: Cashier;
}

interface Reward {
    reward_name: string;
}

interface Redemption {
    id: number;
    points_used: number;
    redeemed_at: string;
    customer: Customer;
    reward: Reward;
    cashier: Cashier;
}

interface MonthlyTransaction {
    month: number;
    total_amount: string;
    total_points: string;
    transaction_count: number;
}

interface MonthlyCustomer {
    month: number;
    customer_count: number;
}

interface Props {
    stats: Stats;
    recentTransactions: Transaction[];
    recentRedemptions: Redemption[];
    monthlyTransactions: MonthlyTransaction[];
    monthlyCustomers: MonthlyCustomer[];
}

/* ───────── Constants & helpers ───────── */

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const chartMonths = monthNames.map((name, index) => ({
    month: name,
    monthNumber: index + 1,
}));

const CHART = {
    brand: '#A31F2B',      // --brand-600
    brandTint: '#FBF1F1',  // --brand-50
    accent: '#F5C542',     // --accent-400
    accentTint: '#FFF4CC', // --accent-100
    accentText: '#92400E', // --warning-700
    ink: '#1C1917',        // --ink
    inkSubtle: '#78716C',  // --ink-subtle
    line: '#E7E5E4',       // --line
};

const formatCurrency = (value: string | number) => {
    return `₱${Number(value).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const formatNumber = (value: string | number) => {
    return Number(value).toLocaleString('en-PH');
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

/* ───────── Icons ───────── */

const iconProps = {
    className: 'h-5 w-5',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
};

const Icons = {
    users: (
        <svg {...iconProps}>
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
    ),
    cart: (
        <svg {...iconProps}>
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 2h12M10 19a1 1 0 11-2 0m9 0a1 1 0 11-2 0" />
        </svg>
    ),
    gift: (
        <svg {...iconProps}>
            <path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7M2 7h20v5H2zM12 7v14M12 7H8.5a2.5 2.5 0 115-1c0 1.5-1.5 1-1.5 1zM12 7h3.5a2.5 2.5 0 10-5-1c0 1.5 1 1 1.5 1z" />
        </svg>
    ),
    cashier: (
        <svg {...iconProps}>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 9h18M7 14h4" />
        </svg>
    ),
    plus: (
        <svg {...iconProps}>
            <path d="M12 5v14M5 12h14" />
        </svg>
    ),
    minus: (
        <svg {...iconProps}>
            <path d="M5 12h14" />
        </svg>
    ),
};

/* ───────── Reusable pieces ───────── */

function EmptyState({ icon, title, text }: { icon: keyof typeof Icons; title: string; text: string }) {
    return (
        <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink-subtle">
                {Icons[icon]}
            </div>
            <p className="mt-4 text-small font-semibold text-ink">{title}</p>
            <p className="mt-1 text-caption text-ink-muted">{text}</p>
        </div>
    );
}

/* ───────── Page ───────── */

export default function Dashboard({
    stats,
    recentTransactions,
    recentRedemptions,
    monthlyTransactions,
    monthlyCustomers,
}: Props) {
    const { flash } = usePage().props;

    const transactionChartData = chartMonths.map((item) => {
        const transaction = monthlyTransactions.find(
            (data) => Number(data.month) === item.monthNumber,
        );
        return {
            month: item.month,
            amount: Number(transaction?.total_amount ?? 0),
            transactions: Number(transaction?.transaction_count ?? 0),
        };
    });

    const customerChartData = chartMonths.map((item) => {
        const customer = monthlyCustomers.find(
            (data) => Number(data.month) === item.monthNumber,
        );
        return {
            month: item.month,
            customers: Number(customer?.customer_count ?? 0),
        };
    });

    const loyaltyData = [
        { name: 'Points Earned', value: Number(stats.totalPointsEarned) },
        { name: 'Points Redeemed', value: Number(stats.totalPointsRedeemed) },
    ];

    const loyaltyColors = [CHART.brand, CHART.accent];

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content space-y-6">
                    
                    {/* Dashboard Header */}
                    <AdminPageHeader
                        eyebrow="Overview"
                        title="Admin Dashboard"
                        description="Monitor customer activity, purchases, and loyalty performance from one place."
                        action={
                            <div className="rounded-control border border-line bg-surface px-4 py-3 shadow-card">
                                <p className="text-caption font-medium uppercase tracking-wider text-ink-subtle">
                                    Today
                                </p>
                                <p className="mt-1 text-small font-semibold text-ink">
                                    {new Date().toLocaleDateString('en-PH', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        }
                    />

                    <FlashMessage success={flash.success} error={flash.error} />

                    {/* KPI Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label="Total Customers"
                            value={formatNumber(stats.totalCustomers)}
                            icon={Icons.users}
                            footer={
                                <>
                                    <span className="font-semibold text-success-600">
                                        {formatNumber(stats.activeCustomers)}
                                    </span>{' '}
                                    active customers
                                </>
                            }
                        />
                        <StatCard
                            label="Total Purchases"
                            value={formatCurrency(stats.totalPurchaseAmount)}
                            icon={Icons.cart}
                            footer="Across all recorded transactions"
                        />
                        <StatCard
                            label="Reward Redemptions"
                            value={formatNumber(stats.totalRedemptions)}
                            icon={Icons.gift}
                            tone="accent"
                            footer={
                                <>
                                    <span className="font-semibold text-ink">
                                        {formatNumber(stats.activeRewards)}
                                    </span>{' '}
                                    active rewards
                                </>
                            }
                        />
                        <StatCard
                            label="Cashier Accounts"
                            value={formatNumber(stats.totalCashiers)}
                            icon={Icons.cashier}
                            tone="accent"
                            footer="Cashier accounts registered in the system"
                        />
                    </div>

                    {/* Analytics */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Purchase Activity */}
                        <div className="panel">
                            <div className="panel-header flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="panel-title">Purchase Activity</h2>
                                    <p className="panel-desc">
                                        Monthly purchase amount recorded for {new Date().getFullYear()}.
                                    </p>
                                </div>
                                <div className="badge-brand hidden shrink-0 items-center gap-2 px-3 py-1.5 sm:inline-flex">
                                    <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
                                    Purchases
                                </div>
                            </div>

                            <div className="px-4 pb-5 pt-6 sm:px-6">
                                <div className="h-72" role="img" aria-label="Bar chart of monthly purchase amount">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={transactionChartData} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART.line} />
                                            <XAxis
                                                dataKey="month"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 12, fill: CHART.inkSubtle }}
                                                dy={8}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 12, fill: CHART.inkSubtle }}
                                                tickFormatter={(value) => `₱${Number(value).toLocaleString('en-PH')}`}
                                                width={58}
                                            />
                                            <Tooltip
                                                cursor={{ fill: CHART.brandTint }}
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: `1px solid ${CHART.line}`,
                                                    boxShadow: '0 4px 12px rgba(28, 25, 23, 0.08)',
                                                    padding: '10px 12px',
                                                }}
                                                labelStyle={{ color: CHART.ink, fontWeight: 600, marginBottom: '4px' }}
                                                itemStyle={{ color: CHART.brand, fontSize: '13px' }}
                                                formatter={(value) => [formatCurrency(Number(value)), 'Purchase Amount']}
                                            />
                                            <Bar dataKey="amount" fill={CHART.brand} radius={[6, 6, 0, 0]} maxBarSize={36} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Customer Growth */}
                        <div className="panel">
                            <div className="panel-header flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="panel-title">Customer Growth</h2>
                                    <p className="panel-desc">
                                        New loyalty customers registered each month.
                                    </p>
                                </div>
                                <div className="badge-accent hidden shrink-0 items-center gap-2 px-3 py-1.5 sm:inline-flex">
                                    <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                                    Customers
                                </div>
                            </div>

                            <div className="px-4 pb-5 pt-6 sm:px-6">
                                <div className="h-72" role="img" aria-label="Bar chart of new customers registered">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={customerChartData} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART.line} />
                                            <XAxis
                                                dataKey="month"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 12, fill: CHART.inkSubtle }}
                                                dy={8}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 12, fill: CHART.inkSubtle }}
                                                width={32}
                                            />
                                            <Tooltip
                                                cursor={{ fill: CHART.accentTint }}
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: `1px solid ${CHART.line}`,
                                                    boxShadow: '0 4px 12px rgba(28, 25, 23, 0.08)',
                                                    padding: '10px 12px',
                                                }}
                                                labelStyle={{ color: CHART.ink, fontWeight: 600, marginBottom: '4px' }}
                                                itemStyle={{ color: CHART.accentText, fontSize: '13px' }}
                                                formatter={(value) => [formatNumber(Number(value)), 'New Customers']}
                                            />
                                            <Bar dataKey="customers" fill={CHART.accent} radius={[6, 6, 0, 0]} maxBarSize={36} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loyalty Overview */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Loyalty Points Summary */}
                        <div className="panel lg:col-span-2">
                            <div className="panel-header">
                                <h2 className="panel-title">Loyalty Points</h2>
                                <p className="panel-desc">
                                    Overview of points earned from purchases and used for rewards.
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Points Earned */}
                                    <div className="rounded-control border border-brand-100 bg-brand-50 p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-small font-semibold text-brand-700">
                                                    Points Earned
                                                </p>
                                                <p className="mt-2 text-metric font-bold tracking-tight text-ink">
                                                    {formatNumber(stats.totalPointsEarned)}
                                                </p>
                                            </div>
                                            <div className="rounded-control bg-surface p-2.5 text-brand-600 shadow-sm ring-1 ring-brand-100">
                                                {Icons.plus}
                                            </div>
                                        </div>
                                        <p className="mt-4 text-caption text-brand-700">
                                            Generated from customer purchases
                                        </p>
                                    </div>

                                    {/* Points Redeemed */}
                                    <div className="rounded-control border border-warning-600/20 bg-accent-100 p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-small font-semibold text-warning-700">
                                                    Points Redeemed
                                                </p>
                                                <p className="mt-2 text-metric font-bold tracking-tight text-ink">
                                                    {formatNumber(stats.totalPointsRedeemed)}
                                                </p>
                                            </div>
                                            <div className="rounded-control bg-surface p-2.5 text-warning-600 shadow-sm ring-1 ring-warning-600/20">
                                                {Icons.minus}
                                            </div>
                                        </div>
                                        <p className="mt-4 text-caption text-warning-700">
                                            Used for completed reward redemptions
                                        </p>
                                    </div>
                                </div>

                                {/* Points Utilization */}
                                <div className="mt-6 rounded-control border border-line bg-surface-muted p-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-small font-semibold text-ink">
                                                Points Utilization
                                            </p>
                                            <p className="mt-1 text-caption text-ink-muted">
                                                Percentage of earned points that have been used.
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-lead font-bold text-ink">
                                            {stats.totalPointsEarned > 0
                                                ? Math.round((stats.totalPointsRedeemed / stats.totalPointsEarned) * 100)
                                                : 0}%
                                        </span>
                                    </div>

                                    <div
                                        className="mt-4 h-2.5 overflow-hidden rounded-full bg-line"
                                        role="progressbar"
                                        aria-valuenow={
                                            stats.totalPointsEarned > 0
                                                ? Math.min(100, Math.round((stats.totalPointsRedeemed / stats.totalPointsEarned) * 100))
                                                : 0
                                        }
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label="Points utilization"
                                    >
                                        <div
                                            className="h-full rounded-full bg-brand transition-all duration-slow ease-standard"
                                            style={{
                                                width: `${stats.totalPointsEarned > 0
                                                    ? Math.min(100, (stats.totalPointsRedeemed / stats.totalPointsEarned) * 100)
                                                    : 0}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="mt-3 flex items-center justify-between text-caption text-ink-muted">
                                        <span>{formatNumber(stats.totalPointsRedeemed)} redeemed</span>
                                        <span>{formatNumber(stats.totalPointsEarned)} earned</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Points Activity */}
                        <div className="panel">
                            <div className="panel-header">
                                <h2 className="panel-title">Points Activity</h2>
                                <p className="panel-desc">
                                    Earned versus redeemed across the system.
                                </p>
                            </div>

                            <div className="p-5">
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={loyaltyData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={58}
                                                outerRadius={82}
                                                paddingAngle={3}
                                                stroke="none"
                                            >
                                                {loyaltyData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={loyaltyColors[index]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: `1px solid ${CHART.line}`,
                                                    boxShadow: '0 4px 12px rgba(28, 25, 23, 0.08)',
                                                    padding: '10px 12px',
                                                }}
                                                labelStyle={{ color: CHART.ink, fontWeight: 600 }}
                                                formatter={(value) => formatNumber(Number(value))}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {loyaltyData.map((item, index) => (
                                        <div key={item.name} className="flex items-center justify-between rounded-control border border-line px-3 py-2.5">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span
                                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                    style={{ backgroundColor: loyaltyColors[index] }}
                                                    aria-hidden="true"
                                                />
                                                <span className="truncate text-small text-ink-muted">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <span className="ml-3 shrink-0 text-small font-semibold text-ink">
                                                {formatNumber(item.value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Recent Transactions */}
                        <div className="panel">
                            <div className="panel-header flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="panel-title">Recent Transactions</h2>
                                    <p className="panel-desc">Latest recorded customer purchases.</p>
                                </div>
                                <div className="badge-brand hidden sm:inline-flex">
                                    {recentTransactions.length} latest
                                </div>
                            </div>

                            <div className="divide-y divide-line">
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((transaction) => (
                                        <div key={transaction.id} className="flex items-center gap-4 px-6 py-4 transition-colors duration-base hover:bg-brand-50/40">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-small font-bold text-brand-600">
                                                {transaction.customer.first_name.charAt(0).toUpperCase()}
                                                {transaction.customer.last_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-small font-semibold text-ink">
                                                    {transaction.customer.first_name} {transaction.customer.last_name}
                                                </p>
                                                <p className="mt-0.5 truncate text-caption text-ink-muted">
                                                    {transaction.customer.customer_code} · {formatDate(transaction.created_at)}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-small font-bold text-ink">
                                                    {formatCurrency(transaction.purchase_amount)}
                                                </p>
                                                <span className="badge-brand mt-1 font-semibold">
                                                    +{transaction.points_earned} pts
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState icon="cart" title="No transactions yet." text="Transaction activity will appear here." />
                                )}
                            </div>
                        </div>

                        {/* Recent Redemptions */}
                        <div className="panel">
                            <div className="panel-header flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="panel-title">Recent Redemptions</h2>
                                    <p className="panel-desc">Latest completed reward redemptions.</p>
                                </div>
                                <div className="badge-accent hidden sm:inline-flex">
                                    {recentRedemptions.length} latest
                                </div>
                            </div>

                            <div className="divide-y divide-line">
                                {recentRedemptions.length > 0 ? (
                                    recentRedemptions.map((redemption) => (
                                        <div key={redemption.id} className="flex items-center gap-4 px-6 py-4 transition-colors duration-base hover:bg-accent-100/30">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-100 text-warning-700">
                                                {Icons.gift}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-small font-semibold text-ink">
                                                    {redemption.customer.first_name} {redemption.customer.last_name}
                                                </p>
                                                <p className="mt-0.5 truncate text-caption text-ink-muted">
                                                    {redemption.reward.reward_name} · {formatDate(redemption.redeemed_at)}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <span className="badge-accent font-semibold">
                                                    −{redemption.points_used} pts
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState icon="gift" title="No redemptions yet." text="Reward activity will appear here." />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}