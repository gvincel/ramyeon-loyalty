import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { PageProps } from '@/types';

export default function UpdateProfileInformationForm({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props as any;
    const user = auth.user;
    const isCashier = user.role === 'cashier';

    // Initialize BOTH fields so TypeScript knows they exist
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className="flex flex-col h-full">
            <header className="mb-6">
                <h2 className="text-lg font-bold text-ink">Profile Information</h2>
                <p className="mt-1 text-sm text-ink-muted">
                    Update your account's profile information.
                </p>
            </header>

            <form onSubmit={submit} className="flex flex-col flex-1 space-y-5">
                <div>
                    <label htmlFor="name" className="field-label">Name</label>
                    <input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="field-input"
                        required
                        autoFocus
                        autoComplete="name"
                    />
                    {errors.name && <p className="field-error">{errors.name}</p>}
                </div>

                {/* Conditionally render Username for Cashier OR Email for Admin */}
                {isCashier ? (
                    <div>
                        <label htmlFor="username" className="field-label">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            className="field-input"
                            required
                            autoComplete="username"
                        />
                        {errors.username && <p className="field-error">{errors.username}</p>}
                    </div>
                ) : (
                    <div>
                        <label htmlFor="email" className="field-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="field-input"
                            required
                            autoComplete="username"
                        />
                        {errors.email && <p className="field-error">{errors.email}</p>}
                    </div>
                )}

                {mustVerifyEmail && user.email_verified_at === null && !isCashier && (
                    <div className="rounded-control border border-warning-600/20 bg-warning-50 p-4">
                        <p className="text-sm text-warning-700">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 font-semibold underline hover:text-warning-800 focus:outline-none"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-success-700">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-6 mt-auto">
                    <button type="submit" disabled={processing} className="btn-primary w-full">
                        {processing ? 'Saving...' : 'Save Changes'}
                    </button>
                    {recentlySuccessful && <p className="text-sm text-success-700 font-medium">Saved.</p>}
                </div>
            </form>
        </section>
    );
}