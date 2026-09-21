import { Head, router, useForm, usePage } from '@inertiajs/react';
import FlashMessage from '@/Components/FlashMessage';
import { PageProps } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

interface CustomerQrCode {
    id: number;
    qr_token: string;
    is_active: boolean;
    created_at: string;
    revoked_at: string | null;
}

interface Customer {
    id: number;
    customer_code: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string | null;
    points: number;
    is_active: boolean;
    qr_code: CustomerQrCode | null;
}

interface Props {
    customers: Customer[];
}

export default function Index({ customers }: Props) {
    const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

    const [editCustomer, setEditCustomer] =
        useState<Customer | null>(null);

    const [showEditModal, setShowEditModal] = useState(false);

    const { flash } = usePage<PageProps>().props;

    const { data, setData, put, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
    });

    const openEditModal = (customer: Customer) => {
        setEditCustomer(customer);

        setData({
            first_name: customer.first_name,
            last_name: customer.last_name,
            phone_number: customer.phone_number,
            email: customer.email ?? '',
        });

        setShowEditModal(true);
    };

    const closeQrModal = () => {
        setSelectedCustomer(null);
    };

    const toggleCustomerStatus = (customer: Customer) => {
        const action = customer.is_active ? 'deactivate' : 'activate';

        if (!confirm(`Are you sure you want to ${action} this customer?`)) {
            return;
        }

        router.patch(`/admin/customers/${customer.id}/status`);
    };

    return (
        <>
            <Head title="Customer Management" />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    <FlashMessage
                        success={flash.success}
                        error={flash.error}
                    />
                    
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Customer Management
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage your registered loyalty customers.
                            </p>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Total Customers</p>

                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {customers.length}
                        </p>
                    </div>

                    {/* Customer Table */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-700">
                                            Customer
                                        </th>

                                        <th className="px-6 py-4 font-semibold text-gray-700">
                                            Customer Code
                                        </th>

                                        <th className="px-6 py-4 font-semibold text-gray-700">
                                            Phone
                                        </th>

                                        <th className="px-6 py-4 font-semibold text-gray-700">
                                            Points
                                        </th>

                                        <th className="px-6 py-4 font-semibold text-gray-700">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-right font-semibold text-gray-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {customers.length > 0 ? (
                                        customers.map((customer) => (
                                            <tr
                                                key={customer.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {
                                                                customer.first_name
                                                            }{' '}
                                                            {customer.last_name}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            {customer.email ||
                                                                'No email'}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 font-medium text-gray-700">
                                                    {customer.customer_code}
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {customer.phone_number}
                                                </td>

                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                    {customer.points}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            customer.is_active
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        {customer.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedCustomer(
                                                                    customer,
                                                                )
                                                            }
                                                            disabled={
                                                                !customer.qr_code ||
                                                                !customer
                                                                    .qr_code
                                                                    .is_active
                                                            }
                                                            className="text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
                                                        >
                                                            View QR
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    customer,
                                                                )
                                                            }
                                                            className="text-sm font-medium text-gray-600 hover:text-gray-800"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCustomerStatus(customer)}
                                                            className={`text-sm font-medium ${
                                                                customer.is_active
                                                                    ? 'text-red-600 hover:text-red-700'
                                                                    : 'text-green-600 hover:text-green-700'
                                                            }`}
                                                        >
                                                            {customer.is_active ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-12 text-center"
                                            >
                                                <p className="font-medium text-gray-900">
                                                    No customers found
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    No registered customers are
                                                    currently available.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Customer Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Edit Customer
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Update the customer's account information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    if (!processing) {
                                        reset();
                                        setShowEditModal(false);
                                        setEditCustomer(null);
                                    }
                                }}
                                disabled={processing}
                                className="text-2xl text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                            >
                                ×
                            </button>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();

                                if (!editCustomer) {
                                    return;
                                }

                                put(`/admin/customers/${editCustomer.id}`, {
                                    onSuccess: () => {
                                        reset();
                                        setShowEditModal(false);
                                        setEditCustomer(null);
                                    },
                                });
                            }}
                            className="space-y-5 p-6"
                        >
                            {/* First Name */}
                            <div>
                                <label
                                    htmlFor="edit_first_name"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    First Name
                                </label>

                                <input
                                    id="edit_first_name"
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
                                    htmlFor="edit_last_name"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Last Name
                                </label>

                                <input
                                    id="edit_last_name"
                                    type="text"
                                    value={data.last_name}
                                    onChange={(event) =>
                                        setData('last_name', event.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    placeholder="Enter last name"
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
                                    htmlFor="edit_phone_number"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Phone Number
                                </label>

                                <input
                                    id="edit_phone_number"
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
                                    htmlFor="edit_email"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Email{' '}
                                    <span className="font-normal text-gray-400">
                                        (Optional)
                                    </span>
                                </label>

                                <input
                                    id="edit_email"
                                    type="email"
                                    value={data.email}
                                    onChange={(event) =>
                                        setData('email', event.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                    placeholder="example@email.com"
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
                                    onClick={() => {
                                        if (!processing) {
                                            reset();
                                            setShowEditModal(false);
                                            setEditCustomer(null);
                                        }
                                    }}
                                    disabled={processing}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {selectedCustomer && selectedCustomer.qr_code && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Customer QR Code
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Scan this QR code during a transaction.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeQrModal}
                                className="text-2xl text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="flex flex-col items-center px-6 py-6">
                            <div className="rounded-xl border border-gray-200 bg-white p-4">
                                <QRCodeSVG
                                    value={selectedCustomer.qr_code.qr_token}
                                    size={240}
                                    level="H"
                                />
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-gray-900">
                                {selectedCustomer.first_name}{' '}
                                {selectedCustomer.last_name}
                            </h3>

                            <p className="mt-1 text-sm font-medium text-gray-500">
                                {selectedCustomer.customer_code}
                            </p>

                            <p className="mt-4 text-center text-xs text-gray-400">
                                Keep this QR code private. It is used to
                                identify the customer's loyalty account.
                            </p>
                        </div>

                        <div className="border-t px-6 py-4">
                            <button
                                type="button"
                                onClick={closeQrModal}
                                className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
