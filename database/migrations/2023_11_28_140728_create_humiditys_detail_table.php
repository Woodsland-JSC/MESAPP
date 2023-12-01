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
        Schema::create('humiditys_detail', function (Blueprint $table) {
            $table->id();
            $table->string('PlanID');
            $table->integer('refID')->nullable()->default(-1);
            $table->integer('value');
            $table->string('created_by');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('humiditys_detail');
    }
};
