<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Jobs\receiptProductionAlocate;
use App\Models\SanLuong;
use App\Models\notireceipt;
use Illuminate\Support\Facades\Redis;

class ProductionController extends Controller
{
    //// -99 là xóa data
    // -1 new
    //0 đã push
    //1 success
    function index(Request $request)
    {
        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from UV_GHINHANSL where TO=?';
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
        }
        odbc_close($conDB);
        return response()->json($results, 200);
    }
    function receipts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'FatherCode' => 'required|string|max:254',
            'ItemCode' => 'required|string|max:254',
            'CompleQty' => 'required|numeric',
            'RejectQty' => 'required|numeric',
            'CDay' => 'required|integer',
            'CRong' => 'required|integer',
            'CDai' => 'required|integer',
            'Team' => 'required|string|max:254',
            'NexTeam' => 'required|string|max:254',
            'Type' => 'required|string|max:254',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $SLData = $request->only(['FatherCode', 'ItemCode', 'CompleQty', 'RejectQty','CDay','CRong','CDai','Team','NexTeam','Type']);
        $SLData['create_by'] = Auth::user()->id;
        $Allocate = SanLuong::create($SLData);
        // notireceipt::Create([
        //     'baseID' => $Allocate->id,
        //     'text' => 'Số lượng đã giao chờ SX xác nhận',
        //     'Quantity' => $request->SLD,
        //     'QuyCach' =>  $request->QUYCACH,
        //     'SPDich' => $request->SPDich,

        // ]);
        // //  ;
        // if ($request->SLL > 0) {
        //     // cần xử lý thêm phân get kho theo nhà máy
        //     $body =
        //         [
        //             "BPL_IDAssignedToInvoice" => Auth::user()->branch,
        //             "U_LSX" => $request->SPDich,
        //             "DocumentLines" => [
        //                 [
        //                     "ItemCode" => $request->ItemCode,
        //                     "Quantity" => $request->SLL,
        //                     "BaseLine" => 0,
        //                     "WarehouseCode" => 'W07.1.01',
        //                     "BatchNumbers" => [
        //                         "BatchNumber" => now()->format('YmdHMI'),
        //                         "Quantity" => $request->SLL,
        //                         "ItemCode" =>  $request->ItemCode,
        //                         "U_Status" => "HL"

        //                     ],

        //                 ],
        //             ],
        //         ];

        //     $record =  AllocateLogs::create([
        //         'ItemCode' => $request->ItemCode,
        //         'Qty' => $request->SLL,
        //         'Body' => json_encode($body),
        //         'Type' => "59",
        //         'Stautus' => -1,
        //         'Factorys' =>  $request->Factory
        //     ]);
        //     receiptProductionAlocate::dispatch($body, $record->id);
        // }


        return response()->json([
            'message' => 'nhập sản lượng thành công'
        ], 200);
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

        $query = 'select b."Code", b."Name" from "@V_TO_USER" a join "@V_TO" b on a."U_To"=b."Code"
        join OUSR c on a."U_User"=c."USERID" where C."USER_CODE" =?';
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
        $data = DB::table('AllocateLogs AS b')->join('notireceipt as a', 'a.baseID', '=', 'b.id')
            ->select('b.*')
            ->where('a.id', $request->id)
            ->where('b.Status', -1)
            ->first();
        if (!$data) {
            throw new \Exception('Lò không hợp lệ.');
        }
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
                        "BatchNumbers" => [
                            "BatchNumber" => now()->format('YmdHMI'),
                            "Quantity" => $request->SLL,
                            "ItemCode" =>  $request->ItemCode,
                            "U_Status" => "HL"
                        ],
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

    function accept(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $data = DB::table('AllocateLogs AS b')->join('notireceipt as a', 'a.baseID', '=', 'b.id')
            ->select('b.*')
            ->where('a.id', $request->id)
            ->where('b.Status', -1)
            ->first();
        if (!$data) {
            throw new \Exception('Lò không hợp lệ.');
        }
        $dataallocate = $this->collectdata($data->SPDich, $data->ItemCode);
        $allocates = $this->allocate($dataallocate, $data->Qty);

        foreach ($allocates as $allocate) {

            $body = [
                "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                "DocumentLines" => [
                    "Quantity" => $allocate['Allocate'],
                    "BaseLine" => 0,
                    "WarehouseCode" => $allocate['Warehouse'],
                    "BaseEntry" => $allocate['DocEntry'],
                    "BaseType" => 202,
                    "BatchNumbers" => [
                        [
                            "BatchNumber" => now()->format('Ymd') . $allocate['DocEntry'],
                            "Quantity" => $allocate['Allocate'],
                            "ItemCode" =>  $allocate['ItemCode'],
                            "U_CDai" => $allocate['CDai'],
                            "U_CRong" => $allocate['CRong'],
                            "U_CDay" => $allocate['CDay'],
                            "U_Status" => "HD"
                        ]
                    ]
                ]
            ];

            receiptProductionAlocate::dispatch($body, $data->id);
        }
        AllocateLogs::where('id', $data->id)->update(['Status' => 0]);
        return response()->json('success', 200);
    }
    function delete(Request $request)
    {
    }
    function collectdata($spdich, $item)
    {
        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from uv_detailreceipt where "SanPhamDich"=? and "ItemCode"=? order by "DocEntry" asc';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$spdich, $item])) {
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
                isset($item['totalProcessing']) && $item['totalProcessing'] <= $totalQty
            ) {
                $item['Allocate'] = $item['totalProcessing'];
                $totalQty -= $item['totalProcessing'];
            } else {
                // Chỉ cập nhật giá trị nếu Qty lớn hơn 0
                if ($item['totalProcessing'] > 0) {
                    $item['Allocate'] = min($item['totalProcessing'], $totalQty);
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
}
