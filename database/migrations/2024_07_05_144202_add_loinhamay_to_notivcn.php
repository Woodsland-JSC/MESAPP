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
            $table->string('loinhamay')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notireceiptVCN', function (Blueprint $table) {
            $table->dropColumn('loinhamay');
        });
    }
};
