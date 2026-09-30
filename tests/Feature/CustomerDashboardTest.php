<?php

namespace Tests\Feature;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_customer_can_view_dashboard(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'first_name' => 'Gio',
            'last_name' => 'Lingaya',
            'phone_number' => '09171234567',
            'points' => 250,
            'is_active' => true,
        ]);

        $response = $this->actingAs($customer, 'customer')
            ->get('/loyalty/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Customer/Dashboard')
            ->where('customer.id', $customer->id)
            ->where('customer.customer_code', $customer->customer_code)
            ->where('customer.first_name', 'Gio')
            ->where('customer.last_name', 'Lingaya')
            ->where('customer.phone_number', '09171234567')
            ->where('customer.points', 250)
        );
    }

    public function test_customer_cannot_see_another_customers_dashboard_data(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'first_name' => 'Customer',
            'last_name' => 'One',
            'phone_number' => '09171234567',
            'points' => 250,
            'is_active' => true,
        ]);

        /** @var Customer $otherCustomer */
        $otherCustomer = Customer::factory()->create([
            'first_name' => 'Customer',
            'last_name' => 'Two',
            'phone_number' => '09181234567',
            'points' => 999,
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($customer, 'customer')
            ->get(route('customer.dashboard'));

        $response->assertOk();

        $response->assertInertia(fn ($page) => $page
            ->component('Customer/Dashboard')
            ->where('customer.id', $customer->id)
            ->where('customer.customer_code', $customer->customer_code)
            ->where('customer.first_name', 'Customer')
            ->where('customer.last_name', 'One')
            ->where('customer.phone_number', '09171234567')
            ->where('customer.points', 250)
        );

        $this->assertNotSame(
            $customer->id,
            $otherCustomer->id
        );
    }

    public function test_guest_customer_cannot_view_dashboard(): void
    {
        $response = $this->get('/loyalty/dashboard');

        $response->assertRedirect(
            route('customer.login', absolute: false)
        );
    }
}