<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class CustomerStatusManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_deactivate_and_activate_a_customer(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create([
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.customers.toggle-status', $customer));

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'is_active' => false,
        ]);

        $this->patch(route('admin.customers.toggle-status', $customer));

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'is_active' => true,
        ]);
    }

    public function test_cashier_can_deactivate_and_activate_a_customer(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create([
            'is_active' => true,
        ]);

        $this->actingAs($cashier)
            ->patch(route('cashier.customers.toggle-status', $customer));

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'is_active' => false,
        ]);

        $this->patch(route('cashier.customers.toggle-status', $customer));

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'is_active' => true,
        ]);
    }

    public function test_cashier_cannot_use_admin_customer_status_route(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create([
            'is_active' => true,
        ]);

        $this->actingAs($cashier)
            ->patch(route('admin.customers.toggle-status', $customer))
            ->assertForbidden();

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'is_active' => true,
        ]);
    }

    public function test_admin_cannot_use_cashier_customer_status_route(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create([
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->patch(route('cashier.customers.toggle-status', $customer))
            ->assertForbidden();

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'is_active' => true,
        ]);
    }

    public function test_admin_can_delete_customer_and_related_records(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create();

        $records = $this->createRelatedRecords($customer, $cashier);

        $this->actingAs($admin)
            ->delete(route('admin.customers.destroy', $customer))
            ->assertRedirect(route('admin.customers.index'))
            ->assertSessionHas('success');

        $this->assertCustomerRecordsDeleted($customer, $records);
    }

    public function test_cashier_can_delete_customer_and_related_records(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create();

        $records = $this->createRelatedRecords($customer, $cashier);

        $this->actingAs($cashier)
            ->delete(route('cashier.customers.destroy', $customer))
            ->assertRedirect(route('cashier.customers.index'))
            ->assertSessionHas('success');

        $this->assertCustomerRecordsDeleted($customer, $records);
    }

    public function test_cashier_cannot_use_admin_customer_delete_route(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create();

        $this->actingAs($cashier)
            ->delete(route('admin.customers.destroy', $customer))
            ->assertForbidden();

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
        ]);
    }

    public function test_admin_cannot_use_cashier_customer_delete_route(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create();

        $this->actingAs($admin)
            ->delete(route('cashier.customers.destroy', $customer))
            ->assertForbidden();

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
        ]);
    }

    /**
     * Create disposable related records for deletion tests.
     * These records are created in the isolated test database.
     */
    private function createRelatedRecords(
        Customer $customer,
        User $cashier
    ): array {
        $now = now();

        $rewardId = DB::table('rewards')->insertGetId([
            'reward_name' => 'Disposable Test Reward',
            'reward_type' => 'discount',
            'points_required' => 10,
            'reward_value' => 5.00,
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $transactionId = DB::table('transactions')->insertGetId([
            'customer_id' => $customer->id,
            'cashier_id' => $cashier->id,
            'receipt_number' => 'TEST-' . $customer->id,
            'purchase_amount' => 100.00,
            'points_used' => 0,
            'amount_paid' => 100.00,
            'points_earned' => 1,
            'created_at' => $now,
        ]);

        $redemptionId = DB::table('reward_redemptions')->insertGetId([
            'customer_id' => $customer->id,
            'reward_id' => $rewardId,
            'cashier_id' => $cashier->id,
            'points_used' => 10,
            'redeemed_at' => $now,
            'status' => 'completed',
        ]);

        $pointTransactionIds = [];

        $pointTransactionIds[] = DB::table('point_transactions')
            ->insertGetId([
                'customer_id' => $customer->id,
                'transaction_id' => $transactionId,
                'redemption_id' => null,
                'type' => 'earned',
                'points' => 1,
                'balance_after' => 1,
                'description' => 'Test purchase points',
                'created_at' => $now,
            ]);

        $pointTransactionIds[] = DB::table('point_transactions')
            ->insertGetId([
                'customer_id' => $customer->id,
                'transaction_id' => null,
                'redemption_id' => $redemptionId,
                'type' => 'redeemed',
                'points' => -10,
                'balance_after' => 0,
                'description' => 'Test reward redemption',
                'created_at' => $now,
            ]);

        $qrCodeId = DB::table('customer_qr_codes')->insertGetId([
            'customer_id' => $customer->id,
            'qr_token' => Str::random(64),
            'is_active' => true,
            'created_at' => $now,
            'revoked_at' => null,
        ]);

        $feedbackId = DB::table('feedback')->insertGetId([
            'customer_id' => $customer->id,
            'rating' => 5,
            'message' => 'Disposable test feedback',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        return [
            'reward_id' => $rewardId,
            'transaction_id' => $transactionId,
            'redemption_id' => $redemptionId,
            'point_transaction_ids' => $pointTransactionIds,
            'qr_code_id' => $qrCodeId,
            'feedback_id' => $feedbackId,
        ];
    }

    /**
     * Verify related data is removed and feedback is anonymized.
     */
    private function assertCustomerRecordsDeleted(
        Customer $customer,
        array $records
    ): void {
        $this->assertDatabaseMissing('customers', [
            'id' => $customer->id,
        ]);

        $this->assertDatabaseMissing('transactions', [
            'id' => $records['transaction_id'],
        ]);

        $this->assertDatabaseMissing('reward_redemptions', [
            'id' => $records['redemption_id'],
        ]);

        foreach ($records['point_transaction_ids'] as $id) {
            $this->assertDatabaseMissing('point_transactions', [
                'id' => $id,
            ]);
        }

        $this->assertDatabaseMissing('customer_qr_codes', [
            'id' => $records['qr_code_id'],
        ]);

        // Feedback is retained, but no longer identifies the customer.
        $this->assertDatabaseHas('feedback', [
            'id' => $records['feedback_id'],
            'customer_id' => null,
            'message' => 'Disposable test feedback',
        ]);

        // The reward definition itself must remain.
        $this->assertDatabaseHas('rewards', [
            'id' => $records['reward_id'],
            'reward_name' => 'Disposable Test Reward',
        ]);
    }
}
