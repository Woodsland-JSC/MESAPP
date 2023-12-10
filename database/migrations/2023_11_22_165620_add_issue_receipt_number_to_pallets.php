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
        Schema::table('pallets', function (Blueprint $table) {
            $table->float('IssueNumber', 14)->default(0)->nullable();
            $table->float('ReceiptNumber', 14)->default(0)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pallets', function (Blueprint $table) {
            $table->dropColumn('IssueNumber');
            $table->dropColumn('ReceiptNumber');
        });
    }
};
