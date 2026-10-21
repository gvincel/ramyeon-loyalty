import AdminModal from '@/Components/AdminModal';
import AdminPageHeader from '@/Components/AdminPageHeader';
import FlashMessage from '@/Components/FlashMessage';
import StatusBadge from '@/Components/StatusBadge';
import StatCard from '@/Components/StatCard';
import AdminLayout from '@/Layouts/AdminLayout';
import SegmentedFilter from '@/Components/SegmentedFilter';
import { PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, ReactNode, useMemo, useState } from 'react';

interface Reward {
    id: number;
    reward_name: string;
    reward_type: 'discount' | 'free_item';
    points_required: number;
    reward_value: string | null;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
    redemption_limit: number | null;
}

interface Props {
    rewards: Reward[];
}

type ModalState = { mode: 'create' } | { mode: 'edit'; reward: Reward } | null;
type StatusFilter = 'all' | 'active' | 'inactive';

const peso = (value: string | number) =>
    Number(value).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });

const parseDate = (value: string | null) => {
    if (!value) return null;
    const [y, m, d] = value.slice(0, 10).split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
};

const shortDate = (date: Date, withYear = true) =>
    date.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        ...(withYear ? { year: 'numeric' } : {}),
    });

const startOfToday = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

function schedule(reward: Reward): { text: string; tone: 'muted' | 'warn' } {
    const start = parseDate(reward.start_date);
    const end = parseDate(reward.end_date);
    const today = startOfToday();

    if (end && end < today) return { text: `Ended ${shortDate(end)}`, tone: 'warn' };
    if (start && start > today) return { text: end ? `Starts ${shortDate(start, false)}, ends ${shortDate(end)}` : `Starts ${shortDate(start)}`, tone: 'muted' };
    if (end) return { text: `Until ${shortDate(end)}`, tone: 'muted' };
    if (start) return { text: `Since ${shortDate(start)}`, tone: 'muted' };
    return { text: 'No end date', tone: 'muted' };
}

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

const GiftIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7M2 7h20v5H2zM12 7v14M12 7H8.5a2.5 2.5 0 115-1c0 1.5-1.5 1-1.5 1zM12 7h3.5a2.5 2.5 0 10-5-1c0 1.5 1 1 1.5 1z" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const XCircleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
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

function FormSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <fieldset className="border-t border-line pt-5 first:border-t-0 first:pt-0">
            <legend className="mb-4 text-small font-semibold text-ink">{title}</legend>
            <div className="grid gap-5 sm:grid-cols-2">{children}</div>
        </fieldset>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Index({ rewards }: Props) {
    const { flash } = usePage<PageProps>().props;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        reward_name: '',
        reward_type: 'discount' as 'discount' | 'free_item',
        points_required: '',
        reward_value: '',
        description: '',
        start_date: '',
        end_date: '',
        is_active: true,
        redemption_limit: '',
    });

    const [modal, setModal] = useState<ModalState>(null);
    const [confirmTarget, setConfirmTarget] = useState<Reward | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<StatusFilter>('all');

    const isEditing = modal?.mode === 'edit';
    const isDiscount = data.reward_type === 'discount';
    const datesInvalid = !!data.start_date && !!data.end_date && data.end_date < data.start_date;

    const counts = useMemo(() => ({
        all: rewards.length,
        active: rewards.filter((r) => r.is_active).length,
        inactive: rewards.filter((r) => !r.is_active).length,
    }), [rewards]);

    const visibleRewards = useMemo(() => {
        const term = query.trim().toLowerCase();
        return rewards.filter((reward) => {
            if (filter === 'active' && !reward.is_active) return false;
            if (filter === 'inactive' && reward.is_active) return false;
            if (!term) return true;
            return reward.reward_name.toLowerCase().includes(term) || (reward.description ?? '').toLowerCase().includes(term);
        });
    }, [rewards, query, filter]);

    const hasActiveFilters = query.trim() !== '' || filter !== 'all';
    const clearFilters = () => { setQuery(''); setFilter('all'); };

    const openCreateForm = () => { reset(); clearErrors(); setModal({ mode: 'create' }); };
    const openEditForm = (reward: Reward) => {
        clearErrors();
        setData({
            reward_name: reward.reward_name,
            reward_type: reward.reward_type,
            points_required: String(reward.points_required),
            reward_value: reward.reward_value ?? '',
            description: reward.description ?? '',
            start_date: reward.start_date ?? '',
            end_date: reward.end_date ?? '',
            is_active: reward.is_active,
            redemption_limit: reward.redemption_limit ? String(reward.redemption_limit) : '',
        });
        setModal({ mode: 'edit', reward });
    };
    const closeForm = () => { if (processing) return; setModal(null); reset(); clearErrors(); };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (!modal || datesInvalid) return;
        const options = { preserveScroll: true, onSuccess: () => { reset(); setModal(null); } };
        if (modal.mode === 'edit') put(`/admin/rewards/${modal.reward.id}`, options);
        else post('/admin/rewards', options);
    };

    const confirmToggle = () => {
        if (!confirmTarget) return;
        setTogglingId(confirmTarget.id);
        router.patch(`/admin/rewards/${confirmTarget.id}/toggle-status`, {}, {
            preserveScroll: true,
            onFinish: () => { setTogglingId(null); setConfirmTarget(null); },
        });
    };

    const statusOptions: [StatusFilter, string, number][] = [
        ['all', 'All', counts.all],
        ['active', 'Active', counts.active],
        ['inactive', 'Inactive', counts.inactive],
    ];

    const renderActions = (reward: Reward) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <button type="button" onClick={() => openEditForm(reward)} className="btn-secondary btn-sm">
                Edit
            </button>
            <button
                type="button"
                disabled={togglingId === reward.id}
                onClick={() => setConfirmTarget(reward)}
                className={`btn-sm ${reward.is_active ? 'btn-ghost-danger' : 'btn-ghost-success'}`}
            >
                {reward.is_active ? 'Deactivate' : 'Activate'}
            </button>
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Rewards" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content">
                    <AdminPageHeader
                        eyebrow="Reward Management"
                        title="Rewards"
                        description="Create and manage loyalty rewards for Ramyeon Corner customers."
                        action={
                            <button type="button" onClick={openCreateForm} className="btn-primary">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M12 5v14" /><path d="M5 12h14" />
                                </svg>
                                Create reward
                            </button>
                        }
                    />

                    <FlashMessage success={flash.success} error={flash.error} />

                    <section aria-label="Reward summary" className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard label="Total Rewards" value={counts.all.toLocaleString()} icon={<GiftIcon />} footer="All available rewards" />
                        <StatCard label="Active Rewards" value={counts.active.toLocaleString()} icon={<CheckCircleIcon />} footer="Visible to customers" />
                        <div className="sm:col-span-2 lg:col-span-1">
                            <StatCard label="Inactive Rewards" value={counts.inactive.toLocaleString()} icon={<XCircleIcon />} tone="accent" footer="Hidden from customers" />
                        </div>
                    </section>

                    <section className="panel">
                        <div className="panel-header flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="panel-title">Reward records</h2>
                                <p className="panel-desc">
                                    Showing {visibleRewards.length} of {rewards.length} reward{rewards.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
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
                                        placeholder="Search rewards"
                                        aria-label="Search rewards"
                                        className="field-input pl-9"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fades in whenever the filter changes */}
                        <div key={filter} className="motion-safe:animate-fade-in">
                            {visibleRewards.length > 0 ? (
                                <>
                                    <div className="hidden overflow-x-auto md:block">
                                        <table className="w-full min-w-[860px] text-left text-small">
                                            <thead className="border-b border-line bg-surface-muted">
                                                <tr>
                                                    <th scope="col" className="table-th">Reward</th>
                                                    <th scope="col" className="table-th">Cost</th>
                                                    <th scope="col" className="table-th">Type</th>
                                                    <th scope="col" className="table-th">Limit</th>
                                                    <th scope="col" className="table-th">Status</th>
                                                    <th scope="col" className="table-th text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-line">
                                                {visibleRewards.map((reward) => {
                                                    const when = schedule(reward);
                                                    return (
                                                        <tr key={reward.id} className={`transition-colors duration-base ease-standard hover:bg-canvas/60 ${reward.is_active ? '' : 'bg-surface-muted'}`}>
                                                            <td className="px-6 py-4">
                                                                <div className="min-w-0">
                                                                    <p className={`truncate font-semibold ${reward.is_active ? 'text-ink' : 'text-ink-muted'}`}>{reward.reward_name}</p>
                                                                    {reward.description && <p className="mt-0.5 max-w-xs truncate text-caption text-ink-muted">{reward.description}</p>}
                                                                    <p className={`mt-1 text-caption ${when.tone === 'warn' ? 'font-medium text-warning-700' : 'text-ink-subtle'}`}>{when.text}</p>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="font-semibold tabular-nums text-ink">{reward.points_required.toLocaleString('en-PH')}</span>
                                                                <span className="ml-1 text-caption text-ink-muted">pts</span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-ink">{reward.reward_type === 'discount' ? 'Discount' : 'Free item'}</p>
                                                                {reward.reward_value && <p className="mt-0.5 text-caption text-ink-muted">{reward.reward_type === 'discount' ? `${peso(reward.reward_value)} off` : `${peso(reward.reward_value)} value`}</p>}
                                                            </td>
                                                            <td className="px-6 py-4 text-ink-muted">{reward.redemption_limit ? `${reward.redemption_limit}× per customer` : 'Unlimited'}</td>
                                                            <td className="px-6 py-4"><StatusBadge active={reward.is_active} /></td>
                                                            <td className="px-6 py-4">{renderActions(reward)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <ul className="divide-y divide-line md:hidden">
                                        {visibleRewards.map((reward) => {
                                            const when = schedule(reward);
                                            return (
                                                <li key={reward.id} className="p-5">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-ink">{reward.reward_name}</p>
                                                            <p className={`mt-1 text-caption ${when.tone === 'warn' ? 'font-medium text-warning-700' : 'text-ink-subtle'}`}>{when.text}</p>
                                                        </div>
                                                        <StatusBadge active={reward.is_active} />
                                                    </div>
                                                    <dl className="mt-4 grid grid-cols-2 gap-3 rounded-control bg-surface-muted p-3 text-caption">
                                                        <div className="min-w-0">
                                                            <dt className="text-ink-muted">Cost</dt>
                                                            <dd className="mt-0.5 font-semibold text-ink">{reward.points_required.toLocaleString()} pts</dd>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <dt className="text-ink-muted">Limit</dt>
                                                            <dd className="mt-0.5 truncate text-ink">{reward.redemption_limit ? `${reward.redemption_limit}×` : 'Unlimited'}</dd>
                                                        </div>
                                                    </dl>
                                                    <div className="mt-4">{renderActions(reward)}</div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </>
                            ) : (
                                <div className="px-6 py-16 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-subtle">
                                        <GiftIcon />
                                    </div>
                                    <p className="mt-4 font-semibold text-ink">{hasActiveFilters ? 'No rewards match your filters' : 'No rewards found'}</p>
                                    <p className="mt-1 text-small text-ink-muted">
                                        {hasActiveFilters ? 'Try a different search term or status.' : 'Create a reward that customers can redeem with their points.'}
                                    </p>
                                    {hasActiveFilters ? (
                                        <button type="button" onClick={clearFilters} className="btn-secondary mt-4">Clear filters</button>
                                    ) : (
                                        <button type="button" onClick={openCreateForm} className="btn-primary mt-4">Create reward</button>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {modal && (
                <AdminModal
                    title={isEditing ? 'Edit reward' : 'Create reward'}
                    description={isEditing ? 'Update the details of this loyalty reward.' : 'Add a new reward for customers to redeem with points.'}
                    onClose={closeForm}
                    maxWidthClass="max-w-2xl"
                    footer={
                        <>
                            <button type="button" onClick={closeForm} disabled={processing} className="btn-secondary">Cancel</button>
                            <button type="submit" form="reward-form" disabled={processing || datesInvalid} className="btn-primary">
                                {isEditing ? (processing ? 'Saving...' : 'Save changes') : (processing ? 'Creating...' : 'Create reward')}
                            </button>
                        </>
                    }
                >
                    <form id="reward-form" onSubmit={submit}>
                        <div className="space-y-5 p-6">
                            <FormSection title="Reward details">
                                <div className="sm:col-span-2">
                                    <Field id="reward_name" label="Name" error={errors.reward_name}>
                                        {(a11y) => <input {...a11y} type="text" value={data.reward_name} onChange={(e) => setData('reward_name', e.target.value)} placeholder="₱50 off coupon" className="field-input" autoFocus />}
                                    </Field>
                                </div>
                                <div className="sm:col-span-2">
                                    <Field id="description" label="Description" optional error={errors.description}>
                                        {(a11y) => <textarea {...a11y} rows={2} value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="What does the customer get?" className="field-input resize-none" />}
                                    </Field>
                                </div>
                            </FormSection>

                            <FormSection title="Cost and value">
                                <Field id="reward_type" label="Reward type" error={errors.reward_type}>
                                    {(a11y) => (
                                        <select {...a11y} value={data.reward_type} onChange={(e) => setData('reward_type', e.target.value as 'discount' | 'free_item')} className="field-input">
                                            <option value="discount">Discount</option>
                                            <option value="free_item">Free item</option>
                                        </select>
                                    )}
                                </Field>
                                <Field id="points_required" label="Points required" error={errors.points_required}>
                                    {(a11y) => <input {...a11y} type="number" inputMode="numeric" min="1" value={data.points_required} onChange={(e) => setData('points_required', e.target.value)} placeholder="200" className="field-input" />}
                                </Field>
                                <Field id="reward_value" label={isDiscount ? 'Discount amount' : 'Item value'} optional={!isDiscount} error={errors.reward_value} hint={isDiscount ? 'Amount taken off the order.' : 'Retail value of the free item.'}>
                                    {(a11y) => (
                                        <div className="relative">
                                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-small text-ink-muted">₱</span>
                                            <input {...a11y} type="number" inputMode="decimal" min="0" step="0.01" value={data.reward_value} onChange={(e) => setData('reward_value', e.target.value)} placeholder="50.00" className="field-input pl-8" />
                                        </div>
                                    )}
                                </Field>
                                <Field id="redemption_limit" label="Redemption limit" optional error={errors.redemption_limit} hint="Leave blank for unlimited.">
                                    {(a11y) => <input {...a11y} type="number" inputMode="numeric" min="1" max="1000" value={data.redemption_limit} onChange={(e) => setData('redemption_limit', e.target.value)} placeholder="Unlimited" className="field-input" />}
                                </Field>
                            </FormSection>

                            <FormSection title="Availability">
                                <Field id="start_date" label="Start date" optional error={errors.start_date}>
                                    {(a11y) => <input {...a11y} type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} className="field-input" />}
                                </Field>
                                <Field id="end_date" label="End date" optional error={errors.end_date ?? (datesInvalid ? 'Must be on or after start date.' : undefined)}>
                                    {(a11y) => <input {...a11y} type="date" min={data.start_date || undefined} value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} className="field-input" />}
                                </Field>
                                <div className="sm:col-span-2">
                                    <div className="flex items-center justify-between gap-4 rounded-control border border-line bg-surface-muted px-4 py-3">
                                        <div id="is_active_label">
                                            <p className="text-small font-medium text-ink">Available for redemption</p>
                                            <p className="text-caption text-ink-muted">Turn off to hide this reward.</p>
                                        </div>
                                        <button type="button" role="switch" aria-checked={data.is_active} aria-labelledby="is_active_label" onClick={() => setData('is_active', !data.is_active)} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${data.is_active ? 'bg-brand' : 'bg-line-strong'}`}>
                                            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${data.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                    {errors.is_active && <p className="mt-1.5 field-error">{errors.is_active}</p>}
                                </div>
                            </FormSection>
                        </div>
                    </form>
                </AdminModal>
            )}

            {/* Toggle Status Confirmation */}
            {confirmTarget && (
                <AdminModal
                    title={confirmTarget.is_active ? `Deactivate "${confirmTarget.reward_name}"?` : `Activate "${confirmTarget.reward_name}"?`}
                    description={confirmTarget.is_active ? 'Customers will no longer be able to redeem it.' : 'Customers will be able to redeem it again.'}
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
                        Costs <span className="font-semibold text-ink">{confirmTarget.points_required.toLocaleString()} pts</span>. It is currently {confirmTarget.is_active ? 'active' : 'inactive'}.
                    </div>
                </AdminModal>
            )}
        </AdminLayout>
    );
}