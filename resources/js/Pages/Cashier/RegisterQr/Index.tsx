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

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content">
                    <AdminPageHeader
                        eyebrow="Customer Management"
                        title="Registration QR"
                        description="Show this QR code to the customer so they can create their own loyalty account."
                    />

                    <div className="grid gap-6 lg:grid-cols-5">
                        <section className="panel overflow-hidden lg:col-span-3">
                            <div className="panel-header">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                                        <span className="material-symbols-outlined leading-none text-[22px]" aria-hidden="true">
                                            qr_code_2
                                        </span>
                                    </span>
                                    <div>
                                        <h2 className="panel-title">Scan to Register</h2>
                                        <p className="panel-desc">
                                            Hold the screen steady so the customer can scan comfortably.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center px-6 py-12">
                                <div className="relative">
                                    <span className="pointer-events-none absolute -left-3 -top-3 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-brand" aria-hidden="true" />
                                    <span className="pointer-events-none absolute -right-3 -top-3 h-6 w-6 rounded-tr-lg border-r-2 border-t-2 border-brand" aria-hidden="true" />
                                    <span className="pointer-events-none absolute -bottom-3 -left-3 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-brand" aria-hidden="true" />
                                    <span className="pointer-events-none absolute -bottom-3 -right-3 h-6 w-6 rounded-br-lg border-b-2 border-r-2 border-brand" aria-hidden="true" />

                                    <div className="rounded-card border border-line bg-white p-5 shadow-card">
                                        <QRCodeSVG
                                            value={registerUrl}
                                            size={260}
                                            level="M"
                                            includeMargin={false}
                                            aria-label="Customer registration QR code"
                                            className="h-auto w-full max-w-[260px]"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-brand-700">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75 motion-reduce:animate-none" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
                                    </span>
                                    Point your camera here
                                </div>
                            </div>

                            <div className="border-t border-line bg-surface-muted px-6 py-5">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined leading-none text-[18px] text-ink-subtle" aria-hidden="true">
                                        link
                                    </span>
                                    <p className="text-caption font-medium uppercase tracking-wider text-ink-muted">
                                        Can&apos;t scan? Share the link
                                    </p>
                                </div>

                                <div className="mt-3 flex items-center gap-2">
                                    <p className="min-w-0 flex-1 truncate rounded-control bg-canvas px-3 py-2 font-mono text-caption text-ink-muted ring-1 ring-line">
                                        {registerUrl}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className="btn-primary inline-flex shrink-0 items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined leading-none text-[18px]" aria-hidden="true">
                                            {copied ? 'check' : 'content_copy'}
                                        </span>
                                        {copied ? 'Copied' : 'Copy link'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        <aside className="panel lg:col-span-2">
                            <div className="panel-header">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                                        <span className="material-symbols-outlined leading-none text-[22px]" aria-hidden="true">
                                            checklist
                                        </span>
                                    </span>
                                    <div>
                                        <h2 className="panel-title">How it works</h2>
                                        <p className="panel-desc">
                                            Customers sign up on their own phone, no cashier input needed.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <ol className="relative space-y-6">
                                    <span
                                        className="pointer-events-none absolute left-4 top-4 bottom-4 w-px bg-line"
                                        aria-hidden="true"
                                    />

                                    {steps.map((step, index) => (
                                        <li key={step.title} className="relative flex gap-4">
                                            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-small font-semibold leading-none text-white ring-4 ring-surface">
                                                {index + 1}
                                            </span>

                                            <div className="pt-0.5">
                                                <h3 className="text-small font-semibold text-ink">
                                                    {step.title}
                                                </h3>
                                                <p className="mt-1 text-small leading-6 text-ink-muted">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>

                                <div className="mt-8 rounded-control border border-brand-200 bg-brand-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <span
                                            className="material-symbols-outlined mt-px leading-none text-[20px] text-brand-700"
                                            aria-hidden="true"
                                        >
                                            info
                                        </span>
                                        <div>
                                            <p className="text-small font-semibold text-brand-700">
                                                No cashier input needed
                                            </p>
                                            <p className="mt-1 text-small leading-5 text-brand-700/90">
                                                The customer creates and manages their own account from start to finish.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}