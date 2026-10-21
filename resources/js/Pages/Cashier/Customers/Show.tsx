import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import CashierLayout from '@/Layouts/CashierLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminModal from '@/Components/AdminModal';
import StatusBadge from '@/Components/StatusBadge';
import { QRCodeSVG } from 'qrcode.react';
import { ReactNode } from 'react';

interface CustomerQrCode {
    id: number;
    qr_token: string;
    is_active: boolean;
    created_at: string;
    revoked_at: string | null;
}

interface Customer {
    id: number;
    customer_code: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string | null;
    points: number;
    is_active: boolean;
    qr_code: CustomerQrCode | null;
}

interface Props {
    customer: Customer;
}

const formatNumber = (value: string | number) => {
    return Number(value).toLocaleString('en-PH');
};

const formatDate = (value: string | null | undefined) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex flex-1 items-center justify-between gap-4 px-6 py-4">
            <dt className="shrink-0 text-small font-medium text-ink-muted">
                {label}
            </dt>
            <dd className="min-w-0 break-words text-right text-small font-semibold text-ink">
                {children}
            </dd>
        </div>
    );
}

export default function Show({ customer }: Props) {
    const [showFullQr, setShowFullQr] = useState(false);
    const [copied, setCopied] = useState(false);

    const fullName = `${customer.first_name} ${customer.last_name}`;
    const qr = customer.qr_code;
    const hasQr = qr !== null && qr.is_active;

    const handleCopyCustomerCode = async () => {
        try {
            await navigator.clipboard.writeText(customer.customer_code);
            setCopied(true);
            window.setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <CashierLayout>
            <Head title={fullName} />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content">
                    {/* Header */}
                    <AdminPageHeader
                        eyebrow="Customer Management"
                        title={fullName}
                        description="View customer details and QR code."
                        action={
                            <Link
                                href={route('cashier.customers.index')}
                                className="btn-secondary"
                            >
                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                                Back to Records
                            </Link>
                        }
                    />

                    {/* Points highlight */}
                    <div className="panel flex flex-col justify-center border-l-4 border-l-brand p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-small font-medium text-ink-muted">
                                Current Points
                            </p>
                            <div className="mt-2 flex items-baseline gap-2">
                                <p className="text-metric font-bold tracking-tight text-ink">
                                    {formatNumber(customer.points)}
                                </p>
                                <span className="text-small font-medium text-ink-muted">
                                    points
                                </span>
                            </div>
                            <p className="mt-1 text-caption text-ink-subtle">
                                Available for redeeming rewards
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-control bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                                <span className="material-symbols-outlined text-[24px]">
                                    stars
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Information + QR — side by side */}
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {/* Customer Information */}
                        <div className="panel flex flex-col">
                            <div className="panel-header">
                                <h2 className="panel-title">Customer Information</h2>
                                <p className="panel-desc">Contact details on file.</p>
                            </div>

                            <dl className="flex flex-1 flex-col divide-y divide-line">
                                <InfoRow label="Customer Code">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="chip">
                                            {customer.customer_code}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => void handleCopyCustomerCode()}
                                            aria-label={copied ? 'Customer code copied' : 'Copy customer code'}
                                            title={copied ? 'Copied' : 'Copy customer code'}
                                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line-strong bg-surface text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
                                        >
                                            {copied ? (
                                                <svg className="h-4 w-4 text-success-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <path d="M20 6L9 17l-5-5" />
                                                </svg>
                                            ) : (
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <rect x="9" y="9" width="11" height="11" rx="2" />
                                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                                </svg>
                                            )}
                                        </button>
                                    </span>
                                </InfoRow>

                                <InfoRow label="Phone Number">
                                    {customer.phone_number}
                                </InfoRow>

                                <InfoRow label="Email">
                                    <span className="break-all">
                                        {customer.email || '—'}
                                    </span>
                                </InfoRow>

                                <InfoRow label="Account Status">
                                    <StatusBadge active={customer.is_active} />
                                </InfoRow>

                                <InfoRow label="QR Status">
                                    <StatusBadge active={hasQr} />
                                </InfoRow>

                                <InfoRow label={qr && !qr.is_active ? 'QR Revoked' : 'QR Issued'}>
                                    {qr && !qr.is_active
                                        ? formatDate(qr.revoked_at)
                                        : formatDate(qr?.created_at)}
                                </InfoRow>
                            </dl>
                        </div>

                        {/* Customer QR Code */}
                        <div className="panel flex flex-col">
                            <div className="panel-header">
                                <h2 className="panel-title">Customer QR Code</h2>
                                <p className="panel-desc">Scan during a transaction.</p>
                            </div>

                            <div className="flex flex-1 items-center justify-center px-6 py-8">
                                {hasQr ? (
                                    <div
                                        className="inline-flex max-w-full rounded-control border border-line bg-white p-4"
                                        role="img"
                                        aria-label={`QR code for ${fullName}`}
                                    >
                                        <QRCodeSVG
                                            value={qr!.qr_token}
                                            size={200}
                                            level="H"
                                            bgColor="#ffffff"
                                            fgColor="#000000"
                                            className="block"
                                        />
                                    </div>
                                ) : (
                                    <div className="py-6 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink-subtle">
                                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                                <path d="M14 14h3v3h-3zM19 14h2M14 19h2M19 19h2" />
                                            </svg>
                                        </div>
                                        <p className="mt-3 text-small font-semibold text-ink">
                                            No active QR code
                                        </p>
                                        <p className="mt-1 text-caption text-ink-muted">
                                            This customer does not have an active QR code.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {hasQr && (
                                <div className="border-t border-line px-6 py-5">
                                    <button
                                        type="button"
                                        onClick={() => setShowFullQr(true)}
                                        className="btn-secondary w-full"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M15 3h6v6" />
                                            <path d="M9 21H3v-6" />
                                            <path d="M21 3l-7 7" />
                                            <path d="M3 21l7-7" />
                                        </svg>
                                        View Full Size
                                    </button>
                                    <p className="mt-3 text-center text-caption text-ink-subtle">
                                        Keep this QR code private. It identifies the customer's loyalty account.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Full-size QR modal */}
            {showFullQr && hasQr && (
                <AdminModal
                    title="Customer QR Code"
                    description="Full-size view for easy scanning."
                    onClose={() => setShowFullQr(false)}
                    maxWidthClass="max-w-lg"
                    footer={
                        <button
                            type="button"
                            onClick={() => setShowFullQr(false)}
                            className="btn-primary w-full sm:w-auto"
                        >
                            Done
                        </button>
                    }
                >
                    <div className="flex flex-col items-center px-6 py-6">
                        <div
                            className="inline-flex max-w-full rounded-card border border-line bg-white p-5"
                            role="img"
                            aria-label={`Full-size QR code for ${fullName}`}
                        >
                            <QRCodeSVG
                                value={qr!.qr_token}
                                size={250}
                                level="H"
                                bgColor="#ffffff"
                                fgColor="#000000"
                                className="block max-w-full"
                                style={{ height: 'auto' }}
                            />
                        </div>

                        <h3 className="mt-5 text-center text-heading font-semibold text-ink">
                            {fullName}
                        </h3>
                        <p className="mt-1 font-mono text-small font-medium text-ink-muted">
                            {customer.customer_code}
                        </p>
                    </div>
                </AdminModal>
            )}
        </CashierLayout>
    );
}