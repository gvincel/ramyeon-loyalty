<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_cashier_can_authenticate_using_username(): void
    {
        $user = User::factory()->create([
            'role' => 'cashier',
            'username' => 'cashier01',
            'email' => null,
            'is_active' => true,
        ]);

        $response = $this->post('/login', [
            'login' => 'cashier01',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);

        $response->assertRedirect(
            route('cashier.dashboard', absolute: false)
        );
    }

    public function test_admin_can_authenticate_using_email(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'username' => null,
            'email' => 'admin@example.com',
            'is_active' => true,
        ]);

        $response = $this->post('/login', [
            'login' => 'admin@example.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);

        $response->assertRedirect(
            route('admin.dashboard', absolute: false)
        );
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'role' => 'cashier',
            'username' => 'cashier01',
            'email' => null,
            'is_active' => true,
        ]);

        $this->post('/login', [
            'login' => 'cashier01',
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_inactive_users_can_not_authenticate(): void
    {
        $user = User::factory()->create([
            'role' => 'cashier',
            'username' => 'inactive01',
            'email' => null,
            'is_active' => false,
        ]);

        $this->post('/login', [
            'login' => 'inactive01',
            'password' => 'password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}