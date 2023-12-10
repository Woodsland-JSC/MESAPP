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
        Schema::create('allocatelogs', function (Blueprint $table) {
            $table->id();
            $table->string('BaseEntry')->nullable();
            $table->string('ItemCode')->nullable();
            $table->DECIMAL('Qty', 19, 6)->nullable();
            $table->text('Body')->nullable();
            $table->integer('DocNum')->nullable();
            $table->integer('DocEntry')->nullable();
            $table->integer('Status')->default(-1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('allocatelogs');
    }
};
