<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    //table cho chi tiết kế hoạch sấy
    public function up(): void
    {
        Schema::create('plan_detail', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('PlanID');
            $table->string('pallet');
            $table->string('size');
            $table->DECIMAL('Qty', 19, 2);
            $table->float('Mass', 19, 4);
            $table->float('CDai');
            $table->float('CRong');
            $table->float('CDay');
            $table->timestamps();
            $table->foreign('PlanID')->references('PlanID')->on('planDryings');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_detail');
    }
};
