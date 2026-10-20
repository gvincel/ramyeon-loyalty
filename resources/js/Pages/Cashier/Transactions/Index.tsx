import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import CashierLayout from '@/Layouts/CashierLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import FlashMessage from '@/Components/FlashMessage';
import { PageProps } from '@/types';

interface Customer {
    first_name: string;
    last_name: string;
    customer_code: string;
}

interface Transaction {
    id: number;
    receipt_number: string | null;
    purchase_amount: string;
    points_earned: number;
    created_at: string;
    customer: Customer;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Transactions {
    data: Transaction[];
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
    date_from: string | null;
    date_to: string | null;
}

interface Props {
    transactions: Transactions;
    filters: Filters;
}

const parseDate = (value: string | null | undefined) => {
    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
};

const formatDay = (value: string | null | undefined) => {
    const date = parseDate(value);

    if (!date) return '—';

    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatTime = (value: string | null | undefined) => {
    const date = parseDate(value);

    if (!date) return '';

    return date.toLocaleTimeString('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
    });
};

const formatNumber = (value: string | number) => {
    return Number(value).toLocaleString('en-PH');
};

const formatCurrency = (value: string | number) => {
    return `₱${Number(value).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const initialsOf = (customer: Customer) =>
    `${customer.first_name.charAt(0)}${customer.last_name.charAt(0)}`.toUpperCase();

export default function Index({ transactions, filters }: Props) {
    const { flash } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const hasActiveFilters =
        search !== '' || dateFrom !== '' || dateTo !== '';

    const pageSales = transactions.data.reduce(
        (sum, transaction) => sum + Number(transaction.purchase_amount),
        0,
    );

    const pagePoints = transactions.data.reduce(
        (sum, transaction) => sum + Number(transaction.points_earned),
        0,
    );

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            route('cashier.transactions.index'),
            {
                search: search || undefined,
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
        setDateFrom('');
        setDateTo('');

        router.get(
            route('cashier.transactions.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const fieldClass =
        'w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#64748B] hover:border-[#64748B]/50 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15';

    return (
        <CashierLayout>
            <Head title="Transaction History" />

            <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <AdminPageHeader
                        eyebrow="Transactions"
                        title="Transaction History"
                        description="View purchase transactions processed by you."
                    />

                    <FlashMessage
                        success={flash.success}
                        error={flash.error}
                    />

                    {/* Summary */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="flex h-full flex-col rounded-[20px] border border-[#E5E7EB] border-t-2 border-t-[#DC2626] bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-[#64748B]">
                                        Total transactions
                                    </p>

                                    <p className="mt-3 truncate text-3xl font-bold leading-none tracking-tight text-[#111827] tabular-nums">
                                        {formatNumber(transactions.total)}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#DC2626]">
                                    <span
                                        className="material-symbols-outlined text-[22px]"
                                        aria-hidden="true"
                                    >
                                        receipt_long
                                    </span>
                                </div>
                            </div>

                            <div className="mt-auto border-t border-[#E5E7EB] pt-4">
                                <p className="mt-5 text-xs text-[#64748B]">
                                    {hasActiveFilters
                                        ? 'Matching your filters'
                                        : 'All processed by you'}
                                </p>
                            </div>
                        </div>

                        <div className="flex h-full flex-col rounded-[20px] border border-[#E5E7EB] border-t-2 border-t-[#DC2626] bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-[#64748B]">
                                        Sales on this page
                                    </p>

                                    <p className="mt-3 truncate text-3xl font-bold leading-none tracking-tight text-[#111827] tabular-nums">
                                        {formatCurrency(pageSales)}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#DC2626]">
                                    <span
                                        className="material-symbols-outlined text-[22px]"
                                        aria-hidden="true"
                                    >
                                        payments
                                    </span>
                                </div>
                            </div>

                            <div className="mt-auto border-t border-[#E5E7EB] pt-4">
                                <p className="mt-5 text-xs text-[#64748B]">
                                    {transactions.data.length} transaction
                                    {transactions.data.length !== 1 ? 's' : ''} shown
                                </p>
                            </div>
                        </div>

                        <div className="flex h-full flex-col rounded-[20px] border border-[#E5E7EB] border-t-2 border-t-[#DC2626] bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-[#64748B]">
                                        Points on this page
                                    </p>

                                    <p className="mt-3 truncate text-3xl font-bold leading-none tracking-tight text-[#111827] tabular-nums">
                                        +{formatNumber(pagePoints)}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#DC2626]">
                                    <span
                                        className="material-symbols-outlined text-[22px]"
                                        aria-hidden="true"
                                    >
                                        stars
                                    </span>
                                </div>
                            </div>

                            <div className="mt-auto border-t border-[#E5E7EB] pt-4">
                                <p className="mt-5 text-xs text-[#64748B]">
                                    Earned by customers
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <form
                        onSubmit={applyFilters}
                        className="mb-6 rounded-[20px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5"
                    >
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_auto] lg:items-end">
                            <div className="sm:col-span-2 lg:col-span-1">
                                <label
                                    htmlFor="filter-search"
                                    className="mb-1.5 block text-xs font-semibold text-[#111827]"
                                >
                                    Search
                                </label>

                                <div className="relative">
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#DC2626]"
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
                                        placeholder="Customer, code, or receipt…"
                                        className={`${fieldClass} pl-10`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="filter-date-from"
                                    className="mb-1.5 block text-xs font-semibold text-[#111827]"
                                >
                                    From
                                </label>

                                <input
                                    id="filter-date-from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                    max={dateTo || undefined}
                                    className={fieldClass}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="filter-date-to"
                                    className="mb-1.5 block text-xs font-semibold text-[#111827]"
                                >
                                    To
                                </label>

                                <input
                                    id="filter-date-to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) =>
                                        setDateTo(e.target.value)
                                    }
                                    min={dateFrom || undefined}
                                    className={fieldClass}
                                />
                            </div>

                            <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
                                <button
                                    type="submit"
                                    className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[#DC2626] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 lg:flex-none"
                                >
                                    Apply filters
                                </button>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 lg:flex-none"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>

                    {/* Transactions */}
                    <section className="overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-sm">
                        <div className="flex flex-col gap-1 bg-[#B91C1C] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-bold tracking-tight text-white">
                                    Transactions
                                </h2>

                                <p className="mt-1 text-sm text-[#FECACA]">
                                    Purchase transactions processed by you.
                                </p>
                            </div>

                            {transactions.from !== null &&
                                transactions.to !== null && (
                                    <span className="text-xs font-medium text-[#FECACA]">
                                        Showing {transactions.from}–
                                        {transactions.to} of{' '}
                                        {formatNumber(transactions.total)}
                                    </span>
                                )}
                        </div>

                        {transactions.data.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF2F2] text-[#DC2626]">
                                    <span
                                        className="material-symbols-outlined text-[24px]"
                                        aria-hidden="true"
                                    >
                                        receipt_long
                                    </span>
                                </div>

                                <p className="mt-4 font-semibold text-[#111827]">
                                    {hasActiveFilters
                                        ? 'No transactions match your filters'
                                        : 'No transactions found'}
                                </p>

                                <p className="mt-1 text-sm text-[#64748B]">
                                    {hasActiveFilters
                                        ? 'Try adjusting or resetting your filters.'
                                        : 'Transaction activity will appear here.'}
                                </p>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#DC2626] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                                    >
                                        Reset filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#111827]">
                                            <tr>
                                                <th className="px-6 py-3.5">
                                                    Customer
                                                </th>
                                                <th className="px-6 py-3.5">
                                                    Receipt
                                                </th>
                                                <th className="px-6 py-3.5 text-right">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-3.5">
                                                    Points
                                                </th>
                                                <th className="px-6 py-3.5">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-[#E5E7EB] border-t border-[#E5E7EB]">
                                            {transactions.data.map(
                                                (transaction) => (
                                                    <tr
                                                        key={transaction.id}
                                                        className="transition-colors hover:bg-[#F8FAFC]"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2] text-sm font-bold text-[#DC2626]">
                                                                    {initialsOf(
                                                                        transaction.customer,
                                                                    )}
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <p className="truncate font-semibold text-[#111827]">
                                                                        {
                                                                            transaction
                                                                                .customer
                                                                                .first_name
                                                                        }{' '}
                                                                        {
                                                                            transaction
                                                                                .customer
                                                                                .last_name
                                                                        }
                                                                    </p>

                                                                    <p className="mt-0.5 max-w-[220px] truncate text-xs text-[#64748B]">
                                                                        {
                                                                            transaction
                                                                                .customer
                                                                                .customer_code
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            {transaction.receipt_number ? (
                                                                <span className="inline-flex rounded-md bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-[#111827] ring-1 ring-[#E5E7EB]">
                                                                    {
                                                                        transaction.receipt_number
                                                                    }
                                                                </span>
                                                            ) : (
                                                                <span className="text-[#64748B]/50">
                                                                    —
                                                                </span>
                                                            )}
                                                        </td>

                                                        <td className="px-6 py-4 text-right text-sm font-bold text-[#111827] tabular-nums">
                                                            {formatCurrency(
                                                                transaction.purchase_amount,
                                                            )}
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex rounded-full bg-[#FEF3C7] px-2.5 py-1 text-xs font-semibold text-[#92400E]">
                                                                +
                                                                {formatNumber(
                                                                    transaction.points_earned,
                                                                )}{' '}
                                                                pt
                                                                {transaction.points_earned !==
                                                                1
                                                                    ? 's'
                                                                    : ''}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-medium text-[#111827]">
                                                                {formatDay(
                                                                    transaction.created_at,
                                                                )}
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-[#64748B]">
                                                                {formatTime(
                                                                    transaction.created_at,
                                                                )}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile cards */}
                                <ul className="divide-y divide-[#E5E7EB] border-t border-[#E5E7EB] md:hidden">
                                    {transactions.data.map((transaction) => (
                                        <li key={transaction.id} className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2] text-sm font-bold text-[#DC2626]">
                                                        {initialsOf(
                                                            transaction.customer,
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-[#111827]">
                                                            {
                                                                transaction
                                                                    .customer
                                                                    .first_name
                                                            }{' '}
                                                            {
                                                                transaction
                                                                    .customer
                                                                    .last_name
                                                            }
                                                        </p>
                                                        <p className="truncate text-xs text-[#64748B]">
                                                            {
                                                                transaction
                                                                    .customer
                                                                    .customer_code
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="shrink-0 text-sm font-bold text-[#111827] tabular-nums">
                                                    {formatCurrency(
                                                        transaction.purchase_amount,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex rounded-full bg-[#FEF3C7] px-2.5 py-1 text-xs font-semibold text-[#92400E]">
                                                    +
                                                    {formatNumber(
                                                        transaction.points_earned,
                                                    )}{' '}
                                                    pt
                                                    {transaction.points_earned !==
                                                    1
                                                        ? 's'
                                                        : ''}
                                                </span>

                                                {transaction.receipt_number && (
                                                    <span className="inline-flex rounded-md bg-[#F8FAFC] px-2 py-1 text-xs font-medium text-[#111827] ring-1 ring-[#E5E7EB]">
                                                        {
                                                            transaction.receipt_number
                                                        }
                                                    </span>
                                                )}

                                                <span className="ml-auto text-xs text-[#64748B]">
                                                    {formatDay(
                                                        transaction.created_at,
                                                    )}
                                                    {formatTime(
                                                        transaction.created_at,
                                                    )
                                                        ? `, ${formatTime(transaction.created_at)}`
                                                        : ''}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {/* Pagination */}
                        {transactions.last_page > 1 && (
                            <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-[#F8FAFC] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-[#64748B]">
                                    Page{' '}
                                    <span className="font-semibold text-[#111827]">
                                        {transactions.current_page}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-semibold text-[#111827]">
                                        {transactions.last_page}
                                    </span>
                                </p>

                                <div className="flex flex-wrap items-center gap-1">
                                    {transactions.links.map((link, index) => {
                                        if (link.url === null) {
                                            return (
                                                <span
                                                    key={index}
                                                    className="rounded-lg px-3 py-1.5 text-sm text-[#64748B]/50"
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
                                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                                    link.active
                                                        ? 'bg-[#DC2626] text-white shadow-sm'
                                                        : 'text-[#111827] hover:bg-white hover:text-[#B91C1C] hover:ring-1 hover:ring-[#E5E7EB]'
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
                    </section>
                </div>
            </div>
        </CashierLayout>
    );
}