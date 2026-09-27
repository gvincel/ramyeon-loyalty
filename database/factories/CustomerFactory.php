<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'customer_code' => 'CUST-' . strtoupper(Str::random(8)),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'phone_number' => '09' . fake()->numerify('#########'),
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password',
            'points' => 0,
            'is_active' => true,
        ];
    }
}