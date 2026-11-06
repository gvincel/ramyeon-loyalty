<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:create-scheduled-database-backup')
    ->dailyAt('02:00')
    ->timezone('Asia/Manila')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/scheduled-database-backup.log'));

Schedule::command('app:prune-old-backups')
    ->dailyAt('02:30')
    ->timezone('Asia/Manila')
    ->appendOutputTo(storage_path('logs/backup-pruning.log'));