<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <style>
        #pdf-content {
            background: "#ffffff"
        }

        .bb-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-top: 10px;
        }

        .bb-table th,
        .bb-table td {
            border: 0.7pt solid #8a9bb1;
        }

        .bb-table th {
            font-weight: bold;
            text-align: center;
            padding: 5px 2px;
        }

        .bb-table td {
            padding: 4px 2px;
        }

        #header-table td,
        th {
            padding: 4px 6px;
            line-height: 1.2;
        }

        #header-table td p,
        th p {
            margin: 0;
        }

        #header-table thead td,
        thead th {
            padding-top: 4px;
            padding-bottom: 4px;
        }
    </style>
</head>

<body>

    <div id='pdf-content'>
        <div style="width: 100%;">
            <table style="width:100%; border:2px solid #9ca3af; border-collapse:collapse;" id="header-table">
                <thead style="font-weight:bold;">
                    <tr>
                        <th rowspan="2" colspan="1" style="
                            width: 160px;
                            border-right:1px solid #9ca3af;
                            border-bottom:1px solid #9ca3af;
                            background:#e5e7eb;
                            text-align:center;
                            vertical-align:middle;">
                            <img src="{{public_path('images/WLorigin.svg')}}" alt="logo"
                                style="width:96px; height:auto; object-fit: contain; margin: 0 auto" />
                        </th>
                        <td rowspan="1" colspan="7" style="
                            border-bottom:1px solid #9ca3af;
                            background:#e5e7eb;
                            text-align:center;
                            font-weight:bold;
                            font-size:12px;
                            padding: 0px 0px;
                        ">
                            QUY TRÌNH KIỂM SOÁT SẢN PHẨM KHÔNG PHÙ HỢP
                        </td>
                        <td colspan="1" rowspan="2" style="
                            width:280px;
                            border-left:1px solid #9ca3af;
                            border-bottom:1px solid #9ca3af;
                            background:#e5e7eb;
                            text-align:left;
                            font-size:12px;
                            vertical-align:top;
                            font-weight:bold;
                            padding: 0px 20px;
                        ">
                            <div style="font-size:12px; line-height:1.3;">
                                <div>QT-05/BM-02</div>
                                <div>Ngày ban hành: 10/09/2018</div>
                                <div>Lần ban hành: 05</div>
                                <div>Trang: 1/1</div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td rowspan="1" colspan="7" style="
                            border-bottom:1px solid #9ca3af;
                            background:#e5e7eb;
                            text-align:center;
                            font-weight:bold;
                            font-size:12px;
                        ">
                            BIÊN BẢN XỬ LÝ SẢN PHẨM KHÔNG PHÙ HỢP
                        </td>
                    </tr>
                </thead>
            </table>
            <table width="100%" cellspacing="0" cellpadding="0" style="margin-top: 10px; font-size: 12px">
                <tr>
                    <td width="50%">
                        {{ $ngayTao }}
                    </td>

                    <td width="50%" style="text-align: right">
                        MÃ BIÊN BẢN: {{ $maBienBan }}
                    </td>
                </tr>
                <tr>
                    <td width="50%">
                        <div>Người tạo: {{ $result->last_name }} {{ $result->first_name }}</div>
                    </td>

                    <td width="50%">

                    </td>
                </tr>
            </table>
            <div style="margin-top: 15px">
                <table class="bb-table">
                    <thead>
                        <tr>
                            <th>CĐ báo lỗi</th>
                            <th>Nguồn lỗi</th>
                            <th>Sản phẩm</th>
                            <th>Loại lỗi</th>
                            <th>Lệnh SX</th>
                            <th>ĐVT</th>
                            <th>SL (T)</th>
                            <th>Diễn giải</th>
                            <th>Cách xử lý</th>
                            <th>CĐ xử lý</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($data as $item)
                        <tr>
                            <td style="width: 80px">{{$item->NoiBaoLoi}}</td>
                            <td style="width: 120px">{{$item->LoiNhaMay}}</td>
                            <td style="width: 180px">{{$item->ItemName}}</td>
                            <td style="width: 80px">{{$item->LoiLoai}}</td>
                            <td style="width: 100px">{{$item->LSX}}</td>
                            <td style="width: 40px;text-align: center">{{$item->DVT}}</td>
                            <td style="width: 40px;text-align: center">{{$item->Quantity}}</td>
                            <td style="width: 120px">{{$item->note ?? ''}}</td>
                            <td style="">{{$item->HXL}}</td>
                            <td style="width: 75px">{{$item->ToChuyenVe}}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div id="signature-qc">
                <table width="100%" style="margin-top:10px; font-size:10px; border-collapse:collapse;">
                    <tr>
                        <td  style="text-align:left;">
                            <div >
                                <div>
                                    <div>{{$ngayTao}}</div>
                                </div>
                                <div style="margin-left: 50px">
                                    <div>Giám đốc sản xuất</div>
                                </div>
                                <div style="margin-top: 10px; margin-left: 55px">
                                    <img style="margin: 5px auto" width="80" src="{{public_path($imageGD)}}"
                                        alt="{{$imageGD}}" crossOrigin="anonymous" />
                                </div>
                                <div style="margin-left: 50px">
                                    <div>{{$fullnameGD}}</div>
                                </div>
                            </div>
                        </td>
                        <td style="text-align:right;">
                            <div>
                                <div>
                                    <div>{{$ngayTao}}</div>
                                </div>
                                <div style="margin-right: 50px">
                                    <div>Trưởng bộ phận QC</div>
                                </div>
                                <div style="margin-top: 10px; margin-right: 50px">
                                    <img style="margin: 5px auto" width="80" src="{{public_path($imageQC)}}"
                                        alt="{{$imageQC}}" crossOrigin="anonymous" />
                                </div>
                                <div style="margin-right: 45px">
                                    <div>{{$fullnameQC}}</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>


            </div>
        </div>
    </div>
</body>

</html>