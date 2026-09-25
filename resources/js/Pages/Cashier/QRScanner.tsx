import QRScanner from '@/Components/QRScanner';
import CashierLayout from '@/Layouts/CashierLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import FlashMessage from '@/Components/FlashMessage';
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

    const resetCustomerState = () => {
        setCustomer(null);
        setError(null);
        setSuccess(null);
        setValidationErrors({});
        setReceiptNumber('');
        setPurchaseAmount('');
        setRewards([]);
    };

    const handleScan = useCallback(async (decodedText: string) => {
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
                route('cashier.transactions.find-customer'),
                { qr_token: decodedText },
            );

            const customerData = response.data.customer;

            setCustomer(customerData);

            setIsLoadingRewards(true);

            try {
                const rewardsResponse = await axios.post(
                    route('cashier.rewards.available'),
                    { customer_id: customerData.id },
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
        if (!customer) return;

        setError(null);
        setSuccess(null);
        setValidationErrors({});
        setIsSubmitting(true);

        try {
            const response = await axios.post(
                route('cashier.transactions.store'),
                {
                    customer_id: customer.id,
                    receipt_number:
                        receiptNumber.trim() !== ''
                            ? receiptNumber.trim()
                            : null,
                    purchase_amount: purchaseAmount,
                },
            );

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
        if (!customer) return;

        setError(null);
        setSuccess(null);
        setRedeemingRewardId(rewardId);

        try {
            const response = await axios.post(
                route('cashier.reward-redemptions.store'),
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
                    route('cashier.rewards.available'),
                    { customer_id: customer.id },
                );

                setRewards(rewardsResponse.data.rewards);
            } catch {
                // Redemption already succeeded. Keep updated points.
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

    const initials = customer
        ? `${customer.first_name.charAt(0)}${customer.last_name.charAt(0)}`.toUpperCase()
        : '';

    return (
        <CashierLayout>
            <Head title="QR Scanner" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <AdminPageHeader
                        eyebrow="QR Access"
                        title="QR Scanner"
                        description="Scan a customer's QR code to process purchases and reward redemptions."
                        action={
                            customer && (
                                <button
                                    type="button"
                                    onClick={resetCustomerState}
                                    disabled={isSubmitting}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                        <path d="M23 4v6h-6" />
                                        <path d="M1 20v-6h6" />
                                        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10" />
                                        <path d="M1 14l4.64 4.36A9 9 0 0020.49 15" />
                                    </svg>
                                    Scan Another
                                </button>
                            )
                        }
                    />

                    <FlashMessage success={success} error={error} />

                    {/* Scanner state — no customer yet */}
                    {!customer && !isLoading && (
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-5">
                                <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                    Customer Lookup
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Point the camera at the customer&apos;s
                                    QR code to begin.
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="mx-auto max-w-xl">
                                    <QRScanner
                                        onScan={handleScan}
                                        onError={handleError}
                                    />
                                </div>

                                <p className="mt-5 text-center text-xs text-gray-500">
                                    Camera access is required. If you
                                    don&apos;t see a preview, check your
                                    browser&apos;s camera permission settings.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Loading state */}
                    {isLoading && (
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="flex flex-col items-center justify-center px-6 py-16">
                                <svg
                                    className="h-8 w-8 animate-spin text-red-600 motion-reduce:animate-none"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="9"
                                        stroke="currentColor"
                                        strokeOpacity="0.25"
                                        strokeWidth="3"
                                    />
                                    <path
                                        d="M21 12a9 9 0 00-9-9"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                </svg>

                                <p className="mt-4 text-sm font-medium text-gray-700">
                                    Looking up customer…
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Customer found state */}
                    {customer && (
                        <>
                            {/* Customer summary card */}
                            <div className="relative overflow-hidden rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
                                <div className="absolute left-0 top-0 h-full w-1 bg-red-600" />

                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                                            {initials}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                Customer
                                            </p>

                                            <h2 className="mt-1 truncate text-xl font-bold tracking-tight text-gray-900">
                                                {customer.first_name}{' '}
                                                {customer.last_name}
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {customer.phone_number}
                                                {' · '}
                                                {customer.customer_code}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="shrink-0 rounded-xl bg-gray-50 px-5 py-3 ring-1 ring-gray-200">
                                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                            Current Points
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-yellow-600">
                                            {customer.points}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Two-column: transaction (primary) + rewards (secondary) */}
                            <div className="mt-6 grid gap-6 lg:grid-cols-5">
                                {/* Transaction Details — primary */}
                                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-3">
                                    <div className="border-b border-gray-100 px-6 py-5">
                                        <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                            Transaction Details
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Enter the purchase information to
                                            earn loyalty points.
                                        </p>
                                    </div>

                                    <div className="space-y-5 p-6">
                                        {/* Receipt Number */}
                                        <div>
                                            <label
                                                htmlFor="receipt_number"
                                                className="mb-1.5 block text-sm font-medium text-gray-800"
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

                                                    if (
                                                        validationErrors.receipt_number
                                                    ) {
                                                        setValidationErrors(
                                                            (current) => ({
                                                                ...current,
                                                                receipt_number:
                                                                    undefined,
                                                            }),
                                                        );
                                                    }
                                                }}
                                                maxLength={50}
                                                autoComplete="off"
                                                aria-invalid={
                                                    !!validationErrors.receipt_number
                                                }
                                                aria-describedby={
                                                    validationErrors.receipt_number
                                                        ? 'receipt-error'
                                                        : undefined
                                                }
                                                placeholder="Enter receipt number"
                                                className={`block h-11 w-full rounded-xl border px-4 text-[15px] text-gray-950 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-gray-400 ${
                                                    validationErrors.receipt_number
                                                        ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'
                                                        : 'border-black/[0.07] bg-[#f8f8f9] hover:border-black/[0.13] focus:border-red-900 focus:bg-white focus:ring-2 focus:ring-red-900/10'
                                                }`}
                                            />

                                            {validationErrors.receipt_number && (
                                                <p
                                                    id="receipt-error"
                                                    role="alert"
                                                    className="mt-1.5 text-sm text-red-600"
                                                >
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
                                                className="mb-1.5 block text-sm font-medium text-gray-800"
                                            >
                                                Purchase Amount
                                            </label>

                                            <div className="relative">
                                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-gray-500">
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

                                                            if (
                                                                validationErrors.purchase_amount
                                                            ) {
                                                                setValidationErrors(
                                                                    (
                                                                        current,
                                                                    ) => ({
                                                                        ...current,
                                                                        purchase_amount:
                                                                            undefined,
                                                                    }),
                                                                );
                                                            }
                                                        }
                                                    }}
                                                    autoComplete="off"
                                                    aria-invalid={
                                                        !!validationErrors.purchase_amount
                                                    }
                                                    aria-describedby={
                                                        validationErrors.purchase_amount
                                                            ? 'amount-error'
                                                            : undefined
                                                    }
                                                    placeholder="0.00"
                                                    className={`block h-11 w-full rounded-xl border pl-9 pr-4 text-[15px] text-gray-950 outline-none transition-[border-color,box-shadow,background-color] placeholder:text-gray-400 ${
                                                        validationErrors.purchase_amount
                                                            ? 'border-red-500 bg-red-50/40 focus:border-red-600 focus:ring-2 focus:ring-red-600/15'
                                                            : 'border-black/[0.07] bg-[#f8f8f9] hover:border-black/[0.13] focus:border-red-900 focus:bg-white focus:ring-2 focus:ring-red-900/10'
                                                    }`}
                                                />
                                            </div>

                                            {validationErrors.purchase_amount && (
                                                <p
                                                    id="amount-error"
                                                    role="alert"
                                                    className="mt-1.5 text-sm text-red-600"
                                                >
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
                                                        Every ₱100 spent earns 1
                                                        point.
                                                    </p>
                                                </div>

                                                <span className="text-3xl font-bold text-yellow-700">
                                                    {pointsEarned}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <div className="border-t border-gray-100 pt-5">
                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                disabled={
                                                    isSubmitting ||
                                                    purchaseAmount === ''
                                                }
                                                aria-busy={isSubmitting}
                                                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-sm transition-[background-color,box-shadow,transform] hover:bg-red-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm sm:w-auto"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <svg
                                                            className="h-4 w-4 animate-spin motion-reduce:animate-none"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            aria-hidden="true"
                                                        >
                                                            <circle
                                                                cx="12"
                                                                cy="12"
                                                                r="9"
                                                                stroke="currentColor"
                                                                strokeOpacity="0.25"
                                                                strokeWidth="3"
                                                            />
                                                            <path
                                                                d="M21 12a9 9 0 00-9-9"
                                                                stroke="currentColor"
                                                                strokeWidth="3"
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                        Processing…
                                                    </>
                                                ) : (
                                                    'Complete Transaction'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Available Rewards — secondary */}
                                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
                                    <div className="border-b border-gray-100 px-6 py-5">
                                        <h2 className="text-lg font-bold tracking-tight text-gray-900">
                                            Available Rewards
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Rewards this customer can redeem.
                                        </p>
                                    </div>

                                    <div className="p-6">
                                        {isLoadingRewards && (
                                            <div className="flex flex-col items-center justify-center py-10">
                                                <svg
                                                    className="h-6 w-6 animate-spin text-red-600 motion-reduce:animate-none"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    aria-hidden="true"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="9"
                                                        stroke="currentColor"
                                                        strokeOpacity="0.25"
                                                        strokeWidth="3"
                                                    />
                                                    <path
                                                        d="M21 12a9 9 0 00-9-9"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>

                                                <p className="mt-3 text-sm text-gray-500">
                                                    Loading rewards…
                                                </p>
                                            </div>
                                        )}

                                        {!isLoadingRewards &&
                                            rewards.length === 0 && (
                                                <div className="py-10 text-center">
                                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                                        <svg
                                                            className="h-6 w-6"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.7"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7M2 7h20v5H2zM12 7v14M12 7H8.5a2.5 2.5 0 115-1c0 1.5-1.5 1-1.5 1z"
                                                            />
                                                        </svg>
                                                    </div>

                                                    <p className="mt-3 text-sm font-semibold text-gray-700">
                                                        No rewards available
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Eligible rewards will
                                                        appear here.
                                                    </p>
                                                </div>
                                            )}

                                        {!isLoadingRewards &&
                                            rewards.length > 0 && (
                                                <div className="space-y-4">
                                                    {rewards.map((reward) => {
                                                        const canRedeem =
                                                            customer.points >=
                                                            reward.points_required;

                                                        return (
                                                            <div
                                                                key={reward.id}
                                                                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <h3 className="truncate font-bold text-gray-900">
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

                                                                    <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600">
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

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        !canRedeem ||
                                                                        redeemingRewardId !==
                                                                            null
                                                                    }
                                                                    aria-busy={
                                                                        redeemingRewardId ===
                                                                        reward.id
                                                                    }
                                                                    onClick={() =>
                                                                        handleRedeemReward(
                                                                            reward.id,
                                                                        )
                                                                    }
                                                                    className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    {redeemingRewardId ===
                                                                    reward.id
                                                                        ? 'Redeeming…'
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
                                                        );
                                                    })}
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </CashierLayout>
    );
}