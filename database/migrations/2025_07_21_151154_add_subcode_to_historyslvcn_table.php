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
        Schema::table('historySLVCN', function (Blueprint $table) {
            $table->string('subCode', 50)->nullable()->after('HXL');
        });
    }

    public function down()
    {
        Schema::table('historySLVCN', function (Blueprint $table) {
            $table->dropColumn('subCode');
        });
    }
};
