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
}
