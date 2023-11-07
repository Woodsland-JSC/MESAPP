<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Models\Permission;

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
        $routes = Route::getRoutes();

        foreach ($routes as $route) {
            if ($route->getName() && in_array('auth:sanctum', $route->middleware())) {
                $permissionName = $route->getName();

                if (!Permission::where('name', $permissionName)->exists()) {
                    Permission::create(['name' => $permissionName]);
                    $this->info("Permission for route {$permissionName} created.");
                } else {
                    $this->info("Permission for route {$permissionName} already exists.");
                }
            }
        }

        $this->info('Permission routes added successfully.');
    }
}
