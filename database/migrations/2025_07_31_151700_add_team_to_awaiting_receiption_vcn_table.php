<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('awaitingstocksvcn', function (Blueprint $table) {
            $table->string('team')->nullable()->after('wareHouse'); 
        });
    }

    public function down()
    {
        Schema::table('awaitingstocksvcn', function (Blueprint $table) {
            $table->dropColumn(['team']);
        });
    }
};
