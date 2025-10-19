<?php

namespace App\Services;

use App\Services\HanaService;
use Auth;
use DB;
use Exception;
use Log;


class IncomingQCCBGService
{
    private HanaService $hanaService;
    private $SQL_QC_QUANTITY_RETURN = '{CALL usp_VN_PU_QuantityReturn (?,?,?,?,?,?,?)}';
    private $SQL_QUANTITY_RETURN_ALL = '{CALL usp_VN_PU_QuantityReturn (?,?,?,?,?,?,?)}';

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function qcQuantityReturn($data)
    {
        try {
            foreach ($data as $key => $item) {
                $this->hanaService->statement($this->SQL_QC_QUANTITY_RETURN, [
                    $item['sapId'],
                    $item['lineId'],
                    $item['tongThanh'],
                    Auth::user()->username,
                    $item['qcGhiChu'],
                    'N',
                    'CBG'
                ]);
            }
        } catch (Exception) {
            return response()->json(['status' => false, 'message' => 'Trả lại NCC có lỗi.'], 500);
        }
    }

    public function qcQuantityReturnAll($data)
    {
        try {
            $this->hanaService->statement($this->SQL_QUANTITY_RETURN_ALL, [
                $data['sapId'],
                '-1',
                0,
                Auth::user()->username,
                $data['qcNote'],
                'Y',
                'CBG'
            ]);
        } catch (Exception) {
            return response()->json(['status' => false, 'message' => 'Trả lại NCC có lỗi.'], 500);
        }
    }
}
