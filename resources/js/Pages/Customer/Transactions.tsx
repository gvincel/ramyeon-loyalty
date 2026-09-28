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

export default function Transactions({
    transactions,
}: TransactionsProps) {
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

            <div className="min-h-screen bg-slate-50">
                <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <CustomerPageHeader
                        eyebrow="Ramyeon Corner Loyalty"
                        title="Transaction History"
                        description="View your purchases and the loyalty points you earned from each transaction."
                    />

                    {transactions.data.length > 0 ? (
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Your Transactions
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            {transactions.total.toLocaleString(
                                                'en-PH',
                                            )}{' '}
                                            transaction
                                            {transactions.total !== 1
                                                ? 's'
                                                : ''}
                                        </p>
                                    </div>

                                    {transactions.from !== null &&
                                        transactions.to !== null && (
                                            <p className="text-xs text-slate-400">
                                                Showing {transactions.from}–
                                                {transactions.to}
                                            </p>
                                        )}
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100 md:hidden">
                                {transactions.data.map((transaction) => (
                                    <article
                                        key={transaction.id}
                                        className="px-5 py-5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {transaction.receipt_number ||
                                                        'No receipt number'}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {formatDateTime(
                                                        transaction.created_at,
                                                    )}
                                                </p>
                                            </div>

                                            <p className="shrink-0 text-sm font-semibold text-slate-900">
                                                ₱
                                                {formatAmount(
                                                    transaction.purchase_amount,
                                                )}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3">
                                            <span className="text-xs font-medium text-slate-500">
                                                Points earned
                                            </span>

                                            <span className="text-sm font-semibold text-red-700">
                                                +
                                                {transaction.points_earned.toLocaleString(
                                                    'en-PH',
                                                )}{' '}
                                                pts
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[640px] text-left">
                                    <thead className="bg-slate-50/80">
                                        <tr>
                                            <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Date
                                            </th>

                                            <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Receipt
                                            </th>

                                            <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Purchase
                                            </th>

                                            <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Points Earned
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {transactions.data.map((transaction) => (
                                            <tr
                                                key={transaction.id}
                                                className="transition hover:bg-slate-50/70"
                                            >
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                                    {formatDateTime(
                                                        transaction.created_at,
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                    {transaction.receipt_number ||
                                                        'No receipt number'}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-slate-900">
                                                    ₱
                                                    {formatAmount(
                                                        transaction.purchase_amount,
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-red-700">
                                                    +
                                                    {transaction.points_earned.toLocaleString(
                                                        'en-PH',
                                                    )}{' '}
                                                    pts
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {transactions.last_page > 1 && (
                                <nav
                                    className="flex flex-wrap items-center justify-center gap-1 border-t border-slate-100 px-5 py-4 sm:justify-end sm:px-6"
                                    aria-label="Transaction history pagination"
                                >
                                    {transactions.links.map((link, index) => (
                                        <Link
                                            key={`${link.label}-${index}`}
                                            href={link.url || '#'}
                                            preserveScroll
                                            className={[
                                                'flex min-h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition',
                                                link.active
                                                    ? 'bg-red-700 text-white'
                                                    : link.url
                                                      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                                      : 'cursor-not-allowed text-slate-300',
                                            ].join(' ')}
                                            aria-current={
                                                link.active
                                                    ? 'page'
                                                    : undefined
                                            }
                                            aria-disabled={
                                                !link.url
                                                    ? 'true'
                                                    : undefined
                                            }
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        </Link>
                                    ))}
                                </nav>
                            )}
                        </section>
                    ) : (
                        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                                <span
                                    className="material-symbols-outlined text-[24px] text-slate-500"
                                    aria-hidden="true"
                                >
                                    receipt_long
                                </span>
                            </div>

                            <h2 className="mt-4 text-base font-semibold text-slate-900">
                                No transactions yet
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Your purchase history will appear here after
                                you make a purchase and earn loyalty points.
                            </p>
                        </section>
                    )}
                </main>
            </div>
        </CustomerLayout>
    );
}