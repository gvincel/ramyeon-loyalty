import CashierLayout from '@/Layouts/CashierLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import { Head } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

interface Props {
    registerUrl: string;
}

const steps = [
    {
        title: 'Open the camera',
        description: 'Ask the customer to open the camera app on their phone.',
    },
    {
        title: 'Scan the code',
        description: 'Have them point the camera at the QR code and tap the link that appears.',
    },
    {
        title: 'Complete the form',
        description: 'They fill in their details and finish signing up on their own.',
    },
];

export default function Index({ registerUrl }: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(registerUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <CashierLayout>
            <Head title="Registration QR" />

            <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-5xl">
                    <AdminPageHeader
                        eyebrow="Customer Management"
                        title="Registration QR"
                        description="Show this QR code to the customer so they can create their own loyalty account."
                    />

                    <div className="grid gap-6 lg:grid-cols-5">
                        {/* QR card */}
                        <section className="overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-[#FEF2F2] shadow-sm lg:col-span-3">
                            <header className="bg-[#B91C1C] px-6 py-5">
                                <h2 className="text-lg font-bold tracking-tight text-white">
                                    Scan to Register
                                </h2>
                                <p className="mt-1 text-sm text-[#FECACA]">
                                    Hold the screen steady so the customer can scan comfortably.
                                </p>
                            </header>

                            <div className="flex flex-col items-center px-6 py-10">
                                <div className="rounded-[20px] border border-[#DC2626] bg-white p-5 shadow-sm">
                                    <QRCodeSVG
                                        value={registerUrl}
                                        size={260}
                                        level="M"
                                        includeMargin={false}
                                        aria-label="Customer registration QR code"
                                        className="h-auto w-full max-w-[260px]"
                                    />
                                </div>

                                <p className="mt-6 text-center text-xs font-medium uppercase tracking-wider text-[#B91C1C]">
                                    Point your camera here
                                </p>
                            </div>

                            <footer className="border-t border-[#E5E7EB] bg-white px-6 py-4">
                                <p className="text-xs font-medium uppercase tracking-wider text-[#111827]">
                                    Can&apos;t scan? Share the link
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                    <p className="min-w-0 flex-1 truncate rounded-lg bg-[#F8FAFC] px-3 py-2 text-xs text-[#64748B] ring-1 ring-[#E5E7EB]">
                                        {registerUrl}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className="shrink-0 rounded-lg bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                                    >
                                        {copied ? 'Copied' : 'Copy link'}
                                    </button>
                                </div>
                            </footer>
                        </section>

                        {/* Instructions card */}
                        <aside className="rounded-[20px] border border-[#E5E7EB] border-t-2 border-t-[#DC2626] bg-white p-6 shadow-sm lg:col-span-2">
                            <h2 className="text-lg font-bold tracking-tight text-[#111827]">
                                How it works
                            </h2>
                            <p className="mt-1 text-sm text-[#64748B]">
                                Customers sign up on their own phone, no cashier input needed.
                            </p>

                            <ol className="mt-6 space-y-6">
                                {steps.map((step, index) => (
                                    <li key={step.title} className="flex gap-4">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DC2626] text-sm font-semibold text-white">
                                            {index + 1}
                                        </span>

                                        <div>
                                            <h3 className="text-sm font-semibold text-[#111827]">
                                                {step.title}
                                            </h3>
                                            <p className="mt-0.5 text-sm leading-6 text-[#64748B]">
                                                {step.description}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </aside>
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}