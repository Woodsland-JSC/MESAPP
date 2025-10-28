<?php

namespace App\Http\Controllers\sap_controller;

use App\Http\Controllers\Controller;
use App\Services\HanaService;
use Auth;
use Exception;
use Illuminate\Http\Request;

/**
 * Controller lấy master data từ SAP
 *
 * @author  TuanPA
 */
class MasterDataController extends Controller
{
    private HanaService $hanaService;
    private $SQL_DANH_SACH_NHA_MAY_CBG = 'SELECT DISTINCT "Code" AS U_FAC,"Name"  FROM "@G_SAY4" WHERE  "U_CBG" = \'Y\' AND "Canceled" = \'N\'';
    private $SQL_DANH_SACH_NHA_MAY_ND = 'SELECT DISTINCT "Code" AS U_FAC, "Name"  FROM "@G_SAY4" WHERE  "U_ND" = \'Y\' AND "Canceled" = \'N\'';
    private $SQL_DANH_SACH_NHA_MAY_ND_BY_USER = 'SELECT DISTINCT "Code" AS U_FAC, "Name"  FROM "@G_SAY4" WHERE  "U_ND" = \'Y\' AND "Canceled" = \'N\' AND "Code" = ?';
    private $SQL_FAC_UTUB = <<<SQL
        SELECT DISTINCT "Code" AS U_FAC, "Name"  FROM "@G_SAY4" WHERE  "U_TUB" = 'Y' AND "Canceled" = 'N' AND "U_BranchID" = ?
    SQL;
    private $SQL_TEAM_UTUB = <<<SQL
        SELECT
            "VisResCode" AS "Code",
            "ResName" AS "Name",
            "U_CDOAN" AS "CongDoan",
            "U_FAC" AS "Factory",
            "U_QC",
            "U_KHOI"
        FROM
            "ORSC" A
            JOIN "RSC4" B ON A."VisResCode" = b."ResCode"
            JOIN OHEM C ON B."EmpID" = C."empID"
        WHERE C."empID" = ? AND "U_FAC" = ? AND "U_KHOI" = 'TUB' AND "U_QC" = 'N'
    SQL;

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    // Lấy danh sách nhà máy chế biến gỗ
    public function danhSachNhaMayCBG()
    {
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

    public function danhSachNhaMayND()
    {
        try {
            $factories = $this->hanaService->select($this->SQL_DANH_SACH_NHA_MAY_ND);

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

    public function factoryNDByUser(Request $request)
    {
        try {
            $factories = $this->hanaService->select($this->SQL_DANH_SACH_NHA_MAY_ND_BY_USER, [$request->query('branchId')]);

            $data = [
                'factories' => $factories
            ];

            return response()->json([
                'data' => $data
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getFactoryUTub(Request $request)
    {
        try {
            $factories = $this->hanaService->select($this->SQL_FAC_UTUB, [$request->query('branchId')]);

            $data = [
                'factories' => $factories
            ];

            return response()->json([
                'data' => $data
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getTeamUTub(Request $request){
        try {
            $teams = $this->hanaService->select($this->SQL_TEAM_UTUB, [Auth::user()->sap_id, $request->query('factory')]);

            $data = [
                'teams' => $teams
            ];

            return response()->json([
                'data' => $data
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
