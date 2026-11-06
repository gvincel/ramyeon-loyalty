<?php

namespace App\Http\Controllers\Admin;

use App\Services\DatabaseRestoreService;
use App\Services\BackupEncryptionService;
use App\Services\DatabaseBackupService;
use App\Http\Controllers\Controller;
use App\Models\BackupRecord;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class BackupController extends Controller
{
    public function index()
{
    $restoreConnection = config('backup.allow_production_restore')
        ? config('database.default')
        : config('backup.restore_connection');

    $restoreTargetDatabase = $restoreConnection
        ? config("database.connections.{$restoreConnection}.database")
        : null;

    $backups = BackupRecord::query()
        ->with('creator:id,name')
        ->orderByDesc('created_at')
        ->orderByDesc('id')
        ->limit(20)
        ->get([
            'backup_id',
            'type',
            'status',
            'disk',
            'path',
            'file_size_bytes',
            'sha256',
            'encrypted',
            'verified_at',
            'created_by',
            'started_at',
            'completed_at',
            'expires_at',
            'failure_code',
            'failure_message',
            'drive_status',
            'drive_file_id',
            'drive_uploaded_at',
            'drive_upload_attempts',
            'drive_last_error',
            'created_at',
        ]);

    return Inertia::render('Admin/Backups', [
        'backups' => $backups,
        'restoreTargetDatabase' => $restoreTargetDatabase,
        'drive' => [
            'configured' => app(\App\Services\GoogleDriveAuthService::class)->isConfigured(),
            'connected' => app(\App\Services\GoogleDriveAuthService::class)->isConnected(),
            'account_email' => \App\Models\GoogleDriveToken::current()?->account_email,
        ],
    ]);
}

    public function store(DatabaseBackupService $backupService): BinaryFileResponse|RedirectResponse
    {
        $connection = config('backup.connection')
            ?: config('database.default');
        $database = config("database.connections.{$connection}");

        if (
            ! in_array($connection, ['mysql', 'mariadb'], true) ||
            empty($database['host']) ||
            empty($database['database']) ||
            empty($database['username'])
        ) {
            return back()->with(
                'error',
                'The database backup configuration is incomplete or unsupported.'
            );
        }

        try {
            $backup = $backupService->create(Auth::id());

            if ($backup->status !== 'completed') {
                return back()->with(
                    'error',
                    'The database backup failed. Please try again or contact the system administrator.'
                );
            }

            $disk = Storage::disk($backup->disk);
            $outputPath = $disk->path($backup->path);

            if (! is_file($outputPath)) {
                Log::error('Completed backup file is unavailable for download.', [
                    'backup_id' => $backup->backup_id,
                ]);

                return back()->with(
                    'error',
                    'The backup was created, but its file could not be downloaded.'
                );
            }

            return response()->download(
                $outputPath,
                basename($backup->path)
            );
        } catch (Throwable $exception) {
            Log::error('Manual database backup request failed.', [
                'exception' => $exception::class,
            ]);

            return back()->with(
                'error',
                'The database backup could not be completed. Please try again.'
            );
        }
    }

    public function verify(
        BackupRecord $backupRecord,
        BackupEncryptionService $encryptionService
    ): RedirectResponse {
        if (
            $backupRecord->status !== 'completed' ||
            ! $backupRecord->encrypted ||
            blank($backupRecord->path) ||
            blank($backupRecord->sha256) ||
            $backupRecord->file_size_bytes === null
        ) {
            return back()->with(
                'error',
                'This backup is not eligible for integrity verification.'
            );
        }

        $verificationRelativePath = null;
        $verificationPath = null;
        $stream = null;

        try {
            $disk = Storage::disk($backupRecord->disk);

            // The current backup implementation uses private local storage.
            if (
                config("filesystems.disks.{$backupRecord->disk}.driver") !== 'local'
            ) {
                throw new \RuntimeException('Unsupported backup storage disk.');
            }

            $backupDirectory = trim(
                (string) config('backup.directory'),
                '/\\'
            );

            if (
                $backupDirectory === '' ||
                str_contains($backupRecord->path, '..') ||
                ! str_starts_with(
                    $backupRecord->path,
                    $backupDirectory . '/'
                )
            ) {
                throw new \RuntimeException('Invalid backup storage path.');
            }

            if (! $disk->exists($backupRecord->path)) {
                throw new \RuntimeException('Backup file is missing.');
            }

            // First verify the encrypted artifact itself.
            $actualSize = $disk->size($backupRecord->path);

            $stream = $disk->readStream($backupRecord->path);

            if (! is_resource($stream)) {
                throw new \RuntimeException('Unable to read backup file.');
            }

            $context = hash_init('sha256');
            $bytesRead = hash_update_stream($context, $stream);

            if ($bytesRead === false) {
                throw new \RuntimeException('Unable to calculate backup checksum.');
            }

            $actualHash = hash_final($context);

            fclose($stream);
            $stream = null;

            if (
                $actualSize !== $backupRecord->file_size_bytes ||
                ! hash_equals($backupRecord->sha256, $actualHash)
            ) {
                throw new \RuntimeException(
                    'Backup file size or checksum does not match.'
                );
            }

            // Create a unique temporary plaintext path inside private storage.
            $verificationRelativePath = $backupDirectory
                . '/.verify-'
                . Str::uuid()
                . '.sql.tmp';

            $verificationPath = $disk->path($verificationRelativePath);

            // Authenticate and decrypt the entire encrypted backup.
            // The encryption service rejects invalid keys, corrupted frames,
            // truncated files, and missing final authentication frames.
            $encryptionService->decryptFile(
                $disk->path($backupRecord->path),
                $verificationPath
            );

            if (
                ! is_file($verificationPath) ||
                filesize($verificationPath) === false ||
                filesize($verificationPath) <= 0
            ) {
                throw new \RuntimeException(
                    'Decrypted backup is empty or unavailable.'
                );
            }

            // Confirm that the decrypted content has our expected SQL header.
            $plaintextHeader = file_get_contents(
                $verificationPath,
                false,
                null,
                0,
                128
            );

            if (
                $plaintextHeader === false ||
                ! str_starts_with(
                    $plaintextHeader,
                    "-- Ramyeon Corner SQL backup\n"
                )
            ) {
                throw new \RuntimeException(
                    'Decrypted backup does not have the expected SQL format.'
                );
            }

            $backupRecord->verified_at = now();
            $backupRecord->save();

            try {
                app(AuditLogger::class)->record(
                    'backup.verified',
                    'Encrypted database backup integrity and decryption verified.',
                    null,
                    ['backup_id' => $backupRecord->backup_id],
                );
            } catch (Throwable $auditException) {
                Log::error('Backup verification audit logging failed.', [
                    'backup_id' => $backupRecord->backup_id,
                    'exception' => $auditException::class,
                ]);
            }

            return back()->with(
                'success',
                'Backup integrity and encrypted contents verified successfully.'
            );
        } catch (Throwable $exception) {
            report($exception);

            try {
                $backupRecord->verified_at = null;
                $backupRecord->save();
            } catch (Throwable $statusException) {
                Log::error('Failed to clear backup verification status after failed verification.', [
                    'backup_id' => $backupRecord->backup_id,
                    'exception' => $statusException::class,
                ]);
            }

            return back()->with(
                'error',
                'Backup verification failed. The encrypted backup may be damaged or its encryption key may be invalid.'
            );
        } finally {
            if (is_resource($stream)) {
                fclose($stream);
            }

            // Never retain temporary decrypted SQL files.
            if (
                $verificationRelativePath !== null &&
                Storage::disk($backupRecord->disk)->exists(
                    $verificationRelativePath
                )
            ) {
                Storage::disk($backupRecord->disk)->delete(
                    $verificationRelativePath
                );
            }
        }
    }

    public function restore(
        Request $request,
        BackupRecord $backupRecord,
        DatabaseRestoreService $restoreService
    ): RedirectResponse {
        $request->validate([
            'confirm_restore' => ['required', 'accepted'],
        ]);

        try {
            $result = $restoreService->restore(
                $backupRecord,
                Auth::id()
            );

            return back()->with(
                'success',
                "Restoration completed successfully. "
                . "{$result['tables_restored']} tables and "
                . "{$result['rows_restored']} rows restored to "
                . "{$result['database']}."
            );
        } catch (Throwable $exception) {
            report($exception);

            $message = $exception->getMessage();

            // Show the service's explicit recovery outcomes.
            if (
                str_starts_with(
                    $message,
                    'The selected backup could not be restored.'
                ) ||
                str_starts_with(
                    $message,
                    'Restoration failed and automatic recovery could not be confirmed.'
                )
            ) {
                return back()->with('error', $message);
            }

            return back()->with(
                'error',
                'Restoration could not be completed. Check the backup configuration and application logs.'
            );
        }
    }
}
