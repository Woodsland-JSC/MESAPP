<?php

namespace App\Http\Controllers\mes;

use App\Http\Controllers\Controller;
use App\Http\Controllers\sap\ConnectController;
use App\Models\Pallet;
use App\Services\OITMService;
use Carbon\Carbon;
use DB;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PalletController extends Controller
{
    public function getPalletReport(Request $request)
    {
        try {
            $factory = $request->query('factory');
            $fromDate = $request->query('fromDate');
            $toDate = $request->query('toDate');

            $data = DB::select(
                'SELECT
                    p.palletID,
                    p.Code,
                    p.LyDo,
                    p.QuyCach,
                    p.factory,
                    p.LoadedIntoKilnDate,
                    p.CompletedDate,
                    p.CompletedBy,
                    p.stacking_time,
                    u.username,
                    u.first_name,
                    u.last_name,
                    pld.Qty,
                    pld.Mass,
                    pl.Oven,
                    pl.Code as OvenCode
                FROM pallets p
                JOIN pallet_details pd ON pd.palletID = p.palletID
                JOIN plan_detail pld ON pld.pallet = p.palletID
                JOIN planDryings pl ON pld.PlanID = pl.PlanID
                LEFT JOIN users u ON u.id = p.CompletedBy
                WHERE p.factory = ? AND p.activeStatus = 1
                AND p.LoadedIntoKilnDate >= ?
                AND p.LoadedIntoKilnDate <= ?',
                [$factory, $fromDate, $toDate]
            );
            return response()->json([
                'reports' => $data
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lấy Pallets có lỗi!'
            ], 500);
        }
    }

    public function getPalletComplete(Request $request, OITMService $oitmService)
    {
        $fromDate = $request->input('fromDate');
        $toDate = $request->input('toDate');
        $factory = $request->input('factory');

        $validate = Validator::make($request->all(), [
            'fromDate' => 'required|date',
            'toDate' => 'required|date',
            'factory' => 'required',
        ]);

        if ($validate->fails()) {
            return response()->json(['error' => $validate->errors()], 400);
        }

        try {
            // Lấy dữ liệu pallet với điều kiện lọc
            $pallets = Pallet::with(['details', 'createdBy', 'completedBy'])
                ->where('factory', $factory)
                ->whereBetween('CompletedDate', [Carbon::parse($fromDate)->startOfDay(), Carbon::parse($toDate)->endOfDay()])
                ->get();

            if($pallets->count() == 0){
                return response()->json([], 200);
            }


            $result = [];
            $itemCodes = [];

            foreach ($pallets as $pallet) {
                foreach ($pallet->details as $detail) {
                    $status = 'Đã ra lò';

                    if (!in_array($detail->ItemCode, $itemCodes)) {
                        $itemCodes[] = $detail->ItemCode;
                    } 
                    

                    $result[] = [
                        'created_at' => Carbon::parse($pallet->created_at)->format('H:i:s d/m/Y'),
                        'code' => $pallet->Code,
                        'ma_lo' => $pallet->MaLo,
                        'item_code' => $detail->ItemCode,
                        'item_name' => 'Không xác định',
                        'dai' => $detail->CDai,
                        'rong' => $detail->CRong,
                        'day' => $detail->CDay,
                        'qty' => $detail->Qty_T,
                        'mass' => round($detail->Qty, 6),
                        'reason' => $detail->CDay != 14 ? $pallet->LyDo : '',
                        'status' => $status,
                        'created_username' => $pallet->createdBy->username,
                        'created_fullname' => $pallet->createdBy->last_name . ' ' . $pallet->createdBy->first_name,
                        'stacking_time' => $pallet->stacking_time,
                        'completed_by' => $pallet->completedBy->username,
                        'completed_fullname' => $pallet->completedBy->last_name . ' ' . $pallet->completedBy->first_name,
                        'completed_date' => $pallet->CompletedDate,
                        'type' => $detail->CDay == 14 ? 'Runnen' : ''
                    ];
                }
            }

            $placeholders = implode(',', array_fill(0, count($itemCodes), '?'));
            $listItems = $oitmService->getItemCodeWithListItemCode($placeholders, $itemCodes);
            $oitmItems = [];

            foreach ($listItems as $key => $item) {
                $oitmItems[$item['ItemCode']] = $item['ItemName'];
            }

            foreach ($result as $key => &$pallet) {
                $pallet['item_name'] = $oitmItems[$pallet['item_code']] ?? 'Không xác định';
            }

            return response()->json($result, 200);
        } catch (\Exception $e) {
            Log::info('Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Lỗi khi lấy dữ liệu: ' . $e->getMessage()
            ], 500);
        }
    }
}
