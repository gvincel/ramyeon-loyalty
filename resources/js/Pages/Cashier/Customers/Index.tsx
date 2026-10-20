import { Head, Link, router, usePage } from '@inertiajs/react';
    import { FormEvent, useState } from 'react';
    import CashierLayout from '@/Layouts/CashierLayout';
    import AdminPageHeader from '@/Components/AdminPageHeader';
    import AdminModal from '@/Components/AdminModal';
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
        const [copiedCustomerId, setCopiedCustomerId] = useState<number | null>(null);

        const [customerToDelete, setCustomerToDelete] =
            useState<Customer | null>(null);
        const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);
        const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);

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

        const toggleCustomerStatus = (customer: Customer) => {
            const action = customer.is_active ? 'deactivate' : 'activate';

            if (
                !window.confirm(
                    `Are you sure you want to ${action} ${customer.first_name} ${customer.last_name}'s account?`,
                )
            ) {
                return;
            }

            router.patch(
                route('cashier.customers.toggle-status', customer.id),
                {},
                {
                    preserveScroll: true,
                },
            );
        };

        const deleteCustomer = (customer: Customer) => {
            setDeleteAcknowledged(false);
            setCustomerToDelete(customer);
        };

        const confirmDeleteCustomer = () => {
            if (
                !customerToDelete ||
                !deleteAcknowledged ||
                isDeletingCustomer
            ) {
                return;
            }

            router.delete(route('cashier.customers.destroy', customerToDelete.id), {
                preserveScroll: true,
                onStart: () => setIsDeletingCustomer(true),
                onSuccess: () => {
                    setCustomerToDelete(null);
                    setDeleteAcknowledged(false);
                },
                onFinish: () => setIsDeletingCustomer(false),
            });
        };


        const handleCopyCustomerCode = async (
            customerId: number,
            customerCode: string,
        ) => {
            try {
                await navigator.clipboard.writeText(customerCode);

                setCopiedCustomerId(customerId);

                window.setTimeout(() => {
                    setCopiedCustomerId((current) =>
                        current === customerId ? null : current,
                    );
                }, 2000);
            } catch {
                setCopiedCustomerId(null);
            }
        };

        return (
            <CashierLayout>
                <Head title="Customer Records" />

                <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Header */}
                        <AdminPageHeader
                            eyebrow="Customer Management"
                            title="Customer Records"
                            description="Search and view customer loyalty information."
                            action={
                                <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-[#64748B]">
                                        Records
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-[#111827]">
                                        {customers.total.toLocaleString('en-PH')}
                                    </p>
                                </div>
                            }
                        />

                        <FlashMessage
                            success={flash.success}
                            error={flash.error}
                        />

                        {/* Search */}
                        <div className="mb-6 overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-sm">
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
                                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#DC2626]"
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
                                            className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-3 text-sm text-[#111827] outline-none transition placeholder:text-[#64748B] focus:border-[#DC2626] focus:ring-2 focus:ring-[#FECACA]"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="rounded-lg border border-[#DC2626] bg-[#DC2626] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#B91C1C] hover:bg-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                                    >
                                        Search
                                    </button>

                                    {search && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F8FAFC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </form>

                            </div>
                        </div>

                        {/* Customer Table */}
                        <div className="overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-sm">
                            <div className="bg-[#B91C1C] px-6 py-5">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold tracking-tight text-white">
                                            Customer Records
                                        </h2>

                                        <p className="mt-1 text-sm text-[#FECACA]">
                                            Registered customers and their loyalty account details.
                                        </p>
                                    </div>

                                    <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#B91C1C] sm:inline-flex">
                                        {customers.total.toLocaleString('en-PH')} customer
                                        {customers.total !== 1 ? 's' : ''}
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
                                                Customer Code
                                            </th>

                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#111827]">
                                                Phone
                                            </th>

                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#111827]">
                                                Points
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
                                        {customers.data.length > 0 ? (
                                            customers.data.map((customer) => (
                                                <tr
                                                    key={customer.id}
                                                    className="transition-colors hover:bg-[#F8FAFC]"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2] text-sm font-bold text-[#DC2626]">
                                                                {customer.first_name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                                {customer.last_name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold text-[#111827]">
                                                                    {customer.first_name}{' '}
                                                                    {customer.last_name}
                                                                </p>

                                                                <p className="mt-0.5 max-w-[220px] truncate text-xs text-[#64748B]">
                                                                    {customer.email || 'No email'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <span className="inline-flex rounded-md bg-[#F8FAFC] px-2.5 py-1 font-medium text-[#111827] ring-1 ring-[#E5E7EB]">
                                                                {customer.customer_code}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    void handleCopyCustomerCode(
                                                                        customer.id,
                                                                        customer.customer_code,
                                                                    )
                                                                }
                                                                aria-label={
                                                                    copiedCustomerId === customer.id
                                                                        ? 'Customer code copied'
                                                                        : 'Copy customer code'
                                                                }
                                                                title={
                                                                    copiedCustomerId === customer.id
                                                                        ? 'Copied'
                                                                        : 'Copy customer code'
                                                                }
                                                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#DC2626] transition-colors hover:bg-[#FEF2F2] hover:text-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-1"
                                                            >
                                                                {copiedCustomerId === customer.id ? (
                                                                    <svg
                                                                        className="h-4 w-4 text-green-600"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        aria-hidden="true"
                                                                    >
                                                                        <path d="M20 6L9 17l-5-5" />
                                                                    </svg>
                                                                ) : (
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
                                                                        <rect
                                                                            x="9"
                                                                            y="9"
                                                                            width="11"
                                                                            height="11"
                                                                            rx="2"
                                                                        />
                                                                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4 text-[#64748B]">
                                                        {customer.phone_number}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-semibold text-[#92400E]">
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
                                                        <div className="flex items-center justify-end gap-4">
                                                            <Link
                                                                href={route('cashier.customers.show', customer.id)}
                                                                className="text-sm font-semibold text-[#DC2626] transition-colors hover:text-[#B91C1C] focus-visible:outline-none focus-visible:underline"
                                                            >
                                                                View
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                onClick={() => toggleCustomerStatus(customer)}
                                                                className={`text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:underline ${
                                                                    customer.is_active
                                                                        ? 'text-[#111827] hover:text-[#B91C1C]'
                                                                        : 'text-green-600 hover:text-green-700'
                                                                }`}
                                                                aria-label={`${customer.is_active ? 'Deactivate' : 'Activate'} ${customer.first_name} ${customer.last_name}`}
                                                            >
                                                                {customer.is_active ? 'Deactivate' : 'Activate'}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => deleteCustomer(customer)}
                                                                className="ml-3 text-sm font-semibold text-[#DC2626] transition-colors hover:text-[#B91C1C] focus-visible:outline-none focus-visible:underline"
                                                                aria-label={`Permanently delete ${customer.first_name} ${customer.last_name}`}
                                                            >
                                                                Delete
                                                            </button>
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

                                                    <p className="mt-4 font-semibold text-[#111827]">
                                                        {filters.search
                                                            ? 'No customers match your search'
                                                            : 'No customers found'}
                                                    </p>

                                                    <p className="mt-1 text-sm text-[#64748B]">
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
                                    <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-[#F8FAFC] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-sm text-[#64748B]">
                                            Showing{' '}
                                            <span className="font-medium text-[#111827]">
                                                {customers.from}
                                            </span>{' '}
                                            to{' '}
                                            <span className="font-medium text-[#111827]">
                                                {customers.to}
                                            </span>{' '}
                                            of{' '}
                                            <span className="font-medium text-[#111827]">
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
                {customerToDelete && (
                    <AdminModal
                        title="Permanently delete customer?"
                        description="Review the consequences before confirming."
                        onClose={() => {
                            if (!isDeletingCustomer) {
                                setCustomerToDelete(null);
                                setDeleteAcknowledged(false);
                            }
                        }}
                        maxWidthClass="max-w-lg"
                        titleId="cashier-delete-customer-modal-title"
                        footer={
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCustomerToDelete(null);
                                        setDeleteAcknowledged(false);
                                    }}
                                    disabled={isDeletingCustomer}
                                    className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={confirmDeleteCustomer}
                                    disabled={!deleteAcknowledged || isDeletingCustomer}
                                    className="rounded-lg bg-[#DC2626] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#B91C1C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isDeletingCustomer
                                        ? 'Deleting...'
                                        : 'Delete customer permanently'}
                                </button>
                            </>
                        }
                    >
                        <div className="space-y-4 p-6">
                            <p className="text-sm text-[#111827]">
                                You are about to permanently delete{' '}
                                <strong>
                                    {customerToDelete.first_name}{' '}
                                    {customerToDelete.last_name}
                                </strong>
                                's account and associated records:
                            </p>

                            <ul className="list-disc space-y-1 pl-5 text-sm text-[#111827]">
                                <li>Customer profile</li>
                                <li>Purchase transactions and history</li>
                                <li>Point transaction history</li>
                                <li>Reward redemption history</li>
                                <li>Customer QR code</li>
                            </ul>

                            <p className="text-sm text-[#111827]">
                                Feedback submissions will be retained, but their
                                association with this customer will be removed.
                            </p>

                            <div
                                role="alert"
                                className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4"
                            >
                                <p className="text-sm font-bold text-[#B91C1C]">
                                    Warning: This action cannot be undone.
                                </p>
                                <p className="mt-1 text-sm text-[#111827]">
                                    Historical monthly and yearly reports and exports
                                    may change because this customer's past activity
                                    will be removed.
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <input
                                    id="cashier-confirm-customer-deletion"
                                    type="checkbox"
                                    checked={deleteAcknowledged}
                                    onChange={(event) =>
                                        setDeleteAcknowledged(event.target.checked)
                                    }
                                    disabled={isDeletingCustomer}
                                    className="mt-1 h-4 w-4 rounded border-[#E5E7EB] text-[#DC2626] focus:ring-[#DC2626]"
                                />

                                <label
                                    htmlFor="cashier-confirm-customer-deletion"
                                    className="text-sm text-[#111827]"
                                >
                                    I understand that this permanently deletes the
                                    customer's associated records and may affect
                                    historical reports.
                                </label>
                            </div>
                        </div>
                    </AdminModal>
                )}

            </CashierLayout>
        );
    }