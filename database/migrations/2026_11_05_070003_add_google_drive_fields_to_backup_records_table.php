<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('backup_records', function (Blueprint $table): void {
            $table->string('drive_status', 32)->default('skipped')->index();
            $table->string('drive_file_id', 255)->nullable();
            $table->timestamp('drive_uploaded_at')->nullable();
            $table->unsignedTinyInteger('drive_upload_attempts')->default(0);
            $table->text('drive_last_error')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('backup_records', function (Blueprint $table): void {
            $table->dropIndex(['drive_status']);
            $table->dropColumn([
                'drive_status',
                'drive_file_id',
                'drive_uploaded_at',
                'drive_upload_attempts',
                'drive_last_error',
            ]);
        });
    }
};