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
        Schema::table('plandryings', function (Blueprint $table) {
           $table->datetime('runDate')->nullable();
           $table->datetime('reviewDate')->nullable();
           $table->datetime('CompletedDate')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plandryings', function (Blueprint $table) {
            $table->dropColumn('runDate');
            $table->dropColumn('reviewDate');
            $table->dropColumn('CompletedDate');
        });
    }
};
