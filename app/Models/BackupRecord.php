<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BackupRecord extends Model
{
    protected $fillable = [
        'backup_id',
        'type',
        'status',
        'disk',
        'path',
        'file_size_bytes',
        'sha256',
        'encrypted',
        'verified_at',
        'created_by',
        'started_at',
        'completed_at',
        'expires_at',
        'failure_code',
        'failure_message',
        'drive_status',
        'drive_file_id',
        'drive_uploaded_at',
        'drive_upload_attempts',
        'drive_last_error',
    ];

    public function getRouteKeyName(): string
    {
        return 'backup_id';
    }

    protected function casts(): array
    {
        return [
            'file_size_bytes' => 'integer',
            'encrypted' => 'boolean',
            'verified_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'expires_at' => 'datetime',
            'drive_uploaded_at' => 'datetime',
            'drive_upload_attempts' => 'integer',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
