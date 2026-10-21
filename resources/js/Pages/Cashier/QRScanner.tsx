import AdminModal from '@/Components/AdminModal';
import AdminPageHeader from '@/Components/AdminPageHeader';
import FlashMessage from '@/Components/FlashMessage';
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

export default function QRScannerPage() {
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
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [redeemingRewardId, setRedeemingRewardId] = useState<number | null>(
        null,
    );

    const [receiptNumber, setReceiptNumber] = useState('');
    const [purchaseAmount, setPurchaseAmount] = useState('');
    const [usePoints, setUsePoints] = useState(false);
    const [pointsUsed, setPointsUsed] = useState('');

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
                    error.response?.data?.message || 'Unable to find customer.',
                );
            } else {
                setError('Something went wrong while finding the customer.');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

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
                { customer_code: searchValue, search: searchValue },
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
            setCustomerCode('');
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
    }, [customerCode]);

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
                    points_used: usePoints ? pointsUsedValue : 0,
                },
            );

            setSuccess(response.data.message);
            setCustomer({ ...customer, points: response.data.new_points });
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

    const handleRedeemReward = async (rewardId: number) => {
        if (!customer) return;

        setError(null);
        setSuccess(null);
        setRedeemingRewardId(rewardId);

        try {
            const response = await axios.post(
                route('cashier.reward-redemptions.store'),
                { customer_id: customer.id, reward_id: rewardId },
            );

            setCustomer({ ...customer, points: response.data.new_points });
            setSuccess(response.data.message);
            setSelectedReward(null);

            try {
                const rewardsResponse = await axios.post(
                    route('cashier.rewards.available'),
                    { customer_id: customer.id },
                );
                setRewards(rewardsResponse.data.rewards);
            } catch {}
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(
                    error.response?.data?.message || 'Unable to redeem reward.',
                );
            } else {
                setError('Something went wrong while redeeming the reward.');
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
        (!/^\d+$/.test(pointsUsed) || Number(pointsUsed) > maxPointsUsable);
    const amountPaid = Math.max(purchaseValue - pointsUsedValue, 0);
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

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content">
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
                                    className="btn-secondary shrink-0"
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

                    <FlashMessage success={success} error={error} />

                    {!customer && !isLoading && (
                        <div className="grid items-stretch gap-6 lg:grid-cols-2">
                            <section className="panel flex flex-col overflow-hidden">
                                <div className="panel-header">
                                    <div>
                                        <h2 className="panel-title">Scan QR code</h2>
                                        <p className="panel-desc">
                                            Point the camera at the customer's loyalty QR.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-1 flex-col p-6">
                                    <div className="mx-auto w-full max-w-md overflow-hidden rounded-card border border-line bg-canvas p-2">
                                        <QRScanner
                                            onScan={handleScan}
                                            onError={handleError}
                                        />
                                    </div>
                                    <p className="mt-5 flex items-start justify-center gap-2 text-center text-caption leading-5 text-ink-muted">
                                        <span
                                            className="material-symbols-outlined text-[16px] text-brand-700"
                                            aria-hidden="true"
                                        >
                                            videocam
                                        </span>
                                        <span>
                                            Camera access is required. If you
                                            don't see a preview, check your
                                            browser's camera permission.
                                        </span>
                                    </p>
                                </div>
                            </section>

                            <section className="panel flex flex-col overflow-hidden">
                                <div className="panel-header">
                                    <div>
                                        <h2 className="panel-title">Find a customer</h2>
                                        <p className="panel-desc">
                                            No QR? Search by customer code or name.
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <label
                                        htmlFor="customer_code"
                                        className="field-label"
                                    >
                                        Customer code or name
                                    </label>
                                    <div className="relative">
                                        <span
                                            className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-ink-muted"
                                            aria-hidden="true"
                                        >
                                            search
                                        </span>
                                        <input
                                            id="customer_code"
                                            type="text"
                                            value={customerCode}
                                            onChange={(event) => {
                                                setCustomerCode(
                                                    event.target.value,
                                                );
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
                                            className={`field-input pl-11 ${customerCode ? 'pr-11' : ''}`}
                                        />
                                        {customerCode && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCustomerCode('')
                                                }
                                                aria-label="Clear search"
                                                className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted transition hover:bg-canvas hover:text-ink"
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
                                        className="mt-2 text-caption text-ink-muted"
                                    >
                                        Press Enter or use the button to search.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            void handleCustomerCodeLookup()
                                        }
                                        disabled={
                                            isLoading ||
                                            customerCode.trim() === ''
                                        }
                                        className="btn-primary mt-5 w-full"
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
                                <div className="flex flex-1 flex-col border-t border-line bg-surface-muted p-6">
                                    <p className="text-caption font-bold uppercase tracking-wider text-ink">
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
                                                className="flex flex-1 items-center gap-3 rounded-control border border-line bg-surface px-4 py-3"
                                            >
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-700">
                                                    <span
                                                        className="material-symbols-outlined text-[20px]"
                                                        aria-hidden="true"
                                                    >
                                                        {item.icon}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-small font-semibold text-ink">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-caption text-ink-muted">
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

                    {isLoading && (
                        <section className="panel flex flex-col items-center justify-center px-6 py-20">
                            <svg
                                className="h-9 w-9 animate-spin text-brand motion-reduce:animate-none"
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
                            <p className="mt-4 text-small font-semibold text-ink">
                                Looking up customer…
                            </p>
                            <p className="mt-1 text-caption text-ink-muted">
                                This only takes a moment.
                            </p>
                        </section>
                    )}

                    {customer && (
                        <div className="space-y-6">
                            <section className="panel">
                                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-50 text-lead font-bold text-brand-700">
                                            {initials}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-caption font-bold uppercase tracking-wider text-ink-muted">
                                                Customer found
                                            </p>
                                            <h2 className="mt-0.5 truncate text-heading font-bold tracking-tight text-ink sm:text-title">
                                                {customer.first_name}{' '}
                                                {customer.last_name}
                                            </h2>
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-muted px-2.5 py-1 text-caption font-medium text-ink ring-1 ring-line">
                                                    <span
                                                        className="material-symbols-outlined text-[14px]"
                                                        aria-hidden="true"
                                                    >
                                                        call
                                                    </span>
                                                    {customer.phone_number}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1 text-caption font-semibold text-brand-700">
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
                                    <div className="shrink-0 rounded-control bg-accent-100 px-6 py-4 text-warning-700 sm:text-right">
                                        <p className="text-caption font-semibold uppercase tracking-wider">
                                            Current points
                                        </p>
                                        <p className="mt-1 text-metric font-bold leading-none">
                                            {customer.points}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <div className="grid items-start gap-6 lg:grid-cols-5">
                                <section className="panel lg:col-span-3">
                                    <div className="panel-header">
                                        <div>
                                            <h2 className="panel-title">Transaction details</h2>
                                            <p className="panel-desc">
                                                Enter the purchase to earn loyalty points.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-5 p-6">
                                        <div className="grid gap-5 sm:grid-cols-2">
                                            <div>
                                                <label
                                                    htmlFor="receipt_number"
                                                    className="field-label"
                                                >
                                                    Receipt number{' '}
                                                    <span className="font-normal text-ink-subtle">
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
                                                    className={`field-input ${validationErrors.receipt_number ? 'border-danger-600 bg-danger-50' : ''}`}
                                                />
                                                {validationErrors.receipt_number && (
                                                    <p className="field-error">
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
                                                    className="field-label"
                                                >
                                                    Purchase amount
                                                </label>
                                                <div className="relative">
                                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-small font-semibold text-ink-muted">
                                                        ₱
                                                    </span>
                                                    <input
                                                        id="purchase_amount"
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={purchaseAmount}
                                                        onKeyDown={(event) => {
                                                            if (
                                                                [
                                                                    '-',
                                                                    '+',
                                                                    'e',
                                                                    'E',
                                                                ].includes(
                                                                    event.key,
                                                                )
                                                            ) {
                                                                event.preventDefault();
                                                            }
                                                        }}
                                                        onWheel={(event) =>
                                                            event.currentTarget.blur()
                                                        }
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
                                                                if (
                                                                    usePoints &&
                                                                    /^\d+$/.test(
                                                                        pointsUsed,
                                                                    )
                                                                ) {
                                                                    const newPurchaseValue =
                                                                        Number(
                                                                            value,
                                                                        );
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
                                                                        (
                                                                            current,
                                                                        ) => ({
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
                                                        className={`field-input pl-8 ${validationErrors.purchase_amount ? 'border-danger-600 bg-danger-50' : ''}`}
                                                    />
                                                </div>
                                                {validationErrors.purchase_amount && (
                                                    <p className="field-error">
                                                        {
                                                            validationErrors
                                                                .purchase_amount[0]
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            className={`rounded-control border p-4 transition-colors sm:p-5 ${usePoints ? 'border-brand bg-brand-50' : 'border-line bg-surface-muted'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    id="use_points"
                                                    type="checkbox"
                                                    checked={usePoints}
                                                    onChange={(event) => {
                                                        setUsePoints(
                                                            event.target
                                                                .checked,
                                                        );
                                                        if (
                                                            !event.target
                                                                .checked
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
                                                    className="field-checkbox mt-0.5"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <label
                                                            htmlFor="use_points"
                                                            className="cursor-pointer text-small font-semibold text-ink"
                                                        >
                                                            Use points
                                                        </label>
                                                        <span className="badge-warning">
                                                            {customer.points}{' '}
                                                            available
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-caption leading-5 text-ink-muted">
                                                        Apply the customer's
                                                        points to reduce the
                                                        amount they need to pay.
                                                    </p>
                                                </div>
                                            </div>

                                            {usePoints && (
                                                <div className="mt-4 border-t border-brand-200 pt-4">
                                                    <label
                                                        htmlFor="points_used"
                                                        className="field-label"
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
                                                        className={`field-input ${validationErrors.points_used || pointsInputInvalid ? 'border-danger-600 bg-danger-50' : ''}`}
                                                    />
                                                    <p
                                                        className={`mt-1.5 text-caption ${pointsInputInvalid ? 'font-medium text-danger-700' : 'text-ink-muted'}`}
                                                    >
                                                        Maximum usable:{' '}
                                                        {maxPointsUsable} points
                                                    </p>
                                                    {validationErrors.points_used && (
                                                        <p className="field-error">
                                                            {
                                                                validationErrors
                                                                    .points_used[0]
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="overflow-hidden rounded-control border border-line">
                                            <div className="space-y-3 bg-surface-muted p-5">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-small text-ink-muted">
                                                        Purchase amount
                                                    </span>
                                                    <span className="text-small font-semibold text-ink">
                                                        ₱
                                                        {purchaseValue.toFixed(
                                                            2,
                                                        )}
                                                    </span>
                                                </div>
                                                {usePoints &&
                                                    pointsUsedValue > 0 && (
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span className="text-small text-ink-muted">
                                                                Points used
                                                            </span>
                                                            <span className="text-small font-semibold text-danger-700">
                                                                −₱
                                                                {pointsUsedValue.toFixed(
                                                                    2,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                <div className="flex items-center justify-between gap-4 border-t border-dashed border-line-strong pt-3">
                                                    <span className="text-small font-bold text-ink">
                                                        Amount paid
                                                    </span>
                                                    <span className="text-heading font-bold tracking-tight text-ink">
                                                        ₱{amountPaid.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between gap-4 bg-accent-100 px-5 py-3.5 text-warning-700">
                                                <div className="flex items-center gap-2.5">
                                                    <span
                                                        className="material-symbols-outlined text-[22px]"
                                                        aria-hidden="true"
                                                    >
                                                        stars
                                                    </span>
                                                    <div>
                                                        <p className="text-small font-semibold">
                                                            Points to earn
                                                        </p>
                                                        <p className="text-caption">
                                                            Every ₱100 actually
                                                            paid earns 1 point.
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-metric font-bold leading-none">
                                                    {pointsEarned}
                                                </span>
                                            </div>
                                        </div>

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
                                            className="btn-primary w-full"
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

                                <section className="panel lg:col-span-2">
                                    <div className="panel-header">
                                        <div>
                                            <h2 className="panel-title">Available rewards</h2>
                                            <p className="panel-desc">
                                                Rewards this customer can redeem.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-5 sm:p-6">
                                        {isLoadingRewards && (
                                            <div className="flex flex-col items-center justify-center py-10">
                                                <svg
                                                    className="h-7 w-7 animate-spin text-brand motion-reduce:animate-none"
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
                                                <p className="mt-3 text-small text-ink-muted">
                                                    Loading rewards…
                                                </p>
                                            </div>
                                        )}

                                        {!isLoadingRewards &&
                                            rewards.length === 0 && (
                                                <div className="py-10 text-center">
                                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                                                        <span
                                                            className="material-symbols-outlined text-[24px]"
                                                            aria-hidden="true"
                                                        >
                                                            redeem
                                                        </span>
                                                    </div>
                                                    <p className="mt-3 text-small font-semibold text-ink">
                                                        No rewards available
                                                    </p>
                                                    <p className="mt-1 text-caption text-ink-muted">
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
                                                        const progress =
                                                            Math.min(
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
                                                                className={`rounded-control border p-4 transition ${canRedeem ? 'border-line bg-surface hover:border-brand-200 hover:shadow-sm' : 'border-line bg-surface-muted'} ${isMaxed ? 'opacity-75' : ''}`}
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <h3 className="truncate text-small font-bold text-ink">
                                                                            {
                                                                                reward.reward_name
                                                                            }
                                                                        </h3>
                                                                        <p className="mt-1 text-caption font-semibold text-brand-700">
                                                                            {
                                                                                reward.points_required
                                                                            }{' '}
                                                                            points
                                                                        </p>
                                                                    </div>
                                                                    <span className="badge-brand shrink-0 capitalize">
                                                                        {reward.reward_type.replace(
                                                                            '_',
                                                                            ' ',
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                {reward.description && (
                                                                    <p className="mt-2.5 text-caption leading-5 text-ink-muted">
                                                                        {
                                                                            reward.description
                                                                        }
                                                                    </p>
                                                                )}

                                                                {!isMaxed && (
                                                                    <div className="mt-3">
                                                                        <div
                                                                            className="h-1.5 w-full overflow-hidden rounded-full bg-line"
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
                                                                                className="h-full rounded-full bg-brand transition-all duration-500 motion-reduce:transition-none"
                                                                                style={{
                                                                                    width: `${progress}%`,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <p className="mt-1.5 text-caption text-ink-muted">
                                                                            {canAfford
                                                                                ? 'Ready to redeem'
                                                                                : `${reward.points_required - customer.points} more points needed`}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {isMaxed && (
                                                                    <div className="mt-3 rounded-control bg-surface px-3 py-2 ring-1 ring-line">
                                                                        <p className="text-caption font-medium text-ink-muted">
                                                                            Already
                                                                            claimed{' '}
                                                                            <span className="font-semibold text-ink">
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
                                                                    className="btn-primary mt-4 w-full"
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

            {selectedReward && (
                <AdminModal
                    title="Confirm Reward Redemption"
                    description="Review the reward details before completing the redemption."
                    onClose={() => {
                        if (redeemingRewardId === null) setSelectedReward(null);
                    }}
                    maxWidthClass="max-w-md"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setSelectedReward(null)}
                                disabled={redeemingRewardId !== null}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleRedeemReward(selectedReward.id)
                                }
                                disabled={redeemingRewardId !== null}
                                className="btn-primary"
                            >
                                {redeemingRewardId === selectedReward.id
                                    ? 'Redeeming…'
                                    : 'Confirm Redemption'}
                            </button>
                        </>
                    }
                >
                    <div className="space-y-5 p-6">
                        <div className="flex items-center gap-3 rounded-control bg-surface-muted p-4 ring-1 ring-line">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-small font-bold text-brand-700">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate font-semibold text-ink">
                                    {customer?.first_name} {customer?.last_name}
                                </p>
                                <p className="mt-0.5 truncate text-small text-ink-muted">
                                    {customer?.customer_code}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-caption font-semibold uppercase tracking-wider text-ink-muted">
                                Reward
                            </p>
                            <p className="mt-1 text-lead font-bold text-ink">
                                {selectedReward.reward_name}
                            </p>
                            {selectedReward.description && (
                                <p className="mt-1 text-small leading-6 text-ink-muted">
                                    {selectedReward.description}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-control border border-line bg-surface p-4">
                                <p className="text-caption font-medium text-ink-muted">
                                    Current points
                                </p>
                                <p className="mt-1 text-lead font-bold text-ink">
                                    {customer?.points ?? 0}
                                </p>
                            </div>
                            <div className="rounded-control border border-danger-600/20 bg-danger-50 p-4">
                                <p className="text-caption font-medium text-danger-700">
                                    Points to use
                                </p>
                                <p className="mt-1 text-lead font-bold text-danger-700">
                                    {selectedReward.points_required}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-control border border-danger-600/20 bg-danger-50 p-4">
                            <span
                                className="material-symbols-outlined text-[20px] text-danger-700"
                                aria-hidden="true"
                            >
                                info
                            </span>
                            <p className="text-small leading-6 text-ink">
                                This will deduct{' '}
                                <span className="font-bold text-danger-700">
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