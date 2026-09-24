import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import CashierLayout from '@/Layouts/CashierLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import StatusBadge from '@/Components/StatusBadge';
import FlashMessage from '@/Components/FlashMessage';
import { PageProps } from '@/types';

interface Customer {
    id: number;
    customer_code: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string | null;
    points: number;
    is_active: boolean;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

export default function Index({
    customers,
    filters,
}: {
    customers: Paginated<Customer>;
    filters: { search: string };
}) {
    const { flash } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            route('cashier.customers.index'),
            { search },
            { preserveState: true, replace: true },
        );
    };

    const clearSearch = () => {
        setSearch('');
        router.get(
            route('cashier.customers.index'),
            {},
            { preserveState: true, replace: true },
        );
    };

    return (
        <CashierLayout>
            <Head title="Customer Records" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <AdminPageHeader
                        eyebrow="Customer Management"
                        title="Customer Records"
                        description="Search and view customer loyalty information."
                        action={
                            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                    Records
                                </p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                    {customers.total.toLocaleString('en-PH')}
                                </p>
                            </div>
                        }
                    />

                    <FlashMessage
                        success={flash.success}
                        error={flash.error}
                    />

                    {/* Search + Register */}
                    <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <form
                                onSubmit={submitSearch}
                                className="flex w-full flex-1 items-center gap-2"
                            >
                                <div className="relative flex-1">
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
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search by name, code, or phone…"
                                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
                                >
                                    Search
                                </button>

                                {search && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
                                    >
                                        Clear
                                    </button>
                                )}
                            </form>

                            <Link
                                href={route('cashier.customers.register')}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M12 5v14" />
                                    <path d="M5 12h14" />
                                </svg>
                                Register Customer
                            </Link>
                        </div>
                    </div>

                    {/* Customer Table */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                        Customer Records
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Registered customers and their loyalty account details.
                                    </p>
                                </div>

                                <span className="hidden rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 ring-1 ring-gray-200 sm:inline-flex">
                                    {customers.total.toLocaleString('en-PH')} customer
                                    {customers.total !== 1 ? 's' : ''}
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
                                            Customer Code
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Phone
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Points
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {customers.data.length > 0 ? (
                                        customers.data.map((customer) => (
                                            <tr
                                                key={customer.id}
                                                className="transition-colors hover:bg-gray-50/70"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                                                            {customer.first_name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                            {customer.last_name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-gray-900">
                                                                {customer.first_name}{' '}
                                                                {customer.last_name}
                                                            </p>

                                                            <p className="mt-0.5 max-w-[220px] truncate text-xs text-gray-500">
                                                                {customer.email || 'No email'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="inline-flex rounded-md bg-gray-50 px-2.5 py-1 font-medium text-gray-700 ring-1 ring-gray-200">
                                                        {customer.customer_code}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {customer.phone_number}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gray-900">
                                                        {Number(
                                                            customer.points,
                                                        ).toLocaleString('en-PH')}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <StatusBadge
                                                        active={customer.is_active}
                                                    />
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-3">
                                                        <Link
                                                            href={route(
                                                                'cashier.customers.show',
                                                                customer.id,
                                                            )}
                                                            className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
                                                        >
                                                            View
                                                        </Link>
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
                                                            d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
                                                        />

                                                        <circle
                                                            cx="9"
                                                            cy="7"
                                                            r="4"
                                                        />

                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                                                        />
                                                    </svg>
                                                </div>

                                                <p className="mt-4 font-semibold text-gray-800">
                                                    {filters.search
                                                        ? 'No customers match your search'
                                                        : 'No customers found'}
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {filters.search
                                                        ? 'Try a different name, code, or phone number.'
                                                        : 'No registered customers are currently available.'}
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {customers.data.length > 0 &&
                            customers.last_page > 1 && (
                                <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-gray-500">
                                        Showing{' '}
                                        <span className="font-medium text-gray-700">
                                            {customers.from}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-medium text-gray-700">
                                            {customers.to}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-medium text-gray-700">
                                            {customers.total}
                                        </span>{' '}
                                        customers
                                    </p>

                                    <div className="flex flex-wrap items-center gap-1">
                                        {customers.links.map((link, index) => {
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