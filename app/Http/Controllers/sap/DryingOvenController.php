<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pallet;
use App\Models\pallet_details;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class DryingOvenController extends Controller
{
    // save pallet
    function StorePallet(Request $request)
    {
        try {
            DB::beginTransaction();

            $palletData = $request->only(['LoaiGo', 'MaLo', 'LyDo', 'QuyCach', 'NgayNhap']);
            $pallet = Pallet::create($palletData);
            // Lấy danh sách chi tiết pallet từ request
            $palletDetails = $request->input('details', []);

            // Tạo các chi tiết pallet và liên kết chúng với Pallet mới tạo
            foreach ($palletDetails as $detailData) {
                $detailData['palletID'] = $pallet->palletID; // Ensure 'palletID' is correctly set
                pallet_details::create($detailData); // Ensure the model name is correct (PalletDetail instead of pallet_details)
            }

            // Trả về thông tin Pallet và chi tiết đã tạo
            DB::commit();

            return response()->json(['message' => 'Pallet created successfully', 'data' => ['pallet' => $pallet, 'details' => $palletDetails]]);
        } catch (QueryException $e) {
            // Rollback in case of an exception
            DB::rollBack();

            // Log or handle the exception as needed
            return response()->json(['message' => 'Failed to create pallet and details', 'error' => $e->getMessage()], 500);
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
