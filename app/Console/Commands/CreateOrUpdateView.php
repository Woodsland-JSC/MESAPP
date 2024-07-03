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
        //DB::statement('DROP VIEW IF EXISTS view_two');
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
                c.branch
            FROM sanluong a 
            JOIN notireceipt b ON a.id = b.baseID AND b.deleted = 0 AND b.confirm IN (0, 1,2) AND b.type = 0
            JOIN users c ON a.create_by = c.id
            LEFT JOIN users d ON b.confirmBy = d.id
        ");
        // view_two is an example of how to create another view
        // DB::statement("
        //     CREATE VIEW view_two AS
        //     SELECT 
        //         ... -- Add your SQL query for the second view here
        // ");
    }

}
