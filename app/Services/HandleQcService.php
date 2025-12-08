<?php

namespace App\Services;

use App\Models\LogErrorHumidity;
use Carbon\Carbon;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HandleQcService
{
    private SapB1Service $SapB1Service;
    private OITMService $oitmService;
    private OWHSService $OWHSService;

    public function __construct(SapB1Service $SapB1Service, OITMService $oitmService, OWHSService $OWHSService)
    {
        $this->SapB1Service = $SapB1Service;
        $this->oitmService = $oitmService;
        $this->OWHSService = $OWHSService;
    }


    public function handleQcSL($data)
    {
        try {
            $dataSL = $data['dataSL'] ?? [];

            if (count($dataSL) == 0) {
                return response([
                    'message' => 'Chuyển về kho sấy lại có lỗi. Vui lòng kiểm tra lại số lượng sấy lại.'
                ], 500);
            }

            $toWh = $data['ToWhsCode'];
            $fromWH = $dataSL[0]['WhsCode'];

            $documentLineExit = [];
            $documentLineEntries = [];

            foreach ($dataSL as $key => $item) {
                $digitItemCode = substr($item['ItemCode'], 0, 2);

                if ($digitItemCode == 'MM') {
                    $itemExit = [
                        "ItemCode"      => $item['ItemCode'],
                        "Quantity"      => (float) $item['qtySLM3'],
                        "WarehouseCode" => $fromWH
                    ];

                    $itemEntry = [
                        "ItemCode"      => $item['ItemCode'],
                        "Quantity"      => (float) $item['qtySLM3'],
                        "WarehouseCode" => $toWh
                    ];

                    $itemExit['BatchNumbers'] = [[
                        "Quantity" => (float) $item['qtySLM3'],
                        "ItemCode"      => $item['ItemCode'],
                        "BatchNumber" => $item['BatchNum']
                    ]];

                    $itemEntry['BatchNumbers'] = [[
                        "Quantity" => (float) $item['qtySLM3'],
                        "ItemCode"      => $item['ItemCode'],
                        "BatchNumber" => $item['ItemCode'] . '-' . substr(Carbon::now()->year, 2) . 'W' . str_pad(Carbon::now()->weekOfYear, 2, '0', STR_PAD_LEFT)
                    ]];

                    $documentLineExit[] = $itemExit;
                    $documentLineEntries[] = $itemEntry;
                }
            }

            $bodyExit = [
                "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                "DocumentLines" => $documentLineExit
            ];

            $bodyEntry = [
                "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                "DocumentLines" => $documentLineEntries
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
            Log::info('Handle Qc SL Error: ' . $e->getMessage());
            return response([
                'message' => 'Chuyển về kho sấy lại có lỗi.'
            ], 500);
        }
    }

    public function handleCH($data)
    {
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
                $itemEntry = [
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

                $dataEntries["DocumentLines"][] = $itemEntry;
            }

            $dataExits = [
                "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                "DocumentLines" => []
            ];

            foreach ($dataCH as $key => $item) {
                $digitItemCode = substr($item['ItemCode'], 0, 2);

                $itemExit = [
                    "ItemCode"      => $item['ItemCode'],
                    "Quantity"      => $item['Quantity'],
                    "WarehouseCode" => $item['WhsCode']
                ];

                if ($digitItemCode == 'MM') {
                    $itemExit['BatchNumbers'] = [[
                        "Quantity" => (float) $item['Quantity'],
                        "ItemCode"      => $item['ItemCode'],
                        "BatchNumber" => $item['BatchNum']
                    ]];
                }

                $dataExits["DocumentLines"][] = $itemExit;
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
            Log::info('Handle CH Error: ' . $e->getMessage());
            return response([
                'message' => 'Xử lý cắt hạ các items có lỗi.',
                'detail' => $e->getMessage()
            ], 500);
        }
    }

    public function baoLoiSayAm($data)
    {

        $entry = null;
        $exit = null;
        DB::beginTransaction();

        try {
            $dai = $data['dai'];
            $rong = $data['rong'];
            $day = $data['day'];
            $quantity = $data['quantity'];
            $m3 = $data['m3'];
            $team = $data['team'];
            $warehouse = $team["WhsCode"];

            $qc = $day . 'x' . $rong . 'x' . $dai;
            $itemFind = $this->oitmService->findItemByQCAndWH($day, $rong, $dai, $warehouse);

            if (!$itemFind) {
                return response()->json([
                    'message' => "Không tìm thấy item với quy cách $qc"
                ], 500);
            }

            $whSL = $this->OWHSService->getWhSLByFactory($team['Factory']);

            if (!$whSL) {
                return response()->json([
                    'message' => "Không tìm thấy kho sấy lại."
                ], 500);
            }

            $bodyExit = [
                "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                "Comments" => "Xuất gỗ sấy ẩm  đưa về kho sấy lại",
                "DocumentLines" => [
                    [
                        "ItemCode"      => $itemFind['ItemCode'],
                        "Quantity"      => (float) $m3,
                        "WarehouseCode" => $warehouse,
                        "BatchNumbers" => [
                            [
                                "Quantity" => (float) $m3,
                                "ItemCode"      => $itemFind['ItemCode'],
                                "BatchNumber" => $itemFind['DistNumber']
                            ]
                        ]
                    ]
                ]
            ];

            $resInventoryGenExits = $this->SapB1Service->post($bodyExit, 'InventoryGenExits');
            $statusInventoryGenExits = $resInventoryGenExits->successful();
            $responseInventoryGenExits = $resInventoryGenExits->json();

            if (!$statusInventoryGenExits) {
                return response()->json([
                    'message' => $responseInventoryGenExits['error'] ? $responseInventoryGenExits['error']['message']['value'] : "Xuất kho " . $warehouse . " có lỗi"
                ], 500);
            }

            $exit = $responseInventoryGenExits;

            $bodyEntry = [
                "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                "Comments" => "Nhập gỗ sấy ẩm về kho sấy lại",
                "DocumentLines" => [
                    [
                        "ItemCode"      => $itemFind['ItemCode'],
                        "Quantity"      => $m3,
                        "WarehouseCode" => $whSL['WhsCode'],
                        "BatchNumbers" => [
                            [
                                "Quantity" => $m3,
                                "ItemCode"      => $itemFind['ItemCode'],
                                "BatchNumber" => $qc,
                                "U_CDay" => $day,
                                "U_CRong" => $rong,
                                "U_CDai" => $dai,
                            ]
                        ]
                    ]
                ]
            ];

            $resInventoryGenEntry = $this->SapB1Service->post($bodyEntry, 'InventoryGenEntries');
            $statusInventoryGenEntry = $resInventoryGenEntry->successful();
            $responseInventoryGenEntry = $resInventoryGenEntry->json();

            if (!$statusInventoryGenEntry) {
                if ($exit != null) {
                    $this->SapB1Service->cancelInventoryGenExits($exit['DocEntry']);
                }

                return response()->json([
                    'message' => $responseInventoryGenEntry['error'] ? $responseInventoryGenEntry['error']['message']['value'] : "Nhập kho " . $whSL['WhsCode'] . " có lỗi"
                ], 500);
            }

            $entry = $responseInventoryGenEntry;

            LogErrorHumidity::create([
                'ItemCode' => $itemFind['ItemCode'],
                'CDay' => $day,
                'CRong' => $rong,
                'CDai' => $dai,
                'Quantity' => $m3,
                'QuantityT' => $dai != 0 ? $quantity : null,
                'Warehouse' => $warehouse,
                'ToWarehouse' => $whSL['WhsCode'],
                'Team' => $team['Code'],
                'CreatedBy' => Auth::user()->id,
                'EntryId' => $entry['DocEntry'],
                'ExitId' => $exit['DocEntry'],
                'Factory' => $team['Factory']
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Xử lý báo lỗi sấy ẩm thành công.',
                'EntryId' => $entry['DocEntry'],
                'ExitId' => $exit['DocEntry']
            ], 200);
        } catch (Exception $e) {
            Log::info("HandleQcService::baoLoiSayAm - " . $e->getMessage());

            if ($entry != null) {
                $this->SapB1Service->cancelInventoryGenEntries($entry['DocEntry']);
            }

            if ($exit != null) {
                $this->SapB1Service->cancelInventoryGenExits($exit['DocEntry']);
            }

            // DB::rollBack();

            return response()->json([
                'message' => 'Xử lý báo lỗi sấy ẩm có lỗi.'
            ], 500);
        }
    }
}
