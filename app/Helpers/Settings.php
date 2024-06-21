<?php

use App\Models\Settings;
use App\Http\Controllers\sap\ConnectController;
use Illuminate\Support\Facades\Auth;
use App\Models\Pallet;
use App\Models\pallet_details;
use App\Models\planDryings;
use App\Models\plandetail;
use Illuminate\Support\Facades\DB;

if (!function_exists('BasicAuthToken')) {
    function BasicAuthToken()
    {
        $setting = Settings::first();
        $username = '{"CompanyDB":"' . config('sap.DB_NAME') . '","UserName":"' .   config('sap.USER_SAPB1') . '"}';
        $password = config('sap.PASSWORD_B1'); //decrypt($setting->password_sap);
        $authString = base64_encode("$username:$password");
        return $authString;
    }
}

function HeaderAPISAP()
{
    $headers = [
        "Content-Type" => "application/json",
        "Accept" => "application/json",
        "Authorization" => "Basic " . BasicAuthToken(),
    ];
    return $headers;
}

function UrlSAPServiceLayer()
{
    $sapUrl = config('sap.SAP_URL');
    return $sapUrl;
}
function WarehouseCS()
{

    $conDB = (new ConnectController)->connect_sap();

    $query = 'select TOP 1 "WhsCode","WhsName" from OWHS where "BPLid"=? and "U_Flag"=? and "Inactive"=?;';
    $stmt = odbc_prepare($conDB, $query);
    if (!$stmt) {
        throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
    }
    if (!odbc_execute($stmt, [Auth::user()->branch, 'CS','N'])) {
        // Handle execution error
        // die("Error executing SQL statement: " . odbc_errormsg());
        throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
    }
    $WhsCode = "";
    if ($stmt && odbc_fetch_row($stmt)) {
        $WhsCode = odbc_result($stmt, "WhsCode");
    } else {
        $WhsCode = "-1";
    }
    odbc_close($conDB);
    return $WhsCode;
}
function calculator($id)
{
    $result = DB::table('plan_detail as b')
        ->join('pallet_details as c', 'b.pallet', '=', 'c.palletID')
        ->join('pallets as d', 'c.palletID', '=', 'd.palletID')
        ->groupBy('b.PlanID', 'd.palletID')
        ->select(
            'b.PlanID',
            'd.palletID',
            DB::raw('SUM(c.Qty) as totalQty'),
            DB::raw('CASE WHEN SUM(c.CDai * c.CRONG * c.CDAY * c.Qty) = 0 THEN 1 ELSE SUM(c.CDai * c.CRONG * c.CDAY * c.Qty) END as KL')
        )
        ->get();
}
function inforUserSAP()
{
    $conDB = (new ConnectController)->connect_sap();

    $query = 'select "U_Factory","U_Xuong","U_To","U_NAME" from ousr where USER_CODE=?';
    $stmt = odbc_prepare($conDB, $query);
    if (!$stmt) {
        throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
    }
    if (!odbc_execute($stmt, [Auth::user()->sap_id])) {
        // Handle execution error
        // die("Error executing SQL statement: " . odbc_errormsg());
        throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
    }
    $results = array();
    while ($row = odbc_fetch_array($stmt)) {
        $results[] = $row;
    }
    odbc_close($conDB);
    return $results;
}
if (!function_exists('GetWhsCode')) {
    function GetWhsCode($FAC, $flag)
    {
       $conDB = (new ConnectController)->connect_sap();

    $query = 'select TOP 1 "WhsCode","WhsName" from OWHS where "BPLid"=? and "U_FAC"=? and "U_Flag"=? and "Inactive"=?;';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [Auth::user()->branch,$FAC, $flag,'N'])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $WhsCode = "";
        if ($stmt && odbc_fetch_row($stmt)) {
            $WhsCode = odbc_result($stmt, "WhsCode");
        } else {
            $WhsCode = "-1";
        }
        odbc_close($conDB);
        return $WhsCode;
    }
}