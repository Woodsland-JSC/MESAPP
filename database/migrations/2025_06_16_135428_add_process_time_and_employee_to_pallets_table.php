<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pallets', function (Blueprint $table) {
            $table->dateTime('start_time')->nullable()->after('CompletedDate');
            $table->dateTime('end_time')->nullable()->after('start_time');
            $table->string('employee')->nullable()->after('end_time');
        });
    }

    public function down(): void
    {
        Schema::table('pallets', function (Blueprint $table) {
            $table->dropColumn(['start_time', 'end_time', 'employee']);
        });
    }
};

