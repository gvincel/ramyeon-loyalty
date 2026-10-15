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

        if (Number.isNaN(parsedDate.getTime())) {
            return 'Date unavailable';
        }

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

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <AdminPageHeader
                        eyebrow="Customer Experience"
                        title="Customer Feedback"
                        description="Review customer ratings and messages to understand their experiences and identify opportunities to improve our service."
                    />

                    <section
                        className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                        aria-labelledby="feedback-list-heading"
                    >
                        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div>
                                <h2
                                    id="feedback-list-heading"
                                    className="text-lg font-bold tracking-tight text-gray-900"
                                >
                                    Submitted Feedback
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Customer messages are displayed newest
                                    first.
                                </p>
                            </div>

                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5">
                                <span
                                    className="material-symbols-outlined text-[18px] text-red-700"
                                    aria-hidden="true"
                                >
                                    rate_review
                                </span>

                                <span className="text-sm font-semibold text-red-800">
                                    {feedback.total.toLocaleString('en-PH')}{' '}
                                    {feedback.total === 1
                                        ? 'submission'
                                        : 'submissions'}
                                </span>
                            </div>
                        </div>

                        {feedback.data.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {feedback.data.map((item) => (
                                    <article
                                        key={item.id}
                                        className="px-5 py-5 transition-colors hover:bg-gray-50/70 sm:px-6 sm:py-6"
                                    >
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <h3 className="text-sm font-semibold text-gray-900">
                                                        {item.customer
                                                            ? `${item.customer.first_name} ${item.customer.last_name}`
                                                            : 'Former or unavailable customer'}
                                                    </h3>

                                                    {item.customer && (
                                                        <span className="rounded-md border border-gray-200 bg-white px-2 py-0.5 font-mono text-xs text-gray-600">
                                                            {item.customer.customer_code}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                                                    <span
                                                        className="material-symbols-outlined text-[15px]"
                                                        aria-hidden="true"
                                                    >
                                                        schedule
                                                    </span>

                                                    <time
                                                        dateTime={item.created_at}
                                                    >
                                                        {formatDate(
                                                            item.created_at,
                                                        )}
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
                                                            {[1, 2, 3, 4, 5].map(
                                                                (star) => (
                                                                    <span
                                                                        key={star}
                                                                        className={`material-symbols-outlined text-[19px] ${
                                                                            star <=
                                                                            item.rating!
                                                                                ? 'text-amber-500'
                                                                                : 'text-gray-200'
                                                                        }`}
                                                                        aria-hidden="true"
                                                                    >
                                                                        star
                                                                    </span>
                                                                ),
                                                            )}
                                                        </div>

                                                        <span className="text-sm font-semibold tabular-nums text-gray-700">
                                                            {item.rating}/5
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                                        No rating
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/80 p-4 sm:p-5">
                                            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
                                                {item.message}
                                            </p>
                                        </div>
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
                                        rate_review
                                    </span>
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-gray-900">
                                    No feedback yet
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                                    Customer feedback submissions will appear
                                    here once customers share their
                                    experiences.
                                </p>
                            </div>
                        )}

                        {feedback.last_page > 1 && (
                            <nav
                                className="flex flex-wrap items-center justify-center gap-1 border-t border-gray-100 px-5 py-4 sm:justify-end sm:px-6"
                                aria-label="Customer feedback pagination"
                            >
                                {feedback.links.map((link, index) => {
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

                        {feedback.total > 0 && (
                            <div className="border-t border-gray-100 px-5 py-3 sm:px-6">
                                <p className="text-xs text-gray-500">
                                    Showing{' '}
                                    <span className="font-medium text-gray-700">
                                        {feedback.from ?? 0}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium text-gray-700">
                                        {feedback.to ?? 0}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-gray-700">
                                        {feedback.total.toLocaleString(
                                            'en-PH',
                                        )}
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
