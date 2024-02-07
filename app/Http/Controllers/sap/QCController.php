<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Disability;
use App\Models\DisabilityDetail;
use App\Models\humiditys;
use App\Models\humidityDetails;
use Illuminate\Support\Facades\Validator;
use App\Models\plandryings;
use App\Models\SanLuong;
use App\Models\QCHandle;
use App\Models\Warehouse;
use App\Models\LoaiLoi;
use App\Models\notireceipt;
use App\Models\HistorySL;
class QCController extends Controller
{
    public function DanhGiaDoAm(Request $req)
    {
        $validator = Validator::make($req->all(), [
            'PlanID' => 'required', // new UniqueOvenStatusRule
            'value' => 'integer|required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $data = $req->only(
            'PlanID',
            'value',
        );
        humidityDetails::create(array_merge($data, ['created_by' => Auth::user()->id]));
        $res = humidityDetails::where('PlanID', $req->PlanID)->where('refID', -1)->get();
        return response()->json(['message' => 'success', 'humiditys' => $res], 200);
    }
    function removeDoAm(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'PlanID' => 'required', // new UniqueOvenStatusRule
            'ID' => 'integer|required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        humidityDetails::where('id', $request->ID)->where('PlanID', $request->PlanID)->where('refID', -1)->delete();
        $res = humidityDetails::where('PlanID', $request->PlanID)->where('refID', -1)->get();
        return response()->json(['message' => 'success', 'humiditys' => $res], 200);
    }
    public function HoanThanhDoAm(Request $req)
    {
        $validator = Validator::make($req->all(), [
            'PlanID' => 'required',
            'rate' => 'required',
            'option' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $data = $req->only(
            'PlanID',
            'rate',
            'note'
        );
        $record = humiditys::create(array_merge($data, ['created_by' => Auth::user()->id]));
        humidityDetails::where('PlanID', $req->PlanID)->where('refID', -1)->update(['refID'  => $record->id]);
        // $res = humidityDetails::where('PlanID', $req->PlanID)->where('refID', -1)->get();
        if ($req->option == 'RL') {
            plandryings::where('PlanID', $req->PlanID)->update(['Review' => 1, 'result' => 0]);
        }
        if ($req->option == 'SL') {
            plandryings::where('PlanID', $req->PlanID)->update(['Review' => 1, 'result' => 1]);
        }
        return response()->json(['message' => 'success', 'humiditys' => $record], 200);
    }
    public function DanhGiaKT(Request $req)
    {
        $validator = Validator::make($req->all(), [
            'PlanID' => 'required', // new UniqueOvenStatusRule
            'SLPallet' => 'required',
            'SLMau' => 'required',
            'SLMoTop' => 'required',
            'SLCong' => 'required',
            'note' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $data = $req->only(
            'PlanID',
            'SLMau',
            'SLPallet',
            'SLMoTop',
            'SLCong',
            'note',
        );
        DisabilityDetail::create(array_merge($data, ['created_by' => Auth::user()->id]));
        $res = DisabilityDetail::where('PlanID', $req->PlanID)->where('refID', -1)->get();
        return response()->json(['message' => 'success', 'plandrying' => $res], 200);
    }
    function removeDisabledRecord(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'PlanID' => 'required', // new UniqueOvenStatusRule
            'ID' => 'integer|required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        humidityDetails::where('id', $request->ID)->where('PlanID', $request->PlanID)->where('refID', -1)->delete();
        $res = humidityDetails::where('PlanID', $request->PlanID)->where('refID', -1)->get();
        return response()->json(['message' => 'success', 'humiditys' => $res], 200);
    }
    public function HoanThanhKT(Request $req)
    {
        $validator = Validator::make($req->all(), [
            'PlanID' => 'required',
            'TotalMau' => 'required',
            'TLMoTop' => 'required',
            'TLCong' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $data = $req->only(
            'PlanID',
            'TotalMau',
            'TLMoTop',
            'TLCong',
        );
        $record = Disability::create(array_merge($data, ['created_by' => Auth::user()->id]));
        DisabilityDetail::where('PlanID', $req->PlanID)->where('refID', -1)->update(['refID' => $record->id]);
        return response()->json(['message' => 'success', 'disability' => $record], 200);
    }

    public function getHumidListById(Request $req)
    {
        if (!$req->filled('PlanID')) {
            return response()->json(['error' => 'Missing PlanID parameter.'], 422);
        }

        $humiditysData = DB::table('humiditys')
            ->where('PlanID', $req->PlanID)
            ->get();

        $res = [];

        foreach ($humiditysData as $humidity) {
            $humidityDetails = DB::table('humiditys_detail')
                ->where('refID', $humidity->id)
                ->get();

            $res[] = [
                'id' => $humidity->id,
                'PlanID' => $humidity->PlanID,
                'rate' => $humidity->rate,
                'note' => $humidity->note,
                'created_by' => $humidity->created_by,
                'created_at' => $humidity->created_at,
                'detail' => $humidityDetails->toArray(),
            ];
        }

        return response()->json($res, 200);
    }

    public function getDisabledListById(Request $req)
    {
        if (!$req->filled('PlanID')) {
            return response()->json(['error' => 'Missing PlanID parameter.'], 422);
        }

        $disabilityData = DB::table('disability_rates')
            ->where('PlanID', $req->PlanID)
            ->get();

        $res = [];

        foreach ($disabilityData as $disability) {
            $disabilityDetails = DB::table('disability_rates_detail')
                ->where('refID', $disability->id)
                ->get();

            $res[] = [
                'id' => $disability->id,
                'PlanID' => $disability->PlanID,
                'TotalMau' => $disability->TotalMau,
                'TLMoTop' => $disability->TLMoTop,
                'TLCong' => $disability->TLCong,
                'created_by' => $disability->created_by,
                'created_at' => $disability->created_at,
                'detail' => $disabilityDetails->toArray(),
            ];
        }

        return response()->json($res, 200);
    }

    public function currentData(Request $req)
    {
        $result = DB::table('planDryings as a')
            ->join('users as b', 'a.CreateBy', '=', 'b.id')
            ->join('plants as c', 'b.plant', '=', 'c.Code')
            ->where('a.PlanID', $req->PlanID)
            ->select('c.Name', 'a.Oven')
            ->first();
        if ($req->Type == 'DA') {
            $temp =  humidityDetails::where('PlanID', $req->PlanID)->where('refID', -1)->get();
        } else {
            $temp =  DisabilityDetail::where('PlanID', $req->PlanID)->where('refID', -1)->get();
        }

        $header = [
            'Date' => now()->format('Y-m-d'),
            'PlanID' => $req->PlanID,
            'Factory' => $result->Name,
            'Oven' => $result->Oven,
            'TempData' => $temp,
            'No' => 135234
        ];
        return response()->json($header, 200);
    }
    public function loailoi()
    {
        $data = LoaiLoi::get(['id', 'name']);
        return response()->json($data, 200);
    }
    function huongxuly(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'type' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $data = QCHandle::where('type', $request->type)->get(['id', 'name']);
        return response()->json($data, 200);
    }
    function listConfirm(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'TO' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $toQC = "";
        switch (Auth()->user()->plant) {
            case 'TH':
                $toQC = 'TH-QC';
                break;
            case 'HG':
                $toQC = 'HG-QC';
                break;
            case 'TQ':
                $toQC = 'TQ-QC';
                break;
        }

        $data =DB::table('sanluong as a')
                ->join('notireceipt as b', function ($join) {
                    $join->on('a.id', '=', 'b.baseID')
                        ->where('b.deleted', '=', 0);
                })
                ->join('users as c', 'a.create_by', '=', 'c.id')
                ->select(
                    'a.FatherCode',
                    'a.ItemCode',
                    'a.ItemName',
                    'a.team',
                    'a.CongDoan',
                    'CDay',
                    'CRong',
                    'CDai',
                    'b.Quantity',
                    'a.created_at',
                    'c.first_name',
                    'c.last_name',
                    'b.text',
                    'b.id',
                    DB::raw('0 as type'),
                    'b.confirm'
                )
                ->where('b.confirm', '=', 0)
                ->where('b.type', 1)
                ->where('b.team', '=',  $toQC)
                ->where('a.team', '=',  $request->TO)
                ->get();
                return response()->json([
                    'data' => $data,
                ], 200);
    }
    function listToExclQC()
    {
        $conDB = (new ConnectController)->connect_sap();

        $query = 'select "VisResCode" "Code","ResName" "Name", Case when "U_QC"= ? then true else false end QC from "ORSC" A JOIN "RSC4" B ON A."VisResCode"=b."ResCode"
        join OHEM C ON B."EmpID"=C."empID" where c."empID" =? AND "validFor"=? and "U_QC"<> ?';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, ['Y', Auth::user()->sap_id,'Y','Y'])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $row['QC'] = $row['QC'] === '0' ? false : true;
            $results[] = $row;
        }
        odbc_close($conDB);
        return response()->json($results, 200);
    }
    function acceptTeamQCCBG(Request $request)
    {
        $warehouse="";
                if($data->NextTeam='TH-QC')
                {
                    $warehouse= $this ->getQCWarehouseByUser('TH');
                }
                else if($data->NextTeam='TQ-QC')
                {
                    $warehouse= $this ->getQCWarehouseByUser('TQ');
                }
                else
                {
                    $warehouse= $this ->getQCWarehouseByUser('HG');
                }
                if($warehouse==99)
                {
                    throw new \Exception('Không tìm thấy kho QC');
                }
                $loailoi= $request->loailoi['label'];
                $huongxuly= $request->huongxuly['label'];
                $teamBack= $request->teamBack['value']??'';
                $rootCause= $request->rootCause['value']??'';
                $subCode= $request->subCode ??'';

                $HistorySL=HistorySL::where('ObjType',59)->get()->count();
                $body = [
                    "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                    "U_LSX"=> $data->LSX,
                    "U_TO"=> $data->Team,
                    "U_LL"=> $loailoi,
                    "U_HXL"=> $huongxuly,
                    "U_QCC"=> $huongxuly,
                    "U_TOCD"=> $teamBack,
                    "U_source"=>$rootCause,
                    "U_ItemHC"=>$subCode,

                    "U_QCN"=> $data->FatherCode."-".$data->Team."-".str_pad($HistorySL+1, 4, '0', STR_PAD_LEFT),
                    "DocumentLines" => [[
                        "Quantity" => $data->RejectQty,
                        "ItemCode" =>   $data->ItemCode,
                       // "BaseLine" => 0,
                        "WarehouseCode" =>  $warehouse,
                        //"BaseEntry" => $allocate['DocEntry'],
                        //"BaseType" => 202,
                        "BatchNumbers" => [
                            [
                                "BatchNumber" => now()->format('YmdHmi'),
                                "Quantity" =>  $data->RejectQty,
                                "ItemCode" =>   $data->ItemCode,
                                "U_CDai" => $data->CDai,
                                "U_CRong" => $data->CRong,
                                "U_CDay" =>  $data->CDay,
                                "U_Status" => "HL",
                                "U_TO"=> $data->Team,
                                "U_LSX"=> $data->LSX,
                                "U_Year"=> $request->year??now()->format('y'),
                                "U_Week"=> $request->week?str_pad($request->week,2, '0', STR_PAD_LEFT):str_pad(now()->weekOfYear, 2, '0', STR_PAD_LEFT)
                            ]
                        ]
                    ]]
                ];
                $response = Http::withOptions([
                    'verify' => false,
                ])->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'Authorization' => 'Basic ' . BasicAuthToken(),
                ])->post(UrlSAPServiceLayer() . '/b1s/v1/InventoryGenEntries', $body);
                $res = $response->json();
                if ($response->successful()) {
                    SanLuong::where('id', $data->id)->update(
                        [
                            'Status' => 1,
                            // 'ObjType' =>   59,
                            // 'DocEntry' => $res['DocEntry']
                        ]
                    );
                    notireceipt::where('id', $request->id)->
                    update(['confirm' => 1,
                    'ObjType' =>  59,
                    'DocEntry' => $res['DocEntry'],
                    'confirmBy' => Auth::user()->id,
                    'confirm_at' => now()->format('YmdHmi')]);
                    HistorySL::create(
                        [
                        'LSX'=>$data->LSX,
                        'itemchild'=>$data->ItemCode,
                        'to' => $data->Team,
                        'quantity'=>$data->RejectQty,
                        'ObjType'=>59,
                        'DocEntry'=>$res['DocEntry'],
                        'SPDich'=>$data->FatherCode,
                        'LL'=> $loailoi,
                        'HXL'=>$huongxuly
                        ],
                        
                    );
                    DB::commit();
                    return response()->json('success', 200);

                } else {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Failed receipt',
                        'error' => $res['error'],
                        'body' => $body
                    ], 500);
                }
    }
}
