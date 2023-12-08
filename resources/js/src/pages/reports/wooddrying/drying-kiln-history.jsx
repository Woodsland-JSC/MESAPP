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
import { Checkbox, Radio, RadioGroup, Wrap, WrapItem } from "@chakra-ui/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Layout from "../../../layouts/layout";
import useAppContext from "../../../store/AppContext";
import Loader from "../../../components/Loader";
import AG_GRID_LOCALE_VI from "../../../utils/locale.vi";
import usersApi from "../../../api/userApi";
import reportApi from "../../../api/reportApi";
import woodsland from "../../../assets/images/woodsland-logo.svg";
import signature from "../../../assets/images/Nguyen-Van-Cuong-signature.png";
import documents from "../../../assets/images/Documents.png";

const exampleData = [
    {
        batchId: "23003s03",
        palletId: "2342-1035",
        thickness: 0,
        width: 64,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23003s03",
        palletId: "2342-1037",
        thickness: 0,
        width: 55,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23003s03",
        palletId: "2342-1040",
        thickness: 0,
        width: 64,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23003s04",
        palletId: "2342-1042",
        thickness: 0,
        width: 55,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23003s04",
        palletId: "2342-1043",
        thickness: 0,
        width: 55,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23003s04",
        palletId: "2342-1045",
        thickness: 0,
        width: 55,
        length: 24,
        quantity: 0.5,
        weight: 0.5,
    },
    {
        batchId: "23003s04",
        palletId: "2342-1048",
        thickness: 0,
        width: 55,
        length: 24,
        quantity: 0.8,
        weight: 0.8,
    },
    {
        batchId: "23003s04",
        palletId: "2342-1049",
        thickness: 0,
        width: 55,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23003s04",
        palletId: "2342-1051",
        thickness: 0,
        width: 55,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23003s03",
        palletId: "2342-1052",
        thickness: 0,
        width: 55,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23003s04",
        palletId: "2342-1054",
        thickness: 0,
        width: 64,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23003s04",
        palletId: "2342-1056",
        thickness: 0,
        width: 55,
        length: 24,
        quantity: 0.6,
        weight: 0.6,
    },
    {
        batchId: "23003s04",
        palletId: "2342-1057",
        thickness: 0,
        width: 64,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23003s04",
        palletId: "2342-1058",
        thickness: 0,
        width: 64,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23003s04",
        palletId: "2342-1060",
        thickness: 0,
        width: 52,
        length: 31,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23004s03",
        palletId: "2342-1061",
        thickness: 0,
        width: 64,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23004s03",
        palletId: "2342-1062",
        thickness: 0,
        width: 64,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23004s03",
        palletId: "2342-1065",
        thickness: 0,
        width: 55,
        length: 24,
        quantity: 0.8,
        weight: 0.8,
    },
    {
        batchId: "23004s03",
        palletId: "2342-1066",
        thickness: 0,
        width: 64,
        length: 24,
        quantity: 0.7,
        weight: 0.7,
    },
    {
        batchId: "23004s03",
        palletId: "2342-1068",
        thickness: 0,
        width: 55,
        length: 31,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23003s04",
        palletId: "2342-1070",
        thickness: 0,
        width: 55,
        length: 24,
        quantity: 0.5,
        weight: 0.5,
    },
    {
        batchId: "23003s04",
        palletId: "2342-1071",
        thickness: 0,
        width: 64,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23003s04",
        palletId: "2342-1072",
        thickness: 0,
        width: 64,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "23003s04",
        palletId: "2342-1074",
        thickness: 0,
        width: 64,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "22004s01",
        palletId: "2342-1076",
        thickness: 0,
        width: 52,
        length: 25,
        quantity: 1.5,
        weight: 1.5,
    },
    {
        batchId: "22004s01",
        palletId: "2342-1077",
        thickness: 0,
        width: 64,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "22004s01",
        palletId: "2342-1078",
        thickness: 0,
        width: 64,
        length: 24,
        quantity: 1,
        weight: 1,
    },
    {
        batchId: "22004s01",
        palletId: "2342-1080",
        thickness: 0,
        width: 64,
        length: 24,
        quantity: 0.7,
        weight: 0.7,
    },
    {
        batchId: "22004s01",
        palletId: "2342-1084",
        thickness: 0,
        width: 52,
        length: 31,
        quantity: 1,
        weight: 1,
    },
];

// Thêm API get tất cả lò theo nhà máy
const allKiln = [
    {
        id: "LO001",
        name: "Lò số 01",
    },
    {
        id: "LO002",
        name: "Lò số 02",
    },
    {
        id: "LO003",
        name: "Lò số 03",
    },
    {
        id: "LO004",
        name: "Lò số 04",
    },
];

const dimensionOptions = [
    {
        value: "A4",
        label: "A4",
    },
    {
        value: "A3",
        label: "A3",
    },
];

const workSheetName = "Sheet1";
const workBookName = "Biên bản lịch sử vào lò";

// var checkboxSelection = function (params) {
//     return params.columnApi.getRowGroupColumns().length === 0;
// };

// var headerCheckboxSelection = function (params) {
//     return params.columnApi.getRowGroupColumns().length === 0;
// };

function DryingKilnHistoryReport() {
    let factorySelectRef = useRef(null);
    let kilnSelectRef = useRef(null);
    let radioRef = useRef(null);
    const { loading, setLoading } = useAppContext();

    const reportGridRef = useRef();
    const reportContainer = useRef(null);

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
    const [kilns, setKilns] = useState([]);

    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [selectedKiln, setSelectedKiln] = useState(null);

    const [factoryLoading, setFactoryLoading] = useState(false);

    const [selectedDimension, setSelectedDimension] = useState({
        value: "A3",
        label: "A3",
    });

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [dateList, setDateList] = useState([]);
    const [reportDate, setReportDate] = useState("");

    const [firstTimeRender, setFirstTimeRender] = useState(true);

    const [reportData, setReportData] = useState([]);
    const [totalSummary, setTotalSummary] = useState({});

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

    // const handleExportPdf = async () => {
    //     const input = reportContainer.current;

    //     html2canvas(input, { scale: 2 }).then((canvas) => {
    //         const imgData = canvas.toDataURL("image/png");
    //         const pdf = new jsPDF("p", "mm", "a4");
    //         const pdfWidth = pdf.internal.pageSize.getWidth();
    //         const pdfHeight = pdf.internal.pageSize.getHeight();

    //         // Tính toán lề và kích thước hình ảnh
    //         const marginLeft = 10;
    //         const marginRight = 10;
    //         const marginTop = 10;
    //         const marginBottom = 10;
    //         const imgWidth = pdfWidth - marginLeft - marginRight;
    //         const imgHeight = (canvas.height * imgWidth) / canvas.width;

    //         // Thêm hình ảnh và lề vào tài liệu PDF
    //         pdf.addImage(
    //             imgData,
    //             "PNG",
    //             marginLeft,
    //             marginTop,
    //             imgWidth,
    //             imgHeight
    //         );
    //         pdf.save("my-report.pdf");
    //     });
    // };

    // const handleExportPdf = async () => {
    //     const input = reportContainer.current;

    //     html2canvas(input).then((canvas) => {
    //         const imgData = canvas.toDataURL("image/png");
    //         const pdf = new jsPDF("p", "mm", "a4");
    //         pdf.addImage(imgData, "PNG", 10, 10, 190, 237);
    //         pdf.save("Biên-bản-kiểm-tra-lò-sấy.pdf");
    //     });
    // };

    // const handleExportPdf = async () => {
    //     const input = reportContainer.current;
    //     console.log("Ra gì: ", input);

    //     if (selectedDimension && selectedDimension.value == "A3") {
    //         html2canvas(input).then((canvas) => {
    //             const pdf = new jsPDF("l", "mm", "a3");

    //             const pdfWidth = pdf.internal.pageSize.getWidth();
    //             const pdfHeight = pdf.internal.pageSize.getHeight();
    //             const imgData = canvas.toDataURL("image/png");
    //             pdf.addImage(
    //                 imgData,
    //                 "PNG",
    //                 22,
    //                 7,
    //                 pdfWidth - 44,
    //                 pdfHeight - 14
    //             );

    //             pdf.save("Biên-bản-kiểm-tra-lò-A3.pdf");
    //         });
    //     } else if (selectedDimension && selectedDimension.value == "A4") {
    //         // html2canvas(input).then((canvas) => {
    //         //     const imgData = canvas.toDataURL("image/png");
    //         //     console.log("Đâu ra canvas giúp tôi: ", canvas);
    //         //     console.log("Đâu ra hình tao coi: ", imgData);
    //         //     const pdf = new jsPDF("p", "mm", "a4");
    //         //     const pdfWidth = pdf.internal.pageSize.getWidth();
    //         //     const pdfHeight = pdf.internal.pageSize.getHeight();
    //         //     const marginLeft = 10;
    //         //     const marginRight = 10;
    //         //     const marginTop = 10;
    //         //     const marginBottom = 10;
    //         //     const imgWidth = pdfWidth - marginLeft - marginRight;
    //         //     // Tính toán chiều cao của mỗi trang
    //         //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
    //         //     // Chia thành 2 trang
    //         //     const page1Height = pdfHeight / 2;
    //         //     const page2Height = pdfHeight / 2;
    //         //     // Trang 1
    //         //     pdf.addImage(
    //         //         imgData,
    //         //         "PNG",
    //         //         marginLeft,
    //         //         marginTop,
    //         //         imgWidth,
    //         //         Math.min(imgHeight, page1Height)
    //         //     );
    //         //     // Trang 2
    //         //     if (imgHeight > page1Height) {
    //         //         pdf.addPage();
    //         //         pdf.addImage(
    //         //             imgData,
    //         //             "PNG",
    //         //             marginLeft,
    //         //             marginTop,
    //         //             imgWidth,
    //         //             Math.min(imgHeight - page1Height, page2Height)
    //         //         );
    //         //     }
    //         //     pdf.save("Biên-bản-kiểm-tra-lò-A4.pdf");
    //         // });
    //         html2canvas(input).then((canvas) => {
    //             const imgData = canvas.toDataURL("image/png");

    //             const pdf = new jsPDF("p", "mm", "a4");
    //             const pdfWidth = pdf.internal.pageSize.getWidth();
    //             const pdfHeight = pdf.internal.pageSize.getHeight();

    //             const marginLeft = 10;
    //             const marginRight = 10;
    //             const marginTop = 10;
    //             const marginBottom = 10;
    //             const imgWidth = pdfWidth - marginLeft - marginRight;

    //             // Tính toán chiều cao của hình
    //             const imgHeight = (canvas.height * imgWidth) / canvas.width;

    //             // Kiểm tra nếu hình cao hơn chiều cao của trang A4 (bao gồm margin)
    //             if (imgHeight > pdfHeight - marginTop - marginBottom) {
    //                 const remainingHeight =
    //                     imgHeight - (pdfHeight - marginTop - marginBottom);

    //                 // Trang 1
    //                 pdf.addImage(
    //                     imgData,
    //                     "PNG",
    //                     marginLeft,
    //                     marginTop,
    //                     imgWidth,
    //                     pdfHeight - marginTop - marginBottom
    //                 );

    //                 // Trang 2
    //                 pdf.addPage();
    //                 pdf.addImage(
    //                     imgData,
    //                     "PNG",
    //                     marginLeft,
    //                     marginTop - remainingHeight, // Điều chỉnh vị trí để giữ phần thừa
    //                     imgWidth,
    //                     pdfHeight - marginTop - marginBottom
    //                 );
    //             } else {
    //                 // Nếu hình không vượt quá trang A4, in toàn bộ ở trang 1
    //                 pdf.addImage(
    //                     imgData,
    //                     "PNG",
    //                     marginLeft,
    //                     marginTop,
    //                     imgWidth,
    //                     imgHeight
    //                 );
    //             }

    //             pdf.save("Biên-bản-kiểm-tra-lò-A4.pdf");
    //         });
    //     }
    // };

    const handleExportWord = async () => {
        try {
            // Chỗ này sao dùng axios không được nhỉ, check lại sau!!
            const response = await fetch(
                "http://localhost:8000/api/report/download/drying-kiln-history",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob]));

            // Download the file
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                "Danh mục theo dõi gỗ sấy trong lò.docx"
            );

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("Xuất báo cáo thành công!");
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra.");
        }
    };

    // const handleExportWord = async () => {
    //     try {
    //         const response = await reportApi.downloadKilnCheckingReport();

    //         const blob = (await response.blob) ? response.blob() : response;

    //         const url = window.URL.createObjectURL(new Blob([blob]));

    //         const link = document.createElement("a");
    //         link.href = url;
    //         link.setAttribute("download", "test.docx");

    //         // Append the link to the document
    //         document.body.appendChild(link);

    //         link.click();

    //         document.body.removeChild(link);

    //         // Release the resources
    //         window.URL.revokeObjectURL(url);
    //         toast.success("Xuất báo cáo thành công!");
    //     } catch (error) {
    //         console.error(error);
    //         toast.error("Có lỗi xảy ra.");
    //     }
    // };

    const onDimensionChanged = (value) => {
        setSelectedDimension(value);
    };

    // useEffect(() => {
    //     const currentDate = new Date();
    //     const isValidStart = startDate && startDate <= currentDate;
    //     const isValidEnd = endDate && endDate <= currentDate;
    //     const isValidRange = startDate && endDate && startDate <= endDate;

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

    //     if (startDate > currentDate) {
    //         setStartDate(currentDate);
    //         toast("Tự động thay đổi ngày bắt đầu.");
    //     }

    //     if (endDate > currentDate) {
    //         setEndDate(currentDate);
    //         toast("Tự động thay đổi ngày kết thúc.");
    //     }

    //     if (endDate < startDate) {
    //         setStartDate(new Date(endDate));
    //         toast("Ngày kết thúc phải ≥ ngày bắt đầu.");
    //         return;
    //     }

    //     if (startDate > endDate) {
    //         setEndDate(new Date(startDate));
    //         toast("Ngày bắt đầu phải ≤ ngày bắt đầu.");
    //         return;
    //     }
    // }, [startDate, endDate]);

    useEffect(() => {
        const handleGetFactories = async () => {
            setKilns([]);
            setSelectedKiln("");
            setDateList([]);
            setReportDate("");
            setTimeout(() => {
                const kilnOptions = allKiln.map((item) => ({
                    value: item.id,
                    label: item.name,
                }));
                setKilns(kilnOptions);
            }, 1000);
        };
        if (selectedFactory) {
            handleGetFactories();
        }
    }, [selectedFactory]);

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

        if (startDate && endDate && selectedKiln) {
            const exampleDateList = [
                {
                    value: "24/10/2023",
                    label: "24/10/2023",
                },
                {
                    value: "28/10/2023",
                    label: "28/10/2023",
                },
                {
                    value: "30/10/2023",
                    label: "30/10/2023",
                },
                {
                    value: "02/11/2023",
                    label: "02/11/2023",
                },
                {
                    value: "12/11/2023",
                    label: "12/11/2023",
                },
                {
                    value: "15/11/2023",
                    label: "15/11/2023",
                },
                {
                    value: "18/11/2023",
                    label: "18/11/2023",
                },
                {
                    value: "20/11/2023",
                    label: "20/11/2023",
                },
                {
                    value: "23/11/2023",
                    label: "23/11/2023",
                },
                {
                    value: "25/11/2023",
                    label: "25/11/2023",
                },
                {
                    value: "28/11/2023",
                    label: "28/11/2023",
                },
                {
                    value: "30/11/2023",
                    label: "30/11/2023",
                },
                {
                    value: "01/12/2023",
                    label: "01/12/2023",
                },
            ];
            setDateList(exampleDateList);
            setReportDate("");
            // radioRef.current.value = "";
            // console.log("Ra value của radio nè: ", radioRef.current);
            // if (radioRef.current) {
            //     const elementsWithCheckedData =
            //         radioRef.current.querySelectorAll("[data-checked]");

            //     elementsWithCheckedData.forEach((element) => {
            //         element.removeAttribute("data-checked");
            //     });
            // }
        }
    }, [selectedKiln, startDate, endDate]);

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

        document.title = "Woodsland - Biên bản lịch sử vào lò";
        const params = new URLSearchParams(window.location.search);

        return () => {
            document.title = "Woodsland";
        };
    }, []);

    useEffect(() => {
        const getFactoriesByBranchId = async () => {
            setFactoryLoading(true);
            try {
                if (selectedBranch?.value) {
                    setFactories([]);
                    setSelectedFactory(null);
                    setKilns([]);
                    setSelectedKiln(null);
                    setReportData([]);
                    setReportDate("");
                    setDateList([]);
                    factorySelectRef.current.clearValue();
                    const res = await usersApi.getFactoriesByBranchId(
                        selectedBranch.value
                    );
                    const options = res.map((item) => ({
                        value: item.Code,
                        label: item.Name,
                    }));

                    setFactories(options);
                } else {
                    setFactories([]);
                    // factorySelectRef.current?.selectOption([]);
                }
            } catch (error) {
                console.error(error);
            }
            setFactoryLoading(false);
        };

        getFactoriesByBranchId();
    }, [selectedBranch]);

    useEffect(() => {
        if (reportDate) {
            setReportData(exampleData);
            setTotalSummary({
                totalQuantity: Number(
                    exampleData
                        .reduce((acc, item) => {
                            return acc + (item?.quantity || 0);
                        }, 0)
                        .toFixed(4)
                ),
                totalWeight: Number(
                    exampleData
                        .reduce((acc, item) => {
                            return acc + (item?.weight || 0);
                        }, 0)
                        .toFixed(4)
                ),
            });
        } else {
            setReportData([]);
        }
    }, [reportDate]);

    // useEffect(() => {
    //     const handleGetFactory = async () => {
    //         try {
    //             console.log("Selected branch: ", selectedBranch);
    //             const res = await usersApi.getFactoriesByBranchId(
    //                 selectedBranch.value
    //             );
    //             const options = res.map((item) => ({
    //                 value: item.Code,
    //                 label: item.Name,
    //             }));
    //             setFactories(options);
    //             console.log(res);
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     };

    //     handleGetFactory();
    // }, [selectedBranch]);

    return (
        <Layout>
            <div className="flex justify-center bg-[#F8F9F7] h-screen ">
                {/* Section */}
                <div className="w-screen p-6 px-5 xl:p-12 xl:py-6 xl:px-32 ">
                    {/* Header */}
                    <div className="text-xl md:text-3xl font-bold mb-6">
                        Biên bản lịch sử vào lò{" "}
                    </div>
                    {/* h-[calc(100%-165px)] */}
                    {/* Main content */}
                    <section className="bg-white rounded-lg border-2 mb-2 p-4 border-gray-200 h-max">
                        {/* Controller */}
                        <section className="flex flex-col 2xl:flex-row gap-4">
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
                                        className="flex w-48 z-[999]"
                                    />
                                </div>
                                <div className="flex gap-4 items-center">
                                    <label className="whitespace-nowrap">
                                        Nhà máy:{" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <Select
                                        ref={factorySelectRef}
                                        options={factories}
                                        value={selectedFactory}
                                        onChange={(value) =>
                                            setSelectedFactory(value)
                                        }
                                        placeholder="Lựa chọn"
                                        className="flex w-40"
                                    />
                                </div>
                                <div className="flex gap-4 items-center">
                                    <label className="whitespace-nowrap">
                                        Lò sấy:{" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <Select
                                        ref={kilnSelectRef}
                                        options={kilns}
                                        value={selectedKiln}
                                        onChange={(value) =>
                                            setSelectedKiln(value)
                                        }
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
                                        className="border border-gray-300 font-bold text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-24 p-2"
                                        // className="font-bold"
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        dateFormat="dd/MM/yyyy"
                                        maxDate={new Date()}
                                    />
                                </div>
                            </div>
                        </section>
                        <div
                            className={`flex-rol sm:flex-row gap-4 mt-4 ${
                                dateList && dateList.length > 0
                                    ? "flex"
                                    : "hidden"
                            }`}
                        >
                            <div className="flex gap-4">
                                <label className="whitespace-nowrap">
                                    Ngày tạo biên bản:{" "}
                                    <span className="text-red-600">*</span>
                                </label>
                                <RadioGroup
                                    ref={radioRef}
                                    value={reportDate}
                                    onChange={setReportDate}
                                    className="gap-4"
                                >
                                    <Wrap>
                                        {dateList &&
                                            dateList.length > 0 &&
                                            dateList.map((date, index) => (
                                                <WrapItem key={index}>
                                                    <Radio
                                                        value={date.value}
                                                        // key={index}
                                                    >
                                                        {date.label}
                                                    </Radio>
                                                </WrapItem>
                                            ))}
                                    </Wrap>
                                </RadioGroup>
                            </div>
                        </div>

                        {reportData && reportData.length > 0 && (
                            <div className="xl:flex md:flex xl:justify-between xl:space-y-0 space-y-3 items-center mt-4">
                                <div className="flex xl:w-2/3 md:w-2/3 gap-x-4 items-center whitespace-nowrap">
                                    Khổ giấy thể hiện:
                                    <Select
                                        id="page-size"
                                        options={dimensionOptions}
                                        onChange={onDimensionChanged}
                                        defaultValue={selectedDimension}
                                    />
                                </div>
                                <div className="flex w-full justify-between sm:justify-end space-x-4">
                                    <div className="h-full w-3/7 sm:w-auto">
                                        <button
                                            onClick={handleExportWord}
                                            className="w-full h-full space-x-2 flex items-center bg-gray-800 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                        >
                                            <PiExportLight />
                                            <div>Word</div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Divider className="my-4" />

                        <div
                            className={`w-full h-[500mm] ${
                                reportData?.length < 1 &&
                                "h-fit flex justify-center"
                            }  overflow-x-scroll overflow-hidden`}
                        >
                            {reportData && reportData.length > 0 ? (
                                <div
                                    ref={reportContainer}
                                    className={`${
                                        selectedDimension.value == "A3"
                                            ? "w-[420mm] h-[297mm]"
                                            : "w-[210mm]"
                                    } mx-auto`}
                                >
                                    <table className="border-collapse border border-slate-500 w-full mb-4">
                                        <thead>
                                            <tr>
                                                <th
                                                    rowSpan={5}
                                                    className="px-6 py-3 capitalize w-60 text-center border border-slate-700"
                                                >
                                                    <img
                                                        className="w-32 h-fit mx-auto"
                                                        src={woodsland}
                                                        alt="logo"
                                                    />
                                                </th>
                                                <th
                                                    colSpan={2}
                                                    className="px-6 py-3 font-semibold capitalize text-center border border-slate-700"
                                                >
                                                    Sổ tay COC
                                                </th>
                                                <th
                                                    rowSpan={5}
                                                    className="px-6 py-3 text-left font-light border-slate-700 w-64"
                                                >
                                                    <div className="flex flex-col">
                                                        <span>
                                                            Mã số: BM-COC-09
                                                        </span>{" "}
                                                        <span>
                                                            Ngày BH: 05/09/2013
                                                        </span>
                                                        <span>Lần BH: 02</span>{" "}
                                                    </div>
                                                </th>
                                            </tr>
                                            <tr>
                                                <th
                                                    colSpan={2}
                                                    className="px-6 py-3 text-center text-xl font-bold uppercase border border-slate-700"
                                                >
                                                    Danh mục theo dõi gỗ sấy
                                                    trong lò
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className="px-6 py-3 text-left font-light border border-slate-700">
                                                    Chi nhánh: {} | Nhà máy: {}
                                                </th>
                                                <th className="px-6 py-3 text-left font-light border border-slate-700">
                                                    Ngày vào lò: {}
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className="px-6 py-3 text-left font-light border border-slate-700">
                                                    Lò số: {}
                                                </th>
                                                <th className="px-6 py-3 text-left font-light border border-slate-700">
                                                    Loại gỗ sấy: {}
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className="px-6 py-3 text-left font-light border border-slate-700">
                                                    Tổng số pallet: {}
                                                </th>
                                                <th className="px-6 py-3 text-left font-light border border-slate-700">
                                                    Trạng thái môi trường: {}
                                                </th>
                                            </tr>
                                        </thead>
                                    </table>

                                    <span className="text-lg">
                                        I. Thông tin đánh giá
                                    </span>

                                    <div className="relative overflow-x-auto my-4">
                                        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                                            <thead className="text-base text-gray-700 uppercase bg-gray-50">
                                                <tr>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 capitalize text-center border border-slate-700"
                                                    >
                                                        STT
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 capitalize text-center border border-slate-700"
                                                    >
                                                        Mã lô gỗ nhập
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 capitalize text-center border border-slate-700"
                                                    >
                                                        Mã pallet
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 capitalize text-center border border-slate-700"
                                                    >
                                                        Dày
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 capitalize text-center border border-slate-700"
                                                    >
                                                        Rộng
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 capitalize text-center border border-slate-700"
                                                    >
                                                        Dài
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 capitalize text-center border border-slate-700"
                                                    >
                                                        Số lượng
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 capitalize text-center border border-slate-700"
                                                    >
                                                        Khối lượng
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData?.length > 0 &&
                                                    reportData.map(
                                                        (item, index) => (
                                                            <tr
                                                                key={index}
                                                                className="bg-white border-b"
                                                            >
                                                                <th
                                                                    scope="row"
                                                                    className="px-4 py-2.5 text-center w-4 font-medium text-gray-900 whitespace-nowrap border border-slate-700"
                                                                >
                                                                    {index + 1}
                                                                </th>
                                                                <td className="px-4 py-2.5 text-center border border-slate-700">
                                                                    {
                                                                        item.batchId
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-2.5 text-center border border-slate-700">
                                                                    {
                                                                        item.palletId
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-2.5 text-center w-56 border border-slate-700">
                                                                    {
                                                                        item.thickness
                                                                    }
                                                                </td>

                                                                <td className="px-4 py-2.5 text-right border border-slate-700">
                                                                    {item.width}
                                                                </td>
                                                                <td className="px-4 py-2.5 text-right border border-slate-700">
                                                                    {
                                                                        item.length
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-2.5 text-right border border-slate-700">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-2.5 text-right border border-slate-700">
                                                                    {
                                                                        item.weight
                                                                    }
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                <tr>
                                                    <td
                                                        colSpan={2}
                                                        className="px-4 py-2.5 text-center font-semibold border border-slate-700"
                                                    >
                                                        Tổng
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center border border-slate-700">
                                                        {""}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center border border-slate-700">
                                                        {""}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center border border-slate-700">
                                                        {""}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-center border border-slate-700">
                                                        {""}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right font-semibold border border-slate-700">
                                                        {totalSummary?.totalQuantity ||
                                                            0}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right font-semibold border border-slate-700">
                                                        {totalSummary?.totalWeight ||
                                                            0}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <span className="text-lg">
                                        II. Chữ ký người lập biên bản
                                    </span>

                                    <section
                                        id="signature"
                                        className="flex justify-end mr-12 my-4"
                                    >
                                        <div className="flex flex-col items-center">
                                            <p className="font-bold my-4">
                                                Người tạo phiếu
                                            </p>
                                            <img
                                                src={signature}
                                                alt="Chữ-ký-người-tạo"
                                                className="w-32 h-fit"
                                            />
                                            <span className="my-4">
                                                Nguyễn Văn Cường
                                            </span>
                                        </div>
                                    </section>
                                </div>
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

export default DryingKilnHistoryReport;
