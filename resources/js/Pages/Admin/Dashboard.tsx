import LogoutButton from '@/Components/LogoutButton';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="min-h-screen bg-gray-100 p-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Admin Dashboard
                </h1>

                <LogoutButton />

                <p className="mt-2 text-gray-600">
                    Welcome to the Ramyeon Corner Loyalty System.
                </p>

                <div className="mt-6 rounded-lg bg-white p-6 shadow">
                    <h2 className="text-lg font-semibold">Administrator</h2>

                    <p className="mt-2 text-gray-600">
                        You are logged in as an administrator.
                    </p>
                </div>
            </div>
        </>
    );
}
