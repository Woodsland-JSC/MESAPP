<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\notireceipt;
use App\Models\SanLuong;
use App\Models\awaitingstocks;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ConfirmNotireceipt extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'noti:confirm {id : ID của notireceipt cần xác nhận}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Xác nhận thủ công notireceipt theo ID';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $notiReceiptId = $this->argument('id');
        
        try {
            DB::beginTransaction();
            
            // Tìm notireceipt theo ID
            $notiReceipt = notireceipt::find($notiReceiptId);
            
            if (!$notiReceipt) {
                $this->error("Không tìm thấy notireceipt với ID: {$notiReceiptId}");
                return 1;
            }
            
            // Cập nhật notireceipt
            $notiReceipt->update([
                'confirm' => 1,
                'confirmBy' => 1,
                'confirm_at' => Carbon::now(),
                'ObjType' => 202
            ]);
            
            $this->info("Đã cập nhật notireceipt ID: {$notiReceiptId}");
            
            // Cập nhật sanluong
            if ($notiReceipt->baseID) {
                $sanLuong = SanLuong::find($notiReceipt->baseID);
                
                if ($sanLuong) {
                    $sanLuong->update(['status' => 1]);
                    $this->info("Đã cập nhật status = 1 cho sanluong ID: {$notiReceipt->baseID}");
                } else {
                    $this->warn("Không tìm thấy sanluong với ID: {$notiReceipt->baseID}");
                }
            }
            
            // Xóa các bản ghi awaitingstocks
            $deletedCount = awaitingstocks::where('notiId', $notiReceiptId)->delete();
            $this->info("Đã xóa {$deletedCount} bản ghi awaitingstocks");
            
            DB::commit();
            
            $this->info("Xử lý thành công notireceipt ID: {$notiReceiptId}");
            return 0;
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Lỗi khi xử lý: " . $e->getMessage());
            return 1;
        }
    }
}