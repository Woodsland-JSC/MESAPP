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
        Schema::table('disassembly_order', function (Blueprint $table) {
            // Xóa cột 'status' nếu tồn tại
            if (Schema::hasColumn('disassembly_order', 'status')) {
                $table->dropColumn('status');
            }
            
            $table->boolean('isClosed')->default(false)->after('Qty'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('disassembly_order', function (Blueprint $table) {
            $table->string('status')->nullable();

            $table->dropColumn('isClosed');
        });
    }
};
