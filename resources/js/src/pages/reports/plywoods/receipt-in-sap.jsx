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
import Loader from "../../../components/Loader";

function ReceiptInSapReportVCN() {
    const navigate = useNavigate();

    const { user } = useAppContext();
    const gridRef = useRef();
    const abortControllerRef = useRef(null);
    const abortControllerMobileRef = useRef(null);

    const getFirstDayOfCurrentMonth = () => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    // Date picker
    const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth());
    const [toDate, setToDate] = useState(new Date());
    const [factories, setFactories] = useState([]);
    const [fromDateMobile, setFromDateMobile] = useState(
        getFirstDayOfCurrentMonth()
    );
    const [toDateMobile, setToDateMobile] = useState(new Date());

    // Loading States
    const [loading, setLoading] = useState(true);
    const [isTeamLoading, setIsTeamLoading] = useState(false);
    const [isDataReportLoading, setIsDataReportLoading] = useState(false);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [selectedTeamMobile, setSelectedTeamMobile] = useState(null);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const [isReceived, setIsReceived] = useState(true);

    // Data
    const [stages, setStages] = useState([]);
    const [teamData, setTeamData] = useState([]);
    const [teamOptions, setTeamOptions] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [reportDataMobile, setReportDataMobile] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = useMemo(() => {
        return reportDataMobile?.filter((item) => {
            const searchValue =
                `${item.CDay}x${item.CRong}x${item.CDai}`.toLowerCase();
            return searchValue.includes(searchTerm.toLowerCase());
        });
    }, [reportDataMobile, searchTerm]);

    const handleFactorySelect = async (factory) => {
        setSelectedFactory(factory);
        setReportData(null);
        setTeamData([]);
        setSelectedTeams([]);
        await getTeamData(factory);
    };

    const getTeamData = async (param) => {
        setIsTeamLoading(true);
        try {
            const res = await reportApi.getTeamByFactory(param, "VCN");
            setIsTeamLoading(false);
            setTeamData(res);
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
                const allTeamCodes = teamData?.map((item) => item.Code);
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

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        try {
            const res = await reportApi.getReceiptInSAPReport(
                params.from_date,
                params.to_date,
                params.plant,
                params.To,
                "VCN",
                { signal }
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
                    item.CreateTime +
                    " " +
                    moment(item.CreateDate).format("DD/MM/YYYY"),
                production_order_sap: item.ProductionOrderSAP,
                production_order_mes: item.ProductionOrderMES,
                mes_noti: item.U_UUID,
                m3_sap: item.M3SAP,
            }));
            setIsDataReportLoading(false);
            setRowData(formattedData);
            setReportData(res);
        } catch (error) {
            if (error.name === "AbortError" || signal.aborted) {
                return;
            }
            console.error(error);
            toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
        } finally {
            if (!signal.aborted) {
                setIsDataReportLoading(false);
                abortControllerRef.current = null;
            }
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

        setIsDataReportLoading(true);

        if (abortControllerMobileRef.current) {
            abortControllerMobileRef.current.abort();
        }

        abortControllerMobileRef.current = new AbortController();
        const { signal } = abortControllerMobileRef.current;

        try {
            const res = await reportApi.getDeliveryDetailReportVCN(
                params.status_code,
                params.To,
                params.branch,
                params.plant,
                params.from_date,
                params.to_date,
                { signal }
            );
            setIsDataReportLoading(false);
            setReportDataMobile(res);
        } catch (error) {
            if (error.name === "AbortError" || signal.aborted) {
                return;
            }
            console.error(error);
            toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
        } finally {
            if (!signal.aborted) {
                setIsDataReportLoading(false);
                abortControllerRef.current = null;
            }
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
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                setIsDataReportLoading(false);
            }
            setRowData([]);
            setReportData([]);
            console.log("Không thể gọi API vì không đủ thông tin");
        }
    }, [selectedTeams, selectedFactory, fromDate, toDate, getReportData]);

    useEffect(() => {
        const allFieldsFilledMobile =
            selectedTeamMobile && fromDateMobile && toDateMobile;
        if (allFieldsFilledMobile) {
            getReportDataMobile();
        } else {
            if (abortControllerMobileRef.current) {
                abortControllerMobileRef.current.abort();
                setIsDataReportLoading(false);
            }
            setReportDataMobile([]);
            console.log("Không thể gọi API vì không đủ thông tin. (Mobile)");
        }
    }, [fromDateMobile, toDateMobile, selectedTeamMobile, getReportDataMobile]);

    const getAllFactory = async () => {
        try {
            const response = await reportApi.getVCNFactory();
            setFactories(response);
        } catch (error) {
            console.error(error);
            // toast.error("Đã xảy ra lỗi khi lấy dữ liệu nhà máy.");
        } finally {
            setLoading(false);
        }
    };

    const getAllStage = async () => {
        try {
            const response = await reportApi.getStageByDivision("VCN");
            setStages(response);
        } catch (error) {
            console.error(error);
            // toast.error("Đã xảy ra lỗi khi lấy dữ liệu công đoạn.");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([getAllStage(), getAllFactory()]);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Đã xảy ra lỗi khi tải dữ liệu.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // New Get All Group
    useEffect(() => {
        const userPlant =
            user?.plant === "YS1" || user?.plant === "YS2" ? "YS" : user?.plant;

        let stageOrder = null;

        if (stages && stages.length > 0) {
            stageOrder = stages.reduce((acc, cur) => {
                acc[cur.Code] = Number(cur.U_Order);
                return acc;
            }, {});
        }

        reportApi
            .getTeamByFactory(userPlant, "VCN")
            .then((response) => {
                let res = response;
                if (stageOrder) {
                    res = res.sort((a, b) => {
                        const orderA = stageOrder[a.CDOAN] || 999;
                        const orderB = stageOrder[b.CDOAN] || 999;
                        return orderA - orderB;
                    });
                } else {
                    res = res.sort((a, b) => a.Name.localeCompare(b.Name));
                }
                const options = res
                    .map((item) => ({
                        value: item.Code || "",
                        label: item.Name || "",
                    }))
                    .filter((option) => option.label);
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
            width: 200,
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
            width: 50,
            pinned: "left",
            suppressHeaderMenuButton: true,
            filter: true,
            valueFormatter: (params) => formatNumber(Number(params.value) || 0),
        },
        {
            headerName: "Rộng",
            field: "width",
            width: 50,
            pinned: "left",
            suppressHeaderMenuButton: true,
            valueFormatter: (params) => formatNumber(Number(params.value) || 0),
            filter: true,
        },
        {
            headerName: "Dài",
            field: "height",
            width: 50,
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
            width: 120,
            aggFunc: "sum",
            headerComponentParams: { displayName: "M3" },
            valueFormatter: (params) => {
                const value = Number(params?.value); // ép kiểu về number
                return isNaN(value) ? "0.000000" : value.toFixed(6);
            },
            filter: true,
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
            headerName: "Ngày giờ nhận",
            field: "receive_date",
            filter: true,
            minWidth: 200,
        },
        {
            headerName: "Lệnh sản xuất",
            field: "production_order_mes",
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
            minWidth: 150,
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
                                    Báo cáo ván công nghiệp
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
                                            // if (
                                            //     isReceived !== null &&
                                            //     selectedTeams !== null &&
                                            //     selectedTeams.length > 0 &&
                                            //     selectedFactory &&
                                            //     fromDate &&
                                            //     toDate
                                            // ) {
                                            //     getReportData();
                                            // }
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
                                            // if (
                                            //     isReceived !== null &&
                                            //     selectedTeams !== null &&
                                            //     selectedTeams.length > 0 &&
                                            //     selectedFactory &&
                                            //     fromDate &&
                                            //     toDate
                                            // ) {
                                            //     getReportData();
                                            // }
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
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        {factories &&
                                            factories.length > 0 &&
                                            factories.map((factory) => (
                                                <div
                                                    key={factory.U_FAC}
                                                    className="col-span-1 w-full"
                                                >
                                                    <FactoryOption
                                                        value={factory.U_FAC}
                                                        label={
                                                            factory.Name ||
                                                            factory.U_FAC
                                                        }
                                                    />
                                                </div>
                                            ))}
                                    </div>
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
                                    <div>
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
                                        <div
                                            className="w-full grid"
                                            style={{
                                                gridTemplateColumns: `repeat(${
                                                    stages?.length
                                                        ? stages.length
                                                        : 5
                                                }, minmax(0, 1fr))`,
                                            }}
                                        >
                                            {stages &&
                                                stages.length > 0 &&
                                                stages.map((stage, index) => (
                                                    <div
                                                        key={index}
                                                        className="col-span-1 space-y-2"
                                                    >
                                                        <div className="text-[#155979] uppercase font-medium">
                                                            {stage.Name}
                                                        </div>
                                                        {teamData?.filter(
                                                                (item) =>
                                                                    item.CDOAN ===
                                                                    stage.Code
                                                            )
                                                            .sort((a, b) =>
                                                                a.Name.localeCompare(
                                                                    b.Name
                                                                )
                                                            )
                                                            .map(
                                                                (
                                                                    item,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
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
                                                                            {
                                                                                item.Name
                                                                            }
                                                                        </Checkbox>
                                                                    </div>
                                                                )
                                                            )}
                                                    </div>
                                                ))}
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
                                <div>
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
                                            <div
                                                key={index}
                                                className="flex bg-gray-50 border-2 border-[#84b0c5] rounded-xl p-4"
                                            >
                                                <div className="flex-col w-full">
                                                    <div className="text-xl font-semibold text-[#17506B] mb-1">
                                                        {item.ItemName}
                                                    </div>
                                                    <div className="grid grid-cols-2 font-semibold">
                                                        <span>Quy cách: </span>
                                                        <span className="font-normal">
                                                            {Number(item.CDay)}*
                                                            {Number(item.CRong)}
                                                            *{Number(item.CDai)}
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
                                                                                item.NguoiGiao
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex text-gray-500 space-x-2 items-center">
                                                                        <div>
                                                                            {
                                                                                item.ngaygiao
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="relative w-full ">
                                                                {item.NguoiNhan ? (
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
                                                                                        item.NguoiNhan
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex text-gray-500 space-x-2 items-center">
                                                                                <div>
                                                                                    {
                                                                                        item.ngaynhan
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
            {loading && <Loader />}
        </Layout>
    );
}

export default ReceiptInSapReportVCN;
