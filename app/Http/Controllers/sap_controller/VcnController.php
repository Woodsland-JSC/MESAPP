<?php

namespace App\Http\Controllers\sap_controller;

use App\Http\Controllers\Controller;
use App\Models\awaitingstocksvcn;
use App\Models\ChiTietRong;
use App\Models\DisassemblyOrder;
use App\Models\notireceiptVCN;
use App\Rules\AtLeastOneQty;
use App\Services\HanaService;
use App\Services\mes\AwaitingStockVcnService;
use App\Services\mes\NotireceiptVcnService;
use App\Services\OvenService;
use Auth;
use Carbon\Carbon;
use DB;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Log;

/**
 * Controller xử lý ván công nghiệp
 *
 * @author  TuanPA
 */
class VcnController extends Controller
{
    private HanaService $hanaService;
    private $SQL_GET_QUANTITY_SANLUONG_VCN = 'SELECT "ConLai" as "Quantity" FROM UV_GHINHANSLVCN WHERE "ItemChild"= ? AND "TO"= ? AND "SPDICH"=? AND "LSX" = ?';
    private $SQL_SO_LUONG_TON_THEO_LSX = 'SELECT * FROM UV_SOLUONGTONVCN WHERE "U_SPDICH"=? AND "ItemCode"=? AND"U_To"=? AND "U_GRID" = ?;';
    private $SQL_CHI_TIET_RONG = 'CALL "USP_DETAILVCN_RONG"(?,?,?,?)';
    private $SQL_UV_WEB_VCN_STOCKRONG = 'CALL "UV_WEB_VCN_STOCKRONG"(?,?)';

    public function __construct(HanaService $hanaService)
    {
        $this->hanaService = $hanaService;
    }

    public function receiptsProductionsDetail(Request $request, AwaitingStockVcnService $awaitingStockVcnService, NotireceiptVcnService $notireceiptVcnService)
    {
        try {
            $validator = Validator::make($request->all(), [
                'SPDICH' => 'required|string|max:254',
                'ItemCode' => 'required|string|max:254',
                'TO' => 'required|string|max:254',
                'ProdType' => '',
                'LSX' => 'required'
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => implode(' ', $validator->errors()->all())], 500);
            }

            $params = $request->query();

            $dataSanLuongVCN = $this->hanaService->selectOne($this->SQL_GET_QUANTITY_SANLUONG_VCN, [$params['ItemCode'], $params['TO'], $params['SPDICH'], $params['LSX']]);
            $quantity = $dataSanLuongVCN['Quantity'] ? (float) $dataSanLuongVCN['Quantity'] : 0;

            $dataSLTon = $this->hanaService->select($this->SQL_SO_LUONG_TON_THEO_LSX, [$params['SPDICH'], $params['ItemCode'], $params['TO'], $params['LSX']]);

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
                        'IssueType' => $result['IssueType']
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

            foreach ($groupedResults as &$item) {
                $awaitingQtySum = $awaitingStockVcnService->soLuongTonThucTe($item['SubItemCode'], $params['TO']);
                $item['OnHand'] = $item['OnHand'] - ($awaitingQtySum ?? 0);
            }
            $groupedResults = array_values($groupedResults);

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

            $itemInfo = $notireceiptVcnService->getItemByItemCode($params['ItemCode']);

            // Lấy danh sách sản lượng và lỗi đã ghi nhận
            $notification = $notireceiptVcnService->getNotificationNotireceipt($params['SPDICH'], $params['ItemCode'], $params['TO'], $params['LSX']);
            $returnData = $notireceiptVcnService->getReturnNotireceipt($params['SPDICH'], $params['ItemCode'], $params['TO'], $params['LSX']);

            // Tính số lượng tối đa
            $maxQuantities = [];
            foreach ($groupedResults as $result) {
                if ($result['IssueType'] == 'B') {
                    $onHand = $result['OnHand'];
                    $baseQty = $result['BaseQty'];

                    $maxQuantity = $baseQty ? floor($onHand / $baseQty) : 0;
                    $maxQuantities[] = $maxQuantity;
                }
            }

            if (count($maxQuantities) == 0 && count($groupedResults) > 0) {
                foreach ($groupedResults as $result) {
                    $onHand = $result['OnHand'];
                    $baseQty = $result['BaseQty'];

                    $maxQuantity = $baseQty ? floor($onHand / $baseQty) : 0;
                    $maxQuantities[] = $maxQuantity;
                }
            }

            $maxQty = !empty($maxQuantities) ? min($maxQuantities) : 0;

            // Tính tống số lượng chờ xác nhận và chờ xử lý lỗi
            $WaitingConfirmQty = $notification->where('type', '=', 0)->sum('Quantity');
            $WaitingQCItemQty = $notification->where('type', '=', 1)->where('SubItemCode', '=', null)->sum('Quantity') ?? 0;

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
                'remainQty' =>   $quantity,
                'Factorys' => $factory,
                'returnData' => $returnData
            ]);
        } catch (Exception $e) {
            Log::info($e);
            return response()->json(['error' => 'Lấy dữ liệu có lỗi!'], 500);
        }
    }

    public function receiptsProductionsDetailRong(Request $request, HanaService $hanaService)
    {
        $validator = Validator::make($request->all(), [
            'FatherCode' => 'required|string|max:254',
            'TO' => 'required|string|max:254',
            'version' => 'required|string|max:254',
            'LSX' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Thiếu dữ liệu'], 500);
        }

        try {
            $chiTietSLRong = $hanaService->select($this->SQL_CHI_TIET_RONG, [$request->FatherCode, $request->TO, $request->version, $request->LSX]);

            $factory = [
                [
                    'Factory' => 'YS',
                    'FactoryName' => 'Nhà Máy VCN Yên Sơn'
                ],
                [
                    'Factory' => 'CH',
                    'FactoryName' => 'Nhà Máy VCN Chiêm Hóa'
                ],
                [
                    'Factory' => 'VF',
                    'FactoryName' => 'Nhà Máy VCN Hà Giang'
                ],
                [
                    'Factory' => 'OS',
                    'FactoryName' => 'Lỗi mua ngoài'
                ]
            ];

            $CongDoan = null;
            foreach ($chiTietSLRong as $key => &$result) {

                $U_CDOAN = $result['U_CDOAN'];

                if ($CongDoan === null) {
                    $CongDoan = $U_CDOAN;
                } else {
                    if ($U_CDOAN !== $CongDoan) {
                        return response()->json(['error' => 'Các giá trị của U_CDOAN trong LSX không giống nhau!'], 500);
                    }
                }

                // Chỉnh sửa giá trị ConLai của mỗi bản ghi trong $results bằng cách lấy tổng số lượng của trường
                // Quantity của bảng chitietrong có baseID = $notification->id. Nhóm theo ItemCode.
                // Sau đó cập nhật giá trị ConLai mới trong $results = ConLai - Qty theo ItemCode của $results.
                $itemCode = $result['ItemCode'];
                $lsx = $result['U_GRID'];
                $chitietrongQty = DB::table('chitietrong')
                    ->join('notireceiptVCN', 'chitietrong.baseID', '=', 'notireceiptVCN.id')
                    ->where('notireceiptVCN.FatherCode', $request->FatherCode)
                    ->where('notireceiptVCN.team', $request->TO)
                    ->where('notireceiptVCN.version', $request->version)
                    ->where('chitietrong.ItemCode', $itemCode)
                    ->where('notireceiptVCN.LSX', '=', $lsx)
                    ->sum('chitietrong.Quantity');
                $result['ConLai'] = (float) $result['ConLai'] - (float) $chitietrongQty;
                $chiTietSLRong[$key] = $result;
            }

            $stockRong = $hanaService->select($this->SQL_UV_WEB_VCN_STOCKRONG, [$request->FatherCode, $request->LSX]);

            $TotalFather = 0;
            $stockFather = [];

            foreach ($stockRong as $key => $rong) {
                $stockFather[] = $rong;
            }

            if (count($stockFather) == 0) {
                $TotalFather = 0;
            } else {
                $TotalFather = $stockFather[0]['Qty'];
            }

            // Lệnh phân rã
            $disassemblyOrder = DisassemblyOrder::where('SubItemCode', $request->FatherCode)
                ->where('team', $request->TO)
                ->where('isClosed', '0')
                ->leftJoin('users as u', 'disassembly_order.CreatedBy', '=', 'u.id')
                ->select(
                    'disassembly_order.id',
                    'disassembly_order.SubItemCode',
                    'disassembly_order.Qty',
                    'disassembly_order.isClosed',
                    'disassembly_order.created_at',
                    DB::raw("CONCAT(u.first_name, ' ', u.last_name) as created_by")
                )
                ->get();

            $totalDisassemblyQty = $disassemblyOrder->sum('Qty');
            $TotalFather = $TotalFather - $totalDisassemblyQty;

            // Lấy thông tin notireceiptVCN để xác định trạng thái lệnh phân rã
            $notificationsForOrders = notireceiptVCN::whereIn('disassembly_order_id', $disassemblyOrder->pluck('id'))
                ->select('disassembly_order_id', 'confirm')
                ->get()
                ->groupBy('disassembly_order_id');

            // Cập nhật trạng thái lệnh phân rã dựa trên các notireceiptvcn con
            $disassemblyOrder = $disassemblyOrder->map(function ($order) use ($notificationsForOrders) {
                if ($order->isClosed == 1) {
                    return $order;
                }

                $orderNotifications = $notificationsForOrders->get($order->id, collect());

                if ($orderNotifications->isEmpty()) {
                    return $order;
                }


                $allConfirmed = $orderNotifications->every(function ($noti) {
                    return $noti->confirm == 1;
                });

                $hasConfirmed = $orderNotifications->some(function ($noti) {
                    return $noti->confirm != 0;
                });

                if ($allConfirmed) {
                    $order->status = 'completed';
                } elseif ($hasConfirmed) {
                    $order->status = 'inprogress';
                } else {
                    $order->status = 'new';
                }

                return $order;
            });

            // Data noti (giữ nguyên query như ban đầu)
            $notification = NotiReceiptVCN::query()
                ->leftJoin('chitietrong as b', 'notireceiptVCN.id', '=', 'b.baseID')
                ->join('users as c', 'notireceiptVCN.CreatedBy', '=', 'c.id')
                ->select(
                    'notireceiptVCN.id',
                    'notireceiptVCN.disassembly_order_id',
                    'version',
                    'LSX',
                    'ProdType',
                    'FatherCode',
                    'notireceiptVCN.ItemName as DetectItemName',
                    'notireceiptVCN.Quantity as DetectQuantity',
                    'SubItemCode',
                    'SubItemName',
                    'notireceiptVCN.confirm',
                    'notireceiptVCN.created_at as CreatedAt',
                    'b.ItemCode',
                    'b.ItemName',
                    'notireceiptVCN.type as Type',
                    'QtyIssueRong',
                    DB::raw("CONCAT(c.first_name, ' ', c.last_name) as fullname"),
                    DB::raw('SUM(b.Quantity) as Quantity')
                )
                ->where('deleted', 0)
                // ->where('confirm', 0)
                ->where('version', $request->version)
                ->where('FatherCode', $request->FatherCode)
                ->where('notireceiptVCN.team', $request->TO)
                ->where('notireceiptVCN.LSX', '=', $request->LSX)
                ->groupBy(
                    'notireceiptVCN.id',
                    'notireceiptVCN.disassembly_order_id',
                    'version',
                    'LSX',
                    'ProdType',
                    'DetectItemName',
                    'DetectQuantity',
                    'FatherCode',
                    'SubItemCode',
                    'SubItemName',
                    'confirm',
                    'CreatedAt',
                    'b.ItemCode',
                    'b.ItemName',
                    'Type',
                    'fullname',
                )
                ->get()
                ->groupBy('id')
                ->map(function ($items, $id) {
                    $firstItem = $items[0];
                    if ($firstItem->Type == 1) {
                        return [
                            'notiID' => $id,
                            'disassembly_order_id' => $firstItem->disassembly_order_id,
                            'Quantity' => $firstItem->DetectQuantity,
                            'ItemName' => $firstItem->DetectItemName,
                            'confirm' => $firstItem->confirm,
                            'Type' => $firstItem->Type,
                        ];
                    } else { // Type = 0
                        return [
                            'notiID' => $id,
                            'disassembly_order_id' => $firstItem->disassembly_order_id,
                            'QtyIssueRong' => $firstItem->QtyIssueRong,
                            'SubItemName' => $firstItem->SubItemName,
                            'confirm' => $firstItem->confirm,
                            'Type' => $firstItem->Type,
                            'detail' => $items->map(function ($item) {
                                return [
                                    'ItemCode' => $item->ItemCode,
                                    'ItemName' => $item->ItemName,
                                    'Qty' => $item->Quantity,
                                ];
                            })->toArray(),
                        ];
                    }
                })
                ->values();

            // Cấu trúc lại dữ liệu theo yêu cầu
            $notiWithDisassemblyOrder = $disassemblyOrder->map(function ($order) use ($notification) {
                return [
                    'id' => $order->id,
                    'quantity' => $order->Qty,
                    'status' => $order->status,
                    'created_at' => $order->created_at->format('H:i:s d/m/Y'),
                    'created_by' => $order->created_by,
                    'notifications' => $notification->filter(function ($noti) use ($order) {
                        return $noti['disassembly_order_id'] == $order->id;
                    })->values()->toArray()
                ];
            })->toArray();

            return response()->json([
                'CongDoan' => $CongDoan,
                'FatherStock' => $TotalFather,
                'stocks' => $chiTietSLRong,
                'Factorys' => $factory,
                // 'notifications' => $notification,
                'disassemblyOrders' => $notiWithDisassemblyOrder
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    function receiptVCNRong(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'LSX' => 'required|string|max:254',
            'QtyIssue',
            'CongDoan' => 'required|string|max:254',
            'version' => 'required|string|max:254',
            'ProdType' => 'required|string|max:254',
            'SubItemCode' => 'required|string|max:254',
            'SubItemName' => 'required|string|max:254',
            'NextTeam' => 'required|string|max:254',
            'team' => 'required|string|max:254',
            'Data.*.ItemCode' => 'required|string|max:254',
            'Data.*.ItemName' => 'required|string|max:254',
            'Data.*' => [new AtLeastOneQty()],
            'Data.*.CDay' => 'required|numeric',
            'Data.*.CRong' => 'required|numeric',
            'Data.*.CDai' => 'required|numeric',
        ]);

        // Check if validation fails
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 500);
        }
        // $toqc = "";
        // if (Auth::user()->plant == 'TH') {
        //     $toqc = 'TH-QC';
        // } else if (Auth::user()->plant == 'YS') {
        //     $toqc = 'YS1-QC';
        // } else {
        //     $toqc = 'HG-QC';
        // }
        try {
            DB::beginTransaction();

            $newOrder = DisassemblyOrder::create([
                'SubItemCode' => $request->SubItemCode,
                'team' => $request->team,
                'Qty' => $request->QtyIssue,
                'status' => "new",
                'CreatedBy' => Auth::user()->id,
                'created_at' => Carbon::now(),
            ]);

            // data header
            foreach ($request->Data as $dt) {
                if ($dt['CompleQty'] > 0) {
                    $notidata = notireceiptVCN::create([
                        'LSX' => $request->LSX,
                        'text' => 'Production information waiting for confirmation',
                        'MaThiTruong' => $request->MaThiTruong ?? null,
                        'FatherCode' => $request->SubItemCode,
                        'SubItemCode' => $request->SubItemCode,
                        'SubItemName' => $request->SubItemName,
                        'team' => $request->team,
                        'NextTeam' => $request->NextTeam,
                        'CongDoan' => $request->CongDoan,
                        'type' => 0,
                        'openQty' => 0,
                        'ProdType' => $request->ProdType,
                        'version' => $request->version,
                        'isRONG' => true,
                        'QtyIssueRong' => $request->QtyIssue,
                        'CreatedBy' => Auth::user()->id,
                        'disassembly_order_id' => $newOrder->id,
                    ]);
                    ChiTietRong::create([
                        'baseID' => $notidata->id,
                        'ItemCode' => $dt['ItemCode'],
                        'ItemName' => $dt['ItemName'],
                        'type' => 0,
                        'openQty' => 0,
                        'Quantity' => $dt['CompleQty'],
                        'QuyCach' => $dt['CDay'] . "*" . $dt['CRong'] . "*" . $dt['CDai'],
                        'Team' => $request->Team,
                        'NextTeam' => $request->NextTeam,
                        'CDay' => $dt['CDay'],
                        'CRong' => $dt['CRong'],
                        'CDai' => $dt['CDai']
                    ]);
                }
                if ($dt['RejectQty'] > 0) {
                    $noti = notireceiptVCN::create([
                        'LSX' => $request->LSX,
                        'text' => 'Error information sent to QC',
                        'MaThiTruong' => $request->MaThiTruong ?? null,
                        'FatherCode' => $request->SubItemCode,
                        'ItemCode' => $dt['ItemCode'],
                        'ItemName' => $dt['ItemName'],
                        'team' => $request->team,
                        'Quantity' => $dt['RejectQty'],
                        'NextTeam' => $request->NextTeam,
                        'CongDoan' => $request->CongDoan,
                        'type' => 1,
                        'openQty' => 0,
                        'ProdType' => $request->ProdType,
                        'version' => $request->version,
                        'isRONG' => true,
                        'QtyIssueRong' => $request->QtyIssue,
                        'CreatedBy' => Auth::user()->id,
                        'QuyCach' => $dt['CDay'] . "*" . $dt['CRong'] . "*" . $dt['CDai'],
                        'disassembly_order_id' => $newOrder->id,
                    ]);
                }
            }

            DB::commit();
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'ghi nhận sản lượng không thành công', 'error' => $e->getMessage()], 500);
        }
        return response()->json([
            'message' => 'Successful',
        ], 200);
    }
}
