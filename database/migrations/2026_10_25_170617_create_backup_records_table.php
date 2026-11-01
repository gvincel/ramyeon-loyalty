
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('backup_records', function (Blueprint $table): void {
            $table->id();

            $table->string('backup_id', 64)->unique();
            $table->string('type', 32)->default('database');
            $table->string('status', 32)->default('pending')->index();

            $table->string('disk', 64)->default('local');
            $table->string('path', 1024)->nullable();

            $table->unsignedBigInteger('file_size_bytes')->nullable();
            $table->char('sha256', 64)->nullable();

            $table->boolean('encrypted')->default(false);
            $table->timestamp('verified_at')->nullable();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            $table->string('failure_code', 64)->nullable();
            $table->text('failure_message')->nullable();

            $table->timestamps();

            $table->index(['type', 'status']);
            $table->index(['status', 'completed_at']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('backup_records');
    }
};
