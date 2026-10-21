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

            <div className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <CustomerPageHeader
                    eyebrow="Ramyeon Corner Loyalty"
                    title="Available Rewards"
                    description="View the rewards currently available in the Ramyeon Corner loyalty program."
                />

                {/* How to redeem banner */}
                <div className="mb-6 flex items-start gap-3 rounded-control border border-warning-600/20 bg-warning-50 px-4 py-3.5">
                    <span
                        className="material-symbols-outlined mt-0.5 shrink-0 text-[20px] text-warning-700"
                        aria-hidden="true"
                    >
                        info
                    </span>
                    <div>
                        <p className="text-small font-semibold text-warning-700">
                            How to redeem
                        </p>
                        <p className="mt-0.5 text-small leading-5 text-warning-700/90">
                            Visit the cashier to redeem an available reward using your loyalty points.
                        </p>
                    </div>
                </div>

                {/* Rewards Grid */}
                {rewards.length > 0 ? (
                    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {rewards.map((reward) => (
                            <article
                                key={reward.id}
                                className={`flex h-full flex-col rounded-card border bg-surface p-5 transition-all duration-300 ease-standard sm:p-6 ${
                                    reward.is_maxed
                                        ? 'border-line opacity-75'
                                        : 'border-line shadow-card hover:-translate-y-1 hover:border-line-strong hover:shadow-raised'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-brand-50 ring-1 ring-brand-100">
                                        <span
                                            className="material-symbols-outlined text-[22px] text-brand-700"
                                            aria-hidden="true"
                                        >
                                            {reward.reward_type === 'discount'
                                                ? 'local_offer'
                                                : 'redeem'}
                                        </span>
                                    </div>

                                    <span className="chip">
                                        {reward.points_required.toLocaleString()} pts
                                    </span>
                                </div>

                                <div className="mt-5">
                                    <h2 className="text-lead font-semibold tracking-tight text-ink">
                                        {reward.reward_name}
                                    </h2>

                                    {reward.reward_type === 'discount' &&
                                        reward.reward_value !== null && (
                                            <p className="mt-2 text-heading font-bold tracking-tight text-brand-700">
                                                ₱
                                                {Number(reward.reward_value).toLocaleString(
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
                                        <p className="mt-2 text-small font-semibold text-brand-700">
                                            Free item reward
                                        </p>
                                    )}

                                    {reward.description && (
                                        <p className="mt-3 text-small leading-6 text-ink-muted">
                                            {reward.description}
                                        </p>
                                    )}

                                    {reward.is_maxed && (
                                        <div className="mt-3 flex items-center gap-2 rounded-control border border-line bg-surface-muted px-3 py-2">
                                            <span
                                                className="material-symbols-outlined text-[18px] text-ink-muted"
                                                aria-hidden="true"
                                            >
                                                check_circle
                                            </span>
                                            <p className="text-caption font-medium text-ink-muted">
                                                Already claimed{' '}
                                                <span className="font-semibold text-ink">
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
                                        <div className="border-t border-line pt-4">
                                            <div className="flex items-center gap-2 text-caption text-ink-muted">
                                                <span
                                                    className="material-symbols-outlined text-[17px] text-ink-subtle"
                                                    aria-hidden="true"
                                                >
                                                    event
                                                </span>
                                                <span>
                                                    {reward.start_date && reward.end_date
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
                    <section className="panel px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-control bg-canvas text-ink-subtle">
                            <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
                                redeem
                            </span>
                        </div>
                        <h2 className="mt-4 text-heading font-semibold text-ink">
                            No rewards available
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-small leading-6 text-ink-muted">
                            There are currently no rewards available. Check back again later for new loyalty rewards.
                        </p>
                    </section>
                )}
            </div>
        </CustomerLayout>
    );
}