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
    private $SQL_GET_BY_CODE = 'SELECT * FROM "@G_PALLET" WHERE "U_Code" = ?';
    private $DELELE_PALLET = 'DELETE FROM "@G_PALLET" WHERE "DocEntry" = ?';
    private $DELELE_PALLETL = 'DELETE FROM "@G_PALLETL" WHERE "DocEntry" = ?';

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

    public function deletePallet($docEntry){
        try {
            $this->hanaService->statement($this->DELELE_PALLET, [$docEntry]);
            $this->hanaService->statement($this->DELELE_PALLETL, [$docEntry]);
        } catch (Exception $th) {
            throw new Exception($th->getMessage());
        }
    }
}
