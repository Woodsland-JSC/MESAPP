<?php

namespace App\Services;

use App\Services\HanaService;
use Auth;
use Carbon\Carbon;
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

    private $SQL_INSERT = <<<SQL
        INSERT INTO "@V_VTTSON" ("Code", "Name", "U_ItemCode", "U_ItemName", "U_Status", "U_Quantity", "U_Date")
        VALUES (?,?,?,?,?,?,?)
    SQL;

    private $SQL_FIND_ITEM = <<<SQL
        select * from "@V_VTTSON" where "Name" = ?
    SQL;

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function getStepsQT($itemCode)
    {
        try {
            return $this->hanaService->select($this->SQL_GET_STEP_QT, [$itemCode]);
        } catch (Exception $e) {
            throw new Exception("Lấy quy trình sơn có lỗi.");
        }
    }

    public function insert($data)
    {
        try {
            $date = Carbon::now()->format('Y-m-d H:i:s');
            $ymd = Carbon::now()->format('ymd');
            foreach ($data as $key => $item) {
                $ms = Carbon::now()->timestamp + $key;
                $name = $item['value'] . '-' . $ymd;
                $this->hanaService->statement($this->SQL_INSERT, [$ms, $name, $item['ItemCode'], $item['ItemName'], $item['Step'], $item['quantity'], $date]);
            }
        } catch (Exception $e) {
            throw new Exception($e->getMessage() ?? "Tạo quy trình sơn có lỗi.");
        }
    }

    public function findItem($value)
    {
        try {
            $ymd = Carbon::now()->format('ymd');
            $value = $value . '-' . $ymd;
            return $this->hanaService->selectOne($this->SQL_FIND_ITEM, [$value]);
        } catch (Exception $e) {
            throw new Exception($e->getMessage() ?? "Tìm item có lỗi.");
        }
    }
}
