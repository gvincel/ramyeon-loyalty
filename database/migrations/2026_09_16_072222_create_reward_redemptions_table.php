<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_redemptions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->constrained('customers')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('reward_id')
                ->constrained('rewards')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('cashier_id')
                ->constrained('users')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->unsignedInteger('points_used');

            $table->timestamp('redeemed_at')
                ->useCurrent();

            $table->enum('status', [
                'completed',
                'cancelled'
            ])->default('completed');

            $table->index(
                'customer_id',
                'idx_redemptions_customer'
            );

            $table->index(
                'reward_id',
                'idx_redemptions_reward'
            );

            $table->index(
                'cashier_id',
                'idx_redemptions_cashier'
            );

            $table->index(
                'redeemed_at',
                'idx_redemptions_date'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_redemptions');
    }
};