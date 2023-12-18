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
            $table->string('team');
            $table->integer('type');
            $table->integer('confirm')->nullable()->default(0);
            $table->string('confirmBy')->nullable();
            $table->datetime('confirm_at')->nullable();
            $table->string('deleteBy')->nullable();
            $table->datetime('deleted_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notireceipt', function (Blueprint $table) {
            $table->dropColumn('team');
            $table->dropColumn('type');
            $table->dropColumn('confirm');
            $table->dropColumn('confirmBy');
            $table->dropColumn('confirm_at');
            $table->dropColumn('deleteBy');
            $table->dropColumn('deleted_at');
        });
    }
};
