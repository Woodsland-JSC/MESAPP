<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Jobs\receiptProductionAlocate;
use App\Models\AllocateLogs;

class ProductionController extends Controller
{
    //
    function index(Request $request)
    {
        $conDB = (new ConnectController)->connect_sap();
        $query = 'select a."DocEntry",a."DocNum",a."ItemCode","PlannedQty",
                ifnull(c."Qty",0) "ReceiptQty","PlannedQty"-ifnull(c."Qty",0) "OpenQty", null "Allocate"
                from OWOR A join OUSR B ON A."UserSign"=B."USERID"
                left join (
                    select distinct "BaseEntry","ItemCode" ,
                    sum("Quantity") over(PARTITION BY "BaseEntry","ItemCode") "Qty"
                    from IGN1
                    where "BaseType"=202
                )C ON A."DocEntry"=c."BaseEntry" where  "Type"=? and a."Status"=? and "U_Xuong"=?';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, ['S', 'R', $request->xuong])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        }
        odbc_close($conDB);
        return response()->json($results, 200);
    }
    function receipts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ItemCode' => 'required',
            'Qty' => 'required|integer'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $conDB = (new ConnectController)->connect_sap();
        $query = 'select a."DocEntry",a."DocNum",a."ItemCode",a."Warehouse","PlannedQty",
                ifnull(c."Qty",0) "ReceiptQty","PlannedQty"-ifnull(c."Qty",0) "OpenQty", null "Allocate"
                from OWOR A join OUSR B ON A."UserSign"=B."USERID"
                left join (
                    select distinct "BaseEntry","ItemCode" ,
                    sum("Quantity") over(PARTITION BY "BaseEntry","ItemCode") "Qty"
                    from IGN1
                    where "BaseType"=202
                )C ON A."DocEntry"=c."BaseEntry" where  "Type"=? and a."Status"=? and "U_Xuong"=?';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, ['S', 'R', '0001'])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $results = array();

        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        };

        $rss = $this->allocate($results, $request->Qty);
        foreach ($rss as $rs) {
            $data[] = [
                "BatchNumber" => now()->format('Ymd') . $rs['DocEntry'],
                "Quantity" => $rs['Allocate'],
                "ItemCode" =>  $rs['ItemCode'],
                "U_Status" => "SD"
            ];
            $body = [
                "BPL_IDAssignedToInvoice" => Auth::user()->branch,

                "DocumentLines" => [
                    [
                        "Quantity" => $rs['Allocate'],
                        "BaseLine" => 0,
                        "WarehouseCode" => $rs['Warehouse'],
                        "BaseEntry" => $rs['DocEntry'],
                        "BaseType" => 202,
                        "BatchNumbers" => $data,

                    ],
                ],
            ];
            AllocateLogs::created([
                'BaseEntry' => $rs['DocEntry'],
                'ItemCode' => $rs['ItemCode'],
                'Qty' => $rs['Allocate'],
                'Body' =>  $body
            ]);
            receiptProductionAlocate::dispatch($body);
        }

        return response()->json([
            'message' => 'nhập sản lượng thành công',
            'data' => $request->all(),
            $rs
        ], 200);
    }
    function allocate($data, $totalQty)
    {

        foreach ($data as &$item) {
            // Sử dụng isset() thay vì so sánh với phần tử đầu tiên trong mảng
            if (isset($item['OpenQty']) && $item['OpenQty'] <= $totalQty) {
                $item['Allocate'] = $item['OpenQty'];
                $totalQty -= $item['OpenQty'];
            } else {
                // Chỉ cập nhật giá trị nếu Qty lớn hơn 0
                if ($item['OpenQty'] > 0) {
                    $item['Allocate'] = min($item['OpenQty'], $totalQty);
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
    function listProduction(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'TO' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from uv_detailreceipt where "U_To"=?';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$request->TO])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $results = array();

        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        };
        odbc_close($conDB);
        return response()->json($results, 200);
    }
    function viewdetail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ItemCode' => 'required',
            'TO' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $conDB = (new ConnectController)->connect_sap();
        $query = 'SELECT a."ItemCode",e."ItemName","SanPhamDich",sum("totalProcessing") "totalMax",' .
            'ifnull(e."U_CDay",1) "CDay",ifnull(e."U_CDai",1) "CDai",ifnull(e."U_CRong", 1) "CRong"' .
            'FROM UV_DETAILRECEIPT a LEFT JOIN OITM E on a."ItemCode"=E."ItemCode" WHERE a."ItemCode"=? and "U_To"=?' .
            'group by a."ItemCode",e."ItemName","SanPhamDich" ,ifnull(e."U_CDay",1),ifnull(e."U_CDai",1),ifnull(e."U_CRong",1)';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$request->ItemCode, $request->TO])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $results = array();

        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        };
        $data = [];
        //số lượng phôi
        if ($results[0]['ItemCode'] == $results[0]['SanPhamDich']) {
            $data =  $this->SLPhoiNhan($results[0]['ItemCode']);
        } else {
            $data[0]['ItemCode'] = $results[0]['ItemCode'];
            $data[0]['ItemName'] = $results[0]['ItemName'];
            $data[0]['Quantity'] = 0;
        }
        $factory = [
            [
                'Factory' => '01',
                'FactoryName' => 'Nhà Máy CBG Thuận hưng'
            ],
            [
                'Factory' => '02',
                'FactoryName' => 'Nhà Máy CBG Yên sơn'
            ],
            [
                'Factory' => '03',
                'FactoryName' => 'Nhà Máy CBG Thái Bình'
            ],
        ];

        odbc_close($conDB);
        return response()->json(['Data' => $results, 'SLPHOIDANHAN' => $data, 'Factorys' => $factory], 200);
    }
    function listo(Request $request)
    {
        $conDB = (new ConnectController)->connect_sap();

        $query = 'SELECT A.* FROM "@V_TO" a join ousr b ON A."U_Xuong"=b."U_Xuong" where USER_CODE=?';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [Auth::user()->sap_id])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        }
        odbc_close($conDB);
        return response()->json($results, 200);
    }
    function SLPhoiNhan($itemCode)
    {
        $conDB = (new ConnectController)->connect_sap();
        $query = 'select b."Code",C."ItemName",0 "Quantity"
                from OITT A JOIN ITT1 B on a."Code"=b."Father"
                JOIN OITM C ON B."Code"=c."ItemCode"
                where a."Code"=?';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$itemCode])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $results = array();

        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        };
        return $results;
    }
}
