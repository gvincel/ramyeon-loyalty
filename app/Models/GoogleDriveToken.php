<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GoogleDriveToken extends Model
{
    protected $fillable = [
        'account_email',
        'refresh_token_encrypted',
        'scope',
        'authorized_at',
        'last_used_at',
    ];

    protected function casts(): array
    {
        return [
            'refresh_token_encrypted' => 'encrypted',
            'authorized_at' => 'datetime',
            'last_used_at' => 'datetime',
        ];
    }

    /**
     * Single active token: the most recently authorized account.
     */
    public static function current(): ?self
    {
        return self::query()->latest('id')->first();
    }

    public function markUsed(): void
    {
        $this->forceFill(['last_used_at' => now()])->save();
    }
}