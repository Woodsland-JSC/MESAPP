<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'email|required',
                'password' => 'required'
            ]);

            $credentials = request(['email', 'password']);

            if (!Auth::attempt($credentials)) {
                return response()->json([
                    'status_code' => 500,
                    'message' => 'Unauthorized'
                ],500);
            }

            $user = User::where('email', $request->email)->first();

            if (!Hash::check($request->password, $user->password, [])) {
                throw new \Exception('Error in Login');
            }
            $user = Auth::user();
            if ($user->is_block === 1) { // Giả sử cột 'isActive' trong database xác định trạng thái hoạt động của người dùng
                // Nếu người dùng không active, trả về lỗi 403 Forbidden
                Auth::logout(); // Đảm bảo đăng xuất người dùng nếu không active
                return response()->json([
                    'status_code' => 403,
                    'message' => 'User not active'
                ], 403); // Sử dụng status code 403 để chỉ rõ người dùng không được phép truy cập
            }

            $tokenResult = $user->createToken('authToken')->plainTextToken;
            $cookie = cookie('token', $tokenResult, 60 * 24);
            return response()->json([
                'status_code' => 200,
                'access_token' => $tokenResult,
                'token_type' => 'Bearer',
                'first_name'=>$user->first_name,
                'last_name'=>$user->last_name,
                'email'=>$user->email,
                'avatar'=>$user->avatar,
                'plant'=>$user->plant,
                'sap_id'=>$user->sap_id
            ])->withCookie($cookie);
        } catch (\Exception $error) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error in Login',
                'error' => $error,
            ]);
        }
    }
}
