<?php

namespace App\Services;

use App\Services\HanaService;
use App\Services\mes\AwaitingstocksTbService;
use App\Services\mes\NotireceiptTbService;
use Auth;
use DB;
use Exception;
use Log;


class TBService
{
    private HanaService $hanaService;
    private NotireceiptTbService $notireceiptTbService;
    private AwaitingstocksTbService $awaitingstocksTbService;
    private $SQL_GHINHAN_SL_TB = 'SELECT * FROM UV_GHINHANSLTB ORDER BY "LSX" ASC';
    private $SQL_SOLUONG_GHINHAN_TB = 'SELECT IFNULL(sum("ConLai"),0) "Quantity" FROM UV_GHINHANSLTB WHERE "ItemChild"=? AND "TO"=? AND "SPDICH"=? AND "LSX" = ?';
    private $SQL_SL_TON_TB = 'SELECT * FROM UV_SOLUONGTONTB WHERE "U_SPDICH"=? AND "ItemCode"=? AND"U_To"=? AND "U_GRID" = ?';

    public function __construct(HanaService $hanaService, NotireceiptTbService $notireceiptTbService, AwaitingstocksTbService $awaitingstocksTbService)
    {
        $this->hanaService = $hanaService;
        $this->notireceiptTbService = $notireceiptTbService;
        $this->awaitingstocksTbService = $awaitingstocksTbService;
    }

    public function sanLuongTB($params)
    {
        try {
            $slTB = $this->hanaService->select($this->SQL_GHINHAN_SL_TB, [$params]);

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

                if (!array_key_exists($subItemCode, $groupedResults)) {
                    $groupedResults[$subItemCode] = [
                        'SubItemCode' => $subItemCode,
                        'SubItemName' => $subItemName,
                        'OnHand' => 0,
                        'BaseQty' => $baseQty,
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

            // Lấy loại ván
            $ProdType = null;
            foreach ($dataSLTon as $result) {
                $prodType = $result['ProdType'];

                if ($ProdType === null) {
                    $ProdType = $prodType;
                } else {
                    if ($prodType !== $ProdType) {
                        return response()->json(['error' => 'Các giá trị của U_IType trong LSX không giống nhau!'], 422);
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
                'ProdType' => $prodType,
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
}
