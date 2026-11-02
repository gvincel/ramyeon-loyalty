<?php

namespace App\Console\Commands;

use App\Services\DatabaseBackupService;
use App\Services\DatabaseRestoreStateStore;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use RuntimeException;
use Throwable;

#[Signature('app:create-scheduled-database-backup')]
#[Description('Create a scheduled database backup')]
class CreateScheduledDatabaseBackup extends Command
{
    public function handle(
        DatabaseBackupService $backupService,
        DatabaseRestoreStateStore $stateStore
    ): int {
        $this->info('Starting scheduled database backup...');

        $lock = null;

        try {
            $lock = $stateStore->acquireSharedLock();

            if ($stateStore->read() !== null) {
                throw new RuntimeException(
                    'A database recovery journal exists. Resolve the recovery before creating a scheduled backup.'
                );
            }

            $backup = $backupService->create();

            if ($backup->status !== 'completed') {
                $this->error(
                    'Scheduled database backup failed. Check the application logs for details.'
                );

                return self::FAILURE;
            }

            $this->info('Scheduled database backup completed successfully.');
            $this->line('Backup ID: ' . $backup->backup_id);
            $this->line('File size: ' . number_format($backup->file_size_bytes) . ' bytes');

            return self::SUCCESS;
        } catch (Throwable $exception) {
            report($exception);

            $this->error(
                'Scheduled database backup could not be completed. Check the application logs.'
            );

            return self::FAILURE;
        } finally {
            if ($lock !== null) {
                $stateStore->releaseLock($lock);
            }
        }
    }
}