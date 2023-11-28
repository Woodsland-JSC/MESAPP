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
        Schema::create('disability_rates_detail', function (Blueprint $table) {
            $table->id();
            $table->string('palletID');
            $table->integer('refID')->default(-1);
            $table->integer('SLPallet');
            $table->integer('SLMau');
            $table->integer('SLMO_TOP');
            $table->integer('SLCong');
            $table->text('note');
            $table->string('created_by');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disability_rates_detail');
    }
};
