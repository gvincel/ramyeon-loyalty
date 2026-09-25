<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Reward;
use App\Models\RewardRedemption;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RewardRedemptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_cashier_can_redeem_reward_and_points_are_recorded(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-REDEEM-001',
            'first_name' => 'Reward',
            'last_name' => 'Customer',
            'phone_number' => '09811111111',
            'is_active' => true,
            'points' => 500,
        ]);

        $reward = Reward::create([
            'reward_name' => 'Free Coke Kasalo',
            'reward_type' => 'free_item',
            'points_required' => 500,
            'reward_value' => null,
            'description' => 'One free Coke Kasalo.',
            'start_date' => null,
            'end_date' => null,
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.reward-redemptions.store'), [
                'customer_id' => $customer->id,
                'reward_id' => $reward->id,
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Reward redeemed successfully.',
                'new_points' => 0,
            ]);

        $redemption = RewardRedemption::where('customer_id', $customer->id)
            ->where('reward_id', $reward->id)
            ->first();

        $this->assertNotNull($redemption);

        $this->assertDatabaseHas('reward_redemptions', [
            'id' => $redemption->id,
            'customer_id' => $customer->id,
            'reward_id' => $reward->id,
            'cashier_id' => $cashier->id,
            'points_used' => 500,
            'status' => 'completed',
        ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 0,
        ]);

        $this->assertDatabaseHas('point_transactions', [
            'customer_id' => $customer->id,
            'transaction_id' => null,
            'redemption_id' => $redemption->id,
            'type' => 'redeemed',
            'points' => -500,
            'balance_after' => 0,
        ]);
    }

    public function test_redemption_is_rejected_when_customer_has_insufficient_points(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-REDEEM-002',
            'first_name' => 'Insufficient',
            'last_name' => 'Points',
            'phone_number' => '09812222222',
            'is_active' => true,
            'points' => 100,
        ]);

        $reward = Reward::create([
            'reward_name' => 'Free Coke Kasalo',
            'reward_type' => 'free_item',
            'points_required' => 500,
            'reward_value' => null,
            'description' => 'One free Coke Kasalo.',
            'start_date' => null,
            'end_date' => null,
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.reward-redemptions.store'), [
                'customer_id' => $customer->id,
                'reward_id' => $reward->id,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Customer does not have enough points for this reward.',
            ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 100,
        ]);

        $this->assertDatabaseMissing('reward_redemptions', [
            'customer_id' => $customer->id,
            'reward_id' => $reward->id,
        ]);

        $this->assertDatabaseMissing('point_transactions', [
            'customer_id' => $customer->id,
            'redemption_id' => null,
            'type' => 'redeemed',
        ]);
    }

    public function test_inactive_reward_cannot_be_redeemed(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-REDEEM-003',
            'first_name' => 'Inactive',
            'last_name' => 'Reward',
            'phone_number' => '09813333333',
            'is_active' => true,
            'points' => 500,
        ]);

        $reward = Reward::create([
            'reward_name' => 'Inactive Reward',
            'reward_type' => 'free_item',
            'points_required' => 500,
            'reward_value' => null,
            'description' => 'This reward is inactive.',
            'start_date' => null,
            'end_date' => null,
            'is_active' => false,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.reward-redemptions.store'), [
                'customer_id' => $customer->id,
                'reward_id' => $reward->id,
            ]);

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Reward is inactive or unavailable.',
            ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 500,
        ]);

        $this->assertDatabaseMissing('reward_redemptions', [
            'customer_id' => $customer->id,
            'reward_id' => $reward->id,
        ]);
    }

    public function test_reward_cannot_be_redeemed_before_start_date(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-REDEEM-004',
            'first_name' => 'Future',
            'last_name' => 'Reward',
            'phone_number' => '09814444444',
            'is_active' => true,
            'points' => 500,
        ]);

        $reward = Reward::create([
            'reward_name' => 'Future Reward',
            'reward_type' => 'free_item',
            'points_required' => 500,
            'reward_value' => null,
            'description' => 'This reward has not started yet.',
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => null,
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.reward-redemptions.store'), [
                'customer_id' => $customer->id,
                'reward_id' => $reward->id,
            ]);

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Reward is inactive or unavailable.',
            ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 500,
        ]);

        $this->assertDatabaseMissing('reward_redemptions', [
            'customer_id' => $customer->id,
            'reward_id' => $reward->id,
        ]);
    }

    public function test_expired_reward_cannot_be_redeemed(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-REDEEM-005',
            'first_name' => 'Expired',
            'last_name' => 'Reward',
            'phone_number' => '09815555555',
            'is_active' => true,
            'points' => 500,
        ]);

        $reward = Reward::create([
            'reward_name' => 'Expired Reward',
            'reward_type' => 'free_item',
            'points_required' => 500,
            'reward_value' => null,
            'description' => 'This reward has already expired.',
            'start_date' => null,
            'end_date' => now()->subDay()->toDateString(),
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.reward-redemptions.store'), [
                'customer_id' => $customer->id,
                'reward_id' => $reward->id,
            ]);

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Reward is inactive or unavailable.',
            ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 500,
        ]);

        $this->assertDatabaseMissing('reward_redemptions', [
            'customer_id' => $customer->id,
            'reward_id' => $reward->id,
        ]);
    }

    public function test_inactive_customer_cannot_redeem_reward(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-REDEEM-006',
            'first_name' => 'Inactive',
            'last_name' => 'Customer',
            'phone_number' => '09816666666',
            'is_active' => false,
            'points' => 500,
        ]);

        $reward = Reward::create([
            'reward_name' => 'Free Coke Kasalo',
            'reward_type' => 'free_item',
            'points_required' => 500,
            'reward_value' => null,
            'description' => 'One free Coke Kasalo.',
            'start_date' => null,
            'end_date' => null,
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.reward-redemptions.store'), [
                'customer_id' => $customer->id,
                'reward_id' => $reward->id,
            ]);

        $response->assertStatus(404)
            ->assertJson([
                'message' => 'Customer is inactive or does not exist.',
            ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 500,
        ]);

        $this->assertDatabaseMissing('reward_redemptions', [
            'customer_id' => $customer->id,
            'reward_id' => $reward->id,
        ]);
    }

    public function test_nonexistent_customer_is_rejected(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $reward = Reward::create([
            'reward_name' => 'Free Coke Kasalo',
            'reward_type' => 'free_item',
            'points_required' => 500,
            'reward_value' => null,
            'description' => 'One free Coke Kasalo.',
            'start_date' => null,
            'end_date' => null,
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.reward-redemptions.store'), [
                'customer_id' => 999999,
                'reward_id' => $reward->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'customer_id',
            ]);
    }

    public function test_nonexistent_reward_is_rejected(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-REDEEM-008',
            'first_name' => 'Missing',
            'last_name' => 'Reward',
            'phone_number' => '09817777777',
            'is_active' => true,
            'points' => 500,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.reward-redemptions.store'), [
                'customer_id' => $customer->id,
                'reward_id' => 999999,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'reward_id',
            ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 500,
        ]);
    }

    public function test_redemption_requires_customer_and_reward_ids(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($cashier)
            ->postJson(route('cashier.reward-redemptions.store'), []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'customer_id',
                'reward_id',
            ]);
    }

    public function test_cancellation_refunds_customer_points(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-REDEEM-010',
            'first_name' => 'Refund',
            'last_name' => 'Customer',
            'phone_number' => '09818888888',
            'is_active' => true,
            'points' => 500,
        ]);

        $reward = Reward::create([
            'reward_name' => 'Free Coke Kasalo',
            'reward_type' => 'free_item',
            'points_required' => 500,
            'reward_value' => null,
            'description' => 'One free Coke Kasalo.',
            'start_date' => null,
            'end_date' => null,
            'is_active' => true,
        ]);

        $redemption = RewardRedemption::create([
            'customer_id' => $customer->id,
            'reward_id' => $reward->id,
            'cashier_id' => $cashier->id,
            'points_used' => 500,
            'redeemed_at' => now(),
            'status' => 'completed',
        ]);

        $customer->decrement('points', 500);

        $response = $this
            ->actingAs($cashier)
            ->patch(
                route('cashier.reward-redemptions.cancel', $redemption)
            );

        $response->assertRedirect(
            route('cashier.reward-redemptions.index')
        );

        $this->assertDatabaseHas('reward_redemptions', [
            'id' => $redemption->id,
            'status' => 'cancelled',
        ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 500,
        ]);
    }

    public function test_cancelled_redemption_creates_refunded_point_transaction(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-REDEEM-011',
            'first_name' => 'Refund',
            'last_name' => 'Ledger',
            'phone_number' => '09819999999',
            'is_active' => true,
            'points' => 500,
        ]);

        $reward = Reward::create([
            'reward_name' => 'Free Coke Kasalo',
            'reward_type' => 'free_item',
            'points_required' => 500,
            'reward_value' => null,
            'description' => 'One free Coke Kasalo.',
            'start_date' => null,
            'end_date' => null,
            'is_active' => true,
        ]);

        $redemption = RewardRedemption::create([
            'customer_id' => $customer->id,
            'reward_id' => $reward->id,
            'cashier_id' => $cashier->id,
            'points_used' => 500,
            'redeemed_at' => now(),
            'status' => 'completed',
        ]);

        $customer->decrement('points', 500);

        $this
            ->actingAs($cashier)
            ->patch(
                route('cashier.reward-redemptions.cancel', $redemption)
            );

        $this->assertDatabaseHas('point_transactions', [
            'customer_id' => $customer->id,
            'transaction_id' => null,
            'redemption_id' => $redemption->id,
            'type' => 'refunded',
            'points' => 500,
            'balance_after' => 500,
        ]);
    }

    public function test_cashier_cannot_cancel_another_cashiers_redemption(): void
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
            'customer_code' => 'TEST-REDEEM-012',
            'first_name' => 'Other',
            'last_name' => 'Cashier',
            'phone_number' => '09810000000',
            'is_active' => true,
            'points' => 0,
        ]);

        $reward = Reward::create([
            'reward_name' => 'Free Coke Kasalo',
            'reward_type' => 'free_item',
            'points_required' => 500,
            'reward_value' => null,
            'description' => 'One free Coke Kasalo.',
            'start_date' => null,
            'end_date' => null,
            'is_active' => true,
        ]);

        $redemption = RewardRedemption::create([
            'customer_id' => $customer->id,
            'reward_id' => $reward->id,
            'cashier_id' => $otherCashier->id,
            'points_used' => 500,
            'redeemed_at' => now(),
            'status' => 'completed',
        ]);

        $response = $this
            ->actingAs($cashier)
            ->patch(
                route('cashier.reward-redemptions.cancel', $redemption)
            );

        $response->assertForbidden();

        $this->assertDatabaseHas('reward_redemptions', [
            'id' => $redemption->id,
            'cashier_id' => $otherCashier->id,
            'status' => 'completed',
        ]);
    }

    public function test_redemption_older_than_24_hours_cannot_be_cancelled(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-REDEEM-013',
            'first_name' => 'Expired',
            'last_name' => 'Cancellation',
            'phone_number' => '09811111111',
            'is_active' => true,
            'points' => 0,
        ]);

        $reward = Reward::create([
            'reward_name' => 'Free Coke Kasalo',
            'reward_type' => 'free_item',
            'points_required' => 500,
            'reward_value' => null,
            'description' => 'One free Coke Kasalo.',
            'start_date' => null,
            'end_date' => null,
            'is_active' => true,
        ]);

        $redemption = RewardRedemption::create([
            'customer_id' => $customer->id,
            'reward_id' => $reward->id,
            'cashier_id' => $cashier->id,
            'points_used' => 500,
            'redeemed_at' => now()->subHours(25),
            'status' => 'completed',
        ]);

        $response = $this
            ->actingAs($cashier)
            ->patchJson(
                route('cashier.reward-redemptions.cancel', $redemption)
            );

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'This redemption can no longer be cancelled.',
            ]);

        $this->assertDatabaseHas('reward_redemptions', [
            'id' => $redemption->id,
            'status' => 'completed',
        ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 0,
        ]);

        $this->assertDatabaseMissing('point_transactions', [
            'redemption_id' => $redemption->id,
            'type' => 'refunded',
        ]);
    }

    public function test_cancelled_redemption_cannot_be_cancelled_again(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $customer = Customer::create([
            'customer_code' => 'TEST-REDEEM-014',
            'first_name' => 'Already',
            'last_name' => 'Cancelled',
            'phone_number' => '09812222222',
            'is_active' => true,
            'points' => 500,
        ]);

        $reward = Reward::create([
            'reward_name' => 'Free Coke Kasalo',
            'reward_type' => 'free_item',
            'points_required' => 500,
            'reward_value' => null,
            'description' => 'One free Coke Kasalo.',
            'start_date' => null,
            'end_date' => null,
            'is_active' => true,
        ]);

        $redemption = RewardRedemption::create([
            'customer_id' => $customer->id,
            'reward_id' => $reward->id,
            'cashier_id' => $cashier->id,
            'points_used' => 500,
            'redeemed_at' => now(),
            'status' => 'cancelled',
        ]);

        $response = $this
            ->actingAs($cashier)
            ->patchJson(
                route('cashier.reward-redemptions.cancel', $redemption)
            );

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Only completed redemptions can be cancelled.',
            ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'points' => 500,
        ]);

        $this->assertDatabaseHas('reward_redemptions', [
            'id' => $redemption->id,
            'status' => 'cancelled',
        ]);

        $this->assertDatabaseCount('point_transactions', 0);
    }
}