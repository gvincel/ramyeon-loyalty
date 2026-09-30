import { Head } from '@inertiajs/react';

import { useRef, useState } from 'react';

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
    const qrContainerRef = useRef<HTMLDivElement>(null);
    const [savingQr, setSavingQr] = useState(false);
    const [qrSaveError, setQrSaveError] = useState<string | null>(null);

    const handleSaveQr = async () => {
        const svg = qrContainerRef.current?.querySelector('svg');
        if (!svg) {
            return;
        }

        setSavingQr(true);
        setQrSaveError(null);

        let objectUrl: string | null = null;

        try {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svg);
            const svgBlob = new Blob([svgString], {
                type: 'image/svg+xml;charset=utf-8',
            });
            objectUrl = URL.createObjectURL(svgBlob);

            const image = new Image();

            await new Promise<void>((resolve, reject) => {
                image.onload = () => resolve();
                image.onerror = () =>
                    reject(new Error('Failed to load QR image'));
                image.src = objectUrl as string;
            });

            const scale = 2;
            const size = 200;
            const padding = 32;
            const totalSize = size + padding * 2;

            const canvas = document.createElement('canvas');
            canvas.width = totalSize * scale;
            canvas.height = totalSize * scale;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Canvas not supported');
            }

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
                image,
                padding * scale,
                padding * scale,
                size * scale,
                size * scale,
            );

            URL.revokeObjectURL(objectUrl);
            objectUrl = null;

            const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, 'image/png'),
            );

            if (!blob) {
                throw new Error('Failed to generate PNG');
            }

            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `Ramyeon-Loyalty-QR-${customer.customer_code}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
        } catch {
            setQrSaveError('Could not save the QR code. Please try again.');
        } finally {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
            setSavingQr(false);
        }
    };

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
                                    <div
                                        ref={qrContainerRef}
                                        className="inline-flex rounded-xl border border-slate-200 bg-white p-4"
                                    >
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

                            {customer.qr_token && (
                                <div className="pb-4">
                                    <button
                                        type="button"
                                        onClick={handleSaveQr}
                                        disabled={savingQr}
                                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <span
                                            className="material-symbols-outlined text-[18px]"
                                            aria-hidden="true"
                                        >
                                            {savingQr
                                                ? 'progress_activity'
                                                : 'download'}
                                        </span>

                                        <span>
                                            {savingQr
                                                ? 'Saving…'
                                                : 'Save QR Code'}
                                        </span>
                                    </button>

                                    {qrSaveError && (
                                        <p
                                            role="alert"
                                            className="mt-2 text-xs text-red-700"
                                        >
                                            {qrSaveError}
                                        </p>
                                    )}
                                </div>
                            )}

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
