<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * @OA\Info(
 *      version="1.0.0",
 *      title="GTV Hubs",
 *      description="API APP WoodsLands",
 *      @OA\Contact(
 *          email="tnguyen.nguyen@vn.gt.com"
 *      ),
 *     @OA\License(
 *         name="Apache 2.0",
 *         url="http://www.apache.org/licenses/LICENSE-2.0.html"
 *     )
 * )
 */

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public function updateUserPasswords()
    {
        // Băm mật khẩu "123456"
        $hashedPassword = Hash::make('123456');

        // Danh sách username cần cập nhật
        $usernames = ['17Q097', '15Q272', '11T0501', '15Q101', '23Q1820'];

        // Cập nhật mật khẩu cho các user có username trong danh sách
        DB::table('users')
            ->whereIn('username', $usernames)
            ->update(['password' => $hashedPassword]);

        return "Passwords updated successfully!";
    }
}


