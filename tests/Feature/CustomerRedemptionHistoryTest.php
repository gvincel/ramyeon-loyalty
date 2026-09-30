<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Reward;
use App\Models\RewardRedemption;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerRedemptionHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_customer_cannot_view_redemption_history(): void
    {
        $response = $this->get(route('customer.redemption-history'));

        $response->assertRedirect(
            route('customer.login', absolute: false)
        );
    }

    public function test_customer_can_view_their_own_redemption_history(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'points' => 500,
            'is_active' => true,
        ]);

        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $reward = Reward::create([
            'reward_name' => '₱50 Off Coupon',
            'reward_type' => 'discount',
            'points_required' => 200,
            'reward_value' => 50.00,
            'description' => 'Get ₱50 off your purchase.',
            'start_date' => null,
            'end_date' => null,
            'is_active' => true,
        ]);

        RewardRedemption::create([
            'customer_id' => $customer->id,
            'reward_id' => $reward->id,
            'cashier_id' => $cashier->id,
            'points_used' => 200,
            'redeemed_at' => now(),
            'status' => 'completed',
        ]);

        $response = $this
            ->actingAs($customer, 'customer')
            ->get(route('customer.redemption-history'));

        $response->assertOk();

        $response->assertInertia(fn ($page) => $page
            ->component('Customer/RedemptionHistory')
            ->has('redemptions.data', 1)
            ->where(
                'redemptions.data.0.customer_id',
                $customer->id
            )
            ->where(
                'redemptions.data.0.reward.id',
                $reward->id
            )
            ->where(
                'redemptions.data.0.points_used',
                200
            )
        );
    }

    public function test_customer_cannot_see_another_customers_redemption_history(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'points' => 500,
            'is_active' => true,
        ]);

        /** @var Customer $otherCustomer */
        $otherCustomer = Customer::factory()->create([
            'points' => 1000,
            'is_active' => true,
        ]);

        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $reward = Reward::create([
            'reward_name' => '₱50 Off Coupon',
            'reward_type' => 'discount',
            'points_required' => 200,
            'reward_value' => 50.00,
            'description' => 'Get ₱50 off your purchase.',
            'start_date' => null,
            'end_date' => null,
            'is_active' => true,
        ]);

        RewardRedemption::create([
            'customer_id' => $customer->id,
            'reward_id' => $reward->id,
            'cashier_id' => $cashier->id,
            'points_used' => 200,
            'redeemed_at' => now(),
            'status' => 'completed',
        ]);

        RewardRedemption::create([
            'customer_id' => $otherCustomer->id,
            'reward_id' => $reward->id,
            'cashier_id' => $cashier->id,
            'points_used' => 200,
            'redeemed_at' => now(),
            'status' => 'completed',
        ]);

        $response = $this
            ->actingAs($customer, 'customer')
            ->get(route('customer.redemption-history'));

        $response->assertOk();

        $response->assertInertia(fn ($page) => $page
            ->component('Customer/RedemptionHistory')
            ->has('redemptions.data', 1)
            ->where(
                'redemptions.data.0.customer_id',
                $customer->id
            )
            ->where(
                'redemptions.data.0.reward.id',
                $reward->id
            )
        );
    }
}