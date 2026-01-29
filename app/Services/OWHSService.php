<?php

namespace App\Services;

use App\Services\HanaService;
use Auth;
use DB;
use Exception;
use Log;


class OWHSService
{
    private HanaService $hanaService;
    private $SQL_GET_ALL_WH_QC = 'SELECT "WhsCode", "WhsName", "U_FAC" FROM OWHS where "U_Flag" = ?';
    private $SQL_GET_WH_SL_BY_FACTORY = 'SELECT "WhsCode", "WhsName", "U_FAC" FROM OWHS where "U_Flag" = ? AND "U_FAC" = ?';
    private $SQL_GET_WH_QC_FACTORY = 'SELECT "WhsCode", "WhsName", "U_FAC" FROM OWHS where "U_Flag" = ? AND "U_FAC" = ?';
    private $SQL_GET_WH_HT_CBG = <<<SQL
        SELECT "WhsCode", "WhsName" FROM OWHS WHERE "U_KHOI" = 'CBG' AND "U_CDOAN" = 'HT' AND "U_FAC" = ? AND "Inactive" = 'N'
    SQL;

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function getAllWhQC()
    {
        try {
            return $this->hanaService->select($this->SQL_GET_ALL_WH_QC, ['QC']);
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function getWhQCByFactory($factory)
    {
        try {
            return $this->hanaService->select($this->SQL_GET_WH_QC_FACTORY, ['QC', $factory]);
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function getWhSL()
    {
        try {
            return $this->hanaService->select($this->SQL_GET_ALL_WH_QC, ['SL']);
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function getWhSLByFactory($factory)
    {
        try {
            return $this->hanaService->selectOne($this->SQL_GET_WH_SL_BY_FACTORY, ['SL', $factory]);
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function getWhHTCBG($factory){
        try {
            return $this->hanaService->select($this->SQL_GET_WH_HT_CBG, [$factory]);
        } catch (\Throwable $th) {
            throw $th;
        }
    }
}
