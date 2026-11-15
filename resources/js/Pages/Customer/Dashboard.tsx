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
    if (!svg) return;

    setSavingQr(true);
    setQrSaveError(null);

    let objectUrl: string | null = null;

    try {
        // ---------- Brand colors ----------
        const BURGUNDY = '#721f26';
        const BURGUNDY_DARK = '#42191c';
        const GOLD = '#e4b86d';
        const CREAM = '#f7f3ed';
        const INK = '#2b1214';
        const gold = (a: number) => `rgba(228, 184, 109, ${a})`;
        const cream = (a: number) => `rgba(247, 243, 237, ${a})`;

        // ---------- Layout ----------
        const W = 1000;
        const H = 1400;
        const SCALE = 2; // exports at 2000 x 2800 so text and edges stay sharp
        const QR_SIZE = 378;

        // ---------- Use the same font as the rest of the app ----------
        const family =
            getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif';
        const font = (weight: number, size: number) =>
            `${weight} ${size}px ${family}`;

        // Make sure every weight we draw with is loaded before using the canvas
        await Promise.all(
            [400, 500, 600, 700].map((w) =>
                document.fonts.load(font(w, 16)).catch(() => []),
            ),
        );
        await document.fonts.ready;

        // ---------- Prepare the QR image ----------
        const svgClone = svg.cloneNode(true) as SVGSVGElement;
        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        if (!svgClone.getAttribute('viewBox')) {
            svgClone.setAttribute(
                'viewBox',
                `0 0 ${svg.clientWidth || 200} ${svg.clientHeight || 200}`,
            );
        }

        svgClone.setAttribute('width', String(QR_SIZE * SCALE));
        svgClone.setAttribute('height', String(QR_SIZE * SCALE));

        // Transparent white background and brand-dark modules, so the code
        // sits cleanly on the cream panel
        svgClone.querySelectorAll('[fill]').forEach((el) => {
            const fill = (el.getAttribute('fill') || '').trim().toLowerCase();

            if (['#fff', '#ffffff', 'white'].includes(fill)) {
                el.setAttribute('fill', 'none');
            } else if (['#000', '#000000', 'black'].includes(fill)) {
                el.setAttribute('fill', INK);
            }
        });

        const loadImage = (src: string) =>
            new Promise<HTMLImageElement | null>((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src = src;
            });

        const svgBlob = new Blob([new XMLSerializer().serializeToString(svgClone)], {
            type: 'image/svg+xml;charset=utf-8',
        });
        objectUrl = URL.createObjectURL(svgBlob);

        const [qrImage, logo] = await Promise.all([
            loadImage(objectUrl),
            loadImage('/images/ramyeon-logo-clear.png'),
        ]);

        URL.revokeObjectURL(objectUrl);
        objectUrl = null;

        if (!qrImage) throw new Error('Failed to load QR image');

        // ---------- Canvas ----------
        const canvas = document.createElement('canvas');
        canvas.width = W * SCALE;
        canvas.height = H * SCALE;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');

        ctx.scale(SCALE, SCALE);
        ctx.textBaseline = 'middle';

        // ---------- Drawing helpers ----------
        const roundedRectPath = (x: number, y: number, w: number, h: number, r: number) => {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
        };

        const strokeLine = (x1: number, y1: number, x2: number, y2: number, color: string, width: number) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.stroke();
        };

        const diamond = (cx: number, cy: number, r: number, color: string) => {
            ctx.beginPath();
            ctx.moveTo(cx, cy - r);
            ctx.lineTo(cx + r, cy);
            ctx.lineTo(cx, cy + r);
            ctx.lineTo(cx - r, cy);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        };

        const text = (value: string, x: number, y: number, f: string, color: string) => {
            ctx.font = f;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.fillText(value, x, y);
        };

        // Letter-spaced, centered text. Returns the drawn width.
        const spaced = (value: string, cx: number, y: number, f: string, color: string, spacing: number) => {
            ctx.font = f;
            ctx.fillStyle = color;
            ctx.textAlign = 'left';

            const chars = [...value];
            const widths = chars.map((c) => ctx.measureText(c).width);
            const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);

            let x = cx - total / 2;
            chars.forEach((c, i) => {
                ctx.fillText(c, x, y);
                x += widths[i] + spacing;
            });

            return total;
        };

        const CX = W / 2;

        // ---------- Backdrop + card with soft shadow ----------
        ctx.fillStyle = '#efe7da';
        ctx.fillRect(0, 0, W, H);

        ctx.save();
        ctx.shadowColor = 'rgba(66, 25, 28, 0.28)';
        ctx.shadowBlur = 56;
        ctx.shadowOffsetY = 16;
        ctx.fillStyle = BURGUNDY;
        roundedRectPath(60, 60, 880, 1280, 44);
        ctx.fill();
        ctx.restore();

        // ---------- Faint concentric rings behind the logo ----------
        ctx.save();
        roundedRectPath(60, 60, 880, 1280, 44);
        ctx.clip();
        ctx.strokeStyle = gold(0.07);
        ctx.lineWidth = 2;
        for (let r = 150; r < 760; r += 60) {
            ctx.beginPath();
            ctx.arc(CX, 190, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        // ---------- Double keyline frame, broken by diamonds ----------
        roundedRectPath(84, 84, 832, 1232, 32);
        ctx.strokeStyle = gold(0.6);
        ctx.lineWidth = 2;
        ctx.stroke();

        roundedRectPath(95, 95, 810, 1210, 23);
        ctx.strokeStyle = gold(0.22);
        ctx.lineWidth = 1;
        ctx.stroke();

        [84, 1316].forEach((y) => {
            ctx.fillStyle = BURGUNDY;
            ctx.fillRect(CX - 34, y - 9, 68, 18);
            diamond(CX, y, 7, GOLD);
        });

        // ---------- Logo ----------
        ctx.beginPath();
        ctx.arc(CX, 195, 70, 0, Math.PI * 2);
        ctx.strokeStyle = gold(0.35);
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(CX, 195, 58, 0, Math.PI * 2);
        ctx.fillStyle = GOLD;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(CX, 195, 53, 0, Math.PI * 2);
        ctx.fillStyle = CREAM;
        ctx.fill();

        if (logo) {
            const box = 92;
            const ratio = logo.naturalWidth / logo.naturalHeight || 1;
            const lw = ratio >= 1 ? box : box * ratio;
            const lh = ratio >= 1 ? box / ratio : box;

            ctx.save();
            ctx.beginPath();
            ctx.arc(CX, 195, 53, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(logo, CX - lw / 2, 195 - lh / 2, lw, lh);
            ctx.restore();
        }

        // ---------- Header text ----------
        spaced('RAMYEON CORNER', CX, 312, font(600, 36), cream(1), 9);

        const labelWidth = spaced('LOYALTY REWARDS CARD', CX, 362, font(500, 18), gold(1), 6);
        [-1, 1].forEach((side) => {
            const x0 = CX + side * (labelWidth / 2 + 22);
            strokeLine(x0, 362, x0 + side * 54, 362, gold(0.55), 2);
        });

        // ---------- QR panel with corner brackets ----------
        const PX = 275;
        const PY = 425;
        const PS = 450;

        ctx.fillStyle = CREAM;
        roundedRectPath(PX, PY, PS, PS, 26);
        ctx.fill();

        ctx.drawImage(qrImage, PX + 36, PY + 36, QR_SIZE, QR_SIZE);

        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        const off = 22;
        const len = 44;
        [
            [PX - off, PY - off, 1, 1],
            [PX + PS + off, PY - off, -1, 1],
            [PX - off, PY + PS + off, 1, -1],
            [PX + PS + off, PY + PS + off, -1, -1],
        ].forEach(([x, y, dx, dy]) => {
            ctx.beginPath();
            ctx.moveTo(x, y + dy * len);
            ctx.lineTo(x, y);
            ctx.lineTo(x + dx * len, y);
            ctx.stroke();
        });

        spaced('SCAN TO EARN POINTS', CX, 948, font(600, 19), gold(1), 6);

        // ---------- Customer details ----------
        const fullName = `${customer.first_name} ${customer.last_name}`.trim();

        // Shrink long names so they never touch the frame
        let nameSize = 58;
        ctx.font = font(700, nameSize);
        while (ctx.measureText(fullName).width > 700 && nameSize > 30) {
            nameSize -= 2;
            ctx.font = font(700, nameSize);
        }
        text(fullName, CX, 1040, font(700, nameSize), CREAM);

        spaced('MEMBER ID', CX, 1100, font(500, 15), gold(0.85), 5);

        const code = String(customer.customer_code);
        const codeFont = font(500, 32);
        ctx.font = codeFont;
        const codeText = [...code];
        const codeTextWidth =
            codeText.reduce((sum, c) => sum + ctx.measureText(c).width, 0) +
            4 * (codeText.length - 1);
        const pillW = codeTextWidth + 90;

        roundedRectPath(CX - pillW / 2, 1124, pillW, 62, 31);
        ctx.strokeStyle = gold(0.6);
        ctx.lineWidth = 2;
        ctx.stroke();

        spaced(code, CX, 1155, codeFont, cream(1), 4);

        // ---------- Footer ----------
        [-1, 1].forEach((side) => {
            strokeLine(CX + side * 18, 1236, CX + side * 130, 1236, gold(0.5), 2);
        });
        diamond(CX, 1236, 5, GOLD);

        text('Show this card to the cashier to earn points.', CX, 1273, font(400, 21), cream(0.72));

        // ---------- Export ----------
        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/png'),
        );

        if (!blob) throw new Error('Failed to generate PNG');

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `Ramyeon-Loyalty-${customer.customer_code}.png`;
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

            <div className="mx-auto w-full max-w-content px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <CustomerPageHeader
                    eyebrow="Ramyeon Corner Loyalty"
                    title={`Welcome, ${customer.first_name}`}
                    description="Keep track of your loyalty points and use them when you're ready to redeem a reward."
                />

                <div className="mt-7 grid items-stretch gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                    {/* Loyalty Account */}
                    <section className="panel flex h-full flex-col">
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
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-brand-50 ring-1 ring-brand-100">
                                    <span className="material-symbols-outlined text-[24px] text-brand-700" aria-hidden="true">
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
                    <section className="panel flex flex-col p-6 sm:p-7">
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

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-brand-50 ring-1 ring-brand-100">
                                <span className="material-symbols-outlined text-[24px] text-brand-700" aria-hidden="true">
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