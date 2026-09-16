import { router } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function LogoutButton() {
    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        router.post(route('logout'));
    };

    return (
        <form onSubmit={submit}>
            <button
                type="submit"
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
                Log out
            </button>
        </form>
    );
}
