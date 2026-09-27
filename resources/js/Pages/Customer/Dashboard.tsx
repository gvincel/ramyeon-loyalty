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

            <div className="min-h-screen bg-slate-50">
                <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    {/* Welcome */}
                    <section className="mb-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
                                    Ramyeon Corner Loyalty
                                </p>

                                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                                    Welcome, {customer.first_name}
                                </h1>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                    Keep track of your loyalty points and use
                                    them when you're ready to redeem a reward.
                                </p>
                            </div>

                            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex">
                                <span
                                    className="material-symbols-outlined text-[18px] text-red-700"
                                    aria-hidden="true"
                                >
                                    verified
                                </span>

                                <span className="text-xs font-medium text-slate-600">
                                    Loyalty Member
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Summary Cards */}
                    <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
                        {/* Points Card */}
                        <section className="relative overflow-hidden rounded-2xl bg-red-700 p-6 text-white shadow-sm sm:p-7">
                            <div
                                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border border-white/10"
                                aria-hidden="true"
                            />

                            <div
                                className="pointer-events-none absolute -bottom-20 -right-4 h-48 w-48 rounded-full border border-white/10"
                                aria-hidden="true"
                            />

                            <div className="relative">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-red-100">
                                            Current Points
                                        </p>

                                        <div className="mt-4 flex items-end gap-2">
                                            <span className="text-4xl font-semibold tracking-tight sm:text-5xl">
                                                {customer.points.toLocaleString()}
                                            </span>

                                            <span className="mb-1.5 text-sm font-medium text-red-100">
                                                points
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                                        <span
                                            className="material-symbols-outlined text-[23px]"
                                            aria-hidden="true"
                                        >
                                            stars
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 border-t border-white/15 pt-4">
                                    <p className="text-sm leading-6 text-red-100">
                                        Your points can be used to redeem
                                        available rewards at Ramyeon Corner.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Customer Code */}
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Customer Code
                                    </p>

                                    <p className="mt-3 break-all text-2xl font-semibold tracking-tight text-slate-900">
                                        {customer.customer_code}
                                    </p>
                                </div>

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 ring-1 ring-red-100">
                                    <span
                                        className="material-symbols-outlined text-[22px] text-red-700"
                                        aria-hidden="true"
                                    >
                                        badge
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 border-t border-slate-100 pt-4">
                                <p className="text-sm leading-6 text-slate-500">
                                    Your unique identifier in the Ramyeon
                                    Corner loyalty program.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Customer Information */}
                    <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                    <span
                                        className="material-symbols-outlined text-[20px] text-slate-600"
                                        aria-hidden="true"
                                    >
                                        person
                                    </span>
                                </div>

                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">
                                        My Information
                                    </h2>

                                    <p className="mt-0.5 text-sm text-slate-500">
                                        Your registered customer information.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <dl className="grid gap-x-8 gap-y-6 px-6 py-6 sm:grid-cols-2 sm:px-7">
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Name
                                </dt>

                                <dd className="mt-1.5 text-sm font-medium text-slate-900">
                                    {customer.first_name} {customer.last_name}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Phone Number
                                </dt>

                                <dd className="mt-1.5 text-sm font-medium text-slate-900">
                                    {customer.phone_number}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Email
                                </dt>

                                <dd className="mt-1.5 break-all text-sm font-medium text-slate-900">
                                    {customer.email ?? 'Not provided'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Customer Code
                                </dt>

                                <dd className="mt-1.5 text-sm font-medium text-slate-900">
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