<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\UserController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\JobController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/uploaduser',[UserController::class, 'viewimportuser']);
Route::prefix('jobs_wl')->group(function () {
    Route::get('/', [JobController::class, 'index'])->name('jobs.index');
    Route::post('/retry', [JobController::class, 'retry'])->name('jobs.retry');
    Route::post('/delete', [\App\Http\Controllers\JobController::class, 'delete'])->name('jobs.delete');
    Route::post('/retry-all', [\App\Http\Controllers\JobController::class, 'retryAll'])->name('jobs.retryAll');
});

Route::prefix('imports')->group(function () {
    Route::get('import-pallet', [ImportController::class, 'index'])->name('imports.pallet');
    Route::get('test-pdf', [ImportController::class, 'view_export_report_by_report_resolution_id'])->name('imports.view_export_report_by_report_resolution_id');
    Route::post('import-pallet', [ImportController::class, 'import_pallet'])->name('import-pallet-post');
    Route::post('solve', [ImportController::class, 'solve'])->name('solve');
});

Route::get('/{any}', function () {
    return view('index');
})->where('any', '^(?!api).*');

