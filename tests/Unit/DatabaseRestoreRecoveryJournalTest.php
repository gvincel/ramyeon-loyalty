<?php

namespace Tests\Unit;

use App\Services\DatabaseRestoreService;
use App\Services\DatabaseRestoreStateStore;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

class DatabaseRestoreRecoveryJournalTest extends TestCase
{
    private DatabaseRestoreStateStore $store;

    private DatabaseRestoreService $service;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        config([
            'app.key' => 'test-restore-journal-authentication-key',
            'backup.restore_connection' => 'restore_verify',
        ]);

        $this->store = app(DatabaseRestoreStateStore::class);
        $this->service = app(DatabaseRestoreService::class);
    }

    private function writeState(string $status = 'prepared'): void
    {
        $this->store->write([
            'status' => $status,
            'backup_id' => 'backup-test-001',
            'safety_backup_id' => 'safety-test-001',
            'restore_connection' => 'restore_verify',
            'restore_database' => 'ramyeon_backup_restore_verify',
        ]);
    }

    public function test_it_reports_when_no_interrupted_restore_exists(): void
    {
        $result = $this->service->recoverInterruptedRestore();

        $this->assertSame(['status' => 'none'], $result);
        $this->assertNull($this->store->read());
    }

    public function test_it_clears_a_prepared_journal_without_database_recovery(): void
    {
        $this->writeState('prepared');

        $result = $this->service->recoverInterruptedRestore();

        $this->assertSame('cleared', $result['status']);
        $this->assertSame('prepared', $result['previous_status']);
        $this->assertNull($this->store->read());
    }

    public function test_it_clears_an_applied_verified_journal_without_rollback(): void
    {
        $this->writeState('applied_verified');

        $result = $this->service->recoverInterruptedRestore();

        $this->assertSame('cleared', $result['status']);
        $this->assertSame('applied_verified', $result['previous_status']);
        $this->assertNull($this->store->read());
    }

    public function test_it_clears_a_recovered_journal_without_repeating_recovery(): void
    {
        $this->writeState('recovered');

        $result = $this->service->recoverInterruptedRestore();

        $this->assertSame('cleared', $result['status']);
        $this->assertSame('recovered', $result['previous_status']);
        $this->assertNull($this->store->read());
    }

    public function test_it_preserves_the_journal_when_the_configured_connection_differs(): void
    {
        $this->writeState('applying');

        config([
            'backup.restore_connection' => 'another_restore_connection',
        ]);

        try {
            $this->service->recoverInterruptedRestore();

            $this->fail('A connection mismatch should prevent recovery.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString(
                'does not match the recovery journal',
                $exception->getMessage()
            );
        }

        $state = $this->store->read();

        $this->assertNotNull($state);
        $this->assertSame('applying', $state['status']);
        $this->assertSame('restore_verify', $state['restore_connection']);
    }

    public function test_it_releases_the_lock_after_a_connection_mismatch(): void
    {
        $this->writeState('recovery_needed');

        config([
            'backup.restore_connection' => 'another_restore_connection',
        ]);

        try {
            $this->service->recoverInterruptedRestore();
        } catch (RuntimeException) {
            // Expected: the configured connection does not match the journal.
        }

        $lock = $this->store->acquireLock();

        $this->assertIsResource($lock);

        $this->store->releaseLock($lock);
    }
}