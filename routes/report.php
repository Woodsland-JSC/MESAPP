<?php

use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

// route cho api qc
Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'report'], function () {
        Route::get('/cbg-chitietgiaonhan', [ReportController::class, 'chitietgiaonhan']);
        Route::get('/cbg-xulyloi', [ReportController::class, 'XuLyLoi']);
        Route::get('/say-bienbanvaolo', [ReportController::class, 'bienbanvaolo']);
        Route::get('/say-xepsay-cbg', [ReportController::class, 'xepsay']);
        Route::get('/say-xepchosay', [ReportController::class, 'xepchosay']);
        Route::get('/cbg-sanluongtheothoigian', [ReportController::class, 'sanluongtheothoigian']);
        Route::get('/cbg-sanluongtheongay', [ReportController::class, 'sanluongtheongay']);
        Route::get('/cbg-tonkhoxulyloi', [ReportController::class, 'defectStockChecking']);
    });
});
