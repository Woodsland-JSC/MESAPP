<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Controllers\sap\ConnectController;

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
            return response()->json([$results], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * @OA\Get(
     *     path="/api/warehouses",
     *     tags={"MasterData"},
     *     summary="Get all warehouse master data",
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
            return response()->json([$results], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * @OA\Get(
     *     path="/api/warehouses/{WarehouseId}",
     *     tags={"MasterData"},
     *     summary="Get warehouse by WarehouseId",
     *  *     @OA\Parameter(
     *         name="WarehouseId",
     *         in="path",
     *         description="ID of warehouse that needs to be fetched",
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
            return response()->json([$results], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
