<?php

namespace App\Services;

use App\Services\HanaService;
use Auth;
use DB;
use Exception;
use Log;
use Throwable;

class QtSonService
{
    private HanaService $hanaService;

    private $SQL_GET_STEP_QT = <<<SQL
        SELECT C."Name" AS "QtName", C."Code" AS "QtCode", D."U_CDOAN" AS "CDOAN", D."U_Step" AS "Step", A."U_ItemCode" AS "ItemCode"  
        FROM "@V_ISONH" A
        JOIN "@V_ISONL" B ON A."Code" = B."Code"
        JOIN "@V_PSONH" C ON C."Code" = B."U_PSON"
        JOIN "@V_PSONL" D ON C."Code" = D."Code"
        WHERE A."U_ItemCode" = ?
        ORDER BY D."U_CDOAN" ASC, D."U_Step" ASC
    SQL;

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function getStepsQT($itemCode) {
        try {
            return $this->hanaService->select($this->SQL_GET_STEP_QT, [$itemCode]);
        } catch (Exception $e) {
            throw new Exception("Lấy quy trình sơn có lỗi.");
        }
    }
}
