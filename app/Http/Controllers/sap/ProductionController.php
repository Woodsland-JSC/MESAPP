<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\SanLuong;
use App\Models\awaitingstocks;
use App\Models\Warehouse;
use App\Models\notireceipt;
use App\Models\HistorySL;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Http;
use GuzzleHttp\Client;
use Illuminate\Support\Carbon;
use App\Jobs\SyncSLDGToSAP;
use App\Http\Controllers\sap\ConnectController;
use Illuminate\Support\Facades\Cache;

class ProductionController extends Controller
{

    function receipts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'FatherCode' => 'required|string|max:254',
            'ItemCode' => 'required|string|max:254',
            'ItemName' => 'required|string|max:254',
            'SubItemName',
            'SubItemCode',
            'ErrorData',
            'CompleQty' => 'required|numeric',
            'RejectQty' => 'required|numeric',
            'PackagedQty',
            'MaThiTruong',
            'N_GIAO',
            'N_NHAN',
            'CDay' => 'required',
            'CRong' => 'required',
            'CDai' => 'required',
            'Team' => 'required|string|max:254',
            'CongDoan' => 'required|string|max:254',
            'NexTeam' => 'required|string|max:254',
            'Type' => 'required|string|max:254',
            'KHOI' => 'required',
            'loinhamay' => 'required',
            'Factory' => 'required',
        ]);
        // dd($request->all());
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $errorData = json_encode($request->ErrorData);

        // Lấy tên tổ QC theo SAP
        $conDB = (new ConnectController)->connect_sap();

        $KHOI = $request->input('KHOI');
        $Factory = $request->input('Factory');
        $query = 'SELECT "ResName" FROM "ORSC" WHERE "U_CDOAN" = ? AND "U_FAC" = ? AND "U_KHOI" = ?';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, ['QC', $Factory, $KHOI])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        }
        $toqc = $results[0]['ResName'];

        odbc_close($conDB);

        // dd($toqc);

        // $toqc = "";
        // if (Auth::user()->plant == 'TH') {
        //     $toqc = 'TH-QC';
        // } else if (Auth::user()->plant == 'YS') {
        //     $toqc = 'YS-QC';
        // } else if (Auth::user()->plant == 'HG') {
        //     $toqc = 'TB-QC';
        // }

        try {
            DB::beginTransaction();
            $SanLuong = SanLuong::create([
                'FatherCode' => $request->FatherCode,
                'ItemCode' => $request->ItemCode,
                'ItemName' => $request->ItemName,
                'CompleQty' => $request->CompleQty,
                'RejectQty' => $request->RejectQty,
                'SLDG' => $request->PackagedQty,
                'CDay' => $request->CDay,
                'CRong' => $request->CRong,
                'CDai' => $request->CDai,
                'Team' => $request->Team,
                'CongDoan' => $request->CongDoan,
                'NexTeam' => $request->NexTeam,
                'Type' => $request->Type,
                'LSX' => $request->LSX,
                'create_by' => Auth::user()->id,
                'loinhamay' => $request->loinhamay,
                'openQty' => 0,
            ]);

            $changedData = []; // Mảng chứa dữ liệu đã thay đổi trong bảng notirecept

            if ($request->CompleQty > 0) {
                $notifi = notireceipt::create([
                    'text' => 'Production information waiting for confirmation',
                    'Quantity' => $request->CompleQty,
                    'baseID' =>  $SanLuong->id,
                    'MaThiTruong' => $request->MaThiTruong,
                    'SPDich' => $request->FatherCode,
                    'ItemCode' => $request->ItemCode,
                    'team' => $request->NexTeam,
                    'CongDoan' => $request->CongDoan,
                    'QuyCach' => $request->CDay . "*" . $request->CRong . "*" . $request->CDai,
                    'type' => 0,
                    'openQty' => 0,
                ]);
                $changedData[] = $notifi; // Thêm dữ liệu đã thay đổi vào mảng

                //Lưu thông tin awaitingstocks
                foreach ($request->ErrorData['SubItemQty'] as $subItem) {

                    awaitingstocks::create([
                        'notiId' => $notifi->id,
                        'SubItemCode' => $subItem['SubItemCode'],
                        'AwaitingQty' => $request->CompleQty * $subItem['BaseQty'],
                        'team' => $request->Team,
                    ]);
                }
            }
            if ($request->RejectQty > 0) {
                $notifi = notireceipt::create([
                    'text' => 'Error information sent to QC',
                    'Quantity' => $request->RejectQty,
                    'baseID' =>  $SanLuong->id,
                    'SPDich' => $request->FatherCode,
                    'ItemCode' => $request->ItemCode,
                    'SubItemCode' => $request->SubItemCode,
                    'SubItemName' => $request->SubItemName,
                    'team' => $toqc,
                    'CongDoan' => $request->CongDoan,
                    'QuyCach' => $request->CDay . "*" . $request->CRong . "*" . $request->CDai,
                    'type' => 1,
                    'openQty' => $request->RejectQty,
                    'ErrorData' => $errorData,
                ]);
                $changedData[] = $notifi; // Thêm dữ liệu đã thay đổi vào mảng

                //Lưu thông tin awaitingstocks
                if (empty($request->SubItemCode)) {
                    // Lưu lỗi thành phẩm
                    foreach ($request->ErrorData['SubItemQty'] as $subItem) {
                        awaitingstocks::create([
                            'notiId' => $notifi->id,
                            'SubItemCode' => $subItem['SubItemCode'],
                            'AwaitingQty' => $request->RejectQty * $subItem['BaseQty'],
                            'team' => $request->Team,
                        ]);
                    }
                } else {
                    // Lưu lỗi bán thành phẩm
                    foreach ($request->ErrorData['SubItemQty'] as $subItem) {
                        if ($subItem['SubItemCode'] == $request->SubItemCode) {
                            awaitingstocks::create([
                                'notiId' => $notifi->id,
                                'SubItemCode' => $subItem['SubItemCode'],
                                'AwaitingQty' => $request->RejectQty,
                                'team' => $request->Team,
                            ]);
                            break;
                        }
                    }
                }
            }
            DB::commit();
        } catch (\Exception | QueryException $e) {
            DB::rollBack();
            return response()->json(['message' => 'ghi nhận sản lượng không thành công', 'error' => $e->getMessage()], 500);
        }
        return response()->json([
            'message' => 'Successful',
            'data' => $changedData
        ], 200);
    }

    // Danh sách sản lượng
    function index(Request $request)
    {
        // 1. Nhận vào tham số "TO", nếu không nhận được tham số sẽ báo lỗi
        $validator = Validator::make($request->all(), [
            'TO' => 'required',
            'CongDoan' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        // 2. Kết nối SAP và lấy dữ liệu từ bảng UV_GHINHANSL dựa trên "TO" và lấy ra tất cả các kết quả có TO bằng với TO trong tham số truyền vào
        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from UV_GHINHANSL where "TO"=? order by "LSX" asc ';
        $stmt = odbc_prepare($conDB, $query);

        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }

        if (!odbc_execute($stmt, [$request->TO])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        // 3. Tạo mảng results[] và trả về dữ liệu
        $results = [];

        // 3.1. Tạo một key có giá trị là 'SPDICH' và lọc qua toàn bộ kết quả tìm được, sau đó gom nhóm các sản phẩm có cùng SPDICH
        // while ($row = odbc_fetch_array($stmt)) {
        //     $key = $row['SPDICH'];

        //     //Đối với các kết quả key tìm được, tạo một mảng có các trường sau
        //     if (!isset($results[$key])) {
        //         $results[$key] = [
        //             'SPDICH' => $row['SPDICH'],
        //             'NameSPDich' => $row['NameSPDich'],
        //             'MaThiTruong' => $row['MaThiTruong'],
        //             'Details' => [],
        //         ];
        //     }
        //     // 3.2. Tạo key có giá trị hỗn hợp là ItemChild.TO.TOTT
        //     $detailsKey = $row['ItemChild'] . $row['TO'] . $row['TOTT'];

        //     $details = [
        //         'ItemChild' => $row['ItemChild'],
        //         'ChildName' => $row['ChildName'],
        //         'CDay' => $row['CDay'],
        //         'CRong' => $row['CRong'],
        //         'CDai' => $row['CDai'],
        //         'LSX' => [
        //             [
        //                 'LSX' => $row['LSX'],
        //                 'SanLuong' => $row['SanLuong'],
        //                 'DaLam' => $row['DaLam'],
        //                 'Loi' => $row['Loi'],
        //                 'ConLai' => $row['ConLai'],
        //             ],
        //         ],
        //         'totalsanluong' => $row['SanLuong'],
        //         'totalDaLam' => $row['DaLam'],
        //         'totalLoi' => $row['Loi'],
        //         'totalConLai' => $row['ConLai'],
        //     ];

        //     // Check if the composite key already exists
        //     $compositeKeyExists = false;
        //     foreach ($results[$key]['Details'] as &$existingDetails) {
        //         $existingKey = $existingDetails['ItemChild'] . $existingDetails['TO'] . $existingDetails['TOTT'];
        //         if ($existingKey === $detailsKey) {
        //             $existingDetails['LSX'][] = $details['LSX'][0];
        //             $existingDetails['totalsanluong'] += $row['SanLuong'];
        //             $existingDetails['totalDaLam'] += $row['DaLam'];
        //             $existingDetails['totalLoi'] += $row['Loi'];
        //             $existingDetails['totalConLai'] += $row['ConLai'];
        //             $compositeKeyExists = true;
        //             break;
        //         }
        //     }

        //     if (!$compositeKeyExists) {
        //         $results[$key]['Details'][] = array_merge($details, [
        //             'TO' => $row['TO'],
        //             'NameTO' => $row['NameTO'],
        //             'TOTT' => $row['TOTT'],
        //             'NameTOTT' => $row['NameTOTT']
        //         ]);
        //     }
        // }

        while ($row = odbc_fetch_array($stmt)) {
            $key = $row['SPDICH'];

            //Đối với các kết quả key tìm được, tạo một mảng có các trường sau
            if (!isset($results[$key])) {
                $results[$key] = [
                    'SPDICH' => $row['SPDICH'],
                    'NameSPDich' => $row['NameSPDich'],
                    'MaThiTruong' => $row['MaThiTruong'],
                    'Details' => [],
                ];
            }

            // 3.2. Tạo key có giá trị hỗn hợp là ItemChild.TO.TOTT
            $detailsKey = $row['ItemChild'] . $row['TO'] . $row['TOTT'];

            $details = [
                'ItemChild' => $row['ItemChild'],
                'ChildName' => $row['ChildName'],
                'CDay' => $row['CDay'],
                'CRong' => $row['CRong'],
                'CDai' => $row['CDai'],
                'LSX' => [
                    [
                        'LSX' => $row['LSX'],
                        'SanLuong' => $row['SanLuong'],
                        'DaLam' => $row['DaLam'],
                        'Loi' => $row['Loi'],
                        'ConLai' => $row['ConLai'],
                    ],
                ],
                'totalsanluong' => $row['SanLuong'],
                'totalDaLam' => $row['DaLam'],
                'totalLoi' => $row['Loi'],
                'totalConLai' => $row['ConLai'],
            ];

            // Check if the composite key already exists
            $compositeKeyExists = false;
            foreach ($results[$key]['Details'] as &$existingDetails) {
                $existingKey = $existingDetails['ItemChild'] . $existingDetails['TO'] . $existingDetails['TOTT'];
                if ($existingKey === $detailsKey) {

                    // Kiểm tra xem LSX này đã tồn tại trong mảng chưa
                    $lsxFound = false;
                    foreach ($existingDetails['LSX'] as &$existingLSX) {
                        if ($existingLSX['LSX'] === $row['LSX']) {
                            // LSX đã tồn tại, cộng dồn số liệu vào LSX này
                            $existingLSX['SanLuong'] += $row['SanLuong'];
                            $existingLSX['DaLam'] += $row['DaLam'];
                            $existingLSX['Loi'] += $row['Loi'];
                            $existingLSX['ConLai'] += $row['ConLai'];
                            $lsxFound = true;
                            break;
                        }
                    }

                    if (!$lsxFound) {
                        $existingDetails['LSX'][] = $details['LSX'][0];
                    }

                    // Luôn cộng dồn vào total (bất kể có thêm LSX mới hay không)
                    $existingDetails['totalsanluong'] += $row['SanLuong'];
                    $existingDetails['totalDaLam'] += $row['DaLam'];
                    $existingDetails['totalLoi'] += $row['Loi'];
                    $existingDetails['totalConLai'] += $row['ConLai'];

                    $compositeKeyExists = true;
                    break;
                }
            }

            if (!$compositeKeyExists) {
                $results[$key]['Details'][] = array_merge($details, [
                    'TO' => $row['TO'],
                    'NameTO' => $row['NameTO'],
                    'TOTT' => $row['TOTT'],
                    'NameTOTT' => $row['NameTOTT']
                ]);
            }
        }

        // Sắp xếp kết quả trả về theo thứ tự tăng dần của ItemChild
        foreach ($results as &$result) {
            usort($result['Details'], function ($a, $b) {
                return strcmp($a['ItemChild'], $b['ItemChild']);
            });
        }

        // collect stock pending
        $stockpending = SanLuong::join('notireceipt', 'sanluong.id', '=', 'notireceipt.baseID')
            ->where('notireceipt.type', 0)
            ->where('sanluong.Team', $request->TO)
            ->where('sanluong.Status', '!=', 1)
            ->where('notireceipt.deleted', '!=', 1)
            ->groupBy('sanluong.FatherCode', 'sanluong.ItemCode', 'sanluong.Team', 'sanluong.NexTeam')
            ->select(
                'sanluong.FatherCode',
                'sanluong.ItemCode',
                'sanluong.Team',
                'sanluong.NexTeam',
                DB::raw('sum(Quantity) as Quantity'),
            )
            ->get();
        if ($stockpending !== null) {
            foreach ($results as &$result) {

                $SPDICH = $result['SPDICH'];
                foreach ($result['Details'] as &$details) {
                    $ItemChild = $details['ItemChild'];
                    $TO = $details['TO'];

                    // Find the corresponding stock pending entry
                    $stockEntry = $stockpending->first(function ($entry) use ($SPDICH, $ItemChild, $TO) {
                        return $entry['FatherCode'] == $SPDICH && $entry['ItemCode'] == $ItemChild && $entry['Team'] == $TO;
                    });

                    // Update totalConLai if the stock entry is found
                    if ($stockEntry !== null) {
                        $details['totalConLai'] = $details['totalConLai'] - $stockEntry['Quantity'];
                    }
                }
            }
        }
        odbc_close($conDB);

        $data = null;
        $data2 = null;

        // Dữ liệu chờ xác nhận
        if ($request->TO == "TH-QC" || $request->TO == "TQ-QC" || $request->TO == "HG-QC") {
            $data = null;
        } else {
            // Truy vấn dữ liệu từ cơ sở dữ liệu Laravel
            $rawData = DB::table('sanluong as a')
                ->join('notireceipt as b', function ($join) {
                    $join->on('a.id', '=', 'b.baseID')
                        ->where('b.deleted', '=', 0);
                })
                ->join('users as c', 'a.create_by', '=', 'c.id')
                ->select(
                    'a.FatherCode',
                    'a.ItemCode',
                    'a.ItemName',
                    'a.team',
                    'a.CongDoan',
                    'CDay',
                    'CRong',
                    'CDai',
                    'b.Quantity',
                    'a.SLDG',
                    'a.created_at',
                    'c.first_name',
                    'c.last_name',
                    'b.text',
                    'b.id',
                    'b.type',
                    'b.confirm'
                )
                ->where('b.confirm', '=', 0)
                ->where('b.type', 0)
                ->where('b.team', '=', $request->TO)
                ->get();

            // Kết nối đến SAP
            $conDB = (new ConnectController)->connect_sap();

            // Tạo mảng kết quả mới có thêm trường MaThiTruong
            $data = collect();

            foreach ($rawData as $item) {
                // Truy vấn đến bảng OITM trong SAP để lấy U_SKU
                $query = 'SELECT "U_SKU", "U_CDay", "U_CRong", "U_CDai" FROM OITM WHERE "ItemCode" = ?';
                $stmt = odbc_prepare($conDB, $query);

                if (!$stmt) {
                    throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
                }

                if (!odbc_execute($stmt, [$item->ItemCode])) {
                    throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
                }

                $maThiTruong = null;
                $CDay = null;
                $CRong = null;
                $CDai = null;
                if ($row = odbc_fetch_array($stmt)) {
                    $maThiTruong = $row['U_SKU'];
                    $CDay = (float) $row['U_CDay'];
                    $CRong = (float) $row['U_CRong'];
                    $CDai = (float) $row['U_CDai'];

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

            // Đóng kết nối SAP sau khi hoàn thành
            odbc_close($conDB);

            // Xử lý data2 như trước
            $data2 = DB::table('sanluong as a')
                ->join('notireceipt as b', function ($join) {
                    $join->on('a.id', '=', 'b.baseID')
                        ->where('b.deleted', '=', 0);
                })
                ->join('users as c', 'a.create_by', '=', 'c.id')
                ->select(
                    'a.FatherCode',
                    'a.ItemCode',
                    'a.ItemName',
                    'a.team',
                    'a.CongDoan',
                    'CDay',
                    'CRong',
                    'CDai',
                    'b.Quantity',
                    'a.created_at',
                    'c.first_name',
                    'c.last_name',
                    'b.text',
                    'b.id',
                    'b.type',
                    'b.confirm'
                )
                ->where('b.confirm', '=', 0)
                ->where('b.type', 1)
                ->where('b.team', '=', $request->TO)
                ->get();
        }

        // Return response
        return response()->json([
            'CongDoan' => $request->CongDoan,
            'data' => $results,
            'noti_choxacnhan' => $data,
            'noti_phoixuly' => $data2
        ], 200);
    }

    // Load số lượng tồn
    function viewdetail(Request $request)
    {
        // 1. Nhận vào giá trị "SPDICH", "ItemCode', "To" từ request
        $validator = Validator::make($request->all(), [
            'SPDICH' => 'required|string|max:254',
            'ItemCode' => 'required|string|max:254',
            'TO' => 'required|string|max:254',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
            // Return validation errors with a 422 Unprocessable Entity status code
        }

        // 2. Truy vấn cơ sở dữ liệu SAP
        $conDB = (new ConnectController)->connect_sap();

        // Code cũ
        $query = 'select ifnull(sum("ConLai"),0) "Quantity" from UV_GHINHANSL where "ItemChild"=? and "TO"=? and "SPDICH"=?';
        $stmt = odbc_prepare($conDB, $query);

        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }

        if (!odbc_execute($stmt, [$request->ItemCode, $request->TO, $request->SPDICH])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $row = odbc_fetch_array($stmt);

        // dd($row);
        $RemainQuantity = (float)$row['Quantity'];

        // dd($quantity);

        // Code mới (thêm "stock")
        $querystock = 'SELECT * FROM UV_SOLUONGTON WHERE "U_SPDICH"=? AND "ItemCode"=? AND "U_To"=? AND "U_stop" = ?;';
        $stmtstock = odbc_prepare($conDB, $querystock);

        if (!$stmtstock) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }

        if (!odbc_execute($stmtstock, [$request->SPDICH, $request->ItemCode, $request->TO, 'N'])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        $results = array();
        while ($rowstock = odbc_fetch_array($stmtstock)) {
            $results[] = $rowstock;
        }

        // dd($results);

        // 3. Lấy danh sách số lượng tồn, các giá trị sản lượng tối đa, còn lại và các thông tin cần thiết
        // Lấy công đoạn hiện tại
        $CongDoan = null;
        foreach ($results as $result) {
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


        foreach ($results as $result) {
            $wareHouse = $result['wareHouse'];

            if ($SubItemWhs === null) {
                $SubItemWhs = $wareHouse;
            } else {
                if ($wareHouse !== $SubItemWhs) {
                    return response()->json(['error' => 'Các giá trị warehouse trong LSX không đồng nhất nên không thể ghi nhận!'], 422);
                }
            }
        }

        $stock = [];

        // dd($results);

        // Lấy danh sách số lượng tồn
        $groupedResults = [];

        foreach ($results as $result) {
            $subItemCode = $result['SubItemCode'];
            $subItemName = $result['SubItemName'];
            $onHand = (float) $result['OnHand'];
            $baseQty = (float) $result['BaseQty'];

            if (!array_key_exists($subItemCode, $groupedResults)) {
                $groupedResults[$subItemCode] = [
                    'SubItemCode' => $subItemCode,
                    'SubItemName' => $subItemName,
                    'OnHand' => $onHand,
                    'BaseQty' => $baseQty,
                ];
            }

            // $groupedResults[$subItemCode]['OnHand'] = $onHand;
        }

        // Lấy thông tin từ awaitingstocks để tính toán số lượng tồn thực tế
        foreach ($groupedResults as &$item) {
            $awaitingQtySum = awaitingstocks::where('SubItemCode', $item['SubItemCode'])->where('team', $request->TO)->sum('AwaitingQty');
            $item['OnHand'] -= $awaitingQtySum;
        }
        $groupedResults = array_values($groupedResults);

        // dd($groupedResults);

        // Dữ liệu nhà máy, gửi kèm thôi chứ không có xài
        $factory = [
            [
                'Factory' => 'TH',
                'FactoryName' => 'Nhà Máy Thuận Hưng'
            ],
            [
                'Factory' => 'YS',
                'FactoryName' => 'Nhà Máy Yên Sơn'
            ],
            [
                'Factory' => 'TB',
                'FactoryName' => 'Nhà Máy Thái Bình'
            ],
        ];

        $ItemInfo = DB::table('sanluong as a')
            ->select(
                'a.ItemCode',
                'a.ItemName',
            )
            ->where('ItemCode', $request->ItemCode)
            ->first();

        // Lấy danh sách sản lượng ghi nhận, lỗi và trả lại
        // Danh sách sản lượng ghi nhận
        $Datareceipt = DB::table('sanluong as a')
            ->join('notireceipt as b', function ($join) {
                $join->on('a.id', '=', 'b.baseID')
                    ->where('b.deleted', '=', 0);
            })
            ->join('users as c', 'a.create_by', '=', 'c.id')
            ->select(
                'a.FatherCode',
                'a.ItemCode',
                'a.ItemName',
                'b.SubItemName',
                'b.SubItemCode',
                'a.team',
                'a.loinhamay',
                'CDay',
                'CRong',
                'CDai',
                'b.Quantity',
                'a.SLDG',
                'a.created_at',
                'c.first_name',
                'c.last_name',
                'b.text',
                'b.id',
                'b.type',
                'b.confirm'
            )
            ->where('b.confirm', '=', 0)
            ->where('b.type', '=', 0)
            ->where('b.deleted', '=', 0)
            ->where('a.FatherCode', '=', $request->SPDICH)
            ->where('a.ItemCode', '=', $request->ItemCode)
            ->where('a.Team', '=', $request->TO);

        // Danh sách sản lượng lỗi
        $dataqc = DB::table('sanluong as a')
            ->join('notireceipt as b', function ($join) {
                $join->on('a.id', '=', 'b.baseID')
                    ->where('b.deleted', '=', 0);
            })
            ->join('users as c', 'a.create_by', '=', 'c.id')
            ->select(
                'a.FatherCode',
                'a.ItemCode',
                'a.ItemName',
                'b.SubItemName',
                'b.SubItemCode',
                'a.team',
                'a.loinhamay',
                'CDay',
                'CRong',
                'CDai',
                'b.Quantity',
                'a.SLDG',
                'a.created_at',
                'c.first_name',
                'c.last_name',
                'b.text',
                'b.id',
                'b.type',
                'b.confirm'
            )
            ->where('b.confirm', '=', 0)
            ->where('b.type', '=', 1)
            ->where('b.isPushSAP', '=', 0)
            ->where('a.FatherCode', '=', $request->SPDICH)
            ->where('a.ItemCode', '=', $request->ItemCode)
            ->where('a.Team', '=', $request->TO);

        $notification = $Datareceipt->unionAll($dataqc)->get();

        // Danh sách sản lượng trả lại
        $dataReturn = DB::table('sanluong as a')
            ->join('notireceipt as b', function ($join) {
                $join->on('a.id', '=', 'b.baseID')
                    ->where('b.deleted', '=', 0);
            })
            ->join('users as c', 'b.confirmBy', '=', 'c.id')
            ->select(
                'a.FatherCode',
                'a.ItemCode',
                'a.ItemName',
                'a.team',
                'CDay',
                'CRong',
                'CDai',
                'b.Quantity',
                'b.confirmBy',
                'b.confirm_at',
                'c.first_name',
                'c.last_name',
                'b.text',
                'b.id',
                'b.type',
                'b.confirm'
            )
            ->where('b.confirm', '=', 2)
            ->where('b.type', '=', 0)
            ->where('b.isPushSAP', '=', 0)
            ->where('a.FatherCode', '=', $request->SPDICH)
            ->where('a.ItemCode', '=', $request->ItemCode)
            ->where('a.Team', '=', $request->TO)
            ->get();

        // Tìm số lượng tối đa
        $maxQuantities = [];

        foreach ($groupedResults as $result) {
            $onHand = $result['OnHand'];
            $baseQty = $result['BaseQty'];

            $maxQuantity = floor($onHand / $baseQty);
            $maxQuantities[] = $maxQuantity;
        }
        $maxQty = $maxQty = !empty($maxQuantities) ? min($maxQuantities) : 0;

        // Tính tổng số lượng đang chờ xác nhận và xử lý lỗi
        $WaitingConfirmQty = $notification->where('type', '=', 0)->sum('Quantity') ?? 0;
        $WaitingQCItemQty = $notification->where('type', '=', 1)->where('SubItemCode', '=', null)->sum('Quantity') ?? 0;

        // 4. Trả về kết quả cho người dùng
        return response()->json([
            'ItemInfo' => $ItemInfo,
            'CongDoan'  =>  $CongDoan,
            'SubItemWhs' => $SubItemWhs,
            'notifications' => $notification,
            'stocks' => $groupedResults,
            'maxQty' =>   $maxQty,
            'WaitingConfirmQty' => $WaitingConfirmQty,
            'WaitingQCItemQty' => $WaitingQCItemQty,
            'remainQty' =>   $RemainQuantity,
            'Factorys' => $factory,
            'returnedHistory' => $dataReturn,
        ], 200);
    }

    function listo(Request $request)
    {
        $conDB = (new ConnectController)->connect_sap();

        $query = 'select "VisResCode" "Code","ResName" "Name", Case when "U_QC"= ? then true else false end QC from "ORSC" A JOIN "RSC4" B ON A."VisResCode"=b."ResCode"
        join OHEM C ON B."EmpID"=C."empID" where c."empID" =? AND "validFor"=?';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, ['Y', Auth::user()->sap_id, 'Y'])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $row['QC'] = $row['QC'] === '0' ? false : true;
            $results[] = $row;
        }
        odbc_close($conDB);
        return response()->json($results, 200);
    }

    function reject(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'reason' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $data = DB::table('sanluong AS b')->join('notireceipt as a', 'a.baseID', '=', 'b.id')
            ->select('b.*')
            ->where('a.id', $request->id)
            // ->where('b.Status', 0)
            //  ->where('a.type', 0)
            ->where('a.confirm', 0)
            ->first();

        if (!$data) {
            throw new \Exception('data không hợp lệ.');
        }
        // giá trị cột confirm bằng 2 là trả lại
        SanLuong::where('id', $data->id)->update(['Status' => 1]);
        notireceipt::where('id', $request->id)->update(['confirm' => 2, 'confirmBy' => Auth::user()->id, 'confirm_at' => Carbon::now()->format('YmdHis'), 'text' => $request->reason]);
        awaitingstocks::where('notiId', $request->id)->delete();
        return response()->json('success', 200);
    }

    function dsphoipending(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'team' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $data = notireceipt::where('team', $request->team)->where('confirm', 0)->get();
        return response()->json($data, 200);
    }

    function delete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'SPDICH' => 'required|string|max:254',
            'ItemCode' => 'required|string|max:254',
            'TO' => 'required|string|max:254',
        ]);

        // dd($request);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        // Lấy dữ liệu từ SAP
        $conDB = (new ConnectController)->connect_sap();

        $querystock = 'SELECT * FROM UV_SOLUONGTON WHERE "U_SPDICH"=? AND "ItemCode"=? AND"U_To"=?';
        $stmtstock = odbc_prepare($conDB, $querystock);

        if (!$stmtstock) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }

        if (!odbc_execute($stmtstock, [$request->SPDICH, $request->ItemCode, $request->TO])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        $results = array();
        while ($rowstock = odbc_fetch_array($stmtstock)) {
            $results[] = $rowstock;
        }

        // dd($results);

        $data = DB::table('notireceipt as a')
            ->where('a.id', $request->id)
            ->where('a.deleted', 0)
            ->where('a.confirm', 0)
            ->first();
        if (!$data) {
            throw new \Exception('Thông báo đã được nhận hoặc trả lại. Vui lòng load lại trang');
        }

        // Xóa số lượng giao chờ xác nhận
        notireceipt::where('id', $data->id)->update(['deleted' => 1, 'deleteBy' => Auth::user()->id, 'deleted_at' => Carbon::now()->format('YmdHis')]);
        awaitingstocks::where('notiId', $data->id)->delete();

        // Lấy danh sách số lượng tồn
        $groupedResults = [];

        foreach ($results as $result) {
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

                $groupedResults[$subItemCode]['OnHand'] = $onHand;
            }
        }
        // Lấy dữ liệu từ awaitingstocks để tính toán số lượng tồn thực tế
        foreach ($groupedResults as &$item) {
            $awaitingQtySum = awaitingstocks::where('SubItemCode', $item['SubItemCode'])->sum('AwaitingQty');
            $item['OnHand'] -= $awaitingQtySum;
        }

        $groupedResults = array_values($groupedResults);

        // 4. Lấy danh sách sản lượng, lỗi đã ghi nhận và trả lại
        $Datareceipt = DB::table('sanluong as a')
            ->join('notireceipt as b', function ($join) {
                $join->on('a.id', '=', 'b.baseID')
                    ->where('b.deleted', '=', 0);
            })
            ->join('users as c', 'a.create_by', '=', 'c.id')
            ->select(
                'a.FatherCode',
                'a.ItemCode',
                'a.ItemName',
                'b.SubItemName',
                'b.SubItemCode',
                'a.team',
                'CDay',
                'CRong',
                'CDai',
                'b.Quantity',
                'a.created_at',
                'c.first_name',
                'c.last_name',
                'b.text',
                'b.id',
                'b.type',
                'b.confirm'
            )
            ->where('b.confirm', '=', 0)
            ->where('b.type', '=', 0)
            ->where('b.deleted', '=', 0)
            ->where('a.FatherCode', '=', $request->SPDICH)
            ->where('a.ItemCode', '=', $request->ItemCode)
            ->where('a.Team', '=', $request->TO);

        $dataqc = DB::table('sanluong as a')
            ->join('notireceipt as b', function ($join) {
                $join->on('a.id', '=', 'b.baseID')
                    ->where('b.deleted', '=', 0);
            })
            ->join('users as c', 'a.create_by', '=', 'c.id')
            ->select(
                'a.FatherCode',
                'a.ItemCode',
                'a.ItemName',
                'b.SubItemName',
                'b.SubItemCode',
                'a.team',
                'CDay',
                'CRong',
                'CDai',
                'b.Quantity',
                'a.created_at',
                'c.first_name',
                'c.last_name',
                'b.text',
                'b.id',
                'b.type',
                'b.confirm'
            )
            ->where('b.confirm', '=', 0)
            ->where('b.type', '=', 1)
            ->where('b.isPushSAP', '=', 0)
            ->where('a.FatherCode', '=', $request->SPDICH)
            ->where('a.ItemCode', '=', $request->ItemCode)
            ->where('a.Team', '=', $request->TO);
        $notification = $Datareceipt->unionAll($dataqc)->get();

        // Danh sách sản lượng trả lại
        $dataReturn = DB::table('sanluong as a')
            ->join('notireceipt as b', function ($join) {
                $join->on('a.id', '=', 'b.baseID')
                    ->where('b.deleted', '=', 0);
            })
            ->join('users as c', 'b.confirmBy', '=', 'c.id')
            ->select(
                'a.FatherCode',
                'a.ItemCode',
                'a.ItemName',
                'a.team',
                'CDay',
                'CRong',
                'CDai',
                'b.Quantity',
                'b.confirmBy',
                'b.confirm_at',
                'c.first_name',
                'c.last_name',
                'b.text',
                'b.id',
                'b.type',
                'b.confirm'
            )
            ->where('b.confirm', '=', 2)
            ->where('b.type', '=', 0)
            ->where('b.isPushSAP', '=', 0)
            ->where('a.FatherCode', '=', $request->SPDICH)
            ->where('a.ItemCode', '=', $request->ItemCode)
            ->where('a.Team', '=', $request->TO)
            ->get();

        $Datareceipt = DB::table('sanluong as a')
            ->join('notireceipt as b', function ($join) {
                $join->on('a.id', '=', 'b.baseID')
                    ->where('b.deleted', '=', 0);
            })
            ->join('users as c', 'a.create_by', '=', 'c.id')
            ->select(
                'a.FatherCode',
                'a.ItemCode',
                'a.ItemName',
                'b.SubItemName',
                'b.SubItemCode',
                'a.team',
                'CDay',
                'CRong',
                'CDai',
                'b.Quantity',
                'a.created_at',
                'c.first_name',
                'c.last_name',
                'b.text',
                'b.id',
                'b.type',
                'b.confirm'
            )
            ->where('b.confirm', '=', 0)
            ->where('b.type', '=', 0)
            ->where('b.deleted', '=', 0)
            ->where('a.FatherCode', '=', $request->SPDICH)
            ->where('a.ItemCode', '=', $request->ItemCode)
            ->where('a.Team', '=', $request->TO);

        $dataqc = DB::table('sanluong as a')
            ->join('notireceipt as b', function ($join) {
                $join->on('a.id', '=', 'b.baseID')
                    ->where('b.deleted', '=', 0);
            })
            ->join('users as c', 'a.create_by', '=', 'c.id')
            ->select(
                'a.FatherCode',
                'a.ItemCode',
                'a.ItemName',
                'b.SubItemName',
                'b.SubItemCode',
                'a.team',
                'CDay',
                'CRong',
                'CDai',
                'b.Quantity',
                'a.created_at',
                'c.first_name',
                'c.last_name',
                'b.text',
                'b.id',
                'b.type',
                'b.confirm'
            )
            ->where('b.confirm', '=', 0)
            ->where('b.type', '=', 1)
            ->where('b.isPushSAP', '=', 0)
            ->where('a.FatherCode', '=', $request->SPDICH)
            ->where('a.ItemCode', '=', $request->ItemCode)
            ->where('a.Team', '=', $request->TO);
        $notification = $Datareceipt->unionAll($dataqc)->get();

        $maxQuantities = [];

        foreach ($groupedResults as $result) {
            $onHand = $result['OnHand'];
            $baseQty = $result['BaseQty'];

            $maxQuantity = floor($onHand / $baseQty);
            $maxQuantities[] = $maxQuantity;
        }

        // Tìm số lượng tối thiểu
        $maxQty = min($maxQuantities);

        // dd($notification);
        $WaitingConfirmQty = $notification->where('type', '=', 0)->sum('Quantity') ?? 0;
        $WaitingQCItemQty = $notification->where('type', '=', 1)->where('confirm', '=', 0)->where('SubItemCode', '=', null)->sum('Quantity') ?? 0;

        return response()->json([
            'message' => 'success',
            'WaitingConfirmQty' => $WaitingConfirmQty,
            'WaitingQCItemQty' => $WaitingQCItemQty,
            'maxQty' =>   $maxQty,
            'stocks' => $groupedResults,
            'returnedHistory' => $dataReturn,
        ], 200);
    }
    function collectdata($spdich, $item, $to)
    {
        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from UV_DETAILGHINHANSL where "SPDICH"=? and "ItemChild"=? and "TO"=? order by "LSX","DocEntry" asc';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$spdich, $item, $to])) {
            // Handle execution error
            // die("Error executing SQL statement: " . odbc_errormsg());
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $results = array();

        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        };
        odbc_close($conDB);
        return  $results;
    }
    function allocate($data, $totalQty)
    {
        foreach ($data as &$item) {
            // Sử dụng isset() thay vì so sánh với phần tử đầu tiên trong mảng
            if (
                isset($item['ConLai']) && $item['ConLai'] <= $totalQty
            ) {
                $item['Allocate'] = $item['ConLai'];
                $totalQty -= $item['ConLai'];
            } else {
                // Chỉ cập nhật giá trị nếu Qty lớn hơn 0
                if ($item['ConLai'] > 0) {
                    $item['Allocate'] = min($item['ConLai'], $totalQty);
                    $totalQty -= $item['Allocate'];
                } else {
                    $item['Allocate'] = 0;
                }
            }
        }

        // Sử dụng array_filter với callback ngắn gọn hơn
        $filteredData = array_filter($data, fn($item) => $item['Allocate'] != 0);

        return array_values($filteredData);
    }
    function allocate_v2($data, $totalQty)
    {
        $nev = 0; // Khởi tạo nev
        usort($data, fn($a, $b) => (int)$a['DocEntry'] <=> (int)$b['DocEntry']);
        foreach ($data as &$item) {
            if (isset($item['ConLai']) && $item['ConLai'] <= $totalQty) {
                $item['Allocate'] = $item['ConLai'];
                $totalQty -= $item['ConLai'];
            } else {
                if ($item['ConLai'] > 0) {
                    $item['Allocate'] = min($item['ConLai'], $totalQty);
                    $totalQty -= $item['Allocate'];
                } else {
                    $item['Allocate'] = 0;
                }
            }
        }
        // Kiểm tra nếu totalQty còn lại và không thể phân bổ
        if ($totalQty > 0) {
            $nev = 1; // Đặt nev = 1
            return ['error' => 'Vượt hạn mức', 'nev' => $nev];
        }
        $filteredData = array_filter($data, fn($item) => $item['Allocate'] != 0);
        return ['allocatedData' => array_values($filteredData), 'nev' => $nev];
    }
    function accept(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        try {
            DB::beginTransaction();
            // to bình thường
            $data = DB::table('sanluong AS b')->join('notireceipt as a', 'a.baseID', '=', 'b.id')
                ->select('b.*', 'a.id as notiID', 'a.team as NextTeam')
                ->where('a.id', $request->id)
                ->where('a.confirm', 0)
                ->first();

            $U_GIAO = DB::table('users')->where('id', $data->create_by)->first();
            if (!$data) {
                throw new \Exception('data không hợp lệ.');
            }

            if ($data->NextTeam != "TH-QC"  && $data->NextTeam != "TQ-QC"  && $data->NextTeam != "HG-QC") {
                $dataallocate = $this->collectdata($data->FatherCode, $data->ItemCode, $data->Team);
                $allocates = $this->allocate($dataallocate, $data->CompleQty);
                if (count($allocates) == 0) {
                    return response()->json([
                        'error' => false,
                        'status_code' => 500,
                        'message' => "Số lượng ghi nhận vượt số lượng kế hoạch. Vui lòng kiếm tra:" .
                            $data->Team . " sản phẩm: " .
                            $data->ItemCode . " LSX." . $data->LSX
                    ], 500);
                }
                foreach ($allocates as $allocate) {

                    $body = [
                        "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                        "U_LSX" => $data->LSX,
                        "U_TO" => $data->Team,
                        "U_NGiao" => $U_GIAO->last_name . " " . $U_GIAO->first_name,
                        "U_NNhan" => Auth::user()->last_name . " " . Auth::user()->first_name,
                        "DocumentLines" => [[
                            "Quantity" => $allocate['Allocate'],
                            "TransactionType" => "C",
                            "BaseEntry" => $allocate['DocEntry'],
                            "BaseType" => 202,
                            "BatchNumbers" => [
                                [
                                    "BatchNumber" => Carbon::now()->format('YmdHis') . $allocate['DocEntry'],
                                    "Quantity" => $allocate['Allocate'],
                                    "ItemCode" =>  $allocate['ItemChild'],
                                    "U_CDai" => $allocate['CDai'],
                                    "U_CRong" => $allocate['CRong'],
                                    "U_CDay" => $allocate['CDay'],
                                    "U_Status" => "HD",
                                    "U_Year" => $request->year ?? now()->format('y'),
                                    "U_Week" => $request->week ? str_pad($request->week, 2, '0', STR_PAD_LEFT) : str_pad(now()->weekOfYear, 2, '0', STR_PAD_LEFT)
                                ]
                            ]
                        ]]
                    ];
                    $response = Http::withOptions([
                        'verify' => false,
                    ])->withHeaders([
                        'Content-Type' => 'application/json',
                        'Accept' => 'application/json',
                        'Authorization' => 'Basic ' . BasicAuthToken(),
                    ])->post(UrlSAPServiceLayer() . '/b1s/v1/InventoryGenEntries', $body);
                    $res = $response->json();
                    if ($response->successful()) {
                        SanLuong::where('id', $data->id)->update(
                            [
                                'Status' => 1,
                            ]
                        );
                        notireceipt::where('id', $data->notiID)->update([
                            'confirm' => 1,
                            'ObjType' =>   202,
                            // 'DocEntry' => $res['DocEntry'],
                            'confirmBy' => Auth::user()->id,
                            'confirm_at' => Carbon::now()->format('Y-m-d H:i:s')
                        ]);
                        awaitingstocks::where('notiId', $data->notiID)->delete();
                        HistorySL::create(
                            [
                                'LSX' => $data->LSX,
                                'itemchild' => $allocate['ItemChild'],
                                'SPDich' => $data->FatherCode,
                                'to' => $data->Team,
                                'quantity' => $allocate['Allocate'],
                                'ObjType' => 202,
                                'DocEntry' => $res['DocEntry']
                            ]
                        );
                        DB::commit();
                    } else {
                        DB::rollBack();
                        return response()->json([
                            'message' => 'Failed receipt',
                            'error' => $res['error'],
                            'body' => $body
                        ], 500);
                    }
                }
                return response()->json('success', 200);
            } else {
                return response()->json([
                    'error' => false,
                    'status_code' => 500,
                    'message' => "Tổ không hợp lệ."
                ], 500);
            }
        } catch (\Exception | QueryException $e) {
            DB::rollBack();
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    //To be deleted
    function getAllTeam()
    {
        $conDB = (new ConnectController)->connect_sap();

        $query = 'select "VisResCode" "Code","ResName" "Name"
        from "ORSC" where "U_QC" =? AND "validFor"=? and "U_FAC"=?;';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, ['N', 'Y', Auth::user()->plant])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        }
        odbc_close($conDB);
        return response()->json($results, 200);
    }

    // To be deleted
    function getRootCause()
    {
        $results = [
            [
                'id' => 'C',
                'name' => 'Lỗi đầu vào (Mã con)'
            ],
            [
                'id' => 'P',
                'name' => 'Lỗi đầu ra (Mã cha)'
            ],
        ];
        return response()->json($results, 200);
    }
    public function getTeamByFactory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'FAC' => 'required|string|max:254',
            'DIV' => 'required|string|max:254',
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => implode(' ', $validator->errors()->all())], 422);
        }

        try {
            $conDB = (new ConnectController)->connect_sap();

            // if (!is_resource($conDB)) {
            //     $type = is_object($conDB) ? get_class($conDB) : gettype($conDB);
            //     throw new \RuntimeException("Expected ODBC resource, got {$type}");
            // }

            $query = 'select "VisResCode" "Code","ResName" "Name","U_CDOAN" "CDOAN"
                  from "ORSC" where "U_QC"=? AND "validFor"=? AND "U_FAC"=? AND "U_KHOI"=?';
            $stmt = odbc_prepare($conDB, $query);
            if (!$stmt) {
                throw new \RuntimeException('Error preparing SQL: ' . odbc_errormsg($conDB));
            }
            $ok = odbc_execute($stmt, ['N', 'Y', $request->FAC, $request->DIV]);
            if (!$ok) {
                throw new \RuntimeException('Error executing SQL: ' . odbc_errormsg($conDB));
            }

            $results = [];
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }

            odbc_free_result($stmt);
            odbc_close($conDB);

            return response()->json($results, 200);
        } catch (\Throwable $e) {
            // Trả lỗi nhất quán để frontend đọc .response.data.message
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /*
    *********************************
    version 2: thay doi yeu cau nhập xuất cùng lúc
    *********************************
    */
    function acceptV2(Request $request)
    {
        // 1.0 Validate dữ liệu đầu vào để xác định thông báo giao dịch và công đoạn nhận
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'CongDoan' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }
        // thêm tính năng check 1 user không được xử lý trùng lắp 1 id cùng lúc
        $userId = Auth::id();
        $lockKey = "accept_request_lock:{$request->id}";

        // Check if this user already processing the request
        if (Cache::has($lockKey)) {
            return response()->json([
                'error' => true,
                'status_code' => 429,
                'message' => 'Bạn đang xử lý yêu cầu này. Vui lòng đợi hoàn tất.'
            ], 429);
        }
        // Đặt lock trong 30 giây
        Cache::put($lockKey, true, now()->addSeconds(30));

        // 2. Xử lý xác nhận
        try {

            DB::beginTransaction();
            // 2.1 Kiểm tra giao dịch tồn tại và chưa xác nhận, nếu có lấy thông tin giao dịch
            $data = DB::table('sanluong AS b')->join('notireceipt as a', 'a.baseID', '=', 'b.id')
                ->select('b.*', 'a.id as notiID', 'a.team as NextTeam')
                ->where('a.id', $request->id)
                ->where('a.confirm', 0)
                ->first();

            if (!$data) {
                Cache::forget($lockKey);
                throw new \Exception('Giao dịch hiện tại có thể đã được xác nhận hoặc bị xóa. Hãy load lại tổ để kiểm tra.');
            }
            $U_GIAO = DB::table('users')->where('id', $data->create_by)->first();
            $U_Item = $data->ItemCode;
            $U_Qty = $data->SLDG ?? 0;

            // Validate phân bổ
            if ($data->NextTeam != "TH-QC"  && $data->NextTeam != "YS-QC"  && $data->NextTeam != "TB-QC") {
                $dataallocate = $this->collectdata($data->FatherCode, $data->ItemCode, $data->Team);
                $result = $this->allocate_v2($dataallocate, $data->CompleQty);
                $allocates = $result['allocatedData'] ?? [];
                if (isset($allocates['error']) && $allocates['error']) {
                    Cache::forget($lockKey);
                    return response()->json([
                        'error' => true,
                        'status_code' => 500,
                        'message' => "Vượt hạn mức. kiểm tra tổ:" . $data->team . " sản phẩm: " .
                            $data->ItemCode . " sản phẩm đích: " .
                            $data->FatherCode . " LSX." . $data->LSX
                    ], 500);
                }

                if (empty($allocates)) {
                    Cache::forget($lockKey);
                    return response()->json([
                        'error' => false,
                        'status_code' => 506,
                        'message' => "Số lượng ghi nhận vượt số lượng kế hoạch. Vui lòng kiếm tra tổ: " .
                            $data->Team . " sản phẩm: " .
                            $data->ItemCode . ", lệnh sản xuất:" . $data->LSX
                    ], 500);
                }

                // dd($allocates);
                $string = '';
                $dataReceipt = [];
                foreach ($allocates as $allocate) {
                    $string .= $allocate['DocEntry'] . '-' . $allocate['Allocate'] . ';';
                    //data cho receipt
                    $dataReceipt[] = [
                        "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                        // "U_LSX" => $data->LSX,
                        "U_LSX" => $allocate['LSX'],
                        "U_TO" => $data->Team,
                        "U_NGiao" => $U_GIAO->last_name . " " . $U_GIAO->first_name,
                        "U_NNhan" => Auth::user()->last_name . " " . Auth::user()->first_name,
                        "U_UUID" => $request->id,
                        "DocumentLines" => [[
                            "Quantity" => (float) $allocate['Allocate'],
                            "TransactionType" => "C",
                            "BaseEntry" => $allocate['DocEntry'],
                            "CostingCode" => "CBG",
                            "CostingCode4" => "Default",
                            "BaseType" => 202,
                            "BatchNumbers" => [
                                [
                                    "BatchNumber" => $allocate['ItemChild'] . '-'. substr($request->year, 2) . 'W' . str_pad($request->week, 2, '0', STR_PAD_LEFT),
                                    "Quantity" => $allocate['Allocate'],
                                    "ItemCode" =>  $allocate['ItemChild'],
                                    "U_CDai" => $allocate['CDai'],
                                    "U_CRong" => $allocate['CRong'],
                                    "U_CDay" => $allocate['CDay'],
                                    "U_Status" => "HD",
                                    "U_Year" => $request->year ?? now()->format('y'),
                                    "U_Week" => $request->week ? str_pad($request->week, 2, '0', STR_PAD_LEFT) : str_pad(now()->weekOfYear, 2, '0', STR_PAD_LEFT)
                                ]
                            ]
                        ]]
                    ];

                    HistorySL::create(
                        [
                            'LSX' => $data->LSX,
                            'itemchild' => $allocate['ItemChild'],
                            'SPDich' => $data->FatherCode,
                            'to' => $data->Team,
                            'notiID' => $data->notiID,
                            'quantity' => $allocate['Allocate'],
                            'ObjType' => 202,
                            'DocEntry' => ''
                        ]
                    );
                }
                // dd($dataReceipt);
                if ($string == '') {
                    DB::rollBack();
                    Cache::forget($lockKey);
                    return response()->json([
                        'error' => false,
                        'status_code' => 506,
                        'message' => "Lỗi lấy dữ liệu phiếu xuất:" .
                            $data->Team . " sản phẩm: " .
                            $data->ItemCode . " sản phẩm đích: " .
                            $data->FatherCode . " LSX." . $data->LSX
                    ], 500);
                }
                //$stockissue = $this->collectStockAllocate($string, $request->id);
                $stockissue = null; // yêu cầu không cần gửi stock issue item manual nữa
                $dataSendPayload = [
                    'InventoryGenEntries' => $dataReceipt,
                    'InventoryGenExits' => $stockissue
                ];

                $payload = playloadBatch($dataSendPayload);
                // Assuming `playloadBatch()` function prepares the payload
                $client = new Client();
                $response = $client->request('POST', UrlSAPServiceLayer() . '/b1s/v1/$batch', [
                    'verify' => false,
                    'headers' => [
                        'Accept' => '*/*',
                        'Content-Type' => 'multipart/mixed;boundary=batch_36522ad7-fc75-4b56-8c71-56071383e77c_' . $payload['uid'],
                        'Authorization' => 'Basic ' . BasicAuthToken(),
                    ],
                    'body' => $payload['payload'],
                    // Đảm bảo $pl được định dạng đúng cách với boundary
                ]);

                $statusCode = $response->getStatusCode();
                $resBody = $response->getBody()->getContents();
                try {
                    switch ($statusCode) {
                        case 400:
                            throw new \Exception('SAP ERROR Incomplete batch request body.');

                        case 500:
                            throw new \Exception('SAP ERROR ' . $resBody);

                        case 401:
                            throw new \Exception('SAP authen ' . $resBody);

                        case 202:
                            // Bước 1: kiểm tra phản hồi có chứa phần tử thành công không
                            if (strpos($resBody, 'ETag') === false) {
                                $this->throwSAPError($resBody);
                            }

                            // Tách các phần của batch response
                            $parts = preg_split('/--batch.*?\r\n/', $resBody);
                            $receiptFromProduction = null;

                            // Lặp qua các phần của phản hồi để trích xuất thông tin
                            foreach ($parts as $part) {
                                if (strpos($part, '"DocEntry"') !== false) {
                                    preg_match('/"DocEntry"\s*:\s*(\d+)/', $part, $entryMatches);
                                    preg_match('/"DocNum"\s*:\s*(\d+)/', $part, $numMatches);
                                    if (!empty($entryMatches[1]) && !empty($numMatches[1])) {
                                        $receiptFromProduction = [
                                            'DocEntry' => (int)$entryMatches[1],
                                            'DocNum' => (int)$numMatches[1],
                                        ];
                                        break;
                                    }
                                }
                            }

                            // Kiểm tra xem có thông tin phiếu ReceiptFromProduction không
                            if (empty($receiptFromProduction)) {
                                $this->throwSAPError($resBody);
                            }

                            // Cấu trúc dữ liệu document_log
                            $documentLog = [
                                'ReceiptFromProduction' => $receiptFromProduction,
                                'timestamp' => now()->toDateTimeString()
                            ];

                            // Update thành công
                            SanLuong::where('id', $data->id)->update(['Status' => 1]);
                            notireceipt::where('id', $data->notiID)->update([
                                'confirm' => 1,
                                'ObjType' => 202,
                                'confirmBy' => Auth::user()->id,
                                'confirm_at' => Carbon::now()->format('YmdHis'),
                                'document_log' => json_encode($documentLog)
                            ]);
                            awaitingstocks::where('notiId', $data->notiID)->delete();

                            DB::commit();
                            break;

                        default:
                            preg_match('/\{.*\}/s', $resBody, $matches);
                            if (isset($matches[0])) {
                                $errorData = json_decode($matches[0], true);
                                if (json_last_error() === JSON_ERROR_NONE && isset($errorData['error'])) {
                                    throw new \Exception(
                                        'SAP code: ' . $errorData['error']['code'] .
                                            ' chi tiết: ' . $errorData['error']['message']['value']
                                    );
                                }
                            }
                            throw new \Exception('SAP ERROR: Phản hồi không xác định từ server: ' . $resBody);
                    }

                    // Nếu là công đoạn TP thì dispatch job
                    if ($request->CongDoan === 'TP' && $U_Qty != 0) {
                        $this->dispatch(new SyncSLDGToSAP($U_Item, $U_Qty, Auth::user()->branch, now()->format('Ymd')));
                    }
                    return response()->json('Yêu cầu được thực hiện thành công', 200);
                } finally {
                    // Đảm bảo luôn clear cache, kể cả khi throw exception
                    Cache::forget($lockKey);
                }
            } else {
                Cache::forget($lockKey);
                return response()->json([
                    'error' => false,
                    'status_code' => 500,
                    'message' => "Tổ không hợp lệ."
                ], 500);
            }
        } catch (\Exception | QueryException $e) {
            DB::rollBack();

            // Kiểm tra lỗi 502 Proxy Error (mất kết nối server)
            if (strpos($e->getMessage(), '502 Proxy Error') !== false) {
                return response()->json([
                    'error' => true,
                    'status_code' => 500,
                    'error_type' => 'PROXY_CONNECTION_FAILED',
                    'message' => 'Đường truyền tới máy chủ bị gián đoạn, vui lòng thử lại sau giây lát.',
                    'original_error' => $e->getMessage()
                ], 500);
            }

            // Kiểm tra lỗi SAP code:-5002 (tồn kho không đủ)
            if (
                strpos($e->getMessage(), 'SAP code:-5002') !== false &&
                strpos($e->getMessage(), 'Make sure that the consumed quantity') !== false
            ) {
                // Tạo thông báo chi tiết về thiếu hàng
                $message = "Nguyên vật liệu không đủ để giao nhận!";
                $itemDetails = [];

                preg_match('/Production Order no:\s*(\d{9})/', $e->getMessage(), $matches);
                $productionOrderNumber = $matches[1] ?? null;

                return response()->json([
                    'error' => true,
                    'status_code' => 40001,
                    'error_type' => 'INSUFFICIENT_INVENTORY',
                    'message' => $message,
                    'item_code' => $request->ItemCode,
                    'production_order' => $productionOrderNumber,
                    'original_error' => $e->getMessage()
                ], 400);
            }

            // Trả về lỗi thông thường nếu không phải lỗi tồn kho
            return response()->json([
                'error' => true,
                'status_code' => 500,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    function checkInventory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'ItemCode' => 'required',
            'Quantity' => 'required|numeric|min:0',
            'CongDoan' => 'required',
            'Factory' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }
        $itemCode = $request->ItemCode;
        $quantity = $request->quantity;
        $factory = $request->Factory;
        $step = $request->CongDoan;
        $requiredInventory = $this->getRequiredInventory($itemCode, $quantity, $factory, $step);

        // Kiểm tra xem có nguyên vật liệu nào không đủ
        if (empty($requiredInventory)) {
            return response()->json([
                'message' => 'Nguyên vật liệu đã đủ để giao nhận.',
                'requiredInventory' => [],
            ], 200);
        } else {
            return response()->json([
                'error' => true,
                'status_code' => 40001,
                'message' => 'Nguyên vật liệu không đủ để giao nhận',
                'requiredInventory' => $requiredInventory,
            ], 500);
        }
    }

    private function getRequiredInventory($itemCode, $quantity, $factory, $step)
    {
        $requiredItems = [];
        $groupedItems = [];

        $conDB = (new ConnectController)->connect_sap();

        // Truy vấn view UV_TONKHOSAP để lấy thông tin
        $query = "
            SELECT
                \"DocNum\",
                \"U_GRID\",
                \"U_To\",
                \"U_CDOAN\",
                \"U_SPDICH\",
                \"ItemCode\",
                \"ItemName\",
                \"SubItemCode\",
                \"SubItemName\",
                \"wareHouse\",
                \"BaseQty\" AS \"DinhMuc\",
                \"Factory\",
                ((\"PlannedQty\" - \"IssuedQty\")) AS \"SoLuongConPhaiSanXuat\",
                \"OnHand\" AS \"TonTaiTo\",
                ROUND((\"PlannedQty\" - \"IssuedQty\") - \"OnHand\") AS \"SoLuongToiThieuCanBoSung\"
            FROM UV_TONKHOSAP
            WHERE \"ItemCode\" = ?
            AND \"Factory\" = ?
            AND ROUND((\"PlannedQty\" - \"IssuedQty\") - \"OnHand\") > 0
        ";

        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$itemCode, $factory])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }

        $results = array();
        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        }

        // Nhóm dữ liệu theo SubItemCode và wareHouse
        foreach ($results as $item) {
            // Tính toán số lượng tối thiểu cần bổ sung
            $requiredQuantity = (float)$item['SoLuongToiThieuCanBoSung'];

            $key = $item['SubItemCode'] . '_' . $item['wareHouse'];

            if (!isset($groupedItems[$key])) {
                $groupedItems[$key] = [
                    'SubItemCode' => $item['SubItemCode'],
                    'SubItemName' => $item['SubItemName'],
                    'wareHouse' => $item['wareHouse'],
                    'requiredQuantity' => $requiredQuantity,
                    'DinhMuc' => (float)$item['DinhMuc']
                ];
            } else {
                // Cộng dồn số lượng cần bổ sung nếu đã có cùng SubItemCode và wareHouse
                $groupedItems[$key]['requiredQuantity'] += $requiredQuantity;
            }
        }

        // Chuyển từ mảng kết hợp sang mảng tuần tự
        foreach ($groupedItems as $item) {
            // Làm tròn số lượng để dễ đọc
            $item['requiredQuantity'] = round($item['requiredQuantity'], 2);
            $requiredItems[] = $item;
        }

        odbc_close($conDB);

        return $requiredItems;
    }

    function collectStockAllocate($stringIssue, $id)
    {
        $conDB = (new ConnectController)->connect_sap();
        //lấy danh sách sản phẩm cần xuất
        $query = 'call usp_web_issueAutoData(?)';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$stringIssue])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $dataIssue = array();
        while ($row = odbc_fetch_array($stmt)) {
            $dataIssue[] = $row;
        }
        //check data rỗng thì return
        if (empty($dataIssue)) {
            return null;
        }

        if (isset($dataIssue[0]['ItemError'])) {
            throw new \Exception($dataIssue[0]['ItemError']);
        }
        odbc_close($conDB);
        //lấy danh sách batch serial
        $inputArray = $dataIssue;
        // Step 1: Create the initial data array with distinct DocEntry values
        $uniqueDocEntries = array_unique(array_column($inputArray, 'DocEntry'));
        $data = [];
        foreach ($uniqueDocEntries as $docEntry) {
            $data[] = [
                'BPL_IDAssignedToInvoice' =>  Auth::user()->branch,
                "U_UUID" => $id,
                'DocumentLines' => [],
                'DocEntry' => $docEntry
            ];
        }
        // Step 2: Group the data by DocEntry
        $groupedData = [];
        foreach ($inputArray as $item) {
            $docEntry = $item['DocEntry'];
            $key = $item['ItemCode'] . '|' . $item['WhsCode'];
            if (!isset($groupedData[$docEntry])) {
                $groupedData[$docEntry] = [];
            }
            if (!isset($groupedData[$docEntry][$key])) {
                $groupedData[$docEntry][$key] = [
                    'WarehouseCode' => $item['WhsCode'],
                    'BaseEntry' => $item['DocEntry'], // Assuming BaseEntry is DocEntry
                    'BaseType' => 202, // Assuming BaseType is always 202
                    'BaseLine' => $item['BaseLine'],
                    'Quantity' => $item['QtyTotal'],
                    'BatchNumbers' => [],
                    'SerialNumbers' => []
                ];
            }
            if ($item['Batch']) {
                $groupedData[$docEntry][$key]['BatchNumbers'][] = [
                    'BatchNumber' => $item['Batch'],
                    'Quantity' => $item['Qty'],
                    'ItemCode' => $item['ItemCode']
                ];
            }
            if ($item['Serial']) {
                $groupedData[$docEntry][$key]['SerialNumbers'][] = [
                    'SystemSerialNumber' => $item['Serial'],
                    'Quantity' => $item['Qty'],
                    'ItemCode' => $item['ItemCode']
                ];
            }
        }
        // Step 3: Map the grouped data to the initial data array
        foreach ($data as &$doc) {
            if (isset($groupedData[$docEntry])) {
                $doc['DocumentLines'] = array_values($groupedData[$docEntry]);
            }
        }
        foreach ($data as &$doc) {
            unset($doc['DocEntry']);
        }
        // Output the final data structure
        $output = $data;
        return $output;
    }

    private function throwSAPError(string $resBody)
    {
        preg_match('/\{.*\}/s', $resBody, $matches);
        if (!isset($matches[0])) {
            throw new \Exception('SAP code: Unknown chi tiết: Không thể phân tích phản hồi từ SAP');
        }

        $errorData = json_decode($matches[0], true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('SAP code: Unknown chi tiết: Lỗi phân tích JSON từ SAP: ' . json_last_error_msg());
        }

        if (isset($errorData['error'])) {
            $code = $errorData['error']['code'] ?? 'Unknown';
            $message = $errorData['error']['message']['value'] ??
                (is_array($errorData['error']['message']) ? json_encode($errorData['error']['message']) : ($errorData['error']['message'] ?? 'Không có thông tin chi tiết'));
            throw new \Exception("SAP code: $code chi tiết: $message");
        }

        throw new \Exception('SAP code: Unknown chi tiết: Không tìm thấy thông tin lỗi trong phản hồi SAP');
    }
    /*
    **********
     END Version 2 CBG
    *********
    */
}
