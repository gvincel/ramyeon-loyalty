<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

final class DatabaseRestoreStateStore
{
    private const DIRECTORY = 'recovery';
    private const STATE_FILE = 'restore-state.json';
    private const LOCK_FILE = 'restore.lock';

    private const ALLOWED_STATUSES = [
        'prepared',
        'applying',
        'recovery_needed',
        'applied_verified',
        'recovered',
    ];

    /**
     * Acquire an exclusive process lock.
     *
     * @return resource
     */
    public function acquireLock()
    {
        $this->ensurePrivateDirectory();

        $handle = fopen($this->lockPath(), 'c');

        if ($handle === false) {
            throw new RuntimeException(
                'Unable to open the private database restore lock.'
            );
        }

        if (! flock($handle, LOCK_EX | LOCK_NB)) {
            fclose($handle);

            throw new RuntimeException(
                'Another database restoration or recovery operation is already running.'
            );
        }

        return $handle;
    }

    /**
     * @param resource $handle
     */
    public function releaseLock($handle): void
    {
        if (! is_resource($handle)) {
            return;
        }

        flock($handle, LOCK_UN);
        fclose($handle);
    }

    public function write(array $state): void
    {
        $this->validateState($state);
        $this->ensurePrivateDirectory();

        $payload = [
            'version' => 1,
            'status' => $state['status'],
            'backup_id' => $state['backup_id'],
            'safety_backup_id' => $state['safety_backup_id'],
            'restore_connection' => $state['restore_connection'],
            'restore_database' => $state['restore_database'],
            'created_at' => $state['created_at'] ?? now()->toIso8601String(),
            'updated_at' => now()->toIso8601String(),
        ];

        $payloadJson = json_encode(
            $payload,
            JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
        );

        $envelope = json_encode([
            'payload' => $payload,
            'mac' => hash_hmac(
                'sha256',
                $payloadJson,
                $this->applicationKey()
            ),
        ], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);

        $temporaryPath = $this->statePath()
            . '.'
            . Str::uuid()
            . '.tmp';

        $handle = fopen($temporaryPath, 'xb');

        if ($handle === false) {
            throw new RuntimeException(
                'Unable to create the temporary restore-state journal.'
            );
        }

        try {
            $length = strlen($envelope);
            $offset = 0;

            while ($offset < $length) {
                $written = fwrite(
                    $handle,
                    substr($envelope, $offset)
                );

                if ($written === false || $written === 0) {
                    throw new RuntimeException(
                        'Unable to write the restore-state journal.'
                    );
                }

                $offset += $written;
            }

            if (! fflush($handle)) {
                throw new RuntimeException(
                    'Unable to flush the restore-state journal to disk.'
                );
            }
        } finally {
            fclose($handle);
        }

        try {
            if (function_exists('chmod')) {
                @chmod($temporaryPath, 0600);
            }

            $statePath = $this->statePath();
            $previousPath = $this->previousStatePath();

            if (is_file($statePath)) {
                if (
                    is_file($previousPath) &&
                    ! unlink($previousPath)
                ) {
                    throw new RuntimeException(
                        'Unable to prepare the previous restore-state journal.'
                    );
                }

                if (! rename($statePath, $previousPath)) {
                    throw new RuntimeException(
                        'Unable to preserve the previous restore-state journal.'
                    );
                }
            }

            if (! rename($temporaryPath, $statePath)) {
                if (
                    ! is_file($statePath) &&
                    is_file($previousPath)
                ) {
                    @rename($previousPath, $statePath);
                }

                throw new RuntimeException(
                    'Unable to safely replace the restore-state journal.'
                );
            }

            if (
                is_file($previousPath) &&
                ! unlink($previousPath)
            ) {
                throw new RuntimeException(
                    'The new restore-state journal was written, but its previous copy could not be removed.'
                );
            }
        } finally {
            if (is_file($temporaryPath)) {
                @unlink($temporaryPath);
            }
        }
    }

    public function read(): ?array
    {
        $path = $this->statePath();

        if (! is_file($path)) {
            $path = $this->previousStatePath();
        }

        if (! is_file($path)) {
            return null;
        }

        $contents = file_get_contents($path);

        if ($contents === false || $contents === '') {
            throw new RuntimeException(
                'The restore-state journal is empty or unreadable.'
            );
        }

        try {
            $envelope = json_decode(
                $contents,
                true,
                512,
                JSON_THROW_ON_ERROR
            );
        } catch (Throwable $exception) {
            throw new RuntimeException(
                'The restore-state journal contains invalid data.',
                0,
                $exception
            );
        }

        if (
            ! is_array($envelope) ||
            ! is_array($envelope['payload'] ?? null) ||
            ! is_string($envelope['mac'] ?? null)
        ) {
            throw new RuntimeException(
                'The restore-state journal has an invalid structure.'
            );
        }

        $payloadJson = json_encode(
            $envelope['payload'],
            JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
        );

        $expectedMac = hash_hmac(
            'sha256',
            $payloadJson,
            $this->applicationKey()
        );

        if (! hash_equals($expectedMac, $envelope['mac'])) {
            throw new RuntimeException(
                'The restore-state journal authentication check failed. Manual inspection is required.'
            );
        }

        $this->validateState($envelope['payload']);

        if (($envelope['payload']['version'] ?? null) !== 1) {
            throw new RuntimeException(
                'The restore-state journal version is unsupported.'
            );
        }

        return $envelope['payload'];
    }

    public function clear(): void
    {
        foreach ([
            $this->previousStatePath(),
            $this->statePath(),
        ] as $path) {
            if (is_file($path) && ! unlink($path)) {
                throw new RuntimeException(
                    'Unable to remove the completed restore-state journal.'
                );
            }
        }
    }

    private function validateState(array $state): void
    {
        if (
            ! in_array($state['status'] ?? null, self::ALLOWED_STATUSES, true) ||
            ! is_string($state['backup_id'] ?? null) ||
            trim($state['backup_id']) === '' ||
            ! is_string($state['safety_backup_id'] ?? null) ||
            trim($state['safety_backup_id']) === '' ||
            ! is_string($state['restore_connection'] ?? null) ||
            trim($state['restore_connection']) === '' ||
            ! is_string($state['restore_database'] ?? null) ||
            trim($state['restore_database']) === ''
        ) {
            throw new RuntimeException(
                'The restore-state journal contains incomplete or unsupported recovery information.'
            );
        }
    }

    private function ensurePrivateDirectory(): void
    {
        if (config('filesystems.disks.local.driver') !== 'local') {
            throw new RuntimeException(
                'Restore recovery state requires private local storage.'
            );
        }

        $disk = Storage::disk('local');

        if (! $disk->exists(self::DIRECTORY)) {
            $disk->makeDirectory(self::DIRECTORY);
        }

        $directoryPath = $disk->path(self::DIRECTORY);

        if (! is_dir($directoryPath) || ! is_writable($directoryPath)) {
            throw new RuntimeException(
                'The private restore recovery directory is unavailable or not writable.'
            );
        }
    }

    private function statePath(): string
    {
        return Storage::disk('local')->path(
            self::DIRECTORY . '/' . self::STATE_FILE
        );
    }

    private function lockPath(): string
    {
        return Storage::disk('local')->path(
            self::DIRECTORY . '/' . self::LOCK_FILE
        );
    }

    private function previousStatePath(): string
    {
        return $this->statePath() . '.previous';
    }

    private function applicationKey(): string
    {
        $key = config('app.key');

        if (! is_string($key) || $key === '') {
            throw new RuntimeException(
                'The application key is required to authenticate restore recovery state.'
            );
        }

        return $key;
    }
}