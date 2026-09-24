import { FormEvent, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminModal from '@/Components/AdminModal';
import StatusBadge from '@/Components/StatusBadge';
import FlashMessage from '@/Components/FlashMessage';
import { PageProps } from '@/types';

interface Reward {
    id: number;
    reward_name: string;
    reward_type: 'discount' | 'free_item';
    points_required: number;
    reward_value: string | null;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
}

interface Props {
    rewards: Reward[];
}

export default function Index({ rewards }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        reward_name: '',
        reward_type: 'discount' as 'discount' | 'free_item',
        points_required: '',
        reward_value: '',
        description: '',
        start_date: '',
        end_date: '',
        is_active: true,
    });

    const { flash } = usePage<PageProps>().props;

    const [showForm, setShowForm] = useState(false);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        post('/admin/rewards', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const closeForm = () => {
        reset();
        setShowForm(false);
    };

    return (
        <AdminLayout>
            <Head title="Rewards" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <AdminPageHeader
                        eyebrow="Reward Management"
                        title="Rewards"
                        description="Create and manage loyalty rewards for Ramyeon Corner customers."
                        action={
                            <button
                                type="button"
                                onClick={() => setShowForm(true)}
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
                                Create Reward
                            </button>
                        }
                    />

                    <FlashMessage
                        success={flash.success}
                        error={flash.error}
                    />

                    {/* Rewards Table */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                        Reward List
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage available loyalty rewards and redemption requirements.
                                    </p>
                                </div>

                                <span className="hidden rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 ring-1 ring-gray-200 sm:inline-flex">
                                    {rewards.length.toLocaleString('en-PH')} reward
                                    {rewards.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {rewards.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <p className="text-sm font-medium text-gray-900">
                                    No rewards found.
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Create your first reward to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100">
                                    <thead className="border-b border-gray-100 bg-gray-50/70">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Reward
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Type
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Points
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Value
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {rewards.map((reward) => (
                                            <tr
                                                key={reward.id}
                                                className="transition-colors hover:bg-gray-50/70"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {reward.reward_name}
                                                    </div>

                                                    {reward.description && (
                                                        <div className="mt-1 max-w-md text-sm text-gray-500">
                                                            {reward.description}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                                    {reward.reward_type ===
                                                    'discount'
                                                        ? 'Discount'
                                                        : 'Free Item'}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                    {reward.points_required}{' '}
                                                    pts
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                                    {reward.reward_value
                                                        ? `₱${Number(
                                                              reward.reward_value
                                                          ).toFixed(2)}`
                                                        : '-'}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <StatusBadge active={reward.is_active} />
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

            {/* Create Reward Modal */}
            {showForm && (
                <AdminModal
                    title="Create Reward"
                    description="Add a new reward for customers to redeem."
                    onClose={closeForm}
                    maxWidthClass="max-w-2xl"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={closeForm}
                                disabled={processing}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                form="create-reward-form"
                                disabled={processing}
                                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Creating...' : 'Create Reward'}
                            </button>
                        </>
                    }
                >
                    <form
                        id="create-reward-form"
                        onSubmit={submit}
                    >
                        <div className="space-y-5 px-6 py-6">
                            {/* Reward Name */}
                            <div>
                                <label
                                    htmlFor="reward_name"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Reward Name
                                </label>

                                <input
                                    id="reward_name"
                                    type="text"
                                    value={data.reward_name}
                                    onChange={(event) =>
                                        setData('reward_name', event.target.value)
                                    }
                                    placeholder="e.g. ₱50 Off Coupon"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />

                                {errors.reward_name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.reward_name}
                                    </p>
                                )}
                            </div>

                            {/* Type + Points */}
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="reward_type"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Reward Type
                                    </label>

                                    <select
                                        id="reward_type"
                                        value={data.reward_type}
                                        onChange={(event) =>
                                            setData(
                                                'reward_type',
                                                event.target.value as
                                                    | 'discount'
                                                    | 'free_item'
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    >
                                        <option value="discount">Discount</option>
                                        <option value="free_item">Free Item</option>
                                    </select>

                                    {errors.reward_type && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.reward_type}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="points_required"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Points Required
                                    </label>

                                    <input
                                        id="points_required"
                                        type="number"
                                        min="1"
                                        value={data.points_required}
                                        onChange={(event) =>
                                            setData(
                                                'points_required',
                                                event.target.value
                                            )
                                        }
                                        placeholder="e.g. 200"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    />

                                    {errors.points_required && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.points_required}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Reward Value */}
                            <div>
                                <label
                                    htmlFor="reward_value"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Reward Value
                                </label>

                                <input
                                    id="reward_value"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.reward_value}
                                    onChange={(event) =>
                                        setData(
                                            'reward_value',
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. 50.00"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />

                                <p className="mt-1 text-xs text-gray-500">
                                    Used for discount rewards. Leave blank if not
                                    applicable.
                                </p>

                                {errors.reward_value && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.reward_value}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    htmlFor="description"
                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    rows={3}
                                    value={data.description}
                                    onChange={(event) =>
                                        setData('description', event.target.value)
                                    }
                                    placeholder="Briefly describe the reward..."
                                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />

                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="start_date"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Start Date
                                    </label>

                                    <input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(event) =>
                                            setData('start_date', event.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    />

                                    {errors.start_date && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.start_date}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="end_date"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        End Date
                                    </label>

                                    <input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(event) =>
                                            setData('end_date', event.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    />

                                    {errors.end_date && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.end_date}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Active */}
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(event) =>
                                            setData(
                                                'is_active',
                                                event.target.checked
                                            )
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            Active Reward
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            Allow this reward to be available for
                                            redemption.
                                        </p>
                                    </div>
                                </label>

                                {errors.is_active && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.is_active}
                                    </p>
                                )}
                            </div>
                        </div>
                    </form>
                </AdminModal>
            )}
        </AdminLayout>
    );
}

