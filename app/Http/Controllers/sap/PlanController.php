<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Pallet;
use App\Models\pallet_details;
use App\Models\plandryings;
use App\Models\worker;
use App\Models\plandetail;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class PlanController extends Controller
{
    function pickOven(Request $request)
    {
        try {
            $conDB = (new ConnectController)->connect_sap();

            DB::beginTransaction();
            $PlanData = $request->only(['Oven', 'Reason', 'Method']);
            $plandryings = plandryings::create($PlanData);

            $sql = 'Update  "@G_SAY3" set "U_status"=1 where "Code"=?';
            $stmt = odbc_prepare($conDB, $sql);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt, [$plandryings->Oven])) {
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }
            odbc_close($conDB);
            return response()->json($plandryings, 200);
        } catch (\Exception | QueryException $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    // danh sách kế hoạch sấy
    function listPlan(Request $request)
    {
        $pagination = plandryings::orderBy('PlanID', 'DESC')->where('Status', '<>', 3)->paginate(20);

        // Get the array representation of the pagination data
        $response = $pagination->toArray();

        // Manually add the next page link if it exists
        $response['next_page_url'] = $pagination->nextPageUrl();
        $response['prev_page_url'] = $pagination->previousPageUrl();

        return response()->json($response, 200);
    }
}
