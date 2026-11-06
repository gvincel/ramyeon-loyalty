<?php

use App\Models\BackupRecord;
use App\Services\AuditLogger;
use App\Services\GoogleDriveAuthService;
use App\Services\GoogleDriveUploadService;
use App\Services\ScheduledBackupDriveUploader;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Mockery\MockInterface;
use Tests\Support\FakeGoogleDriveUploadService;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function makeBackupForUploader(array $overrides = []): BackupRecord
{
    return BackupRecord::create(array_merge([
        'backup_id' => 'bk_' . uniqid(),
        'type' => 'database',
        'status' => 'completed',
        'disk' => 'backups',
        'path' => 'backups/test-' . uniqid() . '.enc',
        'file_size_bytes' => 1024,
        'sha256' => str_repeat('a', 64),
        'encrypted' => true,
        'started_at' => now(),
        'completed_at' => now(),
        'drive_upload_attempts' => 0,
    ], $overrides));
}

function makeUploader(
    bool $isConfigured,
    bool $isConnected,
    ?string $returnId = null,
    ?Throwable $throw = null,
): ScheduledBackupDriveUploader {
    $auth = Mockery::mock(GoogleDriveAuthService::class);
    $auth->shouldReceive('isConfigured')->andReturn($isConfigured);
    $auth->shouldReceive('isConnected')->andReturn($isConnected);

    $fake = new FakeGoogleDriveUploadService($auth, $returnId, $throw);

    return new ScheduledBackupDriveUploader(
        $fake,
        app(AuditLogger::class),
    );
}

it('uploads a completed backup and records an audit log', function () {
    $backup = makeBackupForUploader();
    $uploader = makeUploader(true, true, 'fake-drive-id');

    $uploader->attempt($backup);

    $backup->refresh();

    expect($backup->drive_status)->toBe('uploaded')
        ->and($backup->drive_file_id)->toBe('fake-drive-id')
        ->and($backup->drive_uploaded_at)->not->toBeNull();

    expect(DB::table('audit_logs')
        ->where('action', 'backup.drive_uploaded')
        ->count()
    )->toBe(1);
});

it('records a failed upload without throwing', function () {
    $backup = makeBackupForUploader();
    $uploader = makeUploader(
        true,
        true,
        throw: new RuntimeException('Drive quota exceeded'),
    );

    $uploader->attempt($backup);

    $backup->refresh();

    expect($backup->drive_status)->toBe('failed')
        ->and($backup->drive_last_error)->toContain('Drive quota exceeded');

    expect(DB::table('audit_logs')
        ->where('action', 'backup.drive_upload_failed')
        ->count()
    )->toBe(1);
});

it('records a failed upload when Drive is not configured', function () {
    $backup = makeBackupForUploader();
    $uploader = makeUploader(false, false);

    $uploader->attempt($backup);

    $backup->refresh();

    expect($backup->drive_status)->toBe('failed')
        ->and($backup->drive_last_error)->toContain('not configured');
});

it('does not attempt an upload when the backup is not completed', function () {
    $backup = makeBackupForUploader(['status' => 'failed']);
    $uploader = makeUploader(true, true, 'should-not-be-called');

    $uploader->attempt($backup);

    $backup->refresh();

    expect($backup->drive_status)->toBe('skipped')
        ->and($backup->drive_upload_attempts)->toBe(0);
});

it('never throws regardless of upload outcome', function () {
    $backup = makeBackupForUploader();
    $uploader = makeUploader(
        true,
        true,
        throw: new RuntimeException('catastrophic failure'),
    );

    $uploader->attempt($backup);

    expect(true)->toBeTrue();
});