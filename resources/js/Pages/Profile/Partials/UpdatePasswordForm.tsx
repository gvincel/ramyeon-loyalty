import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function UpdatePasswordForm() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    // State to toggle password visibility
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowCurrent(false);
                setShowNew(false);
                setShowConfirm(false);
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    // Reusable Eye Icon
    const EyeIcon = ({ visible }: { visible: boolean }) => (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {visible ? (
                <>
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58a2 2 0 1 0 2.84 2.84" />
                    <path d="M9.88 4.24A10.9 10.9 0 0 1 12 4c5.52 0 9.5 8 9.5 8a18.2 18.2 0 0 1-3.04 4.04" />
                    <path d="M6.61 6.61A18.6 18.6 0 0 0 2.5 12S6.48 20 12 20c1.72 0 3.27-.66 4.64-1.48" />
                </>
            ) : (
                <>
                    <path d="M2.5 12S6.48 4 12 4s9.5 8 9.5 8-3.98 8-9.5 8-9.5-8-9.5-8Z" />
                    <circle cx="12" cy="12" r="2.75" />
                </>
            )}
        </svg>
    );

    return (
        <section className="flex flex-col h-full">
            <header className="mb-6">
                <h2 className="text-lg font-bold text-ink">Update Password</h2>
                <p className="mt-1 text-sm text-ink-muted">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="flex flex-col flex-1 space-y-5">
                <div>
                    <label htmlFor="current_password" className="field-label">Current Password</label>
                    <div className="relative">
                        <input
                            id="current_password"
                            ref={currentPasswordInput}
                            type={showCurrent ? 'text' : 'password'}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            className="field-input pr-11"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent((v) => !v)}
                            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-control text-ink-subtle transition-colors hover:text-ink"
                            aria-label={showCurrent ? "Hide current password" : "Show current password"}
                        >
                            <EyeIcon visible={showCurrent} />
                        </button>
                    </div>
                    {errors.current_password && <p className="field-error">{errors.current_password}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="field-label">New Password</label>
                    <div className="relative">
                        <input
                            id="password"
                            ref={passwordInput}
                            type={showNew ? 'text' : 'password'}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="field-input pr-11"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew((v) => !v)}
                            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-control text-ink-subtle transition-colors hover:text-ink"
                            aria-label={showNew ? "Hide new password" : "Show new password"}
                        >
                            <EyeIcon visible={showNew} />
                        </button>
                    </div>
                    {errors.password && <p className="field-error">{errors.password}</p>}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="field-label">Confirm New Password</label>
                    <div className="relative">
                        <input
                            id="password_confirmation"
                            type={showConfirm ? 'text' : 'password'}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="field-input pr-11"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-control text-ink-subtle transition-colors hover:text-ink"
                            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                        >
                            <EyeIcon visible={showConfirm} />
                        </button>
                    </div>
                    {errors.password_confirmation && <p className="field-error">{errors.password_confirmation}</p>}
                </div>

                <div className="flex items-center gap-4 pt-6 mt-auto">
                    <button type="submit" disabled={processing} className="btn-primary w-full">
                        {processing ? 'Saving...' : 'Update Password'}
                    </button>
                    {recentlySuccessful && <p className="text-sm text-success-700 font-medium">Saved.</p>}
                </div>
            </form>
        </section>
    );
}