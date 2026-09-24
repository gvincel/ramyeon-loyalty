import Guest from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            token: token,
            email: email,
            password: '',
            password_confirmation: '',
        });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <Guest fitScreen>
            <Head title="Reset Password" />

            {/* Single column by default; two columns on short, wide screens */}
            <div className="grid p-[var(--pad)] [@media(min-width:640px)_and_(max-height:560px)]:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] [@media(min-width:640px)_and_(max-height:560px)]:items-center">
                {/* Heading */}
                <div className="[@media(min-width:640px)_and_(max-height:560px)]:pr-7">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-800">
                        Account Recovery
                    </p>

                    <h1 className="mt-2.5 text-[length:var(--h1)] font-semibold leading-[1.1] tracking-[-0.03em] text-gray-950">
                        Set a new password
                    </h1>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500 [@media(max-width:639px)_and_(max-height:699px)]:hidden [@media(min-width:640px)_and_(min-height:561px)_and_(max-height:699px)]:hidden">
                        Choose a new password for your account.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={submit}
                    noValidate
                    aria-busy={processing}
                    className="mt-[var(--gap)] [@media(min-width:640px)_and_(max-height:560px)]:mt-0 [@media(min-width:640px)_and_(max-height:560px)]:border-l [@media(min-width:640px)_and_(max-height:560px)]:border-black/[0.06] [@media(min-width:640px)_and_(max-height:560px)]:pl-7"
                >
                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1.5 block text-sm font-medium text-gray-800"
                        >
                            Email
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
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
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

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-1.5 block text-sm font-medium text-gray-800"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(event) => {
                                    setData('password', event.target.value);

                                    if (errors.password) {
                                        clearErrors('password');
                                    }
                                }}
                                autoComplete="new-password"
                                autoFocus
                                required
                                aria-invalid={!!errors.password}
                                aria-describedby={
                                    errors.password
                                        ? 'password-error'
                                        : undefined
                                }
                                className={`block h-[var(--ctl)] w-full rounded-xl border bg-[#f8f8f9] px-4 pr-14 text-[15px] text-gray-950 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-gray-400 ${
                                    errors.password
                                        ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'
                                        : 'border-black/[0.07] hover:border-black/[0.13] focus:border-red-900 focus:bg-white focus:ring-2 focus:ring-red-900/10'
                                }`}
                                placeholder="Enter your new password"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword((current) => !current)
                                }
                                aria-label={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                                aria-pressed={showPassword}
                                className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-900/25"
                            >
                                {showPassword ? (
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-5 w-5"
                                    >
                                        <path d="M3 3l18 18" />
                                        <path d="M10.6 6.1A9.8 9.8 0 0112 6c5 0 8.5 4 9.5 6a12.6 12.6 0 01-2.7 3.4" />
                                        <path d="M6.6 6.7A12.8 12.8 0 002.5 12c1 2 4.5 6 9.5 6a9.6 9.6 0 003.4-.6" />
                                    </svg>
                                ) : (
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-5 w-5"
                                    >
                                        <path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <div className="min-h-[1.375rem]">
                            {errors.password && (
                                <p
                                    id="password-error"
                                    role="alert"
                                    className="pt-1 text-[13px] leading-[18px] text-red-700"
                                >
                                    {errors.password}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label
                            htmlFor="password_confirmation"
                            className="mb-1.5 block text-sm font-medium text-gray-800"
                        >
                            Confirm Password
                        </label>

                        <div className="relative">
                            <input
                                id="password_confirmation"
                                name="password_confirmation"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={(event) => {
                                    setData(
                                        'password_confirmation',
                                        event.target.value,
                                    );

                                    if (errors.password_confirmation) {
                                        clearErrors(
                                            'password_confirmation',
                                        );
                                    }
                                }}
                                autoComplete="new-password"
                                required
                                aria-invalid={
                                    !!errors.password_confirmation
                                }
                                aria-describedby={
                                    errors.password_confirmation
                                        ? 'password-confirmation-error'
                                        : undefined
                                }
                                className={`block h-[var(--ctl)] w-full rounded-xl border bg-[#f8f8f9] px-4 pr-14 text-[15px] text-gray-950 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-gray-400 ${
                                    errors.password_confirmation
                                        ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'
                                        : 'border-black/[0.07] hover:border-black/[0.13] focus:border-red-900 focus:bg-white focus:ring-2 focus:ring-red-900/10'
                                }`}
                                placeholder="Re-enter your new password"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword((current) => !current)
                                }
                                aria-label={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                                aria-pressed={showPassword}
                                className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-900/25"
                            >
                                {showPassword ? (
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-5 w-5"
                                    >
                                        <path d="M3 3l18 18" />
                                        <path d="M10.6 6.1A9.8 9.8 0 0112 6c5 0 8.5 4 9.5 6a12.6 12.6 0 01-2.7 3.4" />
                                        <path d="M6.6 6.7A12.8 12.8 0 002.5 12c1 2 4.5 6 9.5 6a9.6 9.6 0 003.4-.6" />
                                    </svg>
                                ) : (
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-5 w-5"
                                    >
                                        <path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <div className="min-h-[1.375rem]">
                            {errors.password_confirmation && (
                                <p
                                    id="password-confirmation-error"
                                    role="alert"
                                    className="pt-1 text-[13px] leading-[18px] text-red-700"
                                >
                                    {errors.password_confirmation}
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
                                Resetting…
                            </>
                        ) : (
                            'Reset Password'
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