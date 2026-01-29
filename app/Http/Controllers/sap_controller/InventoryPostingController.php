<?php

namespace App\Http\Controllers\sap_controller;

use App\Http\Controllers\Controller;
use App\Services\SapB1Service;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Log;

/**
 * Controller InventoryPostingController SAP (điều chỉnh tồn kho)
 *
 * @author  TuanPA
 */
class InventoryPostingController extends Controller
{
    private SapB1Service $sapB1Service;

    public function __construct(SapB1Service $sapB1Service)
    {
        $this->sapB1Service = $sapB1Service;
    }

    public function inventoryPostingItems(Request $request)
    {
        try {
            $data = $request->data;
            $whCode =  $request->whCode;
            $team =  $request->team;

            if (count($data) == 0) {
                return response()->json([
                    'message' => 'Thiếu dữ liệu kiểm kê.'
                ], 500);
            }

            if(!$team){
                return response()->json([
                    'message' => 'Vui lòng chọn tổ.'
                ], 500);
            }

            if(!$whCode){
                return response()->json([
                    'message' => 'Vui lòng chọn kho.'
                ], 500);
            }

            $today = date("ymd");

            $postingData = [
                "CountDate" => Carbon::now()->format('Y-m-d'),
                "Remarks" => "Phiếu Kiểm kê kho " . $whCode . " " .  $today . " của tổ " . $team,
                "InventoryCountingLines" => [],
                "BranchID" => Auth::user()->branch
            ];

            $lines = [];

            foreach ($data as $key => $item) {
                $lines[] = [
                    "ItemCode" => $item["ItemCode"],
                    "WarehouseCode" => $item["WhsCode"],
                    "CountedQuantity" => (float)$item["quantity"],
                    "UoMCode" => $item["UomCode"],
                    "OcrCode4" => $team
                ];
            }

            $postingData['InventoryCountingLines'] = $lines;

            $response = $this->sapB1Service->post($postingData, 'InventoryCountings');

            if (!$response->successful()) {
                Log::info($response->json());
                return response()->json([
                    'message' => 'Điều chỉnh tồn có lỗi.'
                ], 500);
            }

            return response()->json([
                'message' => 'Điều chỉnh tồn thành công.',
                'data' => $response->json()
            ], 200);
        } catch (Exception $e) {
            Log::info("InventoryCountingController::InventoryCountingItems - " . $e->getMessage());
            return response()->json([
                'message' => 'Điều chỉnh tồn có lỗi.'
            ], 500);
        }
    }
}
