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
            'password' => 'TestPassword123',
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
            'password' => 'TestPassword123',
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

    public function test_cashier_can_use_points_for_partial_purchase_payment(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-POINT-003',
            'first_name' => 'Partial',
            'last_name' => 'Usage',
            'phone_number' => '09811111111',
            'password' => 'TestPassword123',
            'is_active' => true,
            'points' => 100,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.transactions.store'), [
                'customer_id' => $customer->id,
                'receipt_number' => 'OR-POINT-003',
                'purchase_amount' => 500.00,
                'points_used' => 100,
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Transaction completed successfully.',
                'points_earned' => 4,
                'previous_points' => 100,
                'new_points' => 4,
            ]);

        $transaction = Transaction::where('receipt_number', 'OR-POINT-003')->first();

        $this->assertNotNull($transaction);

        $this->assertSame(100, $transaction->points_used);
        $this->assertSame('400.00', $transaction->amount_paid);

        $this->assertDatabaseHas('point_transactions', [
            'customer_id' => $customer->id,
            'transaction_id' => $transaction->id,
            'redemption_id' => null,
            'type' => 'redeemed',
            'points' => -100,
            'balance_after' => 0,
        ]);

        $this->assertDatabaseHas('point_transactions', [
            'customer_id' => $customer->id,
            'transaction_id' => $transaction->id,
            'redemption_id' => null,
            'type' => 'earned',
            'points' => 4,
            'balance_after' => 4,
        ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 4,
        ]);
    }

    public function test_cashier_can_use_points_to_pay_full_purchase_amount(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-POINT-004',
            'first_name' => 'Full',
            'last_name' => 'Payment',
            'phone_number' => '09812222222',
            'password' => 'TestPassword123',
            'is_active' => true,
            'points' => 350,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.transactions.store'), [
                'customer_id' => $customer->id,
                'receipt_number' => 'OR-POINT-004',
                'purchase_amount' => 350.00,
                'points_used' => 350,
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Transaction completed successfully.',
                'points_earned' => 0,
                'previous_points' => 350,
                'new_points' => 0,
            ]);

        $transaction = Transaction::where('receipt_number', 'OR-POINT-004')->first();

        $this->assertNotNull($transaction);

        $this->assertSame(350, $transaction->points_used);
        $this->assertSame('0.00', $transaction->amount_paid);

        $this->assertDatabaseHas('point_transactions', [
            'customer_id' => $customer->id,
            'transaction_id' => $transaction->id,
            'redemption_id' => null,
            'type' => 'redeemed',
            'points' => -350,
            'balance_after' => 0,
        ]);

        $this->assertDatabaseMissing('point_transactions', [
            'customer_id' => $customer->id,
            'transaction_id' => $transaction->id,
            'type' => 'earned',
        ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 0,
        ]);
    }

    public function test_customer_cannot_use_more_points_than_their_balance(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-POINT-005',
            'first_name' => 'Insufficient',
            'last_name' => 'Points',
            'phone_number' => '09813333333',
            'password' => 'TestPassword123',
            'is_active' => true,
            'points' => 50,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.transactions.store'), [
                'customer_id' => $customer->id,
                'receipt_number' => 'OR-POINT-005',
                'purchase_amount' => 500.00,
                'points_used' => 100,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('points_used');

        $this->assertDatabaseMissing('transactions', [
            'receipt_number' => 'OR-POINT-005',
        ]);

        $this->assertDatabaseCount('point_transactions', 0);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 50,
        ]);
    }

    public function test_customer_cannot_use_more_points_than_purchase_amount(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-POINT-006',
            'first_name' => 'Purchase',
            'last_name' => 'Limit',
            'phone_number' => '09814444444',
            'password' => 'TestPassword123',
            'is_active' => true,
            'points' => 500,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.transactions.store'), [
                'customer_id' => $customer->id,
                'receipt_number' => 'OR-POINT-006',
                'purchase_amount' => 100.00,
                'points_used' => 200,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('points_used');

        $this->assertDatabaseMissing('transactions', [
            'receipt_number' => 'OR-POINT-006',
        ]);

        $this->assertDatabaseCount('point_transactions', 0);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 500,
        ]);
    }

    public function test_invalid_points_used_value_is_rejected(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-POINT-007',
            'first_name' => 'Invalid',
            'last_name' => 'Points',
            'phone_number' => '09815555555',
            'password' => 'TestPassword123',
            'is_active' => true,
            'points' => 100,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.transactions.store'), [
                'customer_id' => $customer->id,
                'receipt_number' => 'OR-POINT-007',
                'purchase_amount' => 500.00,
                'points_used' => -10,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('points_used');

        $this->assertDatabaseMissing('transactions', [
            'receipt_number' => 'OR-POINT-007',
        ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 100,
        ]);
    }

   public function test_non_integer_points_used_value_is_rejected(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-POINT-008',
            'first_name' => 'Decimal',
            'last_name' => 'Points',
            'phone_number' => '09816666666',
            'password' => 'TestPassword123',
            'is_active' => true,
            'points' => 100,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.transactions.store'), [
                'customer_id' => $customer->id,
                'receipt_number' => 'OR-POINT-008',
                'purchase_amount' => 500.00,
                'points_used' => 10.5,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('points_used');

        $this->assertDatabaseMissing('transactions', [
            'receipt_number' => 'OR-POINT-008',
        ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 100,
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
            'password' => 'TestPassword123',
            'is_active' => true,
            'points' => 0,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.transactions.store'), [
                'customer_id' => $customer->id,
                'receipt_number' => 'OR-BOUNDARY-' . $purchaseAmount,
                'purchase_amount' => $purchaseAmount,
                'points_used' => 0,
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

    public function test_purchase_amount_zero_is_rejected(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-VALIDATION-001',
            'first_name' => 'Validation',
            'last_name' => 'Test',
            'phone_number' => '09855555555',
            'password' => 'TestPassword123',
            'is_active' => true,
            'points' => 10,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.transactions.store'), [
                'customer_id' => $customer->id,
                'receipt_number' => 'OR-VALIDATION-001',
                'purchase_amount' => 0,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('purchase_amount');

        $this->assertDatabaseMissing('transactions', [
            'receipt_number' => 'OR-VALIDATION-001',
        ]);

        $this->assertDatabaseMissing('point_transactions', [
            'customer_id' => $customer->id,
        ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 10,
        ]);
    }

    public function test_negative_purchase_amount_is_rejected(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-VALIDATION-002',
            'first_name' => 'Negative',
            'last_name' => 'Amount',
            'phone_number' => '09844444444',
            'password' => 'TestPassword123',
            'is_active' => true,
            'points' => 10,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.transactions.store'), [
                'customer_id' => $customer->id,
                'receipt_number' => 'OR-VALIDATION-002',
                'purchase_amount' => -100,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('purchase_amount');

        $this->assertDatabaseMissing('transactions', [
            'receipt_number' => 'OR-VALIDATION-002',
        ]);

        $this->assertDatabaseMissing('point_transactions', [
            'customer_id' => $customer->id,
        ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 10,
        ]);
    }

    public function test_purchase_with_nonexistent_customer_is_rejected(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.transactions.store'), [
                'customer_id' => 999999,
                'receipt_number' => 'OR-VALIDATION-003',
                'purchase_amount' => 500.00,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('customer_id');

        $this->assertDatabaseMissing('transactions', [
            'receipt_number' => 'OR-VALIDATION-003',
        ]);

        $this->assertDatabaseCount('point_transactions', 0);
    }

    public function test_purchase_for_inactive_customer_is_rejected(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-VALIDATION-004',
            'first_name' => 'Inactive',
            'last_name' => 'Customer',
            'phone_number' => '09833333333',
            'password' => 'TestPassword123',
            'is_active' => false,
            'points' => 15,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.transactions.store'), [
                'customer_id' => $customer->id,
                'receipt_number' => 'OR-VALIDATION-004',
                'purchase_amount' => 500.00,
            ]);

        $response->assertNotFound()
            ->assertJson([
                'message' => 'Customer is inactive or does not exist.',
            ]);

        $this->assertDatabaseMissing('transactions', [
            'receipt_number' => 'OR-VALIDATION-004',
        ]);

        $this->assertDatabaseCount('point_transactions', 0);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 15,
        ]);
    }

    public function test_purchase_amount_above_maximum_is_rejected(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-VALIDATION-005',
            'first_name' => 'Maximum',
            'last_name' => 'Test',
            'phone_number' => '09822222222',
            'password' => 'TestPassword123',
            'is_active' => true,
            'points' => 20,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.transactions.store'), [
                'customer_id' => $customer->id,
                'receipt_number' => 'OR-VALIDATION-005',
                'purchase_amount' => 100000000.00,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('purchase_amount');

        $this->assertDatabaseMissing('transactions', [
            'receipt_number' => 'OR-VALIDATION-005',
        ]);

        $this->assertDatabaseCount('point_transactions', 0);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 20,
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