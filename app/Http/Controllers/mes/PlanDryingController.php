<?php

namespace App\Http\Controllers\mes;

use App\Http\Controllers\Controller;
use App\Models\PalletLog;
use App\Models\plandetail;
use Illuminate\Http\Request;
use App\Models\planDryings as PlanDrying;
use App\Services\OvenService;
use Auth;
use DB;
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

    public function getPalletsByPlanId(Request $request)
    {
        try {
            $planId = $request->query('planId');
            $plandrying = PlanDrying::with(['details' => function ($query) {
                $query->join('pallets', 'plan_detail.pallet', '=', 'pallets.palletID')
                    ->whereNull('pallets.CompletedBy')
                    ->select('plan_detail.*', 'pallets.Code', 'pallets.LyDo', 'pallets.CompletedBy');
            }])
                ->where('PlanID', $planId)
                ->first();

            return response()->json([
                'data' => $plandrying
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lấy Pallets có lỗi!'
            ], 500);
        }
    }

    public function movePalletToPlanDrying(Request $request, OvenService $ovenService)
    {
        DB::beginTransaction();
        try {
            $data = $request->data;

            if (!$data) {
                return response()->json([
                    'message' => 'Thiếu dữ liệu!'
                ], 500);
            }

            $currentPlanId = $data['planId'];
            $palletIds = $data['pallets'];

            $planDryingByNewOven = PlanDrying::where('Oven', $data['newOven'])->where('Status', 1)->first();
            $planDryingByOldOven = PlanDrying::where('PlanID', $currentPlanId)->first();

            if (!$planDryingByNewOven) {
                return response()->json([
                    'message' => 'Không tìm thấy Kế hoạch đang sử dụng lò ' . $data['newOven']
                ], 500);
            }

            if (!$planDryingByOldOven) {
                return response()->json([
                    'message' => 'Không tìm thấy Kế hoạch hiện tại'
                ], 500);
            }

            plandetail::query()->whereIn('pallet', $palletIds)->update([
                'PlanID' => $planDryingByNewOven['PlanID']
            ]);

            $totalOld = plandetail::where('PlanID', $planDryingByOldOven['PlanID'])
                ->selectRaw('SUM(Mass) as totalMass, COUNT(*) as totalPallet')
                ->first();

            if ($totalOld['totalPallet'] == 0) {
                $ovenService->unlockOven($planDryingByOldOven['Oven']);
            }

            $totalNew = plandetail::where('PlanID', $planDryingByNewOven['PlanID'])
                ->selectRaw('SUM(Mass) as totalMass, COUNT(*) as totalPallet')
                ->first();

            PlanDrying::where('PlanID', $planDryingByOldOven['PlanID'])
                ->update([
                    'Mass' => $totalOld['totalMass'],
                    'TotalPallet' => $totalOld['totalPallet']
                ]);

            PlanDrying::where('PlanID', $planDryingByNewOven['PlanID'])
                ->update([
                    'Mass' => $totalNew['totalMass'],
                    'TotalPallet' => $totalNew['totalPallet']
                ]);

            $palletLogs = [];
            $now = now();

            foreach ($palletIds as $key => $value) {
                $palletLogs[] = [
                    'type_log' => $data['log_type'],
                    'log_data' => $data['log_data'],
                    'palletId' => $value,
                    'old_plan' => $currentPlanId,
                    'new_plan' => $planDryingByNewOven['PlanID'],
                    'old_oven' => $planDryingByOldOven['Oven'],
                    'new_oven' => $planDryingByNewOven['Oven'],
                    'user_id' => Auth::user()->id,
                    'created_at' => $now, 
                    'updated_at' => $now,
                    'factory' => $data['factory']
                ];
            }

            $logs = PalletLog::insert($palletLogs);

            DB::commit();
            return response()->json([
                'data' => $logs
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Điều chuyển Pallet có lỗi!'
            ], 500);
        }
    }
}
