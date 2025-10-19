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
        Schema::create('disassembly_order', function (Blueprint $table) {
            $table->id();
            $table->string('SubItemCode');
            $table->integer('Qty');
            $table->string('status')->enum('pending', 'completed', 'canceled')->default('pending');
            $table->string('team');
            $table->string('CreatedBy');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disassembly_order');
    }
};
