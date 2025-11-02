<?php

namespace App\Services;

use App\Services\HanaService;
use Auth;
use DB;
use Exception;
use Log;


class OITMService
{
    private HanaService $hanaService;
    private $SQL_GET_LIST_SKU_BY_ITEMCODES = 'SELECT "U_SKU", "U_CDay", "U_CRong", "U_CDai" FROM OITM WHERE "ItemCode" IN ?';

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function getSKUByArrayItemCode($itemCodes){
        try {
            return $this->hanaService->select($this->SQL_GET_LIST_SKU_BY_ITEMCODES, [$itemCodes]);
        } catch (\Throwable $th) {
            throw $th;
        }
    }
}
