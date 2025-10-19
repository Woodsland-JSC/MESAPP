<?php

use App\Http\Controllers\sap\QCController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// route cho api qc
Route::middleware(['auth:sanctum'])->group(function () {
    Route::group(['prefix' => 'dgm'], function () {
        Route::get('/giatrihientai', [QCController::class, 'currentData'])->name('danh-gia-do-am');
        Route::post('/ghinhandoam', [QCController::class, 'DanhGiaDoAm']);
        Route::delete('/deleteDoAm', [QCController::class, 'removeDoAm']);
        Route::post('/hoanthanhdoam', [QCController::class, 'HoanThanhDoAm']);
        Route::post('/ghinhankt', [QCController::class, 'DanhGiaKT']);
        Route::post('/hoanthanhkt', [QCController::class, 'HoanThanhKT']);
        Route::get('/gethumidlistbyid', [QCController::class, 'getHumidListById']);
        Route::get('/getdisabledlistbyid', [QCController::class, 'getDisabledListById']);
    });
    Route::get('/loailoi', [QCController::class, 'loailoi']);
    Route::get('/loailoivcn', [QCController::class, 'LoiLoaiVCN']);
    Route::get('/huongxuly', [QCController::class, 'huongxuly']);
    Route::get('/getlist-team-exclude-qc', [QCController::class, 'listToExcludeQC']);
    route::get('/list-qc-cbg', [QCController::class, 'listConfirm']);
    route::post('/confirm-qc-cbg', [QCController::class, 'acceptTeamQCCBG'])->name('confirm-qc-cbg');
    route::get('/list-qc-vcn', [QCController::class, 'listConfirmVCN']);
    route::post('/confirm-qc-vcn', [QCController::class, 'acceptTeamQCVCN'])->name('confirm-qc-vcn');
    route::post('/v2/confirm-qc-cbg', [QCController::class, 'acceptTeamQCCBGV2'])->name('confirm-qc-cbg-v2');
    route::post('issueQC', [QCController::class, 'IssueQC'])->name('issueQC');


    Route::get('/purchase/qc-cbg', [QCController::class, 'getQcCBG'])->name('purchase-qc-cbg');
    Route::get('/purchase/qc-cbg/{sapId}', [QCController::class, 'getQcCBGDetail'])->name('purchase-qc-cbg-detail');
    Route::get('/purchase/qc-cbg/detail/{sapId}/{lineId}', [QCController::class, 'getQcDetail'])->name('purchase-qc-detail');
    Route::get('/qc-type', [QCController::class, 'getQcType'])->name('qc-type');
    Route::get('/b1s/v1/GQC', [QCController::class, 'getGQC'])->name('getGQC');
    Route::post('/purchase/insert-qc', [QCController::class, 'insertQc'])->name('insertQC');
    Route::delete('/purchase/delete-qc', [QCController::class, 'deleteQc'])->name('deleteQc');
    Route::get('/purchase/chung-tu-qc', [QCController::class, 'getChungTuQc'])->name('purchase-getChungTuQc');
    Route::get('/purchase/chung-tu-tra-lai-qc', [QCController::class, 'getChungTuTraLaiNCC'])->name('purchase-getChungTuTraLaiNCC');
    Route::get('/purchase/nlg-qcr/{sapId}', [QCController::class, 'getNLGTraLaiNCC'])->name('purchase-nlg-qcr');
    Route::post('qc-quantity-return', [QCController::class, 'qcQuantityReturn'])->name('qcQuantityReturn');
    Route::post('qc-quantity-return-all', [QCController::class, 'qcQuantityReturnAll'])->name('qcQuantityReturnAll');
});
