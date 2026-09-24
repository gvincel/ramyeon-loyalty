import { Head, Link, router } from '@inertiajs/react';
import CashierLayout from '@/Layouts/CashierLayout';
import { FormEvent, useState } from 'react';

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
    total: number;
    links: PaginationLink[];
}

interface Props {
    transactions: Transactions;
    filters: Filters;
}

interface Filters {
    search: string | null;
}

export default function Index({ transactions, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            route('cashier.transactions.index'),
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <CashierLayout>
            <Head title="Transaction History" />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Transaction History
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            View purchase transactions processed by you.
                        </p>
                    </div>

                    {/* Search Card */}
                    <div className="mb-6 rounded-xl bg-white shadow-sm">
                        <div className="border-b px-6 py-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Search Transactions
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Search by customer name, customer code, or
                                receipt number.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSearch}
                            className="flex flex-col gap-3 p-6 sm:flex-row"
                        >
                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search customer, code, or receipt number"
                                maxLength={100}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            />

                            <div className="flex gap-3 sm:shrink-0">
                                <button
                                    type="submit"
                                    className="flex-1 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 sm:flex-none"
                                >
                                    Search
                                </button>

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');

                                            router.get(
                                                route(
                                                    'cashier.transactions.index',
                                                ),
                                                {},
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                },
                                            );
                                        }}
                                        className="flex-1 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:flex-none"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Transaction Table Card */}
                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="flex flex-col gap-1 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Transactions
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {transactions.total} total transaction
                                    {transactions.total !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Customer
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Receipt
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Purchase Amount
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Points Earned
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Date
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {transactions.data.length > 0 ? (
                                        transactions.data.map((transaction) => (
                                            <tr
                                                key={transaction.id}
                                                className="transition hover:bg-gray-50"
                                            >
                                                {/* Customer */}
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900">
                                                        {
                                                            transaction.customer
                                                                .first_name
                                                        }{' '}
                                                        {
                                                            transaction.customer
                                                                .last_name
                                                        }
                                                    </div>

                                                    <div className="mt-0.5 text-xs text-gray-500">
                                                        {
                                                            transaction.customer
                                                                .customer_code
                                                        }
                                                    </div>
                                                </td>

                                                {/* Receipt */}
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {transaction.receipt_number ??
                                                        '—'}
                                                </td>

                                                {/* Purchase Amount */}
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    ₱
                                                    {
                                                        transaction.purchase_amount
                                                    }
                                                </td>

                                                {/* Points */}
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                                                        +
                                                        {
                                                            transaction.points_earned
                                                        }{' '}
                                                        point
                                                        {transaction.points_earned !==
                                                        1
                                                            ? 's'
                                                            : ''}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(
                                                        transaction.created_at,
                                                    ).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-12 text-center"
                                            >
                                                <p className="text-sm font-medium text-gray-700">
                                                    No transactions found.
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Try adjusting your search
                                                    or check again later.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col gap-4 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-gray-500">
                                Total transactions:{' '}
                                <span className="font-semibold text-gray-700">
                                    {transactions.total}
                                </span>
                            </p>

                            <div className="flex flex-wrap gap-1.5">
                                {transactions.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url ?? '#'}
                                        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                                            link.active
                                                ? 'bg-red-600 text-white'
                                                : link.url
                                                  ? 'bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50'
                                                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                        preserveScroll
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}