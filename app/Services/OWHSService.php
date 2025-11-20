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
    private $SQL_GET_WH_QC_FACTORY = 'SELECT "WhsCode", "WhsName", "U_FAC" FROM OWHS where "U_Flag" = ? AND "U_FAC" = ?';

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
}
