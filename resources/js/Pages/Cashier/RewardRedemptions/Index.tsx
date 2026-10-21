import AdminModal from '@/Components/AdminModal';
import AdminPageHeader from '@/Components/AdminPageHeader';
import FlashMessage from '@/Components/FlashMessage';
import CashierLayout from '@/Layouts/CashierLayout';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    customer_code: string;
    phone_number: string;
    email: string | null;
}

interface Reward {
    id: number;
    reward_name: string;
    reward_type: 'discount' | 'free_item';
    points_required: number;
    reward_value: string | null;
}

interface RewardRedemption {
    id: number;
    points_used: number;
    redeemed_at: string;
    status: 'completed' | 'cancelled';
    customer: Customer;
    reward: Reward;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedRedemptions {
    data: RewardRedemption[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface Filters {
    search: string | null;
    status: string | null;
    date_from: string | null;
    date_to: string | null;
}

interface Props {
    redemptions: PaginatedRedemptions;
    filters: Filters;
}

const formatDate = (value: string | null | undefined) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const formatNumber = (value: string | number) => {
    return Number(value).toLocaleString('en-PH');
};

const canCancelRedemption = (redeemedAt: string) => {
    const redeemedDate = new Date(redeemedAt);
    if (Number.isNaN(redeemedDate.getTime())) return false;
    const cancellationDeadline = redeemedDate.getTime() + 24 * 60 * 60 * 1000;
    return Date.now() < cancellationDeadline;
};

const decodePaginationLabel = (label: string) =>
    label
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

function StatusPill({ status }: { status: 'completed' | 'cancelled' }) {
    const isCompleted = status === 'completed';
    return (
        <span className={isCompleted ? 'badge-success' : 'badge-neutral'}>
            {isCompleted ? 'Completed' : 'Cancelled'}
        </span>
    );
}

export default function Index({ redemptions, filters }: Props) {
    const { flash } = usePage<PageProps>().props;

    const [showAdvanced, setShowAdvanced] = useState(
        Boolean(filters.status || filters.date_from || filters.date_to),
    );

    const [cancellingRedemption, setCancellingRedemption] =
        useState<RewardRedemption | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const hasActiveFilters = Boolean(
        filters.search || filters.status || filters.date_from || filters.date_to,
    );

    const buildUrl = (omit?: keyof Filters) => {
        const params: Record<string, string> = {};
        if (filters.search && omit !== 'search') params.search = filters.search;
        if (filters.status && omit !== 'status') params.status = filters.status;
        if (filters.date_from && omit !== 'date_from') params.date_from = filters.date_from;
        if (filters.date_to && omit !== 'date_to') params.date_to = filters.date_to;
        return route('cashier.reward-redemptions.index', params);
    };

    const activeChips: { key: keyof Filters; label: string }[] = [];
    if (filters.search) activeChips.push({ key: 'search', label: `Search: "${filters.search}"` });
    if (filters.status) activeChips.push({ key: 'status', label: filters.status === 'completed' ? 'Completed' : 'Cancelled' });
    if (filters.date_from) activeChips.push({ key: 'date_from', label: `From ${filters.date_from}` });
    if (filters.date_to) activeChips.push({ key: 'date_to', label: `To ${filters.date_to}` });

    const confirmCancel = () => {
        if (!cancellingRedemption) return;
        if (!canCancelRedemption(cancellingRedemption.redeemed_at)) {
            setCancellingRedemption(null);
            return;
        }

        setIsCancelling(true);
        router.patch(
            route('cashier.reward-redemptions.cancel', cancellingRedemption.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsCancelling(false);
                    setCancellingRedemption(null);
                },
            },
        );
    };

    return (
        <CashierLayout>
            <Head title="Reward Redemption History" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content">
                    <AdminPageHeader
                        eyebrow="Rewards"
                        title="Reward Redemption History"
                        description="View rewards redeemed by customers and cancel mistakes."
                    />

                    <FlashMessage success={flash.success} error={flash.error} />

                    <section className="mt-6 panel">
                        <div className="panel-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="panel-title">Redemption History</h2>
                                <p className="panel-desc">Recent reward redemptions processed by you.</p>
                            </div>
                            <div className="badge-brand inline-flex w-fit items-center gap-2 px-3 py-1.5">
                                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                                    local_offer
                                </span>
                                <span className="text-caption font-semibold">
                                    {redemptions.total.toLocaleString('en-PH')} record
                                    {redemptions.total !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        <form
                            key={JSON.stringify(filters)}
                            method="get"
                            action={route('cashier.reward-redemptions.index')}
                            className="border-b border-line bg-surface-muted px-5 py-4 sm:px-6"
                            aria-label="Filter reward redemptions"
                        >
                            {/* Row 1: Search + Filters toggle + Apply */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative flex-1">
                                    <label htmlFor="rr-search" className="sr-only">
                                        Search redemptions
                                    </label>
                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-subtle">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <circle cx="11" cy="11" r="7" />
                                            <path d="M21 21l-4.3-4.3" />
                                        </svg>
                                    </span>
                                    <input
                                        id="rr-search"
                                        type="search"
                                        name="search"
                                        maxLength={100}
                                        defaultValue={filters.search || ''}
                                        placeholder="Search by customer or reward…"
                                        className="field-input pl-9"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced((v) => !v)}
                                    className={`btn-secondary sm:shrink-0 ${showAdvanced ? 'bg-surface-muted' : ''}`}
                                    aria-expanded={showAdvanced}
                                    aria-controls="rr-advanced-filters"
                                >
                                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                                        tune
                                    </span>
                                    <span>Filters</span>
                                    {activeChips.length > 0 && (
                                        <span className="badge-brand ml-0.5 px-1.5 py-0 text-[10px]">
                                            {activeChips.length}
                                        </span>
                                    )}
                                </button>

                                <button type="submit" className="btn-primary sm:shrink-0">
                                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                                        search
                                    </span>
                                    Apply
                                </button>
                            </div>

                            {/* Row 2: Advanced filters */}
                            {showAdvanced && (
                                <div
                                    id="rr-advanced-filters"
                                    className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-3"
                                >
                                    <div>
                                        <label htmlFor="rr-status" className="field-label">
                                            Status
                                        </label>
                                        <select
                                            id="rr-status"
                                            name="status"
                                            defaultValue={filters.status || ''}
                                            className="field-input"
                                        >
                                            <option value="">All statuses</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="rr-date-from" className="field-label">
                                            From date
                                        </label>
                                        <input
                                            id="rr-date-from"
                                            type="date"
                                            name="date_from"
                                            defaultValue={filters.date_from || ''}
                                            className="field-input"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="rr-date-to" className="field-label">
                                            To date
                                        </label>
                                        <input
                                            id="rr-date-to"
                                            type="date"
                                            name="date_to"
                                            min={filters.date_from || undefined}
                                            defaultValue={filters.date_to || ''}
                                            className="field-input"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Row 3: Active filter chips */}
                            {hasActiveFilters && (
                                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                                    <span className="text-caption font-medium text-ink-muted">
                                        Active filters:
                                    </span>
                                    {activeChips.map((chip) => (
                                        <Link
                                            key={chip.key}
                                            href={buildUrl(chip.key)}
                                            className="group inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-caption font-medium text-brand-700 transition-colors hover:bg-brand-100 hover:border-brand-300"
                                            aria-label={`Remove filter: ${chip.label}`}
                                        >
                                            <span className="max-w-[200px] truncate">{chip.label}</span>
                                            <span className="material-symbols-outlined text-[14px] transition-transform group-hover:scale-110" aria-hidden="true">
                                                close
                                            </span>
                                        </Link>
                                    ))}
                                    <Link
                                        href={route('cashier.reward-redemptions.index')}
                                        className="ml-auto text-caption font-medium text-brand-700 hover:underline"
                                    >
                                        Clear all
                                    </Link>
                                </div>
                            )}
                        </form>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left text-small">
                                <thead className="border-b border-line bg-surface-muted">
                                    <tr>
                                        <th scope="col" className="table-th">Customer</th>
                                        <th scope="col" className="table-th">Reward</th>
                                        <th scope="col" className="table-th">Points Used</th>
                                        <th scope="col" className="table-th">Date</th>
                                        <th scope="col" className="table-th">Status</th>
                                        <th scope="col" className="table-th text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {redemptions.data.length > 0 ? (
                                        redemptions.data.map((redemption) => (
                                            <tr key={redemption.id} className="transition-colors duration-base ease-standard hover:bg-canvas/60">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-small font-bold text-brand-600">
                                                            {redemption.customer.first_name.charAt(0).toUpperCase()}
                                                            {redemption.customer.last_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-ink">
                                                                {redemption.customer.first_name} {redemption.customer.last_name}
                                                            </p>
                                                            <p className="mt-0.5 max-w-[220px] truncate text-caption text-ink-muted">
                                                                {redemption.customer.customer_code}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-ink">{redemption.reward.reward_name}</p>
                                                    <p className="mt-0.5 text-caption capitalize text-ink-muted">
                                                        {redemption.reward.reward_type.replace('_', ' ')}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="badge-accent font-semibold">
                                                        {formatNumber(redemption.points_used)} pt
                                                        {redemption.points_used !== 1 ? 's' : ''}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 tabular-nums text-ink-muted">
                                                    {formatDate(redemption.redeemed_at)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusPill status={redemption.status} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end">
                                                        {redemption.status === 'completed' ? (
                                                            canCancelRedemption(redemption.redeemed_at) ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setCancellingRedemption(redemption)}
                                                                    className="btn-ghost-danger btn-sm"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            ) : (
                                                                <span
                                                                    className="text-caption font-medium text-ink-subtle"
                                                                    title="Redemptions can only be cancelled within 24 hours."
                                                                >
                                                                    Expired
                                                                </span>
                                                            )
                                                        ) : (
                                                            <span className="text-small text-ink-subtle">—</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center">
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-subtle">
                                                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7M2 7h20v5H2zM12 7v14M12 7H8.5a2.5 2.5 0 115-1c0 1.5-1.5 1-1.5 1z" />
                                                    </svg>
                                                </div>
                                                <p className="mt-4 font-semibold text-ink">
                                                    {hasActiveFilters ? 'No redemptions match your filters' : 'No reward redemptions found'}
                                                </p>
                                                <p className="mt-1 text-small text-ink-muted">
                                                    {hasActiveFilters ? 'Try adjusting or clearing your filters.' : 'Redemption activity will appear here.'}
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {redemptions.last_page > 1 && (
                            <nav className="flex flex-wrap items-center justify-center gap-1 border-t border-line px-5 py-4 sm:justify-end sm:px-6" aria-label="Redemption history pagination">
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

                        {redemptions.total > 0 && (
                            <div className="border-t border-line px-5 py-3 sm:px-6">
                                <p className="text-caption text-ink-muted">
                                    Showing <span className="font-medium text-ink">{redemptions.from ?? 0}</span> to{' '}
                                    <span className="font-medium text-ink">{redemptions.to ?? 0}</span> of{' '}
                                    <span className="font-medium text-ink">{redemptions.total.toLocaleString('en-PH')}</span> redemptions
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Cancel confirmation modal */}
            {cancellingRedemption && (
                <AdminModal
                    title="Cancel Redemption?"
                    description="The redemption will be cancelled and the points will be returned to the customer."
                    onClose={() => { if (!isCancelling) setCancellingRedemption(null); }}
                    maxWidthClass="max-w-md"
                    footer={
                        <>
                            <button type="button" onClick={() => setCancellingRedemption(null)} disabled={isCancelling} className="btn-secondary">
                                Keep
                            </button>
                            <button type="button" onClick={confirmCancel} disabled={isCancelling} aria-busy={isCancelling} className="btn-danger-solid">
                                {isCancelling ? (
                                    <>
                                        <svg className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                                            <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                        </svg>
                                        Cancelling…
                                    </>
                                ) : (
                                    'Cancel Redemption'
                                )}
                            </button>
                        </>
                    }
                >
                    <div className="p-6">
                        <p className="text-small leading-6 text-ink-muted">
                            You are about to cancel the redemption of{' '}
                            <span className="font-semibold text-ink">{cancellingRedemption.reward.reward_name}</span> for{' '}
                            <span className="font-semibold text-ink">{cancellingRedemption.customer.first_name} {cancellingRedemption.customer.last_name}</span>.
                        </p>

                        <div className="mt-4 rounded-control border border-warning-600/20 bg-warning-50 p-4">
                            <div className="flex gap-3">
                                <div className="mt-0.5 shrink-0 text-warning-700" aria-hidden="true">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.8L2.9 17a2 2 0 001.75 3h14.7a2 2 0 001.75-3L13.7 3.8a2 2 0 00-3.4 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-small font-semibold text-warning-700">
                                        Points will be refunded
                                    </p>
                                    <p className="mt-1 text-small leading-5 text-warning-700/90">
                                        {formatNumber(cancellingRedemption.points_used)} point{cancellingRedemption.points_used !== 1 ? 's' : ''} will be returned to the customer's balance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </AdminModal>
            )}
        </CashierLayout>
    );
}