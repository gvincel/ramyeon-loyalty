<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\PointTransaction;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionProcessingTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashier_can_process_purchase_and_points_are_recorded(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-POINT-001',
            'first_name' => 'Test',
            'last_name' => 'Customer',
            'phone_number' => '09888888888',
            'is_active' => true,
            'points' => 0,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.transactions.store'), [
                'customer_id' => $customer->id,
                'receipt_number' => 'OR-POINT-001',
                'purchase_amount' => 350.00,
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Transaction completed successfully.',
                'points_earned' => 3,
                'previous_points' => 0,
                'new_points' => 3,
            ]);

        $this->assertDatabaseHas('transactions', [
            'customer_id' => $customer->id,
            'cashier_id' => $cashier->id,
            'receipt_number' => 'OR-POINT-001',
            'purchase_amount' => 350.00,
            'points_earned' => 3,
        ]);

        $transaction = Transaction::where('receipt_number', 'OR-POINT-001')->first();

        $this->assertNotNull($transaction);

        $this->assertDatabaseHas('point_transactions', [
            'customer_id' => $customer->id,
            'transaction_id' => $transaction->id,
            'redemption_id' => null,
            'type' => 'earned',
            'points' => 3,
            'balance_after' => 3,
        ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 3,
        ]);
    }
}