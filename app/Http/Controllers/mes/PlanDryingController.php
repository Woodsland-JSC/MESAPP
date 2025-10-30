<?php

namespace App\Http\Controllers\mes;

use App\Http\Controllers\Controller;
use App\Models\Pallet;
use App\Models\PalletLog;
use App\Models\plandetail;
use Illuminate\Http\Request;
use App\Models\planDryings as PlanDrying;
use App\Models\planDryings;
use App\Services\mes\PalletLogService;
use App\Services\mes\PlanDryingService;
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

    public function removePallets(Request $request)
    {
        DB::beginTransaction();
        try {
            $data = [
                'planId' => $request->planId,
                'pallets' => $request->pallets,
                'log_type' => $request->log_type,
                'log_data' => $request->log_data,
                'factory' => $request->factory,

            ];

            $check = planDryings::where('PlanID', $data['planId'])->first();

            if ($check) {
                Pallet::whereIn('palletID', $data['pallets'])
                    ->update([
                        'LoadedBy' => null,
                        'LoadedIntoKilnDate' => null,
                        'activeStatus' => 0,
                    ]);

                plandetail::whereIn('pallet', $data['pallets'])
                    ->where('PlanID',  $data['planId'])
                    ->delete();

                $totalMass = plandetail::where('PlanID', $data['planId'])
                    ->sum('Mass');
                $totalPallet = plandetail::where('PlanID', $data['planId'])
                    ->count();

                planDryings::where('PlanID', $data['planId'])
                    ->update([
                        'Mass' => $totalMass,
                        'TotalPallet' => $totalPallet
                    ]);

                $palletLogs = [];
                $now = now();

                foreach ($data['pallets'] as $key => $value) {
                    $palletLogs[] = [
                        'type_log' => $data['log_type'],
                        'log_data' => $data['log_data'],
                        'palletId' => $value,
                        'old_plan' => null,
                        'new_plan' => null,
                        'old_oven' => null,
                        'new_oven' => null,
                        'user_id' => Auth::user()->id,
                        'created_at' => $now,
                        'updated_at' => $now,
                        'factory' => $data['factory']
                    ];
                }

                PalletLog::insert($palletLogs);
            } else {
                return response()->json(['error' => 'Lò không tồn tại'], 500);
            }

            DB::commit();
            return response()->json(['message' => 'success'], 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Xóa Pallet có lỗi'
            ], 500);
        }
    }

    public function removePlanDrying(Request $request, PlanDryingService $planDryingService, OvenService $ovenService)
    {
        DB::beginTransaction();
        try {

            $id = $request->query('id');
            if (!$id) {
                return response()->json([
                    'message' => 'Thiếu mã kế hoạch'
                ], 500);
            }

            $plan = $planDryingService->getPlanDryingById($request->query('id'));

            if (!$plan) {
                return response()->json([
                    'message' => 'Không tìm thấy kế hoạch sấy.'
                ], 500);
            }

            $oven = $plan->Oven;
            $ovenService->unlockOven($oven);
            $plan->delete();

            DB::commit();
            return response()->json([
                'message' => 'Xóa kế hoạch thành công.'
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Xóa Kế hoạch sấy có lỗi'
            ], 500);
        }
    }
}
