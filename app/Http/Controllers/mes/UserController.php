<?php

namespace App\Http\Controllers\mes;

use App\Http\Controllers\Controller;
use App\Models\User;
use Auth;
use Exception;
use Illuminate\Http\Request;


class UserController extends Controller
{ 
    // Lấy danh sách thủ kho theo nhà máy.
    public function danhSachThuKho(){
        try {
            $plantId = Auth::user()->plant;
            $users  = User::query()
                ->where('plant', '=', $plantId)
                ->where('role', '=' , '')
                ->get();

            return response()->json([
                'users' => $users
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Lấy danh sách thủ kho có lỗi.'
            ], 500);
        }
    }
}