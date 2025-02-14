<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use PhpOffice\PhpWord\TemplateProcessor;
use Carbon\Carbon;
use Auth;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\File;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Process;
use Illuminate\Database\QueryException;
use App\Http\Controllers\sap\ConnectController;

class ReportController extends Controller
{

    //
    function chitietgiaonhan(Request $request)
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $branch = $request->input('branch');
        // $plant = $request->input('plant');
        $to = $request->input('To');
        $statusCode = $request->input('status_code');

        $query = DB::table('gt_cbg_chitietgiaonhan');

        if ($branch) {
            $query->where('branch', $branch);
        }

        if ($to) {
            $toArray = is_array($to) ? $to : explode(',', trim($to, '[]'));
            $query->whereIn('ToHT', $toArray);
        }

        if (isset($statusCode)) {
            $query->where('statuscode', $statusCode);
        }

        if ($statusCode == 0) {
            if ($fromDate && $toDate) {
                $query->whereBetween('ngaygiao', [
                    Carbon::parse($fromDate)->startOfDay(),
                    Carbon::parse($toDate)->endOfDay(),
                ]);
            }
        } else {
            if ($fromDate && $toDate) {
                $query->whereBetween('ngaygiao', [
                    Carbon::parse($fromDate)->startOfDay(),
                    Carbon::parse($toDate)->endOfDay()
                ])
                    ->whereBetween('ngaynhan', [
                        Carbon::parse($fromDate)->startOfDay(),
                        Carbon::parse($toDate)->endOfDay()
                    ]);
            }
        }

        $data = $query->get();
        $itemdistinct = $query->distinct()->pluck('ItemCode');
        $itemstring = "'" . implode("','", $itemdistinct->toArray()) . "'";
        $dataQuyCach = qtycachIemSAP($itemstring);

        $dataQuyCachMap = [];
        foreach ($dataQuyCach as $item) {
            $dataQuyCachMap[$item['ItemCode']] = $item;
        }

        // Bổ sung thông tin M3 từ SAP và dd ra kết quả truy vấn
        $conDB = (new ConnectController)->connect_sap();

        $query = 'SELECT "ItemCode", "U_M3SP" FROM OITM';

        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt)) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        $m3sapMap = [];
        while ($row = odbc_fetch_array($stmt)) {
            $m3sapMap[$row['ItemCode']] = $row['U_M3SP'];
        }

        // Lặp qua originalData và thay thế các giá trị
        $updatedData = $data->map(function ($item) use ($dataQuyCachMap, $m3sapMap) {
            // Copy the item to prevent modifying the original
            $newItem = clone $item;

            // Add existing dimensions if available
            if (isset($dataQuyCachMap[$item->ItemCode])) {
                $newItem->CDay = $dataQuyCachMap[$item->ItemCode]['CDay'];
                $newItem->CRong = $dataQuyCachMap[$item->ItemCode]['CRong'];
                $newItem->CDai = $dataQuyCachMap[$item->ItemCode]['CDai'];
            }

            // Add M3SAP value if available and multiply it with Quantity
            $newItem->M3SAP = isset($m3sapMap[$item->ItemCode]) ? round((float)$m3sapMap[$item->ItemCode] * (float)$item->Quantity, 6) : null;

            return $newItem;
        });

        odbc_close($conDB);

        return response()->json($updatedData);
    }

    //báo cáo xếp chờ xấy
    function xepchosay(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'FromDate' => 'required|date',
            'ToDate' => 'required|date',
        ], [
            'FromDate.required' => 'The FromDate is required.',
            'FromDate.date' => 'The FromDate must be a valid date.',
            'ToDate.required' => 'The ToDate is required.',
            'ToDate.date' => 'The ToDate must be a valid date.',
        ]);
        if ($validate->fails()) {
            return response()->json(['error' => $validate->errors()], 400);
        }
        $branch = $request->input('branch');
        $plant = $request->input('plant');
        $fromDate = $request->FromDate;
        $ToDate = $request->ToDate;
        // Start the query and add conditions based on the request inputs
        $query = DB::table('gt_say_xepchoxay');

        if ($branch) {
            $query->where('branch', $branch);
        }

        if ($plant) {
            $query->where('plant', $plant);
        }

        if ($fromDate != null && $ToDate != null) {
            // where beetwen
            $query->whereRaw('DATE(created_at) BETWEEN ? AND ?', [$fromDate, $ToDate]);
        }

        // Get the results
        $data = $query->get();
        $itemdistinct = $query->distinct()->pluck('ItemCode');
        $itemstring = "'" . implode("','", $itemdistinct->toArray()) . "'";
        $dataQuyCach = qtycachIemSAP($itemstring);

        $dataQuyCachMap = [];
        foreach ($dataQuyCach as $item) {
            $dataQuyCachMap[$item['ItemCode']] = $item;
        }

        // Lặp qua originalData và thay thế các giá trị
        $updatedData = $data->map(function ($item) use ($dataQuyCachMap) {
            if (isset($dataQuyCachMap[$item->ItemCode])) {
                $item->CDay = $dataQuyCachMap[$item->ItemCode]['CDay'];
                $item->CRong = $dataQuyCachMap[$item->ItemCode]['CRong'];
                $item->CDai = $dataQuyCachMap[$item->ItemCode]['CDai'];
            }
            return $item;
        });

        return response()->json($updatedData);
    }

    function xepsay(Request $request)
    {
        $fromDate = $request->input('fromDate');
        $ToDate = $request->input('toDate');
        // $oven= $request->input('oven');

        // Start the query and add conditions based on the request inputs
        $query = DB::table('gt_say_xepsaycbg');

        if ($fromDate && $ToDate) {
            // where beetwen
            $query->whereBetween('created_at', [$fromDate, $ToDate]);
        }

        // Get the results
        $data = $query->get();
        $itemdistinct = $query->distinct()->pluck('ItemCode');
        $itemstring = "'" . implode("','", $itemdistinct->toArray()) . "'";
        $dataQuyCach = qtycachIemSAP($itemstring);

        $dataQuyCachMap = [];
        foreach ($dataQuyCach as $item) {
            $dataQuyCachMap[$item['ItemCode']] = $item;
        }

        // Lặp qua originalData và thay thế các giá trị
        $updatedData = $data->map(function ($item) use ($dataQuyCachMap) {
            if (isset($dataQuyCachMap[$item->ItemCode])) {
                $item->CDay = $dataQuyCachMap[$item->ItemCode]['CDay'];
                $item->CRong = $dataQuyCachMap[$item->ItemCode]['CRong'];
                $item->CDai = $dataQuyCachMap[$item->ItemCode]['CDai'];
            }
            return $item;
        });

        return response()->json($updatedData);
    }

    function bienbanvaolo(Request $request)
    {
        $branch = $request->input('branch');
        $plant = $request->input('plant');
        $Oven = $request->input('oven');

        // Start the query and add conditions based on the request inputs
        $query = DB::table('say_bienbanvaolo');

        if ($branch) {
            $query->where('branch', $branch);
        }

        if ($plant) {
            $query->where('plant', $plant);
        }
        // Get the results
        $data = $query->get();
        $itemdistinct = $query->distinct()->pluck('ItemCode');
        $itemstring = "'" . implode("','", $itemdistinct->toArray()) . "'";
        $dataQuyCach = qtycachIemSAP($itemstring);

        $dataQuyCachMap = [];
        foreach ($dataQuyCach as $item) {
            $dataQuyCachMap[$item['ItemCode']] = $item;
        }

        // Lặp qua originalData và thay thế các giá trị
        $updatedData = $data->map(function ($item) use ($dataQuyCachMap) {
            if (isset($dataQuyCachMap[$item->ItemCode])) {
                $item->CDay = $dataQuyCachMap[$item->ItemCode]['CDay'];
                $item->CRong = $dataQuyCachMap[$item->ItemCode]['CRong'];
                $item->CDai = $dataQuyCachMap[$item->ItemCode]['CDai'];
            }
            return $item;
        });

        return response()->json($updatedData);
    }

    /** chế biến gỗ */
    function XuLyLoi(Request $request)
    {
        $branch = $request->input('branch');
        $plant = $request->input('plant');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        // Start the query and add conditions based on the request inputs
        $query = DB::table('gt_cbg_baocaoxulyloi');

        if ($branch) {
            $query->where('branch', $branch);
        }

        if ($plant) {
            $query->where('plant', $plant);
        }

        if ($fromDate != null && $toDate != null) {
            // where beetwen
            $query->whereRaw('DATE(ngaynhan) BETWEEN ? AND ?', [$fromDate, $toDate]);
        }

        // Get the results
        $data = $query->get();
        $itemdistinct = $query->distinct()->pluck('ItemCode');
        $itemstring = "'" . implode("','", $itemdistinct->toArray()) . "'";
        $dataQuyCach = qtycachIemSAP($itemstring);

        $dataQuyCachMap = [];
        foreach ($dataQuyCach as $item) {
            $dataQuyCachMap[$item['ItemCode']] = $item;
        }

        // Bổ sung thông tin M3 từ SAP và dd ra kết quả truy vấn
        $conDB = (new ConnectController)->connect_sap();

        $query = 'SELECT "ItemCode", "U_M3SP" FROM OITM';

        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt)) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        $m3sapMap = [];
        while ($row = odbc_fetch_array($stmt)) {
            $m3sapMap[$row['ItemCode']] = $row['U_M3SP'];
        }

        $updatedData = $data->map(function ($item) use ($dataQuyCachMap, $m3sapMap) {
            // Copy the item to prevent modifying the original
            $newItem = clone $item;

            // Add existing dimensions if available
            if (isset($dataQuyCachMap[$item->ItemCode])) {
                $newItem->CDay = $dataQuyCachMap[$item->ItemCode]['CDay'];
                $newItem->CRong = $dataQuyCachMap[$item->ItemCode]['CRong'];
                $newItem->CDai = $dataQuyCachMap[$item->ItemCode]['CDai'];
            }

            // Add M3SAP value if available and multiply it with Quantity
            $newItem->M3SAP = isset($m3sapMap[$item->ItemCode]) ? round((float)$m3sapMap[$item->ItemCode] * (float)$item->Quantity, 6) : null;

            return $newItem;
        });

        odbc_close($conDB);

        return response()->json($updatedData);
    }

    function sanluongtheothoigian(Request $request) 
    {
        $validator = Validator::make($request->all(), [
            'fromDate' => 'required',
            'toDate' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }
        
        $conDB = (new ConnectController)->connect_sap();
    
        $query = 'CALL USP_GT_BC_NGAYTUANTHANG(?, ?, ?)';
        
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        
        $defaultParam = null; // You can change this to your desired default value
        
        if (!odbc_execute($stmt, [$request->fromDate, $request->toDate, $defaultParam])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        
        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        }
        
        odbc_close($conDB);
        
        return $results;
    }

    function sanluongtheongay(Request $request) 
    {
        $validator = Validator::make($request->all(), [
            'fromDate' => 'required',
            'toDate' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }
        
        $conDB = (new ConnectController)->connect_sap();
    
        $query = 'CALL USP_GT_BC_NGAY(?, ?, ?)';
        
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        
        $defaultParam = null; // You can change this to your desired default value
        
        if (!odbc_execute($stmt, [$request->fromDate, $request->toDate, $defaultParam])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        
        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        }
        
        odbc_close($conDB);
        
        return $results;
    }

    public function dryingProcess(Request $request)
    {
        $templateFile = resource_path('templates/Quy Trình Sấy Gỗ.docx');
        //Get datetime
        $output = Carbon::now()->format('ymdHis');

        $outputFile = storage_path('app/public/reports/Quy Trình Sấy Gỗ_' . $output . '.docx');
        $filename = 'Quy Trình Sấy Gỗ_' . $output . '.docx';
        // $this->store($request, $filename);
        $templateProcessor = new TemplateProcessor($templateFile);
        $templateProcessor->setImageValue('signature', storage_path('app/public/signatures/Nguyen-Van-Cuong-signature.png'));
        $templateProcessor->setValue('branch', "Test chi nhánh");
        $templateProcessor->setValue('factory', "Test nhà máy");
        $templateProcessor->setValue('kiln', "Test lò");
        $templateProcessor->setValue('date', "01/12/2023");
        $templateProcessor->setValue('times', "12");
        $templateProcessor->setValue('sensor', "Test cảm biến");
        $templateProcessor->setValue('actualmeasure', "Test đo");
        $templateProcessor->setValue('actualthickness', "Chiều dầy");
        $templateProcessor->setValue('fanspeed', "Tốc độ quạt");
        $templateProcessor->setValue('fullname', "Nguyễn Văn A");
        $templateProcessor->saveAs($outputFile);
        return response()->download($outputFile);
    }

    public function dryingKilnHistory(Request $request)
    {
        $dataArray = [
            [
                'batchId' => 'B001',
                'palletId' => 'P001',
                'thickness' => 10,
                'width' => 30,
                'length' => 50,
                'quantity' => 5,
                'weight' => 25
            ],
            [
                'batchId' => 'B002',
                'palletId' => 'P002',
                'thickness' => 15,
                'width' => 40,
                'length' => 60,
                'quantity' => 3,
                'weight' => 18
            ],
            [
                'batchId' => 'B003',
                'palletId' => 'P003',
                'thickness' => 15,
                'width' => 40,
                'length' => 60,
                'quantity' => 3,
                'weight' => 18
            ],
            [
                'batchId' => 'B004',
                'palletId' => 'P004',
                'thickness' => 15,
                'width' => 40,
                'length' => 60,
                'quantity' => 3,
                'weight' => 18
            ],
            [
                'batchId' => 'B005',
                'palletId' => 'P005',
                'thickness' => 15,
                'width' => 40,
                'length' => 60,
                'quantity' => 3,
                'weight' => 18
            ],
        ];
        $templateFile = resource_path('templates/Danh Mục Theo Dõi Gỗ Sấy Trong Lò.docx');
        $output = Carbon::now()->format('ymdHis');
        $filename = 'Danh Mục Theo Dõi Gỗ Sấy Trong Lò_' . $output . '.docx';
        $outputFile = storage_path('app/public/reports/' . $filename);
        $templateProcessor = new TemplateProcessor($templateFile);
        // comment lại để test do chưa có file ảnh chữ kí :v
        // $templateProcessor->setImageValue('signature', storage_path('app/public/signatures/Nguyen-Van-Cuong-signature.png'));
        $templateProcessor->setValue('branch', "Test chi nhánh");
        $templateProcessor->setValue('factory', "Test nhà máy");
        $templateProcessor->setValue('date', "01/12/2023");
        $templateProcessor->setValue('kiln', "Test lò");
        $templateProcessor->setValue('woodType', "Test loại gỗ");
        $templateProcessor->setValue('palletQuantity', "125");
        $templateProcessor->setValue('envStatus ', "Test mt");
        $templateProcessor->setValue('fullname', "Nguyễn Văn A");

        $lastRow = 1;
        $templateProcessor->cloneRow('batchId', count($dataArray));


        foreach ($dataArray as $data) {
            $templateProcessor->setValue("no" . '#' . $lastRow, $lastRow);
            $templateProcessor->setValue("batchId" . '#' . $lastRow, $data['batchId']);
            $templateProcessor->setValue("palletId" . '#' . $lastRow, $data['palletId']);
            $templateProcessor->setValue("thickness" . '#' . $lastRow, $data['thickness']);
            $templateProcessor->setValue("width" . '#' . $lastRow, $data['width']);
            $templateProcessor->setValue("length" . '#' . $lastRow, $data['length']);
            $templateProcessor->setValue("quantity" . '#' . $lastRow, $data['quantity']);
            $templateProcessor->setValue("weight" . '#' . $lastRow, $data['weight']);

            // Tăng biến $rowNum lên 1 để trỏ tới hàng vừa copy
            $lastRow++;
        }

        $templateProcessor->setValue('totalquantity', "999");
        $templateProcessor->setValue('totalweight', "999");

        $templateProcessor->saveAs($outputFile);

        $outputPdfFile = storage_path('app/public/reports/Danh Mục Theo Dõi Gỗ Sấy Trong Lò_' . $output . '.pdf');
        $outputPdf = storage_path('app/public/reports/');

        $command = 'soffice --convert-to pdf "' . $outputFile . '" --outdir "' . $outputPdf . '"';

        if (strtoupper(substr(PHP_OS, 0, 3)) == 'WIN') {
            shell_exec($command);
        } else {
            $result = Process::run($command);
        }



        // Download the output PDF file
        return response()->download($outputPdfFile);
    }
}
