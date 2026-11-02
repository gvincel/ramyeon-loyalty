<?php

namespace App\Console\Commands;

use App\Services\DatabaseRestoreService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Throwable;

#[Signature('app:recover-interrupted-database-restore')]
#[Description('Recover an interrupted database restoration')]
class RecoverInterruptedDatabaseRestore extends Command
{
    public function handle(DatabaseRestoreService $restoreService): int
    {
        if (! $this->confirm(
            'WARNING: This will restore the database using its saved safety backup. It may affect the live production database. Do you want to continue?'
        )) {
            $this->warn('Recovery cancelled.');

            return self::SUCCESS;
        }

        try {
            $result = $restoreService->recoverInterruptedRestore();

            if ($result['status'] === 'none') {
                $this->info('No interrupted restoration journal was found.');

                return self::SUCCESS;
            }

            if ($result['status'] === 'cleared') {
                $this->info(
                    'No database recovery was necessary. The completed or unused journal was cleared.'
                );

                return self::SUCCESS;
            }

            $this->info('Interrupted restoration recovery completed successfully.');
            $this->line('Safety backup ID: ' . $result['safety_backup_id']);
            $this->line('Tables recovered: ' . $result['tables_restored']);
            $this->line('Rows recovered: ' . $result['rows_restored']);

            return self::SUCCESS;
        } catch (Throwable $exception) {
            report($exception);

            $this->error(
                'Interrupted restoration recovery could not be confirmed. Inspect the application logs and recovery journal.'
            );

            return self::FAILURE;
        }
    }
}