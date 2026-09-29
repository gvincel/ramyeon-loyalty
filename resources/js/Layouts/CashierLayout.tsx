import LogoutButton from '@/Components/LogoutButton';

import { Link, usePage } from '@inertiajs/react';

import { PropsWithChildren, useEffect, useState } from 'react';

export default function CashierLayout({
    children,
}: PropsWithChildren) {
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

    useEffect(() => {
        localStorage.setItem(
            'cashier-sidebar-collapsed',
            String(isSidebarCollapsed),
        );
    }, [isSidebarCollapsed]);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Mobile Menu Button */}
            <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="fixed left-4 top-4 z-30 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 md:hidden"
                aria-label="Open navigation menu"
                aria-expanded={isSidebarOpen}
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

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out md:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } ${
                    isSidebarCollapsed ? 'md:w-20' : 'md:w-64'
                }`}
            >
                {/* Mobile Close Button */}
                <div className="flex justify-end px-4 pt-4 md:hidden">
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(false)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                        aria-label="Close navigation menu"
                    >
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
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
                    className={`flex items-center border-b border-gray-100 px-6 py-5 transition-all duration-300 ${
                        isSidebarCollapsed ? 'md:justify-center' : 'gap-3'
                    }`}
                >
                    <img
                        src="/images/ramyeon-logo-clear.png"
                        alt="Ramyeon Corner Logo"
                        className="h-10 w-10 object-contain"
                    />

                    <div
                        className={`min-w-0 overflow-hidden transition-all duration-300 ${
                            isSidebarCollapsed
                                ? 'w-auto opacity-100 md:w-0 md:opacity-0'
                                : 'w-auto opacity-100'
                        }`}
                    >
                        <h1 className="truncate text-lg font-bold text-gray-900">
                            Ramyeon Corner
                        </h1>
                        <p className="mt-0.5 text-sm text-gray-500">
                            Cashier
                        </p>
                    </div>
                </div>

                {/* Desktop Sidebar Toggle */}
                <div className="hidden border-b border-gray-100 px-4 py-3 md:flex md:justify-end">
                    <button
                        type="button"
                        onClick={() =>
                            setIsSidebarCollapsed((current) => !current)
                        }
                        className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
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
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                            {isSidebarCollapsed ? 'left_panel_open' : 'left_panel_close'}
                        </span>
                    </button>
                </div>

                {/* Navigation */}
                <nav
                    className="flex-1 space-y-1 px-4 py-5"
                    aria-label="Cashier navigation"
                >
                    <Link
                        href={route('cashier.dashboard')}
                        className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            route().current('cashier.dashboard')
                                ? 'bg-red-50 text-red-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        aria-current={
                            route().current('cashier.dashboard')
                                ? 'page'
                                : undefined
                        }
                    >
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                            dashboard
                        </span>

                        <span
                            className={`whitespace-nowrap transition-all duration-300 ${
                                isSidebarCollapsed
                                    ? 'ml-3 w-auto opacity-100 md:ml-0 md:w-0 md:overflow-hidden md:opacity-0'
                                    : 'ml-3 w-auto opacity-100'
                            }`}
                        >
                            Dashboard
                        </span>
                    </Link>

                    <Link
                        href={route('cashier.customers.index')}
                        className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            route().current('cashier.customers.*')
                                ? 'bg-red-50 text-red-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        aria-current={
                            route().current('cashier.customers.*')
                                ? 'page'
                                : undefined
                        }
                    >
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                            group
                        </span>

                        <span
                            className={`whitespace-nowrap transition-all duration-300 ${
                                isSidebarCollapsed
                                    ? 'ml-3 w-auto opacity-100 md:ml-0 md:w-0 md:overflow-hidden md:opacity-0'
                                    : 'ml-3 w-auto opacity-100'
                            }`}
                        >
                            Customers
                        </span>
                    </Link>

                    <Link
                        href={route('cashier.qr-scanner')}
                        className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            route().current('cashier.qr-scanner')
                                ? 'bg-red-50 text-red-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        aria-current={
                            route().current('cashier.qr-scanner')
                                ? 'page'
                                : undefined
                        }
                    >
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                            qr_code_scanner
                        </span>

                        <span
                            className={`whitespace-nowrap transition-all duration-300 ${
                                isSidebarCollapsed
                                    ? 'ml-3 w-auto opacity-100 md:ml-0 md:w-0 md:overflow-hidden md:opacity-0'
                                    : 'ml-3 w-auto opacity-100'
                            }`}
                        >
                            QR Scanner
                        </span>
                    </Link>

                    <Link
                        href={route('cashier.transactions.index')}
                        className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            route().current('cashier.transactions.*')
                                ? 'bg-red-50 text-red-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        aria-current={
                            route().current('cashier.transactions.*')
                                ? 'page'
                                : undefined
                        }
                    >
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                            receipt_long
                        </span>

                        <span
                            className={`whitespace-nowrap transition-all duration-300 ${
                                isSidebarCollapsed
                                    ? 'ml-3 w-auto opacity-100 md:ml-0 md:w-0 md:overflow-hidden md:opacity-0'
                                    : 'ml-3 w-auto opacity-100'
                            }`}
                        >
                            Transactions
                        </span>
                    </Link>

                    <Link
                        href={route('cashier.reward-redemptions.index')}
                        className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            route().current('cashier.reward-redemptions.*')
                                ? 'bg-red-50 text-red-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        aria-current={
                            route().current('cashier.reward-redemptions.*')
                                ? 'page'
                                : undefined
                        }
                    >
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                            local_offer
                        </span>

                        <span
                            className={`whitespace-nowrap transition-all duration-300 ${
                                isSidebarCollapsed
                                    ? 'ml-3 w-auto opacity-100 md:ml-0 md:w-0 md:overflow-hidden md:opacity-0'
                                    : 'ml-3 w-auto opacity-100'
                            }`}
                        >
                            Reward Redemptions
                        </span>
                    </Link>
                </nav>

                {/* Account */}
                <div
                    className={`border-t border-gray-100 p-4 transition-all duration-300 ${
                        isSidebarCollapsed ? 'md:flex md:justify-center' : ''
                    }`}
                >
                    <div
                        className={`min-w-0 overflow-hidden transition-all duration-300 ${
                            isSidebarCollapsed
                                ? 'w-auto opacity-100 md:w-0 md:opacity-0'
                                : 'w-auto opacity-100'
                        }`}
                    >
                        <p className="truncate px-1 text-sm font-medium text-gray-800">
                            {auth.user.name}
                        </p>

                        <p className="mt-0.5 truncate px-1 text-xs text-gray-500">
                            Cashier
                        </p>
                    </div>

                    <div
                        className={`transition-all duration-300 ${
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
                    className="fixed inset-0 z-30 bg-black/30 md:hidden"
                    aria-label="Close navigation menu"
                />
            )}

            {/* Main Content */}
            <main
                className={`min-h-screen transition-all duration-300 ${
                    isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
                }`}
            >
                {children}
            </main>
        </div>
    );
}