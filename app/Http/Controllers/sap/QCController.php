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
}
