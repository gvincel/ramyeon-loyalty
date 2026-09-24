import { Head, Link, router } from '@inertiajs/react';
import CashierLayout from '@/Layouts/CashierLayout';
import { FormEvent, useState } from 'react';

interface Customer {
    first_name: string;
    last_name: string;
    customer_code: string;
}

interface Reward {
    reward_name: string;
}

interface RewardRedemption {
    id: number;
    points_used: number;
    redeemed_at: string;
    status: 'completed' | 'cancelled';
    customer: Customer;
    reward: Reward;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedRedemptions {
    data: RewardRedemption[];
    current_page: number;
    last_page: number;
    links: PaginationLink[];
}

interface Props {
    redemptions: PaginatedRedemptions;
    filters: {
        search?: string;
    };
}

export default function Index({ redemptions, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            route('cashier.reward-redemptions.index'),
            { search },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <CashierLayout>
            <Head title="Reward Redemption History" />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Reward Redemption History
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            View rewards redeemed by customers.
                        </p>
                    </div>

                    {/* Search Card */}
                    <div className="mb-6 rounded-xl bg-white shadow-sm">
                        <div className="border-b px-6 py-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Search Redemptions
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Search by customer name, customer code, or
                                reward name.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSearch}
                            className="flex flex-col gap-3 p-6 sm:flex-row"
                        >
                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search customer or reward"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            />

                            <div className="flex gap-3 sm:shrink-0">
                                <button
                                    type="submit"
                                    className="flex-1 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 sm:flex-none"
                                >
                                    Search
                                </button>

                                {search && (
                                    <Link
                                        href={route(
                                            'cashier.reward-redemptions.index',
                                        )}
                                        className="flex-1 rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:flex-none"
                                    >
                                        Clear
                                    </Link>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Redemption History Card */}
                    <div className="rounded-xl bg-white shadow-sm">
                        <div className="border-b px-6 py-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Redemption History
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Recent reward redemptions processed by you.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Customer
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Reward
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Points Used
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Date
                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {redemptions.data.length > 0 ? (
                                        redemptions.data.map((redemption) => (
                                            <tr
                                                key={redemption.id}
                                                className="transition hover:bg-gray-50"
                                            >
                                                {/* Customer */}
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900">
                                                        {
                                                            redemption.customer
                                                                .first_name
                                                        }{' '}
                                                        {
                                                            redemption.customer
                                                                .last_name
                                                        }
                                                    </div>

                                                    <div className="mt-0.5 text-xs text-gray-500">
                                                        {
                                                            redemption.customer
                                                                .customer_code
                                                        }
                                                    </div>
                                                </td>

                                                {/* Reward */}
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {redemption.reward.reward_name}
                                                </td>

                                                {/* Points */}
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                                                        {
                                                            redemption.points_used
                                                        }{' '}
                                                        point
                                                        {redemption.points_used !==
                                                        1
                                                            ? 's'
                                                            : ''}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(
                                                        redemption.redeemed_at,
                                                    ).toLocaleString()}
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            redemption.status ===
                                                            'completed'
                                                                ? 'bg-green-50 text-green-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        {redemption.status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            redemption.status.slice(
                                                                1,
                                                            )}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-12 text-center"
                                            >
                                                <p className="text-sm font-medium text-gray-700">
                                                    No reward redemptions
                                                    found.
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Try adjusting your search or
                                                    check again later.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {redemptions.last_page > 1 && (
                            <div className="flex flex-wrap gap-1.5 border-t px-6 py-4">
                                {redemptions.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url ?? '#'}
                                        preserveState
                                        preserveScroll
                                        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                                            link.active
                                                ? 'bg-red-600 text-white'
                                                : link.url
                                                  ? 'bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50'
                                                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}