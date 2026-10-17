<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    /**
     * Display searchable, paginated audit history.
     */
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'action' => ['nullable', 'string', 'max:100'],
            'role' => ['nullable', 'in:admin,cashier'],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => [
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:date_from',
            ],
        ]);

        $search = trim($validated['search'] ?? '');

        $logs = AuditLog::query()
            ->when(
                $validated['action'] ?? null,
                fn ($query, $action) => $query->where('action', $action),
            )
            ->when(
                $validated['role'] ?? null,
                fn ($query, $role) => $query->where('actor_role', $role),
            )
            ->when(
                $validated['date_from'] ?? null,
                fn ($query, $date) => $query->whereDate(
                    'created_at',
                    '>=',
                    $date,
                ),
            )
            ->when(
                $validated['date_to'] ?? null,
                fn ($query, $date) => $query->whereDate(
                    'created_at',
                    '<=',
                    $date,
                ),
            )
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('actor_name', 'like', "%{$search}%")
                        ->orWhere('action', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('subject_type', 'like', "%{$search}%");

                    if (ctype_digit($search)) {
                        $query
                            ->orWhere('actor_id', (int) $search)
                            ->orWhere('subject_id', (int) $search);
                    }
                });
            })
            ->latest('created_at')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        $actions = AuditLog::query()
            ->select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        return Inertia::render('Admin/AuditLogs', [
            'logs' => $logs,
            'actions' => $actions,
            'filters' => [
                'search' => $search,
                'action' => $validated['action'] ?? '',
                'role' => $validated['role'] ?? '',
                'date_from' => $validated['date_from'] ?? '',
                'date_to' => $validated['date_to'] ?? '',
            ],
        ]);
    }
}