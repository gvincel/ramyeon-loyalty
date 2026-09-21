import { Head, Link, router } from '@inertiajs/react';
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

interface Pagination {
    current_page: number;
    last_page: number;
    links: PaginationLink[];
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
        <>
            <Head title="Reward Redemption History" />

            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Reward Redemption History
                    </h1>

                    <p className="mt-1 text-sm text-gray-600">
                        View the rewards redeemed by customers.
                    </p>
                </div>

                <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col gap-3 sm:flex-row"
                    >
                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search customer or reward..."
                            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />

                        <button
                            type="submit"
                            className="rounded-md bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                            Search
                        </button>

                        {search && (
                            <Link
                                href={route(
                                    'cashier.reward-redemptions.index',
                                )}
                                className="rounded-md border border-gray-300 px-5 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Clear
                            </Link>
                        )}
                    </form>
                </div>

                <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left text-sm">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 font-semibold text-gray-700">
                                        Customer
                                    </th>

                                    <th className="px-6 py-3 font-semibold text-gray-700">
                                        Reward
                                    </th>

                                    <th className="px-6 py-3 font-semibold text-gray-700">
                                        Points Used
                                    </th>

                                    <th className="px-6 py-3 font-semibold text-gray-700">
                                        Date
                                    </th>

                                    <th className="px-6 py-3 font-semibold text-gray-700">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {redemptions.data.length > 0 ? (
                                    redemptions.data.map((redemption) => (
                                        <tr key={redemption.id}>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {redemption.customer.first_name}{' '}
                                                    {redemption.customer.last_name}
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    {
                                                        redemption.customer
                                                            .customer_code
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-gray-700">
                                                {redemption.reward.reward_name}
                                            </td>

                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {redemption.points_used}
                                            </td>

                                            <td className="px-6 py-4 text-gray-700">
                                                {new Date(
                                                    redemption.redeemed_at,
                                                ).toLocaleString()}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                        redemption.status ===
                                                        'completed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
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
                                            className="px-6 py-10 text-center text-sm text-gray-500"
                                        >
                                            No reward redemptions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {redemptions.last_page > 1 && (
                        <div className="flex flex-wrap gap-2 border-t p-4">
                            {redemptions.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url ?? '#'}
                                    preserveState
                                    preserveScroll
                                    className={`rounded-md px-3 py-2 text-sm ${
                                        link.active
                                            ? 'bg-red-600 text-white'
                                            : link.url
                                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                              : 'cursor-not-allowed bg-gray-50 text-gray-400'
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
        </>
    );
}