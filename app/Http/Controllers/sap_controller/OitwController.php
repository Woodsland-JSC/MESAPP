<?php

namespace App\Http\Controllers\sap_controller;

use App\Http\Controllers\Controller;
use App\Services\HanaService;
use App\Services\OITWService;
use App\Services\OvenService;
use Exception;
use Illuminate\Http\Request;

/**
 * Controller OITW SAP (tổng tồn theo kho)
 *
 * @author  TuanPA
 */
class OitwController extends Controller
{
    private OITWService $oitwService;

    public function __construct(OITWService $oitwService)
    {
        $this->oitwService = $oitwService;
    }

    public function getItemsByFactory(Request $request)
    {
        try {
            $whCode = $request->query('whCode');
            $items = $this->oitwService->getItemsPrintByWh($whCode);
            return response()->json([
                'items' => $items
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lấy danh sách Items có lỗi!'
            ], 500);
        }
    }

    public function getItemsSFByWh(Request $request)
    {
        $whCode = $request->query('whCode');
        $items = $this->oitwService->getItemsSFByWh($whCode);
        return response()->json([
            'items' => $items
        ]);
    }
}
