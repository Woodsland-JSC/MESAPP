<?php

namespace App\Providers;

use App\Database\HanaConnection;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Connection;
use Log;

class HanaServiceProvider extends ServiceProvider
{
    public function register()
    {
        try {
            DB::extend('hana', function ($config) {
                $host = $config['host'];
                $driver = $config['dsn'];
                $db_name = $config['database'];
                $username = $config['username'];
                $password = $config['password'];

                $constring = "Driver={" . $driver . "};ServerNode=" . $host . ";UID=" . $username . ";PWD=" . $password . ";CS=" . $db_name . ";char_as_utf8=true";

                $odbc  = odbc_connect($constring, ' SQL_CUR_USE_ODBC', '');
                return new HanaConnection($odbc);
            });
        } catch (\Throwable $e) {
            throw $e;
        }
    }
}
