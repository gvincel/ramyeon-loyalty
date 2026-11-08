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

const ArrowIcon = () => (
    <svg {...iconProps} className="h-5 w-5">
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
        number: '01',
        title: 'Earn Points',
        description: 'Collect points whenever you make an eligible purchase.',
        icon: <StarIcon />,
    },
    {
        number: '02',
        title: 'Track Your Progress',
        description:
            'Keep track of your accumulated points and check your balance.',
        icon: <ChartIcon />,
    },
    {
        number: '03',
        title: 'Redeem Rewards',
        description:
            'Turn your points into rewards and enjoy more from every visit.',
        icon: <GiftIcon />,
    },
];

const focusRing =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e4b86d] focus-visible:ring-offset-2';

export default function Home() {
    return (
        <>
            <Head title="Ramyeon Corner | Loyalty Rewards" />

            <div className="min-h-screen bg-[#f7f3ed] text-[#291b19]">
                {/* HEADER */}
                <header className="sticky top-0 z-30 bg-[#721f26]">
                    <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4 lg:px-12">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src={LOGO}
                                alt="Ramyeon Corner"
                                className="h-12 w-12 rounded-full bg-[#f7f3ed] object-contain p-1"
                            />

                            <div>
                                <p className="text-lg font-extrabold leading-tight text-[#f7f3ed]">
                                    Ramyeon Corner
                                </p>
                                <p className="mt-0.5 text-xs font-semibold text-[#e4b86d]">
                                    Loyalty Rewards
                                </p>
                            </div>
                        </Link>

                        <nav className="hidden items-center gap-10 md:flex">
                            <a
                                href="#home"
                                className="border-b-2 border-[#e4b86d] pb-1 text-sm font-bold text-[#e4b86d]"
                            >
                                Home
                            </a>

                            <a
                                href="#program"
                                className="pb-1 text-sm font-medium text-white/80 transition hover:text-white"
                            >
                                Our Program
                            </a>
                        </nav>

                        <Link
                            href="/login"
                            className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f7f3ed] px-6 text-sm font-bold text-[#42191c] transition hover:bg-[#e4b86d] ${focusRing}`}
                        >
                            Staff Login
                            <ArrowIcon />
                        </Link>
                    </div>
                </header>

                <main>
                    {/* HERO SECTION */}
                    <section
                        id="home"
                        className="relative isolate flex min-h-[560px] scroll-mt-20 items-center overflow-hidden bg-[#250d0d] sm:min-h-[620px] lg:min-h-[660px]"
                    >
                        {/* BACKGROUND FOOD IMAGE */}
                        <div className="absolute inset-0">
                            <img
                                src={HERO_IMAGE}
                                alt="A delicious bowl of ramen at Ramyeon Corner"
                                className="h-full w-full object-cover object-[65%_center]"
                            />

                            {/* Very light overall shading */}
                            <div className="absolute inset-0 bg-black/5" />

                            {/* Dark overlay focused on the text side */}
                            <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#250d0d] via-[#250d0d]/90 to-transparent lg:w-[68%]" />

                            {/* Subtle bottom shading */}
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#250d0d]/25 to-transparent" />
                        </div>

                        {/* SUBTLE BURGUNDY DECORATION */}
                        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full border-[20px] border-[#721f26]/35" />

                        <div className="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full border border-[#e4b86d]/10" />

                        {/* HERO CONTENT */}
                        <div className="relative z-10 mx-auto w-full max-w-[1500px] px-6 py-24 lg:px-12">
                            <div className="max-w-[750px]">
                                <div className="mb-7 flex items-center gap-4">
                                    <span className="h-[2px] w-10 bg-[#e4b86d]" />

                                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#e4b86d] sm:text-sm">
                                        Good Food. Great Rewards.
                                    </p>
                                </div>

                                <h1 className="font-serif text-5xl font-bold leading-[1.08] tracking-tight text-[#fffaf2] sm:text-6xl lg:text-7xl">
                                    Ramyeon Corner
                                    <span className="mt-2 block italic text-[#e4b86d]">
                                        Loyalty Rewards
                                    </span>
                                </h1>

                                <p className="mt-7 max-w-[540px] text-base leading-8 text-white/90 sm:text-lg">
                                    Every visit is an opportunity to enjoy
                                    something more. Earn points from your
                                    purchases and enjoy rewards along the way.
                                </p>

                                <div className="mt-10">
                                    <a
                                        href="#program"
                                        className={`inline-flex min-h-14 items-center gap-3 rounded-full bg-[#e4b86d] px-9 text-sm font-extrabold text-[#42191c] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#f0ca88] ${focusRing}`}
                                    >
                                        Explore the Program
                                        <ArrowIcon />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* LOYALTY PROGRAM */}
                    <section
                        id="program"
                        className="relative scroll-mt-20 overflow-hidden bg-[#f7f3ed] px-6 py-16 sm:py-20 lg:py-24"
                    >
                        {/* Subtle background decoration */}
                        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full border-[18px] border-[#e4b86d]/10" />

                        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full border-[18px] border-[#e4b86d]/10" />

                        <div className="relative mx-auto max-w-[1400px]">
                            {/* SECTION HEADING */}
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-4">
                                    <span className="h-px w-12 bg-[#c58a4a]" />

                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#a64b39]">
                                        Our Loyalty Program
                                    </p>

                                    <span className="h-px w-12 bg-[#c58a4a]" />
                                </div>

                                <h2 className="mt-5 font-serif text-3xl font-bold leading-tight text-[#42191c] sm:text-4xl lg:text-5xl">
                                    A little more to enjoy with every visit.
                                </h2>

                                <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#75635a] sm:text-base">
                                    We appreciate every visit. Our loyalty
                                    program gives you more reasons to come back
                                    and enjoy your favorite meals.
                                </p>
                            </div>

                            {/* FEATURES - EDITORIAL LAYOUT, NO CARDS */}
                            <div className="mt-16 grid gap-9 md:grid-cols-3 md:gap-0">
                                {features.map((feature, index) => (
                                    <article
                                        key={feature.number}
                                        className={`flex items-start gap-5 px-2 sm:px-8 ${
                                            index > 0
                                                ? 'border-t border-[#b98c69]/50 pt-8 md:border-l md:border-t-0 md:pt-0'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e4b86d]/35 text-[#721f26]">
                                            {feature.icon}
                                        </div>

                                        <div className="pt-1">
                                            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#c58a4a]">
                                                {feature.number}
                                            </p>

                                            <h3 className="text-lg font-extrabold text-[#42191c] sm:text-xl">
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
                <footer className="bg-[#721f26] text-[#f7f3ed]">
                    <div className="mx-auto flex max-w-[1500px] flex-col gap-7 px-6 py-9 sm:flex-row sm:items-center sm:justify-between lg:px-12">
                        {/* BRAND */}
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src={LOGO}
                                alt="Ramyeon Corner"
                                className="h-12 w-12 rounded-full bg-[#f7f3ed] object-contain p-1"
                            />

                            <div>
                                <p className="text-base font-extrabold">
                                    Ramyeon Corner
                                </p>
                                <p className="mt-1 text-xs font-semibold tracking-wide text-[#e4b86d]">
                                    Good Food. Great Rewards.
                                </p>
                            </div>
                        </Link>

                        {/* FOOTER NAVIGATION */}
                        <nav className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-medium text-white/75">
                            <Link
                                href="/"
                                className="transition hover:text-[#e4b86d]"
                            >
                                Home
                            </Link>

                            <a
                                href="#program"
                                className="transition hover:text-[#e4b86d]"
                            >
                                Our Program
                            </a>

                            <Link
                                href="/privacy-policy"
                                className="transition hover:text-[#e4b86d]"
                            >
                                Privacy Policy
                            </Link>

                            <Link
                                href="/login"
                                className="transition hover:text-[#e4b86d]"
                            >
                                Staff Login
                            </Link>
                        </nav>
                    </div>
                </footer>
            </div>
        </>
    );
}
