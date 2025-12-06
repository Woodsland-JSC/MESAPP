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
import "../../../assets/styles/customStyle.css";
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
import { getDryingQueue } from "../../../api/pallet.api";

function DryingCompletedReport() {
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

    const handleFactorySelect = async (factory) => {
        setSelectedFactory(factory);
        setReportData(null);
        setSelectedTeams([]);
    };

    const getReportData = useCallback(async () => {
        let params = {
            from_date: format(fromDate, "yyyy-MM-dd"),
            to_date: format(toDate, "yyyy-MM-dd"),
            plant: selectedFactory,
        };

        setIsDataReportLoading(true);
        try {
            const res = await getDryingQueue(params.from_date, params.to_date, params.plant);

            const formattedData = res.map((item) => {
                let khoiLuongTinhThuong = 0;
                let dgnc = 0;
                let heSoQuyDoi = 1.35;
                let quyLuong = 0;

                if (selectedFactory == 'YS') {
                    dgnc = 40900;
                }

                if (selectedFactory == 'TB') {
                    dgnc = 140400;
                }

                if (item.day <= 16) {

                }

                if (item.day > 16 && item.day <= 21 && item.dai < 800) {
                    heSoQuyDoi = 1.2

                    if (selectedFactory == 'TB') {
                        dgnc = 129300;
                    }
                }

                if (item.day >= 22 && item.day <= 25 && item.dai < 800) {
                    heSoQuyDoi = 1;

                    if (selectedFactory == 'TB') {
                        dgnc = 114600;
                    }
                }

                if (item.day > 16 && item.day <= 21 && item.dai >= 800) {
                    heSoQuyDoi = 1;
                    

                    if (selectedFactory == 'TB') {
                        dgnc = 114600;
                    }
                }

                if (item.day > 25) {
                    heSoQuyDoi = 0.85;
                    
                    if (selectedFactory == 'TB') {
                        dgnc = 103500;
                    }
                }

                if (item.day >= 22 && item.day <= 25 && item.dai >= 800) {
                    heSoQuyDoi = 0.85;
                    
                    if (selectedFactory == 'TB') {
                        dgnc = 103500;
                    }
                }

                // Tính toán
                khoiLuongTinhThuong = item.mass * heSoQuyDoi;
                

                let month = new Date().getMonth() + 1;                

                let pow = 2;

                let hs = Math.pow((1-0.01), pow);
                let tt = dgnc * hs;

                quyLuong = item.mass * tt;

                return {
                    created_at: item.created_at,
                    code: item.code,
                    ma_lo: item.ma_lo,
                    item_code: item.item_code,
                    item_name: item.item_name,
                    thickness: parseInt(item.day),
                    width: parseInt(item.rong),
                    height: parseInt(item.dai),
                    qty: parseInt(item.qty),
                    mass: item.mass,
                    reason: item.reason,
                    status: item.status,
                    mnv: item.created_username,
                    khoiLuongTinhThuong,
                    dgnc,
                    quyLuong,
                    stacking_time: item.stacking_time ?? "",
                    completedDate: item.completed_date ?? '',
                    completed_by: item.completed_by ?? '',
                    type: item.type ?? '',
                    created_fullname: item.created_fullname ?? '',
                    completed_fullname: item.completed_fullname ?? '',
                    hs,
                    tt
                }
            });
            setIsDataReportLoading(false);
            setRowData(formattedData);
            setReportData(res);
        } catch (error) {
            console.error(error);
            toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
            setIsDataReportLoading(false);
        }
    }, [fromDate, toDate, selectedFactory]);

    useEffect(() => {
        const allFieldsFilled = selectedFactory && fromDate && toDate;
        if (allFieldsFilled) {
            getReportData();
        } else {
            console.log("Không thể gọi API vì không đủ thông tin");
        }
    }, [selectedFactory, fromDate, toDate, getReportData]);

    const handleResetFilter = () => {
        setSelectedFactory(null);
        // setSelectAll(false);
        setIsReceived(true);
        // setTeamData([]);

        setReportData(null);

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
            headerName: "Ngày xếp",
            field: "created_at",
            width: 200,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Ngày ra lò",
            field: "completedDate",
            width: 200,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "MNV",
            field: "mnv",
            width: 100,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Người xếp",
            field: "created_fullname",
            width: 200,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "MNV ra lò",
            field: "completed_by",
            width: 100,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Người ra lò",
            field: "completed_fullname",
            width: 200,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Mã pallet",
            field: "code",
            width: 150,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Mã lô",
            field: "ma_lo",
            width: 180,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Mã quy cách",
            field: "item_code",
            width: 150,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Tên quy cách",
            field: "item_name",
            width: 350,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Dày",
            field: "thickness",
            width: 80,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Rộng",
            field: "width",
            width: 80,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Dài",
            field: "height",
            width: 80,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Số lượng (T)",
            field: "qty",
            width: 150,
            suppressHeaderMenuButton: true,
            aggFunc: "sum",
            valueFormatter: (params) => {
                return params.value ? params.value.toLocaleString() : "0";
            },
            headerComponentParams: { displayName: "Số lượng (T)" },
        },

        {
            headerName: "Khối lượng (m3)",
            field: "mass",
            width: 170,
            suppressHeaderMenuButton: true,
            aggFunc: "sum",
            valueFormatter: (params) => {
                return params.value ? params.value.toLocaleString() : "0";
            },
            headerComponentParams: { displayName: "Khối lượng (m3)" },
        },
        {
            headerName: "Khối lượng tính thưởng",
            field: "khoiLuongTinhThuong",
            width: 250,
            suppressHeaderMenuButton: true,
            valueFormatter: (params) => {
                return params.value ? params.value.toLocaleString() : "0";
            }
        },
        {
            headerName: "Đơn giá",
            field: "dgnc",
            width: 150,
            suppressHeaderMenuButton: true,
            valueFormatter: (params) => {
                return params.value ? params.value.toLocaleString() : "0";
            },
            filter: true,
        },
        {
            headerName: "Hệ số",
            field: "hs",
            width: 150,
            suppressHeaderMenuButton: true,
            valueFormatter: (params) => {
                return params.value ? Number(params.value).toFixed(6) : "0";
            },
            filter: true,
        },
        {
            headerName: "Thành tiền",
            field: "tt",
            width: 150,
            suppressHeaderMenuButton: true,
            valueFormatter: (params) => {
                return params.value ? Number(params.value).toFixed(6).toLocaleString() : "0";
            },
            filter: true,
            aggFunc: "sum"
        },
        {
            headerName: "Quỹ lương",
            field: "quyLuong",
            width: 150,
            suppressHeaderMenuButton: true,
            valueFormatter: (params) => {
                return params.value ? Number(params.value).toFixed(6).toLocaleString() : "0";
            },
            aggFunc: "sum"
        },
        {
            headerName: "Thời gian xếp (phút)",
            field: "stacking_time",
            width: 230,
            valueFormatter: (params) => {
                return params.value ? Math.round(params.value).toLocaleString() : "0";
            }
        },
        {
            headerName: "Loại hàng",
            field: "type",
            filter: true,
            width: 180,
            suppressHeaderMenuButton: true,
        },
        {
            headerName: "Mục đích sấy",
            field: "reason",
            filter: true,
            width: 180,
            suppressHeaderMenuButton: true,
        },
        {
            headerName: "Trạng thái",
            field: "status",
            filter: true,
            width: 150,
            suppressHeaderMenuButton: true,
        },
    ]);

    const groupDisplayType = "multipleColumns";


    const FactoryOption = ({ value, label }) => (
        <div
            className={`group hover:border-[#86ABBE] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-3xl border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all ${selectedFactory === value
                ? "border-[#86ABBE] bg-[#eaf8ff]"
                : "border-gray-300"
                }`}
            onClick={() => handleFactorySelect(value)}
        >
            {selectedFactory === value ? (
                <IoMdRadioButtonOn className="w-5 h-6 text-[#17506B]" />
            ) : (
                <IoMdRadioButtonOff className="w-5 h-6 text-gray-400 group-hover:text-[#17506B]" />
            )}
            <div
                className={`${selectedFactory === value
                    ? "text-[#17506B] font-medium"
                    : "text-gray-400 group-hover:text-[#17506B]"
                    }`}
            >
                {label}
            </div>
        </div>
    );

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <Layout>
            <div className="overflow-x-hidden">
                <div className="w-screen  p-6 px-5 xl:p-5 xl:px-12 ">
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
                                    Báo cáo sấy phôi
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
                            <div className="flex space-x-3 w-1/4">
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
                            <div className="flex space-x-3 w-3/4 px-3">
                                <div className="col-span-1 w-full">
                                    <label
                                        htmlFor="indate"
                                        className="block mb-1 text-sm font-medium text-gray-900"
                                    >
                                        Chọn nhà máy
                                    </label>
                                    <FactoryOption
                                        value="TH"
                                        label="Thuận Hưng"
                                    />
                                </div>
                                <div className="col-span-1 w-full flex items-end">
                                    <FactoryOption value="YS" label="Yên Sơn" />
                                </div>
                                <div className="col-span-1 w-full flex items-end">
                                    <FactoryOption
                                        value="TB"
                                        label="Thái Bình"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {isDataReportLoading ? (
                        <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center p-3 px-4 pr-1 rounded-lg ">
                            <div className="dots"></div>
                        </div>
                    ) : (
                        <>
                            {reportData?.length > 0 ? (
                                <div>
                                    <div
                                        className="ag-theme-quartz border-2 border-gray-300 rounded-lg mt-2 "
                                        style={{
                                            height: 630,
                                            fontSize: 16,
                                            lineHeight: 1.5,
                                        }}
                                        id="app-ag-grid"
                                    >
                                        <AgGridReact
                                            ref={gridRef}
                                            rowData={rowData}
                                            columnDefs={colDefs}
                                            groupDisplayType={groupDisplayType}
                                            grandTotalRow={"bottom"}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                                    Không có dữ liệu để hiển thị.
                                </div>
                            )}
                        </>
                    )}
                </div>
                {/* <div className="py-4"></div> */}
            </div>
        </Layout>
    );
}

export default DryingCompletedReport;
