<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pallets', function (Blueprint $table) {
            // Xóa các cột start_time và end_time nếu tồn tại
            if (Schema::hasColumn('pallets', 'start_time')) {
                $table->dropColumn('start_time');
            }
            if (Schema::hasColumn('pallets', 'end_time')) {
                $table->dropColumn('end_time');
            }

            // Thêm cột stacking_time
            $table->integer('stacking_time')->nullable()->after('CompletedDate');
        });
    }

    public function down(): void
    {
        Schema::table('pallets', function (Blueprint $table) {
            // Phục hồi lại cột start_time và end_time
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();

            // Xóa cột stacking_time
            $table->dropColumn('stacking_time');
        });
    }
};
