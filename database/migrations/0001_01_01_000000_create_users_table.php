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

            // Display name
            $table->string('name');

            // Cashiers use username; admins use email.
            $table->string('username', 50)
                ->nullable()
                ->unique();

            $table->string('email', 100)
                ->nullable()
                ->unique();

            $table->timestamp('email_verified_at')
                ->nullable();

            $table->string('password', 255);

            $table->rememberToken();

            $table->enum('role', [
                'admin',
                'cashier',
            ]);

            $table->boolean('is_active')
                ->default(true);

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