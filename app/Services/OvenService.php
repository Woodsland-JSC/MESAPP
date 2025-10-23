<?php

namespace App\Services;

use App\Services\HanaService;
use Auth;
use DB;
use Exception;
use Log;


class OvenService
{
    private HanaService $hanaService;
    private $SQL_UNLOCK = 'UPDATE  "@G_SAY3" SET "U_status"= 0 WHERE "Code"=?';

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function unlockOven($code){
        try {
            $this->hanaService->statement($this->SQL_UNLOCK, [$code]);
        } catch (\Throwable $th) {
            throw $th;
        }
    }
}
