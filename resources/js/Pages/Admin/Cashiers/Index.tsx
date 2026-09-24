import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminModal from '@/Components/AdminModal';
import StatusBadge from '@/Components/StatusBadge';
import { FormEventHandler, useState } from 'react';

type Cashier = {
    id: number;
    name: string;
    username: string;
    email: string | null;
    role: 'cashier';
    is_active: boolean;
    created_at: string;
};

type Props = {
    cashiers: Cashier[];
};

export default function Index({ cashiers }: Props) {
    const [editingCashier, setEditingCashier] = useState<Cashier | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, setData, post, put, patch, processing, errors, reset } =
        useForm({
            name: '',
            username: '',
            password: '',
            confirm_password: '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.cashiers.store'), {
            onSuccess: () => {
                reset();
                setShowPassword(false);
                setShowConfirmPassword(false);
                setShowCreateModal(false);
            },
        });
    };

    const startEditing = (cashier: Cashier) => {
        setEditingCashier(cashier);

        setData({
            name: cashier.name,
            username: cashier.username,
            password: '',
            confirm_password: '',
        });
    };

    const cancelEditing = () => {
        setEditingCashier(null);
        reset();
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const openCreateModal = () => {
        setEditingCashier(null);
        reset();
        setShowPassword(false);
        setShowConfirmPassword(false);
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        if (processing) {
            return;
        }

        setShowCreateModal(false);
        reset();
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const updateCashier: FormEventHandler = (e) => {
        e.preventDefault();

        if (!editingCashier) {
            return;
        }

        put(route('admin.cashiers.update', editingCashier.id), {
            onSuccess: () => {
                reset();
                setShowPassword(false);
                setShowConfirmPassword(false);
                setShowCreateModal(false);
                setEditingCashier(null);
            },
        });
    };

    const toggleStatus = (cashier: Cashier) => {
        const action = cashier.is_active ? 'deactivate' : 'activate';

        if (
            !window.confirm(
                `Are you sure you want to ${action} ${cashier.name}'s account?`,
            )
        ) {
            return;
        }

        patch(route('admin.cashiers.toggle-status', cashier.id));
    };

    return (
        <AdminLayout>
            <Head title="Cashier Management" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Page Header */}
                    <AdminPageHeader
                        eyebrow="Account Management"
                        title="Cashiers"
                        description="Create and manage cashier accounts for Ramyeon Corner."
                        action={
                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
                                    <path d="M12 5v14" />
                                    <path d="M5 12h14" />
                                </svg>
                                Add Cashier
                            </button>
                        }
                    />

                    {/* Edit Cashier */}
                    {editingCashier && (
                        <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            {/* Edit Header */}
                            <div className="border-b border-gray-200 px-6 py-5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                                    Editing Account
                                </p>

                                <h2 className="mt-1 text-xl font-semibold text-gray-900">
                                    Edit Cashier
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Update the account information for {editingCashier.name}.
                                </p>
                            </div>

                            {/* Edit Form */}
                            <form
                                onSubmit={updateCashier}
                                className="grid gap-5 px-6 py-6 sm:grid-cols-2"
                            >
                                {/* Full Name */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Full Name
                                    </label>

                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        className="mt-1.5 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                        placeholder="Juan Dela Cruz"
                                    />

                                    {errors.name && (
                                        <p className="mt-1.5 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Username */}
                                <div>
                                    <label
                                        htmlFor="username"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Username
                                    </label>

                                    <input
                                        id="username"
                                        type="text"
                                        value={data.username}
                                        onChange={(e) =>
                                            setData('username', e.target.value)
                                        }
                                        className="mt-1.5 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                        placeholder="juan123"
                                    />

                                    {errors.username && (
                                        <p className="mt-1.5 text-sm text-red-600">
                                            {errors.username}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={cancelEditing}
                                        disabled={processing}
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Add Cashier Modal */}
                    {showCreateModal && (
                        <AdminModal
                            title="Add Cashier"
                            description="Create a new account that staff can use to log in."
                            onClose={closeCreateModal}
                            maxWidthClass="max-w-2xl"
                            footer={
                                <>
                                    <button
                                        type="button"
                                        onClick={closeCreateModal}
                                        disabled={processing}
                                        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        form="create-cashier-form"
                                        disabled={processing}
                                        className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Cashier'}
                                    </button>
                                </>
                            }
                        >
                            <form
                                id="create-cashier-form"
                                onSubmit={submit}
                                className="grid gap-5 px-6 py-6 sm:grid-cols-2"
                            >
                                {/* Name */}
                                <div>
                                    <label
                                        htmlFor="create_name"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Full Name
                                    </label>

                                    <input
                                        id="create_name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        className="mt-1.5 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                        placeholder="Juan Dela Cruz"
                                    />

                                    {errors.name && (
                                        <p className="mt-1.5 text-sm text-red-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Username */}
                                <div>
                                    <label
                                        htmlFor="create_username"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Username
                                    </label>

                                    <input
                                        id="create_username"
                                        type="text"
                                        value={data.username}
                                        onChange={(e) =>
                                            setData('username', e.target.value)
                                        }
                                        className="mt-1.5 block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                        placeholder="juan123"
                                    />

                                    {errors.username && (
                                        <p className="mt-1.5 text-sm text-red-600">
                                            {errors.username}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label
                                        htmlFor="create_password"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Password
                                    </label>

                                    <div className="relative mt-1.5">
                                        <input
                                            id="create_password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            className="block w-full rounded-lg border-gray-300 pr-11 shadow-sm focus:border-red-500 focus:ring-red-500"
                                            placeholder="Minimum 8 characters"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    (current) => !current,
                                                )
                                            }
                                            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus:ring-0 focus-visible:outline-none"
                                            aria-label={
                                                showPassword
                                                    ? 'Hide password'
                                                    : 'Show password'
                                            }
                                        >
                                            {showPassword ? (
                                                <svg
                                                    className="h-5 w-5"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M3 3l18 18" />
                                                    <path d="M10.58 10.58a2 2 0 1 0 2.84 2.84" />
                                                    <path d="M9.88 4.24A10.9 10.9 0 0 1 12 4c5.52 0 9.5 8 9.5 8a18.2 18.2 0 0 1-3.04 4.04" />
                                                    <path d="M6.61 6.61A18.6 18.6 0 0 0 2.5 12S6.48 20 12 20c1.72 0 3.27-.66 4.64-1.48" />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="h-5 w-5"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M2.5 12S6.48 4 12 4s9.5 8 9.5 8-3.98 8-9.5 8-9.5-8-9.5-8Z" />
                                                    <circle cx="12" cy="12" r="2.75" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {errors.password && (
                                        <p className="mt-1.5 text-sm text-red-600">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label
                                        htmlFor="create_confirm_password"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Confirm Password
                                    </label>

                                    <div className="relative mt-1.5">
                                        <input
                                            id="create_confirm_password"
                                            type={
                                                showConfirmPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={data.confirm_password}
                                            onChange={(e) =>
                                                setData(
                                                    'confirm_password',
                                                    e.target.value,
                                                )
                                            }
                                            className="block w-full rounded-lg border-gray-300 pr-11 shadow-sm focus:border-red-500 focus:ring-red-500"
                                            placeholder="Re-enter password"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    (current) => !current,
                                                )
                                            }
                                            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus:ring-0 focus-visible:outline-none"
                                            aria-label={
                                                showConfirmPassword
                                                    ? 'Hide confirm password'
                                                    : 'Show confirm password'
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <svg
                                                    className="h-5 w-5"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M3 3l18 18" />
                                                    <path d="M10.58 10.58a2 2 0 1 0 2.84 2.84" />
                                                    <path d="M9.88 4.24A10.9 10.9 0 0 1 12 4c5.52 0 9.5 8 9.5 8a18.2 18.2 0 0 1-3.04 4.04" />
                                                    <path d="M6.61 6.61A18.6 18.6 0 0 0 2.5 12S6.48 20 12 20c1.72 0 3.27-.66 4.64-1.48" />
                                                </svg>
                                            ) : (
                                                <svg
                                                    className="h-5 w-5"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M2.5 12S6.48 4 12 4s9.5 8 9.5 8-3.98 8-9.5 8-9.5-8-9.5-8Z" />
                                                    <circle cx="12" cy="12" r="2.75" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    {errors.confirm_password && (
                                        <p className="mt-1.5 text-sm text-red-600">
                                            {errors.confirm_password}
                                        </p>
                                    )}
                                </div>
                            </form>
                        </AdminModal>
                    )}

                    {/* Cashier List */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        {/* Table Header */}
                        <div className="border-b border-gray-100 px-6 py-5">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                        Cashier Accounts
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage cashier accounts and their access status.
                                    </p>
                                </div>

                                <span className="hidden rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 ring-1 ring-gray-200 sm:inline-flex">
                                    {cashiers.length.toLocaleString('en-PH')} cashier
                                    {cashiers.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {cashiers.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                    <svg
                                        className="h-6 w-6 text-gray-400"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>

                                <p className="mt-4 text-sm font-medium text-gray-900">
                                    No cashier accounts yet
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Create a cashier account to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="border-b border-gray-100 bg-gray-50/70">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Name
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Username
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Role
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {cashiers.map((cashier) => (
                                            <tr
                                                key={cashier.id}
                                                className="transition-colors hover:bg-gray-50/70"
                                            >
                                                {/* Name */}
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-semibold text-red-700">
                                                            {cashier.name
                                                                .split(' ')
                                                                .map((part) => part[0])
                                                                .slice(0, 2)
                                                                .join('')
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {cashier.name}
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-gray-500">
                                                                Cashier account
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Username */}
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className="text-sm text-gray-700">
                                                        {cashier.username}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <StatusBadge active={cashier.is_active} />
                                                </td>

                                                {/* Role */}
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className="text-sm capitalize text-gray-600">
                                                        {cashier.role}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                startEditing(cashier)
                                                            }
                                                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                toggleStatus(cashier)
                                                            }
                                                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                                                cashier.is_active
                                                                    ? 'bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500'
                                                                    : 'bg-green-50 text-green-700 hover:bg-green-100 focus:ring-green-500'
                                                            }`}
                                                        >
                                                            {cashier.is_active
                                                                ? 'Deactivate'
                                                                : 'Activate'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
