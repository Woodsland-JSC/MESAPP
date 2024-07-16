<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\sap\ProductionController;
// route cho api che bien go
Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'v2/production'], function () {
        Route::post('/accept-receipts', [ProductionController::class, 'accept_v2']);
        route::get('/get-test', [ProductionController::class, 'collectStockAllocate']);
    
    });
});