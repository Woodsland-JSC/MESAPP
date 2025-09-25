<?php

use App\Http\Controllers\sap\ProductionOrderController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'production-order'], function () {
        Route::get('list-production-order', [ProductionOrderController::class,'index'])->name('list-production-order');
        Route::get('detail-production-order/{productionOrderId}', [ProductionOrderController::class,'getDetailProductionOrder'])->name('detail-production-order');
    });

});
