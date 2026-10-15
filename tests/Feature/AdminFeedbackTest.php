<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Feedback;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminFeedbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_feedback_page(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.feedback.index'));

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Feedback')
        );
    }

    public function test_cashier_cannot_view_feedback_page(): void
    {
        $cashier = User::factory()->create([
            'role' => 'cashier',
            'is_active' => true,
        ]);

        $this->actingAs($cashier)
            ->get(route('admin.feedback.index'))
            ->assertForbidden();
    }

    public function test_guest_cannot_view_feedback_page(): void
    {
        $this->get(route('admin.feedback.index'))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_view_submitted_feedback(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $customer = Customer::factory()->create([
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'customer_code' => 'RC-FEED001',
        ]);

        Feedback::create([
            'customer_id' => $customer->id,
            'rating' => 5,
            'message' => 'The food and service were excellent!',
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.feedback.index'));

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Feedback')
                ->has('feedback.data', 1)
                ->where('feedback.data.0.rating', 5)
                ->where(
                    'feedback.data.0.message',
                    'The food and service were excellent!'
                )
                ->where(
                    'feedback.data.0.customer.first_name',
                    'Juan'
                )
                ->where(
                    'feedback.data.0.customer.last_name',
                    'Dela Cruz'
                )
                ->where(
                    'feedback.data.0.customer.customer_code',
                    'RC-FEED001'
                )
        );
    }

    public function test_admin_can_view_feedback_without_a_rating(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        Feedback::create([
            'customer_id' => null,
            'rating' => null,
            'message' => 'Please add more seating.',
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.feedback.index'));

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Feedback')
                ->has('feedback.data', 1)
                ->where('feedback.data.0.rating', null)
                ->where(
                    'feedback.data.0.message',
                    'Please add more seating.'
                )
                ->where('feedback.data.0.customer', null)
        );
    }
}