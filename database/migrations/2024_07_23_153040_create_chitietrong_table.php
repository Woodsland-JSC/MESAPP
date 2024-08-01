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
        Schema::create('chitietrong', function (Blueprint $table) {
            $table->id();
            $table->integer('baseID');
            $table->string('ItemCode')->nullable();
            $table->string('ItemName')->nullable();
            $table->integer('type')->nullable();
            $table->decimal('Quantity', 19, 6)->nullable();
            $table->string('QuyCach')->nullable();
            $table->string('LYDO')->nullable();
            $table->string('team')->nullable();
            $table->string('NextTeam')->nullable();
            $table->float('CDay')->default(1);
            $table->float('CRong')->default(1);
            $table->float('CDai')->default(1);
            $table->decimal('openQty', 19, 6)->nullable();
            $table->string('loinhamay')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chitietrong');
    }
};
