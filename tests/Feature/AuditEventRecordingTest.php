<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Reward;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditEventRecordingTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashier_account_changes_are_audited(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.cashiers.store'), [
                'name' => 'Audit Test Cashier',
                'username' => 'audit-test-cashier',
                'password' => 'TestPassword123!',
                'confirm_password' => 'TestPassword123!',
            ])
            ->assertSessionHas('success');

        $cashier = User::where(
            'username',
            'audit-test-cashier',
        )->firstOrFail();

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $admin->id,
            'actor_role' => 'admin',
            'action' => 'cashier.created',
            'subject_type' => 'User',
            'subject_id' => $cashier->id,
        ]);

        $this->actingAs($admin)
            ->put(route('admin.cashiers.update', $cashier), [
                'name' => 'Updated Audit Cashier',
                'username' => 'updated-audit-cashier',
            ])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $admin->id,
            'action' => 'cashier.updated',
            'subject_type' => 'User',
            'subject_id' => $cashier->id,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.cashiers.toggle-status', $cashier))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $admin->id,
            'action' => 'cashier.deactivated',
            'subject_type' => 'User',
            'subject_id' => $cashier->id,
            'description' => 'Cashier account deactivated.',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'subject_id' => $cashier->id,
            'action' => 'cashier.deactivated',
            'metadata->previous_status' => 'active',
            'metadata->new_status' => 'inactive',
        ]);
    }

    public function test_reward_configuration_changes_are_audited(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->post(route('admin.rewards.store'), [
                'reward_name' => 'Audit Test Reward',
                'reward_type' => 'free_item',
                'points_required' => 50,
                'reward_value' => null,
                'description' => 'Reward for audit integration testing.',
                'start_date' => null,
                'end_date' => null,
                'is_active' => true,
                'redemption_limit' => null,
            ])
            ->assertSessionHas('success');

        $reward = Reward::where(
            'reward_name',
            'Audit Test Reward',
        )->firstOrFail();

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $admin->id,
            'actor_role' => 'admin',
            'action' => 'reward.created',
            'subject_type' => 'Reward',
            'subject_id' => $reward->id,
        ]);

        $this->actingAs($admin)
            ->put(route('admin.rewards.update', $reward), [
                'reward_name' => 'Updated Audit Test Reward',
                'reward_type' => 'free_item',
                'points_required' => 75,
                'reward_value' => null,
                'description' => 'Updated reward for audit testing.',
                'start_date' => null,
                'end_date' => null,
                'is_active' => true,
                'redemption_limit' => null,
            ])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $admin->id,
            'action' => 'reward.updated',
            'subject_type' => 'Reward',
            'subject_id' => $reward->id,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.rewards.toggle-status', $reward))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $admin->id,
            'action' => 'reward.deactivated',
            'subject_type' => 'Reward',
            'subject_id' => $reward->id,
            'description' => 'Reward deactivated.',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'subject_id' => $reward->id,
            'action' => 'reward.deactivated',
            'metadata->previous_status' => 'active',
            'metadata->new_status' => 'inactive',
        ]);
    }

    public function test_report_export_is_audited(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.reports.export', [
                'period' => 'today',
            ]))
            ->assertOk();

        $auditLog = AuditLog::where(
            'action',
            'report.export_requested',
        )->first();

        $this->assertNotNull($auditLog);

        $this->assertSame($admin->id, $auditLog->actor_id);
        $this->assertSame('admin', $auditLog->actor_role);
        $this->assertSame('today', $auditLog->metadata['period']);
        $this->assertSame(
            now()->toDateString(),
            $auditLog->metadata['start_date'],
        );
        $this->assertSame(
            now()->toDateString(),
            $auditLog->metadata['end_date'],
        );

        $this->assertArrayNotHasKey(
            'password',
            $auditLog->metadata,
        );
    }
}
