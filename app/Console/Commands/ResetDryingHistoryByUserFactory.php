<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\planDryings;
use App\Models\plandetail;
use App\Http\Controllers\sap\ConnectController;

class ResetDryingHistoryByUserFactory extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:delete-unused-drying-plan {plant}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset all drying history by user factory';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $plant = $this->argument('plant'); // Get the plant argument from the command

        // Get all planDryings records with the specified plant and status = 0
        $planDryingsToDelete = planDryings::where('plant', $plant)->where('status', 0)->get();

        if ($planDryingsToDelete->isEmpty()) {
            $this->info("No records found for plant: $plant with status = 0.");
            return 0;
        }

        $ovenValues = $planDryingsToDelete->pluck('Oven')->toArray();

        // Log the Oven values (you can also save this to a file or database if needed)
        $this->info("Oven values of deleted records: " . implode(', ', $ovenValues));

        $conDB = (new ConnectController)->connect_sap();

        $valuesForSQL = "'" . implode("', '", array_map('addslashes', $ovenValues)) . "'";

        // Tạo câu truy vấn
        $query = "UPDATE \"@G_SAY3\" SET \"U_status\" = 0 WHERE \"Code\" IN ($valuesForSQL)";

        $stmt = odbc_exec($conDB, $query);

        if (!$stmt) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        // Đóng kết nối
        odbc_close($conDB);

        // Collect all IDs from planDryings to delete corresponding plan_detail records
        $planIds = $planDryingsToDelete->pluck('PlanID');

        // Delete records in plan_detail
        $deletedPlanDetails = plandetail::whereIn('PlanID', $planIds)->delete();

        // Delete records in planDryings
        $deletedPlanDryings = planDryings::whereIn('PlanID', $planIds)->delete();

        $this->info("Deleted $deletedPlanDetails records from plan_detail.");
        $this->info("Deleted $deletedPlanDryings records from planDryings.");

        // Thông báo thành công
        echo "Records updated successfully in @G_SAY3.";

        return 0;
    }
}
