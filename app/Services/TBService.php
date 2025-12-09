<?php

namespace App\Services;

use App\Models\AwaitingstocksTb;
use App\Models\NotireceiptTb;
use App\Services\HanaService;
use App\Services\mes\AwaitingstocksTbService;
use App\Services\mes\NotireceiptTbService;
use Auth;
use Carbon\Carbon;
use DB;
use Exception;
use Log;
use GuzzleHttp\Client;


class TBService
{
    private HanaService $hanaService;
    private NotireceiptTbService $notireceiptTbService;
    private AwaitingstocksTbService $awaitingstocksTbService;
    private $SQL_GHINHAN_SL_TB = 'SELECT * FROM UV_GHINHANSLTB WHERE "TO" = ? ORDER BY "LSX" ASC';
    private $SQL_SOLUONG_GHINHAN_TB = 'SELECT IFNULL(sum("ConLai"),0) "Quantity" FROM UV_GHINHANSLTB WHERE "ItemChild"=? AND "TO"=? AND "SPDICH"=? AND "LSX" = ?';
    private $SQL_SL_TON_TB = 'SELECT * FROM UV_SOLUONGTONTB WHERE "U_SPDICH"=? AND "ItemCode"=? AND"U_To"=? AND "U_GRID" = ?';
    private $SQL_DETAIL_GHINHAN_SL_TB = <<<SQL
        SELECT * FROM UV_GHINHANSLTB 
        WHERE "LSX" = ? 
        AND "ItemChild" = ?
        AND "SPDICH" = ?
        AND "TO" = ?
    SQL;
    private ORSCService $ORSCService;

    public function __construct(
        HanaService $hanaService,
        NotireceiptTbService $notireceiptTbService,
        AwaitingstocksTbService $awaitingstocksTbService,
        ORSCService $ORSCService
    ) {
        $this->hanaService = $hanaService;
        $this->notireceiptTbService = $notireceiptTbService;
        $this->awaitingstocksTbService = $awaitingstocksTbService;
        $this->ORSCService = $ORSCService;
    }

    public function sanLuongTB($params)
    {
        try {
            $slTB = $this->hanaService->select($this->SQL_GHINHAN_SL_TB, [$params['TO']]);

            $results = [];

            foreach ($slTB as $k => $value) {
                $key = $value['SPDICH'];

                //Đối với các kết quả key tìm được, tạo một mảng có các trường sau
                if (!isset($results[$key])) {
                    $results[$key] = [
                        'SPDICH' => $value['SPDICH'],
                        'NameSPDich' => $value['NameSPDich'],
                        'MaThiTruong' => $value['MaThiTruong'],
                        'Details' => [],
                    ];
                }

                // 3.2. Tạo key có giá trị hỗn hợp là ItemChild.TO.TOTT
                $detailsKey = $value['ItemChild'] . $value['TO'] . $value['TOTT'] . $value['Version'];

                $details = [
                    'ItemChild' => $value['ItemChild'],
                    'ChildName' => $value['ChildName'],
                    'Version' => $value['Version'],
                    'ProdType' => $value['ProdType'],
                    'QuyCach2' => $value['QuyCach2'],
                    'CDay' => $value['CDay'],
                    'CRong' => $value['CRong'],
                    'CDai' => $value['CDai'],
                    'CDOAN' => $value['CDOAN'],
                    'LSX' => [
                        [
                            'LSX' => $value['LSX'],
                            'SanLuong' => $value['SanLuong'],
                            'DaLam' => $value['DaLam'],
                            'Loi' => $value['Loi'],
                            'ConLai' => $value['ConLai'],
                        ],
                    ],
                    'totalsanluong' => $value['SanLuong'],
                    'totalDaLam' => $value['DaLam'],
                    'totalLoi' => $value['Loi'],
                    'totalConLai' => $value['ConLai'],
                ];

                // Check if the composite key already exists
                $compositeKeyExists = false;
                foreach ($results[$key]['Details'] as &$existingDetails) {
                    $existingKey = $existingDetails['ItemChild'] . $existingDetails['TO'] . $existingDetails['TOTT'] . $existingDetails['Version'];
                    if ($existingKey === $detailsKey) {
                        $existingDetails['LSX'][] = $details['LSX'][0];
                        $existingDetails['totalsanluong'] += $value['SanLuong'];
                        $existingDetails['totalDaLam'] += $value['DaLam'];
                        $existingDetails['totalLoi'] += $value['Loi'];
                        $existingDetails['totalConLai'] += $value['ConLai'];
                        $compositeKeyExists = true;
                        break;
                    }
                }

                if (!$compositeKeyExists) {
                    $results[$key]['Details'][] = array_merge($details, [
                        'TO' => $value['TO'],
                        'NameTO' => $value['NameTO'],
                        'TOTT' => $value['TOTT'],
                        'NameTOTT' => $value['NameTOTT']
                    ]);
                }
            }

            $team = $params['TO'];

            $stockPending = $this->notireceiptTbService->getStockPendingByTeam($team);

            if ($stockPending !== null) {
                foreach ($results as $result) {
                    $SPDICH = $result['SPDICH'];
                    foreach ($result['Details'] as &$details) {
                        $ItemChild = $details['ItemChild'];
                        $TO = $details['TO'];

                        // Find the corresponding stock pending entry
                        $stockEntry = $stockPending->first(function ($entry) use ($SPDICH, $ItemChild, $TO) {
                            return $entry['FatherCode'] == $SPDICH && $entry['ItemCode'] == $ItemChild && $entry['Team'] == $TO;
                        });

                        // Update totalConLai if the stock entry is found
                        if ($stockEntry !== null) {
                            $details['totalConLai'] = $details['totalConLai'] - $stockEntry['Quantity'];
                        }
                    }
                }
            }

            $data = null;
            $datacxl = null;

            //data need confirm
            if ($team && $team == "QC_YS(VCN)" || $team && $team == "QC_CH" || $team && $team == "QC_HG") {
                $data = null;
            } else {
                $rawData = DB::table('notireceipt_tb as a')
                    ->join('users as b', 'a.CreatedBy', '=', 'b.id')
                    ->select(
                        'a.FatherCode',
                        'a.ItemCode',
                        'a.ItemName',
                        'a.team',
                        'a.CongDoan',
                        // 'a.CDay',
                        // 'a.CRong',
                        // 'a.CDai',
                        'a.Quantity',
                        'a.MaThiTruong',
                        'a.ProdType',
                        'a.created_at',
                        'b.first_name',
                        'b.last_name',
                        'a.text',
                        'a.id',
                        'a.type',
                        'a.confirm'
                    )
                    ->where(function ($query) {
                        $query->where('a.type', '=', 0)
                            ->orWhere('a.type', '=', -1);
                    })
                    ->where('a.NextTeam', $team)
                    ->where('a.confirm', '=', 0)
                    ->where('a.deleted', '=', 0)
                    ->get()
                    ->map(function ($item) {
                        // thuộc tính rong ở đây
                        // Lấy thông tin từ bảng chitietrong dựa trên id của notireceiptVCN
                        $item->rong  = DB::table('chitietrong')
                            ->where('baseID', $item->id)
                            ->select('ItemCode', 'ItemName', 'QuyCach', 'Quantity')
                            ->where('type', '=', 0)
                            ->get();


                        return $item;
                    });

                // Tạo mảng kết quả mới có thêm trường MaThiTruong
                $data = collect();

                foreach ($rawData as $item) {
                    // Truy vấn đến bảng OITM trong SAP để lấy U_SKU
                    $query = 'SELECT "U_SKU", "U_CDay", "U_CRong", "U_CDai" FROM OITM WHERE "ItemCode" = ?';
                    $result = $this->hanaService->selectOne($query, [$item->ItemCode]);


                    $maThiTruong = null;
                    $CDay = null;
                    $CRong = null;
                    $CDai = null;
                    if ($result) {
                        $maThiTruong = $result['U_SKU'];
                        $CDay = (float) $result['U_CDay'];
                        $CRong = (float) $result['U_CRong'];
                        $CDai = (float) $result['U_CDai'];

                        if (strpos((string) $CDay, '.') !== false && (int) substr((string) $CDay, strpos((string) $CDay, '.') + 1) > 0) {
                            $CDay = number_format((float) $CDay, 1);
                        } else {
                            $CDay = (int) $CDay;
                        }

                        if (strpos((string) $CRong, '.') !== false && (int) substr((string) $CRong, strpos((string) $CRong, '.') + 1) > 0) {
                            $CRong = number_format((float) $CRong, 1);
                        } else {
                            $CRong = (int) $CRong;
                        }

                        if (strpos((string) $CDai, '.') !== false && (int) substr((string) $CDai, strpos((string) $CDai, '.') + 1) > 0) {
                            $CDai = number_format((float) $CDai, 1);
                        } else {
                            $CDai = (int) $CDai;
                        }
                    }

                    // Thêm thuộc tính MaThiTruong vào item
                    $itemWithMarket = (object) array_merge((array) $item, ['MaThiTruong' => $maThiTruong], ['CDay' => $CDay], ['CRong' => $CRong], ['CDai' => $CDai]);
                    $data->push($itemWithMarket);
                }
            }

            return response()->json([
                'data' => $results,
                'noti_choxacnhan' => $data,
                'noti_phoixuly' => $datacxl
            ], 200);
        } catch (Exception $e) {
            return response()->json(['error', 'Lấy sản lượng Tủ bếp có lỗi,', 'message' => $e->getMessage()], 500);
        }
    }

    public function viewDetail($params)
    {
        try {
            $remainQty = $this->getQuantityRemain($params['ItemCode'], $params['TO'], $params['SPDICH'], $params['LSX']);
            $dataSLTon = $this->slTonTbTheoLSX($params['SPDICH'], $params['ItemCode'], $params['TO'], $params['LSX']);

            $groupedResults = [];

            foreach ($dataSLTon as $result) {
                $itemCode = $result['ItemCode'];
                $subItemCode = $result['SubItemCode'];
                $subItemName = $result['SubItemName'];
                $onHand = (float) $result['OnHand'];
                $baseQty = (float) $result['BaseQty'];
                $issueType = $result['IssueType'];

                if (!array_key_exists($subItemCode, $groupedResults)) {
                    $groupedResults[$subItemCode] = [
                        'SubItemCode' => $subItemCode,
                        'SubItemName' => $subItemName,
                        'OnHand' => 0,
                        'BaseQty' => $baseQty,
                        'IssueType' => $issueType
                    ];
                }

                $groupedResults[$subItemCode]['OnHand'] = $onHand;
            }

            $CongDoan = null;
            foreach ($dataSLTon as $result) {
                $U_CDOAN = $result['U_CDOAN'];

                if ($CongDoan === null) {
                    $CongDoan = $U_CDOAN;
                } else {
                    if ($U_CDOAN !== $CongDoan) {
                        return response()->json(['error' => 'Các giá trị của U_CDOAN trong LSX không giống nhau!'], 422);
                    }
                }
            }

            // Lấy kho của bán thành phẩm
            $SubItemWhs = null;
            foreach ($dataSLTon as $result) {
                $wareHouse = $result['wareHouse'];

                if ($SubItemWhs === null) {
                    $SubItemWhs = $wareHouse;
                } else {
                    if ($wareHouse !== $SubItemWhs) {
                        return response()->json(['error' => 'Các giá trị của wareHouse trong LSX không giống nhau!'], 422);
                    }
                }
            }

            // Lấy thông tin từ awaitingstocks để tính toán số lượng tồn thực tế
            foreach ($groupedResults as $item) {
                $awaitingQtySum = $this->awaitingstocksTbService->soLuongTonThucTe($item['SubItemCode'], $params['TO']);
                $item['OnHand'] -= $awaitingQtySum;
            }

            $groupedResults = array_values($groupedResults);

            // Dữ liệu nhà máy, gửi kèm thôi chứ không có xài
            $factory = [
                [
                    'Factory' => 'YS',
                    'FactoryName' => 'Nhà Máy Yên Sơn'
                ],
                [
                    'Factory' => 'CH',
                    'FactoryName' => 'Nhà Máy Chiêm Hóa'
                ],
                [
                    'Factory' => 'VF',
                    'FactoryName' => 'Nhà Máy Viforex'
                ],
                [
                    'Factory' => 'OS',
                    'FactoryName' => 'Lỗi mua ngoài'
                ]
            ];

            $itemInfo = $this->notireceiptTbService->getItemByItemCode($params['ItemCode']);

            // Lấy danh sách sản lượng và lỗi đã ghi nhận
            $notification = $this->notireceiptTbService->getNotificationNotireceipt($params['SPDICH'], $params['ItemCode'], $params['TO'], $params['LSX']);
            $returnData = $this->notireceiptTbService->getReturnNotireceipt($params['SPDICH'], $params['ItemCode'], $params['TO'], $params['LSX']);

            // Tính số lượng tối đa
            $maxQuantities = [];
            foreach ($groupedResults as $result) {
                $onHand = $result['OnHand'];
                $baseQty = $result['BaseQty'];

                $maxQuantity = $baseQty ? floor($onHand / $baseQty) : 0;
                $maxQuantities[] = $maxQuantity;
            }

            $maxQty = !empty($maxQuantities) ? min($maxQuantities) : 0;

            // Tính tống số lượng chờ xác nhận và chờ xử lý lỗi
            $WaitingConfirmQty = $notification != null ?  ($notification->where('type', '=', 0)->sum('Quantity') ?? 0) : 0;
            $WaitingQCItemQty = $notification != null ? ($notification->where('type', '=', 1)->where('SubItemCode', '=', null)->sum('Quantity') ?? 0) : 0;

            // 4. Trả về kết quả cho người dùng
            return response()->json([
                'ItemInfo' => $itemInfo,
                'CongDoan'  =>  $CongDoan,
                'SubItemWhs' => $SubItemWhs,
                'ProdType' => null,
                'notifications' => $notification,
                'stocks' => $groupedResults,
                'maxQty' =>   $maxQty,
                'WaitingConfirmQty' => $WaitingConfirmQty,
                'WaitingQCItemQty' => $WaitingQCItemQty,
                'remainQty' =>   $remainQty,
                'Factorys' => $factory,
                'returnData' => $returnData
            ]);
        } catch (Exception $e) {
            Log::info($e->getMessage());
            return response()->json(['error', 'Chi tiết ghi nhận tủ bếp có lỗi', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Lấy số lượng còn lại của Tủ bếp
     *
     * @param  String  $itemCode 
     * @param  String  $team 
     * @param  String  $spDich 
     * @param  String  $lsx 
     * @return  Number Số lượng tồn
     */
    public function getQuantityRemain($itemCode, $team, $spDich, $lsx)
    {
        try {
            $data = $this->hanaService->selectOne($this->SQL_SOLUONG_GHINHAN_TB, [$itemCode, $team, $spDich, $lsx]);
            $quantity = (float) $data['Quantity'];
            return $quantity;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    /**
     * Lấy số lượng còn lại của Tủ bếp
     *
     * @param  String  $itemChild 
     * @param  String  $team 
     * @param  String  $spDich 
     * @return mixed Số lượng tồn 
     */
    public function slTonTbTheoLSX($spDich, $itemCode, $team, $lsx)
    {
        try {
            $data = $this->hanaService->select($this->SQL_SL_TON_TB, [$spDich, $itemCode, $team, $lsx]);
            return $data;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function acceptReceiptTB($payload)
    {
        try {
            DB::beginTransaction();
            $changedData = [];
            $data = json_encode($payload['Data']);

            if ($payload['CompleQty'] > 0) {
                $notifi = NotireceiptTb::create([
                    'LSX' => $payload['LSX'],
                    'text' => 'Production information waiting for confirmation',
                    'Quantity' => $payload['CompleQty'],
                    'MaThiTruong' => $payload['MaThiTruong'],
                    'FatherCode' => $payload['FatherCode'],
                    'ItemCode' => $payload['ItemCode'],
                    'ItemName' => $payload['ItemName'],
                    'team' => $payload['Team'],
                    'NextTeam' => $payload['NexTeam'],
                    'CongDoan' => $payload['CongDoan'],
                    'QuyCach' => $payload['CDay'] . "*" . $payload['CRong'] . "*" . $payload['CDai'],
                    'type' => 0,
                    'openQty' => 0,
                    'ProdType' => $payload['ProdType'],
                    'version' => $payload['version'],
                    'CreatedBy' => Auth::user()->id,
                    'loinhamay' => null,
                ]);
                $changedData[] = $notifi;

                foreach ($payload['Data']['SubItemQty'] as $subItem) {
                    AwaitingstocksTb::create([
                        'notiId' => $notifi->id,
                        'SubItemCode' => $subItem['SubItemCode'],
                        'AwaitingQty' => $payload['CompleQty'] * $subItem['BaseQty'],
                        'team' => $payload['Team'],
                    ]);
                }
            }

            if ($payload['RejectQty'] > 0) {
                $toqc = "";
                $teamQC = $this->ORSCService->getTeamQC($payload['Factory'] ? $payload['Factory']['value'] : Auth::user()->plant, $payload['KHOI']);
                $toqc = $teamQC['ResName'];


                $notifi = NotireceiptTb::create([
                    'LSX' => $payload['LSX'],
                    'text' => 'Error information sent to QC',
                    'FatherCode' => $payload['FatherCode'],
                    'ItemCode' => $payload['ItemCode'],
                    'ItemName' => $payload['ItemName'],
                    'Quantity' => $payload['RejectQty'],
                    'SubItemCode' => $payload['SubItemCode'],
                    'SubItemName' => $payload['SubItemName'],
                    'team' => $payload['Team'],
                    'NextTeam' => $toqc,
                    'CongDoan' => $payload['CongDoan'],
                    'QuyCach' => $payload['CDay'] . "*" . $payload['CRong'] . "*" . $payload['CDai'],
                    'type' => 1,
                    'openQty' => $payload['RejectQty'],
                    'ProdType' => $payload['ProdType'],
                    'ErrorData' => $data,
                    'MaThiTruong' => $payload['MaThiTruong'],
                    'CreatedBy' => Auth::user()->id,
                    'loinhamay' => $payload['loinhamay'],
                ]);
                $changedData[] = $notifi;

                if (empty($request->SubItemCode)) {
                    foreach ($payload['Data']['SubItemQty'] as $subItem) {
                        AwaitingstocksTb::create([
                            'notiId' => $notifi->id,
                            'SubItemCode' => $subItem['SubItemCode'],
                            'AwaitingQty' => $payload['RejectQty'] * $subItem['BaseQty'],
                            'team' => $payload['Team'],
                        ]);
                    }
                } else {
                    foreach ($payload['ErrorData']['SubItemQty'] as $subItem) {
                        if ($subItem['SubItemCode'] == $payload['SubItemCode']) {
                            $awaitingStock = AwaitingstocksTb::create([
                                'notiId' => $notifi->id,
                                'SubItemCode' => $subItem['SubItemCode'],
                                'AwaitingQty' => $payload['RejectQty'] * $subItem['BaseQty'],
                                'team' => $payload['Team'],
                            ]);
                            break;
                        }
                    }
                }
            }
            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'ghi nhận sản lượng không thành công', 'error' => $e->getMessage()], 500);
        }
        return response()->json([
            'message' => 'Successful',
            'data' => $changedData
        ], 200);
    }

    public function confirmAcceptReceipt($payload)
    {
        try {
            DB::beginTransaction();
            $data = NotireceiptTb::where('id', $payload['id'])->where('confirm', 0)->first();

            if (!$data) {
                throw new \Exception('Giao dịch hiện tại có thể đã được xác nhận hoặc bị xóa. Hãy load lại tổ để kiểm tra.');
            }

            $U_GIAO = DB::table('users')->where('id', $data->CreatedBy)->first();

            // Validate phân bổ
            if ($data->NextTeam != "YS-QC"  && $data->NextTeam != "CH-QC"  && $data->NextTeam != "HG-QC" && $data->NextTeam != "QC_TH") {
                // $data->FatherCode, $data->ItemCode, $data->team, $data->version, $data->LSX
                $dataallocate = $this->collectdata($data->LSX, $data->ItemCode, $data->FatherCode, $data->team);
                $allocates = $this->allocate($dataallocate, $data->Quantity);

                if (count($allocates) == 0) {
                    return response()->json([
                        'error' => false,
                        'status_code' => 506,
                        'message' => "Số lượng ghi nhận vượt số lượng kế hoạch. Vui lòng kiếm tra tổ: " .
                            $data->Team . " sản phẩm: " .
                            $data->ItemCode . ", lệnh sản xuất:" . $data->LSX
                    ], 500);
                }
                if (isset($allocates['error']) && $allocates['error']) {
                    return response()->json([
                        'error' => true,
                        'status_code' => 506,
                        'message' => "Vượt hạn mức. kiểm tra tổ:" . $data->team . " sản phẩm: " .
                            $data->ItemCode . " sản phẩm đích: " .
                            $data->FatherCode . " LSX." . $data->LSX
                    ], 500);
                }
                $string = '';
                $dataReceipt = [];
                foreach ($allocates['allocatedData'] as $allocate) {
                    $string .= $allocate['DocEntry'] . '-' . $allocate['Allocate'] . ';';
                    $dataReceipt[] = [
                        "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                        "U_UUID" => $payload['id'],
                        "U_LSX" => $allocate['LSX'],
                        "U_TO" => $data->team,
                        "U_NGiao" => $U_GIAO->last_name . " " . $U_GIAO->first_name,
                        "U_NNhan" => Auth::user()->last_name . " " . Auth::user()->first_name,
                        "DocumentLines" => [[
                            "Quantity" => (float) $allocate['Allocate'],
                            "TransactionType" => "C",
                            "BaseEntry" => $allocate['DocEntry'],
                            "BaseType" => 202,
                            "CostingCode" => "CBG",
                            "CostingCode4" => "Default",
                            "BatchNumbers" => [
                                [
                                    "BatchNumber" => $allocate['ItemChild'] . '-' . substr($payload['year'], 2) . 'W' . str_pad($payload['week'], 2, '0', STR_PAD_LEFT),
                                    "Quantity" => $allocate['Allocate'],
                                    "ItemCode" =>  $allocate['ItemChild'],
                                    "U_CDai" => $allocate['CDai'],
                                    "U_CRong" => $allocate['CRong'],
                                    "U_CDay" => $allocate['CDay'],
                                    "U_Status" => "HD",
                                    "U_Year" => $request->year ?? now()->format('y'),
                                    "U_Week" => $payload['week'] ? str_pad($payload['week'], 2, '0', STR_PAD_LEFT) : str_pad(now()->weekOfYear, 2, '0', STR_PAD_LEFT)
                                ]
                            ]
                        ]]
                    ];
                }
                if ($string == '') {
                    return response()->json([
                        'error' => true,
                        'status_code' => 506,
                        'message' => "Lỗi lấy dữ liệu phiếu xuất:" .
                            $data->Team . " sản phẩm: " .
                            $data->ItemCode . " sản phẩm đích: " .
                            $data->FatherCode . " LSX." . $data->LSX
                    ], 500);
                }

                $dataSendPayload = [
                    'InventoryGenEntries' => $dataReceipt
                ];

                $payload = playloadBatch($dataSendPayload); // Assuming `playloadBatch()` function prepares the payload.
                $client = new Client();
                $response = $client->request('POST', UrlSAPServiceLayer() . '/b1s/v1/$batch', [
                    'verify' => false,
                    'headers' => [
                        'Accept' => '*/*',
                        'Content-Type' => 'multipart/mixed;boundary=batch_36522ad7-fc75-4b56-8c71-56071383e77c_' . $payload['uid'],
                        'Authorization' => 'Basic ' . BasicAuthToken(),
                    ],
                    'body' => $payload['payload'], // Đảm bảo $pl được định dạng đúng cách với boundary
                ]);

                $res = $response->getBody()->getContents();
                if ($response->getStatusCode() == 400) {
                    throw new \Exception('SAP ERROR Incomplete batch request body.');
                }
                if ($response->getStatusCode() == 500) {
                    throw new \Exception('SAP ERROR ' . $response->getBody()->getContents());
                }
                if ($response->getStatusCode() == 401) {
                    throw new \Exception('SAP authen ' . $response->getBody()->getContents());
                }
                if ($response->getStatusCode() == 202) {

                    // Bước 1: kiểm tra phản hồi có chứa phần tử thành công không
                    if (strpos($res, 'ETag') === false) {
                        $this->throwSAPError($res);
                    }
                    // Tách các phần của batch response
                    $parts = preg_split('/--batch.*?\r\n/', $res);
                    $receiptFromProduction = null;

                    // Lặp qua các phần của phản hồi để trích xuất thông tin
                    foreach ($parts as $part) {
                        if (strpos($part, '"DocEntry"') !== false) {
                            preg_match('/"DocEntry"\s*:\s*(\d+)/', $part, $entryMatches);
                            preg_match('/"DocNum"\s*:\s*(\d+)/', $part, $numMatches);
                            if (!empty($entryMatches[1]) && !empty($numMatches[1])) {
                                $receiptFromProduction = [
                                    'DocEntry' => (int)$entryMatches[1],
                                    'DocNum' => (int)$numMatches[1],
                                ];
                                break;
                            }
                        }
                    }

                    // Kiểm tra xem có thông tin phiếu ReceiptFromProduction không
                    if (empty($receiptFromProduction)) {
                        $this->throwSAPError($res);
                    }

                    $documentLog = [
                        'ReceiptFromProduction' => $receiptFromProduction,
                        'timestamp' => now()->toDateTimeString()
                    ];

                    NotireceiptTb::where('id', $data->id)->update([
                        'confirm' => 1,
                        'confirmBy' => Auth::user()->id,
                        'confirm_at' => Carbon::now()->format('YmdHis'),
                        'document_log' => json_encode($documentLog)
                    ]);
                    AwaitingstocksTb::where('notiId', $data->id)->delete();
                } else {
                    $this->throwSAPError($res);
                }
                DB::commit();
                return response()->json('success', 200);
            } else {
                return response()->json([
                    'error' => true,
                    'status_code' => 500,
                    'message' => "Tổ không hợp lệ."
                ], 500);
            }
        } catch (Exception $e) {
            DB::rollBack();

            // Kiểm tra lỗi 502 Proxy Error (mất kết nối server)
            if (strpos($e->getMessage(), '502 Proxy Error') !== false) {
                return response()->json([
                    'error' => true,
                    'status_code' => 500,
                    'error_type' => 'PROXY_CONNECTION_FAILED',
                    'message' => 'Đường truyền tới máy chủ bị gián đoạn, vui lòng thử lại sau giây lát.',
                    'original_error' => $e->getMessage()
                ], 500);
            }

            // Kiểm tra lỗi SAP code:-5002 (tồn kho không đủ)
            if (
                strpos($e->getMessage(), 'SAP code:-5002') !== false &&
                strpos($e->getMessage(), 'Make sure that the consumed quantity') !== false
            ) {

                // Tạo thông báo chi tiết về thiếu hàng
                $message = "Nguyên vật liệu không đủ để giao nhận!";
                $itemDetails = [];

                preg_match('/Production Order no:\s*(\d{9})/', $e->getMessage(), $matches);
                $productionOrderNumber = $matches[1] ?? null;

                return response()->json([
                    'error' => true,
                    'status_code' => 40001,
                    'error_type' => 'INSUFFICIENT_INVENTORY',
                    'message' => $message,
                    'item_code' => $payload['ItemCode'],
                    'production_order' => $productionOrderNumber,
                    'original_error' => $e->getMessage()
                ], 400);
            }

            Log::error($e);

            return response()->json([
                'error' => true,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    function collectdata($lsx, $item, $spdich, $to)
    {

        $results = $this->hanaService->select($this->SQL_DETAIL_GHINHAN_SL_TB, [$lsx, $item, $spdich, $to]);
        return  $results;
    }

    function allocate($data, $totalQty)
    {
        $nev = 0;
        foreach ($data as &$item) {
            if (isset($item['ConLai']) && $item['ConLai'] <= $totalQty) {
                $item['Allocate'] = $item['ConLai'];
                $totalQty -= $item['ConLai'];
            } else {
                if ($item['ConLai'] > 0) {
                    $item['Allocate'] = min($item['ConLai'], $totalQty);
                    $totalQty -= $item['Allocate'];
                } else {
                    $item['Allocate'] = 0;
                }
            }
        }

        if ($totalQty > 0) {
            $nev = 1;
            return ['error' => 'Vượt hạn mức', 'nev' => $nev];
        }
        $filteredData = array_filter($data, fn($item) => $item['Allocate'] != 0);
        return ['allocatedData' => array_values($filteredData), 'nev' => $nev];
    }

    private function throwSAPError(string $resBody)
    {
        preg_match('/\{.*\}/s', $resBody, $matches);
        if (!isset($matches[0])) {
            throw new \Exception('SAP code: Unknown chi tiết: Không thể phân tích phản hồi từ SAP');
        }

        $errorData = json_decode($matches[0], true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('SAP code: Unknown chi tiết: Lỗi phân tích JSON từ SAP: ' . json_last_error_msg());
        }

        if (isset($errorData['error'])) {
            $code = $errorData['error']['code'] ?? 'Unknown';
            $message = $errorData['error']['message']['value'] ??
                (is_array($errorData['error']['message']) ? json_encode($errorData['error']['message']) : ($errorData['error']['message'] ?? 'Không có thông tin chi tiết'));
            throw new \Exception("SAP code: $code chi tiết: $message");
        }

        throw new \Exception('SAP code: Unknown chi tiết: Không tìm thấy thông tin lỗi trong phản hồi SAP');
    }

    public function confirmRejectTB($payload)
    {
        try {
            DB::beginTransaction();
            $data = NotireceiptTb::where('id', $payload['id'])->where('confirm', 0)->first();

            if (!$data) {
                throw new \Exception('Giao dịch hiện tại có thể đã được xác nhận hoặc bị xóa. Hãy load lại tổ để kiểm tra.');
            }

            NotireceiptTb::where('id', $payload['id'])->update(['confirm' => 2, 'confirmBy' => Auth::user()->id, 'confirm_at' => Carbon::now()->format('YmdHis'), 'text' => $payload['reason']]);
            AwaitingstocksTb::where('notiId', $payload['id'])->delete();
            DB::commit();
            return response()->json('success', 200);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Trả lại không thành công', 'error' => $e->getMessage()], 500);
        }
    }

    function checkReceiptTB($id)
    {
        $dataNoti = NotireceiptTb::query()->where('id', '=', $id)->first();
        if (!$dataNoti) {
            return response()->json([
                'error' => true,
                'status_code' => 500,
                'message' => 'Giao dịch hiện tại có thể đã được xác nhận hoặc bị xóa. Hãy load lại tổ để kiểm tra.',
            ], 500);
        }
        $requiredInventory = $this->getRequiredInventory($dataNoti->ItemCode, $dataNoti->LSX, $dataNoti->team);

        // Kiểm tra xem có nguyên vật liệu nào không đủ
        if (count($requiredInventory) != 0) {
            return response()->json([
                'message' => 'Nguyên vật liệu đã đủ để giao nhận.',
                'requiredInventory' => $requiredInventory,
            ], 200);
        } else {
            return response()->json([
                'error' => true,
                'status_code' => 40001,
                'message' => 'Nguyên vật liệu không đủ để giao nhận',
                'requiredInventory' => $requiredInventory,
            ], 500);
        }
    }

    private function getRequiredInventory($itemCode, $lsx, $to)
    {
        $requiredItems = [];
        $groupedItems = [];

        // Truy vấn view UV_TONKHOSAP để lấy thông tin
        $query = <<<SQL
            SELECT
                "DocNum",
                "U_GRID",
                "U_To",
                "U_CDOAN",
                "U_SPDICH",
                "ItemCode",
                "ItemName",
                "SubItemCode",
                "SubItemName",
                "wareHouse",
                "BaseQty" AS "DinhMuc",
                "Factory",
                (("PlannedQty" - "IssuedQty")) AS "SoLuongConPhaiSanXuat",
                "OnHand" AS "TonTaiTo",
                ROUND(("PlannedQty" - "IssuedQty") - "OnHand") AS "SoLuongToiThieuCanBoSung"
            FROM UV_TONKHOSAP
            WHERE "ItemCode" = ?
            AND "U_GRID" = ?
            AND "U_To"= ?
            AND ROUND(("PlannedQty" - "IssuedQty") - "OnHand") > 0
        SQL;

        $results = $this->hanaService->select($query, [$itemCode, $lsx, $to]);

        // Nhóm dữ liệu theo SubItemCode và wareHouse
        foreach ($results as $item) {
            // Tính toán số lượng tối thiểu cần bổ sung
            $requiredQuantity = (float)$item['SoLuongToiThieuCanBoSung'];

            $key = $item['SubItemCode'] . '_' . $item['wareHouse'];

            if (!isset($groupedItems[$key])) {
                $groupedItems[$key] = [
                    'SubItemCode' => $item['SubItemCode'],
                    'SubItemName' => $item['SubItemName'],
                    'wareHouse' => $item['wareHouse'],
                    'requiredQuantity' => $requiredQuantity,
                    'DinhMuc' => (float)$item['DinhMuc']
                ];
            } else {
                // Cộng dồn số lượng cần bổ sung nếu đã có cùng SubItemCode và wareHouse
                $groupedItems[$key]['requiredQuantity'] += $requiredQuantity;
            }
        }

        // Chuyển từ mảng kết hợp sang mảng tuần tự
        foreach ($groupedItems as $item) {
            // Làm tròn số lượng để dễ đọc
            $item['requiredQuantity'] = round($item['requiredQuantity'], 2);
            $requiredItems[] = $item;
        }

        return $requiredItems;
    }
}
