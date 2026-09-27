import { router } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';

export default function CustomerLayout({
    children,
}: PropsWithChildren) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const logout = () => {
        router.post(route('customer.logout'));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/ramyeon-logo-clear.png"
                            alt="Ramyeon Corner"
                            className="h-9 w-auto"
                        />

                        <div className="hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900">
                                Ramyeon Corner
                            </p>
                            <p className="text-xs text-gray-500">
                                Loyalty Program
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 sm:hidden"
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                        >
                            {mobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>

                    <nav className="hidden items-center gap-6 sm:flex">
                        <a
                            href={route('customer.dashboard')}
                            className="text-sm font-medium text-gray-900"
                        >
                            Dashboard
                        </a>

                        <button
                            type="button"
                            onClick={logout}
                            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                        >
                            <span
                                className="material-symbols-outlined text-[18px]"
                                aria-hidden="true"
                            >
                                logout
                            </span>
                            Log out
                        </button>
                    </nav>
                </div>

                {mobileMenuOpen && (
                    <div className="border-t border-gray-100 bg-white px-4 py-3 sm:hidden">
                        <nav className="space-y-1">
                            <a
                                href={route('customer.dashboard')}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-900"
                            >
                                Dashboard
                            </a>

                            <button
                                type="button"
                                onClick={logout}
                                className="mt-2 flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                            >
                                <span
                                    className="material-symbols-outlined text-[18px]"
                                    aria-hidden="true"
                                >
                                    logout
                                </span>
                                Log out
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            <main>{children}</main>
        </div>
    );
}