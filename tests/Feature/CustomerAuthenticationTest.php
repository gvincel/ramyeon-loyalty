<?php

namespace Tests\Feature;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/loyalty/login');

        $response->assertStatus(200);
    }

    public function test_customer_can_authenticate_using_phone_number(): void
    {
        $customer = Customer::factory()->create([
            'phone_number' => '09171234567',
            'password' => 'password123',
            'is_active' => true,
        ]);

        $response = $this->post('/loyalty/login', [
            'phone_number' => '09171234567',
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($customer, 'customer');

        $response->assertRedirect(
            route('customer.dashboard', absolute: false)
        );
    }

    public function test_customer_can_not_authenticate_with_invalid_password(): void
    {
        $customer = Customer::factory()->create([
            'phone_number' => '09171234567',
            'password' => 'password123',
            'is_active' => true,
        ]);

        $this->post('/loyalty/login', [
            'phone_number' => '09171234567',
            'password' => 'wrong-password',
        ]);

        $this->assertGuest('customer');
    }

    public function test_inactive_customer_can_not_authenticate(): void
    {
        $customer = Customer::factory()->create([
            'phone_number' => '09171234567',
            'password' => 'password123',
            'is_active' => false,
        ]);

        $this->post('/loyalty/login', [
            'phone_number' => '09171234567',
            'password' => 'password123',
        ]);

        $this->assertGuest('customer');
    }

    public function test_customer_can_logout(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'is_active' => true,
        ]);

        $response = $this->actingAs($customer, 'customer')
            ->post('/loyalty/logout');

        $this->assertGuest('customer');

        $response->assertRedirect(
            route('customer.login', absolute: false)
        );
    }
}