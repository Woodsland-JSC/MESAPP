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

class DryingOvenController extends Controller
{
    // save pallet
    function StorePallet(Request $request)
    {

        try {
            DB::beginTransaction();
            $whs = WarehouseCS();

            $palletData = $request->only(['LoaiGo', 'MaLo', 'LyDo', 'NgayNhap']);
            $pallet = Pallet::create($palletData);
            // Lấy danh sách chi tiết pallet từ request
            $palletDetails = $request->input('details', []);

            // if (count($palletDetails) > 1) {
            //     return response()->json(['message' => 'Failed to create pallet and details', 'error' => 'so batch num lon hon 1'], 500);
            // }
            $ldt = [];
            // Tạo các chi tiết pallet và liên kết chúng với Pallet mới tạo
            foreach ($palletDetails as $detailData) {
                $detailData['palletID'] = $pallet->palletID; // Ensure 'palletID' is correctly set
                pallet_details::create($detailData); // Ensure the model name is correct (PalletDetail instead of pallet_details)
            }
            // Data body

            $body = [
                "ItemNo" => $palletDetails[0]['ItemCode'],
                "ProductionOrderType" => "bopotSpecial",
                "PlannedQuantity" => array_sum(array_column($request->input('details', []), 'Qty')),
                "U_CreateBy" => Auth::user()->sap_id,
                //"U_Pallet" => $pallet->Code,
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
    function index(Request $request)
    {
        $pallet = Pallet::orderBy('palletID', 'DESC')->get();

        return response()->json($pallet, 200);
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
    function StorePalletNew(Request $request)
    {

        try {
            DB::beginTransaction();
            $palletData = $request->only(['LoaiGo', 'MaLo', 'LyDo', 'NgayNhap']);
            $towarehouse = Warehouse::where('flag', 'CS')
            ->WHERE('branch', Auth::user()->branch)
            ->where('FAC',Auth::user()->plant)
            ->first()->WhsCode;
            $pallet = Pallet::create($palletData);
            // Lấy danh sách chi tiết pallet từ request
            $palletDetails = $request->input('Details', []);
            // Tạo các chi tiết pallet và liên kết chúng với Pallet mới tạo
            $ldt = [];
            $ldt2 = [];
            $totalkl = 0;
            $toQty = 0;
            foreach ($palletDetails as $detailData) {

                $datainsert = [];
                $datainsert['palletID'] = $pallet->palletID;
                $datainsert['WhsCode2'] = $towarehouse;
                $datainsert['ItemCode'] = $detailData['ItemCode'];
                $datainsert['WhsCode'] = $detailData['WhsCode'];
                $datainsert['BatchNum'] = $detailData['BatchNum'];
                $datainsert['CDai'] = $detailData['CDai'];
                $datainsert['CDay'] = $detailData['CDay'];
                $datainsert['CRong'] = $detailData['CRong'];
                $datainsert['Qty'] = $detailData['Qty'];
                pallet_details::create($datainsert);
                $ldt[] = [

                    "ItemCode" => $detailData['ItemCode'],
                    "WarehouseCode" =>  $towarehouse,
                    "FromWarehouseCode" => $detailData['WhsCode'],
                    "Quantity" =>  $detailData['Qty'],
                    "BatchNumbers" => [
                        [
                            "BatchNumber" => $detailData['BatchNum'],
                            "Quantity" => $detailData['Qty']
                        ]

                    ]

                ];
                $ldt2[] = [
                    "U_Item" => $detailData['ItemCode'],
                    "U_CRong" => $detailData['CRong'],
                    "U_CDay" => $detailData['CDay'],
                    "U_CDai" => $detailData['CDai'],
                    "U_Batch" => $detailData['BatchNum'],
                    "U_Quant" => $detailData['Qty'],
                ];
                $toQty += (float)$detailData['Qty'];
                $totalkl += (float)$detailData['CRong'] * (float)$detailData['CDai'] * (float)$detailData['CDay'] * (float)$detailData['Qty'];
            }

            // Data body

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

            // Make a request to the service layer
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

            // update data
            if (!empty($res['error']) && !empty($res2['error'])) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Failed to create pallet and details',
                    'error' => $res['error'],
                ], 500);
            } else {

                Pallet::where('palletID',$pallet->palletID)->update([
                    'DocNum' => $res['DocNum'],
                    'DocEntry' => $res['DocEntry'],
                    'palletSAP' => $res2['DocEntry'],
                    'CreateBy' => auth()->id(),

                ]);
                DB::commit();
                // Trả về thông tin Pallet và chi tiết đã tạo
                return response()->json([
                    'message' => 'Pallet created successfully',
                    'data' => [
                        'pallet' => $pallet,
                        // 'details' => $res,
                        // 'details2' => $res2,
                    ]
                ]);
            }
            DB::commit();
            // Trả về thông tin Pallet và chi tiết đã tạo
            return response()->json([
                'message' => 'Pallet created successfully',
                'data' => [
                    'pallet' => $pallet,
                ]
            ]);
        } catch (\Exception | QueryException $e) {
            // Rollback in case of an exception
            DB::rollBack();

            // Log or handle the exception as needed
            return response()->json(['message' => 'Failed to create pallet and details', 'error' => $e->getMessage()], 500);
        }
    }
}
