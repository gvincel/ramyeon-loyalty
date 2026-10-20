import LogoutButton from '@/Components/LogoutButton';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useState } from 'react';

type NavItem = {
    label: string;
    icon: string;
    href: string;
    pattern: string;
};

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', href: 'cashier.dashboard', pattern: 'cashier.dashboard' },
    { label: 'Customers', icon: 'group', href: 'cashier.customers.index', pattern: 'cashier.customers.*' },
    { label: 'QR Scanner', icon: 'qr_code_scanner', href: 'cashier.qr-scanner', pattern: 'cashier.qr-scanner' },
    { label: 'Registration QR', icon: 'how_to_reg', href: 'cashier.register-qr', pattern: 'cashier.register-qr' },
    { label: 'Transactions', icon: 'receipt_long', href: 'cashier.transactions.index', pattern: 'cashier.transactions.*' },
    { label: 'Reward Redemptions', icon: 'local_offer', href: 'cashier.reward-redemptions.index', pattern: 'cashier.reward-redemptions.*' },
];

const styles = `
@keyframes cashier-nav-in {
    from { opacity: 0; transform: translateX(-14px); }
    to   { opacity: 1; transform: translateX(0); }
}
@keyframes cashier-sheen {
    0%, 100% { background-position: 0% 0%; }
    50%      { background-position: 100% 100%; }
}
@keyframes cashier-bar-in {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
}
@keyframes cashier-page-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
}
.cashier-sidebar {
    background: linear-gradient(160deg, #d32525 0%, #b01818 45%, #7f1212 100%);
    background-size: 200% 200%;
    animation: cashier-sheen 20s ease-in-out infinite;
}
.cashier-nav-item { animation: cashier-nav-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
.cashier-active-bar { transform-origin: center; animation: cashier-bar-in 0.35s ease-out both; }
.cashier-page-in { animation: cashier-page-in 0.35s ease-out both; }
@media (prefers-reduced-motion: reduce) {
    .cashier-sidebar,
    .cashier-nav-item,
    .cashier-active-bar,
    .cashier-page-in { animation: none; }
}
`;

export default function CashierLayout({ children }: PropsWithChildren) {
    const page = usePage();
    const { auth } = page.props;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }
        return window.localStorage.getItem('cashier-sidebar-collapsed') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('cashier-sidebar-collapsed', String(isSidebarCollapsed));
    }, [isSidebarCollapsed]);

    // Close the mobile drawer after navigating
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [page.url]);

    const labelClass = `whitespace-nowrap transition-all duration-300 ${
        isSidebarCollapsed
            ? 'ml-3 w-auto opacity-100 md:ml-0 md:w-0 md:overflow-hidden md:opacity-0'
            : 'ml-3 w-auto opacity-100'
    }`;

    return (
        <div className="min-h-screen bg-[#fff7f6]">
            <style>{styles}</style>

            {/* Mobile Menu Button */}
            <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="fixed left-4 top-4 z-30 inline-flex items-center justify-center rounded-xl bg-red-600 p-2.5 text-white shadow-lg shadow-red-900/20 transition-all duration-200 hover:bg-red-700 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 md:hidden"
                aria-label="Open navigation menu"
                aria-expanded={isSidebarOpen}
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Sidebar */}
            <aside
                className={`cashier-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col text-white shadow-2xl shadow-red-950/30 transition-all duration-300 ease-in-out md:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}
            >
                {/* Mobile Close Button */}
                <div className="flex justify-end px-4 pt-4 md:hidden">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(false)}
                        className="rounded-lg p-2 text-red-100 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Close navigation menu"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>

                {/* Brand */}
                <div
                    className={`flex items-center border-b border-white/15 px-6 py-5 transition-all duration-300 ${
                        isSidebarCollapsed ? 'md:justify-center md:px-0' : 'gap-3'
                    }`}
                >
                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white shadow-md shadow-red-950/20 transition-transform duration-300 hover:rotate-3 hover:scale-105">
                        <img
                            src="/images/ramyeon-logo-clear.png"
                            alt="Ramyeon Corner Logo"
                            className="h-8 w-8 object-contain"
                        />
                    </div>

                    <div
                        className={`min-w-0 overflow-hidden transition-all duration-300 ${
                            isSidebarCollapsed ? 'w-auto opacity-100 md:w-0 md:opacity-0' : 'w-auto opacity-100'
                        }`}
                    >
                        <h1 className="truncate text-lg font-bold tracking-tight text-white">Ramyeon Corner</h1>
                        <p className="mt-0.5 text-sm text-red-100/80">Cashier</p>
                    </div>
                </div>

                {/* Desktop Sidebar Toggle */}
                <div className="hidden border-b border-white/15 px-4 py-3 md:flex md:justify-end">
                    <button
                        type="button"
                        onClick={() => setIsSidebarCollapsed((current) => !current)}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-red-100 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        aria-label={isSidebarCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
                        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                            {isSidebarCollapsed ? 'left_panel_open' : 'left_panel_close'}
                        </span>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5" aria-label="Cashier navigation">
                    {NAV_ITEMS.map((item, index) => {
                        const active = route().current(item.pattern);

                        return (
                            <Link
                                key={item.href}
                                href={route(item.href)}
                                title={isSidebarCollapsed ? item.label : undefined}
                                style={{ animationDelay: `${index * 60 + 100}ms` }}
                                className={`cashier-nav-item group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                                    active
                                        ? 'bg-white text-red-700 shadow-md shadow-red-950/20'
                                        : 'text-red-50 hover:bg-white/10 hover:text-white'
                                }`}
                                aria-current={active ? 'page' : undefined}
                            >
                                {active && (
                                    <span
                                        className="cashier-active-bar absolute -left-4 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white"
                                        aria-hidden="true"
                                    />
                                )}

                                <span
                                    className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:scale-110"
                                    aria-hidden="true"
                                >
                                    {item.icon}
                                </span>

                                <span className={labelClass}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Account */}
                <div
                    className={`border-t border-white/15 bg-black/10 p-4 transition-all duration-300 ${
                        isSidebarCollapsed ? 'md:flex md:flex-col md:items-center' : ''
                    }`}
                >
                    <div
                        className={`min-w-0 overflow-hidden transition-all duration-300 ${
                            isSidebarCollapsed ? 'w-auto opacity-100 md:h-0 md:w-0 md:opacity-0' : 'w-auto opacity-100'
                        }`}
                    >
                        <p className="truncate px-1 text-sm font-semibold text-white">{auth.user.name}</p>
                        <p className="mt-0.5 truncate px-1 text-xs text-red-100/80">Cashier</p>
                    </div>

                    {/* Styles the logout button for the red background */}
                    <div
                        className={`transition-all duration-300 [&_button]:text-red-50 [&_button]:transition-colors [&_button:hover]:bg-white/10 [&_button:hover]:text-white ${
                            isSidebarCollapsed ? 'mt-0' : 'mt-3'
                        }`}
                    >
                        <LogoutButton collapsed={isSidebarCollapsed} />
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 z-30 bg-red-950/40 backdrop-blur-[2px] transition-opacity md:hidden"
                    aria-label="Close navigation menu"
                />
            )}

            {/* Main Content */}
            <main
                className={`min-h-screen transition-all duration-300 ${
                    isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
                }`}
            >
                <div key={page.url} className="cashier-page-in">
                    {children}
                </div>
            </main>
        </div>
    );
}