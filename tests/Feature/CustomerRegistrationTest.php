<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\CustomerQrCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CustomerRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/loyalty/register');

        $response->assertStatus(200);
    }

    public function test_customer_can_register_successfully(): void
    {
        $response = $this->post('/loyalty/register', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'phone_number' => '09171234567',
            'email' => 'juan@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertRedirect(
            route('customer.login', absolute: false)
        );

        $this->assertDatabaseHas('customers', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'phone_number' => '09171234567',
            'email' => 'juan@example.com',
            'points' => 0,
            'is_active' => true,
        ]);

        $customer = Customer::where(
            'phone_number',
            '09171234567'
        )->firstOrFail();

        $this->assertStringStartsWith('RC-', $customer->customer_code);

        $this->assertTrue(
            Hash::check('Password123', $customer->password)
        );

        $this->assertDatabaseHas('customer_qr_codes', [
            'customer_id' => $customer->id,
            'is_active' => true,
        ]);
    }

    public function test_customer_registration_creates_a_secure_qr_token(): void
    {
        $this->post('/loyalty/register', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'phone_number' => '09171234567',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $customer = Customer::where(
            'phone_number',
            '09171234567'
        )->firstOrFail();

        $qrCode = CustomerQrCode::where(
            'customer_id',
            $customer->id
        )->firstOrFail();

        $this->assertSame(64, strlen($qrCode->qr_token));
        $this->assertMatchesRegularExpression(
            '/^[a-f0-9]{64}$/',
            $qrCode->qr_token
        );
    }

    public function test_customer_cannot_register_with_an_existing_phone_number(): void
    {
        Customer::factory()->create([
            'phone_number' => '09171234567',
        ]);

        $response = $this->post('/loyalty/register', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'phone_number' => '09171234567',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertSessionHasErrors('phone_number');

        $this->assertDatabaseCount('customers', 1);
    }

    public function test_customer_registration_rejects_invalid_phone_number(): void
    {
        $invalidNumbers = [
            '0917123456',
            '091712345678',
            '08171234567',
            '9171234567',
            '09-1712-34567',
        ];

        foreach ($invalidNumbers as $phoneNumber) {
            $response = $this->post('/loyalty/register', [
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'phone_number' => $phoneNumber,
                'password' => 'Password123',
                'password_confirmation' => 'Password123',
            ]);

            $response->assertSessionHasErrors('phone_number');
        }

        $this->assertDatabaseCount('customers', 0);
    }

    public function test_customer_registration_rejects_weak_password(): void
    {
        $response = $this->post('/loyalty/register', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'phone_number' => '09171234567',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertSessionHasErrors('password');

        $this->assertDatabaseCount('customers', 0);
    }

    public function test_customer_registration_requires_password_confirmation(): void
    {
        $response = $this->post('/loyalty/register', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'phone_number' => '09171234567',
            'password' => 'Password123',
            'password_confirmation' => 'DifferentPassword123',
        ]);

        $response->assertSessionHasErrors('password');

        $this->assertDatabaseCount('customers', 0);
    }

    public function test_customer_registration_accepts_optional_email(): void
    {
        $response = $this->post('/loyalty/register', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'phone_number' => '09171234567',
            'email' => null,
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertRedirect(
            route('customer.login', absolute: false)
        );

        $this->assertDatabaseHas('customers', [
            'phone_number' => '09171234567',
            'email' => null,
        ]);
    }

    public function test_customer_registration_does_not_authenticate_customer(): void
    {
        $this->post('/loyalty/register', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'phone_number' => '09171234567',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $this->assertGuest('customer');
    }

    public function test_customer_registration_is_rate_limited(): void
    {
        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $response = $this->post('/loyalty/register', [
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'phone_number' => '09171234' . str_pad((string) $attempt, 3, '0', STR_PAD_LEFT),
                'password' => 'Password123',
                'password_confirmation' => 'Password123',
            ]);

            $response->assertRedirect(
                route('customer.login', absolute: false)
            );
        }

        $response = $this->post('/loyalty/register', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'phone_number' => '09171234999',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
        ]);

        $response->assertStatus(429);
    }
}