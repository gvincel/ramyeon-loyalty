import { Head } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';

type Customer = {
    id: number;
    customer_code: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string | null;
    points: number;
};

type DashboardProps = {
    customer: Customer;
};

export default function Dashboard({ customer }: DashboardProps) {
    return (
        <CustomerLayout>
            <Head title="My Loyalty Dashboard" />

            <div className="min-h-screen bg-gray-50">
                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <p className="text-sm font-medium text-gray-500">
                            Ramyeon Corner Loyalty
                        </p>

                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                            Welcome, {customer.first_name}
                        </h1>

                        <p className="mt-2 text-sm text-gray-600">
                            View your loyalty points, rewards, and account
                            information.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Current Points
                            </p>

                            <div className="mt-3 flex items-end gap-2">
                                <span className="text-4xl font-bold tracking-tight text-gray-900">
                                    {customer.points.toLocaleString()}
                                </span>

                                <span className="mb-1 text-sm font-medium text-gray-500">
                                    points
                                </span>
                            </div>

                            <p className="mt-3 text-sm text-gray-500">
                                Use your points to redeem available rewards.
                            </p>
                        </section>

                        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Customer Code
                            </p>

                            <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
                                {customer.customer_code}
                            </p>

                            <p className="mt-3 text-sm text-gray-500">
                                Your unique Ramyeon Corner customer code.
                            </p>
                        </section>
                    </div>

                    <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="border-b border-gray-100 pb-5">
                            <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                My Information
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Your registered customer information.
                            </p>
                        </div>

                        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Name
                                </dt>

                                <dd className="mt-1 text-sm font-semibold text-gray-900">
                                    {customer.first_name} {customer.last_name}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Phone Number
                                </dt>

                                <dd className="mt-1 text-sm font-semibold text-gray-900">
                                    {customer.phone_number}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Email
                                </dt>

                                <dd className="mt-1 text-sm font-semibold text-gray-900">
                                    {customer.email ?? 'Not provided'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">
                                    Customer Code
                                </dt>

                                <dd className="mt-1 text-sm font-semibold text-gray-900">
                                    {customer.customer_code}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </main>
            </div>
        </CustomerLayout>
    );
}