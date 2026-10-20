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

            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Welcome */}
                <CustomerPageHeader
                    eyebrow="Ramyeon Corner Loyalty"
                    title={`Welcome, ${customer.first_name}`}
                    description="Keep track of your loyalty points and use them when you're ready to redeem a reward."
                />

                {/* Dashboard Overview */}
                <div className="mt-7 grid items-stretch gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                    {/* Loyalty Account */}
                    <section className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card">
                        {/* Loyalty Balance */}
                        <div className="p-6 sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-caption font-semibold uppercase tracking-wider text-brand-700">
                                        Loyalty Account
                                    </p>

                                    <div className="mt-3 flex items-baseline gap-2">
                                        <span className="text-metric font-bold tracking-tight text-ink sm:text-[2.5rem]">
                                            {customer.points.toLocaleString()}
                                        </span>
                                        <span className="text-small font-medium text-ink-muted">
                                            points
                                        </span>
                                    </div>

                                    <p className="mt-1 text-small text-ink-muted">
                                        ₱{customer.points.toLocaleString()}{' '}
                                        equivalent value
                                    </p>
                                </div>

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-50 ring-1 ring-brand-100">
                                    <span className="material-symbols-outlined text-[22px] text-brand-700" aria-hidden="true">
                                        stars
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="flex flex-1 flex-col border-t border-line">
                            <div className="px-6 py-5 sm:px-7">
                                <h2 className="text-lead font-semibold text-ink">
                                    My Information
                                </h2>
                                <p className="mt-0.5 text-small text-ink-muted">
                                    Your registered information.
                                </p>
                            </div>

                            <dl className="grid flex-1 border-t border-line sm:grid-cols-2 sm:grid-rows-2">
                                <div className="flex items-center border-b border-line px-6 py-5 sm:border-r sm:px-7">
                                    <div>
                                        <dt className="text-caption font-semibold uppercase tracking-wider text-ink-subtle">
                                            Name
                                        </dt>
                                        <dd className="mt-1.5 break-words text-small font-medium text-ink">
                                            {customer.first_name}{' '}
                                            {customer.last_name}
                                        </dd>
                                    </div>
                                </div>

                                <div className="flex items-center border-b border-line px-6 py-5 sm:px-7">
                                    <div>
                                        <dt className="text-caption font-semibold uppercase tracking-wider text-ink-subtle">
                                            Phone Number
                                        </dt>
                                        <dd className="mt-1.5 break-words text-small font-medium text-ink">
                                            {customer.phone_number}
                                        </dd>
                                    </div>
                                </div>

                                <div className="flex items-center border-b border-line px-6 py-5 sm:border-r sm:px-7">
                                    <div>
                                        <dt className="text-caption font-semibold uppercase tracking-wider text-ink-subtle">
                                            Email
                                        </dt>
                                        <dd className="mt-1.5 break-all text-small font-medium text-ink">
                                            {customer.email ?? 'Not provided'}
                                        </dd>
                                    </div>
                                </div>

                                <div className="flex items-center px-6 py-5 sm:px-7">
                                    <div>
                                        <dt className="text-caption font-semibold uppercase tracking-wider text-ink-subtle">
                                            Customer Code
                                        </dt>
                                        <dd className="mt-1.5 break-all text-small font-medium text-ink">
                                            {customer.customer_code}
                                        </dd>
                                    </div>
                                </div>
                            </dl>
                        </div>
                    </section>

                    {/* Customer QR Code */}
                    <section className="flex flex-col rounded-card border border-line bg-surface p-6 shadow-card sm:p-7">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-caption font-semibold uppercase tracking-wider text-brand-700">
                                    My QR Code
                                </p>
                                <h2 className="mt-1.5 text-lead font-semibold tracking-tight text-ink">
                                    Scan for Loyalty
                                </h2>
                                <p className="mt-1 text-small text-ink-muted">
                                    Show this QR code to the cashier when making a purchase.
                                </p>
                            </div>

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-50 ring-1 ring-brand-100">
                                <span className="material-symbols-outlined text-[22px] text-brand-700" aria-hidden="true">
                                    qr_code_2
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-1 items-center justify-center py-6">
                            {customer.qr_token ? (
                                <div
                                    ref={qrContainerRef}
                                    className="inline-flex rounded-control border border-line bg-white p-4"
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
                                <div className="flex min-h-[232px] w-full items-center justify-center rounded-control border border-line bg-surface-muted px-6 text-center">
                                    <div>
                                        <span className="material-symbols-outlined text-[32px] text-ink-subtle" aria-hidden="true">
                                            qr_code_2
                                        </span>
                                        <p className="mt-2 text-small font-medium text-ink">
                                            QR code unavailable
                                        </p>
                                        <p className="mt-1 text-caption leading-5 text-ink-muted">
                                            Please contact the staff for assistance.
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
                                    className="btn-secondary w-full"
                                >
                                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                                        {savingQr ? 'progress_activity' : 'download'}
                                    </span>
                                    <span>
                                        {savingQr ? 'Saving…' : 'Save QR Code'}
                                    </span>
                                </button>

                                {qrSaveError && (
                                    <p role="alert" className="mt-2 text-caption font-medium text-danger-700">
                                        {qrSaveError}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="border-t border-line pt-4">
                            <p className="text-small leading-6 text-ink-muted">
                                Keep your QR code ready when visiting Ramyeon Corner to earn loyalty points.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </CustomerLayout>
    );
}