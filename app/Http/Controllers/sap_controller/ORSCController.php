<?php

namespace App\Http\Controllers\sap_controller;

use App\Http\Controllers\Controller;
use App\Services\HanaService;
use App\Services\ORSCService;
use Exception;
use Illuminate\Http\Request;

class ORSCController extends Controller
{
    private HanaService $hanaService;
    private $SQL_DANH_SACH_TO_THEO_FAC_CBG = 'SELECT "VisResCode" "Code","ResName" "Name","U_CDOAN" "CDOAN" FROM "ORSC" WHERE "U_QC"= ? AND "validFor"= ? AND "U_FAC"= ? AND "U_KHOI"= ?';

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function layDanhSachToTheoNhaMayCBG(Request $request)
    {
        try {
            $factory = $request->query('factory');
            return $this->hanaService->select($this->SQL_DANH_SACH_TO_THEO_FAC_CBG, ['N', 'Y', $factory, 'CBG']);
        } catch (Exception $e) {
            return  response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getTeamProductionByFactory(Request $request, ORSCService $orscService)
    {
        try {
            $factory = $request->query('factory');
            return $orscService->getTeamProductionByFactory($factory);
        } catch (Exception $e) {
            return  response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
