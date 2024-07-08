<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
class CreateOrUpdateView extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'gt:view-manager {action}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or update the database view for the report';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');
        if ($action === 'create' || $action === 'update') {
            $this->dropViews();
            $this->createViews();
            $this->info('Views have been created or updated successfully.');
        } elseif ($action === 'drop') {
            $this->dropViews();
            $this->info('Views have been dropped successfully.');
        } else {
            $this->error('Invalid action. Use "create", "update", or "drop".');
        }

        return 0;
    }
    protected function dropViews()
    {
        DB::statement('DROP VIEW IF EXISTS gt_cbg_chitietgiaonhan');
        DB::statement('DROP VIEW IF EXISTS say_bienbanvaolo');
        DB::statement('DROP VIEW IF EXISTS gt_say_xepsaycbg');
        DB::statement('DROP VIEW IF EXISTS gt_say_xepchoxay');
        DB::statement('DROP VIEW IF EXISTS gt_cbg_baocaoxulyloi');
        // Add more drop statements for additional views
    }

    protected function createViews()
    {
        // view report chitietgiaonhan che bien go
        DB::statement("
            CREATE VIEW gt_cbg_chitietgiaonhan AS
            SELECT 
                a.LSX, 
                a.ItemCode, 
                a.ItemName, 
                b.Quantity, 
                a.CDay, 
                a.CRong, 
                a.CDai, 
                a.Team ToHT,
                a.NexTeam ToTT, 
                'T' AS DVT,
                (b.Quantity * a.CDay * a.CRong * a.CDai / 1000000000) AS M3,
                CONCAT(c.first_name, ' ', c.last_name) AS NguoiGiao,
                a.created_at AS ngaygiao,
                b.confirm statuscode,
                case when b.confirm = 0 then 'Chờ xác nhận' when b.confirm = 1 then 'Đã xác nhận' else 'Đã từ chối' end as TrangThai,
                CONCAT(d.first_name, ' ', d.last_name) AS NguoiNhan,
                b.confirm_at AS ngaynhan,
                c.plant,
                c.branch branch,
                 case when c.branch=1 then 'Thuận Hưng'
            WHEN c.branch=3 THEN 'Tuyên Quang'
            WHEN c.branch=4 THEN 'Viforex'
            ELSE 'NOT DEFINE' END as branchName
            FROM sanluong a 
            JOIN notireceipt b ON a.id = b.baseID AND b.deleted = 0 AND b.confirm IN (0, 1,2) AND b.type = 0
            JOIN users c ON a.create_by = c.id
            LEFT JOIN users d ON b.confirmBy = d.id
        ");
        // view report biên bản vào lò.
        DB::statement(" 
        create view say_bienbanvaolo 
        as SELECT a.Oven,a.PlanID,c.palletID,c.Code,c.LoaiGo,
            c.MaLo,c.LyDo,c.QuyCach,d.ItemCode,d.CDai,d.CDay,d.CRong,d.Qty_T Qty, 
            (d.CDai*d.CDay*d.CRong*d.Qty/1000000000) m3,a.runDate, e.plant,
           e.branch,
                 case when e.branch=1 then 'Thuận Hưng'
            WHEN e.branch=3 THEN 'Tuyên Quang'
            WHEN e.branch=4 THEN 'Viforex'
            ELSE 'NOT DEFINE' END as branchName 
            from planDryings a join plan_detail b on a.PlanID=b.PlanID join pallets c 
            on b.pallet=c.palletID join pallet_details d on c.palletID=d.palletID 
            join users e on e.id=a.CreateBy 
            where a.Status=3;"
        );
        // BÁO CÁO XẾP SẤY KHỐI CBGs
        DB::statement("
            CREATE VIEW gt_say_xepsaycbg AS
            select  a.ItemCode,a.ItemName,a.CDai,a.CRong,a.CDay, 
            sum(sepxay) sepxay, sum(vaolo) 
            vaolo,sum(ralo) ralo,
            a.created_at,
            a.plant,
            a.branch,
            case when a.branch=1 then 'Thuận Hưng'
            WHEN a.branch=3 THEN 'Tuyên Quang'
            WHEN a.branch=4 THEN 'Viforex'
            ELSE 'NOT DEFINE' END as branchName 
            FROM 
            (select b.ItemCode,b.ItemName,b.CDai,b.CRong,b.CDay, b.Qty sepxay, b.Qty vaolo, 0 ralo,a.created_at,
            u.plant,u.branch from 
            pallets a join pallet_details b on b.palletID=a.palletID
            join users u on a.CreateBy=u.id
            left join plan_detail c on c.pallet=a.palletID
            left join planDryings d on c.PlanID=d.PlanID
            where c.id is null
            union all
            select b.ItemCode,b.ItemName,b.CDai,b.CRong,b.CDay,0 sepxay, b.Qty vaolo, 0 ralo,a.created_at,
            u.plant,u.branch from 
            pallets a join pallet_details b on b.palletID=a.palletID
            join users u on a.CreateBy=u.id
            left join plan_detail c on c.pallet=a.palletID
            left join planDryings d on c.PlanID=d.PlanID
            where  d.Status!=4
            union all
            select b.ItemCode,b.ItemName,b.CDai,b.CRong,b.CDay,0 sepxay, 0 vaolo, b.Qty ralo,a.created_at,
            u.plant,u.branch from 
            pallets a join pallet_details b on b.palletID=a.palletID
            join users u on a.CreateBy=u.id
            left join plan_detail c on c.pallet=a.palletID
            left join planDryings d on c.PlanID=d.PlanID
            where d.Status=4) a
            group by a.ItemCode,a.ItemName,a.CDai,a.CRong,a.CDay,a.created_at,
            a.plant,a.branch;"
        );
        // BÁO CÁO XẾP CHỜ SẤY
        DB::statement("
            CREATE VIEW gt_say_xepchoxay AS
            select a.Code MaPallet,a.MaLo,a.LyDo, b.ItemCode,b.ItemName,b.CDai,b.CRong,b.CDay,sum(b.Qty) M3,sum(b.Qty_T) Qty,a.created_at,
            u.plant,u.branch,
            case when u.branch=1 then 'Thuận Hưng'
                WHEN u.branch=3 THEN 'Tuyên Quang'
                WHEN u.branch=4 THEN 'Viforex'
                ELSE 'NOT DEFINE' END as branchName
            from 
            pallets a join pallet_details b on b.palletID=a.palletID
            join users u on a.CreateBy=u.id
            left join plan_detail c on c.pallet=a.palletID
            left join planDryings d on c.PlanID=d.PlanID
            where c.id is null
            group by a.Code ,a.MaLo,a.LyDo,b.ItemCode,b.ItemName,b.CDai,b.CRong,b.CDay,a.created_at,
            u.plant,u.branch"
        );
    // báo cáo xử lý lỗi
        DB::statement("
            CREATE VIEW gt_cbg_baocaoxulyloi AS
            SELECT 
                a.created_at,
                week(a.created_at) week,
                    a.LSX, 
                    a.ItemCode, 
                    a.ItemName, 
                    b.Quantity, 
                    a.CDay, 
                    a.CRong, 
                    a.CDai, 
                    a.Team NoiBaoLoi,
                    a.NexTeam ToTT, 
                    'T' AS DVT,
                    (b.Quantity * a.CDay * a.CRong * a.CDai / 1000000000) AS M3,
                    CONCAT(c.first_name, ' ', c.last_name) AS NguoiGiao,
                    a.created_at AS ngaygiao,
                    b.confirm statuscode,
                    sl.source CDoanLoi,
                    sl.HXL,
                    sl.LL LoiLoai,
                    sl.TOChuyenVe,
                    case when loinhamay is not null then loinhamay
                    else a.Team end NguonLoi,
                    CONCAT(d.first_name, ' ', d.last_name) AS NguoiNhan,
                    b.confirm_at AS ngaynhan,
                    c.plant,
                    c.branch branch,
                    case when c.branch=1 then 'Thuận Hưng'
                WHEN c.branch=3 THEN 'Tuyên Quang'
                WHEN c.branch=4 THEN 'Viforex'
                ELSE 'NOT DEFINE' END as branchName
                FROM sanluong a 
                JOIN notireceipt b ON a.id = b.baseID AND b.deleted = 0 AND  b.type = 1
                JOIN users c ON a.create_by = c.id
                JOIN historySL sl on b.id=sl.notiId
                JOIN users d ON b.confirmBy = d.id;"
        );
    }

}
