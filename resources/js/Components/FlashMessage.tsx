interface FlashMessageProps {
    success?: string | null;
    error?: string | null;
}

export default function FlashMessage({
    success,
    error,
}: FlashMessageProps) {
    return (
        <>
            {success && (
                <div 
                    role="alert" 
                    className="mb-6 flex items-start gap-3 rounded-control border border-success-600/20 bg-success-50 p-4"
                >
                    <svg
                        className="h-5 w-5 shrink-0 text-success-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <p className="text-small font-medium text-success-700">
                        {success}
                    </p>
                </div>
            )}

            {error && (
                <div 
                    role="alert" 
                    className="mb-6 flex items-start gap-3 rounded-control border border-danger-600/20 bg-danger-50 p-4"
                >
                    <svg
                        className="h-5 w-5 shrink-0 text-danger-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-small font-medium text-danger-700">
                        {error}
                    </p>
                </div>
            )}
        </>
    );
}