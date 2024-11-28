<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateUserFactory extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:update-user-factory';

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
        $this->info('Bắt đầu cập nhật nhà máy của users...');
        DB::table('users')
            ->where('plant', '=', 'YS1')
            ->orWhere('plant', '=', 'YS2')
            ->update(['plant' => 'YS']);

        DB::table('notireceipt')
            ->where('team', '=', 'YS1-QC')
            ->update(['team' => 'QC_YS(CBG)']);

        DB::table('notireceipt')
            ->where('team', '=', 'YS2-QC')
            ->update(['team' => 'QC_YS(VCN)']);

        DB::table('notireceipt')
            ->where('team', '=', 'TH-QC')
            ->update(['team' => 'QC_TH']);

        DB::table('notireceipt')
            ->where('team', '=', 'TB-QC')
            ->update(['team' => 'QC_TB']);

        DB::table('notireceipt')
            ->where('team', '=', 'CH-QC')
            ->update(['team' => 'QC_CH']);


        $this->info('Cập nhật thông tin thành công.');
        return 0;
    }
}
