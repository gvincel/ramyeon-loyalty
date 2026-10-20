import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import CashierLayout from '@/Layouts/CashierLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminModal from '@/Components/AdminModal';
import StatusBadge from '@/Components/StatusBadge';
import { QRCodeSVG } from 'qrcode.react';

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

/* Row inside the information card. flex-1 lets the rows share any extra
   height, so the card always matches the QR card without dead space. */
function InfoRow({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-1 items-center justify-between gap-4 px-6 py-4">
            <dt className="shrink-0 text-sm font-medium text-[#64748B]">
                {label}
            </dt>
            <dd className="min-w-0 break-words text-right text-sm font-semibold text-[#111827]">
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

            <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <AdminPageHeader
                        eyebrow="Customer Management"
                        title={fullName}
                        description="View customer details and QR code."
                        action={
                            <Link
                                href={route('cashier.customers.index')}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] shadow-sm transition-colors hover:bg-[#F8FAFC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
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

                    {/* Points highlight — full width */}
                    <div className="rounded-[20px] border border-[#E5E7EB] border-t-2 border-t-[#DC2626] bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-[#64748B]">
                            Current Points
                        </p>

                        <div className="mt-3 flex items-baseline gap-2">
                            <p className="text-3xl font-bold tracking-tight text-[#111827]">
                                {formatNumber(customer.points)}
                            </p>

                            <span className="text-sm font-medium text-[#64748B]">
                                points
                            </span>
                        </div>

                        <p className="mt-2 text-xs text-[#64748B]">
                            Available for redeeming rewards
                        </p>
                    </div>

                    {/* Information + QR — side by side, equal height */}
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                        {/* Customer Information */}
                        <div className="flex flex-col overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-sm">
                            <div className="bg-[#B91C1C] px-6 py-5">
                                <h2 className="text-lg font-bold tracking-tight text-white">
                                    Customer Information
                                </h2>

                                <p className="mt-1 text-sm text-[#FECACA]">
                                    Contact details on file.
                                </p>
                            </div>

                            <dl className="flex flex-1 flex-col divide-y divide-[#E5E7EB]">
                                <InfoRow label="Customer Code">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="inline-flex rounded-md bg-[#F8FAFC] px-2.5 py-1 font-medium text-[#111827] ring-1 ring-[#E5E7EB]">
                                            {customer.customer_code}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => void handleCopyCustomerCode()}
                                            aria-label={
                                                copied
                                                    ? 'Customer code copied'
                                                    : 'Copy customer code'
                                            }
                                            title={copied ? 'Copied' : 'Copy customer code'}
                                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#DC2626] transition-colors hover:bg-[#FEF2F2] hover:text-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-1"
                                        >
                                            {copied ? (
                                                <svg
                                                    className="h-4 w-4 text-green-600"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M20 6L9 17l-5-5" />
                                                </svg>
                                            ) : (
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
                                                    <rect
                                                        x="9"
                                                        y="9"
                                                        width="11"
                                                        height="11"
                                                        rx="2"
                                                    />
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

                                <InfoRow
                                    label={
                                        qr && !qr.is_active
                                            ? 'QR Revoked'
                                            : 'QR Issued'
                                    }
                                >
                                    {qr && !qr.is_active
                                        ? formatDate(qr.revoked_at)
                                        : formatDate(qr?.created_at)}
                                </InfoRow>
                            </dl>
                        </div>

                        {/* Customer QR Code */}
                        <div className="flex flex-col overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-[#FEF2F2] shadow-sm">
                            <div className="bg-[#B91C1C] px-6 py-5">
                                <h2 className="text-lg font-bold tracking-tight text-white">
                                    Customer QR Code
                                </h2>

                                <p className="mt-1 text-sm text-[#FECACA]">
                                    Scan during a transaction.
                                </p>
                            </div>

                            {/* The QR sits alone in the flexible middle area, so it is centered both ways inside its own box */}
                            <div className="flex flex-1 items-center justify-center px-6 py-8">
                                {hasQr ? (
                                    <div
                                        className="inline-flex max-w-full rounded-[20px] border border-[#DC2626] bg-white p-4 shadow-sm"
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
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#DC2626]">
                                            <svg
                                                className="h-6 w-6"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                aria-hidden="true"
                                            >
                                                <rect
                                                    x="3"
                                                    y="3"
                                                    width="7"
                                                    height="7"
                                                    rx="1"
                                                />
                                                <rect
                                                    x="14"
                                                    y="3"
                                                    width="7"
                                                    height="7"
                                                    rx="1"
                                                />
                                                <rect
                                                    x="3"
                                                    y="14"
                                                    width="7"
                                                    height="7"
                                                    rx="1"
                                                />
                                                <path d="M14 14h3v3h-3zM19 14h2M14 19h2M19 19h2" />
                                            </svg>
                                        </div>

                                        <p className="mt-3 text-sm font-semibold text-[#111827]">
                                            No active QR code
                                        </p>

                                        <p className="mt-1 text-xs text-[#64748B]">
                                            This customer does not have an
                                            active QR code.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {hasQr && (
                                <div className="border-t border-[#FECACA] px-6 py-5">
                                    <button
                                        type="button"
                                        onClick={() => setShowFullQr(true)}
                                        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] shadow-sm transition-colors hover:bg-[#F8FAFC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                                    >
                                        <svg
                                            className="h-4 w-4 text-[#DC2626]"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <path d="M15 3h6v6" />
                                            <path d="M9 21H3v-6" />
                                            <path d="M21 3l-7 7" />
                                            <path d="M3 21l7-7" />
                                        </svg>
                                        View Full Size
                                    </button>

                                    <p className="mt-3 text-center text-xs text-[#64748B]">
                                        Keep this QR code private. It
                                        identifies the customer&apos;s loyalty
                                        account.
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
                            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#DC2626] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 sm:w-auto"
                        >
                            Done
                        </button>
                    }
                >
                    <div className="flex flex-col items-center bg-[#FEF2F2] px-6 py-6">
                        {/* Fixed medium size, centered with empty space on both sides */}
                        <div
                            className="inline-flex max-w-full rounded-[20px] border border-[#DC2626] bg-white p-5 shadow-sm"
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

                        <h3 className="mt-5 text-center text-lg font-bold text-[#111827]">
                            {fullName}
                        </h3>

                        <p className="mt-1 font-mono text-sm font-medium text-[#64748B]">
                            {customer.customer_code}
                        </p>
                    </div>
                </AdminModal>
            )}
        </CashierLayout>
    );
}