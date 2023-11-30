<?php

use App\Http\Controllers\sap\QCController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// route cho api qc
Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'dgm'], function () {
        Route::get('/giatrihientai', [QCController::class, 'currentData'])->name('danh-gia-do-am');
        Route::post('/ghinhandoam', [QCController::class, 'DanhGiaDoAm']);
        Route::post('/hoanthanhdoam', [QCController::class, 'HoanThanhDoAm']);
        Route::post('/ghinhankt', [QCController::class, 'DanhGiaKT']);
        Route::post('/hoanthanhkt', [QCController::class, 'HoanThanhKT']);
    });
});
