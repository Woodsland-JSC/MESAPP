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
            ->join('notireceiptvcn', 'awaitingstocksvcn.notiID', '=', 'notireceiptvcn.id')
            ->update([
                'awaitingstocksvcn.team' => DB::raw('notireceiptvcn.team')
            ]);

        $this->info("Đã cập nhật {$updated} dòng trong bảng awaitingstocksVCN.");
    }
}