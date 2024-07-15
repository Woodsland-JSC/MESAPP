<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\sap\ProductionController;
// route cho api che bien go
Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'v2/production'], function () {
        // Route::get('/receipts-productions', [ProductionController::class, 'indexV2']);
        // Route::get('/receipts-productions-detail', [ProductionController::class, 'viewdetailV2']);
        // Route::post('/accept-receipts', [ProductionController::class, 'acceptV2']);
    
    });
});