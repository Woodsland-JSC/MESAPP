<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdatePermissionTemp extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'domestic:update-permission';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $updated = DB::table('permissions')
            ->where('id', 15)
            ->update(['name' => 'SLTBND']);

        if ($updated) {
            $this->info('Permission name updated successfully.');
        } else {
            $this->error('Permission not found or already up to date.');
        }
    }
}
