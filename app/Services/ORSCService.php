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
    private $SQL_GET_TEAM_CDOAN_HT = <<<SQL
        select ORSC."VisResCode" "Code", 
            ORSC."ResName" "Name",
            ORSC."U_CDOAN" "CDOAN"
        from ORSC JOIN RSC1 ON ORSC."VisResCode" = RSC1."ResCode"
        where ORSC."U_CDOAN" = 'HT' 
        AND ORSC."U_FAC"= ? 
        AND ORSC."validFor"='Y'
        AND RSC1."WhsCode" = ?
        AND RSC1."Locked" = 'N'
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

    public function getTeamCdoanHT($factory, $wh){
        try {
            return $this->hanaService->select($this->SQL_GET_TEAM_CDOAN_HT, [$factory, $wh]);
        } catch (\Throwable $th) {
            throw new Exception($th->getMessage());
        }
    }
}
