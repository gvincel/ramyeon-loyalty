import CashierLayout from '@/Layouts/CashierLayout';
import LogoutButton from '@/Components/LogoutButton';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <CashierLayout>
            <Head title="Cashier Dashboard" />

            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Cashier Dashboard
                </h1>

                <p className="mt-2 text-gray-600">
                    Welcome to the Ramyeon Corner Loyalty System.
                </p>

                <div className="mt-6 rounded-lg bg-white p-6 shadow">
                    <h2 className="text-lg font-semibold">
                        Cashier
                    </h2>

                    <p className="mt-2 text-gray-600">
                        You are logged in as a cashier.
                    </p>
                </div>
            </div>
        </CashierLayout>
    );
}