<?php

namespace App\Http\Middleware;

use App\Services\DatabaseRestoreStateStore;
use Closure;
use Illuminate\Http\Request;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

class DatabaseRestoreRequestLock
{
    public function __construct(
        private DatabaseRestoreStateStore $stateStore
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        // Restoration manages its own exclusive lock.
        if ($request->routeIs('admin.backups.restore')) {
            return $next($request);
        }

        try {
            $lock = $this->stateStore->acquireSharedLock();
        } catch (RuntimeException) {
            abort(
                503,
                'The database is temporarily unavailable for a recovery operation. Please try again shortly.'
            );
        }

        try {
            try {
                $journal = $this->stateStore->read();
            } catch (RuntimeException) {
                abort(
                    503,
                    'The database recovery state cannot be verified. Please contact an administrator.'
                );
            }

            if ($journal !== null) {
                abort(
                    503,
                    'Database recovery is pending. Please contact an administrator.'
                );
            }

            return $next($request);
        } finally {
            $this->stateStore->releaseLock($lock);
        }
    }
}