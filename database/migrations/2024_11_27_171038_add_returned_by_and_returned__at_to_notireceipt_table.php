<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notireceipt', function (Blueprint $table) {
            $table->integer('returned_by')->nullable()->after('deleted_at');
            $table->timestamp('returned_at')->nullable()->after('returned_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notireceipt', function (Blueprint $table) {
            $table->dropColumn('returned_by');
            $table->dropColumn('returned_at');
        });
    }
};
