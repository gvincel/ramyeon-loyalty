import LogoutButton from '@/Components/LogoutButton';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function CashierLayout({
    children,
}: PropsWithChildren) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-gray-100">
            <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow">
                <div className="flex items-center gap-3 p-6">
                    <img
                        src="/images/ramyeon-logo.jpg"
                        alt="Ramyeon Corner Logo"
                        className="h-12 w-12 object-contain"
                    />

                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Ramyeon Corner
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Cashier
                        </p>
                    </div>
                </div>

                <nav className="space-y-1 px-4">
                    <Link
                        href={route('cashier.dashboard')}
                        className="block rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        Dashboard
                    </Link>

                    <Link
                        href={route('cashier.customers.register')}
                        className="block rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        Register Customer
                    </Link>

                    <Link
                        href={route('cashier.qr-scanner')}
                        className="block rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        QR Scanner
                    </Link>

                    <Link
                        href={route('cashier.transactions.index')}
                        className="block rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        Transactions
                    </Link>

                    <Link
                        href={route('cashier.reward-redemptions.index')}
                        className="block rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        Reward Redemption History
                    </Link>
                </nav>

                <div className="absolute bottom-0 w-full border-t p-4">
                    <p className="mb-3 text-sm text-gray-600">
                        {auth.user.name}
                    </p>

                    <LogoutButton />
                </div>
            </aside>

            <main className="ml-64 min-h-screen p-6">
                {children}
            </main>
        </div>
    );
}