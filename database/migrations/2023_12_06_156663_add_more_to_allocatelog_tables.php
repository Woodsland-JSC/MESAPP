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
        Schema::table('AllocateLogs', function (Blueprint $table) {
            $table->string('Factorys')->nullable();
            $table->string('SPDich')->nullable();
            $table->string('CDTT')->nullable();
            $table->string('TO')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('AllocateLogs', function (Blueprint $table) {
            $table->drop('Factorys');
            $table->drop('SPDich');
            $table->drop('CDTT');
            $table->drop('CDTT');
        });
    }
};
