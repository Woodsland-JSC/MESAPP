<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class reasonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $reasons = [
            ['Code' => 'OUTDOOR', 'Name' => 'OUTDOOR'],
            ['Code' => 'INDOOR', 'Name' => 'INDOOR'],
            ['Code' => 'SL', 'Name' => 'SẤY LẠI'],
            ['Code' => 'SU', 'Name' => 'SẤY UỐN'],
            ['Code' => 'XOUTDOOR', 'Name' => 'X-OUTDOOR'],
            ['Code' => 'XINDOOR', 'Name' => 'X-INDOOR'],
            // Add more reasons as needed
        ];

        DB::table("reasons")->insert($reasons);
    }
}
