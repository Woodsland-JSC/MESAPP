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
            $table->string('baseID')->nullable();
            $table->string('SPDich')->nullable();
            $table->string('QuyCach')->nullable();
            $table->string('LYDO')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notireceipt', function (Blueprint $table) {
            $table->drop('baseID');
            $table->drop('SPDich');
            $table->drop('QuyCach');
            $table->drop('LYDO');
        });
    }
};
