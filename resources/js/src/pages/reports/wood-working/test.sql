SELECT 
    `a`.`LSX` AS `LSX`,
    `a`.`ItemCode` AS `ItemCode`,
    `a`.`ItemName` AS `ItemName`,
    `b`.`Quantity` AS `Quantity`,
    `a`.`CDay` AS `CDay`,
    `a`.`CRong` AS `CRong`,
    `a`.`CDai` AS `CDai`,
    `a`.`Team` AS `ToHT`,
    `a`.`NexTeam` AS `ToTT`,
    `a`.`CongDoan` AS `TenTo`,
    'T' AS `DVT`,
    (((`b`.`Quantity` * `a`.`CDay`) * `a`.`CRong`) * `a`.`CDai`) / 1000000000 AS `M3`,
    CONCAT(`c`.`first_name`, ' ', `c`.`last_name`) AS `NguoiGiao`,
    `a`.`created_at` AS `ngaygiao`,
    `b`.`confirm` AS `statuscode`,
    CASE 
        WHEN `b`.`confirm` = 0 THEN 'Chờ xác nhận'
        WHEN `b`.`confirm` = 1 THEN 'Đã xác nhận'
        ELSE 'Đã từ chối'
    END AS `TrangThai`,
    CONCAT(`d`.`first_name`, ' ', `d`.`last_name`) AS `NguoiNhan`,
    `b`.`confirm_at` AS `ngaynhan`,
    `c`.`plant` AS `plant`,
    `c`.`branch` AS `branch`,
    CASE 
        WHEN `c`.`branch` = 1 THEN 'Thuận Hưng'
        WHEN `c`.`branch` = 3 THEN 'Tuyên Quang'
        WHEN `c`.`branch` = 4 THEN 'Viforex'
        ELSE 'NOT DEFINE'
    END AS `branchName`
FROM 
    `sanluong` `a`
JOIN 
    `notireceipt` `b` 
    ON `a`.`id` = `b`.`baseID` 
    AND `b`.`deleted` = 0 
    AND `b`.`confirm` IN (0, 1, 2) 
    AND `b`.`type` = 0
JOIN 
    `users` `c` 
    ON `a`.`create_by` = `c`.`id`
LEFT JOIN 
    `users` `d` 
    ON `b`.`confirmBy` = `d`.`id`;