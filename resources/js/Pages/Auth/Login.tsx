import { Head, Link, useForm } from '@inertiajs/react';

import { FormEventHandler, useState } from 'react';

import Guest from '@/Layouts/GuestLayout';

interface LoginProps {
    status?: string;
}

type Role = 'admin' | 'cashier';

const ROLES: Record<
    Role,
    {
        label: string;
        fieldLabel: string;
        placeholder: string;
        description: string;
        inputType: 'email' | 'text';
        buttonLabel: string;
    }
> = {
    admin: {
        label: 'Admin',
        fieldLabel: 'Email Address',
        placeholder: 'Enter your email address',
        description: 'Sign in to manage customers, cashiers, rewards, and system records.',
        inputType: 'email',
        buttonLabel: 'Sign in as Admin',
    },
    cashier: {
        label: 'Cashier',
        fieldLabel: 'Username',
        placeholder: 'Enter your username',
        description: 'Sign in to register customers, process purchases, and redeem rewards.',
        inputType: 'text',
        buttonLabel: 'Sign in as Cashier',
    },
};

function FieldError({
    id,
    message,
}: {
    id: string;
    message?: string;
}) {
    if (!message) {
        return null;
    }

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

function RoleIcon({ role }: { role: Role }) {
    if (role === 'admin') {
        return (
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[17px] w-[17px]"
            >
                <path d="M12 3.5l7 3v4.8c0 4.1-2.8 7.8-7 9.7-4.2-1.9-7-5.6-7-9.7V6.5l7-3z" />
                <path d="M9.2 12l1.9 1.9 3.8-4" />
            </svg>
        );
    }

    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[17px] w-[17px]"
        >
            <path d="M6 4h12v16l-3-1.8-3 1.8-3-1.8L6 20V4z" />
            <path d="M9 8.5h6M9 12h4.5" />
        </svg>
    );
}

export default function Login({ status }: LoginProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        setError,
        clearErrors,
        reset,
    } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const [role, setRole] = useState<Role>('cashier');
    const [showPassword, setShowPassword] = useState(false);

    const config = ROLES[role];

    const selectRole = (nextRole: Role) => {
        if (nextRole === role) {
            return;
        }

        setRole(nextRole);
        setData('login', '');
        clearErrors();
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        const loginValue = data.login.trim();

        if (!loginValue) {
            setError('login', `${config.fieldLabel} is required.`);
            return;
        }

        if (!data.password) {
            setError('password', 'Password is required.');
            return;
        }

        if (
            role === 'admin' &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginValue)
        ) {
            setError(
                'login',
                'Please enter a valid email address for Admin login.',
            );
            return;
        }

        if (
            role === 'cashier' &&
            loginValue.includes('@')
        ) {
            setError(
                'login',
                'Please use your Cashier username, not an email address.',
            );
            return;
        }

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <Guest fitScreen>
            <Head title="Staff Login" />

            {/* Single column by default; two columns on short, wide screens */}
            <div className="grid p-[var(--pad)] [@media(min-width:640px)_and_(max-height:560px)]:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] [@media(min-width:640px)_and_(max-height:560px)]:items-center">
                {/* Heading + role selector */}
                <div className="[@media(min-width:640px)_and_(max-height:560px)]:pr-7">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-800">
                            Account Access
                        </p>

                        <h1 className="mt-2.5 text-[length:var(--h1)] font-semibold leading-[1.1] tracking-[-0.03em] text-gray-950">
                            Welcome back
                        </h1>

                        {status ? (
                            <p
                                role="status"
                                className="mt-2 max-w-sm text-sm font-medium leading-6 text-red-900"
                            >
                                {status}
                            </p>
                        ) : (
                            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500 [@media(max-width:639px)_and_(max-height:699px)]:hidden [@media(min-width:640px)_and_(min-height:561px)_and_(max-height:699px)]:hidden">
                                {config.description}
                            </p>
                        )}
                    </div>

                    {/* Role Selector */}
                    <fieldset className="mt-[calc(var(--gap)*1.4)]">
                        <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                            Sign in as
                        </legend>

                        <div className="relative grid grid-cols-2 rounded-xl border border-black/[0.06] bg-[#f7f7f8] p-1">
                            {/* Sliding active pill */}
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-[9px] bg-white shadow-sm ring-1 ring-black/[0.04] transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.5,1)] motion-reduce:transition-none ${
                                    role === 'cashier'
                                        ? 'translate-x-full'
                                        : 'translate-x-0'
                                }`}
                            />

                            {(Object.keys(ROLES) as Role[]).map((roleOption) => {
                                const isActive = role === roleOption;

                                return (
                                    <label
                                        key={roleOption}
                                        className="relative z-10 cursor-pointer"
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={roleOption}
                                            checked={isActive}
                                            onChange={() =>
                                                selectRole(roleOption)
                                            }
                                            className="sr-only"
                                        />

                                        <span
                                            className={`flex min-h-[44px] items-center justify-center gap-2 rounded-[9px] px-3 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none ${
                                                isActive
                                                    ? 'text-red-900'
                                                    : 'text-gray-500 hover:text-gray-800'
                                            } focus-within:ring-2 focus-within:ring-red-900/20`}
                                        >
                                            <span
                                                className={`transition-transform duration-300 motion-reduce:transition-none ${
                                                    isActive
                                                        ? 'scale-110'
                                                        : 'scale-100'
                                                }`}
                                            >
                                                <RoleIcon role={roleOption} />
                                            </span>
                                            {ROLES[roleOption].label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </fieldset>
                </div>

                {/* Form */}
                <form
                    onSubmit={submit}
                    noValidate
                    aria-busy={processing}
                    className="mt-[var(--gap)] [@media(min-width:640px)_and_(max-height:560px)]:mt-0 [@media(min-width:640px)_and_(max-height:560px)]:border-l [@media(min-width:640px)_and_(max-height:560px)]:border-black/[0.06] [@media(min-width:640px)_and_(max-height:560px)]:pl-7"
                >
                    {/* Login Identifier */}
                    <div>
                        <label
                            htmlFor="login"
                            className="mb-1.5 block text-sm font-medium text-gray-800"
                        >
                            {config.fieldLabel}
                        </label>

                        <input
                            id="login"
                            name="login"
                            type={config.inputType}
                            value={data.login}
                            onChange={(event) => {
                                setData('login', event.target.value);

                                if (errors.login) {
                                    clearErrors('login');
                                }
                            }}
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
                            autoFocus
                            required
                            aria-invalid={!!errors.login}
                            aria-describedby={
                                errors.login ? 'login-error' : undefined
                            }
                            className={`block h-[var(--ctl)] w-full rounded-xl border bg-[#f8f8f9] px-4 text-[15px] text-gray-950 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-gray-400 ${
                                errors.login
                                    ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'
                                    : 'border-black/[0.07] hover:border-black/[0.13] focus:border-red-900 focus:bg-white focus:ring-2 focus:ring-red-900/10'
                            }`}
                            placeholder={config.placeholder}
                        />

                        <div className="min-h-[1.375rem]">
                            <FieldError
                                id="login-error"
                                message={errors.login}
                            />
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
                                    setData(
                                        'password',
                                        event.target.value,
                                    );

                                    if (errors.password) {
                                        clearErrors('password');
                                    }
                                }}
                                autoComplete="current-password"
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
                                placeholder="Enter your password"
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
                            <FieldError
                                id="password-error"
                                message={errors.password}
                            />
                        </div>
                    </div>

                    {/* Remember / Forgot */}
                    <div className="flex min-h-[44px] items-center justify-between gap-3">
                        <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(event) =>
                                    setData(
                                        'remember',
                                        event.target.checked,
                                    )
                                }
                                className="h-[18px] w-[18px] rounded border-gray-300 text-red-900 focus:ring-2 focus:ring-red-900/20"
                            />

                            <span>Remember me</span>
                        </label>

                        <Link
                            href={route('password.request')}
                            className="flex min-h-[44px] items-center rounded-lg text-sm font-medium text-red-900 transition-colors hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-900/25 focus-visible:ring-offset-2"
                        >
                            Forgot password?
                        </Link>
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
                                Signing in…
                            </>
                        ) : (
                            config.buttonLabel
                        )}
                    </button>
                </form>
            </div>
        </Guest>
    );
}