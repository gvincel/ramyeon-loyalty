import QRScanner from '@/Components/QRScanner';
import CashierLayout from '@/Layouts/CashierLayout';
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
    const [validationErrors, setValidationErrors] =
        useState<ValidationErrors>({});
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
            } catch {
                setRewards([]);
            } finally {
                setIsLoadingRewards(false);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(
                    error.response?.data?.message ||
                        'Unable to find customer.',
                );
            } else {
                setError(
                    'Something went wrong while finding the customer.',
                );
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
                // Redemption already succeeded.
                // Keep the updated customer points.
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
        <CashierLayout>
            <Head title="QR Scanner" />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            QR Scanner
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Scan a customer's QR code to process purchases and
                            reward redemptions.
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className="rounded-xl bg-white shadow-sm">
                        {/* Card Header */}
                        <div className="border-b px-6 py-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Customer Lookup
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Scan the customer's QR code to view their
                                loyalty information.
                            </p>
                        </div>

                        <div className="p-6">
                            {/* Scanner */}
                            {!customer && !isLoading && (
                                <div className="mx-auto max-w-xl">
                                    <QRScanner
                                        onScan={handleScan}
                                        onError={handleError}
                                    />
                                </div>
                            )}

                            {/* Loading */}
                            {isLoading && (
                                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                                    <p className="text-sm font-medium text-blue-800">
                                        Looking up customer...
                                    </p>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-4">
                                    <p className="text-sm font-medium text-red-800">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Success */}
                            {success && (
                                <div className="mt-4 rounded-lg border border-green-100 bg-green-50 p-4">
                                    <p className="text-sm font-medium text-green-800">
                                        {success}
                                    </p>
                                </div>
                            )}

                            {customer && (
                                <div className="space-y-6">
                                    {/* Customer Information */}
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Customer
                                                </p>

                                                <h2 className="mt-1 text-xl font-bold text-gray-900">
                                                    {customer.first_name}{' '}
                                                    {customer.last_name}
                                                </h2>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {customer.customer_code}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-white px-5 py-3 shadow-sm">
                                                <p className="text-xs font-medium text-gray-500">
                                                    Current Points
                                                </p>

                                                <p className="mt-1 text-2xl font-bold text-yellow-600">
                                                    {customer.points}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 grid gap-4 border-t border-gray-200 pt-5 sm:grid-cols-2">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">
                                                    Phone Number
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-gray-900">
                                                    {customer.phone_number}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-gray-500">
                                                    Customer Code
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-gray-900">
                                                    {customer.customer_code}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transaction Section */}
                                    <div className="rounded-xl border border-gray-200">
                                        <div className="border-b px-5 py-4">
                                            <h2 className="text-lg font-bold text-gray-900">
                                                Transaction Details
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Enter the customer's purchase
                                                information to earn loyalty
                                                points.
                                            </p>
                                        </div>

                                        <div className="space-y-5 p-5">
                                            {/* Receipt Number */}
                                            <div>
                                                <label
                                                    htmlFor="receipt_number"
                                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                                >
                                                    Receipt Number{' '}
                                                    <span className="font-normal text-gray-400">
                                                        (Optional)
                                                    </span>
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
                                                    placeholder="Enter receipt number"
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
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
                                            <div>
                                                <label
                                                    htmlFor="purchase_amount"
                                                    className="mb-1.5 block text-sm font-medium text-gray-700"
                                                >
                                                    Purchase Amount
                                                </label>

                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                                        ₱
                                                    </span>

                                                    <input
                                                        id="purchase_amount"
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={purchaseAmount}
                                                        onKeyDown={(event) => {
                                                            if (
                                                                event.key ===
                                                                    '-' ||
                                                                event.key ===
                                                                    '+' ||
                                                                event.key ===
                                                                    'e' ||
                                                                event.key ===
                                                                    'E'
                                                            ) {
                                                                event.preventDefault();
                                                            }
                                                        }}
                                                        onWheel={(event) => {
                                                            event.currentTarget.blur();
                                                        }}
                                                        onChange={(event) => {
                                                            const value =
                                                                event.target
                                                                    .value;

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
                                                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-8 pr-3 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
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

                                            {/* Points Preview */}
                                            <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-5">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-yellow-800">
                                                            Points to Earn
                                                        </p>

                                                        <p className="mt-1 text-xs text-yellow-700">
                                                            Every ₱100 spent earns
                                                            1 point.
                                                        </p>
                                                    </div>

                                                    <span className="text-3xl font-bold text-yellow-700">
                                                        {pointsEarned}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Complete Transaction */}
                                            <div className="flex justify-end border-t pt-5">
                                                <button
                                                    type="button"
                                                    onClick={handleSubmit}
                                                    disabled={
                                                        isSubmitting ||
                                                        purchaseAmount === ''
                                                    }
                                                    className="w-full rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                                >
                                                    {isSubmitting
                                                        ? 'Processing Transaction...'
                                                        : 'Complete Transaction'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Available Rewards */}
                                    <div className="rounded-xl border border-gray-200">
                                        <div className="border-b px-5 py-4">
                                            <h2 className="text-lg font-bold text-gray-900">
                                                Available Rewards
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Rewards the customer can redeem
                                                using their current points.
                                            </p>
                                        </div>

                                        <div className="p-5">
                                            {isLoadingRewards && (
                                                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                                                    <p className="text-sm font-medium text-blue-800">
                                                        Loading available
                                                        rewards...
                                                    </p>
                                                </div>
                                            )}

                                            {!isLoadingRewards &&
                                                rewards.length === 0 && (
                                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 text-center">
                                                        <p className="text-sm font-medium text-gray-700">
                                                            No rewards are
                                                            currently available.
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Available rewards
                                                            will appear here
                                                            when the customer
                                                            has eligible
                                                            rewards.
                                                        </p>
                                                    </div>
                                                )}

                                            {!isLoadingRewards &&
                                                rewards.length > 0 && (
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        {rewards.map((reward) => {
                                                            const canRedeem =
                                                                customer.points >=
                                                                reward.points_required;

                                                            return (
                                                                <div
                                                                    key={
                                                                        reward.id
                                                                    }
                                                                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                                                                >
                                                                    <div className="flex h-full flex-col">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-start justify-between gap-3">
                                                                                <div>
                                                                                    <h3 className="font-bold text-gray-900">
                                                                                        {
                                                                                            reward.reward_name
                                                                                        }
                                                                                    </h3>

                                                                                    <p className="mt-1 text-sm font-medium text-yellow-600">
                                                                                        {
                                                                                            reward.points_required
                                                                                        }{' '}
                                                                                        points
                                                                                    </p>
                                                                                </div>

                                                                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600">
                                                                                    {reward.reward_type.replace(
                                                                                        '_',
                                                                                        ' ',
                                                                                    )}
                                                                                </span>
                                                                            </div>

                                                                            {reward.description && (
                                                                                <p className="mt-3 text-sm leading-6 text-gray-500">
                                                                                    {
                                                                                        reward.description
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>

                                                                        <div className="mt-5">
                                                                            <button
                                                                                type="button"
                                                                                disabled={
                                                                                    !canRedeem ||
                                                                                    redeemingRewardId !==
                                                                                        null
                                                                                }
                                                                                onClick={() =>
                                                                                    handleRedeemReward(
                                                                                        reward.id,
                                                                                    )
                                                                                }
                                                                                className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                                            >
                                                                                {redeemingRewardId ===
                                                                                reward.id
                                                                                    ? 'Redeeming...'
                                                                                    : 'Redeem Reward'}
                                                                            </button>

                                                                            {!canRedeem && (
                                                                                <p className="mt-2 text-center text-xs font-medium text-red-600">
                                                                                    Not
                                                                                    enough
                                                                                    points
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CashierLayout>
    );
}