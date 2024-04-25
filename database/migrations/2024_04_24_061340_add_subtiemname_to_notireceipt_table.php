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
        Schema::table('notireceipt', function (Blueprint $table) {
            $table->string('SubItemCode')->nullable()->after('SPDich');
            $table->string('SubItemName')->nullable()->after('SubItemCode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notireceipt', function (Blueprint $table) {
            $table->dropColumn('SubItemCode');
            $table->dropColumn('SubItemName');
        });
    }
};
