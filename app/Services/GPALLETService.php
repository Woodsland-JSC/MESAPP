<?php

namespace App\Services;

use App\Services\HanaService;
use Auth;
use DB;
use Exception;
use Log;


class GPALLETService
{
    private HanaService $hanaService;
    private $SQL_GET_BY_CODE = 'select * from "@G_PALLET" where "U_Code" = ?';

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function getByCode($code){
        try {
            return $this->hanaService->selectOne($this->SQL_GET_BY_CODE, [$code]);
        } catch (Exception $th) {
            throw new Exception($th->getMessage());
        }
    }
}
