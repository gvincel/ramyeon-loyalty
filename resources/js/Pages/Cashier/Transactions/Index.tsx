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

const formatCurrency = (value: string | number) => {
    return `₱${Number(value).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

export default function Index({ transactions, filters }: Props) {
    const { flash } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const hasActiveFilters =
        search !== '' || dateFrom !== '' || dateTo !== '';

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

    return (
        <CashierLayout>
            <Head title="Transaction History" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <AdminPageHeader
                        eyebrow="Transactions"
                        title="Transaction History"
                        description="View purchase transactions processed by you."
                        action={
                            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                    Records
                                </p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                    {transactions.total.toLocaleString('en-PH')}
                                </p>
                            </div>
                        }
                    />

                    <FlashMessage
                        success={flash.success}
                        error={flash.error}
                    />

                    {/* Filters */}
                    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <form onSubmit={applyFilters} className="p-4 sm:p-5">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                {/* Search */}
                                <div className="relative w-full lg:max-w-xl lg:flex-1">
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
                                        placeholder="Search customer, code, or receipt…"
                                        aria-label="Search transactions"
                                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    />
                                </div>

                                {/* Date range */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-center lg:gap-2">
                                    <input
                                        id="filter-date-from"
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) =>
                                            setDateFrom(e.target.value)
                                        }
                                        max={dateTo || undefined}
                                        aria-label="From date"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 lg:w-[9.5rem]"
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
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 lg:w-[9.5rem]"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 lg:ml-auto">
                                    <button
                                        type="submit"
                                        className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
                                    >
                                        Apply
                                    </button>

                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={clearAll}
                                            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 lg:flex-none"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Transactions Table */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                        Transactions
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Purchase transactions processed by you.
                                    </p>
                                </div>

                                <span className="hidden rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 ring-1 ring-gray-200 sm:inline-flex">
                                    {transactions.total.toLocaleString('en-PH')}{' '}
                                    record
                                    {transactions.total !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50/70">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Customer
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Receipt
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Purchase Amount
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Points Earned
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Date
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {transactions.data.length > 0 ? (
                                        transactions.data.map((transaction) => (
                                            <tr
                                                key={transaction.id}
                                                className="transition-colors hover:bg-gray-50/70"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                                                            {transaction.customer.first_name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                            {transaction.customer.last_name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-gray-900">
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

                                                            <p className="mt-0.5 max-w-[220px] truncate text-xs text-gray-500">
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
                                                        <span className="inline-flex rounded-md bg-gray-50 px-2.5 py-1 font-medium text-gray-700 ring-1 ring-gray-200">
                                                            {
                                                                transaction.receipt_number
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-300">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                    {formatCurrency(
                                                        transaction.purchase_amount,
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="inline-flex rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700 ring-1 ring-yellow-100">
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

                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDate(
                                                        transaction.created_at,
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-16 text-center"
                                            >
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
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
                                                        <circle
                                                            cx="10"
                                                            cy="19"
                                                            r="1"
                                                        />
                                                        <circle
                                                            cx="17"
                                                            cy="19"
                                                            r="1"
                                                        />
                                                    </svg>
                                                </div>

                                                <p className="mt-4 font-semibold text-gray-800">
                                                    {hasActiveFilters
                                                        ? 'No transactions match your filters'
                                                        : 'No transactions found'}
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {hasActiveFilters
                                                        ? 'Try adjusting or clearing your filters.'
                                                        : 'Transaction activity will appear here.'}
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {transactions.last_page > 1 && (
                            <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-500">
                                    Showing{' '}
                                    <span className="font-medium text-gray-700">
                                        {transactions.from}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium text-gray-700">
                                        {transactions.to}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-gray-700">
                                        {transactions.total}
                                    </span>{' '}
                                    transactions
                                </p>

                                <div className="flex flex-wrap items-center gap-1">
                                    {transactions.links.map((link, index) => {
                                        if (link.url === null) {
                                            return (
                                                <span
                                                    key={index}
                                                    className="rounded-md px-3 py-1.5 text-sm text-gray-300"
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
                                                        ? 'bg-red-600 text-white'
                                                        : 'text-gray-700 hover:bg-gray-100'
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
        </CashierLayout>
    );
}