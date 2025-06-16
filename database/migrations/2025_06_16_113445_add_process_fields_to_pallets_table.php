<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pallets', function (Blueprint $table) {
            $table->string('RanBy')->nullable()->after('LoadedIntoKilnDate');
            $table->dateTime('RanDate')->nullable()->after('RanBy');
            $table->string('CompletedBy')->nullable()->after('RanDate');
            $table->dateTime('CompletedDate')->nullable()->after('CompletedBy');
        });
    }

    public function down(): void
    {
        Schema::table('pallets', function (Blueprint $table) {
            $table->dropColumn(['RanBy', 'RanDate', 'CompletedBy', 'CompletedDate']);
        });
    }
};