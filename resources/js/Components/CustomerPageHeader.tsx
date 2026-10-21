import { ReactNode } from 'react';

interface CustomerPageHeaderProps {
    eyebrow: string;
    title: string;
    description: string;
    action?: ReactNode;
}

export default function CustomerPageHeader({
    eyebrow,
    title,
    description,
    action,
}: CustomerPageHeaderProps) {
    return (
        <div className="mb-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-caption font-semibold uppercase tracking-wider text-brand-700">
                        {eyebrow}
                    </p>

                    <h1 className="mt-1.5 text-title font-bold tracking-tight text-ink sm:text-3xl">
                        {title}
                    </h1>

                    <p className="mt-1.5 max-w-2xl text-body text-ink-muted">
                        {description}
                    </p>
                </div>

                {action && (
                    <div className="shrink-0">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
}