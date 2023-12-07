<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Jobs\receiptProductionAlocate;
use App\Models\AllocateLogs;
use App\Models\notireceipt;
use Illuminate\Support\Facades\Redis;

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
            'SLD' => 'required',
            'SLL' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        // -99 là xóa data
        $Allocate = AllocateLogs::create([
            'ItemCode' => $request->ItemCode,
            'Qty' => $request->SLD,
            'Stautus' => 0
        ]);
        notireceipt::Create([
            'baseID' => $Allocate->id,
            'text' => 'Số lượng đã giao chờ SX xác nhận',
            'Quantity' => $request->SLD,
        ]);
        //  ;
        if ($request->SLL > 0) {
            $data[] = [
                "BatchNumber" => now()->format('YmdHMI'),
                "Quantity" => $request->SLL,
                "ItemCode" =>  $request->ItemCode,
                "U_Status" => "SD"
            ];
            // cần xử lý thêm phân get kho theo nhà máy
            $body =
                [
                    "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                    "ItemCode" => $request->ItemCode,
                    "DocumentLines" => [
                        [
                            "Quantity" => $request->ItemCode,
                            "BaseLine" => 0,
                            "WarehouseCode" => 'W07.1.01',
                            "BatchNumbers" => $data,
                        ],
                    ],
                ];
            receiptProductionAlocate::dispatch($body);
            AllocateLogs::create([
                'ItemCode' => $request->ItemCode,
                'Qty' => $request->SLL,
                'Body' => json_encode($body),
                'Type' => "59",
                'Stautus' => 1
            ]);
        }


        return response()->json([
            'message' => 'nhập sản lượng thành công'
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
            'TO' => 'required',
            'DinhTuyen' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $conDB = (new ConnectController)->connect_sap();
        $query = 'SELECT a."ItemCode",e."ItemName","SanPhamDich",sum("totalProcessing") "totalMax",' .
            'ifnull(e."U_CDay",1) "CDay",ifnull(e."U_CDai",1) "CDai",ifnull(e."U_CRong", 1) "CRong",' .
            'Gettotieptheo(?,?) CDTT,CDTTNAME(?,?) CDTTNAME  FROM UV_DETAILRECEIPT a LEFT JOIN OITM E on a."ItemCode"=E."ItemCode" WHERE a."ItemCode"=? and "U_To"=?' .
            'group by a."ItemCode",e."ItemName","SanPhamDich" ,ifnull(e."U_CDay",1),ifnull(e."U_CDai",1),ifnull(e."U_CRong",1)';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$request->DinhTuyen, $request->TO, $request->DinhTuyen, $request->TO, $request->ItemCode, $request->TO])) {
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
        $notfication = [
            [
                'id' => 1,
                'text' => 'Số lượng đã giao chờ SX xác nhận',
                'Quantity' => 1,
                'Date' => now()->format('Y-m-d H:m:i')
            ],
            [
                'id' => 3,
                'text' => 'Số lượng đã giao chờ SX xác nhận',
                'Quantity' => 2,
                'Date' => now()->format('Y-m-d H:m:i')
            ],
            [
                'id' => 4,
                'text' => 'Số lượng đã giao chờ SX xác nhận',
                'Quantity' => 1,
                'Date' => now()->format('Y-m-d H:m:i')
            ],
        ];
        odbc_close($conDB);
        return response()->json([
            'Data' => $results, 'SLPHOIDANHAN' => $data,
            'Factorys' => $factory,
            'notifications' => $notfication
        ], 200);
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
    function reject(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'reason' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }

        $data[] = [
            "BatchNumber" => now()->format('YmdHMI'),
            "Quantity" => $request->SLL,
            "ItemCode" =>  $request->ItemCode,
            "U_Status" => "SD"
        ];
        // cần xử lý thêm phân get kho theo nhà máy
        $body =
            [
                "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                "ItemCode" => $request->ItemCode,
                "DocumentLines" => [
                    [
                        "Quantity" => $request->ItemCode,
                        "BaseLine" => 0,
                        "WarehouseCode" => 'W07.1.01',
                        "BatchNumbers" => $data,
                    ],
                ],
            ];
        receiptProductionAlocate::dispatch($body);
        AllocateLogs::where()->update([
            'ItemCode' => $request->ItemCode,
            'Qty' => $request->SLL,
            'Body' => json_encode($body),
            'Type' => "59",
            'Stautus' => 1
        ]);
    }
    function listpending(Request $request)
    {
    }
    function accept(Request $request)
    {
    }
    function delete(Request $request)
    {
    }
}
