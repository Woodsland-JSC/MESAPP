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
import AG_GRID_LOCALE_VI from "../../../utils/locale.vi";
import {
    FaArrowRotateLeft,
    FaArrowUpRightFromSquare,
    FaCheck,
} from "react-icons/fa6";
import { IoMdRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";
import DatePicker from "react-datepicker";
import { formatNumber } from "../../../utils/numberFormat";
import "react-datepicker/dist/react-datepicker.css";
import "../../../assets/styles/datepicker.css";
import { format, startOfDay, endOfDay } from "date-fns";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import toast from "react-hot-toast";
import reportApi from "../../../api/reportApi";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { FaArrowDown } from "react-icons/fa";
import { FaExclamation } from "react-icons/fa";
import useAppContext from "../../../store/AppContext";
import "../../../assets/styles/customTable.css";
import moment from "moment";

function ReceiptInSapReportCBG() {
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
    const [fromDateMobile, setFromDateMobile] = useState(
        getFirstDayOfCurrentMonth()
    );
    const [toDateMobile, setToDateMobile] = useState(new Date());

    // Loading States
    const [isTeamLoading, setIsTeamLoading] = useState(false);
    const [isDataReportLoading, setIsDataReportLoading] = useState(false);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [selectedTeamMobile, setSelectedTeamMobile] = useState(null);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const [isReceived, setIsReceived] = useState(true);
    const [teamData, setTeamData] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);

    const [reportData, setReportData] = useState(null);
    const [reportDataMobile, setReportDataMobile] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = useMemo(() => {
        return reportDataMobile?.filter((item) => {
            const searchValue =
                `${item.CDay}x${item.CRong}x${item.CDai}`.toLowerCase();
            return searchValue.includes(searchTerm.toLowerCase());
        });
    }, [reportDataMobile, searchTerm]);

    const handleFactorySelect = async (factory) => {
        console.log("Nhà máy đang chọn là:", factory);
        setSelectedFactory(factory);
        setReportData(null);
        setTeamData([]);
        setSelectedTeams([]);
        await getTeamData(factory);
    };

    const getTeamData = async (param) => {
        setIsTeamLoading(true);
        try {
            const res = await reportApi.getTeamByFactory(param, "CBG");
            setIsTeamLoading(false);
            setTeamData(res || []);
            setSelectAll(false);
        } catch (error) {
            toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
            setIsTeamLoading(false);
            setSelectAll(false);
            console.error(error);
        }
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setSelectedTeams((prevValues) => {
            let newValues;
            if (checked) {
                if (!prevValues.includes(value)) {
                    newValues = [...prevValues, value];
                } else {
                    newValues = prevValues;
                }
            } else {
                newValues = prevValues.filter((val) => val !== value);
            }
            return newValues;
        });
    };

    const handleSelectAll = () => {
        setSelectAll((prevSelectAll) => {
            const newSelectAll = !prevSelectAll;
            if (newSelectAll) {
                const allTeamCodes = teamData.map((item) => item.Code);
                setSelectedTeams([...new Set(allTeamCodes)]);
            } else {
                setSelectedTeams([]);
            }
            return newSelectAll;
        });
    };

    const getReportData = useCallback(async () => {
        let params = {
            from_date: format(fromDate, "yyyy-MM-dd"),
            to_date: format(toDate, "yyyy-MM-dd"),
            To: selectedTeams,
            plant: selectedFactory,
        };
        setIsDataReportLoading(true);
        try {
            const res = await reportApi.getReceiptInSAPReport(
                params.from_date,
                params.to_date,
                params.plant,
                params.To,
                "CBG"
            );
            const formattedData = res.map((item) => ({
                doc_num: item.DocumentNumber,
                resource: item.TenTo,
                itemcode: item.ItemCode,
                itemname: item.ItemName,
                thickness: item.U_CDay,
                width: item.U_CRong,
                height: item.U_CDai,
                unit: item.UnitOfMeasure,
                market_code: item.MaThiTruong,
                quantity: parseInt(item.Quantity),
                m3_sp: Number(item.U_M3SP),
                m3: Number(item.M3),
                sender: item.DeliveryPerson,
                receiver: item.Recipient,
                warehouse: item.WarehouseCode,
                receive_date:
                    moment(item.CreateDate).format("DD/MM/YYYY") +
                    " " +
                    item.CreateTime,
                production_order_sap: item.ProductionOrderSAP,
                production_order_mes: item.ProductionOrderMES,
                mes_noti: item.U_UUID,
                m3_sap: item.M3SAP,
            }));
            setIsDataReportLoading(false);
            setRowData(formattedData);
            setReportData(res);
        } catch (error) {
            console.error(error);
            toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
            setIsDataReportLoading(false);
        }
    }, [fromDate, toDate, selectedFactory, selectedTeams, selectAll]);

    const getReportDataMobile = useCallback(async () => {
        if (!fromDateMobile || !toDateMobile || !selectedTeamMobile) {
            console.log("Không thể gọi API vì thiếu thông tin. (Mobile)");
            return;
        }

        let params = {
            from_date: format(fromDateMobile, "yyyy-MM-dd"),
            to_date: format(toDateMobile, "yyyy-MM-dd"),
            To: selectedTeamMobile.value,
            plant:
                user?.plant === "YS1" || user?.plant === "YS2"
                    ? "YS"
                    : user?.plant,
        };
        console.log(params); // Log toàn bộ giá trị param trước khi chạy API
        setIsDataReportLoading(true);
        try {
            const res = await reportApi.getReceiptInSAPReport(
                params.from_date,
                params.to_date,
                params.plant,
                [params.To],
                "CBG"
            );
            setIsDataReportLoading(false);
            setReportDataMobile(res);
        } catch (error) {
            console.error(error);
            toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
            setIsDataReportLoading(false);
        }
    }, [fromDateMobile, toDateMobile, selectedTeamMobile, user.plant]);

    useEffect(() => {
        const allFieldsFilled =
            selectedTeams &&
            selectedTeams.length > 0 &&
            selectedFactory &&
            fromDate &&
            toDate;
        if (allFieldsFilled) {
            getReportData();
        } else {
            console.log("Không thể gọi API vì không đủ thông tin");
        }

        const allFieldsFilledMobile =
            selectedTeamMobile && fromDateMobile && toDateMobile;
        if (allFieldsFilledMobile) {
            getReportDataMobile();
        } else {
            console.log("Không thể gọi API vì không đủ thông tin. (Mobile)");
        }
    }, [
        selectedTeams,
        selectedFactory,
        fromDate,
        toDate,
        getReportData,
        fromDateMobile,
        toDateMobile,
        selectedTeamMobile,
        getReportDataMobile,
    ]);

    // New Get All Group
    useEffect(() => {
        const userPlant =
            user?.plant === "YS1" || user?.plant === "YS2" ? "YS" : user?.plant;

        reportApi
            .getTeamByFactory(userPlant, "CBG")
            .then((response) => {
                const options = response
                    .map((item) => ({
                        value: item.Code || "",
                        label: item.Name || "",
                    }))
                    .filter((option) => option.label)
                    .sort((a, b) => a.label.localeCompare(b.label));
                setTeamOptions(options);
            })
            .catch((error) => {
                console.error("Error fetching team data:", error);
                toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
            });
    }, []);

    const handleResetFilter = () => {
        setSelectedFactory(null);
        setSelectAll(false);
        setIsReceived(true);
        setTeamData([]);

        setReportData(null);

        toast.success("Đặt lại bộ lọc thành công.");
    };

    const handleExportExcel = useCallback(() => {
        const factory = selectedFactory || "Tất cả";
        const fileName = `Báo cáo thông tin sản lượng nhận tại SAP_${factory}.xlsx`;

        gridRef.current.api.exportDataAsExcel({
            fileName,
        });
    }, [selectedFactory]);

    const handleExportPDF = () => {
        toast("Chức năng xuất PDF đang được phát triển.");
    };

    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState([]);

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        {
            headerName: "Tổ sản xuất",
            field: "resource",
            rowGroup: true,
            enableRowGroup: true,
            hide: true,
            sort: "asc",
            pinned: "left",
            filter: true,
            headerComponentParams: { displayName: "Tổ sản xuất" },
        },
        {
            headerName: "Mã thị trường",
            field: "market_code",
            pinned: "left",
            minWidth: 200,
            filter: true,
        },
        {
            headerName: "Mã chi tiết",
            field: "itemcode",
            width: 120,
            suppressHeaderMenuButton: true,
            pinned: "left",
            filter: true,
        },
        {
            headerName: "Tên chi tiết",
            pinned: "left",
            field: "itemname",
            minWidth: 360,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Dày",
            field: "thickness",
            width: 100,
            pinned: "left",
            suppressHeaderMenuButton: true,
            filter: true,
            valueFormatter: (params) => formatNumber(Number(params.value) || 0),
        },
        {
            headerName: "Rộng",
            field: "width",
            width: 100,
            pinned: "left",
            suppressHeaderMenuButton: true,
            valueFormatter: (params) => formatNumber(Number(params.value) || 0),
            filter: true,
        },
        {
            headerName: "Dài",
            field: "height",
            width: 100,
            pinned: "left",
            suppressHeaderMenuButton: true,
            valueFormatter: (params) => formatNumber(Number(params.value) || 0),
            filter: true,
        },
        {
            headerName: "ĐVT",
            field: "unit",
            minWidth: 110,
            filter: true,
        },
        {
            headerName: "M3 sản phẩm",
            field: "m3_sp",
            filter: true,
            minWidth: 200,
        },
        {
            headerName: "Số lượng",
            field: "quantity",
            minWidth: 130,
            suppressHeaderMenuButton: true,
            valueFormatter: (params) => {
                return params.value ? params.value.toLocaleString("en-US") : "";
            },
            aggFunc: "sum",
            headerComponentParams: { displayName: "Số lượng" },
            filter: true,
        },
        {
            headerName: "M3",
            field: "m3",
            minWidth: 150,
            aggFunc: "sum",
            headerComponentParams: { displayName: "M3" },
            valueFormatter: (params) => {
                const value = Number(params?.value); // ép kiểu về number
                return isNaN(value) ? "0.000000" : value.toFixed(6);
            },
            filter: true,
        },
        {
            headerName: "Ngày giờ nhận",
            field: "receive_date",
            filter: true,
            minWidth: 200,
        },
        {
            headerName: "Người giao",
            field: "sender",
            filter: true,
            minWidth: 240,
        },
        {
            headerName: "Người nhận",
            field: "receiver",
            filter: true,
            minWidth: 240,
        },
        {
            headerName: "Kho nhận",
            field: "warehouse",
            filter: true,
            minWidth: 150,
        },

        {
            headerName: "Lệnh sản xuất",
            field: "production_order_sap",
            minWidth: 200,
            filter: true,
        },
        {
            headerName: "DocNum",
            field: "doc_num",
            minWidth: 200,
            filter: true,
        },
        {
            headerName: "MES NotiID",
            field: "mes_noti",
            minWidth: 200,
            filter: true,
        },
    ]);

    const localeText = useMemo(() => {
        return AG_GRID_LOCALE_VI;
    }, []);

    const groupDisplayType = "multipleColumns";
    const getRowStyle = (params) => {
        if (params.node.rowIndex % 2 === 0) {
            return { background: "#F6F6F6" };
        }
        return { background: "#ffffff" };
    };

    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            minWidth: 100,
        };
    }, []);

    const autoGroupColumnDef = useMemo(() => {
        return {
            headerName: "Tổ sản xuất",
            field: "resource", // Hiển thị giá trị nhóm đúng cột
            pinned: "left", // Pin về bên trái
            minWidth: 220,
            cellRendererParams: {
                suppressCount: false, // Hiển thị số lượng nhóm (nếu muốn)
            },
        };
    }, []);

    const statusBar = useMemo(() => {
        return {
            statusPanels: [
                {
                    key: "aUniqueString",
                    statusPanel: "agTotalRowCountComponent",
                    align: "left",
                },
                {
                    statusPanel: "agAggregationComponent",
                    statusPanelParams: {
                        // possible values are: 'count', 'sum', 'min', 'max', 'avg'
                        aggFuncs: ["avg", "sum"],
                    },
                },
            ],
        };
    }, []);

    const FactoryOption = ({ value, label }) => (
        <div
            className={`group hover:border-[#86ABBE] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-3xl border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all ${
                selectedFactory === value
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
                className={`${
                    selectedFactory === value
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
            <div className="overflow-x-hidden over xl:h-fit lg:h-fit md:h-fit h-screen">
                <div className="w-screen h-full p-6 px-5 xl:p-5 xl:px-12 ">
                    {/* Title */}
                    <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col items-center justify-between xL:space-x-6 lg:space-x-6 md:space-x-6 space-x-0 xL:space-y-0 lg:space-y-0 md:space-y-0 space-y-4 mb-3.5">
                        <div className="flex items-center space-x-4">
                            <div
                                className="p-2 hover:bg-gray-200 rounded-full cursor-pointer active:scale-[.87] active:duration-75 transition-all"
                                onClick={handleGoBack}
                            >
                                <FaArrowLeft className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex flex-col mb-0 pb-0">
                                <div className="text-sm  text-[#17506B]">
                                    Báo cáo chế biến gỗ
                                </div>
                                <div className="serif text-3xl font-bold xl:block lg:block md:block hidden">
                                    Báo cáo thông tin sản lượng nhận tại SAP
                                </div>
                                <div className="serif text-3xl font-bold xl:hidden lg:hidden md:hidden block">
                                    Báo cáo thông tin sản lượng giao nhận
                                </div>
                            </div>
                        </div>

                        {/* Search & Export */}
                        <div className="xl:w-1/2 lg:w-1/2 md:w-1/2 w-full items-center justify-between border-2 border-gray-300 p-2 px-4 pr-1 rounded-lg bg-[#F9FAFB] xl:display:flex lg:flex md:flex hidden">
                            <div className="flex items-center space-x-3 xl:w-2/3 lg:w-3/4 md:w-3/4 w-[90%] ">
                                <IoSearch className="w-6 h-6 text-gray-500 " />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tất cả..."
                                    className=" w-full focus:ring-transparent !outline-none bg-[#F9FAFB]  border-gray-30 ring-transparent border-transparent focus:border-transparent focus:ring-0"
                                />
                            </div>

                            <div className="flex justify-end items-center divide-x-2 xl:w-1/3 lg:w-1/4 md:w-1/4 w-[10%">
                                <div className="mx-2.5"></div>
                                <div>
                                    <FaArrowRotateLeft
                                        className="mx-2.5 w-[22px] h-[22px] text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all"
                                        onClick={handleResetFilter}
                                    />
                                </div>
                                <div>
                                    <FaArrowUpRightFromSquare
                                        className="mx-2.5 w-5 h-5 text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all xl:display:inline-block lg:inline-block md:inline-block hidden"
                                        onClick={handleExportExcel}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Responsive Search */}
                        <div className="xl:w-1/2 lg:w-1/2 md:w-1/2 w-full flex items-center justify-between border-2 border-gray-300 p-2 px-4 pr-1 rounded-lg bg-[#F9FAFB] xl:display:hidden lg:hidden md:hidden  ">
                            <div className="flex items-center space-x-3 xl:w-2/3 lg:w-3/4 md:w-3/4 w-[90%] ">
                                <IoSearch className="w-6 h-6 text-gray-500 " />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo quy cách..."
                                    className=" w-full focus:ring-transparent !outline-none bg-[#F9FAFB]  border-gray-30 ring-transparent border-transparent focus:border-transparent focus:ring-0"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>

                            <div className="flex justify-end items-center divide-x-2 xl:w-1/3 lg:w-1/4 md:w-1/4 w-[10%">
                                <div className="mx-2.5"></div>
                                <div>
                                    <FaArrowRotateLeft
                                        className="mx-2.5 w-[22px] h-[22px] text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all"
                                        onClick={handleResetFilter}
                                    />
                                </div>
                                <div>
                                    <FaArrowUpRightFromSquare
                                        className="mx-2.5 w-5 h-5 text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all xl:display:inline-block lg:inline-block md:inline-block hidden"
                                        onClick={handleExportExcel}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className=" bg-white rounded-xl py-2 pb-3 xl:display:block lg:block md:block hidden">
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
                            <div className="flex space-x-3 w-3/4 pl-3">
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

                        {/* Team Select */}
                        {selectedFactory && (
                            <div className=" border-2 border-[#C6D2D9] bg-[#f0faff] rounded-lg p-2 py-2 px-4 pb-4  m-2 mt-3 mx-4">
                                {isTeamLoading ? (
                                    <div className="text-center my-3 mt-6">
                                        <Spinner
                                            thickness="7px"
                                            speed="0.65s"
                                            emptyColor="gray.200"
                                            color="#155979"
                                            size="xl"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className={
                                            isDataReportLoading
                                                ? "opacity-50 pointer-events-none"
                                                : ""
                                        }
                                    >
                                        <div className="flex items-center justify-between space-x-3">
                                            <div className="font-semibold">
                                                Chọn các tổ thực hiện:
                                            </div>
                                            <div
                                                className="flex items-center space-x-2 font-semibold p-1 text-[#17506B] bg-[#c9dde6] px-3 rounded-lg cursor-pointer active:scale-[.87] active:duration-75 transition-all"
                                                onClick={handleSelectAll}
                                            >
                                                {selectAll && <IoClose />}
                                                {selectAll ? (
                                                    <div>Bỏ chọn tất cả</div>
                                                ) : (
                                                    <div>Chọn tất cả</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full grid grid-cols-5">
                                            <div className="col-span-1 space-y-2">
                                                <div className="text-[#155979] uppercase font-medium">
                                                    Runnen
                                                </div>
                                                {teamData
                                                    ?.filter(
                                                        (item) =>
                                                            item.CDOAN === "RN"
                                                    )
                                                    .sort((a, b) =>
                                                        a.Name.localeCompare(
                                                            b.Name
                                                        )
                                                    )
                                                    .map((item, index) => (
                                                        <div key={index}>
                                                            <Checkbox
                                                                value={
                                                                    item.Code
                                                                }
                                                                onChange={
                                                                    handleCheckboxChange
                                                                }
                                                                isChecked={selectedTeams.includes(
                                                                    item.Code
                                                                )}
                                                            >
                                                                {item.Name}
                                                            </Checkbox>
                                                        </div>
                                                    ))}
                                            </div>
                                            <div className="col-span-1 space-y-2 ">
                                                <div className="text-[#155979] uppercase font-medium">
                                                    Sơ chế
                                                </div>
                                                {teamData
                                                    ?.filter(
                                                        (item) =>
                                                            item.CDOAN === "SC"
                                                    )
                                                    .sort((a, b) =>
                                                        a.Name.localeCompare(
                                                            b.Name
                                                        )
                                                    )
                                                    .map((item, index) => (
                                                        <div key={index}>
                                                            <Checkbox
                                                                value={
                                                                    item.Code
                                                                }
                                                                onChange={
                                                                    handleCheckboxChange
                                                                }
                                                                isChecked={selectedTeams.includes(
                                                                    item.Code
                                                                )}
                                                            >
                                                                {item.Name}
                                                            </Checkbox>
                                                        </div>
                                                    ))}
                                            </div>
                                            <div className="col-span-1 space-y-2">
                                                <div className="text-[#155979] uppercase font-medium">
                                                    Tinh chế
                                                </div>
                                                {teamData
                                                    ?.filter(
                                                        (item) =>
                                                            item.CDOAN === "TC"
                                                    )
                                                    .sort((a, b) =>
                                                        a.Name.localeCompare(
                                                            b.Name
                                                        )
                                                    )
                                                    .map((item, index) => (
                                                        <div key={index}>
                                                            <Checkbox
                                                                value={
                                                                    item.Code
                                                                }
                                                                onChange={
                                                                    handleCheckboxChange
                                                                }
                                                                isChecked={selectedTeams.includes(
                                                                    item.Code
                                                                )}
                                                            >
                                                                {item.Name}
                                                            </Checkbox>
                                                        </div>
                                                    ))}
                                            </div>
                                            <div className="col-span-1 space-y-2">
                                                <div className="text-[#155979] uppercase font-medium">
                                                    Hoàn thiện
                                                </div>
                                                {teamData
                                                    ?.filter(
                                                        (item) =>
                                                            item.CDOAN === "HT"
                                                    )
                                                    .sort((a, b) =>
                                                        a.Name.localeCompare(
                                                            b.Name
                                                        )
                                                    )
                                                    .map((item, index) => (
                                                        <div key={index}>
                                                            <Checkbox
                                                                value={
                                                                    item.Code
                                                                }
                                                                onChange={
                                                                    handleCheckboxChange
                                                                }
                                                                isChecked={selectedTeams.includes(
                                                                    item.Code
                                                                )}
                                                            >
                                                                {item.Name}
                                                            </Checkbox>
                                                        </div>
                                                    ))}
                                            </div>
                                            <div className="col-span-1 space-y-2">
                                                <div className="text-[#155979] uppercase font-medium">
                                                    Đóng gói
                                                </div>
                                                {teamData
                                                    ?.filter(
                                                        (item) =>
                                                            item.CDOAN === "DG"
                                                    )
                                                    .sort((a, b) =>
                                                        a.Name.localeCompare(
                                                            b.Name
                                                        )
                                                    )
                                                    .map((item, index) => (
                                                        <div key={index}>
                                                            <Checkbox
                                                                value={
                                                                    item.Code
                                                                }
                                                                onChange={
                                                                    handleCheckboxChange
                                                                }
                                                                isChecked={selectedTeams.includes(
                                                                    item.Code
                                                                )}
                                                            >
                                                                {item.Name}
                                                            </Checkbox>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Responsive Header */}
                    <div className="border-2 border-gray-300 bg-white rounded-xl py-2 pb-3 xl:display:hidden lg:hidden md:hidden block">
                        {/*Filter */}
                        <div className="flex-col items-center space-y-3 px-4 mt-1 mb-1">
                            {/* Date Filter */}
                            <div className="flex space-x-3">
                                <div className="col-span-1 w-full">
                                    <label
                                        htmlFor="indate"
                                        className="block mb-1 font-medium text-gray-900 "
                                    >
                                        Từ ngày
                                    </label>
                                    <DatePicker
                                        selected={fromDateMobile}
                                        dateFormat="dd/MM/yyyy"
                                        onChange={(date) => {
                                            setFromDateMobile(date);
                                        }}
                                        className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                    />
                                </div>
                                <div className="col-span-1 w-full">
                                    <label
                                        htmlFor="indate"
                                        className="block mb-1 font-medium text-gray-900 "
                                    >
                                        Đến ngày
                                    </label>
                                    <DatePicker
                                        selected={toDateMobile}
                                        dateFormat="dd/MM/yyyy"
                                        onChange={(date) => {
                                            setToDateMobile(date);
                                        }}
                                        className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                    />
                                </div>
                            </div>

                            {/* Team Filter */}
                            <div className="flex space-x-3 w-full">
                                <div className="w-full">
                                    <label
                                        htmlFor="first_name"
                                        className="block mb-1 font-medium text-gray-900"
                                    >
                                        Chọn công đoạn
                                    </label>
                                    <Select
                                        placeholder="Chọn công đoạn..."
                                        options={teamOptions}
                                        defaultOptions
                                        onChange={(value) => {
                                            setSelectedTeamMobile(value);
                                            console.log(
                                                "Selected Team:",
                                                value
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {isDataReportLoading ? (
                        <div className="mt-4 bg-[#C2C2CB] items-center justify-center  p-2 px-4 pr-1 rounded-lg xl:flex lg:flex md:flex hidden">
                            <div className="dots my-1"></div>
                        </div>
                    ) : (
                        <>
                            {reportData?.length > 0 ? (
                                <div className="xl:display:block lg:block md:block hidden">
                                    <div
                                        className="ag-theme-quartz border-2 border-gray-300 rounded-lg mt-2 "
                                        style={{
                                            height: 630,
                                            fontSize: 16,
                                        }}
                                    >
                                        <AgGridReact
                                            ref={gridRef}
                                            rowData={rowData}
                                            columnDefs={colDefs}
                                            defaultColDef={defaultColDef}
                                            autoGroupColumnDef={
                                                autoGroupColumnDef
                                            }
                                            rowGroupPanelShow={"always"}
                                            groupDisplayType={groupDisplayType}
                                            getRowStyle={getRowStyle}
                                            // groupTotalRow={"bottom"}
                                            grandTotalRow={"bottom"}
                                            localeText={localeText}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 bg-[#C2C2CB] items-center justify-center  p-2 px-4 pr-1 rounded-lg xl:flex lg:flex md:flex hidden">
                                    Không có dữ liệu để hiển thị.
                                </div>
                            )}
                        </>
                    )}

                    {/* Responsive Contents */}
                    <div className="space-y-3 mt-4 xl:display:hidden lg:hidden md:hidden block">
                        <div className="text-left text-sm text-gray-500 ">
                            {reportDataMobile?.length || 0} kết quả
                        </div>
                        {/* Data */}
                        {isDataReportLoading ? (
                            <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                                <div className="dots my-1"></div>
                            </div>
                        ) : (
                            <>
                                {reportDataMobile?.length > 0 ? (
                                    <>
                                        {filteredData?.map((item, index) => (
                                            <div className="flex bg-gray-50 border-2 border-[#84b0c5] rounded-xl p-4">
                                                <div className="flex-col w-full">
                                                    <div className="text-xl font-semibold text-[#17506B] mb-1">
                                                        {item.ItemName}
                                                    </div>
                                                    <div className="grid grid-cols-2 font-semibold">
                                                        <span>Quy cách: </span>
                                                        <span className="font-normal">
                                                            {Number(item.U_CDay)}*
                                                            {Number(item.U_CRong)}
                                                            *{Number(item.U_CDai)}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 font-semibold mb-2">
                                                        <span>Số lượng: </span>
                                                        <span className="font-normal">
                                                            {parseInt(
                                                                item.Quantity
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 flex items-center w-full pl-3 ">
                                                        <div className="space-y-3 border-l-2 border-dashed border-gray-400 w-full">
                                                            <div className="relative w-full">
                                                                <FaArrowDown className="absolute -top-0.5 -ml-3.5 h-6 w-6 rounded-full text-white bg-blue-600 p-1" />
                                                                <div className="ml-6 p-4 py-2 rounded-xl bg-gray-200">
                                                                    <div className="flex-col  ">
                                                                        <div className="font-medium text-[15px]">
                                                                            Người
                                                                            giao:{" "}
                                                                        </div>
                                                                        <div className="font-semibold text-[17px] text-[#1B536E]">
                                                                            {
                                                                                item.DeliveryPerson
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex text-gray-500 space-x-2 items-center">
                                                                        <div>
                                                                            {/* {
                                                                                item.ngaygiao
                                                                            } */}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="relative w-full ">
                                                                {item.Recipient ? (
                                                                    <>
                                                                        <FaCheck className="absolute -top-0.5 -ml-3.5 h-6 w-6 rounded-full text-white bg-green-500 p-1" />
                                                                        <div className="ml-6 p-4 py-2 rounded-xl bg-gray-200">
                                                                            <div className="flex-col ">
                                                                                <div className="font-medium text-[15px]">
                                                                                    Người
                                                                                    nhận:{" "}
                                                                                </div>
                                                                                <div className="font-semibold text-[17px] text-[#1B536E]">
                                                                                    {
                                                                                        item.Recipient
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex text-gray-500 space-x-2 items-center">
                                                                                <div>
                                                                                    {
                                                                                        item.CreateDate + " " + item.CreateTime
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FaExclamation className="absolute -top-0.5 -ml-3.5 h-6 w-6 rounded-full text-white bg-orange-500 p-1" />
                                                                        <div className="ml-6 p-4 py-2 rounded-xl bg-gray-200">
                                                                            <div className="font-medium text-[15px]">
                                                                                Sản
                                                                                phẩm
                                                                                đang
                                                                                chờ
                                                                                nhận.
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pb-3"></div>
                                    </>
                                ) : (
                                    <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                                        Không có dữ liệu để hiển thị.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default ReceiptInSapReportCBG;
