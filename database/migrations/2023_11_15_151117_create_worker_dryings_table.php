<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // table cho công nhân sấy
    public function up(): void
    {
        Schema::create('worker_dryings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('PlanID');
            $table->string('userID');
            $table->timestamps();
            $table->foreign('PlanID')->references('PlanID')->on('planDryings');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('worker_dryings');
    }
};
