interface StatusBadgeProps {
    active: boolean;
    activeLabel?: string;
    inactiveLabel?: string;
}

export default function StatusBadge({
    active,
    activeLabel = 'Active',
    inactiveLabel = 'Inactive',
}: StatusBadgeProps) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider shadow-sm transition-colors ${
                active
                    ? 'border-success-600/20 bg-success-50 text-success-700'
                    : 'border-line bg-surface text-ink-muted'
            }`}
        >
            <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    active
                        ? 'bg-success-600 ring-2 ring-success-600/20'
                        : 'bg-ink-subtle ring-2 ring-ink-subtle/10'
                }`}
                aria-hidden="true"
            />
            {active ? activeLabel : inactiveLabel}
        </span>
    );
}