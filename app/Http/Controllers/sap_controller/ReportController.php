<?php

namespace App\Http\Controllers\sap_controller;

use App\Http\Controllers\Controller;
use App\Models\Pallet;
use App\Services\HanaService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Controller báo cáo SAP
 *
 * @author  TuanPA
 */
class ReportController extends Controller
{
    private HanaService $hanaService;
    private $SQL_BAO_CAO_SAN_LUONG_QUY_DOI = <<< SQL
        SELECT 
            T0."DocDate", 
            T1."U_CDOAN", 
            T1."U_To",
            T2."CreateDate",
            T1."U_Next",
            T2."CreateDate",
            IFNULL(T3."U_SKU",T3."U_WLCode") AS WLCode, 
            T3."ItemCode", 
            T3."ItemName",
            T3."U_CDay", 
            T3."U_CRong", 
            T3."U_CDai",
            Replace(cast(sum(T0."Quantity") AS NVARCHAR(100)),'.000000','') AS Quantity,
            T1."U_GRID"
        FROM  IGN1 T0 INNER JOIN OWOR T1 ON T0."BaseEntry" = T1."DocEntry" AND T0."BaseType" = 202
        INNER JOIN OIGN T2 ON T0."DocEntry" = T2."DocEntry"
        INNER JOIN OITM T3 ON T0."ItemCode" = T3."ItemCode"
        WHERE T0."DocDate" BETWEEN ? AND ?
        AND (T1."U_To" = ? OR IFNULL(?,'') = '')
        AND (T1."U_CDOAN" = ? OR IFNULL(?,'') = '')
        GROUP BY  T0."DocDate" , T1."U_CDOAN" , T1."U_To" ,
        IFNULL(T3."U_SKU",T3."U_WLCode") , T3."ItemCode", T3."ItemName",
        T3."U_CDay" , T3."U_CRong" , T3."U_CDai",T1."U_GRID",T2."CreateDate",T1."U_Next";
    SQL;

    private $SQL_BAO_CAO_QUY_LUONG = '{call USP_REPORT_CONVERTQTY(?, ?)}';

    private $SQL_BAO_CAO_TON_SAY_LUA_CBG = '{CALL "SP_TON_SAY_LUA_CBG"(?)}';

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function baoCaoSanLuongQuyDoiCBG(Request $request)
    {
        try {
            $params = [$request->fromDate, $request->toDate, $request->team, $request->team, $request->CD, $request->CD];
            $results = $this->hanaService->select($this->SQL_BAO_CAO_SAN_LUONG_QUY_DOI, $params);
            return response()->json($results);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function baoCaoQuyLuongCBG(Request $request)
    {
        try {
            $params = [$request->year, $request->factory];
            $results = $this->hanaService->select($this->SQL_BAO_CAO_QUY_LUONG, $params);
            return response()->json($results);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function bao_cao_ton_say_lua(Request $request)
    {
        try {
            $params = [$request->to_date];
            $results = $this->hanaService->select($this->SQL_BAO_CAO_TON_SAY_LUA_CBG, $params);
            $p = [];

            $date = $request->to_date . ' 23:59:59';


            Pallet::with(['details'])
                ->where('created_at', '<=', $date)
                ->whereNull('CompletedBy')
                ->chunk(1000, function ($pallets) use ($date, &$p) {
                    foreach ($pallets as $pallet) {
                        $klChuaSay = 0;
                        $klTrongLoChuaSay = 0;
                        $klDangSay = 0;
                        $factory = $pallet->factory;
                        $quyCach = $pallet->QuyCach;
                        $itemCode = '';

                        foreach ($pallet->details as $detail) {
                            $itemCode = $detail->ItemCode;
                            if ($pallet->activeStatus == 0) {
                                $klChuaSay += $detail->Qty;
                            } else {
                                if ($pallet->activeStatus == 1 && $pallet->RanBy == null && $pallet->LoadedIntoKilnDate <= $date) {
                                    $klTrongLoChuaSay += $detail->Qty;
                                }

                                if ($pallet->activeStatus == 1 && $pallet->RanBy != null && $pallet->LoadedIntoKilnDate <= $date) {
                                    $klDangSay += $detail->Qty;
                                }
                            }
                        }

                        $k = $itemCode . '-' . $quyCach . '-' . $factory;

                        if (!isset($p[$k])) {
                            $p[$k] = [
                                'ItemCode' => $itemCode,
                                'QuyCach' => $quyCach,
                                'Factory' => $factory,
                                'KL_Chua_Say' => $klChuaSay,
                                'KL_Trong_Lo_Chua_Say' => $klTrongLoChuaSay,
                                'KL_Dang_Say' => $klDangSay
                            ];
                        } else {
                            $p[$k]['KL_Chua_Say'] += $klChuaSay;
                            $p[$k]['KL_Trong_Lo_Chua_Say'] += $klTrongLoChuaSay;
                            $p[$k]['KL_Dang_Say'] += $klDangSay;
                        }
                    }
                });

            return response()->json([
                'report_data' => $results,
                'pallets' => $p
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
