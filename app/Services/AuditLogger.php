<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

final class AuditLogger
{
    /**
     * Only these metadata keys may be stored in audit records.
     * Never pass passwords, QR tokens, phone numbers, or raw request data.
     */
    private const SAFE_METADATA_KEYS = [
        'previous_status',
        'new_status',
        'changed_fields',
        'points_used',
        'points_earned',
        'points_refunded',
        'points_required',
        'receipt_number',
        'reward_type',
        'start_date',
        'end_date',
        'period',
        'record_count',
        'file_size_bytes',
    ];

    /**
     * Record a successful application action.
     *
     * Call this inside the same database transaction as the
     * business operation whenever that operation is transactional.
     *
     * @param array<string, mixed> $metadata
     */
    public function record(
        string $action,
        string $description,
        ?Model $subject = null,
        array $metadata = [],
    ): AuditLog {
        $actor = Auth::user();

        $safeMetadata = [];

        foreach (self::SAFE_METADATA_KEYS as $key) {
            if (! array_key_exists($key, $metadata)) {
                continue;
            }

            $value = $metadata[$key];

            if (is_string($value)) {
                $value = mb_substr($value, 0, 255);
            }

            if (
                is_string($value)
                || is_int($value)
                || is_float($value)
                || is_bool($value)
                || $value === null
            ) {
                $safeMetadata[$key] = $value;
            }
        }

        return AuditLog::create([
            'actor_id' => $actor?->getAuthIdentifier(),
            'actor_name' => $actor && isset($actor->name)
                ? mb_substr((string) $actor->name, 0, 255)
                : null,
            'actor_role' => $actor && isset($actor->role)
                ? mb_substr((string) $actor->role, 0, 50)
                : null,
            'action' => mb_substr($action, 0, 100),
            'subject_type' => $subject
                ? class_basename($subject)
                : null,
            'subject_id' => $subject?->getKey(),
            'description' => mb_substr($description, 0, 255),
            'metadata' => $safeMetadata === []
                ? null
                : $safeMetadata,
            'created_at' => now(),
        ]);
    }
}
