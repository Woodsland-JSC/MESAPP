<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pallets', function (Blueprint $table) {
            $table->time('start_time')->nullable()->change();
            $table->time('end_time')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('pallets', function (Blueprint $table) {
            $table->dateTime('start_time')->change(); // hoặc dùng kiểu cũ nếu không phải datetime
            $table->dateTime('end_time')->change();
        });
    }
};
