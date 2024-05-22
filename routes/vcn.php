<?php

use App\Http\Controllers\sap\VCNController;
use Illuminate\Support\Facades\Route;

// route cho api qc
Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'vcn'], function () {
        Route::get('/receipts-productions', [VCNController::class, 'index'])->name('danh-sach-thanh-pham');
        Route::get('/receipts-productions-detail', [VCNController::class, 'viewdetail'])->name('detail-thanh-pham');
        Route::post('/receipts-production', [VCNController::class, 'receipts'])->name('nhap-thanh-pham');
        Route::delete('remove-receipt', [VCNController::class, 'delete']);
        Route::post('/accept-receipts', [VCNController::class, 'accept']);
        Route::post('/reject-receipts', [VCNController::class, 'reject']);
        Route::get('/danh-sach-phoi-cho-nhan', [VCNController::class, 'dsphoipending']);
    });
});
