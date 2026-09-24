import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';

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

const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

const chartMonths = monthNames.map((name, index) => ({
    month: name,
    monthNumber: index + 1,
}));

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

export default function Dashboard({
    stats,
    recentTransactions,
    recentRedemptions,
    monthlyTransactions,
    monthlyCustomers,
}: Props) {
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
        {
            name: 'Points Earned',
            value: Number(stats.totalPointsEarned),
        },
        {
            name: 'Points Redeemed',
            value: Number(stats.totalPointsRedeemed),
        },
    ];

    const loyaltyColors = ['#dc2626', '#facc15'];

    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Dashboard Header */}
                    <AdminPageHeader
                        eyebrow="Overview"
                        title="Admin Dashboard"
                        description="Monitor customer activity, purchases, and loyalty performance from one place."
                        action={
                            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                    Today
                                </p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                    {new Date().toLocaleDateString('en-PH', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        }
                    />

                    {/* KPI Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total Customers */}
                        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="absolute left-0 top-0 h-full w-1 bg-red-600" />

                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Customers
                                    </p>

                                    <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                                        {formatNumber(stats.totalCustomers)}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-red-50 p-3 text-red-600">
                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
                                        />

                                        <circle
                                            cx="9"
                                            cy="7"
                                            r="4"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">
                                <span className="font-semibold text-green-600">
                                    {formatNumber(stats.activeCustomers)}
                                </span>

                                <span className="text-xs text-gray-500">
                                    active customers
                                </span>
                            </div>
                        </div>

                        {/* Total Purchases */}
                        <div className="relative overflow-hidden rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
                            <div className="absolute left-0 top-0 h-full w-1 bg-red-600" />

                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Total Purchases
                                    </p>

                                    <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                                        {formatCurrency(stats.totalPurchaseAmount)}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-red-600 p-3 text-white">
                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 2h12M10 19a1 1 0 11-2 0m9 0a1 1 0 11-2 0"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="mt-5 border-t border-gray-100 pt-4">
                                <span className="text-xs text-gray-500">
                                    Across all recorded transactions
                                </span>
                            </div>
                        </div>

                        {/* Reward Redemptions */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Reward Redemptions
                                    </p>
                                    <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                                        {formatNumber(stats.totalRedemptions)}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-yellow-50 p-3 text-yellow-600">
                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7M2 7h20v5H2zM12 7v14M12 7H8.5a2.5 2.5 0 115-1c0 1.5-1.5 1-1.5 1zM12 7h3.5a2.5 2.5 0 10-5-1c0 1.5 1 1 1.5 1z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4">
                                <span className="font-semibold text-gray-700">
                                    {formatNumber(stats.activeRewards)}
                                </span>
                                <span className="text-xs text-gray-500">
                                    active rewards
                                </span>
                            </div>
                        </div>

                        {/* Cashier Accounts */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Cashier Accounts
                                    </p>
                                    <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                                        {formatNumber(stats.totalCashiers)}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-yellow-50 p-3 text-yellow-600">
                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
                                        />
                                        <circle
                                            cx="9"
                                            cy="7"
                                            r="4"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-5 border-t border-gray-100 pt-4">
                                <span className="text-xs text-gray-500">
                                    Cashier accounts registered in the system
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Analytics */}
                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        {/* Purchase Activity */}
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                            Purchase Activity
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Monthly purchase amount recorded for {new Date().getFullYear()}.
                                        </p>
                                    </div>

                                    <div className="hidden shrink-0 items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 sm:flex">
                                        <span className="h-2 w-2 rounded-full bg-red-600" />
                                        Purchases
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 pb-5 pt-6 sm:px-6">
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={transactionChartData}
                                            margin={{
                                                top: 8,
                                                right: 8,
                                                left: 8,
                                                bottom: 4,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#f1f5f9"
                                            />

                                            <XAxis
                                                dataKey="month"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                    fill: '#6b7280',
                                                }}
                                                dy={8}
                                            />

                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                    fill: '#6b7280',
                                                }}
                                                tickFormatter={(value) =>
                                                    `₱${Number(value).toLocaleString('en-PH')}`
                                                }
                                                width={58}
                                            />

                                            <Tooltip
                                                cursor={{
                                                    fill: '#fef2f2',
                                                }}
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid #e5e7eb',
                                                    boxShadow:
                                                        '0 8px 24px rgba(0, 0, 0, 0.08)',
                                                    padding: '10px 12px',
                                                }}
                                                labelStyle={{
                                                    color: '#111827',
                                                    fontWeight: 600,
                                                    marginBottom: '4px',
                                                }}
                                                itemStyle={{
                                                    color: '#dc2626',
                                                    fontSize: '13px',
                                                }}
                                                formatter={(value) => [
                                                    formatCurrency(Number(value)),
                                                    'Purchase Amount',
                                                ]}
                                            />

                                            <Bar
                                                dataKey="amount"
                                                fill="#dc2626"
                                                radius={[6, 6, 0, 0]}
                                                maxBarSize={36}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Customer Growth */}
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                            Customer Growth
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            New loyalty customers registered each month.
                                        </p>
                                    </div>

                                    <div className="hidden shrink-0 items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-700 sm:flex">
                                        <span className="h-2 w-2 rounded-full bg-yellow-500" />
                                        Customers
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 pb-5 pt-6 sm:px-6">
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={customerChartData}
                                            margin={{
                                                top: 8,
                                                right: 8,
                                                left: 8,
                                                bottom: 4,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#f1f5f9"
                                            />

                                            <XAxis
                                                dataKey="month"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                    fill: '#6b7280',
                                                }}
                                                dy={8}
                                            />

                                            <YAxis
                                                allowDecimals={false}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                    fill: '#6b7280',
                                                }}
                                                width={32}
                                            />

                                            <Tooltip
                                                cursor={{
                                                    fill: '#fefce8',
                                                }}
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid #e5e7eb',
                                                    boxShadow:
                                                        '0 8px 24px rgba(0, 0, 0, 0.08)',
                                                    padding: '10px 12px',
                                                }}
                                                labelStyle={{
                                                    color: '#111827',
                                                    fontWeight: 600,
                                                    marginBottom: '4px',
                                                }}
                                                itemStyle={{
                                                    color: '#ca8a04',
                                                    fontSize: '13px',
                                                }}
                                                formatter={(value) => [
                                                    formatNumber(Number(value)),
                                                    'New Customers',
                                                ]}
                                            />

                                            <Bar
                                                dataKey="customers"
                                                fill="#facc15"
                                                radius={[6, 6, 0, 0]}
                                                maxBarSize={36}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loyalty Overview */}
                    <div className="mt-6 grid gap-6 lg:grid-cols-3">
                        {/* Loyalty Points Summary */}
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
                            <div className="border-b border-gray-100 px-6 py-5">
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                        Loyalty Points
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Overview of points earned from purchases and used for
                                        rewards.
                                    </p>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Points Earned */}
                                    <div className="rounded-xl border border-red-100 bg-red-50 p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-red-700">
                                                    Points Earned
                                                </p>

                                                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                                                    {formatNumber(stats.totalPointsEarned)}
                                                </p>
                                            </div>

                                            <div className="rounded-lg bg-white p-2.5 text-red-600 shadow-sm ring-1 ring-red-100">
                                                <svg
                                                    className="h-5 w-5"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 3v18m9-9H3"
                                                    />
                                                </svg>
                                            </div>
                                        </div>

                                        <p className="mt-4 text-xs text-red-600">
                                            Generated from customer purchases
                                        </p>
                                    </div>

                                    {/* Points Redeemed */}
                                    <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-yellow-700">
                                                    Points Redeemed
                                                </p>

                                                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                                                    {formatNumber(stats.totalPointsRedeemed)}
                                                </p>
                                            </div>

                                            <div className="rounded-lg bg-white p-2.5 text-yellow-600 shadow-sm ring-1 ring-yellow-100">
                                                <svg
                                                    className="h-5 w-5"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 3v18m9-9H3"
                                                    />
                                                </svg>
                                            </div>
                                        </div>

                                        <p className="mt-4 text-xs text-yellow-700">
                                            Used for completed reward redemptions
                                        </p>
                                    </div>
                                </div>

                                {/* Points Utilization */}
                                <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                Points Utilization
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Percentage of earned points that have been used.
                                            </p>
                                        </div>

                                        <span className="shrink-0 text-lg font-bold text-gray-900">
                                            {stats.totalPointsEarned > 0
                                                ? Math.round(
                                                    (stats.totalPointsRedeemed /
                                                        stats.totalPointsEarned) *
                                                        100,
                                                )
                                                : 0}
                                            %
                                        </span>
                                    </div>

                                    <div
                                        className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-200"
                                        role="progressbar"
                                        aria-valuenow={
                                            stats.totalPointsEarned > 0
                                                ? Math.min(
                                                    100,
                                                    Math.round(
                                                        (stats.totalPointsRedeemed /
                                                            stats.totalPointsEarned) *
                                                            100,
                                                    ),
                                                )
                                                : 0
                                        }
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label="Points utilization"
                                    >
                                        <div
                                            className="h-full rounded-full bg-red-600 transition-all"
                                            style={{
                                                width: `${
                                                    stats.totalPointsEarned > 0
                                                        ? Math.min(
                                                            100,
                                                            (stats.totalPointsRedeemed /
                                                                stats.totalPointsEarned) *
                                                                100,
                                                        )
                                                        : 0
                                                }%`,
                                            }}
                                        />
                                    </div>

                                    <div className="mt-3 flex items-center justify-between text-xs">
                                        <span className="text-gray-500">
                                            {formatNumber(stats.totalPointsRedeemed)} redeemed
                                        </span>

                                        <span className="text-gray-500">
                                            {formatNumber(stats.totalPointsEarned)} earned
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Points Activity */}
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-5">
                                <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                    Points Activity
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
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
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={loyaltyColors[index]}
                                                    />
                                                ))}
                                            </Pie>

                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: '1px solid #e5e7eb',
                                                    boxShadow:
                                                        '0 8px 24px rgba(0, 0, 0, 0.08)',
                                                    padding: '10px 12px',
                                                }}
                                                labelStyle={{
                                                    color: '#111827',
                                                    fontWeight: 600,
                                                }}
                                                formatter={(value) =>
                                                    formatNumber(Number(value))
                                                }
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {loyaltyData.map((item, index) => (
                                        <div
                                            key={item.name}
                                            className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span
                                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor: loyaltyColors[index],
                                                    }}
                                                />

                                                <span className="truncate text-sm text-gray-600">
                                                    {item.name}
                                                </span>
                                            </div>

                                            <span className="ml-3 shrink-0 text-sm font-semibold text-gray-900">
                                                {formatNumber(item.value)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        {/* Recent Transactions */}
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                        Recent Transactions
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Latest recorded customer purchases.
                                    </p>
                                </div>

                                <div className="hidden shrink-0 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 sm:block">
                                    {recentTransactions.length} latest
                                </div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                                                {transaction.customer.first_name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                                {transaction.customer.last_name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-gray-900">
                                                    {transaction.customer.first_name}{' '}
                                                    {transaction.customer.last_name}
                                                </p>

                                                <p className="mt-0.5 truncate text-xs text-gray-500">
                                                    {transaction.customer.customer_code}
                                                    {' · '}
                                                    {formatDate(transaction.created_at)}
                                                </p>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {formatCurrency(
                                                        transaction.purchase_amount,
                                                    )}
                                                </p>

                                                <span className="mt-1 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                                                    +{transaction.points_earned} pts
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-6 py-14 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                            <svg
                                                className="h-6 w-6"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 2h12"
                                                />
                                                <circle cx="10" cy="19" r="1" />
                                                <circle cx="17" cy="19" r="1" />
                                            </svg>
                                        </div>

                                        <p className="mt-4 text-sm font-semibold text-gray-700">
                                            No transactions yet.
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Transaction activity will appear here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Redemptions */}
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                        Recent Redemptions
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Latest completed reward redemptions.
                                    </p>
                                </div>

                                <div className="hidden shrink-0 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-700 sm:block">
                                    {recentRedemptions.length} latest
                                </div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {recentRedemptions.length > 0 ? (
                                    recentRedemptions.map((redemption) => (
                                        <div
                                            key={redemption.id}
                                            className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-50 text-yellow-600">
                                                <svg
                                                    className="h-5 w-5"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7M2 7h20v5H2zM12 7v14M12 7H8.5a2.5 2.5 0 115-1c0 1.5-1.5 1-1.5 1zM12 7h3.5a2.5 2.5 0 10-5-1c0 1.5 1 1 1.5 1z"
                                                    />
                                                </svg>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-gray-900">
                                                    {redemption.customer.first_name}{' '}
                                                    {redemption.customer.last_name}
                                                </p>

                                                <p className="mt-0.5 truncate text-xs text-gray-500">
                                                    {redemption.reward.reward_name}
                                                    {' · '}
                                                    {formatDate(redemption.redeemed_at)}
                                                </p>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <span className="inline-flex rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                                                    −{redemption.points_used} pts
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-6 py-14 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                            <svg
                                                className="h-6 w-6"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7M2 7h20v5H2zM12 7v14M12 7H8.5a2.5 2.5 0 115-1c0 1.5-1.5 1-1.5 1z"
                                                />
                                            </svg>
                                        </div>

                                        <p className="mt-4 text-sm font-semibold text-gray-700">
                                            No redemptions yet.
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Reward activity will appear here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}