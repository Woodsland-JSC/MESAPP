<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Controllers\sap\ConnectController;
class MasterDataController extends Controller
{
    function ItemMasterData(Request $request)
    {
        $conDB = (new ConnectController)->connect_sap();

        $query='select "ItemCode","ItemName" from OITM';
        $stmt = odbc_prepare($conDB, $query);

        if (!odbc_execute($stmt, )) {
            // Handle execution error
           // die("Error executing SQL statement: " . odbc_errormsg());
            return response()->json([
                'status_code' => 500,
                'message' => 'Error executing SQL statement:'.odbc_errormsg()
            ],500);
        }

        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        }
        odbc_close($conDB);
        $results=json_encode($results);
        return  $results;
    }

}
