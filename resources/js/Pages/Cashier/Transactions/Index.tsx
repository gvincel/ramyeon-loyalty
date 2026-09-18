import { Head, Link, router } from '@inertiajs/react';
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
        <>
            <Head title="Transaction History" />

            <div className="min-h-screen bg-gray-100 p-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Transaction History
                </h1>

                <p className="mt-2 text-gray-600">
                    Transactions processed by you.
                </p>

                <form onSubmit={handleSearch} className="mt-6 flex gap-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search customer, code, or receipt number"
                        maxLength={100}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                    />

                    <button
                        type="submit"
                        className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        Search
                    </button>

                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');

                                router.get(
                                    route('cashier.transactions.index'),
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Clear
                        </button>
                    )}
                </form>

                <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                        Receipt
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                        Purchase Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                        Points Earned
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {
                                                        transaction.customer
                                                            .first_name
                                                    }{' '}
                                                    {
                                                        transaction.customer
                                                            .last_name
                                                    }
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {
                                                        transaction.customer
                                                            .customer_code
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-gray-700">
                                                {transaction.receipt_number ??
                                                    '—'}
                                            </td>

                                            <td className="px-6 py-4 text-gray-700">
                                                ₱{transaction.purchase_amount}
                                            </td>

                                            <td className="px-6 py-4 text-gray-700">
                                                {transaction.points_earned}
                                            </td>

                                            <td className="px-6 py-4 text-gray-700">
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
                                            className="px-6 py-10 text-center text-gray-500"
                                        >
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Total transactions: {transactions.total}
                    </div>

                    <div className="flex gap-2">
                        {transactions.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url ?? '#'}
                                className={`rounded px-3 py-2 text-sm ${
                                    link.active
                                        ? 'bg-gray-900 text-white'
                                        : link.url
                                        ? 'bg-white text-gray-700 hover:bg-gray-100'
                                        : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                preserveScroll
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
