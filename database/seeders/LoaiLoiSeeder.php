<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LoaiLoiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            ['name' => 'Chất lượng gỗ'],
            ['name' => 'Lỗi gia công'],
            ['name' => 'Lỗi mối ghép'],
            ['name' => 'Lỗi do vận chuyển'],
            ['name' => 'Lỗi khác'],
            ['name' => 'Lỗi độ ẩm'],
            ['name' => 'Lỗi cong mo'],
        ];
        DB::table("loailoi")->insert($data);
    }
}
