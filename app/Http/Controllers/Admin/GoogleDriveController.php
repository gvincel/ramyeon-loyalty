<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AuditLogger;
use App\Services\GoogleDriveAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class GoogleDriveController extends Controller
{
    private const STATE_SESSION_KEY = 'google_drive_oauth_state';

    public function authorize(): RedirectResponse
    {
        $auth = app(GoogleDriveAuthService::class);

        if (! $auth->isConfigured()) {
            return redirect()
                ->route('admin.backups.index')
                ->with('error', 'Google Drive is not configured. Add the client credentials to the environment first.');
        }

        try {
            $state = Str::random(40);
            session([self::STATE_SESSION_KEY => $state]);

            app(AuditLogger::class)->record(
                'google_drive.authorization_started',
                'Administrator started Google Drive authorization.',
            );

            return redirect()->away($auth->buildAuthUrl($state));
        } catch (Throwable $e) {
            Log::error('Failed to start Google Drive authorization', ['error' => $e->getMessage()]);

            return redirect()
                ->route('admin.backups.index')
                ->with('error', 'Unable to start Google Drive authorization. Please try again.');
        }
    }

    public function callback(Request $request): RedirectResponse
    {
        $expectedState = session()->pull(self::STATE_SESSION_KEY);
        $receivedState = $request->query('state');
        $error = $request->query('error');
        $code = $request->query('code');

        if (is_string($error) && $error !== '') {
            $desc = $request->query('error_description');
            $message = is_string($desc) && $desc !== ''
                ? 'Google Drive authorization was denied: ' . $desc
                : 'Google Drive authorization was denied.';

            return redirect()
                ->route('admin.backups.index')
                ->with('error', $message);
        }

        if (
            ! is_string($expectedState)
            || $expectedState === ''
            || ! is_string($receivedState)
            || ! hash_equals($expectedState, $receivedState)
        ) {
            Log::warning('Google Drive OAuth state mismatch', [
                'has_expected' => is_string($expectedState) && $expectedState !== '',
                'has_received' => is_string($receivedState) && $receivedState !== '',
            ]);

            return redirect()
                ->route('admin.backups.index')
                ->with('error', 'Google Drive authorization failed: invalid or expired state. Please try again.');
        }

        if (! is_string($code) || $code === '') {
            return redirect()
                ->route('admin.backups.index')
                ->with('error', 'Google Drive authorization failed: missing authorization code.');
        }

        try {
            $token = app(GoogleDriveAuthService::class)->exchangeCode($code);

            app(AuditLogger::class)->record(
                'google_drive.connected',
                'Google Drive connected as ' . ($token->account_email ?? 'unknown account') . '.',
            );

            return redirect()
                ->route('admin.backups.index')
                ->with('success', 'Google Drive connected successfully.');
        } catch (Throwable $e) {
            Log::error('Google Drive token exchange failed', ['error' => $e->getMessage()]);

            return redirect()
                ->route('admin.backups.index')
                ->with('error', 'Google Drive authorization failed. ' . $e->getMessage());
        }
    }

    public function disconnect(): RedirectResponse
    {
        try {
            app(GoogleDriveAuthService::class)->disconnect();

            app(AuditLogger::class)->record(
                'google_drive.disconnected',
                'Administrator disconnected Google Drive backups.',
            );

            return redirect()
                ->route('admin.backups.index')
                ->with('success', 'Google Drive disconnected.');
        } catch (Throwable $e) {
            Log::error('Failed to disconnect Google Drive', ['error' => $e->getMessage()]);

            return redirect()
                ->route('admin.backups.index')
                ->with('error', 'Failed to disconnect Google Drive. Please try again.');
        }
    }
}