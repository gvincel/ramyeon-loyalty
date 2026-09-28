<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Reward;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerRewardsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_customer_cannot_view_rewards(): void
    {
        $response = $this->get('/loyalty/rewards');

        $response->assertRedirect(
            route('customer.login', absolute: false)
        );
    }

    public function test_authenticated_customer_can_view_available_rewards(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'points' => 250,
            'is_active' => true,
        ]);

        $availableReward = Reward::create([
            'reward_name' => '₱50 Off Coupon',
            'reward_type' => 'discount',
            'points_required' => 200,
            'reward_value' => 50.00,
            'description' => 'Get ₱50 off your purchase.',
            'start_date' => null,
            'end_date' => null,
            'is_active' => true,
        ]);

        Reward::create([
            'reward_name' => 'Inactive Reward',
            'reward_type' => 'discount',
            'points_required' => 100,
            'reward_value' => 25.00,
            'description' => null,
            'start_date' => null,
            'end_date' => null,
            'is_active' => false,
        ]);

        Reward::create([
            'reward_name' => 'Future Reward',
            'reward_type' => 'discount',
            'points_required' => 100,
            'reward_value' => 25.00,
            'description' => null,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => null,
            'is_active' => true,
        ]);

        Reward::create([
            'reward_name' => 'Expired Reward',
            'reward_type' => 'discount',
            'points_required' => 100,
            'reward_value' => 25.00,
            'description' => null,
            'start_date' => null,
            'end_date' => now()->subDay()->toDateString(),
            'is_active' => true,
        ]);

        $response = $this->actingAs($customer, 'customer')
            ->get('/loyalty/rewards');

        $response->assertStatus(200);

        $response->assertInertia(fn ($page) => $page
            ->component('Customer/Rewards')
            ->has('rewards', 1)
            ->where('rewards.0.id', $availableReward->id)
            ->where('rewards.0.reward_name', '₱50 Off Coupon')
            ->where('rewards.0.points_required', 200)
        );
    }
}