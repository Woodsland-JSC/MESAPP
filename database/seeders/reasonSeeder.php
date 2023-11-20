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
            ['Code' => 'OUTDOOR', 'Name' => 'OUTDOOR', 'type' => 'P'],
            ['Code' => 'INDOOR', 'Name' => 'INDOOR', 'type' => 'P'],
            ['Code' => 'SL', 'Name' => 'SẤY LẠI', 'type' => 'P'],
            ['Code' => 'SU', 'Name' => 'SẤY UỐN', 'type' => 'P'],
            ['Code' => 'XOUTDOOR', 'Name' => 'X-OUTDOOR', 'type' => 'P'],
            ['Code' => 'XINDOOR', 'Name' => 'X-INDOOR', 'type' => 'P'],
            ['Code' => 'OUTDOOR', 'Name' => 'OUTDOOR', 'type' => 'L'],
            ['Code' => 'INDOOR', 'Name' => 'INDOOR', 'type' => 'L'],
            ['Code' => 'SU', 'Name' => 'SẤY UỐN', 'type' => 'L'],
            ['Code' => 'SLIN', 'Name' => 'SẤY LẠI INDOOR', 'type' => 'L'],
            ['Code' => 'SLOUT', 'Name' => 'SẤY LẠI OUTDOOR', 'type' => 'L'],
            // Add more reasons as needed
        ];

        DB::table("reasons")->insert($reasons);
    }
}
