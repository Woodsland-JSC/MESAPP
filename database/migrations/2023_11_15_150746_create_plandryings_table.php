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
        // table cho kế hoạch sấy
        Schema::create('planDryings', function (Blueprint $table) {
            $table->bigIncrements('PlanID');
            $table->string('Code');
            $table->string('Oven'); //mã lò sấy
            $table->string('Reason'); //mục đích sấy
            $table->string('Method'); //quy cách sấy
            $table->float('Mass')->default(0)->nullable(); //khối lượng
            $table->integer('TotalPallet')->default(0)->nullable(); //tổng số pallet
            $table->datetime('PlanDate')->nullable(); //ngày ra lò dự kiến
            $table->integer('Status')->default(0)->nullable(); // trạng thái lò. 0 new, 1. chạy lò, 2.ra lò
            $table->integer('Checked')->default(0)->nullable(); //0, chưa kiểm tra, 1 đã kiểm tra
            $table->integer('Review')->default(0)->nullable(); // 0. chưa đánh giá, 1. đã đánh giá
            $table->integer('Disabilities')->default(0)->nullable(); //khuyến tật
            $table->string('CreateBy')->nullable(); // user tạo kế hoạch sấy
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('planDryings');
    }
};
