<?php

namespace App\Http\Controllers\sap_controller;

use App\Http\Controllers\Controller;
use App\Services\HanaService;
use App\Services\mes\NotireceiptTbService;
use App\Services\OvenService;
use App\Services\TBService;
use Exception;
use Illuminate\Http\Request;

/**
 * Controller khối Tủ bếp SAP
 *
 * @author  TuanPA
 */
class TBController extends Controller
{
    public function sanLuongTB(Request $request, TBService $tbService)
    {
        return  $tbService->sanLuongTB($request->query());
    }

    function viewDetail(Request $request, TBService $tbService)
    {
        return  $tbService->viewDetail($request->query());
    }
}
