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
        Schema::table('planDryings', function (Blueprint $table) {
            $table->integer('CT1')->nullable();
            $table->integer('CT2')->nullable();
            $table->integer('CT3')->nullable();
            $table->integer('CT4')->nullable();
            $table->integer('CT5')->nullable();
            $table->integer('CT6')->nullable();
            $table->integer('CT7')->nullable();
            $table->integer('CT8')->nullable();
            $table->integer('CT9')->nullable();
            $table->integer('CT10')->nullable();
            $table->integer('CT11')->nullable();
            $table->integer('CT12')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('planDryings', function (Blueprint $table) {
            $table->dropColumn('CT1');
            $table->dropColumn('CT2');
            $table->dropColumn('CT3');
            $table->dropColumn('CT4');
            $table->dropColumn('CT5');
            $table->dropColumn('CT6');
            $table->dropColumn('CT7');
            $table->dropColumn('CT8');
            $table->dropColumn('CT9');
            $table->dropColumn('CT10');
            $table->dropColumn('CT11');
            $table->dropColumn('CT12');
        });
    }
};
