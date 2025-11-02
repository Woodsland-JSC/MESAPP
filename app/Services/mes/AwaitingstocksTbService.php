<?php

namespace App\Services\mes;

use App\Models\AwaitingstocksTb;

class AwaitingstocksTbService
{
    public function soLuongTonThucTe($subItemCode, $team)
    {
        try {
            $data = AwaitingstocksTb::where('SubItemCode', $subItemCode)->where('team', $team)->sum('AwaitingQty');
            return $data;
        } catch (\Throwable $th) {
            throw $th;
        }
    }
}
