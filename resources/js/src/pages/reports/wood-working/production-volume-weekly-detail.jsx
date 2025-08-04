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
import { format, getYear, getISOWeek, parse, getDay } from "date-fns";
import toast from "react-hot-toast";
import reportApi from "../../../api/reportApi";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import debounce from "../../../utils/debounce";
import useAppContext from "../../../store/AppContext";
import Loader from "../../../components/Loader";

function WeeklyDetailProductionVolumeReport() {
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
    const [selectedUnit, setSelectedUnit] = useState('sl');
    const [keyword, setKeyword] = useState("");

    const [fromYear, setFromYear] = useState(new Date());
    const [fromWeek, setFromWeek] = useState(getFirstDayOfCurrentMonth());
    const [factories, setFactories] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState('');
    const [selectedGroup, setSelectedGroup] = useState([]);

    const [isDataReportLoading, setIsDataReportLoading] = useState(false);
    const [rowData, setRowData] = useState([]);
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
                field: "targetProduct",
                headerName: "Sản phẩm đích",
                rowGroup: true,
                enableRowGroup: true,
                width: 180,
                filter: true,
                pinned: "left"
            },
            {
                field: 'group',
                headerName: 'Tổ',
                rowGroup: true,
                enableRowGroup: true,
                suppressHeaderMenuButton: true,
                filter: true,
                pinned: "left"
            },
            {
                field: 'stage',
                headerName: 'Công đoạn',
                suppressHeaderMenuButton: true,
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
                headerName: 'KT Tinh (mm)',
                children: [
                    {
                        headerName: "Dài",
                        field: "length",
                        width: 100,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        suppressHeaderMenuButton: true,
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
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        suppressHeaderMenuButton: true,
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
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        suppressHeaderMenuButton: true,
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                                : { textAlign: "center" },
                    },
                ]
            },
            {
                headerName: "Chủng loại",
                field: "CHUNGLOAI",
                width: 150,
                suppressHeaderMenuButton: true,
                filter: true,
            },
            {
                headerName: 'Kế hoạch thực hiện',
                children: [
                    {
                        headerName: "Sản lượng",
                        field: "SLKeHoach",
                        width: 150,
                        suppressHeaderMenuButton: true,
                        filter: true,
                        aggFunc: "sum",
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: "Đơn vị tính",
                        field: "uom",
                        width: 170,
                        suppressHeaderMenuButton: true,
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                                : { textAlign: "center" },
                    },
                    {
                        headerName: "Tổng M3",
                        field: "M3KeHoach",
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
                ]
            },
            {
                headerName: 'Sản lượng',
                children: [
                    {
                        headerName: 'Thứ 2',
                        field: 'SLThanh_Day1',
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        width: 120,
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: 'Thứ 3',
                        field: 'SLThanh_Day2',
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        width: 120,
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: 'Thứ 4',
                        field: 'SLThanh_Day3',
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        width: 120,
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: 'Thứ 5',
                        field: 'SLThanh_Day4',
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        width: 120,
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: 'Thứ 6',
                        field: 'SLThanh_Day5',
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        width: 120,
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: 'Thứ 7',
                        field: 'SLThanh_Day6',
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        width: 120,
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: 'Chủ nhật',
                        field: 'SLThanh_Day7',
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        width: 120,
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                ]
            },
            {
                headerName: "Tổng SL đạt được",
                field: "SLThanh",
                width: 220,
                valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                suppressHeaderMenuButton: true,
                filter: true,
                aggFunc: "sum",
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                        : { textAlign: "right" },
            },
            {
                headerName: "Sản lượng lỗi",
                field: "SLLoi",
                width: 220,
                valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                suppressHeaderMenuButton: true,
                filter: true,
                aggFunc: "sum",
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                        : { textAlign: "right" },
            },
            {
                headerName: "Tổng sản lượng thực tế",
                field: "SLTong",
                width: 220,
                valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                suppressHeaderMenuButton: true,
                filter: true,
                aggFunc: "sum",
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                        : { textAlign: "right" },
            },
            {
                headerName: 'M3',
                children: [
                    {
                        headerName: 'Thứ 2',
                        field: 'M3_Day1',
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        width: 120,
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: 'Thứ 3',
                        field: 'M3_Day2',
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        width: 120,
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: 'Thứ 4',
                        field: 'M3_Day3',
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        width: 120,
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: 'Thứ 5',
                        field: 'M3_Day4',
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        width: 120,
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: 'Thứ 6',
                        field: 'M3_Day5',
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        width: 120,
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: 'Thứ 7',
                        field: 'M3_Day6',
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        width: 120,
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                    {
                        headerName: 'Chủ nhật',
                        field: 'M3_Day7',
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        width: 120,
                        aggFunc: "sum",
                        filter: true,
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                                : { textAlign: "right" },
                    },
                ]
            },
            {
                headerName: "Tổng KL đạt được",
                field: "M3",
                width: 220,
                valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                suppressHeaderMenuButton: true,
                filter: true,
                aggFunc: "sum",
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                        : { textAlign: "right" },
            },
            {
                headerName: "KL còn phải làm",
                field: "KLConLai",
                width: 200,
                valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                suppressHeaderMenuButton: true,
                filter: true,
                aggFunc: "sum",
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                        : { textAlign: "right" },
            },
            {
                headerName: "% đạt kế hoạch",
                field: "KHPercent",
                width: 200,
                valueFormatter: (params) => formatNumber(Number(params.value) || 0) + '%',
                suppressHeaderMenuButton: true,
                filter: true,
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                        : { textAlign: "center" },
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

    function transformData(data) {
        const stageOrder = {
            'Lựa phôi': 1,
            'Sơ chế': 2,
            'Bán thành phẩm': 3,
            'Tinh chế': 4,
            'Hoàn thiện': 5,
            'Đóng gói': 6,
            'Thành phẩm': 7
        };

        // Nhóm dữ liệu theo ItemCode và U_SPDICH, To
        const groupedData = data.reduce((acc, item) => {
            const key = `${item.ItemCode}_${item.U_SPDICH}_${item.U_To}`;
            const docDate = parse(item.DocDate, 'yyyy-MM-dd', new Date());
            const dayOfWeek = getDay(docDate);
            const dayKeySL = `SLThanh_Day${dayOfWeek === 0 ? 7 : dayOfWeek}`;
            const dayKeyM3 = `M3_Day${dayOfWeek === 0 ? 7 : dayOfWeek}`;

            if (!acc[key]) {
                acc[key] = {
                    docEntry: item.DocEntryPO,
                    group: item.U_To,
                    stage: convertStageName(item.U_CDOAN),
                    ItemCode: item.ItemCode,
                    ItemName: item.ItemName,
                    U_SPDICH: item.U_SPDICH,
                    targetProduct: item.NameSPdich,
                    length: item.U_CDai,
                    width: item.U_CRong,
                    thickness: item.U_CDay,
                    CHUNGLOAI: item.CHUNGLOAI,
                    uom: item.UoM,
                    SLKeHoach: 0,
                    M3KeHoach: 0,
                    SLThanh_Day1: 0,
                    SLThanh_Day2: 0,
                    SLThanh_Day3: 0,
                    SLThanh_Day4: 0,
                    SLThanh_Day5: 0,
                    SLThanh_Day6: 0,
                    SLThanh_Day7: 0,
                    SLThanh: 0,
                    M3: 0,
                    SLLoi: 0,
                    M3Loi: 0,
                    SLTong: 0,
                    M3_Day1: 0,
                    M3_Day2: 0,
                    M3_Day3: 0,
                    M3_Day4: 0,
                    M3_Day5: 0,
                    M3_Day6: 0,
                    M3_Day7: 0,
                    KLConLai: 0,
                    KHPercent: 0,
                    processedErrorDocEntries: new Set()
                };
            }

            // Cộng dồn thành phẩm theo ngày và tổng
            acc[key][dayKeySL] += parseFloat(item.SLThanh) || 0;
            acc[key].SLThanh += parseFloat(item.SLThanh) || 0;
            acc[key][dayKeyM3] += parseFloat(item.M3) || 0;
            acc[key].M3 += parseFloat(item.M3) || 0;

            // Xử lý lỗi - chỉ cộng khi docEntry khác nhau
            const currentDocEntry = item.DocEntryPO || item.DocEntry;
            if (currentDocEntry && !acc[key].processedErrorDocEntries.has(currentDocEntry)) {
                acc[key].SLLoi += parseFloat(item.SLLoi) || 0;
                acc[key].M3Loi += parseFloat(item.M3Loi) || 0;
                acc[key].SLKeHoach += parseFloat(item.SLKeHoach) || 0;
                acc[key].SLKeHoach -= parseFloat(item.SLHoanThanh) || 0;
                acc[key].M3KeHoach += parseFloat(item.M3KeHoach) || 0;
                acc[key].M3KeHoach -= parseFloat(item.M3HoanThanh) || 0;
                acc[key].SLKeHoach += parseFloat(item.SLLoi) || 0;
                acc[key].M3KeHoach += parseFloat(item.M3Loi) || 0;
                acc[key].processedErrorDocEntries.add(currentDocEntry);
            }

            return acc;
        }, {});

        // Tính toán các giá trị cuối cùng và làm sạch dữ liệu
        const processedData = Object.values(groupedData).map(item => {
            // Tính SLTong = SLThanh - SLLoi
            item.SLTong = item.SLThanh + item.SLLoi;

            // Tính KLConLai = M3 - M3Loi
            item.KLConLai = item.M3KeHoach - (item.M3 + item.M3Loi);

            // Tính KHPercent = (SLTong / SLKeHoach) * 100
            item.KHPercent = item.SLKeHoach > 0 ?
                Math.round((item.SLTong / item.SLKeHoach) * 100 * 100) / 100 : 0;

            // Xóa Set tạm thời
            delete item.processedErrorDocEntries;

            return item;
        });

        // Sắp xếp theo thứ tự stage
        return processedData.sort((a, b) => {
            const orderA = stageOrder[a.stage] || 999; // Nếu không tìm thấy trong stageOrder, đặt ở cuối
            const orderB = stageOrder[b.stage] || 999;
            return orderA - orderB;
        });
    }

    const getReportData = async () => {
        if (!fromYear && !fromWeek && !selectedFactory) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        let params = {
            year: getYear(fromYear),
            week: getISOWeek(fromWeek),
            factory: selectedFactory || '',
        };

        setIsDataReportLoading(true);

        try {
            let res = await reportApi.getProductionOutputWeekly(
                params.year,
                params.week,
                params.factory

            );

            setReportData(res);

            const rowData = transformData(res);

            setRowData(rowData);

            const stageOrder = { LP: 1, SC: 2, BTP: 3, TC: 4, HT: 5, DG: 6, TP: 7 };

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

    // DONE
    const handleFactorySelect = async (factory) => {
        setSelectedFactory(factory);
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
        if (!currentGroups.some(group => group.value === 'All')) {
            res = res.filter(data => currentGroups.some(group => group === data.U_To));
        }

        const rowData = transformData(res);

        setRowData(rowData);
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
        setFromYear(new Date());
        setFromWeek(getFirstDayOfCurrentMonth());
        // setSelectAll(false);
        // setIsReceived(true);
        // setTeamData([]);

        setReportData(null);

        toast.success("Đặt lại bộ lọc thành công.");
    };

    const handleExportExcel = useCallback(() => {

        const year = getYear(fromYear);
        const week = getISOWeek(fromWeek);
        const factory = selectedFactory || 'Tất cả';
        const fileName = `Báo cáo sản lượng chi tiết theo tuần_${week}_năm_${year}_${factory}.xlsx`;

        gridRef.current.api.exportDataAsExcel({
            fileName,
        });
    }, [fromYear, fromWeek, selectedFactory]);

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

    const getAllFactory = async () => {
        try {
            const response = await reportApi.getCBGFactory();
            // response.unshift({
            //     U_FAC: 'All',
            //     Name: 'Tất cả'
            // })
            // const response = await axios.get('/api/factories');
            setFactories(response);
            setSelectedFactory(response[0]?.U_FAC || '');
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
        const allFieldsFilled = (fromYear && fromWeek && selectedFactory);
        if (allFieldsFilled) {
            getReportData();
        } else {
            console.log("Không thể gọi API vì không đủ thông tin");
        }
    }, [fromYear, fromWeek, selectedFactory])

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
                                    Báo cáo sản lượng chi tiết theo tuần
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
                                        Năm
                                    </label>
                                    <DatePicker
                                        selected={fromYear}
                                        showYearPicker
                                        dateFormat="yyyy"
                                        // locale="vi"
                                        onChange={(date) => {
                                            setFromYear(date);
                                            if (
                                                fromYear &&
                                                fromWeek &&
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
                                        Tuần
                                    </label>
                                    <DatePicker
                                        selected={fromWeek}
                                        dateFormat="ww"
                                        onChange={(date) => {
                                            setFromWeek(date);
                                            if (
                                                fromYear &&
                                                fromWeek &&
                                                selectedFactory &&
                                                isReceived &&
                                                selectedTeams
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
                            selectedFactory && selectedFactory !== 'All' && groupData.length > 0 && !isDataReportLoading && (
                                <div className="flex flex-col lg:flex-row flex-wrap 2xl:flex-nowrap items-center px-4 mt-1 gap-3 mb-3">
                                    <div className="flex flex-col w-full mt-1">
                                        <label
                                            htmlFor="indate"
                                            className="block mb-1 text-sm font-medium whitespace-nowrap text-gray-900"
                                        >
                                            Chọn tổ
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
                        <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center p-3 px-4 pr-1 rounded-lg ">
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
                                                pinned: "left"
                                            }}
                                            excelStyles={excelStyles}
                                            rowGroupPanelShow={"always"}
                                            // groupDisplayType="groupRows"
                                            animateRows={true}
                                            suppressAggFuncInHeader
                                            getRowStyle={getRowStyle}
                                            localeText={localeText}
                                            grandTotalRow="bottom"
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
            </div>
            {loading && <Loader />}
        </Layout>
    )
}

export default WeeklyDetailProductionVolumeReport