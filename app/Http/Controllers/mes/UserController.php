<?php

namespace App\Http\Controllers\mes;

use App\Http\Controllers\Controller;
use App\Models\User;
use Auth;
use DB;
use Exception;
use Illuminate\Http\Request;


class UserController extends Controller
{
    // Lấy danh sách thủ kho theo nhà máy.
    public function danhSachThuKho()
    {
        try {
            $plantId = Auth::user()->plant;
            $users = DB::table('users as u')
                ->join('roles as r', 'u.role', '=', 'r.id')
                ->join('role_has_permissions as rhp', 'r.id', '=', 'rhp.role_id')
                ->join('permissions as p', 'rhp.permission_id', '=', 'p.id')
                ->where('p.name', 'xacnhanlosay')
                ->where('u.plant', $plantId)
                ->select('u.*', 'p.*')
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
