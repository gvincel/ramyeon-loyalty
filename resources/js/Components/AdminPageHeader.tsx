import { ReactNode } from 'react';

interface AdminPageHeaderProps {
    eyebrow: string;
    title: string;
    description: string;
    action?: ReactNode;
}

export default function AdminPageHeader({
    eyebrow,
    title,
    description,
    action,
}: AdminPageHeaderProps) {
    return (
        <div className="mb-7">
            <div className="flex flex-col gap-4 rounded-card bg-brand-700 p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span
                            className="h-2 w-2 rounded-full bg-white"
                            aria-hidden="true"
                        />
                        <p className="text-caption font-semibold uppercase tracking-wider text-brand-100">
                            {eyebrow}
                        </p>
                    </div>

                    <h1 className="text-title font-bold tracking-tight text-white sm:text-3xl">
                        {title}
                    </h1>

                    <p className="mt-1.5 max-w-2xl text-body text-brand-100/90">
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