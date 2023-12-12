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
        Schema::create('notireceipt', function (Blueprint $table) {
            $table->id();
            $table->string('text')->nullable();
            $table->DECIMAL('Quantity', 19, 6)->nullable();
            $table->integer('deleted')->default(0);
            $table->string('baseID')->nullable();
            $table->string('SPDich')->nullable();
            $table->string('QuyCach')->nullable();
            $table->string('LYDO')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notireceipt');
    }
};
