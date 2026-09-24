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
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                active
                    ? 'bg-green-50 text-green-700 ring-1 ring-green-100'
                    : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'
            }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    active ? 'bg-green-500' : 'bg-gray-400'
                }`}
                aria-hidden="true"
            />
            {active ? activeLabel : inactiveLabel}
        </span>
    );
}