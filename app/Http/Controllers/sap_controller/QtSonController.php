<?php

namespace App\Http\Controllers\sap_controller;

use App\Http\Controllers\Controller;
use App\Services\HanaService;
use App\Services\OITWService;
use App\Services\OvenService;
use App\Services\QtSonService;
use Exception;
use Illuminate\Http\Request;

/**
 * Controller QT SƠn SAP
 *
 * @author  TuanPA
 */
class QtSonController extends Controller
{
    private QtSonService $QtSonService;

    public function __construct(QtSonService $QtSonService)
    {
        $this->QtSonService = $QtSonService;
    }

    public function getStepsQT(Request $request)
    {
        $itemCode = $request->query('itemCode');
        $items = $this->QtSonService->getStepsQT($itemCode);
        return response()->json([
            'data' => $items
        ]);
    }

    public function insert(Request $request)
    {
        $data = $request->all();
        if (count($data) == 0) {
            return response()->json([
                'message' => 'Thiếu dữ liệu'
            ], 500);
        }
        $this->QtSonService->insert($data);
        return response()->json([
            'message' => "Thêm mới thành công"
        ]);
    }

    public function findItem(Request $request){
        return $this->QtSonService->findItem($request->value);
    }
}
