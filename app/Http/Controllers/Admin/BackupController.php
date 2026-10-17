<?php

namespace App\Http\Controllers\Admin;

use App\Services\AuditLogger;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

class BackupController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Backups');
    }

    public function store(): BinaryFileResponse|RedirectResponse
    {
        $connection = config('database.default');
        $database = config("database.connections.{$connection}");

        if (
            ! in_array($connection, ['mysql', 'mariadb'], true) ||
            empty($database['host']) ||
            empty($database['database']) ||
            empty($database['username'])
        ) {
            return back()->with(
                'error',
                'The database backup configuration is incomplete or unsupported.'
            );
        }

        $dumpPath = config('backup.mysqldump_path');

        if (! is_string($dumpPath) || ! is_executable($dumpPath)) {
            return back()->with(
                'error',
                'The database backup utility is unavailable. Please contact the system administrator.'
            );
        }

        $directory = config('backup.directory');

        $filename = 'ramyeon-backup-'
            . now()->format('Y-m-d_His')
            . '-'
            . Str::lower(Str::random(8))
            . '.sql';

        $relativePath = $directory . '/' . $filename;

        $disk = null;

        try {
            $disk = Storage::disk(config('backup.disk'));
            $disk->makeDirectory($directory);

            if (! is_dir($disk->path($directory))) {
                Log::error('Database backup directory could not be created.', [
                    'connection' => $connection,
                ]);

                return back()->with(
                    'error',
                    'The backup directory is unavailable. Please contact the system administrator.'
                );
            }

            $outputPath = $disk->path($relativePath);

            $command = [
                $dumpPath,
                '--single-transaction',
                '--routines',
                '--triggers',
                '--events',
                '--hex-blob',
                '--default-character-set=utf8mb4',
                '--host=' . $database['host'],
                '--port=' . $database['port'],
                '--user=' . $database['username'],
                '--result-file=' . $outputPath,
                $database['database'],
            ];

            $result = Process::timeout(300)
                ->env([
                    'MYSQL_PWD' => $database['password'] ?? '',
                ])
                ->run($command);

            if (! $result->successful()) {
                $disk->delete($relativePath);

                Log::error('Database backup process failed.', [
                    'connection' => $connection,
                    'exit_code' => $result->exitCode(),
                ]);

                return back()->with(
                    'error',
                    'The database backup failed. Please try again or contact the system administrator.'
                );
            }

            if (
                ! $disk->exists($relativePath) ||
                $disk->size($relativePath) === 0
            ) {
                $disk->delete($relativePath);

                Log::error('Database backup produced no usable output.', [
                    'connection' => $connection,
                ]);

                return back()->with(
                    'error',
                    'The database backup did not produce a valid file.'
                );
            }

            $fileSizeBytes = (int) $disk->size($relativePath);

            $response = response()
                ->download($disk->path($relativePath), $filename)
                ->deleteFileAfterSend(true);

            app(AuditLogger::class)->record(
                'backup.created',
                'Database backup file generated successfully.',
                null,
                [
                    'file_size_bytes' => $fileSizeBytes,
                ],
            );

            return $response;
        } catch (Throwable $exception) {
            if ($disk !== null) {
                try {
                    $disk->delete($relativePath);
                } catch (Throwable $cleanupException) {
                    Log::warning('Failed to clean up an incomplete database backup.', [
                        'connection' => $connection,
                    ]);
                }
            }

            Log::error('Database backup encountered an exception.', [
                'connection' => $connection,
                'exception' => $exception::class,
            ]);

            return back()->with(
                'error',
                'The database backup could not be completed. Please try again.'
            );
        }
    }
}
