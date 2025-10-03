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

    private $SQL_KET_CAU_THE_LSX = 'SELECT 
                                        l."Code",
                                        h."Name",
                                        h."U_GRID" as "U_GRID_H",
                                        h."U_FAC",
                                        h."U_LLSX",
                                        h."U_ItemCode" as "ItemCodeH",
                                        h."U_ItemName" as "ItemNameH",
                                        h."U_Date",
                                        h."U_DungS",
                                        l."U_ItemCode" as "ItemCodeL",
                                        l."U_ItemName" as "ItemNameL",
                                        l."U_KetCau",
                                        l."U_SoLop",
                                        l."U_CachX",
                                        l."U_DoDay",
                                        l."U_LoaiG",
                                        l."U_TIDay",
                                        l."U_TIRong",
                                        l."U_TIDai",
                                        l."LineId"
                                    FROM "@V_KETCAUL" l
                                    JOIN "@V_KETCAUH" h
                                    ON l."Code" = h."Code"
                                    WHERE h."U_GRID" = ?';

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function getStructureByLSX(String $lsx){
        try {
            $result = $this->hanaService->select($this->SQL_KET_CAU_THE_LSX, [$lsx]);
            return $result;
        } catch (Exception $th) {
            return response()->json([
                'message' => 'Truy vấn kết cấu thất bại.'
            ], 500);
        }
    }

    // public function lay_ket_cau_h_theo_lsx(String $lsx)
    // {
    //     try {
    //         $result = $this->hanaService->selectOne($this->SQL_KET_CAU_H_THEO_LSX, [$lsx]);
    //         return $result;
    //     } catch (Exception $th) {
    //         return response()->json([
    //             'message' => 'Truy vấn kết cấu thất bại.'
    //         ], 500);
    //     }
    // }

    // public function lay_ket_cau_l_theo_code($code)
    // {
    //     try {
    //         $result = $this->hanaService->select($this->SQL_KET_CAU_L_THEO_CODE, [$code]);
    //         return $result;
    //     } catch (Exception $th) {
    //         return response()->json([
    //             'message' => 'Truy vấn chi tiết kết cấu thất bại.'
    //         ], 500);
    //     }
    // }
}
