<?php

namespace App\Http\Controllers\mes;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\mes\PalletLogService;
use Auth;
use DB;
use Exception;
use Illuminate\Http\Request;


class PalletLogController extends Controller
{
    // Lấy danh sách thủ kho theo nhà máy.
    public function getLogsByFactory(Request $request, PalletLogService $palletLogService)
    {
        $params = $request->query();
        $data = $palletLogService->getLogsByFactory($params);
        return response()->json([
            'reports' => $data
        ]);
    }
}
