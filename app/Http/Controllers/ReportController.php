<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Exception;
use PhpOffice\PhpWord\TemplateProcessor;
use App\Models\notireceipt;
use App\Models\planDryings;
use App\Models\plandetail;
use App\Models\Pallet;
use App\Models\FanSpeed;
use App\Models\ActualThickness;
use App\Models\User;
use Carbon\Carbon;
use Auth;
use App\Models\notireceiptVCN;

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
    function chitietgiaonhanCBG(Request $request)
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
                $query->whereBetween('ngaynhan', [
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

        $query = 'SELECT "ItemCode", "ItemName", "U_M3SP" FROM OITM';

        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt)) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        $m3sapMap = [];
        while ($row = odbc_fetch_array($stmt)) {
            $m3sapMap[$row['ItemCode']] = [
                'ItemName' => $row['ItemName'],
                'M3'       => $row['U_M3SP']
            ];
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
            if (isset($m3sapMap[$item->ItemCode])) {
                $newItem->M3SAP = round((float)$m3sapMap[$item->ItemCode]['M3'] * (float)$item->Quantity, 6);
                $newItem->ItemName = $m3sapMap[$item->ItemCode]['ItemName']; // cập nhật tên
            } else {
                $newItem->M3SAP = null;
            }

            return $newItem;
        });

        odbc_close($conDB);

        return response()->json($updatedData);
    }

    //báo cáo xếp chờ xấy
    // function xepchosay(Request $request)
    // {
    //     $validate = Validator::make($request->all(), [
    //         'fromDate' => 'required|date',
    //         'toDate' => 'required|date',
    //         'factory' => 'required',
    //     ]);
    //     if ($validate->fails()) {
    //         return response()->json(['error' => $validate->errors()], 400);
    //     }
    //     $branch = $request->input('branch');
    //     $factory = $request->input('factory');
    //     $fromDate = $request->FromDate;
    //     $ToDate = $request->ToDate;
    //     // Start the query and add conditions based on the request inputs
    //     $query = DB::table('gt_say_xepchoxay');

    //     if ($branch) {
    //         $query->where('branch', $branch);
    //     }

    //     if ($factory) {
    //         $query->where('plant', $factory);
    //     }

    //     if ($fromDate != null && $ToDate != null) {
    //         // where beetwen
    //         $query->whereRaw('DATE(created_at) BETWEEN ? AND ?', [$fromDate, $ToDate]);
    //     }

    //     // Get the results
    //     $data = $query->get();
    //     $itemdistinct = $query->distinct()->pluck('ItemCode');
    //     $itemstring = "'" . implode("','", $itemdistinct->toArray()) . "'";
    //     $dataQuyCach = qtycachIemSAP($itemstring);

    //     $dataQuyCachMap = [];
    //     foreach ($dataQuyCach as $item) {
    //         $dataQuyCachMap[$item['ItemCode']] = $item;
    //     }

    //     // Lặp qua originalData và thay thế các giá trị
    //     $updatedData = $data->map(function ($item) use ($dataQuyCachMap) {
    //         if (isset($dataQuyCachMap[$item->ItemCode])) {
    //             $item->CDay = $dataQuyCachMap[$item->ItemCode]['CDay'];
    //             $item->CRong = $dataQuyCachMap[$item->ItemCode]['CRong'];
    //             $item->CDai = $dataQuyCachMap[$item->ItemCode]['CDai'];
    //         }
    //         return $item;
    //     });

    //     return response()->json($updatedData);
    // }

    function DryingQueueReport(Request $request)
    {
        $fromDate = $request->input('fromDate');
        $toDate = $request->input('toDate');
        $factory = $request->input('factory');

        $validate = Validator::make($request->all(), [
            'fromDate' => 'required|date',
            'toDate' => 'required|date',
            'factory' => 'required',
        ]);

        if ($validate->fails()) {
            return response()->json(['error' => $validate->errors()], 400);
        }

        try {
            // Lấy danh sách ItemName từ SAP
            $conDB = (new ConnectController)->connect_sap();
            $query = 'SELECT "ItemCode", "ItemName" FROM OITM';
            $stmt = odbc_prepare($conDB, $query);

            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }

            if (!odbc_execute($stmt)) {
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }

            $sapItems = array();
            while ($row = odbc_fetch_array($stmt)) {
                $sapItems[$row['ItemCode']] = $row['ItemName'];
            }
            odbc_close($conDB);

            // Lấy dữ liệu pallet với điều kiện lọc
            $pallets = Pallet::with(['details'])
                ->where('factory', $factory)
                ->whereBetween('created_at', [Carbon::parse($fromDate)->startOfDay(), Carbon::parse($toDate)->endOfDay()])
                ->get();

            $result = [];

            foreach ($pallets as $pallet) {
                foreach ($pallet->details as $detail) {
                    $result[] = [
                        'created_at' => Carbon::parse($pallet->created_at)->format('H:i:s d/m/Y'),
                        'code' => $pallet->Code,
                        'ma_lo' => $pallet->MaLo,
                        'item_code' => $detail->ItemCode,
                        'item_name' => $sapItems[$detail->ItemCode] ?? 'Không xác định',
                        'dai' => $detail->CDai,
                        'rong' => $detail->CRong,
                        'day' => $detail->CDay,
                        'qty' => $detail->Qty_T,
                        'mass' => round($detail->Qty, 4), // Làm tròn 4 chữ số thập phân
                        'reason' => $pallet->LyDo,
                        'status' => empty($pallet->RanBy) ? 'Chưa sấy' : 'Đang sấy'
                    ];
                }
            }

            return response()->json($result, 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Lỗi khi lấy dữ liệu: ' . $e->getMessage()
            ], 500);
        }
    }

    function xepsay(Request $request)
    {
        $fromDate = $request->input('from_date');
        $ToDate = $request->input('to_date');
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
        // $dataQuyCach = qtycachIemSAP($itemstring);

        // $dataQuyCachMap = [];
        // foreach ($dataQuyCach as $item) {
        //     $dataQuyCachMap[$item['ItemCode']] = $item;
        // }

        // // Lặp qua originalData và thay thế các giá trị
        // $updatedData = $data->map(function ($item) use ($dataQuyCachMap) {
        //     if (isset($dataQuyCachMap[$item->ItemCode])) {
        //         $item->CDay = $dataQuyCachMap[$item->ItemCode]['CDay'];
        //         $item->CRong = $dataQuyCachMap[$item->ItemCode]['CRong'];
        //         $item->CDai = $dataQuyCachMap[$item->ItemCode]['CDai'];
        //     }
        //     return $item;
        // });

        return response()->json($data);
    }

    function KilnLoadingMinutes(Request $request)
    {
        $branch = $request->input('branch');
        $kiln = $request->input('kiln');

        $validate = Validator::make($request->all(), [
            'branch' => 'required',
            'kiln' => 'required',
        ]);

        if ($validate->fails()) {
            return response()->json(['error' => $validate->errors()], 400);
        }

        try {
            // Tìm kế hoạch sấy mới nhất có Oven = $kiln và status = 0 hoặc 1
            $planDrying = planDryings::where('Oven', $kiln)
                ->whereIn('Status', [0, 1])
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$planDrying) {
                return response()->json(['error' => 'Không tìm thấy kế hoạch sấy đang hoạt động cho lò này'], 404);
            }

            // Lấy thông tin các pallet trong kế hoạch sấy
            $planDetails = plandetail::where('PlanID', $planDrying->PlanID)->get();

            if ($planDetails->isEmpty()) {
                return response()->json(['error' => 'Không tìm thấy pallet nào trong kế hoạch sấy'], 404);
            }

            // Lấy danh sách palletID từ plan_detail.pallet
            $palletIDs = $planDetails->pluck('pallet')->unique();

            // Lấy thông tin pallet từ bảng Pallet theo palletID
            $pallets = Pallet::whereIn('palletID', $palletIDs)
                ->select('palletID', 'Code', 'LoadedIntoKilnDate')
                ->get()
                ->keyBy('palletID'); // Key by palletID thay vì Code

            // Lấy danh sách ngày vào lò và tính khoảng thời gian
            $loadedDates = $planDetails->map(function ($detail) use ($pallets) {
                $pallet = $pallets->get($detail->pallet); // $detail->pallet chính là palletID
                if ($pallet && $pallet->LoadedIntoKilnDate) {
                    return Carbon::parse($pallet->LoadedIntoKilnDate)->format('d/m/Y');
                }
                return null;
            })->filter()->unique()->sort()->values();

            // Tạo chuỗi LoadedIntoKilnDates
            $loadedIntoKilnDates = '';
            if ($loadedDates->count() == 1) {
                $loadedIntoKilnDates = $loadedDates->first();
            } elseif ($loadedDates->count() > 1) {
                $loadedIntoKilnDates = $loadedDates->first() . ' - ' . $loadedDates->last();
            }

            // Tạo mảng Detail với thông tin các pallet
            $details = $planDetails->map(function ($planDetail) use ($pallets) {
                $pallet = $pallets->get($planDetail->pallet); // $planDetail->pallet chính là palletID

                if (!$pallet) {
                    return null;
                }

                $detail = [
                    'PalletCode' => $pallet->Code,
                    'Size' => $planDetail->size,
                    'Qty' => number_format($planDetail->Qty),
                    'Mass' => number_format($planDetail->Mass, 4, '.', ''),
                    'CDay' => null,
                    'CRong' => null,
                    'CDai' => null,
                    'CDay2' => null,
                    'CRong2' => null,
                    'CDai2' => null,
                ];

                // Phân tách kích thước
                if ($planDetail->size) {
                    $sizes = explode('_', $planDetail->size);

                    // Kích thước đầu tiên
                    if (isset($sizes[0]) && !empty(trim($sizes[0]))) {
                        $dimensions1 = explode('x', trim($sizes[0]));
                        if (count($dimensions1) == 3) {
                            $detail['CDay'] = trim($dimensions1[0]);
                            $detail['CRong'] = trim($dimensions1[1]);
                            $detail['CDai'] = trim($dimensions1[2]);
                        }
                    }

                    // Kích thước thứ hai (nếu có)
                    if (isset($sizes[1]) && !empty(trim($sizes[1]))) {
                        $dimensions2 = explode('x', trim($sizes[1]));
                        if (count($dimensions2) == 3) {
                            $detail['CDay2'] = trim($dimensions2[0]);
                            $detail['CRong2'] = trim($dimensions2[1]);
                            $detail['CDai2'] = trim($dimensions2[2]);
                        }
                    }
                }

                return $detail;
            })->filter()->values();

            $totalMass = $details->sum('Mass');
            $totalMassFormatted = number_format($totalMass, 4, '.', '');

            // Tạo kết quả trả về
            $result = [
                'PlanID' => $planDrying->PlanID,
                'Code' => $planDrying->Code,
                'Oven' => $planDrying->Oven,
                'Status' => $planDrying->Status,
                'TotalMass' => $totalMassFormatted,
                'TotalPallet' => $planDrying->TotalPallet,
                'Factory' => $planDrying->plant,
                'LoadedIntoKilnDates' => $loadedIntoKilnDates,
                'Detail' => $details
            ];

            return response()->json($result, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }

    function KilnCheckingMinutes(Request $request)
    {
        $branch = $request->input('branch');
        $kiln = $request->input('kiln');

        $validate = Validator::make($request->all(), [
            'branch' => 'required',
            'kiln' => 'required',
        ]);

        if ($validate->fails()) {
            return response()->json(['error' => $validate->errors()], 400);
        }

        try {
            // Tìm bản ghi kế hoạch sấy mới nhất với Oven = $kiln và status = 0 hoặc 1
            $planDrying = planDryings::where('Oven', $kiln)
                ->whereIn('Status', [0, 1])
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$planDrying) {
                return response()->json([
                    'error' => 'Không tìm thấy kế hoạch sấy phù hợp cho lò ' . $kiln
                ], 404);
            }

            // Lấy thông tin ActualThickness theo PlanID
            $actualThickness = ActualThickness::where('PlanID', $planDrying->PlanID)
                ->orderBy('created_at', 'desc')
                ->get();

            // Lấy thông tin FanSpeed theo PlanID
            $fanSpeed = FanSpeed::where('PlanID', $planDrying->PlanID)
                ->orderBy('created_at', 'desc')
                ->get();

            // Lấy thông tin user để ghép tên
            $nguoiTaoPhieu = '';
            if ($planDrying->CheckedBy) {
                $user = User::find($planDrying->CheckedBy);
                if ($user) {
                    $nguoiTaoPhieu = trim($user->last_name . ' ' . $user->first_name);
                }
            }

            // Chuẩn bị dữ liệu trả về
            $result = [
                'PlanID' => $planDrying->PlanID,
                'Oven' => $planDrying->Oven,
                'CheckedBy' => $planDrying->CheckedBy,
                'NguoiTaoPhieu' => $nguoiTaoPhieu,
                'DateChecked' => $planDrying->DateChecked ? \Carbon\Carbon::parse($planDrying->DateChecked)->format('d/m/Y') : null,
                'CT1' => $planDrying->CT1,
                'CT2' => $planDrying->CT2,
                'CT3' => $planDrying->CT3,
                'CT4' => $planDrying->CT4,
                'CT5' => $planDrying->CT5,
                'CT6' => $planDrying->CT6,
                'CT7' => $planDrying->CT7,
                'CT8' => $planDrying->CT8,
                'CT9' => $planDrying->CT9,
                'CT10' => $planDrying->CT10,
                'CT11' => $planDrying->CT11,
                'CT12' => $planDrying->CT12,
                'SoLan' => $planDrying->SoLan ?? 0,
                'CBL' => $planDrying->CBL,
                'DoThucTe' => $planDrying->DoThucTe,
                'ActualThickness' => $actualThickness->toArray(),
                'FanSpeed' => $fanSpeed->toArray()
            ];

            return response()->json($result, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    function DryingPlanReport(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'fromDate' => 'required',
            'toDate' => 'required',
            'factory' => 'required',
        ]);

        if ($validate->fails()) {
            return response()->json(['error' => $validate->errors()], 400);
        }

        $fromDate = $request->input('fromDate');
        $toDate = $request->input('toDate');
        $factory = $request->input('factory');

        try {
            $planDrying = planDryings::whereBetween('created_at', [Carbon::parse($fromDate)->startOfDay(), Carbon::parse($toDate)->endOfDay()])
                ->where('plant', $factory)
                ->get();

            // Lấy danh sách lò sấy từ SAP một lần duy nhất
            $conDB = (new ConnectController)->connect_sap();
            $query = 'select "Code","Name" from "@G_SAY3" where "U_Factory" = ? ORDER BY "Code" ASC';
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }
            if (!odbc_execute($stmt, [$factory])) {
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }

            $allKilns = array();
            while ($row = odbc_fetch_array($stmt)) {
                $allKilns[$row['Code']] = $row['Name']; // Tạo array với key là Code để dễ tra cứu
            }
            odbc_close($conDB);

            // Lấy thông tin users một lần để tránh query nhiều lần
            $userIds = $planDrying->pluck('CreateBy')->unique()->filter();
            $users = User::whereIn('id', $userIds)->get()->keyBy('id');

            // Xử lý từng bản ghi planDrying
            $result = $planDrying->map(function ($plan) use ($allKilns, $users) {
                // 1. Trường NguoiTao
                $nguoiTao = '';
                if ($plan->CreateBy && isset($users[$plan->CreateBy])) {
                    $user = $users[$plan->CreateBy];
                    $nguoiTao = trim($user->last_name . ' ' . $user->first_name);
                }

                // 2. Trường LoSay
                $loSay = $allKilns[$plan->Oven] ?? '';

                // 3. Trường Status
                $status = '';
                if ($plan->Status == 0) {
                    if ($plan->Checked == 1 && $plan->TotalPallet > 0) {
                        $status = 'Đã vào lò và kiểm tra lò';
                    } elseif ($plan->Checked == 1) {
                        $status = 'Đã kiểm tra lò sấy';
                    } elseif ($plan->TotalPallet > 0) {
                        $status = 'Đã vào lò';
                    } else {
                        $status = 'Tạo mới kế hoạch sấy';
                    }
                } elseif ($plan->Status == 1) {
                    if ($plan->Review == 1) {
                        $status = 'Đang sấy và đã đánh giá';
                    } else {
                        $status = 'Đang sấy chưa đánh giá';
                    }
                } elseif ($plan->Status == 2) {
                    $status = 'Đã hoàn thành sấy';
                }

                // 4. Trường expected_completion_date
                $expectedCompletionDate = null;
                if ($plan->created_at && $plan->Time) {
                    $expectedCompletionDate = Carbon::parse($plan->created_at)
                        ->addDays($plan->Time)
                        ->format('d/m/Y');
                }

                // Chuyển đổi object plan thành array và thêm các trường mới
                $planArray = $plan->toArray();
                $planArray['NguoiTao'] = $nguoiTao;
                $planArray['LoSay'] = $loSay;
                $planArray['Status'] = $status;
                $planArray['expected_completion_date'] = $expectedCompletionDate;

                if ($plan->created_at) {
                    $planArray['created_at'] = Carbon::parse($plan->created_at)->format('H:i:s d/m/Y');
                }

                if ($plan->CompletedDate) {
                    $planArray['CompletedDate'] = Carbon::parse($plan->CompletedDate)->format('H:i:s d/m/Y');
                }

                return $planArray;
            });

            return response()->json($result, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    function ReceiptInSAPReport(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'fromDate' => 'required|date',
            'toDate' => 'required|date',
            'factory' => 'required',
            'To' => 'required|array',
            'Khoi' => 'required|string|max:254',
        ]);

        if ($validate->fails()) {
            return response()->json(['error' => $validate->errors()], 400);
        }

        $fromDate = $request->input('fromDate');
        $toDate = $request->input('toDate');
        $factory = $request->input('factory');
        $to = $request->input('To');
        $khoi = $request->input('Khoi');

        try {
            $conDB = (new ConnectController)->connect_sap();

            $query = "CALL USP_GT_PRODUCTION_OUTPUT_RECORDING_TEST_MES(
                IN_FROM_DATE => '$fromDate',
                IN_TO_DATE => '$toDate', 
                IN_FACTORY => '$factory',
                IN_DIVISION => '$khoi',
                OUTPUT_RESULT => ?
            )";

            $result = odbc_exec($conDB, $query);

            if (!$result) {
                throw new \Exception('Error executing stored procedure: ' . odbc_errormsg($conDB));
            }

            $allResults = array();
            while ($row = odbc_fetch_array($result)) {
                $allResults[] = $row;
            }

            odbc_close($conDB);

            if (!empty($allResults)) {
                \Log::info('SAP fields available:', array_keys($allResults[0]));
            }

            // Lọc dữ liệu
            $filteredResults = array_filter($allResults, function ($item) use ($to) {
                $possibleFields = ['MaTo', 'MA_TO', 'ma_to', 'MATO', 'Code', 'CODE', 'ToCode', 'TO_CODE'];

                foreach ($possibleFields as $field) {
                    if (isset($item[$field]) && in_array($item[$field], $to)) {
                        return true;
                    }
                }
                return false;
            });

            $filteredResults = array_values($filteredResults);

            return response()->json($filteredResults, 200); // Trả về trực tiếp mảng phẳng

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
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

    /** chế biến gỗ */
    // function PlywoodDefectHandling(Request $request)
    // {
    //     $branch = $request->input('branch');
    //     $plant = $request->input('plant');
    //     $prodType = $request->input('prod_type');
    //     $fromDate = $request->input('from_date');
    //     $toDate = $request->input('to_date');

    //     // Start the query and add conditions based on the request inputs
    //     $query = DB::table('gt_vcn_baocaoxulyloi');

    //     if ($branch) {
    //         $query->where('branch', $branch);
    //     }

    //     if ($plant) {
    //         $query->where('plant', $plant);
    //     }

    //     if ($prodType) {
    //         $query->where('ProdType', $prodType);
    //     }

    //     if ($fromDate != null && $toDate != null) {
    //         // where beetwen
    //         $query->whereRaw('DATE(ngaynhan) BETWEEN ? AND ?', [$fromDate, $toDate]);
    //     }

    //     // Get the results
    //     $data = $query->get();
    //     $itemdistinct = $query->distinct()->pluck('ItemCode');
    //     $itemstring = "'" . implode("','", $itemdistinct->toArray()) . "'";
    //     $dataQuyCach = qtycachIemSAP($itemstring);

    //     $dataQuyCachMap = [];
    //     foreach ($dataQuyCach as $item) {
    //         $dataQuyCachMap[$item['ItemCode']] = $item;
    //     }

    //     // Bổ sung thông tin M3 từ SAP và dd ra kết quả truy vấn
    //     $conDB = (new ConnectController)->connect_sap();

    //     $query = 'SELECT "ItemCode", "U_M3SP" FROM OITM';

    //     $stmt = odbc_prepare($conDB, $query);
    //     if (!$stmt) {
    //         throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
    //     }
    //     if (!odbc_execute($stmt)) {
    //         throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
    //     }

    //     $m3sapMap = [];
    //     while ($row = odbc_fetch_array($stmt)) {
    //         $m3sapMap[$row['ItemCode']] = $row['U_M3SP'];
    //     }

    //     $updatedData = $data->map(function ($item) use ($dataQuyCachMap, $m3sapMap) {
    //         // Copy the item to prevent modifying the original
    //         $newItem = clone $item;

    //         // Add existing dimensions if available
    //         if (isset($dataQuyCachMap[$item->ItemCode])) {
    //             $newItem->CDay = $dataQuyCachMap[$item->ItemCode]['CDay'];
    //             $newItem->CRong = $dataQuyCachMap[$item->ItemCode]['CRong'];
    //             $newItem->CDai = $dataQuyCachMap[$item->ItemCode]['CDai'];
    //         }

    //         // Add M3SAP value if available and multiply it with Quantity
    //         $newItem->M3SAP = isset($m3sapMap[$item->ItemCode]) ? round((float)$m3sapMap[$item->ItemCode] * (float)$item->Quantity, 6) : null;

    //         return $newItem;
    //     });

    //     odbc_close($conDB);

    //     return response()->json($updatedData);
    // }
    function PlywoodDefectHandling(Request $request)
    {
        $branch = $request->input('branch');
        $plant = $request->input('plant');
        $prodType = $request->input('prod_type');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');

        // Start the query and add conditions based on the request inputs
        $query = DB::table('gt_vcn_baocaoxulyloi');

        if ($branch) {
            $query->where('branch', $branch);
        }

        if ($plant) {
            $query->where('plant', $plant);
        }

        if ($prodType) {
            $query->where('ProdType', $prodType);
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

        // Query để lấy tất cả ItemCode, U_M3SP và ItemName từ OITM
        $query = 'SELECT "ItemCode", "U_M3SP", "ItemName" FROM OITM';

        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt)) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        $m3sapMap = [];
        $itemNameMap = [];
        while ($row = odbc_fetch_array($stmt)) {
            $m3sapMap[$row['ItemCode']] = $row['U_M3SP'];
            $itemNameMap[$row['ItemCode']] = $row['ItemName'];
        }

        $updatedData = $data->map(function ($item) use ($dataQuyCachMap, $m3sapMap, $itemNameMap) {
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

            // Add TenSPD (ItemName corresponding to MaSPD)
            $newItem->TenSPD = isset($item->MaSPD) && isset($itemNameMap[$item->MaSPD]) ? $itemNameMap[$item->MaSPD] : null;

            return $newItem;
        });

        odbc_close($conDB);

        return response()->json($updatedData);
    }



    function sanluongtheothoigianCBG(Request $request)
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

    function sanluongtheongayCBG(Request $request)
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

    function sanluongtheothoigianVCN(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fromDate' => 'required',
            'toDate' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        $conDB = (new ConnectController)->connect_sap();

        $query = 'CALL USP_GT_BC_NGAYTUANTHANG_VCN(?, ?, ?)';

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

    function sanluongtheongayVCN(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fromDate' => 'required',
            'toDate' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        $conDB = (new ConnectController)->connect_sap();

        $query = 'CALL USP_GT_BC_NGAY_VCN(?, ?, ?)';

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

    function defectStockChecking(Request $request)
    {
        $plantFilter = $request->input('plant');

        $notiData = DB::table('sanluong as a')
            ->join('notireceipt as b', function ($join) {
                $join->on('a.id', '=', 'b.baseID')
                    ->where('b.deleted', '=', 0);
            })
            ->join('users as c', 'a.create_by', '=', 'c.id')
            ->select(
                'a.ItemCode',
                'a.ItemName',
                'b.SubItemName',
                'b.SubItemCode',
                'a.Team',
                'a.CongDoan',
                DB::raw('(b.openQty - (
                SELECT COALESCE(SUM(quantity), 0)
                FROM historySL
                WHERE itemchild = CASE WHEN b.SubItemCode IS NOT NULL THEN b.SubItemCode ELSE b.ItemCode END
                AND isQualityCheck = 1
                AND notiId = b.id
            )) as Quantity'),
                'a.created_at',
                'c.first_name',
                'c.last_name',
                'b.text',
                'b.id',
                'c.plant',
                'c.branch',
                DB::raw('0 as type'),
                'b.confirm'
            )
            ->where('b.confirm', '=', 0)
            ->where('b.type', '=', 1)
            ->havingRaw('Quantity > 0')
            ->when($plantFilter, fn($query) => $query->where('c.plant', $plantFilter))
            ->get();

        $result = [];

        foreach ($notiData as $noti) {
            $createByName = trim("{$noti->first_name} {$noti->last_name}");

            try {
                $sapData = $this->getDefectDataFromSAP($noti->ItemCode, $noti->SubItemCode, $noti->plant);

                if ($noti->SubItemCode !== null) {
                    $rawQty = (float)$sapData['SubItemQty'][0]['OnHand'] - ((float)$noti->Quantity);
                    $requiredQty = $rawQty < 0 ? abs(ceil($rawQty)) : 0;

                    $result[] = [
                        'id' => $noti->id,
                        'Quantity' => $noti->Quantity,
                        'ItemCode' => $noti->ItemCode,
                        'ItemName' => $noti->ItemName,
                        'SubItemCode' => $noti->SubItemCode,
                        'SubItemName' => $noti->SubItemName,
                        'Team' => $noti->Team,
                        'CongDoan' => $noti->CongDoan,
                        'created_at' => $noti->created_at,
                        'type' => $noti->type,
                        'wareHouse' => $sapData['SubItemWhs'],
                        'BaseQty' => $sapData['SubItemQty'][0]['BaseQty'],
                        'OnHand' => $sapData['SubItemQty'][0]['OnHand'],
                        'plant' => $noti->plant,
                        'branch' => $noti->branch,
                        'create_by' => $createByName,
                        'requiredQty' => (int)$requiredQty
                    ];
                } else {
                    foreach ($sapData['SubItemQty'] as $subItem) {
                        $rawQty = (float)$subItem['OnHand'] - ((float)$noti->Quantity * (float)$subItem['BaseQty']);
                        $requiredQty = $rawQty < 0 ? abs(ceil($rawQty)) : 0;
                        $result[] = [
                            'id' => $noti->id,
                            'Quantity' => $noti->Quantity,
                            'ItemCode' => $noti->ItemCode,
                            'ItemName' => $noti->ItemName,
                            'SubItemCode' => $subItem['SubItemCode'],
                            'SubItemName' => $noti->SubItemName,
                            'Team' => $noti->Team,
                            'CongDoan' => $noti->CongDoan,
                            'created_at' => $noti->created_at,
                            'type' => $noti->type,
                            'wareHouse' => $sapData['SubItemWhs'],
                            'BaseQty' => $subItem['BaseQty'],
                            'OnHand' => $subItem['OnHand'],
                            'plant' => $noti->plant,
                            'branch' => $noti->branch,
                            'create_by' => $createByName,
                            'requiredQty' => (int)$requiredQty
                        ];
                    }
                }
            } catch (\Exception $e) {
                $result[] = [
                    'id' => $noti->id,
                    'Quantity' => $noti->Quantity,
                    'ItemCode' => $noti->ItemCode,
                    'ItemName' => $noti->ItemName,
                    'SubItemCode' => $noti->SubItemCode,
                    'SubItemName' => $noti->SubItemName,
                    'Team' => $noti->Team,
                    'CongDoan' => $noti->CongDoan,
                    'created_at' => $noti->created_at,
                    'type' => $noti->type,
                    'plant' => $noti->plant,
                    'branch' => $noti->branch,
                    'create_by' => $createByName,
                    'error' => $e->getMessage()
                ];
            }
        }

        return response()->json($result);
    }

    function getDefectDataFromSAP($ItemCode, $SubItemCode, $Factory)
    {
        $conDB = (new ConnectController)->connect_sap(); // Kết nối SAP HANA

        if ($ItemCode && $SubItemCode) {
            // Trường hợp lỗi bán thành phẩm
            $sql = <<<SQL
            SELECT "SubItemCode", "wareHouse", "BaseQty", "OnHand"
            FROM "UV_SOLUONGTON"
            WHERE "ItemCode" = ? AND "SubItemCode" = ? AND "Factory" = ?
            LIMIT 1
        SQL;

            $stmt = odbc_prepare($conDB, $sql);
            odbc_execute($stmt, [$ItemCode, $SubItemCode, $Factory]);
            $row = odbc_fetch_array($stmt);

            if (!$row) {
                throw new \Exception("Không tìm thấy dữ liệu tồn kho cho bán thành phẩm.");
            }

            $dataIssues = [
                'SubItemWhs' => $row['wareHouse'],
                'SubItemQty' => [
                    [
                        'SubItemCode' => $row['SubItemCode'],
                        'BaseQty' => (float) $row['BaseQty'],
                        'OnHand' => (float) $row['OnHand']
                    ]
                ]
            ];
        } elseif ($ItemCode && !$SubItemCode) {
            // Trường hợp lỗi thành phẩm
            $sql = <<<SQL
            SELECT DISTINCT "SubItemCode", "wareHouse", "BaseQty", "OnHand"
            FROM "UV_SOLUONGTON"
            WHERE "ItemCode" = ? AND "Factory" = ?
        SQL;

            $stmt = odbc_prepare($conDB, $sql);
            odbc_execute($stmt, [$ItemCode, $Factory]);

            $subItems = [];
            $warehouses = [];

            while ($row = odbc_fetch_array($stmt)) {
                $subItems[] = [
                    'SubItemCode' => $row['SubItemCode'],
                    'BaseQty' => (float) $row['BaseQty'],
                    'OnHand' => (float) $row['OnHand']
                ];
                $warehouses[] = $row['wareHouse'];
            }

            $uniqueWhs = array_unique($warehouses);

            $dataIssues = [
                'SubItemWhs' => implode(', ', $uniqueWhs), // có thể nhiều kho
                'SubItemQty' => $subItems
            ];
        } else {
            throw new \Exception("Không đủ dữ kiện để xác định loại lỗi.");
        }

        odbc_close($conDB);

        return $dataIssues;
    }

    function importExportInventoryByStage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fromDate' => 'required',
            'toDate' => 'required',
            'factory' => 'required',
            'type' => 'required|in:CBG,VCN'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        $conDB = (new ConnectController)->connect_sap();

        // $query = 'CALL USP_StockBy_SPDICH_CDOAN_MES(?, ?, ?, ?, ?)';
        $query = 'CALL USP_StockBy_SPDICH_CDOAN_TEST_MES(?, ?, ?, ?, ?)';

        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }

        $defaultParam = null; // You can change this to your desired default value

        if (!odbc_execute($stmt, [$request->fromDate, $request->toDate, $request->factory, $request->type, $defaultParam])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        }

        odbc_close($conDB);

        return $results;
    }

    function productionOutputByProductionOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'factory' => 'required',
            'type' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        $conDB = (new ConnectController)->connect_sap();

        $query = 'CALL USP_Production_Output_by_WO_MES(?, ?, ?)';

        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }

        $defaultParam = null; // You can change this to your desired default value

        if (!odbc_execute($stmt, [$request->factory, $request->type, $defaultParam])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        }

        odbc_close($conDB);

        return $results;
    }

    function weeklyDetailedProductionOutput(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'year' => 'required',
            'week' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        $conDB = (new ConnectController)->connect_sap();

        $query = 'CALL USP_GT_WEEKLY_DETAILED_PRODUCTION_OUTPUT(?, ?, ?, ?)';

        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }

        $defaultParam = null; // You can change this to your desired default value

        if (!odbc_execute($stmt, [$request->year, $request->week, $request->factory, $defaultParam])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        }

        odbc_close($conDB);

        return mb_convert_encoding($results, 'UTF-8', 'UTF-8');
    }

    function factoryTransfer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fromDate' => 'required',
            'toDate' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        $conDB = (new ConnectController)->connect_sap();

        $query = 'CALL USP_GT_FACTORY_TRANSFER(?, ?, ?)';

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

    function chitietgiaonhanVCN(Request $request)
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $branch = $request->input('branch');
        // $plant = $request->input('plant');
        $to = $request->input('To');
        $statusCode = $request->input('status_code');

        $query = DB::table('gt_vcn_chitietgiaonhan');

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
                $query->whereBetween('ngaynhan', [
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

        $query = 'SELECT "ItemCode", "ItemName", "U_M3SP" FROM OITM';

        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt)) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        $m3sapMap = [];
        while ($row = odbc_fetch_array($stmt)) {
            $m3sapMap[$row['ItemCode']] = [
                'ItemName' => $row['ItemName'],
                'M3'       => $row['U_M3SP']
            ];
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
            if (isset($m3sapMap[$item->ItemCode])) {
                $newItem->M3SAP = round((float)$m3sapMap[$item->ItemCode]['M3'] * (float)$item->Quantity, 6);
                $newItem->ItemName = $m3sapMap[$item->ItemCode]['ItemName']; // cập nhật tên
            } else {
                $newItem->M3SAP = null;
            }

            return $newItem;
        });

        odbc_close($conDB);

        return response()->json($updatedData);
    }
}
