<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\sap\MasterDataController;
use App\Http\Controllers\api\UserController;
use App\Http\Controllers\api\RolesController;
use App\Http\Controllers\api\PermissionsController;
use App\Http\Controllers\sap\DryingOvenController;
use App\Http\Controllers\sap\PlanController;
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
        Route::get('/', [PermissionsController::class, 'index'])->name('danh-sach-quyen');
        // Route::post('/create', [RolesController::class, 'create'])->name('roles.create');
        // Route::patch('/update/{roleId}', [RolesController::class, 'update'])->name('roles.update');
    });
    /**
     * Role Routes
     */
    Route::group(['prefix' => 'roles'], function () {
        Route::get('/', [RolesController::class, 'index'])->name('danh-sach-role');
        Route::post('/create', [RolesController::class, 'create'])->name('tao-role');
        Route::patch('/update/{roleId}', [RolesController::class, 'update'])->name('cap-nhat-roles');
    });
    /**
     * User Routes
     */
    Route::group(['prefix' => 'users'], function () {
        Route::get('/', [UserController::class, 'index'])->name('danh-sach-user');
        Route::post('/create', [UserController::class, 'create'])->name('tao-user');
        Route::get('find/{UserId}', [UserController::class, 'UserById'])->name('tim-kiem-user');
        Route::patch('/update/{UserId}', [UserController::class, 'update'])->name('cap-nhat-user');
        Route::delete('/disable/{UserId}', [UserController::class, 'blockUser'])->name('chan-user');
    });
    /**
     * Pallet Routes
     */
    Route::group(['prefix' => 'pallets'], function () {
        Route::get('/', [DryingOvenController::class, 'index'])->name('danh-sach-pallet');
        Route::post('/create', [DryingOvenController::class, 'StorePallet'])->name('tao-xep-say');
        Route::get('find/{Id}', [DryingOvenController::class, 'showbyID'])->name('tim-kiem-pallet');
    });
    Route::group(['prefix' => 'ovens'], function () {
        Route::get('/', [DryingOvenController::class, 'ListOvenAvailiable'])->name('danh-sach-lo');
        Route::post('/create', [PlanController::class, 'pickOven'])->name('tao-ke-hoach-say');
        Route::get('find/{Id}', [DryingOvenController::class, 'showbyID'])->name('tim-kiem-lo-say');
    });
    # route cho master data
    Route::get('/items', [MasterDataController::class, 'ItemMasterData'])->name('quy-cach-tho');
    Route::get('/warehouses', [MasterDataController::class, 'WarehouseMasterData'])->name('danh sach kho');
    //Route::get('/warehouses/{WarehouseId}', [MasterDataController::class, 'WarehouseMasterData'])->name('GetWarehouseMasterDataSap');
    Route::get('/branch', [MasterDataController::class, 'branch'])->name('branch');
    Route::get('/stock/{itemid}', [MasterDataController::class, 'getStockByItem'])->name('ton-kho-theo-ma-sp');
    Route::get('/typeofwood', [MasterDataController::class, 'getLoaiGo'])->name('loai-go');
    Route::get('/dryingmethod', [MasterDataController::class, 'getQuyCachSay'])->name('quy-cach-say');
    Route::get('/dryingoven', [MasterDataController::class, 'getLoSay'])->name('lo-say');
    Route::get('/reasons', [MasterDataController::class, 'getReason'])->name('pallet-muc-dich-say');
    Route::get('/oven-reasons', [MasterDataController::class, 'getReasonPlan'])->name('lo-say-muc-dich-say');
    Route::post('/settings', [MasterDataController::class, 'settings'])->name('admin.settings');
    Route::get('/user-sap', [MasterDataController::class, 'UserSAPAssign'])->name('user-sap');
    Route::get('/factorybybranch/{Id}', [MasterDataController::class, 'listfactory'])->name('danh-sach-nha-may');
});
