<?php

namespace App\Services;

use App\Services\HanaService;
use Auth;
use DB;
use Exception;
use Log;


class OITWService
{
    private HanaService $hanaService;

    private $SQL_GET_ITEMS_PRINT_BY_WH = <<<SQL
        SELECT 
            A."ItemCode", 
            B."ItemName", 
            A."WhsCode", 
            A."OnHand", 
            B."IUoMEntry", 
            C."UomCode", 
            D."BPLid" ,
            B."CodeBars"
        FROM OITW A
        JOIN OITM B ON A."ItemCode" = B."ItemCode"
        JOIN OUOM C ON B."IUoMEntry" = C."UomEntry"
        JOIN OWHS D ON D."WhsCode" =  A."WhsCode"
        WHERE A."WhsCode" = ? AND B."U_Group1" = 'HC' AND A."ItemCode" LIKE 'SU%' 
        ORDER BY B."CodeBars" DESC;
    SQL;

    private $SQL_GET_ITEMS_SF_BY_WH = <<<SQL
        SELECT A."ItemCode", B."ItemName", A."WhsCode", A."OnHand", B."IUoMEntry", C."UomCode", D."BPLid", B."CodeBars" FROM OITW A
        JOIN OITM B ON A."ItemCode" = B."ItemCode"
        JOIN OUOM C ON B."IUoMEntry" = C."UomEntry"
        JOIN OWHS D ON D."WhsCode" =  A."WhsCode"
        WHERE A."WhsCode" = ? AND A."OnHand" > 0 AND A."ItemCode" LIKE 'SF%'
        ORDER BY B."CodeBars" DESC;
    SQL;

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function getItemsPrintByWh($whCode)
    {
        try {
            return $this->hanaService->select($this->SQL_GET_ITEMS_PRINT_BY_WH, [$whCode]);
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function getItemsSFByWh($whCode)
    {
        try {
            return $this->hanaService->select($this->SQL_GET_ITEMS_SF_BY_WH, [$whCode]);
        } catch (Exception $e) {
            throw new Exception("Lấy items bán thành phẩm có lỗi");
        }
    }
}
