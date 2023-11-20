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
        Schema::table('pallet_details', function (Blueprint $table) {
            $table->float('CDai');
            $table->float('CRong');
            $table->float('CDay');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pallet_details', function (Blueprint $table) {
            $table->dropColumn('CDai');
            $table->dropColumn('CRong');
            $table->dropColumn('CDay');
        });
    }
};
