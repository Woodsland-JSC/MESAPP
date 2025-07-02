<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pallet;
use App\Models\pallet_details;
use App\Models\planDryings;
use App\Models\plandetail;
use App\Models\humiditys;
use App\Models\Disability;
use App\Models\logchecked;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use App\Rules\UniqueOvenStatusRule;
use Carbon\Carbon;
use App\Models\Warehouse;
use App\Jobs\inventorytransfer;
use App\Jobs\UpdatePalletSAP;

class PlanController extends Controller
{
    // tạo kế hoạch sấy
    function pickOven(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'Oven' => ['required', new UniqueOvenStatusRule], // new UniqueOvenStatusRule
                'Reason' => 'required',
                'Method' => 'required',
                'Time' => 'required|integer'
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
            }
            $conDB = (new ConnectController)->connect_sap();
            // ghi nhận kế hoạch sấy vào hệ thống app
            DB::beginTransaction();
            $PlanData = $request->only(['Oven', 'Reason', 'Method', 'Time']);
            $PlanData['CreateBy'] = Auth::user()->id;
            $PlanData['plant'] = Auth::user()->plant;
            // $PlanData['PlanDate'] = Carbon::now()->addDays($request->input('Time'));
            $plandryings = planDryings::create($PlanData);

            // lock lò sấy
            $sql = 'Update  "@G_SAY3" set "U_status"=1 where "Code"=?';
            $stmt = odbc_prepare($conDB, $sql);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt, [$plandryings->Oven])) {
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }
            DB::commit();
            odbc_close($conDB);
            return response()->json($plandryings, 200);
        } catch (\Exception | QueryException $e) {
            DB::rollBack();
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // danh sách kế hoạch sấy
    function listPlan(Request $request)
    {
        $plans = DB::table('planDryings as a')
            ->join('users as b', 'a.CreateBy', '=', 'b.id')
            ->select('a.*')
            ->where('b.branch', '=', Auth::user()->branch)
            ->where('b.plant', '=', Auth::user()->plant)
            ->where('a.Status', '<>', '2')
            ->get();

        return response()->json($plans, 200);
    }

    //danh sách pallet chưa được assign
    // function listpallet(Request $request)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'reason' => 'required',
    //     ]);
    //     if ($validator->fails()) {
    //         return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
    //     }
    //     $pallets = DB::table('pallets as a')
    //         ->join('users as b', 'a.CreateBy', '=', 'b.id')
    //         ->leftJoin('plan_detail as c', 'a.palletID', '=', 'c.pallet')
    //         ->select('a.palletID', 'a.Code', 'a.MaLo', 'a.LyDo', 'a.QuyCach')
    //         ->where('b.plant', '=', Auth::user()->plant)
    //         ->whereNull('c.pallet');
    //     if ($request->reason == 'INDOOR') {
    //         $pallets = $pallets->where('LyDo', 'INDOOR')->orwhere('LyDo', 'XINDOOR')->get();
    //     } else if ($request->reason == 'OUTDOOR') {
    //         $pallets = $pallets->where('LyDo', 'OUTDOOR')->orwhere('LyDo', 'XOUTDOOR')->get();
    //     } else if ($request->reason === 'SU') {
    //         $pallets = $pallets->where('LyDo', 'SU')->get();
    //     } else {
    //         $pallets = $pallets->where('LyDo', 'SL')->get();
    //     }

    //     return response()->json($pallets, 200);
    // }

    function listpallet(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }
        $pallets = DB::table('pallets as a')
            ->join('users as b', 'a.CreateBy', '=', 'b.id')
            ->leftJoin('plan_detail as c', 'a.palletID', '=', 'c.pallet')
            ->select('a.palletID', 'a.Code', 'a.MaLo', 'a.LyDo', 'a.QuyCach')
            ->where('b.plant', '=', Auth::user()->plant)
            ->whereNull('c.pallet')
            ->where('a.activeStatus', '=', 0);
        if ($request->reason == 'INDOOR') {
            $pallets = $pallets->whereIn('LyDo', ['INDOOR', 'OUTDOOR'])->get();
        } else if ($request->reason == 'OUTDOOR') {
            $pallets = $pallets->whereIn('LyDo', ['INDOOR', 'OUTDOOR'])->get();
        } else if ($request->reason === 'SU') {
            $pallets = $pallets->where('LyDo', 'SU')->get();
        } else {
            $pallets = $pallets->where('LyDo', 'SL')->get();
        }

        return response()->json($pallets, 200);
    }

    //danh sách mẻ sấy có thể vào lò
    function listovens()
    {
        $pallets = DB::table('planDryings as a')
            ->join('users as b', 'a.CreateBy', '=', 'b.id')
            ->select('a.*')
            ->where('b.plant', '=', Auth::user()->plant)
            ->where('a.Status', 0)
            ->orwhere('a.Status', 1)
            ->get();
        return response()->json($pallets, 200);
    }

    //danh sách mẻ sấy có thể chay lo
    function ListRunOven()
    {
        $pallets = DB::table('planDryings as a')
            ->join('users as b', 'a.CreateBy', '=', 'b.id')
            ->select('a.*')
            ->where('b.plant', '=', Auth::user()->plant)
            ->where('a.Status', 2)
            ->get();
        return response()->json($pallets, 200);
    }

    //danh sách mẻ sấy có thể hoan thanh
    function Listcomplete()
    {
        $pallets = DB::table('planDryings as a')
            ->join('users as b', 'a.CreateBy', '=', 'b.id')
            ->select('a.*')
            ->where('b.plant', '=', Auth::user()->plant)
            ->where('a.Status', 3)
            ->get();
        return response()->json($pallets, 200);
    }

    //vào lò
    function productionBatch(Request $request)
    {
        $id = $request->input('PlanID');
        $pallet = $request->input('PalletID');
        $userID = Auth::user()->id;
        $currentTime = Carbon::now()->format('Y-m-d H:i:s');
        DB::beginTransaction();
        try {
            // Check if the referenced PlanID exists in the plandryings table
            $existingPlan = planDryings::where('PlanID', $id)->whereNotIn('status', [3, 4])->get();

            if (!$existingPlan) {
                throw new \Exception('Lò không hợp lệ.');
            }
            $existingPallet = plandetail::where('pallet', $pallet)->count();
            if ($existingPallet > 1) {
                throw new \Exception('Pallet đã được assign.');
            }
            $data = pallet_details::where('palletID', $pallet)->first();
            $quyCach = Pallet::where('PalletID', $pallet)->pluck('QuyCach')->unique()->first();
            $totalQty = pallet_details::where('palletID', $pallet)->sum('Qty_T');
            $totalMass = pallet_details::where('palletID', $pallet)->sum('Qty');

            plandetail::create([
                'PlanID' => $id,
                'pallet' => $pallet,
                'palletCode' => $data->ItemCode,
                'size' => $quyCach,
                'Qty' => $totalQty,
                'Mass' => $totalMass,
            ]);

            // Update Pallet table
            Pallet::where('palletID', $pallet)->update([
                'LoadedBy' => $userID,
                'LoadedIntoKilnDate' => $currentTime,
                'activeStatus' => 1,
            ]);

            $totalMass = plandetail::where('PlanID', $request->PlanID)
                ->sum('Mass');
            $totalPallet = plandetail::where('PlanID', $request->PlanID)
                ->count();

            planDryings::where('PlanID', $request->PlanID)
                ->update([
                    'Mass' => $totalMass,
                    'TotalPallet' => $totalPallet
                ]);

            DB::commit();
            $aggregateData = DB::table('plan_detail')->where('PlanID', $id)
                ->selectRaw('COUNT(*) as count, SUM(Mass) as sumMass')->first();

            planDryings::where('PlanID', $id)->update([
                // 'Status' => 1,
                'TotalPallet' => $aggregateData->count,
                'Mass' => $aggregateData->sumMass ?: 0,
            ]);

            return response()->json([
                'message' => 'successfully',
                [
                    'data' => $existingPlan,
                ],

            ], 200);
        } catch (\Exception | QueryException $e) {
            DB::rollBack();
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    //hoàn thành đánh giá
    function checkOven(Request $request)
    {
        try {
            DB::beginTransaction();
            $validator = Validator::make($request->all(), [
                'PlanID' => ['required',], // new UniqueOvenStatusRule

            ]);
            if ($validator->fails()) {
                return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
            }
            $id = $request->input('PlanID');
            $record = planDryings::where('PlanID', $id)->whereNotIn('status', [3, 4])->get();

            if ($record->count() > 0) {
                planDryings::where('PlanID', $id)->update(
                    [
                        // 'Status' => 2,
                        'Checked' => 1,
                        'CheckedBy' => Auth::user()->id,
                        'CT1' => 1,
                        'CT2' => 1,
                        'CT3' => 1,
                        'CT4' => 1,
                        'CT5' => 1,
                        'CT6' => 1,
                        'CT7' => 1,
                        'CT8' => 1,
                        'CT9' => 1,
                        'CT10' => 1,
                        'CT11' => 1,
                        'CT12' => 1,
                        'DateChecked' => now(),
                        'NoCheck' => $id
                    ]
                );

                // Fetch data for API request
                $data = DB::table('plan_detail as a')
                    ->join('pallets as b', 'a.pallet', '=', 'b.palletID')
                    ->select('DocEntry', 'pallet')
                    ->where('PlanID', $id)
                    ->distinct()
                    ->get();
                //update hàng loạt lệnh production orders sang plan
                foreach ($data as $entry) {
                    Pallet::where('palletID', $entry->pallet)->update(['flag' => 1]);
                }
                DB::commit();
                return response()->json(['message' => 'updated successfully', 'data' => $record]);
            } else {
                return response()->json(['error' => 'Lò không hợp lệ'], 404);
            }
        } catch (\Exception | QueryException $e) {
            DB::rollBack();
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    //chạy lò
    function runOven(Request $request)
    {
        try {
            DB::beginTransaction();
            $validator = Validator::make($request->all(), [
                'PlanID' => ['required',], // new UniqueOvenStatusRule

            ]);
            if ($validator->fails()) {
                return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
            }
            $id = $request->input('PlanID');
            $record = planDryings::where('PlanID', $id)->whereNotIn('status', [3, 4])->get();
            $detailrecord = plandetail::where('PlanID', $id)->count();
            $test = [];
            if ($detailrecord == 0) {
                return response()->json(['error' => 'số lượng pallet phải lớn hơn 0'], 500);
            }
            if ($record->count() > 0) {
                //chắc chắn lò có pallet

                planDryings::where('PlanID', $id)->update(
                    [
                        'Status' => 1,
                        'RunBy' => Auth::user()->id,
                        'runDate' => now()
                    ]
                );

                $results = planDryings::select(
                    'planDryings.Code as newbatch',
                    'pallets.palletID',
                    'pallets.DocEntry',
                    'pallet_details.ItemCode',
                    'pallet_details.WhsCode',
                    'pallet_details.Qty',
                    'pallet_details.CDai',
                    'pallet_details.CRong',
                    'pallet_details.CDay',
                    'pallet_details.BatchNum',
                    DB::raw('SUM(pallet_details.Qty) OVER (PARTITION BY pallets.palletID) AS TotalQty'),
                    'pallet_details.palletID'
                )
                    ->join('plan_detail', 'planDryings.PlanID', '=', 'plan_detail.PlanID')
                    ->join('pallets', 'plan_detail.pallet', '=', 'pallets.palletID')
                    ->join('pallet_details', 'pallets.palletID', '=', 'pallet_details.palletID')
                    ->where('planDryings.PlanID', $id)
                    ->get();

                $groupedResults = $results->groupBy('DocEntry');

                foreach ($groupedResults as $docEntry => $group) {

                    $data = [];
                    foreach ($group as $batchData) {
                        $data[] = [
                            "BatchNumber" => $batchData->BatchNum,
                            "Quantity" => $batchData->Qty,
                            "ItemCode" => $batchData->ItemCode,
                        ];
                    }

                    $header = $group->first();
                    Pallet::where('palletID', $header->palletID)->update([
                        'IssueNumber' => -1
                    ]);
                }

                DB::commit();
                return response()->json(['message' => 'updated successfully', 'data' => $record, 'send' => $test]);
            } else {
                return response()->json(['error' => 'Lò không hợp lệ'], 404);
            }
        } catch (\Exception | QueryException $e) {
            DB::rollBack();
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    //ra lò
    function completed(Request $request)
    {
        try {
            DB::beginTransaction();
            $validator = Validator::make($request->all(), [
                'PlanID' => 'required',
                'result' => 'required'
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
            }
            $id = $request->input('PlanID');
            $record = planDryings::where('PlanID', $id)->whereNotIn('status', [0, 2])->get();
            $towarehouse =  GetWhsCode(Auth::user()->plant, 'SS');
            if ($record->count() > 0) {
                planDryings::where('PlanID', $id)->update(
                    [
                        'Status' => 2,
                        'CompletedBy' => Auth::user()->id,
                        'CompletedDate' => now(),
                    ]
                );
                $results = planDryings::select(
                    'planDryings.Code as newbatch',
                    'planDryings.Oven',
                    'pallets.DocEntry',
                    'pallets.Code',
                    'pallets.palletID',
                    'pallets.palletSAP',
                    'pallet_details.ItemCode',
                    'pallet_details.WhsCode2',
                    'pallet_details.Qty',
                    'pallet_details.CDai',
                    'pallet_details.CRong',
                    'pallet_details.CDay',
                    'pallet_details.BatchNum',
                    DB::raw('SUM(pallet_details.Qty) OVER (PARTITION BY pallets.palletID) AS TotalQty'),
                    'pallet_details.palletID'
                )
                    ->join('plan_detail', 'planDryings.PlanID', '=', 'plan_detail.PlanID')
                    ->join('pallets', 'plan_detail.pallet', '=', 'pallets.palletID')
                    ->join('pallet_details', 'pallets.palletID', '=', 'pallet_details.palletID')
                    ->where('planDryings.PlanID', $id)
                    ->get();

                $groupedResults = $results->groupBy('DocEntry');

                $test = [];
                foreach ($groupedResults as $docEntry => $group) {
                    $data = [];
                    foreach ($group as $batchData) {
                        $data[] = [
                            "ItemCode" => $batchData->ItemCode,
                            "Quantity" => $batchData->Qty,
                            "WarehouseCode" =>  $towarehouse,
                            "FromWarehouseCode" => $batchData->WhsCode2,
                            "BatchNumbers" => [
                                [
                                    "BatchNumber" => $batchData->BatchNum,
                                    "Quantity" => $batchData->Qty,
                                    "U_Status" => $request->result
                                ]

                            ]
                        ];
                    };

                    $header = $group->first();

                    $body = [
                        "U_Pallet" => $header->Code,
                        "U_CreateBy" => Auth::user()->sap_id,
                        "BPLID" => Auth::user()->branch,
                        "Comments" => "WLAPP PORTAL tạo pallet xếp xấy",
                        "StockTransferLines" => $data
                    ];
                    inventorytransfer::dispatch($body);
                    UpdatePalletSAP::dispatch($header->palletSAP, $request->result);
                    $test[] = $body;
                }
                // ulock lò sấy
                $conDB = (new ConnectController)->connect_sap();
                $sql = 'Update  "@G_SAY3" set "U_status"=0 where "Code"=?';
                $stmt = odbc_prepare($conDB, $sql);
                if (!$stmt) {
                    throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
                }
                if (!odbc_execute($stmt, [$results->first()->Oven])) {
                    throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
                }
                DB::commit();
                return response()->json(['message' => 'updated successfully', 'data' => $record, 'send' => $test]);
            } else {
                return response()->json(['error' => 'Lò không hợp lệ'], 404);
            }
        } catch (\Exception | QueryException $e) {
            DB::rollBack();
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // chi tiết mẻ
    // function productionDetail($id)
    // {
    //     // Assuming Plandryings is your model for the plandryings table
    //     $plandrying = planDryings::with('details')
    //         ->where('PlanID', $id)
    //         ->first();
    //     $humiditys = humiditys::where('PlanID', $id)->get();
    //     $Disability = Disability::where('PlanID', $id)->get();
    //     $CT11Detail = logchecked::where('PlanID', $id)->select(
    //         'M1',
    //         'M2',
    //         'M3',
    //         'M4',
    //         'M5'
    //     )->get();
    //     $CT12Detail
    //         = logchecked::where('PlanID', $id)->select(
    //             'Q1',
    //             'Q2',
    //             'Q3',
    //             'Q4',
    //             'Q5',
    //             'Q6',
    //             'Q7',
    //             'Q8',
    //         )->get();
    //     if ($plandrying) {

    //         return response()->json(
    //             [
    //                 'plandrying' => $plandrying,
    //                 'Humidity' => $humiditys,
    //                 'Disability' => $Disability,
    //                 'CT11Detail' => $CT11Detail,
    //                 'CT12Detail' => $CT12Detail
    //             ]
    //         );
    //     } else {
    //         return response()->json(['error' => 'không tìm thấy thông tin'], 404);
    //     }
    // }

    function productionDetail($id)
    {
        $plandrying = PlanDryings::with(['details' => function ($query) {
            $query->join('pallets', 'plan_detail.pallet', '=', 'pallets.palletID')
                ->select('plan_detail.*', 'pallets.Code', 'pallets.LyDo');
        }])
            ->where('PlanID', $id)
            ->first();

        $humiditys = Humiditys::where('PlanID', $id)->get();
        $Disability = Disability::where('PlanID', $id)->get();
        $CT11Detail = Logchecked::where('PlanID', $id)->select(
            'M1',
            'M2',
            'M3',
            'M4',
            'M5'
        )->get();
        $CT12Detail = Logchecked::where('PlanID', $id)->select(
            'Q1',
            'Q2',
            'Q3',
            'Q4',
            'Q5',
            'Q6',
            'Q7',
            'Q8',
        )->get();

        if ($plandrying) {
            return response()->json([
                'plandrying' => $plandrying,
                'Humidity' => $humiditys,
                'Disability' => $Disability,
                'CT11Detail' => $CT11Detail,
                'CT12Detail' => $CT12Detail
            ]);
        } else {
            return response()->json(['error' => 'không tìm thấy thông tin'], 404);
        }
    }

    function singlecheckOven(Request $request)
    {
        $data = $request->only(
            'CT1',
            'CT2',
            'CT3',
            'CT4',
            'CT5',
            'CT6',
            'CT7',
            'CT8',
            'CT9',
            'CT10',
            'CT11',
            'CT12',
            'SoLan',
            'CBL',
            'DoThucTe'
        );
        $CT11Detail = $request->only('CT11Detail');
        $CT12Detail = $request->only('CT12Detail');

        $id = $request->PlanID;

        if ($CT11Detail) {
            logchecked::UpdateOrCreate(
                ['PlanID' => $id],
                array_merge($CT11Detail['CT11Detail'], ['PlanID' => $id])
            );
        };
        if ($CT12Detail) {
            logchecked::UpdateOrCreate(
                ['PlanID' => $id],
                array_merge($CT12Detail['CT12Detail'], ['PlanID' => $id])
            );
        }

        planDryings::where('PlanID', $id)->update(
            array_merge($data, ['CheckedBy' => Auth::user()->id])
        );
        $plandrying = planDryings::where('PlanID', $id)
            ->first();
        $CT11Detail = logchecked::where('PlanID', $id)->select(
            'M1',
            'M2',
            'M3',
            'M4',
            'M5'
        )->get();
        $CT12Detail
            = logchecked::where('PlanID', $id)->select(
                'Q1',
                'Q2',
                'Q3',
                'Q4',
                'Q5',
                'Q6',
                'Q7',
                'Q8',
            )->get();
        return response()->json([
            'message' => 'success',
            'plandrying' => $plandrying,
            'CT11Detail' => $CT11Detail,
            'CT12Detail' => $CT12Detail
        ], 200);
    }

    function removePallet(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'PlanID' => 'required', // new UniqueOvenStatusRule
            'PalletID' => 'integer|required',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        // Check if the oven is valid
        $check = planDryings::where('PlanID', $request->PlanID)->first();


        if ($check) {
            if ($check->Status == 0) {
                // Set 'LoadedBy' and 'LoadedIntoKilnDate' to null
                Pallet::where('palletID', $request->PalletID)
                    ->update([
                        'LoadedBy' => null,
                        'LoadedIntoKilnDate' => null,
                        'activeStatus' => 0,
                    ]);

                // Delete pallet detail
                plandetail::where('pallet', $request->PalletID)
                    ->where('PlanID', $request->PlanID)
                    ->delete();

                $totalMass = plandetail::where('PlanID', $request->PlanID)
                    ->sum('Mass');
                $totalPallet = plandetail::where('PlanID', $request->PlanID)
                    ->count();

                planDryings::where('PlanID', $request->PlanID)
                    ->update([
                        'Mass' => $totalMass,
                        'TotalPallet' => $totalPallet
                    ]);
            } else {
                return response()->json(['error' => 'Trạng thái lò không hợp lệ'], 501);
            }
        } else {
            return response()->json(['error' => 'Lò không tồn tại'], 501);
        }

        return response()->json(['message' => 'success'], 200);
    }
}
