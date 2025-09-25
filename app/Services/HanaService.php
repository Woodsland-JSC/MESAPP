<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class HanaService
{
    protected $connection;

    public function __construct()
    {
        $this->connection = DB::connection('hana');
    }

    /**
     * Chạy raw query (SELECT)
     */
    public function select(string $query, array $bindings = [])
    {
        return $this->connection->select($query, $bindings);
    }

    /**
     * Chạy raw query (INSERT/UPDATE/DELETE)
     */
    public function statement(string $query, array $bindings = [])
    {
        return $this->connection->statement($query, $bindings);
    }
}
