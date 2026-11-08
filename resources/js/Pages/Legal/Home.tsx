import { Head, Link } from '@inertiajs/react';
import type { SVGProps } from 'react';

const LOGO = '/images/ramyeon-logo-clear.png';
const HERO_IMAGE = '/images/ramyeon-hero.png';

const iconProps: SVGProps<SVGSVGElement> = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
};

const ArrowIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
    <svg {...iconProps} className={className}>
        <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
);

const StarIcon = () => (
    <svg {...iconProps} className="h-8 w-8">
        <path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6-4.3-4.2 6-.9L12 3Z" />
    </svg>
);

const ChartIcon = () => (
    <svg {...iconProps} className="h-8 w-8">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
);

const GiftIcon = () => (
    <svg {...iconProps} className="h-8 w-8">
        <rect x="3.5" y="9" width="17" height="11" rx="1.5" />
        <path d="M2.5 6.5h19V9h-19zM12 6.5V20" />
        <path d="M12 6.5c-2 0-4-.5-4-2s2.5-2.5 4 2Zm0 0c2 0 4-.5 4-2s-2.5-2.5-4 2Z" />
    </svg>
);

const features = [
    {
        title: 'Earn Points',
        description: 'Collect points whenever you make an eligible purchase.',
        icon: <StarIcon />,
    },
    {
        title: 'Track Your Progress',
        description:
            'Keep track of your accumulated points and check your balance.',
        icon: <ChartIcon />,
    },
    {
        title: 'Redeem Rewards',
        description:
            'Turn your points into rewards and enjoy more from every visit.',
        icon: <GiftIcon />,
    },
];

const focusRing =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e4b86d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#721f26]';

export default function Home() {
    return (
        <>
            <Head title="Ramyeon Corner | Loyalty Rewards" />

            <div className="min-h-screen bg-[#f7f3ed] font-sans text-[#291b19] antialiased">
                {/* HEADER (fixed 5rem height so the hero fits the screen exactly) */}
                <header className="sticky top-0 z-30 border-b border-[#e4b86d]/20 bg-[#721f26]">
                    <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 lg:px-12">
                        <Link
                            href="/"
                            className={`flex items-center gap-3.5 rounded-full ${focusRing}`}
                        >
                            <img
                                src={LOGO}
                                alt="Ramyeon Corner"
                                className="h-12 w-12 rounded-full bg-[#f7f3ed] object-contain p-1 ring-2 ring-[#e4b86d]/50"
                            />

                            <p className="text-lg font-extrabold tracking-tight text-[#f7f3ed]">
                                Ramyeon Corner
                            </p>
                        </Link>

                        <div className="flex items-center gap-8">
                            <a
                                href="#program"
                                className="hidden text-sm font-medium tracking-wide text-white/80 transition duration-base ease-standard hover:text-[#e4b86d] md:block"
                            >
                                Our Program
                            </a>

                            {/* Quiet staff-only button: it should not compete with the hero button */}
                            <Link
                                href="/login"
                                className={`group inline-flex min-h-11 items-center gap-2 rounded-full border border-[#e4b86d]/60 px-5 text-sm font-bold tracking-wide text-[#e4b86d] transition duration-base ease-standard hover:border-[#e4b86d] hover:bg-[#e4b86d] hover:text-[#42191c] ${focusRing}`}
                            >
                                Staff Login
                                <ArrowIcon className="h-4 w-4 transition duration-base ease-standard group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </div>
                </header>

                <main>
                    {/* HERO SECTION: fits the visible screen below the header */}
                    <section
                        id="home"
                        className="relative isolate flex h-[calc(100svh-5rem)] min-h-[540px] items-center overflow-hidden bg-[#250d0d]"
                    >
                        {/* BACKGROUND FOOD IMAGE */}
                        <div className="absolute inset-0">
                            <img
                                src={HERO_IMAGE}
                                alt="A delicious bowl of ramen at Ramyeon Corner"
                                className="h-full w-full object-cover object-[70%_center] sm:object-[65%_center]"
                            />

                            {/* Mobile: even overlay for readability */}
                            <div className="absolute inset-0 bg-[#250d0d]/70 lg:hidden" />

                            {/* Desktop: dark overlay on the text side only */}
                            <div className="absolute inset-y-0 left-0 hidden w-[72%] bg-gradient-to-r from-[#250d0d] via-[#250d0d]/90 to-transparent lg:block" />
                        </div>

                        {/* HERO CONTENT */}
                        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-6 lg:px-12">
                            <div className="max-w-[750px] animate-fade-in">
                                <div className="mb-7 flex items-center gap-4">
                                    <span className="h-[2px] w-12 bg-gradient-to-r from-[#e4b86d] to-[#e4b86d]/20" />

                                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#e4b86d] sm:text-[0.8rem]">
                                        Good Food. Great Rewards.
                                    </p>
                                </div>

                                <h1 className="text-5xl font-extrabold leading-[1.04] tracking-[-0.03em] text-[#fffaf2] sm:text-6xl lg:text-[5rem]">
                                    Ramyeon Corner
                                    <span className="mt-2 block bg-gradient-to-r from-[#f6dca6] via-[#e4b86d] to-[#c58a4a] bg-clip-text font-bold italic text-transparent">
                                        Loyalty Rewards
                                    </span>
                                </h1>

                                <p className="mt-8 max-w-[540px] text-base leading-8 text-white/85 sm:text-lg sm:leading-9">
                                    Every visit is an opportunity to enjoy
                                    something more. Earn points from your
                                    purchases and enjoy rewards along the way.
                                </p>

                                {/* The one premium filled button on the page */}
                                <div className="mt-11">
                                    <a
                                        href="#program"
                                        className={`group inline-flex min-h-14 items-center gap-5 rounded-full bg-gradient-to-b from-[#f3d49a] to-[#e4b86d] py-2 pl-9 pr-2 text-sm font-extrabold tracking-wide text-[#42191c] shadow-[0_14px_36px_-10px_rgba(228,184,109,0.6),inset_0_1px_0_rgba(255,255,255,0.55)] transition duration-base ease-standard hover:-translate-y-0.5 hover:from-[#f8e0b0] hover:to-[#ebc57e] hover:shadow-[0_18px_44px_-10px_rgba(228,184,109,0.75),inset_0_1px_0_rgba(255,255,255,0.65)] active:translate-y-0 ${focusRing}`}
                                    >
                                        Explore the Program
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#721f26] text-[#f3d49a] transition duration-base ease-standard group-hover:translate-x-0.5 group-hover:bg-[#42191c]">
                                            <ArrowIcon className="h-[1.1rem] w-[1.1rem]" />
                                        </span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* LOYALTY PROGRAM */}
                    <section
                        id="program"
                        className="scroll-mt-20 bg-[#f7f3ed] px-6 py-20 sm:py-24 lg:py-28"
                    >
                        <div className="mx-auto max-w-[1400px]">
                            {/* SECTION HEADING */}
                            <div className="text-center">
                                <h2 className="mx-auto max-w-3xl text-3xl font-extrabold leading-[1.1] tracking-[-0.025em] text-[#42191c] sm:text-4xl lg:text-[3.25rem]">
                                    A little more to enjoy with every visit.
                                </h2>

                                <span className="mx-auto mt-6 block h-px w-16 bg-[#c58a4a]" />

                                <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-[#75635a]">
                                    We appreciate every visit. Our loyalty
                                    program gives you more reasons to come back
                                    and enjoy your favorite meals.
                                </p>
                            </div>

                            {/* FEATURES */}
                            <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-0 lg:mt-20">
                                {features.map((feature, index) => (
                                    <article
                                        key={feature.title}
                                        className={`group flex items-start gap-5 px-2 sm:px-8 ${
                                            index > 0
                                                ? 'border-t border-[#b98c69]/40 pt-10 md:border-l md:border-t-0 md:pt-0'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-[#721f26] shadow-[0_10px_28px_-10px_rgba(114,31,38,0.4)] ring-1 ring-[#e4b86d]/70 transition duration-base ease-standard group-hover:bg-[#721f26] group-hover:text-[#e4b86d] group-hover:ring-[#721f26]">
                                            {feature.icon}
                                        </div>

                                        <div className="pt-1">
                                            <h3 className="text-lg font-extrabold tracking-tight text-[#42191c] sm:text-xl">
                                                {feature.title}
                                            </h3>

                                            <p className="mt-2 max-w-[270px] text-sm leading-7 text-[#75635a]">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                {/* FOOTER */}
                <footer className="border-t border-[#e4b86d]/20 bg-[#721f26] text-[#f7f3ed]">
                    <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-6 py-7 lg:px-12">
                        <Link
                            href="/"
                            className={`flex items-center gap-3 rounded-full ${focusRing}`}
                        >
                            <img
                                src={LOGO}
                                alt="Ramyeon Corner"
                                className="h-10 w-10 rounded-full bg-[#f7f3ed] object-contain p-1 ring-2 ring-[#e4b86d]/50"
                            />
 
                            <p className="text-base font-extrabold tracking-tight">
                                Ramyeon Corner
                            </p>
                        </Link>
 
                        <Link
                            href="/privacy-policy"
                            className="text-sm font-medium tracking-wide text-white/75 transition duration-base ease-standard hover:text-[#e4b86d]"
                        >
                            Privacy Policy
                        </Link>
                    </div>
 
                    <div className="border-t border-white/10">
                        <p className="mx-auto max-w-[1500px] px-6 py-4 text-center text-xs tracking-wide text-white/60 lg:px-12">
                            &copy; {new Date().getFullYear()} Ramyeon Corner.
                            All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}