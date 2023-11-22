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
                'baocao', 'quanlyuser', 'monitor'
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
        // Xóa role client và admin nếu tồn tại
        $existingAdminRole = Role::where('name', 'admin')->first();
        $existingClientRole = Role::where('name', 'client')->first();

        if ($existingAdminRole) {
            $existingAdminRole->delete();
        }

        if ($existingClientRole) {
            $existingClientRole->delete();
        }
        $this->info('Existing admin and client roles deleted successfully.');


        // Tạo role admin và client
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $clientRole = Role::firstOrCreate(['name' => 'client']);

        $this->info('Admin and client roles created successfully.');

        // Gán quyền cho role admin
        $adminRole->givePermissionTo(Permission::all());

        // Gán quyền cho role client (chỉ quyền cụ thể)
        $clientPermissions = Permission::whereIn('name', ['sepsay', 'kehoachsay', 'vaolo', 'kiemtralo', 'losay', 'danhgiame'])->get();
        $clientRole->givePermissionTo($clientPermissions);

        $this->info('Permissions assigned to roles successfully.');
    }
}
