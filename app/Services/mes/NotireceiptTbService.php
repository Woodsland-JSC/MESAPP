<?php

namespace App\Services\mes;

use App\Models\NotireceiptTb;
use DB;
use Log;

class NotireceiptTbService
{
    public function getStockPendingByTeam($team)
    {
        try {
            $stockpending = NotireceiptTb::where('type', 0)
                ->where('Team', $team)
                ->where('deleted', '!=', 1)
                ->groupBy('FatherCode', 'ItemCode', 'Team', 'NextTeam')
                ->select(
                    'FatherCode',
                    'ItemCode',
                    'Team',
                    'NextTeam',
                    DB::raw('sum(Quantity) as Quantity')
                )->get();

            return $stockpending;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function soLuongTonThucTe($subItemCode, $team)
    {
        try {
            $data = NotireceiptTb::where('SubItemCode', $subItemCode)->where('team', $team)->sum('AwaitingQty');
            Log::info($data);
            return $data;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function getItemByItemCode($itemCode)
    {
        try {
            $ItemInfo = NotireceiptTb::where('ItemCode', $itemCode)
                ->select(
                    'ItemCode',
                    'ItemName',
                )
                ->first();
            return $ItemInfo;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function getNotificationNotireceipt($spDich, $itemCode, $team, $lsx)
    {
        try {
            $notification = DB::table('notireceipt_tb as a')
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
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    // Lấy danh sách trả lại
    public function getReturnNotireceipt($spDich, $itemCode, $team, $lsx)
    {
        try {
            $notification = DB::table('notireceipt_tb as a')
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
        } catch (\Throwable $th) {
            throw $th;
        }
    }
}
