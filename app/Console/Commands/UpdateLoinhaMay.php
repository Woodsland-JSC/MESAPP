<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateLoinhaMay extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:update-loinhamay';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cập nhật trường loinhamay từ trường Team (theo định dạng NMnhamay-xuong-to)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Kiểm tra tổng số dòng cần cập nhật
        $totalToUpdate = DB::table('sanluong')
            ->whereNull('loinhamay')
            ->whereNotNull('Team')
            ->count();

        if ($totalToUpdate === 0) {
            $this->info("Không có bản ghi nào cần cập nhật.");
            return 0;
        }

        $this->info("Đang cập nhật $totalToUpdate bản ghi...");

        // Tiến hành cập nhật sử dụng MySQL SUBSTRING_INDEX để lấy phần "nhamay"
        $affected = DB::table('sanluong')
            ->whereNull('loinhamay')
            ->whereNotNull('Team')
            ->update([
                'loinhamay' => DB::raw("SUBSTRING_INDEX(SUBSTRING_INDEX(Team, '-', 1), 'NM', -1)")
            ]);

        $this->info("Đã cập nhật $affected bản ghi thành công.");

        return 0;
    }
}
