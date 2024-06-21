<?php

use App\Http\Controllers\sap\VCNController;
use Illuminate\Support\Facades\Route;

// route cho api qc
Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'vcn'], function () {
        Route::get('/receipts-productions', [VCNController::class, 'index'])->name('danh-sach-thanh-pham-vcn');
        Route::get('/receipts-productions-detail', [VCNController::class, 'viewdetail'])->name('detail-thanh-pham-vcn');
        Route::get('/receipts-detail-rong', [VCNController::class, 'viewDetailRong'])->name('detail-thanh-pham-rong');
        Route::post('/receipts-productions-rong', [VCNController::class, 'receiptRong'])->name('nhap-thanh-pham-rong');
        Route::post('/receipts-production', [VCNController::class, 'receipts'])->name('nhap-thanh-pham-vcn');
        Route::delete('remove-receipt', [VCNController::class, 'delete']);
        Route::delete('remove-receipt-rong', [VCNController::class, 'deleteRong']);
        Route::post('/accept-receipts', [VCNController::class, 'accept']);
        Route::post('/reject-receipts', [VCNController::class, 'reject']);
        Route::post('/accept-qc', [VCNController::class, 'AcceptQCVCN']);
        Route::get('/danh-sach-phoi-cho-nhan', [VCNController::class, 'dsphoipending']);
    });
});
