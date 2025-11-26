<?php

namespace App\Services;

use App\Services\HanaService;
use Auth;
use DB;
use Exception;
use Log;
use Throwable;

class OITMService
{
    private HanaService $hanaService;
    private $SQL_GET_LIST_SKU_BY_ITEMCODES = 'SELECT "U_SKU", "U_CDay", "U_CRong", "U_CDai" FROM OITM WHERE "ItemCode" IN ?';
    private $SQL_GET_ITEM_BY_WH_QC = <<<SQL
        -- SELECT 
        --     OITM."ItemCode",
        --     OITM."ItemName",
        --     OITW."OnHand" AS "Quantity",
        --     OITW."WhsCode",
        --     OITM."U_CDai",
        --     OITM."U_CRong",
        --     OITM."U_CDay"
        -- FROM 
        --     OITM
        -- INNER JOIN OITW ON OITM."ItemCode" = OITW."ItemCode"
        -- WHERE 
        --     OITW."WhsCode" = ?
        --     AND OITW."OnHand" > 0;
        SELECT 
            OITM."ItemCode",
            OITM."ItemName",
            T0."U_CDai",
            T0."U_CRong",
            T0."U_CDay",
            T0."Quantity" as "BatchQuantity",
            OITW."OnHand" as "Quantity",
            T0."DistNumber" as "BatchNum",
            OITW."WhsCode"
        FROM  OITM
        INNER JOIN OITW ON OITM."ItemCode" = OITW."ItemCode"
        Left Join
        (
            Select OBTN."DistNumber",OBTN."ItemCode",OBTQ."WhsCode",OBTQ."Quantity", OBTN."U_CDai", OBTN."U_CRong", OBTN."U_CDay"
            From OBTN 
            inner JOIN OBTQ ON OBTN."ItemCode" = OBTQ."ItemCode" and OBTN."SysNumber" = OBTQ."SysNumber" AND OBTQ."Quantity" > 0

        )T0 ON OITM."ItemCode" = T0."ItemCode" AND OITW."WhsCode" = T0."WhsCode"
        WHERE 
        OITW."WhsCode" = ?
        AND OITW."OnHand" > 0;
    SQL;

    private $SQL_GET_ITEMS_BY_QC = <<<SQL
        SELECT "Code", "U_ItemCode" FROM "@V_GQC"
        WHERE "Code" = ?
    SQL;

    private $GET_BATCH_QTY_BY_ITEMCODE = <<<SQL
        select
            T0."ItemCode", T2."ItemName", T0."DistNumber" as "BatchNum", T1."WhsCode", T1."Quantity"
        from
            OBTN T0
            inner join OBTQ T1 on T0."ItemCode" = T1."ItemCode" and T0."SysNumber" = T1."SysNumber"
            inner join OITM T2 on T0."ItemCode" = T2."ItemCode"
        where
            T1."Quantity" > 0 and T0."ItemCode" = ? AND T1."WhsCode" = ?
        order by
            T1."WhsCode", T0."DistNumber"
    SQL;

    private $SQL_GET_BY_ITEMCODES = 'SELECT * FROM OITM WHERE "ItemCode"  in (?)';

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function getSKUByArrayItemCode($itemCodes)
    {
        try {
            return $this->hanaService->select($this->SQL_GET_LIST_SKU_BY_ITEMCODES, [$itemCodes]);
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function getItemByWhQC($whCode)
    {
        try {
            return $this->hanaService->select($this->SQL_GET_ITEM_BY_WH_QC, [$whCode]);
        } catch (Exception $th) {
            return response()->json([
                'message' => "Lấy danh sách item có lỗi."
            ], 500);
        }
    }

    public function findItemByQC($quyCach)
    {
        try {
            return $this->hanaService->selectOne($this->SQL_GET_ITEMS_BY_QC, [$quyCach]);
        } catch (Throwable $th) {
            throw $th;
        }
    }

    public function getBatchQtyItem($arrayItem, $whCode)
    {
        try {
            $sql = $this->GET_BATCH_QTY_BY_ITEMCODE;

            $batchItems = [];

            foreach ($arrayItem as $key => $objItem) {
                $current = 0;
                $items = [];
                $batchs = $this->hanaService->select($sql, [$objItem['ItemCode'], $whCode]);
                $needQty = $objItem['qty'];

                foreach ($batchs as $key => $batch) {
                    $current += $batch['Quantity'];

                    if ($current <= $needQty) {
                        $items[] = $batch;
                    } else {
                        $qtyTmp = $batch['Quantity'] - ($current - $objItem['qty']);
                        $batch['Quantity'] = $qtyTmp;
                        $items[] = $batch;
                        break;
                    }
                }

                foreach ($items as $key => $item) {
                    $batchItems[] = $item;
                }
            }

            return $batchItems;
        } catch (Exception $th) {
            throw new Exception("Lấy danh sách item có lỗi." . $th->getMessage());
        }
    }

    public function getItemCodeWithListItemCode($places, $itemCodes)
    {
        try {
            $sql = $this->SQL_GET_BY_ITEMCODES;
            $sql = str_replace('?', $places, $sql);
            $params = [];
            foreach ($itemCodes as $code) {
                $params[] = $code;
            }
            return $this->hanaService->select($sql, $params);
        } catch (Exception $th) {
            throw new Exception("Lấy danh sách item có lỗi." . $th->getMessage());
        }
    }
}
