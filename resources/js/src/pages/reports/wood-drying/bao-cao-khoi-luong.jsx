import { useCallback, useEffect, useRef, useState } from "react";
import { IoMdRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";
import Layout from "../../../layouts/layout";
import { FaArrowLeft, FaArrowRotateLeft, FaArrowUpRightFromSquare } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import { getFirstDayOfCurrentMonth } from "../../../utils/date.utils";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import { getQuantityPallets } from "../../../api/pallet.api";
import moment from "moment";
import Loader from "../../../components/Loader";
import { AgGridReact } from "ag-grid-react";

const BaoCaoKhoiLuongLoSay = () => {
    const [reportData, setReportData] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const gridRef = useRef();

    // Date picker
    const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth());
    const [toDate, setToDate] = useState(new Date());

    const handleFactorySelect = async (factory) => {
        setSelectedFactory(factory);
        setReportData(null);
    };

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

    const handleExportExcel = useCallback(() => {
        gridRef.current.api.exportDataAsExcel();
    }, []);

    const getReports = async () => {
        try {
            setLoading(true);
            let res = await getQuantityPallets(moment(fromDate).format('yyyy-MM-DD'), moment(toDate).format('yyyy-MM-DD'), selectedFactory);

            let data = res.reports;

            data.forEach(item => {
                item.status = 'Chưa Hoàn thành';

                if (item.CompletedBy) {
                    item.status = 'Hoàn thành'
                }

                item.Mass = Number(item.Mass);
            })

            setReportData(res.reports)
            setLoading(false);
        } catch (error) {
            console.log(error);

            toast.error("Lấy báo cáo có lỗi.");
            setLoading(false);
        }
    }

    const [colDefs, setColDefs] = useState([
        {
            headerName: "Lò sấy",
            field: "Oven",
            width: 150,
            suppressHeaderMenuButton: true,
            filter: true,
            rowGroup: true
        },
        {
            headerName: "Quy cách",
            field: "QuyCach",
            width: 150,
            suppressHeaderMenuButton: true,
            filter: true,
            rowGroup: true
        },
        {
            headerName: "Dày",
            field: "CDay",
            width: 100,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Rộng",
            field: "CRong",
            width: 100,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Dài",
            field: "CDai",
            width: 100,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Mã Pallet",
            field: "PalletCode",
            width: 200,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Chi tiết",
            field: "ItemName",
            width: 200,
            suppressHeaderMenuButton: true,
            filter: true,
            flex: 1
        },
        {
            headerName: "Khối lượng",
            field: "Mass",
            width: 150,
            suppressHeaderMenuButton: true,
            aggFunc: "sum",
            headerComponentParams: { displayName: "Khối lượng" },
            valueFormatter: param => {
                return param.value ? Number(param.value).toLocaleString('en-US', {
                    minimumFractionDigits: 6,
                    maximumFractionDigits: 6
                }) : 0
            },
            filter: true,
        },
        {
            headerName: "Số lượng (T)",
            field: "Qty",
            width: 150,
            suppressHeaderMenuButton: true,
            aggFunc: "sum",
            headerComponentParams: { displayName: "Số lượng (T)" },
            valueFormatter: param => {
                return param.value ? param.value.toLocaleString() : "0";
            },
            filter: true,
        },
        {
            headerName: "Ngày vào lò",
            field: "LoadedIntoKilnDate",
            width: 150,
            suppressHeaderMenuButton: true,
            valueFormatter: param => {
                if (param.node.id == 'rowGroupFooter_ROOT_NODE_ID' || param.node.group) return "";
                return moment(param.value).format('DD/MM/YYYY HH:mm:ss')
            },
            filter: true,
        },
        {
            headerName: "Ngày ra lò",
            field: "CompletedDate",
            width: 150,
            suppressHeaderMenuButton: true,
            valueFormatter: param => {
                if (param.node.id == 'rowGroupFooter_ROOT_NODE_ID' || param.node.group) return "";
                return param.value ? moment(param.value).format('DD/MM/YYYY HH:mm:ss') : ""
            },
            filter: true,
        },
        {
            headerName: "Trạng thái",
            field: "status",
            width: 150,
            suppressHeaderMenuButton: true,
            filter: true,
        }
    ]);

    useEffect(() => {
        if (fromDate && toDate && selectedFactory) {
            getReports()
        }
    }, [fromDate, toDate, selectedFactory])

    return (
        <Layout>
            <div className="overflow-x-hidden">
                <div className="w-screen  p-6 px-5 xl:p-5 xl:px-12 ">
                    <div className="flex items-center justify-between space-x-6 mb-3.5">
                        <div className="flex items-center space-x-4">
                            <div
                                className="p-2 hover:bg-gray-200 rounded-full cursor-pointer active:scale-[.87] active:duration-75 transition-all"
                                onClick={() => navigate(`/reports?tab=wood-drying`)}
                            >
                                <FaArrowLeft className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex flex-col mb-0 pb-0">
                                <div className="text-sm text-[#17506B]">
                                    Báo cáo sấy phôi
                                </div>
                                <div className="serif text-3xl font-bold">
                                    Báo cáo khối lượng ra lò
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
                                    // onClick={handleResetFilter}
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
                                    <FactoryOption value="TH" label="Thuận Hưng" />
                                </div>
                                <div className="col-span-1 w-full flex items-end">
                                    <FactoryOption value="YS" label="Yên Sơn" />
                                </div>
                                <div className="col-span-1 w-full flex items-end">
                                    <FactoryOption value="TB" label="Thái Bình" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {reportData?.length > 0 ? (
                        <div>
                            <div
                                className="ag-theme-quartz border-2 border-gray-300 rounded-lg mt-2 "
                                style={{
                                    height: 630,
                                    fontSize: 16
                                }}
                                id="app-ag-grid"
                            >
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={reportData}
                                    columnDefs={colDefs}
                                    groupDisplayType={"multipleColumns"}
                                    grandTotalRow={"bottom"}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                            Không có dữ liệu để hiển thị.
                        </div>
                    )}
                </div>
            </div>
            {
                loading && <Loader></Loader>
            }
        </Layout>
    )
}

export default BaoCaoKhoiLuongLoSay;