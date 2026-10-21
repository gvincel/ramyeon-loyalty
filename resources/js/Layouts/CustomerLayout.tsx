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
            className={`group flex items-center rounded-control px-4 py-2.5 text-body transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
                active
                    ? 'bg-white/15 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-white/20'
                    : 'font-medium text-brand-100/80 hover:bg-white/10 hover:text-white'
            }`}
        >
            <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    active
                        ? 'scale-100 text-white'
                        : 'text-brand-100/70 group-hover:scale-110 group-hover:text-white'
                }`}
                aria-hidden="true"
            >
                {icon}
            </span>

            <span
                className={`whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    collapsed
                        ? 'ml-4 w-auto opacity-100 md:ml-0 md:w-0 md:overflow-hidden md:opacity-0'
                        : 'ml-4 w-auto opacity-100'
                }`}
            >
                {label}
            </span>
        </Link>
    );
}

export default function CustomerLayout({ children }: PropsWithChildren) {
    const { url } = usePage();
    const { auth } = usePage().props as any;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return (
            window.localStorage.getItem('customer-sidebar-collapsed') === 'true'
        );
    });

    const sidebarRef = useRef<HTMLElement>(null);
    const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        localStorage.setItem(
            'customer-sidebar-collapsed',
            String(isSidebarCollapsed),
        );
    }, [isSidebarCollapsed]);

    // Close the drawer when the viewport crosses into desktop width.
    useEffect(() => {
        if (!isSidebarOpen) return;
        const mq = window.matchMedia('(min-width: 768px)');
        if (mq.matches) {
            setIsSidebarOpen(false);
            return;
        }
        const onChange = (event: MediaQueryListEvent) => {
            if (event.matches) setIsSidebarOpen(false);
        };
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, [isSidebarOpen]);

    // Drawer: scroll lock, focus trap, Escape, focus restore.
    useEffect(() => {
        if (!isSidebarOpen) return;

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
            if (!root) return;
            const focusable = getFocusable(root);
            (focusable[0] ?? root).focus();
        }, 0);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setIsSidebarOpen(false);
                return;
            }
            if (event.key !== 'Tab' || !sidebarRef.current) return;

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
            href: route('customer.dashboard'),
            active: Boolean(route().current('customer.dashboard')),
            icon: (
                <span className="material-symbols-outlined text-[22px]">
                    dashboard
                </span>
            ),
            label: 'Dashboard',
        },
        {
            href: route('customer.rewards'),
            active: Boolean(route().current('customer.rewards')),
            icon: (
                <span className="material-symbols-outlined text-[22px]">
                    redeem
                </span>
            ),
            label: 'Rewards',
        },
        {
            href: route('customer.transactions'),
            active: Boolean(route().current('customer.transactions')),
            icon: (
                <span className="material-symbols-outlined text-[22px]">
                    receipt_long
                </span>
            ),
            label: 'Transactions',
        },
        {
            href: route('customer.point-history'),
            active: Boolean(route().current('customer.point-history')),
            icon: (
                <span className="material-symbols-outlined text-[22px]">
                    history
                </span>
            ),
            label: 'Point History',
        },
        {
            href: route('customer.redemption-history'),
            active: Boolean(route().current('customer.redemption-history')),
            icon: (
                <span className="material-symbols-outlined text-[22px]">
                    redeem
                </span>
            ),
            label: 'Redemption History',
        },
        {
            href: route('customer.feedback.create'),
            active: Boolean(route().current('customer.feedback.*')),
            icon: (
                <span className="material-symbols-outlined text-[22px]">
                    rate_review
                </span>
            ),
            label: 'Feedback',
        },
    ];

    return (
        <div className="min-h-screen bg-canvas">
            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                id="customer-sidebar"
                tabIndex={-1}
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-brand-900/50 bg-gradient-to-b from-brand-700 via-brand-800 to-brand-900 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] outline-none md:visible md:translate-x-0 ${
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
                        className="flex h-10 w-10 items-center justify-center rounded-control text-brand-100 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 hover:text-white active:scale-90"
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
                    className={`flex items-center gap-3 border-b border-brand-900/30 px-4 py-5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        isSidebarCollapsed
                            ? 'md:justify-center md:gap-0 md:px-0'
                            : ''
                    }`}
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white p-[3px] shadow-sm ring-1 ring-brand-900/10 transition-transform duration-300 group-hover:scale-105">
                        <img
                            src="/images/ramyeon-logo-clear.png"
                            alt="Ramyeon Corner Logo"
                            className="h-full w-full rounded-full object-contain"
                        />
                    </div>

                    <div
                        className={`min-w-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                            isSidebarCollapsed
                                ? 'w-auto opacity-100 md:w-0 md:opacity-0'
                                : 'w-auto opacity-100'
                        }`}
                    >
                        <h1 className="truncate text-lead font-semibold tracking-tight text-white">
                            Ramyeon Corner
                        </h1>
                        <p className="mt-0.5 text-caption font-semibold uppercase tracking-[0.18em] text-brand-100/80">
                            Loyalty Program
                        </p>
                    </div>
                </div>

                {/* Desktop Sidebar Toggle */}
                <div className="hidden border-b border-brand-900/30 px-3 py-2 md:flex md:justify-end">
                    <button
                        type="button"
                        onClick={() =>
                            setIsSidebarCollapsed((current) => !current)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-control text-brand-100 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 hover:text-white active:scale-90"
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
                    className="sidebar-scrollbar flex-1 space-y-1 overflow-y-auto px-4 py-4"
                    aria-label="Customer navigation"
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
                    className={`border-t border-brand-900/30 px-4 py-3 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        isSidebarCollapsed
                            ? 'md:flex md:flex-col md:items-center md:px-3'
                            : ''
                    }`}
                >
                    <div
                        className={`min-w-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                            isSidebarCollapsed
                                ? 'w-auto opacity-100 md:w-0 md:opacity-0'
                                : 'w-auto opacity-100'
                        }`}
                    >
                        <p className="truncate text-body font-medium text-white">
                            {auth?.user?.name ?? 'Loyalty Member'}
                        </p>
                        <p className="mt-0.5 truncate text-caption text-brand-100/80">
                            Customer
                        </p>
                    </div>

                    <div
                        className={`transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
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
                    className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm md:hidden motion-safe:animate-fade-in"
                />
            )}

            {/* Content column */}
            <div
                className={`min-h-screen transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
                }`}
            >
                {/* Mobile top bar */}
                <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-brand-900/50 bg-gradient-to-r from-brand-700 to-brand-800 px-4 py-2.5 md:hidden">
                    <button
                        ref={mobileMenuButtonRef}
                        type="button"
                        onClick={() => setIsSidebarOpen(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-control text-brand-100 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 hover:text-white active:scale-90"
                        aria-label="Open navigation menu"
                        aria-expanded={isSidebarOpen}
                        aria-controls="customer-sidebar"
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

                    <span className="text-small font-semibold text-white">
                        Ramyeon Corner
                    </span>
                </div>

                {/* Page content fade-in */}
                <main key={url} className="motion-safe:animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}