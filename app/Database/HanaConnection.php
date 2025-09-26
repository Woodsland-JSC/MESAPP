<?php

namespace App\Database;

use Exception;
use Illuminate\Database\Connection;
use RuntimeException;

class HanaConnection extends Connection
{
    protected $odbc;

    public function __construct($odbc)
    {
        $this->odbc = $odbc;
        parent::__construct($odbc);
    }

    public function select($query, $bindings = [], $useReadPdo = true)
    {
        try {
            $stmt = odbc_prepare($this->odbc, $query);

            if (! $stmt) {
                $this->throwException(odbc_errormsg($this->odbc));
            }

            if (! odbc_execute($stmt, $bindings)) {
                $this->throwException(odbc_errormsg($this->odbc));
            }

            $rows = [];
            while ($row = odbc_fetch_array($stmt)) {
                $rows[] = $row;
            }

            return $rows;
        } catch (Exception $e) {
            $this->throwException($e->getMessage());
        }
    }

    public function selectOne($query, $bindings = [], $useReadPdo = true){
        try {
            $stmt = odbc_prepare($this->odbc, $query);

            if (! $stmt) {
                $this->throwException(odbc_errormsg($this->odbc));
            }

            if (! odbc_execute($stmt, $bindings)) {
                $this->throwException(odbc_errormsg($this->odbc));
            }

            $row = odbc_fetch_array($stmt);

            return $row ?: null;
        } catch (Exception $e) {
            $this->throwException($e->getMessage());
        }
    }

    public function statement($query, $bindings = [])
    {
        try {
            $stmt = odbc_prepare($this->odbc, $query);
            return odbc_execute($stmt, $bindings);
        } catch (Exception $e) {
            $this->throwException($e->getMessage());
        }
    }

    private function throwException($message){
        throw new Exception("Lỗi truy vấn SAP HANA DB: " . $message, 500);
    }
}
