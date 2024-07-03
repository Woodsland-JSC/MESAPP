<?php

use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

// route cho api qc
Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'report'], function () {
        Route::get('/cbg-chitietgiaonhan', [ReportController::class, 'chitietgiaonhan']);
    });
});
