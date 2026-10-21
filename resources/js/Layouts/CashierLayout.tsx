import LogoutButton from '@/Components/LogoutButton';

import { Link, usePage } from '@inertiajs/react';

import {
    PropsWithChildren,
    ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusable(root: HTMLElement): HTMLElement[] {
    return Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((element) => element.getClientRects().length > 0);
}

interface NavItemProps {
    href: string;
    active: boolean;
    icon: ReactNode;
    label: string;
    collapsed: boolean;
    onNavigate: () => void;
}

function NavItem({
    href,
    active,
    icon,
    label,
    collapsed,
    onNavigate,
}: NavItemProps) {
    return (
        <Link
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            title={collapsed ? label : undefined}
            className={`flex items-center rounded-control px-3 py-2.5 text-small transition-colors duration-fast ease-standard ${
                active
                    ? 'bg-brand-50 font-semibold text-brand-700'
                    : 'font-medium text-ink-muted hover:bg-surface-muted hover:text-ink'
            }`}
        >
            <span
                className="flex h-5 w-5 shrink-0 items-center justify-center"
                aria-hidden="true"
            >
                {icon}
            </span>

            <span
                className={`whitespace-nowrap transition-all duration-fast ease-standard ${
                    collapsed
                        ? 'ml-3 w-auto opacity-100 md:ml-0 md:w-0 md:overflow-hidden md:opacity-0'
                        : 'ml-3 w-auto opacity-100'
                }`}
            >
                {label}
            </span>
        </Link>
    );
}

export default function CashierLayout({ children }: PropsWithChildren) {
    const { auth } = usePage().props;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return (
            window.localStorage.getItem('cashier-sidebar-collapsed') === 'true'
        );
    });

    const sidebarRef = useRef<HTMLElement>(null);
    const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        localStorage.setItem(
            'cashier-sidebar-collapsed',
            String(isSidebarCollapsed),
        );
    }, [isSidebarCollapsed]);

    // Close the drawer when the viewport crosses into desktop width.
    useEffect(() => {
        if (!isSidebarOpen) {
            return;
        }

        const mq = window.matchMedia('(min-width: 768px)');

        if (mq.matches) {
            setIsSidebarOpen(false);
            return;
        }

        const onChange = (event: MediaQueryListEvent) => {
            if (event.matches) {
                setIsSidebarOpen(false);
            }
        };

        mq.addEventListener('change', onChange);

        return () => mq.removeEventListener('change', onChange);
    }, [isSidebarOpen]);

    // Drawer: scroll lock, focus trap, Escape, focus restore.
    useEffect(() => {
        if (!isSidebarOpen) {
            return;
        }

        const previouslyFocused =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        const body = document.body;
        const originalOverflow = body.style.overflow;
        const originalPaddingRight = body.style.paddingRight;
        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;

        body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        const timer = window.setTimeout(() => {
            const root = sidebarRef.current;
            if (!root) {
                return;
            }

            const focusable = getFocusable(root);
            (focusable[0] ?? root).focus();
        }, 0);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setIsSidebarOpen(false);
                return;
            }

            if (event.key !== 'Tab' || !sidebarRef.current) {
                return;
            }

            const focusable = getFocusable(sidebarRef.current);

            if (focusable.length === 0) {
                event.preventDefault();
                sidebarRef.current.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement as HTMLElement | null;

            if (!active || !sidebarRef.current.contains(active)) {
                event.preventDefault();
                first.focus();
                return;
            }

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.clearTimeout(timer);
            document.removeEventListener('keydown', handleKeyDown);
            body.style.overflow = originalOverflow;
            body.style.paddingRight = originalPaddingRight;

            if (previouslyFocused && document.contains(previouslyFocused)) {
                previouslyFocused.focus();
            } else {
                mobileMenuButtonRef.current?.focus();
            }
        };
    }, [isSidebarOpen]);

    const closeDrawer = () => setIsSidebarOpen(false);

    const navItems: Array<{
        href: string;
        active: boolean;
        icon: ReactNode;
        label: string;
    }> = [
        {
            href: route('cashier.dashboard'),
            active: Boolean(route().current('cashier.dashboard')),
            icon: (
                <span className="material-symbols-outlined text-[20px]">
                    dashboard
                </span>
            ),
            label: 'Dashboard',
        },
        {
            href: route('cashier.customers.index'),
            active: Boolean(route().current('cashier.customers.*')),
            icon: (
                <span className="material-symbols-outlined text-[20px]">
                    group
                </span>
            ),
            label: 'Customers',
        },
        {
            href: route('cashier.qr-scanner'),
            active: Boolean(route().current('cashier.qr-scanner')),
            icon: (
                <span className="material-symbols-outlined text-[20px]">
                    qr_code_scanner
                </span>
            ),
            label: 'QR Scanner',
        },
        {
            href: route('cashier.register-qr'),
            active: Boolean(route().current('cashier.register-qr')),
            icon: (
                <span className="material-symbols-outlined text-[20px]">
                    how_to_reg
                </span>
            ),
            label: 'Registration QR',
        },
        {
            href: route('cashier.transactions.index'),
            active: Boolean(route().current('cashier.transactions.*')),
            icon: (
                <span className="material-symbols-outlined text-[20px]">
                    receipt_long
                </span>
            ),
            label: 'Transactions',
        },
        {
            href: route('cashier.reward-redemptions.index'),
            active: Boolean(route().current('cashier.reward-redemptions.*')),
            icon: (
                <span className="material-symbols-outlined text-[20px]">
                    local_offer
                </span>
            ),
            label: 'Reward Redemptions',
        },
    ];

    return (
        <div className="min-h-screen bg-canvas">
            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                id="cashier-sidebar"
                tabIndex={-1}
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface transition-all duration-slow ease-standard outline-none md:visible md:translate-x-0 ${
                    isSidebarOpen
                        ? 'visible translate-x-0'
                        : 'invisible -translate-x-full'
                } ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}
            >
                {/* Mobile Close Button */}
                <div className="flex justify-end px-3 pt-3 md:hidden">
                    <button
                        type="button"
                        onClick={closeDrawer}
                        className="flex h-10 w-10 items-center justify-center rounded-control text-ink-muted transition-colors duration-fast ease-standard hover:bg-surface-muted hover:text-ink"
                        aria-label="Close navigation menu"
                    >
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 6l12 12M18 6L6 18"
                            />
                        </svg>
                    </button>
                </div>

                {/* Brand */}
                <div
                    className={`flex items-center gap-3 border-b border-line px-4 py-5 transition-all duration-fast ease-standard ${
                        isSidebarCollapsed
                            ? 'md:justify-center md:gap-0 md:px-0'
                            : ''
                    }`}
                >
                    <img
                        src="/images/ramyeon-logo-clear.png"
                        alt="Ramyeon Corner Logo"
                        className="h-10 w-10 shrink-0 object-contain"
                    />

                    <div
                        className={`min-w-0 overflow-hidden transition-all duration-fast ease-standard ${
                            isSidebarCollapsed
                                ? 'w-auto opacity-100 md:w-0 md:opacity-0'
                                : 'w-auto opacity-100'
                        }`}
                    >
                        <h1 className="truncate text-lead font-semibold tracking-tight text-ink">
                            Ramyeon Corner
                        </h1>

                        <p className="mt-0.5 text-caption text-ink-muted">
                            Cashier
                        </p>
                    </div>
                </div>

                {/* Desktop Sidebar Toggle */}
                <div className="hidden border-b border-line px-3 py-2 md:flex md:justify-end">
                    <button
                        type="button"
                        onClick={() =>
                            setIsSidebarCollapsed((current) => !current)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-control text-ink-muted transition-colors duration-fast ease-standard hover:bg-surface-muted hover:text-ink"
                        aria-label={
                            isSidebarCollapsed
                                ? 'Expand navigation sidebar'
                                : 'Collapse navigation sidebar'
                        }
                        title={
                            isSidebarCollapsed
                                ? 'Expand sidebar'
                                : 'Collapse sidebar'
                        }
                    >
                        <span
                            className="material-symbols-outlined text-[20px]"
                            aria-hidden="true"
                        >
                            {isSidebarCollapsed
                                ? 'left_panel_open'
                                : 'left_panel_close'}
                        </span>
                    </button>
                </div>

                {/* Navigation */}
                <nav
                    className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
                    aria-label="Cashier navigation"
                >
                    {navItems.map((item) => (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            active={item.active}
                            icon={item.icon}
                            label={item.label}
                            collapsed={isSidebarCollapsed}
                            onNavigate={closeDrawer}
                        />
                    ))}
                </nav>

                {/* Account */}
                <div
                    className={`border-t border-line p-3 transition-all duration-fast ease-standard ${
                        isSidebarCollapsed
                            ? 'md:flex md:flex-col md:items-center'
                            : ''
                    }`}
                >
                    <div
                        className={`min-w-0 overflow-hidden transition-all duration-fast ease-standard ${
                            isSidebarCollapsed
                                ? 'w-auto opacity-100 md:w-0 md:opacity-0'
                                : 'w-auto opacity-100'
                        }`}
                    >
                        <p className="truncate px-1 text-small font-medium text-ink">
                            {auth.user.name}
                        </p>

                        <p className="mt-0.5 truncate px-1 text-caption text-ink-muted">
                            Cashier
                        </p>
                    </div>

                    <div
                        className={`transition-all duration-fast ease-standard ${
                            isSidebarCollapsed ? 'mt-0' : 'mt-3'
                        }`}
                    >
                        <LogoutButton collapsed={isSidebarCollapsed} />
                    </div>
                </div>
            </aside>

            {/* Mobile Drawer Backdrop */}
            {isSidebarOpen && (
                <div
                    aria-hidden="true"
                    onClick={closeDrawer}
                    className="fixed inset-0 z-30 bg-ink/30 md:hidden motion-safe:animate-fade-in"
                />
            )}

            {/* Content column */}
            <div
                className={`min-h-screen transition-[margin-left] duration-slow ease-standard ${
                    isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
                }`}
            >
                {/* Mobile top bar */}
                <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5 md:hidden">
                    <button
                        ref={mobileMenuButtonRef}
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-control text-ink-muted transition-colors duration-fast ease-standard hover:bg-surface-muted hover:text-ink"
                        aria-label="Open navigation menu"
                        aria-expanded={isSidebarOpen}
                        aria-controls="cashier-sidebar"
                    >
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>

                    <span className="text-small font-semibold text-ink">
                        Ramyeon Corner
                    </span>
                </div>

                <main>{children}</main>
            </div>
        </div>
    );
}