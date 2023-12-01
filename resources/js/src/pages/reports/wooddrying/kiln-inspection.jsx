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
import { Checkbox } from "@chakra-ui/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Layout from "../../../layouts/layout";
import useAppContext from "../../../store/AppContext";
import Loader from "../../../components/Loader";
import AG_GRID_LOCALE_VI from "../../../utils/locale.vi";
import usersApi from "../../../api/userApi";
import woodsland from "../../../assets/images/woodsland-logo.svg";
import signature from "../../../assets/images/Nguyen-Van-Cuong-signature.png";

const exampleData = [
    {
        id: 1,
        checklist: "Vệ sinh lò sấy",
        requirement: "Sạch sẽ, không có các vật thể lạ trong lò",
        condition: {},
        evaluation: 1,
        note: "",
    },
    {
        id: 2,
        checklist: "Không bị rò rỉ nước",
        requirement: "Giàn nhiệt kín không bị rò rỉ nước",
        condition: {},
        evaluation: 1,
        note: "",
    },
    {
        id: 3,
        checklist: "Hệ thống gia nhiệt",
        requirement:
            "Van nhiệt đóng mở đúng theo tín hiệu điện Giàn nhiệt không bị rò rỉ nhiệt ra ngoài",
        condition: {},
        evaluation: 1,
        note: "",
    },
    {
        id: 4,
        checklist: "Hệ thống điều tiết ẩm",
        requirement: "Ống phun ẩm phải ở dạng sương, không được phun thành tia",
        condition: {},
        evaluation: 1,
        note: "",
    },
    {
        id: 5,
        checklist: "Đầu đo đo độ ẩm gỗ",
        requirement: "Các đầu đo không bị đứt, còn đầu gài vào thanh gỗ mẫu",
        condition: {},
        evaluation: 1,
        note: "",
    },
    {
        id: 6,
        checklist: "Cửa thoát ẩm",
        requirement: "Hoạt động đóng mở bằng tay/tự động dễ dàng, không bị kẹt",
        condition: {},
        evaluation: 1,
        note: "",
    },
    {
        id: 7,
        checklist: "Giấy cảm biến đo EMC",
        requirement: "Tối đa 3 lượt sấy phải thay giấy mới",
        condition: { "Số lần": 1 },
        evaluation: 1,
        note: "",
    },
    {
        id: 8,
        checklist: "Cảm biến nhiệt độ trong lò sấy",
        requirement:
            "Không sai khác so với nhiệt độ trong lò quá 2⁰C (Dùng súng bắn nhiệt đo nhiệt độ thực tế trong lò)",
        condition: { "Cảm biến lò": 28, "Đo thực tế": 27.3 },
        evaluation: 1,
        note: "",
    },
    {
        id: 9,
        checklist: "Van hơi, Van nước hồi",
        requirement: "Kín, không bị rò rỉ",
        condition: {},
        evaluation: 1,
        note: "",
    },
    {
        id: 10,
        checklist: "Đinh, dây đo độ ẩm",
        requirement: "Hoạt động tốt",
        condition: {},
        evaluation: 1,
        note: "",
    },
    {
        id: 11,
        checklist: "Chiều dày thực tế",
        requirement:
            "Kiểm tra 5 palet ngẫu nhiên, mỗi palet 5 thanh ngẫu nhiên trong lò, dung sai cho phép + 2(mm)",
        condition: {
            "Mẫu 1": [24, 25, 24, 24, 24],
            "Mẫu 2": [23, 24, 24, 24, 23],
            "Mẫu 3": [24, 24, 24, 24, 24],
            "Mẫu 4": [25, 24, 25, 24, 24],
            "Mẫu 5": [24, 24, 24, 24, 24],
        },
        evaluation: 1,
        note: "",
    },
    {
        id: 12,
        checklist: "Động cơ quạt gió, Tốc độ gió quạt",
        requirement:
            "Tốc độ gió quạt đạt tối thiểu 1m/s. Các quạt quay cùng chiều và ngược chiều phải đồng đều",
        condition: {
            "Quạt 1": 1.2,
            "Quạt 2": 1.2,
            "Quạt 3": 1.3,
            "Quạt 4": 1.2,
            "Quạt 5": 1.2,
            "Quạt 6": 1.2,
            "Quạt 7": 1.2,
            "Quạt 8": 1.2,
        },
        evaluation: 1,
        note: "",
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
const workBookName = "Biên bản kiểm tra lò sấy";

// var checkboxSelection = function (params) {
//     return params.columnApi.getRowGroupColumns().length === 0;
// };

// var headerCheckboxSelection = function (params) {
//     return params.columnApi.getRowGroupColumns().length === 0;
// };

function KilnInspectionReport() {
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

    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedFactory, setSelectedFactory] = useState(null);

    const [selectedDimension, setSelectedDimension] = useState({
        value: "A3",
        label: "A3",
    });

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const [firstTimeRender, setFirstTimeRender] = useState(true);

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

    const handleExportPdf = async () => {
        const input = reportContainer.current;
        console.log("Ra gì: ", input);

        if (selectedDimension && selectedDimension.value == "A3") {
            html2canvas(input).then((canvas) => {
                const pdf = new jsPDF("l", "mm", "a3");

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgData = canvas.toDataURL("image/png");
                pdf.addImage(
                    imgData,
                    "PNG",
                    22,
                    7,
                    pdfWidth - 44,
                    pdfHeight - 14
                );

                pdf.save("Biên-bản-kiểm-tra-lò-A3.pdf");
            });
        } else if (selectedDimension && selectedDimension.value == "A4") {
            // html2canvas(input).then((canvas) => {
            //     const imgData = canvas.toDataURL("image/png");
            //     console.log("Đâu ra canvas giúp tôi: ", canvas);
            //     console.log("Đâu ra hình tao coi: ", imgData);
            //     const pdf = new jsPDF("p", "mm", "a4");
            //     const pdfWidth = pdf.internal.pageSize.getWidth();
            //     const pdfHeight = pdf.internal.pageSize.getHeight();
            //     const marginLeft = 10;
            //     const marginRight = 10;
            //     const marginTop = 10;
            //     const marginBottom = 10;
            //     const imgWidth = pdfWidth - marginLeft - marginRight;
            //     // Tính toán chiều cao của mỗi trang
            //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
            //     // Chia thành 2 trang
            //     const page1Height = pdfHeight / 2;
            //     const page2Height = pdfHeight / 2;
            //     // Trang 1
            //     pdf.addImage(
            //         imgData,
            //         "PNG",
            //         marginLeft,
            //         marginTop,
            //         imgWidth,
            //         Math.min(imgHeight, page1Height)
            //     );
            //     // Trang 2
            //     if (imgHeight > page1Height) {
            //         pdf.addPage();
            //         pdf.addImage(
            //             imgData,
            //             "PNG",
            //             marginLeft,
            //             marginTop,
            //             imgWidth,
            //             Math.min(imgHeight - page1Height, page2Height)
            //         );
            //     }
            //     pdf.save("Biên-bản-kiểm-tra-lò-A4.pdf");
            // });
            html2canvas(input).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
            
                const pdf = new jsPDF("p", "mm", "a4");
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
            
                const marginLeft = 10;
                const marginRight = 10;
                const marginTop = 10;
                const marginBottom = 10;
                const imgWidth = pdfWidth - marginLeft - marginRight;
            
                // Tính toán chiều cao của hình
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
                // Kiểm tra nếu hình cao hơn chiều cao của trang A4 (bao gồm margin)
                if (imgHeight > pdfHeight - marginTop - marginBottom) {
                    const remainingHeight = imgHeight - (pdfHeight - marginTop - marginBottom);
            
                    // Trang 1
                    pdf.addImage(
                        imgData,
                        "PNG",
                        marginLeft,
                        marginTop,
                        imgWidth,
                        pdfHeight - marginTop - marginBottom
                    );
            
                    // Trang 2
                    pdf.addPage();
                    pdf.addImage(
                        imgData,
                        "PNG",
                        marginLeft,
                        marginTop - remainingHeight, // Điều chỉnh vị trí để giữ phần thừa
                        imgWidth,
                        pdfHeight - marginTop - marginBottom
                    );
                } else {
                    // Nếu hình không vượt quá trang A4, in toàn bộ ở trang 1
                    pdf.addImage(
                        imgData,
                        "PNG",
                        marginLeft,
                        marginTop,
                        imgWidth,
                        imgHeight
                    );
                }
            
                pdf.save("Biên-bản-kiểm-tra-lò-A4.pdf");
            });
            
        }
    };

    const onDimensionChanged = (value) => {
        setSelectedDimension(value);
    };

    useEffect(() => {
        const currentDate = new Date();
        const isValidStart = startDate && startDate <= currentDate;
        const isValidEnd = endDate && endDate <= currentDate;
        const isValidRange = startDate && endDate && startDate <= endDate;

        if (!isValidStart) {
            setStartDate(currentDate);
        }

        if (!isValidEnd) {
            setEndDate(currentDate);
        }

        if (!isValidRange) {
            setStartDate(currentDate);
            setEndDate(currentDate);
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

        document.title = "Woodsland - Biên bản kiểm tra lò sấy";
        const params = new URLSearchParams(window.location.search);

        return () => {
            document.title = "Woodsland";
        };
    }, []);

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
                        Biên bản kiểm tra lò sấy{" "}
                    </div>
                    {/* h-[calc(100%-165px)] */}
                    {/* Main content */}
                    <section className="bg-white rounded-lg border-2 mb-2 p-4 border-gray-200 h-max">
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
                                <div className="flex gap-4 items-center">
                                    <label className="whitespace-nowrap">
                                        Ngày tạo biên bản:{" "}
                                        <span className="text-red-600">*</span>
                                    </label>
                                    <Select
                                        // options={factories}
                                        // onChange={(value) =>
                                        //     setSelectedFactory(value)
                                        // }
                                        placeholder="Lựa chọn"
                                        className="flex w-40"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="xl:flex md:flex xl:justify-between xl:space-y-0 space-y-3 items-center mt-4">
                            <div className="flex xl:w-2/3 md:w-2/3 gap-x-4 items-center whitespace-nowrap">
                                Khổ giấy thể hiện:
                                <Select
                                    id="page-size"
                                    options={dimensionOptions}
                                    onChange={onDimensionChanged}
                                    defaultValue={selectedDimension}
                                    className="z-[9]"
                                />
                            </div>
                            <div className="flex w-full justify-between sm:justify-end space-x-4">
                                <div className="h-full w-3/7 sm:w-auto">
                                    <button
                                        onClick={handleExportPdf}
                                        className="w-full h-full space-x-2 flex items-center bg-gray-800 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                    >
                                        <PiExportLight />
                                        <div>PDF</div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Divider className="my-4" />

                        <div className="w-full h-[500mm] overflow-x-scroll overflow-hidden">
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
                                                rowSpan={4}
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
                                                Quy trình sấy gỗ
                                            </th>
                                            <th
                                                rowSpan={4}
                                                className="px-6 py-3 text-left font-light border-slate-700 w-64"
                                            >
                                                <div className="flex flex-col">
                                                    <span>
                                                        Mã số: QT-14/BM-02
                                                    </span>{" "}
                                                    <span>
                                                        Ngày BH: 19/08/2020
                                                    </span>
                                                    <span>Lần BH: 04</span>{" "}
                                                </div>
                                            </th>
                                        </tr>
                                        <tr>
                                            <th
                                                colSpan={2}
                                                className="px-6 py-3 text-center text-xl font-bold uppercase border border-slate-700"
                                            >
                                                Biên bản kiểm tra lò sấy
                                            </th>
                                        </tr>
                                        <tr>
                                            <th className="px-6 py-3 text-left font-light border border-slate-700">
                                                Chi nhánh: {}
                                            </th>
                                            <th className="px-6 py-3 text-left font-light border border-slate-700">
                                                Nhà máy: {}
                                            </th>
                                        </tr>
                                        <tr>
                                            <th className="px-6 py-3 text-left font-light border border-slate-700">
                                                Lò số: {}
                                            </th>
                                            <th className="px-6 py-3 text-left font-light border border-slate-700">
                                                Ngày kiểm: {}
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
                                                    Danh mục kiểm tra
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 capitalize text-center border border-slate-700"
                                                >
                                                    Yêu cầu
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 capitalize text-center border border-slate-700"
                                                >
                                                    Tình trạng
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 capitalize text-center border border-slate-700"
                                                >
                                                    Đánh giá
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 capitalize text-center border border-slate-700"
                                                >
                                                    Ghi chú
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {exampleData?.length > 0 &&
                                                exampleData.map(
                                                    (item, index) => (
                                                        <tr className="bg-white border-b">
                                                            <th
                                                                scope="row"
                                                                className="px-4 py-2.5 text-center w-4 font-medium text-gray-900 whitespace-nowrap border border-slate-700"
                                                            >
                                                                {index + 1}
                                                            </th>
                                                            <td className="px-4 py-2.5 border border-slate-700">
                                                                {item.checklist}
                                                            </td>
                                                            <td className="px-4 py-2.5 border border-slate-700">
                                                                {
                                                                    item.requirement
                                                                }
                                                            </td>
                                                            <td className="px-4 py-2.5 w-56 border border-slate-700">
                                                                {Object.keys(
                                                                    item.condition
                                                                ).length ==
                                                                0 ? (
                                                                    ""
                                                                ) : (
                                                                    <>
                                                                        {Object.entries(
                                                                            item.condition
                                                                        ).map(
                                                                            ([
                                                                                key,
                                                                                value,
                                                                            ]) => {
                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            key
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            key
                                                                                        }

                                                                                        :{" "}
                                                                                        {Array.isArray(
                                                                                            value
                                                                                        )
                                                                                            ? value.join(
                                                                                                  ", "
                                                                                              )
                                                                                            : value}{" "}
                                                                                        {index ==
                                                                                            11 &&
                                                                                            "(m/s)"}
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        )}
                                                                    </>
                                                                )}
                                                            </td>

                                                            <td className="px-4 py-2.5 text-center border border-slate-700">
                                                                <Checkbox
                                                                    isDisabled
                                                                    isChecked={
                                                                        item.evaluation ==
                                                                        1
                                                                            ? true
                                                                            : false
                                                                    }
                                                                ></Checkbox>
                                                            </td>
                                                            <td className="px-4 py-2.5 border border-slate-700">
                                                                {item.note}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
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
                        </div>
                    </section>
                </div>
            </div>

            {loading && <Loader />}
        </Layout>
    );
}

export default KilnInspectionReport;
