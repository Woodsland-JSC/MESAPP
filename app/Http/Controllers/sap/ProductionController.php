<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductionController extends Controller
{
    //
    function index()
    {
        $data = [
            [
                'ItemCode' => '0001',
                'ItemName' => 'Item test',
                'Qty' => 20
            ],
            [
                'ItemCode' => '0002',
                'ItemName' => 'Item test',
                'Qty' => 50
            ],
            [
                'ItemCode' => '0003',
                'ItemName' => 'Item test',
                'Qty' => 50
            ]
        ];
        return response()->json($data, 200);
    }
    function receipts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ItemCode' => 'required',
            'Qty' => 'required|integer'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        return response()->json([
            'message' => 'nhập sản lượng thành công',
            'data' => $request->all()
        ], 200);
    }
    function allocate()
    {
        $data = [
            ["Production" => 10, "Qty" => 10, "input" => null],
            ["Production" => 12, "Qty" => 20, "input" => null]
        ];
        $totalQty = 25;

        foreach ($data as &$item) {
            // Sử dụng isset() thay vì so sánh với phần tử đầu tiên trong mảng
            if (isset($item['Qty']) && $item['Qty'] <= $totalQty) {
                $item['input'] = $item['Qty'];
                $totalQty -= $item['Qty'];
            } else {
                // Chỉ cập nhật giá trị nếu Qty lớn hơn 0
                if ($item['Qty'] > 0) {
                    $item['input'] = min($item['Qty'], $totalQty);
                    $totalQty -= $item['input'];
                } else {
                    $item['input'] = 0;
                }
            }
        }

        // Sử dụng array_filter với callback ngắn gọn hơn
        $filteredData = array_filter($data, fn ($item) => $item['input'] != 0);

        return response()->json(['data' => array_values($filteredData)]);
    }
}
