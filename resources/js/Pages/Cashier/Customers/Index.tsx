import { Head, Link, router, usePage } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import CashierLayout from '@/Layouts/CashierLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminModal from '@/Components/AdminModal';
import StatusBadge from '@/Components/StatusBadge';
import FlashMessage from '@/Components/FlashMessage';
import StatCard from '@/Components/StatCard';
import SegmentedFilter from '@/Components/SegmentedFilter';
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

interface Stats {
    total_customers: number;
    active_customers: number;
    inactive_customers: number;
    total_points: number;
}

interface Props {
    customers: Paginated<Customer>;
    filters: { search: string; status: 'all' | 'active' | 'inactive' };
    stats: Stats;
}

type StatusFilter = 'all' | 'active' | 'inactive';

const formatNumber = (value: number | string) =>
    Number(value).toLocaleString('en-PH');

const decodePaginationLabel = (label: string) =>
    label
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

const iconProps = {
    className: 'h-4 w-4',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
};

const SearchIcon = () => (
    <svg {...iconProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
    </svg>
);

const UsersIcon = () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
);

const statIconProps = {
    className: 'h-5 w-5',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
};

const StatUsersIcon = () => (
    <svg {...statIconProps}>
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
);

const StatUserCheckIcon = () => (
    <svg {...statIconProps}>
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M16 11l2 2 4-4" />
    </svg>
);

const StatStarIcon = () => (
    <svg {...statIconProps}>
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />
    </svg>
);

export default function Index({ customers, filters, stats }: Props) {
    const { flash } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(filters.status ?? 'all');

    const [customerToToggle, setCustomerToToggle] = useState<Customer | null>(null);
    const [isTogglingCustomer, setIsTogglingCustomer] = useState(false);

    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);
    const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);

    const hasActiveFilters =
        (filters.search ?? '') !== '' || (filters.status ?? 'all') !== 'all';

    const applyFilters = (overrides: { search?: string; status?: StatusFilter } = {}) => {
        const nextSearch = (overrides.search ?? search).trim();
        const nextStatus = overrides.status ?? statusFilter;

        const params: Record<string, string> = {};
        if (nextSearch) params.search = nextSearch;
        if (nextStatus !== 'all') params.status = nextStatus;

        router.get(route('cashier.customers.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['customers', 'filters'],
        });
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        applyFilters();
    };

    const handleStatusChange = (value: StatusFilter) => {
        setStatusFilter(value);
        applyFilters({ status: value });
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('all');
        router.get(route('cashier.customers.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['customers', 'filters'],
        });
    };

    const requestToggleCustomerStatus = (customer: Customer) =>
        setCustomerToToggle(customer);

    const confirmToggleCustomerStatus = () => {
        if (!customerToToggle || isTogglingCustomer) return;

        router.patch(
            route('cashier.customers.toggle-status', customerToToggle.id),
            {},
            {
                preserveScroll: true,
                onStart: () => setIsTogglingCustomer(true),
                onSuccess: () => setCustomerToToggle(null),
                onFinish: () => setIsTogglingCustomer(false),
            },
        );
    };

    const deleteCustomer = (customer: Customer) => {
        setDeleteAcknowledged(false);
        setCustomerToDelete(customer);
    };

    const confirmDeleteCustomer = () => {
        if (!customerToDelete || !deleteAcknowledged || isDeletingCustomer) return;

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

    const renderActions = (customer: Customer) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
                href={route('cashier.customers.show', customer.id)}
                className="btn-secondary btn-sm"
            >
                View
            </Link>
            <button
                type="button"
                onClick={() => requestToggleCustomerStatus(customer)}
                className={`btn-sm ${customer.is_active ? 'btn-ghost-danger' : 'btn-ghost-success'}`}
            >
                {customer.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <button
                type="button"
                onClick={() => deleteCustomer(customer)}
                className="btn-danger btn-sm"
                aria-label={`Permanently delete ${customer.first_name} ${customer.last_name}`}
            >
                Delete
            </button>
        </div>
    );

    const renderAvatar = (customer: Customer) => (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-small font-bold text-brand-600 ring-1 ring-brand-100">
            {customer.first_name.charAt(0).toUpperCase()}
            {customer.last_name.charAt(0).toUpperCase()}
        </div>
    );

    return (
        <CashierLayout>
            <Head title="Customer Records" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content">
                    <AdminPageHeader
                        eyebrow="Customer Management"
                        title="Customers"
                        description="Search and view customer loyalty information."
                    />

                    <FlashMessage success={flash.success} error={flash.error} />

                    <section
                        aria-label="Customer summary"
                        className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        <StatCard
                            label="Total Customers"
                            value={formatNumber(stats.total_customers)}
                            icon={<StatUsersIcon />}
                            footer="Registered loyalty accounts"
                        />
                        <StatCard
                            label="Active Customers"
                            value={formatNumber(stats.active_customers)}
                            icon={<StatUserCheckIcon />}
                            footer={
                                <>
                                    <span className="font-semibold text-ink">
                                        {formatNumber(stats.inactive_customers)}
                                    </span>{' '}
                                    inactive
                                </>
                            }
                        />
                        <div className="sm:col-span-2 lg:col-span-1">
                            <StatCard
                                label="Total Points"
                                value={formatNumber(stats.total_points)}
                                icon={<StatStarIcon />}
                                footer="Current points across all customers"
                            />
                        </div>
                    </section>

                    <section className="panel">
                        <div className="panel-header flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="panel-title">Customer records</h2>
                                <p className="panel-desc">
                                    {customers.total > 0 ? (
                                        <>
                                            Showing{' '}
                                            <span className="font-medium text-ink">{customers.from ?? 0}</span>
                                            {'–'}
                                            <span className="font-medium text-ink">{customers.to ?? 0}</span>{' '}
                                            of {formatNumber(customers.total)} customer
                                            {customers.total !== 1 ? 's' : ''}
                                        </>
                                    ) : (
                                        'No customers'
                                    )}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <SegmentedFilter
                                    label="Filter by status"
                                    value={statusFilter}
                                    onChange={handleStatusChange}
                                    options={[
                                        { value: 'all', label: 'All', count: stats.total_customers },
                                        { value: 'active', label: 'Active', count: stats.active_customers },
                                        { value: 'inactive', label: 'Inactive', count: stats.inactive_customers },
                                    ]}
                                />

                                <form onSubmit={submitSearch} className="relative sm:w-72">
                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-subtle">
                                        <SearchIcon />
                                    </span>
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search name, code, phone, email"
                                        aria-label="Search customers"
                                        className="field-input pl-9"
                                    />
                                </form>
                            </div>
                        </div>

                        {customers.data.length > 0 ? (
                            <>
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[860px] text-left text-small">
                                        <thead className="border-b border-line bg-surface-muted">
                                            <tr>
                                                <th scope="col" className="table-th">Customer</th>
                                                <th scope="col" className="table-th">Code</th>
                                                <th scope="col" className="table-th">Phone</th>
                                                <th scope="col" className="table-th text-right">Points</th>
                                                <th scope="col" className="table-th">Status</th>
                                                <th scope="col" className="table-th text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-line">
                                            {customers.data.map((customer) => (
                                                <tr
                                                    key={customer.id}
                                                    className={`transition-colors duration-base ease-standard hover:bg-canvas/60 ${
                                                        customer.is_active ? '' : 'bg-surface-muted'
                                                    }`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className={`flex items-center gap-3 ${customer.is_active ? '' : 'opacity-70'}`}>
                                                            {renderAvatar(customer)}
                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold text-ink">
                                                                    {customer.first_name} {customer.last_name}
                                                                </p>
                                                                <p className="mt-0.5 max-w-xs truncate text-caption text-ink-muted">
                                                                    {customer.email || 'No email'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="chip">{customer.customer_code}</span>
                                                    </td>
                                                    <td className="px-6 py-4 tabular-nums text-ink-muted">
                                                        {customer.phone_number}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="font-semibold tabular-nums text-ink">
                                                            {formatNumber(customer.points)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <StatusBadge active={customer.is_active} />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {renderActions(customer)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <ul className="divide-y divide-line md:hidden">
                                    {customers.data.map((customer) => (
                                        <li key={customer.id} className="p-5">
                                            <div className="flex items-start gap-3">
                                                {renderAvatar(customer)}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="truncate font-semibold text-ink">
                                                            {customer.first_name} {customer.last_name}
                                                        </p>
                                                        <StatusBadge active={customer.is_active} />
                                                    </div>
                                                    <p className="mt-0.5 truncate text-caption text-ink-muted">
                                                        {customer.email || 'No email'}
                                                    </p>
                                                </div>
                                            </div>
                                            <dl className="mt-4 grid grid-cols-3 gap-3 rounded-control bg-surface-muted p-3 text-caption">
                                                <div className="min-w-0">
                                                    <dt className="text-ink-muted">Code</dt>
                                                    <dd className="mt-0.5 truncate font-medium text-ink">
                                                        {customer.customer_code}
                                                    </dd>
                                                </div>
                                                <div className="min-w-0">
                                                    <dt className="text-ink-muted">Phone</dt>
                                                    <dd className="mt-0.5 break-all font-medium tabular-nums text-ink">
                                                        {customer.phone_number}
                                                    </dd>
                                                </div>
                                                <div className="min-w-0">
                                                    <dt className="text-ink-muted">Points</dt>
                                                    <dd className="mt-0.5 font-semibold tabular-nums text-ink">
                                                        {formatNumber(customer.points)}
                                                    </dd>
                                                </div>
                                            </dl>
                                            <div className="mt-4">{renderActions(customer)}</div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-subtle">
                                    <UsersIcon />
                                </div>
                                <p className="mt-4 font-semibold text-ink">
                                    {hasActiveFilters
                                        ? 'No customers match your filters'
                                        : 'No customers found'}
                                </p>
                                <p className="mt-1 text-small text-ink-muted">
                                    {hasActiveFilters
                                        ? 'Try a different search term or status.'
                                        : 'No registered customers are currently available.'}
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="btn-secondary mt-4"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}

                        {customers.last_page > 1 && (
                            <nav
                                className="flex flex-wrap items-center justify-center gap-1 border-t border-line px-5 py-4 sm:justify-end sm:px-6"
                                aria-label="Customer records pagination"
                            >
                                {customers.links.map((link, index) => {
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
                                            <span
                                                key={`${link.label}-${index}`}
                                                className={className}
                                                aria-disabled="true"
                                            >
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
                </div>
            </div>

            {customerToToggle && (
                <AdminModal
                    title={customerToToggle.is_active ? 'Deactivate customer?' : 'Activate customer?'}
                    description="Review the consequences before confirming."
                    onClose={() => {
                        if (!isTogglingCustomer) setCustomerToToggle(null);
                    }}
                    maxWidthClass="max-w-md"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setCustomerToToggle(null)}
                                disabled={isTogglingCustomer}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmToggleCustomerStatus}
                                disabled={isTogglingCustomer}
                                className={customerToToggle.is_active ? 'btn-danger-solid' : 'btn-primary'}
                            >
                                {isTogglingCustomer
                                    ? 'Updating...'
                                    : customerToToggle.is_active
                                      ? 'Deactivate'
                                      : 'Activate'}
                            </button>
                        </>
                    }
                >
                    <div className="p-6">
                        <p className="text-small text-ink-muted">
                            You are about to{' '}
                            <strong className="text-ink">
                                {customerToToggle.is_active ? 'deactivate' : 'activate'}
                            </strong>{' '}
                            the account for{' '}
                            <strong className="text-ink">
                                {customerToToggle.first_name} {customerToToggle.last_name}
                            </strong>
                            .
                        </p>
                    </div>
                </AdminModal>
            )}

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
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteCustomer}
                                disabled={!deleteAcknowledged || isDeletingCustomer}
                                className="btn-danger-solid"
                            >
                                {isDeletingCustomer ? 'Deleting...' : 'Delete customer permanently'}
                            </button>
                        </>
                    }
                >
                    <div className="space-y-4 p-6">
                        <p className="text-small text-ink-muted">
                            You are about to permanently delete{' '}
                            <strong className="text-ink">
                                {customerToDelete.first_name} {customerToDelete.last_name}
                            </strong>
                            's account and associated records:
                        </p>
                        <ul className="list-disc space-y-1 pl-5 text-small text-ink-muted">
                            <li>Customer profile</li>
                            <li>Purchase transactions and history</li>
                            <li>Point transaction history</li>
                            <li>Reward redemption history</li>
                            <li>Customer QR code</li>
                        </ul>
                        <p className="text-small text-ink-muted">
                            Feedback submissions will be retained, but their association with this customer will be removed.
                        </p>
                        <div role="alert" className="rounded-control border border-danger-600/30 bg-danger-50 p-4">
                            <p className="text-small font-bold text-danger-700">
                                Warning: This action cannot be undone.
                            </p>
                            <p className="mt-1 text-small text-danger-700">
                                Historical monthly and yearly reports and exports may change because this customer's past activity will be removed.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <input
                                id="cashier-confirm-customer-deletion"
                                type="checkbox"
                                checked={deleteAcknowledged}
                                onChange={(event) => setDeleteAcknowledged(event.target.checked)}
                                disabled={isDeletingCustomer}
                                className="field-checkbox mt-1"
                            />
                            <label htmlFor="cashier-confirm-customer-deletion" className="text-small text-ink-muted">
                                I understand that this permanently deletes the customer's associated records and may affect historical reports.
                            </label>
                        </div>
                    </div>
                </AdminModal>
            )}
        </CashierLayout>
    );
}