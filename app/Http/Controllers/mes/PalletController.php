<?php

namespace App\Http\Controllers\mes;

use App\Http\Controllers\Controller;
use DB;
use Exception;
use Illuminate\Http\Request;


class PalletController extends Controller
{
    public function getPalletReport(Request $request)
    {
        try {
            $factory = $request->query('factory');
            $fromDate = $request->query('fromDate');
            $toDate = $request->query('toDate');

            $data = DB::select(
                'SELECT
                    p.palletID,
                    p.Code,
                    p.LyDo,
                    p.QuyCach,
                    p.factory,
                    p.LoadedIntoKilnDate,
                    p.CompletedDate,
                    p.CompletedBy,
                    p.stacking_time,
                    u.username,
                    u.first_name,
                    u.last_name,
                    pld.Qty,
                    pld.Mass,
                    pl.Oven,
                    pl.Code as OvenCode
                FROM pallets p
                JOIN pallet_details pd ON pd.palletID = p.palletID
                JOIN plan_detail pld ON pld.pallet = p.palletID
                JOIN plandryings pl ON pld.PlanID = pl.PlanID
                JOIN users u ON u.id = p.CompletedBy
                WHERE p.CompletedDate BETWEEN ? AND ? 
                AND p.factory = ?',
                [$fromDate, $toDate, $factory]
            );
            return response()->json([
                'reports' => $data
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lấy Pallets có lỗi!'
            ], 500);
        }
    }
}
