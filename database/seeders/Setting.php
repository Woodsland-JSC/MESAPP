<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;


class Setting extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $reasons = [
            ['Code' => 'OUTDOOR', 'Name' => 'OUTDOOR', 'type' => 'P']
            // Add more reasons as needed
        ];
        DB::table("reasons")->insert($reasons);
    }
}
