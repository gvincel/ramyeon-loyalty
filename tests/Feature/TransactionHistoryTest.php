<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashier_can_view_transaction_history(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-001',
            'first_name' => 'Test',
            'last_name' => 'Customer',
            'phone_number' => '09999999999',
            'is_active' => true,
        ]);

        Transaction::create([
            'customer_id' => $customer->id,
            'cashier_id' => $cashier->id,
            'receipt_number' => 'OR-TEST-001',
            'purchase_amount' => 350.00,
            'points_earned' => 3,
            'created_at' => now(),
        ]);

        $response = $this
            ->actingAs($cashier)
            ->get(route('cashier.transactions.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Cashier/Transactions/Index')
                ->has('transactions.data', 1)
        );
    }

    public function test_cashier_only_sees_transactions_they_processed(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $otherCashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-002',
            'first_name' => 'Test',
            'last_name' => 'Customer',
            'phone_number' => '09999999998',
            'is_active' => true,
        ]);

        Transaction::create([
            'customer_id' => $customer->id,
            'cashier_id' => $cashier->id,
            'receipt_number' => 'OR-OWN-001',
            'purchase_amount' => 200.00,
            'points_earned' => 2,
            'created_at' => now(),
        ]);

        Transaction::create([
            'customer_id' => $customer->id,
            'cashier_id' => $otherCashier->id,
            'receipt_number' => 'OR-OTHER-001',
            'purchase_amount' => 500.00,
            'points_earned' => 5,
            'created_at' => now(),
        ]);

        $response = $this
            ->actingAs($cashier)
            ->get(route('cashier.transactions.index'));

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->component('Cashier/Transactions/Index')
                ->has('transactions.data', 1)
                ->where('transactions.data.0.receipt_number', 'OR-OWN-001')
        );
    }

    public function test_transaction_history_searches_by_full_customer_name(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-003',
            'first_name' => 'Jestoni',
            'last_name' => 'Jualo',
            'phone_number' => '09999999997',
            'is_active' => true,
        ]);

        Transaction::create([
            'customer_id' => $customer->id,
            'cashier_id' => $cashier->id,
            'receipt_number' => 'OR-TEST-002',
            'purchase_amount' => 350.00,
            'points_earned' => 3,
            'created_at' => now(),
        ]);

        $response = $this
            ->actingAs($cashier)
            ->get(route('cashier.transactions.index', [
                'search' => 'Jestoni Jualo',
            ]));

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->component('Cashier/Transactions/Index')
                ->has('transactions.data', 1)
                ->where('transactions.data.0.customer.first_name', 'Jestoni')
                ->where('transactions.data.0.customer.last_name', 'Jualo')
        );
    }
}
