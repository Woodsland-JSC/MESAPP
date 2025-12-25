<?php

namespace App\Http\Controllers\sap_controller;

use App\Http\Controllers\Controller;
use App\Models\Pallet;
use App\Services\HanaService;
use Carbon\Carbon;
use DateTime;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

    private $SQL_TON_GO_NGOAI_BAI = <<<SQL
        SELECT 
            D."U_CDay" as "day", 
            D."U_CRong" as "rong", 
            D."U_CDai" as "dai", 
            TO_VARCHAR(A."DocDate", 'YYYY-MM-DD') AS "DocDate",
            CEILING(((1000000000 *  A."Quantity") / (ifnull(D."U_CRong", 1) * ifnull(D."U_CDai", 1) * ifnull(D."U_CDay", 1)))) as "Quantity",
            A."Quantity" as "m3",
            A."ItemCode"
        FROM IBT1 A
        JOIN OWHS B ON A."WhsCode" = B."WhsCode" AND B."U_Flag" IN ('TS') 
        JOIN OIBT D ON A."ItemCode" = D."ItemCode" AND D."WhsCode" = A."WhsCode"
        WHERE  B."BPLid" = ?
        AND B."U_FAC" = ?
        AND A."Direction"= 0
        AND A."DocDate" >= ? AND  A."DocDate" <= ?
        AND (ifnull(D."U_CRong", 0) * ifnull(D."U_CDai", 0) * ifnull(D."U_CDay", 0)) > 0
        GROUP BY D."U_CDay", 
            D."U_CRong", 
            D."U_CDai", 
            A."DocDate",
            A."Quantity",
            A."ItemCode"
    SQL;

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
                                if ($pallet->LoadedIntoKilnDate > $date) {
                                    $klChuaSay += $detail->Qty;
                                }

                                if ($pallet->CompletedBy == null) {
                                    // 
                                    if ($pallet->RanBy == null && $pallet->LoadedIntoKilnDate <= $date) {
                                        $klTrongLoChuaSay += $detail->Qty;
                                    }

                                    if ($pallet->RanDate > $date && $pallet->LoadedIntoKilnDate <= $date) {
                                        $klTrongLoChuaSay += $detail->Qty;
                                    }

                                    //
                                    if ($pallet->RanBy != null && $pallet->RanDate <= $date) {
                                        $klDangSay += $detail->Qty;
                                    }
                                } else {
                                    if ($pallet->CompletedDate > $date) {
                                        $klDangSay += $detail->Qty;
                                    }
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

    public function bao_cao_ton_go_ngoai_bai(Request $request)
    {
        try {
            $fromDate =  $request->fromDate . ' 00:00:00';
            $toDate =  $request->toDate . ' 23:59:59';
            $factory = $request->factory;

            $results = $this->hanaService->select($this->SQL_TON_GO_NGOAI_BAI, [Auth::user()->branch, $factory, $fromDate, $toDate]);
            $data = [];

            foreach ($results as $key => &$item) {
                $date = $item['DocDate'];

                $dai  = $item['dai'];
                $rong = $item['rong'];
                $day  = $item['day'];

                $key = implode('|', [
                    $date,
                    $dai,
                    $rong,
                    $day
                ]);

                // 4. Cộng dồn
                if (!isset($data[$key])) {
                    $data[$key] = $item;
                    $data[$key]['DocDate'] = $date;
                    $data[$key]['Quantity'] = $item['Quantity'];
                } else {
                    $data[$key]['Quantity'] += $item['Quantity'];
                }
            }

            $items = array_values($data);

            $pallets = DB::table('pallet_details as A')
                ->join('pallets as B', 'A.palletID', '=', 'B.palletID')
                ->selectRaw('
                    DATE(B.NgayNhap) as NgayNhap,
                    A.Qty_T,
                    CAST(A.CDay AS SIGNED)  AS CDay,
                    CAST(A.CRong AS SIGNED) AS CRong,
                    CAST(A.CDai AS SIGNED)  AS CDai
                ')
                ->whereBetween('B.created_at', [$fromDate, $toDate])
                ->where('B.factory', $factory)
                ->get();

            foreach ($items as $key => &$item) {
                foreach ($pallets as $pallet) {
                    $d1 = $pallet->NgayNhap;
                    $d2 = $item['DocDate'];

                    if ($item['day'] == $pallet->CDay && $item['rong'] == $pallet->CRong && $item['dai'] == $pallet->CDai && $d1 === $d2) {
                        if (!isset($item['xepsay'])) {
                            $item['xepsay'] = 0;
                        }

                        $item['xepsay'] += isset($item['xepsay']) ? $pallet->Qty_T : 0;
                    }
                }
            }

            return $items;
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
