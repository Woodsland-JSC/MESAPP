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
            $table->string('DocEntry')->nullable();
            $table->string('ObjType',254)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notireceipt', function (Blueprint $table) {
            $table->dropColumn('DocEntry');
            $table->dropColumn('ObjType');
        });
    }
};
