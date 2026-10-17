
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create the append-only audit log table.
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            // Snapshot of the staff account that performed the action.
            // No foreign key: deleting an account must not erase its history.
            $table->unsignedBigInteger('actor_id')->nullable()->index();
            $table->string('actor_name')->nullable();
            $table->string('actor_role', 50)->nullable();

            // Examples: customer.updated, transaction.created.
            $table->string('action', 100)->index();

            // Keep the affected record identifiable after its deletion.
            $table->string('subject_type', 100)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->index(['subject_type', 'subject_id']);

            $table->string('description');
            $table->json('metadata')->nullable();

            // Audit entries are created once; no updated_at column.
            $table->timestamp('created_at')->useCurrent();
            $table->index('created_at');
        });
    }

    /**
     * Remove the audit log table if this migration is rolled back.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
