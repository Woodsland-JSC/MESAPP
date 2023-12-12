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
import Select from "react-select";
import { saveAs } from "file-saver";
import Layout from "../../../layouts/layout";
import useAppContext from "../../../store/AppContext";
import Loader from "../../../components/Loader";
import AG_GRID_LOCALE_VI from "../../../utils/locale.vi";
import usersApi from "../../../api/userApi";
import documents from "../../../assets/images/Documents.png";

const exampleData = [
    {
        id: 1,
        createdDate: "2023-11-06T09:33:31.877Z",
        palletId: "2345-0029",
        batchId: "23-055s09",
        specificationId: "127993",
        specificationName: "Nackanas Bàn 180_Bàn 140_bàn tròn 80-Tấm mặt",
        length: 730,
        width: 55,
        thickness: 31,
        quantity: 750,
        weight: 0.9335,
        purpose: "INDOOR", // OUTDOOR
        status: 0, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
    {
        id: 2,
        createdDate: "2023-11-06T09:46:45.003Z",
        palletId: "2345-0035",
        batchId: "23-055s09",
        specificationId: "128062",
        specificationName: "HOVLIG-Cọc lều",
        length: 730,
        width: 55,
        thickness: 27,
        quantity: 942,
        weight: 1.0212,
        purpose: "INDOOR", // OUTDOOR
        status: 0, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
    {
        id: 3,
        createdDate: "2023-11-06T10:32:48.180Z",
        palletId: "2345-0057",
        batchId: "23-055s09",
        specificationId: "127928",
        specificationName:
            "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        length: 730,
        width: 55,
        thickness: 24,
        quantity: 1006,
        weight: 0.9694,
        purpose: "INDOOR", // OUTDOOR
        status: 0, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
    {
        id: 4,
        createdDate: "2023-11-06T11:26:14.210Z",
        palletId: "2345-0080",
        batchId: "23-079s07",
        specificationId: "130950",
        specificationName: "NAMM Khung tựa- khung ngồi-Nan tựa- nan mặt",
        length: 600,
        width: 56,
        thickness: 20,
        quantity: 1422,
        weight: 0.9556,
        purpose: "OUTDOOR", // INDOOR
        status: 2, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
    {
        id: 5,
        createdDate: "2023-11-06T11:26:14.210Z",
        palletId: "2345-0080",
        batchId: "23-079s07",
        specificationId: "130950",
        specificationName: "NAMM Khung tựa- khung ngồi-Nan tựa- nan mặt",
        length: 600,
        width: 56,
        thickness: 20,
        quantity: 1422,
        weight: 0.9556,
        purpose: "OUTDOOR", // INDOOR
        status: 1, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
    {
        id: 6,
        createdDate: "2023-11-06T11:26:14.210Z",
        palletId: "2345-0080",
        batchId: "23-079s07",
        specificationId: "130950",
        specificationName: "NAMM Khung tựa- khung ngồi-Nan tựa- nan mặt",
        length: 600,
        width: 56,
        thickness: 20,
        quantity: 1422,
        weight: 0.9556,
        purpose: "OUTDOOR", // INDOOR
        status: 1, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
    {
        id: 7,
        createdDate: "2023-11-06T11:26:14.210Z",
        palletId: "2345-0080",
        batchId: "23-079s07",
        specificationId: "130950",
        specificationName: "NAMM Khung tựa- khung ngồi-Nan tựa- nan mặt",
        length: 600,
        width: 56,
        thickness: 20,
        quantity: 1422,
        weight: 0.9556,
        purpose: "OUTDOOR", // INDOOR
        status: 1, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
    {
        id: 8,
        createdDate: "2023-11-06T11:26:14.210Z",
        palletId: "2345-0080",
        batchId: "23-079s07",
        specificationId: "130950",
        specificationName: "NAMM Khung tựa- khung ngồi-Nan tựa- nan mặt",
        length: 600,
        width: 56,
        thickness: 20,
        quantity: 1422,
        weight: 0.9556,
        purpose: "OUTDOOR", // INDOOR
        status: 1, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
    {
        id: 9,
        createdDate: "2023-11-06T11:26:14.210Z",
        palletId: "2345-0080",
        batchId: "23-079s07",
        specificationId: "130950",
        specificationName: "NAMM Khung tựa- khung ngồi-Nan tựa- nan mặt",
        length: 600,
        width: 56,
        thickness: 20,
        quantity: 1422,
        weight: 0.9556,
        purpose: "OUTDOOR", // INDOOR
        status: 1, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
    {
        id: 10,
        createdDate: "2023-11-06T11:26:14.210Z",
        palletId: "2345-0080",
        batchId: "23-079s07",
        specificationId: "130950",
        specificationName: "NAMM Khung tựa- khung ngồi-Nan tựa- nan mặt",
        length: 600,
        width: 56,
        thickness: 20,
        quantity: 1422,
        weight: 0.9556,
        purpose: "OUTDOOR", // INDOOR
        status: 1, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
    {
        id: 11,
        createdDate: "2023-11-06T11:26:14.210Z",
        palletId: "2345-0080",
        batchId: "23-079s07",
        specificationId: "130950",
        specificationName: "NAMM Khung tựa- khung ngồi-Nan tựa- nan mặt",
        length: 600,
        width: 56,
        thickness: 20,
        quantity: 1422,
        weight: 0.9556,
        purpose: "OUTDOOR", // INDOOR
        status: 1, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
    {
        id: 12,
        createdDate: "2023-11-06T11:26:14.210Z",
        palletId: "2345-0080",
        batchId: "23-079s07",
        specificationId: "130950",
        specificationName: "NAMM Khung tựa- khung ngồi-Nan tựa- nan mặt",
        length: 600,
        width: 56,
        thickness: 20,
        quantity: 1422,
        weight: 0.9556,
        purpose: "OUTDOOR", // INDOOR
        status: 1, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
    {
        id: 13,
        createdDate: "2023-11-06T11:26:14.210Z",
        palletId: "2345-0080",
        batchId: "23-079s07",
        specificationId: "130950",
        specificationName: "NAMM Khung tựa- khung ngồi-Nan tựa- nan mặt",
        length: 600,
        width: 56,
        thickness: 20,
        quantity: 1422,
        weight: 0.9556,
        purpose: "OUTDOOR", // INDOOR
        status: 1, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
    {
        id: 14,
        createdDate: "2023-11-06T11:26:14.210Z",
        palletId: "2345-0080",
        batchId: "23-079s07",
        specificationId: "130950",
        specificationName: "NAMM Khung tựa- khung ngồi-Nan tựa- nan mặt",
        length: 600,
        width: 56,
        thickness: 20,
        quantity: 1422,
        weight: 0.9556,
        purpose: "OUTDOOR", // INDOOR
        status: 1, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
    {
        id: 15,
        createdDate: "2023-11-06T11:26:14.210Z",
        palletId: "2345-0080",
        batchId: "23-079s07",
        specificationId: "130950",
        specificationName: "NAMM Khung tựa- khung ngồi-Nan tựa- nan mặt",
        length: 600,
        width: 56,
        thickness: 20,
        quantity: 1422,
        weight: 0.9556,
        purpose: "OUTDOOR", // INDOOR
        status: 1, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
    {
        id: 16,
        createdDate: "2023-11-06T11:26:14.210Z",
        palletId: "2345-0080",
        batchId: "23-079s07",
        specificationId: "130950",
        specificationName: "NAMM Khung tựa- khung ngồi-Nan tựa- nan mặt",
        length: 600,
        width: 56,
        thickness: 20,
        quantity: 1422,
        weight: 0.9556,
        purpose: "OUTDOOR", // INDOOR
        status: 1, // 0: Chưa sấy, 1: Đang sấy, 2: Đã sấy
    },
];

const columnData = [
    {
        name: "Lò Sấy Thuận Hưng (M3)",
        id: "TH",
    },
    {
        name: "Lò Sấy Yên Sơn 1 (M3)",
        id: "YS1",
    },
    {
        name: "Lò Sấy Thái Bình (M3)",
        id: "TB",
    },
];

const workSheetName = "Sheet1";
const workBookName = "Dữ liệu sản xuất chi tiết";

// var checkboxSelection = function (params) {
//     return params.columnApi.getRowGroupColumns().length === 0;
// };

// var headerCheckboxSelection = function (params) {
//     return params.columnApi.getRowGroupColumns().length === 0;
// };

function WoodAwaitingDryingReport() {
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

    const [branches, setBranches] = useState([]);
    const [factories, setFactories] = useState([]);

    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedFactory, setSelectedFactory] = useState("");

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const [firstTimeRender, setFirstTimeRender] = useState(true);

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
            width: 50,
            minWidth: 50,
            maxHeight: 100,
            filter: false,
        },
        {
            headerName: "Ngày xếp",
            minWidth: 180,
            width: 180,
            valueGetter: function (params) {
                return params.data.createdDate;
            },
            headerClass: "bg-cyan-200 hover:bg-slate-300",
        },
        {
            headerName: "Mã pallet",
            minWidth: 120,
            width: 120,
            valueGetter: function (params) {
                return params.data.palletId;
            },
            headerClass: "bg-cyan-200 hover:bg-slate-300",
        },
        {
            headerName: "Mã lô gỗ",
            minWidth: 130,
            width: 130,
            valueGetter: function (params) {
                return params.data.batchId;
            },
            headerClass: "bg-cyan-200 hover:bg-slate-300",
        },
        {
            headerName: "Mã quy cách",
            minWidth: 130,
            width: 130,
            valueGetter: function (params) {
                return params.data.specificationId;
            },
            headerClass: "bg-cyan-200 hover:bg-slate-300",
        },
        {
            headerName: "Tên quy cách",
            minWidth: 350,
            valueGetter: function (params) {
                return params.data.specificationName;
            },
            headerClass: "bg-cyan-200 hover:bg-slate-300",
        },
        {
            headerName: "Dài",
            minWidth: 80,
            width: 80,
            valueGetter: function (params) {
                return params.data.length;
            },
            headerClass: "bg-cyan-200 hover:bg-slate-300",
        },
        {
            headerName: "Rộng",
            minWidth: 100,
            width: 80,
            valueGetter: function (params) {
                return params.data.width;
            },
            headerClass: "bg-cyan-200 hover:bg-slate-300",
        },
        {
            headerName: "Dầy",
            minWidth: 80,
            width: 80,
            valueGetter: function (params) {
                return params.data.thickness;
            },
            headerClass: "bg-cyan-200 hover:bg-slate-300",
        },
        {
            headerName: "Số lượng",
            minWidth: 120,
            valueGetter: function (params) {
                return params.data.quantity;
            },
            headerClass: "bg-cyan-200 hover:bg-slate-300",
        },
        {
            headerName: "Khối lượng",
            minWidth: 130,
            valueGetter: function (params) {
                return params.data.weight;
            },
            headerClass: "bg-cyan-200 hover:bg-slate-300",
        },
        {
            headerName: "Mục đích sấy",
            minWidth: 140,
            valueGetter: function (params) {
                return params.data.purpose;
            },
            headerClass: "bg-cyan-200 hover:bg-slate-300",
        },
        {
            headerName: "Trạng thái",
            minWidth: 180,
            valueGetter: function (params) {
                return params.data.status;
            },
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
        rowGroupPanelShow: "always",
    };

    const onReportGridReady = useCallback(async (params) => {
        console.log("Ra gì: ", params.api);
        console.log("Ra gì 2: ", params.columnApi.getColumnDefs);
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
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
        var totalSummary = 0;

        console.log("Moẹ data ra gì: ", data);
        if (data) {
            totalSummary = Number(
                data
                    .reduce((acc, item) => {
                        return acc + (item.weight || 0);
                    }, 0)
                    .toFixed(4)
            );
        }

        console.log("Ra dùm, mơn: ", totalSummary);

        setSummaryData(totalSummary);

        var result = [];
        result.push({
            weight: totalSummary,
            palletId: "Tổng cộng",
        });
        return result;
    };

    const pinnedBottomRowData = useMemo(() => {
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
        setLoading(true);
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(workSheetName);

            // Xuất phần header và subheader
            let currentColumn = 1;
            let currentRow = 1;

            reportColumnDefs.forEach((column) => {
                const startColumn = currentColumn;
                const headerCell = worksheet.getCell(currentRow, startColumn);

                headerCell.style.alignment = {
                    vertical: "middle",
                    horizontal: "center",
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

                if (column.headerName == "Ngày xếp") {
                    worksheet.getColumn(currentColumn).width = 50;
                } else if (column.headerName == "Mã pallet") {
                    worksheet.getColumn(currentColumn).width = 15;
                } else if (column.headerName == "Mã lô gỗ") {
                    worksheet.getColumn(currentColumn).width = 10;
                } else if (column.headerName == "Mã quy cách") {
                    worksheet.getColumn(currentColumn).width = 12;
                } else if (column.headerName == "Tên quy cách") {
                    worksheet.getColumn(currentColumn).width = 60;
                } else if (column.headerName == "Số lượng") {
                    worksheet.getColumn(currentColumn).width = 13;
                } else if (column.headerName == "Khối lượng") {
                    worksheet.getColumn(currentColumn).width = 13;
                } else if (column.headerName == "Mục đích sấy") {
                    worksheet.getColumn(currentColumn).width = 15;
                } else if (column.headerName == "Trạng thái") {
                    worksheet.getColumn(currentColumn).width = 13;
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

                        subHeaderCell.style.alignment = {
                            vertical: "middle",
                            horizontal: "center",
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
                currentColumn = startColumn + 1;
            });

            worksheet.getRow(currentRow).height = 25;
            currentRow += 1;

            // const sumTotal = Object.values(summaryData).filter(
            //     (value, index) => {
            //         return Object.keys(summaryData)[index] !== "name";
            //     }
            // );

            const startSumColumn = 6;
            let currentStartColumn = startSumColumn;
            const sumRowNumber = currentRow;

            // sumTotal.forEach((value) => {
            //     const currentSumCell = worksheet.getCell(
            //         sumRowNumber,
            //         currentStartColumn
            //     );
            //     currentSumCell.value = value;

            //     currentSumCell.style.fill = {
            //         type: "pattern",
            //         pattern: "solid",
            //         fgColor: { argb: "9ad5bf" },
            //     };

            //     currentSumCell.style.border = {
            //         top: { style: "thin" },
            //         left: { style: "thin" },
            //         bottom: { style: "thin" },
            //         right: { style: "thin" },
            //     };

            //     currentSumCell.style.alignment = {
            //         vertical: "middle",
            //     };
            //     currentStartColumn++;
            // });

            // Đổ dữ liệu nè
            const arrayOfValues = reportData.map((obj, index) => [
                ...Object.values(obj),
            ]);

            console.log("MẢng body: ", arrayOfValues);
            // Đặt giá trị vào worksheet
            let startRow = 2;

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

            // Tính tổng
            worksheet.getRow(startRow).height = 25;

            var sumTextColumn = 3;

            const sumCellAddress =
                String.fromCharCode(64 + sumTextColumn) + startRow;
            worksheet.getCell(sumCellAddress).value = "Tổng cộng";

            reportColumnDefs.forEach((cell, index) => {
                const cellAddress = String.fromCharCode(64 + index + 1) + startRow;
                const colorCell = worksheet.getCell(cellAddress);

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

            // Lưu file Excel
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), workBookName + ".xlsx");

            toast.success("Xuất file thành công.");
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra.");
        }
        setLoading(false);
    };

    useEffect(() => {
        const currentDate = new Date();
        const isValidStart = startDate && startDate <= currentDate;
        const isValidEnd = endDate && endDate <= currentDate;
        const isValidRange = startDate && endDate && startDate <= endDate;

        // if (!isValidStart) {
        //     setStartDate(currentDate);
        //     toast("Tự động thay đổi ngày bắt đầu.");
        // }

        // if (!isValidEnd) {
        //     setEndDate(currentDate);
        //     toast("Tự động thay đổi ngày kết thúc.");
        // }

        // if (!isValidRange) {
        //     setStartDate(currentDate);
        //     setEndDate(currentDate);
        //     toast("Tự động thay đổi thời gian.");
        // }

        if (startDate > currentDate) {
            setStartDate(currentDate);
            toast("Tự động thay đổi ngày bắt đầu.");
        }

        if (endDate > currentDate) {
            setEndDate(currentDate);
            toast("Tự động thay đổi ngày kết thúc.");
        }

        // if (endDate < startDate) {
        //     setStartDate(new Date(endDate));
        //     toast("Ngày kết thúc phải ≥ ngày bắt đầu.");
        // }

        if (startDate > endDate) {
            setEndDate(new Date(startDate));
            toast("Ngày bắt đầu phải ≤ ngày kết thúc.");
        }
    }, [startDate, endDate]);

    useEffect(() => {
        if (firstTimeRender) {
            // const fetchColumnData = async () => {
            //     try {
            //         // const response = await fetch("API_URL");
            //         // const columnData = await response.json();
            //         const newColumnDefs = columnData.map((column) => {
            //             return {
            //                 headerName: column.name,
            //                 headerClass: "bg-cyan-200 hover:bg-slate-300",
            //                 suppressMovable: true,
            //                 cellClass: "suppress-movable-col",
            //                 children: [
            //                     {
            //                         headerName: "Chưa sấy",
            //                         field: `${column.id}_xepsay`,
            //                         minWidth: 120,
            //                         headerClass:
            //                             "bg-cyan-200 hover:bg-slate-300",
            //                         aggFunc: "sum",
            //                         suppressMovable: true,
            //                         cellClass: "suppress-movable-col",
            //                         filter: "agNumberColumnFilter",
            //                     },
            //                     {
            //                         headerName: "Đang sấy",
            //                         field: `${column.id}_vaolo`,
            //                         minWidth: 120,
            //                         headerClass:
            //                             "bg-cyan-200 hover:bg-slate-300",
            //                         aggFunc: "sum",
            //                         suppressMovable: true,
            //                         cellClass: "suppress-movable-col",
            //                         filter: "agNumberColumnFilter",
            //                     },
            //                     {
            //                         headerName: "Đã sấy",
            //                         field: `${column.id}_daralo`,
            //                         minWidth: 100,
            //                         headerClass:
            //                             "bg-cyan-200 hover:bg-slate-300",
            //                         aggFunc: "sum",
            //                         suppressMovable: true,
            //                         cellClass: "suppress-movable-col",
            //                         filter: "agNumberColumnFilter",
            //                     },
            //                 ],
            //             };
            //         });
            //         const newHeader = [...reportColumnDefs];
            //         newColumnDefs.forEach((item) => {
            //             newHeader.push(item);
            //         });
            //         console.log("Ra gì: ", newHeader);
            //         setReportColumnDefs(newHeader);
            //     } catch (error) {
            //         console.error("Error fetching column data", error);
            //     }
            // };
            // Gọi hàm lấy dữ liệu cột
            // fetchColumnData();
        }

        const getAllBranches = async () => {
            try {
                const res = await usersApi.getAllBranches();
                const options = res.map((item) => ({
                    value: item.BPLId,
                    label: item.BPLName,
                }));
                setBranches(options);
            } catch (error) {
                console.error(error);
                toast.error("Có lỗi xảy ra");
            }
        };

        // const getAllFactories = async () => {
        //     try {
        //         const res = await usersApi.getFactoriesByBranchId(selectedBranch);
        //         const options = res.map((item) => ({
        //             value: item.Code,
        //             label: item.Name,
        //         }));
        //         setFactories(options);
        //     } catch (error) {
        //         console.error(error);
        //         toast.error("Có lỗi xảy ra");
        //     }
        // };

        getAllBranches();

        setFirstTimeRender(false);

        document.title = "Woodsland - Báo cáo xếp chờ sấy";
        const params = new URLSearchParams(window.location.search);

        return () => {
            document.title = "Woodsland";
        };
    }, []);

    useEffect(() => {
        const handleGetFactory = async () => {
            try {
                setFactories([]);
                console.log("Selected branch: ", selectedBranch);
                const res = await usersApi.getFactoriesByBranchId(
                    selectedBranch?.value
                );
                const options = res.map((item) => ({
                    value: item.Code,
                    label: item.Name,
                }));
                setFactories(options);
                console.log(res);
            } catch (error) {
                console.error(error);
            }
        };
        if (selectedBranch) {
            handleGetFactory();
        }
        if (selectedFactory) {
            setSelectedFactory("");
            setReportData([]);
        }
    }, [selectedBranch]);

    useEffect(() => {
        const handleGetReportData = async () => {
            // showLoadingReport();
            // const res = await usersApi.getAllUsers();
            setReportData(exampleData);
            setTimeout(() => {
                reportGridRef.current.api.setPinnedBottomRowData(
                    // console.log("Alo: ", reportGridRef.current.api);
                    calculateSummary(exampleData)
                );
            }, 1000);
            // hideLoadingReport();
        };
        if (selectedFactory && startDate && endDate) {
            handleGetReportData();
        }
    }, [selectedFactory, startDate, endDate]);

    return (
        <Layout>
            <div className="flex justify-center bg-transparent h-screen ">
                {/* Section */}
                <div className="w-screen p-6 px-5 xl:p-12 xl:py-6 xl:px-32 ">
                    {/* Header */}
                    <div className="text-xl md:text-3xl font-bold mb-6">
                        Báo cáo xếp chờ sấy{" "}
                        {selectedFactory ? " - " + selectedFactory.label : ""}
                    </div>
                    {/* h-[calc(100%-165px)] */}
                    {/* Main content */}
                    <section
                        className={`bg-white rounded-lg border-2 mb-2 p-4 border-gray-200 h-max md:h-[calc(100%-129px)] ${
                            reportData?.length < 1 && "md:h-fit"
                        }`}
                    >
                        {/* Controller */}
                        <section className="flex flex-col lg:flex-row gap-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:gap-0">
                                <div className="flex gap-4 items-center">
                                    <label className="whitespace-nowrap">
                                        Chi nhánh:{" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <Select
                                        options={branches}
                                        onChange={(value) =>
                                            setSelectedBranch(value)
                                        }
                                        placeholder="Lựa chọn"
                                        className="flex w-48"
                                    />
                                </div>
                                <div className="flex gap-4 items-center">
                                    <label className="whitespace-nowrap">
                                        Nhà máy:{" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <Select
                                        options={factories}
                                        onChange={(value) =>
                                            setSelectedFactory(value)
                                        }
                                        value={selectedFactory}
                                        placeholder="Lựa chọn"
                                        className="flex w-40"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex gap-4 items-center">
                                    <label className="whitespace-nowrap">
                                        Từ ngày:{" "}
                                    </label>
                                    <DatePicker
                                        className="border border-gray-300 font-bold text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-24 p-2"
                                        // className="font-bold"
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        maxDate={new Date()}
                                    />
                                </div>
                                <div className="flex gap-4 items-center">
                                    <label className="whitespace-nowrap">
                                        Đến ngày:{" "}
                                    </label>
                                    <DatePicker
                                        className="border border-gray-300 font-bold text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                        // className="font-bold"
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        maxDate={new Date()}
                                    />
                                </div>
                            </div>
                        </section>
                        <Divider className="my-4" />
                        <div
                            className={`${
                                reportData?.length < 1 &&
                                "h-fit flex justify-center"
                            }`}
                        >
                            {reportData && reportData.length > 0 ? (
                                <>
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
                                                                stroke-linecap="round"
                                                                stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="search"
                                                        id="search"
                                                        className="block w-full p-2.5 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Tìm kiếm"
                                                        onInput={
                                                            onFilterTextBoxChanged
                                                        }
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="h-full">
                                                <button
                                                    onClick={handleExportExcel}
                                                    className="w-full h-full space-x-2 flex items-center bg-gray-800 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                                >
                                                    <PiExportLight />
                                                    <div>Excel</div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ag-theme-alpine py-4 h-[87%] w-full">
                                        <AgGridReact
                                            ref={reportGridRef}
                                            className="h-full"
                                            rowData={reportData}
                                            columnDefs={reportColumnDefs}
                                            autoGroupColumnDef={
                                                autoGroupColumnDef
                                            }
                                            defaultColDef={defaultColDef}
                                            suppressRowClickSelection={true}
                                            groupSelectsChildren={true}
                                            rowSelection={"multiple"}
                                            rowGroupPanelShow={"always"}
                                            pivotPanelShow={"always"}
                                            onGridReady={onReportGridReady}
                                            onFirstDataRendered={
                                                onFirstDataRendered
                                            }
                                            suppressRowVirtualisation={true}
                                            localeText={localeText}
                                            pinnedBottomRowData={
                                                pinnedBottomRowData
                                            }
                                            getRowStyle={getRowStyle}
                                            onFilterChanged={
                                                getChangedReportData
                                            }
                                            gridOptions={gridOptions}
                                        />
                                    </div>
                                </>
                            ) : (
                                <img
                                    src={documents}
                                    alt="Tài liệu"
                                    className="w-1/2 lg:w-1/3 p-4"
                                />
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {loading && <Loader />}
        </Layout>
    );
}

export default WoodAwaitingDryingReport;
