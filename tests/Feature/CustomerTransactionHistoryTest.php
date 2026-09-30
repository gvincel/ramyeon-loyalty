<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerTransactionHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_customer_cannot_view_transaction_history(): void
    {
        $response = $this->get(route('customer.transactions'));

        $response->assertRedirect(
            route('customer.login', absolute: false)
        );
    }

    public function test_customer_can_view_their_own_transactions(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'is_active' => true,
        ]);

        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        Transaction::create([
            'customer_id' => $customer->id,
            'cashier_id' => $cashier->id,
            'receipt_number' => 'OR-CUSTOMER-001',
            'purchase_amount' => 350.00,
            'points_used' => 0,
            'amount_paid' => 350.00,
            'points_earned' => 3,
            'created_at' => now(),
        ]);

        $response = $this
            ->actingAs($customer, 'customer')
            ->get(route('customer.transactions'));

        $response->assertOk();

        $response->assertInertia(fn ($page) => $page
            ->component('Customer/Transactions')
            ->has('transactions.data', 1)
            ->where(
                'transactions.data.0.receipt_number',
                'OR-CUSTOMER-001'
            )
        );
    }

    public function test_customer_cannot_see_another_customers_transactions(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'is_active' => true,
        ]);

        $otherCustomer = Customer::factory()->create([
            'is_active' => true,
        ]);

        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        Transaction::create([
            'customer_id' => $customer->id,
            'cashier_id' => $cashier->id,
            'receipt_number' => 'OR-MY-001',
            'purchase_amount' => 350.00,
            'points_used' => 0,
            'amount_paid' => 350.00,
            'points_earned' => 3,
            'created_at' => now(),
        ]);

        Transaction::create([
            'customer_id' => $otherCustomer->id,
            'cashier_id' => $cashier->id,
            'receipt_number' => 'OR-OTHER-001',
            'purchase_amount' => 500.00,
            'points_used' => 0,
            'amount_paid' => 500.00,
            'points_earned' => 5,
            'created_at' => now(),
        ]);

        $response = $this
            ->actingAs($customer, 'customer')
            ->get(route('customer.transactions'));

        $response->assertOk();

        $response->assertInertia(fn ($page) => $page
            ->component('Customer/Transactions')
            ->has('transactions.data', 1)
            ->where(
                'transactions.data.0.receipt_number',
                'OR-MY-001'
            )
            ->where(
                'transactions.data.0.customer_id',
                $customer->id
            )
        );
    }
}