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
use App\Models\planDryings;
use App\Models\awaitingstocks;
use App\Models\awaitingstocksvcn;
use App\Models\SanLuong;
use App\Models\notireceipt;
use App\Models\notireceiptvcn;
use App\Models\HistorySL;
use App\Models\historySLVCN;
use App\Jobs\issueProduction;
use App\Jobs\HistoryQC;
use Illuminate\Support\Facades\Http;

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
            planDryings::where('PlanID', $req->PlanID)->update([
                'Review' => 1,
                'ReviewBy' => Auth::user()->id,
                'reviewDate' => now(),
                'result' => 0
            ]);
        }
        if ($req->option == 'SL') {
            planDryings::where('PlanID', $req->PlanID)->update(['Review' => 1, 'result' => 1]);
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

    // To be deleted
    public function loailoi(Request $request)
    {
        try {
            $conDB = (new ConnectController)->connect_sap();
            $query = 'select "Code" "id", "Name" "name" from "@V_LLVCN" where "U_ObjType" = ?';
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt, ['CBG'])) {
                // Handle execution error
                // die("Error executing SQL statement: " . odbc_errormsg());
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }
            $results = array();
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }
            $data = $results;
            odbc_close($conDB);
            return response()->json($data, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    function huongxuly(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'type' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }

        try {
            $conDB = (new ConnectController)->connect_sap();
            $query = 'select "Code" "id", "Name" "name" from "@V_HXLVCN" where "U_ObjType" = ?';
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt, [$request->type])) {
                // Handle execution error
                // die("Error executing SQL statement: " . odbc_errormsg());
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }
            $results = array();
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }
            $data = $results;
            odbc_close($conDB);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }


        return response()->json($data, 200);
    }

    // Danh sách lỗi gửi về QC theo tổ báo lỗi cho CBG.
    function listConfirm(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'TO' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return 
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

        // Danh sách lỗi chờ xử lý
        $data = DB::table('sanluong as a')
            ->join('notireceipt as b', function ($join) {
                $join->on('a.id', '=', 'b.baseID')
                    ->where('b.deleted', '=', 0);
            })
            ->join('users as c', 'a.create_by', '=', 'c.id')
            ->select(
                'a.FatherCode',
                'a.ItemCode',
                'a.ItemName',
                'b.SubItemName',
                'b.SubItemCode',
                'b.ErrorData',
                'a.team',
                'a.CongDoan',
                'a.CDay',
                'a.CRong',
                'a.CDai',
                DB::raw('(b.openQty - (
                SELECT COALESCE(SUM(quantity), 0) 
                FROM historySL 
                WHERE itemchild = CASE WHEN b.SubItemCode IS NOT NULL THEN b.SubItemCode ELSE b.ItemCode END
                AND isQualityCheck = 1
                AND notiId = b.id                
            )) as Quantity'),
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
            ->havingRaw('Quantity > 0')
            ->get();

        // dd($data);

        $conDB = (new ConnectController)->connect_sap();

        // Loại lỗi
        $query_01 = 'select "Code" "id", "Name" "name", "U_Type" from "@V_LLVCN" where "U_ObjType" = ?';
        $stmt_01 = odbc_prepare($conDB, $query_01);
        if (!$stmt_01) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt_01, ['CBG'])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $errorType = array();
        while ($row = odbc_fetch_array($stmt_01)) {
            $errorType[] = $row;
        }

        //Hướng xử lý
        $query_02 = 'select "Code" "id", "Name" "name" from "@V_HXLVCN" where "U_ObjType" = ?';
        $stmt_02 = odbc_prepare($conDB, $query_02);
        if (!$stmt_02) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt_02, ['CBG'])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $solution = array();
        while ($row = odbc_fetch_array($stmt_02)) {
            $solution[] = $row;
        }

        // Tổ chuyển về
        $query_03 = 'select "VisResCode" "Code","ResName" "Name" 
        from "ORSC" where "U_QC" =? AND "validFor"=? and "U_FAC"=?;';
        $stmt_03 = odbc_prepare($conDB, $query_03);
        if (!$stmt_03) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt_03, ['N', 'Y', Auth::user()->plant])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $teamBack = array();
        while ($row = odbc_fetch_array($stmt_03)) {
            $teamBack[] = $row;
        }

        // Nguồn lỗi
        $rootCause = [
            [
                'id' => 'C',
                'name' => 'Lỗi đầu vào (Mã con)'
            ],
            [
                'id' => 'P',
                'name' => 'Lỗi đầu ra (Mã cha)'
            ],
        ];

        // Mã hạ cấp
        $query_04 = 'select "ItemCode", "ItemName", "U_CDay", "U_CRong", "U_CDai" from OITM where U_CDOAN IN (?,?)';
        $stmt_04 = odbc_prepare($conDB, $query_04);
        if (!$stmt_04) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt_04, ['TC', 'SC'])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $returnCode = array();

        while ($row = odbc_fetch_array($stmt_04)) {
            $itemCode = $row['ItemCode'];
            $itemName = $row['ItemName'];
            $uCDay = $row['U_CDay'];
            $uCRong = $row['U_CRong'];
            $uCDai = $row['U_CDai'];

            // Tạo chuỗi kích thước "U_CDayxU_CRongxU_CDai"
            $sizeString = $uCDay . 'x' . $uCRong . 'x' . $uCDai;

            // Nối chuỗi kích thước vào sau ItemName
            $itemNameWithSize = $itemName . ' ' . $sizeString;

            // Thêm kết quả vào mảng returnCode
            $returnCode[] = [
                'ItemCode' => $itemCode,
                'ItemName' => $itemNameWithSize
            ];
        }

        odbc_close($conDB);
        return response()->json([
            'data' => $data,
            'errorType' => $errorType,
            'rootCause' => $rootCause,
            'teamBack' => $teamBack,
            'solution' => $solution,
            'returnCode' => $returnCode
        ], 200);
    }

    // Danh sách lỗi gửi về QC theo tổ báo lỗi cho VCN.
    function listConfirmVCN(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'TO' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return 
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

        $data = DB::table('notireceiptVCN as a')
            ->join('users as b', 'a.CreatedBy', '=', 'b.id')
            ->select(
                'a.FatherCode',
                'a.ItemCode',
                'a.ItemName',
                'a.SubItemName',
                'a.SubItemCode',
                'a.ErrorData',
                'a.team',
                'a.CongDoan',
                'a.CDay',
                'a.CRong',
                'a.CDai',
                DB::raw('(a.openQty - (
                SELECT COALESCE(SUM(quantity), 0) 
                FROM historySLVCN 
                WHERE itemchild = CASE WHEN a.SubItemCode IS NOT NULL THEN a.SubItemCode ELSE a.ItemCode END
                AND isQualityCheck = 1
                AND notiId = a.id                
            )) as Quantity'),
                'a.created_at',
                'b.first_name',
                'b.last_name',
                'a.text',
                'a.id',
                // DB::raw('0 as type'),
                // 'a.confirm'
            )
            ->where('a.deleted', '=', 0)
            ->where('a.confirm', '=', 0)
            ->where('a.type', 1)
            // ->where('a.team', '=',  $toQC)
            ->where('a.team', '=',  $request->TO)
            ->havingRaw('Quantity > 0')
            ->get();

        // dd($data);
        $conDB = (new ConnectController)->connect_sap();

        // Loại lỗi
        $query_01 = 'select "Code" "id", "Name" "name", "U_Type" from "@V_LLVCN" where "U_ObjType" = ?';
        $stmt_01 = odbc_prepare($conDB, $query_01);
        if (!$stmt_01) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt_01, ['VCN'])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $errorType = array();
        while ($row = odbc_fetch_array($stmt_01)) {
            $errorType[] = $row;
        }

        //Hướng xử lý
        $query_02 = 'select "Code" "id", "Name" "name" from "@V_HXLVCN" where "U_ObjType" = ?';
        $stmt_02 = odbc_prepare($conDB, $query_02);
        if (!$stmt_02) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt_02, ['VCN'])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $solution = array();
        while ($row = odbc_fetch_array($stmt_02)) {
            $solution[] = $row;
        }

        // Tổ chuyển về
        $query_03 = 'select "VisResCode" "Code","ResName" "Name" 
        from "ORSC" where "U_QC" =? AND "validFor"=? and "U_FAC"=?;';
        $stmt_03 = odbc_prepare($conDB, $query_03);
        if (!$stmt_03) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt_03, ['N', 'Y', Auth::user()->plant])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $teamBack = array();
        while ($row = odbc_fetch_array($stmt_03)) {
            $teamBack[] = $row;
        }

        // Nguồn lỗi
        $rootCause = [
            [
                'id' => 'C',
                'name' => 'Lỗi đầu vào (Mã con)'
            ],
            [
                'id' => 'P',
                'name' => 'Lỗi đầu ra (Mã cha)'
            ],
        ];

        // Mã hạ cấp
        $query_04 = 'select "ItemCode", "ItemName" from OITM where U_CDOAN IN (?,?)';
        $stmt_04 = odbc_prepare($conDB, $query_04);
        if (!$stmt_04) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt_04, ['TC', 'SC'])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $returnCode = array();
        while ($row = odbc_fetch_array($stmt_04)) {
            $returnCode[] = $row;
        }

        odbc_close($conDB);

        return response()->json([
            'data' => $data,
            'errorType' => $errorType,
            'solution' => $solution,
            'teamBack' => $teamBack,
            'rootCause' => $rootCause,
            'returnCode' => $returnCode
        ], 200);
    }

    // danh sách tổ không bao gồm tổ QC thể hiện ở màn hình danh sách xác nhận QC
    function listToExcludeQC()
    {
        $conDB = (new ConnectController)->connect_sap();

        $query = 'select "VisResCode" "Code","ResName" "Name", Case when "U_QC"= ? then true else false end QC from "ORSC" A JOIN "RSC4" B ON A."VisResCode"=b."ResCode"
        join OHEM C ON B."EmpID"=C."empID" where c."empID" =? AND "validFor"=? and "U_QC"<> ?';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, ['Y', Auth::user()->sap_id, 'Y', 'Y'])) {
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

    // QC Xử lý lỗi cho CBG
    function acceptTeamQCCBG(Request $request)
    {
        // 1. Check dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'Qty' => 'required|numeric|min:1',
            'id' => 'required',
        ]);
        // 1.1. Báo lỗi nếu dữ liệu không hợp lệ
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        // 2. Truy vấn thông tin từ bảng "sanluong" và bảng "notireceipt" để lấy dữ liệu
        $data = DB::table('sanluong AS a')
            ->join('notireceipt as b', 'a.id', '=', 'b.baseID')
            ->select(
                'a.*',
                'b.id as notiID',
                'b.ItemCode as ItemCode',
                'b.SubItemCode as SubItemCode',
                'b.team as NextTeam',
                'b.openQty',
                'b.IsPushSAP',
                'b.ErrorData as ErrorData'
            )
            ->where('b.id', $request->id)
            ->where('b.confirm', 0)
            ->first();

        // 2.1. Báo lỗi nếu dữ liệu không hợp lệ hoặc số lượng từ request lớn hơn số lượng ghi nhận lỗi, dồng thời cập nhật giá trị close -> báo hiệu việc điều chuyển đã xong
        if (!$data) {
            throw new \Exception('data không hợp lệ.');
        }
        if ($data->openQty < $request->Qty) {
            throw new \Exception('Số lượng xác nhận không được lớn hơn số lượng báo lỗi');
        }
        $closed = 0;
        if ($data->openQty == $request->Qty) {
            $closed = 1;
        }

        //3. Gán giá trị kho cho biến kho để lưu thông tin kho QC
        $warehouse = "";
        if ($data->NextTeam = 'TH-QC') {
            $warehouse = $this->getQCWarehouseByUser('TH');
        } else if ($data->NextTeam = 'TQ-QC') {
            $warehouse = $this->getQCWarehouseByUser('TQ');
        } else {
            $warehouse = $this->getQCWarehouseByUser('HG');
        }

        if ($warehouse == "-1") {
            return response()->json([
                'error' => 'Không tìm thấy kho QC',
            ], 500);
        }

        //4. Truy vấn dữ liệu sau đó gửi về SAP ->  Trả về kết quả vào biến $res
        $loailoi = $request->loailoi['label'];
        $huongxuly = $request->huongxuly['label'];
        $teamBack = $request->teamBack['value'] ?? '';
        $rootCause = $request->rootCause['value'] ?? '';
        $subCode = $request->subCode['value'] ?? '';
        $U_GIAO = DB::table('users')->where('id', $data->create_by)->first();

        // dd($U_GIAO);

        $HistorySL = HistorySL::where('ObjType', 59)->get()->count();
        $body = [
            "BPL_IDAssignedToInvoice" => Auth::user()->branch,
            "U_LSX" => $data->LSX,
            "U_TO" => $data->Team,
            "U_LL" => $loailoi,
            "U_HXL" => $huongxuly,
            "U_QCC" => $huongxuly,
            "U_TOCD" => $teamBack,
            "U_NGiao" => $U_GIAO->last_name . " " . $U_GIAO->first_name,
            "U_NNhan" => Auth::user()->last_name . " " . Auth::user()->first_name,
            "U_source" => $rootCause,
            "U_ItemHC" => $subCode,
            "U_cmtQC" => $request->Note ?? "",
            "U_QCN" => $data->ItemCode . "-" . $data->Team . "-" . str_pad($HistorySL + 1, 4, '0', STR_PAD_LEFT),
            "DocumentLines" => [[
                "Quantity" => $request->Qty,
                "ItemCode" => $data->SubItemCode ? $data->SubItemCode : $data->ItemCode,
                "WarehouseCode" =>  $warehouse,
                "BatchNumbers" => [
                    [
                        "BatchNumber" => now()->format('YmdHmi'),
                        "Quantity" => $request->Qty,
                        "ItemCode" => $data->SubItemCode ? $data->SubItemCode : $data->ItemCode,
                        "U_CDai" => $data->CDai,
                        "U_CRong" => $data->CRong,
                        "U_CDay" =>  $data->CDay,
                        "U_Status" => "HL",
                        "U_TO" => $data->Team,
                        "U_LSX" => $data->LSX,
                        "U_Year" => $request->year ?? now()->format('y'),
                        "U_Week" => $request->week ? str_pad($request->week, 2, '0', STR_PAD_LEFT) : str_pad(now()->weekOfYear, 2, '0', STR_PAD_LEFT)
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

        // 5. Sau khi lưu dữ liệu về SAP thành công, lưu dữ liệu về  
        if ($response->successful()) {
            awaitingstocks::where('notiId', $request->id)->delete();
            SanLuong::where('id', $data->id)->update(
                [
                    'Status' =>  $closed,
                    'openQty' => $data->RejectQty - $data->openQty - $request->Qty,
                ]
            );
            notireceipt::where('id', $request->id)->update([
                'confirm' =>  $closed,
                'ObjType' =>  59,
                'DocEntry' => $res['DocEntry'],
                'confirmBy' => Auth::user()->id,
                'isPushSAP' => 1,
                'confirm_at' => now()->format('YmdHmi')
            ]);

            HistorySL::create(
                [
                    'LSX' => $data->LSX,
                    'itemchild' => $data->SubItemCode ? $data->SubItemCode : $data->ItemCode,
                    'to' => $data->Team,
                    'quantity' => $request->Qty,
                    'ObjType' => 59,
                    'DocEntry' => $res['DocEntry'],
                    'SPDich' => $data->FatherCode,
                    'LL' => $loailoi,
                    'HXL' => $huongxuly,
                    "source" => $rootCause,
                    "TOChuyenVe" => $teamBack,
                    'isQualityCheck' => 1,
                    'notiId' => $request->id,
                ],
            );
            // check ErrorData not null để ap dung cho cac giao dich cu
            if ($data->ErrorData != null) {
                $dataIssues = json_decode($data->ErrorData, true);
                // Lấy dữ liệu  tu notireceipt
                foreach ($dataIssues['SubItemQty'] as $dataIssue) {
                    $this->IssueQC($dataIssue['SubItemCode'], (float)$dataIssue['BaseQty'] * (float)$request->Qty, $dataIssues['SubItemWhs'], Auth::user()->branch);
                }
                if ($data->IsPushSAP == 0) {
                    $type = 'I';
                    $qtypush = $data->RejectQty;
                } else {
                    $type = 'U';
                    $qtypush = $request->Qty;
                }
                HistoryQC::dispatch(
                    $type,
                    $request->id,
                    $data->SubItemCode ? $data->SubItemCode : $data->ItemCode,
                    $qtypush,
                    $dataIssues['SubItemWhs'],
                    $qtypush - $request->Qty,
                    'CBG',
                    $data->Team,
                    $loailoi,
                    $huongxuly,
                    $rootCause,
                    $subCode,
                    $request->note,
                    $teamBack
                );
            }
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

    // QC Xử lý lỗi cho VCN
    function acceptTeamQCVCN(Request $request)
    {
        // 1. Check dữ liệu đầu vào
        $validator = Validator::make($request->all(), [
            'Qty' => 'required|numeric|min:1',
            'id' => 'required',
        ]);
        // 1.1. Báo lỗi nếu dữ liệu không hợp lệ
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        // 2. Truy vấn thông tin từ bảng "notireceiptvcn" để lấy dữ liệu
        $data = notireceiptvcn::select(
            'id as notiID',
            'ItemCode',
            'SubItemCode',
            'team as Team',
            'NextTeam',
            'openQty',
            'IsPushSAP',
            'ErrorData',
            'CreatedBy',
            'CDai',
            'CRong',
            'CDay',

        )
            ->where('id', $request->id)
            ->where('confirm', 0)
            ->first();

        // dd($data);

        // 2.1. Báo lỗi nếu dữ liệu không hợp lệ hoặc số lượng từ request lớn hơn số lượng ghi nhận lỗi, dồng thời cập nhật giá trị close -> báo hiệu việc điều chuyển đã xong
        if (!$data) {
            throw new \Exception('data không hợp lệ.');
        }
        if ($data->openQty < $request->Qty) {
            throw new \Exception('Số lượng xác nhận không được lớn hơn số lượng báo lỗi');
        }
        $closed = 0;
        if ($data->openQty == $request->Qty) {
            $closed = 1;
        }

        //3. Gán giá trị kho cho biến kho để lưu thông tin kho QC
        $warehouse = "";
        if ($data->NextTeam = 'TH-QC') {
            $warehouse = $this->getQCWarehouseByUser('TH');
        } else if ($data->NextTeam = 'TQ-QC') {
            $warehouse = $this->getQCWarehouseByUser('TQ');
        } else {
            $warehouse = $this->getQCWarehouseByUser('HG');
        }
        dd($warehouse);

        if ($warehouse == "-1") {
            return response()->json([
                'error' => 'Không tìm thấy kho QC',
            ], 500);
        }

        //4. Truy vấn dữ liệu sau đó gửi về SAP ->  Trả về kết quả vào biến $res
        $loailoi = $request->loailoi['label'];
        $huongxuly = $request->huongxuly['label'];
        $teamBack = $request->teamBack['value'] ?? '';
        $rootCause = $request->rootCause['value'] ?? '';
        $subCode = $request->subCode['value'] ?? '';
        $U_GIAO = DB::table('users')->where('id', $data->create_by)->first();

        // dd($U_GIAO);

        $HistorySLVCN = historySLVCN::where('ObjType', 59)->get()->count();
        $body = [
            "BPL_IDAssignedToInvoice" => Auth::user()->branch,
            "U_LSX" => $data->LSX,
            "U_TO" => $data->Team,
            "U_LL" => $loailoi,
            "U_HXL" => $huongxuly,
            "U_QCC" => $huongxuly,
            "U_TOCD" => $teamBack,
            "U_NGiao" => $U_GIAO->last_name . " " . $U_GIAO->first_name,
            "U_NNhan" => Auth::user()->last_name . " " . Auth::user()->first_name,
            "U_source" => $rootCause,
            "U_ItemHC" => $subCode,
            "U_cmtQC" => $request->Note ?? "",
            "U_QCN" => $data->ItemCode . "-" . $data->Team . "-" . str_pad($HistorySLVCN + 1, 4, '0', STR_PAD_LEFT),
            "DocumentLines" => [[
                "Quantity" => $request->Qty,
                "ItemCode" => $data->SubItemCode ? $data->SubItemCode : $data->ItemCode,
                // "WarehouseCode" =>  $warehouse,
                "WarehouseCode" => $data->NextTeam,
                "BatchNumbers" => [
                    [
                        "BatchNumber" => now()->format('YmdHmi'),
                        "Quantity" => $request->Qty,
                        "ItemCode" => $data->SubItemCode ? $data->SubItemCode : $data->ItemCode,
                        "U_CDai" => $data->CDai,
                        "U_CRong" => $data->CRong,
                        "U_CDay" =>  $data->CDay,
                        "U_Status" => "HL",
                        "U_TO" => $data->Team,
                        "U_LSX" => $data->LSX,
                        "U_Year" => $request->year ?? now()->format('y'),
                        "U_Week" => $request->week ? str_pad($request->week, 2, '0', STR_PAD_LEFT) : str_pad(now()->weekOfYear, 2, '0', STR_PAD_LEFT)
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

        // 5. Sau khi lưu dữ liệu về SAP thành công, lưu dữ liệu về  
        if ($response->successful()) {
            awaitingstocksvcn::where('notiId', $request->id)->delete();
            notireceiptvcn::where('id', $request->id)->update([
                'confirm' =>  $closed,
                'ObjType' =>  59,
                'DocEntry' => $res['DocEntry'],
                'confirmBy' => Auth::user()->id,
                'isPushSAP' => 1,
                'confirm_at' => now()->format('YmdHmi')
            ]);

            HistorySLVCN::create(
                [
                    'LSX' => $data->LSX,
                    'itemchild' => $data->SubItemCode ? $data->SubItemCode : $data->ItemCode,
                    'to' => $data->Team,
                    'quantity' => $request->Qty,
                    'ObjType' => 59,
                    'DocEntry' => $res['DocEntry'],
                    'SPDich' => $data->FatherCode,
                    'LL' => $loailoi,
                    'HXL' => $huongxuly,
                    'isQualityCheck' => 1,
                    'notiId' => $request->id,
                ],
            );
            // check ErrorData not null để ap dung cho cac giao dich cu
            if ($data->ErrorData != null) {
                $dataIssues = json_decode($data->ErrorData, true);
                // Lấy dữ liệu  tu notireceipt
                foreach ($dataIssues['SubItemQty'] as $dataIssue) {
                    $this->IssueQC($dataIssue['SubItemCode'], (float)$dataIssue['BaseQty'] * (float)$request->Qty, $dataIssues['SubItemWhs'], Auth::user()->branch);
                }
                if ($data->IsPushSAP == 0) {
                    $type = 'I';
                    $qtypush = $data->RejectQty;
                } else {
                    $type = 'U';
                    $qtypush = $request->Qty;
                }
                HistoryQC::dispatch(
                    $type,
                    $request->id,
                    $data->SubItemCode ? $data->SubItemCode : $data->ItemCode,
                    $qtypush,
                    $dataIssues['SubItemWhs'],
                    $qtypush - $request->Qty,
                    'CBG',
                    $data->Team,
                    $loailoi,
                    $huongxuly,
                    $rootCause,
                    $subCode,
                    $request->note,
                    $teamBack
                );
            }
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

    // Accept QC V2
    // function acceptTeamQCCBGV2(Request $request)
    // {
    //     // 1. Check dữ liệu đầu vào
    //     $validator = Validator::make($request->all(), [
    //         'Qty' => 'required|numeric|min:1',
    //         'id' => 'required',
    //     ]);
    //     // 1.1. Báo lỗi nếu dữ liệu không hợp lệ
    //     if ($validator->fails()) {
    //         return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
    //     }

    //     // 2. Truy vấn thông tin từ bảng "sanluong" và bảng "notireceipt" để lấy dữ liệu
    //     $data = DB::table('sanluong AS a')->join('notireceipt as b', 'a.id', '=', 'b.baseID',)
    //     ->select('a.*', 'b.id as notiID','b.SubItemCode as SubItemCode','b.team as NextTeam','b.openQty')
    //     ->where('b.id', $request->id)
    //     ->where('b.confirm', 0)->first();

    //     // 2.1. Báo lỗi nếu dữ liệu không hợp lệ hoặc số lượng từ request lớn hơn số lượng ghi nhận lỗi, dồng thời cập nhật giá trị close -> báo hiệu việc điều chuyển đã xong
    //     if (!$data) {
    //         throw new \Exception('data không hợp lệ.');
    //     }
    //     if ($data->openQty < $request->Qty) {
    //         throw new \Exception('Số lượng xác nhận không được lớn hơn số lượng báo lỗi');
    //     }

    //     $closed=0;
    //     if ($data->openQty == $request->Qty) {
    //         $closed=1;
    //     } 

    //     //3. Gán giá trị kho cho biến kho để lưu thông tin kho QC
    //     $warehouse="";
    //     if($data->NextTeam='TH-QC')
    //     {
    //         $warehouse= $this ->getQCWarehouseByUser('TH');
    //     }
    //     else if($data->NextTeam='TQ-QC')
    //     {
    //         $warehouse= $this ->getQCWarehouseByUser('TQ');
    //     }
    //     else
    //     {
    //         $warehouse= $this ->getQCWarehouseByUser('HG');
    //     }
    //     if($warehouse=="-1")
    //     {
    //         return response()->json([
    //             'error' => 'Không tìm thấy kho QC',
    //         ], 500);
    //     }

    //     //4. Truy vấn dữ liệu sau đó gửi về SAP ->  Trả về kết quả vào biến $res
    //     $loailoi= $request->loailoi['label'];
    //     $huongxuly= $request->huongxuly['label'];
    //     $teamBack= $request->teamBack['value']??'';
    //     $rootCause= $request->rootCause['value']??'';
    //     $subCode= $request->subCode['value'] ??'';

    //     $HistorySL=HistorySL::where('ObjType',59)->get()->count();
    //     $body = [
    //         "U_BranchID" => Auth::user()->branch,
    //         "U_LSX"=> $data->LSX,
    //         "U_TO"=> $data->Team,
    //         "U_LL"=> $loailoi,
    //         "U_HXL"=> $huongxuly,
    //         "U_TOE"=> $teamBack,
    //         "U_source"=>$rootCause,
    //         "U_ItemHC"=>$subCode,
    //         "U_cmtQC"=> $request->Note??"",
    //         "U_QCN"=> $data->FatherCode."-".$data->Team."-".str_pad($HistorySL+1, 4, '0', STR_PAD_LEFT),
    //         "V_IGN1Collection" => [[
    //             "U_Quantity" => $request->Qty,
    //             "U_ItemCode" =>   $data->SubItemCode,
    //             "U_Whscode" =>  $warehouse,
    //             "U_BaseType"=> 59
    //         ]]
    //     ];
    //     $response = Http::withOptions([
    //         'verify' => false,
    //     ])->withHeaders([
    //         'Content-Type' => 'application/json',
    //         'Accept' => 'application/json',
    //         'Authorization' => 'Basic ' . BasicAuthToken(),
    //     ])->post(UrlSAPServiceLayer() . '/b1s/v1/OIGN', $body);
    //     $res = $response->json();

    //     // 5. Sau khi lưu dữ liệu về SAP thành công, lưu dữ liệu về  
    //     if ($response->successful()) {
    //         SanLuong::where('id', $data->id)->update(
    //             [
    //                 'Status' =>  $closed,
    //                 'openQty' =>$data->RejectQty-$data->openQty-$request->Qty,
    //             ]
    //         ); 
    //         notireceipt::where('id', $request->id)->
    //         update(['confirm' =>  $closed,
    //         'ObjType' =>  59,
    //         'DocEntry' => $res['DocEntry'],
    //         'confirmBy' => Auth::user()->id,
    //         'confirm_at' => now()->format('YmdHmi')]);
    //         HistorySL::create(
    //             [
    //                 'LSX'=>$data->LSX,
    //                 'itemchild'=>$data->SubItemCode,
    //                 'to' => $data->Team,
    //                 'quantity'=>$request->Qty,
    //                 'ObjType'=>59,
    //                 'DocEntry'=>$res['DocEntry'],
    //                 'SPDich'=>$data->FatherCode,
    //                 'LL'=> $loailoi,
    //                 'HXL'=>$huongxuly,
    //                 'isQualityCheck'=>1,
    //                 'notiId' => $request->id,
    //             ], 
    //         );
    //         DB::commit();
    //         return response()->json('success', 200);
    //     } else {
    //         DB::rollBack();
    //         return response()->json([
    //             'message' => 'Failed receipt',
    //             'error' => $res['error'],
    //             'body' => $body
    //         ], 500);
    //     }
    // }

    function getQCWarehouseByUser($plant)
    {
        // $WHS = Warehouse::where('flag', 'QC')->WHERE('branch',Auth::user()->branch)
        // ->where('FAC',$plant)
        // ->first();

        // $WHS=  $WHS? $WHS->WhsCode: 99;
        $WHS = GetWhsCode($plant, 'QC');
        return $WHS;
    }

    // loại lỗi ván công nghiệp
    function LoiLoaiVCN(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
            // Return validation errors with a 422 Unprocessable Entity status code
        }
        try {
            $conDB = (new ConnectController)->connect_sap();
            $query = 'select "Code" "id", "Name""name" from "@V_LLVCN" and "U_ObjType" = ?';
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt, [$request->type, 'VCN'])) {
                // Handle execution error
                // die("Error executing SQL statement: " . odbc_errormsg());
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }
            $results = array();
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }
            return response()->json($results, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    function IssueQC($ItemCode, $Quantity, $WarehouseCode, $branch)
    {
        issueProduction::dispatch($ItemCode, $Quantity, $WarehouseCode, $branch);
    }
    function logToTableSAP($ItemCode, $Quantity, $WarehouseCode, $branch)
    {
        issueProduction::dispatch($ItemCode, $Quantity, $WarehouseCode, $branch);
    }
}
