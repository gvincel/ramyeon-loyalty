import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';

interface Customer {
    id: number;
    first_name: string;
    last_name: string;
    customer_code: string;
}

interface FeedbackItem {
    id: number;
    customer_id: number | null;
    rating: number | null;
    message: string;
    created_at: string;
    updated_at: string;
    customer: Customer | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface FeedbackPagination {
    data: FeedbackItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
    from: number | null;
    to: number | null;
}

interface FeedbackProps {
    feedback: FeedbackPagination;
}

export default function Feedback({ feedback }: FeedbackProps) {
    const formatDate = (date: string) => {
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return 'Date unavailable';

        return parsedDate.toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const decodePaginationLabel = (label: string) =>
        label
            .replace(/&laquo;/g, '«')
            .replace(/&raquo;/g, '»')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');

    return (
        <AdminLayout>
            <Head title="Customer Feedback" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content">
                    <AdminPageHeader
                        eyebrow="Customer Experience"
                        title="Customer Feedback"
                        description="Review customer ratings and messages to understand their experiences and identify opportunities to improve our service."
                    />

                    <section className="mt-6 panel" aria-labelledby="feedback-list-heading">
                        <div className="panel-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 id="feedback-list-heading" className="panel-title">
                                    Submitted feedback
                                </h2>
                                <p className="panel-desc">
                                    Customer messages are displayed newest first.
                                </p>
                            </div>

                            <div className="badge-brand inline-flex w-fit items-center gap-2 px-3 py-1.5">
                                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                                    rate_review
                                </span>
                                <span className="text-caption font-semibold">
                                    {feedback.total.toLocaleString('en-PH')}{' '}
                                    {feedback.total === 1 ? 'submission' : 'submissions'}
                                </span>
                            </div>
                        </div>

                        {feedback.data.length > 0 ? (
                            <div className="divide-y divide-line">
                                {feedback.data.map((item) => (
                                    <article
                                        key={item.id}
                                        className="px-5 py-5 transition-colors duration-base hover:bg-canvas/60 sm:px-6 sm:py-6"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <h3 className="text-small font-semibold text-ink">
                                                        {item.customer
                                                            ? `${item.customer.first_name} ${item.customer.last_name}`
                                                            : 'Former or unavailable customer'}
                                                    </h3>

                                                    {item.customer && (
                                                        <span className="chip">
                                                            {item.customer.customer_code}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-1.5 flex items-center gap-1.5 text-caption text-ink-muted">
                                                    <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                                                        schedule
                                                    </span>
                                                    <time dateTime={item.created_at}>
                                                        {formatDate(item.created_at)}
                                                    </time>
                                                </p>
                                            </div>

                                            <div
                                                className="flex shrink-0 items-center gap-2"
                                                aria-label={
                                                    item.rating
                                                        ? `Rating: ${item.rating} out of 5 stars`
                                                        : 'No rating provided'
                                                }
                                            >
                                                {item.rating ? (
                                                    <>
                                                        <div className="flex items-center gap-0.5">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <span
                                                                    key={star}
                                                                    className={`material-symbols-outlined text-[19px] ${
                                                                        star <= item.rating!
                                                                            ? 'text-accent-500'
                                                                            : 'text-line-strong'
                                                                    }`}
                                                                    aria-hidden="true"
                                                                >
                                                                    star
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="text-small font-semibold tabular-nums text-ink">
                                                            {item.rating}/5
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="badge bg-surface-muted text-ink-muted ring-1 ring-line">
                                                        No rating
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-control border border-line bg-surface-muted p-4 sm:p-5">
                                            <p className="whitespace-pre-wrap break-words text-small leading-7 text-ink">
                                                {item.message}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-14 text-center sm:py-16">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                                    <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                                        rate_review
                                    </span>
                                </div>
                                <h3 className="mt-4 text-heading font-semibold text-ink">
                                    No feedback yet
                                </h3>
                                <p className="mx-auto mt-2 max-w-md text-small leading-6 text-ink-muted">
                                    Customer feedback submissions will appear here once customers share their experiences.
                                </p>
                            </div>
                        )}

                        {feedback.last_page > 1 && (
                            <nav
                                className="flex flex-wrap items-center justify-center gap-1 border-t border-line px-5 py-4 sm:justify-end sm:px-6"
                                aria-label="Customer feedback pagination"
                            >
                                {feedback.links.map((link, index) => {
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

                        {feedback.total > 0 && (
                            <div className="border-t border-line px-5 py-3 sm:px-6">
                                <p className="text-caption text-ink-muted">
                                    Showing{' '}
                                    <span className="font-medium text-ink">{feedback.from ?? 0}</span>{' '}
                                    to{' '}
                                    <span className="font-medium text-ink">{feedback.to ?? 0}</span>{' '}
                                    of{' '}
                                    <span className="font-medium text-ink">
                                        {feedback.total.toLocaleString('en-PH')}
                                    </span>{' '}
                                    submissions
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
}