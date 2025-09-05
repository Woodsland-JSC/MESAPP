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
import AG_GRID_LOCALE_VI from "../../../utils/locale.vi";
import {
    FaArrowRotateLeft,
    FaArrowUpRightFromSquare,
    FaRegImage,
    FaExpand,
} from "react-icons/fa6";
import { IoMdRadioButtonOff, IoMdRadioButtonOn, IoMdCheckbox, IoMdSquareOutline, IoMdCheckmark } from "react-icons/io";
import DatePicker from "react-datepicker";
import { formatNumber } from "../../../utils/numberFormat";
import { format } from "date-fns";
import { Switch } from '@chakra-ui/react'
import {
    ModalOverlay,
    Modal,
    ModalHeader,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    useDisclosure
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import reportApi from "../../../api/reportApi";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Bar } from 'react-chartjs-2';
import debounce from "../../../utils/debounce";
import useAppContext from "../../../store/AppContext";
import { getDDMM } from "../../../utils/convertDatetime";
import Loader from "../../../components/Loader";

function ProductionVolumeByTimeReport() {
    const navigate = useNavigate();

    const { user } = useAppContext();
    const gridRef = useRef();
    const abortControllerRef = useRef(null);
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
    const [selectedTimeRange, setSelectedTimeRange] = useState("day");
    const [selectedUnit, setSelectedUnit] = useState('sl');
    const [isDisplayBarChart, setIsDisplayBarChart] = useState(false);
    const [keyword, setKeyword] = useState("");

    const [fromYear, setFromYear] = useState(new Date());
    const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth());
    const [toDate, setToDate] = useState(new Date());
    const [factories, setFactories] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState('All');
    const [selectedGroup, setSelectedGroup] = useState([]);

    const [isDataReportLoading, setIsDataReportLoading] = useState(false);
    // const [rowData, setRowData] = useState(Array.from({ length: 10 }, (_, i) =>
    //     exampleData.map((item) => ({
    //         ...item,
    //         id: item.id + i * exampleData.length,
    //     }))
    // ).flat() || []);
    const [rowData, setRowData] = useState([]);
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
        if (!selectedTimeRange) return [];

        switch (selectedTimeRange) {
            case "day":
                return updateColumnDefs([
                    {
                        field: 'stage',
                        headerName: 'Công đoạn',
                        rowGroup: true,
                        enableRowGroup: true,
                        suppressHeaderMenuButton: true,
                        filter: true,
                    },
                    {
                        headerName: "Tổ hiện tại",
                        field: "group_name",
                        rowGroup: true,
                        enableRowGroup: true,
                        width: 180,
                        filter: true,
                        // hide: true,
                    },
                    {
                        field: 'targetProduct',
                        headerName: 'Sản phẩm đích',
                        rowGroup: true,
                        enableRowGroup: true,
                        filter: true,
                    },
                    {
                        headerName: "Mã thị trường",
                        field: "targetSKU",
                        width: 200,
                        suppressHeaderMenuButton: true,
                        filter: true,
                        valueGetter: (params) => {
                            const rowGroupColumns = params.api.getRowGroupColumns();
                            const isGroupedByTargetCode = rowGroupColumns.some(col => col.getColId() === 'targetProduct');

                            if (isGroupedByTargetCode) {
                                if (params.node.group && params.node.field === 'targetProduct') {
                                    const firstChild = params.node.allLeafChildren[0];
                                    return firstChild ? firstChild.data.targetSKU : '';
                                }
                                return null;
                            }

                            return params.data ? params.data.targetSKU : null;
                        }
                    },
                    {
                        field: 'productCode',
                        headerName: 'Mã KT',
                        minWidth: 150,
                        filter: true,
                    },
                    {
                        headerName: "Tên",
                        field: "itemname",
                        width: 350,
                        suppressHeaderMenuButton: true,
                        filter: true,
                    },
                    {
                        headerName: "Dài",
                        field: "length",
                        width: 100,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                                : { textAlign: "center" },
                    },
                    {
                        headerName: "Rộng",
                        field: "width",
                        width: 100,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                                : { textAlign: "center" },
                    },
                    {
                        headerName: "Dày",
                        field: "thickness",
                        width: 100,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                                : { textAlign: "center" },
                    },
                    {
                        headerName: "Sản lượng",
                        field: "quantity",
                        width: 170,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: "M3",
                        field: "volume",
                        width: 220,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        hide: selectedUnit === "sl" && selectedTimeRange != 'day',
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                ]);
            case "week":
                const weekColumns = Array.from({ length: 53 }, (_, index) => ({
                    headerName: `Tuần ${index + 1}`,
                    field: selectedUnit == 'sl' ? `SLWeek${index + 1}` : `M3Week${index + 1}`,
                    width: 130,
                    suppressHeaderMenuButton: true,
                    filter: true,
                    valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                    aggFunc: "sum",
                    cellStyle: (params) =>
                        params.node.rowPinned
                            ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                            : { textAlign: "right" },
                }));
                return updateColumnDefs([
                    {
                        field: 'stage',
                        headerName: 'Công đoạn',
                        rowGroup: true,
                        enableRowGroup: true,
                        suppressHeaderMenuButton: true,
                        filter: true,
                    },
                    {
                        headerName: "Tổ hiện tại",
                        field: "group_name",
                        rowGroup: true,
                        hide: true,
                        width: 180,
                        filter: true,
                    },
                    {
                        field: 'targetProduct',
                        headerName: 'Thành phẩm/bán thành phẩm',
                        rowGroup: true,
                        enableRowGroup: true,
                    },
                    {
                        headerName: "Mã thị trường",
                        field: "targetSKU",
                        width: 200,
                        suppressHeaderMenuButton: true,
                        filter: true,
                        valueGetter: (params) => {
                            const rowGroupColumns = params.api.getRowGroupColumns();
                            const isGroupedByTargetCode = rowGroupColumns.some(col => col.getColId() === 'targetProduct');

                            if (isGroupedByTargetCode) {
                                if (params.node.group && params.node.field === 'targetProduct') {
                                    const firstChild = params.node.allLeafChildren[0];
                                    return firstChild ? firstChild.data.targetSKU : '';
                                }
                                return null;
                            }

                            return params.data ? params.data.targetSKU : null;
                        }
                    },
                    {
                        headerName: "Tên",
                        field: "itemname",
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
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                                : { textAlign: "center" },
                    },
                    {
                        headerName: "Rộng",
                        field: "width",
                        width: 100,
                        suppressHeaderMenuButton: true,
                        filter: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                                : { textAlign: "center" },
                    },
                    {
                        headerName: "Dày",
                        field: "thickness",
                        width: 100,
                        suppressHeaderMenuButton: true,
                        filter: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                                : { textAlign: "center" },
                    },
                    {
                        headerName: "Chủng loại",
                        field: "category",
                        width: 170,
                        suppressHeaderMenuButton: true,
                        filter: true,
                    },
                    {
                        headerName: "Tổng",
                        field: "SLThanhTotal",
                        width: 180,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        hide: selectedUnit === "m3",
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: "Tổng khối lượng (M3)",
                        field: "M3Total",
                        width: 220,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        hide: selectedUnit === "sl" && selectedTimeRange != 'day',
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    ...weekColumns,
                ]);
            case "month":
                const monthColumns = Array.from({ length: 12 }, (_, index) => ({
                    headerName: `Tháng ${index + 1}`,
                    field: selectedUnit == 'sl' ? `SLMonth${index + 1}` : `M3Month${index + 1}`,
                    width: 130,
                    suppressHeaderMenuButton: true,
                    filter: true,
                    valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                    aggFunc: "sum",
                    cellStyle: (params) =>
                        params.node.rowPinned
                            ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                            : { textAlign: "right" },
                }));
                return updateColumnDefs([
                    {
                        field: 'stage',
                        headerName: 'Công đoạn',
                        rowGroup: true,
                        enableRowGroup: true,
                        suppressHeaderMenuButton: true,
                        filter: true,
                    },
                    {
                        headerName: "Tổ hiện tại",
                        field: "group_name",
                        rowGroup: true,
                        hide: true,
                        width: 180,
                        filter: true,
                    },
                    {
                        field: 'targetProduct',
                        headerName: 'Thành phẩm/bán thành phẩm',
                        rowGroup: true,
                        enableRowGroup: true,
                    },
                    {
                        headerName: "Mã thị trường",
                        field: "targetSKU",
                        width: 200,
                        suppressHeaderMenuButton: true,
                        filter: true,
                        valueGetter: (params) => {
                            const rowGroupColumns = params.api.getRowGroupColumns();
                            const isGroupedByTargetCode = rowGroupColumns.some(col => col.getColId() === 'targetProduct');

                            if (isGroupedByTargetCode) {
                                if (params.node.group && params.node.field === 'targetProduct') {
                                    const firstChild = params.node.allLeafChildren[0];
                                    return firstChild ? firstChild.data.targetSKU : '';
                                }
                                return null;
                            }

                            return params.data ? params.data.targetSKU : null;
                        }
                    },
                    {
                        headerName: "Tên",
                        field: "itemname",
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
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                                : { textAlign: "center" },
                    },
                    {
                        headerName: "Rộng",
                        field: "width",
                        width: 100,
                        suppressHeaderMenuButton: true,
                        filter: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                                : { textAlign: "center" },
                    },
                    {
                        headerName: "Dày",
                        field: "thickness",
                        width: 100,
                        suppressHeaderMenuButton: true,
                        filter: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                                : { textAlign: "center" },
                    },
                    {
                        headerName: "Chủng loại",
                        field: "category",
                        width: 170,
                        suppressHeaderMenuButton: true,
                        filter: true,
                    },
                    {
                        headerName: "Tổng",
                        field: "SLThanhTotal",
                        width: 180,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        hide: selectedUnit === "m3",
                        aggFunc: "sum",
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: "Tổng khối lượng (M3)",
                        field: "M3Total",
                        width: 220,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        hide: selectedUnit === "sl" && selectedTimeRange != 'day',
                        aggFunc: "sum",
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    ...monthColumns,
                ]);
            default:
                return [];
        }
    }, [selectedTimeRange, selectedUnit]);

    const localeText = useMemo(() => {
        return AG_GRID_LOCALE_VI;
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

        const stageOrder = { LP: 1, SC: 2, BTP: 3, TC: 4, HT: 5, DG: 6, TP: 7 };

        data.forEach(item => {
            const key = `${item.U_SPDICH}_${item.ItemCode}_${item.U_To}_${item.U_CDOAN}`;

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

        return Array.from(groupMap.values()).sort((a, b) => {
            const orderA = stageOrder[a.U_CDOAN] || 999;
            const orderB = stageOrder[b.U_CDOAN] || 999;
            return orderA - orderB;
        });
    };

    const aggregateItemsByWeek = (data) => {
        const itemMap = new Map();
        const stageOrder = { 'Lựa phôi': 1, 'Sơ chế': 2, 'Bán thành phẩm': 3, 'Tinh chế': 4, 'Hoàn thiện': 5, 'Đóng gói': 6, 'Thành phẩm': 7 };

        data.forEach(item => {
            const key = `${item.U_SPDICH}_${item.ItemCode}_${item.U_To}_${item.U_CDOAN}`;

            if (!itemMap.has(key)) {
                const newItem = {
                    stage: convertStageName(item.U_CDOAN),
                    targetProduct: item.NameSPdich,
                    targetSKU: item.SKUSPDich,
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
                    SLThanhTotal: 0,
                    M3Total: 0
                };

                for (let i = 1; i <= 53; i++) {
                    newItem[`SLWeek${i}`] = 0;
                    newItem[`M3Week${i}`] = 0;
                }

                itemMap.set(key, newItem);
            }

            const entry = itemMap.get(key);
            entry.SLThanhTotal += parseFloat(item.SLThanh);
            entry.M3Total += parseFloat(item.M3);

            const slWeekKey = `SLWeek${item.WEEK}`;
            const m3WeekKey = `M3Week${item.WEEK}`;

            entry[slWeekKey] += parseFloat(item.SLThanh);
            entry[m3WeekKey] += parseFloat(item.M3);
        });

        return Array.from(itemMap.values()).sort((a, b) => {
            const orderA = stageOrder[a.stage] || 999;
            const orderB = stageOrder[b.stage] || 999;
            return orderA - orderB;
        });
    }

    const aggregateItemsByMonth = (data) => {
        const itemMap = new Map();
        const stageOrder = { 'Lựa phôi': 1, 'Sơ chế': 2, 'Bán thành phẩm': 3, 'Tinh chế': 4, 'Hoàn thiện': 5, 'Đóng gói': 6, 'Thành phẩm': 7 };

        data.forEach(item => {
            const key = `${item.U_SPDICH}_${item.ItemCode}_${item.U_To}_${item.U_CDOAN}`;

            if (!itemMap.has(key)) {
                const newItem = {
                    stage: convertStageName(item.U_CDOAN),
                    targetProduct: item.NameSPdich,
                    targetSKU: item.SKUSPDich,
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
                    SLThanhTotal: 0,
                    M3Total: 0
                };

                for (let i = 1; i <= 12; i++) {
                    newItem[`SLMonth${i}`] = 0;
                    newItem[`M3Month${i}`] = 0;
                }

                itemMap.set(key, newItem);
            }

            const entry = itemMap.get(key);
            entry.SLThanhTotal += parseFloat(item.SLThanh);
            entry.M3Total += parseFloat(item.M3);

            const slMonthKey = `SLMonth${item.Months}`;
            const m3MonthKey = `M3Month${item.Months}`;

            entry[slMonthKey] += parseFloat(item.SLThanh);
            entry[m3MonthKey] += parseFloat(item.M3);
        });

        return Array.from(itemMap.values()).sort((a, b) => {
            const orderA = stageOrder[a.stage] || 999;
            const orderB = stageOrder[b.stage] || 999;
            return orderA - orderB;
        });
    }

    const getReportData = async () => {
        // const getReportData = useCallback(async () => {
        let params = {};

        setIsDataReportLoading(true);

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        if (selectedTimeRange === 'day') {
            params = {
                fromDate: format(fromDate, "yyyy-MM-dd"),
                toDate: format(toDate, "yyyy-MM-dd"),
            };

            try {
                let dailyRes = await reportApi.getProductionVolumeByDay(
                    params.fromDate,
                    params.toDate,
                    { signal }
                )

                let formattedData;

                // formattedData = aggregateItemsByDay(dailyRes);
                formattedData = dailyRes?.map((item) => ({
                    // stage: item.U_CDOAN,
                    date: new Date(item.DocDate),
                    factory: item.U_FAC,
                    stage: convertStageName(item.U_CDOAN),
                    targetProduct: item.NameSPdich,
                    targetSKU: item.SKUSPDich,
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

                setDailyData(formattedData);
            } catch (error) {
                if (error.name === 'AbortError' || signal.aborted) {
                    return;
                }
                console.error(error);
                toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
            }
        } else {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const selectedYear = fromYear.getFullYear();

            const startDate = new Date(selectedYear, 0, 1);

            const endDate = selectedYear === currentYear
                ? currentDate
                : new Date(selectedYear, 11, 31);

            params = {
                fromDate: format(startDate, "yyyy-MM-dd"),
                toDate: format(endDate, "yyyy-MM-dd"),
            };
            setDailyData([])
        }

        try {
            let res = await reportApi.getProductionVolumeByTime(
                params.fromDate,
                params.toDate,
                { signal }
            );

            setReportData(res);

            if (selectedFactory !== 'All') {
                res = res.filter(data => data.U_FAC === selectedFactory);
                if (!selectedGroup.some(group => group?.value === 'All')) {
                    res = res.filter(data => selectedGroup.some(group => group === data.U_To));
                }
            }

            let formattedData;

            switch (selectedTimeRange) {
                case 'day':
                    formattedData = aggregateItemsByDay(res);
                    formattedData = formattedData?.map((item) => ({
                        // stage: item.U_CDOAN,
                        factory: item.U_FAC,
                        stage: convertStageName(item.U_CDOAN),
                        targetProduct: item.NameSPdich,
                        targetSKU: item.SKUSPDich,
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
                    break;
                case 'week':
                    formattedData = aggregateItemsByWeek(res);
                    break;
                case 'month':
                    formattedData = aggregateItemsByMonth(res);
                    break;
                default:
                    break;
            }

            setRowData(formattedData);
        } catch (error) {
            if (error.name === 'AbortError' || signal.aborted) {
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
    }
    // }, [fromDate, toDate, fromYear, selectedTimeRange, selectedGroup, selectedFactory]);

    const handleTimeRangeSelect = async (time) => {
        setSelectedTimeRange(time);

        // let formattedData = reportData?.map((item) => ({
        //     // stage: item.U_CDOAN,
        //     stage: convertStageName(item.U_CDOAN),
        //     targetProduct: item.NameSPdich,
        //     productCode: item.ItemCode,
        //     group_name: item.U_To,
        //     year: item.Years,
        //     week: item.WEEK,
        //     weekday: "Thứ 6", //
        //     itemname: item.ItemName,
        //     category: item.CHUNGLOAI,
        //     thickness: item.U_CDay,
        //     width: item.U_CRong,
        //     length: item.U_CDai,
        //     unit: "Tấm",
        //     quantity: Number(item.SLThanh),
        //     volume: Number(item.M3)
        // }));;

        // switch (time) {
        //     case 'week':
        //         formattedData = aggregateItemsByWeek(reportData);
        //         break;
        //     case 'month':
        //         formattedData = aggregateItemsByMonth(reportData);
        //         console.log("Month nè: ", formattedData)
        //         break;
        //     default:
        //         break;
        // }

        // // const randomRows = pickRandomRows(reportData, 3);
        // setRowData(formattedData);
    };

    // DONE
    const handleUnitSelect = async (unit) => {
        if (!isDataReportLoading)
            setSelectedUnit(unit);
    };

    // DONE
    const handleFactorySelect = async (factory) => {
        if (isDataReportLoading) return

        setSelectedFactory(factory);

        const stageOrder = { LP: 1, SC: 2, BTP: 3, TC: 4, HT: 5, DG: 6, TP: 7 };

        let res = [...reportData];

        if (factory !== 'All') {
            res = reportData.filter(data => data.U_FAC === factory);

            const groupWithStage = [...new Map(
                res.map(item => [
                    item.U_To,
                    {
                        value: item.U_To,
                        label: item.U_To || "Trống",
                        cdoan: item.U_CDOAN
                    }
                ])
            ).values()];

            groupWithStage.sort((a, b) => {
                const orderA = stageOrder[a.cdoan] || Infinity;
                const orderB = stageOrder[b.cdoan] || Infinity;
                return orderA - orderB;
            });

            setGroupData([{ value: "All", label: "Tất cả" }, ...groupWithStage]);
            setSelectedGroup(['All', ...groupWithStage.map(g => g.value)]);
        } else {
            setGroupData([]);
        }

        let formattedData;

        console.log("Factory 1: ", res)

        switch (selectedTimeRange) {
            case 'day':
                formattedData = aggregateItemsByDay(res);
                formattedData = formattedData?.map((item) => ({
                    // stage: item.U_CDOAN,
                    factory: item.U_FAC,
                    stage: convertStageName(item.U_CDOAN),
                    targetProduct: item.NameSPdich,
                    targetSKU: item.SKUSPDich,
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
                break;
            case 'week':
                formattedData = aggregateItemsByWeek(res);
                break;
            case 'month':
                formattedData = aggregateItemsByMonth(res);
                break;
            default:
                break;
        }

        setRowData(formattedData);
    };

    // DONE
    const handleGroupSelect = async (group) => {
        if (isDataReportLoading) return

        let currentGroups;
        if (group == "All") {
            if (selectedGroup?.length < groupData?.length) {
                currentGroups = [
                    ...groupData.map(group => group?.value)
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
                        ...groupData.map(group => group?.value)
                    ]
                } else currentGroups = newValue;
            }

            setSelectedGroup(currentGroups);
        }

        let res = [...reportData];

        if (selectedFactory !== 'All') {
            res = reportData.filter(data => data.U_FAC === selectedFactory);
            if (!currentGroups.some(group => group?.value === 'All')) {
                res = res.filter(data => currentGroups.some(group => group === data.U_To));
            }
        }

        let formattedData;

        switch (selectedTimeRange) {
            case 'day':
                formattedData = aggregateItemsByDay(res);
                formattedData = formattedData?.map((item) => ({
                    factory: item.U_FAC,
                    stage: convertStageName(item.U_CDOAN),
                    targetProduct: item.NameSPdich,
                    targetSKU: item.SKUSPDich,
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
                break;
            case 'week':
                formattedData = aggregateItemsByWeek(res);
                break;
            case 'month':
                formattedData = aggregateItemsByMonth(res);
                break;
            default:
                break;
        }

        setRowData(formattedData);
    };

    const ReportOption = ({ value, label }) => (
        <div
            className={`group hover:border-[#1d2326] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-3xl border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all ${selectedTimeRange === value
                ? "border-[#86ABBE] bg-[#eaf8ff]"
                : "border-gray-300"
                }`}
            onClick={() => handleTimeRangeSelect(value)}
        >
            {selectedTimeRange === value ? (
                <IoMdRadioButtonOn className="w-5 h-6 text-[#17506B]" />
            ) : (
                <IoMdRadioButtonOff className="w-5 h-6 text-gray-400 group-hover:text-[#17506B]" />
            )}
            <div
                className={`${selectedTimeRange === value
                    ? "text-[#17506B] font-medium"
                    : "text-gray-400 group-hover:text-[#17506B]"
                    }`}
            >
                {label}
            </div>
        </div>
    );

    const UnitOption = ({ value, label }) => (
        <div
            className={`group hover:border-[#1d2326] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-3xl border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all ${selectedUnit === value
                ? "border-[#86ABBE] bg-[#eaf8ff]"
                : "border-gray-300"
                } ${isDataReportLoading && "hover:cursor-not-allowed"}`}
            onClick={() => handleUnitSelect(value)}
        >
            {selectedUnit === value ? (
                <IoMdRadioButtonOn className="w-5 h-6 text-[#17506B]" />
            ) : (
                <IoMdRadioButtonOff className="w-5 h-6 text-gray-400 group-hover:text-[#17506B]" />
            )}
            <div
                className={`${selectedUnit === value
                    ? "text-[#17506B] font-medium"
                    : "text-gray-400 group-hover:text-[#17506B]"
                    }`}
            >
                {label}
            </div>
        </div>
    );

    const FactoryOption = ({ value, label }) => (
        <div
            className={`group hover:border-[#1d2326] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-3xl border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all ${selectedFactory === value
                ? "border-[#86ABBE] bg-[#eaf8ff]"
                : "border-gray-300"
                } ${isDataReportLoading && "hover:cursor-not-allowed"}`}
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
                } ${isDataReportLoading && "hover:cursor-not-allowed"}`}
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
        setSelectedTimeRange("day");
        setFromDate(getFirstDayOfCurrentMonth());
        setToDate(new Date());
        // setSelectAll(false);
        // setIsReceived(true);
        // setTeamData([]);

        setReportData(null);

        toast.success("Đặt lại bộ lọc thành công.");
    };

    const handleExportExcel = useCallback(() => {
        const formatDate = (date) => {
            if (!date) return '';
            try {
                const parsedDate = typeof date === 'string' ? parseISO(date) : date;
                return format(parsedDate, 'dd-MM-yyyy'); // Format to DD-MM-YYYY
            } catch (error) {
                return '';
            }
        };

        const from = formatDate(fromDate);
        const to = formatDate(toDate);
        const timeRange = selectedTimeRange == "day" ? from + "_đến_" + to : "năm_" + format(fromYear, 'yyyy');
        const factory = selectedFactory || 'Tất cả';
        const fileName = `Báo cáo sản lượng theo ${selectedTimeRange == "day" ? "ngày" : selectedTimeRange == "week" ? "tuần" : "tháng"}_${factory}_${timeRange}_${selectedUnit}.xlsx`;

        gridRef.current.api.exportDataAsExcel({
            fileName,
        });
    }, [fromDate, toDate, fromYear, selectedFactory, selectedUnit]);

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
            case 'BTP':
                return 'Bán thành phẩm';
            case 'TP':
                return 'Thành phẩm';
            default:
                return code
        }
    }

    useEffect(() => {
        if (dailyData && dailyData.length > 0) {
            let res = [...dailyData];

            if (selectedFactory !== 'All') {
                res = res.filter(data => data.factory === selectedFactory);
                if (!selectedGroup.some(group => group?.value === 'All')) {
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

            setDailyChartData(stageResults);
        }
    }, [dailyData, selectedUnit, selectedFactory, selectedGroup])

    const data = useMemo(() => {
        let labels = [];
        if (selectedTimeRange === 'day') {
            const start = new Date(fromDate);
            const end = new Date(toDate);
            const current = new Date(start);
            while (current <= end) {
                labels.push(getDDMM(current));
                current.setDate(current.getDate() + 1);
            }
        } else if (selectedTimeRange === 'week') {
            labels = Array.from({ length: 53 }, (_, index) => `Tuần ${index + 1}`);
        } else if (selectedTimeRange === 'month') {
            labels = Array.from({ length: 12 }, (_, index) => `Tháng ${index + 1}`);
        }

        const calculateWeeklyData = (stage, unit) => {
            return Array.from({ length: 53 }, (_, weekIndex) => {
                const weekNumber = weekIndex + 1;
                return rowData
                    .filter(row => row.stage === stage)
                    .reduce((sum, row) => {
                        if (unit === 'sl') {
                            return sum + (Number(row[`SLWeek${weekNumber}`]) || 0);
                        } else {
                            return sum + (Number(row[`M3Week${weekNumber}`]) || 0);
                        }
                    }, 0);
            });
        };

        const calculateMonthlyData = (stage, unit) => {
            return Array.from({ length: 12 }, (_, monthIndex) => {
                const monthNumber = monthIndex + 1;
                return rowData
                    .filter(row => row.stage === stage)
                    .reduce((sum, row) => {
                        if (unit === 'sl') {
                            return sum + (Number(row[`SLMonth${monthNumber}`]) || 0);
                        } else {
                            return sum + (Number(row[`M3Month${monthNumber}`]) || 0);
                        }
                    }, 0);
            });
        };

        const calculateDailyData = (stage, unit) => {
            // Tính toán theo ngày dựa vào labels đã tạo
        };

        const getDataForStage = (stage) => {
            switch (selectedTimeRange) {
                case 'week':
                    return calculateWeeklyData(stage, selectedUnit);
                case 'month':
                    return calculateMonthlyData(stage, selectedUnit);
                case 'day':
                    return dailyChartData[stage] || [];
                default:
                    return [];
            }
        };

        return {
            labels,
            datasets: [
                {
                    label: 'Lựa phôi',
                    backgroundColor: '#ea7ccc',
                    data: getDataForStage('Lựa phôi'),
                },
                {
                    label: 'Sơ chế',
                    backgroundColor: '#673ab7',
                    data: getDataForStage('Sơ chế'),
                },
                {
                    label: 'Tinh chế',
                    backgroundColor: '#cddc39',
                    data: getDataForStage('Tinh chế'),
                },
                {
                    label: 'Hoàn thiện',
                    backgroundColor: '#ffc003',
                    data: getDataForStage('Hoàn thiện'),
                },
                {
                    label: 'Đóng gói',
                    backgroundColor: '#4caf50',
                    data: getDataForStage('Đóng gói'),
                },
            ],
        };
    }, [selectedTimeRange, fromDate, toDate, rowData, selectedUnit, dailyChartData]);

    const options = useMemo(() => {
        const titleText =
            selectedTimeRange === 'day'
                ? 'Biểu đồ sản lượng theo ngày'
                : selectedTimeRange === 'week'
                    ? 'Biểu đồ sản lượng theo tuần'
                    : selectedTimeRange === 'month'
                        ? 'Biểu đồ sản lượng theo tháng'
                        : 'Biểu đồ sản lượng';

        return {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Lexend Variable,Source Serif Pro,sans-serif',
                        },
                    },
                },
                title: {
                    display: true,
                    text: titleText,
                    color: '#1A202C',
                    font: {
                        family: 'Lexend Variable,Source Serif Pro,sans-serif',
                        size: 24,
                        weight: 'normal',
                    },
                    padding: {
                        top: 10,
                        bottom: 30,
                    },
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text:
                            selectedTimeRange === 'day'
                                ? 'Ngày'
                                : selectedTimeRange === 'week'
                                    ? 'Tuần'
                                    : selectedTimeRange === 'month'
                                        ? 'Tháng'
                                        : 'Thời gian',
                        font: {
                            family: 'Lexend Variable,Source Serif Pro,sans-serif',
                            size: 14,
                        },
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: selectedUnit == 'm3' ? 'M3' : 'Thanh',
                        font: {
                            family: 'Lexend Variable,Source Serif Pro,sans-serif',
                            size: 14,
                        },
                    },
                    ticks: {
                        beginAtZero: true,
                    },
                },
            },
        };
    }, [selectedTimeRange, selectedUnit]);

    const handleDownloadImage = () => {
        const currentChartRef = chartRef.current || chartRefMobile.current
        if (currentChartRef) {
            const imageUrl = currentChartRef.toBase64Image();

            const formatDate = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                return `${day}/${month}/${year}`;
            };

            let title = 'Biểu đồ sản lượng';
            if (selectedTimeRange === 'day' && fromDate && toDate) {
                title = `Biểu đồ sản lượng theo ngày (${formatDate(fromDate)}-${formatDate(toDate)})`;
            } else if (selectedTimeRange === 'week' && fromDate) {
                title = `Biểu đồ sản lượng theo tuần (${new Date(fromDate).getFullYear()})`;
            } else if (selectedTimeRange === 'month' && fromDate) {
                title = `Biểu đồ sản lượng theo tháng (${new Date(fromDate).getFullYear()})`;
            }

            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `${title}.png`;
            link.click();
        }
    };

    const {
        isOpen: isModalOpen,
        onOpen: onModalOpen,
        onClose: onModalClose,
    } = useDisclosure();

    const getAllFactory = async () => {
        try {
            const response = await reportApi.getCBGFactory();
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

    // useEffect(() => {
    //     if (selectedTimeRange) {
    //         switch (selectedTimeRange) {
    //             case "day":
    //                 setSelectedUnit("");
    //                 break;

    //             default:
    //                 if (!selectedUnit)
    //                     setSelectedUnit("sl");
    //                 break;
    //         }
    //     }
    // }, [selectedTimeRange]);

    useEffect(() => {
        const allFieldsFilled = (fromDate && toDate) || fromYear;
        if (allFieldsFilled) {
            getReportData();
        } else {
            console.log("Không thể gọi API vì không đủ thông tin");
        }
    }, [fromDate, toDate, fromYear, selectedTimeRange])

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
                                <div className="serif text-3xl font-bold">
                                    Báo cáo sản lượng theo {selectedTimeRange == "day" ? "ngày" : selectedTimeRange == "week" ? "tuần" : "tháng"}
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
                                <div>
                                    <FaArrowRotateLeft
                                        className="mx-2.5 w-[22px] h-[22px] text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all"
                                        onClick={() => getReportData()}
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
                        <div className="flex flex-col lg:flex-row flex-wrap 2xl:flex-nowrap items-center px-4 mt-1 gap-3 mb-3">
                            <div className="flex flex-col w-full lg:w-[60%] 2xl:w-1/2">
                                <label
                                    htmlFor="indate"
                                    className="block mb-1 text-sm font-medium whitespace-nowrap text-gray-900"
                                >
                                    Chọn loại báo cáo
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="col-span-1 w-full">
                                        <ReportOption
                                            value="day"
                                            label="Theo ngày"
                                        />
                                    </div>
                                    <div className="col-span-1 w-full flex items-end">
                                        <ReportOption
                                            value="week"
                                            label="Theo tuần"
                                        />
                                    </div>
                                    <div className="col-span-1 w-full flex items-end">
                                        <ReportOption
                                            value="month"
                                            label="Theo tháng"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col w-full lg:w-[35%] 2xl:w-1/3 lg:pl-3 lg:border-l-2 lg:border-gray-100">
                                <label
                                    htmlFor="indate"
                                    className="block mb-1 text-sm font-medium whitespace-nowrap text-gray-900"
                                >
                                    Chọn đơn vị
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="col-span-1 w-full flex items-end">
                                        <UnitOption
                                            value="sl"
                                            label="Sản lượng"
                                        />
                                    </div>
                                    <div className="col-span-1 w-full">
                                        <UnitOption
                                            value="m3"
                                            label="Mét khối"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <label
                                    htmlFor="indate"
                                    className="block mb-1 text-sm font-medium whitespace-nowrap text-gray-900"
                                >
                                    Hiển thị biểu đồ
                                </label>
                                <div className="scale-[115%] ml-2">
                                    <Switch isDisabled={isDataReportLoading} onChange={() => setIsDisplayBarChart(!isDisplayBarChart)} isChecked={isDisplayBarChart} colorScheme='teal' size='lg' />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row flex-wrap min-[1649px]:flex-nowrap items-center px-4 mt-1 gap-3">
                            {
                                selectedTimeRange == "day" ? (
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
                                                    // if (
                                                    //     fromDate &&
                                                    //     toDate &&
                                                    //     selectedFactory &&
                                                    //     isReceived &&
                                                    //     selectedTeams
                                                    // ) {
                                                    // getReportData();
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
                                                    //     fromDate &&
                                                    //     toDate &&
                                                    //     selectedFactory &&
                                                    //     isReceived &&
                                                    //     selectedTeams
                                                    // ) {
                                                    // getReportData();
                                                    // }
                                                }}
                                                className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 w-full lg:w-1/4">
                                        <div className="col-span-1 w-full">
                                            <label
                                                htmlFor="indate"
                                                className="block mb-1 text-sm t font-medium text-gray-900 "
                                            >
                                                Chọn năm
                                            </label>
                                            <DatePicker
                                                selected={fromYear}
                                                showYearPicker
                                                dateFormat="yyyy"
                                                onChange={(date) => {
                                                    setFromYear(date);
                                                    // if (
                                                    //     fromDate &&
                                                    //     toDate &&
                                                    //     selectedFactory &&
                                                    //     isReceived &&
                                                    //     selectedTeams
                                                    // ) {
                                                    //     // getReportData();
                                                    // }
                                                }}
                                                className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                            />
                                        </div>
                                    </div>
                                )
                            }

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
                                            Chọn tổ sản xuất
                                        </label>
                                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                                            {
                                                groupData && groupData.length > 0 && groupData.map(group => (
                                                    <div className="col-span-1 w-full sm:w-[200px]">
                                                        <GroupOption
                                                            value={group?.value}
                                                            label={group?.label}
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

                    {/* Column chart */}
                    {
                        !isDataReportLoading && isDisplayBarChart &&
                        <div className="hidden lg:block border-2 border-gray-300 w-full h-auto bg-white rounded-xl p-4 pb-3 mt-3 relative" style={{ aspectRatio: 2 }}>
                            <FaRegImage className="absolute top-3 left-2 mx-2.5 w-[22px] h-[22px] text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all"
                                onClick={handleDownloadImage} />
                            <FaExpand className="absolute top-3 right-2 mx-2.5 w-[22px] h-[22px] text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all"
                                onClick={onModalOpen} />
                            <Bar ref={chartRef} data={data} options={options} />
                        </div>
                    }
                    {
                        !isDataReportLoading &&
                        <div className="lg:hidden overflow-scroll border-2 h-[500px] border-gray-300 bg-white rounded-xl p-4 pb-3 mt-3 relative">
                            <FaRegImage className="absolute top-3 left-2 mx-2.5 w-[22px] h-[22px] text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all z-50"
                                onClick={handleDownloadImage} />
                            <FaExpand className="absolute top-3 right-2 mx-2.5 w-[22px] h-[22px] text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all z-50"
                                onClick={onModalOpen} />
                            <div className="overflow-scroll">
                                <div className="w-[1200px] relative" style={{ aspectRatio: 2 }}>
                                    <Bar ref={chartRefMobile} data={data} options={options} className="w-full" />
                                </div>
                            </div>
                        </div>
                    }

                    {/* Content */}
                    {isDataReportLoading ? (
                        <div className="mt-2 bg-[#C2C2CB] flex items-center justify-center  p-3 px-4 pr-1 rounded-lg ">
                            {/* <div>Đang tải dữ liệu</div> */}
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
                                            autoGroupColumnDef={{
                                                headerName: 'Nhóm',
                                                width: '250px',
                                                pinned: "left"
                                            }}
                                            excelStyles={excelStyles}
                                            rowGroupPanelShow={"always"}
                                            // groupDisplayType="groupRows"
                                            animateRows={true}
                                            localeText={localeText}
                                            suppressAggFuncInHeader
                                            getRowStyle={getRowStyle}
                                            grandTotalRow="bottom"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 bg-[#C2C2CB] items-center justify-center  p-2 px-4 pr-1 rounded-lg flex">
                                    Không có dữ liệu để hiển thị.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <Modal
                isCentered
                isOpen={isModalOpen}
                size="full"
                // size=""
                onClose={onModalClose}
                scrollBehavior="inside"
            >
                <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                <ModalContent>
                    <ModalHeader>
                        <h1 className="text-xl lg:text-2xl text-bold text-[#17506B]">
                            Báo cáo sản lượng (VCN)
                        </h1>
                    </ModalHeader>
                    <ModalCloseButton />
                    <div className="border-b-2 border-gray-100"></div>
                    <ModalBody className="!p-4">
                        <div className="flex gap-4 justify-center h-full w-full">
                            <div className="overflow-scroll w-full">
                                <div className="w-[1200px] lg:w-full relative" style={{ aspectRatio: 2 }}>
                                    <Bar ref={chartRefMobile} data={data} options={options} className="w-full" />
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
            {loading && <Loader />}
        </Layout>
    )
}

export default ProductionVolumeByTimeReport