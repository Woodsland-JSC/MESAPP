<?php

namespace App\Services;

use App\Services\HanaService;
use DB;
use Exception;
use Log;

class VatTuVCNService
{
    private HanaService $hanaService;

    private $SQL_VAT_TU_THEO_LSX = 'SELECT 
        T0."DocEntry",
        T0."DocNum",
        T0."DocDate",
        T1."LineNum",
        T1."ItemCode",
        T2."CodeBars",
        T2."ItemName",
        "Quantity" "soLuongYC","OpenQty" - ifnull("QuantityIO",0) AS "soLuongDC",
        "Quantity" - "OpenQty" - ifnull("QuantityIO",0) AS "soLuongDaDC",
        T6."OnHand",
        T1."FromWhsCod", 
        T1."WhsCode",
        T2."U_CDay",
        T2."U_CRong",
        T2."U_CDai",
        T3."U_FAC",
        T1."U_GRID", 
        T0."Comments",
        T5."U_SPDICH", 
        T5."U_SPDICHName",
        T0."U_LSX",
        T1."U_GRID",
        T1."U_LLSX",
        T1."U_BaseEntry",
        T1."U_BaseType",
        T1."U_BaseLine",
        T0."U_MoveType", 
        T3."BPLid",
        T5."Status"
    From OWTQ T0 Inner Join WTQ1 T1 on T0."DocEntry" = T1."DocEntry"
    Inner Join OITM T2 on T1."ItemCode" = T2."ItemCode"
    Inner Join OITB T4 on T2."ItmsGrpCod" = T4."ItmsGrpCod" 
    Inner Join OWHS T3 on T1."FromWhsCod" = T3."WhsCode" 
    Left Join 
        (
            Select T0."DocEntry", T1."LineNum", T0."U_SPDICH", T2."ItemName" "U_SPDICHName",
            T0."ItemCode", T0."U_FAC", T0."Status"
            From OWOR T0 Inner Join WOR1 T1 on T0."DocEntry" = T1."DocEntry"
            Inner Join OITM T2 on T0."U_SPDICH" = T2."ItemCode"
    ) T5 on T1."U_BaseEntry" = T5."DocEntry" And T1."U_BaseLine" = T5."LineNum"
        
    Left Join OITW T6 on T1."ItemCode" = T6."ItemCode" And T1."FromWhsCod" = T6."WhsCode"
    Left Join
        (
            Select "U_BaseEntry", "U_BaseLine", sum("Quantity") "QuantityIO"
            From
            (
                Select "U_BaseEntry", "U_BaseLine", "Quantity" 
                From IGN1 
                Where "U_BaseType" = ?
                Union ALL
                Select "U_BaseEntry", "U_BaseLine", "Quantity" "Quantity"
                From IGE1 
                Where "U_BaseType" = ?
            )T00
            Group By "U_BaseEntry", "U_BaseLine"
        ) T7 on T1."DocEntry" = T7."U_BaseEntry" And T1."LineNum" = T7."U_BaseLine"
    WHERE T5."Status" = ? AND T1."U_LLSX" = ? AND T1."U_GRID" = ?
    Order By T0."DocEntry",T1."LineNum";';

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function getMaterialByLSX(String $lsx){
        try {
            $result = $this->hanaService->select($this->SQL_VAT_TU_THEO_LSX, ['1250000001', '1250000001', 'R', 'VCN', $lsx]);
            return $result;
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Truy vấn kết cấu thất bại.'
            ], 500);
        }
    }
}
