import { Link, router, usePage } from '@inertiajs/react';

import { PropsWithChildren, useEffect, useState } from 'react';

export default function CustomerLayout({
    children,
}: PropsWithChildren) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { url } = usePage();

    const isActive = (path: string) => {
        return url.startsWith(path);
    };

    const logout = () => {
        router.post(route('customer.logout'));
    };

    const navigation = [
        {
            label: 'Dashboard',
            href: route('customer.dashboard'),
            path: '/loyalty/dashboard',
            icon: 'dashboard',
        },
        {
            label: 'Rewards',
            href: route('customer.rewards'),
            path: '/loyalty/rewards',
            icon: 'redeem',
        },
        {
            label: 'Transactions',
            href: route('customer.transactions'),
            path: '/loyalty/transactions',
            icon: 'receipt_long',
        },
        {
            label: 'Point History',
            href: route('customer.point-history'),
            path: '/loyalty/point-history',
            icon: 'history',
        },
    ];

    useEffect(() => {
        if (!mobileMenuOpen) {
            document.body.style.overflow = '';
            return;
        }

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [url]);

    return (
        <div className="h-screen overflow-hidden bg-gray-50">
            <header className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white">
                <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Brand */}
                    <Link
                        href={route('customer.dashboard')}
                        className="flex min-w-0 items-center gap-3"
                    >
                        <img
                            src="/images/ramyeon-logo-clear.png"
                            alt="Ramyeon Corner"
                            className="h-9 w-auto shrink-0"
                        />

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                                Ramyeon Corner
                            </p>

                            <p className="truncate text-xs text-gray-500">
                                Loyalty Program
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav
                        className="hidden items-center gap-1 sm:flex"
                        aria-label="Customer navigation"
                    >
                        {navigation.map((item) => {
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={[
                                        'inline-flex min-h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition',
                                        active
                                            ? 'bg-red-50 text-red-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                                    ].join(' ')}
                                >
                                    <span
                                        className="material-symbols-outlined text-[19px]"
                                        aria-hidden="true"
                                    >
                                        {item.icon}
                                    </span>

                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}

                        <button
                            type="button"
                            onClick={logout}
                            className="ml-2 inline-flex min-h-10 items-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                        >
                            <span
                                className="material-symbols-outlined text-[19px]"
                                aria-hidden="true"
                            >
                                logout
                            </span>

                            <span>Log out</span>
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((open) => !open)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:hidden"
                        aria-label={
                            mobileMenuOpen
                                ? 'Close navigation menu'
                                : 'Open navigation menu'
                        }
                        aria-expanded={mobileMenuOpen}
                        aria-controls="customer-mobile-navigation"
                    >
                        <span
                            className="material-symbols-outlined text-[24px]"
                            aria-hidden="true"
                        >
                            {mobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div
                        id="customer-mobile-navigation"
                        className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-gray-100 bg-white px-4 py-3 sm:hidden"
                    >
                        <nav
                            className="space-y-1"
                            aria-label="Mobile customer navigation"
                        >
                            {navigation.map((item) => {
                                const active = isActive(item.path);

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() =>
                                            setMobileMenuOpen(false)
                                        }
                                        className={[
                                            'flex min-h-11 w-full items-center gap-3 rounded-lg px-4 text-sm font-medium transition',
                                            active
                                                ? 'bg-red-50 text-red-700'
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                                        ].join(' ')}
                                    >
                                        <span
                                            className="material-symbols-outlined w-5 shrink-0 text-center text-[20px]"
                                            aria-hidden="true"
                                        >
                                            {item.icon}
                                        </span>

                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}

                            <div
                                className="my-2 border-t border-gray-100"
                                aria-hidden="true"
                            />

                            <button
                                type="button"
                                onClick={logout}
                                className="flex min-h-11 w-full items-center gap-3 rounded-lg px-4 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                            >
                                <span
                                    className="material-symbols-outlined w-5 shrink-0 text-center text-[20px]"
                                    aria-hidden="true"
                                >
                                    logout
                                </span>

                                <span>Log out</span>
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="h-screen overflow-y-auto pt-16">
                {children}
            </main>
        </div>
    );
}