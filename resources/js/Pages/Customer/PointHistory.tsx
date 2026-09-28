import { Head, Link } from '@inertiajs/react';

import CustomerLayout from '@/Layouts/CustomerLayout';

import CustomerPageHeader from '@/Components/CustomerPageHeader';

type PointTransaction = {
    id: number;
    type: 'earned' | 'redeemed' | 'refunded' | 'adjusted';
    points: number;
    balance_after: number;
    description: string;
    created_at: string;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PointHistoryProps = {
    pointTransactions: {
        data: PointTransaction[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        links: PaginationLink[];
    };
};

export default function PointHistory({
    pointTransactions,
}: PointHistoryProps) {
    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const formatPoints = (points: number) => {
        return Math.abs(points).toLocaleString('en-PH');
    };

    const getTypeLabel = (type: PointTransaction['type']) => {
        switch (type) {
            case 'earned':
                return 'Points Earned';
            case 'redeemed':
                return 'Reward Redeemed';
            case 'refunded':
                return 'Points Refunded';
            case 'adjusted':
                return 'Points Adjusted';
            default:
                return 'Point Activity';
        }
    };

    const getTypeIcon = (type: PointTransaction['type']) => {
        switch (type) {
            case 'earned':
                return 'add_circle';
            case 'redeemed':
                return 'redeem';
            case 'refunded':
                return 'undo';
            case 'adjusted':
                return 'tune';
            default:
                return 'stars';
        }
    };

    const getPointsClass = (points: number) => {
        if (points > 0) {
            return 'text-emerald-700';
        }

        if (points < 0) {
            return 'text-red-700';
        }

        return 'text-slate-500';
    };

    const formatPointsChange = (points: number) => {
        if (points > 0) {
            return `+${formatPoints(points)}`;
        }

        if (points < 0) {
            return `-${formatPoints(points)}`;
        }

        return '0';
    };

    return (
        <CustomerLayout>
            <Head title="Point History" />

            <div className="min-h-screen bg-slate-50">
                <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <CustomerPageHeader
                        eyebrow="Ramyeon Corner Loyalty"
                        title="Point History"
                        description="Review how your loyalty points were earned, redeemed, refunded, or adjusted."
                    />

                    {pointTransactions.data.length > 0 ? (
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            Your Point Activity
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            {pointTransactions.total.toLocaleString(
                                                'en-PH',
                                            )}{' '}
                                            point{' '}
                                            {pointTransactions.total !== 1
                                                ? 'entries'
                                                : 'entry'}
                                        </p>
                                    </div>

                                    {pointTransactions.from !== null &&
                                        pointTransactions.to !== null && (
                                            <p className="text-xs text-slate-400">
                                                Showing {pointTransactions.from}–
                                                {pointTransactions.to}
                                            </p>
                                        )}
                                </div>
                            </div>

                            {/* Mobile */}
                            <div className="divide-y divide-slate-100 md:hidden">
                                {pointTransactions.data.map(
                                    (pointTransaction) => (
                                        <article
                                            key={pointTransaction.id}
                                            className="px-5 py-5"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex min-w-0 items-start gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                                                        <span
                                                            className="material-symbols-outlined text-[21px] text-slate-600"
                                                            aria-hidden="true"
                                                        >
                                                            {getTypeIcon(
                                                                pointTransaction.type,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {getTypeLabel(
                                                                pointTransaction.type,
                                                            )}
                                                        </p>

                                                        <p className="mt-1 break-words text-sm leading-5 text-slate-500">
                                                            {
                                                                pointTransaction.description
                                                            }
                                                        </p>

                                                        <p className="mt-2 text-xs text-slate-400">
                                                            {formatDateTime(
                                                                pointTransaction.created_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <p
                                                    className={`shrink-0 text-sm font-semibold ${getPointsClass(
                                                        pointTransaction.points,
                                                    )}`}
                                                >
                                                    {formatPointsChange(
                                                        pointTransaction.points,
                                                    )}{' '}
                                                    pts
                                                </p>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3">
                                                <span className="text-xs font-medium text-slate-500">
                                                    Balance after
                                                </span>

                                                <span className="text-sm font-semibold text-slate-900">
                                                    {pointTransaction.balance_after.toLocaleString(
                                                        'en-PH',
                                                    )}{' '}
                                                    pts
                                                </span>
                                            </div>
                                        </article>
                                    ),
                                )}
                            </div>

                            {/* Desktop */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[760px] text-left">
                                    <thead className="bg-slate-50/80">
                                        <tr>
                                            <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Date
                                            </th>

                                            <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Activity
                                            </th>

                                            <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Points
                                            </th>

                                            <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Balance After
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {pointTransactions.data.map(
                                            (pointTransaction) => (
                                                <tr
                                                    key={pointTransaction.id}
                                                    className="transition hover:bg-slate-50/70"
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                                        {formatDateTime(
                                                            pointTransaction.created_at,
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                                                <span
                                                                    className="material-symbols-outlined text-[19px] text-slate-600"
                                                                    aria-hidden="true"
                                                                >
                                                                    {getTypeIcon(
                                                                        pointTransaction.type,
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-slate-900">
                                                                    {getTypeLabel(
                                                                        pointTransaction.type,
                                                                    )}
                                                                </p>

                                                                <p className="mt-0.5 max-w-md truncate text-xs text-slate-500">
                                                                    {
                                                                        pointTransaction.description
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td
                                                        className={`whitespace-nowrap px-6 py-4 text-right text-sm font-semibold ${getPointsClass(
                                                            pointTransaction.points,
                                                        )}`}
                                                    >
                                                        {formatPointsChange(
                                                            pointTransaction.points,
                                                        )}{' '}
                                                        pts
                                                    </td>

                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-900">
                                                        {pointTransaction.balance_after.toLocaleString(
                                                            'en-PH',
                                                        )}{' '}
                                                        pts
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pointTransactions.last_page > 1 && (
                                <nav
                                    className="flex flex-wrap items-center justify-center gap-1 border-t border-slate-100 px-5 py-4 sm:justify-end sm:px-6"
                                    aria-label="Point history pagination"
                                >
                                    {pointTransactions.links.map(
                                        (link, index) => (
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
                                        ),
                                    )}
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
                                    stars
                                </span>
                            </div>

                            <h2 className="mt-4 text-base font-semibold text-slate-900">
                                No point activity yet
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Your point history will appear here after you
                                earn or use loyalty points.
                            </p>
                        </section>
                    )}
                </main>
            </div>
        </CustomerLayout>
    );
}