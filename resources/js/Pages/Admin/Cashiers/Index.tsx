import { Head, useForm } from '@inertiajs/react';
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

    const { data, setData, post, put, patch, processing, errors, reset } =
        useForm({
            name: '',
            username: '',
            password: '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('admin.cashiers.store'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    const startEditing = (cashier: Cashier) => {
        setEditingCashier(cashier);

        setData({
            name: cashier.name,
            username: cashier.username,
            password: '',
        });
    };

    const cancelEditing = () => {
        setEditingCashier(null);

        reset();
    };

    const updateCashier: FormEventHandler = (e) => {
        e.preventDefault();

        if (!editingCashier) {
            return;
        }

        put(route('admin.cashiers.update', editingCashier.id), {
            onSuccess: () => {
                setEditingCashier(null);
                reset();
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
        <>
            <Head title="Cashier Management" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-6xl">
                    {/* Page Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Cashier Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-600">
                            Create and manage cashier accounts for Ramyeon
                            Corner.
                        </p>
                    </div>

                    {/* Cashier Form */}
                    <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {editingCashier ? 'Edit Cashier' : 'Add Cashier'}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {editingCashier
                                ? `Update the account information for ${editingCashier.name}.`
                                : 'Create a new account that staff can use to log in.'}
                        </p>

                        <form
                            onSubmit={editingCashier ? updateCashier : submit}
                            className="mt-5 grid gap-4 md:grid-cols-3"
                        >
                            {/* Name */}
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
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                                    placeholder="Juan Dela Cruz"
                                />

                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
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
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                                    placeholder="juan123"
                                />

                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.username}
                                    </p>
                                )}
                            </div>

                            {/* Password - only shown when creating a cashier */}
                            {!editingCashier && (
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Password
                                    </label>

                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                                        placeholder="Minimum 8 characters"
                                    />

                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3 md:col-span-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? editingCashier
                                            ? 'Saving...'
                                            : 'Creating...'
                                        : editingCashier
                                          ? 'Save Changes'
                                          : 'Create Cashier'}
                                </button>

                                {editingCashier && (
                                    <button
                                        type="button"
                                        onClick={cancelEditing}
                                        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Cashier List */}
                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Cashier Accounts
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {cashiers.length} cashier account
                                {cashiers.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {cashiers.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <p className="text-sm text-gray-500">
                                    No cashier accounts have been created yet.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Name
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Username
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Status
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Role
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {cashiers.map((cashier) => (
                                            <tr key={cashier.id}>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                    {cashier.name}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                    {cashier.username}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            cashier.is_active
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                        }`}
                                                    >
                                                        {cashier.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-sm capitalize text-gray-600">
                                                    {cashier.role}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                startEditing(
                                                                    cashier,
                                                                )
                                                            }
                                                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                toggleStatus(
                                                                    cashier,
                                                                )
                                                            }
                                                            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                                                                cashier.is_active
                                                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
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
        </>
    );
}
