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
use App\Http\Controllers\mes\LogErrorHumidityController;
use App\Http\Controllers\mes\PalletController;
use App\Http\Controllers\mes\PalletLogController;
use App\Http\Controllers\mes\PlanDryingController;
use App\Http\Controllers\mes\QcCbgController;
use App\Http\Controllers\mes\UserController as MesUserController;
use App\Http\Controllers\sap_controller\ORSCController;
use App\Http\Controllers\sap\GoodsManagementController;
use App\Http\Controllers\sap_controller\InventoryPostingController;
use App\Http\Controllers\sap_controller\MasterDataController as SapMasterDataController;
use App\Http\Controllers\sap_controller\OitwController;
use App\Http\Controllers\sap_controller\OvenController;
use App\Http\Controllers\sap_controller\QtSonController;
use App\Http\Controllers\sap_controller\ReportController as Sap_controllerReportController;
use App\Http\Controllers\sap_controller\TBController;
use App\Http\Controllers\sap_controller\VcnController;

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
Route::get('/logout', [AuthController::class, 'logout'])->name('logout');
// Route::post(['auth:sanctum',])->group(function () {

// });
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
        Route::post('/upload', [UserController::class, 'importuser']);
        Route::get('/uploaduser', [UserController::class, 'viewimportuser']);
        route::post('/syncfromSAP', [UserController::class, 'syncFromSap']);
        Route::get('/get-users-by-factory/{factory}', [UserController::class, 'getUserByFactory']);
        Route::post('/change-user-factory', [UserController::class, 'changeUserFactory']);
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
        Route::patch('/production-completed-sl', [PlanController::class, 'completedSL'])->name('ra-lo-sl');
        Route::post('/production-complete-by-pallets', [PlanController::class, 'completeByPallets'])->name('ra-lo-theo-pallets');
        Route::post('/production-complete-by-pallets-sl', [PlanController::class, 'completeByPalletsSL']);
    });
    Route::group(['prefix' => 'production'], function () {
        Route::get('/receipts-productions', [ProductionController::class, 'index'])->name('danh-sach-thanh-pham');
        Route::get('/receipts-productions-detail', [ProductionController::class, 'viewdetail'])->name('detail-thanh-pham');
        Route::post('/receipts-production', [ProductionController::class, 'receipts'])->name('nhap-thanh-pham');
        Route::delete('remove-receipt', [ProductionController::class, 'delete']);
        Route::post('/accept-receipts', [ProductionController::class, 'accept']);
        Route::post('/reject-receipts', [ProductionController::class, 'reject']);
        Route::get('/check-receipts', [ProductionController::class, 'checkInventory'])->name('check-receipts');
        Route::get('/danh-sach-phoi-cho-nhan', [ProductionController::class, 'dsphoipending']);
        Route::get('/allteam', [ProductionController::class, 'getAllTeam']);
        Route::get('/rootCause', [ProductionController::class, 'getRootCause']);
    }); {
        /*** GET DATA FROM SAP ***/
    }
    // Item Master Data
    Route::get('/items', [MasterDataController::class, 'ItemMasterData'])->name('quy-cach-tho');
    Route::get('/getIndatesByItem', [MasterDataController::class, 'getIndatesByItem'])->name('getIndatesByItem');
    
    Route::get('/items-route', [MasterDataController::class, 'ItemByCD']);
    Route::get('/warehouses', [MasterDataController::class, 'WarehouseMasterData'])->name('danh sach kho');
    //Route::get('/warehouses/{WarehouseId}', [MasterDataController::class, 'WarehouseMasterData'])->name('GetWarehouseMasterDataSap');
    Route::get('/branch', [MasterDataController::class, 'branch'])->name('branch');

    // Wood Drying
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
    Route::get('/get-active-kiln', [DryingOvenController::class, 'getActiveKilnByFactory']);
    Route::get('/get-loaded-kiln', [DryingOvenController::class, 'getLoadedKilnByFactory']);
    Route::get('/get-checked-kiln', [DryingOvenController::class, 'getCheckedKilnByFactory']);
    Route::get('/cbg-factory', [MasterDataController::class, 'getCBGFactory'])->name('nha-may-cbg');
    Route::get('/vcn-factory', [MasterDataController::class, 'getVCNFactory'])->name('nha-may-vcn');

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
    Route::get('/get-stage-by-division', [MasterDataController::class, 'getStageNyDivision']);

    // Route::get('/report/download/drying-process', [ReportController::class, 'dryingProcess'])->name('create.dryingprocess');
    // Route::get('/report/download/drying-kiln-history', [ReportController::class, 'dryingKilnHistory'])->name('create.kilnhistory');
    Route::get('/nguyentest', [ProductionController::class, 'getQCWarehouseByUser'])->name('create.kilnhistorydetail');


    /**
     * NEW
     * 17-10-2025
     * 
     * */

    Route::get('/ORSC/layDanhSachToTheoNhaMayCBG', [ORSCController::class, 'layDanhSachToTheoNhaMayCBG'])->name('layDanhSachToTheoNhaMayCBG');
    Route::get('/ORSC/getTeamProductionByFactory', [ORSCController::class, 'getTeamProductionByFactory'])->name('getTeamProductionByFactory');

    Route::group(['prefix' => 'sap/masterdata'], function () {
        Route::get('danhSachNhaMayCBG', [SapMasterDataController::class, 'danhSachNhaMayCBG'])->name('danhSachNhaMayCBG');
        Route::get('danhSachNhaMayND', [SapMasterDataController::class, 'danhSachNhaMayND'])->name('danhSachNhaMayND');
        Route::get('factoryNDByUser', [SapMasterDataController::class, 'factoryNDByUser'])->name('factoryNDByUser');
        Route::get('getFactoryUTub', [SapMasterDataController::class, 'getFactoryUTub'])->name('getFactoryUTub');
        Route::get('getTeamUTub', [SapMasterDataController::class, 'getTeamUTub'])->name('getTeamUTub');
        Route::get('getWhHTCBG', [SapMasterDataController::class, 'getWhHTCBG'])->name('getWhHTCBG');
        Route::get('getTeamsCBG', [SapMasterDataController::class, 'getTeamsCBG'])->name('getTeamsCBG');

        
    });

    Route::group(['prefix' => 'sap/report'], function () {
        Route::get('baoCaoSanLuongQuyDoiCBG', [Sap_controllerReportController::class, 'baoCaoSanLuongQuyDoiCBG'])->name('baoCaoSanLuongQuyDoiCBG');
        Route::get('bao-cao-quy-luong-cbg', [Sap_controllerReportController::class, 'baoCaoQuyLuongCBG'])->name('baoCaoQuyLuongCBG');
        Route::get('bao-cao-ton-say-lua', [Sap_controllerReportController::class, 'bao_cao_ton_say_lua'])->name('bao_cao_ton_say_lua');
    });

    Route::group(['prefix' => 'sap/oven'], function () {
        Route::get('getOvensByFactory', [OvenController::class, 'getOvensByFactory'])->name('getOvensByFactory');
    });

    Route::group(['prefix' => 'sap/OITW'], function () {
        Route::get('getItemsByFactory', [OitwController::class, 'getItemsByFactory'])->name('getItemsByFactory');
        Route::get('getItemsSFByWh', [OitwController::class, 'getItemsSFByWh'])->name('getItemsSFByWh');

        
    });


    Route::group(['prefix' => 'mes/plan-drying'], function () {
        Route::get('sendPlanDryingToStockController', [PlanDryingController::class, 'sendPlanDryingToStockController'])->name('sendPlanDryingToStockController');
        Route::get('getAllPlantInPlanDrying', [PlanDryingController::class, 'getAllPlantInPlanDrying'])->name('getAllPlantInPlanDrying');
        Route::get('getPlanDryingByFactory', [PlanDryingController::class, 'getPlanDryingByFactory'])->name('getPlanDryingByFactory');
        Route::get('getPalletsByPlanId', [PlanDryingController::class, 'getPalletsByPlanId'])->name('getPalletsByPlanId');
        Route::post('movePalletToPlanDrying', [PlanDryingController::class, 'movePalletToPlanDrying'])->name('movePalletToPlanDrying');
        Route::post('removePallets', [PlanDryingController::class, 'removePallets'])->name('removePallets');
        Route::delete('removePlanDrying', [PlanDryingController::class, 'removePlanDrying'])->name('removePlanDrying');


        Route::get('getOvenIsDrying', [PlanDryingController::class, 'getOvenIsDrying'])->name('getOvenIsDrying');
    });

    Route::group(['prefix' => 'mes/users'], function () {
        Route::get('danhSachThuKho', [MesUserController::class, 'danhSachThuKho'])->name('danhSachThuKho');
    });

    Route::group(['prefix' => 'mes/pallet-log'], function () {
        Route::get('getLogsByFactory', [PalletLogController::class, 'getLogsByFactory'])->name('getLogsByFactory');
    });

    Route::group(['prefix' => 'mes/pallet'], function () {
        Route::get('getPalletReport', [PalletController::class, 'getPalletReport'])->name('getPalletReport');
        Route::get('getPalletComplete', [PalletController::class, 'getPalletComplete'])->name('getPalletComplete');
        Route::get('getQuantityPallets', [PalletController::class, 'getQuantityPallets'])->name('getQuantityPallets');
    });

    Route::group(['prefix' => 'sap/vcn'], function () {
        Route::get('receiptsProductionsDetail', [VcnController::class, 'receiptsProductionsDetail'])->name('receiptsProductionsDetail');
        Route::post('ghiNhanSanLuongVCN', [VcnController::class, 'ghiNhanSanLuongVCN'])->name('ghiNhanSanLuongVCN');
        Route::get('receiptsProductionsDetailRong', [VcnController::class, 'receiptsProductionsDetailRong'])->name('receiptsProductionsDetailRong');
    });

    Route::group(['prefix' => 'sap/tb'], function () {
        Route::get('sanLuongTB', [TBController::class, 'sanLuongTB'])->name('sanLuongTB');
        Route::get('viewDetail', [TBController::class, 'viewDetail'])->name('viewDetail');
        Route::post('acceptReceiptTB', [TBController::class, 'acceptReceiptTB'])->name('acceptReceiptTB');
        Route::post('confirmAcceptReceipt', [TBController::class, 'confirmAcceptReceipt'])->name('confirmAcceptReceipt');
        Route::post('confirmRejectTB', [TBController::class, 'confirmRejectTB'])->name('confirmRejectTB');
        Route::get('checkReceiptTB', [TBController::class, 'checkReceiptTB'])->name('checkReceiptTB');
        Route::delete('delete', [TBController::class, 'delete'])->name('delete');
    });

    Route::group(['prefix' => 'sap/inventory-posting'], function () {
        Route::post('inventoryPostingItems', [InventoryPostingController::class, 'inventoryPostingItems'])->name('inventoryPostingItems');
    });

    Route::group(['prefix' => 'sap/qt-son'], function () {
        Route::get('getStepsQT', [QtSonController::class, 'getStepsQT']);
        Route::get('findItem', [QtSonController::class, 'findItem']);
        Route::post('insert', [QtSonController::class, 'insert']);
    });

    Route::group(['prefix' => 'mes/qc'], function () {
        Route::get('getAllWhQC', [QcCbgController::class, 'getAllWhQC'])->name('getAllWhQC');
        Route::get('getItemByWhQC', [QcCbgController::class, 'getItemByWhQC'])->name('getItemByWhQC');
        Route::get('getWhSL', [QcCbgController::class, 'getWhSL'])->name('getWhSL');
        Route::post('handleSL', [QcCbgController::class, 'handleSL'])->name('handleSL');
        Route::post('handleCH', [QcCbgController::class, 'handleCH'])->name('handleCH');
        Route::post('baoLoiSayAm', [QcCbgController::class, 'baoLoiSayAm']);
    });

    Route::group(['prefix' => 'mes/humidity-error'], function () {
        Route::get('getDataByFactory', [LogErrorHumidityController::class, 'getDataByFactory']);
    });

    
});


//inlucde route
include('qc.php');
// include v2 che bien go
include('v2/v2.php');
//include route vcn
include('vcn.php');
//include route report
include('report.php');
include('noidia.php');
include('tubep.php');

include('productionorder.php');
