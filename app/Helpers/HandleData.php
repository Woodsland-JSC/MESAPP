<?php

use App\Http\Controllers\sap\ConnectController;
use Illuminate\Support\Facades\Auth;

if (!function_exists('playloadBatch')) {
    function playloadBatch($data)
    {


        $uid = uniqid();
        $batchBoundary = '--batch_36522ad7-fc75-4b56-8c71-56071383e77c_' . $uid;
        $changeSetBoundary = 'changeset';
        $output = "{$batchBoundary}\n";
        $totalTypes = count($data);
        if (empty($data['InventoryGenExits'])) {
            if (count($data['InventoryGenEntries']) > 1) {
                $output .= "Content-Type: multipart/mixed; boundary={$changeSetBoundary}\n\n";;
            }
            $totalTypes = 1;
        }
        $typeCounter = 0;
        foreach ($data as $type => $documents) {
            $typeCounter++;
            if (is_array($documents)) {
                $totalDocuments = count($documents);
                $documentCounter = 0;
                foreach ($documents as $document) {

                    $documentCounter++;
                    $output .= "Content-Type: application/http\n";
                    $output .= "Content-Transfer-Encoding: binary\n\n";
                    $output .= "POST /b1s/v1/{$type}\n";
                    $output .= "Content-Type: application/json\n\n";
                    $output .= json_encode($document, JSON_PRETTY_PRINT) . "\n\n";
                    // Chỉ thêm "{$batchBoundary}\n" nếu không phải là vòng lặp cuối
                    if (!($typeCounter === $totalTypes && $documentCounter === $totalDocuments)) {
                        $output .= "{$batchBoundary}\n";
                    }
                }
            }
        }
        $output .= "{$batchBoundary}--";
        return  ['payload' => $output, 'uid' => $uid];
    }
}
if (!function_exists('playloadIssueCBG')) {
    function playloadIssueCBG($ItemCode, $Qty, $WarehouseCode, $branch)
    {
        $conDB = (new ConnectController)->connect_sap();

        $query = 'select * from "Uf_CheckStockByWhsCode_ManBy"(?,?)';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$ItemCode, $WarehouseCode])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        // Fetch the single record
        $row = odbc_fetch_array($stmt);

        if ($row === false) {
            throw new \Exception('No data returned.');
        }
        // Extract the desired values
        $itemType = $row['ItemType'];
        $stock = $row['Stock'];
        if ($stock < $Qty) {
            throw new \Exception('Số lượng tồn ' + $ItemCode + ' tại kho ' + $WarehouseCode + ' không đủ để xuất.');
        }
        //2.allocate data
        $query = 'call "USP_AllocateIssue"(?,?,?,?)';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$ItemCode, $WarehouseCode, $Qty, (int)$itemType])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        }

        //3. create issue production
        if (count($results) == 0) {
            throw new \Exception('Error creating issue production');
        }
        $serial_batch = [];
        foreach ($results as $result) {
            if ($itemType == 1) {
                $serial_batch[] = [
                    'BatchNumber' => $result['BatchSeri'],
                    'Quantity' => $result['Allocated']
                ];
            }
            if ($itemType == 2) {
                $serial_batch[] = [
                    'SystemSerialNumber' => $result['BatchSeri'],
                    'Quantity' => $result['Allocated']
                ];
            }
        }
        if ($itemType == 0) {
            $body = [
                "BPL_IDAssignedToInvoice" =>  Auth::user()->branch,
                "DocumentLines" => [
                    [
                        "ItemCode" => $ItemCode,
                        "Quantity" => $Qty,
                        "WarehouseCode" => $WarehouseCode,
                    ]
                ]
            ];
        } else if ($itemType == 1) {
            $body = [
                "BPL_IDAssignedToInvoice" =>  Auth::user()->branch,
                "DocumentLines" => [
                    [
                        "ItemCode" => $ItemCode,
                        "Quantity" => $Qty,
                        "WarehouseCode" => $WarehouseCode,
                        "BatchNumbers" =>  $serial_batch
                    ]
                ]
            ];
        } else if ($itemType == 2) {
            $body = [
                "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                "DocumentLines" => [
                    [
                        "ItemCode" => $ItemCode,
                        "Quantity" => $Qty,
                        "WarehouseCode" => $WarehouseCode,
                        "SerialNumbers" => $serial_batch
                    ]
                ]
            ];
        }

        return $body;
    }
}
if (!function_exists('qtycachIemSAP')) {
    function qtycachIemSAP($stringItem)
    {
        $conDB = (new ConnectController)->connect_sap();

        $query = 'select "ItemCode", ifnull("U_CDay", \'0\') as "CDay", ifnull("U_CRong", \'0\') as "CRong", ifnull("U_CDai",\'0\') as "CDai" from OITM where "ItemCode" in (' . $stringItem . ')';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt)) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        }
        return $results;
    }
}
