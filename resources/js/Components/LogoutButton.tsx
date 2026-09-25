import { router } from '@inertiajs/react';

import { FormEventHandler } from 'react';

interface LogoutButtonProps {
    collapsed?: boolean;
}

export default function LogoutButton({
    collapsed = false,
}: LogoutButtonProps) {
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    return (
        <form onSubmit={submit}>
            <button
                type="submit"
                className={`inline-flex items-center justify-center rounded-md bg-gray-900 py-2 text-sm font-medium text-white transition-all hover:bg-gray-700 ${
                    collapsed
                        ? 'w-full px-4 md:w-10 md:px-0'
                        : 'px-4'
                }`}
                aria-label={collapsed ? 'Log out' : undefined}
                title={collapsed ? 'Log out' : undefined}
            >
                <span
                    className="material-symbols-outlined text-[18px]"
                    aria-hidden="true"
                >
                    logout
                </span>

                <span
                    className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                        collapsed
                            ? 'ml-2 w-auto opacity-100 md:ml-0 md:w-0 md:opacity-0'
                            : 'ml-2 w-auto opacity-100'
                    }`}
                >
                    Log out
                </span>
            </button>
        </form>
    );
}
