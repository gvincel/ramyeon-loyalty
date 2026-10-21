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

const decodePaginationLabel = (label: string) =>
    label
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

export default function PointHistory({ pointTransactions }: PointHistoryProps) {
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
            case 'earned': return 'Points Earned';
            case 'redeemed': return 'Reward Redeemed';
            case 'refunded': return 'Points Refunded';
            case 'adjusted': return 'Points Adjusted';
            default: return 'Point Activity';
        }
    };

    const getTypeIcon = (type: PointTransaction['type']) => {
        switch (type) {
            case 'earned': return 'add_circle';
            case 'redeemed': return 'redeem';
            case 'refunded': return 'undo';
            case 'adjusted': return 'tune';
            default: return 'stars';
        }
    };

    const getPointsBadgeClass = (points: number) => {
        if (points > 0) return 'badge-success';
        if (points < 0) return 'badge-danger';
        return 'badge-neutral';
    };

    const formatPointsChange = (points: number) => {
        if (points > 0) return `+${formatPoints(points)}`;
        if (points < 0) return `-${formatPoints(points)}`;
        return '0';
    };

    return (
        <CustomerLayout>
            <Head title="Point History" />

            <div className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <CustomerPageHeader
                    eyebrow="Ramyeon Corner Loyalty"
                    title="Point History"
                    description="Review how your loyalty points were earned, redeemed, refunded, or adjusted."
                />

                {pointTransactions.data.length > 0 ? (
                    <section className="panel">
                        <div className="panel-header flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="panel-title">Your Point Activity</h2>
                                <p className="panel-desc">
                                    {pointTransactions.total.toLocaleString('en-PH')} point{' '}
                                    {pointTransactions.total !== 1 ? 'entries' : 'entry'}
                                </p>
                            </div>

                            {pointTransactions.from !== null && pointTransactions.to !== null && (
                                <p className="text-caption text-ink-subtle">
                                    Showing {pointTransactions.from}–{pointTransactions.to}
                                </p>
                            )}
                        </div>

                        {/* Mobile card view */}
                        <div className="divide-y divide-line md:hidden">
                            {pointTransactions.data.map((pt) => (
                                <article key={pt.id} className="px-5 py-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-muted text-ink-muted">
                                                <span className="material-symbols-outlined text-[21px]" aria-hidden="true">
                                                    {getTypeIcon(pt.type)}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-small font-semibold text-ink">
                                                    {getTypeLabel(pt.type)}
                                                </p>
                                                <p className="mt-1 break-words text-caption leading-5 text-ink-muted">
                                                    {pt.description}
                                                </p>
                                                <p className="mt-2 text-caption text-ink-subtle">
                                                    {formatDateTime(pt.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`shrink-0 ${getPointsBadgeClass(pt.points)}`}>
                                            {formatPointsChange(pt.points)} pts
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between rounded-control bg-surface-muted px-3.5 py-2.5">
                                        <span className="text-caption font-medium text-ink-muted">
                                            Balance after
                                        </span>
                                        <span className="text-small font-semibold tabular-nums text-ink">
                                            {pt.balance_after.toLocaleString('en-PH')} pts
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Desktop table view */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full min-w-[760px] text-left text-small">
                                <thead className="border-b border-line bg-surface-muted">
                                    <tr>
                                        <th scope="col" className="table-th">Date</th>
                                        <th scope="col" className="table-th">Activity</th>
                                        <th scope="col" className="table-th text-right">Points</th>
                                        <th scope="col" className="table-th text-right">Balance After</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {pointTransactions.data.map((pt) => (
                                        <tr key={pt.id} className="transition-colors duration-base ease-standard hover:bg-canvas/60">
                                            <td className="whitespace-nowrap px-6 py-4 text-ink-muted">
                                                {formatDateTime(pt.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-surface-muted text-ink-muted">
                                                        <span className="material-symbols-outlined text-[19px]" aria-hidden="true">
                                                            {getTypeIcon(pt.type)}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-ink">
                                                            {getTypeLabel(pt.type)}
                                                        </p>
                                                        <p className="mt-0.5 max-w-md truncate text-caption text-ink-muted">
                                                            {pt.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <span className={getPointsBadgeClass(pt.points)}>
                                                    {formatPointsChange(pt.points)} pts
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right font-medium tabular-nums text-ink">
                                                {pt.balance_after.toLocaleString('en-PH')} pts
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pointTransactions.last_page > 1 && (
                            <nav className="flex flex-wrap items-center justify-center gap-1 border-t border-line px-5 py-4 sm:justify-end sm:px-6" aria-label="Point history pagination">
                                {pointTransactions.links.map((link, index) => {
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
                                        return <span key={`${link.label}-${index}`} className={className} aria-disabled="true">{label}</span>;
                                    }

                                    return (
                                        <Link key={`${link.label}-${index}`} href={link.url} preserveScroll className={className} aria-current={link.active ? 'page' : undefined}>
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
                            <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                                stars
                            </span>
                        </div>
                        <h2 className="mt-4 text-heading font-semibold text-ink">
                            No point activity yet
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-small leading-6 text-ink-muted">
                            Your point history will appear here after you earn or use loyalty points.
                        </p>
                    </section>
                )}
            </div>
        </CustomerLayout>
    );
}