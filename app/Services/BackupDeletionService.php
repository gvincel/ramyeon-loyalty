<?php

namespace App\Services;

use App\Models\BackupRecord;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class BackupDeletionService
{
    public function __construct(
        private readonly GoogleDriveUploadService $driveService,
    ) {
    }

    /**
     * Safely delete a backup record, its local file, and its Google Drive copy.
     * 
     * @throws RuntimeException if attempting to delete the last remaining completed backup.
     */
    public function delete(BackupRecord $record): void
    {
        // 1. Safety Check: Never delete the last known-good backup
        if ($record->status === 'completed') {
            $completedCount = BackupRecord::query()->where('status', 'completed')->count();
            
            if ($completedCount <= 1) {
                throw new RuntimeException(
                    'Cannot delete the last remaining completed backup. The system requires at least one recovery point.'
                );
            }
        }

        // 2. Delete from Google Drive
        if (filled($record->drive_file_id)) {
            $this->driveService->deleteFile($record->drive_file_id);
        }

        // 3. Delete local file (catch errors in case the file is missing but DB record exists)
        try {
            if (filled($record->path)) {
                Storage::disk($record->disk)->delete($record->path);
            }
        } catch (Throwable $e) {
            // Log the local file error, but proceed to delete the DB record
            report($e);
        }

        // 4. Audit Log
        app(AuditLogger::class)->record(
            'backup.deleted',
            'Database backup record and file deleted.',
            $record,
            [
                'backup_id' => $record->backup_id,
                'file_size_bytes' => $record->file_size_bytes,
            ]
        );

        // 5. Delete the database record
        $record->delete();
    }
}