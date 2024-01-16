<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\UserController;
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

Route::get('/{any}', function () {
    return view('index');
})->where('any', '^(?!api).*');

