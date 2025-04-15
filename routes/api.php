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
use App\Http\Controllers\sap\ProductionController;
use App\Http\Controllers\api\ReportController;
use App\Http\Controllers\sap\GoodsManagementController;

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
        Route::get('/detail/{roleId}', [RolesController::class, 'detail']);
        Route::delete('/delete/{roleId}', [RolesController::class, 'delete']);
    });
    /**
     * User Routes
     */
    Route::group(['prefix' => 'users'], function () {
        Route::get('/', [UserController::class, 'index'])->name('users.index');
        Route::post('/create', [UserController::class, 'create'])->name('users.create');
        Route::get('/find/{UserId}', [UserController::class, 'UserById'])->name('users.find');
        Route::patch('/update/{UserId}', [UserController::class, 'update'])->name('users.update');
        Route::patch('/update-profile/{UserId}', [UserController::class, 'updateProfile'])->name('users.profile');
        Route::patch('/change-password/{UserId}', [UserController::class, 'changePassword'])->name('users.password');
        Route::patch('/disable/{UserId}', [UserController::class, 'blockUser'])->name('users.disable');
        Route::delete('/delete/{UserId}', [UserController::class, 'delete'])->name('users.delete');
        Route::post('/upload',[UserController::class, 'importuser']);
        Route::get('/uploaduser',[UserController::class, 'viewimportuser']);
        route::post('/syncfromSAP', [UserController::class, 'syncFromSap']);
    });
    /**
     * Pallet Routes
     */
    Route::group(['prefix' => 'pallets'], function () {
        Route::get('/', [DryingOvenController::class, 'index'])->name('danh-sach-pallet');
        // Route::post('/create', [DryingOvenController::class, 'StorePallet'])->name('tao-xep-say');
        Route::get('find/{Id}', [DryingOvenController::class, 'showbyID'])->name('tim-kiem-pallet');
        Route::post('/v2/create', [DryingOvenController::class, 'StorePalletNew'])->name('tao-xep-say2');
        Route::get('/pallet-history', [DryingOvenController::class, 'getPalletHistory'])->name('lich-su-xep-say');
        Route::get('/pallet-lifecyle', [DryingOvenController::class, 'lifecyleDrying'])->name('truy-nguyen');
        Route::post('/dismantle-pallet', [DryingOvenController::class, 'DismantlePallet'])->name('dismantle-pallet');
        Route::get('/get-pallet-by-year-week', [DryingOvenController::class, 'getPalletsByYearAndWeek'])->name('get-pallet-by-year-week');
        Route::post('/delete-disabled-record', [DryingOvenController::class, 'deleteDisabledRecord']);
    });
    Route::group(['prefix' => 'ovens'], function () {
        Route::get('/', [DryingOvenController::class, 'ListOvenAvailiable'])->name('danh-sach-lo');
        Route::get('/listproduction', [PlanController::class, 'listPlan'])->name('danh-sach-lo-active');
        Route::post('/create', [PlanController::class, 'pickOven'])->name('tao-ke-hoach-say');
        Route::get('find/{Id}', [DryingOvenController::class, 'showbyID'])->name('tim-kiem-lo-say');
        Route::get('/production-batch', [PlanController::class, 'listpallet'])->name('danh-pallet-avaliable');
        Route::get('/production-availiable', [PlanController::class, 'listovens'])->name('danh-me-avaliable');
        Route::post('/production-batch', [PlanController::class, 'productionBatch'])->name('vao-lo');
        Route::delete('/production-batch-delete', [PlanController::class, 'removePallet'])->name('xoa-lo');
        Route::get('/production-detail/{PlanID}', [PlanController::class, 'productionDetail'])->name('chi tiết mẻ');

        Route::get('/production-check', [PlanController::class, 'listovens'])->name('danh-sach-kiem-tra-lo');
        Route::patch('/production-check', [PlanController::class, 'checkOven'])->name('kiem-tra-lo');
        Route::patch('/production-check-single', [PlanController::class, 'singlecheckOven'])->name('kiem-tra-lo-completed');
        Route::get('/production-run', [PlanController::class, 'ListRunOven'])->name('danh-sach-lo-da-kiem-tra');
        Route::patch('/production-run', [PlanController::class, 'runOven'])->name('chay-lo');
        Route::get('/production-completed', [PlanController::class, 'Listcomplete'])->name('danh-sach-me-ra-lo');
        Route::patch('/production-completed', [PlanController::class, 'completed'])->name('ra-lo');
    });
    Route::group(['prefix' => 'production'], function () {
        Route::get('/receipts-productions', [ProductionController::class, 'index'])->name('danh-sach-thanh-pham');
        Route::get('/receipts-productions-detail', [ProductionController::class, 'viewdetail'])->name('detail-thanh-pham');
        Route::post('/receipts-production', [ProductionController::class, 'receipts'])->name('nhap-thanh-pham');
        Route::delete('remove-receipt', [ProductionController::class, 'delete']);
        Route::post('/accept-receipts', [ProductionController::class, 'accept']);
        Route::post('/reject-receipts', [ProductionController::class, 'reject']);
        Route::get('/danh-sach-phoi-cho-nhan', [ProductionController::class, 'dsphoipending']);
        Route::get('/allteam', [ProductionController::class, 'getAllTeam']);
        Route::get('/rootCause', [ProductionController::class, 'getRootCause']);
    });
    # route cho master data
    Route::get('/items', [MasterDataController::class, 'ItemMasterData'])->name('quy-cach-tho');
    Route::get('/items-route', [MasterDataController::class, 'ItemByCD']);
    Route::get('/warehouses', [MasterDataController::class, 'WarehouseMasterData'])->name('danh sach kho');
    //Route::get('/warehouses/{WarehouseId}', [MasterDataController::class, 'WarehouseMasterData'])->name('GetWarehouseMasterDataSap');
    Route::get('/branch', [MasterDataController::class, 'branch'])->name('branch');
    Route::get('/stock/{itemid}', [MasterDataController::class, 'getStockByItem'])->name('ton-kho-theo-ma-sp');
    Route::get('/v2/stock/{itemid}', [MasterDataController::class, 'getStockByItemnew'])->name('ton-kho-theo-ma-sp-2');
    Route::get('/typeofwood', [MasterDataController::class, 'getLoaiGo'])->name('loai-go');
    Route::get('/dryingmethod', [MasterDataController::class, 'getQuyCachSay'])->name('quy-cach-say');
    Route::get('/dryingoven', [MasterDataController::class, 'getLoSay'])->name('lo-say');
    Route::get('/reasons', [MasterDataController::class, 'getReason'])->name('pallet-muc-dich-say');
    Route::get('/oven-reasons', [MasterDataController::class, 'getReasonPlan'])->name('lo-say-muc-dich-say');
    Route::post('/settings', [MasterDataController::class, 'settings'])->name('admin.settings');
    Route::get('/user-sap', [MasterDataController::class, 'UserSAPAssign'])->name('user-sap');
    Route::get('/factorybybranch/{Id}', [MasterDataController::class, 'listfactory'])->name('danh-sach-nha-may');
    Route::get('/updateplant', [MasterDataController::class, 'updatePlant'])->name('cap-nhat-lai-nha-may');
    Route::get('/updatewarehouse', [MasterDataController::class, 'updatewarehouse'])->name('cap-nhat-lai-danh-sach-kho');

    Route::get('/cbg-factory', [MasterDataController::class, 'getCBGFactory'])->name('nha-may-cbg');

    Route::get('/danhsachto', [ProductionController::class, 'listo']);
    Route::get('/allocate', [ProductionController::class, 'allocate']);

    // Goods Management
    Route::get('/get-bin-managed-warehouse', [GoodsManagementController::class, 'getBinManagedWarehouses']);
    Route::get('/get-bin-by-warehouse', [GoodsManagementController::class, 'getBinByWarehouse']);
    Route::get('/get-all-bin-by-warehouse', [GoodsManagementController::class, 'getAllBinByWarehouse']);
    Route::get('/get-default-bin-items-by-warehouse', [GoodsManagementController::class, 'getDefaultBinItemsByWarehouse']);
    Route::get('/get-batch-by-item-default-bin', [GoodsManagementController::class, 'getBatchByItemDefaultBin']);
    Route::get('/get-batch-by-item', [GoodsManagementController::class, 'getBatchByItem']);
    Route::get('/get-item-by-bin', [GoodsManagementController::class, 'getItemsByBin']);
    Route::post('/stock-transfer', [GoodsManagementController::class, 'StockTransfer']);

    // Others
    Route::get('/get-team-by-factory', [ProductionController::class, 'getTeamByFactory']);

    // Route::get('/report/download/drying-process', [ReportController::class, 'dryingProcess'])->name('create.dryingprocess');
    // Route::get('/report/download/drying-kiln-history', [ReportController::class, 'dryingKilnHistory'])->name('create.kilnhistory');
    Route::get('/nguyentest', [ProductionController::class, 'getQCWarehouseByUser'])->name('create.kilnhistorydetail');
});


//inlucde route
include('qc.php');
// include v2 che bien go
include('v2/v2.php');
//include route vcn
include('vcn.php');
//include route report
include('report.php');
include ('noidia.php');
include ('tubep.php');

