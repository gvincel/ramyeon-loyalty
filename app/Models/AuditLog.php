<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    /**
     * Audit entries are recorded once and have no updated_at column.
     */
    public $timestamps = false;

    protected $fillable = [
        'actor_id',
        'actor_name',
        'actor_role',
        'action',
        'subject_type',
        'subject_id',
        'description',
        'metadata',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
