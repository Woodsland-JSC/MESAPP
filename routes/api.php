<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\sap\MasterDataController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
Route::get('/handle-auth', function (Request $request) {
    return response()->json([
        'status_code' => 500,
        'message' => 'invalid session',
    ],405);
})->name('login');

Route::post('/login', [AuthController::class,'login'])->name('Authlogin');

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/users', function (Request $request)
         {  return "aa"; });
    # route cho master data

    Route::get('/items', [MasterDataController::class,'ItemMasterData']);
});
