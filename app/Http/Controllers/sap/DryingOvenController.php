<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pallet;
use App\Models\pallet_details;
// use App\Models\Warehouse;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Carbon;


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

            $firstDetail = $pallet->details->first();
            $sumQuantity = 0;
            $lyDo = '';
            if ($firstDetail) {
                if ($pallet->LyDo == "SL") {
                    $sumQuantity = number_format($pallet->details->sum('Qty'), 6, '.', '');
                } else {
                    $sumQuantity = $pallet->details->sum('Qty_T');
                }
                $lyDo = $pallet->LyDo;
            }

            $result[] = [
                'pallet_id' => $pallet->palletID,
                'pallet_code' => $pallet->Code,
                'created_date' => $pallet->NgayNhap,
                'QuyCach' => $pallet->QuyCach,
                'LyDo' => $lyDo,
                'sum_quantity' => $sumQuantity,
                'length' => $firstDetail ? $firstDetail->CDai : 0,
                'width' => $firstDetail ? $firstDetail->CRong : null,
                'thickness' => $firstDetail ? $firstDetail->CDay : null,
                'activeStatus' => $pallet->activeStatus,
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
                    'CreateBy' => Auth::user()->id,

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
    //         // 0. Khởi tạo giao dịch và khởi tạo biến 
    //         DB::beginTransaction();
    //         $res = null;
    //         $res2 = null;
    //         $current_week = now()->format('W');
    //         $current_year = now()->year;

    //         // 1. Lấy dữ liệu từ request và thông tin kho
    //         $palletData = $request->only(['LoaiGo', 'MaLo', 'LyDo', 'NgayNhap', 'MaNhaMay']);
    //         $quyCachList = collect($request->input('Details'))->pluck('QuyCach')->unique()->toArray();
    //         $towarehouse = WarehouseCS();

    //         // 1.1. Tạo pallet mới
    //         $recordCount = Pallet::whereYear('created_at', $current_year)
    //             ->whereRaw('WEEK(created_at,1) = ?', [$current_week])
    //             ->count() + 1;

    //         $combinedQuyCach = implode('_', $quyCachList);

    //         $pallet = Pallet::create($palletData + [
    //             'Code' => $palletData['MaNhaMay'] . substr($current_year, -2) . $current_week . '-' . str_pad($recordCount, 4, '0', STR_PAD_LEFT),
    //             'QuyCach' => $combinedQuyCach
    //         ]);

    //         // 2. Lấy dữ liệu Details và tạo chi tiết pallet
    //         $palletDetails = $request->input('Details', []);

    //         // 2.1. Khỏi tạo biến để lưu dữ liệu
    //         $ldt = [];
    //         $ldt2 = [];
    //         $totalkl = 0;
    //         $toQty = 0;

    //         // 2.2. Thực hiện lưu dữ liệu về data web
    //         foreach ($palletDetails as $detailData) {
    //             $datainsert = [];
    //             $datainsert['palletID'] = $pallet->palletID;
    //             $datainsert['WhsCode2'] = $towarehouse;
    //             $datainsert['ItemCode'] = $detailData['ItemCode'];
    //             $datainsert['ItemName'] = $detailData['ItemName'];
    //             $datainsert['WhsCode'] = $detailData['WhsCode'];
    //             $datainsert['BatchNum'] = $detailData['BatchNum'];

    //             if ($palletData['LyDo'] === 'SL') {
    //                 $datainsert['CDai_Site'] = $detailData['CDai'] ? $detailData['CDai'] : 0;
    //                 $datainsert['CDay_Site'] = $detailData['CDay'] ? $detailData['CDay'] : 0;
    //                 $datainsert['CRong_Site'] = $detailData['CRong'] ? $detailData['CRong'] : 0;
    //                 $datainsert['CDai'] =  0;
    //                 $datainsert['CDay'] = 0;
    //                 $datainsert['CRong'] = 0;
    //                 $quyCachSite = $detailData['CDay'] . 'x' . $detailData['CRong'] . 'x' . $detailData['CDai'];
    //                 $datainsert['QuyCachSite'] = $quyCachSite;
    //                 // Save the Qty
    //                 $datainsert['Qty'] = $detailData['Qty'] ? $detailData['Qty'] : 0;
    //                 $datainsert['Qty_T'] = 0;
    //             } else {
    //                 $datainsert['CDai'] = $detailData['CDai'] ? $detailData['CDai'] : 0;
    //                 $datainsert['CDay'] = $detailData['CDay'] ? $detailData['CDay'] : 0;
    //                 $datainsert['CRong'] = $detailData['CRong'] ? $detailData['CRong'] : 0;
    //                 $datainsert['Qty'] = (float)$detailData['Qty'] * (float)$datainsert['CDai'] * (float)$datainsert['CDay'] * (float)$datainsert['CRong'] / 1000000000;
    //                 $datainsert['Qty_T'] = $detailData['Qty'] ? $detailData['Qty'] : 0;
    //             }
    //             pallet_details::create($datainsert);

    //             // 2.3. Các dữ liệu được lưu vào các biến trước khi gửi về SAP
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
    //             // dd($ldt);
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

    //         $body = [
    //             "U_Pallet" => $pallet->Code,
    //             "U_PalletCreatedBy" => Auth::user()->username . ' - ' . Auth::user()->last_name . ' ' . Auth::user()->first_name,
    //             "BPLID" => Auth::user()->branch,
    //             "ToWarehouse" =>  $towarehouse,
    //             "FromWarehouse" => $detailData['WhsCode'],
    //             "Comments" => "WLAPP PORTAL tạo pallet xếp xấy",
    //             "StockTransferLines" => $ldt
    //         ];
    //         // dd($body);
    //         $body2 = [
    //             "U_Code" => $pallet->Code,
    //             "U_Status" => "CS",
    //             "U_Quant" => $toQty,
    //             "U_Vol" => max($totalkl, 1),
    //             "U_USER" => Auth::user()->username . ' - ' . Auth::user()->last_name . ' ' . Auth::user()->first_name,
    //             "G_PALLETLCollection" => $ldt2
    //         ];

    //         // 3. Thực hiện lưu dữ liệu về SAP và nhận kết quả trả về (mới, check kết quả API trước khi thực hiện API kế tiếp)
    //         $stockTransferResponse = Http::withOptions([
    //             'verify' => false,
    //         ])->withHeaders([
    //             "Content-Type" => "application/json",
    //             "Accept" => "application/json",
    //             "Authorization" => "Basic " . BasicAuthToken(),
    //         ])->post(UrlSAPServiceLayer() . "/b1s/v1/StockTransfers", $body);

    //         $stockTransferResult = $stockTransferResponse->json();

    //         // Kiểm tra lỗi API StockTransfers
    //         if (!empty($stockTransferResult['error'])) {
    //             DB::rollBack();
    //             return response()->json([
    //                 'message' => 'Failed to create stock transfer in SAP',
    //                 'error' => $stockTransferResult['error'],
    //             ], 500);
    //         }

    //         // 3.2 Nếu StockTransfers thành công, tiếp tục gọi API Pallet
    //         $palletResponse = Http::withOptions([
    //             'verify' => false,
    //         ])->withHeaders([
    //             "Content-Type" => "application/json",
    //             "Accept" => "application/json",
    //             "Authorization" => "Basic " . BasicAuthToken(),
    //         ])->post(UrlSAPServiceLayer() . "/b1s/v1/Pallet", $body2);

    //         $palletResult = $palletResponse->json();

    //         // Kiểm tra lỗi API Pallet
    //         if (!empty($palletResult['error'])) {
    //             // Thực hiện revert StockTransfers nếu có thể
    //             try {
    //                 $revertResponse = Http::withOptions([
    //                     'verify' => false,
    //                 ])->withHeaders([
    //                     "Content-Type" => "application/json",
    //                     "Accept" => "application/json",
    //                     "Authorization" => "Basic " . BasicAuthToken(),
    //                 ])->post(UrlSAPServiceLayer() . "/b1s/v1/StockTransfers({$stockTransferResult['DocEntry']})/Cancel");

    //                 if (!$revertResponse->successful()) {
    //                     // Log thông tin về việc không thể revert
    //                     \Log::error('Failed to revert StockTransfer', [
    //                         'docEntry' => $stockTransferResult['DocEntry'],
    //                         'error' => $revertResponse->json()
    //                     ]);
    //                 }
    //             } catch (\Exception $e) {
    //                 \Log::error('Exception when reverting StockTransfer', [
    //                     'docEntry' => $stockTransferResult['DocEntry'],
    //                     'error' => $e->getMessage()
    //                 ]);
    //             }

    //             DB::rollBack();
    //             return response()->json([
    //                 'message' => 'Failed to create pallet in SAP',
    //                 'error' => $palletResult['error'],
    //                 'note' => 'Stock transfer has been attempted to revert'
    //             ], 500);
    //         }

    //         // Trường hợp cả 2 API đều thành công
    //         Pallet::where('palletID', $pallet->palletID)->update([
    //             'DocNum' => $stockTransferResult['DocNum'],
    //             'DocEntry' => $stockTransferResult['DocEntry'],
    //             'palletSAP' => $palletResult['DocEntry'],
    //             'CreateBy' => Auth::user()->id,
    //             'activeStatus' => 0,
    //         ]);
    //         DB::commit();

    //         return response()->json([
    //             'message' => 'Pallet created successfully',
    //             'data' => [
    //                 'pallet' => $pallet,
    //                 'stockTransferResult' => $stockTransferResponse->json(),
    //                 'palletResult' => $palletResponse->json(),
    //             ]
    //         ]);
    //     } catch (\Exception | QueryException $e) {
    //         DB::rollBack();

    //         return response()->json([
    //             'message' => 'Failed to create pallet and details',
    //             'error' => $e->getMessage(),
    //             'stockTransferResult' => $stockTransferResponse->json(),
    //             'palletResult' => $palletResponse->json(),
    //         ], 500);
    //     }
    // }

    function StorePalletNew(Request $request)
    {
        // Initialize response variables outside try block to make them accessible in catch
        $stockTransferResponse = null;
        $palletResponse = null;
        $stockTransferResult = null;
        $pallet = null;

        try {
            // 0. Khởi tạo giao dịch và khởi tạo biến 
            DB::beginTransaction();
            $current_week = now()->format('W');
            $current_year = now()->year;

            // 1. Lấy dữ liệu từ request và thông tin kho
            $palletData = $request->only(['LoaiGo', 'MaLo', 'LyDo', 'NgayNhap', 'MaNhaMay']);
            $quyCachList = collect($request->input('Details'))->pluck('QuyCach')->unique()->toArray();
            $towarehouse = WarehouseCS();

            // 1.1. Tạo pallet mới
            $recordCount = Pallet::whereYear('created_at', $current_year)
                ->whereRaw('WEEK(created_at,1) = ?', [$current_week])
                ->count() + 1;

            $combinedQuyCach = implode('_', $quyCachList);

            $pallet = Pallet::create($palletData + [
                'Code' => $palletData['MaNhaMay'] . substr($current_year, -2) . $current_week . '-' . str_pad($recordCount, 4, '0', STR_PAD_LEFT),
                'QuyCach' => $combinedQuyCach
            ]);

            // 2. Lấy dữ liệu Details và tạo chi tiết pallet
            $palletDetails = $request->input('Details', []);

            // 2.1. Khỏi tạo biến để lưu dữ liệu
            $ldt = [];
            $ldt2 = [];
            $totalkl = 0;
            $toQty = 0;

            // 2.2. Thực hiện lưu dữ liệu về data web
            foreach ($palletDetails as $detailData) {
                $datainsert = [];
                $datainsert['palletID'] = $pallet->palletID;
                $datainsert['WhsCode2'] = $towarehouse;
                $datainsert['ItemCode'] = $detailData['ItemCode'];
                $datainsert['ItemName'] = $detailData['ItemName'];
                $datainsert['WhsCode'] = $detailData['WhsCode'];
                $datainsert['BatchNum'] = $detailData['BatchNum'];

                if ($palletData['LyDo'] === 'SL') {
                    $datainsert['CDai_Site'] = $detailData['CDai'] ? $detailData['CDai'] : 0;
                    $datainsert['CDay_Site'] = $detailData['CDay'] ? $detailData['CDay'] : 0;
                    $datainsert['CRong_Site'] = $detailData['CRong'] ? $detailData['CRong'] : 0;
                    $datainsert['CDai'] =  0;
                    $datainsert['CDay'] = 0;
                    $datainsert['CRong'] = 0;
                    $quyCachSite = $detailData['CDay'] . 'x' . $detailData['CRong'] . 'x' . $detailData['CDai'];
                    $datainsert['QuyCachSite'] = $quyCachSite;
                    // Save the Qty
                    $datainsert['Qty'] = $detailData['Qty'] ? $detailData['Qty'] : 0;
                    $datainsert['Qty_T'] = 0;
                } else {
                    $datainsert['CDai'] = $detailData['CDai'] ? $detailData['CDai'] : 0;
                    $datainsert['CDay'] = $detailData['CDay'] ? $detailData['CDay'] : 0;
                    $datainsert['CRong'] = $detailData['CRong'] ? $detailData['CRong'] : 0;
                    $datainsert['Qty'] = (float)$detailData['Qty'] * (float)$datainsert['CDai'] * (float)$datainsert['CDay'] * (float)$datainsert['CRong'] / 1000000000;
                    $datainsert['Qty_T'] = $detailData['Qty'] ? $detailData['Qty'] : 0;
                }
                pallet_details::create($datainsert);

                // 2.3. Các dữ liệu được lưu vào các biến trước khi gửi về SAP
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
                "U_PalletCreatedBy" => Auth::user()->username . ' - ' . Auth::user()->last_name . ' ' . Auth::user()->first_name,
                "BPLID" => Auth::user()->branch,
                "ToWarehouse" =>  $towarehouse,
                "FromWarehouse" => $detailData['WhsCode'],
                "Comments" => "WLAPP PORTAL tạo pallet xếp xấy",
                "StockTransferLines" => $ldt
            ];
            
            $body2 = [
                "U_Code" => $pallet->Code,
                "U_Status" => "CS",
                "U_Quant" => $toQty,
                "U_Vol" => max($totalkl, 1),
                "U_USER" => Auth::user()->username . ' - ' . Auth::user()->last_name . ' ' . Auth::user()->first_name,
                "G_PALLETLCollection" => $ldt2
            ];

            // 3. Thực hiện lưu dữ liệu về SAP và nhận kết quả trả về
            $stockTransferResponse = Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                "Content-Type" => "application/json",
                "Accept" => "application/json",
                "Authorization" => "Basic " . BasicAuthToken(),
            ])->post(UrlSAPServiceLayer() . "/b1s/v1/StockTransfers", $body);

            if (!$stockTransferResponse->successful()) {
                throw new \Exception('Failed to create stock transfer in SAP: ' . 
                    ($stockTransferResponse->json()['error']['message'] ?? $stockTransferResponse->body()));
            }

            $stockTransferResult = $stockTransferResponse->json();

            // 3.2 Nếu StockTransfers thành công, tiếp tục gọi API Pallet
            $palletResponse = Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                "Content-Type" => "application/json",
                "Accept" => "application/json",
                "Authorization" => "Basic " . BasicAuthToken(),
            ])->post(UrlSAPServiceLayer() . "/b1s/v1/Pallet", $body2);

            if (!$palletResponse->successful()) {
                // Thực hiện revert StockTransfers
                $revertResponse = Http::withOptions([
                    'verify' => false,
                ])->withHeaders([
                    "Content-Type" => "application/json",
                    "Accept" => "application/json",
                    "Authorization" => "Basic " . BasicAuthToken(),
                ])->post(UrlSAPServiceLayer() . "/b1s/v1/StockTransfers({$stockTransferResult['DocEntry']})/Cancel");
                
                if (!$revertResponse->successful()) {
                    \Log::error('Failed to revert StockTransfer', [
                        'docEntry' => $stockTransferResult['DocEntry'],
                        'error' => $revertResponse->json()
                    ]);
                }
                
                throw new \Exception('Failed to create pallet in SAP: ' . 
                    ($palletResponse->json()['error']['message'] ?? $palletResponse->body()));
            }

            $palletResult = $palletResponse->json();

            // 4. Trường hợp cả 2 API đều thành công, cập nhật thông tin pallet
            Pallet::where('palletID', $pallet->palletID)->update([
                'DocNum' => $stockTransferResult['DocNum'],
                'DocEntry' => $stockTransferResult['DocEntry'],
                'palletSAP' => $palletResult['DocEntry'],
                'CreateBy' => Auth::user()->id,
                'activeStatus' => 0,
            ]);
            
            DB::commit();

            return response()->json([
                'message' => 'Pallet created successfully',
                'data' => [
                    'pallet' => $pallet,
                    'stockTransferResult' => $stockTransferResult,
                    'palletResult' => $palletResult,
                ]
            ]);
        } catch (\Exception | QueryException $e) {
            DB::rollBack();
            \Log::error('Error creating pallet', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'stockTransferResponse' => $stockTransferResponse ? $stockTransferResponse->json() : null,
                'palletResponse' => $palletResponse ? $palletResponse->json() : null,
            ]);

            // Prepare error response with details
            $errorResponse = [
                'message' => 'Failed to create pallet and details',
                'error' => $e->getMessage()
            ];
            
            // Include API responses if available
            if ($stockTransferResponse) {
                $errorResponse['stockTransferResult'] = $stockTransferResponse->json();
            }
            
            if ($palletResponse) {
                $errorResponse['palletResult'] = $palletResponse->json();
            }
            
            return response()->json($errorResponse, 500);
        }
    }

    function DeletePallet(Request $request)
    {
        // Tạo biến để lưu trữ trạng thái của các bước vận hành 
        $stockTransferCancelResponse = null;
        $palletCancelResponse = null;
        $pallet = null;

        // dd($request->all());

        try {
            DB::beginTransaction();

            $pallet = Pallet::findOrFail($request->input('palletID'));

            if ($pallet->activeStatus != 0) {
                throw new \Exception('Only inactive pallets can be deleted');
            }

            dd($pallet->DocNum);

            // Hùy phiếu Stock Transfer ở SAP
            if ($pallet->DocNum) {
                $stockTransferCancelResponse = Http::withOptions([
                    'verify' => false,
                ])->withHeaders([
                    "Content-Type" => "application/json",
                    "Accept" => "application/json",
                    "Authorization" => "Basic " . BasicAuthToken(),
                ])->post(UrlSAPServiceLayer() . "/b1s/v1/StockTransfers({$pallet->DocEntry})/Cancel");

                if (!$stockTransferCancelResponse->successful()) {
                    throw new \Exception('Failed to cancel Stock Transfer in SAP: ' . 
                        ($stockTransferCancelResponse->json()['error']['message'] ?? $stockTransferCancelResponse->body()));
                }
            }

            // Xóa pallet ở SAP
            if ($pallet->palletSAP) {
                $palletCancelResponse = Http::withOptions([
                    'verify' => false,
                ])->withHeaders([
                    "Content-Type" => "application/json",
                    "Accept" => "application/json",
                    "Authorization" => "Basic " . BasicAuthToken(),
                ])->post(UrlSAPServiceLayer() . "/b1s/v1/Pallet({$pallet->palletSAP})/Cancel");

                if (!$palletCancelResponse->successful()) {
                    throw new \Exception('Failed to cancel Pallet in SAP: ' . 
                        ($palletCancelResponse->json()['error']['message'] ?? $palletCancelResponse->body()));
                }
            }

            // 5. Delete pallet details
            pallet_details::where('palletID', $pallet->palletID)->delete();

            // 6. Delete pallet
            $pallet->delete();

            // Commit the transaction
            DB::commit();

            return response()->json([
                'message' => 'Pallet deleted successfully',
                'data' => [
                    'palletCode' => $pallet->Code,
                    'stockTransferCancelStatus' => $stockTransferCancelResponse ? $stockTransferCancelResponse->successful() : null,
                    'palletCancelStatus' => $palletCancelResponse ? $palletCancelResponse->successful() : null
                ]
            ]);
        } catch (\Exception $e) {
            // Rollback the transaction
            DB::rollBack();

            // Log the error
            \Log::error('Error deleting pallet', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'stockTransferCancelResponse' => $stockTransferCancelResponse ? $stockTransferCancelResponse->json() : null,
                'palletCancelResponse' => $palletCancelResponse ? $palletCancelResponse->json() : null,
            ]);

            // Prepare error response
            $errorResponse = [
                'message' => 'Failed to delete pallet',
                'error' => $e->getMessage()
            ];

            // Include API responses if available
            if ($stockTransferCancelResponse) {
                $errorResponse['stockTransferCancelResult'] = $stockTransferCancelResponse->json();
            }
            
            if ($palletCancelResponse) {
                $errorResponse['palletCancelResult'] = $palletCancelResponse->json();
            }
            
            return response()->json($errorResponse, 500);
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

    // Delete Disabled Record
    function deleteDisabledRecord(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'PlanID' => 'required',
            'id' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        };

        try {
            DB::table('disability_rates_detail')->where('id', $request->id)->delete();

            $updatedData = DB::table('disability_rates_detail')
                ->where('PlanID', $request->PlanID)
                ->get();

            return response()->json([
                'status_code' => 200,
                'message' => 'Record deleted successfully',
                'updatedData' => $updatedData,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => $e->getMessage(),
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
            // 'pallet_details.Qty',
            // 'pallet_details.Qty_T',
            'pallet_details.CDai',
            'pallet_details.CRong',
            'pallet_details.CDay',
            'planDryings.Checked',
            DB::raw("CONCAT(users.first_name,' ', users.last_name) as checkby"),
            'planDryings.DateChecked',
            'planDryings.Review',
            DB::raw("CONCAT(users2.first_name,' ', users2.last_name) as ReviewBy"),
            'planDryings.reviewDate',
            DB::raw("CONCAT(users3.first_name,' ', users3.last_name) as RunBy"),
            'planDryings.runDate',
            DB::raw("CONCAT(users4.first_name,' ', users4.last_name) as CompletedBy"),
            'planDryings.CompletedDate',
            'totals.Qty',
            'totals.Qty_T',

        )
            ->join('pallet_details', 'pallets.palletID', '=', 'pallet_details.palletID')
            ->Join('users as users5', 'users5.id', '=', 'pallets.CreateBy')

            ->leftJoin('plan_detail', 'pallets.palletID', '=', 'plan_detail.pallet')
            ->leftJoin('planDryings', 'plan_detail.PlanID', '=', 'planDryings.PlanID')
            ->leftJoin('users', 'users.id', '=', 'planDryings.CheckedBy')
            ->leftJoin('users as users2', 'users2.id', '=', 'planDryings.ReviewBy')
            ->leftJoin('users as users3', 'users3.id', '=', 'planDryings.RunBy')
            ->leftJoin('users as users4', 'users4.id', '=', 'planDryings.CompletedBy')
            ->leftJoin('users as users6', 'users6.id', '=', 'pallets.LoadedBy')
            ->leftJoinSub(function ($query) {
                $query->select(
                    'pallet_details.palletID',
                    DB::raw('SUM(pallet_details.Qty) AS Qty'),
                    DB::raw('SUM(pallet_details.Qty_T) AS Qty_T')
                )
                    ->from('pallet_details')
                    ->groupBy('pallet_details.palletID');
            }, 'totals', function ($join) {
                $join->on('pallets.palletID', '=', 'totals.palletID');
            })
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
