<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rewards', function (Blueprint $table) {
            $table->id();

            $table->string('reward_name', 100);

            $table->enum('reward_type', [
                'discount',
                'free_item'
            ]);

            $table->unsignedInteger('points_required');

            $table->decimal('reward_value', 10, 2)
                ->nullable();

            $table->text('description')
                ->nullable();

            $table->date('start_date')
                ->nullable();

            $table->date('end_date')
                ->nullable();

            $table->boolean('is_active')
                ->default(true);

            $table->timestamps();

            $table->index(
                'is_active',
                'idx_rewards_active'
            );

            $table->index(
                ['start_date', 'end_date'],
                'idx_rewards_dates'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rewards');
    }
};