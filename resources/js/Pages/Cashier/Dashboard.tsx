import CashierLayout from '@/Layouts/CashierLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <CashierLayout>
            <Head title="Cashier Dashboard" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <AdminPageHeader
                        eyebrow="Overview"
                        title="Cashier Dashboard"
                        description="Welcome to the Ramyeon Corner Loyalty System."
                    />

                    {/* Welcome Card */}
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                Cashier
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                You are logged in as a cashier.
                            </p>
                        </div>

                        <div className="p-6">
                            <p className="text-sm leading-6 text-gray-600">
                                Use the sidebar to register customers, scan customer QR codes,
                                process transactions, and manage reward redemptions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}