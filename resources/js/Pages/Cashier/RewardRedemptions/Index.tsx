import AdminModal from '@/Components/AdminModal';
import AdminPageHeader from '@/Components/AdminPageHeader';
import FlashMessage from '@/Components/FlashMessage';
import CashierLayout from '@/Layouts/CashierLayout';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

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

    const cancellationDeadline =
        redeemedDate.getTime() + 24 * 60 * 60 * 1000;

    return Date.now() < cancellationDeadline;
};

function StatusPill({ status }: { status: 'completed' | 'cancelled' }) {
    const isCompleted = status === 'completed';

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                isCompleted
                    ? 'bg-green-50 text-green-700 ring-green-100'
                    : 'bg-[#F8FAFC] text-[#64748B] ring-[#E5E7EB]'
            }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    isCompleted ? 'bg-green-500' : 'bg-[#64748B]'
                }`}
                aria-hidden="true"
            />
            {isCompleted ? 'Completed' : 'Cancelled'}
        </span>
    );
}

export default function Index({ redemptions, filters }: Props) {
    const { flash } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const [cancellingRedemption, setCancellingRedemption] =
        useState<RewardRedemption | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const hasActiveFilters =
        search !== '' || status !== '' || dateFrom !== '' || dateTo !== '';

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            route('cashier.reward-redemptions.index'),
            {
                search: search || undefined,
                status: status || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const clearAll = () => {
        setSearch('');
        setStatus('');
        setDateFrom('');
        setDateTo('');

        router.get(
            route('cashier.reward-redemptions.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

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

            <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <AdminPageHeader
                        eyebrow="Rewards"
                        title="Reward Redemption History"
                        description="View rewards redeemed by customers and cancel mistakes."
                        action={
                            <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-[#64748B]">
                                    Records
                                </p>
                                <p className="mt-1 text-sm font-semibold text-[#111827]">
                                    {redemptions.total.toLocaleString('en-PH')}
                                </p>
                            </div>
                        }
                    />

                    <FlashMessage success={flash.success} error={flash.error} />

                    {/* Filters */}
                    <div className="mb-6 overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-sm">
                        <form onSubmit={applyFilters} className="p-4 sm:p-5">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                {/* Search */}
                                <div className="relative w-full lg:max-w-md lg:flex-1">
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#DC2626]"
                                    >
                                        <circle cx="11" cy="11" r="7" />
                                        <path d="M21 21l-4.3-4.3" />
                                    </svg>

                                    <input
                                        id="filter-search"
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        maxLength={100}
                                        placeholder="Search by customer or reward…"
                                        aria-label="Search redemptions"
                                        className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-3 text-sm text-[#111827] outline-none transition placeholder:text-[#64748B] focus:border-[#DC2626] focus:ring-2 focus:ring-[#FECACA]"
                                    />
                                </div>

                                {/* Secondary filters */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:items-center lg:gap-2">
                                    <select
                                        id="filter-status"
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value)
                                        }
                                        aria-label="Filter by status"
                                        className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#DC2626] focus:ring-2 focus:ring-[#FECACA] lg:w-[10.5rem]"
                                    >
                                        <option value="">All statuses</option>
                                        <option value="completed">
                                            Completed
                                        </option>
                                        <option value="cancelled">
                                            Cancelled
                                        </option>
                                    </select>

                                    <input
                                        id="filter-date-from"
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) =>
                                            setDateFrom(e.target.value)
                                        }
                                        max={dateTo || undefined}
                                        aria-label="From date"
                                        className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#DC2626] focus:ring-2 focus:ring-[#FECACA] lg:w-[9.5rem]"
                                    />

                                    <input
                                        id="filter-date-to"
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) =>
                                            setDateTo(e.target.value)
                                        }
                                        min={dateFrom || undefined}
                                        aria-label="To date"
                                        className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#DC2626] focus:ring-2 focus:ring-[#FECACA] lg:w-[9.5rem]"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 lg:ml-auto">
                                    <button
                                        type="submit"
                                        className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Apply
                                    </button>

                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={clearAll}
                                            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:bg-[#F8FAFC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Redemption History */}
                    <div className="overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-sm">
                        <div className="bg-[#B91C1C] px-6 py-5">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight text-white">
                                        Redemption History
                                    </h2>

                                    <p className="mt-1 text-sm text-[#FECACA]">
                                        Recent reward redemptions processed by
                                        you.
                                    </p>
                                </div>

                                <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#B91C1C] sm:inline-flex">
                                    {redemptions.total.toLocaleString('en-PH')}{' '}
                                    record
                                    {redemptions.total !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left text-sm">
                                <thead className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#111827]">
                                            Customer
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#111827]">
                                            Reward
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#111827]">
                                            Points Used
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#111827]">
                                            Date
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#111827]">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#111827]">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#E5E7EB]">
                                    {redemptions.data.length > 0 ? (
                                        redemptions.data.map((redemption) => (
                                            <tr
                                                key={redemption.id}
                                                className="transition-colors hover:bg-[#F8FAFC]"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2] text-sm font-bold text-[#DC2626]">
                                                            {redemption.customer.first_name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                            {redemption.customer.last_name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-[#111827]">
                                                                {
                                                                    redemption
                                                                        .customer
                                                                        .first_name
                                                                }{' '}
                                                                {
                                                                    redemption
                                                                        .customer
                                                                        .last_name
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 max-w-[220px] truncate text-xs text-[#64748B]">
                                                                {
                                                                    redemption
                                                                        .customer
                                                                        .customer_code
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-[#111827]">
                                                        {
                                                            redemption.reward
                                                                .reward_name
                                                        }
                                                    </p>

                                                    <p className="mt-0.5 text-xs capitalize text-[#64748B]">
                                                        {redemption.reward.reward_type.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="inline-flex rounded-full bg-[#FEF3C7] px-2.5 py-1 text-xs font-semibold text-[#92400E]">
                                                        {formatNumber(
                                                            redemption.points_used,
                                                        )}{' '}
                                                        pt
                                                        {redemption.points_used !==
                                                        1
                                                            ? 's'
                                                            : ''}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-sm text-[#64748B]">
                                                    {formatDate(
                                                        redemption.redeemed_at,
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <StatusPill
                                                        status={
                                                            redemption.status
                                                        }
                                                    />
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end">
                                                        {redemption.status === 'completed' ? (
                                                            canCancelRedemption(redemption.redeemed_at) ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setCancellingRedemption(redemption)
                                                                    }
                                                                    className="text-sm font-semibold text-[#DC2626] transition-colors hover:text-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-1"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            ) : (
                                                                <span
                                                                    className="text-sm font-medium text-[#64748B]"
                                                                    title="Redemptions can only be cancelled within 24 hours."
                                                                >
                                                                    Expired
                                                                </span>
                                                            )
                                                        ) : (
                                                            <span className="text-sm text-[#64748B]/50">
                                                                —
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-16 text-center"
                                            >
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF2F2] text-[#DC2626]">
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

                                                <p className="mt-4 font-semibold text-[#111827]">
                                                    {hasActiveFilters
                                                        ? 'No redemptions match your filters'
                                                        : 'No reward redemptions found'}
                                                </p>

                                                <p className="mt-1 text-sm text-[#64748B]">
                                                    {hasActiveFilters
                                                        ? 'Try adjusting or clearing your filters.'
                                                        : 'Redemption activity will appear here.'}
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {redemptions.last_page > 1 && (
                            <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-[#F8FAFC] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-[#64748B]">
                                    Showing{' '}
                                    <span className="font-medium text-[#111827]">
                                        {redemptions.from}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium text-[#111827]">
                                        {redemptions.to}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-[#111827]">
                                        {redemptions.total}
                                    </span>{' '}
                                    redemptions
                                </p>

                                <div className="flex flex-wrap items-center gap-1">
                                    {redemptions.links.map((link, index) => {
                                        if (link.url === null) {
                                            return (
                                                <span
                                                    key={index}
                                                    className="rounded-md px-3 py-1.5 text-sm text-[#64748B]/50"
                                                >
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                </span>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                preserveScroll
                                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                                    link.active
                                                        ? 'bg-[#DC2626] text-white'
                                                        : 'text-[#111827] hover:bg-[#FEF2F2]'
                                                }`}
                                            >
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel confirmation modal */}
            {cancellingRedemption && (
                <AdminModal
                    title="Cancel Redemption?"
                    description="The redemption will be cancelled and the points will be returned to the customer."
                    onClose={() => {
                        if (!isCancelling) {
                            setCancellingRedemption(null);
                        }
                    }}
                    maxWidthClass="max-w-md"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setCancellingRedemption(null)}
                                disabled={isCancelling}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] transition-colors hover:bg-[#F8FAFC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Keep
                            </button>

                            <button
                                type="button"
                                onClick={confirmCancel}
                                disabled={isCancelling}
                                aria-busy={isCancelling}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isCancelling ? (
                                    <>
                                        <svg
                                            className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            aria-hidden="true"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="9"
                                                stroke="currentColor"
                                                strokeOpacity="0.25"
                                                strokeWidth="3"
                                            />
                                            <path
                                                d="M21 12a9 9 0 00-9-9"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                            />
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
                    <div className="px-6 py-6">
                        <p className="text-sm leading-6 text-[#64748B]">
                            You are about to cancel the redemption of{' '}
                            <span className="font-semibold text-[#111827]">
                                {cancellingRedemption.reward.reward_name}
                            </span>{' '}
                            for{' '}
                            <span className="font-semibold text-[#111827]">
                                {cancellingRedemption.customer.first_name}{' '}
                                {cancellingRedemption.customer.last_name}
                            </span>
                            .
                        </p>

                        <div className="mt-4 rounded-xl border border-[#FDE68A] bg-[#FEF3C7] p-4">
                            <div className="flex gap-3">
                                <div className="mt-0.5 shrink-0 text-[#92400E]" aria-hidden="true">
                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v4m0 4h.01M10.3 3.8L2.9 17a2 2 0 001.75 3h14.7a2 2 0 001.75-3L13.7 3.8a2 2 0 00-3.4 0z"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-[#92400E]">
                                        Points will be refunded
                                    </p>

                                    <p className="mt-1 text-sm leading-5 text-[#92400E]">
                                        {formatNumber(cancellingRedemption.points_used)}{' '}
                                        point
                                        {cancellingRedemption.points_used !== 1 ? 's' : ''}{' '}
                                        will be returned to the customer&apos;s balance.
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