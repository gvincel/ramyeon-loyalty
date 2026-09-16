<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();

            $table->string('customer_code', 50)->unique();

            $table->string('first_name', 50);
            $table->string('last_name', 50);

            $table->string('phone_number', 20)->unique();
            $table->string('email', 100)->nullable();

            $table->unsignedInteger('points')->default(0);

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index(
                ['last_name', 'first_name'],
                'idx_customers_name'
            );

            $table->index(
                'is_active',
                'idx_customers_active'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};