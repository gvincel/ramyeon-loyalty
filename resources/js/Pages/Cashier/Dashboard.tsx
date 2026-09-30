import CashierLayout from '@/Layouts/CashierLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import { Head, Link } from '@inertiajs/react';

interface CustomerSummary {
    first_name: string;
    last_name: string;
    customer_code: string;
}

interface RecentTransaction {
    id: number;
    receipt_number: string | null;
    purchase_amount: number;
    amount_paid: number;
    points_earned: number;
    created_at: string | null;
    customer: CustomerSummary | null;
}

interface Stats {
    todayTransactions: number;
    todaySales: number;
    todayPointsEarned: number;
    todayRewardsRedeemed: number;
}

interface Props {
    stats: Stats;
    recentTransactions: RecentTransaction[];
}

const formatCurrency = (value: string | number) =>
    `₱${Number(value).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatNumber = (value: string | number) =>
    Number(value).toLocaleString('en-PH');

const formatDate = (value: string | null) => {
    if (!value) return '—';

    return new Date(value).toLocaleString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

export default function Dashboard({ stats, recentTransactions }: Props) {
    return (
        <CashierLayout>
            <Head title="Cashier Dashboard" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Dashboard Header */}
                    <AdminPageHeader
                        eyebrow="Overview"
                        title="Cashier Dashboard"
                        description="Monitor today's activity and access the cashier tools."
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
                        {/* Today's Transactions */}
                        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="absolute left-0 top-0 h-full w-1 bg-red-600" />

                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Today&apos;s Transactions
                                    </p>

                                    <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                                        {formatNumber(stats.todayTransactions)}
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
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="mt-5 border-t border-gray-100 pt-4">
                                <span className="text-xs text-gray-500">
                                    Purchases processed by you today
                                </span>
                            </div>
                        </div>

                        {/* Today's Sales */}
                        <div className="relative overflow-hidden rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
                            <div className="absolute left-0 top-0 h-full w-1 bg-red-600" />

                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Today&apos;s Sales
                                    </p>

                                    <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                                        {formatCurrency(stats.todaySales)}
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
                                        <rect
                                            x="2"
                                            y="6"
                                            width="20"
                                            height="12"
                                            rx="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="mt-5 border-t border-gray-100 pt-4">
                                <span className="text-xs text-gray-500">
                                    Total amount paid today
                                </span>
                            </div>
                        </div>

                        {/* Points Earned Today */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Points Earned Today
                                    </p>

                                    <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                                        {formatNumber(stats.todayPointsEarned)}
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
                                            d="M12 3l2.6 5.5 6 .9-4.3 4.2 1 6-5.3-2.8L6.7 19.6l1-6L3.4 9.4l6-.9L12 3z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <div className="mt-5 border-t border-gray-100 pt-4">
                                <span className="text-xs text-gray-500">
                                    Issued from today&apos;s purchases
                                </span>
                            </div>
                        </div>

                        {/* Rewards Redeemed */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Rewards Redeemed
                                    </p>

                                    <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                                        {formatNumber(
                                            stats.todayRewardsRedeemed,
                                        )}
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

                            <div className="mt-5 border-t border-gray-100 pt-4">
                                <span className="text-xs text-gray-500">
                                    Completed redemptions today
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <Link
                            href={route('cashier.qr-scanner')}
                            className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-[border-color,box-shadow] hover:border-red-100 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        >
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
                                        d="M4 4h4M4 4v4M20 4h-4M20 4v4M4 20h4M4 20v-4M20 20h-4M20 20v-4M8 12h8"
                                    />
                                </svg>
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900">
                                    Scan Customer QR
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    Scan a QR code or enter a customer code to
                                    start a transaction.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href={route('cashier.transactions.index')}
                            className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-[border-color,box-shadow] hover:border-red-100 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        >
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
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h6m-6 4h4"
                                    />
                                </svg>
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900">
                                    View Transactions
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    Browse and search your recent transaction
                                    history.
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Recent Transactions */}
                    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                    Recent Transactions
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Latest purchases processed by you.
                                </p>
                            </div>

                            <div className="hidden shrink-0 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 sm:block">
                                {recentTransactions.length} latest
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((transaction) => {
                                    const initials = transaction.customer
                                        ? `${transaction.customer.first_name.charAt(0)}${transaction.customer.last_name.charAt(0)}`.toUpperCase()
                                        : '?';

                                    return (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                                                {initials}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-gray-900">
                                                    {transaction.customer
                                                        ? `${transaction.customer.first_name} ${transaction.customer.last_name}`
                                                        : 'Walk-in customer'}
                                                </p>

                                                <p className="mt-0.5 truncate text-xs text-gray-500">
                                                    {transaction.customer
                                                        ?.customer_code ?? '—'}
                                                    {' · '}
                                                    {formatDate(
                                                        transaction.created_at,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {formatCurrency(
                                                        transaction.purchase_amount,
                                                    )}
                                                </p>

                                                <span className="mt-1 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                                                    +
                                                    {
                                                        transaction.points_earned
                                                    }{' '}
                                                    pts
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
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
                                        Transactions you process will appear
                                        here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}