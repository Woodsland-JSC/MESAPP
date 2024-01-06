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
        Schema::create('historySL', function (Blueprint $table) {
            $table->id();
            $table->string('LSX')->nullable();
            $table->string('itemchild')->nullable();
            $table->string('to')->nullable();
            $table->float('quantity')->nullable();
            $table->integer('ObjType')->nullable();
            $table->string('DocEntry')->nullable();
            $table->string('LL')->nullable();
            $table->string('HXL')->nullable();
            $table->string('SPDich')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historySL');
    }
};
