<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pallet;
use App\Models\pallet_details;
use App\Models\Warehouse;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;


class DryingOvenController extends Controller
{
    // Get Pallet History
    function getPalletHistory(Request $request)
    {
        $userId = $request->input('userID');
        $fromDate = $request->input('fromDate');
        $toDate = $request->input('toDate');

        $pallets = Pallet::with(['details'])
            ->where('CreateBy', $userId)
            ->whereBetween('NgayNhap', [$fromDate, $toDate])
            ->get();

        $result = [];

        foreach ($pallets as $pallet) {
            $sumQuantity = $pallet->details->sum('Qty_T');
            $firstDetail = $pallet->details->first();

            $result[] = [
                'pallet_id' => $pallet->palletID,
                'pallet_code' => $pallet->Code,
                'created_date' => $pallet->NgayNhap,
                'QuyCach' => $pallet->QuyCach,
                'sum_quantity' => $sumQuantity,
                'length' => $firstDetail ? $firstDetail->CDai : 0,
                'width' => $firstDetail ? $firstDetail->CRong : null,
                'thickness' => $firstDetail ? $firstDetail->CDay : null,
            ];
        }

        return response()->json($result);
    }

    // Tạo pallet
    function StorePallet(Request $request)
    {

        try {
            DB::beginTransaction();
            $whs = WarehouseCS();

            $palletData = $request->only(['LoaiGo', 'MaLo', 'LyDo', 'NgayNhap']);
            $pallet = Pallet::create($palletData);
            // Lấy danh sách chi tiết pallet từ request
            $palletDetails = $request->input('details', []);

            $ldt = [];
            // Tạo các chi tiết pallet và liên kết chúng với Pallet mới tạo
            foreach ($palletDetails as $detailData) {
                $detailData['palletID'] = $pallet->palletID;
                pallet_details::create($detailData);
            }

            // Data body
            $body = [
                "ItemNo" => $palletDetails[0]['ItemCode'],
                "ProductionOrderType" => "bopotSpecial",
                "PlannedQuantity" => array_sum(array_column($request->input('details', []), 'Qty')),
                "Remarks" => "WLAPP PORTAL tạo pallet xếp xấy",
                "ProductionOrderLines" => [
                    [
                        "ItemNo" => $palletDetails[0]['ItemCode'],
                        "BaseQuantity" => 1
                    ]

                ]
            ];

            // Make a request to the service layer
            $response = Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                "Content-Type" => "application/json",
                "Accept" => "application/json",
                "Authorization" => "Basic " . BasicAuthToken(),
            ])->post(UrlSAPServiceLayer() . "/b1s/v1/ProductionOrders", $body);


            $res = $response->json();
            // update data
            if (!empty($res['error'])) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Failed to create pallet and details',
                    'error' => $res['error'],
                ], 500);
            } else {

                $pallet->update([
                    'DocNum' => $res['DocumentNumber'],
                    'DocEntry' => $res['AbsoluteEntry'],
                    'CreateBy' => auth()->id(),

                ]);
                DB::commit();
                // Trả về thông tin Pallet và chi tiết đã tạo
                return response()->json([
                    'message' => 'Pallet created successfully',
                    'data' => [
                        'pallet' => $pallet,
                        'details' => $res,

                    ]
                ]);
            }
        } catch (\Exception | QueryException $e) {
            // Rollback in case of an exception
            DB::rollBack();

            // Log or handle the exception as needed
            return response()->json(['message' => 'Failed to create pallet and details', 'error' => $e->getMessage()], 500);
        }
    }

    // get pallet
    // function index(Request $request)
    // {
    //     $pallet = Pallet::orderBy('palletID', 'DESC')->get();
    //     $details = $pallet->details;

    //     return response()->json($pallet, 200);
    // }

    function index(Request $request)
    {
        $pallets = Pallet::orderBy('palletID', 'DESC')->get();

        $palletsWithDetails = $pallets->map(function ($pallet) {
            $pallet->details = $pallet->details;
            return $pallet;
        });

        return response()->json($palletsWithDetails, 200);
    }

    // Xem chi tiết pallet
    function showbyID($id)
    {
        try {
            $pallet = Pallet::findOrFail($id);
            $details = $pallet->details;

            return response()->json(['message' => 'Pallet details retrieved successfully', 'data' => ['pallet' => $pallet, 'details' => $details]]);
        } catch (\Exception $e) {
            // Handle the exception (e.g., pallet not found)
            return response()->json(['message' => 'Failed to retrieve pallet details', 'error' => $e->getMessage()], 404);
        }
    }

    public function getPalletsByYearAndWeek(Request $request)
    {
        $year = $request->input('year');
        $week = $request->input('week');

        $startDate = Carbon::now()->setISODate($year, $week, 1)->startOfDay();

        $endDate = Carbon::now()->setISODate($year, $week, 7)->endOfDay();

        $pallets = Pallet::whereBetween('created_at', [$startDate, $endDate])->get();

        $palletsData = $pallets->map(function ($pallet) {
            return [
                'palletID' => $pallet->palletID,
                'Code' => $pallet->Code,
            ];
        })->toArray();

        return $palletsData;
    }

    // danh sách lò xấy trống theo chi nhánh và nhà máy. hệ thống sẽ check theo user
    function ListOvenAvailiable(Request $request)
    {
        try {
            $conDB = (new ConnectController)->connect_sap();

            $query = 'select "Code","Name"  from "@G_SAY3" where "U_Branch"=? and "U_Factory"=? and IFNULL("U_status",0)<>1 order by "Code" ';
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt, [Auth::user()->branch, Auth::user()->plant])) {
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
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Tạo pallet
    // function StorePalletNew(Request $request)
    // {
    //     try {
    //         DB::beginTransaction();
    //         $res=null;
    //         $res2=null;
    //         $palletData = $request->only(['LoaiGo', 'MaLo', 'LyDo', 'NgayNhap', 'MaNhaMay']);

    //         $towarehouse = Warehouse::where('flag', 'CS')
    //             ->WHERE('branch', Auth::user()->branch)
    //             ->where('FAC', Auth::user()->plant)
    //             ->first()->WhsCode;

    //         $current_week = now()->format('W');
    //         $current_year = now()->year;

    //         $recordCount = Pallet::whereYear('created_at', $current_year)
    //             ->whereRaw('WEEK(created_at,1) = ?', [$current_week])
    //             ->count() + 1;

    //         // Tạo mới Pallet và thêm mã nhà máy vào 'Code'
    //         $pallet = Pallet::create($palletData + ['Code' => $palletData['MaNhaMay'] . substr($current_year, -2) . $current_week . '-' . str_pad($recordCount, 4, '0', STR_PAD_LEFT)]);

    //         // Lấy danh sách chi tiết pallet từ request
    //         $palletDetails = $request->input('Details', []);
    //         // Tạo các chi tiết pallet và liên kết chúng với Pallet mới tạo
    //         $ldt = [];
    //         $ldt2 = [];
    //         $totalkl = 0;
    //         $toQty = 0;

    //         foreach ($palletDetails as $detailData) {

    //             $datainsert = [];
    //             $datainsert['palletID'] = $pallet->palletID;
    //             $datainsert['WhsCode2'] = $towarehouse;
    //             $datainsert['ItemCode'] = $detailData['ItemCode'];
    //             $datainsert['ItemName'] = $detailData['ItemName'];
    //             $datainsert['WhsCode'] = $detailData['WhsCode'];
    //             $datainsert['BatchNum'] = $detailData['BatchNum'];
    //             $datainsert['CDai'] = $detailData['CDai'] ? $detailData['CDai'] : 0;
    //             $datainsert['CDay'] = $detailData['CDay'] ? $detailData['CDay'] : 0;
    //             $datainsert['CRong'] = $detailData['CRong'] ? $detailData['CRong'] : 0;
    //             $datainsert['Qty'] = (float)$detailData['Qty']* (float)$datainsert['CDai'] * (float)$datainsert['CDay'] * (float)$datainsert['CRong'] / 1000000000;
    //             pallet_details::create($datainsert);
    //             $ldt[] = [

    //                 "ItemCode" => $detailData['ItemCode'],
    //                 "WarehouseCode" =>  $towarehouse,
    //                 "FromWarehouseCode" => $detailData['WhsCode'],
    //                 "Quantity" =>  $datainsert['Qty'] ,
    //                 "BatchNumbers" => [
    //                     [
    //                         "BatchNumber" => $detailData['BatchNum'],
    //                         "Quantity" => $datainsert['Qty'] 
    //                     ]

    //                 ]

    //             ];
    //             $ldt2[] = [
    //                 "U_Item" => $detailData['ItemCode'],
    //                 "U_CRong" => $detailData['CRong'] ? $detailData['CRong'] : 0,
    //                 "U_CDay" => $detailData['CDay'] ? $detailData['CDay'] : 0,
    //                 "U_CDai" => $detailData['CDai'] ? $detailData['CDai'] : 0,
    //                 "U_Batch" => $detailData['BatchNum'],
    //                 "U_Quant" => $datainsert['Qty'],
    //             ];
    //             $toQty += (float)$datainsert['Qty'];
    //             $totalkl += (float)$detailData['CRong'] * (float)$detailData['CDai'] * (float)$detailData['CDay'] * (float)$detailData['Qty']/ 1000000000;
    //         }

    //         // Data body

    //         $body = [
    //             "U_Pallet" => $pallet->Code,
    //             "U_CreateBy" => Auth::user()->sap_id,
    //             "BPLID" => Auth::user()->branch,
    //             "Comments" => "WLAPP PORTAL tạo pallet xếp xấy",
    //             "StockTransferLines" => $ldt
    //         ];
    //         $body2 = [
    //             "U_Code" => $pallet->Code,
    //             "U_Status" => "CS",
    //             "U_Quant" => $toQty,
    //             "U_Vol" => max($totalkl, 1),
    //             "U_USER" => Auth::user()->sap_id,
    //             "G_PALLETLCollection" => $ldt2
    //         ];


    //         // Make a request to the service layer
    //         $response = Http::withOptions([
    //             'verify' => false,
    //         ])->withHeaders([
    //             "Content-Type" => "application/json",
    //             "Accept" => "application/json",
    //             "Authorization" => "Basic " . BasicAuthToken(),
    //         ])->post(UrlSAPServiceLayer() . "/b1s/v1/StockTransfers", $body);
    //         $response2 = Http::withOptions([
    //             'verify' => false,
    //         ])->withHeaders([
    //             "Content-Type" => "application/json",
    //             "Accept" => "application/json",
    //             "Authorization" => "Basic " . BasicAuthToken(),
    //         ])->post(UrlSAPServiceLayer() . "/b1s/v1/Pallet", $body2);

    //         $res = $response->json();
    //         $res2 = $response2->json();

    //         // update data
    //         if (!empty($res['error']) && !empty($res2['error'])) {
    //             DB::rollBack();
    //             return response()->json([
    //                 'message' => 'Failed to create pallet and details',
    //                 'error' => $res['error'],
    //             ], 500);
    //         } else {

    //             Pallet::where('palletID', $pallet->palletID)->update([
    //                 'DocNum' => $res['DocNum'],
    //                 'DocEntry' => $res['DocEntry'],
    //                 'palletSAP' => $res2['DocEntry'],
    //                 'CreateBy' => auth()->id(),

    //             ]);
    //             DB::commit();
    //             // Trả về thông tin Pallet và chi tiết đã tạo
    //             return response()->json([
    //                 'message' => 'Pallet created successfully',
    //                 'data' => [
    //                     'pallet' => $pallet,
    //                     'res1' => $res,
    //                     'res2' => $res2,
    //                 ]
    //             ]);
    //         }
    //         DB::commit();
    //         // Trả về thông tin Pallet và chi tiết đã tạo
    //         return response()->json([
    //             'message' => 'Pallet created successfully',
    //             'data' => [
    //                 'pallet' => $pallet,
    //             ],

    //         ]);
    //     } catch (\Exception | QueryException $e) {
    //         // Rollback in case of an exception
    //         DB::rollBack();

    //         // Log or handle the exception as needed
    //         return response()->json([
    //             'message' => 'Failed to create pallet and details', 'error' => $e->getMessage(), 'res1' => $res,
    //             'res2' => $res2,
    //         ], 500);
    //     }
    // }

    // Tạo pallet mới (cộng dồn pallet)
    // function StorePalletNew(Request $request)
    // {
    //     try {
    //         DB::beginTransaction();
    //         $res = null;
    //         $res2 = null;
    //         $palletData = $request->only(['LoaiGo', 'MaLo', 'LyDo', 'NgayNhap', 'MaNhaMay']);
    //         $quyCach = $request->input('Details.0.QuyCach');

    //         $towarehouse = Warehouse::where('flag', 'CS')
    //             ->WHERE('branch', Auth::user()->branch)
    //             ->where('FAC', Auth::user()->plant)
    //             ->first()->WhsCode;

    //         $current_week = now()->format('W');
    //         $current_year = now()->year;

    //         // Kiểm tra xem QuyCach đã tồn tại trong bảng pallet hay chưa
    //         $existingPallet = Pallet::where('QuyCach', $quyCach)->where('activeStatus', 0)->latest()->first();
    //         // Modify so it will only takes some serveral fields

    //         if ($existingPallet) {
    //             $pallet = $existingPallet;
    //             $isDuplicate = true;
    //         } else {
    //             $recordCount = Pallet::whereYear('created_at', $current_year)
    //                 ->whereRaw('WEEK(created_at,1) = ?', [$current_week])
    //                 ->count() + 1;

    //             // Tạo mới Pallet và thêm mã nhà máy vào 'Code'
    //             $pallet = Pallet::create($palletData + ['Code' => $palletData['MaNhaMay'] . substr($current_year, -2) . $current_week . '-' . str_pad($recordCount, 4, '0', STR_PAD_LEFT)]);
    //             $isDuplicate = false;
    //         }

    //         // Lấy danh sách chi tiết pallet từ request
    //         $palletDetails = $request->input('Details', []);

    //         // Tạo các chi tiết pallet và liên kết chúng với Pallet mới tạo hoặc pallet đã tồn tại
    //         $ldt = [];
    //         $ldt2 = [];
    //         $totalkl = 0;
    //         $toQty = 0;

    //         foreach ($palletDetails as $detailData) {
    //             $datainsert = [];
    //             $datainsert['palletID'] = $pallet->palletID;
    //             $datainsert['WhsCode2'] = $towarehouse;
    //             $datainsert['ItemCode'] = $detailData['ItemCode'];
    //             $datainsert['ItemName'] = $detailData['ItemName'];
    //             $datainsert['WhsCode'] = $detailData['WhsCode'];
    //             $datainsert['BatchNum'] = $detailData['BatchNum'];
    //             $datainsert['CDai'] = $detailData['CDai'] ? $detailData['CDai'] : 0;
    //             $datainsert['CDay'] = $detailData['CDay'] ? $detailData['CDay'] : 0;
    //             $datainsert['CRong'] = $detailData['CRong'] ? $detailData['CRong'] : 0;
    //             $datainsert['Qty'] = (float)$detailData['Qty'] * (float)$datainsert['CDai'] * (float)$datainsert['CDay'] * (float)$datainsert['CRong'] / 1000000000;
    //             pallet_details::create($datainsert);
    //             $ldt[] = [
    //                 "ItemCode" => $detailData['ItemCode'],
    //                 "WarehouseCode" =>  $towarehouse,
    //                 "FromWarehouseCode" => $detailData['WhsCode'],
    //                 "Quantity" =>  $datainsert['Qty'],
    //                 "BatchNumbers" => [
    //                     [
    //                         "BatchNumber" => $detailData['BatchNum'],
    //                         "Quantity" => $datainsert['Qty']
    //                     ]
    //                 ]
    //             ];
    //             $ldt2[] = [
    //                 "U_Item" => $detailData['ItemCode'],
    //                 "U_CRong" => $detailData['CRong'] ? $detailData['CRong'] : 0,
    //                 "U_CDay" => $detailData['CDay'] ? $detailData['CDay'] : 0,
    //                 "U_CDai" => $detailData['CDai'] ? $detailData['CDai'] : 0,
    //                 "U_Batch" => $detailData['BatchNum'],
    //                 "U_Quant" => $datainsert['Qty'],
    //             ];
    //             $toQty += (float)$datainsert['Qty'];
    //             $totalkl += (float)$detailData['CRong'] * (float)$detailData['CDai'] * (float)$detailData['CDay'] * (float)$detailData['Qty'] / 1000000000;
    //         }

    //         // Data body
    //         $body = [
    //             "U_Pallet" => $pallet->Code,
    //             "U_CreateBy" => Auth::user()->sap_id,
    //             "BPLID" => Auth::user()->branch,
    //             "Comments" => "WLAPP PORTAL tạo pallet xếp xấy",
    //             "StockTransferLines" => $ldt
    //         ];
    //         $body2 = [
    //             "U_Code" => $pallet->Code,
    //             "U_Status" => "CS",
    //             "U_Quant" => $toQty,
    //             "U_Vol" => max($totalkl, 1),
    //             "U_USER" => Auth::user()->sap_id,
    //             "G_PALLETLCollection" => $ldt2
    //         ];

    //         // Make a request to the service layer
    //         $response = Http::withOptions([
    //             'verify' => false,
    //         ])->withHeaders([
    //             "Content-Type" => "application/json",
    //             "Accept" => "application/json",
    //             "Authorization" => "Basic " . BasicAuthToken(),
    //         ])->post(UrlSAPServiceLayer() . "/b1s/v1/StockTransfers", $body);
    //         $response2 = Http::withOptions([
    //             'verify' => false,
    //         ])->withHeaders([
    //             "Content-Type" => "application/json",
    //             "Accept" => "application/json",
    //             "Authorization" => "Basic " . BasicAuthToken(),
    //         ])->post(UrlSAPServiceLayer() . "/b1s/v1/Pallet", $body2);

    //         $res = $response->json();
    //         $res2 = $response2->json();

    //         // update data
    //         if (!empty($res['error']) && !empty($res2['error'])) {
    //             DB::rollBack();
    //             return response()->json([
    //                 'message' => 'Failed to create pallet and details',
    //                 'error' => $res['error'],
    //             ], 500);
    //         } else {
    //             if (!$isDuplicate) {
    //                 Pallet::where('palletID', $pallet->palletID)->update([
    //                     'DocNum' => $res['DocNum'],
    //                     'DocEntry' => $res['DocEntry'],
    //                     'palletSAP' => $res2['DocEntry'],
    //                     'CreateBy' => auth()->id(),
    //                     'QuyCach' => $quyCach,
    //                     'activeStatus' => 0,
    //                 ]);
    //             }
    //             DB::commit();

    //             // Trả về thông tin pallet và các phản hồi từ SAP
    //             return response()->json([
    //                 'message' => 'Pallet created successfully',
    //                 'data' => [
    //                     'isDuplicate' => $isDuplicate,
    //                     'pallet' => $pallet,
    //                     'res1' => $res,
    //                     'res2' => $res2,
    //                 ]
    //             ]);
    //         }
    //     } catch (\Exception | QueryException $e) {
    //         // Rollback in case of an exception
    //         DB::rollBack();

    //         // Log or handle the exception as needed
    //         return response()->json([
    //             'message' => 'Failed to create pallet and details',
    //             'error' => $e->getMessage(),
    //             'res1' => $res,
    //             'res2' => $res2,
    //         ], 500);
    //     }
    // }

    // Test
    function StorePalletNew(Request $request)
    {
        try {
            DB::beginTransaction();
            $res = null;
            $res2 = null;
            $palletData = $request->only(['LoaiGo', 'MaLo', 'LyDo', 'NgayNhap', 'MaNhaMay']);
            $quyCachList = collect($request->input('Details'))->pluck('QuyCach')->toArray();

            $towarehouse = Warehouse::where('flag', 'CS')
                ->WHERE('branch', Auth::user()->branch)
                ->where('FAC', Auth::user()->plant)
                ->first()->WhsCode;

            $current_week = now()->format('W');
            $current_year = now()->year;

            $existingPallet = Pallet::where('activeStatus', 0)
                ->where(function ($query) use ($quyCachList) {
                    foreach ($quyCachList as $quyCach) {
                        $query->orWhere('QuyCach', 'like', '%' . $quyCach . '%');
                    }
                })
                ->latest()
                ->first();

            if ($existingPallet) {
                $pallet = $existingPallet;
                $isDuplicate = true;
            } else {
                $recordCount = Pallet::whereYear('created_at', $current_year)
                    ->whereRaw('WEEK(created_at,1) = ?', [$current_week])
                    ->count() + 1;

                $combinedQuyCach = implode('_', $quyCachList);
                $pallet = Pallet::create($palletData + ['Code' => $palletData['MaNhaMay'] . substr($current_year, -2) . $current_week . '-' . str_pad($recordCount, 4, '0', STR_PAD_LEFT), 'QuyCach' => $combinedQuyCach]);
                $isDuplicate = false;
            }

            $palletDetails = $request->input('Details', []);

            $ldt = [];
            $ldt2 = [];
            $totalkl = 0;
            $toQty = 0;

            foreach ($palletDetails as $detailData) {
                $datainsert = [];
                $datainsert['palletID'] = $pallet->palletID;
                $datainsert['WhsCode2'] = $towarehouse;
                $datainsert['ItemCode'] = $detailData['ItemCode'];
                $datainsert['ItemName'] = $detailData['ItemName'];
                $datainsert['WhsCode'] = $detailData['WhsCode'];
                $datainsert['BatchNum'] = $detailData['BatchNum'];
                $datainsert['CDai'] = $detailData['CDai'] ? $detailData['CDai'] : 0;
                $datainsert['CDay'] = $detailData['CDay'] ? $detailData['CDay'] : 0;
                $datainsert['CRong'] = $detailData['CRong'] ? $detailData['CRong'] : 0;
                $datainsert['Qty'] = (float)$detailData['Qty'] * (float)$datainsert['CDai'] * (float)$datainsert['CDay'] * (float)$datainsert['CRong'] / 1000000000;
                $datainsert['Qty_T'] = $detailData['Qty'] ? $detailData['Qty'] : 0;
                pallet_details::create($datainsert);
                $ldt[] = [
                    "ItemCode" => $detailData['ItemCode'],
                    "WarehouseCode" =>  $towarehouse,
                    "FromWarehouseCode" => $detailData['WhsCode'],
                    "Quantity" =>  $datainsert['Qty'],
                    "BatchNumbers" => [
                        [
                            "BatchNumber" => $detailData['BatchNum'],
                            "Quantity" => $datainsert['Qty']
                        ]
                    ]
                ];
                $ldt2[] = [
                    "U_Item" => $detailData['ItemCode'],
                    "U_CRong" => $detailData['CRong'] ? $detailData['CRong'] : 0,
                    "U_CDay" => $detailData['CDay'] ? $detailData['CDay'] : 0,
                    "U_CDai" => $detailData['CDai'] ? $detailData['CDai'] : 0,
                    "U_Batch" => $detailData['BatchNum'],
                    "U_Quant" => $datainsert['Qty'],
                ];
                $toQty += (float)$datainsert['Qty'];
                $totalkl += (float)$detailData['CRong'] * (float)$detailData['CDai'] * (float)$detailData['CDay'] * (float)$detailData['Qty'] / 1000000000;
            }

            $body = [
                "U_Pallet" => $pallet->Code,
                "U_CreateBy" => Auth::user()->sap_id,
                "BPLID" => Auth::user()->branch,
                "Comments" => "WLAPP PORTAL tạo pallet xếp xấy",
                "StockTransferLines" => $ldt
            ];
            $body2 = [
                "U_Code" => $pallet->Code,
                "U_Status" => "CS",
                "U_Quant" => $toQty,
                "U_Vol" => max($totalkl, 1),
                "U_USER" => Auth::user()->sap_id,
                "G_PALLETLCollection" => $ldt2
            ];

            $response = Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                "Content-Type" => "application/json",
                "Accept" => "application/json",
                "Authorization" => "Basic " . BasicAuthToken(),
            ])->post(UrlSAPServiceLayer() . "/b1s/v1/StockTransfers", $body);
            $response2 = Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                "Content-Type" => "application/json",
                "Accept" => "application/json",
                "Authorization" => "Basic " . BasicAuthToken(),
            ])->post(UrlSAPServiceLayer() . "/b1s/v1/Pallet", $body2);

            $res = $response->json();
            $res2 = $response2->json();

            if (!empty($res['error']) && !empty($res2['error'])) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Failed to create pallet and details',
                    'error' => $res['error'],
                ], 500);
            } else {
                if (!$isDuplicate) {
                    Pallet::where('palletID', $pallet->palletID)->update([
                        'DocNum' => $res['DocNum'],
                        'DocEntry' => $res['DocEntry'],
                        'palletSAP' => $res2['DocEntry'],
                        'CreateBy' => auth()->id(),
                        'activeStatus' => 0,
                    ]);
                }
                DB::commit();

                return response()->json([
                    'message' => 'Pallet created successfully',
                    'data' => [
                        'isDuplicate' => $isDuplicate,
                        'pallet' => $pallet,
                        'res1' => $res,
                        'res2' => $res2,
                    ]
                ]);
            }
        } catch (\Exception | QueryException $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to create pallet and details',
                'error' => $e->getMessage(),
                'res1' => $res,
                'res2' => $res2,
            ], 500);
        }
    }



    function getLoaiGo()
    {
        try {
            $conDB = (new ConnectController)->connect_sap();

            $query = 'select * from "@G_SAY1"';
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt)) {
                // Handle execution error
                // die("Error executing SQL statement: " . odbc_errormsg());
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }

            $results = array();
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }
            odbc_close($conDB);
            return $results;
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    function lifecyleDrying(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'palletID' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        $data = Pallet::select(
            'pallets.palletID',
            'pallets.MaLo',
            'pallets.LoaiGo',
            'pallets.LyDo',
            'pallets.NgayNhap',
            'pallets.created_at as ngaytao',
            'pallets.Code',
            'pallets.LoadedIntoKilnDate',
            DB::raw("CONCAT(COALESCE(users6.first_name,''), ' ', COALESCE(users6.last_name,'')) as LoadedBy"),
            DB::raw("CONCAT(COALESCE(users5.first_name,''), ' ', COALESCE(users5.last_name,'')) as CreateBy"),
            'pallet_details.ItemCode',
            'pallet_details.ItemName',
            'pallet_details.Qty',
            'pallet_details.Qty_T',
            'pallet_details.CDai',
            'pallet_details.CRong',
            'pallet_details.CDay',
            'plandryings.Checked',
            DB::raw("CONCAT(users.first_name,' ', users.last_name) as checkby"),
            'plandryings.DateChecked',
            'plandryings.Review',
            DB::raw("CONCAT(users2.first_name,' ', users2.last_name) as ReviewBy"),
            'plandryings.reviewDate',
            DB::raw("CONCAT(users3.first_name,' ', users3.last_name) as RunBy"),
            'plandryings.runDate',
            DB::raw("CONCAT(users4.first_name,' ', users4.last_name) as CompletedBy"),
            'plandryings.CompletedDate',

        )
            ->join('pallet_details', 'pallets.palletID', '=', 'pallet_details.palletID')
            ->Join('users as users5', 'users5.id', '=', 'pallets.CreateBy')
            ->leftJoin('users as users6', 'users6.id', '=', 'pallets.LoadedBy')
            ->leftJoin('plan_detail', 'pallets.palletID', '=', 'plan_detail.pallet')
            ->leftJoin('plandryings', 'plan_detail.PlanID', '=', 'plandryings.PlanID')
            ->leftJoin('users', 'users.id', '=', 'plandryings.CheckedBy')
            ->leftJoin('users as users2', 'users2.id', '=', 'plandryings.ReviewBy')
            ->leftJoin('users as users3', 'users3.id', '=', 'plandryings.RunBy')
            ->leftJoin('users as users4', 'users4.id', '=', 'plandryings.CompletedBy')


            ->where('pallets.palletID', $request->palletID)
            ->get();
        $loaigo = $this->getLoaiGo();
        $data = collect($data)->map(function ($item) use ($loaigo) {
            $item['LoaiGo'] = collect($loaigo)->where('Code', $item['LoaiGo'])->first();
            return $item;
        });
        return response()->json(['data' => $data], 200);
    }
}
