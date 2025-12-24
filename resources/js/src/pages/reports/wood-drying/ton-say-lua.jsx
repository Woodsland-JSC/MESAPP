import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
} from "react";
import Layout from "../../../layouts/layout";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IoSearch, IoClose } from "react-icons/io5";
import { PiFilePdfBold } from "react-icons/pi";
import { FiCheck } from "react-icons/fi";
import "../../../assets/styles/index.css";
import {
    FaArrowRotateLeft,
    FaArrowUpRightFromSquare,
    FaCheck,
} from "react-icons/fa6";
import { IoMdRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../../assets/styles/datepicker.css";
import { format, startOfDay, endOfDay } from "date-fns";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import toast from "react-hot-toast";
import reportApi from "../../../api/reportApi";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
// import "ag-grid-charts-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import useAppContext from "../../../store/AppContext";
import { th } from "date-fns/locale";
import { getFirstDayOfCurrentMonth } from "../../../utils/date.utils";

import { bao_cao_ton_say_lua } from "../../../api/ReportSAPApi";

function BaoCaoTonSayLua() {
    const navigate = useNavigate();

    const { user } = useAppContext();
    const gridRef = useRef();

    const [toDate, setToDate] = useState(new Date());

    // Loading States
    const [isDataReportLoading, setIsDataReportLoading] = useState(false);
    const [selectedTeams, setSelectedTeams] = useState([]);

    const [selectedFactory, setSelectedFactory] = useState(null);
    const [isReceived, setIsReceived] = useState(true);

    const [reportData, setReportData] = useState(null);

    const getReportData = useCallback(async () => {
        setIsDataReportLoading(true);
        try {
            const res = await bao_cao_ton_say_lua(
                { to_date: format(toDate, "yyyy-MM-dd") }
            );

            let reportData = res.report_data ?? [];
            let pallets = res.pallets;

            let uniqueItemCodeData = [];

            let total = 0;

            Object.keys(pallets).forEach(key => {
                let pallet = pallets[key];

                let obj = {
                    itemCode: pallet.ItemCode,
                    itemName: "",
                    quyCach: pallet.QuyCach,
                    day: 0,
                    rong: 0,
                    dai: 0,
                    factory: pallet.Factory,
                    tonKho_TH: 0,
                    chosay_TH: 0,
                    tronglo_chuasay_TH: 0,
                    tronglo_TH: 0,
                    tonKhoSS_TH: 0,
                    tonKho_YS: 0,
                    chosay_YS: 0,
                    tronglo_chuasay_YS: 0,
                    tronglo_YS: 0,
                    tonKhoSS_YS: 0,
                    tonKho_TB: 0,
                    chosay_TB: 0,
                    tronglo_chuasay_TB: 0,
                    tronglo_TB: 0,
                    tonKhoSS_TB: 0,
                }

                if (pallet.Factory == 'YS') {
                    total += pallet.KL_Chua_Say;
                }

                if (pallet && pallet['Factory'] == 'TH') {
                    obj.chosay_TH = Number(pallet['KL_Chua_Say'] || 0);
                    obj.tronglo_chuasay_TH = Number(pallet['KL_Trong_Lo_Chua_Say'] || 0);
                    obj.tronglo_TH = Number(pallet['KL_Dang_Say'] || 0);
                }

                if (pallet && pallet['Factory'] == 'TB') {
                    obj.chosay_TB = Number(pallet['KL_Chua_Say'] || 0);
                    obj.tronglo_chuasay_TB = Number(pallet['KL_Trong_Lo_Chua_Say'] || 0);
                    obj.tronglo_TB = Number(pallet['KL_Dang_Say'] || 0);
                }

                if (pallet && pallet['Factory'] == 'YS') {
                    obj.chosay_YS = Number(pallet['KL_Chua_Say'] || 0);
                    obj.tronglo_chuasay_YS = Number(pallet['KL_Trong_Lo_Chua_Say'] || 0);
                    obj.tronglo_YS = Number(pallet['KL_Dang_Say'] || 0);
                }



                let itemFind = uniqueItemCodeData.find(i => i.itemCode === pallet.ItemCode && i.quyCach == pallet.QuyCach);

                if (!itemFind) {
                    uniqueItemCodeData.push(obj);
                } else {
                    itemFind.chosay_TH += obj.chosay_TH;
                    itemFind.tronglo_chuasay_TH += obj.tronglo_chuasay_TH;
                    itemFind.tronglo_TH += obj.tronglo_TH;

                    itemFind.chosay_TB += obj.chosay_TB;
                    itemFind.tronglo_chuasay_TB += obj.tronglo_chuasay_TB;
                    itemFind.tronglo_TB += obj.tronglo_TB;

                    itemFind.chosay_YS += obj.chosay_YS;
                    itemFind.tronglo_chuasay_YS += obj.tronglo_chuasay_YS;
                    itemFind.tronglo_YS += obj.tronglo_YS;
                }
            })

            let formattedData = [];

            uniqueItemCodeData.forEach((item, index) => {
                let cday = item.quyCach.split('x')[0];
                let crong = item.quyCach.split('x')[1];
                let cdai = item.quyCach.split('x')[2];

                let itemCode = item.itemCode;

                let itemWithItemCode = reportData.filter(i => i.ItemCode === itemCode && Number(i.U_CDay) == Number(cday) && Number(i.U_CRong) == Number(crong) && Number(i.U_CDai) == Number(cdai));

                itemWithItemCode.forEach(data => {
                    item.itemName = data.ItemName;
                    if (data.factory == 'TH') {
                        item.tonKho_TH += Number(data.EB || 0);
                        item.tonKhoSS_TH += Number(data.EB_SS || 0);
                    }

                    if (data.factory == 'TB') {
                        item.tonKho_TB += Number(data.EB || 0);
                        item.tonKhoSS_TB += Number(data.EB_SS || 0);
                    }

                    if (data.factory == 'YS') {
                        item.tonKho_YS += Number(data.EB || 0);
                        item.tonKhoSS_YS += Number(data.EB_SS || 0);
                    }

                    data.used = 1;
                });

                item.day = Number(cday);
                item.rong = Number(crong);
                item.dai = Number(cdai);
                item.itemName = itemWithItemCode.length > 0 ? itemWithItemCode[0].ItemName : '';

                formattedData.push(item);
            });

            let notExistData = reportData.filter(item => !item.used && item.EB != 0);
            let notExistDataSS = reportData.filter(item => !item.used && item.EB_SS != 0);

            notExistData.forEach(item => {
                let find = uniqueItemCodeData.find(i => i.ItemCode == item.itemCode && Number(i.U_CDay) == Number(item.day) && Number(i.U_CRong) == Number(item.rong) && Number(i.U_CDai) == Number(item.dai));

                if (!find) {
                    let obj = {
                        itemCode: item.ItemCode,
                        itemName: item.ItemName,
                        quyCach: Number(item.U_CDay) + "x" + Number(item.U_CRong) + "x" + Number(item.U_CDai),
                        day: Number(item.U_CDay),
                        rong: Number(item.U_CRong),
                        dai: Number(item.U_CDai),
                        factory: item.factory,
                        tonKho_TH: 0,
                        chosay_TH: 0,
                        tronglo_chuasay_TH: 0,
                        tronglo_TH: 0,
                        tonKhoSS_TH: 0,
                        tonKho_YS: 0,
                        chosay_YS: 0,
                        tronglo_chuasay_YS: 0,
                        tronglo_YS: 0,
                        tonKhoSS_YS: 0,
                        tonKho_TB: 0,
                        chosay_TB: 0,
                        tronglo_chuasay_TB: 0,
                        tronglo_TB: 0,
                        tonKhoSS_TB: 0
                    }

                    if (obj.factory == 'TH') {
                        obj.tonKho_TH += Number(item.EB || 0);
                        obj.tonKhoSS_TH += Number(item.EB_SS || 0);
                    }

                    if (obj.factory == 'TB') {
                        obj.tonKho_TB += Number(item.EB || 0);
                        obj.tonKhoSS_TB += Number(item.EB_SS || 0);
                    }

                    if (obj.factory == 'YS') {
                        obj.tonKho_YS += Number(item.EB || 0);
                        obj.tonKhoSS_YS += Number(item.EB_SS || 0);
                    }

                    formattedData.push(obj);
                } else {
                    if (find.factory == 'TH') {
                        find.tonKho_TH += Number(item.EB || 0);
                        find.tonKhoSS_TH += Number(item.EB_SS || 0);
                    }

                    if (find.factory == 'TB') {
                        find.tonKho_TB += Number(item.EB || 0);
                        find.tonKhoSS_TB += Number(item.EB_SS || 0);
                    }

                    if (find.factory == 'YS') {
                        find.tonKho_YS += Number(item.EB || 0);
                        find.tonKhoSS_YS += Number(item.EB_SS || 0);
                    }
                }
            })

            notExistDataSS.forEach(item => {
                let find = uniqueItemCodeData.find(i => i.ItemCode == item.itemCode && Number(i.U_CDay) == Number(item.day) && Number(i.U_CRong) == Number(item.rong) && Number(i.U_CDai) == Number(item.dai));

                if (!find) {
                    let obj = {
                        itemCode: item.ItemCode,
                        itemName: item.ItemName,
                        quyCach: Number(item.U_CDay) + "x" + Number(item.U_CRong) + "x" + Number(item.U_CDai),
                        day: Number(item.U_CDay),
                        rong: Number(item.U_CRong),
                        dai: Number(item.U_CDai),
                        factory: item.factory,
                        tonKho_TH: 0,
                        chosay_TH: 0,
                        tronglo_chuasay_TH: 0,
                        tronglo_TH: 0,
                        tonKhoSS_TH: 0,
                        tonKho_YS: 0,
                        chosay_YS: 0,
                        tronglo_chuasay_YS: 0,
                        tronglo_YS: 0,
                        tonKhoSS_YS: 0,
                        tonKho_TB: 0,
                        chosay_TB: 0,
                        tronglo_chuasay_TB: 0,
                        tronglo_TB: 0,
                        tonKhoSS_TB: 0
                    }

                    if (obj.factory == 'TH') {
                        obj.tonKho_TH += Number(item.EB || 0);
                        obj.tonKhoSS_TH += Number(item.EB_SS || 0);
                    }

                    if (obj.factory == 'TB') {
                        obj.tonKho_TB += Number(item.EB || 0);
                        obj.tonKhoSS_TB += Number(item.EB_SS || 0);
                    }

                    if (obj.factory == 'YS') {
                        obj.tonKho_YS += Number(item.EB || 0);
                        obj.tonKhoSS_YS += Number(item.EB_SS || 0);
                    }

                    formattedData.push(obj);
                } else {
                    if (find.factory == 'TH') {
                        find.tonKho_TH += Number(item.EB || 0);
                        find.tonKhoSS_TH += Number(item.EB_SS || 0);
                    }

                    if (find.factory == 'TB') {
                        find.tonKho_TB += Number(item.EB || 0);
                        find.tonKhoSS_TB += Number(item.EB_SS || 0);
                    }

                    if (find.factory == 'YS') {
                        find.tonKho_YS += Number(item.EB || 0);
                        find.tonKhoSS_YS += Number(item.EB_SS || 0);
                    }
                }
            })

            setRowData(formattedData);
            setReportData(res);
        } catch (error) {
            console.error("Error fetching report data:", error);
            toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
        } finally {
            setIsDataReportLoading(false);
        }
    }, [toDate]);

    useEffect(() => {
        getReportData();
    }, [toDate, getReportData]);

    const handleResetFilter = () => {
        setSelectedFactory(null);
        setIsReceived(true);
        setReportData(null);
        setRowData([]);

        toast.success("Đặt lại bộ lọc thành công.");
    };

    const handleExportExcel = useCallback(() => {
        gridRef.current.api.exportDataAsExcel();
    }, []);

    const handleExportPDF = () => {
        toast("Chức năng xuất PDF đang được phát triển.");
    };

    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState([]);

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        {
            headerName: "Tên",
            field: "itemName",
            minWidth: 400,
            headerComponentParams: { displayName: "Tên" },
            // rowGroup: true,
            // hide: true,
            filter: true,
            headerClass: 'text-center',
            pinned: 'left',
        },
        {
            headerName: "Quy cách",
            children: [
                {
                    headerName: "Dày",
                    field: "day",
                    width: 120,
                    filter: true,
                    pinned: 'left',
                },
                {
                    headerName: "Rộng",
                    field: "rong",
                    width: 120,
                    filter: true,
                    pinned: 'left',
                },
                {
                    headerName: "Dài",
                    field: "dai",
                    width: 120,
                    filter: true,
                    pinned: 'left',
                },
            ],
        },
        {
            headerName: "Thuận Hưng",
            children: [
                {
                    headerName: "Tồn ngoài bãi",
                    field: "tonKho_TH",
                    width: 120,
                    suppressHeaderMenuButton: true,
                    aggFunc: "sum",
                    valueFormatter: (params) => {
                        return params.value ? Number(params.value).toFixed(6).toLocaleString() : "";
                    },
                    headerComponentParams: { displayName: "Tồn ngoài bãi" },
                },
                {
                    headerName: "Xếp sấy",
                    field: "chosay_TH",
                    width: 120,
                    suppressHeaderMenuButton: true,
                    aggFunc: "sum",
                    valueFormatter: (params) => {
                        return params.value ? Number(params.value).toFixed(6).toLocaleString() : "";
                    },
                    headerComponentParams: { displayName: "Xếp sấy" },
                },
                {
                    headerName: "Trong lò chưa sấy",
                    field: "tronglo_chuasay_TH",
                    width: 120,
                    suppressHeaderMenuButton: true,
                    aggFunc: "sum",
                    valueFormatter: (params) => {
                        return params.value
                            ? Number(params.value).toFixed(6).toLocaleString()
                            : "";
                    },
                    headerComponentParams: { displayName: "Trong lò chưa sấy" },
                },
                {
                    headerName: "Trong lò",
                    field: "tronglo_TH",
                    width: 120,
                    suppressHeaderMenuButton: true,
                    aggFunc: "sum",
                    valueFormatter: (params) => {
                        return params.value
                            ? Number(params.value).toFixed(6).toLocaleString()
                            : "";
                    },
                    headerComponentParams: { displayName: "Trong lò" },
                },
                {
                    headerName: "Tồn kho SS",
                    field: "tonKhoSS_TH",
                    width: 120,
                    suppressHeaderMenuButton: true,
                    aggFunc: "sum",
                    valueFormatter: (params) => {
                        return params.value
                            ? Number(params.value).toFixed(6).toLocaleString()
                            : "";
                    },
                    headerComponentParams: { displayName: "Tồn kho SS" },
                }
            ]
        },
        {
            headerName: "Yên Sơn",
            children: [
                {
                    headerName: "Tồn ngoài bãi",
                    field: "tonKho_YS",
                    width: 120,
                    suppressHeaderMenuButton: true,
                    aggFunc: "sum",
                    valueFormatter: (params) => {
                        return params.value ? Number(params.value).toFixed(6).toLocaleString() : "";
                    },
                    headerComponentParams: { displayName: "Tồn ngoài bãi" },
                },
                {
                    headerName: "Xếp sấy",
                    field: "chosay_YS",
                    width: 120,
                    suppressHeaderMenuButton: true,
                    aggFunc: "sum",
                    valueFormatter: (params) => {
                        return params.value ? Number(params.value).toFixed(6).toLocaleString() : "";
                    },
                    headerComponentParams: { displayName: "Xếp sấy" },
                },
                {
                    headerName: "Trong lò chưa sấy",
                    field: "tronglo_chuasay_YS",
                    width: 120,
                    suppressHeaderMenuButton: true,
                    aggFunc: "sum",
                    valueFormatter: (params) => {
                        return params.value
                            ? Number(params.value).toFixed(6).toLocaleString()
                            : "";
                    },
                    headerComponentParams: { displayName: "Trong lò chưa sấy" },
                },
                {
                    headerName: "Trong lò",
                    field: "tronglo_YS",
                    width: 120,
                    suppressHeaderMenuButton: true,
                    aggFunc: "sum",
                    valueFormatter: (params) => {
                        return params.value
                            ? Number(params.value).toFixed(6).toLocaleString()
                            : "";
                    },
                    headerComponentParams: { displayName: "Trong lò" },
                },
                {
                    headerName: "Tồn kho SS",
                    field: "tonKhoSS_YS",
                    width: 120,
                    suppressHeaderMenuButton: true,
                    aggFunc: "sum",
                    valueFormatter: (params) => {
                        return params.value
                            ? Number(params.value).toFixed(6).toLocaleString()
                            : "";
                    },
                    headerComponentParams: { displayName: "Tồn kho SS" },
                }
            ],
        },
        {
            headerName: "Thái Bình",
            children: [
                {
                    headerName: "Tồn ngoài bãi",
                    field: "tonKho_TB",
                    width: 120,
                    suppressHeaderMenuButton: true,
                    aggFunc: "sum",
                    valueFormatter: (params) => {
                        return params.value ? Number(params.value).toFixed(6).toLocaleString() : "";
                    },
                    headerComponentParams: { displayName: "Tồn ngoài bãi" },
                },
                {
                    headerName: "Xếp sấy",
                    field: "chosay_TB",
                    width: 120,
                    suppressHeaderMenuButton: true,
                    aggFunc: "sum",
                    valueFormatter: (params) => {
                        return params.value ? Number(params.value).toFixed(6).toLocaleString() : "";
                    },
                    headerComponentParams: { displayName: "Xếp sấy" },
                },
                {
                    headerName: "Trong lò chưa sấy",
                    field: "tronglo_chuasay_TB",
                    width: 120,
                    suppressHeaderMenuButton: true,
                    aggFunc: "sum",
                    valueFormatter: (params) => {
                        return params.value
                            ? Number(params.value).toFixed(6).toLocaleString()
                            : "";
                    },
                    headerComponentParams: { displayName: "Trong lò chưa sấy" },
                },
                {
                    headerName: "Trong lò",
                    field: "tronglo_TB",
                    width: 120,
                    suppressHeaderMenuButton: true,
                    aggFunc: "sum",
                    valueFormatter: (params) => {
                        return params.value
                            ? Number(params.value).toFixed(6).toLocaleString()
                            : "";
                    },
                    headerComponentParams: { displayName: "Trong lò" },
                },
                {
                    headerName: "Tồn kho SS",
                    field: "tonKhoSS_TB",
                    width: 120,
                    suppressHeaderMenuButton: true,
                    aggFunc: "sum",
                    valueFormatter: (params) => {
                        return params.value
                            ? Number(params.value).toFixed(6).toLocaleString()
                            : "";
                    },
                    headerComponentParams: { displayName: "Tồn kho SS" },
                }
            ],
        },
    ]);

    const groupDisplayType = "multipleColumns";

    const onGridReady = useCallback(() => { }, []);

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <Layout>
            <div className="overflow-x-hidden">
                <div className="w-screen p-6 px-5 xl:p-5 xl:px-12 ">
                    {/* Title */}
                    <div className="flex items-center justify-between space-x-6 mb-3.5">
                        <div className="flex items-center space-x-4">
                            <div
                                className="p-2 hover:bg-gray-200 rounded-full cursor-pointer active:scale-[.87] active:duration-75 transition-all"
                                onClick={handleGoBack}
                            >
                                <FaArrowLeft className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex flex-col mb-0 pb-0">
                                <div className="text-sm text-[#17506B]">
                                    Báo cáo sấy phôi
                                </div>
                                <div className="serif text-3xl font-bold">
                                    Báo cáo tồn sấy lựa
                                </div>
                            </div>
                        </div>

                        {/* Search & Export */}
                        <div className="w-1/2 flex items-center justify-between border-2 border-gray-300 p-2 px-4 pr-1  rounded-lg bg-[#F9FAFB]">
                            <div className="flex items-center space-x-3 w-2/3">
                                <IoSearch className="w-6 h-6 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tất cả..."
                                    className=" w-full focus:ring-transparent !outline-none bg-[#F9FAFB]  border-gray-30 ring-transparent border-transparent focus:border-transparent focus:ring-0"
                                />
                            </div>

                            <div className="flex justify-end items-center divide-x-2 w-1/3">
                                <div className="mx-2.5"></div>
                                <div>
                                    <FaArrowRotateLeft
                                        className="mx-2.5 w-[22px] h-[22px] text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all"
                                        onClick={handleResetFilter}
                                    />
                                </div>
                                <div>
                                    <FaArrowUpRightFromSquare
                                        className="mx-2.5 w-5 h-5 text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all"
                                        onClick={handleExportExcel}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className=" bg-white rounded-xl py-2 pb-3">
                        {/* Filter */}
                        <div className="flex items-center space-x-3 divide-x-2 divide-gray-100 px-4 mt-1">
                            <div className="flex space-x-3 w-1/2">
                                {/* <div className="col-span-1 w-full">
                                    <label
                                        htmlFor="indate"
                                        className="block mb-1 text-sm font-medium text-gray-900 "
                                    >
                                        Từ ngày
                                    </label>
                                    <DatePicker
                                        selected={fromDate}
                                        dateFormat="dd/MM/yyyy"
                                        onChange={(date) => {
                                            setFromDate(date);
                                            // if (
                                            //     fromDate &&
                                            //     toDate &&
                                            //     selectedFactory &&
                                            //     isReceived &&
                                            //     selectedTeams
                                            // ) {
                                            //     getReportData();
                                            // }
                                        }}
                                        className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                    />
                                </div> */}
                                <div className="col-span-1 w-1/2">
                                    <label
                                        htmlFor="indate"
                                        className="block mb-1 text-sm font-medium text-gray-900 "
                                    >
                                        Đến ngày
                                    </label>
                                    <DatePicker
                                        selected={toDate}
                                        dateFormat="dd/MM/yyyy"
                                        onChange={(date) => {
                                            setToDate(date);
                                        }}
                                        className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {isDataReportLoading ? (
                        <div className="mt-2 bg-[#C2C2CB] flex items-center justify-center p-2 px-4 pr-1 rounded-lg">
                            <div className="dots my-1"></div>
                        </div>
                    ) : (
                        <>
                            {rowData?.length > 0 ? (
                                <div>
                                    <div
                                        className="ag-theme-quartz border-2 border-gray-300 rounded-lg mt-2"
                                        style={{
                                            height: 680,
                                            fontSize: 16,
                                        }}
                                        id="app-ag-grid"
                                    >
                                        <AgGridReact
                                            ref={gridRef}
                                            rowData={rowData}
                                            columnDefs={colDefs}
                                            onGridReady={onGridReady}
                                            groupDisplayType={groupDisplayType}
                                            grandTotalRow={"bottom"}
                                            autoGroupColumnDef={{
                                                headerName: "Tên nhóm",
                                                field: "itemname",
                                                width: 450,
                                                cellRendererParams: {
                                                    suppressCount: false, // hiển thị số lượng bản ghi trong nhóm
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-2 bg-[#C2C2CB] flex items-center justify-center p-2 px-4 pr-1 rounded-lg">
                                    Không có dữ liệu để hiển thị.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default BaoCaoTonSayLua;
