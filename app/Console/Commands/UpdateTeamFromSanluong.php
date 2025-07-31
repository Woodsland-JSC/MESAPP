<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateTeamFromSanluong extends Command
{
    protected $signature = 'db:update-team';
    protected $description = 'Cập nhật trường team trong bảng awaitingstocks từ sanluong thông qua notireceipt';

    public function handle()
    {
        $updated = DB::table('awaitingstocks')
            ->join('notireceipt', 'awaitingstocks.notiID', '=', 'notireceipt.id')
            ->join('sanluong', 'notireceipt.baseID', '=', 'sanluong.id')
            ->update([
                'awaitingstocks.team' => DB::raw('sanluong.Team')
            ]);

        $this->info("Đã cập nhật {$updated} dòng trong bảng awaitingstocks.");
    }
}
