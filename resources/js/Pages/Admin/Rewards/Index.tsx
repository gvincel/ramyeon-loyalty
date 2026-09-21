import { FormEvent, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
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
        <>
            <Head title="Rewards" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Rewards
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage the rewards available for customer
                                redemption.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            + Create Reward
                        </button>
                    </div>

                    <FlashMessage
                        success={flash.success}
                        error={flash.error}
                    />

                    {/* Rewards Table */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-200 px-5 py-4">
                            <h2 className="text-base font-semibold text-gray-900">
                                Reward List
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                {rewards.length} reward
                                {rewards.length !== 1 ? 's' : ''} found.
                            </p>
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
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Reward
                                            </th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Type
                                            </th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Points
                                            </th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Value
                                            </th>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {rewards.map((reward) => (
                                            <tr
                                                key={reward.id}
                                                className="transition hover:bg-gray-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="font-medium text-gray-900">
                                                        {reward.reward_name}
                                                    </div>

                                                    {reward.description && (
                                                        <div className="mt-1 max-w-md text-sm text-gray-500">
                                                            {reward.description}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                                                    {reward.reward_type ===
                                                    'discount'
                                                        ? 'Discount'
                                                        : 'Free Item'}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-900">
                                                    {reward.points_required}{' '}
                                                    pts
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                                                    {reward.reward_value
                                                        ? `₱${Number(
                                                              reward.reward_value
                                                          ).toFixed(2)}`
                                                        : '-'}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            reward.is_active
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        {reward.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Create Reward
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Add a new reward for customers to redeem.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeForm}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit}>
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
                                            setData(
                                                'reward_name',
                                                event.target.value
                                            )
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
                                            <option value="discount">
                                                Discount
                                            </option>
                                            <option value="free_item">
                                                Free Item
                                            </option>
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
                                        Used for discount rewards. Leave blank
                                        if not applicable.
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
                                            setData(
                                                'description',
                                                event.target.value
                                            )
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
                                                setData(
                                                    'start_date',
                                                    event.target.value
                                                )
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
                                                setData(
                                                    'end_date',
                                                    event.target.value
                                                )
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
                                                Allow this reward to be
                                                available for redemption.
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

                            {/* Modal Footer */}
                            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Creating...'
                                        : 'Create Reward'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

