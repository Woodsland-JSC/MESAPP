<?php

namespace App\Http\Controllers\mes;

use App\Http\Controllers\Controller;
use App\Models\LogErrorHumidity;
use App\Models\User;
use App\Services\mes\PalletLogService;
use Auth;
use DB;
use Exception;
use Illuminate\Http\Request;


class LogErrorHumidityController extends Controller
{
    public function getDataByFactory(Request $request){
        $data = LogErrorHumidity::query()
        ->where('Factory', '=', $request->query('factory'))
        ->orderBy('created_at', 'desc')
        ->get();
        return $data;
    }
}
