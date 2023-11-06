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
        Schema::create('pallet_details', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('palletID');
            $table->string('Code', 50);
            $table->string('LoaiGo')->nullable();
            $table->string('MaLo')->nullable();
            $table->string('LyDo')->nullable();
            $table->string('QuyCach')->nullable();
            $table->timestamps();
            $table->foreign('palletID')->references('palletID')->on('pallets');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pallet_details');
    }
};
