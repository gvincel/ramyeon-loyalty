import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import CustomerAuthLayout from '@/Layouts/CustomerAuthLayout';

function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null;
    return (
        <p id={id} role="alert" className="pt-1 text-[13px] leading-[18px] text-red-700">
            {message}
        </p>
    );
}

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
        <CustomerAuthLayout>
            <Head title="Customer Login" />

            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-semibold leading-[1.1] tracking-tight text-gray-950">
                    Welcome!
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                    Sign in to check your points, available rewards, and loyalty activity.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={submit} noValidate aria-busy={processing}>
                {/* Mobile Number */}
                <div>
                    <label htmlFor="phone_number" className="mb-1.5 block text-sm font-medium text-gray-800">
                        Mobile Number
                    </label>
                    <input
                        id="phone_number"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={data.phone_number}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        autoFocus
                        required
                        maxLength={11}
                        aria-invalid={!!errors.phone_number}
                        aria-describedby={errors.phone_number ? 'phone-number-error' : undefined}
                        className={`block h-12 w-full rounded-xl border bg-[#f8f8f9] px-4 text-[15px] text-gray-950 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-gray-400 ${
                            errors.phone_number
                                ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'
                                : 'border-black/[0.07] hover:border-black/[0.13] focus:border-red-900 focus:bg-white focus:ring-2 focus:ring-red-900/10'
                        }`}
                        placeholder="09XXXXXXXXX"
                    />
                    <div className="min-h-[1.375rem]">
                        <FieldError id="phone-number-error" message={errors.phone_number} />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-800">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            aria-invalid={!!errors.password}
                            aria-describedby={errors.password ? 'password-error' : undefined}
                            className={`block h-12 w-full rounded-xl border bg-[#f8f8f9] px-4 pr-14 text-[15px] text-gray-950 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-gray-400 ${
                                errors.password
                                    ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'
                                    : 'border-black/[0.07] hover:border-black/[0.13] focus:border-red-900 focus:bg-white focus:ring-2 focus:ring-red-900/10'
                            }`}
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((current) => !current)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            aria-pressed={showPassword}
                            className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-900/25"
                        >
                            {showPassword ? (
                                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                    <path d="M3 3l18 18" />
                                    <path d="M10.6 6.1A9.8 9.8 0 0112 6c5 0 8.5 4 9.5 6a12.6 12.6 0 01-2.7 3.4" />
                                    <path d="M6.6 6.7A12.8 12.8 0 002.5 12c1 2 4.5 6 9.5 6a9.6 9.6 0 003.4-.6" />
                                </svg>
                            ) : (
                                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                    <path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <div className="min-h-[1.375rem]">
                        <FieldError id="password-error" message={errors.password} />
                    </div>
                </div>

                {/* Remember Me */}
                <div className="flex min-h-[44px] items-center justify-between gap-3">
                    <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(event) => setData('remember', event.target.checked)}
                            className="h-[18px] w-[18px] rounded border-gray-300 text-red-900 focus:ring-2 focus:ring-red-900/20"
                        />
                        <span>Keep me signed in</span>
                    </label>
                </div>

                {/* Submit Button (Fixed height: h-12) */}
                <button
                    type="submit"
                    disabled={processing}
                    className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-red-900 px-5 text-[15px] font-semibold text-white shadow-sm transition-[background-color,box-shadow,transform] hover:bg-red-800 hover:shadow-md focus:outline-none active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm"
                >
                    {processing ? (
                        <>
                            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="mr-2 h-5 w-5 animate-spin motion-reduce:animate-none">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                                <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            Signing in…
                        </>
                    ) : (
                        'Sign in'
                    )}
                </button>

                {/* Footer Link */}
                <p className="mt-6 text-center text-sm text-gray-500">
                    Don&apos;t have an account?{' '}
                    <Link href={route('customer.register')} className="font-semibold text-red-900 transition hover:text-red-800">
                        Register here
                    </Link>
                </p>
            </form>
        </CustomerAuthLayout>
    );
}