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
                'NameCT' => odbc_result($stmt, "NameCT"),
                'LineId' => (integer)odbc_result($stmt, "LineId"),
                'BANGKE' => (integer)odbc_result($stmt, "BANGKE"),
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
        $query = 'select * from GT_NOIDIA_DS_MASD';
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
        $masd = $request->input('MASD');
        if (!$masd) {
            return response()->json(['error' => 'MASD is required'], 400);
        }

        // Kết nối SAP
        $conDB = (new ConnectController)->connect_sap();

        // Câu lệnh SQL với tham số
        $query = "UPDATE ZGT_SLNOIDIA_STL SET Status = 'Y' WHERE MASD = ?";

        // Chuẩn bị statement
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }

        // Thực thi câu lệnh SQL với tham số
        if (!odbc_execute($stmt, [$masd])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        // Đóng kết nối
        odbc_close($conDB);

        return response()->json(['message' => 'Cập nhật trạng thái thành công']);
    }

}
