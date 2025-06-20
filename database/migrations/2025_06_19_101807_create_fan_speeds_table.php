<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('fan_speeds', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('PlanID');
            $table->float('fan_speed_1')->nullable();
            $table->float('fan_speed_2')->nullable();
            $table->float('fan_speed_3')->nullable();
            $table->float('fan_speed_4')->nullable();
            $table->float('fan_speed_5')->nullable();
            $table->float('fan_speed_6')->nullable();
            $table->float('fan_speed_7')->nullable();
            $table->float('fan_speed_8')->nullable();
            $table->timestamps();
            $table->unsignedBigInteger('created_by')->nullable();

            $table->foreign('PlanID')->references('PlanID')->on('planDryings')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('fan_speeds', function (Blueprint $table) {
            $table->dropForeign(['PlanID']);
        });

        Schema::dropIfExists('fan_speeds');
    }
};
