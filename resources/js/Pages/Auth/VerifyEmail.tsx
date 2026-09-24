import Guest from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <Guest fitScreen>
            <Head title="Email Verification" />

            {/* Single column by default; two columns on short, wide screens */}
            <div className="grid p-[var(--pad)] [@media(min-width:640px)_and_(max-height:560px)]:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] [@media(min-width:640px)_and_(max-height:560px)]:items-center">
                {/* Heading */}
                <div className="[@media(min-width:640px)_and_(max-height:560px)]:pr-7">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-800">
                        Account Security
                    </p>

                    <h1 className="mt-2.5 text-[length:var(--h1)] font-semibold leading-[1.1] tracking-[-0.03em] text-gray-950">
                        Verify your email
                    </h1>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                        Before getting started, please verify your email address
                        by clicking on the link we just emailed to you. If you
                        didn&apos;t receive the email, we will gladly send you
                        another.
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-[var(--gap)] [@media(min-width:640px)_and_(max-height:560px)]:mt-0 [@media(min-width:640px)_and_(max-height:560px)]:border-l [@media(min-width:640px)_and_(max-height:560px)]:border-black/[0.06] [@media(min-width:640px)_and_(max-height:560px)]:pl-7">
                    {status === 'verification-link-sent' && (
                        <p
                            role="status"
                            className="mb-3 text-sm font-medium leading-6 text-red-900"
                        >
                            A new verification link has been sent to the email
                            address you provided during registration.
                        </p>
                    )}

                    <form onSubmit={submit} aria-busy={processing}>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex h-[var(--ctl)] w-full items-center justify-center rounded-xl bg-red-900 px-5 text-[15px] font-semibold text-white shadow-sm transition-[background-color,box-shadow,transform] hover:bg-red-800 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-900 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm"
                        >
                            {processing ? (
                                <>
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        className="mr-2 h-5 w-5 animate-spin motion-reduce:animate-none"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="9"
                                            stroke="currentColor"
                                            strokeOpacity="0.25"
                                            strokeWidth="3"
                                        />
                                        <path
                                            d="M21 12a9 9 0 00-9-9"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    Sending…
                                </>
                            ) : (
                                'Resend Verification Email'
                            )}
                        </button>
                    </form>

                    {/* Log out */}
                    <div className="mt-[calc(var(--gap)*0.9)] flex justify-center">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex min-h-[44px] items-center gap-1.5 rounded-lg text-sm font-medium text-red-900 transition-colors hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-900/25 focus-visible:ring-offset-2"
                        >
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                <path d="M16 17l5-5-5-5" />
                                <path d="M21 12H9" />
                            </svg>
                            Log out
                        </Link>
                    </div>
                </div>
            </div>
        </Guest>
    );
}