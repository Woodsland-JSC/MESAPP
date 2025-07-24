<?php

use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

// route cho api qc
Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'report'], function () {
        Route::get('/sanluongnhansap', [ReportController::class, 'ReceiptInSAPReport']);
        Route::get('/cbg-chitietgiaonhan', [ReportController::class, 'chitietgiaonhanCBG']);
        Route::get('/cbg-xulyloi', [ReportController::class, 'XuLyLoi']);
        // Route::get('/say-bienbanvaolo', [ReportController::class, 'bienbanvaolo']);
        Route::get('/say-bienbanvaolo', [ReportController::class, 'KilnLoadingMinutes']);
        Route::get('/say-bienbankiemtralosay', [ReportController::class, 'KilnCheckingMinutes']);
        Route::get('/say-kehoachsay', [ReportController::class, 'DryingPlanReport']);
        Route::get('/say-xepsay-cbg', [ReportController::class, 'xepsay']);
        Route::get('/say-xepchosay', [ReportController::class, 'DryingQueueReport']);
        // Route::get('/say-xepchosay', [ReportController::class, 'xepchosay']);
        Route::get('/cbg-sanluongtheothoigian', [ReportController::class, 'sanluongtheothoigianCBG']);
        Route::get('/cbg-sanluongtheongay', [ReportController::class, 'sanluongtheongayCBG']);
        Route::get('/cbg-tonkhoxulyloi', [ReportController::class, 'defectStockChecking']);
        Route::get('/nhapxuattontheocongdoan', [ReportController::class, 'importExportInventoryByStage']);
        Route::get('/sanluongtheolenhsanxuat', [ReportController::class, 'productionOutputByProductionOrder']);
        Route::get('/cbg-sanluongtheotuan', [ReportController::class, 'weeklyDetailedProductionOutput']);
        Route::get('/dieuchuyennhamay', [ReportController::class, 'factoryTransfer']);
        Route::get('/vcn-chitietgiaonhan', [ReportController::class, 'chitietgiaonhanVCN']);
        Route::get('/vcn-sanluongtheothoigian', [ReportController::class, 'sanluongtheothoigianVCN']);
        Route::get('/vcn-sanluongtheongay', [ReportController::class, 'sanluongtheongayVCN']);
        Route::get('/vcn-xulyloi', [ReportController::class, 'PlywoodDefectHandling']);
    });
});
