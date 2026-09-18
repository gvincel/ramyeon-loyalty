import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useState } from 'react';

import QRScanner from '@/Components/QRScanner';

interface Customer {
    id: number;
    customer_code: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    points: number;
}

interface ValidationErrors {
    receipt_number?: string[];
    purchase_amount?: string[];
}

export default function QRScannerPage() {
    const [scannedText, setScannedText] = useState<string | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
        {},
    );
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [receiptNumber, setReceiptNumber] = useState('');
    const [purchaseAmount, setPurchaseAmount] = useState('');

    const handleScan = useCallback(async (decodedText: string) => {
        setScannedText(decodedText);
        setCustomer(null);
        setError(null);
        setSuccess(null);
        setValidationErrors({});
        setReceiptNumber('');
        setPurchaseAmount('');
        setIsLoading(true);

        try {
            const response = await axios.post(
                '/cashier/transactions/find-customer',
                {
                    qr_token: decodedText,
                },
            );

            setCustomer(response.data.customer);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(
                    error.response?.data?.message || 'Unable to find customer.',
                );
            } else {
                setError('Something went wrong while finding the customer.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleError = useCallback((errorMessage: string) => {
        setError(errorMessage);
    }, []);

    const handleSubmit = async () => {
        if (!customer) {
            return;
        }

        setError(null);
        setSuccess(null);
        setValidationErrors({});
        setIsSubmitting(true);

        try {
            const response = await axios.post('/cashier/transactions', {
                customer_id: customer.id,
                receipt_number:
                    receiptNumber.trim() !== '' ? receiptNumber.trim() : null,
                purchase_amount: purchaseAmount,
            });

            setSuccess(response.data.message);

            setCustomer({
                ...customer,
                points: response.data.new_points,
            });

            setReceiptNumber('');
            setPurchaseAmount('');
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422) {
                    setValidationErrors(error.response.data.errors || {});
                } else {
                    setError(
                        error.response?.data?.message ||
                            'Unable to complete transaction.',
                    );
                }
            } else {
                setError(
                    'Something went wrong while completing the transaction.',
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const purchaseValue = Number(purchaseAmount);

    const pointsEarned =
        purchaseAmount !== '' && purchaseValue > 0
            ? Math.floor(purchaseValue / 100)
            : 0;

    return (
        <>
            <Head title="QR Scanner" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-2xl">
                    <h1 className="text-2xl font-bold text-gray-900">
                        QR Scanner
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Scan a customer's QR code to process a loyalty
                        transaction.
                    </p>

                    <div className="mt-6 rounded-lg bg-white p-6 shadow">
                        {!customer && !isLoading && (
                            <QRScanner
                                onScan={handleScan}
                                onError={handleError}
                            />
                        )}

                        {isLoading && (
                            <div className="rounded-md bg-blue-50 p-4">
                                <p className="text-sm font-medium text-blue-800">
                                    Looking up customer...
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 rounded-md bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-800">
                                    {error}
                                </p>
                            </div>
                        )}

                        {success && (
                            <div className="mt-4 rounded-md bg-green-50 p-4">
                                <p className="text-sm font-medium text-green-800">
                                    {success}
                                </p>
                            </div>
                        )}

                        {customer && (
                            <>
                                <div className="rounded-md bg-green-50 p-4">
                                    <p className="text-sm font-medium text-green-800">
                                        Customer Found
                                    </p>

                                    <div className="mt-3 space-y-1 text-sm text-green-900">
                                        <p>
                                            <strong>Name:</strong>{' '}
                                            {customer.first_name}{' '}
                                            {customer.last_name}
                                        </p>

                                        <p>
                                            <strong>Customer Code:</strong>{' '}
                                            {customer.customer_code}
                                        </p>

                                        <p>
                                            <strong>Phone:</strong>{' '}
                                            {customer.phone_number}
                                        </p>

                                        <p>
                                            <strong>Current Points:</strong>{' '}
                                            {customer.points}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 border-t pt-6">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Transaction Details
                                    </h2>

                                    <div className="mt-4">
                                        <label
                                            htmlFor="receipt_number"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Receipt Number
                                        </label>

                                        <input
                                            id="receipt_number"
                                            type="text"
                                            value={receiptNumber}
                                            onChange={(event) => {
                                                setReceiptNumber(
                                                    event.target.value,
                                                );
                                                setValidationErrors(
                                                    (current) => ({
                                                        ...current,
                                                        receipt_number:
                                                            undefined,
                                                    }),
                                                );
                                            }}
                                            placeholder="Enter receipt number (optional)"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                                        />

                                        {validationErrors.receipt_number && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {
                                                    validationErrors
                                                        .receipt_number[0]
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4">
                                        <label
                                            htmlFor="purchase_amount"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Purchase Amount
                                        </label>

                                        <div className="relative mt-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                ₱
                                            </span>

                                            
                                            <input
                                                id="purchase_amount"
                                                type="text"
                                                inputMode="decimal"
                                                value={purchaseAmount}
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === '-' ||
                                                        event.key === '+' ||
                                                        event.key === 'e' ||
                                                        event.key === 'E'
                                                    ) {
                                                        event.preventDefault();
                                                    }
                                                }}
                                                onWheel={(event) => {
                                                    event.currentTarget.blur();
                                                }}
                                                onChange={(event) => {
                                                    const value = event.target.value;

                                                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                                                        setPurchaseAmount(value);

                                                        setValidationErrors((current) => ({
                                                            ...current,
                                                            purchase_amount: undefined,
                                                        }));
                                                    }
                                                }}
                                                placeholder="0.00"
                                                className="block w-full rounded-md border-gray-300 pl-8 shadow-sm focus:border-red-500 focus:ring-red-500"
                                            />

                                        </div>

                                        {validationErrors.purchase_amount && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {
                                                    validationErrors
                                                        .purchase_amount[0]
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-6 rounded-md bg-yellow-50 p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-yellow-800">
                                                Points to Earn
                                            </span>

                                            <span className="text-2xl font-bold text-yellow-900">
                                                {pointsEarned}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-xs text-yellow-700">
                                            Every ₱100 spent earns 1 point.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={
                                            isSubmitting ||
                                            purchaseAmount === ''
                                        }
                                        className="mt-6 w-full rounded-md bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isSubmitting
                                            ? 'Processing Transaction...'
                                            : 'Complete Transaction'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
