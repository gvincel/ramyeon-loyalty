<?php

use App\Models\GoogleDriveToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

it('encrypts the refresh token at rest', function () {
    $token = GoogleDriveToken::create([
        'account_email' => 'kingramyeoncornerbislig@gmail.com',
        'refresh_token_encrypted' => 'secret-refresh-token',
        'scope' => 'https://www.googleapis.com/auth/drive.file',
        'authorized_at' => now(),
    ]);

    $rawValue = DB::table('google_drive_tokens')
        ->where('id', $token->id)
        ->value('refresh_token_encrypted');

    expect($rawValue)
        ->toBeString()
        ->not->toBe('secret-refresh-token')
        ->not->toContain('secret-refresh-token');

    expect($token->fresh()->refresh_token_encrypted)->toBe('secret-refresh-token');
});

it('returns the newest token as the current one', function () {
    GoogleDriveToken::query()->delete();

    GoogleDriveToken::create([
        'account_email' => 'old@example.com',
        'refresh_token_encrypted' => 'old-token',
        'scope' => 'drive.file',
        'authorized_at' => now()->subDay(),
    ]);

    $newest = GoogleDriveToken::create([
        'account_email' => 'new@example.com',
        'refresh_token_encrypted' => 'new-token',
        'scope' => 'drive.file',
        'authorized_at' => now(),
    ]);

    expect(GoogleDriveToken::current()?->id)->toBe($newest->id)
        ->and(GoogleDriveToken::current()?->account_email)->toBe('new@example.com');
});

it('updates last_used_at when markUsed is called', function () {
    $token = GoogleDriveToken::create([
        'account_email' => 'x@example.com',
        'refresh_token_encrypted' => 'abc',
        'scope' => 'drive.file',
        'authorized_at' => now(),
    ]);

    expect($token->last_used_at)->toBeNull();

    $token->markUsed();

    expect($token->fresh()->last_used_at)->not->toBeNull();
});