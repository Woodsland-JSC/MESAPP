<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

/**
 * Class Auth.
 *
 * @author  Nguyen
 */
class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required',
                'password' => 'required'
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
            }
            $loginField = filter_var($request->input('email'), FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
            $credentials = [
                $loginField => $request->input('email'),
                'password' => $request->input('password'),
            ];
            
            if (!Auth::attempt($credentials)) {
                return response()->json([
                    'error' => true,
                    'status_code' => 401,
                    'message' => 'Email hoặc mật khẩu không đúng'
                ], 401);
            }

            $user = Auth::user();
            $permissions = $user->roles->flatMap->permissions->pluck('name')->unique()->toArray();
            if (!Hash::check($request->password, $user->password, [])) {
                throw new \Exception('Error in Login');
            }
            $user = Auth::user();

            if ($user->is_block === 1) {
                Auth::logout(); // Đảm bảo đăng xuất người dùng nếu không active
                return response()->json([
                    'status_code' => 403,
                    'error' => true,
                    'message' => 'Tài khoản đã bị vô hiệu, hãy liên hệ admin của bạn.'
                ], 403); // Sử dụng status code 403 để chỉ rõ người dùng không được phép truy cập
            }

            $tokenResult = $user->createToken('authToken')->plainTextToken;
            $cookie = cookie('token', $tokenResult, 60 * 24);

            if ($user->avatar) {
                $user->avatar = asset('storage/' . $user->avatar);
            }

            return response()->json([
                'status_code' => 200,
                'access_token' => $tokenResult,
                'token_type' => 'Bearer',
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'plant' => $user->plant,
                'role' => $user->role,
                'branch' => $user->branch,
                'permissions' => $permissions,
            ])->withCookie($cookie);
        } catch (\Exception $error) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Có lỗi xảy ra khi đăng nhập.' . $error,
                'error' => true,
            ]);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'message' => 'Successfully logged out'
        ], 200);
    }
}
