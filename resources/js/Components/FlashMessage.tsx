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
                <div className="mb-6 rounded-md bg-green-50 p-4">
                    <p className="text-sm font-medium text-green-800">
                        {success}
                    </p>
                </div>
            )}

            {error && (
                <div className="mb-6 rounded-md bg-red-50 p-4">
                    <p className="text-sm font-medium text-red-800">
                        {error}
                    </p>
                </div>
            )}
        </>
    );
}