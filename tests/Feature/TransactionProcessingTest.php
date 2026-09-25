<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
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

    public function test_cashier_can_process_purchase_for_customer_with_existing_points(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-POINT-002',
            'first_name' => 'Existing',
            'last_name' => 'Points',
            'phone_number' => '09877777777',
            'is_active' => true,
            'points' => 10,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.transactions.store'), [
                'customer_id' => $customer->id,
                'receipt_number' => 'OR-POINT-002',
                'purchase_amount' => 250.00,
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Transaction completed successfully.',
                'points_earned' => 2,
                'previous_points' => 10,
                'new_points' => 12,
            ]);

        $transaction = Transaction::where('receipt_number', 'OR-POINT-002')->first();

        $this->assertNotNull($transaction);

        $this->assertDatabaseHas('point_transactions', [
            'customer_id' => $customer->id,
            'transaction_id' => $transaction->id,
            'redemption_id' => null,
            'type' => 'earned',
            'points' => 2,
            'balance_after' => 12,
        ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 12,
        ]);
    }

    #[DataProvider('purchaseAmountPointsProvider')]
    public function test_points_are_calculated_correctly_at_purchase_boundaries(
        float $purchaseAmount,
        int $expectedPoints
    ): void {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-BOUNDARY-' . $purchaseAmount,
            'first_name' => 'Boundary',
            'last_name' => 'Test',
            'phone_number' => '09866666666',
            'is_active' => true,
            'points' => 0,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.transactions.store'), [
                'customer_id' => $customer->id,
                'receipt_number' => 'OR-BOUNDARY-' . $purchaseAmount,
                'purchase_amount' => $purchaseAmount,
            ]);

        $response->assertOk()
            ->assertJson([
                'points_earned' => $expectedPoints,
                'previous_points' => 0,
                'new_points' => $expectedPoints,
            ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => $expectedPoints,
        ]);
    }

    public static function purchaseAmountPointsProvider(): array
    {
        return [
            'below 100' => [99.00, 0],
            'exactly 100' => [100.00, 1],
            'below 200' => [199.00, 1],
            'exactly 200' => [200.00, 2],
        ];
    }
}