<?php

namespace App\Http\Controllers\sap_controller;

use App\Http\Controllers\Controller;
use App\Services\HanaService;
use App\Services\OvenService;
use Exception;
use Illuminate\Http\Request;

/**
 * Controller Lò sấy SAP
 *
 * @author  TuanPA
 */
class OvenController extends Controller
{
    private HanaService $hanaService;
    private OvenService $ovenService;
    private $SQL_OVEN_BY_FACTORY = 'SELECT "Code", "Name" FROM "@G_SAY3" WHERE "U_Factory" = ? AND "U_status" = ?';

    public function __construct(HanaService $hanaService, OvenService $ovenService)
    {
        $this->hanaService = $hanaService;
        $this->ovenService = $ovenService;
    }

    public function getOvensByFactory(Request $request){
        try {
            $ovens = $this->hanaService->select($this->SQL_OVEN_BY_FACTORY, [$request->query('factory'), '1']);
            return response()->json([
                'ovens' => $ovens
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lấy danh sách lò sấy có lỗi!'
            ], 500);
        }
    }
}
