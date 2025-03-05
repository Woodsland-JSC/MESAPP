<?php

use App\Http\Controllers\sap\NoiDiaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'noidia'], function () {
        Route::post('/ghinhan-sanluong', [NoiDiaController::class, 'GhiNhanSanluong']);
        Route::get('/lenh-san-xuat', [NoiDiaController::class, 'DanhSachLenh']);
        Route::get('/lenh-san-xuat/{id}', [NoiDiaController::class, 'ChiTietLenh']);
    });

});
