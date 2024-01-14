<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;

class CreateAdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $user = User::create([
            'first_name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('admin@123'),
            'plant' => 'TH',
            'branch' => 1,
            'sap_id' => '2',
            'username' => 'admin',
            'role' => 'admin'
        ]);

        // $role = Role::create(['name' => 'admin']);

        //$permissions = Permission::pluck('id', 'id')->all();

        // $role->syncPermissions($permissions);

        $user->assignRole(["admin"]);
    }
}
