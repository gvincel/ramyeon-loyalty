<?php

namespace App\Services;

use App\Models\BackupRecord;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PDO;
use RuntimeException;
use Throwable;

final class DatabaseBackupService
{
    public function create(
        ?int $createdBy = null,
        ?string $sourceConnectionName = null
    ): BackupRecord
    {
        $connectionName = $sourceConnectionName
            ?: config('backup.connection')
            ?: config('database.default');
        $database = config("database.connections.{$connectionName}");

        if (
            ! is_array($database) ||
            ! in_array($database['driver'] ?? null, ['mysql', 'mariadb'], true) ||
            empty($database['host']) ||
            empty($database['database']) ||
            empty($database['username'])
        ) {
            throw new RuntimeException(
                'The database backup configuration is incomplete or unsupported.'
            );
        }

        $diskName = config('backup.disk');
        $directory = trim((string) config('backup.directory'), '/\\');

        if (
            ! is_string($diskName) ||
            $diskName === '' ||
            $directory === '' ||
            str_contains($directory, '..') ||
            config("filesystems.disks.{$diskName}.driver") !== 'local'
        ) {
            throw new RuntimeException(
                'Backups require a valid local storage directory.'
            );
        }

        $backupId = (string) Str::uuid();

        $filename = 'ramyeon-backup-'
            . now()->format('Y-m-d_His')
            . '-'
            . Str::lower(Str::random(8))
            . '.sql.enc';

        $relativePath = $directory . '/' . $filename;

        $plaintextRelativePath = $directory
            . '/.' . $backupId . '.sql.tmp';

        $verificationRelativePath = $directory
            . '/.' . $backupId . '.verify.sql.tmp';

        $disk = Storage::disk($diskName);

        $outputPath = null;
        $encryptedPath = null;
        $verificationPath = null;

        $handle = null;
        $pdo = null;
        $transactionStarted = false;

        $plaintextCreated = false;
        $encryptedCreated = false;
        $verificationCreated = false;

        $record = BackupRecord::create([
            'backup_id' => $backupId,
            'type' => 'database',
            'status' => 'pending',
            'disk' => $diskName,
            'path' => $relativePath,
            'created_by' => $createdBy,
            'started_at' => now(),
            'encrypted' => false,
        ]);

        try {
            $disk->makeDirectory($directory);

            $outputPath = $disk->path($plaintextRelativePath);
            $encryptedPath = $disk->path($relativePath);
            $verificationPath = $disk->path($verificationRelativePath);

            // Exclusive creation prevents overwriting an existing temporary file.
            $handle = fopen($outputPath, 'xb');

            if ($handle === false) {
                $handle = null;

                throw new RuntimeException('backup_file_create_failed');
            }

            $plaintextCreated = true;

            $pdo = DB::connection($connectionName)->getPdo();
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Use a consistent snapshot for InnoDB tables.
            $pdo->exec(
                'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ'
            );

            $pdo->beginTransaction();
            $transactionStarted = true;

            $write = static function (string $content) use ($handle): void {
                $length = strlen($content);
                $written = 0;

                while ($written < $length) {
                    $count = fwrite($handle, substr($content, $written));

                    if ($count === false || $count === 0) {
                        throw new RuntimeException('backup_write_failed');
                    }

                    $written += $count;
                }
            };

            $write(
                "-- Ramyeon Corner SQL backup\n"
                . "-- Generated: " . now()->toIso8601String() . "\n"
                . "-- Database: " . $database['database'] . "\n\n"
                . "SET NAMES utf8mb4;\n"
                . "SET FOREIGN_KEY_CHECKS=0;\n\n"
            );

            $tables = $pdo->query('SHOW FULL TABLES')
                ->fetchAll(PDO::FETCH_NUM);

            // Fail closed rather than silently omitting views or other objects.
            foreach ($tables as $tableInfo) {
                if (($tableInfo[1] ?? '') !== 'BASE TABLE') {
                    throw new RuntimeException(
                        'unsupported_database_object'
                    );
                }
            }

            usort(
                $tables,
                static fn (array $a, array $b): int =>
                    strcmp($a[0], $b[0])
            );

            // Pass 1: create every table before inserting any data.
            foreach ($tables as $tableInfo) {
                $tableName = $tableInfo[0];
                $quotedTable = '`'
                    . str_replace('`', '``', $tableName)
                    . '`';

                $result = $pdo->query(
                    "SHOW CREATE TABLE {$quotedTable}"
                )->fetch(PDO::FETCH_NUM);

                if (! is_array($result) || ! isset($result[1])) {
                    throw new RuntimeException(
                        'table_schema_export_failed'
                    );
                }

                $write(
                    "\n-- Structure for {$quotedTable}\n"
                    . "DROP TABLE IF EXISTS {$quotedTable};\n"
                    . $result[1] . ";\n\n"
                );
            }

            // Pass 2: export table rows after all table definitions.
            foreach ($tables as $tableInfo) {
                $tableName = $tableInfo[0];
                $quotedTable = '`'
                    . str_replace('`', '``', $tableName)
                    . '`';

                $columns = $pdo->query(
                    "SHOW FULL COLUMNS FROM {$quotedTable}"
                )->fetchAll(PDO::FETCH_ASSOC);

                $insertColumns = [];
                $binaryColumns = [];

                foreach ($columns as $column) {
                    $columnName = $column['Field'];
                    $type = strtolower((string) $column['Type']);
                    $extra = strtolower((string) ($column['Extra'] ?? ''));

                    // Generated values must be calculated by MySQL on restore.
                    if (
                        str_contains($extra, 'generated') ||
                        str_contains($extra, 'virtual')
                    ) {
                        continue;
                    }

                    // Spatial values need a dedicated spatial exporter.
                    if (preg_match(
                        '/^(geometry|point|linestring|polygon|multipoint|multilinestring|multipolygon|geometrycollection)(\(|$)/',
                        $type
                    )) {
                        throw new RuntimeException(
                            'unsupported_column_type'
                        );
                    }

                    $insertColumns[] = $columnName;

                    if (
                        preg_match(
                            '/^(binary|varbinary|tinyblob|blob|mediumblob|longblob|bit)(\(|$)/',
                            $type
                        )
                    ) {
                        $binaryColumns[$columnName] = true;
                    }
                }

                if ($insertColumns === []) {
                    // No insertable columns; do not fabricate row data.
                    continue;
                }

                $quotedColumns = array_map(
                    static fn (string $column): string =>
                        '`' . str_replace('`', '``', $column) . '`',
                    $insertColumns
                );

                // Stream rows to reduce PHP memory usage for large tables.
                $pdo->setAttribute(
                    PDO::MYSQL_ATTR_USE_BUFFERED_QUERY,
                    false
                );

                try {
                    if ($tableName === 'backup_records') {
                        $statement = $pdo->prepare(
                            "SELECT * FROM {$quotedTable} WHERE `backup_id` <> :backup_id"
                        );

                        $statement->execute([
                            'backup_id' => $backupId,
                        ]);
                    } else {
                        $statement = $pdo->query(
                            "SELECT * FROM {$quotedTable}"
                        );
                    }

                    $rowCount = 0;

                    while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
                        $values = [];

                        foreach ($insertColumns as $columnName) {
                            $value = $row[$columnName];

                            if ($value === null) {
                                $values[] = 'NULL';
                            } elseif (isset($binaryColumns[$columnName])) {
                                $values[] = '0x' . bin2hex((string) $value);
                            } else {
                                $quotedValue = $pdo->quote((string) $value);

                                if ($quotedValue === false) {
                                    throw new RuntimeException(
                                        'backup_value_encoding_failed'
                                    );
                                }

                                $values[] = $quotedValue;
                            }
                        }

                        $write(
                            'INSERT INTO ' . $quotedTable
                            . ' (' . implode(', ', $quotedColumns) . ') VALUES ('
                            . implode(', ', $values) . ");\n"
                        );

                        $rowCount++;
                    }

                    $statement->closeCursor();

                    $write(
                        "-- Exported {$rowCount} rows from {$quotedTable}\n\n"
                    );
                } finally {
                    $pdo->setAttribute(
                        PDO::MYSQL_ATTR_USE_BUFFERED_QUERY,
                        true
                    );
                }
            }

            $write("\nSET FOREIGN_KEY_CHECKS=1;\n");

            if (! fflush($handle)) {
                throw new RuntimeException('backup_flush_failed');
            }

            if (function_exists('fsync') && ! fsync($handle)) {
                throw new RuntimeException('backup_sync_failed');
            }

            fclose($handle);
            $handle = null;

            $pdo->commit();
            $transactionStarted = false;

            // Encrypt the completed SQL export.
            app(BackupEncryptionService::class)->encryptFile(
                $outputPath,
                $encryptedPath
            );

            $encryptedCreated = true;

            // Authenticate the encrypted artifact through a separate
            // temporary plaintext file.
            app(BackupEncryptionService::class)->decryptFile(
                $encryptedPath,
                $verificationPath
            );

            $verificationCreated = true;

            $originalChecksum = hash_file('sha256', $outputPath);
            $verificationChecksum = hash_file('sha256', $verificationPath);

            if (
                $originalChecksum === false ||
                $verificationChecksum === false ||
                ! hash_equals($originalChecksum, $verificationChecksum)
            ) {
                throw new RuntimeException(
                    'backup_encryption_verification_failed'
                );
            }

            // Remove plaintext before marking the backup completed.
            if (! $disk->delete($plaintextRelativePath)) {
                throw new RuntimeException(
                    'backup_plaintext_cleanup_failed'
                );
            }

            $plaintextCreated = false;

            if (! $disk->delete($verificationRelativePath)) {
                throw new RuntimeException(
                    'backup_verification_cleanup_failed'
                );
            }

            $verificationCreated = false;

            clearstatcache(true, $encryptedPath);

            $fileSizeBytes = filesize($encryptedPath);
            $checksum = hash_file('sha256', $encryptedPath);

            if (
                $fileSizeBytes === false ||
                $fileSizeBytes <= 0 ||
                $checksum === false
            ) {
                throw new RuntimeException('integrity_metadata_failed');
            }

            $record->update([
                'status' => 'completed',
                'file_size_bytes' => $fileSizeBytes,
                'sha256' => $checksum,
                'encrypted' => true,
                'verified_at' => now(),
                'completed_at' => now(),
                'failure_code' => null,
                'failure_message' => null,
            ]);

            try {
                app(AuditLogger::class)->record(
                    'backup.created',
                    'Encrypted database backup file generated and stored.',
                    null,
                    ['file_size_bytes' => $fileSizeBytes],
                );
            } catch (Throwable $auditException) {
                Log::error('Database backup audit logging failed.', [
                    'backup_id' => $backupId,
                    'exception' => $auditException::class,
                ]);
            }

            return $record->fresh();
        } catch (Throwable $exception) {
            if (is_resource($handle)) {
                fclose($handle);
            }

            if (
                $transactionStarted &&
                $pdo instanceof PDO &&
                $pdo->inTransaction()
            ) {
                try {
                    $pdo->rollBack();
                } catch (Throwable $rollbackException) {
                    Log::error('Backup snapshot rollback failed.', [
                        'backup_id' => $backupId,
                        'exception' => $rollbackException::class,
                    ]);
                }
            }

            // Attempt every cleanup independently so one failure
            // does not prevent the remaining temporary files being removed.
            $cleanupFiles = [
                $plaintextCreated ? $plaintextRelativePath : null,
                $verificationCreated ? $verificationRelativePath : null,
                $encryptedCreated ? $relativePath : null,
            ];

            foreach ($cleanupFiles as $cleanupPath) {
                if ($cleanupPath === null) {
                    continue;
                }

                try {
                    if (! $disk->delete($cleanupPath)) {
                        Log::warning('Backup artifact cleanup was unsuccessful.', [
                            'backup_id' => $backupId,
                            'path' => $cleanupPath,
                        ]);
                    }
                } catch (Throwable $cleanupException) {
                    Log::warning('Backup artifact cleanup failed.', [
                        'backup_id' => $backupId,
                        'path' => $cleanupPath,
                        'exception' => $cleanupException::class,
                    ]);
                }
            }

            $message = $exception->getMessage();

            $knownFailures = [
                'backup_file_create_failed',
                'backup_write_failed',
                'backup_flush_failed',
                'backup_sync_failed',
                'table_schema_export_failed',
                'unsupported_database_object',
                'unsupported_column_type',
                'backup_value_encoding_failed',
                'integrity_metadata_failed',
                'backup_encryption_verification_failed',
                'backup_plaintext_cleanup_failed',
                'backup_verification_cleanup_failed',
            ];

            $failureCode = in_array($message, $knownFailures, true)
                ? $message
                : 'backup_exception';

            $record->update([
                'status' => 'failed',
                'encrypted' => false,
                'failure_code' => $failureCode,
                'failure_message' =>
                    'The backup operation could not be completed.',
            ]);

            Log::error('Database backup failed.', [
                'connection' => $connectionName,
                'backup_id' => $backupId,
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
            ]);

            return $record->fresh();
        }
    }
}
