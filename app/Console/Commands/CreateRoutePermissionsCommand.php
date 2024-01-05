<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class CreateRoutePermissionsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permission:create-permission-routes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a permission routes.';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $permissionsToCreate =
            [
                'sepsay', 'kehoachsay',
                'vaolo', 'kiemtralo',
                'losay', 'danhgiame',
                'baocao', 'quanlyuser', 'monitor',
                'CBG','VCN'
            ];

        $messageMapping = [
            'sepsay' => 'sếp xấy',
            'kehoachsay' => 'kế hoạch sấy',
            'vaolo' => 'vào lò',
            'kiemtralo' => 'kiểm tra lò',
            'losay' => 'lò sấy',
            'danhgiame' => 'đánh giá mẻ',
            'baocao' => 'báo cáo',
            'quanlyuser' => 'quản lý user',
            'monitor' => 'monitor',
            'CBG' => 'Chế biến gỗ',
            'VCN' => 'Ván công nghiệp'

        ];

        array_map(function ($permissionName) use ($messageMapping) {
            $permissionMessage = $messageMapping[$permissionName] ?? 'Unknown Permission';

            if (!Permission::where('name', $permissionName)->exists()) {
                Permission::create(['name' => $permissionName, 'message' => $permissionMessage]);
                $this->info("Permission for {$permissionName} ({$permissionMessage}) created.");
            } else {
                $this->info("Permission for {$permissionName} already exists.");
            }
        }, $permissionsToCreate);


        $this->info('Permission added successfully.');
        // Kiểm tra và cập nhật quyền nếu role admin đã tồn tại
        $existingAdminRole = Role::where('name', 'admin')->first();
        if ($existingAdminRole) {
            $existingAdminRole->syncPermissions(Permission::all());
            $this->info('Admin role permissions updated successfully.');
        } else {
            $adminRole = Role::create(['name' => 'admin']);
            $adminRole->givePermissionTo(Permission::all());
            $this->info('Admin role created successfully.');
        }

        // Kiểm tra và cập nhật quyền nếu role client đã tồn tại
        $existingClientRole = Role::where('name', 'client')->first();
        if ($existingClientRole) {
            $clientPermissions = Permission::whereIn('name', ['sepsay', 'kehoachsay', 'vaolo', 'kiemtralo', 'losay', 'danhgiame'])->get();
            $existingClientRole->syncPermissions($clientPermissions);
            $this->info('Client role permissions updated successfully.');
        } else {
            $clientRole = Role::create(['name' => 'client']);
            $clientPermissions = Permission::whereIn('name', ['sepsay', 'kehoachsay', 'vaolo', 'kiemtralo', 'losay', 'danhgiame'])->get();
            $clientRole->givePermissionTo($clientPermissions);
            $this->info('Client role created successfully.');
        }
        // Tạo và cập nhật role sấy
        $existingSayRole = Role::where('name', 'sấy')->first();
        if ($existingSayRole) {
            $SayPermissions = Permission::whereIn('name', ['sepsay', 'kehoachsay', 'vaolo', 'kiemtralo', 'losay', 'danhgiame'])->get();
            $existingSayRole->syncPermissions($SayPermissions);
            $this->info('sấy role permissions updated successfully.');
        }else
        {
            $SayRole = Role::create(['name' => 'sấy']);
            $SayPermissions = Permission::whereIn('name', ['sepsay', 'kehoachsay', 'vaolo', 'kiemtralo', 'losay', 'danhgiame'])->get();
            $SayRole->givePermissionTo($SayPermissions);
            $this->info('sấy role created successfully.');
        }

        // Tạo và cập nhật role CBG
        $existingCBGRole = Role::where('name', 'CBG')->first();
        if ($existingCBGRole) {
            $CBGPermissions = Permission::whereIn('name', ['CBG'])->get();
            $existingCBGRole->syncPermissions($CBGPermissions);
            $this->info('CBG role permissions updated successfully.');
        }else
        { 
            $CBGRole = Role::create(['name' => 'CBG']);
            $CBGPermissions = Permission::whereIn('name', ['CBG'])->get();
            $CBGRole->givePermissionTo($CBGPermissions);
            $this->info('CBG role created successfully.');
        }
        
        // Tạo và cập nhật role VCN
        $existVCNRole = Role::where('name', 'VCN')->first();
        if ($existVCNRole) {
            $VCNPermissions = Permission::whereIn('name', ['VCN'])->get();
            $existVCNRole->syncPermissions($VCNPermissions);
            $this->info('VCN role permissions updated successfully.');
        }
        else{
            $VCNRole = Role::create(['name' => 'VCN']);
            $VCNPermissions = Permission::whereIn('name', ['VCN'])->get();
            $VCNRole->givePermissionTo($VCNPermissions);
            $this->info('VCN role created successfully.');
        }

        $this->info('Permissions assigned to roles successfully.');
    }
}
