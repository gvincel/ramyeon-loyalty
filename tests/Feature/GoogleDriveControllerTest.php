<?php

use App\Models\GoogleDriveToken;
use App\Models\User;
use App\Services\GoogleDriveAuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Mockery\MockInterface;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

it('redirects guests away from the authorize endpoint', function () {
    $this->get('/admin/backups/google-drive/authorize')
        ->assertRedirect(route('login'));
});

it('forbids cashiers from the authorize endpoint', function () {
    $cashier = User::factory()->create(['role' => 'cashier']);

    $this->actingAs($cashier)
        ->get('/admin/backups/google-drive/authorize')
        ->assertForbidden();
});

it('flashes an error when Google Drive is not configured', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->mock(GoogleDriveAuthService::class, function (MockInterface $mock) {
        $mock->shouldReceive('isConfigured')->andReturn(false);
    });

    $this->actingAs($admin)
        ->get('/admin/backups/google-drive/authorize')
        ->assertRedirect(route('admin.backups.index'))
        ->assertSessionHas('error');
});

it('redirects to Google with a state when configured', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->mock(GoogleDriveAuthService::class, function (MockInterface $mock) {
        $mock->shouldReceive('isConfigured')->andReturn(true);
        $mock->shouldReceive('buildAuthUrl')
            ->andReturn('https://accounts.google.com/o/oauth2/auth?state=test-state');
    });

    $this->actingAs($admin)
        ->get('/admin/backups/google-drive/authorize')
        ->assertRedirect('https://accounts.google.com/o/oauth2/auth?state=test-state')
        ->assertSessionHas('google_drive_oauth_state');
});

it('records an audit log when authorization starts', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->mock(GoogleDriveAuthService::class, function (MockInterface $mock) {
        $mock->shouldReceive('isConfigured')->andReturn(true);
        $mock->shouldReceive('buildAuthUrl')->andReturn('https://accounts.google.com/x');
    });

    $this->actingAs($admin)->get('/admin/backups/google-drive/authorize');

    expect(DB::table('audit_logs')
        ->where('action', 'google_drive.authorization_started')
        ->count()
    )->toBe(1);
});

it('rejects the callback when the state does not match', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->withSession(['google_drive_oauth_state' => 'expected-state'])
        ->get('/admin/backups/google-drive/callback?state=wrong-state&code=some-code')
        ->assertRedirect(route('admin.backups.index'))
        ->assertSessionHas('error');

    expect(GoogleDriveToken::query()->count())->toBe(0);
});

it('rejects the callback when no state is in session', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->get('/admin/backups/google-drive/callback?state=any&code=some-code')
        ->assertRedirect(route('admin.backups.index'))
        ->assertSessionHas('error');

    expect(GoogleDriveToken::query()->count())->toBe(0);
});

it('handles a denial from Google gracefully', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->withSession(['google_drive_oauth_state' => 'expected-state'])
        ->get('/admin/backups/google-drive/callback?error=access_denied')
        ->assertRedirect(route('admin.backups.index'))
        ->assertSessionHas('error');

    expect(GoogleDriveToken::query()->count())->toBe(0);
});

it('exchanges a valid code and stores the token', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $token = new GoogleDriveToken([
        'account_email' => 'backup@example.com',
        'refresh_token_encrypted' => 'fake-refresh-token',
        'scope' => 'https://www.googleapis.com/auth/drive.file',
        'authorized_at' => now(),
    ]);

    $this->mock(GoogleDriveAuthService::class, function (MockInterface $mock) use ($token) {
        $mock->shouldReceive('exchangeCode')->once()->andReturn($token);
    });

    $this->actingAs($admin)
        ->withSession(['google_drive_oauth_state' => 'valid-state'])
        ->get('/admin/backups/google-drive/callback?state=valid-state&code=auth-code')
        ->assertRedirect(route('admin.backups.index'))
        ->assertSessionHas('success');

    expect(DB::table('audit_logs')
        ->where('action', 'google_drive.connected')
        ->count()
    )->toBe(1);
});

it('disconnects without error when no token is stored', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->mock(GoogleDriveAuthService::class, function (MockInterface $mock) {
        $mock->shouldReceive('disconnect')->once();
    });

    $this->actingAs($admin)
        ->delete('/admin/backups/google-drive/disconnect')
        ->assertRedirect(route('admin.backups.index'))
        ->assertSessionHas('success');
});