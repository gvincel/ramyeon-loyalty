import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';

interface AuditLogItem {
    id: number;
    actor_id: number | null;
    actor_name: string | null;
    actor_role: string | null;
    action: string;
    subject_type: string | null;
    subject_id: number | null;
    description: string;
    metadata: Record<string, string | number | boolean | null> | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AuditLogPagination {
    data: AuditLogItem[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface AuditLogFilters {
    search: string;
    action: string;
    role: string;
    date_from: string;
    date_to: string;
}

interface AuditLogsProps {
    logs: AuditLogPagination;
    actions: string[];
    filters: AuditLogFilters;
}

const initials = (name: string | null) => {
    if (!name) return null;
    return name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

export default function AuditLogs({ logs, actions, filters }: AuditLogsProps) {
    const [showAdvanced, setShowAdvanced] = useState(
        Boolean(filters.action || filters.role || filters.date_from || filters.date_to),
    );

    const formatDate = (value: string) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'Date unavailable';
        return date.toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const formatLabel = (value: string) =>
        value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    const formatActionLabel = (action: string) => {
        const labels: Record<string, string> = {
            'customer.activated': 'Customer Activated',
            'customer.deactivated': 'Customer Deactivated',
            'customer.updated': 'Customer Updated',
            'customer.deleted': 'Customer Deleted',
            'transaction.created': 'Purchase Transaction',
            'reward.redeemed': 'Reward Redeemed',
            'reward_redemption.cancelled': 'Redemption Cancelled',
            'cashier.created': 'Cashier Created',
            'cashier.updated': 'Cashier Updated',
            'cashier.activated': 'Cashier Activated',
            'cashier.deactivated': 'Cashier Deactivated',
            'reward.created': 'Reward Created',
            'reward.updated': 'Reward Updated',
            'reward.activated': 'Reward Activated',
            'reward.deactivated': 'Reward Deactivated',
            'report.export_requested': 'Report Export Requested',
            'backup.created': 'Database Backup Created',
        };
        return labels[action] ?? formatLabel(action.replace(/[._]/g, ' '));
    };

    const formatActionBadgeLabel = (action: string) => {
        const labels: Record<string, string> = {
            'customer.activated': 'Activated',
            'customer.deactivated': 'Deactivated',
            'customer.updated': 'Updated',
            'customer.deleted': 'Deleted',
            'transaction.created': 'Purchase',
            'reward.redeemed': 'Redeemed',
            'reward_redemption.cancelled': 'Cancelled',
            'cashier.created': 'Created',
            'cashier.updated': 'Updated',
            'cashier.activated': 'Activated',
            'cashier.deactivated': 'Deactivated',
            'reward.created': 'Created',
            'reward.updated': 'Updated',
            'reward.activated': 'Activated',
            'reward.deactivated': 'Deactivated',
            'report.export_requested': 'Export',
            'backup.created': 'Backup',
        };
        return labels[action] ?? formatActionLabel(action);
    };

    const getActionBadgeClassName = (action: string) => {
        if (/(deactivated|deleted|cancelled)/.test(action)) return 'badge-danger';
        if (/(activated|created|redeemed)/.test(action)) return 'badge-success';
        if (action.includes('updated')) return 'badge-brand';
        if (action.startsWith('report.')) return 'badge-accent';
        return 'badge-neutral';
    };

    const getActionAccentClass = (action: string) => {
        if (/(deactivated|deleted|cancelled)/.test(action)) return 'border-l-danger-600';
        if (/(activated|created|redeemed)/.test(action)) return 'border-l-success-600';
        if (action.includes('updated')) return 'border-l-brand';
        if (action.startsWith('report.')) return 'border-l-accent-500';
        return 'border-l-line-strong';
    };

    const decodePaginationLabel = (label: string) =>
        label
            .replace(/&laquo;/g, '«')
            .replace(/&raquo;/g, '»')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');

    /* Build URLs for removing individual filters via chips */
    const buildUrl = (omit?: keyof AuditLogFilters) => {
        const params: Record<string, string> = {};
        if (filters.search && omit !== 'search') params.search = filters.search;
        if (filters.action && omit !== 'action') params.action = filters.action;
        if (filters.role && omit !== 'role') params.role = filters.role;
        if (filters.date_from && omit !== 'date_from') params.date_from = filters.date_from;
        if (filters.date_to && omit !== 'date_to') params.date_to = filters.date_to;
        return route('admin.audit-logs.index', params);
    };

    const activeChips: { key: keyof AuditLogFilters; label: string }[] = [];
    if (filters.search) activeChips.push({ key: 'search', label: `Search: "${filters.search}"` });
    if (filters.action) activeChips.push({ key: 'action', label: formatActionLabel(filters.action) });
    if (filters.role) activeChips.push({ key: 'role', label: formatLabel(filters.role) });
    if (filters.date_from) activeChips.push({ key: 'date_from', label: `From ${filters.date_from}` });
    if (filters.date_to) activeChips.push({ key: 'date_to', label: `To ${filters.date_to}` });

    const activeCount = activeChips.length;
    const hasFilters = activeCount > 0;

    return (
        <AdminLayout>
            <Head title="Audit Logs" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content">
                    <AdminPageHeader
                        eyebrow="Security & Accountability"
                        title="Audit Logs"
                        description="Review recorded staff actions and important system changes. Entries are displayed newest first."
                    />

                    <section className="mt-6 panel" aria-labelledby="audit-log-heading">
                        <div className="panel-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 id="audit-log-heading" className="panel-title">
                                    Activity History
                                </h2>
                                <p className="panel-desc">
                                    Search actions by staff member, event, or record identifier.
                                </p>
                            </div>

                            <div className="badge-brand inline-flex w-fit items-center gap-2 px-3 py-1.5">
                                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                                    history
                                </span>
                                <span className="text-caption font-semibold">
                                    {logs.total.toLocaleString('en-PH')}{' '}
                                    {logs.total === 1 ? 'entry' : 'entries'}
                                </span>
                            </div>
                        </div>

                        <form
                            key={JSON.stringify(filters)}
                            method="get"
                            action={route('admin.audit-logs.index')}
                            className="border-b border-line bg-surface-muted px-5 py-4 sm:px-6"
                            aria-label="Filter audit logs"
                        >
                            {/* Row 1: Search + Filters toggle + Apply */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative flex-1">
                                    <label htmlFor="audit-search" className="sr-only">
                                        Search audit logs
                                    </label>
                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-subtle">
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
                                            <circle cx="11" cy="11" r="7" />
                                            <path d="M21 21l-4.3-4.3" />
                                        </svg>
                                    </span>
                                    <input
                                        id="audit-search"
                                        type="search"
                                        name="search"
                                        maxLength={100}
                                        defaultValue={filters.search}
                                        placeholder="Search staff, action, or record ID"
                                        className="field-input pl-9"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced((v) => !v)}
                                    className={`btn-secondary sm:shrink-0 ${showAdvanced ? 'bg-surface-muted' : ''}`}
                                    aria-expanded={showAdvanced}
                                    aria-controls="audit-advanced-filters"
                                >
                                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                                        tune
                                    </span>
                                    <span>Filters</span>
                                    {activeCount > 0 && (
                                        <span className="badge-brand ml-0.5 px-1.5 py-0 text-[10px]">
                                            {activeCount}
                                        </span>
                                    )}
                                </button>

                                <button type="submit" className="btn-primary sm:shrink-0">
                                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                                        search
                                    </span>
                                    Apply
                                </button>
                            </div>

                            {/* Row 2: Advanced filters (progressive disclosure) */}
                            {showAdvanced && (
                                <div
                                    id="audit-advanced-filters"
                                    className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-4"
                                >
                                    <div>
                                        <label htmlFor="audit-action" className="field-label">
                                            Action
                                        </label>
                                        <select
                                            id="audit-action"
                                            name="action"
                                            defaultValue={filters.action}
                                            className="field-input"
                                        >
                                            <option value="">All actions</option>
                                            {actions.map((action) => (
                                                <option key={action} value={action}>
                                                    {formatActionLabel(action)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="audit-role" className="field-label">
                                            Staff role
                                        </label>
                                        <select
                                            id="audit-role"
                                            name="role"
                                            defaultValue={filters.role}
                                            className="field-input"
                                        >
                                            <option value="">All roles</option>
                                            <option value="admin">Admin</option>
                                            <option value="cashier">Cashier</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="audit-date-from" className="field-label">
                                            From date
                                        </label>
                                        <input
                                            id="audit-date-from"
                                            type="date"
                                            name="date_from"
                                            defaultValue={filters.date_from}
                                            className="field-input"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="audit-date-to" className="field-label">
                                            To date
                                        </label>
                                        <input
                                            id="audit-date-to"
                                            type="date"
                                            name="date_to"
                                            min={filters.date_from || undefined}
                                            defaultValue={filters.date_to}
                                            className="field-input"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Row 3: Active filter chips */}
                            {hasFilters && (
                                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                                    <span className="text-caption font-medium text-ink-muted">
                                        Active filters:
                                    </span>
                                    {activeChips.map((chip) => (
                                        <Link
                                            key={chip.key}
                                            href={buildUrl(chip.key)}
                                            className="group inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-caption font-medium text-brand-700 transition-colors hover:bg-brand-100 hover:border-brand-300"
                                            aria-label={`Remove filter: ${chip.label}`}
                                        >
                                            <span className="max-w-[200px] truncate">{chip.label}</span>
                                            <span className="material-symbols-outlined text-[14px] transition-transform group-hover:scale-110" aria-hidden="true">
                                                close
                                            </span>
                                        </Link>
                                    ))}
                                    <Link
                                        href={route('admin.audit-logs.index')}
                                        className="ml-auto text-caption font-medium text-brand-700 hover:underline"
                                    >
                                        Clear all
                                    </Link>
                                </div>
                            )}
                        </form>

                        {logs.data.length > 0 ? (
                            <div className="divide-y divide-line">
                                {logs.data.map((log) => {
                                    const actorInitials = initials(log.actor_name);
                                    return (
                                        <article
                                            key={log.id}
                                            className={`border-l-2 px-5 py-5 transition-colors duration-base hover:bg-canvas/60 sm:px-6 sm:py-6 ${getActionAccentClass(log.action)}`}
                                        >
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1 ${
                                                                actorInitials
                                                                    ? 'bg-brand-50 text-brand-700 ring-brand-100'
                                                                    : 'bg-surface-muted text-ink-subtle ring-line'
                                                            }`}
                                                            aria-hidden="true"
                                                        >
                                                            {actorInitials ?? (
                                                                <span className="material-symbols-outlined text-[16px]">
                                                                    person
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                                <span
                                                                    className={`shrink-0 ${getActionBadgeClassName(log.action)}`}
                                                                >
                                                                    {formatActionBadgeLabel(log.action)}
                                                                </span>
                                                                <h3 className="break-words text-small font-semibold text-ink">
                                                                    {log.description}
                                                                </h3>
                                                            </div>

                                                            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                                                <span className="text-small font-medium text-ink">
                                                                    {log.actor_name ?? 'Unknown staff account'}
                                                                </span>
                                                                {log.actor_role && (
                                                                    <>
                                                                        <span className="text-ink-subtle" aria-hidden="true">
                                                                            ·
                                                                        </span>
                                                                        <span className="text-caption text-ink-muted">
                                                                            {formatLabel(log.actor_role)}
                                                                        </span>
                                                                    </>
                                                                )}
                                                                {log.actor_id !== null && (
                                                                    <>
                                                                        <span className="text-ink-subtle" aria-hidden="true">
                                                                            ·
                                                                        </span>
                                                                        <span className="text-caption tabular-nums text-ink-subtle">
                                                                            #{log.actor_id}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>

                                                            {(log.subject_type || log.subject_id !== null) && (
                                                                <p className="mt-2 flex flex-wrap items-center gap-1.5 text-caption text-ink-muted">
                                                                    <span>Affected:</span>
                                                                    <span className="chip">
                                                                        {log.subject_type ?? 'Record'}
                                                                        {log.subject_id !== null && ` #${log.subject_id}`}
                                                                    </span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <time
                                                    dateTime={log.created_at}
                                                    className="shrink-0 pl-12 text-caption text-ink-subtle sm:pl-0 sm:text-right"
                                                >
                                                    {formatDate(log.created_at)}
                                                </time>
                                            </div>

                                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                <dl className="mt-4 ml-12 flex flex-wrap gap-x-6 gap-y-2 rounded-control border border-line bg-surface-muted px-4 py-3 text-caption">
                                                    {Object.entries(log.metadata).map(([key, value]) => (
                                                        <div key={key} className="flex min-w-0 items-center gap-1.5">
                                                            <dt className="shrink-0 text-ink-subtle">
                                                                {formatLabel(key)}:
                                                            </dt>
                                                            <dd className="min-w-0 break-words font-medium text-ink">
                                                                {(key === 'previous_status' || key === 'new_status') &&
                                                                typeof value === 'string' ? (
                                                                    <span
                                                                        className={
                                                                            value.toLowerCase() === 'active'
                                                                                ? 'badge-success'
                                                                                : value.toLowerCase() === 'inactive'
                                                                                ? 'badge-danger'
                                                                                : 'badge-neutral'
                                                                        }
                                                                    >
                                                                        {formatLabel(value)}
                                                                    </span>
                                                                ) : value === null ? (
                                                                    <span className="text-ink-subtle">Not available</span>
                                                                ) : (
                                                                    String(value)
                                                                )}
                                                            </dd>
                                                        </div>
                                                    ))}
                                                </dl>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="px-6 py-14 text-center sm:py-16">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                                    <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                                        manage_search
                                    </span>
                                </div>
                                <h3 className="mt-4 text-heading font-semibold text-ink">
                                    No audit entries found
                                </h3>
                                <p className="mx-auto mt-2 max-w-md text-small leading-6 text-ink-muted">
                                    {hasFilters
                                        ? 'No recorded actions match these filters. Try changing your search or clearing the filters.'
                                        : 'Audit entries will appear here after staff actions are recorded.'}
                                </p>
                                {hasFilters && (
                                    <Link href={route('admin.audit-logs.index')} className="btn-secondary mt-4">
                                        Clear all filters
                                    </Link>
                                )}
                            </div>
                        )}

                        {logs.last_page > 1 && (
                            <nav
                                className="flex flex-wrap items-center justify-center gap-1 border-t border-line px-5 py-4 sm:justify-end sm:px-6"
                                aria-label="Audit log pagination"
                            >
                                {logs.links.map((link, index) => {
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
                                            <span key={`${link.label}-${index}`} className={className} aria-disabled="true">
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

                        {logs.total > 0 && (
                            <div className="border-t border-line px-5 py-3 sm:px-6">
                                <p className="text-caption text-ink-muted">
                                    Showing{' '}
                                    <span className="font-medium text-ink">{logs.from ?? 0}</span> to{' '}
                                    <span className="font-medium text-ink">{logs.to ?? 0}</span> of{' '}
                                    <span className="font-medium text-ink">
                                        {logs.total.toLocaleString('en-PH')}
                                    </span>{' '}
                                    audit entries
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}