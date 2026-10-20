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

interface TopCustomer {
    id: number;
    first_name: string;
    last_name: string;
    customer_code: string;
    points_balance: number;
}

interface Props {
    stats: Stats;
    recentTransactions: RecentTransaction[];
    topCustomers?: TopCustomer[];
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

export default function Dashboard({
    stats,
    recentTransactions,
    topCustomers = [],
}: Props) {
    return (
        <CashierLayout>
            <Head title="Cashier Dashboard" />

            <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Dashboard Header */}
                    <AdminPageHeader
                        eyebrow="Overview"
                        title="Cashier Dashboard"
                        description="Monitor today's activity and access the cashier tools."
                        action={
                            <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-[#64748B]">
                                    Today
                                </p>
                                <p className="mt-1 text-sm font-semibold text-[#111827]">
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
                        <div className="rounded-[20px] border border-[#E5E7EB] border-t-2 border-t-[#DC2626] bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-[#64748B]">
                                        Today&apos;s Transactions
                                    </p>

                                    <p className="mt-3 text-3xl font-bold tracking-tight text-[#111827]">
                                        {formatNumber(stats.todayTransactions)}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-[#FEF2F2] p-3 text-[#DC2626]">
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

                            <div className="mt-5 border-t border-[#E5E7EB] pt-4">
                                <span className="text-xs text-[#64748B]">
                                    Purchases processed by you today
                                </span>
                            </div>
                        </div>

                        {/* Today's Sales */}
                        <div className="rounded-[20px] border border-[#E5E7EB] border-t-2 border-t-[#DC2626] bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-[#64748B]">
                                        Today&apos;s Sales
                                    </p>

                                    <p className="mt-3 text-3xl font-bold tracking-tight text-[#111827]">
                                        {formatCurrency(stats.todaySales)}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-[#FEF2F2] p-3 text-[#DC2626]">
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

                            <div className="mt-5 border-t border-[#E5E7EB] pt-4">
                                <span className="text-xs text-[#64748B]">
                                    Total amount paid today
                                </span>
                            </div>
                        </div>

                        {/* Points Earned Today */}
                        <div className="rounded-[20px] border border-[#E5E7EB] border-t-2 border-t-[#DC2626] bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-[#64748B]">
                                        Points Earned Today
                                    </p>

                                    <p className="mt-3 text-3xl font-bold tracking-tight text-[#111827]">
                                        {formatNumber(stats.todayPointsEarned)}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-[#FEF2F2] p-3 text-[#DC2626]">
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

                            <div className="mt-5 border-t border-[#E5E7EB] pt-4">
                                <span className="text-xs text-[#64748B]">
                                    Issued from today&apos;s purchases
                                </span>
                            </div>
                        </div>

                        {/* Rewards Redeemed */}
                        <div className="rounded-[20px] border border-[#E5E7EB] border-t-2 border-t-[#DC2626] bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-[#64748B]">
                                        Rewards Redeemed
                                    </p>

                                    <p className="mt-3 text-3xl font-bold tracking-tight text-[#111827]">
                                        {formatNumber(
                                            stats.todayRewardsRedeemed,
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-[#FEF2F2] p-3 text-[#DC2626]">
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

                            <div className="mt-5 border-t border-[#E5E7EB] pt-4">
                                <span className="text-xs text-[#64748B]">
                                    Completed redemptions today
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <Link
                            href={route('cashier.qr-scanner')}
                            className="group flex items-center gap-4 rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm transition-[border-color,box-shadow] hover:border-[#DC2626] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                        >
                            <div className="rounded-xl bg-[#FEF2F2] p-3 text-[#DC2626]">
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
                                <p className="text-sm font-semibold text-[#111827]">
                                    Scan Customer QR
                                </p>

                                <p className="mt-1 text-xs text-[#64748B]">
                                    Scan a QR code or enter a customer code to
                                    start a transaction.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href={route('cashier.transactions.index')}
                            className="group flex items-center gap-4 rounded-[20px] border border-[#E5E7EB] bg-white p-6 shadow-sm transition-[border-color,box-shadow] hover:border-[#DC2626] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                        >
                            <div className="rounded-xl bg-[#FEF2F2] p-3 text-[#DC2626]">
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
                                <p className="text-sm font-semibold text-[#111827]">
                                    View Transactions
                                </p>

                                <p className="mt-1 text-xs text-[#64748B]">
                                    Browse and search your recent transaction
                                    history.
                                </p>
                            </div>
                        </Link>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    {/* Recent Transactions */}
                    <div className="overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-[#FEF2F2] shadow-sm lg:col-span-2">
                        <div className="flex items-start justify-between gap-4 bg-[#B91C1C] px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-white">
                                    Recent Transactions
                                </h2>

                                <p className="mt-1 text-sm text-[#FECACA]">
                                    Latest purchases processed by you.
                                </p>
                            </div>

                            <div className="hidden shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#B91C1C] sm:block">
                                {recentTransactions.length} latest
                            </div>
                        </div>

                        <div className="divide-y divide-[#FEE2E2]">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((transaction) => {
                                    const initials = transaction.customer
                                        ? `${transaction.customer.first_name.charAt(0)}${transaction.customer.last_name.charAt(0)}`.toUpperCase()
                                        : '?';

                                    return (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[#DC2626]">
                                                {initials}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-[#111827]">
                                                    {transaction.customer
                                                        ? `${transaction.customer.first_name} ${transaction.customer.last_name}`
                                                        : 'Walk-in customer'}
                                                </p>

                                                <p className="mt-0.5 truncate text-xs text-[#64748B]">
                                                    {transaction.customer
                                                        ?.customer_code ?? '—'}
                                                    {' · '}
                                                    {formatDate(
                                                        transaction.created_at,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="text-sm font-bold text-[#111827]">
                                                    {formatCurrency(
                                                        transaction.purchase_amount,
                                                    )}
                                                </p>

                                                <span className="mt-1 inline-flex rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-semibold text-[#92400E]">
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
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#64748B]">
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

                                    <p className="mt-4 text-sm font-semibold text-[#111827]">
                                        No transactions yet.
                                    </p>

                                    <p className="mt-1 text-xs text-[#64748B]">
                                        Transactions you process will appear
                                        here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top 3 Loyal Customers */}
                    <div className="overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-[#FEF2F2] shadow-sm">
                        <div className="bg-[#B91C1C] px-6 py-5">
                            <h2 className="text-lg font-bold tracking-tight text-white">
                                Top 3 Loyal Customers
                            </h2>

                            <p className="mt-1 text-sm text-[#FECACA]">
                                Customers with the most loyalty points.
                            </p>
                        </div>

                        <div className="divide-y divide-[#FEE2E2]">
                            {topCustomers.length > 0 ? (
                                topCustomers.slice(0, 3).map((customer, index) => (
                                    <div
                                        key={customer.id}
                                        className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white"
                                    >
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                                index === 0
                                                    ? 'bg-[#FEF3C7] text-[#92400E]'
                                                    : 'bg-white text-[#111827] ring-1 ring-[#E5E7EB]'
                                            }`}
                                            aria-label={`Rank ${index + 1}`}
                                        >
                                            {index + 1}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-[#111827]">
                                                {customer.first_name}{' '}
                                                {customer.last_name}
                                            </p>

                                            <p className="mt-0.5 truncate text-xs text-[#64748B]">
                                                {customer.customer_code}
                                            </p>
                                        </div>

                                        <span className="shrink-0 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-semibold text-[#92400E]">
                                            {formatNumber(customer.points_balance)}{' '}
                                            pts
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-6 py-14 text-center">
                                    <p className="text-sm font-semibold text-[#111827]">
                                        No loyal customers yet.
                                    </p>

                                    <p className="mt-1 text-xs text-[#64748B]">
                                        Top customers will appear here once
                                        points are earned.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}