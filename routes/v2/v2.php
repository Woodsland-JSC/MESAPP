<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\sap\ProductionController;
use App\Http\Controllers\sap\VCNController;
use App\Http\Controllers\sap\QCController;
// route cho api che bien go
Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'v2/production'], function () {
        Route::post('/accept-receipts', [ProductionController::class, 'acceptV2']);
        route::post('/confirm-qc-cbg', [QCController::class, 'acceptTeamQCCBGV2']);
    
    });
    Route::group(['prefix' => 'v2/vcn'], function () {
        Route::post('/accept-receipts', [VCNController::class, 'acceptV2']);
        route::post('/confirm-qc-vcn', [VCNController::class, 'AcceptQCVCNV2']);
    });
});