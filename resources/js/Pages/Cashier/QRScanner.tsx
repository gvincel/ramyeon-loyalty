import QRScanner from '@/Components/QRScanner';
import CashierLayout from '@/Layouts/CashierLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import AdminModal from '@/Components/AdminModal';
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
    points_used?: string[];
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
    redemption_limit: number | null;
    times_redeemed: number;
    is_maxed: boolean;
}

/* Shared input styles */
const inputBase =
    'block h-11 w-full rounded-xl border bg-white px-4 text-[15px] text-[#111827] outline-none transition placeholder:text-[#64748B]';
const inputOk =
    'border-[#E5E7EB] hover:border-[#64748B]/50 focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/15';
const inputBad =
    'border-[#DC2626] bg-[#FEF2F2] focus:border-[#B91C1C] focus:ring-2 focus:ring-[#DC2626]/20';

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
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [redeemingRewardId, setRedeemingRewardId] = useState<number | null>(
        null,
    );

    const [receiptNumber, setReceiptNumber] = useState('');
    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [usePoints, setUsePoints] = useState(false);
    const [pointsUsed, setPointsUsed] = useState('');

    // This field accepts customer code OR customer name.
    const [customerCode, setCustomerCode] = useState('');

    const resetCustomerState = () => {
        setCustomer(null);
        setError(null);
        setSuccess(null);
        setValidationErrors({});
        setReceiptNumber('');
        setPurchaseAmount('');
        setUsePoints(false);
        setPointsUsed('');
        setRewards([]);
        setCustomerCode('');
    };

    /**
     * Load available rewards for a customer.
     */
    const loadCustomerRewards = async (customerId: number) => {
        setIsLoadingRewards(true);

        try {
            const rewardsResponse = await axios.post(
                route('cashier.rewards.available'),
                {
                    customer_id: customerId,
                },
            );

            setRewards(rewardsResponse.data.rewards);
        } catch {
            setRewards([]);
        } finally {
            setIsLoadingRewards(false);
        }
    };

    /**
     * QR scanner lookup.
     */
    const handleScan = useCallback(async (decodedText: string) => {
        setCustomer(null);
        setError(null);
        setSuccess(null);
        setValidationErrors({});
        setReceiptNumber('');
        setPurchaseAmount('');
        setUsePoints(false);
        setPointsUsed('');
        setRewards([]);
        setIsLoading(true);

        try {
            const response = await axios.post(
                route('cashier.transactions.find-customer'),
                {
                    qr_token: decodedText,
                },
            );

            const customerData = response.data.customer;

            setCustomer(customerData);

            setIsLoadingRewards(true);

            try {
                const rewardsResponse = await axios.post(
                    route('cashier.rewards.available'),
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

    /**
     * Manual customer lookup.
     *
     * Sends the entered value as both customer_code and search.
     * The backend decides whether it matches the customer code,
     * first name, last name, full name, or phone number.
     */
    const handleCustomerCodeLookup = useCallback(async () => {
        const searchValue = customerCode.trim();

        if (!searchValue) {
            setError('Please enter a customer code or customer name.');
            return;
        }

        setCustomer(null);
        setError(null);
        setSuccess(null);
        setValidationErrors({});
        setReceiptNumber('');
        setPurchaseAmount('');
        setUsePoints(false);
        setPointsUsed('');
        setRewards([]);
        setIsLoading(true);

        try {
            const response = await axios.post(
                route('cashier.transactions.find-customer-by-code'),
                {
                    customer_code: searchValue,
                    search: searchValue,
                },
            );

            const customerData = response.data.customer;

            setCustomer(customerData);

            setIsLoadingRewards(true);

            try {
                const rewardsResponse = await axios.post(
                    route('cashier.rewards.available'),
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

            setCustomerCode('');
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
    }, [customerCode]);

    const handleError = useCallback((errorMessage: string) => {
        setError(errorMessage);
    }, []);

    /**
     * Complete transaction.
     */
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
                    points_used: usePoints ? pointsUsedValue : 0,
                },
            );

            setSuccess(response.data.message);

            setCustomer({
                ...customer,
                points: response.data.new_points,
            });

            setReceiptNumber('');
            setPurchaseAmount('');
            setUsePoints(false);
            setPointsUsed('');
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

    /**
     * Redeem reward.
     */
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
            setSelectedReward(null);

            try {
                const rewardsResponse = await axios.post(
                    route('cashier.rewards.available'),
                    {
                        customer_id: customer.id,
                    },
                );

                setRewards(rewardsResponse.data.rewards);
            } catch {
                // Redemption succeeded.
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

    const pointsUsedValue =
        usePoints && /^\d+$/.test(pointsUsed) ? Number(pointsUsed) : 0;

    const maxPointsUsable = customer
        ? Math.min(customer.points, Math.floor(purchaseValue))
        : 0;

    const pointsInputInvalid =
        usePoints &&
        pointsUsed !== '' &&
        (!/^\d+$/.test(pointsUsed) ||
            Number(pointsUsed) > maxPointsUsable);

    const amountPaid = Math.max(
        purchaseValue - pointsUsedValue,
        0,
    );

    const pointsEarned =
        purchaseAmount !== '' && amountPaid > 0
            ? Math.floor(amountPaid / 100)
            : 0;

    const initials = customer
        ? `${customer.first_name.charAt(0)}${customer.last_name.charAt(0)}`.toUpperCase()
        : '';

    return (
        <CashierLayout>
            <Head title="QR Scanner" />

            <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">

                    <AdminPageHeader
                        eyebrow="QR Access"
                        title="QR Scanner"
                        description="Scan a customer's QR code or search by customer code or name to process purchases and reward redemptions."
                        action={
                            customer && (
                                <button
                                    type="button"
                                    onClick={resetCustomerState}
                                    disabled={isSubmitting}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#B91C1C] shadow-sm transition hover:bg-[#FEF2F2] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <span
                                        className="material-symbols-outlined text-[20px]"
                                        aria-hidden="true"
                                    >
                                        qr_code_scanner
                                    </span>
                                    Scan Another
                                </button>
                            )
                        }
                    />

                    <FlashMessage
                        success={success}
                        error={error}
                    />

                    {/* ───────── CUSTOMER LOOKUP ───────── */}
                    {!customer && !isLoading && (
                        <div className="grid items-stretch gap-6 lg:grid-cols-2">

                            {/* Scan card */}
                            <section className="flex flex-col overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-sm">
                                <div className="flex items-center gap-3 bg-[#B91C1C] px-6 py-5">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#DC2626]">
                                        <span
                                            className="material-symbols-outlined text-[24px]"
                                            aria-hidden="true"
                                        >
                                            qr_code_scanner
                                        </span>
                                    </div>

                                    <div>
                                        <h2 className="text-base font-bold text-white">
                                            Scan QR code
                                        </h2>
                                        <p className="mt-0.5 text-xs text-[#FECACA]">
                                            Point the camera at the customer's
                                            loyalty QR.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col p-6">
                                    <div className="mx-auto w-full max-w-md overflow-hidden rounded-[20px] border border-[#DC2626] bg-[#F8FAFC] p-2">
                                        <QRScanner
                                            onScan={handleScan}
                                            onError={handleError}
                                        />
                                    </div>

                                    <p className="mt-5 flex items-start justify-center gap-2 text-center text-xs leading-5 text-[#64748B]">
                                        <span
                                            className="material-symbols-outlined text-[16px] text-[#DC2626]"
                                            aria-hidden="true"
                                        >
                                            videocam
                                        </span>
                                        <span>
                                            Camera access is required. If you
                                            don&apos;t see a preview, check your
                                            browser&apos;s camera permission.
                                        </span>
                                    </p>
                                </div>
                            </section>

                            {/* Manual search card */}
<section className="flex flex-col overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-sm">
    <div className="flex items-center gap-3 bg-[#B91C1C] px-6 py-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#DC2626]">
            <span
                className="material-symbols-outlined text-[24px]"
                aria-hidden="true"
            >
                person_search
            </span>
        </div>

        <div>
            <h2 className="text-base font-bold text-white">
                Find a customer
            </h2>
            <p className="mt-0.5 text-xs text-[#FECACA]">
                No QR? Search by customer code or name.
            </p>
        </div>
    </div>

    {/* Search form */}
    <div className="p-6">
        <label
            htmlFor="customer_code"
            className="mb-2 block text-sm font-semibold text-[#111827]"
        >
            Customer code or name
        </label>

        <div className="relative">
            <span
                className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-[#64748B]"
                aria-hidden="true"
            >
                search
            </span>

            <input
                id="customer_code"
                type="text"
                value={customerCode}
                onChange={(event) => {
                    setCustomerCode(event.target.value);
                    setError(null);
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        void handleCustomerCodeLookup();
                    }
                }}
                maxLength={100}
                autoComplete="off"
                placeholder="Enter customer code or name"
                aria-describedby="customer-code-help"
                className={`${inputBase} ${inputOk} h-12 pl-11 ${
                    customerCode ? 'pr-11' : ''
                }`}
            />

            {customerCode && (
                <button
                    type="button"
                    onClick={() => setCustomerCode('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#111827] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
                >
                    <span
                        className="material-symbols-outlined text-[18px]"
                        aria-hidden="true"
                    >
                        close
                    </span>
                </button>
            )}
        </div>

        <p
            id="customer-code-help"
            className="mt-2 text-xs text-[#64748B]"
        >
            Press Enter or use the button to search.
        </p>

        <button
            type="button"
            onClick={() => void handleCustomerCodeLookup()}
            disabled={isLoading || customerCode.trim() === ''}
            className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#B91C1C] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
            <span
                className="material-symbols-outlined text-[20px]"
                aria-hidden="true"
            >
                person_search
            </span>
            Find Customer
        </button>
    </div>

    {/* Search guide: fills the remaining height */}
    <div className="flex flex-1 flex-col border-t border-[#E5E7EB] bg-[#F8FAFC] p-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#111827]">
            You can search by
        </p>

        <ul className="mt-4 flex flex-1 flex-col justify-between gap-3">
            {[
                {
                    icon: 'badge',
                    title: 'Customer code',
                    text: 'The unique code on their loyalty profile.',
                },
                {
                    icon: 'person',
                    title: 'Name',
                    text: 'First name, last name, or full name.',
                },
            ].map((item) => (
                <li
                    key={item.title}
                    className="flex flex-1 items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3"
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FEF2F2] text-[#DC2626]">
                        <span
                            className="material-symbols-outlined text-[20px]"
                            aria-hidden="true"
                        >
                            {item.icon}
                        </span>
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#111827]">
                            {item.title}
                        </p>
                        <p className="text-xs text-[#64748B]">
                            {item.text}
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    </div>
</section>
                        </div>
                    )}

                    {/* ───────── LOADING ───────── */}
                    {isLoading && (
                        <section className="overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-sm">
                            <div className="flex flex-col items-center justify-center px-6 py-20">
                                <svg
                                    className="h-9 w-9 animate-spin text-[#DC2626] motion-reduce:animate-none"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="9"
                                        stroke="currentColor"
                                        strokeOpacity="0.2"
                                        strokeWidth="3"
                                    />
                                    <path
                                        d="M21 12a9 9 0 00-9-9"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                </svg>

                                <p className="mt-4 text-sm font-semibold text-[#111827]">
                                    Looking up customer…
                                </p>
                                <p className="mt-1 text-xs text-[#64748B]">
                                    This only takes a moment.
                                </p>
                            </div>
                        </section>
                    )}

                    {/* ───────── CUSTOMER FOUND ───────── */}
                    {customer && (
                        <div className="space-y-6">

                            {/* Customer summary */}
                            <section className="overflow-hidden rounded-[20px] border border-[#E5E7EB] border-t-2 border-t-[#DC2626] bg-white shadow-sm">
                                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                                    <div className="flex min-w-0 items-center gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2] text-lg font-bold text-[#DC2626]">
                                            {initials}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                                                Customer found
                                            </p>

                                            <h2 className="mt-0.5 truncate text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
                                                {customer.first_name}{' '}
                                                {customer.last_name}
                                            </h2>

                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-[#111827] ring-1 ring-[#E5E7EB]">
                                                    <span
                                                        className="material-symbols-outlined text-[14px]"
                                                        aria-hidden="true"
                                                    >
                                                        call
                                                    </span>
                                                    {customer.phone_number}
                                                </span>

                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FEF2F2] px-2.5 py-1 text-xs font-semibold text-[#B91C1C]">
                                                    <span
                                                        className="material-symbols-outlined text-[14px]"
                                                        aria-hidden="true"
                                                    >
                                                        badge
                                                    </span>
                                                    {customer.customer_code}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 rounded-xl bg-[#FEF3C7] px-6 py-4 text-[#92400E] sm:text-right">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider">
                                            Current points
                                        </p>
                                        <p className="mt-1 text-3xl font-bold leading-none">
                                            {customer.points}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Transaction + rewards */}
                            <div className="grid items-start gap-6 lg:grid-cols-5">

                                {/* TRANSACTION */}
                                <section className="overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-sm lg:col-span-3">
                                    <div className="flex items-center gap-3 bg-[#B91C1C] px-6 py-5">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#DC2626]">
                                            <span
                                                className="material-symbols-outlined text-[24px]"
                                                aria-hidden="true"
                                            >
                                                receipt_long
                                            </span>
                                        </div>

                                        <div>
                                            <h2 className="text-base font-bold text-white">
                                                Transaction details
                                            </h2>
                                            <p className="mt-0.5 text-xs text-[#FECACA]">
                                                Enter the purchase to earn
                                                loyalty points.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-5 p-6">

                                        {/* Receipt + amount */}
                                        <div className="grid gap-5 sm:grid-cols-2">

                                            <div>
                                                <label
                                                    htmlFor="receipt_number"
                                                    className="mb-1.5 block text-sm font-semibold text-[#111827]"
                                                >
                                                    Receipt number{' '}
                                                    <span className="font-normal text-[#64748B]">
                                                        (optional)
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
                                                    maxLength={100}
                                                    autoComplete="off"
                                                    placeholder="Enter receipt number"
                                                    className={`${inputBase} ${
                                                        validationErrors.receipt_number
                                                            ? inputBad
                                                            : inputOk
                                                    }`}
                                                />

                                                {validationErrors.receipt_number && (
                                                    <p className="mt-1.5 text-sm text-[#B91C1C]">
                                                        {
                                                            validationErrors
                                                                .receipt_number[0]
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="purchase_amount"
                                                    className="mb-1.5 block text-sm font-semibold text-[#111827]"
                                                >
                                                    Purchase amount
                                                </label>

                                                <div className="relative">
                                                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-[#64748B]">
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

                                                                if (
                                                                    usePoints &&
                                                                    /^\d+$/.test(
                                                                        pointsUsed,
                                                                    )
                                                                ) {
                                                                    const newPurchaseValue =
                                                                        Number(value);

                                                                    const newMaxPoints =
                                                                        customer
                                                                            ? Math.min(
                                                                                  customer.points,
                                                                                  Math.floor(
                                                                                      newPurchaseValue,
                                                                                  ),
                                                                              )
                                                                            : 0;

                                                                    if (
                                                                        Number(
                                                                            pointsUsed,
                                                                        ) >
                                                                        newMaxPoints
                                                                    ) {
                                                                        setPointsUsed(
                                                                            String(
                                                                                newMaxPoints,
                                                                            ),
                                                                        );
                                                                    }
                                                                }

                                                                if (
                                                                    validationErrors.purchase_amount ||
                                                                    validationErrors.points_used
                                                                ) {
                                                                    setValidationErrors(
                                                                        (current) => ({
                                                                            ...current,
                                                                            purchase_amount:
                                                                                undefined,
                                                                            points_used:
                                                                                undefined,
                                                                        }),
                                                                    );
                                                                }
                                                            }
                                                        }}
                                                        autoComplete="off"
                                                        placeholder="0.00"
                                                        className={`${inputBase} pl-9 ${
                                                            validationErrors.purchase_amount
                                                                ? inputBad
                                                                : inputOk
                                                        }`}
                                                    />
                                                </div>

                                                {validationErrors.purchase_amount && (
                                                    <p className="mt-1.5 text-sm text-[#B91C1C]">
                                                        {
                                                            validationErrors
                                                                .purchase_amount[0]
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Use points */}
                                        <div
                                            className={`rounded-xl border p-4 transition-colors sm:p-5 ${
                                                usePoints
                                                    ? 'border-[#DC2626] bg-[#FEF2F2]'
                                                    : 'border-[#E5E7EB] bg-[#F8FAFC]'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    id="use_points"
                                                    type="checkbox"
                                                    checked={usePoints}
                                                    onChange={(event) => {
                                                        setUsePoints(
                                                            event.target.checked,
                                                        );

                                                        if (
                                                            !event.target.checked
                                                        ) {
                                                            setPointsUsed('');
                                                            setValidationErrors(
                                                                (current) => ({
                                                                    ...current,
                                                                    points_used:
                                                                        undefined,
                                                                }),
                                                            );
                                                        }
                                                    }}
                                                    disabled={
                                                        customer.points <= 0
                                                    }
                                                    className="mt-0.5 h-4 w-4 rounded border-[#64748B]/50 text-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/30 disabled:cursor-not-allowed disabled:opacity-50"
                                                />

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <label
                                                            htmlFor="use_points"
                                                            className="cursor-pointer text-sm font-semibold text-[#111827]"
                                                        >
                                                            Use points
                                                        </label>

                                                        <span className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-semibold text-[#92400E]">
                                                            {customer.points}{' '}
                                                            available
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 text-xs leading-5 text-[#64748B]">
                                                        Apply the customer&apos;s
                                                        points to reduce the
                                                        amount they need to pay.
                                                    </p>
                                                </div>
                                            </div>

                                            {usePoints && (
                                                <div className="mt-4 border-t border-[#FECACA] pt-4">
                                                    <label
                                                        htmlFor="points_used"
                                                        className="mb-1.5 block text-sm font-semibold text-[#111827]"
                                                    >
                                                        Points to use
                                                    </label>

                                                    <input
                                                        id="points_used"
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={pointsUsed}
                                                        onChange={(event) => {
                                                            const value =
                                                                event.target
                                                                    .value;

                                                            if (
                                                                /^\d*$/.test(
                                                                    value,
                                                                )
                                                            ) {
                                                                setPointsUsed(
                                                                    value,
                                                                );

                                                                if (
                                                                    validationErrors.points_used
                                                                ) {
                                                                    setValidationErrors(
                                                                        (
                                                                            current,
                                                                        ) => ({
                                                                            ...current,
                                                                            points_used:
                                                                                undefined,
                                                                        }),
                                                                    );
                                                                }
                                                            }
                                                        }}
                                                        maxLength={9}
                                                        autoComplete="off"
                                                        placeholder="0"
                                                        className={`${inputBase} ${
                                                            validationErrors.points_used ||
                                                            pointsInputInvalid
                                                                ? inputBad
                                                                : inputOk
                                                        }`}
                                                    />

                                                    <p
                                                        className={`mt-1.5 text-xs ${
                                                            pointsInputInvalid
                                                                ? 'font-medium text-[#B91C1C]'
                                                                : 'text-[#64748B]'
                                                        }`}
                                                    >
                                                        Maximum usable:{' '}
                                                        {maxPointsUsable} points
                                                    </p>

                                                    {validationErrors.points_used && (
                                                        <p className="mt-1.5 text-sm text-[#B91C1C]">
                                                            {
                                                                validationErrors
                                                                    .points_used[0]
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Summary */}
                                        <div className="overflow-hidden rounded-xl border border-[#E5E7EB]">
                                            <div className="space-y-3 bg-[#F8FAFC] p-5">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-sm text-[#64748B]">
                                                        Purchase amount
                                                    </span>

                                                    <span className="text-sm font-semibold text-[#111827]">
                                                        ₱
                                                        {purchaseValue.toFixed(
                                                            2,
                                                        )}
                                                    </span>
                                                </div>

                                                {usePoints &&
                                                    pointsUsedValue > 0 && (
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span className="text-sm text-[#64748B]">
                                                                Points used
                                                            </span>

                                                            <span className="text-sm font-semibold text-[#DC2626]">
                                                                −₱
                                                                {pointsUsedValue.toFixed(
                                                                    2,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}

                                                <div className="flex items-center justify-between gap-4 border-t border-dashed border-[#64748B]/30 pt-3">
                                                    <span className="text-sm font-bold text-[#111827]">
                                                        Amount paid
                                                    </span>

                                                    <span className="text-2xl font-bold tracking-tight text-[#111827]">
                                                        ₱
                                                        {amountPaid.toFixed(
                                                            2,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 bg-[#FEF3C7] px-5 py-3.5 text-[#92400E]">
                                                <div className="flex items-center gap-2.5">
                                                    <span
                                                        className="material-symbols-outlined text-[22px]"
                                                        aria-hidden="true"
                                                    >
                                                        stars
                                                    </span>

                                                    <div>
                                                        <p className="text-sm font-semibold">
                                                            Points to earn
                                                        </p>
                                                        <p className="text-xs">
                                                            Every ₱100 actually
                                                            paid earns 1 point.
                                                        </p>
                                                    </div>
                                                </div>

                                                <span className="text-3xl font-bold leading-none">
                                                    {pointsEarned}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={
                                                isSubmitting ||
                                                purchaseAmount === '' ||
                                                (usePoints &&
                                                    (pointsUsed === '' ||
                                                        pointsInputInvalid))
                                            }
                                            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#B91C1C] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <span
                                                className="material-symbols-outlined text-[20px]"
                                                aria-hidden="true"
                                            >
                                                check_circle
                                            </span>
                                            {isSubmitting
                                                ? 'Processing…'
                                                : 'Complete Transaction'}
                                        </button>
                                    </div>
                                </section>

                                {/* REWARDS */}
                                <section className="overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-sm lg:col-span-2">
                                    <div className="flex items-center gap-3 bg-[#B91C1C] px-6 py-5">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#DC2626]">
                                            <span
                                                className="material-symbols-outlined text-[24px]"
                                                aria-hidden="true"
                                            >
                                                redeem
                                            </span>
                                        </div>

                                        <div>
                                            <h2 className="text-base font-bold text-white">
                                                Available rewards
                                            </h2>
                                            <p className="mt-0.5 text-xs text-[#FECACA]">
                                                Rewards this customer can
                                                redeem.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-5 sm:p-6">

                                        {isLoadingRewards && (
                                            <div className="flex flex-col items-center justify-center py-10">
                                                <svg
                                                    className="h-7 w-7 animate-spin text-[#DC2626] motion-reduce:animate-none"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    aria-hidden="true"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="9"
                                                        stroke="currentColor"
                                                        strokeOpacity="0.2"
                                                        strokeWidth="3"
                                                    />
                                                    <path
                                                        d="M21 12a9 9 0 00-9-9"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>

                                                <p className="mt-3 text-sm text-[#64748B]">
                                                    Loading rewards…
                                                </p>
                                            </div>
                                        )}

                                        {!isLoadingRewards &&
                                            rewards.length === 0 && (
                                                <div className="py-10 text-center">
                                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF2F2] text-[#DC2626]">
                                                        <span
                                                            className="material-symbols-outlined text-[24px]"
                                                            aria-hidden="true"
                                                        >
                                                            redeem
                                                        </span>
                                                    </div>

                                                    <p className="mt-3 text-sm font-semibold text-[#111827]">
                                                        No rewards available
                                                    </p>

                                                    <p className="mt-1 text-xs text-[#64748B]">
                                                        Eligible rewards will
                                                        appear here.
                                                    </p>
                                                </div>
                                            )}

                                        {!isLoadingRewards &&
                                            rewards.length > 0 && (
                                                <div className="space-y-4">
                                                    {rewards.map((reward) => {
                                                        const canAfford =
                                                            customer.points >=
                                                            reward.points_required;

                                                        const isMaxed =
                                                            reward.is_maxed;

                                                        const canRedeem =
                                                            canAfford &&
                                                            !isMaxed;

                                                        const progress = Math.min(
                                                            100,
                                                            Math.round(
                                                                (customer.points /
                                                                    Math.max(
                                                                        reward.points_required,
                                                                        1,
                                                                    )) *
                                                                    100,
                                                            ),
                                                        );

                                                        return (
                                                            <article
                                                                key={reward.id}
                                                                className={`rounded-xl border p-4 transition ${
                                                                    canRedeem
                                                                        ? 'border-[#E5E7EB] bg-white hover:border-[#DC2626] hover:shadow-sm'
                                                                        : 'border-[#E5E7EB] bg-[#F8FAFC]'
                                                                } ${
                                                                    isMaxed
                                                                        ? 'opacity-75'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <h3 className="truncate text-sm font-bold text-[#111827]">
                                                                            {
                                                                                reward.reward_name
                                                                            }
                                                                        </h3>

                                                                        <p className="mt-1 text-xs font-semibold text-[#B91C1C]">
                                                                            {
                                                                                reward.points_required
                                                                            }{' '}
                                                                            points
                                                                        </p>
                                                                    </div>

                                                                    <span className="shrink-0 rounded-full bg-[#FEF2F2] px-2.5 py-1 text-[11px] font-semibold capitalize text-[#B91C1C]">
                                                                        {reward.reward_type.replace(
                                                                            '_',
                                                                            ' ',
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                {reward.description && (
                                                                    <p className="mt-2.5 text-xs leading-5 text-[#64748B]">
                                                                        {
                                                                            reward.description
                                                                        }
                                                                    </p>
                                                                )}

                                                                {/* Progress toward reward */}
                                                                {!isMaxed && (
                                                                    <div className="mt-3">
                                                                        <div
                                                                            className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]"
                                                                            role="progressbar"
                                                                            aria-valuenow={
                                                                                progress
                                                                            }
                                                                            aria-valuemin={
                                                                                0
                                                                            }
                                                                            aria-valuemax={
                                                                                100
                                                                            }
                                                                            aria-label="Points progress toward this reward"
                                                                        >
                                                                            <div
                                                                                className="h-full rounded-full bg-[#DC2626] transition-all duration-500 motion-reduce:transition-none"
                                                                                style={{
                                                                                    width: `${progress}%`,
                                                                                }}
                                                                            />
                                                                        </div>

                                                                        <p className="mt-1.5 text-[11px] text-[#64748B]">
                                                                            {canAfford
                                                                                ? 'Ready to redeem'
                                                                                : `${
                                                                                      reward.points_required -
                                                                                      customer.points
                                                                                  } more points needed`}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {isMaxed && (
                                                                    <div className="mt-3 rounded-lg bg-white px-3 py-2 ring-1 ring-[#E5E7EB]">
                                                                        <p className="text-xs font-medium text-[#64748B]">
                                                                            Already
                                                                            claimed{' '}
                                                                            <span className="font-semibold text-[#111827]">
                                                                                {
                                                                                    reward.times_redeemed
                                                                                }
                                                                                {reward.redemption_limit
                                                                                    ? `/${reward.redemption_limit}`
                                                                                    : ''}
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        !canRedeem ||
                                                                        redeemingRewardId !==
                                                                            null
                                                                    }
                                                                    onClick={() =>
                                                                        setSelectedReward(
                                                                            reward,
                                                                        )
                                                                    }
                                                                    className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#DC2626] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#64748B] disabled:shadow-none"
                                                                >
                                                                    {redeemingRewardId ===
                                                                    reward.id
                                                                        ? 'Redeeming…'
                                                                        : isMaxed
                                                                        ? 'Already Claimed'
                                                                        : 'Redeem Reward'}
                                                                </button>
                                                            </article>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ───────── REWARD CONFIRMATION MODAL ───────── */}
            {selectedReward && (
                <AdminModal
                    title="Confirm Reward Redemption"
                    description="Review the reward details before completing the redemption."
                    onClose={() => {
                        if (redeemingRewardId === null) {
                            setSelectedReward(null);
                        }
                    }}
                    maxWidthClass="max-w-md"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setSelectedReward(null)}
                                disabled={redeemingRewardId !== null}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-5 text-sm font-semibold text-[#111827] shadow-sm transition-colors hover:bg-[#F8FAFC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleRedeemReward(selectedReward.id)
                                }
                                disabled={redeemingRewardId !== null}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#DC2626] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {redeemingRewardId === selectedReward.id
                                    ? 'Redeeming…'
                                    : 'Confirm Redemption'}
                            </button>
                        </>
                    }
                >
                    <div className="space-y-5 p-6">

                        <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] p-4 ring-1 ring-[#E5E7EB]">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2] text-sm font-bold text-[#DC2626]">
                                {initials}
                            </div>

                            <div className="min-w-0">
                                <p className="truncate font-semibold text-[#111827]">
                                    {customer?.first_name}{' '}
                                    {customer?.last_name}
                                </p>

                                <p className="mt-0.5 truncate text-sm text-[#64748B]">
                                    {customer?.customer_code}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                                Reward
                            </p>

                            <p className="mt-1 text-lg font-bold text-[#111827]">
                                {selectedReward.reward_name}
                            </p>

                            {selectedReward.description && (
                                <p className="mt-1 text-sm leading-6 text-[#64748B]">
                                    {selectedReward.description}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                                <p className="text-xs font-medium text-[#64748B]">
                                    Current points
                                </p>

                                <p className="mt-1 text-xl font-bold text-[#111827]">
                                    {customer?.points ?? 0}
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
                                <p className="text-xs font-medium text-[#B91C1C]">
                                    Points to use
                                </p>

                                <p className="mt-1 text-xl font-bold text-[#B91C1C]">
                                    {selectedReward.points_required}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
                            <span
                                className="material-symbols-outlined text-[20px] text-[#DC2626]"
                                aria-hidden="true"
                            >
                                info
                            </span>

                            <p className="text-sm leading-6 text-[#111827]">
                                This will deduct{' '}
                                <span className="font-bold text-[#B91C1C]">
                                    {selectedReward.points_required} points
                                </span>{' '}
                                from the customer's balance.
                            </p>
                        </div>
                    </div>
                </AdminModal>
            )}
        </CashierLayout>
    );
}