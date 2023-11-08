<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // DB::table("users")->insert([
        // 'first_name' => 'Nguyên',
        // 'last_name' => 'Nguyễn Thanh',
        // 'email' => 'ntnguyen0310@gmail.com',
        // 'password' => Hash::make('admin@123'),
        // 'role' => 'admin',
        // 'plant' => 'TQ',
        // ]);
        User::factory()->count(50)->create();
    }
}
