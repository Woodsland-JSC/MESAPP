<?php

namespace App\Http\Controllers\mes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\planDryings as PlanDrying;
use Auth;
use Exception;
use Log;
use Validator;

class PlanDryingController extends Controller
{
    // Gửi dữ liệu pallet cho thủ kho xác nhận
    public function sendPlanDryingToStockController(Request $request)
    {
        try {
            $params = $request->only(['planId', 'receiverId']);

            if (!$params['planId'] || !$params['receiverId']) {
                return response()->json([
                    'message' => 'Thiếu dữ liệu!'
                ], 500);
            }

            $userId = Auth::user()->id;

            $count = PlanDrying::where('delivery_id', '=', $userId)
            ->where('receiver_id', '=', $params['receiverId'])
            ->where('PlanID', '=', $params['planId'])
            ->count();

            if ($count > 0) {
                return response()->json([
                    'message' => 'Lò này đã được gửi cho người xác nhận.'
                ], 500);
            }

            PlanDrying::query()->where('PlanID', '=', $params['planId'])->update([
                'delivery_id' => $userId,
                'receiver_id' => $params['receiverId']
            ]);

            return response()->json([
                'data' => 'success'
            ]);
        } catch (Exception $e) {
            Log::info($e->getMessage());
            return response()->json([
                'message' => 'Chuyển cho người xác nhận có lỗi!'
            ], 500);
        }
    }

    public function getAllPlantInPlanDrying(Request $request)
    {
        $plants = PlanDrying::select(['plant'])->groupBy('plant')->get();
        return response()->json([
            'plants' => $plants
        ]);
    }

    public function getPlanDryingByFactory(Request $request)
    {
        try {
            $plants = PlanDrying::query()
                ->where('plant', '=', $request->query('plantId'))
                ->where('status', 1)
                ->get();
            return response()->json([
                'plants' => $plants
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lấy dữ liệu kế hoạch sấy có lỗi!'
            ], 500);
        }
    }


    // $results = planDryings::select(
    //                 'planDryings.Code as newbatch',
    //                 'planDryings.Oven',
    //                 'pallets.DocEntry',
    //                 'pallets.Code',
    //                 'pallets.palletID',
    //                 'pallets.palletSAP',
    //                 'pallets.CompletedBy',
    //                 'pallet_details.ItemCode',
    //                 'pallet_details.WhsCode2',
    //                 'pallet_details.Qty',
    //                 'pallet_details.CDai',
    //                 'pallet_details.CRong',
    //                 'pallet_details.CDay',
    //                 'pallet_details.BatchNum',
    //                 DB::raw('SUM(pallet_details.Qty) OVER (PARTITION BY pallets.palletID) AS TotalQty'),
    //                 'pallet_details.palletID'
    //             )
    //                 ->join('plan_detail', 'planDryings.PlanID', '=', 'plan_detail.PlanID')
    //                 ->join('pallets', 'plan_detail.pallet', '=', 'pallets.palletID')
    //                 ->join('pallet_details', 'pallets.palletID', '=', 'pallet_details.palletID')
    //                 ->where('planDryings.PlanID', $id)
    //                 ->whereNull('pallets.CompletedBy')
    //                 ->get();
}
