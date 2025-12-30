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
import Select from 'react-select'
import { danhSachNhaMayCBG } from "../../../api/MasterDataApi";
import { bao_cao_ton_go_ngoai_bai } from "../../../api/ReportSAPApi";
import moment from "moment";

function BaoCaoTonGoNgoaiBai() {
    const navigate = useNavigate();

    const { user } = useAppContext();
    const gridRef = useRef();

    const getFirstDayOfCurrentMonth = () => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    // Date picker
    const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth());
    const [toDate, setToDate] = useState(new Date());

    // Loading States
    const [isDataReportLoading, setIsDataReportLoading] = useState(false);
    const [selectedTeams, setSelectedTeams] = useState([]);

    const [selectedFactory, setSelectedFactory] = useState(null);
    const [isReceived, setIsReceived] = useState(true);

    const [reportData, setReportData] = useState(null);

    const [factories, setFactories] = useState([]);
    const [factory, setFactory] = useState(null);

    const getReportData = async () => {
        setIsDataReportLoading(true);
        try {
            // Gọi đúng API getCBGWoodDryingReport thay vì getDefectResolutionReport
            const res = await bao_cao_ton_go_ngoai_bai({
                fromDate: moment(fromDate).format('yyyy-MM-DD'),
                toDate: moment(toDate).format('yyyy-MM-DD'),
                factory: factory.value
            });

            let data = res.sort((a, b) => new Date(b.DocDate) - new Date(a.DocDate));

            // Logic xử lý dữ liệu từ onGridReady
            const formattedData = data.map((item) => {
                let day = Number(item.day);
                let rong = Number(item.rong);
                let dai = Number(item.dai);
                let totalM3 = (day * rong * dai * item.Quantity) / 1000000000;
                let xepsayM3 = (day * rong * dai * (item.xepsay ?? 0)) / 1000000000;
                return {
                    day: day,
                    rong: rong,
                    dai: dai,
                    quantity: item.Quantity,
                    indate: item.DocDate,
                    sepxay: item.xepsay ?? 0,
                    tonSL: item.Quantity - (item.xepsay ?? 0),
                    tonKL: Number(totalM3 - xepsayM3),
                    ItemCode: item.ItemCode,
                    U_Line: item.U_Line
                };
            });

            setRowData(formattedData);
            setReportData(res);
        } catch (error) {
            console.error("Error fetching report data:", error);
            toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
        } finally {
            setIsDataReportLoading(false);
        }
    }

    useEffect(() => {
        if (factory) getReportData();
    }, [fromDate, toDate, factory]);

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
            headerName: "Quy cách",
            children: [
                {
                    headerName: "Dày",
                    field: "day",
                    width: 120,
                    filter: true,
                },
                {
                    headerName: "Rộng",
                    field: "rong",
                    width: 120,
                    filter: true,
                },
                {
                    headerName: "Dài",
                    field: "dai",
                    width: 120,
                    filter: true,
                },
            ],
        },
        {
            headerName: "Mã SP",
            field: "ItemCode",
            width: 200,
            filter: true,
        },
        {
            headerName: "Ngày nhập",
            field: "indate",
            width: 200,
            filter: true,
        },
        {
            headerName: "Số lượng nhập",
            field: "quantity",
            width: 200,
            filter: true,
            aggFunc: "sum",
            valueFormatter: param => {
                return param.value ? Number(param.value).toLocaleString('en-US') : 0
            },
        },
        {
            headerName: "Số lượng xếp sấy",
            field: "sepxay",
            width: 200,
            filter: true,
            aggFunc: "sum",
            valueFormatter: param => {
                return param.value ? Number(param.value).toLocaleString('en-US') : 0
            },
        },
        {
            headerName: "Tồn SL",
            field: "tonSL",
            width: 200,
            filter: true,
            aggFunc: "sum",
            valueFormatter: param => {
                return param.value ? Number(param.value).toLocaleString('en-US') : 0
            },
        },
        {
            headerName: "Tồn KL",
            field: "tonKL",
            width: 200,
            filter: true,
            aggFunc: "sum",
            valueFormatter: param => {
                return param.value ? Number(param.value).toLocaleString('en-US', {
                    minimumFractionDigits: 6,
                    maximumFractionDigits: 6
                }) : 0
            },
        },
        {
            headerName: "Nhóm SP",
            field: "U_Line",
            width: 200,
            filter: true
        },
        {
            headerName: "Trạng thái",
            width: 200,
            filter: true,
            valueGetter: (params) => {
                let data = params.data;

                if (!data) return "";
                if (!data.U_Line) return "";

                let date = data.indate;
                let day = daysBetween(date);
                let lydo = data.U_Line;

                if(lydo == 'INDOOR' && day > 5){
                    return "Chưa đạt";
                }else if(lydo == 'OUTDOOR' && day > 7){
                    return "Chưa đạt";
                }else{
                    return "Đạt";
                }
            }
        }
    ]);

    const groupDisplayType = "multipleColumns";

    const onGridReady = useCallback(() => { }, []);

    const handleGoBack = () => {
        navigate(-1);
    };

    const getFactories = async () => {
        try {
            let res = await danhSachNhaMayCBG();
            let options = [];
            res.data.factories.forEach(item => {
                options.push({
                    label: item.Name,
                    value: item.U_FAC
                })
            });
            setFactories(options);
        } catch (error) {
            toast.error('Lấy danh sách nhà máy có lỗi.');
        }
    }

    function daysBetween(date1) {
        const d1 = new Date(date1);
        const d2 = new Date();

        // Reset giờ về 00:00:00 để tránh lệch múi giờ
        d1.setHours(0, 0, 0, 0);
        d2.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(d2 - d1);
        return diffTime / (1000 * 60 * 60 * 24);
    }

    useEffect(() => {
        getFactories();
    }, [])

    return (
        <Layout>
            <div className="">
                <div className="w-screen p-6 px-5 xl:p-12 xl:px-20 xl:pt-6 lg:pt-6 md:pt-6 pt-2 border-t border-gray-200">
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
                                    Báo cáo tồn gỗ ngoài bãi
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
                                <div className="col-span-1 w-full">
                                    <label className=" text-sm font-medium text-gray-900">
                                        Nhà máy
                                    </label>
                                    <Select
                                        options={factories}
                                        placeholder="Chọn nhà máy"
                                        className="w-full cursor-pointer"
                                        onChange={(factory) => {
                                            setFactory({ ...factory });
                                        }}
                                    />
                                </div>
                                <div className="col-span-1 w-full">
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
                                        }}
                                        className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                    />
                                </div>
                                <div className="col-span-1 w-full">
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
                                            height: 630,
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
                                        // autoGroupColumnDef={{
                                        //     headerName: "Tên nhóm",
                                        //     field: "itemname",
                                        //     width: 450,
                                        //     cellRendererParams: {
                                        //         suppressCount: false, // hiển thị số lượng bản ghi trong nhóm
                                        //     },
                                        // }}
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

export default BaoCaoTonGoNgoaiBai;
