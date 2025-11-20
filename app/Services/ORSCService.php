<?php

namespace App\Services;

use App\Services\HanaService;
use Auth;
use DB;
use Exception;
use Log;


class ORSCService
{
    private HanaService $hanaService;
    private $SQL_GET_TEAM_QC = 'SELECT "ResName" FROM "ORSC" WHERE "U_CDOAN" = ? AND "U_FAC" = ? AND "U_KHOI" = ?';
    private $SQL_GET_TEAM_PRODUCTION = <<<SQL
        SELECT 
            ORSC."VisResCode" "Code", 
            ORSC."ResName" "Name",
            ORSC."U_CDOAN" "CDOAN", 
            ORSC."U_FAC", 
            RSC1."WhsCode"
        FROM ORSC
        JOIN RSC1 ON RSC1."ResCode" = ORSC."VisResCode"
        WHERE "U_QC"='N' AND "validFor"='Y' AND "U_FAC"=? AND "U_KHOI"='CBG';
    SQL;

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function getTeamQC($factory, $khoi)
    {
        try {
            return $this->hanaService->selectOne($this->SQL_GET_TEAM_QC, ['QC', $factory, $khoi]);
        } catch (\Throwable $th) {
            Log::error('ORSCService::getTeamQC', $th->getMessage());
            throw $th;
        }
    }

    public function getTeamProductionByFactory($factory)
    {
        try {
            return $this->hanaService->select($this->SQL_GET_TEAM_PRODUCTION, [$factory]);
        } catch (\Throwable $th) {
            Log::error('ORSCService::getTeamProductionByFactory', $th->getMessage());
            throw $th;
        }
    }
}
