import { Head } from '@inertiajs/react';

import { QRCodeSVG } from 'qrcode.react';

import CustomerLayout from '@/Layouts/CustomerLayout';

import CustomerPageHeader from '@/Components/CustomerPageHeader';

type Customer = {
    id: number;
    customer_code: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string | null;
    points: number;
    qr_token: string | null;
};

type DashboardProps = {
    customer: Customer;
};

export default function Dashboard({ customer }: DashboardProps) {
    return (
        <CustomerLayout>
            <Head title="My Loyalty Dashboard" />

            <div className="min-h-screen bg-slate-50">
                <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    {/* Welcome */}
                    <CustomerPageHeader
                        eyebrow="Ramyeon Corner Loyalty"
                        title={`Welcome, ${customer.first_name}`}
                        description="Keep track of your loyalty points and use them when you're ready to redeem a reward."
                    />

                    {/* Dashboard Overview */}
                    <div className="grid items-stretch gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                        {/* Loyalty Account */}
                        <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            {/* Loyalty Balance */}
                            <div className="p-6 sm:p-7">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
                                            Loyalty Account
                                        </p>

                                        <div className="mt-3 flex items-baseline gap-2">
                                            <span className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                                                {customer.points.toLocaleString()}
                                            </span>

                                            <span className="text-sm font-medium text-slate-500">
                                                points
                                            </span>
                                        </div>

                                        <p className="mt-1 text-sm text-slate-500">
                                            ₱{customer.points.toLocaleString()}{' '}
                                            equivalent value
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-100">
                                        <span
                                            className="material-symbols-outlined text-[22px] text-red-700"
                                            aria-hidden="true"
                                        >
                                            stars
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="flex flex-1 flex-col border-t border-slate-100">
                                <div className="px-6 py-5 sm:px-7">
                                    <h2 className="text-base font-semibold text-slate-900">
                                        My Information
                                    </h2>

                                    <p className="mt-0.5 text-sm text-slate-500">
                                        Your registered information.
                                    </p>
                                </div>

                                <dl className="grid flex-1 border-t border-slate-100 sm:grid-cols-2 sm:grid-rows-2">
                                    <div className="flex items-center border-b border-slate-100 px-6 py-5 sm:border-r sm:px-7">
                                        <div>
                                            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                                Name
                                            </dt>

                                            <dd className="mt-1.5 break-words text-sm font-medium text-slate-900">
                                                {customer.first_name}{' '}
                                                {customer.last_name}
                                            </dd>
                                        </div>
                                    </div>

                                    <div className="flex items-center border-b border-slate-100 px-6 py-5 sm:px-7">
                                        <div>
                                            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                                Phone Number
                                            </dt>

                                            <dd className="mt-1.5 break-words text-sm font-medium text-slate-900">
                                                {customer.phone_number}
                                            </dd>
                                        </div>
                                    </div>

                                    <div className="flex items-center border-b border-slate-100 px-6 py-5 sm:border-r sm:px-7">
                                        <div>
                                            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                                Email
                                            </dt>

                                            <dd className="mt-1.5 break-all text-sm font-medium text-slate-900">
                                                {customer.email ??
                                                    'Not provided'}
                                            </dd>
                                        </div>
                                    </div>

                                    <div className="flex items-center px-6 py-5 sm:px-7">
                                        <div>
                                            <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                                Customer Code
                                            </dt>

                                            <dd className="mt-1.5 break-all text-sm font-medium text-slate-900">
                                                {customer.customer_code}
                                            </dd>
                                        </div>
                                    </div>
                                </dl>
                            </div>
                        </section>

                        {/* Customer QR Code */}
                        <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">
                                        My QR Code
                                    </p>

                                    <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900">
                                        Scan for Loyalty
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Show this QR code to the cashier when
                                        making a purchase.
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-100">
                                    <span
                                        className="material-symbols-outlined text-[22px] text-red-700"
                                        aria-hidden="true"
                                    >
                                        qr_code_2
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-1 items-center justify-center py-6">
                                {customer.qr_token ? (
                                    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-4">
                                        <QRCodeSVG
                                            value={customer.qr_token}
                                            size={200}
                                            level="H"
                                            bgColor="#ffffff"
                                            fgColor="#000000"
                                            className="block h-auto max-w-full"
                                            aria-label="Customer loyalty QR code"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex min-h-[232px] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-6 text-center">
                                        <div>
                                            <span
                                                className="material-symbols-outlined text-[32px] text-slate-400"
                                                aria-hidden="true"
                                            >
                                                qr_code_2
                                            </span>

                                            <p className="mt-2 text-sm font-medium text-slate-700">
                                                QR code unavailable
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                Please contact the staff for
                                                assistance.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <p className="text-sm leading-6 text-slate-500">
                                    Keep your QR code ready when visiting
                                    Ramyeon Corner to earn loyalty points.
                                </p>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </CustomerLayout>
    );
}
