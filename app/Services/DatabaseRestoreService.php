<?php

namespace App\Services;

use App\Models\BackupRecord;
use Generator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PDO;
use RuntimeException;
use Throwable;

final class DatabaseRestoreService
{
    public function __construct(
        private readonly DatabaseBackupService $backupService,
        private readonly BackupEncryptionService $encryptionService,
        private readonly DatabaseRestoreStateStore $stateStore,
    ) {
    }

    /**
     * Restore a previously verified encrypted backup into the
     * separately configured restoration database.
     *
     * The main application database is explicitly prohibited.
     */
    public function restore(
        BackupRecord $backup,
        ?int $restoredBy = null,
        bool $production = false
    ): array {
        $lock = $this->stateStore->acquireLock();

        try {
            if ($this->stateStore->read() !== null) {
                throw new RuntimeException(
                    'A previous restoration journal exists. Recover or inspect that operation before starting another restore.'
                );
            }

            return $this->restoreLocked($backup, $restoredBy, $production);
        } finally {
            $this->stateStore->releaseLock($lock);
        }
    }

    private function restoreLocked(
        BackupRecord $backup,
        ?int $restoredBy = null,
        bool $production = false
    ): array {
        $connectionName = $this->restoreConnectionName($production);
        $database = $this->assertSafeTarget($connectionName, $production);

        $this->assertEligibleBackup($backup);

        $diskName = $backup->disk;
        $disk = Storage::disk($diskName);
        $directory = $this->backupDirectory();

        $backupPath = $disk->path($backup->path);

        $this->assertPathInsideDirectory(
            $backupPath,
            $disk->path($directory)
        );

        $temporaryRelativePath = $directory
            . '/.restore-'
            . Str::uuid()
            . '.sql.tmp';

        $temporaryPath = $disk->path($temporaryRelativePath);

        $safetyBackup = null;
        $restoreStarted = false;

        try {
            // Recheck the encrypted artifact immediately before restoration.
            $this->assertBackupIntegrity($backup, $backupPath);

            // Decrypt into private temporary storage.
            $this->encryptionService->decryptFile(
                $backupPath,
                $temporaryPath
            );

            $this->assertSqlHeader($temporaryPath);

            // Inspect the entire SQL dump before making any database changes.
            $expected = $this->inspectSql($temporaryPath);

            // Confirm that the restoration database contains only base tables.
            $this->assertTargetContainsOnlyBaseTables($connectionName);

            // Create an encrypted safety backup from the ACTUAL restore target.
            // BackupRecord metadata remains in the application's normal database.
            $safetyBackup = $this->backupService->create(
                $restoredBy,
                $connectionName
            );

            if (
                $safetyBackup->status !== 'completed' ||
                ! $safetyBackup->encrypted ||
                blank($safetyBackup->sha256) ||
                $safetyBackup->file_size_bytes === null
            ) {
                throw new RuntimeException(
                    'The restoration safety backup could not be completed.'
                );
            }

            // Verify the safety backup artifact before relying on it.
            $this->assertBackupIntegrity(
                $safetyBackup,
                Storage::disk($safetyBackup->disk)
                    ->path($safetyBackup->path)
            );

            $restoreState = [
                'status' => 'prepared',
                'backup_id' => (string) $backup->backup_id,
                'safety_backup_id' => (string) $safetyBackup->backup_id,
                'safety_backup_disk' => (string) $safetyBackup->disk,
                'safety_backup_path' => (string) $safetyBackup->path,
                'safety_backup_file_size_bytes' => (int) $safetyBackup->file_size_bytes,
                'safety_backup_sha256' => (string) $safetyBackup->sha256,
                'restore_connection' => $connectionName,
                'production_restore' => $production,
                'restore_database' => (string) $database['database'],
                'safety_backup_verified_at' => $safetyBackup->verified_at?->toISOString(),
            ];

            // Persist recovery information before any destructive SQL.
            $this->stateStore->write($restoreState);

            $restoreState['status'] = 'applying';
            $this->stateStore->write($restoreState);

            $restoreStarted = true;

            try {
                $result = $this->applySql(
                    $temporaryPath,
                    $connectionName,
                    $expected
                );
            } catch (Throwable $restoreException) {
                $restoreState['status'] = 'recovery_needed';

                try {
                    $this->stateStore->write($restoreState);
                } catch (Throwable $journalException) {
                    Log::critical('Failed to persist the restore recovery state.', [
                        'backup_id' => $backup->backup_id,
                        'safety_backup_id' => $safetyBackup->backup_id,
                        'exception' => $journalException::class,
                    ]);
                }

                Log::error('Database restoration failed. Attempting recovery.', [
                    'backup_id' => $backup->backup_id,
                    'safety_backup_id' => $safetyBackup->backup_id,
                    'exception' => $restoreException::class,
                    'message' => $restoreException->getMessage(),
                ]);

                try {
                    $recoveryResult = $this->recoverFromSafetyBackup(
                        $safetyBackup,
                        $connectionName,
                        $directory
                    );

                    try {
                        $restoreState['status'] = 'recovered';
                        $this->stateStore->write($restoreState);
                        $this->stateStore->clear();
                    } catch (Throwable $journalException) {
                        Log::critical('Safety recovery succeeded but its journal could not be finalized.', [
                            'backup_id' => $backup->backup_id,
                            'safety_backup_id' => $safetyBackup->backup_id,
                            'exception' => $journalException::class,
                        ]);
                    }

                    try {
                        app(AuditLogger::class)->record(
                            'backup.recovery_succeeded',
                            'Verification database recovered from its safety backup after a failed restore.',
                            null,
                            [
                                'backup_id' => $backup->backup_id,
                                'safety_backup_id' => $safetyBackup->backup_id,
                                'restore_connection' => $connectionName,
                                'tables_restored' => $recoveryResult['tables_restored'],
                                'rows_restored' => $recoveryResult['rows_restored'],
                                'restore_exception' => $restoreException::class,
                            ],
                        );
                    } catch (Throwable $auditException) {
                        Log::error('Safety recovery audit logging failed.', [
                            'backup_id' => $backup->backup_id,
                            'safety_backup_id' => $safetyBackup->backup_id,
                            'exception' => $auditException::class,
                        ]);
                    }
                } catch (Throwable $recoveryException) {
                    Log::critical(
                        'Database restoration and safety recovery both failed.',
                        [
                            'backup_id' => $backup->backup_id,
                            'safety_backup_id' => $safetyBackup->backup_id,
                            'restore_exception' => $restoreException::class,
                            'recovery_exception' => $recoveryException::class,
                            'recovery_message' => $recoveryException->getMessage(),
                        ]
                    );

                    throw new RuntimeException(
                        'Restoration failed and automatic recovery could not be confirmed. '
                        . 'The verification database requires immediate inspection.',
                        0,
                        $recoveryException
                    );
                }

                throw new RuntimeException(
                    'The selected backup could not be restored. '
                    . 'The verification database was recovered from its safety backup.',
                    0,
                    $restoreException
                );
            }

            $restoreState['status'] = 'applied_verified';

            try {
                $this->stateStore->write($restoreState);
            } catch (Throwable $journalException) {
                Log::critical('Restore was applied and verified, but its journal could not be finalized.', [
                    'backup_id' => $backup->backup_id,
                    'safety_backup_id' => $safetyBackup->backup_id,
                    'exception' => $journalException::class,
                ]);

                throw new RuntimeException(
                    'The restore was applied and verified, but its recovery journal could not be finalized. Inspect the recovery journal before attempting another restore.',
                    0,
                    $journalException
                );
            }

            try {
                app(AuditLogger::class)->record(
                    'backup.restored',
                    'Encrypted database backup restored and verified.',
                    null,
                    [
                        'backup_id' => $backup->backup_id,
                        'safety_backup_id' => $safetyBackup->backup_id,
                        'restore_connection' => $connectionName,
                        'tables_restored' => $result['tables_restored'],
                        'rows_restored' => $result['rows_restored'],
                    ],
                );
            } catch (Throwable $auditException) {
                Log::error('Database restoration audit logging failed.', [
                    'backup_id' => $backup->backup_id,
                    'exception' => $auditException::class,
                ]);
            }

            try {
                $this->stateStore->clear();
            } catch (Throwable $journalException) {
                Log::critical('Completed restore journal cleanup failed.', [
                    'backup_id' => $backup->backup_id,
                    'exception' => $journalException::class,
                ]);
            }

            return [
                'backup_id' => $backup->backup_id,
                'safety_backup_id' => $safetyBackup->backup_id,
                'database' => $database['database'],
                'tables_restored' => $result['tables_restored'],
                'rows_restored' => $result['rows_restored'],
            ];
        } catch (Throwable $exception) {
            try {
                app(AuditLogger::class)->record(
                    'backup.restore_failed',
                    'Database backup restoration did not complete.',
                    null,
                    [
                        'backup_id' => $backup->backup_id,
                        'safety_backup_id' => $safetyBackup?->backup_id,
                        'restore_started' => $restoreStarted,
                    ],
                );
            } catch (Throwable $auditException) {
                Log::error('Failed to record restoration failure.', [
                    'backup_id' => $backup->backup_id,
                    'exception' => $auditException::class,
                ]);
            }

            throw $exception;
        } finally {
            // Decrypted SQL must never be retained.
            try {
                if ($disk->exists($temporaryRelativePath)) {
                    $disk->delete($temporaryRelativePath);
                }
            } catch (Throwable $cleanupException) {
                Log::critical('Restore temporary file cleanup failed.', [
                    'backup_id' => $backup->backup_id,
                    'exception' => $cleanupException::class,
                ]);
            }
        }
    }

    /**
     * Recover an interrupted restoration using its authenticated safety journal.
     */
    public function recoverInterruptedRestore(): array
    {
        $lock = $this->stateStore->acquireLock();

        try {
            $state = $this->stateStore->read();

            if ($state === null) {
                return ['status' => 'none'];
            }

            $previousStatus = $state['status'];

            // These states indicate that destructive restoration is not pending.
            if (in_array($previousStatus, [
                'prepared',
                'applied_verified',
                'recovered',
            ], true)) {
                $this->stateStore->clear();

                return [
                    'status' => 'cleared',
                    'previous_status' => $previousStatus,
                ];
            }

            $production = (bool) ($state['production_restore'] ?? false);

            $connectionName = $this->restoreConnectionName($production);

            if (! hash_equals(
                $connectionName,
                $state['restore_connection']
            )) {
                throw new RuntimeException(
                    'The configured restore connection does not match the recovery journal.'
                );
            }

            $database = $this->assertSafeTarget($connectionName, $production);

            if (strcasecmp(
                (string) $database['database'],
                $state['restore_database']
            ) !== 0) {
                throw new RuntimeException(
                    'The configured restore database does not match the recovery journal.'
                );
            }

            // backup_id is a unique string column, not the model primary key.
            $safetyBackup = new BackupRecord([
                'backup_id' => $state['safety_backup_id'],
                'status' => 'completed',
                'disk' => $state['safety_backup_disk'],
                'path' => $state['safety_backup_path'],
                'file_size_bytes' => $state['safety_backup_file_size_bytes'],
                'sha256' => $state['safety_backup_sha256'],
                'encrypted' => true,
                'verified_at' => $state['safety_backup_verified_at'],
            ]);

            $this->assertEligibleBackup($safetyBackup);

            $recoveryResult = $this->recoverFromSafetyBackup(
                $safetyBackup,
                $connectionName,
                $this->backupDirectory()
            );

            try {
                app(AuditLogger::class)->record(
                    'backup.recovery_succeeded',
                    'Verification database recovered from its safety backup after an interrupted restoration.',
                    null,
                    [
                        'backup_id' => $state['backup_id'],
                        'safety_backup_id' => $safetyBackup->backup_id,
                        'restore_connection' => $connectionName,
                        'tables_restored' => $recoveryResult['tables_restored'],
                        'rows_restored' => $recoveryResult['rows_restored'],
                        'interrupted_restore' => true,
                    ],
                );
            } catch (Throwable $auditException) {
                Log::error('Interrupted restore recovery audit logging failed.', [
                    'safety_backup_id' => $safetyBackup->backup_id,
                    'exception' => $auditException::class,
                ]);
            }

            $state['status'] = 'recovered';
            $this->stateStore->write($state);
            $this->stateStore->clear();

            return [
                'status' => 'recovered',
                'safety_backup_id' => $safetyBackup->backup_id,
                'tables_restored' => $recoveryResult['tables_restored'],
                'rows_restored' => $recoveryResult['rows_restored'],
            ];
        } finally {
            $this->stateStore->releaseLock($lock);
        }
    }

    private function restoreConnectionName(bool $production = false): string
    {
        if ($production) {
            if (! config('backup.allow_production_restore', false)) {
                throw new RuntimeException(
                    'Production database restoration is disabled.'
                );
            }

            $connectionName = config('database.default');

            if (
                ! is_string($connectionName) ||
                trim($connectionName) === ''
            ) {
                throw new RuntimeException(
                    'The main application database connection is invalid.'
                );
            }

            return $connectionName;
        }

        $connectionName = config('backup.restore_connection');

        if (
            ! is_string($connectionName) ||
            trim($connectionName) === ''
        ) {
            throw new RuntimeException(
                'A dedicated restoration database connection is required.'
            );
        }

        if ($connectionName === config('database.default')) {
            throw new RuntimeException(
                'The main application database cannot be used as a restoration target.'
            );
        }

        return $connectionName;
    }

    private function assertSafeTarget(
        string $connectionName,
        bool $production = false
    ): array {
        $target = config("database.connections.{$connectionName}");
        $mainConnectionName = config('database.default');
        $main = config("database.connections.{$mainConnectionName}");

        if (
            ! is_array($target) ||
            ! is_array($main) ||
            ! in_array($target['driver'] ?? null, ['mysql', 'mariadb'], true) ||
            empty($target['host']) ||
            empty($target['database']) ||
            empty($target['username']) ||
            empty($main['database'])
        ) {
            throw new RuntimeException(
                'The restoration database configuration is invalid or unsupported.'
            );
        }

        if ($production) {
            if (
                ! config('backup.allow_production_restore', false) ||
                $connectionName !== $mainConnectionName
            ) {
                throw new RuntimeException(
                    'The production restoration target is not authorized.'
                );
            }
        } elseif (
            strcasecmp(
                (string) $target['database'],
                (string) $main['database']
            ) === 0
        ) {
            throw new RuntimeException(
                'The restoration target cannot be the main application database.'
            );
        }

        $targetPdo = DB::connection($connectionName)->getPdo();

        $actualTargetDatabase = $targetPdo
            ->query('SELECT DATABASE()')
            ->fetchColumn();

        if (
            ! is_string($actualTargetDatabase) ||
            strcasecmp(
                $actualTargetDatabase,
                (string) $target['database']
            ) !== 0
        ) {
            throw new RuntimeException(
                'The restoration connection is not connected to its configured database.'
            );
        }

        if (
            ! $production &&
            in_array($main['driver'] ?? null, ['mysql', 'mariadb'], true)
        ) {
            $mainPdo = DB::connection($mainConnectionName)->getPdo();

            $actualMainDatabase = $mainPdo
                ->query('SELECT DATABASE()')
                ->fetchColumn();

            if (
                ! is_string($actualMainDatabase) ||
                $actualMainDatabase === ''
            ) {
                throw new RuntimeException(
                    'Could not verify the active application database.'
                );
            }

            if (
                strcasecmp(
                    $actualTargetDatabase,
                    $actualMainDatabase
                ) === 0
            ) {
                throw new RuntimeException(
                    'The restoration target cannot be the live application database.'
                );
            }
        }

        return $target;
    }

    private function assertEligibleBackup(BackupRecord $backup): void
    {
        if (
            $backup->status !== 'completed' ||
            ! $backup->encrypted ||
            $backup->verified_at === null ||
            blank($backup->path) ||
            blank($backup->sha256) ||
            $backup->file_size_bytes === null ||
            $backup->file_size_bytes <= 0
        ) {
            throw new RuntimeException(
                'Only completed, encrypted, integrity-verified backups can be restored.'
            );
        }

        if (
            $backup->disk !== config('backup.disk') ||
            config("filesystems.disks.{$backup->disk}.driver") !== 'local'
        ) {
            throw new RuntimeException(
                'The selected backup uses an unsupported storage disk.'
            );
        }

        $directory = $this->backupDirectory();

        if (
            str_contains($backup->path, '..') ||
            ! str_starts_with($backup->path, $directory . '/')
        ) {
            throw new RuntimeException(
                'The selected backup path is invalid.'
            );
        }
    }

    private function assertBackupIntegrity(
        BackupRecord $backup,
        string $absolutePath
    ): void {
        if (! is_file($absolutePath)) {
            throw new RuntimeException('The backup file does not exist.');
        }

        clearstatcache(true, $absolutePath);

        $size = filesize($absolutePath);
        $hash = hash_file('sha256', $absolutePath);

        if (
            $size === false ||
            $hash === false ||
            $size !== (int) $backup->file_size_bytes ||
            ! hash_equals($backup->sha256, $hash)
        ) {
            throw new RuntimeException(
                'The backup file failed its size or SHA-256 integrity check.'
            );
        }
    }

    private function assertSqlHeader(string $path): void
    {
        $header = file_get_contents($path, false, null, 0, 128);

        if (
            $header === false ||
            ! str_starts_with(
                $header,
                "-- Ramyeon Corner SQL backup\n"
            )
        ) {
            throw new RuntimeException(
                'The decrypted file is not a recognized Ramyeon Corner SQL backup.'
            );
        }
    }

    private function backupDirectory(): string
    {
        $directory = trim(
            (string) config('backup.directory'),
            '/\\'
        );

        if (
            $directory === '' ||
            str_contains($directory, '..')
        ) {
            throw new RuntimeException(
                'The private backup directory is invalid.'
            );
        }

        return $directory;
    }

    private function assertPathInsideDirectory(
        string $filePath,
        string $directoryPath
    ): void {
        $realFile = realpath($filePath);
        $realDirectory = realpath($directoryPath);

        if (
            $realFile === false ||
            $realDirectory === false ||
            ! str_starts_with(
                $realFile,
                rtrim($realDirectory, DIRECTORY_SEPARATOR)
                    . DIRECTORY_SEPARATOR
            )
        ) {
            throw new RuntimeException(
                'The backup file is outside its permitted storage directory.'
            );
        }
    }

    private function assertTargetContainsOnlyBaseTables(
        string $connectionName
    ): void {
        $pdo = DB::connection($connectionName)->getPdo();

        $objects = $pdo->query('SHOW FULL TABLES')
            ->fetchAll(PDO::FETCH_NUM);

        foreach ($objects as $object) {
            if (($object[1] ?? '') !== 'BASE TABLE') {
                throw new RuntimeException(
                    'The restoration database contains an unsupported database object.'
                );
            }
        }
    }

    /**
     * Inspect the entire SQL file before destructive operations.
     * Only statements generated by DatabaseBackupService are accepted.
     */
    private function inspectSql(string $path): array
    {
        $createdTables = [];
        $droppedTables = [];
        $expectedRows = [];

        foreach ($this->statements($path) as $statement) {
            $statement = trim($statement);

            if ($statement === '') {
                continue;
            }

            if (preg_match(
                '/^SET\s+NAMES\s+utf8mb4(?:\s+COLLATE\s+[a-zA-Z0-9_]+)?$/i',
                $statement
            )) {
                continue;
            }

            if (preg_match(
                '/^SET\s+FOREIGN_KEY_CHECKS\s*=\s*[01]$/i',
                $statement
            )) {
                continue;
            }

            if (preg_match(
                '/^DROP\s+TABLE\s+IF\s+EXISTS\s+`((?:``|[^`])+)`$/is',
                $statement,
                $matches
            )) {
                $table = str_replace('``', '`', $matches[1]);
                $droppedTables[$table] = true;

                continue;
            }

            if (preg_match(
                '/^CREATE\s+TABLE\s+`((?:``|[^`])+)`\s*\(/is',
                $statement,
                $matches
            )) {
                $table = str_replace('``', '`', $matches[1]);

                if (isset($createdTables[$table])) {
                    throw new RuntimeException(
                        'The SQL backup contains a duplicate table definition.'
                    );
                }

                $createdTables[$table] = true;
                $expectedRows[$table] = 0;

                continue;
            }

            if (
                preg_match(
                    '/^INSERT\s+INTO\s+`((?:``|[^`])+)`\s*\(/is',
                    $statement,
                    $matches
                ) &&
                preg_match('/\)\s*VALUES\s*\(/is', $statement)
            ) {
                $table = str_replace('``', '`', $matches[1]);

                if (! isset($createdTables[$table])) {
                    throw new RuntimeException(
                        'The SQL backup attempts to insert into an undefined table.'
                    );
                }

                $expectedRows[$table]++;

                continue;
            }

            throw new RuntimeException(
                'The SQL backup contains an unsupported or unsafe SQL statement.'
            );
        }

        if (
            $createdTables === [] ||
            array_keys($createdTables) !== array_keys($droppedTables)
        ) {
            $created = array_keys($createdTables);
            $dropped = array_keys($droppedTables);

            sort($created);
            sort($dropped);

            if ($created !== $dropped || $created === []) {
                throw new RuntimeException(
                    'The SQL backup has incomplete or inconsistent table definitions.'
                );
            }
        }

        return [
            'tables' => array_keys($createdTables),
            'rows' => $expectedRows,
        ];
    }

    /**
     * Stream SQL statements without splitting semicolons inside quoted values.
     */
    private function statements(string $path): Generator
    {
        $handle = fopen($path, 'rb');

        if ($handle === false) {
            throw new RuntimeException(
                'Unable to read the decrypted SQL backup.'
            );
        }

        $statement = '';
        $quote = null;
        $pending = '';

        // Read one character, using the pending buffer when necessary.
        $read = static function () use ($handle, &$pending): string|false {
            if ($pending !== '') {
                $character = $pending[0];
                $pending = substr($pending, 1);

                return $character;
            }

            return fgetc($handle);
        };

        // Return lookahead characters to the reader.
        $push = static function (string $characters) use (&$pending): void {
            $pending = $characters . $pending;
        };

        try {
            while (($character = $read()) !== false) {
                if ($quote !== null) {
                    $statement .= $character;

                    if ($character === '\\' && $quote !== '`') {
                        $escaped = $read();

                        if ($escaped === false) {
                            throw new RuntimeException(
                                'The SQL backup contains an incomplete escape sequence.'
                            );
                        }

                        $statement .= $escaped;

                        continue;
                    }

                    if ($character === $quote) {
                        $next = $read();

                        if ($next === $quote) {
                            $statement .= $next;

                            continue;
                        }

                        if ($next !== false) {
                            $push($next);
                        }

                        $quote = null;
                    }

                    continue;
                }

                if (
                    $character === "'" ||
                    $character === '"' ||
                    $character === '`'
                ) {
                    $quote = $character;
                    $statement .= $character;

                    continue;
                }

                // Skip MySQL # line comments.
                if ($character === '#') {
                    while (
                        ($commentCharacter = $read()) !== false &&
                        $commentCharacter !== "\n"
                    ) {
                    }

                    $statement .= "\n";

                    continue;
                }

                // Skip MySQL -- comments only when followed by whitespace.
                if ($character === '-') {
                    $next = $read();
                    $third = $read();

                    if (
                        $next === '-' &&
                        (
                            $third === ' ' ||
                            $third === "\t" ||
                            $third === "\r" ||
                            $third === "\n" ||
                            $third === "\0"
                        )
                    ) {
                        while (
                            ($commentCharacter = $read()) !== false &&
                            $commentCharacter !== "\n"
                        ) {
                        }

                        $statement .= "\n";

                        continue;
                    }

                    $statement .= $character;

                    if ($next !== false) {
                        $statement .= $next;
                    }

                    if ($third !== false) {
                        $statement .= $third;
                    }

                    continue;
                }

                // Skip ordinary block comments and reject executable comments.
                if ($character === '/') {
                    $next = $read();

                    if ($next === '*') {
                        $third = $read();

                        if ($third === '!') {
                            throw new RuntimeException(
                                'Executable SQL comments are not permitted in backups.'
                            );
                        }

                        $previous = '';
                        $closed = false;

                        while (($commentCharacter = $read()) !== false) {
                            if ($previous === '*' && $commentCharacter === '/') {
                                $closed = true;
                                break;
                            }

                            $previous = $commentCharacter;
                        }

                        if (! $closed) {
                            throw new RuntimeException(
                                'The SQL backup contains an incomplete block comment.'
                            );
                        }

                        // Preserve token separation without introducing duplicate whitespace.
                        $nextCharacter = $read();
                        $previousCharacter = $statement !== ''
                            ? substr($statement, -1)
                            : '';

                        if (
                            $previousCharacter !== '' &&
                            ! ctype_space($previousCharacter) &&
                            $nextCharacter !== false &&
                            ! ctype_space($nextCharacter)
                        ) {
                            $statement .= ' ';
                        }

                        if ($nextCharacter !== false) {
                            $push($nextCharacter);
                        }

                        continue;
                    }

                    $statement .= '/';

                    if ($next !== false) {
                        $statement .= $next;
                    }

                    continue;
                }

                // A semicolon terminates a statement only outside quotes/comments.
                if ($character === ';') {
                    $completed = trim($statement);
                    $statement = '';

                    if ($completed !== '') {
                        yield $completed;
                    }

                    continue;
                }

                $statement .= $character;
            }

            if ($quote !== null) {
                throw new RuntimeException(
                    'The SQL backup contains an unterminated quoted value.'
                );
            }

            if (trim($statement) !== '') {
                throw new RuntimeException(
                    'The SQL backup contains an unterminated SQL statement.'
                );
            }
        } finally {
            fclose($handle);
        }
    }

    private function applySql(
        string $path,
        string $connectionName,
        array $expected
    ): array {
        $pdo = DB::connection($connectionName)->getPdo();

        $this->assertTargetContainsOnlyBaseTables($connectionName);

        // Disable FK checks while replacing the isolated verification schema.
        $pdo->exec('SET FOREIGN_KEY_CHECKS=0');

        try {
            // Remove all old tables, including tables absent from the backup.
            $existingTables = $pdo->query('SHOW FULL TABLES')
                ->fetchAll(PDO::FETCH_NUM);

            foreach ($existingTables as $object) {
                $table = (string) $object[0];

                $pdo->exec(
                    'DROP TABLE IF EXISTS ' . $this->quoteIdentifier($table)
                );
            }

            // Execute only statements that passed the complete preflight.
            foreach ($this->statements($path) as $statement) {
                $pdo->exec($statement);
            }
        } finally {
            $pdo->exec('SET FOREIGN_KEY_CHECKS=1');
        }

        return $this->verifyRestoredDatabase(
            $connectionName,
            $expected
        );
    }

    private function verifyRestoredDatabase(
        string $connectionName,
        array $expected
    ): array {
        $pdo = DB::connection($connectionName)->getPdo();

        $objects = $pdo->query('SHOW FULL TABLES')
            ->fetchAll(PDO::FETCH_NUM);

        $actualTables = [];

        foreach ($objects as $object) {
            if (($object[1] ?? '') !== 'BASE TABLE') {
                throw new RuntimeException(
                    'An unexpected database object exists after restoration.'
                );
            }

            $actualTables[] = (string) $object[0];
        }

        $expectedTables = $expected['tables'];

        sort($actualTables);
        sort($expectedTables);

        if ($actualTables !== $expectedTables) {
            throw new RuntimeException(
                'The restored database table list does not match the backup.'
            );
        }

        $totalRows = 0;

        foreach ($expected['rows'] as $table => $expectedCount) {
            $statement = $pdo->query(
                'SELECT COUNT(*) FROM ' . $this->quoteIdentifier($table)
            );

            $actualCount = (int) $statement->fetchColumn();

            if ($actualCount !== $expectedCount) {
                throw new RuntimeException(
                    'The restored row count does not match the backup for table: '
                    . $table
                );
            }

            $totalRows += $actualCount;
        }

        return [
            'tables_restored' => count($actualTables),
            'rows_restored' => $totalRows,
        ];
    }

    private function recoverFromSafetyBackup(
        BackupRecord $safetyBackup,
        string $connectionName,
        string $directory
    ): array {
        $disk = Storage::disk($safetyBackup->disk);

        $safetyPath = $disk->path($safetyBackup->path);

        $this->assertBackupIntegrity(
            $safetyBackup,
            $safetyPath
        );

        $temporaryRelativePath = $directory
            . '/.safety-restore-'
            . Str::uuid()
            . '.sql.tmp';

        $temporaryPath = $disk->path($temporaryRelativePath);

        try {
            $this->encryptionService->decryptFile(
                $safetyPath,
                $temporaryPath
            );

            $this->assertSqlHeader($temporaryPath);

            $expected = $this->inspectSql($temporaryPath);

            // This replaces any partial tables created by the failed attempt.
            return $this->applySql(
                $temporaryPath,
                $connectionName,
                $expected
            );
        } finally {
            if ($disk->exists($temporaryRelativePath)) {
                $disk->delete($temporaryRelativePath);
            }
        }
    }

    private function quoteIdentifier(string $identifier): string
    {
        return '`' . str_replace('`', '``', $identifier) . '`';
    }
}
