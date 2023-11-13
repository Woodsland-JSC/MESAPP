<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\sap\MasterDataController;
use App\Http\Controllers\api\UserController;
use App\Http\Controllers\api\RolesController;
use App\Http\Controllers\api\PermissionsController;
use App\Http\Controllers\sap\DryingOvenController;
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
    ], 405);
})->name('handleAuth');


Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::middleware(['auth:sanctum',])->group(function () {
    Route::get('/logout', [AuthController::class, 'logout'])->name('logout');
});
//'permission'
Route::middleware(['auth:sanctum'])->group(function () {
    //Route::middleware(['auth:sanctum'])->group(function () {
    /**
     * Permission Routes
     */
    Route::group(['prefix' => 'permissions'], function () {
        Route::get('/', [PermissionsController::class, 'index'])->name('permissions.index');
        // Route::post('/create', [RolesController::class, 'create'])->name('roles.create');
        // Route::patch('/update/{roleId}', [RolesController::class, 'update'])->name('roles.update');
    });
    /**
     * Role Routes
     */
    Route::group(['prefix' => 'roles'], function () {
        Route::get('/', [RolesController::class, 'index'])->name('roles.index');
        Route::post('/create', [RolesController::class, 'create'])->name('roles.create');
        Route::patch('/update/{roleId}', [RolesController::class, 'update'])->name('roles.update');
    });
    /**
     * User Routes
     */
    Route::group(['prefix' => 'users'], function () {
        Route::get('/', [UserController::class, 'index'])->name('users.index');
        Route::post('/create', [UserController::class, 'create'])->name('users.create');
        Route::get('find/{UserId}', [UserController::class, 'UserById'])->name('users.find');
        Route::patch('/update/{UserId}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/disable/{UserId}', [UserController::class, 'blockUser'])->name('users.disable');
    });
    /**
     * Pallet Routes
     */
    Route::group(['prefix' => 'pallets'], function () {
        Route::get('/', [DryingOvenController::class, 'index'])->name('pallets.index');
        Route::post('/create', [DryingOvenController::class, 'StorePallet'])->name('pallets.create');
        Route::get('find/{Id}', [DryingOvenController::class, 'showbyID'])->name('pallets.find');
    });
    # route cho master data
    Route::get('/items', [MasterDataController::class, 'ItemMasterData'])->name('GetItemMasterDataSap');
    Route::get('/warehouses', [MasterDataController::class, 'WarehouseMasterData'])->name('GetWarehouseMasterDataSap');
    //Route::get('/warehouses/{WarehouseId}', [MasterDataController::class, 'WarehouseMasterData'])->name('GetWarehouseMasterDataSap');
    Route::get('/branch', [MasterDataController::class, 'branch'])->name('branch');
    Route::get('/stock/{itemid}', [MasterDataController::class, 'getStockByItem'])->name('stockbyitem');
    Route::get('/typeofwood', [MasterDataController::class, 'getLoaiGo'])->name('getLoaiGo');
    Route::get('/dryingmethod', [MasterDataController::class, 'getQuyCachSay'])->name('getQuyCachSay');
    Route::get('/dryingoven', [MasterDataController::class, 'getLoSay'])->name('getLoSay');
});
