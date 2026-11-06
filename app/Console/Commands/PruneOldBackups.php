<?php

namespace App\Console\Commands;

use App\Models\BackupRecord;
use App\Services\BackupDeletionService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Throwable;

#[Signature('app:prune-old-backups')]
#[Description('Prune old backups using a daily, weekly, and monthly retention policy')]
class PruneOldBackups extends Command
{
    public function handle(BackupDeletionService $deletionService): int
    {
        $this->info('Starting backup retention policy...');

        // We only prune completed backups.
        // 1. Keep everything from the last 7 days (Daily)
        $dailyCutoff = now()->subDays(7);
        $keepIds = BackupRecord::query()
            ->where('status', 'completed')
            ->where('created_at', '>=', $dailyCutoff)
            ->pluck('id')
            ->toArray();

        // 2. Keep weekly for the last 4 weeks
        for ($i = 1; $i <= 4; $i++) {
            $startOfWeek = now()->subWeeks($i)->startOfWeek();
            $endOfWeek = now()->subWeeks($i)->endOfWeek();
            
            $weeklyBackup = BackupRecord::query()
                ->where('status', 'completed')
                ->whereBetween('created_at', [$startOfWeek, $endOfWeek])
                ->oldest('created_at')
                ->first();
                
            if ($weeklyBackup) {
                $keepIds[] = $weeklyBackup->id;
            }
        }

        // 3. Keep monthly for the last 3 months
        for ($i = 1; $i <= 3; $i++) {
            $startOfMonth = now()->subMonths($i)->startOfMonth();
            $endOfMonth = now()->subMonths($i)->endOfMonth();
            
            $monthlyBackup = BackupRecord::query()
                ->where('status', 'completed')
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->oldest('created_at')
                ->first();
                
            if ($monthlyBackup) {
                $keepIds[] = $monthlyBackup->id;
            }
        }

        $keepIds = array_unique($keepIds);

        // Find all completed backups that are NOT in the keep list
        $backupsToDelete = BackupRecord::query()
            ->where('status', 'completed')
            ->whereNotIn('id', $keepIds)
            ->get();

        if ($backupsToDelete->isEmpty()) {
            $this->info('No backups to prune. Everything is within the retention window.');
            return self::SUCCESS;
        }

        $deletedCount = 0;

        foreach ($backupsToDelete as $backup) {
            try {
                $deletionService->delete($backup);
                $this->line("Pruned backup: {$backup->backup_id} ({$backup->created_at->toDateString()})");
                $deletedCount++;
            } catch (Throwable $e) {
                $this->warn("Could not prune backup {$backup->backup_id}: {$e->getMessage()}");
            }
        }

        $this->info("Pruned {$deletedCount} old backup(s).");

        return self::SUCCESS;
    }
}