import { Head } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import CustomerPageHeader from '@/Components/CustomerPageHeader';

type Reward = {
    id: number;
    reward_name: string;
    reward_type: 'discount' | 'free_item';
    points_required: number;
    reward_value: string | number | null;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    redemption_limit: number | null;
    times_redeemed: number;
    is_maxed: boolean;
};

type RewardsProps = {
    rewards: Reward[];
};

export default function Rewards({ rewards }: RewardsProps) {
    const formatDate = (date: string) => {
        return new Date(`${date}T00:00:00`).toLocaleDateString('en-PH', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <CustomerLayout>
            <Head title="Available Rewards" />

            <div className="min-h-screen bg-slate-50">
                <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    {/* Page Header */}
                    <CustomerPageHeader
                        eyebrow="Ramyeon Corner Loyalty"
                        title="Available Rewards"
                        description="View the rewards currently available in the Ramyeon Corner loyalty program."
                    />

                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                        <span
                            className="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-amber-700"
                            aria-hidden="true"
                        >
                            info
                        </span>

                        <div>
                            <p className="text-sm font-semibold text-amber-900">
                                How to redeem
                            </p>

                            <p className="mt-0.5 text-sm leading-5 text-amber-800">
                                Visit the cashier to redeem an available reward using your
                                loyalty points.
                            </p>
                        </div>
                    </div>

                    {/* Rewards */}
                    {rewards.length > 0 ? (
                        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {rewards.map((reward) => (
                                <article
                                    key={reward.id}
                                    className={`flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm transition duration-200 sm:p-6 ${
                                        reward.is_maxed
                                            ? 'border-slate-200 opacity-75'
                                            : 'border-slate-200 hover:-translate-y-0.5 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-100">
                                            <span
                                                className="material-symbols-outlined text-[22px] text-red-700"
                                                aria-hidden="true"
                                            >
                                                {reward.reward_type ===
                                                'discount'
                                                    ? 'local_offer'
                                                    : 'redeem'}
                                            </span>
                                        </div>

                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                            {reward.points_required.toLocaleString()}{' '}
                                            pts
                                        </span>
                                    </div>

                                    <div className="mt-5">
                                        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                                            {reward.reward_name}
                                        </h2>

                                        {reward.reward_type === 'discount' &&
                                            reward.reward_value !== null && (
                                                <p className="mt-2 text-2xl font-semibold tracking-tight text-red-700">
                                                    ₱
                                                    {Number(
                                                        reward.reward_value,
                                                    ).toLocaleString(
                                                        'en-PH',
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        },
                                                    )}{' '}
                                                    off
                                                </p>
                                            )}

                                        {reward.reward_type === 'free_item' && (
                                            <p className="mt-2 text-sm font-semibold text-red-700">
                                                Free item reward
                                            </p>
                                        )}

                                        {reward.description && (
                                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                                {reward.description}
                                            </p>
                                        )}

                                        {reward.is_maxed && (
                                            <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                                                <span
                                                    className="material-symbols-outlined text-[18px] text-slate-500"
                                                    aria-hidden="true"
                                                >
                                                    check_circle
                                                </span>

                                                <p className="text-xs font-medium text-slate-600">
                                                    Already claimed{' '}
                                                    <span className="font-semibold text-slate-800">
                                                        {reward.times_redeemed}
                                                        {reward.redemption_limit
                                                            ? `/${reward.redemption_limit}`
                                                            : ''}
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {(reward.start_date || reward.end_date) && (
                                        <div className="mt-auto pt-6">
                                            <div className="border-t border-slate-100 pt-4">
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span
                                                        className="material-symbols-outlined text-[17px] text-slate-400"
                                                        aria-hidden="true"
                                                    >
                                                        event
                                                    </span>

                                                    <span>
                                                        {reward.start_date &&
                                                        reward.end_date
                                                            ? `${formatDate(reward.start_date)} – ${formatDate(reward.end_date)}`
                                                            : reward.start_date
                                                              ? `Available from ${formatDate(reward.start_date)}`
                                                              : `Available until ${formatDate(reward.end_date!)}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </section>
                    ) : (
                        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                                <span
                                    className="material-symbols-outlined text-[24px] text-slate-500"
                                    aria-hidden="true"
                                >
                                    redeem
                                </span>
                            </div>

                            <h2 className="mt-4 text-base font-semibold text-slate-900">
                                No rewards available
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                There are currently no rewards available. Check
                                back again later for new loyalty rewards.
                            </p>
                        </section>
                    )}
                </main>
            </div>
        </CustomerLayout>
    );
}