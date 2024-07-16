<?php
use App\Http\Controllers\sap\ConnectController;
use Illuminate\Support\Facades\Auth;


if (!function_exists('allocateBatchSerial')) {
    function allocateBatchSerial( $stock_data,$data)
    {

    // Dữ liệu gốc
    // Mảng để lưu trữ kết quả phân bổ
    $allocated_stock = [];

    // Mảng để lưu trữ batch/serial đã sử dụng
    $used_batches = [];
    $used_serials = [];

    // Duyệt qua từng dòng trong dữ liệu gốc ($data)
    foreach ($data as $row) {
        $docEntry = $row['DocEntry'];
        $itemCode = $row['ItemCode'];
        $whsCode = $row['WhsCode'];
        $type = $row['Type'];
        $qty = $row['Qty'];

        // Biến để kiểm tra có đủ số lượng để phân bổ hay không
        $enoughStock = true;

        // Kiểm tra loại Type để phân bổ
        if ($type === 'B') {
            // Tính tổng số lượng batch có sẵn cho item và warehouse hiện tại
            $availableStock = [];
            foreach ($stock_data as $stock) {
                if ($stock['ItemCode'] === $itemCode && $stock['WhsCode'] === $whsCode && $stock['Type'] === 'B' && !in_array($stock['BatchOrSerial'], $used_batches)) {
                    $availableStock[] = ['BatchNum' => $stock['BatchOrSerial'], 'Qty' => $stock['Qty']];
                }
            }

            // Tính tổng lượng còn thiếu
            $remainingQty = $qty;
            foreach ($availableStock as $batch) {
                $allocateQty = min($remainingQty, $batch['Qty']);
                $allocated_stock[] = [
                    'DocEntry' => $docEntry,
                    'ItemCode' => $itemCode,
                    'WhsCode' => $whsCode,
                    'Batch' => [
                        'BatchNum' => $batch['BatchNum'],
                        'Qty' => $allocateQty,
                    ],
                ];
                $remainingQty -= $allocateQty;
                $used_batches[] = $batch['BatchNum']; // Đánh dấu batch đã sử dụng

                if ($remainingQty <= 0) break;
            }

            // Nếu không đủ để phân bổ
            if ($remainingQty > 0) {
                throw new \Exception("Không đủ batch để phân bổ cho DocEntry $docEntry.");
            }
        } elseif ($type === 'S') {
            // Tính tổng số lượng serial có sẵn cho item và warehouse hiện tại
            $availableStock = [];
            foreach ($stock_data as $stock) {
                if ($stock['ItemCode'] === $itemCode && $stock['WhsCode'] === $whsCode && $stock['Type'] === 'S' && !in_array($stock['BatchOrSerial'], $used_serials)) {
                    $availableStock[] = ['SerialNum' => $stock['BatchOrSerial'], 'Qty' => $stock['Qty']];
                }
            }

            // Tính tổng lượng còn thiếu
            $remainingQty = $qty;
            foreach ($availableStock as $serial) {
                $allocateQty = min($remainingQty, $serial['Qty']);
                $allocated_stock[] = [
                    'DocEntry' => $docEntry,
                    'ItemCode' => $itemCode,
                    'WhsCode' => $whsCode,
                    'Serial' => [
                        'SerialNum' => $serial['SerialNum'],
                        'Qty' => $allocateQty,
                    ],
                ];
                $remainingQty -= $allocateQty;
                $used_serials[] = $serial['SerialNum']; // Đánh dấu serial đã sử dụng

                if ($remainingQty <= 0) break;
            }

            // Nếu không đủ để phân bổ
            if ($remainingQty > 0) {
                $enoughStock = false;
                throw new \Exception("Không đủ serial để phân bổ cho DocEntry $docEntry.");
            }
        } elseif ($type === 'N') {
            // Đối với loại 'N', set allocate bằng với Qty
            $allocated_stock[] = [
                'DocEntry' => $docEntry,
                'ItemCode' => $itemCode,
                'WhsCode' => $whsCode,
                'Qty' => $qty,
            ];
        }

        // Nếu đủ số lượng, thực hiện phân bổ
        if ($enoughStock) {
            // Giảm số lượng cần phân bổ từ dữ liệu gốc và từ stock_data
            $key = array_search($itemCode, array_column($stock_data, 'ItemCode'));
            if ($type === 'B') {
                $stock_data[$key]['Qty'] -= $qty;
            } elseif ($type === 'S') {
                $stock_data[$key]['Qty'] -= $qty;
            }
        }
    }

    // Định dạng lại mảng để nhóm các batch cùng DocEntry, ItemCode, WhsCode
    $formatted_allocated_stock = [];
    foreach ($allocated_stock as $stock) {
        $key = $stock['DocEntry'] . '-' . $stock['ItemCode'] . '-' . $stock['WhsCode'];
        if (!isset($formatted_allocated_stock[$key])) {
            $formatted_allocated_stock[$key] = [
                'DocEntry' => $stock['DocEntry'],
                'ItemCode' => $stock['ItemCode'],
                'WhsCode' => $stock['WhsCode'],
                'Batches' => [],
            ];
        }
        if (isset($stock['Batch'])) {
            $formatted_allocated_stock[$key]['Batches'][] = $stock['Batch'];
        } elseif (isset($stock['Serial'])) {
            $formatted_allocated_stock[$key]['Serials'][] = $stock['Serial'];
        } elseif (isset($stock['Qty'])) {
            $formatted_allocated_stock[$key]['Qty'] = $stock['Qty'];
        }
    }
    // tra ve data
        return array_values($formatted_allocated_stock);
    }
}

