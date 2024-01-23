import React, {
    useCallback,
    useMemo,
    useRef,
    useState,
    useEffect,
} from "react";
import { Link } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { PiExportLight } from "react-icons/pi";
import { Divider } from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Layout from "../../../layouts/layout";
import useAppContext from "../../../store/AppContext";
import Loader from "../../../components/Loader";
import AG_GRID_LOCALE_VI from "../../../utils/locale.vi";

const exampleData = [
    {
        name: "SKOGSTA_N tbl_180tbl_160tbl_Bench120_bench60_L shape",
        thickness: 24,
        width: 64,
        length: 1200,
        TH_tonngoaibai: 3,
        TH_xepsay: 0,
        TH_vaolo: 0,
        TH_daralo: 0,
        TH_khosausay: 420,
        TH_kholuadat: 0,
        YS_tonngoaibai: 0,
        YS_xepsay: 0,
        YS_vaolo: 0.47,
        YS_daralo: 0,
        YS_khosausay: 12,
        YS_kholuadat: 0,
        TB_tonngoaibai: 9,
        TB_xepsay: 0,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 142,
        TB_kholuadat: 25,
        total: 999
    },
    {
        name: "Melino-Chân trước",
        thickness: 35,
        width: 92,
        length: 1060,
        TH_tonngoaibai: 5,
        TH_xepsay: 2.1503,
        TH_vaolo: 142.0369,
        TH_daralo: 0,
        TH_khosausay: 100,
        TH_kholuadat: 0,
        YS_tonngoaibai: 1,
        YS_xepsay: 0,
        YS_vaolo: 0.47,
        YS_daralo: 0,
        YS_khosausay: 0,
        YS_kholuadat: 0,
        TB_tonngoaibai: 6,
        TB_xepsay: 0,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 47,
        TB_kholuadat: 0,
        total: 999

    },
    {
        name: "NAMM Bench có tay-Chân-tay",
        thickness: 35,
        width: 46,
        length: 660,
        TH_tonngoaibai: 0,
        TH_xepsay: 2.1503,
        TH_vaolo: 142.0369,
        TH_daralo: 0,
        TH_khosausay: 754,
        TH_kholuadat: 1,
        YS_tonngoaibai: 5,
        YS_xepsay: 7.5636,
        YS_vaolo: 1.7,
        YS_daralo: 0,
        YS_khosausay: 123,
        YS_kholuadat: 9,
        TB_tonngoaibai: 4,
        TB_xepsay: 0,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 0,
        TB_kholuadat: 0,
        total: 999

    },
    {
        name: "NAMM Đố- Bench 120",
        thickness: 23,
        width: 57,
        length: 530,
        TH_tonngoaibai: 1,
        TH_xepsay: 2.1503,
        TH_vaolo: 142.0369,
        TH_daralo: 0,
        TH_khosausay: 1247,
        TH_kholuadat: 0,
        YS_tonngoaibai: 3,
        YS_xepsay: 5.4169,
        YS_vaolo: 4.55,
        YS_daralo: 0,
        YS_khosausay: 145,
        YS_kholuadat: 37,
        TB_tonngoaibai: 14,
        TB_xepsay: 0,
        TB_vaolo: 0,
        TB_daralo: 8.3088,
        TB_khosausay: 47,
        TB_kholuadat: 5,
        total: 999

    },
    {
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        TH_tonngoaibai: 7,
        TH_xepsay: 0.6439,
        TH_vaolo: 6.3904,
        TH_daralo: 0,
        YS_tonngoaibai: 10,
        YS_xepsay: 3.6065,
        YS_vaolo: 0.93,
        YS_daralo: 0,
        YS_khosausay: 35,
        YS_kholuadat: 2,
        TB_tonngoaibai: 3,
        TB_xepsay: 4.6831,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 129,
        TB_kholuadat: 24,
        total: 999
        ,
    },
    {
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        TH_tonngoaibai: 10,
        TH_xepsay: 0.6439,
        TH_vaolo: 6.3904,
        TH_daralo: 0,
        TH_khosausay: 100,
        TH_kholuadat: 200,
        YS_tonngoaibai: 0,
        YS_xepsay: 3.6065,
        YS_vaolo: 0.93,
        YS_daralo: 0,
        YS_khosausay: 18,
        YS_kholuadat: 5,
        TB_tonngoaibai: 1,
        TB_xepsay: 4.6831,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 0,
        TB_kholuadat: 0,
        total: 999

    },
    {
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        TH_tonngoaibai: 0,
        TH_xepsay: 0.6439,
        TH_vaolo: 6.3904,
        TH_daralo: 0,
        TH_khosausay: 56,
        TH_kholuadat: 42,
        YS_tonngoaibai: 20,
        YS_xepsay: 3.6065,
        YS_vaolo: 0.93,
        YS_daralo: 0,
        YS_khosausay: 120,
        YS_kholuadat: 0,
        TB_tonngoaibai: 10,
        TB_xepsay: 4.6831,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 859,
        TB_kholuadat: 374,
        total: 999
    },
    {
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        TH_tonngoaibai: 15,
        TH_xepsay: 0.6439,
        TH_vaolo: 6.3904,
        TH_daralo: 0,
        TH_khosausay: 1450,
        TH_kholuadat: 1234,
        YS_tonngoaibai: 8,
        YS_xepsay: 3.6065,
        YS_vaolo: 0.93,
        YS_daralo: 0,
        YS_khosausay: 142,
        YS_kholuadat: 16,
        TB_tonngoaibai: 7,
        TB_xepsay: 4.6831,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 145,
        TB_kholuadat: 73,
        total: 999
        ,
    },
    {
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        TH_tonngoaibai: 3,
        TH_xepsay: 0.6439,
        TH_vaolo: 6.3904,
        TH_daralo: 0,
        TH_khosausay: 520,
        TH_kholuadat: 120,
        YS_tonngoaibai: 10,
        YS_xepsay: 3.6065,
        YS_vaolo: 0.93,
        YS_daralo: 0,
        YS_khosausay: 784,
        YS_kholuadat: 41,
        TB_tonngoaibai: 0,
        TB_xepsay: 4.6831,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 7,
        TB_kholuadat: 0,
        total: 999

    },
    {
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        TH_tonngoaibai: 7,
        TH_xepsay: 0.6439,
        TH_vaolo: 6.3904,
        TH_daralo: 0,
        TH_khosausay: 0,
        TH_kholuadat: 0,
        YS_tonngoaibai: 6,
        YS_xepsay: 3.6065,
        YS_vaolo: 0.93,
        YS_daralo: 0,
        YS_khosausay: 142,
        YS_kholuadat: 2,
        TB_tonngoaibai: 5,
        TB_xepsay: 4.6831,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 450,
        TB_kholuadat: 25,
        total: 999
        ,
    },
    {
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        TH_tonngoaibai: 2,
        TH_xepsay: 0.6439,
        TH_vaolo: 6.3904,
        TH_daralo: 0,
        TH_khosausay: 142,
        TH_kholuadat: 20,
        YS_tonngoaibai: 2,
        YS_xepsay: 3.6065,
        YS_vaolo: 0.93,
        YS_daralo: 0,
        YS_khosausay: 478,
        YS_kholuadat: 22,
        TB_tonngoaibai: 3,
        TB_xepsay: 4.6831,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 176,
        TB_kholuadat: 150,
        total: 999
    },
    {
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        TH_tonngoaibai: 1,
        TH_xepsay: 0.6439,
        TH_vaolo: 6.3904,
        TH_daralo: 0,
        TH_khosausay: 1425,
        TH_kholuadat: 201,
        YS_tonngoaibai: 11,
        YS_xepsay: 3.6065,
        YS_vaolo: 0.93,
        YS_daralo: 0,
        YS_khosausay: 14,
        YS_kholuadat: 1,
        TB_tonngoaibai: 0,
        TB_xepsay: 4.6831,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 142,
        TB_kholuadat: 25,
        total: 999
        ,
    },
    {
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        TH_tonngoaibai: 0,
        TH_xepsay: 0.6439,
        TH_vaolo: 6.3904,
        TH_daralo: 0,
        TH_khosausay: 120,
        TH_kholuadat: 40,
        YS_tonngoaibai: 2,
        YS_xepsay: 3.6065,
        YS_vaolo: 0.93,
        YS_daralo: 0,
        YS_khosausay: 78,
        YS_kholuadat: 35,
        TB_tonngoaibai: 0,
        TB_xepsay: 4.6831,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 0,
        TB_kholuadat: 0,
        total: 999

    },
    {
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        TH_tonngoaibai: 3,
        TH_xepsay: 0.6439,
        TH_vaolo: 6.3904,
        TH_daralo: 0,
        TH_khosausay: 378,
        TH_kholuadat: 19,
        YS_tonngoaibai: 6,
        YS_xepsay: 3.6065,
        YS_vaolo: 0.93,
        YS_daralo: 0,
        YS_khosausay: 0,
        YS_kholuadat: 0,
        TB_tonngoaibai: 0,
        TB_xepsay: 4.6831,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 14,
        TB_kholuadat: 1,
        total: 999

    },
    {
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        TH_tonngoaibai: 20,
        TH_xepsay: 0.6439,
        TH_vaolo: 6.3904,
        TH_daralo: 0,
        TH_khosausay: 120,
        TH_kholuadat: 14,
        YS_tonngoaibai: 4,
        YS_xepsay: 3.6065,
        YS_vaolo: 0.93,
        YS_daralo: 0,
        YS_khosausay: 75,
        YS_kholuadat: 25,
        TB_tonngoaibai: 1,
        TB_xepsay: 4.6831,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 237,
        TB_kholuadat: 75,
        total: 999
    },
    {
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        TH_tonngoaibai: 30,
        TH_xepsay: 0.6439,
        TH_vaolo: 6.3904,
        TH_daralo: 0,
        TH_khosausay: 20,
        TH_kholuadat: 1,
        YS_tonngoaibai: 13,
        YS_xepsay: 3.6065,
        YS_vaolo: 0.93,
        YS_daralo: 0,
        YS_khosausay: 31,
        YS_kholuadat: 3,
        TB_tonngoaibai: 25,
        TB_xepsay: 4.6831,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 144,
        TB_kholuadat: 45,
        total: 999
    },
    {
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        TH_tonngoaibai: 4,
        TH_xepsay: 0.6439,
        TH_vaolo: 6.3904,
        TH_daralo: 0,
        TH_khosausay: 142,
        TH_kholuadat: 25,
        YS_tonngoaibai: 4,
        YS_xepsay: 3.6065,
        YS_vaolo: 0.93,
        YS_daralo: 0,
        YS_khosausay: 200,
        YS_kholuadat: 25,
        TB_tonngoaibai: 4,
        TB_xepsay: 4.6831,
        TB_vaolo: 0,
        TB_daralo: 0,
        TB_khosausay: 142,
        TB_kholuadat: 25,
        total: 999
    },
];

// const columnData = [
//     {
//         name: "Nhà máy Thuận Hung",
//         id: "TH",
//     },
//     {
//         name: "Nhà máy Yên Sơn",
//         id: "YS",
//     },
//     {
//         name: "Nhà máy Thái Bình",
//         id: "TB",
//     },
// ];

const workSheetName = "Sheet1";
const workBookName = "Báo cáo tồn sấy lựa";

// var checkboxSelection = function (params) {
//     return params.columnApi.getRowGroupColumns().length === 0;
// };

// var headerCheckboxSelection = function (params) {
//     return params.columnApi.getRowGroupColumns().length === 0;
// };

function SelectedDriedInventoryReport() {
    const { loading, setLoading } = useAppContext();

    const reportGridRef = useRef();

    const containerStyle = useMemo(
        () => ({ width: "100%", height: "100%" }),
        []
    );
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

    const localeText = useMemo(() => {
        return AG_GRID_LOCALE_VI;
    }, []);

    const [selectedDate, setSelectedDate] = useState(new Date());

    const [firstTimeRender, setFirstTimeRender] = useState(true);

    const [columnData, setColumnData] = useState([
        {
            name: "Nhà máy Thuận Hung",
            id: "TH",
        },
        {
            name: "Nhà máy Yên Sơn",
            id: "YS",
        },
        {
            name: "Nhà máy Thái Bình",
            id: "TB",
        },
    ]);
    const [reportData, setReportData] = useState([]);
    const [summaryData, setSummaryData] = useState(null);

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

    const [reportColumnDefs, setReportColumnDefs] = useState([
        {
            headerName: "#",
            valueGetter: function (params) {
                if (params.node.rowPinned) {
                    return "";
                } else return params.node.rowIndex + 1;
            },
            headerClass: "bg-cyan-200 hover:bg-slate-300",
            minWidth: 60,
            width: 60,
            maxHeight: 100,
            filter: false,
            pinned: "left",
        },
        {
            headerName: "Tên",
            minWidth: 300,
            valueGetter: function (params) {
                return params.data.name;
            },
            headerClass: "bg-cyan-200 hover:bg-slate-300",
            pinned: "left",
        },
        {
            headerName: "Quy Cách",
            children: [
                {
                    headerName: "Dày",
                    field: "thickness",
                    minWidth: 80,
                    width: 80,
                    headerClass: "bg-cyan-200 hover:bg-slate-300",
                    suppressMovable: true,
                    cellClass: "suppress-movable-col",
                    filter: "agNumberColumnFilter",
                    pinned: "left",
                },
                {
                    headerName: "Rộng",
                    field: "width",
                    width: 90,
                    minWidth: 90,
                    headerClass: "bg-cyan-200 hover:bg-slate-300",
                    suppressMovable: true,
                    cellClass: "suppress-movable-col",
                    filter: "agNumberColumnFilter",
                    pinned: "left",
                },
                {
                    headerName: "Dài",
                    field: "length",
                    width: 80,
                    minWidth: 80,
                    headerClass: "bg-cyan-200 hover:bg-slate-300",
                    suppressMovable: true,
                    cellClass: "suppress-movable-col",
                    filter: "agNumberColumnFilter",
                    pinned: "left",
                },
            ],
            headerClass: "bg-cyan-200 hover:bg-slate-300",
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
            // enableRowGroup: true,
            enablePivot: true,
            enableValue: true,
            sortable: true,
            resizable: true,
            filter: true,
            flex: 1,
            minWidth: 100,
        };
    }, []);

    const gridOptions = {
        enableRangeSelection: true,
        enableCellTextSelection: true,
    };

    const onReportGridReady = useCallback(async (params) => {
        // console.log("Ra gì: ", params.api);
        // console.log("Ra gì 2: ", params.columnApi.getColumnDefs);
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        showLoadingReport();
        // const res = await usersApi.getAllUsers();
        setTimeout(() => {
            setReportData(exampleData);
            // console.log("Alo: ", reportGridRef.current.api);
            reportGridRef.current.api.setPinnedTopRowData(
                calculateSummary(exampleData)
            );
        }, 1000);
        hideLoadingReport();
    }, []);

    const onFirstDataRendered = useCallback((params) => {
        console.log("Bắt sự kiện render dữ liệu");
        reportGridRef.current.api.paginationGoToPage(0);
    }, []);

    const onFilterTextBoxChanged = useCallback(() => {
        reportGridRef.current.api.setQuickFilter(
            document.getElementById("search").value
        );
    }, []);

    const showLoadingReport = useCallback(() => {
        reportGridRef.current.api.showLoadingOverlay();
    }, []);

    const hideLoadingReport = useCallback(() => {
        reportGridRef.current.api.hideOverlay();
    }, []);

    const getRowStyle = useCallback((params) => {
        if (params.node.rowPinned) {
            return { fontWeight: "bold", backgroundColor: "rgb(212 212 216)" };
        }
    }, []);

    const calculateSummary = (data) => {
        var totalSummary = {};

        totalSummary.total = Number(
            data
                .reduce((acc, item) => {
                    return acc + (item?.total || 0);
                }, 0)
                .toFixed(4)
        );

        columnData.forEach((column) => {
            const columnTonngoaibai = `${column.id}_tonngoaibai`;
            const columnXepsay = `${column.id}_xepsay`;
            const columnVaolo = `${column.id}_vaolo`;
            const columnDaralo = `${column.id}_daralo`;
            const columnKhosausay = `${column.id}_khosausay`;
            const columnKholuadat = `${column.id}_kholuadat`;

            

            totalSummary[columnTonngoaibai] = Number(
                data
                    .reduce((acc, item) => {
                        return acc + (item[columnTonngoaibai] || 0);
                    }, 0)
                    .toFixed(4)
            );
            totalSummary[columnXepsay] = Number(
                data
                    .reduce((acc, item) => {
                        return acc + (item[columnXepsay] || 0);
                    }, 0)
                    .toFixed(4)
            );
            totalSummary[columnVaolo] = Number(
                data
                    .reduce((acc, item) => {
                        return acc + (item[columnVaolo] || 0);
                    }, 0)
                    .toFixed(4)
            );
            totalSummary[columnDaralo] = Number(
                data
                    .reduce((acc, item) => {
                        return acc + (item[columnDaralo] || 0);
                    }, 0)
                    .toFixed(4)
            );
            totalSummary[columnKhosausay] = Number(
                data
                    .reduce((acc, item) => {
                        return acc + (item[columnKhosausay] || 0);
                    }, 0)
                    .toFixed(4)
            );
            totalSummary[columnKholuadat] = Number(
                data
                    .reduce((acc, item) => {
                        return acc + (item[columnKholuadat] || 0);
                    }, 0)
                    .toFixed(4)
            );
        });

        console.log("Ra dùm, mơn: ", totalSummary);

        totalSummary.name = "Tổng";

        setSummaryData(totalSummary);

        var result = [];
        // for (var i = 0; i < count; i++) {
        result.push(totalSummary);
        return result;
    };

    const pinnedTopRowData = useMemo(() => {
        return calculateSummary(reportData);
    }, []);

    const getChangedReportData = (data) => {
        console.log(
            "Dữ liệu thay đổi: ",
            data.api.getModel().rowsToDisplay.map((row) => row.data)
        );
    };

    // Này là hàm thêm pinned top row
    // const onPinnedRowTopCount = useCallback(() => {
    //     var headerRowsToFloat = document.getElementById("top-row-count").value;
    //     var count = Number(headerRowsToFloat);
    //     var rows = createData(count, "Top");
    //     gridRef.current.api.setPinnedTopRowData(rows);
    // }, []);

    // const generatePinnedBottomData = () => {
    //     let result = {};
    //     gridColumnApi.getAllGridColumns().forEach((item) => {
    //         result[item.colId] = null;
    //     });
    //     return calculatePinnedBottomData(result);
    // };

    const calculatePinnedBottomData = (target) => {
        let columnsWithAggregation = ["age"];
        columnsWithAggregation.forEach((element) => {
            gridApi.forEachNodeAfterFilter((rowNode) => {
                if (rowNode.data[element]) {
                    target[element] += Number(rowNode.data[element].toFixed(2));
                }
            });
            if (target[element]) {
                target[element] = `Age Sum: ${target[element].toFixed(2)}`;
            }
        });
        return target;
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(workSheetName);

            // Xuất phần header và subheader
            let currentColumn = 1;
            let currentRow = 1;

            reportColumnDefs.forEach((column, index) => {
                const currentIndex = index;
                console.log(
                    "Xin chào: ",
                    currentIndex <= 2 + columnData.length
                );
                const startColumn = currentColumn;
                const endColumn =
                    currentColumn +
                    (currentIndex == 2
                        ? 2
                        : column.children &&
                          currentIndex <= 2 + columnData.length
                        ? 3
                        : column.children &&
                          currentIndex > 2 + columnData.length
                        ? 1
                        : 0);

                if (column.children) {
                    worksheet.mergeCells(
                        currentRow,
                        startColumn,
                        currentRow,
                        endColumn
                    );
                } else {
                    worksheet.mergeCells(
                        currentRow,
                        startColumn,
                        currentRow + 2,
                        endColumn
                    );
                }

                const headerCell = worksheet.getCell(currentRow, startColumn);

                headerCell.style.alignment = {
                    vertical: "middle",
                    horizontal: "center",
                    wrapText: true,
                };
                headerCell.style.font = {
                    bold: true,
                };
                headerCell.style.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "e5edff" },
                };

                headerCell.style.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };

                headerCell.value = column.headerName;

                if (column.headerName == "Tên") {
                    if (column.headerName == "Tên") {
                        worksheet.getColumn(currentColumn).width = 50;
                    }
                } else {
                    // Đặt width mặc định
                    // worksheet.getColumn(currentColumn).width = 50;
                }

                if (column.children) {
                    let i = 0;
                    column.children.forEach((item) => {
                        const subHeaderCell = worksheet.getCell(
                            currentRow + 1,
                            startColumn + i
                        );

                        worksheet.getColumn(startColumn + i).width = 15;

                        subHeaderCell.value = item.headerName;

                        // Merge
                        if (item.children && item.children.length > 0) {
                            worksheet.mergeCells(
                                currentRow + 1,
                                startColumn + i,
                                currentRow + 1,
                                startColumn + i + 2 
                            );
                                let j = 1
                            item.children.forEach((child) => {
                                const semiSubHeaderCell = worksheet.getCell(
                                    currentRow + 2,
                                    startColumn + j
                                );

                                semiSubHeaderCell.value = child.headerName;

                                semiSubHeaderCell.style.alignment = {
                                    vertical: "middle",
                                    horizontal: "center",
                                    wrapText: true,
                                };
        
                                semiSubHeaderCell.style.font = {
                                    bold: true,
                                };
        
                                semiSubHeaderCell.style.fill = {
                                    type: "pattern",
                                    pattern: "solid",
                                    fgColor: { argb: "e5edff" },
                                };
        
                                semiSubHeaderCell.style.border = {
                                    top: { style: "thin" },
                                    left: { style: "thin" },
                                    bottom: { style: "thin" },
                                    right: { style: "thin" },
                                };

                                j++;
                            })
                        } else {
                            worksheet.mergeCells(
                                currentRow + 1,
                                startColumn + i,
                                currentRow + 2,
                                startColumn + i 
                            );
                        }

                        subHeaderCell.style.alignment = {
                            vertical: "middle",
                            horizontal: "center",
                            wrapText: true,
                        };

                        subHeaderCell.style.font = {
                            bold: true,
                        };

                        subHeaderCell.style.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "e5edff" },
                        };

                        subHeaderCell.style.border = {
                            top: { style: "thin" },
                            left: { style: "thin" },
                            bottom: { style: "thin" },
                            right: { style: "thin" },
                        };

                        i++;
                    });
                }
                currentColumn = endColumn + 1;
            });

            worksheet.getRow(currentRow).height = 25;
            currentRow += 1;

            // Tính tổng
            worksheet.getRow(4).height = 25;
            worksheet.getCell("B4").value = "Tổng";

            ["A4", "B4", "C4", "D4", "E4"].forEach((cell) => {
                const colorCell = worksheet.getCell(cell);

                colorCell.style.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "9ad5bf" },
                };

                colorCell.style.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };

                colorCell.style.alignment = {
                    vertical: "middle",
                };
            });

            const sumTotal = Object.values(summaryData).filter(
                (value, index) => {
                    return Object.keys(summaryData)[index] !== "name";
                }
            );

            const startSumColumn = 6;
            let currentStartColumn = startSumColumn;
            const sumRowNumber = 4;

            sumTotal.forEach((value) => {
                const currentSumCell = worksheet.getCell(
                    sumRowNumber,
                    currentStartColumn
                );
                currentSumCell.value = value;

                currentSumCell.style.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "9ad5bf" },
                };

                currentSumCell.style.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };

                currentSumCell.style.alignment = {
                    vertical: "middle",
                };
                
                currentSumCell.style.font = {
                    bold: true,
                };

                currentStartColumn++;
            });

            // Đổ dữ liệu nè
            const arrayOfValues = reportData.map((obj, index) => [
                index + 1,
                ...Object.values(obj),
            ]);

            console.log("MẢng body: ", arrayOfValues);
            // Đặt giá trị vào worksheet
            let startRow = 5;

            // Đặt giá trị vào worksheet
            arrayOfValues.forEach((row) => {
                row.forEach((value, colIndex) => {
                    const cell = worksheet.getCell(startRow, colIndex + 1);

                    // Đặt giá trị cho ô
                    cell.value = value;

                    // Đặt border cho ô
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };

                    cell.style.alignment = {
                        vertical: "middle",
                    };

                    // Canh giữa cho cột đầu tiên
                    if (colIndex + 1 === 1) {
                        cell.alignment = {
                            vertical: "middle",
                            horizontal: "center",
                        };
                    }

                    // Text wrap cho cột thứ hai
                    if (colIndex + 1 === 2) {
                        cell.alignment = { wrapText: true };
                    }

                    // Định dạng số và làm tròn 4 chữ số cho các cột khác
                    if (colIndex + 1 !== 1 && colIndex + 1 !== 2) {
                        if (
                            Number.isFinite(value) &&
                            !Number.isInteger(value)
                        ) {
                            // Là số thập phân, thực hiện làm tròn
                            cell.numFmt = "#,##0.0000";
                        } else {
                            // Không làm tròn nếu là số nguyên hoặc bằng 0
                            cell.numFmt = "#,##0";
                        }
                    }
                });

                // Tăng dòng bắt đầu cho item tiếp theo
                startRow++;
            });

            // Lưu file Excel
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), workBookName + ".xlsx");

            toast.success("Xuất file thành công.");
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra.");
        }
    };

    useEffect(() => {
        const currentDate = new Date();
        const isValidSelectedDate = selectedDate && selectedDate <= currentDate;

        if (!isValidSelectedDate) {
            setSelectedDate(currentDate);
        }
    }, [selectedDate]);

    useEffect(() => {
        if (firstTimeRender) {
            const fetchColumnData = async () => {
                try {
                    // const response = await fetch("API_URL");
                    // const columnData = await response.json();
                    const newColumnDefs = columnData.map((column) => {
                        return {
                            headerName: column.name,
                            headerClass: "bg-cyan-200 hover:bg-slate-300",
                            suppressMovable: true,
                            cellClass: "suppress-movable-col",
                            // children: [
                            //     {
                            //         headerName: "Chưa sấy",
                            //         field: `${column.id}_xepsay`,
                            //         minWidth: 120,
                            //         headerClass:
                            //             "bg-cyan-200 hover:bg-slate-300",
                            //         aggFunc: "sum",
                            //         suppressMovable: true,
                            //         cellClass: "suppress-movable-col",
                            //         filter: "agNumberColumnFilter",
                            //     },
                            //     {
                            //         headerName: "Đang sấy",
                            //         field: `${column.id}_vaolo`,
                            //         minWidth: 120,
                            //         headerClass:
                            //             "bg-cyan-200 hover:bg-slate-300",
                            //         aggFunc: "sum",
                            //         suppressMovable: true,
                            //         cellClass: "suppress-movable-col",
                            //         filter: "agNumberColumnFilter",
                            //     },
                            //     {
                            //         headerName: "Đã sấy",
                            //         field: `${column.id}_daralo`,
                            //         minWidth: 100,
                            //         headerClass:
                            //             "bg-cyan-200 hover:bg-slate-300",
                            //         aggFunc: "sum",
                            //         suppressMovable: true,
                            //         cellClass: "suppress-movable-col",
                            //         filter: "agNumberColumnFilter",
                            //     },
                            // ],
                            children: [
                                {
                                    headerName: "Số lượng tồn ngoài bãi",
                                    headerClass:
                                        "bg-cyan-200 hover:bg-slate-300 header-row-span-3",
                                    suppressMovable: true,
                                    cellClass: "suppress-movable-col",
                                    // minWidth: 100,
                                    // width: 100,
                                    field: `${column.id}_tonngoaibai`,
                                    suppressRowTransform: true,
                                    rowSpan: function (params) {
                                        if (1 == 1) {
                                            return 2;
                                        }
                                    },
                                    wrapHeaderText: true,
                                    // autoHeaderHeight: true,
                                },
                                {
                                    headerName: "Số lượng xếp sấy",
                                    headerClass:
                                        "bg-cyan-200 hover:bg-slate-300",
                                    suppressMovable: true,
                                    cellClass: "suppress-movable-col",
                                    marryChildren: true,
                                    children: [
                                        {
                                            headerName: "Chưa sấy",
                                            field: `${column.id}_xepsay`,
                                            minWidth: 120,
                                            headerClass:
                                                "bg-cyan-200 hover:bg-slate-300",
                                            aggFunc: "sum",
                                            suppressMovable: true,
                                            cellClass: "suppress-movable-col",
                                            filter: "agNumberColumnFilter",
                                        },
                                        {
                                            headerName: "Đang sấy",
                                            field: `${column.id}_vaolo`,
                                            minWidth: 120,
                                            headerClass:
                                                "bg-cyan-200 hover:bg-slate-300",
                                            aggFunc: "sum",
                                            suppressMovable: true,
                                            cellClass: "suppress-movable-col",
                                            filter: "agNumberColumnFilter",
                                        },
                                        {
                                            headerName: "Đã sấy",
                                            field: `${column.id}_daralo`,
                                            minWidth: 100,
                                            headerClass:
                                                "bg-cyan-200 hover:bg-slate-300",
                                            aggFunc: "sum",
                                            suppressMovable: true,
                                            cellClass: "suppress-movable-col",
                                            filter: "agNumberColumnFilter",
                                        },
                                    ],
                                },
                            ],
                        };
                    });

                    const newColumnDefs2 = columnData.map((column) => {
                        return {
                            headerName: column.name,
                            headerClass: "bg-cyan-200 hover:bg-slate-300",
                            suppressMovable: true,
                            cellClass: "suppress-movable-col",
                            children: [
                                {
                                    headerName: "Kho sau sấy",
                                    headerClass:
                                        "bg-cyan-200 hover:bg-slate-300 header-row-span-3",
                                    suppressMovable: true,
                                    cellClass: "suppress-movable-col",
                                    field: `${column.id}_khosausay`,
                                    suppressRowTransform: true,
                                    wrapHeaderText: true,
                                    // autoHeaderHeight: true,
                                },
                                {
                                    headerName: "Kho lựa đạt",
                                    headerClass:
                                        "bg-cyan-200 hover:bg-slate-300",
                                    suppressMovable: true,
                                    cellClass: "suppress-movable-col",
                                    field: `${column.id}_kholuadat`,
                                    wrapHeaderText: true,
                                },
                            ],
                        };
                    });

                    const newHeader = [...reportColumnDefs];

                    newColumnDefs.forEach((item) => {
                        newHeader.push(item);
                    });

                    newColumnDefs2.forEach((item) => {
                        newHeader.push(item);
                    });

                    newHeader.push({
                        headerName: "Tổng",
                        headerClass:
                            "bg-cyan-200 hover:bg-slate-300 header-row-span-3",
                        suppressMovable: true,
                        cellClass: "suppress-movable-col",
                        field: "total",
                        suppressRowTransform: true,
                        wrapHeaderText: true,
                        // autoHeaderHeight: true,
                    });

                    console.log("Ra gì: ", newHeader);

                    setReportColumnDefs(newHeader);
                } catch (error) {
                    console.error("Error fetching column data", error);
                }
            };

            // Gọi hàm lấy dữ liệu cột
            fetchColumnData();
        }

        setFirstTimeRender(false);

        document.title = "Woodsland - Báo cáo tồn sấy lựa";
        document.body.classList.add("body-no-scroll");
        const params = new URLSearchParams(window.location.search);

        return () => {
            document.body.classList.remove("body-no-scroll");
            document.title = "Woodsland";
        };
    }, []);

    return (
        <Layout>
            <div className="flex justify-center bg-transparent h-screen ">
                {/* Section */}
                <div className="w-screen p-6 px-5 xl:p-12 xl:py-6 xl:px-32 ">
                    {/* Header */}
                    <div className="text-xl md:text-3xl font-bold mb-6">
                        Báo cáo tồn sấy lựa
                    </div>

                    {/* Main content */}
                    <section className="bg-white rounded-lg border-2 mb-2 p-4 border-gray-200 h-[calc(100%-129px)]">
                        {/* Controller */}
                        <section className="flex gap-2 md:gap-4">
                            <div className="flex gap-2 md:gap-4 items-center">
                                <label className="whitespace-nowrap text-sm md:text-base">
                                    Chọn ngày xem báo cáo:{" "}
                                </label>
                                <DatePicker
                                    className="border border-gray-300 font-bold text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-24 p-2"
                                    selected={selectedDate}
                                    onChange={(date) => setStartDate(date)}
                                    dateFormat="dd/MM/yyyy"
                                    maxDate={new Date()}
                                />
                            </div>
                        </section>
                        <Divider className="my-4" />
                        <div className="xl:flex md:flex xl:justify-between xl:space-y-0 space-y-3 items-center">
                            <div className="flex w-full justify-end space-x-4">
                                <div className="">
                                    <label
                                        for="search"
                                        className="mb-2 font-medium text-gray-900 sr-only"
                                    >
                                        Tìm kiếm
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
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
                                            type="search"
                                            id="search"
                                            className="block w-full p-2.5 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Tìm kiếm"
                                            onInput={onFilterTextBoxChanged}
                                            required
                                        />
                                    </div>
                                </div>
                                <div
                                    className="h-full"
                                    onClick={handleExportExcel}
                                >
                                    <button className="w-full h-full space-x-2 flex items-center bg-gray-800 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all">
                                        <PiExportLight />
                                        <div>Excel</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="ag-theme-alpine py-4 h-[85%] sm:h-[90%] w-full">
                            <AgGridReact
                                ref={reportGridRef}
                                className="h-full"
                                rowData={reportData}
                                columnDefs={reportColumnDefs}
                                autoGroupColumnDef={autoGroupColumnDef}
                                defaultColDef={defaultColDef}
                                suppressRowClickSelection={true}
                                groupSelectsChildren={true}
                                rowSelection={"multiple"}
                                rowGroupPanelShow={"always"}
                                pivotPanelShow={"always"}
                                onGridReady={onReportGridReady}
                                onFirstDataRendered={onFirstDataRendered}
                                suppressRowVirtualisation={true}
                                localeText={localeText}
                                pinnedTopRowData={pinnedTopRowData}
                                getRowStyle={getRowStyle}
                                onFilterChanged={getChangedReportData}
                                gridOptions={gridOptions}
                            />
                        </div>
                    </section>
                </div>
            </div>

            {loading && <Loader />}
        </Layout>
    );
}

export default SelectedDriedInventoryReport;
