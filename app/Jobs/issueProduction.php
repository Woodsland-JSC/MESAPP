<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\sap\ConnectController;
class issueProduction implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    protected $ItemCode;
    protected $WarehouseCode;
    protected $Qty;
    protected $BranchCode;
    public function __construct($ItemCode,$Qty,$WarehouseCode,$BranchCode)
    {
        $this->ItemCode = $ItemCode;
        $this->Qty = $Qty;
        $this->WarehouseCode = $WarehouseCode;
        $this->BranchCode = $BranchCode;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        //1.check item quản lý theo batch/serial/none và tồn kho hiện tại theo kho
        /*** 
        0 khong quan ly batch/serial
        1 batch
        2 serial
        */
        $conDB = (new ConnectController)->connect_sap();

        $query = 'select * from "Uf_CheckStockByWhsCode_ManBy"(?,?)';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            $this->fail('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$this->ItemCode, $this->WarehouseCode])) {
            $this->fail('Error executing SQL statement: ' . odbc_errormsg($conDB));
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
         // Fetch the single record
            $row = odbc_fetch_array($stmt);

            if ($row === false) {
                $this->fail('No data returned');
                throw new \Exception('No data returned.');
            }
            // Extract the desired values
            $itemType = $row['ItemType'];
            $stock = $row['Stock'];
            if($stock < $this->Qty){
                $this->fail('Stock is not enough');
                throw new \Exception('Stock is not enough');
            }
        //2.allocate data
        $query = 'call "USP_AllocateIssue"(?,?,?,?)';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            $this->fail('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$this->ItemCode, $this->WarehouseCode, $this->Qty, (int)$itemType])) {
            $this->fail('Error executing SQL statement: ' . odbc_errormsg($conDB));
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        }
        //3. create issue production
        if(count($results) == 0){
            $this->fail('Error creating issue production, type'.(int)$itemType);
            throw new \Exception('Error creating issue production');
        }
        $serial_batch=[];
        foreach ($results as $result){
            if($itemType == 1){
                $serial_batch[] = [
                    'BatchNumber' => $result['BatchNumber'],
                    'Quantity' => $result['Quantity']
                ];
            }
            if($itemType == 2){
                $serial_batch[] = [
                    'SystemSerialNumber' => $result['SerialNumber'],
                    'Quantity' => $result['Quantity']
                ];
            }
        }
        if($itemType == 0){
            $body = [
                "BPL_IDAssignedToInvoice" =>  $this->BranchCode,
                "DocumentLines"=> [
                    [
                        "ItemCode"=> $this->ItemCode,
                        "Quantity"=> $this->Qty,
                        "WarehouseCode"=> $this->WarehouseCode,
                    ]
                ]
            ];
        }
        else if ($itemType == 1){
            $body = [
                "BPL_IDAssignedToInvoice" =>  $this->BranchCode,
                "DocumentLines"=> [
                    [
                        "ItemCode"=> $this->ItemCode,
                        "Quantity"=> $this->Qty,
                        "WarehouseCode"=> $this->WarehouseCode,
                        "BatchNumbers"=>  $serial_batch
                    ]
                ]
            ];
        }
        else if ($itemType == 2){
            $body = [
                "BPL_IDAssignedToInvoice" => 1,
                "DocumentLines"=> [
                    [
                        "ItemCode"=> $this->ItemCode,
                        "Quantity"=> $this->Qty,
                        "WarehouseCode"=> $this->WarehouseCode,
                        "SerialNumbers"=> $serial_batch
                    ]
                ]
            ];
        }
       
        $response = Http::withOptions([
            'verify' => false,
        ])->withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Authorization' => 'Basic '. BasicAuthToken() , //BasicAuthToken(),
        ])->post(UrlSAPServiceLayer().'/b1s/v1/InventoryGenExits',$body);
        if (!$response->successful()) {
            $res = $response->json();
            $this->fail($res['error']);
        }
    }
}
