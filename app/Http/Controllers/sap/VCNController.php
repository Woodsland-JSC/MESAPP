<?php

namespace App\Http\Controllers\sap;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\notireceiptVCN;
use App\Models\DisassemblyOrder;
use App\Models\historySLVCN;
use App\Models\awaitingstocksvcn;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Http;
use App\Rules\AtLeastOneQty;
use App\Jobs\HistoryQC;
use Carbon\Carbon;
use App\Models\ChiTietRong;
use App\Services\VatTuVCNService;
use Exception;
use GuzzleHttp\Client;
use App\Services\VKetCauVcnService;
use Log;

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
            'LSX' => 'required|string|max:254',
            'CDay' => 'required|numeric',
            'CRong' => 'required|numeric',
            'CDai' => 'required|numeric',
            'Team' => 'required|string|max:254',
            'CongDoan' => 'required|string|max:254',
            'NexTeam' => 'required|string|max:254',
            'ProdType' => 'required|string|max:254',
            'loinhamay' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }

        $toqc = "";
        if (Auth::user()->plant == 'YS') {
            $toqc = 'YS2-QC';
        } else if (Auth::user()->plant == 'CH') {
            $toqc = 'CH-QC';
        } else if (Auth::user()->plant == 'YS1') {
            $toqc = 'YS1-QC';
        } else {
            $toqc = 'HG-QC';
        }

        try {
            DB::beginTransaction();
            $changedData = []; // Mảng chứa dữ liệu đã thay đổi trong bảng notirecept
            $errorData = json_encode($request->ErrorData);
            if ($request->CompleQty > 0) {
                $notifi = notireceiptVCN::create([
                    'LSX' => $request->LSX,
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
                    'loinhamay' => null,
                ]);
                $changedData[] = $notifi; // Thêm dữ liệu đã thay đổi vào mảng

                // Lưu dữ liệu vào awaitingstocks cho VCN
                foreach ($request->ErrorData['SubItemQty'] as $subItem) {
                    awaitingstocksvcn::create([
                        'notiId' => $notifi->id,
                        'SubItemCode' => $subItem['SubItemCode'],
                        'AwaitingQty' => $request->CompleQty * $subItem['BaseQty'],
                        'team' => $request->Team,
                    ]);
                }
            }
            if ($request->RejectQty > 0) {
                $notifi = notireceiptVCN::create([
                    'LSX' => $request->LSX,
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
                    'loinhamay' => $request->loinhamay,
                ]);
                $changedData[] = $notifi; // Thêm dữ liệu đã thay đổi vào mảng

                // Lưu dữ liệu vào awaitingstocks cho VCN
                if (empty($request->SubItemCode)) {
                    // Lưu lỗi thành phẩm
                    foreach ($request->ErrorData['SubItemQty'] as $subItem) {
                        awaitingstocksvcn::create([
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
                            $awaitingStock = awaitingstocksvcn::create([
                                'notiId' => $notifi->id,
                                'SubItemCode' => $subItem['SubItemCode'],
                                'AwaitingQty' => $request->RejectQty * $subItem['BaseQty'],
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
                'QuyCach2' => $row['QuyCach2'],
                'Version' => $row['Version'],
                'ProdType' => $row['ProdType'],
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
            $data = DB::table('notireceiptVCN as a')
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
            'noti_choxacnhan' => $data,
            'noti_phoixuly' => $datacxl
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
            'ProdType' => '',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }
        if ($request->ProdType == null) {
            return response()->json(['error' => 'Giá trị "ProdType" trong lệnh hoặc trong sản phẩm không được bỏ trống. Vui lòng kiểm tra lại.'], 422);
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
                    return response()->json(['error' => 'Các giá trị của wareHouse trong LSX không giống nhau!'], 422);
                }
            }
        }

        // Lấy loại ván
        $ProdType = null;
        foreach ($results as $result) {
            $prodType = $result['ProdType'];

            if ($ProdType === null) {
                $ProdType = $prodType;
            } else {
                if ($prodType !== $ProdType) {
                    return response()->json(['error' => 'Các giá trị của U_IType trong LSX không giống nhau!'], 422);
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
            $awaitingQtySum = awaitingstocksvcn::where('SubItemCode', $item['SubItemCode'])->where('team', $request->TO)->sum('AwaitingQty');
            $item['OnHand'] -= $awaitingQtySum;
        }
        $groupedResults = array_values($groupedResults);

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
                'a.loinhamay',
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

        // Lấy danh sách sản lượng và lỗi đã ghi nhận
        $returnData = DB::table('notireceiptVCN as a')
            ->join('users as c', 'a.CreatedBy', '=', 'c.id')
            ->select(
                'a.FatherCode',
                'a.ItemCode',
                'a.ItemName',
                'a.SubItemName',
                'a.SubItemCode',
                'a.loinhamay',
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
                'a.confirm',
                'a.confirm_at'
            )
            ->where('a.confirm', '=', 2)
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
            'ProdType' => $ProdType,
            'notifications' => $notification,
            'stocks' => $groupedResults,
            'maxQty' =>   $maxQty,
            'WaitingConfirmQty' => $WaitingConfirmQty,
            'WaitingQCItemQty' => $WaitingQCItemQty,
            'remainQty' =>   $RemainQuantity,
            'Factorys' => $factory,
            'returnData' => $returnData
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
            throw new \Exception('Giao dịch hiện tại có thể đã được xác nhận hoặc bị xóa. Hãy load lại tổ để kiểm tra.');
        }
        // giá trị cột confirm bằng 2 là trả lại
        notireceiptVCN::where('id', $request->id)->update(['confirm' => 2, 'confirmBy' => Auth::user()->id, 'confirm_at' => Carbon::now()->format('YmdHis'), 'text' => $request->reason]);
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

        notireceiptVCN::where('id', $data->id)->update(['deleted' => 1, 'deletedBy' => Auth::user()->id, 'deleted_at' => Carbon::now()->format('YmdHis')]);
        ChiTietRong::where('baseID', $request->id)->delete();

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

        //Gọi hàm để lấy số lượng tồn bán thành phẩm từ SAP
        $query2 = 'call UV_WEB_StockRong(?)';
        $stmt = odbc_prepare($conDB, $query2);

        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }

        if (!odbc_execute($stmt, [$request->FatherCode])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $TotalFather = 0;
        $stockFather = [];
        while ($row = odbc_fetch_array($stmt)) {
            $stockFather[] = $row;
        }
        if (count($stockFather) == 0) {
            $TotalFather = 0;
        } else {
            $TotalFather = $stockFather[0]['Qty'];
        }

        // Lấy dữ liệu đã ghi nhận trên web
        $databtp = notireceiptVCN::where('FatherCode', $request->FatherCode)
            ->where('deleted', 0)
            ->where('confirm', 0)
            ->where('type', -1)
            ->sum('QtyIssueRong');

        // Trả về tồn thực tế
        $TotalFather = $TotalFather - $databtp;

        // lấy data dở dàng
        $data = $data = NotiReceiptVCN::query()
            ->join('chitietrong as b', 'notireceiptVCN.id', '=', 'b.baseID')
            ->select(
                'version',
                'LSX',
                'ProdType',
                'FatherCode',
                'b.ItemCode',
                DB::raw('SUM(CASE WHEN b.type = 1 THEN b.openQty ELSE b.Quantity END) AS TotalQuantity')
            )
            ->where('deleted', 0)
            ->where('version', $request->version)
            ->where('FatherCode', $request->FatherCode)
            ->where('notireceiptVCN.team', $request->TO)
            ->where(function ($query) {
                $query->where(function ($query) {
                    $query->where('b.type', 0)
                        ->where('confirm', 0);
                })
                    ->orWhere(function ($query) {
                        $query->where('b.type', 1)
                            ->where('deleted', 0)
                            ->where('b.openQty', '>', 0);
                    });
            })
            ->groupBy(
                'version',
                'LSX',
                'ProdType',
                'FatherCode',
                'b.ItemCode'
            )
            ->get();

        //data noti
        $notification = NotiReceiptVCN::query()
            ->join('chitietrong as b', 'notireceiptVCN.id', '=', 'b.baseID')
            ->join('users as c', 'notireceiptVCN.CreatedBy', '=', 'c.id')
            ->select(
                'notireceiptVCN.id',
                'version',
                'LSX',
                'ProdType',
                'FatherCode',
                'SubItemCode',
                'SubItemName',
                'NotiReceiptVCN.created_at as CreatedAt',
                'b.ItemCode',
                'b.ItemName',
                'b.type',
                'QtyIssueRong',
                DB::raw("CONCAT(c.first_name, ' ', c.last_name) as fullname"),
                DB::raw('SUM(b.Quantity) as Quantity') // Sử dụng SUM để tính tổng số lượng
            )
            ->where('deleted', 0)
            ->where('confirm', 0)
            ->where('version', $request->version)
            ->where('FatherCode', $request->FatherCode)
            ->where('notireceiptVCN.team', $request->TO)
            ->groupBy(
                'notireceiptVCN.id',
                'version',
                'LSX',
                'ProdType',
                'FatherCode',
                'SubItemCode',
                'SubItemName',
                'CreatedAt',
                'b.ItemCode',
                'b.ItemName',
                'b.type',
                'fullname',
            )
            ->get()
            ->groupBy('id')  // Nhóm theo id
            ->map(function ($items, $id) {
                return [
                    'notiID' => $id,
                    'QtyIssueRong' => $items[0]['QtyIssueRong'],
                    'SubItemName' => $items[0]['SubItemName'],
                    'fullname' => $items[0]['fullname'],
                    'CreatedAt' => $items[0]['CreatedAt'],
                    'detail' => $items->map(function ($item) {
                        return [
                            'ItemCode' => $item->ItemCode,
                            'ItemName' => $item->ItemName,
                            'Qty' => $item->Quantity,  // Sử dụng trường đã được tính tổng
                            'Type' => $item->type
                        ];
                    })->toArray(),
                ];
            })
            ->values()
            ->toArray();

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
                if (isset($map[$itemCode])) {
                    foreach ($map[$itemCode] as $version => $totalQuantity) {
                        $item1['ConLai'] -= $totalQuantity;
                    }
                }
                $item1['ConLai'] = (float) $item1['ConLai'];
            }
            return response()->json([
                'CongDoan' => $CongDoan,
                'FatherStock' => $TotalFather,
                'stocks' => $results,
                'Factorys' => $factory,
                'notifications' => $notification
            ], 200);
        } else {
            return response()->json([
                'CongDoan' => $CongDoan,
                'notifications' => null,
                'FatherStock' => $TotalFather,
                'stocks' => $results,
                'Factorys' => $factory
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
        $data = notireceiptVCN::where('id', $request->id)->where('deleted', 0)->where('confirm', 0)->first();
        if (!$data) {
            throw new \Exception('Thông báo đã được nhận hoặc trả lại. Vui lòng load lại trang');
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
        $results = array();
        while ($rowstock = odbc_fetch_array($stmtstock)) {
            $results[] = $rowstock;
        }

        // Xóa số lượng giao chờ xác nhận
        notireceiptVCN::where('id', $data->id)->update(['deleted' => 1, 'deletedBy' => Auth::user()->id, 'deleted_at' => Carbon::now()->format('YmdHis')]);
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

    function collectdata($spdich, $item, $to, $version, $lsx)
    {

        $conDB = (new ConnectController)->connect_sap();
        $query = 'select * from UV_DETAILGHINHANSL_VCN where "SPDICH"=? and "ItemChild"=? and "TO"=? and "Version"=? and "LSX" = ?';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$spdich, $item, $to, $version, $lsx])) {
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
            if (isset($item['ConLai']) && $item['ConLai'] <= $totalQty) {
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

    function accept(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required'
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422); // Return validation errors with a 422 Unprocessable Entity status code
        }
        try {
            DB::beginTransaction();
            // to bình thường
            $data = notireceiptVCN::where('id', $request->id)->where('confirm', 0)->first();
            if (!$data) {
                throw new \Exception('Giao dịch hiện tại có thể đã được xác nhận hoặc bị xóa. Hãy load lại tổ để kiểm tra.');
            }
            if ($data->NextTeam != "TH-QC"  && $data->NextTeam != "TQ-QC"  && $data->NextTeam != "HG-QC") {
                $dataallocate = $this->collectdata($data->FatherCode, $data->ItemCode, $data->team, $data->version, $data->LSX);
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
                        historySLVCN::create(
                            [
                                // 'LSX' => $data->LSX,
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
                    'confirm_at' => Carbon::now()->format('YmdHis')
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

    function getQCWarehouseByUser($type)
    {
        $WHS = GetWhsCode(Auth::user()->plant, $type);
        return $WHS;
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
        if (Auth::user()->plant == 'YS') {
            $toqc = 'YS-QC';
        } else if (Auth::user()->plant == 'CH') {
            $toqc = 'CH-QC';
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
                        'loinhamay' => $dt['factories']['value'] ?? null,
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

    /*
    *********************************
    version 2: thay doi yeu cau nhập xuất cùng lúc
    *********************************
    */
    // ghi nhận sản lượng công đoạn khác rong
    function indexv2(Request $request)
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
                'ProdType' => $row['ProdType'],
                'QuyCach2' => $row['QuyCach2'],
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
        if ($request->TO == "QC_YS(VCN)" || $request->TO == "QC_CH" || $request->TO == "QC_HG") {
            $data = null;
        } else {
            $rawData = DB::table('notireceiptVCN as a')
                ->join('users as b', 'a.CreatedBy', '=', 'b.id')
                ->select(
                    'a.FatherCode',
                    'a.ItemCode',
                    'a.ItemName',
                    'a.team',
                    'a.CongDoan',
                    // 'a.CDay',
                    // 'a.CRong',
                    // 'a.CDai',
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
                ->where(function ($query) {
                    $query->where('a.type', '=', 0)
                        ->orWhere('a.type', '=', -1);
                })
                ->where('a.NextTeam', $request->TO)
                ->where('a.confirm', '=', 0)
                ->where('a.deleted', '=', 0)
                ->get()
                ->map(function ($item) {
                    // thuộc tính rong ở đây
                    // Lấy thông tin từ bảng chitietrong dựa trên id của notireceiptVCN
                    $item->rong  = DB::table('chitietrong')
                        ->where('baseID', $item->id)
                        ->select('ItemCode', 'ItemName', 'QuyCach', 'Quantity')
                        ->where('type', '=', 0)
                        ->get();


                    return $item;
                });

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
        }

        return response()->json([
            'data' => $results,
            'noti_choxacnhan' => $data,
            'noti_phoixuly' => $datacxl
        ], 200);
    }

    function viewDetailRongv2(Request $request)
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
            foreach ($results as $key => $result) {

                $U_CDOAN = $result['U_CDOAN'];

                if ($CongDoan === null) {
                    $CongDoan = $U_CDOAN;
                } else {
                    if ($U_CDOAN !== $CongDoan) {
                        return response()->json(['error' => 'Các giá trị của U_CDOAN trong LSX không giống nhau!'], 422);
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
            $stmt = odbc_prepare($conDB, $query2);

            if (!$stmt) {
                throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
            }

            if (!odbc_execute($stmt, [$request->FatherCode])) {
                throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
            }
            $TotalFather = 0;
            $stockFather = [];
            while ($row = odbc_fetch_array($stmt)) {
                $stockFather[] = $row;
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

    function acceptV2(Request $request)
    {
        // 1.0 Validate dữ liệu đầu vào để xác định thông báo giao dịch
        $validator = Validator::make($request->all(), [
            'id' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        // 2. Xử lý xác nhận
        try {
            DB::beginTransaction();
            // 2.1 Kiểm tra giao dịch tồn tại và chưa xác nhận, nếu có lấy thông tin giao dịch
            $data = notireceiptVCN::where('id', $request->id)->where('confirm', 0)->first();
            if (!$data) {
                throw new \Exception('Giao dịch hiện tại có thể đã được xác nhận hoặc bị xóa. Hãy load lại tổ để kiểm tra.');
            }
            $U_GIAO = DB::table('users')->where('id', $data->CreatedBy)->first();

            // Validate phân bổ
            if ($data->NextTeam != "YS-QC"  && $data->NextTeam != "CH-QC"  && $data->NextTeam != "HG-QC") {
                $dataallocate = $this->collectdata($data->FatherCode, $data->ItemCode, $data->team, $data->version, $data->LSX);
                $allocates = $this->allocate_v2($dataallocate, $data->Quantity);

                if (count($allocates) == 0) {
                    return response()->json([
                        'error' => false,
                        'status_code' => 506,
                        'message' => "Số lượng ghi nhận vượt số lượng kế hoạch. Vui lòng kiếm tra tổ: " .
                            $data->Team . " sản phẩm: " .
                            $data->ItemCode . ", lệnh sản xuất:" . $data->LSX
                    ], 500);
                }
                if (isset($allocates['error']) && $allocates['error']) {
                    return response()->json([
                        'error' => true,
                        'status_code' => 506,
                        'message' => "Vượt hạn mức. kiểm tra tổ:" . $data->team . " sản phẩm: " .
                            $data->ItemCode . " sản phẩm đích: " .
                            $data->FatherCode . " LSX." . $data->LSX
                    ], 500);
                }
                $string = '';
                $dataReceipt = [];
                foreach ($allocates['allocatedData'] as $allocate) {
                    $string .= $allocate['DocEntry'] . '-' . $allocate['Allocate'] . ';';
                    //data cho receipt
                    $dataReceipt[] = [
                        "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                        "U_UUID" => $request->id,
                        "U_LSX" => $allocate['LSX'],
                        // "U_LSX" => $data->LSX,
                        "U_TO" => $data->team,
                        "U_NGiao" => $U_GIAO->last_name . " " . $U_GIAO->first_name,
                        "U_NNhan" => Auth::user()->last_name . " " . Auth::user()->first_name,
                        "DocumentLines" => [[
                            "Quantity" => (float) $allocate['Allocate'],
                            "TransactionType" => "C",
                            "BaseEntry" => $allocate['DocEntry'],
                            "BaseType" => 202,
                            "CostingCode" => "VCN",
                            "CostingCode4" => "Default",
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
                }
                if ($string == '') {
                    return response()->json([
                        'error' => true,
                        'status_code' => 506,
                        'message' => "Lỗi lấy dữ liệu phiếu xuất:" .
                            $data->Team . " sản phẩm: " .
                            $data->ItemCode . " sản phẩm đích: " .
                            $data->FatherCode . " LSX." . $data->LSX
                    ], 500);
                }
                // $stockissue = $this->collectStockAllocate($string, $request->id);
                $stockissue = null; // yêu cầu không cần gửi stock issue item manual nữa
                $dataSendPayload = [
                    'InventoryGenEntries' => $dataReceipt,
                    'InventoryGenExits' => $stockissue
                ];

                $payload = playloadBatch($dataSendPayload); // Assuming `playloadBatch()` function prepares the payload.
                $client = new Client();
                $response = $client->request('POST', UrlSAPServiceLayer() . '/b1s/v1/$batch', [
                    'verify' => false,
                    'headers' => [
                        'Accept' => '*/*',
                        'Content-Type' => 'multipart/mixed;boundary=batch_36522ad7-fc75-4b56-8c71-56071383e77c_' . $payload['uid'],
                        'Authorization' => 'Basic ' . BasicAuthToken(),
                    ],
                    'body' => $payload['payload'], // Đảm bảo $pl được định dạng đúng cách với boundary
                ]);

                $res = $response->getBody()->getContents();
                if ($response->getStatusCode() == 400) {
                    throw new \Exception('SAP ERROR Incomplete batch request body.');
                }
                if ($response->getStatusCode() == 500) {
                    throw new \Exception('SAP ERROR ' . $response->getBody()->getContents());
                }
                if ($response->getStatusCode() == 401) {
                    throw new \Exception('SAP authen ' . $response->getBody()->getContents());
                }
                if ($response->getStatusCode() == 202) {

                    // Bước 1: kiểm tra phản hồi có chứa phần tử thành công không
                    if (strpos($res, 'ETag') === false) {
                        $this->throwSAPError($res);
                    }
                    // Tách các phần của batch response
                    $parts = preg_split('/--batch.*?\r\n/', $res);
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
                        $this->throwSAPError($res);
                    }

                    // Cấu trúc dữ liệu document_log
                    $documentLog = [
                        'ReceiptFromProduction' => $receiptFromProduction,
                        'timestamp' => now()->toDateTimeString()
                    ];

                    notireceiptVCN::where('id', $request->id)->update([
                        'confirm' => 1,
                        'confirmBy' => Auth::user()->id,
                        'confirm_at' => Carbon::now()->format('YmdHis'),
                        'document_log' => json_encode($documentLog)
                    ]);
                    awaitingstocksvcn::where('notiId', $request->id)->delete();
                    DB::commit();
                } else {
                    $this->throwSAPError($res);
                }
                return response()->json('success', 200);
            } else {
                return response()->json([
                    'error' => true,
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

            return response()->json([
                'error' => true,
                'status_code' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    function cancelDisassemblyOrder(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        try {
            DB::beginTransaction();

            // Find the disassembly order by ID
            $disassemblyOrder = DisassemblyOrder::find($request->id);

            // Check if the disassembly order exists
            if (!$disassemblyOrder) {
                throw new \Exception('Lệnh phân rã không tồn tại.');
            }

            // Check if the disassembly order status is 'new' (assuming 'new' means it has no confirmed notifications)
            $hasConfirmedNotifications = notireceiptVCN::where('disassembly_order_id', $request->id)
                ->where('confirm', '!=', 0) // 0 = pending, 1 = confirmed, 2 = rejected
                ->exists();

            if ($hasConfirmedNotifications) {
                throw new \Exception('Không thể hủy lệnh đã có giao dịch được xác nhận.');
            }

            // Get all notireceiptVCN records associated with this disassembly order
            $notiReceipts = notireceiptVCN::where('disassembly_order_id', $request->id)->get();

            // Delete all chitietrong records associated with these notireceiptVCN records
            $notiReceiptIds = $notiReceipts->pluck('id')->toArray();
            if (!empty($notiReceiptIds)) {
                ChiTietRong::whereIn('baseID', $notiReceiptIds)->delete();
            }

            // Delete all notireceiptVCN records with this disassembly_order_id
            notireceiptVCN::where('disassembly_order_id', $request->id)->delete();

            // Delete the disassembly order
            $disassemblyOrder->delete();

            DB::commit();

            return response()->json([
                'message' => 'Hủy lệnh phân rã thành công.'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => true,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    function closeDisassemblyOrder(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        try {
            DB::beginTransaction();

            // Find the disassembly order by ID
            $disassemblyOrder = DisassemblyOrder::find($request->id);

            // Check if the disassembly order exists
            if (!$disassemblyOrder) {
                throw new \Exception('Lệnh phân rã không tồn tại.');
            }

            // Check if all notireceiptvcn have been confirmed (confirm = 1)
            $hasUnconfirmedNotifications = notireceiptVCN::where('disassembly_order_id', $request->id)
                ->where('confirm', '!=', 1) // 1 = confirmed
                ->exists();

            if ($hasUnconfirmedNotifications) {
                throw new \Exception('Không thể đóng lệnh khi còn giao dịch chưa được xác nhận.');
            }

            // Update the status of the disassembly order to 'closed'
            $disassemblyOrder->status = 'closed';
            $disassemblyOrder->save();

            DB::commit();

            return response()->json([
                'message' => 'Đóng lệnh phân rã thành công.'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => true,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    function adjustRongQuantity(Request $request)
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer',
            'Qty' => 'required|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => implode(' ', $validator->errors()->all())], 422);
        }

        try {
            $notiReceipt = notireceiptVCN::find($request->id);

            if (!$notiReceipt) {
                return response()->json(['error' => 'Không tìm thấy bản ghi notireceiptVCN với id đã cho'], 404);
            }

            if ($notiReceipt->confirm == 3) {

                $notiReceipt->confirm = 0;
                $notiReceipt->save();
            }

            ChiTietRong::where('baseID', $request->id)->update(['Quantity' => $request->Qty]);
            notireceiptVCN::where('id', $request->id)->update(['confirm' => '0']);

            return response()->json([
                'message' => 'Cập nhật số lượng thành công',
                'data' => [
                    'notireceipt_id' => $notiReceipt->id,
                    'updated_quantity' => $request->Qty
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage()
            ], 500);
        }
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

    function checkInventoryVCN(Request $request)
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

    private function getRequiredInventoryVCN($itemCode, $quantity, $factory, $step)
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
                    "CostingCode" => "VCN",
                    "CostingCode4" => "Default",
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
    function AcceptQCVCNV2(Request $request)
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
        $whs = $this->getQCWarehouseByUser('NG');
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
                throw new \Exception('Giao dịch hiện tại có thể đã được xác nhận hoặc bị xóa. Hãy load lại tổ để kiểm tra.');
            }
            $U_GIAO = DB::table('users')->where('id', $data->CreatedBy)->first();
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
            $dataallocate = $this->collectdata($data->FatherCode, $data->ItemCode, $data->team, $data->version, $data->LSX);
            $allocates = $this->allocate_v2($dataallocate, $request->Qty);
            if (isset($allocates['error']) && $allocates['error']) {
                return response()->json([
                    'error' => true,
                    'status_code' => 500,
                    'message' => "Vượt hạn mức. kiểm tra tổ:" . $data->team . " sản phẩm: " .
                        $data->ItemCode . " sản phẩm đích: " .
                        $data->FatherCode . " LSX." . $data->LSX
                ], 500);
            }
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
            $string = '';
            $dataReceipt = [];
            date_default_timezone_set('Asia/Ho_Chi_Minh'); // nếu cần
            $timestamp = date('His');
            foreach ($allocates['allocatedData'] as $allocate) {
                $string .= $allocate['DocEntry'] . '-' . $allocate['Allocate'] . ';';

                $dataReceipt[]  = [
                    "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                    "U_UUID" => $request->id . "_" . $timestamp,
                    "U_LSX" => $data->LSX,
                    "U_TO" => $data->team,
                    "U_LL" => $loailoi,
                    "U_HXL" => $huongxuly,
                    "U_QCC" => $huongxuly,
                    "U_TOCD" => $teamBack,
                    "U_NGiao" => $U_GIAO->last_name . " " . $U_GIAO->first_name,
                    "U_NNhan" => Auth::user()->last_name . " " . Auth::user()->first_name,
                    "U_source" => $rootCause,
                    "U_ItemHC" => $subCode,
                    "U_cmtQC" => $request->Note ?? "",
                    "DocumentLines" => [[
                        "Quantity" => $allocate['Allocate'],
                        "TransactionType" => "R",
                        "BaseEntry" => $allocate['DocEntry'],
                        "BaseType" => 202,
                        "CostingCode" => "VCN",
                        "CostingCode4" => "Default",
                        "WarehouseCode" => $whs,
                        "BatchNumbers" => [
                            [
                                "BatchNumber" => Carbon::now()->format('YmdHis') . $allocate['DocEntry'],
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

                // dd($data->team);

                historySLVCN::create(
                    [
                        'notiId' => $request->id,
                        'HXL' => $huongxuly,
                        'LL' => $loailoi,
                        'itemchild' => $allocate['ItemChild'],
                        'SPDich' => $data->FatherCode,
                        'to' => $data->Team,
                        "source" => $rootCause,
                        "TOChuyenVe" => $teamBack,
                        'quantity' => $allocate['Allocate'],
                        'ObjType' => 202,
                        'DocEntry' => "",
                        'subCode' => $subCode,
                    ]
                );
            }

            if ($string == '') {
                DB::rollBack();
                return response()->json([
                    'error' => false,
                    'status_code' => 500,
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

            $payload = playloadBatch($dataSendPayload); // Assuming `playloadBatch()` function prepares the payload.
            $client = new Client();
            $response = $client->request('POST', UrlSAPServiceLayer() . '/b1s/v1/$batch', [
                'verify' => false,
                'headers' => [
                    'Accept' => '*/*',
                    'Content-Type' => 'multipart/mixed;boundary=batch_36522ad7-fc75-4b56-8c71-56071383e77c_' . $payload['uid'],
                    'Authorization' => 'Basic ' . BasicAuthToken(),
                ],
                'body' => $payload['payload'], // Đảm bảo $pl được định dạng đúng cách với boundary
            ]);
            $res = $response->getBody()->getContents();
            if ($response->getStatusCode() == 400) {
                throw new \Exception('SAP ERROR Incomplete batch request body.');
            }
            if ($response->getStatusCode() == 500) {
                throw new \Exception('SAP ERROR ' . $response->getBody()->getContents());
            }
            if ($response->getStatusCode() == 401) {
                throw new \Exception('SAP authen ' . $response->getBody()->getContents());
            }
            if ($response->getStatusCode() == 202) {
                // Bước 1: kiểm tra phản hồi có chứa phần tử thành công không
                if (strpos($res, 'ETag') === false) {
                    $detail = null;

                    // 1) Tìm và parse phần JSON trong batchresponse
                    if (preg_match_all('/\{(?:[^{}]|(?R))*\}/s', $res, $matches) && !empty($matches[0])) {
                        // Lấy JSON cuối cùng (thường là body lỗi)
                        $json = json_decode(end($matches[0]), true);
                        if (json_last_error() === JSON_ERROR_NONE) {
                            $detail = $json['error']['message']['value']
                                ?? ($json['error']['message'] ?? null);
                        }
                    }

                    // 2) Fallback: nếu chưa bắt được JSON, trích trực tiếp trường "value"
                    if (!$detail && preg_match('/"value"\s*:\s*"([^"]+)"/s', $res, $m)) {
                        // Dùng json_decode để giải mã \uXXXX thành UTF-8
                        $detail = json_decode('"' . $m[1] . '"');
                    }

                    $msg = 'Đã xảy ra lỗi trong quá trình tạo chứng từ.';
                    if (!empty($detail)) {
                        $msg .= ' Chi tiết: ' . $detail;
                    }

                    return response()->json([
                        'error'    => $msg,
                        'response' => $res, // giữ raw để tiện debug nếu cần
                    ], 500);
                }
                // Tách các phần của batch response
                $parts = preg_split('/--batch.*?\r\n/', $res);

                $goodsReceipt = null;
                $goodsIssues = null;

                // Lặp qua các phần của phản hồi để trích xuất thông tin
                foreach ($parts as $part) {
                    if (strpos($part, 'InventoryGenEntries') !== false) {
                        // Trích xuất thông tin phiếu nhập
                        preg_match('/"DocEntry"\s*:\s*(\d+)/', $part, $entryMatches);
                        preg_match('/"DocNum"\s*:\s*(\d+)/', $part, $numMatches);
                        if (!empty($entryMatches[1]) && !empty($numMatches[1])) {
                            $goodsReceipt = [
                                'DocEntry' => $entryMatches[1],
                                'DocNum' => $numMatches[1]
                            ];
                        }
                    } elseif (strpos($part, 'InventoryGenExits') !== false) {
                        // Trích xuất thông tin phiếu xuất
                        preg_match('/"DocEntry"\s*:\s*(\d+)/', $part, $entryMatches);
                        preg_match('/"DocNum"\s*:\s*(\d+)/', $part, $numMatches);
                        if (!empty($entryMatches[1]) && !empty($numMatches[1])) {
                            $goodsIssues[] = [
                                'DocEntry' => $entryMatches[1],
                                'DocNum' => $numMatches[1]
                            ];
                        }
                    }
                }

                // Kiểm tra xem có thông tin phiếu nhập không
                if (empty($goodsReceipt)) {
                    throw new \Exception("Không thể trích xuất thông tin phiếu nhập từ phản hồi SAP. Response: " . json_encode($res));
                }

                // Cấu trúc dữ liệu document_log
                $documentLog = [
                    'Goods_Receipt' => $goodsReceipt,
                    'Goods_Issue' => $goodsIssues,
                    'timestamp' => now()->toDateTimeString()
                ];

                awaitingstocksvcn::where('notiId', $request->id)->delete();
                notireceiptVCN::where('id', $request->id)->update([
                    'confirm' => 1,
                    'confirmBy' => Auth::user()->id,
                    'confirm_at' => Carbon::now()->format('YmdHis'),
                    'openQty' => $data->openQty - $request->Qty,
                    'document_log' => json_encode($documentLog),
                    'isQCConfirmed' => 1,
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
            } else {
                preg_match('/\{.*\}/s', $res, $matches);
                if (isset($matches[0])) {
                    $jsonString = $matches[0];
                    $errorData = json_decode($jsonString, true);
                    if (isset($errorData['error'])) {
                        $errorCode = $errorData['error']['code'];
                        $errorMessage = $errorData['error']['message']['value'];
                        throw new \Exception('SAP code:' . $errorCode . ' chi tiết' . $errorMessage);
                    }
                }
            }
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
    function allocate_v2($data, $totalQty)
    {
        $nev = 0; // Khởi tạo nev
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
    // Rong
    /* cần ghi nhận cả số lượng receipt và issue cùng lúc
    */
    function receiptRongv2(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'LSX' => 'required|string|max:254',
            'QtyIssue',
            'CongDoan' => 'required|string|max:254',
            'version' => 'required|string|max:254',
            'ProdType' => 'required|string|max:254',
            'SubItemCode' => 'required|string|max:254',
            'SubItemName' => 'required|string|max:254',
            'NextTeam' => 'required|string|max:254',
            'team' => 'required|string|max:254',
            'Data.*.ItemCode' => 'required|string|max:254',
            'Data.*.ItemName' => 'required|string|max:254',
            'Data.*' => [new AtLeastOneQty()],
            'Data.*.CDay' => 'required|numeric',
            'Data.*.CRong' => 'required|numeric',
            'Data.*.CDai' => 'required|numeric',
        ]);

        // Check if validation fails
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }
        $toqc = "";
        if (Auth::user()->plant == 'TH') {
            $toqc = 'TH-QC';
        } else if (Auth::user()->plant == 'YS') {
            $toqc = 'YS1-QC';
        } else {
            $toqc = 'HG-QC';
        }
        try {
            DB::beginTransaction();

            $newOrder = DisassemblyOrder::create([
                'SubItemCode' => $request->SubItemCode,
                'team' => $request->team,
                'Qty' => $request->QtyIssue,
                'status' => "new",
                'CreatedBy' => Auth::user()->id,
                'created_at' => Carbon::now(),
            ]);

            // data header
            foreach ($request->Data as $dt) {
                if ($dt['CompleQty'] > 0) {
                    $notidata = notireceiptVCN::create([
                        'LSX' => $request->LSX,
                        'text' => 'Production information waiting for confirmation',
                        'ItemCode' => $dt['ItemCode'],
                        'ItemName' => $dt['ItemName'],
                        'MaThiTruong' => $request->MaThiTruong ?? null,
                        'FatherCode' => $request->SubItemCode,
                        'SubItemCode' => $request->SubItemCode,
                        'SubItemName' => $request->SubItemName,
                        'team' => $request->team,
                        'NextTeam' => $request->NextTeam,
                        'CongDoan' => $request->CongDoan,
                        'type' => 0,
                        'openQty' => 0,
                        'ProdType' => $request->ProdType,
                        'version' => $request->version,
                        'isRONG' => true,
                        'QtyIssueRong' => $request->QtyIssue,
                        'CreatedBy' => Auth::user()->id,
                        'disassembly_order_id' => $newOrder->id,
                        'QuyCach' => $dt['CDay'] . "*" . $dt['CRong'] . "*" . $dt['CDai'],
                        'Quantity' => $dt['CompleQty'],
                    ]);
                    ChiTietRong::create([
                        'baseID' => $notidata->id,
                        'ItemCode' => $dt['ItemCode'],
                        'ItemName' => $dt['ItemName'],
                        'type' => 0,
                        'openQty' => 0,
                        'Quantity' => $dt['CompleQty'],
                        'QuyCach' => $dt['CDay'] . "*" . $dt['CRong'] . "*" . $dt['CDai'],
                        'Team' => $request->Team,
                        'NextTeam' => $request->NextTeam,
                        'CDay' => $dt['CDay'],
                        'CRong' => $dt['CRong'],
                        'CDai' => $dt['CDai']
                    ]);
                }
                if ($dt['RejectQty'] > 0) {
                    $noti = notireceiptVCN::create([
                        'LSX' => $request->LSX,
                        'text' => 'Error information sent to QC',
                        'MaThiTruong' => $request->MaThiTruong ?? null,
                        'FatherCode' => $request->SubItemCode,
                        'ItemCode' => $dt['ItemCode'],
                        'ItemName' => $dt['ItemName'],
                        'team' => $request->team,
                        'Quantity' => $dt['RejectQty'],
                        'NextTeam' => $request->NextTeam,
                        'CongDoan' => $request->CongDoan,
                        'type' => 1,
                        'openQty' => 0,
                        'ProdType' => $request->ProdType,
                        'version' => $request->version,
                        'isRONG' => true,
                        'QtyIssueRong' => $request->QtyIssue,
                        'CreatedBy' => Auth::user()->id,
                        'QuyCach' => $dt['CDay'] . "*" . $dt['CRong'] . "*" . $dt['CDai'],
                        'disassembly_order_id' => $newOrder->id,
                    ]);
                }
            }

            DB::commit();
        } catch (\Exception | QueryException $e) {
            DB::rollBack();
            return response()->json(['message' => 'ghi nhận sản lượng không thành công', 'error' => $e->getMessage()], 500);
        }
        return response()->json([
            'message' => 'Successful',
        ], 200);
    }

    function AcceiptRongv2(Request $request)
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
                throw new \Exception('Giao dịch hiện tại có thể đã được xác nhận hoặc bị xóa. Hãy load lại tổ để kiểm tra.');
            }
            if ($data->NextTeam != "TH-QC"  && $data->NextTeam != "TQ-QC"  && $data->NextTeam != "HG-QC") {
            } else {
                return response()->json([
                    'error' => false,
                    'status_code' => 500,
                    'message' => "Tổ không hợp lệ."
                ], 500);
            }

            $stockissue = null;
            $dataReceipt = chiTietRong::where('baseID', $request->id)->where('type', 0)->get();

            
            $allocates = [];
            foreach ($dataReceipt as $dtreceipt) {
                $dataallocate = $this->collectdatadetailrong($data->FatherCode, $dtreceipt->ItemCode, $data->team, $data->version, $data->LSX);
                $newAllocates = $this->allocatedIssueRong($dataallocate, $dtreceipt->Quantity);
                if (count($newAllocates) == 0) {
                    return response()->json([
                        'error' => false,
                        'status_code' => 500,
                        'message' => "Không có sản phẩm còn lại để phân bổ. kiểm tra tổ:" .
                            $data->team . " sản phẩm: " .
                            $data->ItemCode . " sản phẩm đích: " .
                            $data->FatherCode . " LSX." . $data->LSX
                    ], 500);
                }
                // Merge allocations with the same DocEntry directly
                foreach ($newAllocates as $allocate) {
                    $docEntry = $allocate['DocEntry'];
                    $itemCode = $allocate['ItemCode'];
                    $quantity = $allocate['Allocated'];
                    if (isset($allocates[$docEntry])) {
                        // Append the item to DocumentLines if DocEntry exists
                        $allocates[$docEntry]['DocumentLines'][] = [
                            "Qty" => $quantity,
                            "BaseEntry" => $docEntry,
                            'BaseLine' => $allocate['LineNum'],
                            "BaseType" => 202,
                            "Quantity" => $quantity,
                            "CostingCode" => "VCN",
                            "CostingCode4" => "Default",
                            "BatchNumbers" => [[
                                "ItemCode" => $itemCode,
                                "BatchNumber" => Carbon::now()->format('YmdHis') . $docEntry,
                                "Quantity" => $quantity,
                            ]],
                        ];
                    } else {
                        // Otherwise, create a new entry for this DocEntry with DocumentLines
                        $allocates[$docEntry] = [
                            "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                            "U_UUID" => $request->id,
                            // "DocEntry" => $docEntry,
                            // "SPDICH" => $allocate['SPDICH'],
                            // "Version" => $allocate['Version'],
                            "U_TO" => $data->team,
                            "DocumentLines" => [

                                [
                                    "BaseEntry" => $docEntry,
                                    "BaseType" => 202,
                                    'BaseLine' => $allocate['LineNum'],
                                    "Quantity" => $quantity,
                                    "Qty" => $quantity,
                                    "BatchNumbers" => [[
                                        "ItemCode" => $itemCode,
                                        "BatchNumber" => Carbon::now()->format('YmdHis') . $docEntry,
                                        "Quantity" => $quantity,
                                    ]],
                                ]
                            ]
                        ];
                    }
                }
            }

            // Convert the merged array back to the desired format
            $result = array_values($allocates);
            $dataSendPayload = [
                'InventoryGenEntries' => $result,
                'InventoryGenExits' => $stockissue
            ];
            $payload = playloadBatch($dataSendPayload); // Assuming `playloadBatch()` function prepares the payload.
            $client = new Client();
            $response = $client->request('POST', UrlSAPServiceLayer() . '/b1s/v1/$batch', [
                'verify' => false,
                'headers' => [
                    'Accept' => '*/*',
                    'Content-Type' => 'multipart/mixed;boundary=batch_36522ad7-fc75-4b56-8c71-56071383e77c_' . $payload['uid'],
                    'Authorization' => 'Basic ' . BasicAuthToken(),
                ],
                'body' => $payload['payload'], // Đảm bảo $pl được định dạng đúng cách với boundary
            ]);
            if ($response->getStatusCode() == 400) {
                throw new \Exception('SAP ERROR Incomplete batch request body.');
            }
            if ($response->getStatusCode() == 500) {
                throw new \Exception('SAP ERROR ' . $response->getBody()->getContents());
            }
            if ($response->getStatusCode() == 401) {
                throw new \Exception('SAP authen ' . $response->getBody()->getContents());
            }
            if ($response->getStatusCode() == 202) {
                $res = $response->getBody()->getContents();
                // kiểm tra sussess hay faild hơi quăng nha
                if (strpos($res, 'ETag') !== false) {

                    notireceiptVCN::where('id', $request->id)->update([
                        'confirm' => 1,
                        'confirmBy' => Auth::user()->id,
                        'confirm_at' => Carbon::now()->format('YmdHis')
                    ]);
                    DB::commit();
                } else {
                    preg_match('/\{.*\}/s', $res, $matches);
                    if (isset($matches[0])) {
                        $jsonString = $matches[0];
                        $errorData = json_decode($jsonString, true);

                        if (isset($errorData['error'])) {
                            $errorCode = $errorData['error']['code'];
                            $errorMessage = $errorData['error']['message']['value'];
                            throw new \Exception('SAP code:' . $errorCode . ' chi tiết' . $errorMessage);
                        }
                    }
                }
            }
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
    function AcceiptQCRongv2(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'Qty' => 'required',
            'ItemCode' => 'required',
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
        $whs = $this->getQCWarehouseByUser('NG');
        if ($whs == -1) {
            return response()->json([
                'error' => false,
                'status_code' => 500,
                'message' => "Không tìm thấy kho QC do user chưa được chỉ định nhà máy hoặc Hệ thống SAP chưa được cấu hình UserId: " . Auth::user()->id
            ], 500);
        }

        try {
            $data = notireceiptVCN::where('id', $request->id)->where('deleted', '=', 0)->where('type', '=', -1)->first();
            if (!$data) {
                throw new \Exception('data không hợp lệ.');
            }
            // check xem item đó số lượng qty có lớn hơn số lượng openQty không và openQty >0
            $ctrong = ChiTietRong::where('baseID', $request->id)->where('type', '=', 1)
                ->where('openQty', '>=', $request->Qty)->first();

            if (!$ctrong) {
                throw new \Exception('Giao dịch hiện tại có thể đã được xác nhận hoặc bị xóa. Hãy load lại tổ để kiểm tra.');
            }
            $U_GIAO = DB::table('users')->where('id', $data->CreatedBy)->first();
            $stockissue = null;
            // kiểm tra xem lệnh này có ghi nhận sản lượng không nếu không thì tạo issue đồng thời check xem đã issue chưa. tài vì chỉ issue 1 lần.
            $receipt = ChiTietRong::where('baseID', $request->id)->where('type', '=', 0)->get();
            if ($receipt->count() == 0) {
                if ($data->isQCConfirmed == 0) {
                    $dataissueRong = $this->collecteEntryIssueRong($data->FatherCode, $data->team, $data->version);
                    $dataAllocateIssue = $this->allocatedIssueRong($dataissueRong, $data->QtyIssueRong);
                    if (count($dataAllocateIssue) == 0) {
                        return response()->json([
                            'error' => false,
                            'status_code' => 500,
                            'message' => "Không có sản phẩm còn lại để phân bổ. kiểm tra tổ:" .
                                $data->team . " sản phẩm: " .
                                $data->ItemCode . " sản phẩm đích: " .
                                $data->FatherCode . " LSX." . $data->LSX
                        ], 500);
                    }
                    $string = '';
                    foreach ($dataAllocateIssue as $allocate) {
                        $string .= $allocate['DocEntry'] . '-' . $allocate['Allocated'] . ';';
                    }
                    //                    $stockissue = $this->collectStockAllocate($string, $request->id);
                    $stockissue = null; // yêu cầu không cần gửi stock issue item manual nữa
                };
            }
            // if( )
            $dataallocate = $this->collectdatadetailrong($data->FatherCode, $ctrong->ItemCode, $data->team, $data->version, $data->LSX);

            if (count($dataallocate) == 0) {
                return response()->json([
                    'error' => false,
                    'status_code' => 500,
                    'message' => "Không có sản phẩm còn lại để phân bổ. kiểm tra tổ:" .
                        $data->team . " sản phẩm: " .
                        $ctrong->ItemCode . " sản phẩm đích: " .
                        $data->FatherCode . " LSX." . $data->LSX
                ], 500);
            }

            $newAllocates = $this->allocatedIssueRong($dataallocate, $request->Qty);
            if (count($newAllocates) == 0) {
                return response()->json([
                    'error' => false,
                    'status_code' => 500,
                    'message' => "Không có sản phẩm còn lại để phân bổ. kiểm tra tổ:" .
                        $data->team . " sản phẩm: " .
                        $ctrong->ItemCode . " sản phẩm đích: " .
                        $data->FatherCode . " LSX." . $data->LSX
                ], 500);
            }
            foreach ($newAllocates as $allocate) {
                $dataReceipt[]  = [
                    "BPL_IDAssignedToInvoice" => Auth::user()->branch,
                    "U_UUID" => $request->id,
                    "U_LSX" => $data->LSX,
                    "U_TO" => $data->team,
                    "U_LL" => $loailoi,
                    "U_HXL" => $huongxuly,
                    "U_QCC" => $huongxuly,
                    "U_TOCD" => $teamBack,
                    "U_NGiao" => $U_GIAO->last_name . " " . $U_GIAO->first_name,
                    "U_NNhan" => Auth::user()->last_name . " " . Auth::user()->first_name,
                    "U_source" => $rootCause,
                    "U_ItemHC" => $subCode,
                    "U_cmtQC" => $request->Note ?? "",
                    "DocumentLines" => [[
                        "Quantity" => $allocate['Allocated'],
                        "TransactionType" => "R",
                        "BaseEntry" => $allocate['DocEntry'],
                        "BaseType" => 202,
                        "CostingCode" => "VCN",
                        "CostingCode4" => "Default",
                        "WarehouseCode" => $whs,
                        "BatchNumbers" => [
                            [
                                "BatchNumber" => Carbon::now()->format('YmdHis') . $allocate['DocEntry'],
                                "Quantity" => $allocate['Allocated'],
                                "ItemCode" =>  $allocate['ItemCode'],
                                // "U_CDai" => $allocate['CDai'],
                                // "U_CRong" => $allocate['CRong'],
                                // "U_CDay" => $allocate['CDay'],
                                "U_Status" => "HL",
                                "U_Year" => $request->year ?? now()->format('y'),
                                "U_Week" => $request->week ? str_pad($request->week, 2, '0', STR_PAD_LEFT) : str_pad(now()->weekOfYear, 2, '0', STR_PAD_LEFT)
                            ]
                        ]
                    ]]
                ];

                historySLVCN::create(
                    [
                        // 'LSX' => $data->LSX,
                        'itemchild' => $allocate['ItemCode'],
                        'SPDich' => $data->FatherCode,
                        'to' => $data->Team,
                        "source" => $rootCause,
                        "TOChuyenVe" => $teamBack,
                        'quantity' => $allocate['Allocated'],
                        'ObjType' => 202,
                        'DocEntry' => ""
                    ]
                );
            }
            $dataSendPayload = [
                'InventoryGenEntries' => $dataReceipt,
                'InventoryGenExits' => $stockissue
            ];

            $payload = playloadBatch($dataSendPayload); // Assuming `playloadBatch()` function prepares the payload.
            $client = new Client();
            $response = $client->request('POST', UrlSAPServiceLayer() . '/b1s/v1/$batch', [
                'verify' => false,
                'headers' => [
                    'Accept' => '*/*',
                    'Content-Type' => 'multipart/mixed;boundary=batch_36522ad7-fc75-4b56-8c71-56071383e77c_' . $payload['uid'],
                    'Authorization' => 'Basic ' . BasicAuthToken(),
                ],
                'body' => $payload['payload'], // Đảm bảo $pl được định dạng đúng cách với boundary
            ]);
            if ($response->getStatusCode() == 400) {
                throw new \Exception('SAP ERROR Incomplete batch request body.');
            }
            if ($response->getStatusCode() == 500) {
                throw new \Exception('SAP ERROR ' . $response->getBody()->getContents());
            }
            if ($response->getStatusCode() == 401) {
                throw new \Exception('SAP authen ' . $response->getBody()->getContents());
            }
            if ($response->getStatusCode() == 202) {
                $res = $response->getBody()->getContents();
                // kiểm tra sussess hay faild hơi quăng nha
                if (strpos($res, 'ETag') !== false) {
                    notireceiptVCN::where('id', $request->id)->update([
                        'confirm' => 1,
                        'confirmBy' => Auth::user()->id,
                        'isQCConfirmed' => 1,
                    ]);
                    ChiTietRong::where('baseID', $request->id)->where('ItemCode', $request->ItemCode)->where('type', 1)->update([
                        'openQty' => $ctrong->openQty - $request->Qty
                    ]);
                    DB::commit();
                } else {
                    preg_match('/\{.*\}/s', $res, $matches);
                    if (isset($matches[0])) {
                        $jsonString = $matches[0];
                        $errorData = json_decode($jsonString, true);
                        if (isset($errorData['error'])) {
                            $errorCode = $errorData['error']['code'];
                            $errorMessage = $errorData['error']['message']['value'];
                            throw new \Exception('SAP code:' . $errorCode . ' chi tiết' . $errorMessage);
                        }
                    }
                }
            }
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
    // xử lý lấy lệnh rong cần issu và allocate
    function allocatedIssueRong($data, $totalQty)
    {
        $lastIndex = count($data) - 1;
        foreach ($data as $index => &$item) {
            if ($index == $lastIndex) {
                // Phần tử cuối cùng, phân bổ toàn bộ số lượng còn lại
                $item['Allocated'] = $totalQty;
                $totalQty = 0; // Reset totalQty về 0 sau khi phân bổ
            } else {
                // Sử dụng isset() thay vì so sánh với phần tử đầu tiên trong mảng
                if (isset($item['Qty']) && $item['Qty'] <= $totalQty) {
                    $item['Allocated'] = $item['Qty'];
                    $totalQty -= $item['Qty'];
                } else {
                    // Chỉ cập nhật giá trị nếu Qty lớn hơn 0
                    if ($item['Qty'] > 0) {
                        $item['Allocated'] = min($item['Qty'], $totalQty);
                        $totalQty -= $item['Allocated'];
                    } else {
                        $item['Allocated'] = 0;
                    }
                }
            }
        }

        // Sử dụng array_filter với callback ngắn gọn hơn
        $filteredData = array_filter($data, fn($item) => $item['Allocated'] != 0);

        return array_values($filteredData);
    }
    function collecteEntryIssueRong($item, $to, $version)
    {
        $conDB = (new ConnectController)->connect_sap();
        $query = 'call usp_webOpenProductionOrder (?,?,?)';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$item, $to, $version])) {
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
    function collectdatadetailrong($spdich, $item, $to, $version, $lsx)
    {

        $conDB = (new ConnectController)->connect_sap();
        $query = 'call "usp_web_detailrong" (?,?,?,?,?)';
        $stmt = odbc_prepare($conDB, $query);
        if (!$stmt) {
            throw new \Exception('Error preparing SQL statement: ' . odbc_errormsg($conDB));
        }
        if (!odbc_execute($stmt, [$spdich, $item, $to, $version, $lsx])) {
            throw new \Exception('Error executing SQL statement: ' . odbc_errormsg($conDB));
        }
        $results = array();

        while ($row = odbc_fetch_array($stmt)) {
            $results[] = $row;
        };
        odbc_close($conDB);
        return  $results;
    }
    /*
    **********
     END Version 2 VCN
    *********
    */

    public function xem_ket_cau($lsx, VKetCauVcnService $ketCauVcnService)
    {
        if (!$lsx) {
            return response()->json([
                'message' => "Không có lệnh sản xuất"
            ], 500);
        }

        $result = $ketCauVcnService->getStructureByLSX($lsx);

        return response()->json([
            'data_ket_cau' => $result,
        ], 200);
    }

    public function xem_vat_tu(string $lsx, VatTuVCNService $vatTuVCNService)
    {
        if (!$lsx) {
            return response()->json([
                'message' => "Không có lệnh sản xuất"
            ], 500);
        }

        $result = $vatTuVCNService->getMaterialByLSX($lsx);

        return response()->json([
            'data_vat_tu' => $result,
        ], 200);
    }
}
