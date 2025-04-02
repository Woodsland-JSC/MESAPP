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
    FaRegImage,
    FaExpand,
    FaDownLeftAndUpRightToCenter
} from "react-icons/fa6";
import { IoMdRadioButtonOff, IoMdRadioButtonOn, IoMdCheckbox, IoMdSquareOutline } from "react-icons/io";
import DatePicker from "react-datepicker";
import { formatNumber } from "../../../utils/numberFormat";
import { format, startOfDay, endOfDay } from "date-fns";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import {
    ModalOverlay,
    Modal,
    ModalHeader,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Spinner,
    useDisclosure
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import reportApi from "../../../api/reportApi";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
// import "ag-grid-charts-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import Chart from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import debounce from "../../../utils/debounce";
import useAppContext from "../../../store/AppContext";
import { getDDMM } from "../../../utils/convertDatetime";
import Loader from "../../../components/Loader";

const exampleData = [
    {
        week: 12,
        day: "Thứ 2",
        ItemCode: "SP001",
        ItemName: "Gỗ sồi đỏ 1m2",
        length: 100,
        width: 50,
        thickness: 10,
        quantity: 123,
        qc_type: "SP",
        workpiece_src: "Thuận Hưng",
        recipient: "Phạm Thị Thanh"
    },
    {
        week: 12,
        day: "Thứ 2",
        ItemCode: "SP002",
        ItemName: "Gỗ óc chó 2m4",
        length: 240,
        width: 60,
        thickness: 15,
        quantity: 85,
        qc_type: "NK",
        workpiece_src: "Yên Sơn",
        recipient: "Nguyễn Văn An"
    },
    {
        week: 12,
        day: "Thứ 3",
        ItemCode: "SP003",
        ItemName: "Gỗ thông 1m8",
        length: 180,
        width: 45,
        thickness: 12,
        quantity: 200,
        qc_type: "SP",
        workpiece_src: "Thái Bình",
        recipient: "Trần Minh Tuấn"
    },
    {
        week: 12,
        day: "Thứ 4",
        ItemCode: "SP004",
        ItemName: "Gỗ xoan 1m5",
        length: 150,
        width: 55,
        thickness: 8,
        quantity: 167,
        qc_type: "NK",
        workpiece_src: "Thuận Hưng",
        recipient: "Lê Thị Hương"
    },
    {
        week: 13,
        day: "Thứ 2",
        ItemCode: "SP005",
        ItemName: "Gỗ tràm 2m",
        length: 200,
        width: 40,
        thickness: 20,
        quantity: 145,
        qc_type: "SP",
        workpiece_src: "Yên Sơn",
        recipient: "Đặng Văn Bình"
    },
    {
        week: 13,
        day: "Thứ 3",
        ItemCode: "SP006",
        ItemName: "Gỗ cao su 1m2",
        length: 120,
        width: 35,
        thickness: 16,
        quantity: 178,
        qc_type: "NK",
        workpiece_src: "Thái Bình",
        recipient: "Hoàng Thị Mai"
    },
    {
        week: 13,
        day: "Thứ 5",
        ItemCode: "SP007",
        ItemName: "Gỗ sồi trắng 2m2",
        length: 220,
        width: 65,
        thickness: 14,
        quantity: 92,
        qc_type: "SP",
        workpiece_src: "Thuận Hưng",
        recipient: "Vũ Đình Long"
    },
    {
        week: 14,
        day: "Thứ 2",
        ItemCode: "SP008",
        ItemName: "Gỗ dẻ gai 1m6",
        length: 160,
        width: 48,
        thickness: 18,
        quantity: 134,
        qc_type: "NK",
        workpiece_src: "Yên Sơn",
        recipient: "Phạm Văn Đức"
    },
    {
        week: 14,
        day: "Thứ 4",
        ItemCode: "SP009",
        ItemName: "Gỗ lim 1m8",
        length: 180,
        width: 70,
        thickness: 22,
        quantity: 156,
        qc_type: "SP",
        workpiece_src: "Thái Bình",
        recipient: "Nguyễn Thị Lan"
    },
    {
        week: 14,
        day: "Thứ 6",
        ItemCode: "SP010",
        ItemName: "Gỗ trắc 1m4",
        length: 140,
        width: 42,
        thickness: 25,
        quantity: 89,
        qc_type: "NK",
        workpiece_src: "Thuận Hưng",
        recipient: "Trần Văn Hùng"
    }
];
function DetailsReceiptReport() {
    const navigate = useNavigate();

    const { user } = useAppContext();
    const gridRef = useRef();
    const chartRef = useRef(null);
    const chartRefMobile = useRef(null);

    const getFirstDayOfCurrentMonth = () => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const [loading, setLoading] = useState(true);
    const [groupData, setGroupData] = useState([{
        value: "All",
        label: "Tất cả"
    },
    {
        value: "LP",
        label: "Lựa phôi"
    },
    {
        value: "SC",
        label: "Sơ chế"
    },
    {
        value: "TC",
        label: "Tinh chế"
    },
    {
        value: "HT",
        label: "Hoàn thiện"
    },
    {
        value: "DG",
        label: "Đóng gói"
    }]);
    const [selectedUnit, setSelectedUnit] = useState('sl');
    const [keyword, setKeyword] = useState("");

    const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth());
    const [toDate, setToDate] = useState(new Date());
    const [factories, setFactories] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState('All');
    const [selectedGroup, setSelectedGroup] = useState([]);

    const [isDataReportLoading, setIsDataReportLoading] = useState(false);
    const [rowData, setRowData] = useState(Array.from({ length: 10 }, (_, i) =>
        exampleData.map((item) => ({
            ...item,
            id: item.id + i * exampleData.length,
        }))
    ).flat() || []);
    // const [rowData, setRowData] = useState([]);
    const [dailyChartData, setDailyChartData] = useState([]);

    const updateColumnDefs = (colDefs) => {
        return colDefs.map(colDef => {
            if (colDef.enableRowGroup) {
                return { ...colDef, hide: true };
            }
            return colDef;
        });
    };

    const colDefs = useMemo(() => {
        return updateColumnDefs([
            {
                field: 'week',
                headerName: 'Tuần',
                // rowGroup: true,
                // enableRowGroup: true,
                suppressHeaderMenuButton: true,
                filter: true,
            },
            {
                field: "day",
                headerName: "Thứ",
                // rowGroup: true,
                // enableRowGroup: true,
                width: 180,
                filter: true,
                // hide: true,
            },

            {
                field: 'ItemCode',
                headerName: 'Item',
                minWidth: 150
            },
            {
                headerName: "Chi tiết cụm",
                field: "ItemName",
                width: 350,
                suppressHeaderMenuButton: true,
                filter: true,
            },
            {
                headerName: "Dài",
                field: "length",
                width: 100,
                suppressHeaderMenuButton: true,
                filter: true,
            },
            {
                headerName: "Rộng",
                field: "width",
                width: 100,
                suppressHeaderMenuButton: true,
                filter: true,
            },
            {
                headerName: "Dày",
                field: "thickness",
                width: 100,
                suppressHeaderMenuButton: true,
                filter: true,
            },
            {
                headerName: "Số lượng",
                field: "quantity",
                width: 170,
                suppressHeaderMenuButton: true,
                valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                aggFunc: "sum",
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                        : { textAlign: "right" },
            },
            {
                headerName: "Loại QC",
                field: "qc_type",
                width: 170,
                suppressHeaderMenuButton: true,
                filter: true,
            },
            {
                headerName: "Nguồn phôi",
                field: "workpiece_src",
                width: 170,
                suppressHeaderMenuButton: true,
                filter: true,
            },
            {
                headerName: "Người nhận",
                field: "recipient",
                width: 170,
                suppressHeaderMenuButton: true,
                filter: true,
            },
        ]);

    }, []);

    const excelStyles = [
        {
            id: 'header',
            font: { bold: true, size: 12 },
            alignment: { wrapText: true, horizontal: 'Center', vertical: 'Center' },
            borders: {
                borderBottom: { style: 'thin', color: '#000000' },
                borderTop: { style: 'thin', color: '#000000' },
                borderLeft: { style: 'thin', color: '#000000' },
                borderRight: { style: 'thin', color: '#000000' },
            },
        },
        {
            id: 'cell',
            alignment: { wrapText: true },
            borders: {
                borderBottom: { style: 'thin', color: '#000000' },
                borderTop: { style: 'thin', color: '#000000' },
                borderLeft: { style: 'thin', color: '#000000' },
                borderRight: { style: 'thin', color: '#000000' },
            },
        },
    ];

    // const [reportData, setReportData] = useState(exampleData || []);
    const [reportData, setReportData] = useState([]);
    const [dailyData, setDailyData] = useState([]);

    const getRowStyle = (params) => {
        if (params.node.rowPinned) {
            return {
                backgroundColor: "#B9E0F6",
                fontWeight: "bold",
            };
        }
        return null;
    };

    const aggregateItemsByDay = (data) => {
        const groupMap = new Map();

        data.forEach(item => {
            const key = `${item.ItemCode}_${item.U_To}_${item.U_CDOAN}`;

            if (!groupMap.has(key)) {
                groupMap.set(key, {
                    ...item,
                    SLThanh: Number(item.SLThanh),
                    M3: Number(item.M3)
                });
            } else {
                const existingItem = groupMap.get(key);
                existingItem.SLThanh += Number(item.SLThanh);
                existingItem.M3 += Number(item.M3);
            }
        });

        return Array.from(groupMap.values());
    };

    const getReportData = async () => {
        // let params = {};

        // setIsDataReportLoading(true);

        // if (selectedTimeRange === 'day') {
        //     params = {
        //         fromDate: format(fromDate, "yyyy-MM-dd"),
        //         toDate: format(toDate, "yyyy-MM-dd"),
        //     };

        //     try {
        //         let dailyRes = await reportApi.getProductionVolumeByDay(
        //             params.fromDate,
        //             params.toDate
        //         )

        //         let formattedData;

        //         // formattedData = aggregateItemsByDay(dailyRes);
        //         formattedData = dailyRes?.map((item) => ({
        //             // stage: item.U_CDOAN,
        //             date: new Date(item.DocDate),
        //             factory: item.U_FAC,
        //             stage: convertStageName(item.U_CDOAN),
        //             targetProduct: item.NameSPdich,
        //             productCode: item.ItemCode,
        //             group_name: item.U_To,
        //             year: item.Years,
        //             week: item.WEEK,
        //             weekday: "Thứ 6", //
        //             itemname: item.ItemName,
        //             category: item.CHUNGLOAI,
        //             thickness: item.U_CDay,
        //             width: item.U_CRong,
        //             length: item.U_CDai,
        //             unit: "Tấm",
        //             quantity: Number(item.SLThanh),
        //             volume: Number(item.M3)
        //         }));
        //         console.log("Daily 1: ", formattedData)

        //         setDailyData(formattedData);
        //     } catch (error) {
        //         console.error(error);
        //         toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
        //     }
        // } else {
        //     const currentDate = new Date();
        //     const currentYear = currentDate.getFullYear();
        //     const selectedYear = fromYear.getFullYear();

        //     const startDate = new Date(selectedYear, 0, 1);

        //     const endDate = selectedYear === currentYear
        //         ? currentDate
        //         : new Date(selectedYear, 11, 31);

        //     params = {
        //         fromDate: format(startDate, "yyyy-MM-dd"),
        //         toDate: format(endDate, "yyyy-MM-dd"),
        //     };
        //     setDailyData([])
        // }

        // try {
        //     let res = await reportApi.getProductionVolumeByTime(
        //         params.fromDate,
        //         params.toDate
        //     );

        //     setReportData(res);

        //     if (selectedFactory !== 'All') {
        //         res = res.filter(data => data.U_FAC === selectedFactory);
        //         if (!selectedGroup.some(group => group.value === 'All')) {
        //             res = res.filter(data => selectedGroup.some(group => group === data.U_To));
        //         }
        //     }

        //     let formattedData;

        //     switch (selectedTimeRange) {
        //         case 'day':
        //             formattedData = aggregateItemsByDay(res);
        //             formattedData = formattedData?.map((item) => ({
        //                 // stage: item.U_CDOAN,
        //                 factory: item.U_FAC,
        //                 stage: convertStageName(item.U_CDOAN),
        //                 targetProduct: item.NameSPdich,
        //                 productCode: item.ItemCode,
        //                 group_name: item.U_To,
        //                 year: item.Years,
        //                 week: item.WEEK,
        //                 weekday: "Thứ 6", //
        //                 itemname: item.ItemName,
        //                 category: item.CHUNGLOAI,
        //                 thickness: item.U_CDay,
        //                 width: item.U_CRong,
        //                 length: item.U_CDai,
        //                 unit: "Tấm",
        //                 quantity: Number(item.SLThanh),
        //                 volume: Number(item.M3)
        //             }));
        //             break;
        //         case 'week':
        //             formattedData = aggregateItemsByWeek(res);
        //             break;
        //         case 'month':
        //             formattedData = aggregateItemsByMonth(res);
        //             break;
        //         default:
        //             break;
        //     }

        //     setRowData(formattedData);
        // } catch (error) {
        //     console.error(error);
        //     toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
        // } finally {
        //     setIsDataReportLoading(false);
        // }
    }
    // }, [fromDate, toDate, fromYear, selectedTimeRange, selectedGroup, selectedFactory]);

    // DONE
    const handleFactorySelect = async (factory) => {
        setSelectedFactory(factory);

        let res = [...reportData];

        if (factory !== 'All') {
            res = reportData.filter(data => data.U_FAC == factory)
            const uniqueGroups = [...new Set(res.map(item => item.U_To))]
                .map(group => ({
                    value: group,
                    label: group
                }));
            setGroupData([{
                value: "All",
                label: "Tất cả"
            }, ...uniqueGroups]);
            setSelectedGroup(['All', ...[...new Set(res.map(item => item.U_To))]]);
        } else {
            setGroupData([])
        }

        let formattedData;

        formattedData = aggregateItemsByDay(res);
        formattedData = formattedData?.map((item) => ({
            // stage: item.U_CDOAN,
            factory: item.U_FAC,
            stage: convertStageName(item.U_CDOAN),
            targetProduct: item.NameSPdich,
            productCode: item.ItemCode,
            group_name: item.U_To,
            year: item.Years,
            week: item.WEEK,
            weekday: "Thứ 6", //
            itemname: item.ItemName,
            category: item.CHUNGLOAI,
            thickness: item.U_CDay,
            width: item.U_CRong,
            length: item.U_CDai,
            unit: "Tấm",
            quantity: Number(item.SLThanh),
            volume: Number(item.M3)
        }));

        setRowData(formattedData);
    };

    // DONE
    const handleGroupSelect = async (group) => {
        let currentGroups;
        if (group == "All") {
            if (selectedGroup?.length < groupData?.length) {
                currentGroups = [
                    ...groupData.map(group => group.value)
                ];
                setSelectedGroup(currentGroups)
            } else {
                currentGroups = []
                setSelectedGroup([])
            }
        } else {
            const exists = selectedGroup.includes(group);

            if (exists) {
                currentGroups = selectedGroup.filter((w) => (w !== group) && (w !== "All"));
            } else {
                const newValue = [...selectedGroup.filter((w) => w !== "All"), group]
                if (newValue.length == groupData.length - 1) {
                    currentGroups = [
                        ...groupData.map(group => group.value)
                    ]
                } else currentGroups = newValue;
            }

            setSelectedGroup(currentGroups);
        }

        let res = [...reportData];

        if (selectedFactory !== 'All') {
            res = reportData.filter(data => data.U_FAC === selectedFactory);
            if (!currentGroups.some(group => group.value === 'All')) {
                res = res.filter(data => currentGroups.some(group => group === data.U_To));
            }
        }

        let formattedData;


        formattedData = aggregateItemsByDay(res);
        formattedData = formattedData?.map((item) => ({
            factory: item.U_FAC,
            stage: convertStageName(item.U_CDOAN),
            targetProduct: item.NameSPdich,
            productCode: item.ItemCode,
            group_name: item.U_To,
            year: item.Years,
            week: item.WEEK,
            weekday: "Thứ 6",
            itemname: item.ItemName,
            category: item.CHUNGLOAI,
            thickness: item.U_CDay,
            width: item.U_CRong,
            length: item.U_CDai,
            unit: "Tấm",
            quantity: Number(item.SLThanh),
            volume: Number(item.M3)
        }));

        setRowData(formattedData);
    };

    const FactoryOption = ({ value, label }) => (
        <div
            className={`group hover:border-[#1d2326] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-3xl border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all ${selectedFactory === value
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

    const GroupOption = ({ value, label }) => (
        <div
            className={`group hover:border-[#86ABBE] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-md border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all ${selectedGroup?.includes(value)
                ? "border-[#86ABBE] bg-[#eaf8ff]"
                : "border-gray-300"
                }`}
            onClick={() => handleGroupSelect(value)}
        >
            {selectedGroup?.includes(value) ? (
                <IoMdCheckbox className="w-5 h-6 text-[#17506B]" />
            ) : (
                <IoMdSquareOutline className="w-5 h-6 text-gray-400 group-hover:text-[#17506B]" />
            )}
            <div
                className={`${selectedGroup.includes(value)
                    ? "text-[#17506B] font-medium"
                    : "text-gray-400 group-hover:text-[#17506B]"
                    }`}
            >
                {label}
            </div>
        </div>
    );

    const handleResetFilter = () => {
        setSelectedFactory(null);
        setSelectedGroup([]);
        setSelectedUnit("")
        setFromDate(getFirstDayOfCurrentMonth());
        setToDate(new Date());
        // setSelectAll(false);
        // setIsReceived(true);
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

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleQuickFilterDebounced = debounce((value, api) => {
        if (api) {
            api.setGridOption('quickFilterText', value);
        }
    }, 300);

    const handleQuickFilter = (event) => {
        const value = event.target.value;
        setKeyword(value);
        if (gridRef?.current?.api) {
            handleQuickFilterDebounced(value, gridRef.current.api);
        }
    };

    const handleClearQuickFilter = () => {
        setKeyword('');
        if (gridRef?.current?.api) {
            gridRef.current.api.setGridOption('quickFilterText', '')
        }
    }

    const generateRandomData = (length, min, max) => {
        return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    };

    const convertStageName = (code) => {
        switch (code) {
            case 'LP':
                return 'Lựa phôi';
            case 'SC':
                return 'Sơ chế';
            case 'TC':
                return 'Tinh chế';
            case 'HT':
                return 'Hoàn thiện';
            case 'DG':
                return 'Đóng gói';
            default:
                return code
        }
    }

    useEffect(() => {
        if (dailyData && dailyData.length > 0) {
            let res = [...dailyData];


            if (selectedFactory !== 'All') {
                res = res.filter(data => data.factory === selectedFactory);
                console.log("Daily ", res)
                if (!selectedGroup.some(group => group.value === 'All')) {
                    res = res.filter(data => selectedGroup.some(group => group === data.group_name));
                }
            }

            const dates = [];
            const start = new Date(fromDate);
            const end = new Date(toDate);
            const current = new Date(start);

            while (current <= end) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }

            const stageResults = {
                'Lựa phôi': Array(dates.length).fill(0),
                'Sơ chế': Array(dates.length).fill(0),
                'Tinh chế': Array(dates.length).fill(0),
                'Hoàn thiện': Array(dates.length).fill(0),
                'Đóng gói': Array(dates.length).fill(0)
            };
            // console.log("Daily 2: ", dates)

            res.forEach(item => {
                const itemDate = new Date(item.date);

                const dateIndex = dates.findIndex(date =>
                    date.getDate() === itemDate.getDate() &&
                    date.getMonth() === itemDate.getMonth() &&
                    date.getFullYear() === itemDate.getFullYear()
                );

                if (dateIndex !== -1) {
                    const value = selectedUnit === 'sl' ? Number(item.quantity) : Number(item.volume);
                    if (stageResults[item.stage]) {
                        stageResults[item.stage][dateIndex] += value;
                    }
                }
            });

            console.log("Daily 2: ", stageResults)

            setDailyChartData(stageResults);
        }
    }, [dailyData, selectedUnit, selectedFactory, selectedGroup])

    const {
        isOpen: isModalOpen,
        onOpen: onModalOpen,
        onClose: onModalClose,
    } = useDisclosure();

    const getAllFactory = async () => {
        try {
            const response = await reportApi.getCBGFactory();
            console.log("Nhà máy: ", response)
            response.unshift({
                U_FAC: 'All',
                Name: 'Tất cả'
            })
            // const response = await axios.get('/api/factories');
            setFactories(response);
        } catch (error) {
            console.error(error);
            toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getAllFactory();
    }, [])

    useEffect(() => {
        const allFieldsFilled = (fromDate && toDate);
        if (allFieldsFilled) {
            getReportData();
        } else {
            console.log("Không thể gọi API vì không đủ thông tin");
        }
    }, [fromDate, toDate])

    return (
        <Layout>
            <div className="overflow-x-hidden">
                <div className="w-screen p-6 px-5 xl:p-5 xl:px-12 ">
                    {/* Title */}
                    <div className="flex flex-col tablet:flex-row items-center justify-between gap-3 mb-3.5">
                        <div className="flex w-full tablet:w-auto items-center space-x-4">
                            <div
                                className="p-2 hover:bg-gray-200 rounded-full cursor-pointer active:scale-[.87] active:duration-75 transition-all"
                                onClick={handleGoBack}
                            >
                                <FaArrowLeft className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex flex-col mb-0 pb-0">
                                <div className="text-sm text-[#17506B]">
                                    Báo cáo chế biến gỗ
                                </div>
                                <div className=" text-2xl font-semibold">
                                    Báo cáo chi tiết nhập tồn
                                </div>
                            </div>
                        </div>

                        {/* Search & Export */}
                        <div className="w-full tablet:w-fit gap-4 flex items-center justify-between border-2 border-gray-300 p-2 px-4 pr-1  rounded-lg bg-[#F9FAFB]">
                            <div className="flex items-center space-x-3 w-2/3">
                                <IoSearch className="w-6 h-6 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tất cả..."
                                    className="w-full tablet:w-72 focus:ring-transparent !outline-none bg-[#F9FAFB]  border-gray-30 ring-transparent border-transparent focus:border-transparent focus:ring-0"
                                    value={keyword}
                                    onChange={handleQuickFilter}
                                />
                                <IoClose className={`${keyword.length > 0 ? 'visible' : 'invisible'} hover:cursor-pointer`} onClick={handleClearQuickFilter} />
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
                                <div>
                                    <PiFilePdfBold
                                        className="mx-2.5 w-6 h-6 text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all"
                                        onClick={handleExportPDF}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="border-2 border-gray-300 bg-white rounded-xl py-2 pb-3">
                        {/* Filter */}
                        <div className="flex flex-col lg:flex-row flex-wrap min-[1649px]:flex-nowrap items-center px-4 mt-1 gap-3">
                            <div className="flex gap-3 w-full lg:w-1/4">
                                <div className="col-span-1 w-full">
                                    <label
                                        htmlFor="indate"
                                        className="block mb-1 text-sm t font-medium text-gray-900 "
                                    >
                                        Từ ngày
                                    </label>
                                    <DatePicker
                                        selected={fromDate}
                                        dateFormat="dd/MM/yyyy"
                                        onChange={(date) => {
                                            setFromDate(date);
                                            if (
                                                fromDate &&
                                                toDate &&
                                                selectedFactory &&
                                                isReceived &&
                                                selectedTeams
                                            ) {
                                                // getReportData();
                                            }
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
                                            if (
                                                fromDate &&
                                                toDate &&
                                                selectedFactory &&
                                                isReceived &&
                                                selectedTeams
                                            ) {
                                                // getReportData();
                                            }
                                        }}
                                        className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col min-[1649px]:pl-3 w-full min-[1649px]:border-l-2 lg:border-gray-100 mb-3">
                                <label
                                    htmlFor="indate"
                                    className="block mb-1 text-sm font-medium whitespace-nowrap text-gray-900"
                                >
                                    Chọn nhà máy
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {
                                        factories && factories.length > 0 && factories.map(factory => (
                                            <div className="col-span-1 w-full">
                                                <FactoryOption
                                                    value={factory.U_FAC}
                                                    label={factory.Name || factory.U_FAC}
                                                />
                                            </div>
                                        ))
                                    }
                                    {/* <div className="col-span-1 w-full">
                                        <FactoryOption
                                            value="TH"
                                            label="Thuận Hưng"
                                        />
                                    </div>
                                    <div className="col-span-1 w-full flex items-end">
                                        <FactoryOption
                                            value="YS"
                                            label="Yên Sơn"
                                        />
                                    </div>
                                    <div className="col-span-1 w-full flex items-end">
                                        <FactoryOption
                                            value="TB"
                                            label="Thái Bình"
                                        />
                                    </div>
                                    <div className="col-span-1 w-full flex items-end">
                                        <FactoryOption
                                            value="CBG"
                                            label="Khối chế biến gỗ"
                                        />
                                    </div> */}
                                </div>
                            </div>

                        </div>
                        {
                            selectedFactory && selectedFactory !== 'All' && (
                                <div className="flex flex-col lg:flex-row flex-wrap 2xl:flex-nowrap items-center px-4 mt-1 gap-3 mb-3">
                                    <div className="flex flex-col w-full mt-1">
                                        <label
                                            htmlFor="indate"
                                            className="block mb-1 text-sm font-medium whitespace-nowrap text-gray-900"
                                        >
                                            Chọn kho
                                        </label>
                                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                                            {
                                                groupData && groupData.length > 0 && groupData.map(group => (
                                                    <div className="col-span-1 w-full sm:w-[200px]">
                                                        <GroupOption
                                                            value={group.value}
                                                            label={group.label}
                                                        />
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </div>

                    {/* Content */}
                    {isDataReportLoading ? (
                        <div className="mt-2 bg-[#dbdcdd] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                            <div className="dots"></div>
                        </div>
                    ) : (
                        <>
                            {rowData?.length > 0 ? (
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
                                            excelStyles={excelStyles}
                                            rowGroupPanelShow={"always"}
                                            // groupDisplayType="groupRows"
                                            animateRows={true}
                                            suppressAggFuncInHeader
                                            getRowStyle={getRowStyle}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 bg-[#dbdcdd] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                                    Không có dữ liệu để hiển thị.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            {loading && <Loader />}
        </Layout>
    )
}

export default DetailsReceiptReport