<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->unsignedInteger('points_used')
                ->default(0)
                ->after('purchase_amount');

            $table->decimal('amount_paid', 10, 2)
                ->nullable()
                ->after('points_used');
        });

        DB::table('transactions')->update([
            'amount_paid' => DB::raw('purchase_amount'),
        ]);

        Schema::table('transactions', function (Blueprint $table) {
            $table->decimal('amount_paid', 10, 2)
                ->nullable(false)
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'points_used',
                'amount_paid',
            ]);
        });
    }
};