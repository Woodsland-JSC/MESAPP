<?php

use App\Http\Controllers\sap\QCController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// route cho api qc
Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'dgm'], function () {
        Route::get('/giatrihientai', [QCController::class, 'currentData'])->name('danh-gia-do-am');
        Route::post('/ghinhandoam', [QCController::class, 'DanhGiaDoAm']);
        Route::delete('/deleteDoAm', [QCController::class, 'removeDoAm']);
        Route::post('/hoanthanhdoam', [QCController::class, 'HoanThanhDoAm']);
        Route::post('/ghinhankt', [QCController::class, 'DanhGiaKT']);
        Route::post('/hoanthanhkt', [QCController::class, 'HoanThanhKT']);
        Route::get('/gethumidlistbyid', [QCController::class, 'getHumidListById']);
        Route::get('/getdisabledlistbyid', [QCController::class, 'getDisabledListById']);
    });
    Route::get('/loailoi', [QCController::class, 'loailoi']);
    Route::get('/loailoivcn', [QCController::class, 'LoiLoaiVCN']);
    Route::get('/huongxuly', [QCController::class, 'huongxuly']);
    Route::get('/getlist-team-exclude-qc', [QCController::class, 'listToExcludeQC']);
    route::get('/list-qc-cbg', [QCController::class, 'listConfirm']);
    route::post('/confirm-qc-cbg', [QCController::class, 'acceptTeamQCCBG'])->name('confirm-qc-cbg');
    route::post('/v2/confirm-qc-cbg', [QCController::class, 'acceptTeamQCCBGV2'])->name('confirm-qc-cbg-v2');
});
