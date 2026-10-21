import { PropsWithChildren } from 'react';

export default function CustomerAuthLayout({ children }: PropsWithChildren) {
    return (
        // The outer page gets the deep red brand gradient
        <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 px-4 py-6 sm:px-6">
            
            {/* Subtle decorative bowl-rim circles to match the admin theme */}
            <svg
                aria-hidden="true"
                viewBox="0 0 640 640"
                fill="none"
                className="pointer-events-none absolute -bottom-72 -left-72 hidden h-[640px] w-[640px] md:block"
            >
                <circle cx="320" cy="320" r="318" stroke="rgb(255 255 255 / 0.08)" />
                <circle cx="320" cy="320" r="260" stroke="rgb(var(--accent-400) / 0.35)" />
                <circle cx="320" cy="320" r="200" stroke="rgb(255 255 255 / 0.08)" />
                <circle cx="320" cy="320" r="140" stroke="rgb(255 255 255 / 0.08)" />
            </svg>

            {/* 
                The Modal Card 
                Locks to the screen height, scrolls internally only.
            */}
            <div className="relative z-10 flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-card border border-line bg-surface shadow-overlay">
                
                {/* Fixed Header: Logo Left, Text Right, No Link */}
                <div className="shrink-0 border-b border-line px-6 py-6 sm:px-8">
                    <div className="flex items-center gap-4">
                        {/* Logo (Not clickable) */}
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-50 p-1 shadow-sm ring-1 ring-brand-100">
                            <img
                                src="/images/ramyeon-logo-clear.png"
                                alt="Ramyeon Corner"
                                className="h-full w-full rounded-full object-contain"
                            />
                        </span>
                        
                        {/* Text */}
                        <div>
                            <h1 className="text-lead font-semibold tracking-tight text-ink">
                                Ramyeon Corner
                            </h1>
                            <p className="mt-1 text-caption font-semibold uppercase tracking-[0.18em] text-brand-700">
                                Customer Loyalty Portal
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}