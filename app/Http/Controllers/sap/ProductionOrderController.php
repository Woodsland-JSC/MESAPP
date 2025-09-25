<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Exception;
use Log;
use Request;

class ProductionOrderController extends Controller
{

    private $SQL_DANH_SACH_LSX = "Call usp_VN_VCN_GetCLSX();";
    private $SQL_THONG_TIN_THEO_MA_LSX = "SELECT * FROM OWOR WHERE U_GRID = ?";
    private $SQL_LSX_CHI_TIET = 'SELECT 
                                    O1."U_CDOAN",
                                    W1."ItemName",
                                    W1."U_CDay",
                                    W1."U_CRong",
                                    W1."U_CDai",
                                    W1."UomCode",
                                    W1."BaseQty"
                                FROM 
                                    "WOR1" W1
                                LEFT JOIN 
                                    "OWOR" O1 ON W1."DocEntry" = O1."DocEntry" 
                                WHERE
                                    O1."U_GRID" = ? AND W1."UomCode" IS NOT NULL';

    // danh sách lệnh sản xuất
    public function index(Request $request, ConnectController $connectController)
    {
        try {
            $connection = $connectController->connect_sap();
            // $SQL = "SELECT * FROM OWOR WHERE U_GRID = 'PLY-CH-2025-00005'";
            $sql = $this->SQL_DANH_SACH_LSX;

            $stmt = odbc_prepare($connection, $sql);
            if (!$stmt) {
                throw new Exception('Error preparing SQL statement: ' . odbc_errormsg($connection));
            }
            if (!odbc_execute($stmt, [])) {
                throw new Exception('Error executing SQL statement: ' . odbc_errormsg($connection));
            }

            $results = [];
            while ($row = odbc_fetch_array($stmt)) {
                $rowData = array_values($row);
                // Log::info($row);

                $item = [
                    'createdBy' => $rowData[0],
                    'productionOrderCode' => $rowData[1],
                    'createdDate' => $rowData[2],
                    'week' => $rowData[3],
                    'productCode' => $rowData[4],
                    'productName' => $rowData[5],
                ];

                $results[] = $item;
            }

            return response()->json($results, 200);
        } catch (Exception $e) {
            return response()->json([
                "error" => $e->getMessage()
            ], 500);
        }
    }

    public function getDetailProductionOrder(Request $request, $productionOrderId, ConnectController $connectController)
    {
        if (!$productionOrderId) {
            return response()->json([
                "error" => 'Không tìm thấy mã lệnh sản xuất'
            ], 500);
        }

        try {
            Log::info("[ProductionOrderController][getDetailProductionOrder] - START");
            $connection = $connectController->connect_sap();

            Log::info("[ProductionOrderController][getDetailProductionOrder] - Thông tin chi tiết hàng hóa các công đoạn theo LSX");

            $sql = $this->SQL_LSX_CHI_TIET;

            $stmt = odbc_prepare($connection, $sql);

            if (!$stmt) {
                throw new Exception('Error preparing SQL statement: ' . odbc_errormsg($connection));
            }
            if (!odbc_execute($stmt, [$productionOrderId])) {
                throw new Exception('Error executing SQL statement: ' . odbc_errormsg($connection));
            }

            $results = [];

            while ($row = odbc_fetch_array($stmt)) {
                // Log::info($row);
                $results[] = $row;
            }

            Log::info("[ProductionOrderController][getDetailProductionOrder] - END");


            return response()->json($results, 200);
        } catch (Exception $e) {
            return response()->json([
                "error" => $e->getMessage()
            ], 500);
        }
    }
}
