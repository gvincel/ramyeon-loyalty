import CustomerAuthLayout from '@/Layouts/CustomerAuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null;
    return (
        <p
            id={id}
            role="alert"
            className="pt-1 text-[13px] leading-[18px] text-red-700"
        >
            {message}
        </p>
    );
}

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

    const handleNameChange = (
        field: 'first_name' | 'last_name',
        value: string,
    ) => {
        // Allow Unicode letters, combining marks, spaces,
        // apostrophes, periods, and hyphens.
        if (/^[\p{L}\p{M} .'-]*$/u.test(value)) {
            setData(field, value);
        }
    };

    return (
        <CustomerAuthLayout>
            <Head title="Customer Registration" />

            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-semibold leading-[1.1] tracking-tight text-gray-950">
                    Create your account
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                    Join our loyalty program to earn points and redeem exclusive
                    rewards.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={submit} noValidate aria-busy={processing}>
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                    {/* First Name */}
                    <div>
                        <label
                            htmlFor="first_name"
                            className="mb-1.5 block text-sm font-medium text-gray-800"
                        >
                            First Name
                        </label>
                        <input
                            id="first_name"
                            type="text"
                            autoComplete="given-name"
                            value={data.first_name}
                            onChange={(e) =>
                                handleNameChange('first_name', e.target.value)
                            }
                            required
                            aria-invalid={!!errors.first_name}
                            aria-describedby={
                                errors.first_name
                                    ? 'first-name-error'
                                    : undefined
                            }
                            className={`block h-12 w-full rounded-xl border bg-[#f8f8f9] px-4 text-[15px] text-gray-950 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-gray-400 ${
                                errors.first_name
                                    ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'
                                    : 'border-black/[0.07] hover:border-black/[0.13] focus:border-red-900 focus:bg-white focus:ring-2 focus:ring-red-900/10'
                            }`}
                            placeholder="Juan"
                        />
                        <div className="min-h-[1.375rem]">
                            <FieldError
                                id="first-name-error"
                                message={errors.first_name}
                            />
                        </div>
                    </div>

                    {/* Last Name */}
                    <div>
                        <label
                            htmlFor="last_name"
                            className="mb-1.5 block text-sm font-medium text-gray-800"
                        >
                            Last Name
                        </label>
                        <input
                            id="last_name"
                            type="text"
                            autoComplete="family-name"
                            value={data.last_name}
                            onChange={(e) =>
                                handleNameChange('last_name', e.target.value)
                            }
                            required
                            aria-invalid={!!errors.last_name}
                            aria-describedby={
                                errors.last_name ? 'last-name-error' : undefined
                            }
                            className={`block h-12 w-full rounded-xl border bg-[#f8f8f9] px-4 text-[15px] text-gray-950 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-gray-400 ${
                                errors.last_name
                                    ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'
                                    : 'border-black/[0.07] hover:border-black/[0.13] focus:border-red-900 focus:bg-white focus:ring-2 focus:ring-red-900/10'
                            }`}
                            placeholder="Dela Cruz"
                        />
                        <div className="min-h-[1.375rem]">
                            <FieldError
                                id="last-name-error"
                                message={errors.last_name}
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Number */}
                <div>
                    <label
                        htmlFor="phone_number"
                        className="mb-1.5 block text-sm font-medium text-gray-800"
                    >
                        Mobile Number
                    </label>
                    <input
                        id="phone_number"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={data.phone_number}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        required
                        maxLength={11}
                        aria-invalid={!!errors.phone_number}
                        aria-describedby={
                            errors.phone_number
                                ? 'phone-number-error'
                                : 'phone-number-hint'
                        }
                        className={`block h-12 w-full rounded-xl border bg-[#f8f8f9] px-4 text-[15px] text-gray-950 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-gray-400 ${
                            errors.phone_number
                                ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'
                                : 'border-black/[0.07] hover:border-black/[0.13] focus:border-red-900 focus:bg-white focus:ring-2 focus:ring-red-900/10'
                        }`}
                        placeholder="09XXXXXXXXX"
                    />
                    <div className="min-h-[1.375rem]">
                        {errors.phone_number ? (
                            <FieldError
                                id="phone-number-error"
                                message={errors.phone_number}
                            />
                        ) : (
                            <p
                                id="phone-number-hint"
                                className="pt-1 text-[13px] leading-[18px] text-gray-400"
                            >
                                Use your 11-digit mobile number.
                            </p>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label
                        htmlFor="email"
                        className="mb-1.5 block text-sm font-medium text-gray-800"
                    >
                        Email{' '}
                        <span className="font-normal text-gray-400">
                            (optional)
                        </span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        aria-invalid={!!errors.email}
                        aria-describedby={
                            errors.email ? 'email-error' : undefined
                        }
                        className={`block h-12 w-full rounded-xl border bg-[#f8f8f9] px-4 text-[15px] text-gray-950 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-gray-400 ${
                            errors.email
                                ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'
                                : 'border-black/[0.07] hover:border-black/[0.13] focus:border-red-900 focus:bg-white focus:ring-2 focus:ring-red-900/10'
                        }`}
                        placeholder="you@example.com"
                    />
                    <div className="min-h-[1.375rem]">
                        <FieldError id="email-error" message={errors.email} />
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
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            required
                            aria-invalid={!!errors.password}
                            aria-describedby={
                                errors.password
                                    ? 'password-error'
                                    : 'password-hint'
                            }
                            className={`block h-12 w-full rounded-xl border bg-[#f8f8f9] px-4 pr-14 text-[15px] text-gray-950 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-gray-400 ${
                                errors.password
                                    ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'
                                    : 'border-black/[0.07] hover:border-black/[0.13] focus:border-red-900 focus:bg-white focus:ring-2 focus:ring-red-900/10'
                            }`}
                            placeholder="Create a password"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword((current) => !current)
                            }
                            aria-label={
                                showPassword ? 'Hide password' : 'Show password'
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
                        {errors.password ? (
                            <FieldError
                                id="password-error"
                                message={errors.password}
                            />
                        ) : (
                            <p
                                id="password-hint"
                                className="pt-1 text-[13px] leading-[18px] text-gray-400"
                            >
                                At least 8 characters with letters and numbers.
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
                            type={
                                showPasswordConfirmation ? 'text' : 'password'
                            }
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                            aria-invalid={!!errors.password_confirmation}
                            aria-describedby={
                                errors.password_confirmation
                                    ? 'password-confirmation-error'
                                    : undefined
                            }
                            className={`block h-12 w-full rounded-xl border bg-[#f8f8f9] px-4 pr-14 text-[15px] text-gray-950 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-gray-400 ${
                                errors.password_confirmation
                                    ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'
                                    : 'border-black/[0.07] hover:border-black/[0.13] focus:border-red-900 focus:bg-white focus:ring-2 focus:ring-red-900/10'
                            }`}
                            placeholder="Re-enter your password"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowPasswordConfirmation(
                                    (current) => !current,
                                )
                            }
                            aria-label={
                                showPasswordConfirmation
                                    ? 'Hide password confirmation'
                                    : 'Show password confirmation'
                            }
                            aria-pressed={showPasswordConfirmation}
                            className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-900/25"
                        >
                            {showPasswordConfirmation ? (
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
                        <FieldError
                            id="password-confirmation-error"
                            message={errors.password_confirmation}
                        />
                    </div>
                </div>

                {/* Submit Button (Fixed height: h-12) */}
                <button
                    type="submit"
                    disabled={processing}
                    className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-red-900 px-5 text-[15px] font-semibold text-white shadow-sm transition-[background-color,box-shadow,transform] hover:bg-red-800 hover:shadow-md focus:outline-none active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm"
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
                            Creating account…
                        </>
                    ) : (
                        'Create account'
                    )}
                </button>

                {/* Footer Link */}
                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link
                        href={route('customer.login')}
                        className="font-semibold text-red-900 transition hover:text-red-800"
                    >
                        Sign in
                    </Link>
                </p>
            </form>
        </CustomerAuthLayout>
    );
}
