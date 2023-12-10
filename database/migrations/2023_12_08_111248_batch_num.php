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
        Schema::create('BatchNums', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('palletID')->nullable();
            $table->string('ItemCode')->nullable();
            $table->string('BatchNumber')->nullable();
            $table->DECIMAL('Quantity', 19, 6)->nullable();
            $table->float('CDai')->nullable()->default(1);
            $table->float('CRong')->nullable()->default(1);
            $table->float('CDay')->nullable()->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('BatchNums');
    }
};
