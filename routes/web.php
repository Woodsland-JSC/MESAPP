<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\UserController;
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

Route::get('/{any}', function () {
    return view('index');
})->where('any', '^(?!api).*');

