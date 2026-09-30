import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import GuestLayout from '@/Layouts/GuestLayout';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('customer.register.store'), {
            onFinish: () => {
                reset('password', 'password_confirmation');
            },
        });
    };

    const handlePhoneChange = (value: string) => {
        const digitsOnly = value.replace(/\D/g, '').slice(0, 11);

        setData('phone_number', digitsOnly);
    };

    const inputClass = (hasError: boolean) =>
        `w-full rounded-xl border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:ring-2 ${
            hasError
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-200 hover:border-slate-300 focus:border-red-500 focus:ring-red-100'
        }`;

    return (
        <GuestLayout wide>
            <Head title="Customer Registration" />

            <div className="flex flex-col">
                {/* Header */}
                <div className="border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-100 sm:h-10 sm:w-10">
                            <span
                                className="material-symbols-outlined text-[21px] text-red-700"
                                aria-hidden="true"
                            >
                                person_add
                            </span>
                        </div>

                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-700 sm:text-xs">
                                Customer Portal
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                                Ramyeon Corner Loyalty
                            </p>
                        </div>
                    </div>

                    <h1
                        className="font-semibold tracking-tight text-slate-900"
                        style={{ fontSize: 'var(--h1)' }}
                    >
                        Create your account
                    </h1>

                    <p className="mt-1.5 max-w-xl text-sm leading-5 text-slate-500">
                        Create your loyalty account to track points and view
                        available rewards.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={submit}
                    noValidate
                    className="px-5 py-5 sm:px-7 sm:py-6"
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* First Name */}
                        <div>
                            <label
                                htmlFor="first_name"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                First Name
                            </label>

                            <input
                                id="first_name"
                                type="text"
                                autoComplete="given-name"
                                value={data.first_name}
                                onChange={(e) =>
                                    setData('first_name', e.target.value)
                                }
                                placeholder="Juan"
                                autoFocus
                                className={inputClass(!!errors.first_name)}
                                style={{ height: 'var(--ctl)' }}
                                aria-invalid={
                                    errors.first_name ? 'true' : 'false'
                                }
                                aria-describedby={
                                    errors.first_name
                                        ? 'first-name-error'
                                        : undefined
                                }
                            />

                            {errors.first_name && (
                                <p
                                    id="first-name-error"
                                    className="mt-1 text-xs font-medium text-red-600"
                                >
                                    {errors.first_name}
                                </p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label
                                htmlFor="last_name"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Last Name
                            </label>

                            <input
                                id="last_name"
                                type="text"
                                autoComplete="family-name"
                                value={data.last_name}
                                onChange={(e) =>
                                    setData('last_name', e.target.value)
                                }
                                placeholder="Dela Cruz"
                                className={inputClass(!!errors.last_name)}
                                style={{ height: 'var(--ctl)' }}
                                aria-invalid={
                                    errors.last_name ? 'true' : 'false'
                                }
                                aria-describedby={
                                    errors.last_name
                                        ? 'last-name-error'
                                        : undefined
                                }
                            />

                            {errors.last_name && (
                                <p
                                    id="last-name-error"
                                    className="mt-1 text-xs font-medium text-red-600"
                                >
                                    {errors.last_name}
                                </p>
                            )}
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label
                                htmlFor="phone_number"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Mobile Number
                            </label>

                            <input
                                id="phone_number"
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel"
                                value={data.phone_number}
                                onChange={(e) =>
                                    handlePhoneChange(e.target.value)
                                }
                                placeholder="09XXXXXXXXX"
                                maxLength={11}
                                className={inputClass(!!errors.phone_number)}
                                style={{ height: 'var(--ctl)' }}
                                aria-invalid={
                                    errors.phone_number ? 'true' : 'false'
                                }
                                aria-describedby={
                                    errors.phone_number
                                        ? 'phone-number-error'
                                        : 'phone-number-hint'
                                }
                            />

                            {errors.phone_number ? (
                                <p
                                    id="phone-number-error"
                                    className="mt-1 text-xs font-medium text-red-600"
                                >
                                    {errors.phone_number}
                                </p>
                            ) : (
                                <p
                                    id="phone-number-hint"
                                    className="mt-1 text-[11px] leading-4 text-slate-400"
                                >
                                    Use your 11-digit mobile number.
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Email{' '}
                                <span className="font-normal text-slate-400">
                                    (optional)
                                </span>
                            </label>

                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                placeholder="you@example.com"
                                className={inputClass(!!errors.email)}
                                style={{ height: 'var(--ctl)' }}
                                aria-invalid={
                                    errors.email ? 'true' : 'false'
                                }
                                aria-describedby={
                                    errors.email
                                        ? 'email-error'
                                        : undefined
                                }
                            />

                            {errors.email && (
                                <p
                                    id="email-error"
                                    className="mt-1 text-xs font-medium text-red-600"
                                >
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    placeholder="Create a password"
                                    className={`${inputClass(!!errors.password)} pr-12`}
                                    style={{ height: 'var(--ctl)' }}
                                    aria-invalid={
                                        errors.password ? 'true' : 'false'
                                    }
                                    aria-describedby={
                                        errors.password
                                            ? 'password-error'
                                            : 'password-hint'
                                    }
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((current) => !current)
                                    }
                                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500"
                                    aria-label={
                                        showPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                >
                                    <span
                                        className="material-symbols-outlined text-[20px]"
                                        aria-hidden="true"
                                    >
                                        {showPassword
                                            ? 'visibility_off'
                                            : 'visibility'}
                                    </span>
                                </button>
                            </div>

                            {errors.password ? (
                                <p
                                    id="password-error"
                                    className="mt-1 text-xs font-medium text-red-600"
                                >
                                    {errors.password}
                                </p>
                            ) : (
                                <p
                                    id="password-hint"
                                    className="mt-1 text-[11px] leading-4 text-slate-400"
                                >
                                    At least 8 characters with letters and
                                    numbers.
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="password_confirmation"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Confirm Password
                            </label>

                            <div className="relative">
                                <input
                                    id="password_confirmation"
                                    type={
                                        showPasswordConfirmation
                                            ? 'text'
                                            : 'password'
                                    }
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Re-enter your password"
                                    className={`${inputClass(!!errors.password_confirmation)} pr-12`}
                                    style={{ height: 'var(--ctl)' }}
                                    aria-invalid={
                                        errors.password_confirmation
                                            ? 'true'
                                            : 'false'
                                    }
                                    aria-describedby={
                                        errors.password_confirmation
                                            ? 'password-confirmation-error'
                                            : undefined
                                    }
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswordConfirmation(
                                            (current) => !current,
                                        )
                                    }
                                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500"
                                    aria-label={
                                        showPasswordConfirmation
                                            ? 'Hide password confirmation'
                                            : 'Show password confirmation'
                                    }
                                >
                                    <span
                                        className="material-symbols-outlined text-[20px]"
                                        aria-hidden="true"
                                    >
                                        {showPasswordConfirmation
                                            ? 'visibility_off'
                                            : 'visibility'}
                                    </span>
                                </button>
                            </div>

                            {errors.password_confirmation && (
                                <p
                                    id="password-confirmation-error"
                                    className="mt-1 text-xs font-medium text-red-600"
                                >
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>

                        {/* Register Button */}
                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-[var(--gap)] flex h-[52px] min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 text-[15px] font-semibold text-white shadow-sm transition-[background-color,box-shadow,transform] hover:bg-red-800 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-red-700 disabled:hover:shadow-sm"
                            >
                                {processing ? (
                                    <>
                                        <span
                                            className="material-symbols-outlined animate-spin text-[20px]"
                                            aria-hidden="true"
                                        >
                                            progress_activity
                                        </span>

                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create account

                                        <span
                                            className="material-symbols-outlined text-[20px]"
                                            aria-hidden="true"
                                        >
                                            arrow_forward
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 text-center sm:px-7">
                    <p className="text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link
                            href={route('customer.login')}
                            className="font-semibold text-red-700 transition hover:text-red-800 focus:outline-none focus-visible:underline focus-visible:underline-offset-2"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}