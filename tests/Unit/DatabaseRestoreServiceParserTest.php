<?php

namespace Tests\Unit;

use App\Services\DatabaseRestoreService;
use RuntimeException;
use Tests\TestCase;

class DatabaseRestoreServiceParserTest extends TestCase
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
        $path = tempnam(sys_get_temp_dir(), 'restore-sql-');

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

    public function test_semicolons_inside_quoted_values_do_not_split_statements(): void
    {
        $path = $this->sqlFile(
            "INSERT INTO `items` (`name`) VALUES ('tea;coffee');"
        );

        $statements = iterator_to_array(
            $this->invokePrivate('statements', $path)
        );

        $this->assertCount(1, $statements);
        $this->assertSame(
            "INSERT INTO `items` (`name`) VALUES ('tea;coffee')",
            trim($statements[0])
        );
    }

    public function test_escaped_quotes_inside_values_do_not_split_statements(): void
    {
        $path = $this->sqlFile(
            <<<'SQL'
INSERT INTO `items` (`name`) VALUES ('It\'s; still one value');
INSERT INTO `items` (`name`) VALUES ('It''s another; value');
SQL
        );

        $statements = iterator_to_array(
            $this->invokePrivate('statements', $path)
        );

        $this->assertCount(2, $statements);
    }

    public function test_line_comments_containing_semicolons_are_ignored(): void
    {
        $path = $this->sqlFile(
            "-- header; this is only a comment\n"
            . "# another; comment\n"
            . "SET NAMES utf8mb4;\n"
            . "-- trailing; comment\n"
            . "SET FOREIGN_KEY_CHECKS=0;\n"
        );

        $statements = iterator_to_array(
            $this->invokePrivate('statements', $path)
        );

        $this->assertCount(2, $statements);
        $this->assertSame('SET NAMES utf8mb4', trim($statements[0]));
        $this->assertSame('SET FOREIGN_KEY_CHECKS=0', trim($statements[1]));
    }

    public function test_ordinary_block_comments_containing_semicolons_are_ignored(): void
    {
        $path = $this->sqlFile(
            "/* harmless; comment */\nSET NAMES utf8mb4;"
        );

        $statements = iterator_to_array(
            $this->invokePrivate('statements', $path)
        );

        $this->assertCount(1, $statements);
        $this->assertSame('SET NAMES utf8mb4', trim($statements[0]));
    }

    public function test_executable_comments_are_rejected(): void
    {
        $this->expectException(RuntimeException::class);

        $path = $this->sqlFile(
            "/*!50000 DROP TABLE `users` */;"
        );

        iterator_to_array(
            $this->invokePrivate('statements', $path)
        );
    }

    public function test_unterminated_quoted_values_are_rejected(): void
    {
        $this->expectException(RuntimeException::class);

        $path = $this->sqlFile(
            "INSERT INTO `items` (`name`) VALUES ('unfinished;"
        );

        iterator_to_array(
            $this->invokePrivate('statements', $path)
        );
    }

    public function test_inspect_sql_accepts_consistent_table_and_row_definitions(): void
    {
        $path = $this->sqlFile(
            "DROP TABLE IF EXISTS `customers`;\n"
            . "CREATE TABLE `customers` (`id` int);\n"
            . "INSERT INTO `customers` (`id`) VALUES (1);\n"
            . "INSERT INTO `customers` (`id`) VALUES (2);\n"
        );

        $result = $this->invokePrivate('inspectSql', $path);

        $this->assertSame(['customers'], $result['tables']);
        $this->assertSame(['customers' => 2], $result['rows']);
    }

    public function test_inspect_sql_rejects_unsupported_statements(): void
    {
        $this->expectException(RuntimeException::class);

        $path = $this->sqlFile(
            "DROP TABLE IF EXISTS `customers`;\n"
            . "CREATE TABLE `customers` (`id` int);\n"
            . "DELETE FROM `customers`;\n"
        );

        $this->invokePrivate('inspectSql', $path);
    }
}
