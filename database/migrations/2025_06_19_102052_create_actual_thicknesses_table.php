<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('actual_thicknesses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('PlanID');
            $table->float('sample_1')->nullable();
            $table->float('sample_2')->nullable();
            $table->float('sample_3')->nullable();
            $table->float('sample_4')->nullable();
            $table->float('sample_5')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();

            $table->foreign('PlanID')->references('PlanID')->on('planDryings')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('actual_thicknesses', function (Blueprint $table) {
            $table->dropForeign(['PlanID']);
        });

        Schema::dropIfExists('actual_thicknesses');
    }
};
