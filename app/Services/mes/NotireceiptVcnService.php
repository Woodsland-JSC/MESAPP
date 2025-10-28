<?php

namespace App\Services\mes;

use App\Models\awaitingstocksvcn;
use App\Models\notireceiptVCN;
use Auth;
use DB;
use Exception;
use Log;


class NotireceiptVcnService
{
    public function getItemByItemCode($itemCode)
    {
        try {
            $ItemInfo = notireceiptVCN::where('ItemCode', $itemCode)
                ->select(
                    'ItemCode',
                    'ItemName',
                )
                ->first();
            return $ItemInfo;
        } catch (Exception $e) {
            return response()->json(['error' => 'Lấy Item Notireceipt VCN có lỗi'], 500);
        }
    }

    // Lấy danh sách sản lượng và lỗi đã ghi nhận
    public function getNotificationNotireceipt($spDich, $itemCode, $team, $lsx)
    {
        try {
            $notification = DB::table('notireceiptVCN as a')
                ->join('users as c', 'a.CreatedBy', '=', 'c.id')
                ->select(
                    'a.FatherCode',
                    'a.ItemCode',
                    'a.ItemName',
                    'a.SubItemName',
                    'a.SubItemCode',
                    'a.loinhamay',
                    'a.team',
                    'CDay',
                    'CRong',
                    'CDai',
                    'a.Quantity',
                    'a.created_at',
                    'c.first_name',
                    'c.last_name',
                    'a.text',
                    'a.id',
                    'a.type',
                    'a.confirm'
                )
                ->where('a.confirm', '=', 0)
                ->where('a.deleted', '=', 0)
                ->where('a.FatherCode', '=', $spDich)
                ->where('a.ItemCode', '=', $itemCode)
                ->where('a.Team', '=', $team)
                ->where('a.LSX', '=', $lsx)
                ->get();
            return $notification;
        } catch (Exception $e) {
            return response()->json(['error' => 'Lấy sản lượng VCN có lỗi'], 500);
        }
    }

    // Lấy danh sách trả lại
    public function getReturnNotireceipt($spDich, $itemCode, $team, $lsx)
    {
        try {
            $notification = DB::table('notireceiptVCN as a')
                ->join('users as c', 'a.CreatedBy', '=', 'c.id')
                ->select(
                    'a.FatherCode',
                    'a.ItemCode',
                    'a.ItemName',
                    'a.SubItemName',
                    'a.SubItemCode',
                    'a.loinhamay',
                    'a.team',
                    'CDay',
                    'CRong',
                    'CDai',
                    'a.Quantity',
                    'a.created_at',
                    'c.first_name',
                    'c.last_name',
                    'a.text',
                    'a.id',
                    'a.type',
                    'a.confirm'
                )
                ->where('a.confirm', '=', 2)
                ->where('a.deleted', '=', 0)
                ->where('a.FatherCode', '=', $spDich)
                ->where('a.ItemCode', '=', $itemCode)
                ->where('a.Team', '=', $team)
                ->where('a.LSX', '=', $lsx)
                ->get();
            return $notification;
        } catch (Exception $e) {
            return response()->json(['error' => 'Lấy sản lượng VCN có lỗi'], 500);
        }
    }
}
