<?php

namespace App\Console\Commands;

use App\Models\planDryings;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncPalletDataFromPlans extends Command
{
    protected $signature = 'pallets:sync-data-from-plans
                            {--dry-run : Chỉ hiển thị số lượng thay đổi, không ghi DB}
                            {--plan= : Chỉ sync cho một PlanID cụ thể}';

    protected $description = 'Cập nhật RanBy, RanDate, CompletedBy, CompletedDate của pallets từ planDryings tương ứng';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $planIdFilter = $this->option('plan');

        $query = planDryings::query()
            ->with(['details.palletRel'])
            // chỉ lấy các plan có thông tin run hoặc completed
            ->where(function ($q) {
                $q->whereNotNull('runDate')
                  ->orWhereNotNull('CompletedDate')
                  ->orWhereNotNull('RunBy')
                  ->orWhereNotNull('CompletedBy');
            })
            ->when($planIdFilter, fn($q) => $q->where('PlanID', $planIdFilter))
            ->orderByDesc('PlanID');

        $totalPlans = $query->count();
        $this->info("Found {$totalPlans} plan(s) to process" . ($planIdFilter ? " (PlanID={$planIdFilter})" : '') . ($dryRun ? ' [DRY RUN]' : ''));

        $updatedPallets = 0;
        $checkedPallets = 0;

        // xử lý theo chunk để tránh tốn bộ nhớ
        $query->chunkById(100, function ($plans) use (&$updatedPallets, &$checkedPallets, $dryRun) {
            foreach ($plans as $plan) {
                $runBy  = $plan->RunBy;
                $runAt  = $plan->runDate;        // datetime hoặc null
                $doneBy = $plan->CompletedBy;
                $doneAt = $plan->CompletedDate;  // datetime hoặc null

                foreach ($plan->details as $detail) {
                    $pallet = $detail->palletRel;   // belongsTo Pallet
                    if (!$pallet) {
                        $this->warn("PlanID {$plan->PlanID}: pallet #{$detail->pallet} không tồn tại.");
                        continue;
                    }

                    $checkedPallets++;

                    $updates = [];

                    // Đồng bộ thông tin chạy lò
                    if (!is_null($runBy) || !is_null($runAt)) {
                        // chỉ update nếu khác dữ liệu hiện có (giảm số lệnh update)
                        $needRunByUpdate  = !is_null($runBy) && $pallet->RanBy !== $runBy;
                        $needRunAtUpdate  = !is_null($runAt) && (empty($pallet->RanDate) || (string)$pallet->RanDate !== (string)$runAt);

                        if ($needRunByUpdate) $updates['RanBy'] = $runBy;
                        if ($needRunAtUpdate) $updates['RanDate'] = $runAt;
                    }

                    // Đồng bộ thông tin hoàn tất
                    if (!is_null($doneBy) || !is_null($doneAt)) {
                        $needDoneByUpdate = !is_null($doneBy) && $pallet->CompletedBy !== $doneBy;
                        $needDoneAtUpdate = !is_null($doneAt) && (empty($pallet->CompletedDate) || (string)$pallet->CompletedDate !== (string)$doneAt);

                        if ($needDoneByUpdate) $updates['CompletedBy'] = $doneBy;
                        if ($needDoneAtUpdate) $updates['CompletedDate'] = $doneAt;
                    }

                    if (!empty($updates)) {
                        if ($dryRun) {
                            $this->line("Would update palletID {$pallet->palletID}: " . json_encode($updates));
                        } else {
                            $affected = DB::table('pallets')
                                ->where('palletID', $pallet->palletID)
                                ->update($updates);

                            if ($affected > 0) {
                                $updatedPallets++;
                                $this->line("Updated palletID {$pallet->palletID}: " . json_encode($updates));
                            }
                        }
                    }
                }
            }
        }, 'PlanID'); // dùng khóa chính để chunk

        $this->info("Checked {$checkedPallets} pallet(s). " . ($dryRun ? 'DRY RUN: ' : '') . "Updated {$updatedPallets} pallet(s).");

        return self::SUCCESS;
    }
}
