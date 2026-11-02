<?php

namespace Tests\Unit;

use App\Services\DatabaseRestoreService;
use RuntimeException;
use Tests\TestCase;

class DatabaseRestoreServiceValidationTest extends TestCase
{
    private array $temporaryFiles = [];

    protected function tearDown(): void
    {
        foreach ($this->temporaryFiles as $path) {
            if (is_file($path)) {
                unlink($path);
            }
        }

        parent::tearDown();
    }

    private function sqlFile(string $sql): string
    {
        $path = tempnam(sys_get_temp_dir(), 'restore-validation-');
        file_put_contents($path, $sql);
        $this->temporaryFiles[] = $path;

        return $path;
    }

    private function invokePrivate(string $method, string $path): mixed
    {
        $service = app(DatabaseRestoreService::class);
        $reflection = new \ReflectionMethod(DatabaseRestoreService::class, $method);
        $reflection->setAccessible(true);

        return $reflection->invoke($service, $path);
    }

    public function test_incomplete_block_comments_are_rejected(): void
    {
        $this->expectException(RuntimeException::class);

        $path = $this->sqlFile('/* unfinished comment');
        iterator_to_array($this->invokePrivate('statements', $path));
    }

    public function test_sql_statements_without_a_terminating_semicolon_are_rejected(): void
    {
        $this->expectException(RuntimeException::class);

        $path = $this->sqlFile('SET NAMES utf8mb4');
        iterator_to_array($this->invokePrivate('statements', $path));
    }

    public function test_duplicate_table_definitions_are_rejected(): void
    {
        $this->expectException(RuntimeException::class);

        $path = $this->sqlFile(
            "DROP TABLE IF EXISTS `users`;\n"
            . "CREATE TABLE `users` (`id` int);\n"
            . "CREATE TABLE `users` (`id` int);\n"
        );

        $this->invokePrivate('inspectSql', $path);
    }

    public function test_insert_into_undefined_table_is_rejected(): void
    {
        $this->expectException(RuntimeException::class);

        $path = $this->sqlFile(
            "DROP TABLE IF EXISTS `users`;\n"
            . "CREATE TABLE `users` (`id` int);\n"
            . "INSERT INTO `unknown_table` (`id`) VALUES (1);\n"
        );

        $this->invokePrivate('inspectSql', $path);
    }

    public function test_inconsistent_drop_and_create_table_sets_are_rejected(): void
    {
        $this->expectException(RuntimeException::class);

        $path = $this->sqlFile(
            "DROP TABLE IF EXISTS `users`;\n"
            . "CREATE TABLE `customers` (`id` int);\n"
        );

        $this->invokePrivate('inspectSql', $path);
    }

    public function test_database_level_statements_are_rejected(): void
    {
        $this->expectException(RuntimeException::class);

        $path = $this->sqlFile('DROP DATABASE `ramyeon_loyalty`;');
        $this->invokePrivate('inspectSql', $path);
    }

    public function test_double_quoted_values_can_contain_semicolons(): void
    {
        $path = $this->sqlFile(
            'INSERT INTO `items` (`name`) VALUES ("tea;coffee");'
        );

        $statements = iterator_to_array(
            $this->invokePrivate('statements', $path)
        );

        $this->assertCount(1, $statements);
        $this->assertStringContainsString('"tea;coffee"', $statements[0]);
    }

    public function test_block_comments_between_sql_tokens_are_removed_safely(): void
    {
        $path = $this->sqlFile('SET/* harmless comment */ NAMES utf8mb4;');

        $statements = iterator_to_array(
            $this->invokePrivate('statements', $path)
        );

        $this->assertCount(1, $statements);
        $this->assertSame('SET NAMES utf8mb4', trim($statements[0]));
    }

    public function test_restore_rejects_main_database_even_through_another_connection_name(): void
    {
        $originalDefault = config('database.default');
        $originalMysql = config('database.connections.mysql');
        $originalRestore = config('database.connections.restore_verify');

        try {
            config([
                'database.default' => 'mysql',
                'database.connections.mysql' => [
                    ...$originalMysql,
                    'driver' => 'mysql',
                    'database' => 'ramyeon_loyalty',
                ],
                'database.connections.restore_verify' => [
                    ...$originalRestore,
                    'driver' => 'mysql',
                    'host' => '127.0.0.1',
                    'database' => 'ramyeon_loyalty',
                    'username' => 'root',
                ],
            ]);

            $service = app(DatabaseRestoreService::class);
            $method = new \ReflectionMethod(
                DatabaseRestoreService::class,
                'assertSafeTarget'
            );

            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage(
                'The restoration target cannot be the main application database.'
            );

            $method->invoke($service, 'restore_verify');
        } finally {
            config([
                'database.default' => $originalDefault,
                'database.connections.mysql' => $originalMysql,
                'database.connections.restore_verify' => $originalRestore,
            ]);

            \Illuminate\Support\Facades\DB::purge('restore_verify');
        }
    }

    public function test_restore_rejects_unsupported_target_driver(): void
    {
        $originalDefault = config('database.default');
        $originalRestore = config('database.connections.restore_verify');

        try {
            config([
                'database.default' => 'mysql',
                'database.connections.restore_verify' => [
                    ...$originalRestore,
                    'driver' => 'sqlite',
                    'database' => ':memory:',
                    'host' => null,
                    'username' => null,
                ],
            ]);

            $service = app(DatabaseRestoreService::class);
            $method = new \ReflectionMethod(
                DatabaseRestoreService::class,
                'assertSafeTarget'
            );

            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage(
                'The restoration database configuration is invalid or unsupported.'
            );

            $method->invoke($service, 'restore_verify');
        } finally {
            config([
                'database.default' => $originalDefault,
                'database.connections.restore_verify' => $originalRestore,
            ]);
        }
    }

    public function test_restore_rejects_connection_when_live_database_differs_from_configuration(): void
    {
        $originalDefault = config('database.default');
        $originalMysql = config('database.connections.mysql');
        $originalRestore = config('database.connections.restore_verify');

        try {
            config([
                'database.default' => 'mysql',
                'database.connections.restore_verify' => [
                    ...$originalRestore,
                    'driver' => 'mysql',
                    'host' => $originalMysql['host'],
                    'port' => $originalMysql['port'] ?? 3306,
                    'database' => 'ramyeon_backup_restore_verify',
                    'username' => $originalMysql['username'],
                    'password' => $originalMysql['password'] ?? '',
                ],
            ]);

            \Illuminate\Support\Facades\DB::purge('restore_verify');

            // Establish the connection using the correct target database.
            $actualDatabase = \Illuminate\Support\Facades\DB::connection('restore_verify')
                ->selectOne('SELECT DATABASE() AS actual_database')
                ->actual_database;

            $this->assertSame(
                'ramyeon_backup_restore_verify',
                $actualDatabase
            );

            // Simulate a configuration mismatch while the PDO connection remains cached.
            config([
                'database.connections.restore_verify.database'
                    => 'ramyeon_backup_restore_verify_mismatch',
            ]);

            $service = app(DatabaseRestoreService::class);

            $method = new \ReflectionMethod(
                DatabaseRestoreService::class,
                'assertSafeTarget'
            );

            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage(
                'The restoration connection is not connected to its configured database.'
            );

            $method->invoke($service, 'restore_verify');
        } finally {
            config([
                'database.default' => $originalDefault,
                'database.connections.mysql' => $originalMysql,
                'database.connections.restore_verify' => $originalRestore,
            ]);

            \Illuminate\Support\Facades\DB::purge('restore_verify');
        }
    }
}
