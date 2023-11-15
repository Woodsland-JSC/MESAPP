<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pallet;
use App\Models\pallet_details;
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

            $palletData = $request->only(['LoaiGo', 'MaLo', 'LyDo', 'QuyCach', 'NgayNhap']);
            $pallet = Pallet::create($palletData);
            // Lấy danh sách chi tiết pallet từ request
            $palletDetails = $request->input('details', []);
            $ldt = [];
            // Tạo các chi tiết pallet và liên kết chúng với Pallet mới tạo
            foreach ($palletDetails as $detailData) {
                $detailData['palletID'] = $pallet->palletID; // Ensure 'palletID' is correctly set
                pallet_details::create($detailData); // Ensure the model name is correct (PalletDetail instead of pallet_details)
                $ldt[] = [
                    "ItemCode" => $detailData['ItemCode'],
                    "Quantity" => $detailData['Qty'],
                    "FromWarehouseCode" => $detailData['WhsCode'],
                    "WarehouseCode" =>  $whs,
                    "BatchNumbers" => [[
                        "BatchNumber" => $detailData['BatchNum'],
                        "Quantity" => $detailData['Qty']
                    ]],
                ];
            }
            // Data body
            $body = [
                "BPLID" => Auth::user()->branch,
                "U_CreateBy" => Auth::user()->sap_id,
                "U_Pallet" => $pallet->Code,
                "Comments" => "WLAPP PORTAL tạo pallet xếp xấy",
                "StockTransferLines" => $ldt
            ];
            // Make a request to the service layer
            $response = Http::withOptions([
                'verify' => false,
            ])->withHeaders([
                "Content-Type" => "application/json",
                "Accept" => "application/json",
                "Authorization" => "Basic " . BasicAuthToken(),
            ])->post(UrlSAPServiceLayer() . "/b1s/v1/StockTransfers", $body);


            $res = $response->json();
            // update data
            if (!empty($res['error'])) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Failed to create pallet and details',
                    'error' => $res['error'],
                    'data' => $body
                ], 500);
            } else {

                $pallet->update([
                    'DocNum' => $res['DocNum'],
                    'DocEntry' => $res['DocEntry'],
                    'CreateBy' => auth()->id(),

                ]);
                DB::commit();
                // Trả về thông tin Pallet và chi tiết đã tạo
                return response()->json([
                    'message' => 'Pallet created successfully',
                    'data' => [
                        'pallet' => $pallet,
                        'details' => $res['DocEntry'],

                    ]
                ]);
            }
        } catch (\Exception | QueryException $e) {
            // Rollback in case of an exception
            DB::rollBack();

            // Log or handle the exception as needed
            return response()->json(['message' => 'Failed to create pallet and details', 'error' => $e->getMessage() . "sss" . $res['error']['message']['value']], 500);
        }
    }
    // get pallet
    function index(Request $request)
    {
        $pagination = Pallet::orderBy('palletID', 'DESC')->paginate(20);

        // Get the array representation of the pagination data
        $response = $pagination->toArray();

        // Manually add the next page link if it exists
        $response['next_page_url'] = $pagination->nextPageUrl();
        $response['prev_page_url'] = $pagination->previousPageUrl();

        return response()->json($response, 200);
    }
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
}
