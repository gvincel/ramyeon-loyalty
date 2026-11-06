<?php

use App\Models\BackupRecord;
use App\Services\GoogleDriveUploadService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Mockery\MockInterface;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

it('prunes backups outside the retention window', function () {
    Storage::fake('backups');
    
    // Mock ONLY the Google Drive service so we don't hit the real API.
    // This allows the REAL BackupDeletionService to run and delete the DB records.
    $this->mock(GoogleDriveUploadService::class, function (MockInterface $mock) {
        $mock->shouldReceive('deleteFile')->andReturn(true);
    });

    // Helper to create a backup with a specific timestamp
    // We use forceFill because created_at is not in the $fillable array
    $makeBackup = function (string $id, \Carbon\Carbon $createdAt) {
        $backup = new BackupRecord();
        $backup->forceFill([
            'backup_id' => $id, 
            'status' => 'completed', 
            'disk' => 'backups',
            'path' => 'test.enc', 
            'type' => 'database', 
            'created_at' => $createdAt, 
            'updated_at' => $createdAt
        ])->save();
    };

    // 1. Create a recent backup (yesterday) - SHOULD KEEP (Daily)
    $makeBackup('bk_recent', now()->subDays(1));

    // 2. Create two backups in the same week (last week)
    // - SHOULD KEEP the oldest, DELETE the newer
    $weekStart = now()->subWeek()->startOfWeek();
    $makeBackup('bk_weekly_keep', $weekStart);
    $makeBackup('bk_weekly_delete', $weekStart->copy()->addDays(2));

    // 3. Create two backups in the same month (2 months ago)
    // - SHOULD KEEP the oldest, DELETE the newer
    $monthStart = now()->subMonths(2)->startOfMonth();
    $makeBackup('bk_monthly_keep', $monthStart);
    $makeBackup('bk_monthly_delete', $monthStart->copy()->addDays(2));

    // Run the prune command
    $this->artisan('app:prune-old-backups')
        ->assertSuccessful();

    // Assert the correct backups were kept
    expect(BackupRecord::where('backup_id', 'bk_recent')->exists())->toBeTrue();
    expect(BackupRecord::where('backup_id', 'bk_weekly_keep')->exists())->toBeTrue();
    expect(BackupRecord::where('backup_id', 'bk_monthly_keep')->exists())->toBeTrue();

    // Assert the correct backups were deleted
    expect(BackupRecord::where('backup_id', 'bk_weekly_delete')->exists())->toBeFalse();
    expect(BackupRecord::where('backup_id', 'bk_monthly_delete')->exists())->toBeFalse();
});