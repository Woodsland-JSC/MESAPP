<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateTeamFromNotiReceiptVCN extends Command
{
    protected $signature = 'db:update-team-vcn';
    protected $description = 'Cập nhật trường team trong bảng awaitingstocksVCN từ bảng notireceiptvcn thông qua notiID';

    public function handle()
    {
        $updated = DB::table('awaitingstocksvcn')
            ->join('notireceiptVCN', 'awaitingstocksvcn.notiID', '=', 'notireceiptVCN.id')
            ->update([
                'awaitingstocksvcn.team' => DB::raw('notireceiptVCN.team')
            ]);

        $this->info("Đã cập nhật {$updated} dòng trong bảng awaitingstocksVCN.");
    }
}