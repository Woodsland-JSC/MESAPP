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
use App\Models\notireceiptVCN;
use App\Models\HistorySL;
use App\Models\historySLVCN;
use App\Jobs\issueProduction;
use App\Jobs\HistoryQC;
use Illuminate\Support\Facades\Http;
use Illuminate\Database\QueryException;
use GuzzleHttp\Client;
use Illuminate\Support\Carbon;

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
            'Date' => Carbon::now()->format('Y-m-d'),
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
        };
        $toQC = "";
        switch (Auth::user()->plant) {
            case 'TH':
                $toQC = 'TH-QC';
                break;
            case 'HG':
                $toQC = 'HG-QC';
                break;
            case 'YS1':
                $toQC = 'YS1-QC';
                break;
            case 'TB':
                $toQC = 'TB-QC';    
                break;
        };

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
                'b.QuyCach',
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
        $query_04 = 'select "ItemCode", "ItemName", "U_CDay", "U_CRong", "U_CDai" from OITM where "validFor"=? and U_CDOAN IN (?,?,?,?,?,?)';
        $stmt_04 = odbc_prepare($conDB, $query_04);
        if (!$stmt_04) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt_04, ['Y','TC', 'SC', 'HT', 'DG', 'MM', 'LP'])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $returnCode = array();

        while ($row = odbc_fetch_array($stmt_04)) {
            $itemCode = $row['ItemCode'];
            $itemName = $row['ItemName'];
            $uCDay = $row['U_CDay'] ?? 0;
            $uCRong = $row['U_CRong'] ?? 0;
            $uCDai = $row['U_CDai'] ?? 0;

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
        $data = DB::table('notireceiptVCN as a')
            ->join('users as b', 'a.CreatedBy', '=', 'b.id')
            ->select(
                'a.FatherCode',
                'a.ItemCode',
                'a.ItemName',
                'a.SubItemName',
                'a.SubItemCode',
                'a.ErrorData',
                'a.QuyCach',
                'a.team',
                'a.CongDoan',
                'a.CDay',
                'a.CRong',
                'a.CDai',
                'a.openQty as Quantity',
                'a.created_at',
                'b.first_name',
                'b.last_name',
                'a.text',
                'a.id',
            )
            ->where('a.deleted', '=', 0)
            ->where('a.type', 1)
            ->where('a.openQty', '>', 0)
            ->where('a.team', '=',  $request->TO)
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
        // dd($results);
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
            $warehouse = $this->getQCWarehouseByUser('QC');
        } else if ($data->NextTeam = 'YS1-QC') {
            $warehouse = $this->getQCWarehouseByUser('QC');
        } else {
            $warehouse = $this->getQCWarehouseByUser('QC');
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
                        "BatchNumber" => Carbon::now()->format('YmdHis'),
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
        // dd($res);

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
                'confirm_at' => Carbon::now()->format('YmdHis')
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
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'Qty' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }

        $loailoi = $request->loailoi['label'] ?? '';
        $huongxuly = $request->huongxuly['label'] ?? '';
        $teamBack = $request->teamBack['value'] ?? '';
        $rootCause = $request->rootCause['value'] ?? '';
        $subCode = $request->subCode['value'] ?? '';
        //check kho QC
        $whs = $this->getQCWarehouseByUser('NG');
        if ($whs == -1) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => "Không tìm thấy kho QC do user chưa được chỉ định nhà máy hoặc Hệ thống SAP chưa được cấu hình UserId: " . Auth::user()->id
            ], 500);
        }
        try {
            DB::beginTransaction();
            // to bình thường
            $data = notireceiptVCN::where('id', $request->id)->where('deleted', '=', 0)->where('type', '=', 1)
                ->where('openQty', '>=', $request->Qty)->first();
            if (!$data) {
                throw new \Exception('data không hợp lệ.');
            }
            $U_GIAO = DB::table('users')->where('id', $data->CreatedBy)->first();
            $qtypush = 0;
            // check data history push sap
            if ($data->IsPushSAP == 0) {
                $type = 'I';
                $qtypush = $data->Quantity;
            } else {
                $type = 'U';
                $qtypush = $request->Qty;
            }
            //allocate data
            $dataallocate = $this->collectdata($data->FatherCode, $data->ItemCode, $data->team, $data->version);
            $allocates = $this->allocate($dataallocate, $request->Qty);
            if (count($allocates) == 0) {
                return response()->json([
                    'error' => false,
                    'status_code' => 500,
                    'message' => "Không có sản phẩm còn lại để phân bổ. kiểm tra tổ:" .
                        $data->Team . " sản phẩm: " .
                        $data->ItemCode . " sản phẩm đích: " .
                        $data->FatherCode . " LSX." . $data->LSX
                ], 500);
            }
            foreach ($allocates as $allocate) {

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
                    "DocumentLines" => [[
                        "Quantity" => $allocate['Allocate'],
                        "TransactionType" => "R",
                        "BaseEntry" => $allocate['DocEntry'],
                        "BaseType" => 202,
                        "WarehouseCode" => $whs,
                        "BatchNumbers" => [
                            [
                                "BatchNumber" => Carbon::now()->format('YmdHis') . $allocate['DocEntry'],
                                "Quantity" => $allocate['Allocate'],
                                "ItemCode" =>  $allocate['ItemChild'],
                                "U_CDai" => $allocate['CDai'],
                                "U_CRong" => $allocate['CRong'],
                                "U_CDay" => $allocate['CDay'],
                                "U_Status" => "HL",
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
                if ($response->successful()) {
                    awaitingstocksvcn::where('notiId', $request->id)->delete();
                    historySLVCN::create(
                        [
                            // 'LSX' => $data->LSX,
                            'itemchild' => $allocate['ItemChild'],
                            'SPDich' => $data->FatherCode,
                            'to' => $data->Team,
                            "source" => $rootCause,
                            "TOChuyenVe" => $teamBack,
                            'quantity' => $allocate['Allocate'],
                            'ObjType' => 202,
                            'DocEntry' => $res['DocEntry']
                        ]
                    );
                    DB::commit();
                } else {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Failed receipt',
                        'error' => $res['error'],
                        'body' => $body
                    ], 500);
                }
            }
            notireceiptVCN::where('id', $request->id)->update([
                'confirm' => 1,
                'confirmBy' => Auth::user()->id,
                'confirm_at' => Carbon::now()->format('YmdHis'),
                'openQty' => $data->openQty - $request->Qty
            ]);
            DB::commit();
            HistoryQC::dispatch(
                $type,
                $request->id . "VCN",
                $data->ItemCode,
                $qtypush,
                $whs,
                $qtypush - $request->Qty,
                'VCN',
                $data->Team,
                $loailoi,
                $huongxuly,
                $rootCause,
                $subCode,
                $request->note,
                $teamBack
            );
            return response()->json('success', 200);
        } catch (\Exception | QueryException $e) {
            DB::rollBack();
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    function collectdata($spdich, $item, $to, $version)
    {

        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from UV_DETAILGHINHANSL_VCN where "SPDICH"=? and "ItemChild"=? and "TO"=? and "Version"=? order by "LSX" asc';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$spdich, $item, $to, $version])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $results = array();

        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        };
        odbc_close($conDB);
        return  $results;
    }

    function allocate($data, $totalQty)
    {
        foreach ($data as &$item) {
            // Sử dụng isset() thay vì so sánh với phần tử đầu tiên trong mảng
            if (
                isset($item['ConLai']) && $item['ConLai'] <= $totalQty
            ) {
                $item['Allocate'] = $item['ConLai'];
                $totalQty -= $item['ConLai'];
            } else {
                // Chỉ cập nhật giá trị nếu Qty lớn hơn 0
                if ($item['ConLai'] > 0) {
                    $item['Allocate'] = min($item['ConLai'], $totalQty);
                    $totalQty -= $item['Allocate'];
                } else {
                    $item['Allocate'] = 0;
                }
            }
        }

        // Sử dụng array_filter với callback ngắn gọn hơn
        $filteredData = array_filter($data, fn ($item) => $item['Allocate'] != 0);

        return array_values($filteredData);
    }

    function getQCWarehouseByUser($type)
    {

        $WHS = GetWhsCode(Auth::user()->plant, $type);
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


    /**
     * v2 AcceptQC chế biên gỗ
     * 
     */
    function acceptTeamQCCBGV2(Request $request)
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
        try {
            DB::beginTransaction();
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
                $warehouse = $this->getQCWarehouseByUser('QC');
            } else if ($data->NextTeam = 'YS1-QC') {
                $warehouse = $this->getQCWarehouseByUser('QC');
            } else {
                $warehouse = $this->getQCWarehouseByUser('QC');
            }

            if ($warehouse == "-1") {
                return response()->json([
                    'error' => 'Không tìm thấy kho QC',
                ], 500);
            }

            $output = '';

            //4. Truy vấn dữ liệu sau đó gửi về SAP ->  Trả về kết quả vào biến $res
            $loailoi = $request->loailoi['label'] ?? '';
            $huongxuly = $request->huongxuly['label'] ?? '';
            $teamBack = $request->teamBack['value'] ?? '';
            $rootCause = $request->rootCause['value'] ?? '';
            $subCode = $request->subCode['value'] ?? '';
            $U_GIAO = DB::table('users')->where('id', $data->create_by)->first();
            $HistorySL = HistorySL::where('ObjType', 59)->get()->count();

            //payloyd data receipt
            $ReceiptData = [
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
                    "BatchNumbers" => [[
                        "BatchNumber" => Carbon::now()->format('YmdHis'),
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
                    ]]
                ]]
            ];
            // dd($ReceiptData);
            // dd(json_encode($ReceiptData, JSON_PRETTY_PRINT) . "\n");
            $uid = uniqid();
            $batchBoundary = '--batch_36522ad7-fc75-4b56-8c71-56071383e77c_' . $uid;
            $IssueData = '';
            // dd($data->ErrorData);
            if ($data->ErrorData != null) {
                
                $dataIssues = json_decode($data->ErrorData, true);
                $totalDocuments = count($dataIssues['SubItemQty']);
                $documentCounter = 0;
                foreach ($dataIssues['SubItemQty'] as $dataIssue) {
                    $result = playloadIssueCBG($dataIssue['SubItemCode'], (float)$dataIssue['BaseQty'] * (float)$request->Qty, $dataIssues['SubItemWhs'], Auth::user()->branch);
                    $documentCounter++;
                    $IssueData .= "Content-Type: application/http\n";
                    $IssueData .= "Content-Transfer-Encoding: binary\n\n";
                    $IssueData .= "POST /b1s/v1/InventoryGenExits\n";
                    $IssueData .= "Content-Type: application/json\n\n";
                    $IssueData .= json_encode($result, JSON_PRETTY_PRINT) . "\n\n";
                    // Chỉ thêm "{$batchBoundary}\n" nếu không phải là vòng lặp cuối
                    if (!($documentCounter === $totalDocuments)) {
                        $IssueData .= "{$batchBoundary}\n";
                    }
                }
                if ($data->IsPushSAP == 0) {
                    $type = 'I';
                    $qtypush = $data->RejectQty;
                } else {
                    $type = 'U';
                    $qtypush = $request->Qty;
                }
                // tạo một payload batch

                $changeSetBoundary = 'changeset';
                $output = "{$batchBoundary}\n";
                $output .= "Content-Type: multipart/mixed; boundary={$changeSetBoundary}\n\n";
                $output .= "Content-Type: application/http\n";
                $output .= "Content-Transfer-Encoding: binary\n";
                $output .= "POST /b1s/v1/InventoryGenEntries\n";
                $output .= "Content-Type: application/json\n\n";
                $output .= json_encode($ReceiptData, JSON_PRETTY_PRINT) . "\n";
                $output .= "{$batchBoundary}\n";
                $output .= $IssueData;
                $output .= "{$batchBoundary}--";
                $client = new Client();
                $response = $client->request('POST', UrlSAPServiceLayer() . '/b1s/v1/$batch', [
                    'verify' => false,
                    'headers' => [
                        'Accept' => '*/*',
                        'Content-Type' => 'multipart/mixed;boundary=batch_36522ad7-fc75-4b56-8c71-56071383e77c_' . $uid,
                        'Authorization' => 'Basic ' . BasicAuthToken(),
                    ],
                    'body' => $output, // Đảm bảo $pl được định dạng đúng cách với boundary
                ]);
                if ($response->getStatusCode() == 400) {
                    throw new \Exception('SAP ERROR Incomplete batch request body.');
                }
                if ($response->getStatusCode() == 500) {
                    throw new \Exception('SAP ERROR ' . $response->getBody()->getContents());
                }
                if ($response->getStatusCode() == 401) {
                    throw new \Exception('SAP authen ' . $response->getBody()->getContents());
                }
                if ($response->getStatusCode() == 202) {
                    $res = $response->getBody()->getContents();
                    if (strpos($res, 'ETag') !== false) {
                        awaitingstocks::where('notiId', $request->id)->delete();
                        SanLuong::where('id', $data->id)->update(
                            [
                                'Status' =>  $closed,
                                'openQty' => $data->openQty - $request->Qty,
                            ]
                        );
                        notireceipt::where('id', $request->id)->update([
                            'confirm' =>  $closed,
                            'ObjType' =>  59,
                            'DocEntry' => '',
                            'confirmBy' => Auth::user()->id,
                            'isPushSAP' => 1,
                            'confirm_at' => Carbon::now()->format('YmdHis')
                        ]);

                        HistorySL::create(
                            [
                                'LSX' => $data->LSX,
                                'itemchild' => $data->SubItemCode ? $data->SubItemCode : $data->ItemCode,
                                'to' => $data->Team,
                                'quantity' => $request->Qty,
                                'ObjType' => 59,
                                'DocEntry' => '',
                                'SPDich' => $data->FatherCode,
                                'LL' => $loailoi,
                                'HXL' => $huongxuly,
                                "source" => $rootCause,
                                "TOChuyenVe" => $teamBack,
                                'isQualityCheck' => 1,
                                'notiId' => $request->id,
                            ],
                        );
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
                        DB::commit();
                    } else {
                        preg_match('/\{.*\}/s', $res, $matches);
                        if (isset($matches[0])) {
                            $jsonString = $matches[0];
                            $errorData = json_decode($jsonString, true);

                            if (isset($errorData['error'])) {
                                $errorCode = $errorData['error']['code'];
                                $errorMessage = $errorData['error']['message']['value'];
                                throw new \Exception('SAP code:' . $errorCode . ' chi tiết' . $errorMessage);
                            }
                        }
                    }
                }
            } else {
                throw new \Exception('thiếu dữ liệu xuất kho, vui lòng kiểm tra lại dữ liệu.');
            }
            return response()->json('success', 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage(),
                'payloadsendSAP' => $output
            ], 500);
        }
    }
}
