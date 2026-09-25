<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->constrained('customers')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('transaction_id')
                ->nullable()
                ->constrained('transactions')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('redemption_id')
                ->nullable()
                ->constrained('reward_redemptions')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->enum('type', [
                'earned',
                'redeemed',
                'refunded',
                'adjusted'
            ]);

            $table->integer('points');

            $table->unsignedInteger('balance_after');

            $table->string('description', 255)
                ->nullable();

            $table->timestamp('created_at')
                ->useCurrent();

            $table->index(
                'customer_id',
                'idx_point_transactions_customer'
            );

            $table->index(
                'transaction_id',
                'idx_point_transactions_transaction'
            );

            $table->index(
                'redemption_id',
                'idx_point_transactions_redemption'
            );

            $table->index(
                'created_at',
                'idx_point_transactions_date'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('point_transactions');
    }
};