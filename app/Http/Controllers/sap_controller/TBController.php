<?php

namespace App\Http\Controllers\sap_controller;

use App\Http\Controllers\Controller;
use App\Services\HanaService;
use App\Services\mes\NotireceiptTbService;
use App\Services\OvenService;
use App\Services\TBService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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

    public function acceptReceiptTB(Request $request, TBService $tbService)
    {
        $validator = Validator::make($request->all(), [
            'FatherCode' => 'required|string|max:254',
            'ItemCode' => 'required|string|max:254',
            'ItemName' => 'required|string|max:254',
            'CompleQty' => 'required|numeric',
            'RejectQty' => 'required|numeric',
            'version' => 'required|string|max:254',
            'ErrorData',
            'LSX' => 'required|string|max:254',
            'CDay' => 'required|numeric',
            'CRong' => 'required|numeric',
            'CDai' => 'required|numeric',
            'Team' => 'required|string|max:254',
            'CongDoan' => 'required|string|max:254',
            'NexTeam' => 'required|string|max:254',
            // 'ProdType' => 'required|string|max:254',
            'loinhamay' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        return  $tbService->acceptReceiptTB($request->all());
    }

    public function confirmAcceptReceipt(Request $request, TBService $tbService)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        return $tbService->confirmAcceptReceipt($request->all());
    }

    function confirmRejectTB(Request $request, TBService $tbService)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'reason' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }

        return $tbService->confirmRejectTB($request->all());
    }

    function checkReceiptTB(Request $request, TBService $tbService)
    {
        return $tbService->checkReceiptTB($request->query('id'));
    }
}
