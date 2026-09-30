import CashierLayout from '@/Layouts/CashierLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import { Head } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
    registerUrl: string;
}

export default function Index({ registerUrl }: Props) {
    return (
        <CashierLayout>
            <Head title="Registration QR" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-3xl">
                    <AdminPageHeader
                        eyebrow="Customer Management"
                        title="Registration QR"
                        description="Show this QR code to the customer so they can create their own loyalty account."
                    />

                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-5">
                            <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                Scan to Register
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Ask the customer to open their phone camera and
                                point it at the QR code below.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-6 px-6 py-10">
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                <QRCodeSVG
                                    value={registerUrl}
                                    size={280}
                                    level="M"
                                    includeMargin={false}
                                    aria-label="Customer registration QR code"
                                />
                            </div>

                            <div className="max-w-md text-center">
                                <p className="text-sm leading-6 text-gray-600">
                                    They&apos;ll be taken to the registration
                                    page on their own phone, and can sign up
                                    without needing help from the cashier.
                                </p>

                                <p className="mt-4 break-all rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500 ring-1 ring-gray-200">
                                    {registerUrl}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}