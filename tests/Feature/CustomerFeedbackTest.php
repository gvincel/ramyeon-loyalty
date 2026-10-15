<?php

namespace Tests\Feature;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerFeedbackTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_view_customer_feedback_form(): void
    {
        $response = $this->get(route('customer.feedback.create'));

        $response->assertRedirect(route('customer.login', absolute: false));
    }

    public function test_authenticated_customer_can_view_feedback_form(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($customer, 'customer')
            ->get(route('customer.feedback.create'));

        $response->assertOk();

        $response->assertInertia(fn ($page) =>
            $page->component('Customer/Feedback')
        );
    }

    public function test_customer_can_submit_feedback_with_a_rating(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($customer, 'customer')
            ->post(route('customer.feedback.store'), [
                'rating' => 5,
                'message' => 'The service was excellent!',
            ]);

        $response->assertRedirect();

        $response->assertSessionHas(
            'success',
            'Thank you for your feedback!'
        );

        $this->assertDatabaseHas('feedback', [
            'customer_id' => $customer->id,
            'rating' => 5,
            'message' => 'The service was excellent!',
        ]);
    }

    public function test_customer_can_submit_feedback_without_a_rating(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($customer, 'customer')
            ->post(route('customer.feedback.store'), [
                'message' => 'Please add more seating.',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('feedback', [
            'customer_id' => $customer->id,
            'rating' => null,
            'message' => 'Please add more seating.',
        ]);
    }

    public function test_feedback_submission_uses_authenticated_customer_id(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'is_active' => true,
        ]);

        /** @var Customer $otherCustomer */
        $otherCustomer = Customer::factory()->create([
            'is_active' => true,
        ]);

        $this->actingAs($customer, 'customer')
            ->post(route('customer.feedback.store'), [
                'customer_id' => $otherCustomer->id,
                'rating' => 4,
                'message' => 'A good experience overall.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('feedback', [
            'customer_id' => $customer->id,
            'rating' => 4,
            'message' => 'A good experience overall.',
        ]);

        $this->assertDatabaseMissing('feedback', [
            'customer_id' => $otherCustomer->id,
            'message' => 'A good experience overall.',
        ]);
    }

    public function test_feedback_requires_a_message(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'is_active' => true,
        ]);

        $this->actingAs($customer, 'customer')
            ->post(route('customer.feedback.store'), [
                'rating' => 4,
                'message' => '',
            ])
            ->assertSessionHasErrors('message');

        $this->assertDatabaseCount('feedback', 0);
    }

    public function test_feedback_rejects_ratings_outside_one_to_five(): void
    {
        /** @var Customer $customer */
        $customer = Customer::factory()->create([
            'is_active' => true,
        ]);

        foreach ([0, 6, -1] as $rating) {
            $this->actingAs($customer, 'customer')
                ->post(route('customer.feedback.store'), [
                    'rating' => $rating,
                    'message' => 'Testing rating validation.',
                ])
                ->assertSessionHasErrors('rating');
        }

        $this->assertDatabaseCount('feedback', 0);
    }

    public function test_guest_cannot_submit_feedback(): void
    {
        $this->post(route('customer.feedback.store'), [
            'rating' => 5,
            'message' => 'A guest submission attempt.',
        ])->assertRedirect(route('customer.login', absolute: false));

        $this->assertDatabaseCount('feedback', 0);
    }
}