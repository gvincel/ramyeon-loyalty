import { Head, useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { FormEventHandler, useState } from 'react';

import CustomerLayout from '@/Layouts/CustomerLayout';
import CustomerPageHeader from '@/Components/CustomerPageHeader';
import FlashMessage from '@/Components/FlashMessage';

type FeedbackFormData = {
    rating: number | '';
    message: string;
};

export default function Feedback() {
    const [hoveredRating, setHoveredRating] = useState(0);

    const { flash } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors, reset } =
        useForm<FeedbackFormData>({
            rating: '',
            message: '',
        });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('customer.feedback.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setHoveredRating(0);
            },
        });
    };

    const displayedRating = hoveredRating || data.rating || 0;

    return (
        <CustomerLayout>
            <Head title="Customer Feedback" />

            <div className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <CustomerPageHeader
                    eyebrow="Ramyeon Corner Loyalty"
                    title="Share Your Feedback"
                    description="Help us improve your experience. Tell us what you think about our service and loyalty program."
                />

                <FlashMessage success={flash?.success} error={flash?.error} />

                <section className="panel">
                    <div className="panel-header flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-brand-50 ring-1 ring-brand-100">
                            <span className="material-symbols-outlined text-[23px] text-brand-700" aria-hidden="true">
                                rate_review
                            </span>
                        </div>

                        <div>
                            <h2 className="panel-title">Your opinion matters</h2>
                            <p className="panel-desc">
                                Ratings are optional, but your message helps us understand how we can serve you better.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={submit} noValidate className="space-y-6 p-6 sm:p-7">
                        <fieldset>
                            <legend className="text-small font-semibold text-ink">
                                How would you rate your experience?
                                <span className="ml-1 font-normal text-ink-subtle">(optional)</span>
                            </legend>

                            <p id="rating-hint" className="mt-1 text-caption leading-5 text-ink-muted">
                                Choose from 1 star (poor) to 5 stars (excellent).
                            </p>

                            <div
                                className="mt-3 flex flex-wrap items-center gap-1"
                                role="group"
                                aria-label="Rate your experience from 1 to 5 stars"
                                aria-describedby="rating-hint"
                            >
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        type="button"
                                        onClick={() => setData('rating', data.rating === rating ? '' : rating)}
                                        onMouseEnter={() => setHoveredRating(rating)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        onFocus={() => setHoveredRating(rating)}
                                        onBlur={() => setHoveredRating(0)}
                                        aria-label={`${rating} ${rating === 1 ? 'star' : 'stars'}`}
                                        aria-pressed={data.rating === rating}
                                        className="flex h-11 w-11 items-center justify-center rounded-control transition-colors duration-fast hover:bg-canvas"
                                    >
                                        <span
                                            className={`material-symbols-outlined text-[28px] transition-colors duration-fast ${
                                                rating <= displayedRating
                                                    ? 'text-accent-500'
                                                    : 'text-line-strong'
                                            }`}
                                            aria-hidden="true"
                                        >
                                            star
                                        </span>
                                    </button>
                                ))}

                                <span className="ml-2 text-small font-medium text-ink-muted">
                                    {data.rating === '' ? 'No rating selected' : `${data.rating} out of 5`}
                                </span>
                            </div>

                            {errors.rating && (
                                <p id="rating-error" className="field-error">
                                    {errors.rating}
                                </p>
                            )}
                        </fieldset>

                        <div>
                            <label htmlFor="message" className="field-label">
                                Your feedback <span className="text-danger-700">*</span>
                            </label>

                            <textarea
                                id="message"
                                value={data.message}
                                onChange={(event) =>
                                    setData('message', event.target.value.slice(0, 5000))
                                }
                                placeholder="Tell us about your experience, what you liked, or what we could improve..."
                                rows={6}
                                maxLength={5000}
                                required
                                aria-invalid={errors.message ? 'true' : 'false'}
                                aria-describedby={
                                    errors.message
                                        ? 'message-error message-hint'
                                        : 'message-hint'
                                }
                                className="field-input resize-none"
                            />

                            <div className="mt-1.5 flex items-start justify-between gap-3">
                                <div>
                                    {errors.message && (
                                        <p id="message-error" className="field-error">
                                            {errors.message}
                                        </p>
                                    )}

                                    <p id="message-hint" className="text-caption leading-5 text-ink-subtle">
                                        Please avoid including passwords or other sensitive information.
                                    </p>
                                </div>

                                <span className="shrink-0 text-caption tabular-nums text-ink-subtle" aria-live="polite">
                                    {data.message.length}/5000
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-line pt-5">
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary w-full sm:w-auto"
                            >
                                {processing ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[20px]" aria-hidden="true">
                                            progress_activity
                                        </span>
                                        Submitting feedback...
                                    </>
                                ) : (
                                    <>
                                        Submit feedback
                                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                                            arrow_forward
                                        </span>
                                    </>
                                )}
                            </button>

                            <p className="mt-3 text-caption leading-5 text-ink-subtle">
                                Your feedback will be shared with the Ramyeon Corner team to help improve our service.
                            </p>
                        </div>
                    </form>
                </section>
            </div>
        </CustomerLayout>
    );
}