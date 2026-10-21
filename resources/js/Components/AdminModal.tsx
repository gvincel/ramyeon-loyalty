import { ReactNode, useEffect, useRef } from 'react';

interface AdminModalProps {
    title: string;
    description?: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
    maxWidthClass?: string;
    titleId?: string;
}

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusable(root: HTMLElement): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.getClientRects().length > 0,
    );
}

export default function AdminModal({
    title,
    description,
    onClose,
    children,
    footer,
    maxWidthClass = 'max-w-2xl',
    titleId = 'admin-modal-title',
}: AdminModalProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);
    const descriptionId = `${titleId}-description`;

    // Scroll lock (with scrollbar-gutter compensation), initial focus, focus restore.
    useEffect(() => {
        previouslyFocusedRef.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;

        const body = document.body;
        const originalOverflow = body.style.overflow;
        const originalPaddingRight = body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        const focusTimer = window.setTimeout(() => {
            const root = containerRef.current;
            if (!root) return;
            const firstFocusable = getFocusable(root)[0];
            (firstFocusable ?? root).focus();
        }, 0);

        return () => {
            window.clearTimeout(focusTimer);
            body.style.overflow = originalOverflow;
            body.style.paddingRight = originalPaddingRight;

            const previous = previouslyFocusedRef.current;
            if (previous && document.contains(previous)) {
                previous.focus();
            }
        };
    }, []);

    // Escape closes; Tab cycles within the dialog.
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
            }

            if (event.key !== 'Tab' || !containerRef.current) return;

            const focusable = getFocusable(containerRef.current);

            if (focusable.length === 0) {
                event.preventDefault();
                containerRef.current.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement as HTMLElement | null;

            if (!active || !containerRef.current.contains(active)) {
                event.preventDefault();
                first.focus();
                return;
            }

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm motion-safe:animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
        >
            <div
                ref={containerRef}
                tabIndex={-1}
                className={`flex max-h-[90vh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-sheet border border-line bg-surface shadow-overlay outline-none motion-safe:animate-scale-in`}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
                    <div className="min-w-0">
                        <h2
                            id={titleId}
                            className="text-heading font-semibold tracking-tight text-ink"
                        >
                            {title}
                        </h2>

                        {description && (
                            <p
                                id={descriptionId}
                                className="mt-1 text-small text-ink-muted"
                            >
                                {description}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-ink-subtle transition-colors duration-fast ease-standard hover:bg-surface-muted hover:text-ink"
                        aria-label={`Close ${title} dialog`}
                    >
                        <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M6 6l12 12" />
                            <path d="M18 6L6 18" />
                        </svg>
                    </button>
                </div>

                {/* Body — callers own the padding, preserved from the current contract */}
                <div className="overflow-y-auto">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="flex flex-col-reverse gap-3 border-t border-line bg-surface-muted px-6 py-4 sm:flex-row sm:justify-end">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}