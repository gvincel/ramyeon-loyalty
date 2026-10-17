<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_audit_logs(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        AuditLog::create([
            'actor_id' => $admin->id,
            'actor_name' => $admin->name,
            'actor_role' => 'admin',
            'action' => 'transaction.created',
            'subject_type' => 'Transaction',
            'subject_id' => 25,
            'description' => 'Purchase transaction completed.',
            'metadata' => ['points_earned' => 5],
            'created_at' => now(),
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.audit-logs.index'));

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->component('Admin/AuditLogs')
                ->has('logs.data', 1)
                ->where('logs.data.0.action', 'transaction.created')
                ->where(
                    'logs.data.0.description',
                    'Purchase transaction completed.',
                )
                ->where('logs.data.0.subject_id', 25)
                ->where('logs.data.0.metadata.points_earned', 5)
        );
    }

    public function test_cashier_cannot_view_audit_logs(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $this->actingAs($cashier)
            ->get(route('admin.audit-logs.index'))
            ->assertForbidden();
    }

    public function test_guest_cannot_view_audit_logs(): void
    {
        $this->get(route('admin.audit-logs.index'))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_filter_audit_logs(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        AuditLog::create([
            'actor_id' => $admin->id,
            'actor_name' => 'Alice Administrator',
            'actor_role' => 'admin',
            'action' => 'customer.deactivated',
            'subject_type' => 'Customer',
            'subject_id' => 42,
            'description' => 'Customer deactivated.',
            'metadata' => [
                'previous_status' => 'active',
                'new_status' => 'inactive',
            ],
            'created_at' => now()->subDay(),
        ]);

        AuditLog::create([
            'actor_id' => $admin->id,
            'actor_name' => 'Bob Cashier',
            'actor_role' => 'cashier',
            'action' => 'transaction.created',
            'subject_type' => 'Transaction',
            'subject_id' => 84,
            'description' => 'Purchase transaction completed.',
            'metadata' => null,
            'created_at' => now()->subDays(10),
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.audit-logs.index', [
                'search' => 'Alice',
                'action' => 'customer.deactivated',
                'role' => 'admin',
                'date_from' => now()->subDays(2)->toDateString(),
                'date_to' => now()->toDateString(),
            ]));

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->component('Admin/AuditLogs')
                ->has('logs.data', 1)
                ->where('logs.total', 1)
                ->where('logs.data.0.actor_name', 'Alice Administrator')
                ->where('logs.data.0.action', 'customer.deactivated')
                ->where('filters.search', 'Alice')
                ->where('filters.role', 'admin')
        );
    }

    public function test_audit_logs_are_paginated_newest_first(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        foreach (range(1, 16) as $number) {
            AuditLog::create([
                'actor_id' => $admin->id,
                'actor_name' => $admin->name,
                'actor_role' => 'admin',
                'action' => 'customer.updated',
                'subject_type' => 'Customer',
                'subject_id' => $number,
                'description' => "Customer record update {$number}.",
                'metadata' => null,
                'created_at' => now()->subMinutes($number),
            ]);
        }

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.audit-logs.index'));

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->component('Admin/AuditLogs')
                ->has('logs.data', 15)
                ->where('logs.total', 16)
                ->where('logs.last_page', 2)
                ->where('logs.data.0.subject_id', 1)
        );
    }

    public function test_audit_log_rejects_an_invalid_date_range(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.audit-logs.index', [
                'date_from' => '2026-10-10',
                'date_to' => '2026-10-01',
            ]))
            ->assertRedirect()
            ->assertSessionHasErrors('date_to');
    }
}
