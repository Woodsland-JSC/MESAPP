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
        Schema::create('pallets', function (Blueprint $table) {
            $table->bigIncrements('palletID');
            $table->string('Code', 50);
            $table->string('LoaiGo')->nullable();
            $table->string('MaLo')->nullable();
            $table->string('LyDo')->nullable();
            $table->string('QuyCach')->nullable();
            $table->timestamp('NgayNhap')->nullable();
            $table->integer('status')->default(0);
            $table->integer('is_active')->default(0);
            $table->string('DocNum')->nullable();
            $table->string('DocEntry')->nullable();
            $table->string('CreateBy')->nullable();
            $table->string('LoadedBy')->nullable();
            $table->timestamp('LoadedIntoKilnDate')->nullable();
            $table->float('IssueNumber', 14)->default(0)->nullable();
            $table->float('ReceiptNumber', 14)->default(0)->nullable();
            $table->integer('flag')->default(0)->nullable();
            $table->string('palletSAP')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pallets');
    }
};
