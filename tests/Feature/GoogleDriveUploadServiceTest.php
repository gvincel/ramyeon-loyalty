<?php

use App\Models\BackupRecord;
use App\Services\GoogleDriveAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\Support\FakeGoogleDriveUploadService;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function makeCompletedBackup(array $overrides = []): BackupRecord
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

function uploadServiceMockingResult(
    bool $isConfigured,
    bool $isConnected,
    ?string $returnId = null,
    ?Throwable $throw = null,
): FakeGoogleDriveUploadService {
    $auth = Mockery::mock(GoogleDriveAuthService::class);
    $auth->shouldReceive('isConfigured')->andReturn($isConfigured);
    $auth->shouldReceive('isConnected')->andReturn($isConnected);

    return new FakeGoogleDriveUploadService($auth, $returnId, $throw);
}

it('marks a backup as uploaded on success', function () {
    $service = uploadServiceMockingResult(true, true, 'fake-drive-id');
    $backup = makeCompletedBackup(['drive_status' => 'pending']);

    $result = $service->upload($backup);

    expect($result->drive_status)->toBe('uploaded')
        ->and($result->drive_file_id)->toBe('fake-drive-id')
        ->and($result->drive_uploaded_at)->not->toBeNull()
        ->and($result->drive_upload_attempts)->toBe(1)
        ->and($result->drive_last_error)->toBeNull();
});

it('marks a backup as failed when upload throws', function () {
    $service = uploadServiceMockingResult(true, true, throw: new RuntimeException('Drive quota exceeded'));
    $backup = makeCompletedBackup(['drive_status' => 'pending']);

    $result = $service->upload($backup);

    expect($result->drive_status)->toBe('failed')
        ->and($result->drive_file_id)->toBeNull()
        ->and($result->drive_upload_attempts)->toBe(1)
        ->and($result->drive_last_error)->toContain('Drive quota exceeded');
});

it('is idempotent when the backup is already uploaded', function () {
    $service = uploadServiceMockingResult(true, true, 'should-not-be-called');
    $backup = makeCompletedBackup([
        'drive_status' => 'uploaded',
        'drive_file_id' => 'existing-drive-id',
        'drive_uploaded_at' => now(),
        'drive_upload_attempts' => 3,
    ]);

    $result = $service->upload($backup);

    expect($result->drive_file_id)->toBe('existing-drive-id')
        ->and($result->drive_upload_attempts)->toBe(3)
        ->and($service->uploadCalls)->toBe([]);
});

it('marks as failed when the backup is not completed', function () {
    $service = uploadServiceMockingResult(true, true, 'should-not-be-called');
    $backup = makeCompletedBackup(['status' => 'pending', 'drive_status' => 'pending']);

    $result = $service->upload($backup);

    expect($result->drive_status)->toBe('failed')
        ->and($result->drive_last_error)->toContain('not completed')
        ->and($service->uploadCalls)->toBe([]);
});

it('marks as failed when Drive is not connected', function () {
    $service = uploadServiceMockingResult(true, false, 'should-not-be-called');
    $backup = makeCompletedBackup(['drive_status' => 'pending']);

    $result = $service->upload($backup);

    expect($result->drive_status)->toBe('failed')
        ->and($result->drive_last_error)->toContain('not connected')
        ->and($service->uploadCalls)->toBe([]);
});

it('marks as failed when Drive is not configured', function () {
    $service = uploadServiceMockingResult(false, false, 'should-not-be-called');
    $backup = makeCompletedBackup(['drive_status' => 'pending']);

    $result = $service->upload($backup);

    expect($result->drive_status)->toBe('failed')
        ->and($result->drive_last_error)->toContain('not configured')
        ->and($service->uploadCalls)->toBe([]);
});

it('increments attempts on retry after failure', function () {
    $backup = makeCompletedBackup([
        'drive_status' => 'failed',
        'drive_upload_attempts' => 2,
        'drive_last_error' => 'previous error',
    ]);

    $service = uploadServiceMockingResult(true, true, 'recovered-id');

    $result = $service->upload($backup);

    expect($result->drive_status)->toBe('uploaded')
        ->and($result->drive_upload_attempts)->toBe(3)
        ->and($result->drive_last_error)->toBeNull();
});