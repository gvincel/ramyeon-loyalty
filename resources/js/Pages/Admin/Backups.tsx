import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import AdminModal from '@/Components/AdminModal';
import AdminPageHeader from '@/Components/AdminPageHeader';
import FlashMessage from '@/Components/FlashMessage';
import StatCard from '@/Components/StatCard';
import { PageProps } from '@/types';

type BackupRecord = {
    backup_id: string;
    type: string;
    status: string;
    disk: string;
    path: string;
    file_size_bytes: number | null;
    sha256: string | null;
    encrypted: boolean;
    verified_at: string | null;
    created_by: number | null;
    started_at: string | null;
    completed_at: string | null;
    expires_at: string | null;
    failure_code: string | null;
    failure_message: string | null;
    drive_status: string;
    drive_file_id: string | null;
    drive_uploaded_at: string | null;
    drive_upload_attempts: number;
    drive_last_error: string | null;
    created_at: string;
    creator: {
        id: number;
        name: string;
    } | null;
};

type DriveState = {
    configured: boolean;
    connected: boolean;
    account_email: string | null;
};

function formatDate(value: string | null): string {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

function formatFileSize(bytes: number | null): string {
    if (bytes === null || !Number.isFinite(bytes) || bytes < 0) {
        return '—';
    }

    if (bytes < 1024) return `${bytes} B`;

    const units = ['KB', 'MB', 'GB', 'TB'];
    let size = bytes / 1024;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function statusClasses(status: string): string {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'bg-success-50 text-success-700';
        case 'failed':
            return 'bg-danger-50 text-danger-700';
        case 'pending':
            return 'bg-warning-50 text-warning-700';
        default:
            return 'bg-surface-muted text-ink-muted';
    }
}

function driveStatusClasses(status: string): string {
    switch (status.toLowerCase()) {
        case 'uploaded':
            return 'bg-success-50 text-success-700';
        case 'failed':
            return 'bg-danger-50 text-danger-700';
        case 'pending':
            return 'bg-warning-50 text-warning-700';
        default:
            return 'bg-surface-muted text-ink-muted';
    }
}

function driveStatusLabel(status: string): string {
    switch (status.toLowerCase()) {
        case 'uploaded':
            return 'Uploaded to Drive';
        case 'failed':
            return 'Drive upload failed';
        case 'pending':
            return 'Uploading to Drive';
        default:
            return 'Not uploaded';
    }
}

function driveStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
        case 'uploaded':
            return 'cloud_done';
        case 'failed':
            return 'cloud_off';
        case 'pending':
            return 'cloud_upload';
        default:
            return 'cloud';
    }
}

function DriveStatusBadge({
    status,
    error,
}: {
    status: string;
    error?: string | null;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${driveStatusClasses(status)}`}
            title={status === 'failed' && error ? error : driveStatusLabel(status)}
        >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
                {driveStatusIcon(status)}
            </span>
            {driveStatusLabel(status)}
        </span>
    );
}


function BackupStatus({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses(status)}`}
        >
            {status}
        </span>
    );
}

function VerificationStatus({ verifiedAt }: { verifiedAt: string | null }) {
    if (verifiedAt) {
        return (
            <div className="inline-flex items-center gap-2 rounded-control border border-success-600/20 bg-success-50 px-3 py-2">
                <span
                    className="material-symbols-outlined text-xl text-success-700"
                    aria-hidden="true"
                >
                    verified
                </span>

                <div>
                    <p className="text-xs font-bold text-success-700">
                        Verified
                    </p>
                    <p className="mt-0.5 text-xs text-success-700">
                        {formatDate(verifiedAt)}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-control border border-warning-600/20 bg-warning-50 px-3 py-2 text-xs font-semibold text-warning-700">
            <span
                className="material-symbols-outlined text-base"
                aria-hidden="true"
            >
                schedule
            </span>
            Not verified
        </span>
    );
}

function SectionHeading({
    id,
    eyebrow,
    title,
    description,
}: {
    id?: string;
    eyebrow?: string;
    title: string;
    description?: string;
}) {
    return (
        <div>
            {eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                    {eyebrow}
                </p>
            )}

            <h2
                id={id}
                className="mt-1 text-heading font-semibold tracking-tight text-ink"
            >
                {title}
            </h2>

            {description && (
                <p className="mt-1 text-small leading-6 text-ink-muted">
                    {description}
                </p>
            )}
        </div>
    );
}

export default function Backups() {
    const { flash, backups = [], restoreTargetDatabase, drive } =
        usePage<
            PageProps<{
                backups: BackupRecord[];
                restoreTargetDatabase: string | null;
                drive: DriveState;
            }>
        >().props;

    const [verifyingBackupId, setVerifyingBackupId] =
        useState<string | null>(null);

    const [restoreTarget, setRestoreTarget] =
        useState<BackupRecord | null>(null);

    const [restoringBackupId, setRestoringBackupId] =
        useState<string | null>(null);

    const completedBackups = backups.filter(
        (backup) => backup.status.toLowerCase() === 'completed',
    );

    const failedBackups = backups.filter(
        (backup) => backup.status.toLowerCase() === 'failed',
    );

    const protectedBackups = backups.filter(
        (backup) =>
            backup.status.toLowerCase() === 'completed' &&
            backup.encrypted &&
            backup.verified_at !== null,
    );

    const destroyBackup = (backupId: string) => {
        if (
            window.confirm(
                'Are you sure you want to delete this backup? This will permanently remove the file from the server and Google Drive.',
            )
        ) {
            router.delete(route('admin.backups.destroy', backupId), {
                preserveScroll: true,
            });
        }
    };

    const verifyBackup = (backupId: string) => {
        setVerifyingBackupId(backupId);

        router.post(
            route('admin.backups.verify', backupId),
            {},
            {
                preserveScroll: true,
                onFinish: () => setVerifyingBackupId(null),
            },
        );
    };

    const confirmRestore = () => {
        if (!restoreTarget || restoringBackupId !== null) return;

        const backupId = restoreTarget.backup_id;

        setRestoringBackupId(backupId);

        router.post(
            route('admin.backups.restore', backupId),
            { confirm_restore: true },
            {
                preserveScroll: true,
                onSuccess: () => setRestoreTarget(null),
                onFinish: () => setRestoringBackupId(null),
            },
        );
    };

    const canRestore = (backup: BackupRecord) =>
        backup.status.toLowerCase() === 'completed' &&
        backup.encrypted &&
        backup.verified_at !== null;

    const restoreDisabledReason = (backup: BackupRecord) => {
        if (!backup.encrypted) {
            return 'Only encrypted backups can be restored.';
        }

        if (!backup.verified_at) {
            return 'Verify backup integrity before restoring.';
        }

        return 'Restore to the isolated verification database.';
    };

    return (
        <AdminLayout>
            <Head title="Backup & Recovery" />

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-content space-y-6">
                    <AdminPageHeader
                        eyebrow="System Maintenance"
                        title="Backup & Recovery"
                        description="Manage database backups, check their integrity, and safely test database restoration."
                    />

                    <FlashMessage
                        success={flash.success}
                        error={flash.error}
                    />

                    {/* Backup summary */}
                    <section aria-label="Backup summary">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                label="Recorded backups"
                                value={String(backups.length)}
                                icon={
                                    <span
                                        className="material-symbols-outlined text-2xl"
                                        aria-hidden="true"
                                    >
                                        database
                                    </span>
                                }
                                footer="Recent backup records"
                                tone="brand"
                            />

                            <StatCard
                                label="Completed"
                                value={String(completedBackups.length)}
                                icon={
                                    <span
                                        className="material-symbols-outlined text-2xl"
                                        aria-hidden="true"
                                    >
                                        task_alt
                                    </span>
                                }
                                footer="Successfully completed backups"
                                tone="accent"
                            />

                            <StatCard
                                label="Failed"
                                value={String(failedBackups.length)}
                                icon={
                                    <span
                                        className="material-symbols-outlined text-2xl"
                                        aria-hidden="true"
                                    >
                                        error
                                    </span>
                                }
                                footer="Recorded failed attempts"
                                tone="brand"
                            />

                            <StatCard
                                label="Protected"
                                value={String(protectedBackups.length)}
                                icon={
                                    <span
                                        className="material-symbols-outlined text-2xl"
                                        aria-hidden="true"
                                    >
                                        verified_user
                                    </span>
                                }
                                footer="Encrypted and integrity-verified"
                                tone="accent"
                            />
                        </div>
                    </section>

                                        {/* Google Drive offsite backup */}
                    <section
                        aria-labelledby="drive-heading"
                        className="panel"
                    >
                        <div className="p-5 sm:p-6">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                                        <span
                                            className="material-symbols-outlined text-2xl"
                                            aria-hidden="true"
                                        >
                                            cloud_upload
                                        </span>
                                    </div>

                                    <div>
                                        <h2
                                            id="drive-heading"
                                            className="text-heading font-semibold tracking-tight text-ink"
                                        >
                                            Google Drive offsite backup
                                        </h2>

                                        <p className="mt-1 max-w-xl text-small leading-6 text-ink-muted">
                                            Scheduled backups are automatically
                                            uploaded to a dedicated Google Drive
                                            account after they are created
                                            locally.
                                        </p>
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    {!drive.configured && (
                                        <span className="inline-flex items-center gap-2 rounded-full bg-warning-50 px-3 py-1.5 text-xs font-semibold text-warning-700">
                                            <span
                                                className="material-symbols-outlined text-base"
                                                aria-hidden="true"
                                            >
                                                warning
                                            </span>
                                            Not configured
                                        </span>
                                    )}
                                    {drive.configured && !drive.connected && (
                                        <span className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold text-ink-muted">
                                            <span
                                                className="material-symbols-outlined text-base"
                                                aria-hidden="true"
                                            >
                                                cloud_off
                                            </span>
                                            Not connected
                                        </span>
                                    )}
                                    {drive.configured && drive.connected && (
                                        <span className="inline-flex items-center gap-2 rounded-full bg-success-50 px-3 py-1.5 text-xs font-semibold text-success-700">
                                            <span
                                                className="material-symbols-outlined text-base"
                                                aria-hidden="true"
                                            >
                                                cloud_done
                                            </span>
                                            Connected
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6">
                                {!drive.configured && (
                                    <div className="rounded-control border border-warning-600/20 bg-warning-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <span
                                                className="material-symbols-outlined mt-0.5 text-xl text-warning-700"
                                                aria-hidden="true"
                                            >
                                                info
                                            </span>
                                            <div>
                                                <p className="text-small font-semibold text-warning-700">
                                                    Google Drive is not configured
                                                </p>
                                                <p className="mt-1 text-small leading-6 text-warning-700/90">
                                                    Add the Google Drive client
                                                    credentials to the
                                                    environment configuration,
                                                    then reload this page.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {drive.configured && !drive.connected && (
                                    <div className="flex flex-col gap-4 rounded-control border border-line bg-surface-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-small font-semibold text-ink">
                                                Not connected
                                            </p>
                                            <p className="mt-1 text-small leading-6 text-ink-muted">
                                                Sign in with the dedicated
                                                backup Google account to
                                                authorize offsite uploads.
                                            </p>
                                        </div>

                                        <a
                                            href={route(
                                                'admin.backups.google-drive.authorize',
                                            )}
                                            className="btn-primary inline-flex min-h-11 shrink-0 items-center justify-center gap-2"
                                        >
                                            <span
                                                className="material-symbols-outlined text-xl"
                                                aria-hidden="true"
                                            >
                                                link
                                            </span>
                                            Connect Google Drive
                                        </a>
                                    </div>
                                )}

                                {drive.configured && drive.connected && (
                                    <div className="flex flex-col gap-4 rounded-control border border-success-600/20 bg-success-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-3">
                                            <span
                                                className="material-symbols-outlined mt-0.5 text-xl text-success-700"
                                                aria-hidden="true"
                                            >
                                                check_circle
                                            </span>
                                            <div>
                                                <p className="text-small font-semibold text-success-700">
                                                    Connected
                                                </p>
                                                <p className="mt-1 break-all text-small leading-6 text-success-700/90">
                                                    Backups are uploading as{' '}
                                                    {drive.account_email ??
                                                        'an authorized Google account'}
                                                    .
                                                </p>
                                            </div>
                                        </div>

                                        <form
                                            method="POST"
                                            action={route(
                                                'admin.backups.google-drive.disconnect',
                                            )}
                                            className="shrink-0"
                                            onSubmit={(event) => {
                                                if (
                                                    !window.confirm(
                                                        'Disconnect Google Drive? Scheduled backups will stop uploading to Drive until you reconnect.',
                                                    )
                                                ) {
                                                    event.preventDefault();
                                                    return;
                                                }

                                                const token =
                                                    document.querySelector<HTMLMetaElement>(
                                                        'meta[name="csrf-token"]',
                                                    )?.content;

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
                                                    existingToken.value =
                                                        token;
                                                } else {
                                                    const input =
                                                        document.createElement(
                                                            'input',
                                                        );
                                                    input.type = 'hidden';
                                                    input.name = '_token';
                                                    input.value = token;
                                                    event.currentTarget.appendChild(
                                                        input,
                                                    );
                                                }
                                            }}
                                        >
                                            <input
                                                type="hidden"
                                                name="_method"
                                                value="DELETE"
                                            />
                                            <button
                                                type="submit"
                                                className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2 text-danger-700"
                                            >
                                                <span
                                                    className="material-symbols-outlined text-xl"
                                                    aria-hidden="true"
                                                >
                                                    link_off
                                                </span>
                                                Disconnect
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Backup creation and recovery information */}
                    <div className="grid gap-6 xl:grid-cols-5">
                        <section
                            aria-labelledby="create-backup-heading"
                            className="panel border-t-2 border-t-brand xl:col-span-3"
                        >
                            <div className="p-5 sm:p-6">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                                            <span
                                                className="material-symbols-outlined text-2xl"
                                                aria-hidden="true"
                                            >
                                                database
                                            </span>
                                        </div>

                                        <div>
                                            <h2
                                                id="create-backup-heading"
                                                className="text-heading font-semibold tracking-tight text-ink"
                                            >
                                                Create database backup
                                            </h2>

                                            <p className="mt-1 max-w-xl text-small leading-6 text-ink-muted">
                                                Generate an encrypted database backup and
                                                download a copy for secure storage.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 rounded-control border border-line bg-surface-muted/50 p-4">
                                    <div className="flex items-start gap-3">
                                        <span
                                            className="material-symbols-outlined mt-0.5 text-xl text-ink-muted"
                                            aria-hidden="true"
                                        >
                                            shield
                                        </span>

                                        <div>
                                            <p className="text-small font-semibold text-ink">
                                                Backup protection
                                            </p>

                                            <p className="mt-1 text-small leading-6 text-ink-muted">
                                                Backup files contain sensitive customer and
                                                business records. Keep downloaded copies in
                                                private, access-controlled storage.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <form
                                    method="POST"
                                    action={route('admin.backups.store')}
                                    className="mt-6"
                                    onSubmit={(event) => {
                                        const token =
                                            document.querySelector<HTMLMetaElement>(
                                                'meta[name="csrf-token"]',
                                            )?.content;

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
                                            const input =
                                                document.createElement('input');

                                            input.type = 'hidden';
                                            input.name = '_token';
                                            input.value = token;

                                            event.currentTarget.appendChild(input);
                                        }
                                    }}
                                >
                                    <button
                                        type="submit"
                                        className="btn-primary w-full sm:w-auto"
                                    >
                                        <span
                                            className="material-symbols-outlined text-[20px]"
                                            aria-hidden="true"
                                        >
                                            download
                                        </span>
                                        Create and download backup
                                    </button>
                                </form>
                            </div>
                        </section>

                        <section
                            aria-labelledby="recovery-overview-heading"
                            className="panel xl:col-span-2"
                        >
                            <div className="p-5 sm:p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-surface-muted text-ink-muted">
                                        <span
                                            className="material-symbols-outlined text-2xl"
                                            aria-hidden="true"
                                        >
                                            settings_backup_restore
                                        </span>
                                    </div>

                                    <div>
                                        <h2
                                            id="recovery-overview-heading"
                                            className="text-heading font-semibold tracking-tight text-ink"
                                        >
                                            Recovery status
                                        </h2>

                                        <p className="mt-1 text-small leading-6 text-ink-muted">
                                            Restoration is available for encrypted backups
                                            that have passed integrity verification.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-3">
                                    <div className="flex items-center justify-between gap-3 rounded-control border border-line p-3">
                                        <span className="text-small text-ink-muted">
                                            Eligible backups
                                        </span>

                                        <span className="font-semibold tabular-nums text-ink">
                                            {backups.filter(canRestore).length}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 rounded-control border border-line p-3">
                                        <span className="text-small text-ink-muted">
                                            Verification required
                                        </span>

                                        <span className="font-semibold tabular-nums text-ink">
                                            {
                                                completedBackups.filter(
                                                    (backup) =>
                                                        backup.encrypted &&
                                                        !backup.verified_at,
                                                ).length
                                            }
                                        </span>
                                    </div>
                                </div>

                                <p className="mt-4 text-xs leading-5 text-ink-muted">
                                    Restoration currently targets the isolated verification
                                    database, not the live customer database.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Backup history */}
                    <section
                        aria-labelledby="backup-history-heading"
                        className="panel"
                    >
                        <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                            <SectionHeading
                                id="backup-history-heading"
                                eyebrow="Records"
                                title="Backup history"
                                description="Review backup status, protection, and available actions."
                            />

                            <span className="inline-flex w-fit items-center rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold text-ink-muted">
                                {backups.length} of 20 records
                            </span>
                        </div>

                        {backups.length === 0 ? (
                            <div className="px-5 py-14 text-center sm:px-6">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
                                    <span
                                        className="material-symbols-outlined text-3xl"
                                        aria-hidden="true"
                                    >
                                        inventory_2
                                    </span>
                                </div>

                                <h3 className="mt-4 font-semibold text-ink">
                                    No backup history yet
                                </h3>

                                <p className="mt-1 text-small text-ink-muted">
                                    Your recorded backup attempts will appear here.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[1000px] table-fixed text-left text-small">
                                        <colgroup>
                                            <col className="w-[26%]" />
                                            <col className="w-[12%]" />
                                            <col className="w-[9%]" />
                                            <col className="w-[25%]" />
                                            <col className="w-[13%]" />
                                            <col className="w-[15%]" />
                                        </colgroup>

                                        <thead className="bg-surface-muted/60 text-ink-muted">
                                            <tr>
                                                <th scope="col" className="px-5 py-4 font-semibold">
                                                    Backup details
                                                </th>
                                                <th scope="col" className="px-4 py-4 font-semibold">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-4 py-4 font-semibold">
                                                    Size
                                                </th>
                                                <th scope="col" className="px-4 py-4 font-semibold">
                                                    Security & integrity
                                                </th>
                                                <th scope="col" className="px-4 py-4 font-semibold">
                                                    Created by
                                                </th>
                                                <th scope="col" className="px-5 py-4 text-right font-semibold">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-line">
                                            {backups.map((backup) => (
                                                <tr
                                                    key={backup.backup_id}
                                                    className="align-middle transition-colors hover:bg-surface-muted/30"
                                                >
                                                    <td className="break-words px-5 py-4">
                                                        <p className="font-semibold capitalize text-ink">
                                                            {backup.type} backup
                                                        </p>

                                                        <p className="mt-1 text-xs text-ink-muted">
                                                            Created {formatDate(backup.created_at)}
                                                        </p>

                                                        {backup.completed_at && (
                                                            <p className="mt-1 text-xs text-ink-muted">
                                                                Completed {formatDate(backup.completed_at)}
                                                            </p>
                                                        )}

                                                        {backup.started_at && !backup.completed_at && (
                                                            <p className="mt-1 text-xs text-ink-muted">
                                                                Started {formatDate(backup.started_at)}
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <BackupStatus status={backup.status} />

                                                        {backup.failure_message && (
                                                            <p className="mt-2 break-words text-xs leading-5 text-danger-700">
                                                                {backup.failure_message}
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="whitespace-nowrap px-4 py-4 font-medium tabular-nums text-ink">
                                                        {formatFileSize(backup.file_size_bytes)}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className={`material-symbols-outlined text-lg ${
                                                                        backup.encrypted
                                                                            ? 'text-success-700'
                                                                            : 'text-warning-700'
                                                                    }`}
                                                                    aria-hidden="true"
                                                                >
                                                                    {backup.encrypted
                                                                        ? 'lock'
                                                                        : 'lock_open'}
                                                                </span>

                                                                <span className="text-xs font-semibold text-ink">
                                                                    {backup.encrypted
                                                                        ? 'Encrypted'
                                                                        : 'Not encrypted'}
                                                                </span>
                                                            </div>

                                                            <VerificationStatus
                                                                verifiedAt={backup.verified_at}
                                                            />

                                                            <p className="text-xs text-ink-muted">
                                                                {backup.sha256
                                                                    ? 'SHA-256 checksum recorded'
                                                                    : 'SHA-256 unavailable'}
                                                            </p>

                                                            <div>
                                                                <DriveStatusBadge
                                                                    status={
                                                                        backup.drive_status
                                                                    }
                                                                    error={
                                                                        backup.drive_last_error
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="break-words px-4 py-4 text-ink">
                                                        {backup.creator?.name ?? 'System / unavailable'}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {backup.status.toLowerCase() === 'completed' ? (
                                                            <div className="ml-auto flex min-w-[140px] flex-col items-stretch gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        verifyBackup(backup.backup_id)
                                                                    }
                                                                    disabled={
                                                                        verifyingBackupId !== null ||
                                                                        restoringBackupId !== null
                                                                    }
                                                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-line px-3 py-2 text-xs font-semibold text-ink transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                                                                >
                                                                    <span
                                                                        className="material-symbols-outlined text-base"
                                                                        aria-hidden="true"
                                                                    >
                                                                        verified
                                                                    </span>

                                                                    {verifyingBackupId === backup.backup_id
                                                                        ? 'Verifying…'
                                                                        : 'Verify integrity'}
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => setRestoreTarget(backup)}
                                                                    disabled={
                                                                        verifyingBackupId !== null ||
                                                                        restoringBackupId !== null ||
                                                                        !canRestore(backup)
                                                                    }
                                                                    title={restoreDisabledReason(backup)}
                                                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-danger-600/30 px-3 py-2 text-xs font-semibold text-danger-700 transition hover:bg-danger-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    <span
                                                                        className="material-symbols-outlined text-base"
                                                                        aria-hidden="true"
                                                                    >
                                                                        settings_backup_restore
                                                                    </span>
                                                                    Restore
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => destroyBackup(backup.backup_id)}
                                                                    disabled={
                                                                        verifyingBackupId !== null ||
                                                                        restoringBackupId !== null
                                                                    }
                                                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-danger-600/30 px-3 py-2 text-xs font-semibold text-danger-700 transition hover:bg-danger-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    <span
                                                                        className="material-symbols-outlined text-base"
                                                                        aria-hidden="true"
                                                                    >
                                                                        delete
                                                                    </span>
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-ink-muted">
                                                                No actions available
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile backup cards */}
                                <div className="divide-y divide-line md:hidden">
                                    {backups.map((backup) => (
                                        <article
                                            key={backup.backup_id}
                                            className="space-y-4 p-5"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-semibold capitalize text-ink">
                                                        {backup.type} backup
                                                    </p>

                                                    <p className="mt-1 text-xs text-ink-muted">
                                                        {formatDate(backup.created_at)}
                                                    </p>
                                                </div>

                                                <BackupStatus status={backup.status} />
                                            </div>

                                            <dl className="grid grid-cols-2 gap-x-5 gap-y-4 border-t border-line pt-4 text-small">
                                                <div>
                                                    <dt className="text-xs text-ink-muted">
                                                        File size
                                                    </dt>
                                                    <dd className="mt-1 font-medium text-ink">
                                                        {formatFileSize(
                                                            backup.file_size_bytes,
                                                        )}
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-xs text-ink-muted">
                                                        Encryption
                                                    </dt>
                                                    <dd className="mt-1 font-medium text-ink">
                                                        {backup.encrypted
                                                            ? 'Encrypted'
                                                            : 'Not encrypted'}
                                                    </dd>
                                                </div>

                                                <div className="col-span-2">
                                                    <dt className="mb-2 text-xs font-semibold text-ink-muted">
                                                        Integrity verification
                                                    </dt>
                                                    <dd>
                                                        <VerificationStatus verifiedAt={backup.verified_at} />
                                                    </dd>
                                                </div>

                                                <div>
                                                    <dt className="text-xs text-ink-muted">
                                                        Integrity checksum
                                                    </dt>
                                                    <dd className="mt-1 text-ink">
                                                        {backup.sha256
                                                            ? 'SHA-256 recorded'
                                                            : 'Unavailable'}
                                                    </dd>
                                                </div>

                                                 <div className="col-span-2">
                                                    <dt className="text-xs text-ink-muted">
                                                        Google Drive
                                                    </dt>
                                                    <dd className="mt-1">
                                                        <DriveStatusBadge
                                                            status={
                                                                backup.drive_status
                                                            }
                                                            error={
                                                                backup.drive_last_error
                                                            }
                                                        />
                                                    </dd>
                                                </div>

                                                <div className="col-span-2">
                                                    <dt className="text-xs text-ink-muted">
                                                        Created by
                                                    </dt>
                                                    <dd className="mt-1 break-words text-ink">
                                                        {backup.creator?.name ??
                                                            'System / unavailable'}
                                                    </dd>
                                                </div>

                                                {backup.failure_message && (
                                                    <div className="col-span-2">
                                                        <dt className="text-xs text-ink-muted">
                                                            Failure details
                                                        </dt>
                                                        <dd className="mt-1 break-words text-danger-700">
                                                            {backup.failure_message}
                                                        </dd>
                                                    </div>
                                                )}
                                            </dl>

                                            {backup.status.toLowerCase() ===
                                                'completed' && (
                                                <div className="grid grid-cols-3 gap-2 border-t border-line pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            verifyBackup(
                                                                backup.backup_id,
                                                            )
                                                        }
                                                        disabled={
                                                            verifyingBackupId !== null ||
                                                            restoringBackupId !== null
                                                        }
                                                        className="inline-flex min-h-11 items-center justify-center gap-1 rounded-control border border-line px-2 py-2 text-xs font-semibold text-ink transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <span
                                                            className="material-symbols-outlined text-base"
                                                            aria-hidden="true"
                                                        >
                                                            verified
                                                        </span>

                                                        {verifyingBackupId ===
                                                        backup.backup_id
                                                            ? 'Verifying…'
                                                            : 'Verify'}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setRestoreTarget(backup)
                                                        }
                                                        disabled={
                                                            verifyingBackupId !== null ||
                                                            restoringBackupId !== null ||
                                                            !canRestore(backup)
                                                        }
                                                        title={restoreDisabledReason(
                                                            backup,
                                                        )}
                                                        className="inline-flex min-h-11 items-center justify-center gap-1 rounded-control border border-danger-600/30 px-2 py-2 text-xs font-semibold text-danger-700 transition hover:bg-danger-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <span
                                                            className="material-symbols-outlined text-base"
                                                            aria-hidden="true"
                                                        >
                                                            settings_backup_restore
                                                        </span>
                                                        Restore
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => destroyBackup(backup.backup_id)}
                                                        disabled={
                                                            verifyingBackupId !== null ||
                                                            restoringBackupId !== null
                                                        }
                                                        className="inline-flex min-h-11 items-center justify-center gap-1 rounded-control border border-danger-600/30 px-2 py-2 text-xs font-semibold text-danger-700 transition hover:bg-danger-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <span
                                                            className="material-symbols-outlined text-base"
                                                            aria-hidden="true"
                                                        >
                                                            delete
                                                        </span>
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}
                    </section>

                    {/* Recovery guidance */}
                    <section
                        aria-labelledby="recovery-guidance-heading"
                        className="panel"
                    >
                        <div className="p-5 sm:p-6">
                            <SectionHeading
                                id="recovery-guidance-heading"
                                eyebrow="Safety information"
                                title="Recovery guidance"
                                description="Important safeguards when testing database restoration."
                            />

                            <div className="mt-5 grid gap-4 md:grid-cols-3">
                                <div className="rounded-control border border-line p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                                        <span
                                            className="material-symbols-outlined text-xl"
                                            aria-hidden="true"
                                        >
                                            fact_check
                                        </span>
                                    </div>

                                    <h3 className="mt-3 text-small font-semibold text-ink">
                                        1. Verify the backup
                                    </h3>

                                    <p className="mt-2 text-small leading-6 text-ink-muted">
                                        Run integrity verification before restoring. Only
                                        encrypted and verified backups are eligible.
                                    </p>
                                </div>

                                <div className="rounded-control border border-line p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                                        <span
                                            className="material-symbols-outlined text-xl"
                                            aria-hidden="true"
                                        >
                                            database
                                        </span>
                                    </div>

                                    <h3 className="mt-3 text-small font-semibold text-ink">
                                        2. Confirm the target
                                    </h3>

                                    <p className="mt-2 text-small leading-6 text-ink-muted">
                                        Restoration currently targets the configured database:
                                        {restoreTargetDatabase ?? 'Not configured'}.
                                        The live database is protected by the server-side restore settings.
                                    </p>
                                </div>

                                <div className="rounded-control border border-line p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600">
                                        <span
                                            className="material-symbols-outlined text-xl"
                                            aria-hidden="true"
                                        >
                                            restore
                                        </span>
                                    </div>

                                    <h3 className="mt-3 text-small font-semibold text-ink">
                                        3. Protect existing data
                                    </h3>

                                    <p className="mt-2 text-small leading-6 text-ink-muted">
                                        The system creates and verifies a safety backup
                                        before restoration. If restoration fails, it
                                        attempts to recover the target database.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 rounded-control border border-danger-600/20 bg-danger-50 p-4">
                                <div className="flex items-start gap-3">
                                    <span
                                        className="material-symbols-outlined mt-0.5 text-xl text-danger-700"
                                        aria-hidden="true"
                                    >
                                        warning
                                    </span>

                                    <div>
                                        <h3 className="text-small font-semibold text-danger-700">
                                            Important restoration warning
                                        </h3>

                                        <p className="mt-1 text-small leading-6 text-danger-700/90">
                                            Restoring a backup replaces existing records in
                                            the selected target database. Automatic recovery
                                            is an additional safeguard, not a guarantee
                                            against every possible database or storage
                                            failure.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Restoration confirmation modal */}
            {restoreTarget && (
                <AdminModal
                    title="Restore database backup"
                    description="Review the backup and recovery target before continuing."
                    onClose={() => {
                        if (restoringBackupId === null) {
                            setRestoreTarget(null);
                        }
                    }}
                    maxWidthClass="max-w-2xl"
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setRestoreTarget(null)}
                                disabled={restoringBackupId !== null}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmRestore}
                                disabled={restoringBackupId !== null}
                                className="btn-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span
                                    className="material-symbols-outlined text-xl"
                                    aria-hidden="true"
                                >
                                    settings_backup_restore
                                </span>
                                {restoringBackupId === restoreTarget.backup_id
                                    ? 'Restoring…'
                                    : 'Confirm restoration'}
                            </button>
                        </>
                    }
                >
                    <div className="space-y-5 p-5 sm:p-6">

                        {/* Warning */}
                        <div className="rounded-card border border-danger-600/20 bg-danger-50 p-4 sm:p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-white text-danger-700">
                                    <span
                                        className="material-symbols-outlined text-2xl"
                                        aria-hidden="true"
                                    >
                                        warning
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-danger-700">
                                        This action replaces existing database records
                                    </h3>

                                    <p className="mt-1 text-small leading-6 text-danger-700/90">
                                        The selected backup will replace the contents of
                                        the target verification database. Review all
                                        information before proceeding.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Restore target */}
                        <section>
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="text-small font-semibold text-ink">
                                    Restoration destination
                                </h3>

                                <span className="rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700">
                                    Isolated database
                                </span>
                            </div>

                            <div className="rounded-card border border-line bg-surface-muted/50 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-surface text-brand-600 shadow-card">
                                        <span
                                            className="material-symbols-outlined text-2xl"
                                            aria-hidden="true"
                                        >
                                            database
                                        </span>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-ink-muted">
                                            Target database
                                        </p>

                                        <p className="mt-1 break-all font-semibold text-ink">
                                            {restoreTargetDatabase ?? 'Not configured'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-start gap-2 border-t border-line pt-3">
                                    <span
                                        className="material-symbols-outlined text-lg text-success-700"
                                        aria-hidden="true"
                                    >
                                        shield
                                    </span>

                                    <p className="text-xs leading-5 text-ink-muted">
                                        The live customer database,
                                        <strong className="text-ink"> ramyeon_loyalty</strong>,
                                        is not the restoration target.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Selected backup */}
                        <section>
                            <h3 className="mb-3 text-small font-semibold text-ink">
                                Selected backup
                            </h3>

                            <div className="rounded-card border border-line p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-semibold capitalize text-ink">
                                        {restoreTarget.type} backup
                                    </span>

                                    <BackupStatus status={restoreTarget.status} />
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-ink-muted">
                                            Created on
                                        </p>
                                        <p className="mt-1 text-small font-medium text-ink">
                                            {formatDate(restoreTarget.created_at)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-ink-muted">
                                            File size
                                        </p>
                                        <p className="mt-1 text-small font-medium text-ink">
                                            {formatFileSize(restoreTarget.file_size_bytes)}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-ink-muted">
                                            Encryption
                                        </p>
                                        <p className="mt-1 text-small font-medium text-ink">
                                            {restoreTarget.encrypted
                                                ? 'Encrypted'
                                                : 'Not encrypted'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-ink-muted">
                                            Backup ID
                                        </p>
                                        <p className="mt-1 break-all font-mono text-xs text-ink">
                                            {restoreTarget.backup_id}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 border-t border-line pt-4">
                                    <p className="mb-2 text-xs font-semibold text-ink-muted">
                                        Integrity verification
                                    </p>

                                    <VerificationStatus
                                        verifiedAt={restoreTarget.verified_at}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Recovery protection */}
                        <section className="rounded-card border border-line p-4">
                            <div className="flex items-center gap-2">
                                <span
                                    className="material-symbols-outlined text-xl text-brand-600"
                                    aria-hidden="true"
                                >
                                    enhanced_encryption
                                </span>

                                <h3 className="text-small font-semibold text-ink">
                                    Recovery safeguards
                                </h3>
                            </div>

                            <ul className="mt-3 space-y-3">
                                <li className="flex items-start gap-2">
                                    <span
                                        className="material-symbols-outlined text-lg text-success-700"
                                        aria-hidden="true"
                                    >
                                        check_circle
                                    </span>
                                    <span className="text-small leading-5 text-ink-muted">
                                        A safety backup of the target database will be
                                        created and verified before restoration.
                                    </span>
                                </li>

                                <li className="flex items-start gap-2">
                                    <span
                                        className="material-symbols-outlined text-lg text-success-700"
                                        aria-hidden="true"
                                    >
                                        check_circle
                                    </span>
                                    <span className="text-small leading-5 text-ink-muted">
                                        If restoration fails after changes begin, the
                                        system will attempt recovery using that safety backup.
                                    </span>
                                </li>
                            </ul>
                        </section>

                        {/* Final reminder */}
                        <p className="text-xs leading-5 text-ink-muted">
                            Automatic recovery is an additional safeguard, not a guarantee
                            against every possible database or storage failure.
                        </p>
                    </div>
                </AdminModal>
            )}
        </AdminLayout>
    );
}