<?php

namespace App\Services;

use App\Services\HanaService;
use DB;
use Exception;
use Log;

class VKetCauVcnService
{
    private HanaService $hanaService;

    private $SQL_KET_CAU_H = "";
    private $SQL_KET_CAU_L = "";
    private $SQL_KET_CAU_H_THEO_LSX = 'select * from "@V_KETCAUH" where "U_GRID" = ?';

    private $SQL_KET_CAU_L_THEO_CODE = 'select * from "@V_KETCAUL" where "Code" = ?';

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function lay_ket_cau_h_theo_lsx(String $lsx)
    {
        try {
            $result = $this->hanaService->selectOne($this->SQL_KET_CAU_H_THEO_LSX, [$lsx]);
            return $result;
        } catch (Exception $th) {
            return response()->json([
                'message' => 'Truy vấn kết cấu thất bại.'
            ], 500);
        }
    }

    public function lay_ket_cau_l_theo_code($code)
    {
        try {
            $result = $this->hanaService->select($this->SQL_KET_CAU_L_THEO_CODE, [$code]);
            return $result;
        } catch (Exception $th) {
            return response()->json([
                'message' => 'Truy vấn chi tiết kết cấu thất bại.'
            ], 500);
        }
    }
}
