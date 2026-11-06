<?php

namespace App\Services;

use App\Models\BackupRecord;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Best-effort Google Drive upload for a scheduled backup.
 *
 * This class NEVER throws. Every failure path is caught and recorded on the
 * BackupRecord via the underlying GoogleDriveUploadService, and audit-logged.
 * That property is what makes it safe for the scheduled command to call
 * without risking a non-zero exit code — the local backup remains the
 * primary artifact; Drive is the offsite copy.
 */
class ScheduledBackupDriveUploader
{
    public function __construct(
        private readonly GoogleDriveUploadService $uploader,
        private readonly AuditLogger $audit,
    ) {
    }

    public function attempt(BackupRecord $backup): void
    {
        if ($backup->status !== 'completed') {
            return;
        }

        try {
            $backup->forceFill(['drive_status' => 'pending'])->save();

            $result = $this->uploader->upload($backup);

            if ($result->drive_status === 'uploaded') {
                $this->audit->record(
                    'backup.drive_uploaded',
                    'Scheduled database backup uploaded to Google Drive.',
                    $backup,
                    ['backup_id' => $backup->backup_id],
                );

                return;
            }

            $error = (string) ($result->drive_last_error ?? 'unknown error');

            $this->audit->record(
                'backup.drive_upload_failed',
                'Scheduled database backup Drive upload failed: ' . $error,
                $backup,
                ['backup_id' => $backup->backup_id],
            );
        } catch (Throwable $e) {
            report($e);

            Log::warning('Scheduled backup Drive upload threw', [
                'backup_id' => $backup->backup_id,
                'error' => $e->getMessage(),
            ]);

            $this->audit->record(
                'backup.drive_upload_failed',
                'Scheduled database backup Drive upload threw: ' . $e->getMessage(),
                $backup,
                ['backup_id' => $backup->backup_id],
            );
        }
    }
}