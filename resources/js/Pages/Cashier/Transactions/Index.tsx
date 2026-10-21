import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import CashierLayout from '@/Layouts/CashierLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import FlashMessage from '@/Components/FlashMessage';
import { PageProps } from '@/types';

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
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface Filters {
    search: string | null;
    date_from: string | null;
    date_to: string | null;
}

interface Props {
    transactions: Transactions;
    filters: Filters;
}

const formatDate = (value: string | null | undefined) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
};

const formatNumber = (value: string | number) => {
    return Number(value).toLocaleString('en-PH');
};

const formatCurrency = (value: string | number) => {
    return `₱${Number(value).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const decodePaginationLabel = (label: string) =>
    label
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

export default function Index({ transactions, filters }: Props) {
    const { flash } = usePage<PageProps>().props;

    const [showAdvanced, setShowAdvanced] = useState(
        Boolean(filters.date_from || filters.date_to),
    );

    const hasActiveFilters = Boolean(filters.search || filters.date_from || filters.date_to);

    const buildUrl = (omit?: keyof Filters) => {
        const params: Record<string, string> = {};
        if (filters.search && omit !== 'search') params.search = filters.search;
        if (filters.date_from && omit !== 'date_from') params.date_from = filters.date_from;
        if (filters.date_to && omit !== 'date_to') params.date_to = filters.date_to;
        return route('cashier.transactions.index', params);
    };

    const activeChips: { key: keyof Filters; label: string }[] = [];
    if (filters.search) activeChips.push({ key: 'search', label: `Search: "${filters.search}"` });
    if (filters.date_from) activeChips.push({ key: 'date_from', label: `From ${filters.date_from}` });
    if (filters.date_to) activeChips.push({ key: 'date_to', label: `To ${filters.date_to}` });

    return (
        <CashierLayout>
            <Head title="Transaction History" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content">
                    <AdminPageHeader
                        eyebrow="Transactions"
                        title="Transaction History"
                        description="View purchase transactions processed by you."
                    />

                    <FlashMessage success={flash.success} error={flash.error} />

                    <section className="mt-6 panel">
                        <div className="panel-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="panel-title">Transactions</h2>
                                <p className="panel-desc">Purchase transactions processed by you.</p>
                            </div>
                            <div className="badge-brand inline-flex w-fit items-center gap-2 px-3 py-1.5">
                                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                                    receipt_long
                                </span>
                                <span className="text-caption font-semibold">
                                    {transactions.total.toLocaleString('en-PH')} record
                                    {transactions.total !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        <form
                            key={JSON.stringify(filters)}
                            method="get"
                            action={route('cashier.transactions.index')}
                            className="border-b border-line bg-surface-muted px-5 py-4 sm:px-6"
                            aria-label="Filter transactions"
                        >
                            {/* Row 1: Search + Filters toggle + Apply */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative flex-1">
                                    <label htmlFor="tx-search" className="sr-only">
                                        Search transactions
                                    </label>
                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-subtle">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <circle cx="11" cy="11" r="7" />
                                            <path d="M21 21l-4.3-4.3" />
                                        </svg>
                                    </span>
                                    <input
                                        id="tx-search"
                                        type="search"
                                        name="search"
                                        maxLength={100}
                                        defaultValue={filters.search || ''}
                                        placeholder="Search customer, code, or receipt…"
                                        className="field-input pl-9"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced((v) => !v)}
                                    className={`btn-secondary sm:shrink-0 ${showAdvanced ? 'bg-surface-muted' : ''}`}
                                    aria-expanded={showAdvanced}
                                    aria-controls="tx-advanced-filters"
                                >
                                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                                        tune
                                    </span>
                                    <span>Filters</span>
                                    {activeChips.length > 0 && (
                                        <span className="badge-brand ml-0.5 px-1.5 py-0 text-[10px]">
                                            {activeChips.length}
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

                            {/* Row 2: Advanced filters */}
                            {showAdvanced && (
                                <div
                                    id="tx-advanced-filters"
                                    className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2"
                                >
                                    <div>
                                        <label htmlFor="tx-date-from" className="field-label">
                                            From date
                                        </label>
                                        <input
                                            id="tx-date-from"
                                            type="date"
                                            name="date_from"
                                            defaultValue={filters.date_from || ''}
                                            className="field-input"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="tx-date-to" className="field-label">
                                            To date
                                        </label>
                                        <input
                                            id="tx-date-to"
                                            type="date"
                                            name="date_to"
                                            min={filters.date_from || undefined}
                                            defaultValue={filters.date_to || ''}
                                            className="field-input"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Row 3: Active filter chips */}
                            {hasActiveFilters && (
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
                                        href={route('cashier.transactions.index')}
                                        className="ml-auto text-caption font-medium text-brand-700 hover:underline"
                                    >
                                        Clear all
                                    </Link>
                                </div>
                            )}
                        </form>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left text-small">
                                <thead className="border-b border-line bg-surface-muted">
                                    <tr>
                                        <th scope="col" className="table-th">Customer</th>
                                        <th scope="col" className="table-th">Receipt</th>
                                        <th scope="col" className="table-th">Purchase Amount</th>
                                        <th scope="col" className="table-th">Points Earned</th>
                                        <th scope="col" className="table-th">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {transactions.data.length > 0 ? (
                                        transactions.data.map((transaction) => (
                                            <tr key={transaction.id} className="transition-colors duration-base ease-standard hover:bg-canvas/60">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-small font-bold text-brand-600">
                                                            {transaction.customer.first_name.charAt(0).toUpperCase()}
                                                            {transaction.customer.last_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-ink">
                                                                {transaction.customer.first_name} {transaction.customer.last_name}
                                                            </p>
                                                            <p className="mt-0.5 max-w-[220px] truncate text-caption text-ink-muted">
                                                                {transaction.customer.customer_code}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {transaction.receipt_number ? (
                                                        <span className="chip">{transaction.receipt_number}</span>
                                                    ) : (
                                                        <span className="text-small text-ink-subtle">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-semibold tabular-nums text-ink">
                                                    {formatCurrency(transaction.purchase_amount)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="badge-accent font-semibold">
                                                        +{formatNumber(transaction.points_earned)} pt
                                                        {transaction.points_earned !== 1 ? 's' : ''}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 tabular-nums text-ink-muted">
                                                    {formatDate(transaction.created_at)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center">
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-subtle">
                                                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 2h12" />
                                                        <circle cx="10" cy="19" r="1" />
                                                        <circle cx="17" cy="19" r="1" />
                                                    </svg>
                                                </div>
                                                <p className="mt-4 font-semibold text-ink">
                                                    {hasActiveFilters ? 'No transactions match your filters' : 'No transactions found'}
                                                </p>
                                                <p className="mt-1 text-small text-ink-muted">
                                                    {hasActiveFilters ? 'Try adjusting or clearing your filters.' : 'Transaction activity will appear here.'}
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {transactions.last_page > 1 && (
                            <nav className="flex flex-wrap items-center justify-center gap-1 border-t border-line px-5 py-4 sm:justify-end sm:px-6" aria-label="Transaction history pagination">
                                {transactions.links.map((link, index) => {
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
                                        return <span key={`${link.label}-${index}`} className={className} aria-disabled="true">{label}</span>;
                                    }
                                    return (
                                        <Link key={`${link.label}-${index}`} href={link.url} preserveScroll className={className} aria-current={link.active ? 'page' : undefined}>
                                            {label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        )}

                        {transactions.total > 0 && (
                            <div className="border-t border-line px-5 py-3 sm:px-6">
                                <p className="text-caption text-ink-muted">
                                    Showing <span className="font-medium text-ink">{transactions.from ?? 0}</span> to{' '}
                                    <span className="font-medium text-ink">{transactions.to ?? 0}</span> of{' '}
                                    <span className="font-medium text-ink">{transactions.total.toLocaleString('en-PH')}</span> transactions
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </CashierLayout>
    );
}