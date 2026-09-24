import { Link } from '@inertiajs/react';
import { CSSProperties, PropsWithChildren } from 'react';

interface GuestLayoutProps {
    /** Lock the page to the screen: no scrolling, and the card scales to fit. */
    fitScreen?: boolean;
}

// Fluid tokens: everything inside the card scales with the screen height.
const fluidTokens = {
    '--pad': 'clamp(1.375rem, 4dvh, 2.75rem)',
    '--gap': 'clamp(0.5rem, 1.8dvh, 1.25rem)',
    '--ctl': 'clamp(44px, 6.2dvh, 52px)',
    '--h1': 'clamp(1.5rem, 3.6dvh, 1.875rem)',
} as CSSProperties;

export default function GuestLayout({
    children,
    fitScreen = false,
}: PropsWithChildren<GuestLayoutProps>) {
    return (
        <div
            className={`relative overflow-hidden bg-red-900 ${
                fitScreen
                    ? 'grid h-screen grid-rows-[auto_minmax(0,1fr)]'
                    : 'flex min-h-screen flex-col'
            }`}
            style={fitScreen ? { height: '100dvh' } : undefined}
        >
            {/* Bowl-rim motif: static, decorative, desktop only */}
            <svg
                aria-hidden="true"
                viewBox="0 0 640 640"
                fill="none"
                className="pointer-events-none absolute -bottom-72 -left-72 hidden h-[640px] w-[640px] md:block"
            >
                <circle cx="320" cy="320" r="318" stroke="white" strokeOpacity="0.08" />
                <circle cx="320" cy="320" r="260" stroke="#fbbf24" strokeOpacity="0.35" />
                <circle cx="320" cy="320" r="200" stroke="white" strokeOpacity="0.08" />
                <circle cx="320" cy="320" r="140" stroke="white" strokeOpacity="0.08" />
            </svg>
            <svg
                aria-hidden="true"
                viewBox="0 0 320 320"
                fill="none"
                className="pointer-events-none absolute -right-40 -top-40 hidden h-80 w-80 lg:block"
            >
                <circle cx="160" cy="160" r="158" stroke="white" strokeOpacity="0.08" />
                <circle cx="160" cy="160" r="110" stroke="white" strokeOpacity="0.08" />
            </svg>

            {/* Header: its own row, so the card can never slide behind it */}
            <header className="relative z-10 flex items-center justify-between px-4 py-3 sm:px-10 sm:py-4 [@media(max-height:560px)]:py-2">
                <Link
                    href="/"
                    className="inline-flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-red-900"
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-amber-400 sm:h-12 sm:w-12 [@media(max-height:560px)]:h-9 [@media(max-height:560px)]:w-9">
                        <img
                            src="/images/ramyeon-logo-clear.png"
                            alt=""
                            className="h-9 w-9 object-contain sm:h-11 sm:w-11 [@media(max-height:560px)]:h-8 [@media(max-height:560px)]:w-8"
                        />
                    </span>
                    <span className="flex flex-col leading-tight">
                        <span className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                            Ramyeon Corner
                        </span>
                        <span className="mt-0.5 hidden text-xs font-medium uppercase tracking-[0.18em] text-red-200 sm:block [@media(max-height:560px)]:hidden">
                            Loyalty Management System
                        </span>
                    </span>
                </Link>
                <p className="hidden text-xs font-medium uppercase tracking-[0.18em] text-red-200 md:block [@media(max-height:560px)]:hidden">
                    Authorized personnel only
                </p>
            </header>

            {/* Card area: fills the remaining space only */}
            <main
                className={
                    fitScreen
                        ? 'relative z-10 flex min-h-0 overflow-hidden px-3 pb-3 sm:px-6 sm:pb-5 [@media(max-height:400px)]:overflow-y-auto [@media(max-width:639px)_and_(max-height:480px)]:overflow-y-auto'
                        : 'relative z-10 flex flex-1 px-4 py-8 sm:px-6'
                }
            >
                <div
                    className={`m-auto w-full overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/20 ${
                        fitScreen
                            ? 'max-w-[27.5rem] md:max-w-[30rem] [@media(min-width:640px)_and_(max-height:560px)]:max-w-[46rem]'
                            : 'max-w-[27.5rem]'
                    }`}
                    style={fitScreen ? fluidTokens : undefined}
                >
                    {children}
                </div>
            </main>
        </div>
    );
}