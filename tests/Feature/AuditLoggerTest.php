<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLoggerTest extends TestCase
{
    use RefreshDatabase;

    public function test_audit_logger_records_the_actor_and_subject_safely(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create();

        $this->actingAs($admin);

        $auditLog = app(AuditLogger::class)->record(
            'customer.updated',
            'Customer record updated.',
            $customer,
            [
                'changed_fields' => 'first_name,last_name',
                'phone_number' => '09123456789',
                'password' => 'must-not-be-recorded',
                'qr_token' => str_repeat('a', 64),
            ],
        );

        $auditLog->refresh();

        $this->assertDatabaseHas('audit_logs', [
            'id' => $auditLog->id,
            'actor_id' => $admin->id,
            'actor_name' => $admin->name,
            'actor_role' => 'admin',
            'action' => 'customer.updated',
            'subject_type' => 'Customer',
            'subject_id' => $customer->id,
            'description' => 'Customer record updated.',
        ]);

        $this->assertSame(
            ['changed_fields' => 'first_name,last_name'],
            $auditLog->metadata,
        );

        $this->assertNotNull($auditLog->created_at);
    }

    public function test_audit_logger_can_record_an_action_without_a_subject(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->actingAs($admin);

        $auditLog = app(AuditLogger::class)->record(
            'report.export_requested',
            'A report export was initiated.',
        );

        $this->assertNull($auditLog->subject_type);
        $this->assertNull($auditLog->subject_id);
        $this->assertSame('report.export_requested', $auditLog->action);

        $this->assertDatabaseHas('audit_logs', [
            'id' => $auditLog->id,
            'actor_id' => $admin->id,
            'action' => 'report.export_requested',
        ]);
    }
}