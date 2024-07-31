<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
class ReportController extends Controller
{
    /** Sấy gỗ */
    //
    function chitietgiaonhan(Request $request) {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $branch = $request->input('branch');
        $plant = $request->input('plant');
        $to = $request->input('To');
        $statusCode = $request->input('status_code');
    
        $query = DB::table('gt_cbg_chitietgiaonhan');
    
        if ($branch) {
            $query->where('branch', $branch);
        }
    
        if ($plant) {
            $query->where('plant', $plant);
        }
    
        if ($to) {
            $toArray = is_array($to) ? $to : explode(',', trim($to, '[]'));
            $query->whereIn('ToHT', $toArray);
        }
        
        if (isset($statusCode)) {
            $query->where('statuscode', $statusCode);
        }

        if ($statusCode == 0) {
            if ($fromDate && $toDate) {
                $query->whereBetween('ngaygiao', [$fromDate, $toDate]);
            }
        } else {
            if ($fromDate && $toDate) {
                $query->whereBetween('ngaygiao', [$fromDate, $toDate])
                      ->whereBetween('ngaynhan', [$fromDate, $toDate]);
            }
        }
    
        $data = $query->get();
        $itemdistinct = $query->distinct()->pluck('ItemCode');
        $itemstring = "'".implode("','", $itemdistinct->toArray())."'";
        $dataQuyCach = qtycachIemSAP($itemstring);
        
        $dataQuyCachMap = [];
        foreach ($dataQuyCach as $item) {
            $dataQuyCachMap[$item['ItemCode']] = $item;
        }
        
        // Lặp qua originalData và thay thế các giá trị
        $updatedData = $data->map(function ($item) use ($dataQuyCachMap) {
            if (isset($dataQuyCachMap[$item->ItemCode])) {
                $item->CDay = $dataQuyCachMap[$item->ItemCode]['CDay'];
                $item->CRong = $dataQuyCachMap[$item->ItemCode]['CRong'];
                $item->CDai = $dataQuyCachMap[$item->ItemCode]['CDai'];
            }
            return $item;
        });
        
        return response()->json($updatedData);
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
        $itemdistinct = $query->distinct()->pluck('ItemCode');
        $itemstring = "'".implode("','", $itemdistinct->toArray())."'";
        $dataQuyCach = qtycachIemSAP($itemstring);
        
        $dataQuyCachMap = [];
        foreach ($dataQuyCach as $item) {
            $dataQuyCachMap[$item['ItemCode']] = $item;
        }
        
        // Lặp qua originalData và thay thế các giá trị
        $updatedData = $data->map(function ($item) use ($dataQuyCachMap) {
            if (isset($dataQuyCachMap[$item->ItemCode])) {
                $item->CDay = $dataQuyCachMap[$item->ItemCode]['CDay'];
                $item->CRong = $dataQuyCachMap[$item->ItemCode]['CRong'];
                $item->CDai = $dataQuyCachMap[$item->ItemCode]['CDai'];
            }
            return $item;
        });
        
        return response()->json($updatedData);
    }
    function xepsay(Request $request){
        $fromDate = $request->input('fromDate');
        $ToDate = $request->input('toDate');
        // $oven= $request->input('oven');

        // Start the query and add conditions based on the request inputs
        $query = DB::table('gt_say_xepsaycbg');

        if ($fromDate && $ToDate) {
            // where beetwen
            $query->whereBetween('created_at', [$fromDate, $ToDate]);
        }
    
        // Get the results
        $data = $query->get();
        $itemdistinct = $query->distinct()->pluck('ItemCode');
        $itemstring = "'".implode("','", $itemdistinct->toArray())."'";
        $dataQuyCach = qtycachIemSAP($itemstring);
        
        $dataQuyCachMap = [];
        foreach ($dataQuyCach as $item) {
            $dataQuyCachMap[$item['ItemCode']] = $item;
        }
        
        // Lặp qua originalData và thay thế các giá trị
        $updatedData = $data->map(function ($item) use ($dataQuyCachMap) {
            if (isset($dataQuyCachMap[$item->ItemCode])) {
                $item->CDay = $dataQuyCachMap[$item->ItemCode]['CDay'];
                $item->CRong = $dataQuyCachMap[$item->ItemCode]['CRong'];
                $item->CDai = $dataQuyCachMap[$item->ItemCode]['CDai'];
            }
            return $item;
        });
        
        return response()->json($updatedData);
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
        $itemdistinct = $query->distinct()->pluck('ItemCode');
        $itemstring = "'".implode("','", $itemdistinct->toArray())."'";
        $dataQuyCach = qtycachIemSAP($itemstring);
        
        $dataQuyCachMap = [];
        foreach ($dataQuyCach as $item) {
            $dataQuyCachMap[$item['ItemCode']] = $item;
        }
        
        // Lặp qua originalData và thay thế các giá trị
        $updatedData = $data->map(function ($item) use ($dataQuyCachMap) {
            if (isset($dataQuyCachMap[$item->ItemCode])) {
                $item->CDay = $dataQuyCachMap[$item->ItemCode]['CDay'];
                $item->CRong = $dataQuyCachMap[$item->ItemCode]['CRong'];
                $item->CDai = $dataQuyCachMap[$item->ItemCode]['CDai'];
            }
            return $item;
        });
        
        return response()->json($updatedData);
    }
    /** chế biến gỗ */
        
    function XuLyLoi(Request $request){
        $branch = $request->input('branch');
        $plant = $request->input('plant');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        // Start the query and add conditions based on the request inputs
        $query = DB::table('gt_cbg_baocaoxulyloi');

        if ($branch) {
            $query->where('branch', $branch);
        }

        if ($plant) {
            $query->where('plant', $plant);
        }
       
        if ($fromDate != null && $toDate != null) {
            // where beetwen
            $query->whereRaw('DATE(created_at) BETWEEN ? AND ?', [$fromDate, $toDate]);
        }
      
        // Get the results
        $data = $query->get();
        $itemdistinct = $query->distinct()->pluck('ItemCode');
        $itemstring = "'".implode("','", $itemdistinct->toArray())."'";
        $dataQuyCach = qtycachIemSAP($itemstring);
        
        $dataQuyCachMap = [];
        foreach ($dataQuyCach as $item) {
            $dataQuyCachMap[$item['ItemCode']] = $item;
        }
        
        // Lặp qua originalData và thay thế các giá trị
        $updatedData = $data->map(function ($item) use ($dataQuyCachMap) {
            if (isset($dataQuyCachMap[$item->ItemCode])) {
                $item->CDay = $dataQuyCachMap[$item->ItemCode]['CDay'];
                $item->CRong = $dataQuyCachMap[$item->ItemCode]['CRong'];
                $item->CDai = $dataQuyCachMap[$item->ItemCode]['CDai'];
            }
            return $item;
        });
        
        return response()->json($updatedData);
    }
}
