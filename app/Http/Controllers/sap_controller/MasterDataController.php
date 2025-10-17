<?php

namespace App\Http\Controllers\sap_controller;

use App\Http\Controllers\Controller;
use App\Services\HanaService;

/**
 * Controller lấy master data từ SAP
 *
 * @author  TuanPA
 */
class MasterDataController extends Controller{
    private HanaService $hanaService;
    private $SQL_DANH_SACH_NHA_MAY_CBG = 'SELECT DISTINCT "Code" AS U_FAC,"Name"  FROM "@G_SAY4" WHERE  "U_CBG" = \'Y\' AND "Canceled" = \'N\'';

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    // Lấy danh sách nhà máy chế biến gỗ
    public function danhSachNhaMayCBG(){
        try {
            $factories = $this->hanaService->select($this->SQL_DANH_SACH_NHA_MAY_CBG);

            $data = [
                'factories' => $factories
            ];

            return response()->json([
                'data' => $data
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}