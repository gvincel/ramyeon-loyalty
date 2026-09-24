import { Head, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminModal from '@/Components/AdminModal';
import StatusBadge from '@/Components/StatusBadge';
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

    const activeCustomerCount = customers.filter(
        (customer) => customer.is_active,
    ).length;

    const totalCustomerPoints = customers.reduce(
        (total, customer) => total + Number(customer.points),
        0,
    );

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
        <AdminLayout>
            <Head title="Customer Management" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
    
                    {/* Header */}
                    <AdminPageHeader
                        eyebrow="Customer Management"
                        title="Customers"
                        description="View and manage registered loyalty customers and their account status."
                        action={
                            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                    Records
                                </p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">
                                    {customers.length.toLocaleString('en-PH')}
                                </p>
                            </div>
                        }
                    />

                    <FlashMessage
                        success={flash.success}
                        error={flash.error}
                    />

                    {/* Summary */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Total Customers */}
                        <div className="relative overflow-hidden rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                            <div className="absolute left-0 top-0 h-full w-1 bg-red-600" />

                            <p className="text-sm font-medium text-gray-500">
                                Total Customers
                            </p>

                            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                                {customers.length.toLocaleString('en-PH')}
                            </p>

                            <p className="mt-2 text-xs text-gray-500">
                                Registered loyalty accounts
                            </p>
                        </div>

                        {/* Active Customers */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Active Customers
                            </p>

                            <div className="mt-2 flex items-end gap-2">
                                <p className="text-3xl font-bold tracking-tight text-gray-900">
                                    {activeCustomerCount.toLocaleString('en-PH')}
                                </p>

                                <span className="mb-1.5 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                                    Active
                                </span>
                            </div>

                            <p className="mt-2 text-xs text-gray-500">
                                Currently active loyalty accounts
                            </p>
                        </div>

                        {/* Total Points */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Total Points
                            </p>

                            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                                {totalCustomerPoints.toLocaleString('en-PH')}
                            </p>

                            <p className="mt-2 text-xs text-gray-500">
                                Current points across all customers
                            </p>
                        </div>
                    </div>

                    {/* Customer Table */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                        Customer Records
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Registered customers and their loyalty account details.
                                    </p>
                                </div>

                                <span className="hidden rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 ring-1 ring-gray-200 sm:inline-flex">
                                    {customers.length.toLocaleString('en-PH')} customer
                                    {customers.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px] text-left text-sm">
                                <thead className="border-b border-gray-100 bg-gray-50/70">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Customer
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Customer Code
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Phone
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Points
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {customers.length > 0 ? (
                                        customers.map((customer) => (
                                            <tr
                                                key={customer.id}
                                                className="transition-colors hover:bg-gray-50/70"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                                                            {customer.first_name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                            {customer.last_name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate font-semibold text-gray-900">
                                                                {customer.first_name}{' '}
                                                                {customer.last_name}
                                                            </p>

                                                            <p className="mt-0.5 max-w-[220px] truncate text-xs text-gray-500">
                                                                {customer.email || 'No email'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="inline-flex rounded-md bg-gray-50 px-2.5 py-1 font-medium text-gray-700 ring-1 ring-gray-200">
                                                        {customer.customer_code}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {customer.phone_number}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gray-900">
                                                        {Number(customer.points).toLocaleString(
                                                            'en-PH',
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <StatusBadge active={customer.is_active} />
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedCustomer(customer)
                                                            }
                                                            disabled={
                                                                !customer.qr_code ||
                                                                !customer.qr_code.is_active
                                                            }
                                                            className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
                                                        >
                                                            View QR
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(customer)
                                                            }
                                                            className="text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                toggleCustomerStatus(customer)
                                                            }
                                                            className={`text-sm font-semibold transition-colors ${
                                                                customer.is_active
                                                                    ? 'text-red-600 hover:text-red-700'
                                                                    : 'text-green-600 hover:text-green-700'
                                                            }`}
                                                        >
                                                            {customer.is_active
                                                                ? 'Deactivate'
                                                                : 'Activate'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-16 text-center"
                                            >
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                                    <svg
                                                        className="h-6 w-6"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.7"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
                                                        />

                                                        <circle
                                                            cx="9"
                                                            cy="7"
                                                            r="4"
                                                        />

                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                                                        />
                                                    </svg>
                                                </div>

                                                <p className="mt-4 font-semibold text-gray-800">
                                                    No customers found
                                                </p>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    No registered customers are currently
                                                    available.
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
                <AdminModal
                    title="Edit Customer"
                    description="Update the customer's account information."
                    onClose={() => {
                        if (!processing) {
                            reset();
                            setShowEditModal(false);
                            setEditCustomer(null);
                        }
                    }}
                    maxWidthClass="max-w-lg"
                    footer={
                        <>
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
                                form="edit-customer-form"
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    }
                >
                    <form
                        id="edit-customer-form"
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
                                    setData('first_name', event.target.value)
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
                                        event.target.value.replace(/\D/g, ''),
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
                    </form>
                </AdminModal>
            )}

            {/* QR Code Modal */}
            {selectedCustomer && selectedCustomer.qr_code && (
                <AdminModal
                    title="Customer QR Code"
                    description="Scan this QR code during a transaction."
                    onClose={closeQrModal}
                    maxWidthClass="max-w-sm"
                    footer={
                        <button
                            type="button"
                            onClick={closeQrModal}
                            className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                        >
                            Close
                        </button>
                    }
                >
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
                </AdminModal>
            )}
        </AdminLayout>
    );
}
