<?php

namespace Tests\Unit;

use App\Http\Middleware\DatabaseRestoreRequestLock;
use App\Services\DatabaseRestoreStateStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class DatabaseRestoreRequestLockTest extends TestCase
{
    private DatabaseRestoreStateStore $store;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        config([
            'app.key' => 'test-restore-journal-authentication-key',
        ]);

        $this->store = app(DatabaseRestoreStateStore::class);
    }

    private function validState(): array
    {
        return [
            'status' => 'applying',
            'backup_id' => 'backup-test-001',
            'safety_backup_id' => 'safety-test-001',
            'restore_connection' => 'restore_verify',
            'restore_database' => 'ramyeon_backup_restore_verify',
            'safety_backup_disk' => 'local',
            'safety_backup_path' => 'backups/safety-test-001.sql.enc',
            'safety_backup_file_size_bytes' => 1024,
            'safety_backup_sha256' => str_repeat('a', 64),
            'safety_backup_verified_at' => '2026-11-02T00:00:00+00:00',
        ];
    }

    public function test_it_allows_normal_requests_and_releases_the_shared_lock(): void
    {
        $middleware = new DatabaseRestoreRequestLock($this->store);

        $response = $middleware->handle(
            Request::create('/admin/backups', 'GET'),
            fn () => response('Request allowed')
        );

        $this->assertSame('Request allowed', $response->getContent());

        // An exclusive lock can be acquired after the request finishes.
        $lock = $this->store->acquireLock();

        $this->store->releaseLock($lock);
    }

    public function test_it_blocks_requests_when_a_recovery_journal_exists(): void
    {
        $this->store->write($this->validState());

        $middleware = new DatabaseRestoreRequestLock($this->store);

        try {
            $middleware->handle(
                Request::create('/admin/backups', 'GET'),
                fn () => response('Request allowed')
            );

            $this->fail('Expected the request to be blocked.');
        } catch (HttpException $exception) {
            $this->assertSame(503, $exception->getStatusCode());
        }

        // The shared lock must be released even when the request is blocked.
        $lock = $this->store->acquireLock();

        $this->store->releaseLock($lock);
    }

    public function test_it_blocks_requests_when_the_exclusive_lock_is_held(): void
    {
        $lock = $this->store->acquireLock();

        try {
            $middleware = new DatabaseRestoreRequestLock($this->store);

            try {
                $middleware->handle(
                    Request::create('/admin/backups', 'GET'),
                    fn () => response('Request allowed')
                );

                $this->fail('Expected the request to be blocked.');
            } catch (HttpException $exception) {
                $this->assertSame(503, $exception->getStatusCode());
            }
        } finally {
            $this->store->releaseLock($lock);
        }
    }

    public function test_it_blocks_requests_when_the_recovery_journal_cannot_be_verified(): void
    {
        $this->store->write($this->validState());

        $path = Storage::disk('local')->path(
            'recovery/restore-state.json'
        );

        $envelope = json_decode(
            file_get_contents($path),
            true,
            512,
            JSON_THROW_ON_ERROR
        );

        $envelope['payload']['status'] = 'recovered';

        file_put_contents(
            $path,
            json_encode($envelope, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR)
        );

        $middleware = new DatabaseRestoreRequestLock($this->store);

        try {
            $middleware->handle(
                Request::create('/admin/backups', 'GET'),
                fn () => response('Request allowed')
            );

            $this->fail('Expected the request to be blocked.');
        } catch (HttpException $exception) {
            $this->assertSame(503, $exception->getStatusCode());
        }
    }

    public function test_restore_route_bypasses_the_shared_lock(): void
    {
        $lock = $this->store->acquireLock();

        try {
            $middleware = new DatabaseRestoreRequestLock($this->store);

            $request = Request::create(
                route('admin.backups.restore', ['backupRecord' => 1]),
                'POST'
            );

            $route = app('router')->getRoutes()->match($request);
            $request->setRouteResolver(fn () => $route);

            $response = $middleware->handle(
                $request,
                fn () => response('Restore route allowed')
            );

            $this->assertSame('Restore route allowed', $response->getContent());
        } finally {
            $this->store->releaseLock($lock);
        }
    }
}