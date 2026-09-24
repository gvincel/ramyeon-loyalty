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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span
                            className="h-2 w-2 rounded-full bg-red-600"
                            aria-hidden="true"
                        />
                        <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                            {eyebrow}
                        </p>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                        {title}
                    </h1>

                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-gray-500">
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