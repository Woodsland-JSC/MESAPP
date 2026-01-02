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
use App\Services\HanaService;
use App\Services\OvenService;
use Exception;

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
            ->where('b.plant', '=', Auth::user()->plant);

        if ($request->filled('status')) {
            $status = $request->input('status');
            if (is_array($status)) {
                $plans->whereIn('a.Status', $status);
            } else {
                $plans->where('a.Status', '=', $status);
            }
        }

        if ($request->filled('isLoaded')) {
            if ($request->input('isLoaded') != 0) {
                $plans->where('a.TotalPallet', '>', 0);
            } else {
                $plans->where('a.TotalPallet', '<=', 0);
            }
        }

        if ($request->filled('isChecked')) {
            $plans->where('a.Checked', '=', $request->input('isChecked'));
        }

        if ($request->filled('isReviewed')) {
            $plans->where('a.Review', '=', $request->input('isReviewed'));
        }

        return response()->json($plans->get(), 200);
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
            ->join('pallet_details as pd', 'a.palletID', '=', 'pd.palletID')
            ->leftJoin('plan_detail as c', 'a.palletID', '=', 'c.pallet')
            ->select('a.palletID', 'a.Code', 'a.MaLo', 'a.LyDo', 'a.QuyCach', 'pd.Qty_T', 'a.old_pallet_code')
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
            if ($existingPallet > 0) {
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
                        'IssueNumber' => -1,
                        'RanBy' => Auth::user()->id,
                        'RanDate' => now(),
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
                return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
            }
            $id = $request->input('PlanID');
            $record = planDryings::where('PlanID', $id)->whereNotIn('status', [0, 2])->get();
            $towarehouse =  GetWhsCode(Auth::user()->plant, 'SS');

            if ($record->count() > 0) {
                $plan = planDryings::query()->where('PlanID', $id)->first();

                if ($plan == null) {
                    return response()->json([
                        'error' => false,
                        'status_code' => 500,
                        'message' => 'Không tìm thấy kế hoạch sấy'
                    ], 500);
                }

                $plan->update([
                    'Status' => 2,
                    'CompletedBy' => Auth::user()->id,
                    'CompletedDate' => now(),
                ]);

                $results = planDryings::select(
                    'planDryings.Code as newbatch',
                    'planDryings.Oven',
                    'pallets.DocEntry',
                    'pallets.Code',
                    'pallets.palletID',
                    'pallets.palletSAP',
                    'pallets.CompletedBy',
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
                    ->whereNull('pallets.CompletedBy')
                    ->get();

                if ($results->count() > 0) {
                    return response()->json([
                        'error' => false,
                        'status_code' => 500,
                        'message' => 'Vẫn còn pallet chưa được ra lò.'
                    ], 500);
                }


                // ulock lò sấy
                $conDB = (new ConnectController)->connect_sap();
                $sql = 'Update  "@G_SAY3" set "U_status"=0 where "Code"=?';
                $stmt = odbc_prepare($conDB, $sql);
                if (!$stmt) {
                    throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
                }
                if (!odbc_execute($stmt, [$plan->Oven])) {
                    throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
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

    //ra lò
    function completedSL(Request $request)
    {
        try {
            DB::beginTransaction();
            $validator = Validator::make($request->all(), [
                'PlanID' => 'required',
                'result' => 'required'
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
            }
            $id = $request->input('PlanID');
            $record = planDryings::where('PlanID', $id)->whereNotIn('status', [0, 2])->get();

            $team = $request->team;

            if (!$team) {
                return response()->json([
                    'error' => false,
                    'status_code' => 500,
                    'message' => 'Chưa có tổ sản xuất'
                ], 500);
            }

            if ($record->count() > 0) {
                $plan = planDryings::query()->where('PlanID', $id)->first();

                if ($plan == null) {
                    return response()->json([
                        'error' => false,
                        'status_code' => 500,
                        'message' => 'Không tìm thấy kế hoạch sấy'
                    ], 500);
                }

                $plan->update([
                    'Status' => 2,
                    'CompletedBy' => Auth::user()->id,
                    'CompletedDate' => now(),
                ]);

                $results = planDryings::select(
                    'planDryings.Code as newbatch',
                    'planDryings.Oven',
                    'pallets.DocEntry',
                    'pallets.Code',
                    'pallets.palletID',
                    'pallets.palletSAP',
                    'pallets.CompletedBy',
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
                    ->whereNull('pallets.CompletedBy')
                    ->get();

                $groupedResults = $results->groupBy('DocEntry');

                foreach ($groupedResults as $docEntry => $group) {
                    $data = [];
                    foreach ($group as $batchData) {
                        $data[] = [
                            "ItemCode" => $batchData->ItemCode,
                            "Quantity" => $batchData->Qty,
                            "WarehouseCode" =>  $team['value'],
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

                    Pallet::where('palletID', $header->palletID)->update([
                        'IssueNumber' => -1,
                        'CompletedBy' => Auth::user()->id,
                        'CompletedDate' => now(),
                    ]);

                    $body = [
                        "U_Pallet" => $header->Code,
                        "U_CreateBy" => Auth::user()->sap_id,
                        "BPLID" => Auth::user()->branch,
                        "Comments" => "WLAPP PORTAL điều chuyển pallet ra lò sấy lại",
                        "StockTransferLines" => $data
                    ];
                    inventorytransfer::dispatch($body);
                    UpdatePalletSAP::dispatch($header->palletSAP, $request->result);
                }

                // ulock lò sấy
                $conDB = (new ConnectController)->connect_sap();
                $sql = 'Update  "@G_SAY3" set "U_status"=0 where "Code"=?';
                $stmt = odbc_prepare($conDB, $sql);
                if (!$stmt) {
                    throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
                }
                if (!odbc_execute($stmt, [$plan->Oven])) {
                    throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
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

    function productionDetail($id)
    {
        $plandrying = PlanDryings::with(['details' => function ($query) {
            $query->join('pallets', 'plan_detail.pallet', '=', 'pallets.palletID')
                ->select('plan_detail.*', 'pallets.Code', 'pallets.LyDo', 'pallets.CompletedBy');
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

        // dd(array_keys($plandrying->getAttributes()));

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
        return DB::transaction(function () use ($request) {
            $id = $request->input('PlanID');

            // Chỉ lấy các field liên quan planDryings
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

            $checkCount = $request->count;

            // LỌC: Loại bỏ các giá trị null để tránh overwrite bằng null
            $planUpdate = collect($data)
                ->filter(fn($v) => !is_null($v))   // giữ lại 0, "", false… chỉ bỏ null
                ->toArray();

            // Luôn set người kiểm tra
            $planUpdate['CheckedBy'] = Auth::id();

            // Chỉ update nếu còn gì để update
            if (count($planUpdate) > 0) {
                planDryings::where('PlanID', $id)->update($planUpdate);
            }

            // CT11Detail
            if ($request->filled('CT11Detail')) {
                $ct11 = collect($request->input('CT11Detail', []))
                    ->filter(fn($v) => !is_null($v))
                    ->toArray();

                if (!empty($ct11)) {
                    logchecked::updateOrCreate(
                        ['PlanID' => $id],
                        array_merge($ct11, ['PlanID' => $id])
                    );
                }
            }

            // CT12Detail
            if ($request->filled('CT12Detail')) {
                $ct12 = collect($request->input('CT12Detail', []))
                    ->filter(fn($v) => !is_null($v))
                    ->toArray();

                if (!empty($ct12)) {
                    logchecked::updateOrCreate(
                        ['PlanID' => $id],
                        array_merge($ct12, ['PlanID' => $id])
                    );
                }
            }

            $plandrying = planDryings::where('PlanID', $id)->first();

            $CT11Detail = logchecked::where('PlanID', $id)
                ->select('M1', 'M2', 'M3', 'M4', 'M5')
                ->get();

            $CT12Detail = logchecked::where('PlanID', $id)
                ->select('Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8')
                ->get();

            if ($checkCount == 12) {
                $plandrying->update(
                    [
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
            }

            DB::commit();

            return response()->json([
                'message'    => 'success',
                'plandrying' => $plandrying,
                'CT11Detail' => $CT11Detail,
                'CT12Detail' => $CT12Detail,
            ], 200);
        });
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

    public function completeByPallets(Request $request, ConnectController $connectController)
    {
        $validator = Validator::make($request->all(), [
            'planId' => 'required',
            'result' => 'required',
            'palletIds' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Thiếu dữ liệu ra lò.'], 500);
        }

        $palletIds = $request->palletIds;

        if (count($palletIds) == 0) {
            return response()->json(['error' => 'Thiếu dữ liệu pallets.'], 500);
        }

        try {
            DB::beginTransaction();
            $towarehouse =  GetWhsCode(Auth::user()->plant, 'SS');

            if(!$towarehouse || $towarehouse == '-1'){
                return response()->json(['error' => 'Không xác định được kho điều chuyển.'], 500);
            }

            $planId = $request->input('planId');
            $planDrying = planDryings::where('PlanID', $planId)->whereNotIn('status', [0, 2])->get();
            $result = $request->result;
            $palletIds = $request->palletIds;

            if ($planDrying->count() > 0) {
                Pallet::whereIn('palletID', $palletIds)->update([
                    'IssueNumber' => -1,
                    'CompletedBy' => Auth::user()->id,
                    'CompletedDate' => now(),
                ]);

                $dataPallets = planDryings::select([
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
                ])
                    ->join('plan_detail', 'planDryings.PlanID', '=', 'plan_detail.PlanID')
                    ->join('pallets', 'plan_detail.pallet', '=', 'pallets.palletID')
                    ->join('pallet_details', 'pallets.palletID', '=', 'pallet_details.palletID')
                    ->where('planDryings.PlanID', $planId)
                    ->whereIn('pallets.palletID', $palletIds)
                    ->get();

                $groupedData = $dataPallets->groupBy('DocEntry');

                foreach ($groupedData as $docEntry => $group) {
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
                                    "U_Status" => $result
                                ]
                            ]
                        ];
                    };

                    $header = $group->first();

                    $body = [
                        "U_Pallet" => $header->Code,
                        "U_CreateBy" => Auth::user()->sap_id,
                        "BPLID" => Auth::user()->branch,
                        "Comments" => "WLAPP PORTAL điều chuyển pallet ra lò",
                        "StockTransferLines" => $data
                    ];
                    inventorytransfer::dispatch($body);
                    UpdatePalletSAP::dispatch($header->palletSAP, $request->result);
                }

                DB::commit();
                return response()->json(['success' => 'Ra lò pallets thành công!']);
            } else {
                return response()->json(['error' => 'Lò không hợp lệ'], 500);
            }
        } catch (Exception) {
            DB::rollBack();
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => 'Lỗi khi xử lý ra lò'
            ], 500);
        }
    }

    public function completeByPalletsSL(Request $request, ConnectController $connectController, HanaService $hanaService, OvenService $ovenService)
    {
        $validator = Validator::make($request->all(), [
            'planId' => 'required',
            'result' => 'required',
            'palletIds' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Thiếu dữ liệu ra lò.'], 500);
        }

        $palletIds = $request->palletIds;

        if (count($palletIds) == 0) {
            return response()->json(['error' => 'Thiếu dữ liệu pallets.'], 500);
        }

        try {
            DB::beginTransaction();

            $planId = $request->input('planId');
            $planDrying = planDryings::where('PlanID', $planId)->whereNotIn('status', [0, 2])->get();
            $result = $request->result;
            $palletIds = $request->palletIds;

            if ($planDrying->count() > 0) {
                Pallet::whereIn('palletID', $palletIds)->update([
                    'IssueNumber' => -1,
                    'CompletedBy' => Auth::user()->id,
                    'CompletedDate' => now(),
                ]);

                $SQL_TEAM_CBG = <<<SQL
                    SELECT
                        A."VisResCode" AS "Code",
                        A."ResName" AS "Name",
                        A."U_CDOAN" AS "CongDoan",
                        A."U_FAC" AS "Factory",
                        A."U_KHOI",
                        D."WhsCode"
                    FROM "ORSC" A
                    JOIN "RSC4" B ON A."VisResCode" = b."ResCode"
                    JOIN OHEM C ON B."EmpID" = C."empID"
                    JOIN RSC1 D ON D."ResCode" = A."VisResCode"
                    WHERE A."U_FAC" = ? AND A."U_KHOI" = 'CBG' AND A."U_QC" = 'N' AND B."EmpID" = ?  AND D."Locked" = 'N' 
                    GROUP BY A."VisResCode",
                        A."ResName",
                        A."U_CDOAN",
                        A."U_FAC",
                        A."U_KHOI",
                        D."WhsCode"
                    ORDER BY A."ResName";
                SQL;

                $team = $hanaService->selectOne($SQL_TEAM_CBG, [Auth::user()->plant, Auth::user()->sap_id]);

                if (!$team) {
                    return response()->json(['error' => 'Không tìm thấy tổ theo người thao tác.'], 500);
                }

                $towarehouse = $team['WhsCode'];

                $dataPallets = planDryings::select([
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
                ])
                    ->join('plan_detail', 'planDryings.PlanID', '=', 'plan_detail.PlanID')
                    ->join('pallets', 'plan_detail.pallet', '=', 'pallets.palletID')
                    ->join('pallet_details', 'pallets.palletID', '=', 'pallet_details.palletID')
                    ->where('planDryings.PlanID', $planId)
                    ->whereIn('pallets.palletID', $palletIds)
                    ->get();

                $groupedData = $dataPallets->groupBy('DocEntry');

                foreach ($groupedData as $docEntry => $group) {
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
                                    "U_Status" => $result
                                ]
                            ]
                        ];
                    };

                    $header = $group->first();

                    $body = [
                        "U_Pallet" => $header->Code,
                        "U_CreateBy" => Auth::user()->sap_id,
                        "BPLID" => Auth::user()->branch,
                        "Comments" => "WLAPP PORTAL điều chuyển pallet ra lò",
                        "StockTransferLines" => $data
                    ];
                    inventorytransfer::dispatch($body);
                    UpdatePalletSAP::dispatch($header->palletSAP, $request->result);
                }

                $results = planDryings::select(
                    'planDryings.Code as newbatch',
                    'planDryings.Oven',
                    'pallets.DocEntry',
                    'pallets.Code',
                    'pallets.palletID',
                    'pallets.palletSAP',
                    'pallets.CompletedBy',
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
                    ->where('planDryings.PlanID', $planId)
                    ->whereNull('pallets.CompletedBy')
                    ->get();

                if ($results->count() == 0) {
                    $plan = planDryings::query()->where('PlanID', $planId)->first();

                    $plan->update([
                        'Status' => 2,
                        'CompletedBy' => Auth::user()->id,
                        'CompletedDate' => now(),
                    ]);

                    $ovenService->unlockOven($plan->Oven);
                }

                DB::commit();
                return response()->json(['success' => 'Ra lò pallets thành công!']);
            } else {
                return response()->json(['error' => 'Lò không hợp lệ'], 500);
            }
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => 'Lỗi khi xử lý ra lò',
                'detail' => $e->getMessage()
            ], 500);
        }
    }
}
