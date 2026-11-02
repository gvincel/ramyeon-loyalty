<?php

namespace Tests\Feature;

use App\Models\BackupRecord;
use App\Services\DatabaseBackupService;
use App\Services\DatabaseRestoreService;
use App\Services\DatabaseRestoreStateStore;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DatabaseRestoreMissingSafetyRecordTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_recovers_from_encrypted_safety_backup_when_its_database_record_is_missing(): void
    {
        Storage::fake('local');

        config([
            'backup.restore_connection' => 'restore_verify',
            'backup.connection' => 'mysql',
            'backup.disk' => 'local',
        ]);

        DB::purge('restore_verify');

        $connection = DB::connection('restore_verify');
        $table = 'restore_recovery_probe';

        Schema::connection('restore_verify')->dropIfExists($table);

        Schema::connection('restore_verify')->create($table, function ($blueprint) {
            $blueprint->id();
            $blueprint->string('marker');
        });

        $store = app(DatabaseRestoreStateStore::class);

        try {
            // Create data that the safety backup must preserve.
            $connection->table($table)->insert([
                'marker' => 'original-data',
            ]);

            // Create a real encrypted safety backup of the MySQL target.
            $safetyBackup = app(DatabaseBackupService::class)
                ->create(null, 'restore_verify');

            $this->assertSame('completed', $safetyBackup->status);
            $this->assertTrue((bool) $safetyBackup->encrypted);
            $this->assertNotNull($safetyBackup->verified_at);

            // Simulate damage after the safety backup was created.
            $connection->table($table)->update([
                'marker' => 'damaged-data',
            ]);

            // Write the interrupted recovery journal.
            $store->write([
                'status' => 'recovery_needed',
                'backup_id' => 'simulated-primary-backup',
                'safety_backup_id' => (string) $safetyBackup->backup_id,
                'safety_backup_disk' => (string) $safetyBackup->disk,
                'safety_backup_path' => (string) $safetyBackup->path,
                'safety_backup_file_size_bytes' => (int) $safetyBackup->file_size_bytes,
                'safety_backup_sha256' => (string) $safetyBackup->sha256,
                'safety_backup_verified_at' => $safetyBackup->verified_at->toISOString(),
                'restore_connection' => 'restore_verify',
                'restore_database' => (string) config('database.connections.restore_verify.database'),
            ]);

            // Simulate the backup_records table being lost during restoration.
            BackupRecord::query()
                ->where('backup_id', $safetyBackup->backup_id)
                ->delete();

            $this->assertDatabaseMissing('backup_records', [
                'backup_id' => $safetyBackup->backup_id,
            ]);

            // Recover using the encrypted artifact and journal metadata alone.
            app(DatabaseRestoreService::class)->recoverInterruptedRestore();

            // Verify that the original data was recovered.
            $this->assertSame(
                'original-data',
                $connection->table($table)->value('marker')
            );

            $this->assertNull($store->read());
        } finally {
            // Only clean up the probe table after the recovery journal is cleared.
            // If recovery is incomplete, preserve the target for investigation.
            if ($store->read() === null) {
                Schema::connection('restore_verify')->dropIfExists($table);
            }
        }
    }
}
