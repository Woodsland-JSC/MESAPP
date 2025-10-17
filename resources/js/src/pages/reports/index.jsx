import React, {
    useCallback,
    useMemo,
    useRef,
    useState,
    useEffect,
} from "react";
import { Link } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import useAppContext from "../../store/AppContext";
import Select from "react-select";
import { dateToDateTime } from "../../utils/convertDatetime";
import { MdOutlineRefresh } from "react-icons/md";
import { TbRefresh } from "react-icons/tb";
import { FaArrowRight } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import { FaMobileScreenButton } from "react-icons/fa6";
import { HiClipboard } from "react-icons/hi";
import {
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Tooltip,
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import Layout from "../../layouts/layout";
import Loader from "../../components/Loader";
import AG_GRID_LOCALE_VI from "../../utils/locale.vi";

const sizeOptions = [
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
    { value: "200", label: "200" },
];

const SAYReports = [
    {
        id: "0001",
        name: "Biên bản vào lò",
        link: "/reports/wood-drying/kiln-loading",
        description: "Thông tin biên bản vào lò.",
        // updated: true,
        // permission: ''
    },
    // {
    //     id: "0002",
    //     name: "Biên bản lịch sử vào lò",
    //     link: "/reports/wood-drying/kiln-loading-history",

    // },
    {
        id: "0003",
        name: "Biên bản kiểm tra lò sấy",
        link: "/reports/wood-drying/kiln-checking",
        description: "Thông tin kiểm tra lò sấy của các lò đang hoạt động.",
        // priority: true,
    },
    // {
    //     id: "0004",
    //     name: "Biên bản kiểm tra độ ẩm",
    //     link: "/reports/wood-drying/humidity-check",
    // },
    // {
    //     id: "0005",
    //     name: "Báo cáo lò đang sấy",
    //     link: "/reports/wood-drying/drying-kilns",
    // },
    {
        id: "0006",
        name: "Báo cáo kế hoạch sấy",
        link: "/reports/wood-drying/drying-plan",
        description: "Thông tin về các kế hoạch sấy đang thực hiện.",
        // priority: true,
    },
    {
        id: "0007",
        name: "Báo cáo xếp sấy khối chế biến gỗ",
        link: "/reports/wood-drying/wood-drying",
        description:
            "Báo cáo sản lượng xếp sấy, vào lò, ra lò của các nhà máy chế biến gỗ.",
        // updated: true,
    },
    {
        id: "0010",
        name: "Báo cáo xếp chờ sấy",
        link: "/reports/wood-drying/drying-queue",
        description: "Báo cáo thông tin xếp chờ sấy.",
        // updated: true,
    },
];

const CBGReports = [
    {
        id: "0001",
        name: "Báo cáo thông tin sản lượng nhận tại SAP.",
        link: "/reports/wood-working/receipt-in-sap",
        description:
            "Báo cáo thông tin sản lượng ghi nhận về SAP của từng nhà máy.",
        // priority: true,
    },
    {
        id: "0002",
        name: "Báo cáo thông tin chi tiết giao nhận",
        link: "/reports/wood-working/delivery-detail",
        description:
            "Chi tiết trạng thái và số lượng giao nhận của từng tổ, nhà máy trong một khoảng thời gian.",
        // priority: true,
        responsive: true,
    },
    {
        id: "0003",
        name: "Báo cáo biện pháp xử lý lỗi",
        link: "/reports/wood-working/defect-resolution",
        description:
            "Chi tiết thông tin xử lý lỗi của từng nhà máy trong một khoảng thời gian.",
        // priority: true,
    },
    {
        id: "0004",
        name: "Báo cáo tồn nguyên vật liệu xử lý lỗi",
        link: "/reports/wood-working/defect-stock-checking",
        description:
            "Khuyến nghị số lượng bán thành phẩm cần bổ sung để xử lý lỗi.",
        // priority: true,
    },
    // {
    //     id: "0005",
    //     name: "Báo cáo lệnh sản xuất đang thực hiện",
    //     link: "/reports/wood-working/wip-production-order",
    //     description: "Báo các các lệnh sản xuất đang thực hiện bao gồm cả các lệnh đã quá hạn.",
    //     priority: true,
    // },
    {
        id: "0006",
        name: "Báo cáo sản lượng theo ngày/tuần/tháng",
        link: "/reports/wood-working/production-volume-by-time",
        description:
            "Xem sản lượng đã được giao nhận trong giai đoạn (ngày, tuần, tháng) theo từng tổ (công đoạn tiếp theo xác nhận)",
        // priority: true,
    },
    {
        id: "0007",
        name: "Báo cáo sản lượng chi tiết theo tuần",
        link: "/reports/wood-working/production-volume-weekly-detail",
        description: "Xem sản lượng đã được giao nhận chi tiết theo từng tuần",
        // priority: true,
    },
    {
        id: "0008",
        name: "Báo cáo nhập xuất tồn từng công đoạn",
        link: "/reports/wood-working/import-export-inventory-by-stage",
        description: "Kiểm tra số lượng nhập xuất tồn từng công đoạn",
        // priority: true,
    },
    {
        id: "0009",
        name: "Báo cáo sản lượng theo lệnh sản xuất",
        link: "/reports/wood-working/production-output-by-production-order",
        description:
            "Theo dõi sản lượng và tiến độ hoàn thành theo lệnh sản xuất",
        // priority: true,
    },
    {
        id: "0010",
        name: "Báo cáo điều chuyển các nhà máy",
        link: "/reports/wood-working/factory-transfer",
        description: "Theo dõi số lượng điều chuyển kho giữa các nhà máy",
        // priority: true,
    },
    // {
    //     id: "0011",
    //     name: "Báo cáo chi tiết nhập tồn",
    //     link: "/reports/wood-working/details-receipt",
    //     description: "Theo dõi chi tiết nhập tồn đầu kỳ",
    //     priority: true,
    // },
    // {
    //     id: "0012",
    //     name: "Báo cáo sản lượng nhập các nhà máy",
    //     link: "/reports/wood-working/factory-receipt-volume",
    //     description: "",
    //     priority: true,
    // },
    {
        id: "0013",
        name: "Biên bản xử lý sản phẩm không phù hợp",
        link: "/reports/wood-working/report-resolution",
        description: "Biên bản xử ly sản phẩm không phù hợp"
    },
    {
        id: "0014",
        name: "Báo cáo sản lượng quy đổi",
        link: "/reports/wood-working/san-luong-quy-doi",
        description: "Báo cáo sản lượng quy đổi"
    },
];

const QCReports = [
    {
        id: "0001",
        name: "Biên bản xử lý QC",
        link: "/reports/plywoods/defect-handling",
        priority: false,
    },
    {
        id: "0002",
        name: "Báo cáo biện pháp xử lý lỗi",
        link: "/reports/plywoods/defect-resolution",
        // priority: true,
    },
    {
        id: "0003",
        name: "Báo cáo số lượng lỗi từng công đoạn",
        link: "/reports/plywoods/defect-quantity",
        priority: false,
    },
];

const VCNReports = [
    {
        id: "0001",
        name: "Báo cáo thông tin sản lượng nhận tại SAP.",
        link: "/reports/plywoods/receipt-in-sap",
        description:
            "Báo cáo thông tin sản lượng ghi nhận về SAP của từng nhà máy.",
        // priority: true,
    },
        {
        id: "0003",
        name: "Báo cáo biện pháp xử lý lỗi (VCN)",
        link: "/reports/plywoods/defect-handling",
              description:
            "Chi tiết thông tin xử lý lỗi của từng nhà máy trong một khoảng thời gian.",
        // priority: true,
    },
    {
        id: "0002",
        name: "Báo cáo nhập xuất tồn từng công đoạn",
        link: "/reports/plywoods/import-export-inventory-by-stage",
        description:
            "Kiểm tra số lượng nhập xuất tồn từng công đoạn.",
        // priority: true,
    },
    {
        id: "0003",
        name: "Báo cáo sản lượng theo lệnh sản xuất",
        link: "/reports/plywoods/production-output-by-production-order",
        description: "Theo dõi sản lượng và tiến độ hoàn thành theo lệnh sản xuất.",
        // priority: true,
    },
    {
        id: "0004",
        name: "Báo cáo sản lượng theo ngày/tuần/tháng",
        link: "/reports/plywoods/production-volume-by-time",
        description:
            "Xem sản lượng đã được giao nhận trong giai đoạn (ngày, tuần, tháng) theo từng tổ (công đoạn tiếp theo xác nhận)",
        // priority: true,
    },
    // {
    //     id: "0001",
    //     name: "Báo cáo tổng sản lượng ngày - tuần - tháng (VCN)",
    //     link: "/reports/plywoods/production-volume-by-time",
    //     priority: false,
    //     responsive: true,
    // },
    // {
    //     id: "0002",
    //     name: "Báo cáo chi tiết thông tin giao nhận (VCN)",
    //     link: "/reports/plywoods/delivered-quantity-details",
    //     priority: false,
    //     responsive: false,
    // },
    // {
    //     id: "0005",
    //     name: "Báo cáo Lệnh sản xuất",
    //     link: "/reports/plywoods/production-order",
    //     description:
    //         "Xem chi tiết lệnh sản xuất VCN",
    // },

];

const DANDReports = [
    // {
    //     id: "0001",
    //     name: "Báo cáo chi tiết thông tin giao nhận (Dự kiến)",
    //     link: "/reports/domestic/qc-handling",
    //     temporaty: true,
    //     responsive: true,
    // },
    // {
    //     id: "0002",
    //     name: "Báo cáo chi tiết tiến độ lắp đặt (Dự kiến)",
    //     link: "/reports/domestic/defect-resolution",
    //     temporaty: true,
    // },
];

const tabParamMap = {
    0: "wood-drying",
    1: "wood-working",
    2: "plywoods",
};

function Report() {
    const { user } = useAppContext();
    const { loading, setLoading } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [tabIndex, setTabIndex] = useState(0);

    const reportTab = useRef();
    const recordTab = useRef();
    const reportGridRef = useRef();
    const recordGridRef = useRef();

    const containerStyle = useMemo(
        () => ({ width: "100%", height: "100%" }),
        []
    );
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

    const localeText = useMemo(() => {
        return AG_GRID_LOCALE_VI;
    }, []);

    const [reportData, setReportData] = useState([]);
    const [recordData, setRecordData] = useState([]);

    const [reportColumnDefs, setReportColumnDefs] = useState([
        {
            headerName: "#",
            valueGetter: function (params) {
                return params.node.rowIndex + 1;
            },
            width: 70,
            maxWidth: 70,
        },
        {
            headerName: "Tên báo cáo",
            field: "name",
            cellRenderer: (params) => {
                return <Link to={params.data.link}>{params.data.name}</Link>;
            },
            minWidth: 170,
        },
    ]);

    const [recordColumnDefs, setRecordColumnDefs] = useState([
        {
            headerName: "#",
            valueGetter: function (params) {
                return params.node.rowIndex + 1;
            },
            width: 70,
            maxWidth: 70,
        },
        {
            headerName: "Tên biên bản",
            field: "name",
            cellRenderer: (params) => {
                return <Link to={params.data.link}>{params.data.name}</Link>;
            },
            minWidth: 170,
        },
    ]);

    const autoGroupColumnDef = useMemo(() => {
        return {
            headerName: "Group",
            minWidth: 170,
            field: "id",
            valueGetter: (params) => {
                if (params.node.group) {
                    return params.node.key;
                } else {
                    return params.data[params.colDef.field];
                }
            },
            headerCheckboxSelection: true,
            cellRenderer: "agGroupCellRenderer",
            cellRendererParams: {
                checkbox: true,
            },
        };
    }, []);

    const defaultColDef = useMemo(() => {
        return {
            editable: false,
            enableRowGroup: true,
            enablePivot: true,
            enableValue: true,
            sortable: true,
            resizable: true,
            filter: true,
            flex: 1,
            minWidth: 100,
        };
    }, []);

    const paginationNumberFormatter = useCallback((params) => {
        return "[" + params.value.toLocaleString() + "]";
    }, []);

    const onReportGridReady = useCallback(async () => {
        showLoadingReport();
        // const res = await usersApi.getAllUsers();
        setTimeout(() => {
            setReportData(exampleData);
        }, 1000);
        hideLoadingReport();
    }, []);

    const onRecordGridReady = useCallback(async () => {
        showLoadingRecord();
        // const res = await usersApi.getAllUsers();
        setTimeout(() => {
            setRecordData(exampleData1);
        }, 1000);
        hideLoadingRecord();
    }, []);

    const onFirstReportDataRendered = useCallback((params) => {
        reportGridRef.current.api.paginationGoToPage(0);
    }, []);

    const onFirstRecordDataRendered = useCallback((params) => {
        recordGridRef.current.api.paginationGoToPage(0);
    }, []);

    const onReportFilterTextBoxChanged = useCallback(() => {
        reportGridRef.current.api.setQuickFilter(
            document.getElementById("search").value
        );
    }, []);

    const onRecordFilterTextBoxChanged = useCallback(() => {
        reportGridRef.current.api.setQuickFilter(
            document.getElementById("record-search").value
        );
    }, []);

    const filterReports = (reports, userRole) => {
        return reports.filter((item) => {
            const isAdminOnly = item.onlyAdmin === true;
            const isAllowed = !isAdminOnly || userRole == 1;

            const matchesSearch = item.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            return isAllowed && matchesSearch;
        });
    };

    const filteredCBGReports = useMemo(
        () => filterReports(CBGReports, user?.role),
        [CBGReports, searchTerm, user?.role]
    );

    const filteredSAYReports = useMemo(
        () => filterReports(SAYReports, user?.role),
        [SAYReports, searchTerm, user?.role]
    );
    const filteredVCNReports = useMemo(
        () => filterReports(VCNReports),
        [VCNReports, searchTerm]
    );
    const filteredDANDReports = useMemo(
        () => filterReports(DANDReports),
        [DANDReports, searchTerm]
    );
    const filteredQCReports = useMemo(
        () => filterReports(QCReports),
        [QCReports, searchTerm]
    );

    const showLoadingReport = useCallback(() => {
        reportGridRef.current.api.showLoadingOverlay();
    }, []);

    const showLoadingRecord = useCallback(() => {
        recordGridRef.current.api.showLoadingOverlay();
    }, []);

    const hideLoadingReport = useCallback(() => {
        reportGridRef.current.api.hideOverlay();
    }, []);

    const hideLoadingRecord = useCallback(() => {
        recordGridRef.current.api.hideOverlay();
    }, []);

    const handleRetryGrid = async () => {
        toast("Chức năng đang được phát triển.");
    };

    // Reverse mapping for looking up index from param value
    const paramToIndex = Object.fromEntries(
        Object.entries(tabParamMap).map(([index, param]) => [
            param,
            Number(index),
        ])
    );

    // Handle tab change and update URL query parameter
    const handleTabsChange = (index) => {
        setTabIndex(index);
        const params = new URLSearchParams(window.location.search);
        params.set("tab", tabParamMap[index]); // Set the 'tab' query param to the mapped value
        window.history.replaceState(
            null,
            "",
            `${window.location.pathname}?${params.toString()}`
        );
    };

    useEffect(() => {
        document.title = "Woodsland - Báo cáo";
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        if (tab && paramToIndex[tab] !== undefined) {
            setTabIndex(paramToIndex[tab]);
        } else {
            const params = new URLSearchParams(window.location.search);
            params.set("tab", tabParamMap[0]);
            window.history.replaceState(
                null,
                "",
                `${window.location.pathname}?${params.toString()}`
            );
        }

        // Cleanup on unmount
        return () => {
            document.title = "Woodsland";
        };
    }, []);

    return (
        <Layout>
            <div className="flex justify-center bg-transparent min-h-screen ">
                {/* Section */}
                <div className="w-screen xl:mb-4 mb-6 p-6 px-5 xl:p-8 xl:px-32 ">
                    {/* Header */}
                    <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col xl:items-center lg:items-center md:items-center xl:justify-between lg:justify-between md:justify-between mb-3">
                        <div className="serif text-4xl font-bold">
                            Danh mục báo cáo
                        </div>

                        {/* Controller */}
                        <div className="xl:w-2/3 lg:w-2/3 md:w-2/3 w-full flex xl:items-center lg:items-center md:items-center xl:justify-between lg:justify-between md:justify-between">
                            <div className="flex w-full justify-end space-x-4">
                                <div className="xl:w-1/2 lg:w-1/2 md:w-1/2 w-full xl:mt-0 lg:mt-0 md:mt-0 mt-3">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                            <svg
                                                className="w-4 h-4 text-gray-500"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            id="record-search"
                                            className="block w-full p-2.5 pl-11 text-gray-900 border border-gray-300 rounded-xl bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Tìm kiếm báo cáo"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main content */}

                    <section className="bg-white rounded-xl border-2 mb-2 border-gray-200">
                        <Tabs
                            index={tabIndex}
                            onChange={handleTabsChange}
                            size="lg"
                        >
                            <TabList className="">
                                <Tab
                                    ref={reportTab}
                                // onClick={() => handleTabClick(false)}
                                >
                                    <div className="text-base font-medium">
                                        Báo cáo sấy phôi
                                    </div>
                                </Tab>
                                <Tab
                                    ref={recordTab}
                                // onClick={() => handleTabClick(true)}
                                >
                                    <div className="text-base font-medium">
                                        Báo cáo chế biến gỗ
                                    </div>
                                </Tab>
                                <Tab
                                    ref={recordTab}
                                // onClick={() => handleTabClick(true)}
                                >
                                    <div className="text-base font-medium">
                                        Báo cáo ván công nghiệp
                                    </div>
                                </Tab>
                                {/* <Tab
                                    ref={recordTab}
                                    // onClick={() => handleTabClick(true)}
                                >
                                    <div className="text-base font-medium">
                                        Báo cáo dự án nội địa
                                    </div>
                                </Tab> */}
                            </TabList>

                            <TabPanels>
                                {/* Báo cáo sấy phôi */}
                                <TabPanel
                                    className="space-y-4"
                                    style={gridStyle}
                                >
                                    {/* Report Components */}
                                    {filteredSAYReports.length === 0 ? (
                                        <div className="py-3 text-gray-500">
                                            Không có báo cáo được tìm thấy.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-y-3">
                                            {filteredSAYReports.map(
                                                (item, index) => (
                                                    <Link
                                                        to={item.link}
                                                        key={index}
                                                        className=""
                                                    >
                                                        <div className="group flex justify-between items-center border-2 border-blue-50 hover:bg-gray-900 hover:cursor-pointer p-2.5 px-4 bg-gray-100 rounded-xl w-full ">
                                                            <div className="flex items-center gap-x-6">
                                                                <div className="group-hover:bg-[#5d6170] p-2 rounded-full bg-[#17506B]">
                                                                    <HiClipboard className="  text-white w-5 h-5 " />
                                                                </div>
                                                                <div className="flex flex-col justify-center ">
                                                                    <div className="flex items-center gap-x-4 text-[17px] font-semibold group-hover:text-white">
                                                                        {
                                                                            item.name
                                                                        }
                                                                        {item.priority ==
                                                                            true && (
                                                                                // <FaStar className="text-[16px] text-yellow-500 group-hover:text-white xl:block lg:block md:block hidden" />
                                                                                <div className="text-xs h-fit text-white p-0.5 px-2 bg-gradient-to-r from-cyan-700 to-cyan-600 rounded-lg">
                                                                                    NEW
                                                                                </div>
                                                                            )}
                                                                        {item.updated ==
                                                                            true && (
                                                                                // <FaStar className="text-[16px] text-yellow-500 group-hover:text-white xl:block lg:block md:block hidden" />
                                                                                <div className="text-xs h-fit text-white p-0.5 px-2 bg-gradient-to-r from-purple-800 to-red-800 rounded-lg">
                                                                                    UPDATED
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                    <div className="text-sm xl:inline-block lg:inline-block md:hidden hidden text-gray-500">
                                                                        {
                                                                            item.description
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <FaArrowRight className="group-hover:text-white w-5 h-5" />
                                                        </div>
                                                    </Link>
                                                )
                                            )}
                                        </div>
                                    )}
                                </TabPanel>

                                {/* Báo cáo chế biến gỗ */}
                                <TabPanel
                                    className="space-y-4"
                                    style={gridStyle}
                                >
                                    {filteredCBGReports.length === 0 ? (
                                        <div className="py-3 text-gray-500">
                                            Không có báo cáo được tìm thấy.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-y-3">
                                            {filteredCBGReports.map(
                                                (item, index) => (
                                                    <Link
                                                        to={item.link}
                                                        key={index}
                                                        className=""
                                                    >
                                                        <div className="group flex justify-between items-center border-2 border-blue-50 hover:bg-gray-900 hover:cursor-pointer p-2.5 px-4 bg-gray-100 rounded-xl ">
                                                            <div className="flex items-center w-[95%] xl:gap-x-6 lg:gap-x-6 md:gap-x-6 gap-x-4">
                                                                <div className="group-hover:bg-[#30323A] p-2 rounded-full bg-gray-900">
                                                                    <HiClipboard className="  text-white w-5 h-5 " />
                                                                </div>

                                                                <div className="flex w-full justify-between items-center">
                                                                    <div className="flex flex-col justify-center ">
                                                                        <div className="flex items-center gap-x-4 text-[17px] font-semibold group-hover:text-white">
                                                                            {
                                                                                item.name
                                                                            }
                                                                            {item.priority ==
                                                                                true && (
                                                                                    // <FaStar className="text-[16px] text-yellow-500 group-hover:text-white xl:block lg:block md:block hidden" />
                                                                                    <div className="xl:block lg:block md:block hidden text-xs h-fit w-fit text-white p-0.5 px-2 bg-gradient-to-r from-cyan-700 to-cyan-600 rounded-lg">
                                                                                        NEW
                                                                                    </div>
                                                                                )}
                                                                            {item.updated ==
                                                                                true && (
                                                                                    // <FaStar className="text-[16px] text-yellow-500 group-hover:text-white xl:block lg:block md:block hidden" />
                                                                                    <div className="xl:block lg:block md:block hidden text-xs h-fit text-white p-0.5 px-2 bg-gradient-to-r from-purple-800 to-red-800 rounded-lg">
                                                                                        UPDATED
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                        <div className="text-sm xl:inline-block lg:inline-block md:hidden hidden text-gray-500">
                                                                            {
                                                                                item.description
                                                                            }
                                                                        </div>
                                                                    </div>

                                                                    {item.responsive ==
                                                                        true && (
                                                                            <Tooltip
                                                                                label="Tương thích trên di động."
                                                                                fontSize="sm"
                                                                            >
                                                                                <span>
                                                                                    <FaMobileScreenButton className="text-[18px] text-green-600 group-hover:text-white xl:block lg:block md:block hidden" />
                                                                                </span>
                                                                            </Tooltip>
                                                                        )}
                                                                </div>
                                                            </div>
                                                            <FaArrowRight className="group-hover:text-white w-5 h-5" />
                                                        </div>
                                                    </Link>
                                                )
                                            )}
                                        </div>
                                    )}
                                </TabPanel>

                                {/* Báo cáo ván công nghiệp */}
                                <TabPanel
                                    className="space-y-4"
                                    style={gridStyle}
                                >
                                    {filteredVCNReports.length === 0 ? (
                                        <div className="py-3 text-gray-500">
                                            Không có báo cáo được tìm thấy.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-y-3">
                                            {filteredVCNReports.map(
                                                (item, index) => (
                                                    <Link
                                                        to={item.link}
                                                        key={index}
                                                        className=""
                                                    >
                                                        <div className="group flex justify-between items-center border-2 border-blue-50 hover:bg-gray-900 hover:cursor-pointer p-2.5 px-4 bg-gray-100 rounded-xl ">
                                                            <div className="flex items-center w-[95%] xl:gap-x-6 lg:gap-x-6 md:gap-x-6 gap-x-4">
                                                                <div className="group-hover:bg-[#30323A] p-2 rounded-full bg-gray-900">
                                                                    <HiClipboard className="  text-white w-5 h-5 " />
                                                                </div>

                                                                <div className="flex w-full justify-between items-center">
                                                                    <div className="flex flex-col justify-center ">
                                                                        <div className="flex items-center gap-x-4 text-[17px] font-semibold group-hover:text-white">
                                                                            {item.name}
                                                                            {item.priority ==
                                                                                true && (
                                                                                    <div className="xl:block lg:block md:block hidden text-xs h-fit w-fit text-white p-0.5 px-2 bg-gradient-to-r from-cyan-700 to-cyan-600 rounded-lg">
                                                                                        NEW
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                        <div className="text-sm xl:inline-block lg:inline-block md:hidden hidden text-gray-500">
                                                                            {
                                                                                item.description
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    {item.responsive ==
                                                                        true && (
                                                                            <Tooltip
                                                                                label="Tương thích trên di động."
                                                                                fontSize="sm"
                                                                            >
                                                                                <span>
                                                                                    <FaMobileScreenButton className="text-[18px] text-green-600 group-hover:text-white xl:block lg:block md:block hidden" />
                                                                                </span>
                                                                            </Tooltip>
                                                                        )}
                                                                </div>
                                                            </div>
                                                            <FaArrowRight className="group-hover:text-white w-5 h-5" />
                                                        </div>
                                                    </Link>
                                                )
                                            )}
                                        </div>
                                    )}
                                </TabPanel>

                                {/* Báo cáo dự án nội địa */}
                                <TabPanel
                                    className="space-y-4"
                                    style={gridStyle}
                                >
                                    {filteredDANDReports.length === 0 ? (
                                        <div className="py-3 text-gray-500">
                                            Không có báo cáo được tìm thấy.
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-y-3">
                                            {filteredDANDReports.map(
                                                (item, index) => (
                                                    <Link
                                                        to={item.link}
                                                        key={index}
                                                        className=""
                                                    >
                                                        <div className="group flex justify-between items-center border-2 border-blue-50 hover:bg-gray-900 hover:cursor-pointer p-2 px-4 bg-gray-100 rounded-xl ">
                                                            <div className="flex items-center gap-x-4">
                                                                <div className="group-hover:bg-[#30323A] p-2 rounded-full bg-gray-900">
                                                                    <HiClipboard className="  text-white w-5 h-5 " />
                                                                </div>
                                                                <div className="text-[16px] group-hover:text-white">
                                                                    {item.name}
                                                                </div>
                                                                {item.priority ==
                                                                    true && (
                                                                        <FaStar className="text-[16px] text-yellow-500 group-hover:text-white xl:block lg:block md:block hidden" />
                                                                    )}
                                                            </div>
                                                            <FaArrowRight className="group-hover:text-white w-5 h-5" />
                                                        </div>
                                                    </Link>
                                                )
                                            )}
                                        </div>
                                    )}
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </section>
                    <div className="py-4"></div>
                </div>
            </div>

            {loading && <Loader />}
        </Layout >
    );
}

export default Report;
