<?php

namespace Tests\Unit;

use App\Services\DatabaseRestoreStateStore;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

class DatabaseRestoreStateStoreTest extends TestCase
{
    private DatabaseRestoreStateStore $store;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        config([
            'app.key' => 'test-restore-journal-authentication-key',
        ]);

        $this->store = app(DatabaseRestoreStateStore::class);
    }

    private function validState(string $status = 'applying'): array
    {
        return [
            'status' => $status,
            'backup_id' => 'backup-test-001',
            'safety_backup_id' => 'safety-test-001',
            'restore_connection' => 'restore_verify',
            'restore_database' => 'ramyeon_backup_restore_verify',
            'safety_backup_disk' => 'local',
            'safety_backup_path' => 'backups/safety-test-001.sql.enc',
            'safety_backup_file_size_bytes' => 1024,
            'safety_backup_sha256' => str_repeat('a', 64),
            'safety_backup_verified_at' => '2026-11-02T00:00:00+00:00',
        ];
    }

    public function test_it_writes_and_reads_an_authenticated_journal(): void
    {
        $state = $this->validState();

        $this->store->write($state);

        $result = $this->store->read();

        $this->assertIsArray($result);
        $this->assertSame(1, $result['version']);
        $this->assertSame('applying', $result['status']);
        $this->assertSame($state['backup_id'], $result['backup_id']);
        $this->assertSame($state['safety_backup_id'], $result['safety_backup_id']);
        $this->assertSame($state['restore_connection'], $result['restore_connection']);
        $this->assertSame($state['restore_database'], $result['restore_database']);
        $this->assertSame($state['safety_backup_disk'], $result['safety_backup_disk']);
        $this->assertSame($state['safety_backup_path'], $result['safety_backup_path']);
        $this->assertSame($state['safety_backup_file_size_bytes'], $result['safety_backup_file_size_bytes']);
        $this->assertSame($state['safety_backup_sha256'], $result['safety_backup_sha256']);
        $this->assertNotEmpty($result['created_at']);
        $this->assertNotEmpty($result['updated_at']);
        $this->assertSame($state['safety_backup_verified_at'], $result['safety_backup_verified_at']);
    }

    public function test_it_returns_null_when_no_journal_exists(): void
    {
        $this->assertNull($this->store->read());
    }

    public function test_it_rejects_a_tampered_journal(): void
    {
        $this->store->write($this->validState());

        $path = Storage::disk('local')->path(
            'recovery/restore-state.json'
        );

        $envelope = json_decode(
            file_get_contents($path),
            true,
            512,
            JSON_THROW_ON_ERROR
        );

        $envelope['payload']['status'] = 'recovered';

        file_put_contents(
            $path,
            json_encode($envelope, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR)
        );

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('authentication check failed');

        $this->store->read();
    }

    public function test_it_reads_the_previous_journal_if_the_primary_is_missing(): void
    {
        $this->store->write($this->validState('recovery_needed'));

        $primary = Storage::disk('local')->path(
            'recovery/restore-state.json'
        );

        $previous = $primary . '.previous';

        $this->assertTrue(copy($primary, $previous));
        $this->assertTrue(unlink($primary));

        $result = $this->store->read();

        $this->assertIsArray($result);
        $this->assertSame('recovery_needed', $result['status']);
    }

    public function test_clear_removes_the_previous_journal_before_the_primary(): void
    {
        $this->store->write($this->validState());

        $primary = Storage::disk('local')->path(
            'recovery/restore-state.json'
        );

        $previous = $primary . '.previous';

        $this->assertTrue(copy($primary, $previous));

        $this->store->clear();

        $this->assertFileDoesNotExist($previous);
        $this->assertFileDoesNotExist($primary);
        $this->assertNull($this->store->read());
    }

    public function test_it_rejects_incomplete_recovery_information(): void
    {
        $state = $this->validState();
        $state['restore_database'] = '';

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('incomplete or unsupported');

        $this->store->write($state);
    }

    public function test_it_releases_the_lock_so_another_operation_can_acquire_it(): void
    {
        $firstLock = $this->store->acquireLock();

        $this->assertIsResource($firstLock);

        $this->store->releaseLock($firstLock);

        $secondLock = $this->store->acquireLock();

        $this->assertIsResource($secondLock);

        $this->store->releaseLock($secondLock);
    }

    public function test_multiple_shared_locks_can_be_acquired_simultaneously(): void
    {
        $firstLock = $this->store->acquireSharedLock();

        try {
            $secondLock = $this->store->acquireSharedLock();

            try {
                $this->assertIsResource($firstLock);
                $this->assertIsResource($secondLock);
            } finally {
                $this->store->releaseLock($secondLock);
            }
        } finally {
            $this->store->releaseLock($firstLock);
        }
    }

    public function test_exclusive_lock_cannot_be_acquired_while_shared_lock_is_held(): void
    {
        $sharedLock = $this->store->acquireSharedLock();

        try {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('Another database restoration or recovery operation is already running.');

            $this->store->acquireLock();
        } finally {
            $this->store->releaseLock($sharedLock);
        }
    }

    public function test_shared_lock_cannot_be_acquired_while_exclusive_lock_is_held(): void
    {
        $exclusiveLock = $this->store->acquireLock();

        try {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('Another database restoration or recovery operation is already running.');

            $this->store->acquireSharedLock();
        } finally {
            $this->store->releaseLock($exclusiveLock);
        }
    }
}