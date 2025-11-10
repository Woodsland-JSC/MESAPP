<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\sap\ProductionController;
use App\Http\Controllers\sap\VCNController;
use App\Http\Controllers\sap\QCController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'v2/production'], function () {
        Route::post('/accept-receipts', [ProductionController::class, 'acceptV2']);
        route::post('/confirm-qc-cbg', [QCController::class, 'acceptTeamQCCBGV2']);
    });

    Route::group(['prefix' => 'v2/vcn'], function () {
        Route::get('/receipts-productions', [VCNController::class, 'indexv2']);
        Route::post('/accept-receipts', [VCNController::class, 'acceptV2']);
        route::post('/confirm-qc-vcn', [VCNController::class, 'AcceptQCVCNV2']);
        Route::post('/receipts-productions-rong', [VCNController::class, 'receiptRongv2']);
        Route::get('/receipts-detail-rong', [VCNController::class, 'viewDetailRongv2']);
        Route::post('/accept-receipts-rong', [VCNController::class, 'AcceiptRongv2']);
        Route::post('/confirm-qc-rong', [VCNController::class, 'AcceiptQCRongv2']);
    });
});