<?php

use App\Models\BackupRecord;
use App\Services\BackupDeletionService;
use App\Services\GoogleDriveAuthService;
use App\Services\GoogleDriveUploadService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Mockery\MockInterface;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function makeBackupForDeletion(array $overrides = []): BackupRecord
{
    return BackupRecord::create(array_merge([
        'backup_id' => 'bk_' . uniqid(),
        'type' => 'database',
        'status' => 'completed',
        'disk' => 'backups',
        'path' => 'backups/test-file.enc',
        'file_size_bytes' => 1024,
        'sha256' => str_repeat('a', 64),
        'encrypted' => true,
        'drive_status' => 'uploaded',
        'drive_file_id' => 'fake-drive-id',
        'started_at' => now(),
        'completed_at' => now(),
    ], $overrides));
}

it('prevents deleting the last completed backup', function () {
    BackupRecord::query()->delete();
    $backup = makeBackupForDeletion();
    $service = new BackupDeletionService(app(GoogleDriveUploadService::class));

    $this->expectException(RuntimeException::class);
    $this->expectExceptionMessage('Cannot delete the last remaining completed backup.');

    $service->delete($backup);
});

it('deletes the file from local storage, google drive, and the database', function () {
    // Setup fake storage
    Storage::fake('backups');
    Storage::disk('backups')->put('backups/test-file.enc', 'fake-data');

    // Create two backups so the safety check passes
    $backupToDelete = makeBackupForDeletion();
    makeBackupForDeletion(); 

    // Mock the Drive Service
    $this->mock(GoogleDriveUploadService::class, function (MockInterface $mock) {
        $mock->shouldReceive('deleteFile')
             ->once()
             ->with('fake-drive-id')
             ->andReturn(true);
    });

    $service = app(BackupDeletionService::class);
    $service->delete($backupToDelete);

    // Assert local file is gone
        expect(Storage::disk('backups')->exists('backups/test-file.enc'))->toBeFalse();
    
    // Assert DB record is gone
    expect(BackupRecord::where('backup_id', $backupToDelete->backup_id)->exists())->toBeFalse();

    // Assert audit log was created
    expect(DB::table('audit_logs')->where('action', 'backup.deleted')->count())->toBe(1);
});

it('deletes local and db record even if drive deletion fails', function () {
    Storage::fake('backups');
    Storage::disk('backups')->put('backups/test-file.enc', 'fake-data');

    $backupToDelete = makeBackupForDeletion();
    makeBackupForDeletion(); 

    // Mock the Drive Service to fail
    $this->mock(GoogleDriveUploadService::class, function (MockInterface $mock) {
        $mock->shouldReceive('deleteFile')->once()->andReturn(false);
    });

    $service = app(BackupDeletionService::class);
    $service->delete($backupToDelete);

        expect(Storage::disk('backups')->exists('backups/test-file.enc'))->toBeFalse();
    expect(BackupRecord::where('backup_id', $backupToDelete->backup_id)->exists())->toBeFalse();
});