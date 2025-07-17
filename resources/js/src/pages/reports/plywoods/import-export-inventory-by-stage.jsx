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
} from "react-icons/fa6";
import { IoMdRadioButtonOff, IoMdRadioButtonOn, IoMdCheckbox, IoMdSquareOutline } from "react-icons/io";
import DatePicker from "react-datepicker";
import { formatNumber } from "../../../utils/numberFormat";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";
import reportApi from "../../../api/reportApi";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import debounce from "../../../utils/debounce";
import useAppContext from "../../../store/AppContext";
import Loader from "../../../components/Loader";

function ImportExportInventoryByStage() {
    const navigate = useNavigate();

    const { user } = useAppContext();
    const gridRef = useRef();
    const abortControllerRef = useRef(null);

    const getFirstDayOfCurrentMonth = () => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const [loading, setLoading] = useState(true);
    const [groupData, setGroupData] = useState([]);
    const [stages, setStages] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState('sl');
    const [keyword, setKeyword] = useState("");

    const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth());
    const [toDate, setToDate] = useState(new Date());
    const [factories, setFactories] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState([]);

    const [isDataReportLoading, setIsDataReportLoading] = useState(false);
    const [rowData, setRowData] = useState([]);
    // const [rowData, setRowData] = useState([]);
    const [dailyChartData, setDailyChartData] = useState([]);
    const [isTargetProductGrouped, setIsTargetProductGrouped] = useState(true);
    const [isStageGrouped, setIsStageProductGrouped] = useState(true);

    const onColumnRowGroupChanged = () => {
        const columnApi = gridRef.current?.api;
        if (columnApi) {
            const isGrouped = columnApi.getRowGroupColumns().some(col => col.getColDef().field === 'targetProduct');
            setIsTargetProductGrouped(isGrouped);
        }
    };

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
                field: 'stage',
                headerName: 'Công đoạn',
                rowGroup: true,
                enableRowGroup: true,
                suppressHeaderMenuButton: true,
                filter: true,
                pinned: "left"
            },
            {
                field: "targetProduct",
                headerName: "Sản phẩm đích",
                rowGroup: true,
                enableRowGroup: true,
                width: 180,
                filter: true,
                pinned: "left"
            },
            {
                headerName: "Chi tiết",
                field: "ItemName",
                width: 350,
                suppressHeaderMenuButton: true,
                filter: true,
                pinned: "left"
            },
            {
                headerName: 'Quy cách',
                children: [
                    {
                        headerName: "Dài",
                        field: "length",
                        width: 100,
                        suppressHeaderMenuButton: true,
                        filter: true,
                        valueGetter: (params) => {
                            if (isTargetProductGrouped && params.node.group && params.node.field === 'targetProduct') {
                                if (params.node.allLeafChildren && params.node.allLeafChildren.length > 0) {
                                    const firstChild = params.node.allLeafChildren[0];
                                    return firstChild.data?.bomLength ?? 0;
                                }
                            }
                            return params.data?.length ?? 0;
                        },
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
                        valueGetter: (params) => {
                            if (isTargetProductGrouped && params.node.group && params.node.field === 'targetProduct') {
                                if (params.node.allLeafChildren && params.node.allLeafChildren.length > 0) {
                                    const firstChild = params.node.allLeafChildren[0];
                                    return firstChild.data?.bomWidth ?? 0;
                                }
                            }
                            return params.data?.width ?? 0;
                        },
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
                        valueGetter: (params) => {
                            if (isTargetProductGrouped && params.node.group && params.node.field === 'targetProduct') {
                                if (params.node.allLeafChildren && params.node.allLeafChildren.length > 0) {
                                    const firstChild = params.node.allLeafChildren[0];
                                    return firstChild.data?.bomThickness ?? 0;
                                }
                            }
                            return params.data?.thickness ?? 0;
                        },
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                                : { textAlign: "center" },
                    },
                ]
            },
            {
                headerName: 'Tồn đầu kỳ',
                children: [
                    {
                        headerName: "Số lượng",
                        filter: true,
                        width: 170,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        valueGetter: (params) => {
                            if (params.node.level == -1 && params.node.footer) {
                                if (params.api && params.api.getDisplayedRowAtIndex) {
                                    const firstDataRow = params.api.getDisplayedRowAtIndex(0).allLeafChildren[0];
                                    if (firstDataRow && firstDataRow.data) {
                                        return firstDataRow.data?.beginingInventoryTotal ?? 0;
                                    }
                                }
                                return 0;
                            }
                            if (isTargetProductGrouped && params.node.group && params.node.field === 'targetProduct') {
                                if (params.node.allLeafChildren && params.node.allLeafChildren.length > 0) {
                                    const firstChild = params.node.allLeafChildren[0];
                                    return firstChild.data?.beginingInventoryBom ?? 0;
                                }
                            }
                            if (isStageGrouped && params.node.group && params.node.field === 'stage') {
                                if (params.node.allLeafChildren && params.node.allLeafChildren.length > 0) {
                                    const firstChild = params.node.allLeafChildren[0];
                                    return firstChild.data?.beginingInventoryCD ?? 0;
                                }
                            }
                            return params.data?.beginingInventory ?? 0;
                        },
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: "M3",
                        field: "beginingInventoryM3",
                        filter: true,
                        width: 170,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => {
                            return formatNumber(Number(params.value) || 0)
                        },
                        aggFunc: "sum",
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                ]
            },
            {
                headerName: 'Nhập trong kỳ',
                children: [
                    {
                        headerName: "Số lượng",
                        field: "inwardInventory",
                        filter: true,
                        width: 170,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        aggFunc: "sum",
                        valueGetter: (params) => {
                            if (params.node.level == -1 && params.node.footer) {
                                if (params.api && params.api.getDisplayedRowAtIndex) {
                                    const firstDataRow = params.api.getDisplayedRowAtIndex(0).allLeafChildren[0];
                                    if (firstDataRow && firstDataRow.data) {
                                        return firstDataRow.data?.inwardInventoryTotal ?? 0;
                                    }
                                }
                                return 0;
                            }
                            if (isTargetProductGrouped && params.node.group && params.node.field === 'targetProduct') {
                                if (params.node.allLeafChildren && params.node.allLeafChildren.length > 0) {
                                    const firstChild = params.node.allLeafChildren[0];
                                    return firstChild.data?.inwardInventoryBom ?? 0;
                                }
                            }
                            if (isStageGrouped && params.node.group && params.node.field === 'stage') {
                                if (params.node.allLeafChildren && params.node.allLeafChildren.length > 0) {
                                    const firstChild = params.node.allLeafChildren[0];
                                    return firstChild.data?.inwardInventoryCD ?? 0;
                                }
                            }
                            return params.data?.inwardInventory ?? 0;
                        },
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: "M3",
                        field: "inwardInventoryM3",
                        filter: true,
                        width: 170,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        aggFunc: "sum",
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                ]
            },
            {
                headerName: 'Xuất trong kỳ',
                children: [
                    {
                        headerName: "Số lượng",
                        field: "outwardInventory",
                        filter: true,
                        width: 170,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        aggFunc: "sum",
                        valueGetter: (params) => {
                            if (params.node.level == -1 && params.node.footer) {
                                if (params.api && params.api.getDisplayedRowAtIndex) {
                                    const firstDataRow = params.api.getDisplayedRowAtIndex(0).allLeafChildren[0];
                                    if (firstDataRow && firstDataRow.data) {
                                        return firstDataRow.data?.outwardInventoryTotal ?? 0;
                                    }
                                }
                                return 0;
                            }
                            if (isTargetProductGrouped && params.node.group && params.node.field === 'targetProduct') {
                                if (params.node.allLeafChildren && params.node.allLeafChildren.length > 0) {
                                    const firstChild = params.node.allLeafChildren[0];
                                    return firstChild.data?.outwardInventoryBOM ?? 0;
                                }
                            }
                            if (isStageGrouped && params.node.group && params.node.field === 'stage') {
                                if (params.node.allLeafChildren && params.node.allLeafChildren.length > 0) {
                                    const firstChild = params.node.allLeafChildren[0];
                                    return firstChild.data?.outwardInventoryCD ?? 0;
                                }
                            }
                            return params.data?.outwardInventory ?? 0;
                        },
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: "M3",
                        field: "outwardInventoryM3",
                        filter: true,
                        width: 170,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        aggFunc: "sum",
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                ]
            },
            {
                headerName: 'Tồn cuối kỳ',
                children: [
                    {
                        headerName: "Số lượng",
                        field: "closingInventory",
                        filter: true,
                        width: 170,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        aggFunc: "sum",
                        valueGetter: (params) => {
                            if (params.node.level == -1 && params.node.footer) {
                                if (params.api && params.api.getDisplayedRowAtIndex) {
                                    const firstDataRow = params.api.getDisplayedRowAtIndex(0).allLeafChildren[0];
                                    if (firstDataRow && firstDataRow.data) {
                                        return firstDataRow.data?.closingInventoryTotal ?? 0;
                                    }
                                }
                                return 0;
                            }
                            if (isTargetProductGrouped && params.node.group && params.node.field === 'targetProduct') {
                                if (params.node.allLeafChildren && params.node.allLeafChildren.length > 0) {
                                    const firstChild = params.node.allLeafChildren[0];
                                    return firstChild.data?.closingInventoryBOM ?? 0;
                                }
                            }
                            if (isStageGrouped && params.node.group && params.node.field === 'stage') {
                                if (params.node.allLeafChildren && params.node.allLeafChildren.length > 0) {
                                    const firstChild = params.node.allLeafChildren[0];
                                    return firstChild.data?.closingInventoryCD ?? 0;
                                }
                            }
                            return params.data?.closingInventory ?? 0;
                        },
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: "M3",
                        field: "closingInventoryM3",
                        filter: true,
                        width: 170,
                        suppressHeaderMenuButton: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        aggFunc: "sum",
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                ]
            },
        ]);

    }, []);

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

    const [reportData, setReportData] = useState([]);

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
        if (!fromDate && !toDate && !selectedFactory) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        let params = {
            fromDate: format(fromDate, "yyyy-MM-dd"),
            toDate: format(toDate, "yyyy-MM-dd"),
            factory: selectedFactory || '',
        };

        setIsDataReportLoading(true);

        try {
            let res = await reportApi.getImportExportInventoryByStage(
                params.fromDate,
                params.toDate,
                params.factory,
                'VCN',
                { signal }
            );

            const stageOrder = stages.reduce((acc, cur) => {
                acc[cur.value] = Number(cur.order);
                return acc;
            }, {});

            const sortedRes = res.sort((a, b) => {
                const orderA = stageOrder[a.U_CDOAN] || 999;
                const orderB = stageOrder[b.U_CDOAN] || 999;
                return orderA - orderB;
            });

            setReportData(sortedRes);

            const formattedData = sortedRes.map((item) => {
                return {
                    stage: convertStageName(item.U_CDOAN),
                    targetProduct: item.BOMName,
                    ItemName: item.ItemName,
                    length: item.U_CDai,
                    width: item.U_CRong,
                    thickness: item.U_CDay,
                    bomLength: item.BOMCDai,
                    bomWidth: item.BOMCRong,
                    bomThickness: item.BOMCDay,
                    beginingInventory: Number(item.TonDauKy),
                    beginingInventoryM3: Number(item.TonDauKyM3),
                    beginingInventoryBom: Number(item.BOM_CD_TonDauKySL),
                    beginingInventoryCD: Number(item.CD_TonDauKySL),
                    beginingInventoryTotal: Number(item.Total_TonDauKySL),
                    inwardInventory: Number(item.InQty),
                    inwardInventoryM3: Number(item.InQtyM3),
                    inwardInventoryBom: Number(item.BOM_CD_NhapTrongKySL),
                    inwardInventoryCD: Number(item.CD_NhapTrongKySL),
                    inwardInventoryTotal: Number(item.Total_NhapTrongKySL),
                    errorInventory: 0,
                    errorInventoryM3: 0,
                    errorInventoryBOM: 0,
                    errorInventoryCD: 0,
                    errorInventoryTotal: 0,
                    outwardInventory: Number(item.OutQty),
                    outwardInventoryM3: Number(item.OutQtyM3),
                    outwardInventoryBOM: Number(item.BOM_CD_XuatTrongKySL),
                    outwardInventoryCD: Number(item.CD_XuatTrongKySL),
                    outwardInventoryTotal: Number(item.Total_XuatTrongKySL),
                    closingInventory: Number(item.TonCuoiKy),
                    closingInventoryM3: Number(item.TonCuoiKyM3),
                    closingInventoryBOM: Number(item.BOM_CD_TonCuoiKySL),
                    closingInventoryCD: Number(item.CD_TonCuoiKySL),
                    closingInventoryTotal: Number(item.Total_TonCuoiKySL),
                }
            });

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
            setGroupData([...uniqueGroups]);
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
        const factory = selectedFactory || 'Tất cả';
        const fileName = `Báo cáo nhập xuất tồn từng công đoạn_${factory}_${from}_đến_${to}.xlsx`;

        gridRef.current.api.exportDataAsExcel({
            fileName,
        });
    }, [fromDate, toDate, selectedFactory]);

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
        const stage = stages.find(stage => stage.value === code);
        if (stage) { return stage.label }
        else return code
    }

    const getAllFactory = async () => {
        try {
            const response = await reportApi.getVCNFactory();
            setFactories(response);
            setSelectedFactory(response[0]?.U_FAC || '');
        } catch (error) {
            console.error(error);
            // toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
        }
    }

    const getAllStage = async () => {
        try {
            const response = await reportApi.getStageByDivision('VCN');
            const formattedResponse = [
                ...response.map(stage => ({
                    value: stage.Code,
                    label: stage.Name,
                    order: stage.U_Order
                }))
            ];
            setStages(formattedResponse);
        } catch (error) {
            console.error('Error fetching stages:', error);
            // toast.error("Đã xảy ra lỗi khi lấy dữ liệu công đoạn.");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    getAllStage(),
                    getAllFactory()
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error("Đã xảy ra lỗi khi tải dữ liệu.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const allFieldsFilled = (fromDate && toDate && selectedFactory && stages.length > 0);
        if (allFieldsFilled) {
            getReportData();
        } else {
            console.log("Không thể gọi API vì không đủ thông tin");
        }
    }, [fromDate, toDate, selectedFactory, stages]);

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
                                    Báo cáo ván công nghiệp
                                </div>
                                <div className="serif text-3xl font-bold">
                                    Báo cáo nhập xuất tồn từng công đoạn
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
                    <div className=" bg-white rounded-xl py-2 pb-3">
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
                                        // locale="vi"
                                        onChange={(date) => {
                                            setFromDate(date);
                                            if (
                                                fromDate &&
                                                toDate &&
                                                selectedFactory
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
                                                selectedFactory
                                            ) {
                                                // getReportData();
                                            }
                                        }}
                                        // showWeekNumbers
                                        showWeekPicker
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
                                            <div key={factory.U_FAC} className="col-span-1 w-full">
                                                <FactoryOption
                                                    value={factory.U_FAC}
                                                    label={factory.Name || factory.U_FAC}
                                                />
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {isDataReportLoading ? (
                        <div className="mt-4 bg-[#C2C2CB]  flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                            <div className="dots"></div>
                        </div>
                    ) : (
                        <>
                            {rowData?.length > 0 ? (
                                <div>
                                    <div
                                        className="ag-theme-quartz border-2 border-gray-300 rounded-lg mt-2 h-[calc(100vh-320px)]"
                                        style={{
                                            // height: 630,
                                            fontSize: 16,
                                        }}
                                    >
                                        <AgGridReact
                                            ref={gridRef}
                                            rowData={rowData}
                                            columnDefs={colDefs}
                                            autoGroupColumnDef={{
                                                headerName: 'Nhóm',
                                                // width: '250px'
                                                pinned: "left"
                                            }}
                                            excelStyles={excelStyles}
                                            rowGroupPanelShow={"always"}
                                            // groupDisplayType="groupRows"
                                            animateRows={true}
                                            suppressAggFuncInHeader
                                            getRowStyle={getRowStyle}
                                            onColumnRowGroupChanged={onColumnRowGroupChanged}
                                            grandTotalRow={"top"}
                                            localeText={localeText}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 bg-[#C2C2CB]  flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
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

export default ImportExportInventoryByStage