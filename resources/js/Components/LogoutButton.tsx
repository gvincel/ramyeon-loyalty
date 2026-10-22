import { router } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface LogoutButtonProps {
    collapsed?: boolean;
    logoutRoute?: string;
}

export default function LogoutButton({
    collapsed = false,
    logoutRoute = 'logout',
}: LogoutButtonProps) {
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.post(route(logoutRoute));
    };

    return (
        <form onSubmit={submit} className="w-full">
            <button
                type="submit"
                className={`group flex w-full items-center rounded-control border border-white/20 bg-white/5 px-4 py-2.5 text-body font-medium text-brand-100 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/30 hover:bg-white/10 hover:text-white active:scale-[0.98] ${
                    collapsed ? 'justify-center' : ''
                }`}
                aria-label={collapsed ? 'Log out' : undefined}
                title={collapsed ? 'Log out' : undefined}
            >
                <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center transition-transform duration-300 group-hover:-translate-x-0.5"
                    aria-hidden="true"
                >
                    <span className="material-symbols-outlined text-[22px]">
                        logout
                    </span>
                </span>

                <span
                    className={`whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        collapsed
                            ? 'ml-0 w-0 overflow-hidden opacity-0'
                            : 'ml-4 w-auto opacity-100'
                    }`}
                >
                    Log out
                </span>
            </button>
        </form>
    );
}