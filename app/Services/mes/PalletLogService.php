<?php

namespace App\Services\mes;

use Auth;
use DB;
use Exception;
use Log;


class PalletLogService
{
    public function getLogsByFactory($params)
    {
        try {
            $palletLogs = DB::table('pallet_log as pl')
                ->join('users as u', 'u.id', '=', 'pl.user_id')
                ->join('pallets as p', 'p.palletID', '=', 'pl.palletId')
                ->join('plandryings as pdo', 'pdo.PlanID', '=', 'pl.old_plan')
                ->join('plandryings as pdn', 'pdn.PlanID', '=', 'pl.new_plan')
                ->where('pl.factory', '=', $params['factory'])
                ->where('pl.created_at', '>=', $params['fromDate'] . ' 00:00:00')
                ->where('pl.created_at', '<=', $params['toDate']. ' 23:59:59')
                ->orderByDesc('pl.created_at')
                ->select(
                    'pl.id',
                    'pl.type_log',
                    'pl.log_data',
                    'pl.created_at',
                    'pl.old_oven',
                    'pl.new_oven',
                    'u.username',
                    'u.first_name',
                    'u.last_name',
                    'p.Code',
                    'p.LyDo',
                    'p.QuyCach',
                    'pdo.Code as OldPlanCode',
                    'pdn.Code as NewPlanCode'
                )
                ->get();
            return $palletLogs;
        } catch (Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
