<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

/**
 * Class Auth.
 *
 * @author  Nguyen
 */
class AuthController extends Controller
{

    /**
     * @OA\Post(
     *      path="/api/login",
     *      operationId="login",
     *      tags={"Authentication"},
     *      summary="Log in a user",
     *      description="Logs in a user and returns a token.",
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"email","password"},
     *              @OA\Property(
     *                  property="email",
     *                  type="string",
     *                  format="email",
     *                  description="The email of the user",
     *                  example="user@example.com"
     *              ),
     *              @OA\Property(
     *                  property="password",
     *                  type="string",
     *                  format="password",
     *                  description="The password of the user",
     *                  example="password1234"
     *              )
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *          @OA\JsonContent(
     *              @OA\Property(
     *                  property="email",
     *                  type="string",
     *                  example="abc@gmail.com"
     *              ),
     *              @OA\Property(
     *                  property="access_token",
     *                  type="string",
     *                  example="dfwetewtwsafewt"
     *              ),
     *              @OA\Property(
     *                  property="avartar",
     *                  type="string",
     *                  example="img.ico"
     *              ),
     *              @OA\Property(
     *                  property="plant",
     *                  type="string",
     *                  example="TQ"
     *              ),
     *              @OA\Property(
     *                  property="first_name",
     *                  type="string",
     *                  example="dfwetewtwsafewt"
     *              ),
     *              @OA\Property(
     *                  property="sap_id",
     *                  type="string",
     *                  example="manager"
     *              )
     *          )
     *      ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthorized",
     *          @OA\JsonContent(
     *              @OA\Property(
     *                  property="message",
     *                  type="string",
     *                  example="Invalid email or password"
     *              )
     *          )
     *      )
     * )
     */
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
                    'error' => true,
                    'status_code' => 401,
                    'message' => 'Invalid email or password'
                ], 401);
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
                    'error' => true,
                    'message' => 'User not active'
                ], 403); // Sử dụng status code 403 để chỉ rõ người dùng không được phép truy cập
            }

            $tokenResult = $user->createToken('authToken')->plainTextToken;
            $cookie = cookie('token', $tokenResult, 60 * 24);
            /*
                @Responses
            */
            return response()->json([
                'status_code' => 200,
                'access_token' => $tokenResult,
                'token_type' => 'Bearer',
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'plant' => $user->plant,
                'sap_id' => $user->sap_id
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
            'msg' => 'Successfully logged out'
        ], 200);
    }
}
