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

var exampleData = [
    {
        id: "SP0001",
        name: "SKOGSTA_N tbl_180tbl_160tbl_Bench120_bench60_L shape",
        thickness: 24,
        width: 64,
        length: 1200,
        total: 999,
    },
    {
        id: "SP0002",
        name: "Melino-Chân trước",
        thickness: 35,
        width: 92,
        length: 1060,
        total: 999,
    },
    {
        id: "SP0003",
        name: "NAMM Bench có tay-Chân-tay",
        thickness: 35,
        width: 46,
        length: 660,
        total: 999,
    },
    {
        id: "SP0004",
        name: "NAMM Đố- Bench 120",
        thickness: 23,
        width: 57,
        length: 530,
        total: 999,
    },
    {
        id: "SP0005",
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        total: 999,
    },
    {
        id: "SP0006",
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        total: 999,
    },
    {
        id: "SP0007",
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        total: 999,
    },
    {
        id: "SP0008",
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        total: 999,
    },
    {
        id: "SP0009",
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        total: 999,
    },
    {
        id: "SP0010",
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        total: 999,
    },
    {
        id: "SP0011",
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        total: 999,
    },
    {
        id: "SP0012",
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        total: 999,
    },
    {
        id: "SP0013",
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        total: 999,
    },
    {
        id: "SP0014",
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        total: 999,
    },
    {
        id: "SP0015",
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        total: 999,
    },
    {
        id: "SP0016",
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        total: 999,
    },
    {
        id: "SP0017",
        name: "Skogsta-N tbl-180 tbl-160 tbl-Bench 120-Bench 60-L shape",
        thickness: 24,
        width: 50,
        length: 730,
        total: 999,
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
const workBookName = "Báo cáo lò đang sấy";

// var checkboxSelection = function (params) {
//     return params.columnApi.getRowGroupColumns().length === 0;
// };

// var headerCheckboxSelection = function (params) {
//     return params.columnApi.getRowGroupColumns().length === 0;
// };

function CurrentDryingKilnReport() {
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

    const [firstTimeRender, setFirstTimeRender] = useState(true);

    const [columnData, setColumnData] = useState([
        {
            id: "01TH",
            name: "Lò số: 01 (Thuận Hưng) (22/09/2023)",
            items: [
                {
                    id: "SP0012",
                    weight: 850,
                    quantity: 1.4084,
                },
                {
                    id: "SP0008",
                    weight: 142,
                    quantity: 17.1663,
                },
            ],
        },
        {
            id: "02TH",
            name: "Lò số: 02 (Thuận Hưng) (13/10/2023)",
            items: [
                {
                    id: "SP0005",
                    weight: 4522,
                    quantity: 0.582,
                },
            ],
        },
        {
            id: "03TH",
            name: "Lò số: 04 (Thuận Hưng) (18/10/2023)",
            items: [
                {
                    id: "SP0009",
                    weight: 820,
                    quantity: 7.584,
                },
            ],
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
            headerName: "ID",
            valueGetter: function (params) {
                return params.data.id;
            },
            headerClass: "bg-cyan-200 hover:bg-slate-300",
            minWidth: 80,
            width: 80,
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
        // showLoadingReport();
        // const res = await usersApi.getAllUsers();
        // setTimeout(() => {
        //     setReportData(exampleData);
        //     // console.log("Alo: ", reportGridRef.current.api);
        //     reportGridRef.current.api.setPinnedTopRowData(
        //         calculateSummary(exampleData)
        //     );
        // }, 1000);
        // hideLoadingReport();
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

        totalSummary.name = "Tổng";

        columnData.forEach((column) => {
            const columnTotalWeight = `${column.id}_weight`;
            const columnTotalQuantity = `${column.id}_quantity`;

            totalSummary[columnTotalWeight] = Number(
                data
                    .reduce((acc, item) => {
                        return acc + (item[columnTotalWeight] || 0);
                    }, 0)
                    .toFixed(4)
            );
            totalSummary[columnTotalQuantity] = Number(
                data
                    .reduce((acc, item) => {
                        return acc + (item[columnTotalQuantity] || 0);
                    }, 0)
                    .toFixed(4)
            );
        });

        totalSummary.total = Number(
            data
                .reduce((acc, item) => {
                    return acc + (item?.total || 0);
                }, 0)
                .toFixed(4)
        );

        console.log("Ra dùm, mơn: ", totalSummary);

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
                    (currentIndex == 3 ? 2 : currentIndex > 3 ? 1 : 0);

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
                        currentRow + 1,
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

            // Đổ dữ liệu nè
            let extendedColumns = [];

            columnData.forEach((item) => {
                extendedColumns.push(item.id + "_weight");
                extendedColumns.push(item.id + "_quantity");
            });

            console.log("Danh sách key extend nè: ", extendedColumns);

            const arrayOfValues = reportData.map((obj, index) => {
                const values = [
                    index + 1,
                    obj.id,
                    obj.name,
                    obj.thickness,
                    obj.width,
                    obj.length,
                ];

                extendedColumns.forEach((column) => {
                    values.push(obj[column] || "");
                });

                values.push(obj.total);

                return values;
            });

            // Tính tổng
            const totalRowAddress = reportData.length + 3;
            worksheet.getRow(totalRowAddress).height = 25;
            worksheet.getCell(totalRowAddress, 3).value = "Tổng";

            Array(6)
                .fill()
                .forEach((_, index) => {
                    const columnAddress = index + 1;

                    const colorCell = worksheet.getCell(
                        totalRowAddress,
                        columnAddress
                    );

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

                    colorCell.style.font = {
                        bold: true,
                    };
                });
            // ["A4", "B4", "C4", "D4", "E4"].forEach((cell) => {
            //     const colorCell = worksheet.getCell(cell);

            //     colorCell.style.fill = {
            //         type: "pattern",
            //         pattern: "solid",
            //         fgColor: { argb: "9ad5bf" },
            //     };

            //     colorCell.style.border = {
            //         top: { style: "thin" },
            //         left: { style: "thin" },
            //         bottom: { style: "thin" },
            //         right: { style: "thin" },
            //     };

            //     colorCell.style.alignment = {
            //         vertical: "middle",
            //     };
            // });

            const sumTotal = Object.values(summaryData).filter(
                (value, index) => {
                    return Object.keys(summaryData)[index] !== "name";
                }
            );

            const startSumColumn = 7;
            let currentStartColumn = startSumColumn;
            const sumRowNumber = reportData.length + 3;

            sumTotal.forEach((value, index) => {
                const currentSumCell = worksheet.getCell(
                    sumRowNumber,
                    currentStartColumn
                );

                if (index == sumTotal.length - 1) {
                    worksheet.mergeCells(
                        sumRowNumber,
                        currentStartColumn,
                        sumRowNumber,
                        currentStartColumn + 1
                    );
                }

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

            console.log("Mảng body: ", arrayOfValues);
            // Đặt giá trị vào worksheet
            let startRow = 3;

            // Đặt giá trị vào worksheet
            arrayOfValues.forEach((row, index) => {
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
                    if (colIndex == 0) {
                        cell.style.alignment = {
                            vertical: "middle",
                            horizontal: "center",
                        };
                    }
                    if (colIndex == 1) {
                        cell.style.alignment = {
                            vertical: "middle",
                            horizontal: "center",
                        };
                    }
                    if (colIndex == 2) {
                        cell.style.alignment = {
                            vertical: "middle",
                            wrapText: true,
                        };
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

                    // Merge ô cuối của dòng
                    if (colIndex == row.length - 1) {
                        worksheet.mergeCells(
                            startRow,
                            colIndex + 1,
                            startRow,
                            colIndex + 2
                        );
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

    // useEffect(() => {
    //     const currentDate = new Date();
    //     const isValidSelectedDate = selectedDate && selectedDate <= currentDate;

    //     if (!isValidSelectedDate) {
    //         setSelectedDate(currentDate);
    //     }
    // }, [selectedDate]);

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
            columnData.forEach((data) => {
                const newWeightName = data.id + "_weight";
                const newQuantityName = data.id + "_quantity";

                // exampleData = exampleData.map(example => (
                //     {...example, [newWeightName]: "", [newWeightName]: "" }
                // ))

                const items = data?.items;

                if (items && items.length > 0) {
                    items.forEach((product) => {
                        const foundItem = exampleData.find(
                            (item) => item.id === product?.id
                        );
                        if (foundItem) {
                            foundItem[newWeightName] = product?.weight;
                            foundItem[newQuantityName] = product?.quantity;
                        }
                    });
                }
            });

            console.log("Ra example data nè: ", exampleData);
            setReportData(exampleData);
            setTimeout(() => {
                reportGridRef.current.api.setPinnedBottomRowData(
                    // console.log("Alo: ", reportGridRef.current.api);
                    calculateSummary(exampleData)
                );
            }, 1000);
            // hideLoadingReport();
        };
        if (selectedFactory) {
            handleGetReportData();
        }
    }, [selectedFactory]);

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
                                    headerName: "Khối lượng",
                                    headerClass:
                                        "bg-cyan-200 hover:bg-slate-300 header-row-span-3",
                                    suppressMovable: true,
                                    cellClass: "suppress-movable-col",
                                    // minWidth: 100,
                                    // width: 100,
                                    field: `${column.id}_weight`,
                                    suppressRowTransform: true,
                                    wrapHeaderText: true,
                                    // autoHeaderHeight: true,
                                },
                                {
                                    headerName: "Sản lượng",
                                    headerClass:
                                        "bg-cyan-200 hover:bg-slate-300",
                                    field: `${column.id}_quantity`,
                                    suppressMovable: true,
                                    cellClass: "suppress-movable-col",
                                },
                            ],
                        };
                    });

                    const newHeader = [...reportColumnDefs];

                    newColumnDefs.forEach((item) => {
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

        getAllBranches();

        setFirstTimeRender(false);

        document.title = "Woodsland - Báo cáo lò đang sấy";
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
                        Báo cáo lò đang sấy
                    </div>

                    {/* Main content */}
                    <section className="bg-white rounded-lg border-2 mb-2 p-4 border-gray-200 h-[calc(100%-129px)]">
                        {/* Controller */}
                        <section className="flex gap-2 md:gap-4">
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
                        </section>
                        <Divider className="my-4" />
                        <div
                            className={`h-full py-8 ${
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
                                    <div className="ag-theme-alpine py-4 h-[75%] sm:h-[90%] w-full">
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
                                            // pinnedTopRowData={pinnedTopRowData}
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
                                    className="w-1/2 lg:w-1/3 h-fit p-4"
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

export default CurrentDryingKilnReport;
