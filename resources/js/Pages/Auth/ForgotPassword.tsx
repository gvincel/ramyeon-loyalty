import Guest from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <Guest fitScreen>
            <Head title="Forgot Password" />

            <div className="grid p-[var(--pad)]">
                {/* Heading */}
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-800">
                        Account Recovery
                    </p>

                    <h1 className="mt-2.5 text-[length:var(--h1)] font-semibold leading-[1.1] tracking-[-0.03em] text-gray-950">
                        Forgot password?
                    </h1>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                        No problem. Just let us know your email address and we
                        will email you a password reset link that will allow
                        you to choose a new one.
                    </p>
                </div>

                {/* Status message */}
                {status && (
                    <p
                        role="status"
                        className="mt-3 max-w-sm text-sm font-medium leading-6 text-red-900"
                    >
                        {status}
                    </p>
                )}

                {/* Form */}
                <form
                    onSubmit={submit}
                    noValidate
                    aria-busy={processing}
                    className="mt-[var(--gap)]"
                >
                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1.5 block text-sm font-medium text-gray-800"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={(event) => {
                                setData('email', event.target.value);

                                if (errors.email) {
                                    clearErrors('email');
                                }
                            }}
                            autoComplete="email"
                            autoCapitalize="none"
                            spellCheck={false}
                            autoFocus
                            required
                            aria-invalid={!!errors.email}
                            aria-describedby={
                                errors.email ? 'email-error' : undefined
                            }
                            className={`block h-[var(--ctl)] w-full rounded-xl border bg-[#f8f8f9] px-4 text-[15px] text-gray-950 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-gray-400 ${
                                errors.email
                                    ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'
                                    : 'border-black/[0.07] hover:border-black/[0.13] focus:border-red-900 focus:bg-white focus:ring-2 focus:ring-red-900/10'
                            }`}
                            placeholder="Enter your email address"
                        />

                        <div className="min-h-[1.375rem]">
                            {errors.email && (
                                <p
                                    id="email-error"
                                    role="alert"
                                    className="pt-1 text-[13px] leading-[18px] text-red-700"
                                >
                                    {errors.email}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-[var(--gap)] flex h-[var(--ctl)] w-full items-center justify-center rounded-xl bg-red-900 px-5 text-[15px] font-semibold text-white shadow-sm transition-[background-color,box-shadow,transform] hover:bg-red-800 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-900 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm"
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
                            'Send Reset Link'
                        )}
                    </button>

                    {/* Back to login */}
                    <div className="mt-[calc(var(--gap)*0.9)] flex justify-center">
                        <Link
                            href={route('login')}
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
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                            Back to sign in
                        </Link>
                    </div>
                </form>
            </div>
        </Guest>
    );
}