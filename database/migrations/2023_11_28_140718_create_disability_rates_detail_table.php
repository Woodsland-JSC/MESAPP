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
            $table->string('PlanID');
            $table->integer('refID')->default(-1);
            $table->float('SLPallet');
            $table->float('SLMau');
            $table->float('SLMoTop');
            $table->float('SLCong');
            $table->text('note')->nullable();
            // $table->text('note')->nullable();
            $table->integer('created_by');
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
