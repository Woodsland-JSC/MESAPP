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
                'email' => 'email|required',
                'password' => 'required'
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
            }
            $credentials = request(['email', 'password']);

            if (!Auth::attempt($credentials)) {
                return response()->json([
                    'error' => true,
                    'status_code' => 401,
                    'message' => 'Invalid email or password'
                ], 401);
            }

            $user = User::where('email', $request->email)->first();
            $permissions = $user->roles->flatMap->permissions->pluck('name')->unique()->toArray();
            if (!Hash::check($request->password, $user->password, [])) {
                throw new \Exception('Error in Login');
            }
            $user = Auth::user();

            if ($user->is_block === 1) {
                // Giả sử cột 'isActive' trong database xác định trạng thái hoạt động của người dùng
                // Nếu người dùng không active, trả về lỗi 403 Forbidden
                Auth::logout(); // Đảm bảo đăng xuất người dùng nếu không active
                return response()->json([
                    'status_code' => 403,
                    'error' => true,
                    'message' => 'User not active'
                ], 403); // Sử dụng status code 403 để chỉ rõ người dùng không được phép truy cập
            }

            $tokenResult = $user->createToken('authToken')->plainTextToken;
            $cookie = cookie('token', $tokenResult, 60 * 24);

            if ($user->avatar) {
                $user->avatar = asset('storage/' . $user->avatar);
            }
            
            /*
                @Responses
            */
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
                'sap_id' => $user->sap_id,
                'branch' => $user->branch,
                'permissions' => $permissions

            ])->withCookie($cookie);
        } catch (\Exception $error) {
            return response()->json([
                'status_code' => 500,
                'message' => 'Error in Login' . $error,
                'error' => true,
            ]);
        }
    }
    /**
     * @OA\Get(
     *     path="/api/logout",
     *     tags={"Authentication"},
     *     summary="Logout",
     *     @OA\Response(
     *         response=200,
     *         description="successful operation",
     *         @OA\JsonContent(
     *            @OA\Property(
     *                  property="message",
     *                  type="string",
     *                  example="Successfully logged out"
     *              ),
     *         )
     *     ),
     *     security={
     *         {"api_key": {}}
     *     }
     * )
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'message' => 'Successfully logged out'
        ], 200);
    }
}
