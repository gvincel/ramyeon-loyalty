
import { Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import FlashMessage from '@/Components/FlashMessage';

export default function Backups() {
    const { flash } = usePage().props;

    return (
        <AdminLayout>
            <Head title="Backup & Recovery" />

            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    <AdminPageHeader
                        eyebrow="System Maintenance"
                        title="Backup & Recovery"
                        description="Create a database backup and review the precautions for safely restoring your system."
                    />

                    <FlashMessage
                        success={flash.success}
                        error={flash.error}
                    />

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        <section
                            aria-labelledby="create-backup-heading"
                            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                <span
                                    className="material-symbols-outlined text-2xl"
                                    aria-hidden="true"
                                >
                                    database
                                </span>
                            </div>

                            <h2
                                id="create-backup-heading"
                                className="text-lg font-bold text-gray-950"
                            >
                                Create Database Backup
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Generate and download an SQL copy of the current
                                database. Store the downloaded file in a secure
                                location accessible only to authorized personnel.
                            </p>

                            <form
                                method="POST"
                                action={route('admin.backups.store')}
                                className="mt-6"
                                onSubmit={(event) => {
                                    const token = document
                                        .querySelector<HTMLMetaElement>(
                                            'meta[name="csrf-token"]',
                                        )
                                        ?.content;

                                    if (!token) {
                                        event.preventDefault();
                                        window.alert(
                                            'Unable to verify your session. Please refresh the page and try again.',
                                        );
                                        return;
                                    }

                                    const existingToken =
                                        event.currentTarget.querySelector<HTMLInputElement>(
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
                                <button
                                    type="submit"
                                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 sm:w-auto"
                                >
                                    <span
                                        className="material-symbols-outlined text-xl"
                                        aria-hidden="true"
                                    >
                                        download
                                    </span>
                                    Create Database Backup
                                </button>
                            </form>

                            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <div className="flex items-start gap-3">
                                    <span
                                        className="material-symbols-outlined mt-0.5 text-amber-700"
                                        aria-hidden="true"
                                    >
                                        warning
                                    </span>

                                    <div>
                                        <h3 className="text-sm font-semibold text-amber-900">
                                            Protect your backup
                                        </h3>
                                        <p className="mt-1 text-sm leading-6 text-amber-800">
                                            Database backups may contain customer
                                            information and other sensitive records.
                                            Do not share them publicly or store them
                                            in a publicly accessible folder.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section
                            aria-labelledby="recovery-heading"
                            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                                <span
                                    className="material-symbols-outlined text-2xl"
                                    aria-hidden="true"
                                >
                                    settings_backup_restore
                                </span>
                            </div>

                            <h2
                                id="recovery-heading"
                                className="text-lg font-bold text-gray-950"
                            >
                                Recovery Guidance
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Database restoration is currently a manual
                                administrator task. This page does not restore
                                backups automatically.
                            </p>

                            <ol className="mt-5 space-y-4">
                                <li className="flex gap-3">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                                        1
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Locate a valid backup
                                        </h3>
                                        <p className="mt-1 text-sm leading-6 text-gray-600">
                                            Find the intended SQL file and verify
                                            that it came from a trusted source.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex gap-3">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                                        2
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Test on a separate database
                                        </h3>
                                        <p className="mt-1 text-sm leading-6 text-gray-600">
                                            Restore the file into a separate test
                                            database first and verify that the
                                            application data is usable.
                                        </p>
                                    </div>
                                </li>

                                <li className="flex gap-3">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                                        3
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Plan and perform recovery
                                        </h3>
                                        <p className="mt-1 text-sm leading-6 text-gray-600">
                                            Follow your authorized database
                                            recovery procedure and verify the
                                            application after restoration.
                                        </p>
                                    </div>
                                </li>
                            </ol>

                            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                                <div className="flex items-start gap-3">
                                    <span
                                        className="material-symbols-outlined mt-0.5 text-red-700"
                                        aria-hidden="true"
                                    >
                                        error
                                    </span>

                                    <div>
                                        <h3 className="text-sm font-semibold text-red-900">
                                            Before restoring a backup
                                        </h3>
                                        <p className="mt-1 text-sm leading-6 text-red-800">
                                            Restoring an older backup can overwrite
                                            current records and remove newer data.
                                            Confirm the target database and protect
                                            a copy of the current data before
                                            proceeding.
                                        </p>
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
