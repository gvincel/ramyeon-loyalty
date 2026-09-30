<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\PointTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerPointHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_customer_cannot_view_point_history(): void
    {
        $response = $this->get(route('customer.point-history'));

        $response->assertRedirect(
            route('customer.login', absolute: false)
        );
    }

    public function test_customer_can_view_their_own_point_history(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'points' => 100,
            'is_active' => true,
        ]);

        PointTransaction::create([
            'customer_id' => $customer->id,
            'transaction_id' => null,
            'redemption_id' => null,
            'type' => 'earned',
            'points' => 100,
            'balance_after' => 100,
            'description' => 'Points earned from purchase.',
            'created_at' => now(),
        ]);

        $response = $this
            ->actingAs($customer, 'customer')
            ->get(route('customer.point-history'));

        $response->assertOk();

        $response->assertInertia(fn ($page) => $page
            ->component('Customer/PointHistory')
            ->has('pointTransactions.data', 1)
            ->where(
                'pointTransactions.data.0.customer_id',
                $customer->id
            )
            ->where(
                'pointTransactions.data.0.points',
                100
            )
        );
    }

    public function test_customer_cannot_see_another_customers_point_history(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'points' => 100,
            'is_active' => true,
        ]);

        /** @var Customer $otherCustomer */
        $otherCustomer = Customer::factory()->create([
            'points' => 500,
            'is_active' => true,
        ]);

        PointTransaction::create([
            'customer_id' => $customer->id,
            'transaction_id' => null,
            'redemption_id' => null,
            'type' => 'earned',
            'points' => 100,
            'balance_after' => 100,
            'description' => 'Customer A points.',
            'created_at' => now(),
        ]);

        PointTransaction::create([
            'customer_id' => $otherCustomer->id,
            'transaction_id' => null,
            'redemption_id' => null,
            'type' => 'earned',
            'points' => 500,
            'balance_after' => 500,
            'description' => 'Customer B points.',
            'created_at' => now(),
        ]);

        $response = $this
            ->actingAs($customer, 'customer')
            ->get(route('customer.point-history'));

        $response->assertOk();

        $response->assertInertia(fn ($page) => $page
            ->component('Customer/PointHistory')
            ->has('pointTransactions.data', 1)
            ->where(
                'pointTransactions.data.0.customer_id',
                $customer->id
            )
            ->where(
                'pointTransactions.data.0.description',
                'Customer A points.'
            )
        );
    }
}