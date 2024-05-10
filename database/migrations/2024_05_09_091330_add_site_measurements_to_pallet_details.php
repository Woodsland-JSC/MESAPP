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
            $table->string('CDay_Site')->nullable()->after('CRong');
            $table->string('CRong_Site')->nullable()->after('CDay_Site');
            $table->string('CDai_Site')->nullable()->after('CRong_Site');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pallet_details', function (Blueprint $table) {
            $table->dropColumn('CDay_Site');
            $table->dropColumn('CRong_Site');
            $table->dropColumn('CDai_Site');
        });
    }
};
