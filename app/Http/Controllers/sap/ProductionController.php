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
use Illuminate\Database\QueryException;
class ProductionController extends Controller
{

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
        try {
            DB::beginTransaction();
            $SLData = $request->only(['FatherCode', 'ItemCode', 'CompleQty', 'RejectQty','CDay','CRong','CDai','Team','NexTeam','Type']);
            $SLData['create_by'] = Auth::user()->id;
            $SanLuong = SanLuong::create($SLData);
            if($request->CompleQty>0)
            {
                $notifi = notireceipt::create([
                    'text'=>'Số lượng đã giao chờ xác nhận',
                    'Quantity'=> $request->CompleQty,
                    'baseID'=>  $SanLuong->id,
                    'SPDich'=> $request->FatherCode,
                    'team' => $request->NexTeam,
                    'QuyCach'=>$request->CDay."*".$request->CRong."*".$request->CDai,
                    'type'=>0
                ]);

            }
            if($request->RejectQty>0)
            {  $notifi = notireceipt::create([
                'text'=>'Số lượng lỗi xác nhận',
                    'Quantity'=> $request->RejectQty,
                    'baseID'=>  $SanLuong->id,
                    'SPDich'=> $request->FatherCode,
                    'team' => $request->NexTeam,
                    'QuyCach'=>$request->CDay."*".$request->CRong."*".$request->CDai,
                    'type'=>1
                ]);
            }
            DB::commit();

        } catch (\Exception | QueryException $e){
            DB::rollBack();
            return response()->json(['message' => 'ghi nhận sản lượng không thành công', 'error' => $e->getMessage()], 500);

        }



        return response()->json([
            'message' => 'nhập sản lượng thành công'
        ], 200);
    }

    function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'TO' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from UV_GHINHANSL where "TO"=?';
        $stmt = odbc_prepare($conDB, $query);

        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }

        if (!odbc_execute($stmt, [$request->TO])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        $results = [];

        while ($row = odbc_fetch_array($stmt)) {
            $key = $row['SPDICH'];

            if (!isset($results[$key])) {
                $results[$key] = [
                    'SPDICH' => $row['SPDICH'],
                    'NameSPDich' => $row['NameSPDich'],
                    'Details' => [],
                ];
            }

            $detailsKey = $row['ItemChild'] . $row['TO'] . $row['TOTT'];

            $details = [
                'ItemChild' => $row['ItemChild'],
                'ChildName' => $row['ChildName'],
                'CDay' => $row['CDay'],
                'CRong' => $row['CRong'],
                'CDai' => $row['CDai'],
                'LSX' => [
                    [
                        'LSX' => $row['LSX'],
                        'SanLuong' => $row['SanLuong'],
                        'DaLam' => $row['DaLam'],
                        'Loi' => $row['Loi'],
                        'ConLai' => $row['ConLai'],
                    ],
                ],
                'totalsanluong' => $row['SanLuong'],
                'totalDaLam' => $row['DaLam'],
                'totalLoi' => $row['Loi'],
                'totalConLai' => $row['ConLai'],
            ];

            // Check if the composite key already exists
            $compositeKeyExists = false;
            foreach ($results[$key]['Details'] as &$existingDetails) {
                $existingKey = $existingDetails['ItemChild'] . $existingDetails['TO'] . $existingDetails['TOTT'];
                if ($existingKey === $detailsKey) {
                    $existingDetails['LSX'][] = $details['LSX'][0];
                    $existingDetails['totalsanluong'] += $row['SanLuong'];
                    $existingDetails['totalDaLam'] += $row['DaLam'];
                    $existingDetails['totalLoi'] += $row['Loi'];
                    $existingDetails['totalConLai'] += $row['ConLai'];
                    $compositeKeyExists = true;
                    break;
                }
            }

            if (!$compositeKeyExists) {
                $results[$key]['Details'][] = array_merge($details, [
                    'TO' => $row['TO'],
                    'TOTT' => $row['TOTT'],
                ]);
            }
        }

        odbc_close($conDB);

        // Reset array keys to consecutive integers
          // lấy dữ liệu chưa confirm
       $notfication= DB::table('sanluong as a')
       ->join('notireceipt as b', function ($join) {
           $join->on('a.id', '=', 'b.baseID')
               ->where('b.deleted', '=', 0);
       })
       ->join('users as c', 'a.create_by', '=', 'c.id')
       ->select('a.FatherCode', 'a.team', 'CDay', 'CRong', 'CDai', 'b.Quantity', 'a.created_at', 'c.first_name',
       'c.last_name', 'b.text','b.id','b.type','b.confirm')
       ->where('b.confirm', '=', 0)
       ->where('a.FatherCode', '=', $request->FatherCode)
       ->where('a.ItemCode', '=',$request->ItemCode)
       ->where('a.NexTeam', '=',$request->Team)
       ->get();

        return response()->json(['data'=>$results,'notification'=>$notfication], 200);


    }
    function viewdetail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'FatherCode' => 'required|string|max:254',
            'ItemCode' => 'required|string|max:254',
            'Team' => 'required|string|max:254',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
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
        // lấy dữ liệu chưa confirm
       $notfication= DB::table('sanluong as a')
        ->join('notireceipt as b', function ($join) {
            $join->on('a.id', '=', 'b.baseID')
                ->where('b.deleted', '=', 0);
        })
        ->join('users as c', 'a.create_by', '=', 'c.id')
        ->select('a.FatherCode', 'a.team', 'CDay', 'CRong', 'CDai', 'b.Quantity', 'a.created_at', 'c.first_name',
        'c.last_name', 'b.text','b.id','b.type','b.confirm')
        ->where('b.confirm', '!=', 1)
        ->where('a.FatherCode', '=', $request->FatherCode)
        ->where('a.ItemCode', '=',$request->ItemCode)
        ->where('a.Team', '=',$request->Team)
        ->get();

        return response()->json([
            //'Data' => $results, 'SLPHOIDANHAN' => $data,
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
