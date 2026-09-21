import QRScanner from '@/Components/QRScanner';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useState } from 'react';

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

interface Reward {
    id: number;
    reward_name: string;
    reward_type: 'discount' | 'free_item';
    points_required: number;
    reward_value: string | null;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
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

    const [rewards, setRewards] = useState<Reward[]>([]);
    const [isLoadingRewards, setIsLoadingRewards] = useState(false);
    const [redeemingRewardId, setRedeemingRewardId] = useState<number | null>(
        null,
    );

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
        setRewards([]);
        setIsLoading(true);

        try {
            const response = await axios.post(
                '/cashier/transactions/find-customer',
                {
                    qr_token: decodedText,
                },
            );

            const customerData = response.data.customer;

            setCustomer(customerData);

            setIsLoadingRewards(true);

            try {
                const rewardsResponse = await axios.post(
                    '/cashier/rewards/available',
                    {
                        customer_id: customerData.id,
                    },
                );

                setRewards(rewardsResponse.data.rewards);
            } catch (error) {
                setRewards([]);
            } finally {
                setIsLoadingRewards(false);
            }
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

    const handleRedeemReward = async (rewardId: number) => {
        if (!customer) {
            return;
        }

        setError(null);
        setSuccess(null);
        setRedeemingRewardId(rewardId);

        try {
            const response = await axios.post(
                '/cashier/reward-redemptions',
                {
                    customer_id: customer.id,
                    reward_id: rewardId,
                },
            );

            setCustomer({
                ...customer,
                points: response.data.new_points,
            });

            setSuccess(response.data.message);

            try {
                const rewardsResponse = await axios.post(
                    '/cashier/rewards/available',
                    {
                        customer_id: customer.id,
                    },
                );

                setRewards(rewardsResponse.data.rewards);
            } catch {
                // The redemption already succeeded.
                // Keep the updated customer points even if
                // refreshing the rewards list fails.
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(
                    error.response?.data?.message ||
                        'Unable to redeem reward.',
                );
            } else {
                setError(
                    'Something went wrong while redeeming the reward.',
                );
            }
        } finally {
            setRedeemingRewardId(null);
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
                                {/* Customer Information */}
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

                                {/* Transaction Details */}
                                <div className="mt-6 border-t pt-6">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Transaction Details
                                    </h2>

                                    {/* Receipt Number */}
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

                                    {/* Purchase Amount */}
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
                                                    const value =
                                                        event.target.value;

                                                    if (
                                                        /^\d*\.?\d{0,2}$/.test(
                                                            value,
                                                        )
                                                    ) {
                                                        setPurchaseAmount(
                                                            value,
                                                        );

                                                        setValidationErrors(
                                                            (current) => ({
                                                                ...current,
                                                                purchase_amount:
                                                                    undefined,
                                                            }),
                                                        );
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

                                    {/* Points to Earn */}
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

                                    {/* Complete Transaction */}
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

                                {/* Available Rewards */}
                                <div className="mt-6 border-t pt-6">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Available Rewards
                                    </h2>

                                    {isLoadingRewards && (
                                        <div className="mt-4 rounded-md bg-blue-50 p-4">
                                            <p className="text-sm font-medium text-blue-800">
                                                Loading available rewards...
                                            </p>
                                        </div>
                                    )}

                                    {!isLoadingRewards &&
                                        rewards.length === 0 && (
                                            <div className="mt-4 rounded-md bg-gray-50 p-4">
                                                <p className="text-sm text-gray-600">
                                                    No rewards are currently
                                                    available.
                                                </p>
                                            </div>
                                        )}

                                    {!isLoadingRewards &&
                                        rewards.length > 0 && (
                                            <div className="mt-4 space-y-3">
                                                {rewards.map((reward) => (
                                                    <div
                                                        key={reward.id}
                                                        className="rounded-md border border-gray-200 p-4"
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900">
                                                                    {
                                                                        reward.reward_name
                                                                    }
                                                                </h3>

                                                                <p className="mt-1 text-sm text-gray-600">
                                                                    {
                                                                        reward.points_required
                                                                    }{' '}
                                                                    points
                                                                    required
                                                                </p>

                                                                {reward.description && (
                                                                    <p className="mt-2 text-sm text-gray-500">
                                                                        {
                                                                            reward.description
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    customer.points < reward.points_required ||
                                                                    redeemingRewardId !== null
                                                                }
                                                                onClick={() => handleRedeemReward(reward.id)}
                                                                className="shrink-0 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {redeemingRewardId === reward.id ? 'Redeeming...' : 'Redeem'}
                                                            </button>
                                                        </div>

                                                        {customer.points <
                                                            reward.points_required && (
                                                            <p className="mt-2 text-sm text-red-600">
                                                                Not enough
                                                                points.
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
