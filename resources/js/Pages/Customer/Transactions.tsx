import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import CustomerPageHeader from '@/Components/CustomerPageHeader';

type Transaction = {
    id: number;
    receipt_number: string | null;
    purchase_amount: string | number;
    points_earned: number;
    created_at: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type TransactionsProps = {
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        links: PaginationLink[];
    };
};

const decodePaginationLabel = (label: string) =>
    label
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

export default function Transactions({ transactions }: TransactionsProps) {
    const formatAmount = (amount: string | number) => {
        return Number(amount).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <CustomerLayout>
            <Head title="Transaction History" />

            <div className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <CustomerPageHeader
                    eyebrow="Ramyeon Corner Loyalty"
                    title="Transaction History"
                    description="View your purchases and the loyalty points you earned from each transaction."
                />

                {transactions.data.length > 0 ? (
                    <section className="panel">
                        <div className="panel-header flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="panel-title">Your Transactions</h2>
                                <p className="panel-desc">
                                    {transactions.total.toLocaleString('en-PH')}{' '}
                                    transaction
                                    {transactions.total !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {transactions.from !== null &&
                                transactions.to !== null && (
                                    <p className="text-caption text-ink-subtle">
                                        Showing {transactions.from}–{transactions.to}
                                    </p>
                                )}
                        </div>

                        {/* Mobile card view */}
                        <div className="divide-y divide-line md:hidden">
                            {transactions.data.map((transaction) => (
                                <article
                                    key={transaction.id}
                                    className="px-5 py-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-ink">
                                                {transaction.receipt_number ||
                                                    'No receipt number'}
                                            </p>
                                            <p className="mt-0.5 text-caption text-ink-muted">
                                                {formatDateTime(
                                                    transaction.created_at,
                                                )}
                                            </p>
                                        </div>

                                        <p className="shrink-0 font-semibold tabular-nums text-ink">
                                            ₱
                                            {formatAmount(
                                                transaction.purchase_amount,
                                            )}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between rounded-control bg-surface-muted px-3.5 py-2.5">
                                        <span className="text-caption font-medium text-ink-muted">
                                            Points earned
                                        </span>
                                        <span className="badge-brand">
                                            +{transaction.points_earned.toLocaleString('en-PH')} pts
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Desktop table view */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full min-w-[640px] text-left text-small">
                                <thead className="border-b border-line bg-surface-muted">
                                    <tr>
                                        <th scope="col" className="table-th">
                                            Date
                                        </th>
                                        <th scope="col" className="table-th">
                                            Receipt
                                        </th>
                                        <th
                                            scope="col"
                                            className="table-th text-right"
                                        >
                                            Purchase
                                        </th>
                                        <th
                                            scope="col"
                                            className="table-th text-right"
                                        >
                                            Points Earned
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-line">
                                    {transactions.data.map((transaction) => (
                                        <tr
                                            key={transaction.id}
                                            className="transition-colors duration-base ease-standard hover:bg-canvas/60"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 text-ink-muted">
                                                {formatDateTime(
                                                    transaction.created_at,
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-ink">
                                                {transaction.receipt_number ||
                                                    'No receipt number'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right font-semibold tabular-nums text-ink">
                                                ₱
                                                {formatAmount(
                                                    transaction.purchase_amount,
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <span className="badge-brand">
                                                    +{transaction.points_earned.toLocaleString('en-PH')} pts
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {transactions.last_page > 1 && (
                            <nav
                                className="flex flex-wrap items-center justify-center gap-1 border-t border-line px-5 py-4 sm:justify-end sm:px-6"
                                aria-label="Transaction history pagination"
                            >
                                {transactions.links.map((link, index) => {
                                    const label = decodePaginationLabel(link.label);

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
                                            aria-current={
                                                link.active ? 'page' : undefined
                                            }
                                        >
                                            {label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        )}
                    </section>
                ) : (
                    <section className="panel px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-control bg-canvas text-ink-subtle">
                            <span
                                className="material-symbols-outlined text-[28px]"
                                aria-hidden="true"
                            >
                                receipt_long
                            </span>
                        </div>

                        <h2 className="mt-4 text-heading font-semibold text-ink">
                            No transactions yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-small leading-6 text-ink-muted">
                            Your purchase history will appear here after you make a purchase and earn loyalty points.
                        </p>
                    </section>
                )}
            </div>
        </CustomerLayout>
    );
}