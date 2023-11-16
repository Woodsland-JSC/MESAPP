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
            $table->string('DocNum')->nullable();
            $table->string('DocEntry')->nullable();
            $table->string('CreateBy')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pallets', function (Blueprint $table) {
            $table->dropColumn('DocNum');
            $table->dropColumn('DocEntry');
            $table->dropColumn('CreateBy');
        });
    }
};
