import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import CustomerPageHeader from '@/Components/CustomerPageHeader';

type Reward = {
    id: number;
    reward_name: string;
};

type Redemption = {
    id: number;
    points_used: number;
    redeemed_at: string;
    status: 'completed' | 'cancelled';
    reward: Reward | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type RedemptionHistoryProps = {
    redemptions: {
        data: Redemption[];
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

export default function RedemptionHistory({ redemptions }: RedemptionHistoryProps) {
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

    const getStatusLabel = (status: Redemption['status']) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return 'Redemption';
        }
    };

    const getStatusClass = (status: Redemption['status']) => {
        if (status === 'completed') return 'badge-success';
        return 'badge-danger';
    };

    return (
        <CustomerLayout>
            <Head title="Redemption History" />

            <div className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <CustomerPageHeader
                    eyebrow="Ramyeon Corner Loyalty"
                    title="Redemption History"
                    description="Review the rewards you have redeemed using your loyalty points."
                />

                {redemptions.data.length > 0 ? (
                    <section className="panel">
                        <div className="panel-header flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="panel-title">Your Redemption Activity</h2>
                                <p className="panel-desc">
                                    {redemptions.total.toLocaleString('en-PH')} redemption{' '}
                                    {redemptions.total !== 1 ? 'entries' : 'entry'}
                                </p>
                            </div>

                            {redemptions.from !== null && redemptions.to !== null && (
                                <p className="text-caption text-ink-subtle">
                                    Showing {redemptions.from}–{redemptions.to}
                                </p>
                            )}
                        </div>

                        {/* Mobile card view */}
                        <div className="divide-y divide-line md:hidden">
                            {redemptions.data.map((redemption) => (
                                <article key={redemption.id} className="px-5 py-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-700">
                                                <span className="material-symbols-outlined text-[21px]" aria-hidden="true">
                                                    redeem
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-small font-semibold text-ink">
                                                    {redemption.reward?.reward_name ?? 'Reward unavailable'}
                                                </p>
                                                <p className="mt-1 text-caption text-ink-muted">
                                                    {formatDateTime(redemption.redeemed_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`shrink-0 ${getStatusClass(redemption.status)}`}>
                                            {getStatusLabel(redemption.status)}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between rounded-control bg-surface-muted px-3.5 py-2.5">
                                        <span className="text-caption font-medium text-ink-muted">
                                            Points used
                                        </span>
                                        <span className="text-small font-semibold tabular-nums text-ink">
                                            {formatPoints(redemption.points_used)} pts
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
                                        <th scope="col" className="table-th">Reward</th>
                                        <th scope="col" className="table-th text-right">Points Used</th>
                                        <th scope="col" className="table-th text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {redemptions.data.map((redemption) => (
                                        <tr key={redemption.id} className="transition-colors duration-base ease-standard hover:bg-canvas/60">
                                            <td className="whitespace-nowrap px-6 py-4 text-ink-muted">
                                                {formatDateTime(redemption.redeemed_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-700">
                                                        <span className="material-symbols-outlined text-[19px]" aria-hidden="true">
                                                            redeem
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-ink">
                                                            {redemption.reward?.reward_name ?? 'Reward unavailable'}
                                                        </p>
                                                        <p className="mt-0.5 max-w-md truncate text-caption text-ink-muted">
                                                            Redeemed using loyalty points
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <span className="badge-danger">
                                                    -{formatPoints(redemption.points_used)} pts
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <span className={getStatusClass(redemption.status)}>
                                                    {getStatusLabel(redemption.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {redemptions.last_page > 1 && (
                            <nav
                                className="flex flex-wrap items-center justify-center gap-1 border-t border-line px-5 py-4 sm:justify-end sm:px-6"
                                aria-label="Redemption history pagination"
                            >
                                {redemptions.links.map((link, index) => {
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
                                            <span key={`${link.label}-${index}`} className={className} aria-disabled="true">
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
                ) : (
                    <section className="panel px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-control bg-canvas text-ink-subtle">
                            <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                                redeem
                            </span>
                        </div>
                        <h2 className="mt-4 text-heading font-semibold text-ink">
                            No redemption history yet
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-small leading-6 text-ink-muted">
                            Your redemption history will appear here after you redeem a reward using your loyalty points.
                        </p>
                    </section>
                )}
            </div>
        </CustomerLayout>
    );
}