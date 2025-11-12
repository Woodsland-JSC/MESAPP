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

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function getTeamQC($factory, $khoi){
        try {
            return $this->hanaService->selectOne($this->SQL_GET_TEAM_QC, ['QC', $factory, $khoi]);
        } catch (\Throwable $th) {
            Log::error('ORSCService::getTeamQC', $th->getMessage());
            throw $th;
        }
    }
}
