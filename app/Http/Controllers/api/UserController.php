<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Auth;
class UserController extends Controller
{

    function index(Request $request)
    {
        $users = User::orderBy('id', 'DESC')->get();

        return response()->json($users, 200);
    }
    // xem chi tiết thông tin user theo id
    function UserById($id)
    {
        try {
            $user = User::findOrFail($id);
            $roles = Role::pluck('name', 'name')->all();
            $userRole = $user->getRoleNames();
            $permissions = $user->roles->flatMap->permissions->pluck('name')->unique()->toArray();

            if ($user->avatar) {
                $user->avatar = asset('storage/' . $user->avatar);
            }

            if ($user->imagesign) {
                $user->imagesign = asset('storage/' . $user->imagesign);
            }

            return response()->json(['user' => $user, 'UserRole' => $userRole, 'role' => $roles, 'permissions' => $permissions], 200);
        } catch (\Exception $e) {
            // Trả về một response lỗi khi không tìm thấy user
            return response()->json(['error' => 'User not found'], 404);
        }
    }

    function blockUser($id)
    {
        $user = User::find($id);

        if ($user) {
            $user->is_block = $user->is_block == 1 ? 0 : 1;
            $user->save();

            return response()->json(['message' => 'Update successfully'], 200);
        }

        return response()->json(['error' => 'User not found'], 404);
    }

    function create(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'first_name' => 'required',
            'last_name' => 'required',
            'gender' => 'required',
            'email' => 'nullable|email|unique:users,email',
            'username' => 'required|unique:users,username',
            'password' => 'required',
            'plant' => 'required',
            'sap_id' => 'required|unique:users,sap_id',
            'integration_id' => 'required',
            'roles' => 'required|exists:roles,name',
            'branch' => 'required',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'imagesign' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',

        ]);

        // Check if validation fails
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }

        // Get validated data
        $input = $validator->validated();
        $input = $request->all();
        $input['password'] = Hash::make($input['password']);
        if($input['email'] == null){
            $input['email'] = $input['username'].'@wl.com';
        };
        $user = User::create($input);
        $user->assignRole([$request->input('roles')]);

        if ($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $avatarPath = $avatar->storeAs('public/avatars/' . $user->id, $avatar->getClientOriginalName());

            $avatarPathWithoutPublic = str_replace('public/', '', $avatarPath);
            $user->avatar = $avatarPathWithoutPublic;
            $user->save();
        }

        if ($request->hasFile('imagesign')) {
            $signature = $request->file('imagesign');
            $signaturePath = $signature->storeAs('public/signatures/' . $user->id, $signature->getClientOriginalName());

            $signaturePathWithoutPublic = str_replace('public/', '', $signaturePath);
            $user->signature = $signaturePathWithoutPublic;
            $user->save();
        }

        // Return a successful response
        return response()->json(['message' => 'User created successfully', 'user' => $user], 200); // 20 Created status code
    }
    function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required',
            'last_name' => 'required',
            'email' => 'required|email|unique:users,email,' . $id,
            'username' => 'required|unique:users,username,' . $id,
            'password' => 'nullable',
            'plant' => 'required',
            'sap_id' => 'required|unique:users,sap_id,' . $id,
            'roles' => 'required',
            'branch' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        $input = $request->all();

        if (!empty($input['password'])) {
            $input['password'] = Hash::make($input['password']);
        } else {
            $input = Arr::except($input, array('password'));
        }

        $user = User::find($id);

        if ($user->sap_id == $request->input('sap_id')) {
            unset($input['sap_id']);
        }

        if ($request->has('avatar')) {
            $avatar = $request->file('avatar');

            if ($request->avatar == '-1') {
                // Delete avatar file and set avatar field to null
                if ($user->avatar) {
                    Storage::delete('public/' . $user->avatar);
                    $input['avatar'] = null;
                }
            } elseif ($avatar) {
                // Delete old avatar file
                if ($user->avatar) {
                    Storage::delete('public/' . $user->avatar);
                }

                // Upload new avatar file
                $avatar = $request->file('avatar');
                $avatarPath = $avatar->storeAs('public/avatars/' . $user->id, $avatar->getClientOriginalName());

                $avatarPathWithoutPublic = str_replace('public/', '', $avatarPath);
                $input['avatar'] = $avatarPathWithoutPublic;
            }
        }

        if ($request->has('imagesign')) {
            $signature = $request->file('imagesign');

            if ($request->imagesign == '-1') {
                // Delete signature file and set signature field to null
                if ($user->imagesign) {
                    Storage::delete('public/' . $user->imagesign);
                    $input['imagesign'] = null;
                }
            } elseif ($signature) {
                // Delete old signature file
                if ($user->imagesign) {
                    Storage::delete('public/' . $user->imagesign);
                }

                // Upload new signature file
                $signature = $request->file('imagesign');
                $signaturePath = $signature->storeAs('public/signatures/' . $user->id, $signature->getClientOriginalName());

                $signaturePathWithoutPublic = str_replace('public/', '', $signaturePath);
                $input['imagesign'] = $signaturePathWithoutPublic;
            }
        }

        unset($input['_method']);



        $user->update($input);

        DB::table('model_has_roles')->where('model_id', $id)->delete();

        $user->assignRole([$request->input('roles')]);

        return response()->json(['message' => 'User updated successfully', 'user' => $user], 200);
    }

    public function updateProfile(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required',
            'last_name' => 'required',
            'gender' => 'required|in:male,female',
            // 'avatar' => 'nullable|string|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        $input = $request->only(['first_name', 'last_name', 'gender']);

        $user = User::find($id);

        if ($request->has('avatar')) {
            $avatar = $request->file('avatar');

            if ($request->avatar == '-1') {
                // Delete avatar file and set avatar field to null
                if ($user->avatar) {
                    Storage::delete('public/' . $user->avatar);
                    $input['avatar'] = null;
                }
            } elseif ($avatar) {
                // Delete old avatar file
                if ($user->avatar) {
                    Storage::delete('public/' . $user->avatar);
                }

                // Upload new avatar file
                $avatarPath = $avatar->storeAs('public/avatars/' . $user->id, $avatar->getClientOriginalName());
                $avatarPathWithoutPublic = str_replace('public/', '', $avatarPath);
                $input['avatar'] = $avatarPathWithoutPublic;
            }
        }

        if ($request->has('imagesign')) {
            $signature = $request->file('imagesign');

            if ($request->imagesign == '-1') {
                // Delete signature file and set signature field to null
                if ($user->imagesign) {
                    Storage::delete('public/' . $user->imagesign);
                    $input['imagesign'] = null;
                }
            } elseif ($signature) {
                // Delete old signature file
                if ($user->imagesign) {
                    Storage::delete('public/' . $user->imagesign);
                }

                // Upload new signature file
                $signaturePath = $signature->storeAs('public/signatures/' . $user->id, $signature->getClientOriginalName());
                $signaturePathWithoutPublic = str_replace('public/', '', $signaturePath);
                $input['imagesign'] = $signaturePathWithoutPublic;
            }
        }

        $user->update($input);

        if ($user->avatar) {
            $user->avatar = asset('storage/' . $user->avatar);
        }

        return response()->json(['message' => 'Profile updated successfully', 'user' => $user], 200);
    }

    public function changePassword(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'oldPassword' => 'required',
            'newPassword' => 'required|min:8|max:15|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'Không tìm thấy user, hoặc user bị block'], 404);
        }

        if (!Hash::check($request->input('oldPassword'), $user->password)) {
            return response()->json(['error' => 'Mật khẩu cũ không đúng'], 422);
        }

        $user->update([
            'password' => Hash::make($request->input('newPassword')),
        ]);

        return response()->json(['message' => 'Password updated successfully'], 200);
    }
    public function delete($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $avatarPath = 'public/avatars/' . $user->id;

        if (Storage::exists($avatarPath)) {
            Storage::deleteDirectory($avatarPath);
        }

        DB::table('model_has_roles')->where('model_id', $id)->delete();

        // Xóa người dùng
        $user->delete();

        return response()->json(['message' => 'User deleted successfully'], 200);
    }

    function importuser(Request $request)
    {

        $data = Excel::toArray([], $request->file);
        $headerRow = $data[0][0];
        try
        { // Process the data rows
            db::beginTransaction();
            for ($i = 1; $i < count($data[0]); $i++) {
                $rowData = $data[0][$i];
                // Extract the CustCode value
                $input['first_name'] = $rowData[0];
                $input['last_name'] = $rowData[1];
                $input['username']= $rowData[2];
                $input['email']=$rowData[3];

                $input['password'] = Hash::make($rowData[4]);
                if($input['email'] == null){
                    $input['email'] = $input['username'].'@wl.com';
                };
                $input['sap_id']=$rowData[5];
                $input['branch']=$rowData[7];
                $input['plant']=$rowData[8];
                $input['integration_id']=1;
                $user = User::create($input);
                $user->assignRole([$rowData[6]]);

            }
            db::commit();
            return response()->json(['message' => 'import users successfully'], 200); // 20 Created status code

        } catch (\Exception $e) {
            db::rollback();
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    function viewimportuser()
    {
        // $user = User::find(1);
        dd( Auth::user()->first_name);
        return view('importuser');
    }
    function syncFromSap(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required',
            'last_name' => 'required',
            'username' => 'required|unique:users,username',
            'password' => 'required',
            'plant' => 'required',
            'sap_id' => 'required|unique:users,sap_id',
            'roles' => 'required|exists:roles,name',
            'branch' => 'required'


        ]);

        try
        { // Process the data rows

            $input['first_name'] = $request->input('first_name');
            $input['last_name'] = $request->input('last_name');
            $input['username']= $request->input('username');
            $input['email']=$input['username'].'@wl.com';
            $input['password'] = Hash::make(123456);

            $input['sap_id']=$request->input('sap_id');
            $input['branch']=$request->input('branch');
            $input['plant']=$request->input('plant');
            $input['integration_id']=1;
            db::beginTransaction();
            $user= User::firstOrNew( $input);
            $user->assignRole([$request->input('roles')]);
            db::commit();
            return response()->json(['message' => 'created users successfully'], 200); // 20 Created status code
        } catch (\Exception $e) {
            db::rollback();
            return response()->json(['error' => $e->getMessage()], 422);
        }

    }
}
