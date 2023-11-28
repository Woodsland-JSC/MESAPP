<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Disability;
use App\Models\DisabilityDetail;
use App\Models\humiditys;
use App\Models\humidityDetails;
use Illuminate\Support\Facades\Validator;

class QCController extends Controller
{
    public function DanhGiaDoAm(Request $req)
    {
        $validator = Validator::make($req->all(), [
            'palletID' => 'required', // new UniqueOvenStatusRule
            'value' => 'integer|required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $data = $req->only(
            'palletID',
            'value',
        );
        humidityDetails::create(array_merge($data, ['created_by' => Auth::user()->id]));
        $res = humidityDetails::where('palletID', $req->palletID)->get();
        return response()->json(['message' => 'success', 'plandrying' => $res], 200);
    }
    public function HoanThanhDoAm(Request $req)
    {
        $validator = Validator::make($req->all(), [
            'palletID' => 'required', // new UniqueOvenStatusRule
            'rate' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $data = $req->only(
            'palletID',
            'rate',
        );
        $record = humiditys::create(array_merge($data, ['created_by' => Auth::user()->id]));
        humidityDetails::where('palletID', $req->palletID)->update(['ref_id' => $record->id]);
        return response()->json(['message' => 'success'], 200);
    }
    public function DanhGiaKT(Request $req)
    {
        $validator = Validator::make($req->all(), [
            'palletID' => 'required', // new UniqueOvenStatusRule
            'SLPallet' => 'required',
            'SLMO_TOP' => 'required',
            'SLCong' => 'required',
            'note' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $data = $req->only(
            'palletID',
            'SLPallet',
            'SLMO_TOP',
            'SLCong',
            'note',
        );
        DisabilityDetail::create(array_merge($data, ['created_by' => Auth::user()->id]));
        $res = DisabilityDetail::where('palletID', $req->palletID)->get();
        return response()->json(['message' => 'success', 'plandrying' => $res], 200);
    }
    public function HoanThanhKT(Request $req)
    {
        $validator = Validator::make($req->all(), [
            'palletID' => 'required', // new UniqueOvenStatusRule
            'rate' => 'required',
            'TotalMau' => 'required',
            'TLMoTop' => 'required',
            'TLCong' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $data = $req->only(
            'palletID',
            'TotalMau',
            'TLMoTop',
            'TLCong',
        );
        $record = Disability::create(array_merge($data, ['created_by' => Auth::user()->id]));
        DisabilityDetail::where('palletID', $req->palletID)->update(['refID' => $record->id]);
        return response()->json(['message' => 'success'], 200);
    }
}
