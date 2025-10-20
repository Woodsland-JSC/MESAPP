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
        Schema::table('notireceiptVCN', function (Blueprint $table) {
            $table->unsignedBigInteger('disassembly_order_id')->nullable()->after('loinhamay');
            $table->foreign('disassembly_order_id')->references('id')->on('disassembly_order')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notireceiptVCN', function (Blueprint $table) {
            $table->dropForeign(['disassembly_order_id']);
            $table->dropColumn('disassembly_order_id');
        });
    }
};
