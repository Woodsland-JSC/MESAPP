<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;

class NoiDiaController extends Controller
{
    public function  GhiNhanSanluong(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'LSX' => 'required|integer', // new UniqueOvenStatusRule
            'SPDich' => 'required|string',
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
            'V_SLND1Collection' => []
        ];
        foreach ($request->Detail as $item) {
            $body['V_SLND1Collection'][] = [
                'U_MACT' => $item['MaCT'],
                'U_Quantity' => $item['SoLuong'],
                'U_BaseLine' => $item['LineId'],
                'U_MaHop' => $item['MaHop']??'',
                'U_BANGKE' => $item['BANGKE']??'',
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
        $query = 'select * from GT_NOIDIA_LSX';
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

    public function ChiTietLenh($id)
    {
        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from GT_NOIDIA_CHITIET WHERE "DocEntry" = ?';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$id])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $data = [];
        while (odbc_fetch_row($stmt)) {
            $data[] = [
                'MACT' => odbc_result($stmt, "MACT"),
                'SPDich' => odbc_result($stmt, "SPDich"),
                'NameCT' => odbc_result($stmt, "NameCT"),
                'LineId' => (integer)odbc_result($stmt, "LineId"),
                'BANGKE' => odbc_result($stmt, "BANGKE"),
                'MASD' => odbc_result($stmt, "BANGKE"),
                'Dai' => (float)odbc_result($stmt, "Dai"),
                'Day' => (float)odbc_result($stmt, "Day"),
                'Rong' => (float)odbc_result($stmt, "Rong"),
                'KHOILUONG' => (float)odbc_result($stmt, "KHOILUONG"),
                'MaHop' => odbc_result($stmt, "U_MAHOP"),
                'PlanQty' =>(float) odbc_result($stmt, "PlanQty"),
                'CompletedQty' => (float)odbc_result($stmt, "ComplQty"),
                'RemainQty' => (float) odbc_result($stmt, "RemainQty")
            ];
        }
        odbc_close($conDB);
        return response()->json($data);
    }

    public function DanhSachMaSoDo()
    {
        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from GT_NOIDIA_DS_MASD WHERE "MASD" <> \'\' AND "MASD" IS NOT NULL';
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
                'MASD' => odbc_result($stmt, "MASD"),
            ];
        }
        odbc_close($conDB);
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
        $query = "UPDATE ZGT_SLWO_STL SET \"Status\" = 'Y'  WHERE \"MASD\" IN ($placeholders)";

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
    public function DanhSachDuAn()
    {
        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from UV_PROJECTND ';
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
                'PrjCode' => odbc_result($stmt, "PrjCode"),
            ];
        }
        odbc_close($conDB);
        return response()->json($data);

    }
    public function DanhSachCan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'PrjCode' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from UV_CANHO WHERE "PrjCode" = ?';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$request->PrjCode])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $data = [];
        while (odbc_fetch_row($stmt)) {
            $data[] = [
                'MaCan' => odbc_result($stmt, "MaCan"),
            ];
        }
        odbc_close($conDB);
        return response()->json($data);
    }
    public function DanhSachTienDo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'PrjCode' => 'required',
            'MaCan' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from GT_TIENDOLAPDAT WHERE "PrjCode" = ? and "MaCan" = ? and "TienDo" <> 100 ';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$request->PrjCode, $request->MaCan])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $data = [];
        while (odbc_fetch_row($stmt)) {
            $data[] = [
                'SPDich' => odbc_result($stmt, "SPDich"),
                'Qty' =>(int) odbc_result($stmt, "Qty"),
                'TienDo' => (int)odbc_result($stmt, "TienDo"),
            ];
        }
        odbc_close($conDB);
        return response()->json($data);
    }
    public function CapNhatTienDo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'PrjCode' => 'required',
            'MaCan' => 'required',
            'Details' => 'required|array',
            'Details.*.SPDich' => 'required|string',
            'Details.*.TienDo' => 'required|integer|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        $conDB = (new ConnectController)->connect_sap();

        foreach ($request->Details as $detail) {
            $query = 'UPDATE GT_TIENDOLAPDAT SET "TienDo" = ? WHERE "PrjCode" = ? AND "MaCan" = ? AND "SPDICH" = ?';
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt, [$detail['TienDo'], $request->PrjCode, $request->MaCan, $detail['SPDich']])) {
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }
        }

        odbc_close($conDB);

        return response()->json(['message' => 'Cập nhật tiến độ thành công']);
    }
}
