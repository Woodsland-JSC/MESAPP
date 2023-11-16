<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/users",
     *     tags={"MasterData"},
     *     summary="Get all list users",
     *     @OA\Response(
     *         response=200,
     *         description="successful operation",
     *         @OA\JsonContent(
     *            @OA\Property(
     *                  property="first_name",
     *                  type="string",
     *                  example="Judd Leuschke"
     *              ),
     *              @OA\Property(
     *                  property="email",
     *                  type="string",
     *                  example="mortimer45@example.org"
     *              ),
     *  *              @OA\Property(
     *                  property="plant",
     *                  type="string",
     *                  example="TQ"
     *              ),
     *  *              @OA\Property(
     *                  property="sap_id",
     *                  type="string",
     *                  example="manager"
     *              )
     *         )
     *     ),
     *     security={
     *         {"api_key": {}}
     *     }
     * )
     */
    // function index(Request $request)
    // {
    //     $pagination = User::orderBy('id', 'DESC')->paginate(20);

    //     // Get the array representation of the pagination data
    //     $response = $pagination->toArray();

    //     // Manually add the next page link if it exists
    //     $response['next_page_url'] = $pagination->nextPageUrl();
    //     $response['prev_page_url'] = $pagination->previousPageUrl();

    //     return response()->json($response, 200);
    // }
    function index(Request $request)
    {
        $pageSize = $request->get('pageSize', 20);
        $pagination = User::orderBy('id', 'DESC')->paginate($pageSize);
    
        // Get the array representation of the pagination data
        $response = $pagination->toArray();
    
        // Build the query parameters
        $base_url = $request->url();

        if ($pageSize != 20) {
            $query = http_build_query([
                'pageSize' => $pageSize,
                'page' => $pagination->currentPage() + 1, // next page
            ]);
        
            $response['next_page_url'] = $pagination->nextPageUrl()
                ? $base_url . '?' . $query
                : null;
        
            $query = http_build_query([
                'pageSize' => $pageSize,
                'page' => $pagination->currentPage() - 1, // previous page
            ]);
            
            $response['prev_page_url'] = $pagination->currentPage() > 1
                ? $base_url . '?' . $query
                : null;
        } else{
            // Manually add the next page link if it exists
            $response['next_page_url'] = $pagination->nextPageUrl();
            $response['prev_page_url'] = $pagination->previousPageUrl();
        }
    
        return response()->json($response, 200);
    }
    
    /**
     * @OA\Get(
     *     path="/api/users/find/{userId}",
     *     tags={"MasterData"},
     *     summary="Get detail user by id",
     *     @OA\Parameter(
     *         name="userId",
     *         in="path",
     *         description="ID of user that needs to be fetched",
     *         required=true,
     *         @OA\Schema(
     *             type="integer",
     *             format="int64",
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="successful operation",
     *         @OA\JsonContent(
     *            @OA\Property(
     *                  property="first_name",
     *                  type="string",
     *                  example="Judd Leuschke"
     *              ),
     *              @OA\Property(
     *                  property="email",
     *                  type="string",
     *                  example="mortimer45@example.org"
     *              ),
     *  *              @OA\Property(
     *                  property="plant",
     *                  type="string",
     *                  example="TQ"
     *              ),
     *  *              @OA\Property(
     *                  property="sap_id",
     *                  type="string",
     *                  example="manager"
     *              )
     *         )
     *     ),
     *     security={
     *         {"api_key": {}}
     *     }
     * )
     */
    function UserById($id)
    {
        $user = User::find($id);
        $roles = Role::pluck('name', 'name')->all();
        $userRole = $user->getRoleNames();
        return response()->json(['user' => $user, 'UserRole' => $userRole, 'role' => $roles], 200);
    }
    /**
     * @OA\Get(
     *     path="/api/users/block/{userId}",
     *     tags={"MasterData"},
     *     summary="Get detail user by id",
     *     @OA\Parameter(
     *         name="userId",
     *         in="path",
     *         description="ID of user that needs to be fetched",
     *         required=true,
     *         @OA\Schema(
     *             type="integer",
     *             format="int64",
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="successful operation",
     *     ),
     *     security={
     *         {"api_key": {}}
     *     }
     * )
     */
    function blockUser($id)
    {
        $user = User::find($id);

        if ($user) {
            $user->is_block = 1;
            $user->save();
        }
        return response()->json(['message' => 'update success'], 200);
    }
    /**
     * @OA\post(
     *     path="/api/users/create",
     *     tags={"MasterData"},
     *     summary="Create users",
     *     @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"first_name","last_name","email","password","confirm-password","plant","sap_id","role"},
     *              @OA\Property(
     *                  property="first_name",
     *                  type="string",
     *                  format="text",
     *                  description="The first_name of the user",
     *                  example="Tony"
     *              ),
     *              @OA\Property(
     *                  property="last_name",
     *                  type="string",
     *                  format="text",
     *                  description="The last_name of the user",
     *                  example="john"
     *              ),
     *              @OA\Property(
     *                  property="plant",
     *                  type="string",
     *                  format="text",
     *                  description="The plant of the user",
     *                  example="TQ"
     *              ),
     *              @OA\Property(
     *                  property="email",
     *                  type="string",
     *                  format="email",
     *                  description="The email of the user",
     *                  example="user@example.com"
     *              ),
     *              @OA\Property(
     *                  property="confirm-password",
     *                  type="string",
     *                  format="password",
     *                  description="The confirm-password of the user",
     *                  example="password1234"
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
     *     @OA\Response(
     *         response=200,
     *         description="successful operation",
     *         @OA\JsonContent(
     *            @OA\Property(
     *                  property="first_name",
     *                  type="string",
     *                  example="Judd Leuschke"
     *              ),
     *              @OA\Property(
     *                  property="email",
     *                  type="string",
     *                  example="mortimer45@example.org"
     *              ),
     *  *              @OA\Property(
     *                  property="plant",
     *                  type="string",
     *                  example="TQ"
     *              ),
     *  *              @OA\Property(
     *                  property="sap_id",
     *                  type="string",
     *                  example="manager"
     *              )
     *         )
     *     ),
     *     security={
     *         {"api_key": {}}
     *     }
     * )
     */
    function create(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'first_name' => 'required',
            'last_name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|same:confirm-password',
            'plant' => 'required',
            'sap_id' => 'required|unique:users,sap_id',
            'roles' => 'required|exists:roles,name',
            'branch' => 'required'
        ]);

        // Check if validation fails
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }

        // Get validated data
        $input = $validator->validated();
        $input = $request->all();
        $input['password'] = Hash::make($input['password']);

        $user = User::create($input);
        $user->assignRole([$request->input('roles')]);

        // Return a successful response
        return response()->json(['message' => 'User created successfully', 'user' => $user], 200); // 20 Created status code
    }
    function update(Request $request, $id)
    {

        $validator = Validator::make($request->all(), [
            'first_name' => 'required',
            'last_name' => 'required',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'same:confirm-password',
            'plant' => 'required',
            'sap_id' => 'required|unique:users,sap_id,' . $id,
            'roles' => 'required',
            'branch' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $input = $request->all();
        if (!empty($input['password'])) {
            $input['password'] = Hash::make($input['password']);
        } else {
            $input = Arr::except($input, array('password'));
        }

        $user = User::find($id);
        $user->update($input);
        DB::table('model_has_roles')->where('model_id', $id)->delete();

        $user->assignRole([$request->input('roles')]);

        return response()->json(['message' => 'User updated successfully', 'user' => $user], 200);
    }
}
