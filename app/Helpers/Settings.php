<?php

use App\Models\Settings;
use App\Http\Controllers\sap\ConnectController;
use Illuminate\Support\Facades\Auth;

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

    $query = 'select TOP 1 "WhsCode","WhsName" from OWHS where "BPLid"=? and "U_Flag"=?';
    $stmt = odbc_prepare($conDB, $query);
    if (!$stmt) {
        throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
    }
    if (!odbc_execute($stmt, [Auth::user()->branch, 'CS'])) {
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
