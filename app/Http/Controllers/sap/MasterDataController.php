<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Controllers\sap\ConnectController;
use Illuminate\Support\Facades\Auth;
use App\Models\Reasons;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

/**
 * Class MasterData.
 *
 * @author  Nguyen
 */
class MasterDataController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/items",
     *     tags={"MasterData"},
     *     summary="Get all item master data",
     *     @OA\Response(
     *         response=200,
     *         description="successful operation",
     *         @OA\JsonContent(
     *            @OA\Property(
     *                  property="ItemCode",
     *                  type="string",
     *                  example="00001"
     *              ),
     *              @OA\Property(
     *                  property="ItemName",
     *                  type="string",
     *                  example="abcd"
     *              ),
     *         )
     *     ),
     *     security={
     *         {"api_key": {}}
     *     }
     * )
     */
    function ItemMasterData(Request $request)
    {
        try {
            $conDB = (new ConnectController)->connect_sap();

            $query = 'select "ItemCode","ItemName" from OITM where "Series"=? and ("OnHand"-"IsCommited"+"OnOrder")>0';
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt, ['74'])) {
                // Handle execution error
                // die("Error executing SQL statement: " . odbc_errormsg());
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }

            $results = array();
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }
            odbc_close($conDB);
            /**
             * Data example:
             *  [
             *      {
             *          "ItemCode": "IB0000001",
             *          "ItemName": "SKOGSTA "
             *      },
             *      {
             *          "ItemCode": "IB0000002",
             *          "ItemName": "SKOGSTA )"
             *      },
             *      ...
             *   ]
             */
            return response()->json($results, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    function WarehouseMasterData(Request $request)
    {
        try {
            $conDB = (new ConnectController)->connect_sap();

            $query = 'select "WhsCode","WhsName" from OWHS';
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt,)) {
                // Handle execution error
                // die("Error executing SQL statement: " . odbc_errormsg());
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }

            $results = array();
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }
            odbc_close($conDB);
            return response()->json($results, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    function WarehouseByPlant(Request $request)
    {
        try {
            $conDB = (new ConnectController)->connect_sap();

            $query = 'select "ItemCode","ItemName" from OITM';
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt,)) {
                // Handle execution error
                // die("Error executing SQL statement: " . odbc_errormsg());
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }

            $results = array();
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }
            odbc_close($conDB);
            return response()->json($results, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    function branch(Request $request)
    {
        try {
            $conDB = (new ConnectController)->connect_sap();

            $query = 'select "BPLId","BPLName" from OBPL where "Disabled"=' . "'N'";
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt,)) {
                // Handle execution error
                // die("Error executing SQL statement: " . odbc_errormsg());
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }

            $results = array();
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }
            odbc_close($conDB);
            return response()->json($results, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    function getStockByItem($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'reason' => 'required',
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
            }
            $conDB = (new ConnectController)->connect_sap();
            $filter = "";
            if ($request->reason == 'SL') {
                $filter = 'T1."U_Status" != ?';
            } else {
                $filter = 'T1."U_Status"= ?';
            }
            $query = 'SELECT T0."WhsCode", T3."WhsName",T1."BatchNum",T1."Quantity" as "Quantity",t1."U_CDay" "CDay",t1."U_CRong" "CRong",t1."U_CDai" "CDai" FROM OITW T0 ' .
                'INNER JOIN OIBT T1 ON T0."WhsCode" = T1."WhsCode" and T0."ItemCode" = T1."ItemCode" ' .
                'Inner join OITM T2 on T0."ItemCode" = T2."ItemCode" ' .
                'inner join OWHS T3 ON T3."WhsCode"=T0."WhsCode" ' .
                'where T1."Quantity" >0 and T0."ItemCode"= ? and "BPLid" = ? and ' . $filter;
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt, [$id, Auth::user()->branch, 'TS'])) {
                // Handle execution error
                // die("Error executing SQL statement: " . odbc_errormsg());
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }

            $results = array();
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }

            $data2 = DB::table('pallets as a')
                ->join('pallet_details as b', 'a.palletID', '=', 'b.palletID')
                ->where('a.IssueNumber', 0)
                ->where('b.ItemCode', $id)
                ->groupBy('b.ItemCode', 'b.BatchNum')
                ->select('b.ItemCode', 'b.BatchNum', DB::raw('SUM(b.Qty) as Quantity'))
                ->get();

            foreach ($results as &$item) {
                $batchNum = $item['BatchNum'];
                $quantity = (float) $item['Quantity'];

                // Kiểm tra xem BatchNum có trong $data2 không
                $matchingItem = collect($data2)->where('BatchNum', $batchNum)->first();

                // Nếu tìm thấy, ghi đè (overwrite) Quantity
                if ($matchingItem) {
                    $quantity2 = (float) $matchingItem->Quantity;
                    $item['Quantity'] = (string)max(0, $quantity - $quantity2);
                }
            }
            odbc_close($conDB);
            $results = array_filter($results, fn ($item) => (float) $item['Quantity'] > 0);
            return response()->json($results, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    function getLoaiGo()
    {
        try {
            $conDB = (new ConnectController)->connect_sap();

            $query = 'select * from "@G_SAY1"';
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt)) {
                // Handle execution error
                // die("Error executing SQL statement: " . odbc_errormsg());
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }

            $results = array();
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }
            odbc_close($conDB);
            return response()->json($results, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    function getQuyCachSay(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'reason' => 'required'
            ]);
            if ($validator->fails()) {
                return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
            }
            $query = "";
            $filter = "";
            if ($request->input('reason') == 'OUTDOOR') {
                $query = 'select * from "@G_SAY2" where "U_Type"=?';
                $filter = 'OUTDOOR';
            } elseif ($request->input('reason') == 'SLIN') {
                $query = 'select * from "@G_SAY2" where "Code" like ?';
                $filter = 'ISL%';
            } elseif ($request->input('reason') == 'SLOUT') {
                $query = 'select * from "@G_SAY2" where "Code" like ?';
                $filter = 'OSL%';
            } elseif ($request->input('reason') == 'INDOOR') {
                $query = 'select * from "@G_SAY2" where "U_Type"=?';
                $filter = 'INDOOR';
            } else {
                $query = 'select * from "@G_SAY2" where "Code" like ?';
                $filter = 'U%';
            }
            $conDB = (new ConnectController)->connect_sap();


            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt, [$filter])) {
                // Handle execution error
                // die("Error executing SQL statement: " . odbc_errormsg());
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }

            $results = array();
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }
            odbc_close($conDB);
            return response()->json($results, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    function getLoSay()
    {
        try {
            $conDB = (new ConnectController)->connect_sap();

            $query = 'select "Code","Name" from "@G_SAY3" where "U_Factory"=? and "U_Branch"=?';
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt, [Auth::user()->plant, Auth::user()->branch])) {
                // Handle execution error
                // die("Error executing SQL statement: " . odbc_errormsg());
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }

            $results = array();
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }
            odbc_close($conDB);

            return response()->json($results, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    function getReason(Request $request)
    {
        return response()->json(Reasons::orderBy('Code', 'ASC')->where('is_active', 0)->where('type', 'P')->get(['Code', 'Name']), 200);
    }
    function getReasonPlan(Request $request)
    {
        return response()->json(Reasons::orderBy('Code', 'ASC')->where('is_active', 0)->where('type', 'L')->get(['Code', 'Name']), 200);
    }
    function listfactory(string $id)
    {
        try {
            $conDB = (new ConnectController)->connect_sap();

            $query = 'select "Code","Name"  from "@G_SAY4" where "U_BranchID"=?';
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt, [$id])) {
                // Handle execution error
                // die("Error executing SQL statement: " . odbc_errormsg());
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }

            $results = array();
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }
            odbc_close($conDB);
            return response()->json($results, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    function UserSAPAssign()
    {
        try {
            $conDB = (new ConnectController)->connect_sap();
            $userData = User::where('sap_id', '<>', null)->pluck('sap_id')->implode(','); // lấy danh sách user đã được assign và conver to string

            $query = 'select "USER_CODE",ifnull("U_NAME","USER_CODE") NAME from "OUSR" where "USER_CODE" NOT IN (?) and "USERID" NOT IN (2,3,4,5,6)';
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt, [$userData])) {
                // Handle execution error
                // die("Error executing SQL statement: " . odbc_errormsg());
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }

            $results = array();
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }
            odbc_close($conDB);
            return response()->json($results, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    function settings(Request $request)
    {
        $response = Http::withOptions([
            'verify' => false,
        ])->withHeaders([
            "Content-Type" => "application/json",
            "Accept" => "application/json",
            "Authorization" => "Basic " . BasicAuthToken(),
        ])->get(UrlSAPServiceLayer() . "/b1s/v1/StockTransfers");
        //->post(UrlSAPServiceLayer() . "/b1s/v1/Quotations", $body);
        // Make a request to the service layer
        //$response = $client->request("POST", "/b1s/v1/Quotations",['verify' => false, 'body' =>  json_encode($body)]);
        $res = $response->json();

        // $client = new \GuzzleHttp\Client([
        //     "base_uri" => UrlSAPServiceLayer(),
        //     "headers" => HeaderAPISAP(),
        // ]);
        // $response = $client->request(
        //     "GET",
        //     "/b1s/v1/InventoryTransferRequests",
        //     [
        //         'verify' => false,
        //         // 'body' =>  json_encode($body)
        //     ]
        // );
        return response()->json(["data" => $res], 200);
    }
}
