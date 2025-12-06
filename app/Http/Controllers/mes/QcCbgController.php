<?php

namespace App\Http\Controllers\mes;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\HandleQcService;
use App\Services\OITMService;
use App\Services\OWHSService;
use Auth;
use DB;
use Exception;
use Illuminate\Http\Request;


class QcCbgController extends Controller
{
    public function getAllWhQC(Request $request, OWHSService $OWHSService)
    {
        return $OWHSService->getAllWhQC();
    }

    public function getItemByWhQC(Request $request, OITMService $OITMService)
    {
        return $OITMService->getItemByWhQC($request->query('whCode'));
    }

    public function getWhSL(Request $request, OWHSService $OWHSService)
    {
        return $OWHSService->getWhSL();
    }

    public function handleSL(Request $request, HandleQcService $HandleQcService)
    {
        $dataSL = $request->all();
        return $HandleQcService->handleQcSL($dataSL);
    }

    public function handleCH(Request $request, HandleQcService $HandleQcService)
    {
        $dataCH = $request->all();

        if (!$dataCH['Data'] || !$dataCH['selectedItem'] || !$dataCH['team']) {
            return response()->json([
                'message' => 'Thiếu thông tin.'
            ], 500);
        }

        return $HandleQcService->handleCH($dataCH);
    }

    public function baoLoiSayAm(Request $request, HandleQcService $HandleQcService)
    {
        $data = $request->all();

        if (!$data) {
            return response()->json([
                'message' => 'Thiếu thông tin.'
            ], 500);
        }

        return $HandleQcService->baoLoiSayAm($data);
    }
}
