<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class TuBepController extends Controller
{
    public function  GhiNhanSanluong(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'LSX' => 'required|integer', // new UniqueOvenStatusRule
            'SPDich' => 'required|string',
            'CD' => 'required|string',
            'Detail.*.MaCT' => 'required|string',
            'Detail.*.SoLuong' => 'required|numeric',
            'Detail.*.LineId' => 'required|integer',
            'Detail.*.BANGKE' => 'required|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        //make body send SAP
        $body = [
            'U_PONO' => $request->LSX,
            'U_CreateBy' => Auth::user()->last_name.' '.Auth::user()->first_name,
            'U_CD' =>$request->CD,
            'V_SLND1Collection' => []
        ];
        foreach ($request->Detail as $item) {
            $body['V_SLND1Collection'][] = [
                'U_MACT' => $item['MaCT'],
                'U_Quantity' => $item['SoLuong'],
                'U_BaseLine' => $item['LineId'],
                'U_MaHop' => $item['MaHop']??'',
                'U_BANGKE' => $item['BANGKE'],
            ];
        }
        $response = Http::withOptions([
            'verify' => false,
        ])->withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Authorization' => 'Basic ' . BasicAuthToken(),
        ])->post(UrlSAPServiceLayer() . '/b1s/v1/SLND', $body);
        $res = $response->json();
        // 5. Sau khi lưu dữ liệu về SAP thành công, lưu dữ liệu về
        if ($response->successful()) {
            return response()->json(['success' => 'Ghi nhận sản lượng thất bại'],status: 200);
        }
        else
        {
            return response()->json([
                'message' => 'Ghi nhận sản lượng thất bại',
                'error' => $res['error'],
                'body' => $body
            ], 500);
        }
    }

    public function DanhSachLenh()
    {
        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from GT_TUBEP_LSX';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $data = [];
        while (odbc_fetch_row($stmt)) {
            $data[] = [
                'DocEntry' => odbc_result($stmt, "DocEntry"),
                'SPDich' => odbc_result($stmt, "SPDich")
            ];
        }
        odbc_close($conDB);
        return response()->json($data);
    }

    public function ChiTietLenh(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'LSX' => 'required|integer', // new UniqueOvenStatusRule
            'CD'=>  'required|in:CD1,CD2,CD3'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        switch ($request->CD) {
            case 'CD1':
                $query = 'select *,"QtyCD1" "RemainQty"  from ZGT_SLWO_STL where "DocEntry"=? and "CD1"=? and "TYPE"=?';
                break;
            case 'CD2':
                $query = 'select * ,"QtyCD2" "RemainQty" from ZGT_SLWO_STL where "DocEntry"=? and "CD2"=? and ("CD1"=? or "CD1"=?) and "TYPE"=?';
                break;
            case 'CD3':
                $query = 'select *,"QtyCD3" "RemainQty" from ZGT_SLWO_STL where "DocEntry"=? and "CD3"=? and  ("CD2"=?or "CD2"=?) and ("CD1"=? or "CD1"=?) and "TYPE"=?';
                break;
            default:
                // Không khớp với bất kỳ giá trị nào
                break;
        }

        $conDB = (new ConnectController)->connect_sap();

        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        switch ($request->CD) {
            case 'CD1':
                if (!odbc_execute($stmt, [$request->LSX,'N','TUBEP'])) {
                    // Handle execution error
                    // die("Error executing SQL statement: " . odbc_errormsg());
                    throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
                }
                break;
            case 'CD2':
                if (!odbc_execute($stmt, [$request->LSX,'N','Y','K','TUBEP'])) {
                    // Handle execution error
                    // die("Error executing SQL statement: " . odbc_errormsg());
                    throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
                }
                break;
            case 'CD3':
                if (!odbc_execute($stmt, [$request->LSX,'N','Y','K','Y','K','TUBEP'])) {
                    // Handle execution error
                    // die("Error executing SQL statement: " . odbc_errormsg());
                    throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
                }
                break;
            default:
                // Không khớp với bất kỳ giá trị nào
                break;
        }

        $data = [];
        while (odbc_fetch_row($stmt)) {
            $data[] = [
                'MACT' => odbc_result($stmt, "MACT"),
                'NameCT' => odbc_result($stmt, "CTName"),
                'LineId' => (integer)odbc_result($stmt, "LineId"),
                'BANGKE' => odbc_result($stmt, "BANGKE"),
                'Dai' => (float)odbc_result($stmt, "Dai"),
                'Day' => (float)odbc_result($stmt, "Day"),
                'Rong' => (float)odbc_result($stmt, "Rong"),
                'KHOILUONG' => (float)odbc_result($stmt, "KHOILUONG"),
                'PlanQty' =>(float) odbc_result($stmt, "PlanQty"),
                'CompletedQty' => (float)odbc_result($stmt, "ComplQty"),
                'RemainQty' => (float) odbc_result($stmt, "RemainQty")
            ];
        }
        odbc_close($conDB);
        return response()->json($data);
    }

    public function DanhSachCongDoan()
    {
        $data = [
            [
                'code' => 'CD1',
                'value' => 'Sơ chế-Tinh chế',
            ],
            [
                'code' => 'CD2',
                'value' => 'Hoàn thiện',
            ],
            [
                'code' => 'CD3',
                'value' => 'Đóng gói',
            ],
        ];

        return response()->json($data);

    }

    public function CapNhatTrangThai(Request $request)
    {
        // Kiểm tra đầu vào
        $masdArray = $request->input('MASD');
        if (!is_array($masdArray) || empty($masdArray)) {
            return response()->json(['error' => 'MASD must be a non-empty array'], 400);
        }

        // Kết nối SAP
        $conDB = (new ConnectController)->connect_sap();

        // Tạo danh sách placeholder `?` tương ứng với số lượng phần tử trong mảng
        $placeholders = implode(',', array_fill(0, count($masdArray), '?'));

        // Câu lệnh SQL sử dụng IN (...) để cập nhật nhiều dòng cùng lúc
        $query = "UPDATE ZGT_SLNOIDIA_STL SET \"Status\" = 'Y'  WHERE \"MASD\" IN ($placeholders)";

        // Chuẩn bị statement
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }

        // Thực thi câu lệnh SQL với tham số từ mảng
        if (!odbc_execute($stmt, $masdArray )) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        // Đóng kết nối
        odbc_close($conDB);

        return response()->json(['message' => 'Cập nhật trạng thái thành công']);
    }
}
