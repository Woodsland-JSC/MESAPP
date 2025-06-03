<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('notireceiptVCN', function (Blueprint $table) {
            $table->text('document_log')->nullable()->after('DocEntry');
        });
    }

    public function down(): void
    {
        Schema::table('notireceiptVCN', function (Blueprint $table) {
            $table->dropColumn('document_log');
        });
    }
};
