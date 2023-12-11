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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('user_sap')->nullable();
            $table->string('password_sap')->nullable();
            $table->string('url_sapapp')->nullable();
            $table->string('token_sap')->nullable();
            $table->string('user_db')->nullable();
            $table->string('password_db')->nullable();
            $table->string('token_db')->nullable();
            $table->string('url_sapdb')->nullable();
            $table->string('dbname')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
