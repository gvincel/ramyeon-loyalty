import LogoutButton from '@/Components/LogoutButton';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function AdminLayout({
    children,
}: PropsWithChildren) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white">
                {/* Brand */}
                <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
                    <img
                        src="/images/ramyeon-logo-clear.png"
                        alt="Ramyeon Corner Logo"
                        className="h-10 w-10 object-contain"
                    />

                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-bold text-gray-900">
                            Ramyeon Corner
                        </h1>

                        <p className="mt-0.5 text-sm text-gray-500">
                            Admin
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav
                    className="flex-1 space-y-1 px-4 py-5"
                    aria-label="Admin navigation"
                >
                    <Link
                        href={route('admin.dashboard')}
                        className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            route().current('admin.dashboard')
                                ? 'bg-red-50 text-red-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        aria-current={
                            route().current('admin.dashboard')
                                ? 'page'
                                : undefined
                        }
                    >
                        Dashboard
                    </Link>

                    <Link
                        href={route('admin.customers.index')}
                        className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            route().current('admin.customers.*')
                                ? 'bg-red-50 text-red-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        aria-current={
                            route().current('admin.customers.*')
                                ? 'page'
                                : undefined
                        }
                    >
                        Customers
                    </Link>

                    <Link
                        href={route('admin.cashiers.index')}
                        className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            route().current('admin.cashiers.*')
                                ? 'bg-red-50 text-red-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        aria-current={
                            route().current('admin.cashiers.*')
                                ? 'page'
                                : undefined
                        }
                    >
                        Cashiers
                    </Link>

                    <Link
                        href={route('admin.rewards.index')}
                        className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            route().current('admin.rewards.*')
                                ? 'bg-red-50 text-red-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        aria-current={
                            route().current('admin.rewards.*')
                                ? 'page'
                                : undefined
                        }
                    >
                        Rewards
                    </Link>
                </nav>

                {/* Account */}
                <div className="border-t border-gray-100 p-4">
                    <p className="truncate px-1 text-sm font-medium text-gray-800">
                        {auth.user.name}
                    </p>

                    <p className="mt-0.5 truncate px-1 text-xs text-gray-500">
                        Administrator
                    </p>

                    <div className="mt-3">
                        <LogoutButton />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 min-h-screen">
                {children}
            </main>
        </div>
    );
}