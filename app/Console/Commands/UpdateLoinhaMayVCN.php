<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateLoinhaMayVCN extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'db:update-loinhamay-vcn';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Cập nhật trường loinhamay trong bảng notireceiptVCN từ trường team (theo định dạng NMnhamay-xuong-to)';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    // Kiểm tra tổng số dòng cần cập nhật
    $totalToUpdate = DB::table('notireceiptVCN')
      ->whereNull('loinhamay')
      ->whereNotNull('team')
      ->count();

    if ($totalToUpdate === 0) {
      $this->info("Không có bản ghi nào cần cập nhật.");
      return 0;
    }

    $this->info("Đang cập nhật $totalToUpdate bản ghi...");

    // Tiến hành cập nhật sử dụng MySQL SUBSTRING_INDEX để lấy phần "nhamay"
    $affected = DB::table('notireceiptVCN')
      ->where('type', 1)
      ->whereNull('loinhamay')
      ->whereNotNull('team')
      ->update([
        'loinhamay' => DB::raw("SUBSTRING_INDEX(SUBSTRING_INDEX(team, '-', 1), 'NM', -1)")
      ]);

    $this->info("Đã cập nhật $affected bản ghi thành công.");

    return 0;
  }
}
