<?php

use App\Http\Controllers\sap\QCController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// route cho api qc
Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'dgm'], function () {
        Route::get('/doam', [QCController::class, 'DoAmDoDang'])->name('danh-gia-do-am');
    });
});
