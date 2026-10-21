import { Head, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminModal from '@/Components/AdminModal';
import StatusBadge from '@/Components/StatusBadge';
import FlashMessage from '@/Components/FlashMessage';
import StatCard from '@/Components/StatCard';
import SegmentedFilter from '@/Components/SegmentedFilter';
import { PageProps } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { type ReactNode, useMemo, useState } from 'react';

interface CustomerQrCode {
    id: number;
    qr_token: string;
    is_active: boolean;
    created_at: string;
    revoked_at: string | null;
}

interface Customer {
    id: number;
    customer_code: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string | null;
    points: number;
    is_active: boolean;
    qr_code: CustomerQrCode | null;
}

interface Props {
    customers: Customer[];
}

type StatusFilter = 'all' | 'active' | 'inactive';

const formatNumber = (value: number | string) =>
    Number(value).toLocaleString('en-PH');

/* ------------------------------------------------------------------ */
/* Small icons                                                         */
/* ------------------------------------------------------------------ */

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

const QrIcon = () => (
    <svg {...iconProps}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
    </svg>
);

const EditIcon = () => (
    <svg {...iconProps}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
);

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

interface FieldA11y {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby': string | undefined;
}

const Field = ({
    id,
    label,
    optional = false,
    hint,
    error,
    children,
}: {
    id: string;
    label: string;
    optional?: boolean;
    hint?: string;
    error?: string;
    children: (a11y: FieldA11y) => ReactNode;
}) => {
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

    return (
        <div>
            <label htmlFor={id} className="field-label">
                {label}
                {optional && <span className="ml-1 font-normal text-ink-subtle">(optional)</span>}
            </label>
            {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
            {hint && <p id={hintId} className="mt-1 text-caption text-ink-muted">{hint}</p>}
            {error && <p id={errorId} className="field-error">{error}</p>}
        </div>
    );
};

export default function Index({ customers }: Props) {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);
    const [deleteAcknowledged, setDeleteAcknowledged] = useState(false);

    const [customerToToggle, setCustomerToToggle] = useState<Customer | null>(null);
    const [isTogglingCustomer, setIsTogglingCustomer] = useState(false);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const { flash } = usePage<PageProps>().props;

    const activeCustomerCount = customers.filter((c) => c.is_active).length;
    const inactiveCustomerCount = customers.length - activeCustomerCount;

    const totalCustomerPoints = customers.reduce((total, customer) => total + Number(customer.points), 0);

    const filteredCustomers = useMemo(() => {
        const term = search.trim().toLowerCase();
        return customers.filter((customer) => {
            if (statusFilter === 'active' && !customer.is_active) return false;
            if (statusFilter === 'inactive' && customer.is_active) return false;
            if (!term) return true;

            return [
                `${customer.first_name} ${customer.last_name}`,
                customer.customer_code,
                customer.phone_number,
                customer.email ?? '',
            ].some((value) => value.toLowerCase().includes(term));
        });
    }, [customers, search, statusFilter]);

    const hasActiveFilters = search.trim() !== '' || statusFilter !== 'all';
    const clearFilters = () => { setSearch(''); setStatusFilter('all'); };

    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
    });

    const openEditModal = (customer: Customer) => {
        setEditCustomer(customer);
        setData({
            first_name: customer.first_name,
            last_name: customer.last_name,
            phone_number: customer.phone_number,
            email: customer.email ?? '',
        });
        clearErrors();
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        if (processing) return;
        reset();
        clearErrors();
        setShowEditModal(false);
        setEditCustomer(null);
    };

    const closeQrModal = () => setSelectedCustomer(null);

    const requestToggleCustomerStatus = (customer: Customer) => setCustomerToToggle(customer);

    const confirmToggleCustomerStatus = () => {
        if (!customerToToggle || isTogglingCustomer) return;

        router.patch(`/admin/customers/${customerToToggle.id}/status`, {}, {
            preserveScroll: true,
            onStart: () => setIsTogglingCustomer(true),
            onSuccess: () => setCustomerToToggle(null),
            onFinish: () => setIsTogglingCustomer(false),
        });
    };

    const deleteCustomer = (customer: Customer) => {
        setDeleteAcknowledged(false);
        setCustomerToDelete(customer);
    };

    const confirmDeleteCustomer = () => {
        if (!customerToDelete || !deleteAcknowledged || isDeletingCustomer) return;

        router.delete(`/admin/customers/${customerToDelete.id}`, {
            preserveScroll: true,
            onStart: () => setIsDeletingCustomer(true),
            onSuccess: () => {
                setCustomerToDelete(null);
                setDeleteAcknowledged(false);
            },
            onFinish: () => setIsDeletingCustomer(false),
        });
    };

    const canViewQr = (customer: Customer) => Boolean(customer.qr_code && customer.qr_code.is_active);

    const renderActions = (customer: Customer) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <button
                type="button"
                onClick={() => setSelectedCustomer(customer)}
                disabled={!canViewQr(customer)}
                title={canViewQr(customer) ? undefined : 'No active QR code'}
                className="btn-soft btn-sm"
            >
                <QrIcon />
                View QR
            </button>

            <button type="button" onClick={() => openEditModal(customer)} className="btn-secondary btn-sm">
                <EditIcon />
                Edit
            </button>

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

    const statusOptions: [StatusFilter, string, number][] = [
        ['all', 'All', customers.length],
        ['active', 'Active', activeCustomerCount],
        ['inactive', 'Inactive', inactiveCustomerCount],
    ];

    return (
        <AdminLayout>
            <Head title="Customer Management" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content">
                    <AdminPageHeader
                        eyebrow="Customer Management"
                        title="Customers"
                        description="View and manage registered loyalty customers and their account status."
                        action={
                            <div className="rounded-control border border-line bg-surface px-4 py-3 shadow-card">
                                <p className="text-caption font-medium uppercase tracking-wider text-ink-subtle">Records</p>
                                <p className="mt-1 text-small font-semibold text-ink">{customers.length.toLocaleString('en-PH')}</p>
                            </div>
                        }
                    />

                    <FlashMessage success={flash.success} error={flash.error} />

                    <section aria-label="Customer summary" className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard
                            label="Total Customers"
                            value={formatNumber(customers.length)}
                            icon={<StatUsersIcon />}
                            footer="Registered loyalty accounts"
                        />
                        <StatCard
                            label="Active Customers"
                            value={formatNumber(activeCustomerCount)}
                            icon={<StatUserCheckIcon />}
                            footer={
                                <>
                                    <span className="font-semibold text-ink">{formatNumber(inactiveCustomerCount)}</span> inactive
                                </>
                            }
                        />
                        {/* Responsive fix: Spans 2 columns on tablet to fill the space, 1 column on desktop */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <StatCard
                                label="Total Points"
                                value={formatNumber(totalCustomerPoints)}
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
                                    Showing {formatNumber(filteredCustomers.length)} of {formatNumber(customers.length)} customer{customers.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <SegmentedFilter
                                    label="Filter by status"
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    options={[
                                        { value: 'all', label: 'All', count: customers.length },
                                        { value: 'active', label: 'Active', count: activeCustomerCount },
                                        { value: 'inactive', label: 'Inactive', count: inactiveCustomerCount },
                                    ]}
                                />

                                <div className="relative sm:w-72">
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
                                </div>
                            </div>
                        </div>

                        {filteredCustomers.length > 0 ? (
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
                                            {filteredCustomers.map((customer) => (
                                                <tr key={customer.id} className={`transition-colors duration-base ease-standard hover:bg-canvas/60 ${customer.is_active ? '' : 'bg-surface-muted'}`}>
                                                    <td className="px-6 py-4">
                                                        <div className={`flex items-center gap-3 ${customer.is_active ? '' : 'opacity-70'}`}>
                                                            {renderAvatar(customer)}
                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold text-ink">{customer.first_name} {customer.last_name}</p>
                                                                <p className="mt-0.5 max-w-xs truncate text-caption text-ink-muted">{customer.email || 'No email'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4"><span className="chip">{customer.customer_code}</span></td>
                                                    <td className="px-6 py-4 tabular-nums text-ink-muted">{customer.phone_number}</td>
                                                    <td className="px-6 py-4 text-right"><span className="font-semibold tabular-nums text-ink">{formatNumber(customer.points)}</span></td>
                                                    <td className="px-6 py-4"><StatusBadge active={customer.is_active} /></td>
                                                    <td className="px-6 py-4">{renderActions(customer)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <ul className="divide-y divide-line md:hidden">
                                    {filteredCustomers.map((customer) => (
                                        <li key={customer.id} className="p-5">
                                            <div className="flex items-start gap-3">
                                                {renderAvatar(customer)}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="truncate font-semibold text-ink">{customer.first_name} {customer.last_name}</p>
                                                        <StatusBadge active={customer.is_active} />
                                                    </div>
                                                    <p className="mt-0.5 truncate text-caption text-ink-muted">{customer.email || 'No email'}</p>
                                                </div>
                                            </div>
                                            <dl className="mt-4 grid grid-cols-3 gap-3 rounded-control bg-surface-muted p-3 text-caption">
                                                <div className="min-w-0">
                                                    <dt className="text-ink-muted">Code</dt>
                                                    <dd className="mt-0.5 truncate font-medium text-ink">{customer.customer_code}</dd>
                                                </div>
                                                <div className="min-w-0">
                                                    <dt className="text-ink-muted">Phone</dt>
                                                    <dd className="mt-0.5 break-all font-medium tabular-nums text-ink">{customer.phone_number}</dd>
                                                </div>
                                                <div className="min-w-0">
                                                    <dt className="text-ink-muted">Points</dt>
                                                    <dd className="mt-0.5 font-semibold tabular-nums text-ink">{formatNumber(customer.points)}</dd>
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
                                <p className="mt-4 font-semibold text-ink">{hasActiveFilters ? 'No customers match your filters' : 'No customers found'}</p>
                                <p className="mt-1 text-small text-ink-muted">
                                    {hasActiveFilters ? 'Try a different search term or status.' : 'No registered customers are currently available.'}
                                </p>
                                {hasActiveFilters && (
                                    <button type="button" onClick={clearFilters} className="btn-secondary mt-4">
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Edit Customer Modal */}
            {showEditModal && (
                <AdminModal
                    title="Edit Customer"
                    description="Update the customer's account information."
                    onClose={closeEditModal}
                    maxWidthClass="max-w-lg"
                    footer={
                        <>
                            <button type="button" onClick={closeEditModal} disabled={processing} className="btn-secondary">Cancel</button>
                            <button type="submit" form="edit-customer-form" disabled={processing} className="btn-primary">
                                {processing ? 'Saving...' : 'Save changes'}
                            </button>
                        </>
                    }
                >
                    <form
                        id="edit-customer-form"
                        onSubmit={(event) => {
                            event.preventDefault();
                            if (!editCustomer) return;
                            put(`/admin/customers/${editCustomer.id}`, {
                                onSuccess: () => { reset(); clearErrors(); setShowEditModal(false); setEditCustomer(null); },
                            });
                        }}
                        className="space-y-5 p-6"
                    >
                        {editCustomer && (
                            <div className="flex items-center gap-3 rounded-control bg-surface-muted p-3">
                                {renderAvatar(editCustomer)}
                                <div className="min-w-0">
                                    <p className="truncate text-small font-semibold text-ink">{editCustomer.customer_code}</p>
                                    <p className="text-caption text-ink-muted">{formatNumber(editCustomer.points)} points</p>
                                </div>
                            </div>
                        )}
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field id="edit_first_name" label="First name" error={errors.first_name}>
                                {(a11y) => (
                                    <input {...a11y} type="text" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} className="field-input" placeholder="Enter first name" />
                                )}
                            </Field>
                            <Field id="edit_last_name" label="Last name" error={errors.last_name}>
                                {(a11y) => (
                                    <input {...a11y} type="text" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} className="field-input" placeholder="Enter last name" />
                                )}
                            </Field>
                        </div>
                        <Field id="edit_phone_number" label="Phone number" hint="Must contain 11 digits and start with 09." error={errors.phone_number}>
                            {(a11y) => (
                                <input {...a11y} type="text" inputMode="numeric" maxLength={11} value={data.phone_number} onChange={(e) => setData('phone_number', e.target.value.replace(/\D/g, ''))} className="field-input" placeholder="09XXXXXXXXX" />
                            )}
                        </Field>
                        <Field id="edit_email" label="Email" optional error={errors.email}>
                            {(a11y) => (
                                <input {...a11y} type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="field-input" placeholder="example@email.com" />
                            )}
                        </Field>
                    </form>
                </AdminModal>
            )}

            {/* QR Code Modal */}
            {selectedCustomer && selectedCustomer.qr_code && (
                <AdminModal
                    title="Customer QR Code"
                    description="Scan this QR code during a transaction."
                    onClose={closeQrModal}
                    maxWidthClass="max-w-sm"
                    footer={<button type="button" onClick={closeQrModal} className="btn-primary w-full">Close</button>}
                >
                    <div className="flex flex-col items-center px-6 py-6">
                        <div className="rounded-card border border-line bg-white p-4 shadow-card">
                            <QRCodeSVG value={selectedCustomer.qr_code.qr_token} size={240} level="H" />
                        </div>
                        <h3 className="mt-5 text-heading font-semibold text-ink">{selectedCustomer.first_name} {selectedCustomer.last_name}</h3>
                        <span className="chip mt-2">{selectedCustomer.customer_code}</span>
                        <p className="mt-4 rounded-control bg-brand-50 px-3 py-2 text-center text-caption text-brand-700">
                            Keep this QR code private. It identifies the customer's loyalty account.
                        </p>
                    </div>
                </AdminModal>
            )}

            {/* Toggle Status Modal */}
            {customerToToggle && (
                <AdminModal
                    title={customerToToggle.is_active ? "Deactivate customer?" : "Activate customer?"}
                    description="Review the consequences before confirming."
                    onClose={() => { if (!isTogglingCustomer) setCustomerToToggle(null); }}
                    maxWidthClass="max-w-md"
                    footer={
                        <>
                            <button type="button" onClick={() => setCustomerToToggle(null)} disabled={isTogglingCustomer} className="btn-secondary">Cancel</button>
                            <button type="button" onClick={confirmToggleCustomerStatus} disabled={isTogglingCustomer} className={customerToToggle.is_active ? 'btn-danger-solid' : 'btn-primary'}>
                                {isTogglingCustomer ? 'Updating...' : customerToToggle.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                        </>
                    }
                >
                    <div className="p-6">
                        <p className="text-small text-ink-muted">
                            You are about to <strong className="text-ink">{customerToToggle.is_active ? 'deactivate' : 'activate'}</strong> the account for <strong className="text-ink">{customerToToggle.first_name} {customerToToggle.last_name}</strong>.
                        </p>
                        {customerToToggle.is_active && (
                            <p className="mt-3 text-small text-ink-muted">
                                Deactivated customers will not be able to earn or redeem points until reactivated.
                            </p>
                        )}
                    </div>
                </AdminModal>
            )}

            {/* Delete Customer Modal */}
            {customerToDelete && (
                <AdminModal
                    title="Permanently delete customer?"
                    description="Review the consequences before confirming."
                    onClose={() => { if (!isDeletingCustomer) { setCustomerToDelete(null); setDeleteAcknowledged(false); } }}
                    maxWidthClass="max-w-lg"
                    titleId="delete-customer-modal-title"
                    footer={
                        <>
                            <button type="button" onClick={() => { setCustomerToDelete(null); setDeleteAcknowledged(false); }} disabled={isDeletingCustomer} className="btn-secondary">Cancel</button>
                            <button type="button" onClick={confirmDeleteCustomer} disabled={!deleteAcknowledged || isDeletingCustomer} className="btn-danger-solid">
                                {isDeletingCustomer ? 'Deleting...' : 'Delete customer permanently'}
                            </button>
                        </>
                    }
                >
                    <div className="space-y-4 p-6">
                        <p className="text-small text-ink-muted">
                            You are about to permanently delete <strong className="text-ink">{customerToDelete.first_name} {customerToDelete.last_name}</strong>'s account and associated records:
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
                            <p className="text-small font-bold text-danger-700">Warning: This action cannot be undone.</p>
                            <p className="mt-1 text-small text-danger-700">
                                Historical monthly and yearly reports and exports may change because this customer's past activity will be removed.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <input
                                id="confirm-customer-deletion"
                                type="checkbox"
                                checked={deleteAcknowledged}
                                onChange={(e) => setDeleteAcknowledged(e.target.checked)}
                                disabled={isDeletingCustomer}
                                className="field-checkbox mt-1"
                            />
                            <label htmlFor="confirm-customer-deletion" className="text-small text-ink-muted">
                                I understand that this permanently deletes the customer's associated records and may affect historical reports.
                            </label>
                        </div>
                    </div>
                </AdminModal>
            )}
        </AdminLayout>
    );
}