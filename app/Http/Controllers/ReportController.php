<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
class ReportController extends Controller
{
    /** Sấy gỗ */
    //functiion report QC BÁO CAO XỬ LÝ LỖI
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
    //báo cáo xếp chờ xấy
    function xepchosay(Request $request){
        $validate = Validator::make($request->all(), [
            'FromDate' => 'required|date',
            'ToDate' => 'required|date',
        ],[
            'FromDate.required' => 'The FromDate is required.',
            'FromDate.date' => 'The FromDate must be a valid date.',
            'ToDate.required' => 'The ToDate is required.',
            'ToDate.date' => 'The ToDate must be a valid date.',
        ]);
        if ($validate->fails()) {
            return response()->json(['error' => $validate->errors()], 400);
        }
        $branch = $request->input('branch');
        $plant = $request->input('plant');
        $fromDate = $request->FromDate;
        $ToDate =$request->ToDate;
        // Start the query and add conditions based on the request inputs
        $query = DB::table('gt_say_xepchoxay');

        if ($branch) {
            $query->where('branch', $branch);
        }

        if ($plant) {
            $query->where('plant', $plant);
        }

        if ($fromDate != null && $ToDate != null) {
            // where beetwen
            $query->whereRaw('DATE(created_at) BETWEEN ? AND ?', [$fromDate, $ToDate]);
        }
        // Get the results
        $data = $query->get();

        // Return the JSON response with the requested status code
        return response()->json($data);
    }
    function xepsay(Request $request){
        $branch = $request->input('branch');
        $plant = $request->input('plant');
        $fromDate = $request->input('fromDate');
        $ToDate = $request->input('ToDate');
        $oven= $request->input('oven');

        // Start the query and add conditions based on the request inputs
        $query = DB::table('gt_say_xepsaycbg');

        if ($branch) {
            $query->where('branch', $branch);
        }

        if ($plant) {
            $query->where('plant', $plant);
        }

        if ($fromDate && $ToDate) {
            // where beetwen
            $query->whereBetween('created_at', [$fromDate, $ToDate]);
        }
        
        if($oven!=null) {
            $query->where('Oven','=', $oven);
        }
        // Get the results
        $data = $query->get();

        // Return the JSON response with the requested status code
        return response()->json($data);
    }
    function bienbanvaolo(Request $request){
        $branch = $request->input('branch');
        $plant = $request->input('plant');
        $Oven = $request->input('oven');

        // Start the query and add conditions based on the request inputs
        $query = DB::table('say_bienbanvaolo');

        if ($branch) {
            $query->where('branch', $branch);
        }

        if ($plant) {
            $query->where('plant', $plant);
        }
        // Get the results
        $data = $query->get();
        // Return the JSON response with the requested status code
        return response()->json($data);
    }
    /** chế biến gỗ */
        
    function XuLyLoi(Request $request){
       
        $validate = Validator::make($request->all(), [
            'FromDate' => 'required|date',
            'ToDate' => 'required|date',
        ],[
            'FromDate.required' => 'The FromDate is required.',
            'FromDate.date' => 'The FromDate must be a valid date.',
            'ToDate.required' => 'The ToDate is required.',
            'ToDate.date' => 'The ToDate must be a valid date.',
        ]);
      
        if ($validate->fails()) {
            return response()->json(['error' => $validate->errors()], 400);
        }
        $branch = $request->input('branch');
        $plant = $request->input('plant');
        $fromDate = $request->FromDate;
        $ToDate =$request->ToDate;

        // Start the query and add conditions based on the request inputs
        $query = DB::table('gt_cbg_baocaoxulyloi');

        if ($branch) {
            $query->where('branch', $branch);
        }

        if ($plant) {
            $query->where('plant', $plant);
        }
       
        if ($fromDate != null && $ToDate != null) {
            // where beetwen
            $query->whereRaw('DATE(created_at) BETWEEN ? AND ?', [$fromDate, $ToDate]);
        }
      
        // Get the results
        $data = $query->get();

        // Return the JSON response with the requested status code
        return response()->json($data);
    }
}
