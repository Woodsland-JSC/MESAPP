<?php

namespace App\Services;

use Carbon\Carbon;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HandleQcService
{
    private SapB1Service $SapB1Service;
    private OITMService $oitmService;

    public function __construct(SapB1Service $SapB1Service, OITMService $oitmService)
    {
        $this->SapB1Service = $SapB1Service;
        $this->oitmService = $oitmService;
    }


    public function handleQcSL($data)
    {
        try {
            $quantitySL = $data['QuantitySL'];
            $fromWh = $data['WhsCode'];
            $itemCode = $data['ItemCode'];
            $toWh = $data['ToWhsCode'];

            $bodyExit = [
                "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                "DocumentLines" => [
                    [
                        "ItemCode"      => $itemCode,
                        "Quantity"      => $quantitySL,
                        "WarehouseCode" => $fromWh
                    ]
                ]
            ];

            $bodyEntry = [
                "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                "DocumentLines" => [
                    [
                        "ItemCode"      => $itemCode,
                        "Quantity"      => $quantitySL,
                        "WarehouseCode" => $toWh
                    ]
                ]
            ];

            $bodyEntryJson = json_encode($bodyEntry, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $bodyExitJson = json_encode($bodyExit, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

            $boundary = "batch_" . uniqid();
            $changeset = "changeset_" . uniqid();

            $CRLF = "\r\n";

            $body = "--$boundary$CRLF" .
                "Content-Type: multipart/mixed; boundary=$changeset$CRLF$CRLF" .
                "--$changeset$CRLF" .
                "Content-Type: application/http$CRLF" .
                "Content-Transfer-Encoding: binary$CRLF$CRLF" .
                "POST /b1s/v1/InventoryGenEntries HTTP/1.1$CRLF" .
                "Content-Type: application/json$CRLF$CRLF" .
                $bodyEntryJson . "$CRLF$CRLF" .
                "--$changeset$CRLF" .
                "Content-Type: application/http$CRLF" .
                "Content-Transfer-Encoding: binary$CRLF$CRLF" .
                "POST /b1s/v1/InventoryGenExits HTTP/1.1$CRLF" .
                "Content-Type: application/json$CRLF$CRLF" .
                $bodyExitJson . "$CRLF$CRLF" .
                "--$changeset--$CRLF" .
                "--$boundary--$CRLF";

            $this->SapB1Service->batch($body, $boundary);

            return response([
                'message' => 'Chuyển về kho sấy lại thành công.'
            ], 200);
        } catch (Exception $e) {
            return response([
                'message' => 'Chuyển về kho sấy lại có lỗi.'
            ], 500);
        }
    }

    public function handleCH($data)
    {
        $exitDocEntry = null;
        $importDocEntry = null;

        try {
            // Item xuất kho
            $dataCH = $data['selectedItem'];

            // item nhập
            $dataTransfer = $data['Data'];

            // tổ chuyển về
            $team = $data['team'];

            $dataHandle = [];

            $defaultItemCode = 'MM010000799';

            foreach ($dataTransfer as $key => $item) {
                $qc = $item['CDay'] . 'x' . $item['CRong'] . 'x' . $item['CDai'];
                $dataHandle[$key] = [
                    'data' => $item,
                    'qc' => $qc,
                    'item' => null
                ];

                $itemFind = $this->oitmService->findItemByQC($qc);

                if ($itemFind) {
                    $dataHandle[$key]['item'] = $itemFind;
                }
            }

            $dataEntries = [
                "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                "DocumentLines" => []
            ];

            foreach ($dataHandle as $key => $data) {
                $dataEntries["DocumentLines"][] = [
                    "Quantity" => (float) $data['data']["Quantity"],
                    "ItemCode" => $data['item'] != null ? $data['item']['U_ItemCode'] : $defaultItemCode,
                    "WarehouseCode" => $team['whCode'],
                    "BatchNumbers" => [
                        [
                            "Quantity" => (float) $data['data']["Quantity"],
                            "BatchNumber" => $data['item'] != null ? $data['item']['U_ItemCode'] : $defaultItemCode . '-' . substr(Carbon::now()->year, 2) . 'W' . str_pad(Carbon::now()->weekOfYear, 2, '0', STR_PAD_LEFT),
                        ]
                    ]
                ];
            }

            $dataExits = [
                "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                "DocumentLines" => []
            ];

            foreach ($dataCH as $key => $item) {
                $dataExits["DocumentLines"][] = [
                    "ItemCode"      => $item['ItemCode'],
                    "Quantity"      => $item['Quantity'],
                    "WarehouseCode" => $item['WhsCode']
                ];
            }

            $bodyEntryJson = json_encode($dataEntries, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $bodyExitJson = json_encode($dataExits, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

            $boundary = "batch_" . uniqid();
            $changeset = "changeset_" . uniqid();

            $CRLF = "\r\n";

            $body = "--$boundary$CRLF" .
                "Content-Type: multipart/mixed; boundary=$changeset$CRLF$CRLF" .
                "--$changeset$CRLF" .
                "Content-Type: application/http$CRLF" .
                "Content-Transfer-Encoding: binary$CRLF$CRLF" .
                "POST /b1s/v1/InventoryGenEntries HTTP/1.1$CRLF" .
                "Content-Type: application/json$CRLF$CRLF" .
                $bodyEntryJson . "$CRLF$CRLF" .
                "--$changeset$CRLF" .
                "Content-Type: application/http$CRLF" .
                "Content-Transfer-Encoding: binary$CRLF$CRLF" .
                "POST /b1s/v1/InventoryGenExits HTTP/1.1$CRLF" .
                "Content-Type: application/json$CRLF$CRLF" .
                $bodyExitJson . "$CRLF$CRLF" .
                "--$changeset--$CRLF" .
                "--$boundary--$CRLF";

            $res = $this->SapB1Service->batch($body, $boundary);

            return response([
                'message' => 'Xử lý cắt hạ các items thành công.'
            ], 200);
        } catch (Exception $e) {
            return response([
                'message' => 'Xử lý cắt hạ các items có lỗi.',
                'detail' => $e->getMessage()
            ], 500);
        }
    }
}
