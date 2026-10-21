import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import FlashMessage from '@/Components/FlashMessage';
import { PageProps } from '@/types';

export default function Backups() {
    const { flash } = usePage<PageProps>().props;

    return (
        <AdminLayout>
            <Head title="Backup & Recovery" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content">
                    <AdminPageHeader
                        eyebrow="System Maintenance"
                        title="Backup & Recovery"
                        description="Create a database backup and review the precautions for safely restoring your system."
                    />

                    <FlashMessage success={flash.success} error={flash.error} />

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        {/* Create backup */}
                        <section
                            aria-labelledby="create-backup-heading"
                            className="panel border-t-2 border-t-brand"
                        >
                            <div className="p-6">
                                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                                    <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                                        database
                                    </span>
                                </div>

                                <h2
                                    id="create-backup-heading"
                                    className="text-heading font-semibold tracking-tight text-ink"
                                >
                                    Create database backup
                                </h2>

                                <p className="mt-2 text-small leading-6 text-ink-muted">
                                    Generate and download an SQL copy of the current database. Store the
                                    downloaded file in a secure location accessible only to authorized
                                    personnel.
                                </p>

                                <form
                                    method="POST"
                                    action={route('admin.backups.store')}
                                    className="mt-6"
                                    onSubmit={(event) => {
                                        const token = document.querySelector<HTMLMetaElement>(
                                            'meta[name="csrf-token"]',
                                        )?.content;

                                        if (!token) {
                                            event.preventDefault();
                                            window.alert(
                                                'Unable to verify your session. Please refresh the page and try again.',
                                            );
                                            return;
                                        }

                                        const existingToken = event.currentTarget.querySelector<HTMLInputElement>(
                                            'input[name="_token"]',
                                        );

                                        if (existingToken) {
                                            existingToken.value = token;
                                        } else {
                                            const input = document.createElement('input');
                                            input.type = 'hidden';
                                            input.name = '_token';
                                            input.value = token;
                                            event.currentTarget.appendChild(input);
                                        }
                                    }}
                                >
                                    <button type="submit" className="btn-primary w-full sm:w-auto">
                                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                                            download
                                        </span>
                                        Create database backup
                                    </button>
                                </form>

                                <div className="mt-6 rounded-control border border-warning-600/20 bg-warning-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined mt-0.5 text-warning-700" aria-hidden="true">
                                            warning
                                        </span>

                                        <div>
                                            <h3 className="text-small font-semibold text-warning-700">
                                                Protect your backup
                                            </h3>
                                            <p className="mt-1 text-small leading-6 text-warning-700/90">
                                                Database backups may contain customer information and other
                                                sensitive records. Do not share them publicly or store them in a
                                                publicly accessible folder.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Recovery guidance */}
                        <section
                            aria-labelledby="recovery-heading"
                            className="panel"
                        >
                            <div className="p-6">
                                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-control bg-surface-muted text-ink-muted">
                                    <span className="material-symbols-outlined text-2xl" aria-hidden="true">
                                        settings_backup_restore
                                    </span>
                                </div>

                                <h2
                                    id="recovery-heading"
                                    className="text-heading font-semibold tracking-tight text-ink"
                                >
                                    Recovery guidance
                                </h2>

                                <p className="mt-2 text-small leading-6 text-ink-muted">
                                    Database restoration is currently a manual administrator task. This
                                    page does not restore backups automatically.
                                </p>

                                <ol className="mt-5 space-y-4">
                                    <li className="flex gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-small font-semibold text-ink-muted">
                                            1
                                        </span>
                                        <div>
                                            <h3 className="text-small font-semibold text-ink">
                                                Locate a valid backup
                                            </h3>
                                            <p className="mt-1 text-small leading-6 text-ink-muted">
                                                Find the intended SQL file and verify that it came from a
                                                trusted source.
                                            </p>
                                        </div>
                                    </li>

                                    <li className="flex gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-small font-semibold text-ink-muted">
                                            2
                                        </span>
                                        <div>
                                            <h3 className="text-small font-semibold text-ink">
                                                Test on a separate database
                                            </h3>
                                            <p className="mt-1 text-small leading-6 text-ink-muted">
                                                Restore the file into a separate test database first and
                                                verify that the application data is usable.
                                            </p>
                                        </div>
                                    </li>

                                    <li className="flex gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-small font-semibold text-ink-muted">
                                            3
                                        </span>
                                        <div>
                                            <h3 className="text-small font-semibold text-ink">
                                                Plan and perform recovery
                                            </h3>
                                            <p className="mt-1 text-small leading-6 text-ink-muted">
                                                Follow your authorized database recovery procedure and verify
                                                the application after restoration.
                                            </p>
                                        </div>
                                    </li>
                                </ol>

                                <div className="mt-6 rounded-control border border-danger-600/20 bg-danger-50 p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined mt-0.5 text-danger-700" aria-hidden="true">
                                            error
                                        </span>

                                        <div>
                                            <h3 className="text-small font-semibold text-danger-700">
                                                Before restoring a backup
                                            </h3>
                                            <p className="mt-1 text-small leading-6 text-danger-700/90">
                                                Restoring an older backup can overwrite current records and
                                                remove newer data. Confirm the target database and protect a
                                                copy of the current data before proceeding.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}