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
        Schema::create('logchecked', function (Blueprint $table) {
            $table->id();
            $table->integer('PlanID')->nullable();
            $table->string('M1')->nullable();
            $table->string('M2')->nullable();
            $table->string('M3')->nullable();
            $table->string('M4')->nullable();
            $table->string('M5')->nullable();
            $table->string('Q1')->nullable();
            $table->string('Q2')->nullable();
            $table->string('Q3')->nullable();
            $table->string('Q4')->nullable();
            $table->string('Q5')->nullable();
            $table->string('Q6')->nullable();
            $table->string('Q7')->nullable();
            $table->string('Q8')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logchecked');
    }
};
