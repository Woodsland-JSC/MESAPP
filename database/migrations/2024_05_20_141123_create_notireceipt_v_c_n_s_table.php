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
        Schema::create('notireceiptVCN', function (Blueprint $table) {
            $table->id();
            $table->string('ProdType')->nullable();
            $table->string('FatherCode')->nullable();
            $table->string('ItemCode')->nullable();
            $table->string('ItemName')->nullable();
            $table->string('CongDoan')->nullable();
            $table->integer('type')->nullable();
            $table->string('text')->nullable();
            $table->decimal('Quantity', 19, 6)->nullable();
            $table->string('QuyCach')->nullable();
            $table->string('LYDO')->nullable();
            $table->string('team')->nullable();
            $table->string('NextTeam')->nullable();
            $table->string('SubItemCode')->nullable();
            $table->string('SubItemName')->nullable();
            $table->float('CDay')->default(1);
            $table->float('CRong')->default(1);
            $table->float('CDai')->default(1);
            $table->integer('confirm')->default(0);
            $table->integer('confirmBy')->default(0);
            $table->timestamp('confirm_at')->nullable();
            $table->integer('deleted')->default(0);
            $table->integer('deletedBy')->default(0);
            $table->timestamp('deleted_at')->nullable();
            $table->decimal('openQty', 19, 6)->default(0);
            $table->string('MaThiTruong')->nullable();
            $table->text('ErrorData')->nullable();
            $table->integer('isQCConfirmed')->default(0);
            $table->string('CreatedBy')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notireceiptVCN');
    }
};
