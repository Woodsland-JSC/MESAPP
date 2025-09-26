<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateBaoCaoXepSayCBG extends Command
{
    /**
     * The name and signature of the console command.
     *
     * php artisan db:create-gt-say-xepsaycbg-view
     */
    protected $signature = 'db:update-gt-say-xepsaycbg-view';

    /**
     * The console command description.
     */
    protected $description = 'Tạo hoặc thay thế view gt_say_xepsaycbg trong database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $sql = <<<SQL
CREATE OR REPLACE VIEW `gt_say_xepsaycbg` AS
SELECT 
    `x`.`ItemCode` AS `ItemCode`,
    `x`.`ItemName` AS `ItemName`,
    `x`.`CDai`     AS `CDai`,
    `x`.`CRong`    AS `CRong`,
    `x`.`CDay`     AS `CDay`,
    SUM(`x`.`sepxay`) AS `sepxay`,
    SUM(`x`.`vaolo`)  AS `vaolo`,
    SUM(`x`.`ralo`)   AS `ralo`,
    `x`.`stage_date`  AS `created_at`,
    `x`.`plant`       AS `plant`,
    `x`.`branch`      AS `branch`,
    (CASE 
        WHEN (`x`.`branch` = 1) THEN 'Thuận Hưng'
        WHEN (`x`.`branch` = 3) THEN 'Tuyên Quang'
        WHEN (`x`.`branch` = 4) THEN 'Viforex'
        ELSE 'NOT DEFINE'
     END) AS `branchName`
FROM (
    /* 1) XẾP SẤY: chưa gắn vào kế hoạch/lò */
    SELECT
        `b`.`ItemCode`,
        `b`.`ItemName`,
        `b`.`CDai`,
        `b`.`CRong`,
        `b`.`CDay`,
        `b`.`Qty` AS `sepxay`,
        0         AS `vaolo`,
        0         AS `ralo`,
        `a`.`created_at` AS `stage_date`,
        `u`.`plant`,
        `u`.`branch`
    FROM `pallets` `a`
    JOIN `pallet_details` `b` ON `b`.`palletID` = `a`.`palletID`
    LEFT JOIN `users` `u` ON `a`.`CreateBy` = `u`.`id`
    LEFT JOIN `plan_detail` `c` ON `c`.`pallet` = `a`.`palletID`
    WHERE `c`.`id` IS NULL

    UNION ALL

    /* 2) VÀO LÒ */
    SELECT
        `b`.`ItemCode`,
        `b`.`ItemName`,
        `b`.`CDai`,
        `b`.`CRong`,
        `b`.`CDay`,
        0         AS `sepxay`,
        `b`.`Qty` AS `vaolo`,
        0         AS `ralo`,
        COALESCE(`a`.`LoadedIntoKilnDate`, `d`.`runDate`, `a`.`created_at`) AS `stage_date`,
        `u`.`plant`,
        `u`.`branch`
    FROM `pallets` `a`
    JOIN `pallet_details` `b` ON `b`.`palletID` = `a`.`palletID`
    LEFT JOIN `users` `u` ON `a`.`CreateBy` = `u`.`id`
    JOIN `plan_detail` `c` ON `c`.`pallet` = `a`.`palletID`
    JOIN `plandryings` `d` ON `c`.`PlanID` = `d`.`PlanID`
    WHERE `a`.`LoadedBy` IS NOT NULL
      AND `d`.`Status` <> 2

    UNION ALL

    /* 3) RA LÒ */
    SELECT
        `b`.`ItemCode`,
        `b`.`ItemName`,
        `b`.`CDai`,
        `b`.`CRong`,
        `b`.`CDay`,
        0         AS `sepxay`,
        0         AS `vaolo`,
        `b`.`Qty` AS `ralo`,
        COALESCE(`d`.`CompletedDate`, `a`.`CompletedDate`, `a`.`RanDate`, `a`.`created_at`) AS `stage_date`,
        `u`.`plant`,
        `u`.`branch`
    FROM `pallets` `a`
    JOIN `pallet_details` `b` ON `b`.`palletID` = `a`.`palletID`
    LEFT JOIN `users` `u` ON `a`.`CreateBy` = `u`.`id`
    JOIN `plan_detail` `c` ON `c`.`pallet` = `a`.`palletID`
    JOIN `plandryings` `d` ON `c`.`PlanID` = `d`.`PlanID`
    WHERE `d`.`Status` = 2
) `x`
GROUP BY
    `x`.`ItemCode`,
    `x`.`ItemName`,
    `x`.`CDai`,
    `x`.`CRong`,
    `x`.`CDay`,
    `x`.`stage_date`,
    `x`.`plant`,
    `x`.`branch`;
SQL;

        try {
            DB::unprepared($sql);
            $this->info('View gt_say_xepsaycbg created or replaced successfully!');
        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
        }
    }
}
