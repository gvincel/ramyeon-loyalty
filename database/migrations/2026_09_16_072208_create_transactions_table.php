<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('customer_id')
                ->constrained('customers')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('cashier_id')
                ->constrained('users')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->string('receipt_number', 50)
                ->nullable();

            $table->decimal('purchase_amount', 10, 2);

            $table->unsignedInteger('points_earned')
                ->default(0);

            $table->timestamp('created_at')
                ->useCurrent();

            $table->index(
                'customer_id',
                'idx_transactions_customer'
            );

            $table->index(
                'cashier_id',
                'idx_transactions_cashier'
            );

            $table->index(
                'created_at',
                'idx_transactions_date'
            );

            $table->index(
                'receipt_number',
                'idx_transactions_receipt'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};