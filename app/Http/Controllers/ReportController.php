<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ReportController extends Controller
{
    /** Sấy gỗ */
    //functiion report QC BÁO CAO XỬ LÝ LỖI
    
    function XuLyLoi(Request $request){
      
    }
    function chitietgiaonhan(Request $request){
        //check request have data (have plant, branch,to )
        //status code =0 chưa nhân, 1 đã nhận, 2 trả lại, 3 dở dang
        // Retrieve branch, plant, to, and status code from the request
        $branch = $request->input('branch');
        $plant = $request->input('plant');
        $to = $request->input('To');
        $statusCode = $request->input('status_code'); // Default to 200 if not provided

        // Start the query and add conditions based on the request inputs
        $query = DB::table('gt_cbg_chitietgiaonhan');

        if ($branch) {
            $query->where('branch', $branch);
        }

        if ($plant) {
            $query->where('plant', $plant);
        }

        if ($to) {
            $query->where('ToHT', $to);
        }
        
        if($statusCode!=null) {
            $query->where('statuscode','=', $statusCode);
        }
        // Get the results
        $data = $query->get();

        // Return the JSON response with the requested status code
        return response()->json($data);
    }
    /** chế biến gỗ */
}
