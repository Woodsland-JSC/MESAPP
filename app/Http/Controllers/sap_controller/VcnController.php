<?php

namespace App\Http\Controllers\sap_controller;

use App\Http\Controllers\Controller;
use App\Models\DisassemblyOrder;
use App\Models\notireceiptVCN;
use App\Services\HanaService;
use App\Services\mes\AwaitingStockVcnService;
use App\Services\mes\NotireceiptVcnService;
use App\Services\OvenService;
use Auth;
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
    private $SQL_CHI_TIET_SL_RONG = 'CALL "USP_ChiTietSLVCN_RONG"(?,?,?)';
    private $SQL_CHI_TIET_RONG = <<<SQL
        SELECT
            T0."DocEntry",
            T0."ItemFather",
            T0."FatherName",
            T0."ItemCode",
            T0."ItemName",
            T0."SanLuong",
            T0."DaLam",
            T0."Loi",
            (T0."SanLuong" - T0."DaLam" - T0."Loi")            AS "ConLai",
            T0."U_CDOAN",
            T0."CDai",
            T0."CRong",
            T0."CDay",
            T0."BaseQty",
            T0."U_GRID"
        FROM (
            SELECT
                    T1."DocEntry",    
                TF."ItemCode"                                     AS "ItemFather",
                T0."U_To",
                T0."U_Version"                                    AS "Version",
                TF."ItemName"                                     AS "FatherName",
                T1."ItemCode",
                T5."ItemName",
                SUM(T1."PlannedQty" * -1)                         AS "SanLuong",
                SUM(IFNULL(T3."Quantity", 0))                     AS "DaLam",
                SUM(IFNULL(T4."Quantity", 0))                     AS "Loi",
                IFNULL(T5."U_CDai", 0)                            AS "CDai",
                IFNULL(T5."U_CRong", 0)                           AS "CRong",
                IFNULL(T5."U_CDay", 0)                            AS "CDay",
                T0."U_CDOAN",
                T1."BaseQty",
                T0."U_GRID"
            FROM OWOR T0
            JOIN WOR1 T1
                ON T0."DocEntry" = T1."DocEntry"
            JOIN (
                SELECT
                    T0."DocEntry",
                    T1."ItemCode",
                    T1."ItemName"
                FROM OWOR T0
                JOIN WOR1 T1
                    ON T0."DocEntry" = T1."DocEntry"
                AND T1."BaseQty"  > 0
                AND T1."ItemType" = 4
                AND T0."Status"   = 'R'
                AND T0."U_CDOAN"  = 'RO'
            ) TF
                ON T0."DocEntry" = TF."DocEntry"
            LEFT JOIN IGN1 T3
                ON T1."DocEntry" = T3."BaseEntry"
            AND T3."BaseType" = 202
            AND T3."TranType" = 'C'
            AND T3."ItemCode" = T1."ItemCode"
            LEFT JOIN IGN1 T4
                ON T1."DocEntry" = T4."BaseEntry"
            AND T4."BaseType" = 202
            AND T4."TranType" = 'R'
            AND T4."ItemCode" = T1."ItemCode"
            INNER JOIN OITM T5
                ON T1."ItemCode" = T5."ItemCode"
            INNER JOIN OITM T6
                ON T0."U_SPDICH" = T6."ItemCode"
            WHERE
                    T0."U_CDOAN"   = 'RO'
                AND T0."Status"    = 'R'
                AND T1."ItemType"  = 4
                AND T1."PlannedQty" < 0
                AND TF."ItemCode"  = ?
                AND T0."U_To"      = ?
                AND TO."U_GRID" = ?
            GROUP BY
                    "T1"."DocEntry",
                TF."ItemCode", TF."ItemName", T1."ItemCode",
                T0."U_CDOAN", T5."ItemName", T0."U_Version", "U_To",
                T5."U_CDai", T5."U_CRong", T5."U_CDay", T1."BaseQty",
                T0."U_GRID"
            HAVING
                SUM(T1."PlannedQty" * -1)
                - SUM(IFNULL(T3."Quantity", 0))
                - SUM(IFNULL(T4."Quantity", 0)) > 0
        ) T0
    SQL;

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

            // if ($request->ProdType == null) {
            //     return response()->json(['error' => 'Giá trị "ProdType" trong lệnh hoặc trong sản phẩm không được bỏ trống. Vui lòng kiểm tra lại.'], 500);
            // }

            $params = $request->query();

            $dataSanLuongVCN = $this->hanaService->selectOne($this->SQL_GET_QUANTITY_SANLUONG_VCN, [$params['ItemCode'], $params['TO'], $params['SPDICH'], $params['LSX']]);
            $quantity = $dataSanLuongVCN['Quantity'] ? (float) $dataSanLuongVCN['Quantity'] : 0;

            $dataSLTon = $this->hanaService->selectOne($this->SQL_SO_LUONG_TON_THEO_LSX, [$params['SPDICH'], $params['ItemCode'], $params['TO'], $params['LSX']]);

            $congDoan = $dataSLTon['U_CDOAN'];
            $subItemWhs = $dataSLTon['wareHouse'];
            $prodType =  $dataSLTon['ProdType'];
            $subItemCode = $dataSLTon['SubItemCode'];

            $groupedResults = [];

            $groupedResults[] = [
                'SubItemCode' => $subItemCode,
                'SubItemName' => $dataSLTon['SubItemName'],
                'OnHand' => $dataSLTon['OnHand'] ? (float) $dataSLTon['OnHand'] : 0,
                'BaseQty' => $dataSLTon['BaseQty'] ? (float) $dataSLTon['BaseQty'] : 0,
            ];

            $awaitingQtySum = $awaitingStockVcnService->soLuongTonThucTe($subItemCode, $params['TO']);
            $groupedResults[0]['OnHand'] -= $awaitingQtySum;

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

            $itemInfo = $notireceiptVcnService->getItemByItemCode($params['ItemCode']);

            // Lấy danh sách sản lượng và lỗi đã ghi nhận
            $notification = $notireceiptVcnService->getNotificationNotireceipt($params['SPDICH'], $params['ItemCode'], $params['TO'], $params['LSX']);
            $returnData = $notireceiptVcnService->getReturnNotireceipt($params['SPDICH'], $params['ItemCode'], $params['TO'], $params['LSX']);

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
            $WaitingConfirmQty = $notification->where('type', '=', 0)->sum('Quantity');
            $WaitingQCItemQty = $notification->where('type', '=', 1)->where('SubItemCode', '=', null)->sum('Quantity') ?? 0;

            // 4. Trả về kết quả cho người dùng
            return response()->json([
                'ItemInfo' => $itemInfo,
                'CongDoan'  =>  $congDoan,
                'SubItemWhs' => $subItemWhs,
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
            return response()->json(['error' => 'Lấy dữ liệu có lỗi!', 'message' => [$params['ItemCode'], $params['TO'], $params['SPDICH'], $params['LSX']]], 500);
        }
    }

    public function receiptsProductionsDetailRong(Request $request, HanaService $hanaService)
    {
        // 1. Nhận vào giá trị "SPDICH", "ItemCode', "To" từ request
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
            $chiTietSLRong = $hanaService->select($this->SQL_CHI_TIET_RONG, [$request->FatherCode, $request->TO, $request->LSX]);

            //3. Dữ liệu nhà máy, gửi kèm thôi chứ không có xài
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
            ];

            // Lấy công đoạn hiện tại
            $CongDoan = null;
            foreach ($chiTietSLRong as $key => $result) {

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
                $chitietrongQty = DB::table('chitietrong')
                    ->join('notireceiptVCN', 'chitietrong.baseID', '=', 'notireceiptVCN.id')
                    ->where('notireceiptVCN.FatherCode', $request->FatherCode)
                    ->where('notireceiptVCN.team', $request->TO)
                    ->where('notireceiptVCN.version', $request->version)
                    ->where('chitietrong.ItemCode', $itemCode)
                    ->sum('chitietrong.Quantity');

                $result['ConLai'] = (float) $result['ConLai'] - (float) $chitietrongQty;
                $results[$key] = $result;
            }

            //Gọi hàm để lấy số lượng tồn bán thành phẩm từ SAP
            $query2 = 'call UV_WEB_StockRong(?)';
            $stockRong = $hanaService->select($query2, [$request->FatherCode]);

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
                'stocks' => $results,
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
}
