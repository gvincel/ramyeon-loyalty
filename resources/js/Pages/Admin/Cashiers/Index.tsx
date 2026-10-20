import { Head, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminModal from '@/Components/AdminModal';
import StatusBadge from '@/Components/StatusBadge';
import FlashMessage from '@/Components/FlashMessage';
import StatCard from '@/Components/StatCard';
import SegmentedFilter from '@/Components/SegmentedFilter';
import { PageProps } from '@/types';
import { FormEventHandler, ReactNode, useMemo, useState } from 'react';

type Cashier = {
    id: number;
    name: string;
    username: string;
    email: string | null;
    role: 'cashier';
    is_active: boolean;
    created_at: string;
};

type Props = {
    cashiers: Cashier[];
};

type ModalState = { mode: 'create' } | { mode: 'edit'; cashier: Cashier } | null;
type StatusFilter = 'all' | 'active' | 'inactive';

const initials = (name: string) =>
    name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase();

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
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

const SearchIcon = () => (
    <svg {...iconProps}>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
    </svg>
);

const StatUsersIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
);

const StatUserCheckIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11l2 2 4-4" />
    </svg>
);

const StatUserXIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l5 5m0-5l-5 5" />
    </svg>
);

const UsersIcon = () => (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
);

/* ------------------------------------------------------------------ */
/* Reusable Form Pieces                                                */
/* ------------------------------------------------------------------ */

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

const PasswordField = ({
    id, label, value, onChange, placeholder, error, hint,
}: {
    id: string; label: string; value: string; onChange: (val: string) => void; placeholder: string; error?: string; hint?: string;
}) => {
    const [visible, setVisible] = useState(false);
    return (
        <Field id={id} label={label} error={error} hint={hint}>
            {(a11y) => (
                <div className="relative">
                    <input
                        {...a11y}
                        type={visible ? 'text' : 'password'}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="field-input pr-11"
                        placeholder={placeholder}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-control text-ink-subtle transition-colors hover:text-ink"
                        aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            {visible ? (
                                <>
                                    <path d="M3 3l18 18" />
                                    <path d="M10.58 10.58a2 2 0 1 0 2.84 2.84" />
                                    <path d="M9.88 4.24A10.9 10.9 0 0 1 12 4c5.52 0 9.5 8 9.5 8a18.2 18.2 0 0 1-3.04 4.04" />
                                    <path d="M6.61 6.61A18.6 18.6 0 0 0 2.5 12S6.48 20 12 20c1.72 0 3.27-.66 4.64-1.48" />
                                </>
                            ) : (
                                <>
                                    <path d="M2.5 12S6.48 4 12 4s9.5 8 9.5 8-3.98 8-9.5 8-9.5-8-9.5-8Z" />
                                    <circle cx="12" cy="12" r="2.75" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            )}
        </Field>
    );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Index({ cashiers }: Props) {
    // ✅ Correct hook usage: called at the top of the component
    const { flash } = usePage<PageProps>().props;

    const [modal, setModal] = useState<ModalState>(null);
    const [confirmTarget, setConfirmTarget] = useState<Cashier | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<StatusFilter>('all');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '', username: '', password: '', confirm_password: '',
    });

    const isEditing = modal?.mode === 'edit';

    const counts = useMemo(() => ({
        all: cashiers.length,
        active: cashiers.filter((c) => c.is_active).length,
        inactive: cashiers.filter((c) => !c.is_active).length,
    }), [cashiers]);

    const visibleCashiers = useMemo(() => {
        const term = query.trim().toLowerCase();
        return cashiers.filter((cashier) => {
            if (filter === 'active' && !cashier.is_active) return false;
            if (filter === 'inactive' && cashier.is_active) return false;
            if (!term) return true;
            return cashier.name.toLowerCase().includes(term) || cashier.username.toLowerCase().includes(term);
        });
    }, [cashiers, query, filter]);

    const passwordMismatch = data.confirm_password.length > 0 && data.password !== data.confirm_password;
    const hasActiveFilters = query.trim() !== '' || filter !== 'all';
    const clearFilters = () => { setQuery(''); setFilter('all'); };

    const openCreate = () => { reset(); clearErrors(); setModal({ mode: 'create' }); };
    const openEdit = (cashier: Cashier) => {
        clearErrors();
        setData({ name: cashier.name, username: cashier.username, password: '', confirm_password: '' });
        setModal({ mode: 'edit', cashier });
    };
    const closeModal = () => { if (processing) return; setModal(null); reset(); clearErrors(); };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!modal) return;
        const options = { preserveScroll: true, onSuccess: () => { reset(); setModal(null); } };
        if (modal.mode === 'edit') {
            put(route('admin.cashiers.update', modal.cashier.id), options);
        } else {
            post(route('admin.cashiers.store'), options);
        }
    };

    const confirmToggle = () => {
        if (!confirmTarget) return;
        setTogglingId(confirmTarget.id);
        router.patch(route('admin.cashiers.toggle-status', confirmTarget.id), {}, {
            preserveScroll: true,
            onFinish: () => { setTogglingId(null); setConfirmTarget(null); },
        });
    };

    const statusOptions: [StatusFilter, string, number][] = [
        ['all', 'All', counts.all],
        ['active', 'Active', counts.active],
        ['inactive', 'Inactive', counts.inactive],
    ];

    const renderActions = (cashier: Cashier) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" onClick={() => openEdit(cashier)} className="btn-secondary btn-sm">
                Edit
            </button>
            <button
                type="button"
                disabled={togglingId === cashier.id}
                onClick={() => setConfirmTarget(cashier)}
                className={`btn-sm ${cashier.is_active ? 'btn-ghost-danger' : 'btn-ghost-success'}`}
            >
                {cashier.is_active ? 'Deactivate' : 'Activate'}
            </button>
        </div>
    );

    const renderAvatar = (cashier: Cashier) => (
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-small font-bold ring-1 ${cashier.is_active ? 'bg-brand-50 text-brand-600 ring-brand-100' : 'bg-canvas text-ink-subtle ring-line'}`}>
            {initials(cashier.name)}
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Cashier Management" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content">
                    <AdminPageHeader
                        eyebrow="Account Management"
                        title="Cashiers"
                        description="Create and manage cashier accounts for Ramyeon Corner."
                        action={
                            <button type="button" onClick={openCreate} className="btn-primary">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M12 5v14" /><path d="M5 12h14" />
                                </svg>
                                Add cashier
                            </button>
                        }
                    />

                    <FlashMessage success={flash?.success} error={flash?.error} />

                    <section aria-label="Cashier summary" className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard label="Total Cashiers" value={counts.all.toLocaleString()} icon={<StatUsersIcon />} footer="Registered accounts" />
                        <StatCard label="Active" value={counts.active.toLocaleString()} icon={<StatUserCheckIcon />} footer="Able to log in" />
                        {/* Responsive fix: Spans 2 columns on tablet to fill the space, 1 column on desktop */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <StatCard label="Inactive" value={counts.inactive.toLocaleString()} icon={<StatUserXIcon />} tone="accent" footer="Suspended accounts" />
                        </div>
                    </section>

                    <section className="panel">
                        <div className="panel-header flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="panel-title">Cashier records</h2>
                                <p className="panel-desc">
                                    Showing {visibleCashiers.length} of {cashiers.length} cashier{cashiers.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <SegmentedFilter
                                    label="Filter by status"
                                    value={filter}
                                    onChange={setFilter}
                                    options={[
                                        { value: 'all', label: 'All', count: counts.all },
                                        { value: 'active', label: 'Active', count: counts.active },
                                        { value: 'inactive', label: 'Inactive', count: counts.inactive },
                                    ]}
                                />

                                <div className="relative sm:w-72">
                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-subtle">
                                        <SearchIcon />
                                    </span>
                                    <input
                                        type="search"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search name or username"
                                        aria-label="Search cashiers"
                                        className="field-input pl-9"
                                    />
                                </div>
                            </div>
                        </div>

                        {visibleCashiers.length > 0 ? (
                            <>
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[860px] text-left text-small">
                                        <thead className="border-b border-line bg-surface-muted">
                                            <tr>
                                                <th scope="col" className="table-th">Cashier</th>
                                                <th scope="col" className="table-th">Username</th>
                                                <th scope="col" className="table-th">Status</th>
                                                <th scope="col" className="table-th text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-line">
                                            {visibleCashiers.map((cashier) => (
                                                <tr key={cashier.id} className={`transition-colors duration-base ease-standard hover:bg-canvas/60 ${cashier.is_active ? '' : 'bg-surface-muted'}`}>
                                                    <td className="px-6 py-4">
                                                        <div className={`flex items-center gap-3 ${cashier.is_active ? '' : 'opacity-70'}`}>
                                                            {renderAvatar(cashier)}
                                                            <div className="min-w-0">
                                                                <p className="truncate font-semibold text-ink">{cashier.name}</p>
                                                                <p className="mt-0.5 max-w-xs truncate text-caption text-ink-muted">Added {formatDate(cashier.created_at)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-ink-muted">@{cashier.username}</td>
                                                    <td className="px-6 py-4"><StatusBadge active={cashier.is_active} /></td>
                                                    <td className="px-6 py-4">{renderActions(cashier)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <ul className="divide-y divide-line md:hidden">
                                    {visibleCashiers.map((cashier) => (
                                        <li key={cashier.id} className="p-5">
                                            <div className="flex items-start gap-3">
                                                {renderAvatar(cashier)}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="truncate font-semibold text-ink">{cashier.name}</p>
                                                        <StatusBadge active={cashier.is_active} />
                                                    </div>
                                                    <p className="mt-0.5 truncate text-caption text-ink-muted">@{cashier.username}</p>
                                                </div>
                                            </div>
                                            <dl className="mt-4 grid grid-cols-2 gap-3 rounded-control bg-surface-muted p-3 text-caption">
                                                <div className="min-w-0">
                                                    <dt className="text-ink-muted">Date Added</dt>
                                                    <dd className="mt-0.5 truncate font-medium text-ink">{formatDate(cashier.created_at)}</dd>
                                                </div>
                                                <div className="min-w-0">
                                                    <dt className="text-ink-muted">Role</dt>
                                                    <dd className="mt-0.5 truncate font-medium text-ink capitalize">{cashier.role}</dd>
                                                </div>
                                            </dl>
                                            <div className="mt-4">{renderActions(cashier)}</div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-subtle">
                                    <UsersIcon />
                                </div>
                                <p className="mt-4 font-semibold text-ink">{hasActiveFilters ? 'No cashiers match your filters' : 'No cashiers found'}</p>
                                <p className="mt-1 text-small text-ink-muted">
                                    {hasActiveFilters ? 'Try a different search term or status.' : 'Add a cashier so your staff can log in to the POS.'}
                                </p>
                                {hasActiveFilters ? (
                                    <button type="button" onClick={clearFilters} className="btn-secondary mt-4">Clear filters</button>
                                ) : (
                                    <button type="button" onClick={openCreate} className="btn-primary mt-4">Add cashier</button>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {modal && (
                <AdminModal
                    title={isEditing ? 'Edit cashier' : 'Add cashier'}
                    description={isEditing ? `Update account details for ${modal.cashier.name}.` : 'Create an account that staff can use to log in.'}
                    onClose={closeModal}
                    maxWidthClass="max-w-2xl"
                    footer={
                        <>
                            <button type="button" onClick={closeModal} disabled={processing} className="btn-secondary">Cancel</button>
                            <button type="submit" form="cashier-form" disabled={processing || (!isEditing && passwordMismatch)} className="btn-primary">
                                {isEditing ? (processing ? 'Saving...' : 'Save changes') : (processing ? 'Creating...' : 'Create cashier')}
                            </button>
                        </>
                    }
                >
                    <form id="cashier-form" onSubmit={submit} className="grid gap-5 p-6 sm:grid-cols-2">
                        <Field id="cashier_name" label="Full name" error={errors.name}>
                            {(a11y) => <input {...a11y} type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="field-input" placeholder="Juan Dela Cruz" autoFocus />}
                        </Field>
                        <Field id="cashier_username" label="Username" error={errors.username}>
                            {(a11y) => <input {...a11y} type="text" value={data.username} onChange={(e) => setData('username', e.target.value)} className="field-input" placeholder="juan123" autoCapitalize="none" autoComplete="off" />}
                        </Field>
                        {!isEditing && (
                            <>
                                <PasswordField id="cashier_password" label="Password" value={data.password} onChange={(v) => setData('password', v)} placeholder="At least 8 characters" error={errors.password} />
                                <PasswordField id="cashier_confirm_password" label="Confirm password" value={data.confirm_password} onChange={(v) => setData('confirm_password', v)} placeholder="Re-enter password" error={errors.confirm_password ?? (passwordMismatch ? 'Passwords do not match.' : undefined)} />
                            </>
                        )}
                    </form>
                </AdminModal>
            )}

            {/* Toggle Status Confirmation */}
            {confirmTarget && (
                <AdminModal
                    title={confirmTarget.is_active ? `Deactivate ${confirmTarget.name}?` : `Activate ${confirmTarget.name}?`}
                    description={confirmTarget.is_active ? 'They will no longer be able to log in.' : 'They will be able to log in again.'}
                    onClose={() => { if (togglingId === null) setConfirmTarget(null); }}
                    maxWidthClass="max-w-md"
                    footer={
                        <>
                            <button type="button" onClick={() => setConfirmTarget(null)} disabled={togglingId !== null} className="btn-secondary">Cancel</button>
                            <button type="button" onClick={confirmToggle} disabled={togglingId !== null} className={confirmTarget.is_active ? 'btn-danger-solid' : 'btn-primary'}>
                                {confirmTarget.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                        </>
                    }
                >
                    <div className="p-6 text-small text-ink-muted">
                        <span className="font-semibold text-ink">@{confirmTarget.username}</span> is currently {confirmTarget.is_active ? 'active' : 'inactive'}.
                    </div>
                </AdminModal>
            )}
        </AdminLayout>
    );
}