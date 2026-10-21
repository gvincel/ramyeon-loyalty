import CashierLayout from '@/Layouts/CashierLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import StatCard from '@/Components/StatCard';
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

/* ───────── Icons for StatCards ───────── */

const Icons = {
    receipt: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
        </svg>
    ),
    currency: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="2" y="6" width="20" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    star: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.6 5.5 6 .9-4.3 4.2 1 6-5.3-2.8L6.7 19.6l1-6L3.4 9.4l6-.9L12 3z" />
        </svg>
    ),
    gift: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7M2 7h20v5H2zM12 7v14M12 7H8.5a2.5 2.5 0 115-1c0 1.5-1.5 1-1.5 1zM12 7h3.5a2.5 2.5 0 10-5-1c0 1.5 1 1 1.5 1z" />
        </svg>
    ),
};

export default function Dashboard({ stats, recentTransactions }: Props) {
    return (
        <CashierLayout>
            <Head title="Cashier Dashboard" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content">
                    {/* Header */}
                    <AdminPageHeader
                        eyebrow="Overview"
                        title="Cashier Dashboard"
                        description="Monitor today's activity and access the cashier tools."
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

                    {/* KPI Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label="Today's Transactions"
                            value={formatNumber(stats.todayTransactions)}
                            icon={Icons.receipt}
                            footer="Purchases processed by you today"
                        />
                        <StatCard
                            label="Today's Sales"
                            value={formatCurrency(stats.todaySales)}
                            icon={Icons.currency}
                            footer="Total amount paid today"
                        />
                        <StatCard
                            label="Points Earned Today"
                            value={formatNumber(stats.todayPointsEarned)}
                            icon={Icons.star}
                            tone="accent"
                            footer="Issued from today's purchases"
                        />
                        <StatCard
                            label="Rewards Redeemed"
                            value={formatNumber(stats.todayRewardsRedeemed)}
                            icon={Icons.gift}
                            tone="accent"
                            footer="Completed redemptions today"
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <Link
                            href={route('cashier.qr-scanner')}
                            className="group panel flex items-center gap-4 p-5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-brand-200 hover:shadow-raised"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-600 transition-transform duration-300 group-hover:scale-110">
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h4M4 4v4M20 4h-4M20 4v4M4 20h4M4 20v-4M20 20h-4M20 20v-4M8 12h8" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-small font-semibold text-ink group-hover:text-brand-700">
                                    Scan Customer QR
                                </h3>
                                <p className="mt-0.5 text-caption text-ink-muted">
                                    Scan a QR code or enter a customer code to start a transaction.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href={route('cashier.transactions.index')}
                            className="group panel flex items-center gap-4 p-5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-brand-200 hover:shadow-raised"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-600 transition-transform duration-300 group-hover:scale-110">
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h6m-6 4h4" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-small font-semibold text-ink group-hover:text-brand-700">
                                    View Transactions
                                </h3>
                                <p className="mt-0.5 text-caption text-ink-muted">
                                    Browse and search your recent transaction history.
                                </p>
                            </div>
                        </Link>
                    </div>

                    {/* Recent Transactions */}
                    <div className="mt-6 panel">
                        <div className="panel-header flex items-start justify-between gap-4">
                            <div>
                                <h2 className="panel-title">Recent Transactions</h2>
                                <p className="panel-desc">Latest purchases processed by you.</p>
                            </div>
                            <div className="badge-brand hidden sm:inline-flex">
                                {recentTransactions.length} latest
                            </div>
                        </div>

                        <div className="divide-y divide-line">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((transaction) => {
                                    const initials = transaction.customer
                                        ? `${transaction.customer.first_name.charAt(0)}${transaction.customer.last_name.charAt(0)}`.toUpperCase()
                                        : '?';

                                    return (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center gap-4 px-6 py-4 transition-colors duration-base ease-standard hover:bg-canvas/60"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-small font-bold text-brand-600">
                                                {initials}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-small font-semibold text-ink">
                                                    {transaction.customer
                                                        ? `${transaction.customer.first_name} ${transaction.customer.last_name}`
                                                        : 'Walk-in customer'}
                                                </p>
                                                <p className="mt-0.5 truncate text-caption text-ink-muted">
                                                    {transaction.customer?.customer_code ?? '—'} · {formatDate(transaction.created_at)}
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
                                    );
                                })
                            ) : (
                                <div className="px-6 py-14 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink-subtle">
                                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 2h12" />
                                            <circle cx="10" cy="19" r="1" />
                                            <circle cx="17" cy="19" r="1" />
                                        </svg>
                                    </div>
                                    <p className="mt-4 font-semibold text-ink">No transactions yet.</p>
                                    <p className="mt-1 text-small text-ink-muted">Transactions you process will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}