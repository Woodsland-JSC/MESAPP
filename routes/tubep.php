<?php

use App\Http\Controllers\sap\TuBepController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'tubep'], function () {
        Route::post('/ghinhan-sanluong', [TuBepController::class, 'GhiNhanSanluong']);
        Route::get('/lenh-san-xuat', [TuBepController::class, 'DanhSachLenh']);
        Route::get('/ds-cong-doan', [TuBepController::class, 'DanhSachCongDoan']);
        Route::get('/chi-tiet-lenh', [TuBepController::class, 'ChiTietLenh']);
    });
});

