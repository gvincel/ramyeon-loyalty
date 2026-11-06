<?php

namespace App\Services;

use App\Models\BackupRecord;
use Google\Service\Drive as GoogleDriveService;
use Google\Service\Drive\DriveFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class GoogleDriveUploadService
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_UPLOADED = 'uploaded';
    public const STATUS_FAILED = 'failed';
    public const STATUS_SKIPPED = 'skipped';

    public function __construct(
        private readonly GoogleDriveAuthService $auth,
    ) {
    }

    /**
     * Attempt to upload the given backup to Google Drive.
     *
     * Idempotent: if the backup is already marked uploaded, returns immediately.
     * Safe to retry: repeated calls after failure will increment the attempt
     * counter and try again without duplicating the Drive file.
     */
    public function upload(BackupRecord $record): BackupRecord
    {
        if ($record->drive_status === self::STATUS_UPLOADED && filled($record->drive_file_id)) {
            return $record;
        }

        if ($record->status !== 'completed' || ! filled($record->path)) {
            return $this->markFailed($record, 'Backup is not completed or has no file path.');
        }

        if (! $this->auth->isConfigured()) {
            return $this->markFailed($record, 'Google Drive client credentials are not configured.');
        }

        if (! $this->auth->isConnected()) {
            return $this->markFailed($record, 'Google Drive is not connected.');
        }

        try {
            $driveFileId = $this->performUpload($record);

            $record->forceFill([
                'drive_status' => self::STATUS_UPLOADED,
                'drive_file_id' => $driveFileId,
                'drive_uploaded_at' => now(),
                'drive_upload_attempts' => $record->drive_upload_attempts + 1,
                'drive_last_error' => null,
            ])->save();

            return $record;
        } catch (Throwable $e) {
            Log::error('Google Drive upload failed', [
                'backup_id' => $record->backup_id,
                'error' => $e->getMessage(),
            ]);

            return $this->markFailed($record, $e->getMessage());
        }
    }

    /**
     * Perform the actual Drive upload. Returns the Drive file ID.
     *
     * Isolated as a protected method so tests can override it without
     * making real network calls to Google.
     */
    protected function performUpload(BackupRecord $record): string
    {
        $service = new GoogleDriveService($this->auth->getClient());

        // Idempotent dedup: if a Drive file already exists with this backup_id
        // in its appProperties, reuse its ID instead of creating a duplicate.
        // Handles the edge case where we uploaded but crashed before saving.
        try {
            $existing = $service->files->listFiles([
                'q' => sprintf(
                    "appProperties has { key='backup_id' and value='%s' } and trashed=false",
                    addslashes($record->backup_id)
                ),
                'fields' => 'files(id)',
                'pageSize' => 1,
            ]);

            $existingFiles = $existing->getFiles();
            if (! empty($existingFiles)) {
                return $existingFiles[0]->getId();
            }
        } catch (Throwable $e) {
            Log::warning('Drive dedup check failed, proceeding with upload', [
                'backup_id' => $record->backup_id,
                'error' => $e->getMessage(),
            ]);
        }

        $disk = Storage::disk($record->disk);
        if (! $disk->exists($record->path)) {
            throw new RuntimeException('Backup file not found on disk: ' . $record->path);
        }

        $file = new DriveFile();
        $file->setName('ramyeon-backup-' . $record->backup_id . '.enc');
        $file->setAppProperties(['backup_id' => $record->backup_id]);
        $file->setMimeType('application/octet-stream');

        $content = $disk->get($record->path);
        if ($content === null) {
            throw new RuntimeException('Unable to read backup file for upload.');
        }

        // Multipart upload expects the data as a string, not a stream resource.
        // Backups are typically small (KB to a few MB), so loading into memory is safe.
        $created = $service->files->create($file, [
            'data' => $content,
            'mimeType' => 'application/octet-stream',
            'uploadType' => 'multipart',
            'fields' => 'id',
        ]);

        return $created->getId();
    }

    /**
     * Delete a file from Google Drive by its ID.
     * Fails silently (returns false) if the file doesn't exist or if the API fails.
     */
    public function deleteFile(?string $driveFileId): bool
    {
        if (blank($driveFileId)) {
            return true; // Nothing to delete
        }

        try {
            $service = new GoogleDriveService($this->auth->getClient());
            $service->files->delete($driveFileId);
            
            return true;
        } catch (Throwable $e) {
            // Google throws a 404 if the file was already deleted manually. We can ignore that.
            if ($e->getCode() !== 404) {
                Log::warning('Failed to delete Google Drive file', [
                    'drive_file_id' => $driveFileId,
                    'error' => $e->getMessage(),
                ]);
            }
            return false;
        }
    }

    protected function markFailed(BackupRecord $record, string $error): BackupRecord
    {
        $record->forceFill([
            'drive_status' => self::STATUS_FAILED,
            'drive_upload_attempts' => $record->drive_upload_attempts + 1,
            'drive_last_error' => mb_substr($error, 0, 1000),
        ])->save();

        return $record;
    }
}