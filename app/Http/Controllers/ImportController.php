<?php

namespace App\Http\Controllers;

set_time_limit(0);

use App\Models\Pallet;
use App\Models\pallet_details;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use DateTime;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Http;

use Maatwebsite\Excel\Excel as ExcelExcel;
use ReflectionClass;

class ImportController extends Controller
{
    public function index()
    {
        return view('imports.pallet');
    }

    public function solve(Request $request)
    {
        $jobData = DB::table('failed_jobs')->get();

        $excels = [
            ['Mã Pallet', 'ItemCode', 'Số lượng', 'Mã lô', 'Kho đến', 'Kho đi',]
        ];

        foreach ($jobData as $key => $item) {
            $id = $item->id;
            $payload = json_decode($item->payload, true);



            if ($payload['displayName'] == 'App\\Jobs\\inventorytransfer') {
                $command = unserialize($payload['data']['command']);

                $ref = new ReflectionClass($command);
                $prop = $ref->getProperty('body');
                $prop->setAccessible(true);

                $body = $prop->getValue($command);
                // dd($body);

                $excels[] = [
                    $body['U_Pallet'],
                    $body['StockTransferLines'][0]['ItemCode'],
                    $body['StockTransferLines'][0]['Quantity'],
                    $body['StockTransferLines'][0]['BatchNumbers'][0]['BatchNumber'],
                    $body['StockTransferLines'][0]['WarehouseCode'],
                    $body['StockTransferLines'][0]['FromWarehouseCode'],
                ];
            }
        }

        return Excel::download(
            new class($excels) implements \Maatwebsite\Excel\Concerns\FromArray {
                protected $data;

                public function __construct($data)
                {
                    $this->data = $data;
                }

                public function array(): array
                {
                    return $this->data;
                }
            },
            'Pallet-ra-lo.xlsx',
            ExcelExcel::XLSX
        );
    }

    public function import_pallet(Request $request)
    {
        // $data = Excel::toArray([], $request->file('file'))[0];
        // $factory = $request->factory;
        // $toWHTB = 'WTB.NLCS';
        // $toWHYS = 'WY1.NLCS';
        // $users = User::all();
        // $successPallet = [];

        // $filtered = array_filter($data, function ($row) {
        //     return !empty(array_filter($row, fn($cell) => $cell !== null && $cell !== ''));
        // });

        // $current_week = now()->format('W');
        // $current_year = now()->year;
        // $prefix = $factory . substr($current_year, -2) . $current_week . "-";

        // $lastCode = Pallet::where('Code', 'like', $prefix . '%')
        //     ->orderBy('Code', 'desc')
        //     ->value('Code');

        // $generatedCode = '';

        // $genCodes = [];

        // if ($lastCode) {
        //     $lastNumber = intval(substr($lastCode, strlen($prefix)));
        // } else {
        //     $lastNumber = 0;
        // }

        // $nextNumber =  $lastNumber + 1;

        // // dd($filtered, $nextNumber);

        // try {
        //     DB::beginTransaction();
        //     foreach ($filtered as $key => $item) {
        //         $generatedCode = $factory . substr($current_year, -2) . $current_week . '-' . str_pad($nextNumber + $key, 5, '0', STR_PAD_LEFT);
        //         // $generatedCode = $item[27];
        //         $genCodes[] = $generatedCode;

        //         $user = $users->firstWhere('username', $item[1]);
        //         $quyCach = implode('x', [$item[9], $item[8], $item[7]]);

        //         $usrNotFound = [];
        //         $usrNotFound[$item[1]] = [
        //             'id' => 845,
        //             'first_name' => 'Huê',
        //             'last_name' => 'Ma Thị',
        //             'branch' => 3
        //         ];

        //         if (!$user && !isset($usrNotFound[$item[1]])) {
        //             dd($item);
        //         }

        //         $pallet = Pallet::create([
        //             'Code' => $generatedCode,
        //             'factory' => $factory,
        //             'QuyCach' => $quyCach,
        //             'stacking_time' => $item[15] ?? null,
        //             'employee' => $user ? $user->id : $usrNotFound[$item[1]]['id'],
        //             'LoaiGo' => '01',
        //             'MaLo' => $item[4],
        //             'LyDo' => $item[16],
        //             'NgayNhap' => (new DateTime($item[0]))->format('Y-m-d H:i:s'),
        //             'created_at' => (new DateTime($item[0]))->format('Y-m-d H:i:s'),
        //             'updated_at' => (new DateTime($item[0]))->format('Y-m-d H:i:s')
        //         ]);

        //         $datainsert['palletID'] = $pallet->palletID;
        //         $datainsert['WhsCode2'] = $factory == 'TB' ? $toWHTB : $toWHYS;
        //         $datainsert['ItemCode'] = $item[19];
        //         $datainsert['ItemName'] = $item[21];
        //         $datainsert['WhsCode'] = $item[22];
        //         $datainsert['BatchNum'] = $item[18];
        //         $datainsert['created_at'] = (new DateTime($item[0]))->format('Y-m-d H:i:s');
        //         $datainsert['updated_at'] = (new DateTime($item[0]))->format('Y-m-d H:i:s');

        //         if ($item[16] === 'SL') {
        //             $datainsert['CDai_Site'] = $item[7] ? $item[7] : 0;
        //             $datainsert['CDay_Site'] = $item[9] ? $item[9] : 0;
        //             $datainsert['CRong_Site'] = $item[8] ? $item[8] : 0;
        //             $datainsert['CDai'] =  0;
        //             $datainsert['CDay'] = 0;
        //             $datainsert['CRong'] = 0;
        //             $quyCachSite = $item[9] . 'x' . $item[8] . 'x' . $item[7];
        //             $datainsert['QuyCachSite'] = $quyCachSite;
        //             $datainsert['Qty'] = $item[11] ? $item[11] : 0;
        //             $datainsert['Qty_T'] = 0;
        //         } else {
        //             $datainsert['CDai'] = $item[7] ? $item[7] : 0;
        //             $datainsert['CDay'] = $item[9] ? $item[9] : 0;
        //             $datainsert['CRong'] = $item[8] ? $item[8] : 0;
        //             $datainsert['Qty'] = $item[11];
        //             $datainsert['Qty_T'] = $item[10] ? $item[10] : 0;
        //         }

        //         pallet_details::create($datainsert);

        //         $ldt = [];
        //         $ldt2 = [];
        //         $totalkl = 0;
        //         $toQty = 0;

        //         $ldt[] = [
        //             "ItemCode" => $item[19],
        //             "WarehouseCode" =>  $factory == 'TB' ? $toWHTB : $toWHYS,
        //             "FromWarehouseCode" => $item[22],
        //             "Quantity" =>  $datainsert['Qty'],

        //             "BatchNumbers" => [
        //                 [
        //                     "BatchNumber" => $item[18],
        //                     "Quantity" => $datainsert['Qty']
        //                 ]
        //             ]
        //         ];

        //         $ldt2[] = [
        //             "U_Item" => $item[19],
        //             "U_CRong" => $item[8] ? $item[8] : 0,
        //             "U_CDay" => $item[9] ? $item[9] : 0,
        //             "U_CDai" => $item[7] ? $item[7] : 0,
        //             "U_Batch" => $item[18],
        //             "U_Quant" => $datainsert['Qty'],
        //         ];

        //         $toQty += (float)$datainsert['Qty'];
        //         $totalkl += (float)$datainsert['Qty'];

        //         $body = [
        //             "U_Pallet" => $pallet->Code,
        //             "U_PalletCreatedBy" => $item[1] . ' - ' . ($user ? $user->last_name : $usrNotFound[$item[1]]['last_name']) . ' ' . ($user ? $user->first_name : $usrNotFound[$item[1]]['first_name']),
        //             "BPLID" => $user ? $user->branch : $usrNotFound[$item[1]]['branch'],
        //             "ToWarehouse" =>  $factory == 'TB' ? $toWHTB : $toWHYS,
        //             "FromWarehouse" => $item[22],
        //             "Comments" => "WLAPP PORTAL tạo pallet xếp xấy",
        //             "U_MoveType" => 'DC_SAY',
        //             "StockTransferLines" => $ldt
        //         ];

        //         $body2 = [
        //             "U_Code" => $pallet->Code,
        //             "U_Status" => "CS",
        //             "U_Quant" => $toQty,
        //             "U_Vol" => max($totalkl, 1),
        //             "U_USER" => $item[1] . ' - ' . ($user ? $user->last_name : $usrNotFound[$item[1]]['last_name']) . ' ' . ($user ? $user->first_name : $usrNotFound[$item[1]]['first_name']),
        //             "G_PALLETLCollection" => $ldt2
        //         ];

        //         $stockTransferResponse = Http::withOptions([
        //             'verify' => false,
        //         ])->withHeaders([
        //             "Content-Type" => "application/json",
        //             "Accept" => "application/json",
        //             "Authorization" => "Basic " . BasicAuthToken(),
        //         ])->post(UrlSAPServiceLayer() . "/b1s/v1/StockTransfers", $body);

        //         if (!$stockTransferResponse->successful()) {
        //             throw new \Exception('Failed to create stock transfer in SAP: ' .
        //                 ($stockTransferResponse->json()['error']['message'] ?? $stockTransferResponse->body()));
        //         }

        //         $stockTransferResult = $stockTransferResponse->json();

        //         $palletResponse = Http::withOptions([
        //             'verify' => false,
        //         ])->withHeaders([
        //             "Content-Type" => "application/json",
        //             "Accept" => "application/json",
        //             "Authorization" => "Basic " . BasicAuthToken(),
        //         ])->post(UrlSAPServiceLayer() . "/b1s/v1/Pallet", $body2);

        //         if (!$palletResponse->successful()) {
        //             $revertResponse = Http::withOptions([
        //                 'verify' => false,
        //             ])->withHeaders([
        //                 "Content-Type" => "application/json",
        //                 "Accept" => "application/json",
        //                 "Authorization" => "Basic " . BasicAuthToken(),
        //             ])->post(UrlSAPServiceLayer() . "/b1s/v1/StockTransfers({$stockTransferResult['DocEntry']})/Cancel");

        //             if (!$revertResponse->successful()) {
        //                 \Log::error('Failed to revert StockTransfer', [
        //                     'docEntry' => $stockTransferResult['DocEntry'],
        //                     'error' => $revertResponse->json()
        //                 ]);
        //             }

        //             throw new \Exception('Failed to create pallet in SAP: ' .
        //                 ($palletResponse->json()['error']['message'] ?? $palletResponse->body()));
        //         }

        //         $palletResult = $palletResponse->json();

        //         Pallet::where('palletID', $pallet->palletID)->update([
        //             'DocNum' => $stockTransferResult['DocNum'],
        //             'DocEntry' => $stockTransferResult['DocEntry'],
        //             'palletSAP' => $palletResult['DocEntry'],
        //             'CreateBy' => $user ? $user->id : $usrNotFound[$item[1]]['id'],
        //             'activeStatus' => 0,
        //         ]);

        //         // Pallet::where('palletID', $pallet->palletID)->update([
        //         //     'DocNum' => $item[24],
        //         //     'DocEntry' => $item[25],
        //         //     'palletSAP' => $item[26],
        //         //     'CreateBy' => $user ? $user->id : $usrNotFound[$item[1]]['id'],
        //         //     'activeStatus' => 0,
        //         // ]);


        //         $successPallet[$item[3]] = [
        //             'success' => true,
        //             'stockTransferResult' => $stockTransferResult,
        //             'palletResult' => $palletResult
        //         ];
        //     }
        //     DB::commit();
        //     dd([
        //         'success' => true,
        //         'genCodes' => $genCodes,
        //         'successPallet' => $successPallet
        //     ]);
        // } catch (\Throwable $th) {
        //     dd([
        //         'false' => $successPallet,
        //         '$th' => $th
        //     ]);
        //     DB::rollBack();
        // }
    }

    public function view_export_report_by_report_resolution_id(Request $request)
    {
        $pdf = Pdf::loadView('pdfs.bienban-xulyloi', [
            'result' => [],
            'data' => []
        ])->setPaper('a4', 'landscape')
        ->setWarnings(false);
        return $pdf->stream('test-a4.pdf');
    }
}
