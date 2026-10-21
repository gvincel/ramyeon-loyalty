interface SegmentedOption<T extends string> {
    value: T;
    label: string;
    count?: number;
}

export default function SegmentedFilter<T extends string>({
    options,
    value,
    onChange,
    label,
}: {
    options: SegmentedOption<T>[];
    value: T;
    onChange: (value: T) => void;
    label: string;
}) {
    const activeIndex = Math.max(0, options.findIndex((o) => o.value === value));

    return (
        <div
            role="group"
            aria-label={label}
            className="relative flex w-full rounded-control bg-canvas p-1 sm:w-72"
        >
            {/* 
                The white pill. 
                Width is exactly 1/3 of the container's inner width.
                It slides by exactly 1/3 of its own width (which is 1/3 of the container).
            */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1 bottom-1 rounded-lg bg-surface shadow-card transition-transform duration-200 ease-out motion-reduce:transition-none"
                style={{
                    left: '0.25rem',
                    width: `calc((100% - 0.5rem) / ${options.length})`,
                    transform: `translateX(${activeIndex * 100}%)`,
                }}
            />

            {options.map((option) => {
                const isActive = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => onChange(option.value)}
                        className={`relative z-10 flex min-h-9 flex-1 items-center justify-center gap-1 rounded-lg px-1 text-caption font-semibold transition-colors duration-150 ${
                            isActive
                                ? 'text-ink'
                                : 'text-ink-muted hover:text-ink'
                        }`}
                    >
                        <span>{option.label}</span>
                        {option.count !== undefined && (
                            <span className={isActive ? 'text-brand-700' : 'text-ink-subtle'}>
                                {option.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}