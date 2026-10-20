import { ReactNode } from 'react';

interface AdminPageHeaderProps {
    eyebrow: string;
    title: string;
    description: string;
    action?: ReactNode;
}

const styles = `
@keyframes admin-header-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes admin-header-sheen {
    0%, 100% { background-position: 0% 0%; }
    50%      { background-position: 100% 100%; }
}
@keyframes admin-header-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.55); }
    50%      { box-shadow: 0 0 0 5px rgba(255, 255, 255, 0); }
}
.admin-header {
    background: linear-gradient(135deg, #d32525 0%, #b01818 55%, #8f1414 100%);
    background-size: 200% 200%;
    animation:
        admin-header-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both,
        admin-header-sheen 20s ease-in-out infinite;
}
.admin-header-dot { animation: admin-header-dot 2.4s ease-out infinite; }
@media (prefers-reduced-motion: reduce) {
    .admin-header,
    .admin-header-dot { animation: none; }
}
`;

export default function AdminPageHeader({
    eyebrow,
    title,
    description,
    action,
}: AdminPageHeaderProps) {
    return (
        <div className="admin-header relative mb-7 overflow-hidden rounded-2xl px-6 py-6 text-white shadow-lg shadow-red-900/20 sm:px-8 sm:py-7">
            <style>{styles}</style>

            {/* Soft decorative circles */}
            <div
                className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/10"
                aria-hidden="true"
            />
            <div
                className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-black/10"
                aria-hidden="true"
            />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
                        <span
                            className="admin-header-dot h-2 w-2 rounded-full bg-white"
                            aria-hidden="true"
                        />
                        <p className="text-xs font-semibold tracking-wide text-red-50">
                            {eyebrow}
                        </p>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {title}
                    </h1>

                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-red-100">
                        {description}
                    </p>
                </div>

                {action && <div className="shrink-0">{action}</div>}
            </div>
        </div>
    );
}