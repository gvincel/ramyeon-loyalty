import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        phone_number: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('customer.login.store'), {
            onFinish: () => reset('password'),
        });
    };

    const handlePhoneChange = (value: string) => {
        const digitsOnly = value.replace(/\D/g, '').slice(0, 11);

        setData('phone_number', digitsOnly);
    };

    return (
        <GuestLayout fitScreen>
            <Head title="Customer Login" />

            <div className="flex flex-col">
                {/* Header */}
                <div className="border-b border-slate-100 px-6 py-6 sm:px-8 sm:py-7">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-100">
                            <span
                                className="material-symbols-outlined text-[22px] text-red-700"
                                aria-hidden="true"
                            >
                                loyalty
                            </span>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
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
                        Welcome back
                    </h1>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                        Sign in to check your points, available rewards, and
                        loyalty activity.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={submit}
                    noValidate
                    className="px-6 py-6 sm:px-8 sm:py-7"
                >
                    <div
                        className="space-y-4"
                        style={{ gap: 'var(--gap)' }}
                    >
                        {/* Phone Number */}
                        <div>
                            <label
                                htmlFor="phone_number"
                                className="mb-2 block text-sm font-medium text-slate-700"
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
                                autoFocus
                                className={`w-full rounded-xl border bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:ring-2 ${
                                    errors.phone_number
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                                        : 'border-slate-200 hover:border-slate-300 focus:border-red-500 focus:ring-red-100'
                                }`}
                                style={{ height: 'var(--ctl)' }}
                                aria-invalid={
                                    errors.phone_number ? 'true' : 'false'
                                }
                                aria-describedby={
                                    errors.phone_number
                                        ? 'phone-number-error'
                                        : undefined
                                }
                            />

                            {errors.phone_number && (
                                <p
                                    id="phone-number-error"
                                    className="mt-1.5 text-xs font-medium text-red-600"
                                >
                                    {errors.phone_number}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    placeholder="Enter your password"
                                    className={`w-full rounded-xl border bg-white px-4 pr-12 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:ring-2 ${
                                        errors.password
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                                            : 'border-slate-200 hover:border-slate-300 focus:border-red-500 focus:ring-red-100'
                                    }`}
                                    style={{ height: 'var(--ctl)' }}
                                    aria-invalid={
                                        errors.password ? 'true' : 'false'
                                    }
                                    aria-describedby={
                                        errors.password
                                            ? 'password-error'
                                            : undefined
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

                            {errors.password && (
                                <p
                                    id="password-error"
                                    className="mt-1.5 text-xs font-medium text-red-600"
                                >
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <label className="flex cursor-pointer items-center gap-3 pt-1">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                                className="h-4 w-4 rounded border-slate-300 text-red-700 accent-red-700 focus:ring-red-500"
                            />

                            <span className="text-sm text-slate-600">
                                Keep me signed in
                            </span>
                        </label>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-4 font-semibold text-white shadow-sm transition duration-200 hover:bg-red-800 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-red-700 disabled:hover:shadow-sm"
                            style={{ height: 'var(--ctl)' }}
                        >
                            {processing ? (
                                <>
                                    <span
                                        className="material-symbols-outlined animate-spin text-[19px]"
                                        aria-hidden="true"
                                    >
                                        progress_activity
                                    </span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <span
                                        className="material-symbols-outlined text-[19px]"
                                        aria-hidden="true"
                                    >
                                        arrow_forward
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Note */}
                <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4 text-center sm:px-8">
                    <p className="text-xs leading-5 text-slate-500">
                        Your account is managed by Ramyeon Corner staff.
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}