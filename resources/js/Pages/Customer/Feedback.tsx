import { Head, useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { FormEventHandler, useState } from 'react';

import CustomerLayout from '@/Layouts/CustomerLayout';
import CustomerPageHeader from '@/Components/CustomerPageHeader';

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

    const inputClass = (hasError: boolean) =>
        `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:ring-2 ${
            hasError
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-200 hover:border-slate-300 focus:border-red-500 focus:ring-red-100'
        }`;

    const displayedRating = hoveredRating || data.rating || 0;

    return (
        <CustomerLayout>
            <Head title="Customer Feedback" />

            <div className="min-h-screen bg-slate-50">
                <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <CustomerPageHeader
                        eyebrow="Ramyeon Corner Loyalty"
                        title="Share Your Feedback"
                        description="Help us improve your experience. Tell us what you think about our service and loyalty program."
                    />

                    {flash?.success && (
                        <div
                            role="status"
                            aria-live="polite"
                            className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5"
                        >
                            <span
                                className="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-green-700"
                                aria-hidden="true"
                            >
                                check_circle
                            </span>

                            <p className="text-sm font-medium leading-6 text-green-800">
                                {flash.success}
                            </p>
                        </div>
                    )}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-100">
                                    <span
                                        className="material-symbols-outlined text-[23px] text-red-700"
                                        aria-hidden="true"
                                    >
                                        rate_review
                                    </span>
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                                        Your opinion matters
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Ratings are optional, but your message
                                        helps us understand how we can serve
                                        you better.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form
                            onSubmit={submit}
                            noValidate
                            className="space-y-6 px-5 py-6 sm:px-7 sm:py-7"
                        >
                            <fieldset>
                                <legend className="text-sm font-semibold text-slate-800">
                                    How would you rate your experience?
                                    <span className="ml-2 font-normal text-slate-400">
                                        (Optional)
                                    </span>
                                </legend>

                                <p
                                    id="rating-hint"
                                    className="mt-1 text-xs leading-5 text-slate-500"
                                >
                                    Choose from 1 star (poor) to 5 stars
                                    (excellent).
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
                                            onClick={() =>
                                                setData(
                                                    'rating',
                                                    data.rating === rating
                                                        ? ''
                                                        : rating,
                                                )
                                            }
                                            onMouseEnter={() =>
                                                setHoveredRating(rating)
                                            }
                                            onMouseLeave={() =>
                                                setHoveredRating(0)
                                            }
                                            onFocus={() =>
                                                setHoveredRating(rating)
                                            }
                                            onBlur={() =>
                                                setHoveredRating(0)
                                            }
                                            aria-label={`${rating} ${rating === 1 ? 'star' : 'stars'}`}
                                            aria-pressed={
                                                data.rating === rating
                                            }
                                            className="flex h-11 w-11 items-center justify-center rounded-lg text-3xl transition hover:bg-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                        >
                                            <span
                                                className={`material-symbols-outlined ${
                                                    rating <= displayedRating
                                                        ? 'text-amber-500'
                                                        : 'text-slate-300'
                                                }`}
                                                aria-hidden="true"
                                            >
                                                star
                                            </span>
                                        </button>
                                    ))}

                                    <span className="ml-2 text-sm font-medium text-slate-600">
                                        {data.rating === ''
                                            ? 'No rating selected'
                                            : `${data.rating} out of 5`}
                                    </span>
                                </div>

                                {errors.rating && (
                                    <p
                                        id="rating-error"
                                        className="mt-2 text-xs font-medium text-red-600"
                                    >
                                        {errors.rating}
                                    </p>
                                )}
                            </fieldset>

                            <div>
                                <label
                                    htmlFor="message"
                                    className="mb-1.5 block text-sm font-semibold text-slate-800"
                                >
                                    Your feedback
                                    <span className="ml-1 text-red-600">
                                        *
                                    </span>
                                </label>

                                <textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(event) =>
                                        setData(
                                            'message',
                                            event.target.value.slice(0, 5000),
                                        )
                                    }
                                    placeholder="Tell us about your experience, what you liked, or what we could improve..."
                                    rows={6}
                                    maxLength={5000}
                                    required
                                    aria-invalid={
                                        errors.message ? 'true' : 'false'
                                    }
                                    aria-describedby={
                                        errors.message
                                            ? 'message-error message-hint'
                                            : 'message-hint'
                                    }
                                    className={inputClass(!!errors.message)}
                                />

                                <div className="mt-1.5 flex items-start justify-between gap-3">
                                    <div>
                                        {errors.message && (
                                            <p
                                                id="message-error"
                                                className="text-xs font-medium text-red-600"
                                            >
                                                {errors.message}
                                            </p>
                                        )}

                                        <p
                                            id="message-hint"
                                            className="text-xs leading-5 text-slate-400"
                                        >
                                            Please avoid including passwords or
                                            other sensitive information.
                                        </p>
                                    </div>

                                    <span
                                        className="shrink-0 text-xs tabular-nums text-slate-400"
                                        aria-live="polite"
                                    >
                                        {data.message.length}/5000
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-5">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-red-700 disabled:hover:shadow-sm sm:w-auto sm:min-w-48"
                                >
                                    {processing ? (
                                        <>
                                            <span
                                                className="material-symbols-outlined animate-spin text-[20px]"
                                                aria-hidden="true"
                                            >
                                                progress_activity
                                            </span>

                                            Submitting feedback...
                                        </>
                                    ) : (
                                        <>
                                            Submit feedback

                                            <span
                                                className="material-symbols-outlined text-[20px]"
                                                aria-hidden="true"
                                            >
                                                arrow_forward
                                            </span>
                                        </>
                                    )}
                                </button>

                                <p className="mt-3 text-xs leading-5 text-slate-400">
                                    Your feedback will be shared with the
                                    Ramyeon Corner team to help improve our
                                    service.
                                </p>
                            </div>
                        </form>
                    </section>
                </main>
            </div>
        </CustomerLayout>
    );
}