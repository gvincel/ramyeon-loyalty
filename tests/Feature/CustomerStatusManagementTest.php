<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}