<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;


class RefreshRolesPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:refresh-roles-permissions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear permissions, roles tables and run RolesandPermissions seeder';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Xóa dữ liệu trong các bảng
        $this->info('Clearing permissions, roles, and roles_has_permissions tables...');
        DB::table('role_has_permissions')->delete();
        DB::table('permissions')->delete();
        DB::table('roles')->delete();

        $this->info('Re-enabling foreign key checks...');
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Chạy seeder RolesandPermissions
        $this->info('Seeding RolesandPermissions...');
        Artisan::call('db:seed', ['--class' => 'RolesandPermissions']);

        $this->info('Tables cleared and RolesandPermissions seeder executed successfully.');
        return 0;
    }
}
