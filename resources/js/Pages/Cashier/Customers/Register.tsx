import { Head, Link, useForm, usePage } from '@inertiajs/react';
import CashierLayout from '@/Layouts/CashierLayout';
import { FormEvent } from 'react';
import FlashMessage from '@/Components/FlashMessage';
import AdminPageHeader from '@/Components/AdminPageHeader';
import { PageProps } from '@/types';

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
    });

    const { flash } = usePage<PageProps>().props;

    const submit = (event: FormEvent) => {
        event.preventDefault();

        post(route('cashier.customers.store'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <CashierLayout>
            <Head title="Customer Registration" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <AdminPageHeader
                        eyebrow="Customer Management"
                        title="Customer Registration"
                        description="Register a new loyalty customer account."
                        action={
                            <Link
                                href={route('cashier.customers.index')}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                            >
                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                                Back to Records
                            </Link>
                        }
                    />

                    <FlashMessage
                        success={flash.success}
                        error={flash.error}
                    />

                    {/* Registration Form */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                Add Customer
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Enter the customer&apos;s information to create
                                their loyalty account.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5 p-6">
                            {/* First Name */}
                            <div>
                                <label
                                    htmlFor="first_name"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    First Name
                                </label>

                                <input
                                    id="first_name"
                                    type="text"
                                    value={data.first_name}
                                    onChange={(event) =>
                                        setData(
                                            'first_name',
                                            event.target.value,
                                        )
                                    }
                                    autoComplete="given-name"
                                    required
                                    aria-invalid={!!errors.first_name}
                                    aria-describedby={
                                        errors.first_name
                                            ? 'first_name-error'
                                            : undefined
                                    }
                                    placeholder="Enter first name"
                                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-400 ${
                                        errors.first_name
                                            ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                    }`}
                                />

                                {errors.first_name && (
                                    <p
                                        id="first_name-error"
                                        role="alert"
                                        className="mt-1 text-sm text-red-600"
                                    >
                                        {errors.first_name}
                                    </p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div>
                                <label
                                    htmlFor="last_name"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Last Name
                                </label>

                                <input
                                    id="last_name"
                                    type="text"
                                    value={data.last_name}
                                    onChange={(event) =>
                                        setData(
                                            'last_name',
                                            event.target.value,
                                        )
                                    }
                                    autoComplete="family-name"
                                    required
                                    aria-invalid={!!errors.last_name}
                                    aria-describedby={
                                        errors.last_name
                                            ? 'last_name-error'
                                            : undefined
                                    }
                                    placeholder="Enter last name"
                                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-400 ${
                                        errors.last_name
                                            ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                    }`}
                                />

                                {errors.last_name && (
                                    <p
                                        id="last_name-error"
                                        role="alert"
                                        className="mt-1 text-sm text-red-600"
                                    >
                                        {errors.last_name}
                                    </p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label
                                    htmlFor="phone_number"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Phone Number
                                </label>

                                <input
                                    id="phone_number"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={11}
                                    value={data.phone_number}
                                    onChange={(event) =>
                                        setData(
                                            'phone_number',
                                            event.target.value.replace(
                                                /\D/g,
                                                '',
                                            ),
                                        )
                                    }
                                    autoComplete="tel"
                                    required
                                    aria-invalid={!!errors.phone_number}
                                    aria-describedby={
                                        errors.phone_number
                                            ? 'phone_number-error'
                                            : 'phone_number-hint'
                                    }
                                    placeholder="09XXXXXXXXX"
                                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-400 ${
                                        errors.phone_number
                                            ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                    }`}
                                />

                                <p
                                    id="phone_number-hint"
                                    className="mt-1 text-xs text-gray-500"
                                >
                                    Must contain 11 digits and start with 09.
                                </p>

                                {errors.phone_number && (
                                    <p
                                        id="phone_number-error"
                                        role="alert"
                                        className="mt-1 text-sm text-red-600"
                                    >
                                        {errors.phone_number}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Email{' '}
                                    <span className="font-normal text-gray-400">
                                        (Optional)
                                    </span>
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(event) =>
                                        setData('email', event.target.value)
                                    }
                                    autoComplete="email"
                                    aria-invalid={!!errors.email}
                                    aria-describedby={
                                        errors.email
                                            ? 'email-error'
                                            : undefined
                                    }
                                    placeholder="example@email.com"
                                    className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-gray-400 ${
                                        errors.email
                                            ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-1 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                    }`}
                                />

                                {errors.email && (
                                    <p
                                        id="email-error"
                                        role="alert"
                                        className="mt-1 text-sm text-red-600"
                                    >
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => reset()}
                                    disabled={processing}
                                    className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Clear
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <svg
                                                className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                aria-hidden="true"
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
                                            Adding…
                                        </>
                                    ) : (
                                        'Add Customer'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}