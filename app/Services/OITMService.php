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
        SELECT 
            OITM."ItemCode",
            OITM."ItemName",
            OITW."OnHand" AS "Quantity",
            OITW."WhsCode",
            OITM."U_CDai",
            OITM."U_CRong",
            OITM."U_CDay"
        FROM 
            OITM
        INNER JOIN 
            OITW
            ON OITM."ItemCode" = OITW."ItemCode"
        WHERE 
            OITW."WhsCode" = ?
            AND OITW."OnHand" > 0;
    SQL;
    private $SQL_GET_ITEMS_BY_QC = <<<SQL
        SELECT "Code", "U_ItemCode" FROM "@V_GQC"
        WHERE "Code" = ?
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
