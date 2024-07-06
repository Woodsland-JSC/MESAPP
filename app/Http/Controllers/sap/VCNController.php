<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\notireceiptVCN;
use App\Models\historySLVCN;
use App\Models\awaitingstocksvcn;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Http;
use App\Rules\AtLeastOneQty;
use App\Jobs\HistoryQC;
use Carbon\Carbon;

class VCNController extends Controller
{
    // Ghi nhận sản lượng
    function receipts(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'FatherCode' => 'required|string|max:254',
            'ItemCode' => 'required|string|max:254',
            'ItemName' => 'required|string|max:254',
            'CompleQty' => 'required|numeric',
            'RejectQty' => 'required|numeric',
            'version' => 'required|string|max:254',
            'ErrorData',
            'CDay' => 'required|numeric',
            'CRong' => 'required|numeric',
            'CDai' => 'required|numeric',
            'Team' => 'required|string|max:254',
            'CongDoan' => 'required|string|max:254',
            'NexTeam' => 'required|string|max:254',
            'ProdType' => 'required|string|max:254',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $toqc = "";
        if (Auth::user()->plant == 'TH') {
            $toqc = 'TH-QC';
        } else if (Auth::user()->plant == 'TQ') {
            $toqc = 'TQ-QC';
        } else {
            $toqc = 'HG-QC';
        }
        try {
            DB::beginTransaction();
            $changedData = []; // Mảng chứa dữ liệu đã thay đổi trong bảng notirecept
            $errorData = json_encode($request->ErrorData);
            if ($request->CompleQty > 0) {
                $notifi = notireceiptVCN::create([
                    'text' => 'Production information waiting for confirmation',
                    'Quantity' => $request->CompleQty,
                    'MaThiTruong' => $request->MaThiTruong,
                    'FatherCode' => $request->FatherCode,
                    'ItemCode' => $request->ItemCode,
                    'ItemName' => $request->ItemName,
                    'team' => $request->Team,
                    'NextTeam' => $request->NexTeam,
                    'CongDoan' => $request->CongDoan,
                    'QuyCach' => $request->CDay . "*" . $request->CRong . "*" . $request->CDai,
                    'type' => 0,
                    'openQty' => 0,
                    'ProdType' => $request->ProdType,
                    'version' => $request->version,
                    'CreatedBy' => Auth::user()->id,
                ]);
                $changedData[] = $notifi; // Thêm dữ liệu đã thay đổi vào mảng

                // Lưu dữ liệu vào awaitingstocks cho VCN
                foreach ($request->ErrorData['SubItemQty'] as $subItem) {
                    awaitingstocksvcn::create([
                        'notiId' => $notifi->id,
                        'SubItemCode' => $subItem['SubItemCode'],
                        'AwaitingQty' => $request->CompleQty * $subItem['BaseQty'],
                    ]);
                }
            }
            if ($request->RejectQty > 0) {
                $notifi = notireceiptVCN::create([
                    'text' => 'Error information sent to QC',
                    'FatherCode' => $request->FatherCode,
                    'ItemCode' => $request->ItemCode,
                    'ItemName' => $request->ItemName,
                    'Quantity' => $request->RejectQty,
                    'SubItemCode' => $request->SubItemCode, //mã báo lỗi
                    'SubItemName' => $request->SubItemName, //tên mã báo lỗi
                    'team' => $request->Team,
                    'NextTeam' => $toqc,
                    'CongDoan' => $request->CongDoan,
                    'QuyCach' => $request->CDay . "*" . $request->CRong . "*" . $request->CDai,
                    'type' => 1,
                    'openQty' => $request->RejectQty,
                    'ProdType' => $request->ProdType,
                    'ErrorData' => $errorData,
                    'MaThiTruong' => $request->MaThiTruong,
                    'CreatedBy' => Auth::user()->id,
                    'loinhamay' => $request->factories['value']??null
                ]);
                $changedData[] = $notifi; // Thêm dữ liệu đã thay đổi vào mảng

                // Lưu dữ liệu vào awaitingstocks cho VCN
                if (empty($request->SubItemCode)) {
                    // Lưu lỗi thành phẩm
                    foreach ($request->ErrorData['SubItemQty'] as $subItem) {
                        $awaitingStock = awaitingstocksvcn::create([
                            'notiId' => $notifi->id,
                            'SubItemCode' => $subItem['SubItemCode'],
                            'AwaitingQty' => $request->RejectQty * $subItem['BaseQty'],
                        ]);
                    }
                } else {
                    // Lưu lỗi bán thành phẩm
                    foreach ($request->ErrorData['SubItemQty'] as $subItem) {
                        if ($subItem['SubItemCode'] == $request->SubItemCode) {
                            $awaitingStock = awaitingstocksvcn::create([
                                'notiId' => $notifi->id,
                                'SubItemCode' => $subItem['SubItemCode'],
                                'AwaitingQty' => $request->RejectQty * $subItem['BaseQty'],
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
            'TO' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        // 2. Kết nối SAP và lấy dữ liệu từ bảng UV_GHINHANSLVCN dựa trên "TO" và lấy ra tất cả các kết quả có TO bằng với TO trong tham số truyền vào
        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from UV_GHINHANSLVCN where "TO"=? order by "LSX" asc ';
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
            $detailsKey = $row['ItemChild'] . $row['TO'] . $row['TOTT'] . $row['Version'];

            $details = [
                'ItemChild' => $row['ItemChild'],
                'ChildName' => $row['ChildName'],
                'Version' => $row['Version'],
                'ProdType' => $row['ProType'],
                'CDay' => $row['CDay'],
                'CRong' => $row['CRong'],
                'CDai' => $row['CDai'],
                'CDOAN' => $row['CDOAN'],
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
                $existingKey = $existingDetails['ItemChild'] . $existingDetails['TO'] . $existingDetails['TOTT'] . $existingDetails['Version'];
                if ($existingKey === $detailsKey) {
                    $existingDetails['LSX'][] = $details['LSX'][0];
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
        // collect stock pending
        $stockpending = notireceiptVCN::where('type', 0)
            ->where('Team', $request->TO)
            ->where('deleted', '!=', 1)
            ->groupBy('FatherCode', 'ItemCode', 'Team', 'NextTeam')
            ->select(
                'FatherCode',
                'ItemCode',
                'Team',
                'NextTeam',
                DB::raw('sum(Quantity) as Quantity')
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

        $data = null;
        $datacxl = null;

        //data need confirm
        if ($request->TO == "TH-QC" || $request->TO == "TQ-QC" || $request->TO == "HG-QC") {
            $data = null;
        } else {
            $data = DB::table('notireceiptvcn as a')
            ->join('users as b', 'a.CreatedBy', '=', 'b.id')
            ->select(
                'a.FatherCode',
                'a.ItemCode',
                'a.ItemName',
                'a.team',
                'a.CongDoan',
                'a.CDay',
                'a.CRong',
                'a.CDai',
                'a.Quantity',
                'a.MaThiTruong',
                'a.ProdType',
                'a.created_at',
                'b.first_name',
                'b.last_name',
                'a.text',
                'a.id',
                'a.type',
                'a.confirm'
            )
            ->where('a.type', '=', 0)
            ->where('a.NextTeam', $request->TO)
            ->where('a.confirm', '=', 0)
            ->where('a.deleted', '=', 0)
            ->get();
        }

        return response()->json([
            'data' => $results,
            'noti_choxacnhan' => $data, 'noti_phoixuly' => $datacxl
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
        }

        // 2. Truy vấn cơ sở dữ liệu SAP
        $conDB = (new ConnectController)->connect_sap();

        // Code cũ
        $query = 'select ifnull(sum("ConLai"),0) "Quantity" from UV_GHINHANSLVCN where "ItemChild"=? and "TO"=? and "SPDICH"=?';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$request->ItemCode, $request->TO, $request->SPDICH])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $row = odbc_fetch_array($stmt);
        $RemainQuantity = (float)$row['Quantity'];

        // Code mới (thêm "stock")
        $querystock = 'SELECT * FROM UV_SOLUONGTONVCN WHERE "U_SPDICH"=? AND "ItemCode"=? AND"U_To"=?';
        $stmtstock = odbc_prepare($conDB, $querystock);

        if (!$stmtstock) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }

        if (!odbc_execute($stmtstock, [$request->SPDICH, $request->ItemCode, $request->TO])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $rowstock = odbc_fetch_array($stmtstock);
        $results = array();
        while ($rowstock = odbc_fetch_array($stmtstock)) {
            $results[] = $rowstock;
        }

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
                    return response()->json(['error' => 'Các giá trị của wareHouse trong LSX không giống nhau!'], 422);
                }
            }
        }

        $stock = [];

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
            }

            $groupedResults[$subItemCode]['OnHand'] = $onHand;
        }

        // Lấy thông tin từ awaitingstocks để tính toán số lượng tồn thực tế
        foreach ($groupedResults as &$item) {
            $awaitingQtySum = awaitingstocksvcn::where('SubItemCode', $item['SubItemCode'])->sum('AwaitingQty');
            $item['OnHand'] -= $awaitingQtySum;
        }
        $groupedResults = array_values($groupedResults);

        // Dữ liệu nhà máy, gửi kèm thôi chứ không có xài
        $factory = [
            [
                'Factory' => '01',
                'FactoryName' => 'Nhà Máy CBG Thuận hưng'
            ],
            [
                'Factory' => '02',
                'FactoryName' => 'Nhà Máy CBG Yên sơn'
            ],
            [
                'Factory' => '03',
                'FactoryName' => 'Nhà Máy CBG Thái Bình'
            ],
        ];

        $ItemInfo = notireceiptVCN::where('ItemCode', $request->ItemCode)
            ->select(
                'ItemCode',
                'ItemName',
            )
            ->first();

        // Lấy danh sách sản lượng và lỗi đã ghi nhận
        $notification = DB::table('notireceiptVCN as a')
            ->join('users as c', 'a.CreatedBy', '=', 'c.id')
            ->select(
                'a.FatherCode',
                'a.ItemCode',
                'a.ItemName',
                'a.SubItemName',
                'a.SubItemCode',
                'a.team',
                'CDay',
                'CRong',
                'CDai',
                'a.Quantity',
                'a.created_at',
                'c.first_name',
                'c.last_name',
                'a.text',
                'a.id',
                'a.type',
                'a.confirm'
            )
            ->where('a.confirm', '=', 0)
            ->where('a.deleted', '=', 0)
            ->where('a.FatherCode', '=', $request->SPDICH)
            ->where('a.ItemCode', '=', $request->ItemCode)
            ->where('a.Team', '=', $request->TO)
            ->get();

        // Tính số lượng tối đa
        $maxQuantities = [];
        foreach ($groupedResults as &$result) {
            $onHand = $result['OnHand'];
            $baseQty = $result['BaseQty'];

            $maxQuantity = floor($onHand / $baseQty);
            $maxQuantities[] = $maxQuantity;
        }
        $maxQty = $maxQty = !empty($maxQuantities) ? min($maxQuantities) : 0;

        // Tính tống số lượng chờ xác nhận và chờ xử lý lỗi
        $WaitingConfirmQty = $notification->where('type', '=', 0)->sum('Quantity');
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
        ], 200);
    }

    // Trả lại sản lượng đã giao
    function reject(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'reason' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        $data = notireceiptVCN::where('id', $request->id)->where('confirm', 0)->first();
        if (!$data) {
            throw new \Exception('data không hợp lệ.');
        }
        // giá trị cột confirm bằng 2 là trả lại
        notireceiptVCN::where('id', $request->id)->update(['confirm' => 2, 'confirmBy' => Auth::user()->id, 'confirm_at' => now()->format('YmdHmi'), 'text' => $request->reason]);
        awaitingstocksvcn::where('notiId', $request->id)->delete();
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
        $data = notireceiptVCN::where('NextTeam', $request->team)->where('confirm', 0)->get();
        return response()->json($data, 200);
    }

    function deleteRong(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer',
            'SPDICH' => 'required|string|max:254',
            'ItemCode' => 'required|string|max:254',
            'TO' => 'required|string|max:254',
            'FatherCode' => 'required|string|max:254',
            'version' => 'required|integer',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }

        $data = notireceiptVCN::where('id', $request->id)->where('deleted', 0)->first();
        if (!$data) {
            throw new \Exception('data không hợp lệ.');
        }

        notireceiptVCN::where('id', $data->id)->update(['deleted' => 1, 'deletedBy' => Auth::user()->id, 'deleted_at' => now()->format('YmdHmi')]);

        // Lấy dữ liệu từ SAP
        $conDB = (new ConnectController)->connect_sap();

        $query = 'call "USP_ChiTietSLVCN_RONG"(?,?,?)';
        $stmt = odbc_prepare($conDB, $query);

        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }

        if (!odbc_execute($stmt, [$request->FatherCode, $request->TO, $request->version])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $results = [];
        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        }

        // Lấy data dở dàng
        $data = notireceiptVCN::select('ItemCode', 'version')
            ->selectRaw('SUM(CASE WHEN type = 1 THEN openQty ELSE Quantity END) AS TotalQuantity')
            ->where('FatherCode', $request->FatherCode)
            ->where('Team', $request->TO)
            ->where('version', $request->version)
            ->where('confirm', '=', 0)
            ->where('deleted', '=', 0)
            ->groupBy('ItemCode', 'version')
            ->get();

        if ($data->count() > 0) {
            // Map mảng 2 theo ItemCode và version
            $map = [];
            foreach ($data as $item) {
                $itemCode = $item['ItemCode'];
                $map[$itemCode][$item['version']] = $item['TotalQuantity'];
            }

            // Cập nhật lại giá trị ConLai của mảng 1 và lấy ra notiID
            foreach ($results as &$item1) {
                $itemCode = $item1['ItemCode'];

                $notiData = DB::table('notireceiptVCN')
                    ->join('users', 'notireceiptVCN.CreatedBy', '=', 'users.id')
                    ->select('notireceiptVCN.*', 'users.first_name', 'users.last_name')
                    ->where('notireceiptVCN.FatherCode', $request->FatherCode)
                    ->where('notireceiptVCN.Team', $request->TO)
                    ->where('notireceiptVCN.ItemCode', $itemCode)
                    ->where('notireceiptVCN.version', $request->version)
                    ->where('notireceiptVCN.confirm', '=', 0)
                    ->where('notireceiptVCN.deleted', '=', 0)
                    ->get();

                if (isset($map[$itemCode])) {
                    foreach ($map[$itemCode] as $version => $totalQuantity) {
                        $item1['ConLai'] -= $totalQuantity;
                    }
                }
                $item1['ConLai'] = (float) $item1['ConLai'];
                $item1['notifications'] = $notiData;
            }
            // dd($notiData);

            return response()->json([
                'stocks' => $results,
                'message' => 'success',
            ], 200);
        } else {
            foreach ($results as &$item1) {
                $item1['notifications'] = [];
            }
            return response()->json([
                'stocks' => $results,
                'message' => 'success',
            ], 200);
        }
    }


    function delete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'SPDICH' => 'required|string|max:254',
            'ItemCode' => 'required|string|max:254',
            'TO' => 'required|string|max:254',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); 
        }
        $data = notireceiptVCN::where('id', $request->id)->where('deleted', 0)->first();
        if (!$data) {
            throw new \Exception('data không hợp lệ.');
        }

        //Truy vấn cơ sở dữ liệu SAP
        $conDB = (new ConnectController)->connect_sap();

        $querystock = 'SELECT * FROM UV_SOLUONGTONVCN WHERE "U_SPDICH"=? AND "ItemCode"=? AND"U_To"=?';
        $stmtstock = odbc_prepare($conDB, $querystock);

        if (!$stmtstock) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }

        if (!odbc_execute($stmtstock, [$request->SPDICH, $request->ItemCode, $request->TO])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $rowstock = odbc_fetch_array($stmtstock);
        $results = array();
        while ($rowstock = odbc_fetch_array($stmtstock)) {
            $results[] = $rowstock;
        }

        // Xóa số lượng giao chờ xác nhận
        notireceiptVCN::where('id', $data->id)->update(['deleted' => 1, 'deletedBy' => Auth::user()->id, 'deleted_at' => now()->format('YmdHmi')]);
        awaitingstocksvcn::where('notiId', $data->id)->delete();

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
            }

            $groupedResults[$subItemCode]['OnHand'] = $onHand;
        }

        // Lấy thông tin từ awaitingstocks để tính toán số lượng tồn thực tế
        foreach ($groupedResults as &$item) {
            $awaitingQtySum = awaitingstocksvcn::where('SubItemCode', $item['SubItemCode'])->sum('AwaitingQty');
            $item['OnHand'] -= $awaitingQtySum;
        }
        $groupedResults = array_values($groupedResults);

        // Lấy danh sách sản lượng và lỗi đã ghi nhận
        $notification = DB::table('notireceiptVCN as a')
            ->join('users as c', 'a.CreatedBy', '=', 'c.id')
            ->select(
                'a.FatherCode',
                'a.ItemCode',
                'a.ItemName',
                'a.SubItemName',
                'a.SubItemCode',
                'a.team',
                'CDay',
                'CRong',
                'CDai',
                'a.Quantity',
                'a.created_at',
                'c.first_name',
                'c.last_name',
                'a.text',
                'a.id',
                'a.type',
                'a.confirm'
            )
            ->where('a.confirm', '=', 0)
            ->where('a.deleted', '=', 0)
            ->where('a.FatherCode', '=', $request->SPDICH)
            ->where('a.ItemCode', '=', $request->ItemCode)
            ->where('a.Team', '=', $request->TO)
            ->get();

        // Tính số lượng tối đa
        $maxQuantities = [];
        foreach ($groupedResults as &$result) {
            $onHand = $result['OnHand'];
            $baseQty = $result['BaseQty'];

            $maxQuantity = floor($onHand / $baseQty);
            $maxQuantities[] = $maxQuantity;
        }
        $maxQty = $maxQty = !empty($maxQuantities) ? min($maxQuantities) : 0;

        // Tính tống số lượng chờ xác nhận và chờ xử lý lỗi
        $WaitingConfirmQty = $notification->where('type', '=', 0)->sum('Quantity');
        $WaitingQCItemQty = $notification->where('type', '=', 1)->where('SubItemCode', '=', null)->sum('Quantity') ?? 0;

        return response()->json([
            'message' => 'success',
            'stocks' => $groupedResults,
            'maxQty' =>   $maxQty,
            'WaitingConfirmQty' => $WaitingConfirmQty,
            'WaitingQCItemQty' => $WaitingQCItemQty,
        ], 200);
    }

    function collectdata($spdich, $item, $to, $version)
    {

        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from UV_DETAILGHINHANSL_VCN where "SPDICH"=? and "ItemChild"=? and "TO"=? and "Version"=? order by "LSX" asc';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$spdich, $item, $to, $version])) {
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
        $filteredData = array_filter($data, fn ($item) => $item['Allocate'] != 0);

        return array_values($filteredData);
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
            $data = notireceiptVCN::where('id', $request->id)->where('confirm', 0)->first();
            if (!$data) {
                throw new \Exception('data không hợp lệ.');
            }
            if ($data->NextTeam != "TH-QC"  && $data->NextTeam != "TQ-QC"  && $data->NextTeam != "HG-QC") {
                $dataallocate = $this->collectdata($data->FatherCode, $data->ItemCode, $data->team, $data->version);
                $allocates = $this->allocate($dataallocate, $data->Quantity);
                if (count($allocates) == 0) {
                    return response()->json([
                        'error' => false,
                        'status_code' => 500,
                        'message' => "Không có sản phẩm còn lại để phân bổ. kiểm tra tổ:" .
                            $data->team . " sản phẩm: " .
                            $data->ItemCode . " sản phẩm đích: " .
                            $data->FatherCode . " LSX." . $data->LSX
                    ], 500);
                }
                foreach ($allocates as $allocate) {

                    $body = [
                        "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                        "U_LSX" => $data->LSX,
                        "U_TO" => $data->Team,
                        "DocumentLines" => [[
                            "Quantity" => $allocate['Allocate'],
                            "TransactionType" => "C",
                            "BaseEntry" => $allocate['DocEntry'],
                            "BaseType" => 202,
                            "BatchNumbers" => [
                                [
                                    "BatchNumber" => now()->format('YmdHmi') . $allocate['DocEntry'],
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
                        historySLVCN::create(
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
                notireceiptVCN::where('id', $request->id)->update([
                    'confirm' => 1,
                    'confirmBy' => Auth::user()->id,
                    'confirm_at' => now()->format('YmdHmi')
                ]);
                awaitingstocksvcn::where('notiId', $data->notiID)->delete();
                DB::commit();
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

    function getQCWarehouseByUser()
    {
        $WHS = GetWhsCode(Auth::user()->plant, 'NG');
        return $WHS;
    }

    function AcceptQCVCN(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'Qty' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }

        $loailoi = $request->loailoi['label'] ?? '';
        $huongxuly = $request->huongxuly['label'] ?? '';
        $teamBack = $request->teamBack['value'] ?? '';
        $rootCause = $request->rootCause['value'] ?? '';
        $subCode = $request->subCode['value'] ?? '';
        //check kho QC
        $whs = $this->getQCWarehouseByUser();
        if ($whs == -1) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => "Không tìm thấy kho QC do user chưa được chỉ định nhà máy hoặc Hệ thống SAP chưa được cấu hình UserId: " . Auth::user()->id
            ], 500);
        }
        try {
            DB::beginTransaction();
            // to bình thường
            $data = notireceiptVCN::where('id', $request->id)->where('deleted', '=', 0)->where('type', '=', 1)
                ->where('openQty', '>=', $request->Qty)->first();
            if (!$data) {
                throw new \Exception('data không hợp lệ.');
            }
            $qtypush = 0;
            // check data history push sap
            if ($data->IsPushSAP == 0) {
                $type = 'I';
                $qtypush = $data->Quantity;
            } else {
                $type = 'U';
                $qtypush = $request->Qty;
            }
            //allocate data
            $dataallocate = $this->collectdata($data->FatherCode, $data->ItemCode, $data->team, $data->version);
            $allocates = $this->allocate($dataallocate, $request->Qty);
            if (count($allocates) == 0) {
                return response()->json([
                    'error' => false,
                    'status_code' => 500,
                    'message' => "Không có sản phẩm còn lại để phân bổ. kiểm tra tổ:" .
                        $data->Team . " sản phẩm: " .
                        $data->ItemCode . " sản phẩm đích: " .
                        $data->FatherCode . " LSX." . $data->LSX
                ], 500);
            }
            foreach ($allocates as $allocate) {

                $body = [
                    "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                    "U_LSX" => $data->LSX,
                    "U_TO" => $data->Team,
                    "DocumentLines" => [[
                        "Quantity" => $allocate['Allocate'],
                        "TransactionType" => "R",
                        "BaseEntry" => $allocate['DocEntry'],
                        "BaseType" => 202,
                        "WarehouseCode" => $whs,
                        "BatchNumbers" => [
                            [
                                "BatchNumber" => now()->format('YmdHmi') . $allocate['DocEntry'],
                                "Quantity" => $allocate['Allocate'],
                                "ItemCode" =>  $allocate['ItemChild'],
                                "U_CDai" => $allocate['CDai'],
                                "U_CRong" => $allocate['CRong'],
                                "U_CDay" => $allocate['CDay'],
                                "U_Status" => "HL",
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
                    historySLVCN::create(
                        [
                            'LSX' => $data->LSX,
                            'itemchild' => $allocate['ItemChild'],
                            'SPDich' => $data->FatherCode,
                            'to' => $data->Team,
                            "source"=>$rootCause,
                            "TOChuyenVe"=>$teamBack,
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
            notireceiptVCN::where('id', $request->id)->update([
                'confirm' => 1,
                'confirmBy' => Auth::user()->id,
                'confirm_at' => now()->format('YmdHmi'),
                'openQty' => $data->openQty - $request->Qty
            ]);
            DB::commit();
            HistoryQC::dispatch(
                $type,
                $request->id . "VCN",
                $data->ItemCode,
                $qtypush,
                $whs,
                $qtypush - $request->Qty,
                'VCN',
                $data->Team,
                $loailoi,
                $huongxuly,
                $rootCause,
                $subCode,
                $request->note,
                $teamBack
            );
            return response()->json('success', 200);
        } catch (\Exception | QueryException $e) {
            DB::rollBack();
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    //lấy detail data công đoạn rong
    function viewDetailRong(Request $request)
    {
        // 1. Nhận vào giá trị "SPDICH", "ItemCode', "To" từ request
        $validator = Validator::make($request->all(), [
            'FatherCode' => 'required|string|max:254',
            'TO' => 'required|string|max:254',
            'version' => 'required|string|max:254',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }
        try {
            // 2. Truy vấn cơ sở dữ liệu SAP
            $conDB = (new ConnectController)->connect_sap();

            $query = 'call "USP_ChiTietSLVCN_RONG"(?,?,?)';
            $stmt = odbc_prepare($conDB, $query);

            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }

            if (!odbc_execute($stmt, [$request->FatherCode, $request->TO, $request->version])) {
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }
            $results = [];
            while ($row = odbc_fetch_array($stmt)) {
                $results[] = $row;
            }

            // Dữ liệu nhà máy, gửi kèm thôi chứ không có xài
            $factory = [
                [
                    'Factory' => '01',
                    'FactoryName' => 'Nhà Máy CBG Thuận hưng'
                ],
                [
                    'Factory' => '02',
                    'FactoryName' => 'Nhà Máy CBG Yên sơn'
                ],
                [
                    'Factory' => '03',
                    'FactoryName' => 'Nhà Máy CBG Thái Bình'
                ],
            ];

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

            // lấy data dở dàng 
            $data = notireceiptVCN::select('ItemCode', 'version')
                ->selectRaw('SUM(CASE WHEN type = 1 THEN openQty ELSE Quantity END) AS TotalQuantity')
                ->where('FatherCode', $request->FatherCode)
                ->where('Team', $request->TO)
                ->where('version', $request->version)
                ->where('confirm', '=', 0)
                ->where('deleted', '=', 0)
                ->groupBy('ItemCode', 'version')
                ->get();

            if ($data->count() > 0) {
                // Map mảng 2 theo ItemCode và version
                $map = [];
                foreach ($data as $item) {
                    $itemCode = $item['ItemCode'];
                    $map[$itemCode][$item['version']] = $item['TotalQuantity'];
                }

                // Cập nhật lại giá trị ConLai của mảng 1 và lấy ra notiID
                foreach ($results as &$item1) {
                    $itemCode = $item1['ItemCode'];

                    $notiData = DB::table('notireceiptVCN')
                        ->join('users', 'notireceiptVCN.CreatedBy', '=', 'users.id')
                        ->select('notireceiptVCN.*', 'users.first_name', 'users.last_name')
                        ->where('notireceiptVCN.FatherCode', $request->FatherCode)
                        ->where('notireceiptVCN.Team', $request->TO)
                        ->where('notireceiptVCN.ItemCode', $itemCode)
                        ->where('notireceiptVCN.version', $request->version)
                        ->where('notireceiptVCN.confirm', '=', 0)
                        ->where('notireceiptVCN.deleted', '=', 0)
                        ->get();

                    if (isset($map[$itemCode])) {
                        foreach ($map[$itemCode] as $version => $totalQuantity) {
                            $item1['ConLai'] -= $totalQuantity;
                        }
                    }
                    $item1['ConLai'] = (float) $item1['ConLai'];
                    $item1['notifications'] = $notiData;
                }
                // dd($notiData);

                return response()->json([
                    'CongDoan' => $CongDoan,
                    'stocks' => $results,
                    'Factorys' => $factory
                ], 200);
            } else {
                foreach ($results as &$item1) {
                    $item1['notifications'] = [];
                }
                return response()->json([
                    'CongDoan' => $CongDoan,
                    'stocks' => $results,
                    'Factorys' => $factory
                ], 200);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    function receiptRong(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'Data.*.FatherCode' => 'required|string|max:254',
            'Data.*.ItemCode' => 'required|string|max:254',
            'Data.*.ItemName' => 'required|string|max:254',
            'Data.*' => [new AtLeastOneQty()],
            'Data.*.version' => 'required|string|max:254',
            'Data.*.CDay' => 'required|numeric',
            'Data.*.CRong' => 'required|numeric',
            'Data.*.CDai' => 'required|numeric',
            'Data.*.Team' => 'required|string|max:254',
            'Data.*.CongDoan' => 'required|string|max:254',
            'Data.*.NextTeam' => 'required|string|max:254',
            'Data.*.ProdType' => 'required|string|max:254',
        ]);

        // Check if validation fails
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }
        $toqc = "";
        if (Auth::user()->plant == 'TH') {
            $toqc = 'TH-QC';
        } else if (Auth::user()->plant == 'TQ') {
            $toqc = 'TQ-QC';
        } else {
            $toqc = 'HG-QC';
        }
        try {
            DB::beginTransaction();
            $changedData = []; // Mảng chứa dữ liệu đã thay đổi trong bảng notirecept
            foreach ($request->Data as $dt) {

                if ($dt['CompleQty'] > 0) {
                    $notifi = notireceiptVCN::create([
                        'text' => 'Production information waiting for confirmation',
                        'Quantity' => $dt['CompleQty'],
                        'MaThiTruong' => $dt['MaThiTruong'] ?? null,
                        'FatherCode' => $dt['FatherCode'],
                        'ItemCode' => $dt['ItemCode'],
                        'ItemName' => $dt['ItemName'],
                        'team' => $dt['Team'],
                        'NextTeam' => $dt['NextTeam'],
                        'CongDoan' => $dt['CongDoan'],
                        'QuyCach' => $dt['CDay'] . "*" . $dt['CRong'] . "*" . $dt['CDai'],
                        'type' => 0,
                        'openQty' => 0,
                        'ProdType' => $dt['ProdType'],
                        'version' => $dt['version'],
                        'CreatedBy' => Auth::user()->id,
                    ]);
                    $changedData[] = $notifi; // Thêm dữ liệu đã thay đổi vào mảng
                }
                if ($dt['RejectQty'] > 0) {
                    $notifi = notireceiptVCN::create([
                        'text' => 'Error information sent to QC',
                        'FatherCode' => $dt['FatherCode'],
                        'ItemCode' => $dt['ItemCode'],
                        'ItemName' => $dt['ItemName'],
                        'Quantity' => $dt['RejectQty'],
                        'SubItemCode' => $dt['SubItemCode'] ?? null, //mã báo lỗi
                        'SubItemName' => $dt['SubItemName'] ?? null, //tên mã báo lỗi
                        'team' => $dt['Team'],
                        'NextTeam' => $toqc,
                        'CongDoan' => $dt['CongDoan'],
                        'QuyCach' => $dt['CDay'] . "*" . $dt['CRong'] . "*" . $dt['CDai'],
                        'type' => 1,
                        'openQty' => $dt['RejectQty'],
                        'ProdType' => $dt['ProdType'],
                        'version' => $dt['version'],
                        'CreatedBy' => Auth::user()->id,
                        'MaThiTruong' => $dt['MaThiTruong'] ?? null,
                    ]);
                    $changedData[] = $notifi; // Thêm dữ liệu đã thay đổi vào mảng
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
}
