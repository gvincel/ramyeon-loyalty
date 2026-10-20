import { type ReactNode } from 'react';

interface StatCardProps {
    label: string;
    value: string;
    icon: ReactNode;
    footer: ReactNode;
    tone?: 'brand' | 'accent';
}

export default function StatCard({
    label,
    value,
    icon,
    footer,
    tone = 'brand',
}: StatCardProps) {
    const styles = {
        brand: {
            border: 'border-t-brand',
            tile: 'bg-brand-50 text-brand-600',
        },
        accent: {
            border: 'border-t-accent-500',
            tile: 'bg-accent-100 text-warning-700',
        },
    }[tone];

    return (
        <div className={`rounded-card border border-t-2 border-line bg-surface p-5 shadow-card ${styles.border}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-small font-medium text-ink-muted">{label}</p>
                    {/* Replaced 'truncate' with 'break-words' so long numbers wrap instead of showing '...' */}
                    <p className="mt-3 break-words text-metric font-bold text-ink">{value}</p>
                </div>

                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-control ${styles.tile}`}>
                    {icon}
                </div>
            </div>

            <div className="mt-4 border-t border-line pt-3 text-small text-ink-muted">
                {footer}
            </div>
        </div>
    );
}