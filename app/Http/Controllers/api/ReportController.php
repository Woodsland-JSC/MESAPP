<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
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

class ReportController extends Controller
{
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
        $shellOutput = null; // Renamed the variable to avoid confusion
        $command = 'soffice --convert-to pdf "' . $outputFile . '" --outdir "' . $outputPdf . '"';
        if (strtoupper(substr(PHP_OS, 0, 3)) == 'WIN') {
            shell_exec($command);
        } else {
            Process::run($command);
        }



        // Download the output PDF file
        return response()->download($outputPdfFile);
    }
}
