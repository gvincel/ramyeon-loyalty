import { Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';

export default function CustomerLayout({ children }: PropsWithChildren) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { url } = usePage();
    const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

    const isActive = (path: string) => url.startsWith(path);

    const logout = () => {
        router.post(route('customer.logout'));
    };

    const navigation = [
        { label: 'Dashboard', href: route('customer.dashboard'), path: '/loyalty/dashboard', icon: 'dashboard' },
        { label: 'Rewards', href: route('customer.rewards'), path: '/loyalty/rewards', icon: 'redeem' },
        { label: 'Transactions', href: route('customer.transactions'), path: '/loyalty/transactions', icon: 'receipt_long' },
        { label: 'Point History', href: route('customer.point-history'), path: '/loyalty/point-history', icon: 'history' },
        { label: 'Redemption History', href: route('customer.redemption-history'), path: '/loyalty/redemption-history', icon: 'redeem' },
        { label: 'Feedback', href: route('customer.feedback.create'), path: '/loyalty/feedback', icon: 'rate_review' },
    ];

    // Scroll lock when mobile menu is open
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

    // Close on navigation
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [url]);

    // Handle Escape and focus restore
    useEffect(() => {
        if (!mobileMenuOpen) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMobileMenuOpen(false);
                mobileMenuButtonRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [mobileMenuOpen]);

    return (
        <div className="flex min-h-screen flex-col bg-canvas">
            <header className="sticky top-0 z-50 border-b border-line bg-surface">
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
                            <p className="truncate text-small font-semibold text-ink">
                                Ramyeon Corner
                            </p>
                            <p className="truncate text-caption text-ink-muted">
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
                                    className={`inline-flex min-h-10 items-center gap-2 rounded-control px-3.5 text-small transition-colors duration-fast ease-standard ${
                                        active
                                            ? 'bg-brand-50 font-semibold text-brand-700'
                                            : 'font-medium text-ink-muted hover:bg-surface-muted hover:text-ink'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[19px]" aria-hidden="true">
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}

                        <button
                            type="button"
                            onClick={logout}
                            className="btn-secondary ml-2 min-h-10 gap-2 px-4 text-small"
                        >
                            <span className="material-symbols-outlined text-[19px]" aria-hidden="true">
                                logout
                            </span>
                            <span>Log out</span>
                        </button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        ref={mobileMenuButtonRef}
                        type="button"
                        onClick={() => setMobileMenuOpen((open) => !open)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-ink-muted transition-colors duration-fast hover:bg-surface-muted hover:text-ink sm:hidden"
                        aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="customer-mobile-navigation"
                    >
                        <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                            {mobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                {mobileMenuOpen && (
                    <div
                        id="customer-mobile-navigation"
                        className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-surface px-4 py-3 sm:hidden motion-safe:animate-fade-in"
                    >
                        <nav className="space-y-1" aria-label="Mobile customer navigation">
                            {navigation.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex min-h-11 w-full items-center gap-3 rounded-control px-4 text-small transition-colors duration-fast ${
                                            active
                                                ? 'bg-brand-50 font-semibold text-brand-700'
                                                : 'font-medium text-ink-muted hover:bg-surface-muted hover:text-ink'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined w-5 shrink-0 text-center text-[20px]" aria-hidden="true">
                                            {item.icon}
                                        </span>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}

                            <div className="my-2 border-t border-line" aria-hidden="true" />

                            <button
                                type="button"
                                onClick={logout}
                                className="flex min-h-11 w-full items-center gap-3 rounded-control px-4 text-left text-small font-medium text-ink-muted transition-colors duration-fast hover:bg-surface-muted hover:text-ink"
                            >
                                <span className="material-symbols-outlined w-5 shrink-0 text-center text-[20px]" aria-hidden="true">
                                    logout
                                </span>
                                <span>Log out</span>
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}