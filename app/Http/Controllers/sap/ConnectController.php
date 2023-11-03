<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ConnectController extends Controller
{
    function connect_sap(){

        try {
            $host='sap.woodsland.com.vn:30015';
            $driver = 'HDBODBC';
            $db_name ="WOODSLAND_UATS";
            $username = 'SYSTEM';
            // Password
            $password = "S@p@Systemb1";
            $constring="Driver={HDBODBC};ServerNode=".$host.";UID=".$username.";PWD=".$password.";CS=".$db_name.";char_as_utf8=true";
            //return odbc_connect("Driver=$driver;ServerNode=$host;Database=$db_name;", $username, $password, SQL_CUR_USE_ODBC);
            return   odbc_connect($constring,' SQL_CUR_USE_ODBC','');
        }
        catch( \Exception $e)
        {
            return response()->json([
                'status_code' => 500,
                'message' => 'SAP HANA can not connect, Please contact administrator!'
            ],500);
        }

    }
}
