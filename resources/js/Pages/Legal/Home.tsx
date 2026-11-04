
import { Head, Link } from '@inertiajs/react';
import type { SVGProps } from 'react';

const LOGO = '/images/ramyeon-logo-clear.png';

const iconProps: SVGProps<SVGSVGElement> = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
};

const ArrowIcon = () => (
    <svg {...iconProps} className="h-5 w-5">
        <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
);

const UserIcon = () => (
    <svg {...iconProps} className="h-6 w-6">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.7-3.6 3.5-5.5 7-5.5s6.3 1.9 7 5.5" />
    </svg>
);

const StaffIcon = () => (
    <svg {...iconProps} className="h-6 w-6">
        <path d="M12 3 19 6v5.5c0 4.2-2.8 7.6-7 9.5-4.2-1.9-7-5.3-7-9.5V6l7-3Z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const StarIcon = () => (
    <svg {...iconProps} className="h-5 w-5">
        <path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6-4.3-4.2 6-.9L12 3Z" />
    </svg>
);

const GiftIcon = () => (
    <svg {...iconProps} className="h-5 w-5">
        <rect x="3.5" y="9" width="17" height="11" rx="1.5" />
        <path d="M2.5 6.5h19V9h-19zM12 6.5V20" />
        <path d="M12 6.5c-2 0-4-.5-4-2s2.5-2.5 4 2Zm0 0c2 0 4-.5 4-2s-2.5-2.5-4 2Z" />
    </svg>
);

const benefits = [
    {
        number: '01',
        title: 'Earn points',
        description: 'Collect points whenever you make an eligible purchase.',
        icon: <StarIcon />,
    },
    {
        number: '02',
        title: 'Track your progress',
        description: 'Keep an eye on your points balance through your account.',
        icon: <UserIcon />,
    },
    {
        number: '03',
        title: 'Enjoy rewards',
        description: 'Discover available rewards and make your points count.',
        icon: <GiftIcon />,
    },
];

export default function Home() {
    return (
        <>
            <Head title="Ramyeon Corner | Loyalty Rewards" />

            <div className="min-h-screen overflow-hidden bg-[#f7f3ed] text-[#291b19]">
                {/* Navigation */}
                <header className="relative z-10 border-b border-[#e9dfd5] bg-[#f7f3ed]">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src={LOGO}
                                alt="Ramyeon Corner"
                                className="h-12 w-12 object-contain"
                            />
                            <span>
                                <span className="block text-base font-extrabold tracking-tight text-[#641e22] sm:text-lg">
                                    Ramyeon Corner
                                </span>
                                <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#927c70]">
                                    Loyalty Rewards
                                </span>
                            </span>
                        </Link>

                        <Link
                            href="/loyalty/login"
                            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#721f26] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#55171d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#721f26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f3ed]"
                        >
                            Sign in
                            <ArrowIcon />
                        </Link>
                    </div>
                </header>

                <main>
                    {/* Hero */}
                    <section className="px-5 pb-16 pt-8 sm:px-8 sm:pb-20 sm:pt-12 lg:px-12 lg:pt-16">
                        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
                            <div className="relative z-10">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e8d6c6] bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8a3b36]">
                                    <span className="h-2 w-2 rounded-full bg-[#c58b35]" />
                                    Good food. Great rewards.
                                </div>

                                <h1 className="max-w-2xl text-[2.75rem] font-black leading-[1.06] tracking-[-0.045em] text-[#42191c] sm:text-6xl lg:text-[4.5rem]">
                                    Every visit has a little
                                    <span className="text-[#a64b39]"> something extra.</span>
                                </h1>

                                <p className="mt-6 max-w-lg text-base leading-8 text-[#75635a] sm:text-lg">
                                    Enjoy your favorites at Ramyeon Corner and
                                    earn rewards along the way. Your loyalty
                                    deserves something delicious.
                                </p>

                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href="/loyalty/login"
                                        className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#721f26] px-7 text-base font-bold text-white shadow-[0_12px_25px_-12px_rgba(83,22,29,0.65)] transition hover:-translate-y-0.5 hover:bg-[#55171d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#721f26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f3ed] motion-reduce:transform-none"
                                    >
                                        Access customer account
                                        <ArrowIcon />
                                    </Link>

                                    <Link
                                        href="/login"
                                        className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-[#dfd1c5] bg-white/70 px-7 text-base font-semibold text-[#563c35] transition hover:border-[#b98a78] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#721f26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f3ed]"
                                    >
                                        Staff access
                                    </Link>
                                </div>

                                <div className="mt-9 flex items-center gap-3 text-sm text-[#89776d]">
                                    <span className="flex -space-x-2">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f7f3ed] bg-[#e9c7a4] text-xs font-bold text-[#663c2e]">R</span>
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f7f3ed] bg-[#b96c55] text-xs font-bold text-white">C</span>
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f7f3ed] bg-[#e4d5bd] text-xs font-bold text-[#663c2e]">+</span>
                                    </span>
                                    <span>One account for your loyalty journey</span>
                                </div>
                            </div>

                            {/* Loyalty card visual */}
                            <div className="relative mx-auto w-full max-w-[510px]">
                                <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#e6c18c]/40 blur-3xl" />
                                <div className="absolute -bottom-10 -left-8 h-44 w-44 rounded-full bg-[#a64b39]/15 blur-3xl" />

                                <div className="relative overflow-hidden rounded-[2rem] bg-[#651e25] p-7 text-white shadow-[0_30px_65px_-25px_rgba(73,22,27,0.55)] sm:p-9">
                                    <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10" />
                                    <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full border border-white/10" />
                                    <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-[#a64b39]/40" />

                                    <div className="relative">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e9c9ad]">
                                                    Ramyeon Corner
                                                </p>
                                                <p className="mt-1 text-sm text-white/65">
                                                    Customer loyalty
                                                </p>
                                            </div>
                                            <img
                                                src={LOGO}
                                                alt=""
                                                className="h-14 w-14 rounded-2xl bg-white p-1.5 object-contain"
                                            />
                                        </div>

                                        <div className="mt-14">
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e9c9ad]">
                                                Your rewards journey
                                            </p>
                                            <p className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                                                Starts here.
                                            </p>
                                            <p className="mt-3 max-w-xs text-sm leading-6 text-white/70">
                                                Sign in to see your points,
                                                track your progress, and
                                                discover your rewards.
                                            </p>
                                        </div>

                                        <div className="mt-10 flex items-end justify-between border-t border-white/15 pt-5">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                                                    Made for our customers
                                                </p>
                                                <p className="mt-1 text-sm font-semibold text-[#f0d5b6]">
                                                    Every visit matters.
                                                </p>
                                            </div>
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e4b86d] text-[#541a20]">
                                                <StarIcon />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative mx-auto mt-5 flex max-w-[90%] items-center gap-3 rounded-2xl border border-[#e9dfd5] bg-white/90 p-4 shadow-[0_12px_30px_-20px_rgba(60,35,25,0.3)]">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5e9d8] text-[#8b512f]">
                                        <GiftIcon />
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold text-[#49302a]">
                                            Your points, your rewards
                                        </p>
                                        <p className="mt-0.5 text-xs text-[#8a786d]">
                                            All in one convenient account.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Benefits */}
                    <section className="border-y border-[#e9dfd5] bg-white/65 px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
                        <div className="mx-auto max-w-7xl">
                            <div className="max-w-xl">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a64b39]">
                                    The loyalty experience
                                </p>
                                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#42191c] sm:text-4xl">
                                    A little more to enjoy with every visit.
                                </h2>
                                <p className="mt-4 leading-7 text-[#75635a]">
                                    Your customer account makes it easier to
                                    keep track of your loyalty points and the
                                    rewards available to you.
                                </p>
                            </div>

                            <div className="mt-10 grid gap-5 md:grid-cols-3">
                                {benefits.map((benefit) => (
                                    <article
                                        key={benefit.number}
                                        className="group rounded-3xl border border-[#e9dfd5] bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-[#d8b8a7] hover:shadow-[0_18px_35px_-25px_rgba(75,35,25,0.3)] motion-reduce:transform-none"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5e9d8] text-[#8b512f] transition group-hover:bg-[#721f26] group-hover:text-white">
                                                {benefit.icon}
                                            </span>
                                            <span className="text-sm font-bold tracking-widest text-[#c4b2a4]">
                                                {benefit.number}
                                            </span>
                                        </div>
                                        <h3 className="mt-7 text-xl font-bold text-[#42191c]">
                                            {benefit.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-[#817066]">
                                            {benefit.description}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-[#e9dfd5] bg-[#f0e9df]">
                    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
                        <div className="flex items-center gap-2">
                            <img
                                src={LOGO}
                                alt=""
                                className="h-8 w-8 object-contain"
                            />
                            <span className="font-semibold text-[#68433a]">
                                © {new Date().getFullYear()} Ramyeon Corner
                            </span>
                        </div>

                        <Link
                            href="/privacy-policy"
                            className="inline-flex min-h-11 items-center font-semibold text-[#721f26] transition hover:text-[#42191c] focus:outline-none focus-visible:underline"
                        >
                            Privacy Policy
                        </Link>
                    </div>
                </footer>
            </div>
        </>
    );
}
