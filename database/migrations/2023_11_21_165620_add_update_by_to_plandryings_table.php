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
            $table->integer('CheckedBy')->nullable();
            $table->integer('RunBy')->nullable();
            $table->integer('ReviewBy')->nullable();
            $table->integer('CompletedBy')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plandryings', function (Blueprint $table) {
            $table->dropColumn('CheckedBy');
            $table->dropColumn('RunBy');
            $table->dropColumn('ReviewBy');
            $table->dropColumn('CompletedBy');
        });
    }
};
