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

}