<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDocumentLogToNotireceiptTable extends Migration
{
    public function up()
    {
        Schema::table('notireceipt', function (Blueprint $table) {
            $table->text('document_log')->nullable()->after('DocEntry');
        });
    }

    public function down()
    {
        Schema::table('notireceipt', function (Blueprint $table) {
            $table->dropColumn('document_log');
        });
    }
}
