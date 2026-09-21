import { Head, useForm, usePage } from '@inertiajs/react';
import CashierLayout from '@/Layouts/CashierLayout';
import { FormEvent } from 'react';
import FlashMessage from '@/Components/FlashMessage';
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

        post('/cashier/customers', {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <CashierLayout>
            <Head title="Customer Registration" />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Customer Registration
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Register a new loyalty customer account.
                        </p>
                    </div>

                    <FlashMessage
                        success={flash.success}
                        error={flash.error}
                    />

                    {/* Registration Form */}
                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="border-b px-6 py-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Add Customer
                            </h2>

                            <p className="text-sm text-gray-500">
                                Enter the customer's information to create their
                                loyalty account.
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
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    placeholder="Enter first name"
                                    autoComplete="given-name"
                                />

                                {errors.first_name && (
                                    <p className="mt-1 text-sm text-red-600">
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
                                        setData('last_name', event.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    placeholder="Enter last name"
                                    autoComplete="family-name"
                                />

                                {errors.last_name && (
                                    <p className="mt-1 text-sm text-red-600">
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
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    placeholder="09XXXXXXXXX"
                                    autoComplete="tel"
                                />

                                <p className="mt-1 text-xs text-gray-500">
                                    Must contain 11 digits and start with 09.
                                </p>

                                {errors.phone_number && (
                                    <p className="mt-1 text-sm text-red-600">
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
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    placeholder="example@email.com"
                                    autoComplete="email"
                                />

                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 border-t pt-5">
                                <button
                                    type="button"
                                    onClick={() => reset()}
                                    disabled={processing}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Clear
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Adding...' : 'Add Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}
