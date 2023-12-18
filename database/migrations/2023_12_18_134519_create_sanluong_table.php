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
        Schema::create('sanluong', function (Blueprint $table) {
            $table->id();
            $table->string('FatherCode',254);
            $table->string('ItemCode',254);
            $table->float('CompleQty',19,4);// số lượng đạt
            $table->float('RejectQty',19,4);// số lượng lỗi
            $table->integer('CDay')->default(1);// chiều dày
            $table->integer('CRong')->default(1);// chiều rộng
            $table->integer('CDai')->default(1);// chiều dài
            $table->string('Team',254);// tổ
            $table->string('NexTeam',254); // tổ tiếp theo
            $table->string('status')->default(0);// 0 là gửi đi, 1 là xác nhận, 2 là trả về
            $table->string('ObjType',254)->nullable();// chứng từ đẩy lên sap 59 goods issue
            $table->string('Reason',254)->nullable();// chứng từ đẩy lên sap 59 goods issue
            $table->string('DocEntry',254)->nullable();// chứng từ đẩy lên sap
            $table->string('Type',254);//CBG /VCN
            $table->string('create_by');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sanluong');
    }
};
