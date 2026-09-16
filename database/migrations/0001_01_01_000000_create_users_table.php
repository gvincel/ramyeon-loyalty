<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Admin uses email; cashier uses username.
            $table->string('username', 50)->nullable()->unique();
            $table->string('email', 100)->nullable()->unique();

            $table->string('password', 255);

            $table->enum('role', [
                'admin',
                'cashier'
            ]);

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index('role', 'idx_users_role');
            $table->index('is_active', 'idx_users_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};