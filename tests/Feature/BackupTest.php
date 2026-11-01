<?php

namespace Tests\Feature;

use App\Services\BackupEncryptionService;
use App\Services\DatabaseRestoreService;
use Inertia\Testing\AssertableInertia as Assert;
use App\Models\BackupRecord;
use App\Models\AuditLog;
use Illuminate\Process\FakeProcessResult;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BackupTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_create_backup_with_unsupported_database_connection(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $originalDefault = config('database.default');

        try {
            config(['database.default' => 'sqlite']);

            $response = $this->actingAs($admin)
                ->post(route('admin.backups.store'));

            $response->assertRedirect();

            $response->assertSessionHas(
                'error',
                'The database backup configuration is incomplete or unsupported.'
            );
        } finally {
            config(['database.default' => $originalDefault]);
        }
    }

    public function test_cashier_cannot_create_database_backup(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $this->actingAs($cashier)
            ->post(route('admin.backups.store'))
            ->assertForbidden();
    }

    public function test_guest_cannot_create_database_backup(): void
    {
        $this->post(route('admin.backups.store'))
            ->assertRedirect(route('login'));
    }

    public function test_successful_backup_is_audited(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $originalMysqlConfig = config('database.connections.mysql');
        $originalBackupConfig = config('backup');

        Storage::fake('local');

        try {
            config([
                // Keep PHPUnit's default SQLite connection unchanged.
                // Only the backup exporter reads from this MySQL database.
                'backup.connection' => 'mysql',

                'database.connections.mysql.driver' => 'mysql',
                'database.connections.mysql.host' => '127.0.0.1',
                'database.connections.mysql.port' => '3306',
                'database.connections.mysql.database' => 'ramyeon_backup_test_isolated',
                'database.connections.mysql.username' => 'root',
                'database.connections.mysql.password' => '',
                'database.connections.mysql.charset' => 'utf8mb4',
                'database.connections.mysql.collation' => 'utf8mb4_0900_ai_ci',
                'database.connections.mysql.prefix' => '',
                'database.connections.mysql.strict' => true,

                'backup.disk' => 'local',
                'backup.directory' => 'backups',
            ]);

            DB::purge('mysql');

            // Confirm the exporter is connected to the approved source database.
            $this->assertSame(
                'ramyeon_backup_test_isolated',
                DB::connection('mysql')->getDatabaseName(),
                'Refusing to back up an unexpected MySQL database.',
            );

            // Do not drop, recreate, or insert into any MySQL tables.
            $response = $this
                ->actingAs($admin)
                ->post(route('admin.backups.store'));

            $response->assertOk();

            // Audit logging remains on PHPUnit's SQLite database.
            $auditLog = AuditLog::query()
                ->where('action', 'backup.created')
                ->firstOrFail();

            $this->assertEquals($admin->id, $auditLog->actor_id);
            $this->assertSame('admin', $auditLog->actor_role);
            $this->assertNull($auditLog->subject_id);
            $this->assertGreaterThan(
                0,
                $auditLog->metadata['file_size_bytes'],
            );

            // Backup record also remains on PHPUnit's SQLite database.
            $backupRecord = BackupRecord::query()
                ->where('status', 'completed')
                ->firstOrFail();

            $this->assertSame('database', $backupRecord->type);
            $this->assertSame('local', $backupRecord->disk);
            $this->assertNotNull($backupRecord->completed_at);
            $this->assertGreaterThan(0, $backupRecord->file_size_bytes);
            $this->assertTrue($backupRecord->encrypted);
            $this->assertMatchesRegularExpression(
                '/^[a-f0-9]{64}$/',
                $backupRecord->sha256,
            );

            $backupDisk = Storage::disk('local');

            $this->assertTrue(
                $backupDisk->exists($backupRecord->path),
                'The completed backup file should remain in private storage.',
            );

            $this->assertSame(
                $backupRecord->sha256,
                hash_file('sha256', $backupDisk->path($backupRecord->path)),
                'The recorded SHA-256 checksum should match the retained backup file.',
            );
        } finally {
            DB::purge('mysql');

            config([
                'database.connections.mysql' => $originalMysqlConfig,
                'backup' => $originalBackupConfig,
            ]);

            DB::purge('mysql');
        }
    }

    public function test_explicit_source_connection_overrides_backup_configuration(): void
    {
        $originalMysqlConfig = config('database.connections.mysql');
        $originalBackupConfig = config('backup');

        Storage::fake('local');

        try {
            config([
                // Deliberately set the configured source to SQLite.
                'backup.connection' => 'sqlite',

                // The explicit source connection will override it.
                'database.connections.mysql.driver' => 'mysql',
                'database.connections.mysql.host' => '127.0.0.1',
                'database.connections.mysql.port' => '3306',
                'database.connections.mysql.database' => 'ramyeon_backup_test_isolated',
                'database.connections.mysql.username' => 'root',
                'database.connections.mysql.password' => '',
                'database.connections.mysql.charset' => 'utf8mb4',
                'database.connections.mysql.collation' => 'utf8mb4_0900_ai_ci',
                'database.connections.mysql.prefix' => '',
                'database.connections.mysql.strict' => true,

                'backup.disk' => 'local',
                'backup.directory' => 'backups',
            ]);

            DB::purge('mysql');

            $this->assertSame(
                'ramyeon_backup_test_isolated',
                DB::connection('mysql')->getDatabaseName()
            );

            // Explicitly select MySQL despite backup.connection being SQLite.
            $backup = app(\App\Services\DatabaseBackupService::class)
                ->create(null, 'mysql');

            $this->assertSame('completed', $backup->status);
            $this->assertTrue($backup->encrypted);

            $disk = Storage::disk('local');
            $this->assertTrue($disk->exists($backup->path));

            // Decrypt temporarily to confirm the exported source database.
            $temporaryPath = $disk->path(
                'backups/.source-check-' . \Illuminate\Support\Str::uuid() . '.sql.tmp'
            );

            try {
                app(BackupEncryptionService::class)->decryptFile(
                    $disk->path($backup->path),
                    $temporaryPath
                );

                $sql = file_get_contents($temporaryPath);

                $this->assertIsString($sql);
                $this->assertStringContainsString(
                    '-- Database: ramyeon_backup_test_isolated',
                    $sql
                );
            } finally {
                if (is_file($temporaryPath)) {
                    unlink($temporaryPath);
                }
            }
        } finally {
            DB::purge('mysql');

            config([
                'database.connections.mysql' => $originalMysqlConfig,
                'backup' => $originalBackupConfig,
            ]);

            DB::purge('mysql');
        }
    }

    public function test_admin_can_view_the_20_most_recent_backup_records(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        for ($index = 0; $index < 21; $index++) {
            $timestamp = now()->startOfSecond()->subMinutes($index);

            DB::table('backup_records')->insert([
                'backup_id' => sprintf('backup-history-%02d', $index),
                'type' => 'database',
                'status' => 'completed',
                'disk' => 'local',
                'path' => sprintf('backups/test-%02d.sql', $index),
                'file_size_bytes' => 2048,
                'sha256' => str_repeat('a', 64),
                'encrypted' => false,
                'verified_at' => null,
                'created_by' => $admin->id,
                'started_at' => $timestamp->toDateTimeString(),
                'completed_at' => $timestamp->toDateTimeString(),
                'created_at' => $timestamp->toDateTimeString(),
                'updated_at' => $timestamp->toDateTimeString(),
            ]);
        }

        $this->actingAs($admin)
            ->get(route('admin.backups.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Backups')
                ->has('backups', 20)
                ->where('backups.0.backup_id', 'backup-history-00')
                ->where('backups.0.status', 'completed')
                ->where('backups.0.file_size_bytes', 2048)
                ->where('backups.0.encrypted', false)
                ->where('backups.0.creator.name', $admin->name)
                ->where('backups.19.backup_id', 'backup-history-19')
            );
    }

    public function test_admin_can_verify_backup_integrity(): void
    {
        Storage::persistentFake('local');

        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $path = 'backups/integrity-valid.sql.enc';
        $fixture = $this->createEncryptedBackupFixture($path);

        $backup = BackupRecord::query()->create([
            'backup_id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'database',
            'status' => 'completed',
            'disk' => 'local',
            'path' => $path,
            'file_size_bytes' => $fixture['file_size_bytes'],
            'sha256' => $fixture['sha256'],
            'encrypted' => true,
            'completed_at' => now(),
        ]);

        $this->actingAs($admin)
            ->post(route('admin.backups.verify', $backup))
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertNotNull($backup->fresh()->verified_at);
    }

    public function test_backup_integrity_verification_fails_when_file_is_missing(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $backup = BackupRecord::query()->create([
            'backup_id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'database',
            'status' => 'completed',
            'disk' => 'local',
            'path' => 'backups/missing.sql.enc',
            'file_size_bytes' => 1024,
            'sha256' => str_repeat('a', 64),
            'encrypted' => true,
            'verified_at' => now(),
            'completed_at' => now(),
        ]);

        $this->actingAs($admin)
            ->post(route('admin.backups.verify', $backup))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertNull($backup->fresh()->verified_at);

        $this->assertFalse(
            Storage::disk('local')->exists('backups/missing.sql.enc')
        );
    }

    public function test_backup_integrity_verification_fails_when_file_is_modified(): void
    {
        Storage::fake('local');

        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $path = 'backups/integrity-modified.sql.enc';
        $fixture = $this->createEncryptedBackupFixture($path);

        $backup = BackupRecord::query()->create([
            'backup_id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'database',
            'status' => 'completed',
            'disk' => 'local',
            'path' => $path,
            'file_size_bytes' => $fixture['file_size_bytes'],
            'sha256' => $fixture['sha256'],
            'encrypted' => true,
            'verified_at' => now(),
            'completed_at' => now(),
        ]);

        // Simulate someone modifying the encrypted backup file.
        Storage::disk('local')->put($path, 'tampered encrypted backup');

        $this->actingAs($admin)
            ->post(route('admin.backups.verify', $backup))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertNull($backup->fresh()->verified_at);
    }

    public function test_backup_restoration_requires_explicit_confirmation(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $backup = BackupRecord::query()->create([
            'backup_id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'database',
            'status' => 'completed',
            'disk' => 'local',
            'path' => 'backups/restore-confirmation-test.sql.enc',
            'file_size_bytes' => 2048,
            'sha256' => str_repeat('a', 64),
            'encrypted' => true,
            'verified_at' => now(),
            'completed_at' => now(),
        ]);

        $this->actingAs($admin)
            ->post(route('admin.backups.restore', $backup), [])
            ->assertRedirect()
            ->assertSessionHasErrors('confirm_restore');
    }

    private function createEncryptedBackupFixture(string $path): array
    {
        $disk = Storage::disk('local');

        $disk->makeDirectory('backups');

        config([
            'backup.encryption_key' => 'base64:' . base64_encode(
                random_bytes(SODIUM_CRYPTO_SECRETBOX_KEYBYTES)
            ),
        ]);

        $plainRelativePath = 'backups/.fixture-' . \Illuminate\Support\Str::uuid() . '.sql.tmp';
        $plainPath = $disk->path($plainRelativePath);
        $encryptedPath = $disk->path($path);

        try {
            file_put_contents(
                $plainPath,
                "-- Ramyeon Corner SQL backup\n-- Test fixture\n"
            );

            app(BackupEncryptionService::class)->encryptFile(
                $plainPath,
                $encryptedPath
            );
        } finally {
            if (is_file($plainPath)) {
                unlink($plainPath);
            }
        }

        clearstatcache(true, $encryptedPath);

        return [
            'file_size_bytes' => filesize($encryptedPath),
            'sha256' => hash_file('sha256', $encryptedPath),
        ];
    }
}
