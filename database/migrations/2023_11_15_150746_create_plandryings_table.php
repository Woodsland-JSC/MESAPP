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
        // table cho kế hoạch sấy
        Schema::create('planDryings', function (Blueprint $table) {
            $table->bigIncrements('PlanID');
            $table->string('Code');
            $table->string('Oven');
            $table->string('Reason');
            $table->string('Method');
            $table->float('Mass')->default(0)->nullable();;
            $table->integer('TotalPallet')->default(0)->nullable();;
            $table->datetime('PlanDate')->nullable();
            $table->integer('Status')->default(0)->nullable();;
            $table->integer('Checked')->default(0)->nullable();;
            $table->integer('Review')->default(0)->nullable();;
            $table->integer('Disabilities')->default(0)->nullable();;
            $table->string('CreateBy')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('planDryings');
    }
};
