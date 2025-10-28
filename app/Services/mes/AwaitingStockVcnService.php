<?php

namespace App\Services\mes;

use App\Models\awaitingstocksvcn;
use Auth;
use DB;
use Exception;
use Log;


class AwaitingStockVcnService {
    public function soLuongTonThucTe($subItemCode, $team){
        try {
            $awaitingQtySum = awaitingstocksvcn::where('SubItemCode', $subItemCode)->where('team', $team)->sum('AwaitingQty');
            return $awaitingQtySum;
        } catch (Exception $e) {
            return response()->json(['error' => 'Lấy số lượng tồn VCN có lỗi'], 500);
        }
    }
}