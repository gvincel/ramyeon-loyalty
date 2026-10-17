import { Head, Link } from '@inertiajs/react';

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

const inputClassName =
    'mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100';

export default function AuditLogs({
    logs,
    actions,
    filters,
}: AuditLogsProps) {
    const formatDate = (value: string) => {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return 'Date unavailable';
        }

        return date.toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const formatLabel = (value: string) =>
        value.replace(/_/g, ' ').replace(/\b\w/g, (character) =>
            character.toUpperCase(),
        );

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
            'report.export_requested': 'Export Requested',
            'backup.created': 'Backup Created',
        };

        return labels[action] ?? formatActionLabel(action);
    };

    const getActionBadgeClassName = (action: string) => {
        if (/(deactivated|deleted|cancelled)/.test(action)) {
            return 'border-red-100 bg-red-50 text-red-700';
        }

        if (/(activated|created|redeemed)/.test(action)) {
            return 'border-green-100 bg-green-50 text-green-700';
        }

        if (action.includes('updated')) {
            return 'border-blue-100 bg-blue-50 text-blue-700';
        }

        if (action.startsWith('report.')) {
            return 'border-indigo-100 bg-indigo-50 text-indigo-700';
        }

        return 'border-gray-200 bg-gray-50 text-gray-700';
    };

    const decodePaginationLabel = (label: string) =>
        label
            .replace(/&laquo;/g, '«')
            .replace(/&raquo;/g, '»')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');

    const hasFilters = Boolean(
        filters.search ||
            filters.action ||
            filters.role ||
            filters.date_from ||
            filters.date_to,
    );

    return (
        <AdminLayout>
            <Head title="Audit Logs" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <AdminPageHeader
                        eyebrow="Security & Accountability"
                        title="Audit Logs"
                        description="Review recorded staff actions and important system changes. Entries are displayed newest first."
                    />

                    <section
                        className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                        aria-labelledby="audit-log-heading"
                    >
                        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div>
                                <h2
                                    id="audit-log-heading"
                                    className="text-lg font-bold tracking-tight text-gray-900"
                                >
                                    Activity History
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Search actions by staff member, event, or
                                    record identifier.
                                </p>
                            </div>

                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5">
                                <span
                                    className="material-symbols-outlined text-[18px] text-red-700"
                                    aria-hidden="true"
                                >
                                    history
                                </span>

                                <span className="text-sm font-semibold text-red-800">
                                    {logs.total.toLocaleString('en-PH')}{' '}
                                    {logs.total === 1 ? 'entry' : 'entries'}
                                </span>
                            </div>
                        </div>

                        <form
                            method="get"
                            action={route('admin.audit-logs.index')}
                            className="space-y-4 border-b border-gray-100 bg-gray-50/70 px-5 py-5 sm:px-6"
                            aria-label="Filter audit logs"
                        >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                <div className="lg:col-span-2">
                                    <label
                                        htmlFor="audit-search"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Search
                                    </label>

                                    <input
                                        id="audit-search"
                                        type="search"
                                        name="search"
                                        maxLength={100}
                                        defaultValue={filters.search}
                                        placeholder="Staff, action, or record ID"
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="audit-action"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Action
                                    </label>

                                    <select
                                        id="audit-action"
                                        name="action"
                                        defaultValue={filters.action}
                                        className={inputClassName}
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
                                    <label
                                        htmlFor="audit-role"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Staff role
                                    </label>

                                    <select
                                        id="audit-role"
                                        name="role"
                                        defaultValue={filters.role}
                                        className={inputClassName}
                                    >
                                        <option value="">All roles</option>
                                        <option value="admin">Admin</option>
                                        <option value="cashier">Cashier</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="audit-date-from"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        From date
                                    </label>

                                    <input
                                        id="audit-date-from"
                                        type="date"
                                        name="date_from"
                                        defaultValue={filters.date_from}
                                        className={inputClassName}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="audit-date-to"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        To date
                                    </label>

                                    <input
                                        id="audit-date-to"
                                        type="date"
                                        name="date_to"
                                        min={filters.date_from || undefined}
                                        defaultValue={filters.date_to}
                                        className={inputClassName}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="submit"
                                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                >
                                    <span
                                        className="material-symbols-outlined text-[18px]"
                                        aria-hidden="true"
                                    >
                                        filter_list
                                    </span>
                                    Apply filters
                                </button>

                                <Link
                                    href={route('admin.audit-logs.index')}
                                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                >
                                    Clear filters
                                </Link>
                            </div>
                        </form>

                        {logs.data.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {logs.data.map((log) => (
                                    <article
                                        key={log.id}
                                        className="px-5 py-5 transition-colors hover:bg-gray-50/70 sm:px-6 sm:py-6"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="break-words text-sm font-semibold text-gray-900">
                                                        {log.description}
                                                    </h3>

                                                    <span
                                                        className={`inline-flex max-w-full break-words rounded-md border px-2.5 py-1 text-xs font-semibold ${getActionBadgeClassName(log.action)}`}
                                                    >
                                                        {formatActionBadgeLabel(log.action)}
                                                    </span>
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {log.actor_name ?? 'Unknown staff account'}
                                                    </span>

                                                    {log.actor_role && (
                                                        <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                                            {formatLabel(log.actor_role)}
                                                        </span>
                                                    )}

                                                    {log.actor_id !== null && (
                                                        <span className="text-xs text-gray-500">
                                                            Staff ID #{log.actor_id}
                                                        </span>
                                                    )}
                                                </div>

                                                {(log.subject_type ||
                                                    log.subject_id !== null) && (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Affected record:{' '}
                                                        <span className="inline-flex rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                                                            {log.subject_type ??
                                                                'Record'}
                                                            {log.subject_id !==
                                                                null &&
                                                                ` #${log.subject_id}`}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>

                                            <time
                                                dateTime={log.created_at}
                                                className="shrink-0 text-xs text-gray-500 sm:text-right"
                                            >
                                                {formatDate(log.created_at)}
                                            </time>
                                        </div>

                                        {log.metadata &&
                                            Object.keys(log.metadata).length >
                                                0 && (
                                                <dl className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 sm:grid-cols-2 lg:grid-cols-3">
                                                    {Object.entries(
                                                        log.metadata,
                                                    ).map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="min-w-0"
                                                        >
                                                            <dt className="text-xs font-medium text-gray-500">
                                                                {formatLabel(
                                                                    key,
                                                                )}
                                                            </dt>

                                                            <dd className="mt-1 break-words text-sm text-gray-800">
                                                                {(key === 'previous_status' || key === 'new_status') &&
                                                                typeof value === 'string' ? (
                                                                    <span
                                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                            value.toLowerCase() === 'active'
                                                                                ? 'bg-green-50 text-green-700'
                                                                                : value.toLowerCase() === 'inactive'
                                                                                ? 'bg-red-50 text-red-700'
                                                                                : 'bg-gray-100 text-gray-700'
                                                                        }`}
                                                                    >
                                                                        {formatLabel(value)}
                                                                    </span>
                                                                ) : value === null ? (
                                                                    'Not available'
                                                                ) : (
                                                                    String(value)
                                                                )}
                                                            </dd>
                                                        </div>
                                                    ))}
                                                </dl>
                                            )}
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-14 text-center sm:py-16">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                                    <span
                                        className="material-symbols-outlined text-[28px] text-red-700"
                                        aria-hidden="true"
                                    >
                                        manage_search
                                    </span>
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-gray-900">
                                    No audit entries found
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                                    {hasFilters
                                        ? 'No recorded actions match these filters. Try changing your search or clearing the filters.'
                                        : 'Audit entries will appear here after staff actions are recorded.'}
                                </p>

                                {hasFilters && (
                                    <Link
                                        href={route(
                                            'admin.audit-logs.index',
                                        )}
                                        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                    >
                                        Clear filters
                                    </Link>
                                )}
                            </div>
                        )}

                        {logs.last_page > 1 && (
                            <nav
                                className="flex flex-wrap items-center justify-center gap-1 border-t border-gray-100 px-5 py-4 sm:justify-end sm:px-6"
                                aria-label="Audit log pagination"
                            >
                                {logs.links.map((link, index) => {
                                    const label = decodePaginationLabel(
                                        link.label,
                                    );

                                    const className = [
                                        'flex min-h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition',
                                        link.active
                                            ? 'bg-red-700 text-white'
                                            : link.url
                                              ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                              : 'cursor-not-allowed text-gray-300',
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
                                            aria-current={
                                                link.active
                                                    ? 'page'
                                                    : undefined
                                            }
                                        >
                                            {label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        )}

                        {logs.total > 0 && (
                            <div className="border-t border-gray-100 px-5 py-3 sm:px-6">
                                <p className="text-xs text-gray-500">
                                    Showing{' '}
                                    <span className="font-medium text-gray-700">
                                        {logs.from ?? 0}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium text-gray-700">
                                        {logs.to ?? 0}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-gray-700">
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
