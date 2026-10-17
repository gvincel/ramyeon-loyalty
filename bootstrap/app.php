<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))

    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )

    ->withMiddleware(function (Middleware $middleware): void {

        /*
        |--------------------------------------------------------------------------
        | Web Middleware
        |--------------------------------------------------------------------------
        */

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->is('loyalty/*')) {
                return route('customer.login');
            }

            return route('login');
        });

        $middleware->redirectUsersTo(function (Request $request) {
            // Customers should return to their own dashboard.
            if (
                $request->is('loyalty/*') &&
                Auth::guard('customer')->check()
            ) {
                return route('customer.dashboard');
            }

            // Staff users should return to the correct role dashboard.
            $user = $request->user();

            if ($user?->role === 'admin') {
                return route('admin.dashboard');
            }

            if ($user?->role === 'cashier') {
                return route('cashier.dashboard');
            }

            // Never fall back to "/" or "/login" here, because that
            // could recreate the redirect loop for an unexpected role.
            abort(403);
        });

        /*
        |--------------------------------------------------------------------------
        | Middleware Aliases
        |--------------------------------------------------------------------------
        |
        | "role" can now be used in routes like:
        |
        | middleware(['auth', 'role:admin'])
        |
        */

        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);
    })

    ->withExceptions(function (Exceptions $exceptions): void {

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) =>
                $request->is('api/*') || $request->expectsJson(),
        );
    })

    ->create();