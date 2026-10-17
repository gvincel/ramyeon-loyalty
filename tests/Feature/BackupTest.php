<?php

namespace Tests\Feature;

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

    public function test_admin_can_reach_backup_controller(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $originalDefault = config('database.default');

        try {
            config([
                'database.default' => 'mysql',
                'database.connections.mysql.host' => '127.0.0.1',
                'database.connections.mysql.port' => '3306',
                'database.connections.mysql.database' => 'ramyeon_loyalty',
                'database.connections.mysql.username' => 'root',
                'database.connections.mysql.password' => '',
                'backup.mysqldump_path' => 'unavailable-mysqldump-test',
            ]);

            $response = $this->actingAs($admin)
                ->post(route('admin.backups.store'));

            $response->assertRedirect();

            $response->assertSessionHas(
                'error',
                'The database backup utility is unavailable. Please contact the system administrator.'
            );
        } finally {
            config(['database.default' => $originalDefault]);
        }
    }

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

        $originalDefault = config('database.default');
        $originalMysqlConfig = config('database.connections.mysql');
        $originalBackupConfig = config('backup');

        Storage::fake('local');

        try {
            config([
                'database.default' => 'mysql',

                // Use an isolated, in-memory SQLite database for this test.
                // The backup controller still sees the connection name "mysql".
                'database.connections.mysql.driver' => 'sqlite',
                'database.connections.mysql.database' => ':memory:',
                'database.connections.mysql.prefix' => '',
                'database.connections.mysql.foreign_key_constraints' => true,

                'database.connections.mysql.host' => '127.0.0.1',
                'database.connections.mysql.port' => '3306',
                'database.connections.mysql.username' => 'root',
                'database.connections.mysql.password' => '',

                'backup.mysqldump_path' => PHP_BINARY,
                'backup.disk' => 'local',
                'backup.directory' => 'backups',
            ]);

            DB::purge('mysql');

            // Create only the table needed by the audit logger on the
            // isolated SQLite connection. No application migration is run.
            Schema::connection('mysql')->create(
                'audit_logs',
                function (Blueprint $table): void {
                    $table->id();
                    $table->unsignedBigInteger('actor_id')->nullable();
                    $table->string('actor_name')->nullable();
                    $table->string('actor_role', 50)->nullable();
                    $table->string('action', 100);
                    $table->string('subject_type', 100)->nullable();
                    $table->unsignedBigInteger('subject_id')->nullable();
                    $table->string('description');
                    $table->json('metadata')->nullable();
                    $table->timestamp('created_at')->useCurrent();
                },
            );

            Process::fake(function ($pendingProcess) {
                $resultFileArgument = collect($pendingProcess->command)
                    ->first(
                        fn ($argument) => is_string($argument)
                            && str_starts_with($argument, '--result-file='),
                    );

                if (! is_string($resultFileArgument)) {
                    throw new \RuntimeException(
                        'The backup output file argument was not provided.',
                    );
                }

                $outputPath = substr(
                    $resultFileArgument,
                    strlen('--result-file='),
                );

                if (file_put_contents(
                    $outputPath,
                    '-- simulated backup contents --',
                ) === false) {
                    throw new \RuntimeException(
                        'The simulated backup file could not be written.',
                    );
                }

                return new \Illuminate\Process\FakeProcessResult();
            });

            $response = $this
                ->actingAs($admin)
                ->post(route('admin.backups.store'));

            $response->assertOk();

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
        } finally {
            DB::purge('mysql');

            config([
                'database.default' => $originalDefault,
                'database.connections.mysql' => $originalMysqlConfig,
                'backup' => $originalBackupConfig,
            ]);
        }
    }
}
