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
} from "react-icons/fa6";
import { IoMdRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../../assets/styles/datepicker.css";
import { format, startOfDay, endOfDay } from "date-fns";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import toast from "react-hot-toast";
import reportApi from "../../../api/reportApi";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
// import "ag-grid-charts-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import Select from "react-select";
import logo from "../../../assets/images/WLorigin.svg";
import useAppContext from "../../../store/AppContext";
import axios from "axios";

import ExcelJS from "exceljs";

function KilnCheckingReport() {
    const navigate = useNavigate();

    const { user } = useAppContext();
    const gridRef = useRef();

    // Loading States
    const [isDataReportLoading, setIsDataReportLoading] = useState(false);
    const [isKilnLoading, setIsKilnLoading] = useState(false);
    const [selectedKiln, setSelectedKiln] = useState(null);

    const [selectedFactory, setSelectedFactory] = useState(null);
    const [kilnOptions, setKilnOptions] = useState([]);

    const [reportData, setReportData] = useState(null);

    const handleFactorySelect = async (factory) => {
        console.log("Nhà máy đang chọn là:", factory);
        setSelectedFactory(factory);
        getCheckedKiln(factory);
    };

    const getCheckedKiln = async (factory) => {
        setSelectedKiln(null);
        setKilnOptions([]);
        setIsKilnLoading(true);
        try {
            const res = await axios.get("/api/get-checked-kiln", {
                params: {
                    factory: factory,
                },
            });

            const options = res.data.map((item) => ({
                value: item.Code,
                label: item.Name,
            }));
            setKilnOptions(options);
            setIsKilnLoading(false);
        } catch (error) {
            console.error("Error getting active kiln:", error);
            toast.error("Không thể lấy dữ liệu, hãy thử lại.");
        }
    };

    const getReportData = useCallback(async () => {
        setIsDataReportLoading(true);
        try {
            const res = await axios.get("/api/report/say-bienbankiemtralosay", {
                params: {
                    branch: user.branch,
                    kiln: selectedKiln?.value,
                },
            });
            setReportData(res.data);
            setIsDataReportLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
            setIsDataReportLoading(false);
        }
    }, [selectedKiln]);

    useEffect(() => {
        if (selectedFactory) {
            getReportData();
        } else {
            console.log("Không thể gọi API vì không đủ thông tin");
        }
    }, [selectedKiln]);

    const handleResetFilter = () => {
        setSelectedFactory(null);
        setSelectAll(false);
        setIsReceived(true);
        setTeamData([]);

        setReportData(null);

        toast.success("Đặt lại bộ lọc thành công.");
    };

    const handleExportExcel = useCallback(async () => {
        if (!reportData) {
            toast.error("Không có dữ liệu để xuất file Excel.");
            return;
        }
        try {
            // Tạo workbook và worksheet mới
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Biên Bản Kiểm Tra Lò Sấy");

            // Thiết lập độ rộng cột
            worksheet.columns = [
                { width: 15 }, // TT
                { width: 25 }, // Danh mục kiểm tra
                { width: 35 }, // Yêu cầu
                { width: 25 }, // Tình trạng
                { width: 15 }, // Đánh giá
                { width: 20 }, // Ghi chú
            ];

            // === HEADER SECTION ===

            // Row 1: Logo và tiêu đề chính
            worksheet.mergeCells("A1:A2");
            worksheet.getCell("A1").value = "LOGO";
            worksheet.getCell("A1").alignment = {
                vertical: "middle",
                horizontal: "center",
            };
            worksheet.getCell("A1").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD3D3D3" },
            };

            worksheet.mergeCells("B1:D1");
            worksheet.getCell("B1").value = "QUY TRÌNH SẤY GỖ";
            worksheet.getCell("B1").alignment = {
                vertical: "middle",
                horizontal: "center",
            };
            worksheet.getCell("B1").font = { bold: true, size: 14 };
            worksheet.getCell("B1").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD3D3D3" },
            };

            worksheet.mergeCells("E1:E3");
            worksheet.getCell(
                "E1"
            ).value = `Mã số: QT-14/BM-02\nNgày BH: 19/08/2020\nLần BH: 04`;
            worksheet.getCell("E1").alignment = {
                vertical: "middle",
                horizontal: "left",
                wrapText: true,
            };
            worksheet.getCell("E1").font = { bold: true };
            worksheet.getCell("E1").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD3D3D3" },
            };

            worksheet.mergeCells("F1:F3");
            worksheet.getCell("F1").value = "";
            worksheet.getCell("F1").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD3D3D3" },
            };

            // Row 2: Tiêu đề phụ
            worksheet.mergeCells("B2:D2");
            worksheet.getCell("B2").value = "BIÊN BẢN KIỂM TRA LÒ SẤY";
            worksheet.getCell("B2").alignment = {
                vertical: "middle",
                horizontal: "center",
            };
            worksheet.getCell("B2").font = { bold: true, size: 16 };
            worksheet.getCell("B2").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD3D3D3" },
            };

            // Row 3: Thông tin chi tiết
            const kilnLabel =
                kilnOptions.find((option) => option.value === reportData.Oven)
                    ?.label || "Chưa chọn lò";
            worksheet.getCell("A3").value = kilnLabel;
            worksheet.getCell("A3").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD3D3D3" },
            };
            worksheet.getCell("A3").font = { bold: true };

            worksheet.getCell("B3").value = "";
            worksheet.getCell("B3").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD3D3D3" },
            };

            worksheet.getCell("C3").value = "";
            worksheet.getCell("C3").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD3D3D3" },
            };

            worksheet.getCell("D3").value = `Ngày kiểm tra: ${
                reportData?.DateChecked || "Chưa xác định"
            }`;
            worksheet.getCell("D3").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD3D3D3" },
            };
            worksheet.getCell("D3").font = { bold: true };

            // Row 4: Tiêu đề cột
            const headers = [
                "TT",
                "Danh mục kiểm tra",
                "Yêu cầu",
                "Tình trạng",
                "Đánh giá",
                "Ghi chú",
            ];
            const headerRow = worksheet.getRow(4);
            headers.forEach((header, index) => {
                headerRow.getCell(index + 1).value = header;
                headerRow.getCell(index + 1).font = { bold: true };
                headerRow.getCell(index + 1).alignment = {
                    vertical: "middle",
                    horizontal: "center",
                };
                headerRow.getCell(index + 1).fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFADD8E6" },
                };
            });

            // === DATA ROWS ===
            let currentRow = 5;

            // Các hàng dữ liệu đơn giản
            const simpleRows = [
                {
                    tt: "1",
                    category: "Vệ sinh lò sấy",
                    requirement: "Sạch sẽ, không có các vật thể lạ trong lò.",
                    status: "",
                    evaluation: reportData?.CT1 == 1 ? "Đạt" : "Chưa đạt",
                    note: "",
                },
                {
                    tt: "2",
                    category: "Không bị rò rỉ nước",
                    requirement: "Gian nhiệt kin không bị rò rỉ nước.",
                    status: "",
                    evaluation: reportData?.CT2 == 1 ? "Đạt" : "Chưa đạt",
                    note: "",
                },
                {
                    tt: "3",
                    category: "Hệ thống gia nhiệt",
                    requirement:
                        "Van nhiệt động mở đúng theo tín hiệu điện. Giàn nhiệt không bị rò rỉ nhiệt ra ngoài.",
                    status: "",
                    evaluation: reportData?.CT3 == 1 ? "Đạt" : "Chưa đạt",
                    note: "",
                },
                {
                    tt: "4",
                    category: "Hệ thống điều tiết ẩm",
                    requirement:
                        "Ống phun ẩm phải ở dạng sương, không được phun thành tia.",
                    status: "",
                    evaluation: reportData?.CT4 == 1 ? "Đạt" : "Chưa đạt",
                    note: "",
                },
                {
                    tt: "5",
                    category: "Đầu do độ ẩm gỗ",
                    requirement:
                        "Các đầu đo không bị đứt, còn đầu gài vào thanh gỗ mẫu.",
                    status: "",
                    evaluation: reportData?.CT5 == 1 ? "Đạt" : "Chưa đạt",
                    note: "",
                },
                {
                    tt: "6",
                    category: "Cửa thoát ẩm",
                    requirement:
                        "Hoạt động đóng mở bằng tay/tự động dễ dàng, không bị kẹt.",
                    status: "",
                    evaluation: reportData?.CT6 == 1 ? "Đạt" : "Chưa đạt",
                    note: "",
                },
                {
                    tt: "7",
                    category: "Giấy cam biến do EMC",
                    requirement: "Tối đa 3 lượt sấy phải thay giấy mới.",
                    status: `Số lần: ${reportData?.SoLan || 0}`,
                    evaluation: reportData?.CT7 == 1 ? "Đạt" : "Chưa đạt",
                    note: "",
                },
            ];

            // Thêm các hàng đơn giản
            simpleRows.forEach((rowData) => {
                const row = worksheet.getRow(currentRow);
                row.getCell(1).value = rowData.tt;
                row.getCell(1).alignment = {
                    vertical: "middle",
                    horizontal: "center",
                };
                row.getCell(2).value = rowData.category;
                row.getCell(3).value = rowData.requirement;
                row.getCell(3).alignment = { wrapText: true };
                row.getCell(4).value = rowData.status;
                row.getCell(5).value = rowData.evaluation;
                row.getCell(5).alignment = {
                    vertical: "middle",
                    horizontal: "center",
                };
                row.getCell(6).value = rowData.note;

                // Thiết lập chiều cao hàng
                row.height = 40;
                currentRow++;
            });

            // Hàng 8: Cảm biến nhiệt độ (merged rows)
            worksheet.mergeCells(`A${currentRow}:A${currentRow + 1}`);
            worksheet.getCell(`A${currentRow}`).value = "8";
            worksheet.getCell(`A${currentRow}`).alignment = {
                vertical: "middle",
                horizontal: "center",
            };

            worksheet.mergeCells(`B${currentRow}:B${currentRow + 1}`);
            worksheet.getCell(`B${currentRow}`).value =
                "Cảm biến nhiệt độ trong lò sấy";
            worksheet.getCell(`B${currentRow}`).alignment = {
                vertical: "middle",
            };

            worksheet.mergeCells(`C${currentRow}:C${currentRow + 1}`);
            worksheet.getCell(`C${currentRow}`).value =
                "Không sai khác so với nhiệt độ trong lò quá 2⁰C (Dùng súng bắn nhiệt đo nhiệt độ thực tế trong lò).";
            worksheet.getCell(`C${currentRow}`).alignment = {
                vertical: "middle",
                wrapText: true,
            };

            worksheet.getCell(`D${currentRow}`).value = `Cảm biến lò: ${
                reportData?.CBL || 0
            }`;
            worksheet.getCell(`D${currentRow + 1}`).value = `Đo thực tế: ${
                reportData?.DoThucTe || 0
            }`;

            worksheet.mergeCells(`E${currentRow}:E${currentRow + 1}`);
            worksheet.getCell(`E${currentRow}`).value =
                reportData?.CT8 == 1 ? "Đạt" : "Chưa đạt";
            worksheet.getCell(`E${currentRow}`).alignment = {
                vertical: "middle",
                horizontal: "center",
            };

            worksheet.mergeCells(`F${currentRow}:F${currentRow + 1}`);
            worksheet.getCell(`F${currentRow}`).value = "";

            currentRow += 2;

            // Hàng 9: Van hơi, Van nước hồi
            const row9 = worksheet.getRow(currentRow);
            row9.getCell(1).value = "9";
            row9.getCell(1).alignment = {
                vertical: "middle",
                horizontal: "center",
            };
            row9.getCell(2).value = "Van hơi, Van nước hồi";
            row9.getCell(3).value = "Kín, không bị rò rỉ.";
            row9.getCell(4).value = "";
            row9.getCell(5).value = reportData?.CT9 == 1 ? "Đạt" : "Chưa đạt";
            row9.getCell(5).alignment = {
                vertical: "middle",
                horizontal: "center",
            };
            row9.getCell(6).value = "";
            row9.height = 30;
            currentRow++;

            // Hàng 10: Đinh, dây đo độ ẩm
            const row10 = worksheet.getRow(currentRow);
            row10.getCell(1).value = "10";
            row10.getCell(1).alignment = {
                vertical: "middle",
                horizontal: "center",
            };
            row10.getCell(2).value = "Đinh, dây đo độ ẩm";
            row10.getCell(3).value = "Hoạt động tốt.";
            row10.getCell(4).value = "";
            row10.getCell(5).value = reportData?.CT10 == 1 ? "Đạt" : "Chưa đạt";
            row10.getCell(5).alignment = {
                vertical: "middle",
                horizontal: "center",
            };
            row10.getCell(6).value = "";
            row10.height = 30;
            currentRow++;

            // Hàng 11: Chiều dày thực tế (5 rows merged)
            const startRow11 = currentRow;
            worksheet.mergeCells(`A${currentRow}:A${currentRow + 4}`);
            worksheet.getCell(`A${currentRow}`).value = "11";
            worksheet.getCell(`A${currentRow}`).alignment = {
                vertical: "middle",
                horizontal: "center",
            };

            worksheet.mergeCells(`B${currentRow}:B${currentRow + 4}`);
            worksheet.getCell(`B${currentRow}`).value = "Chiều dày thực tế";
            worksheet.getCell(`B${currentRow}`).alignment = {
                vertical: "middle",
            };

            worksheet.mergeCells(`C${currentRow}:C${currentRow + 4}`);
            worksheet.getCell(`C${currentRow}`).value =
                "Kiểm tra 5 palet ngẫu nhiên,mỗi palet 5 thanh ngẫu nhiên trong lò,dung sai cho phép + 2(mm).";
            worksheet.getCell(`C${currentRow}`).alignment = {
                vertical: "middle",
                wrapText: true,
            };

            // Thêm dữ liệu mẫu
            for (let i = 1; i <= 5; i++) {
                worksheet.getCell(`D${currentRow}`).value = `Mẫu ${i}: ${
                    reportData?.ActualThickness[0]?.[`M${i}`] ||
                    "Chưa ghi nhận"
                }`;
                currentRow++;
            }

            worksheet.mergeCells(`E${startRow11}:E${currentRow - 1}`);
            worksheet.getCell(`E${startRow11}`).value =
                reportData?.CT11 == 1 ? "Đạt" : "Chưa đạt";
            worksheet.getCell(`E${startRow11}`).alignment = {
                vertical: "middle",
                horizontal: "center",
            };

            worksheet.mergeCells(`F${startRow11}:F${currentRow - 1}`);
            worksheet.getCell(`F${startRow11}`).value = "";

            // Hàng 12: Động cơ quạt gió (8 rows merged)
            const startRow12 = currentRow;
            worksheet.mergeCells(`A${currentRow}:A${currentRow + 7}`);
            worksheet.getCell(`A${currentRow}`).value = "12";
            worksheet.getCell(`A${currentRow}`).alignment = {
                vertical: "middle",
                horizontal: "center",
            };

            worksheet.mergeCells(`B${currentRow}:B${currentRow + 7}`);
            worksheet.getCell(`B${currentRow}`).value =
                "Động cơ quạt gió/Tốc độ gió quạt";
            worksheet.getCell(`B${currentRow}`).alignment = {
                vertical: "middle",
            };

            worksheet.mergeCells(`C${currentRow}:C${currentRow + 7}`);
            worksheet.getCell(`C${currentRow}`).value =
                "Tốc độ gió quạt đạt tối thiểu 1m/s Các quạt quay cùng chiều và ngược chiều phải đồng đều.";
            worksheet.getCell(`C${currentRow}`).alignment = {
                vertical: "middle",
                wrapText: true,
            };

            // Thêm dữ liệu quạt
            for (let i = 1; i <= 8; i++) {
                worksheet.getCell(`D${currentRow}`).value = `Quạt ${i}: ${
                    reportData?.FanSpeed[0]?.[`Q${i}`] || "null"
                } (m/s)`;
                currentRow++;
            }

            worksheet.mergeCells(`E${startRow12}:E${currentRow - 1}`);
            worksheet.getCell(`E${startRow12}`).value =
                reportData?.CT12 == 1 ? "Đạt" : "Chưa đạt";
            worksheet.getCell(`E${startRow12}`).alignment = {
                vertical: "middle",
                horizontal: "center",
            };

            worksheet.mergeCells(`F${startRow12}:F${currentRow - 1}`);
            worksheet.getCell(`F${startRow12}`).value = "";

            // === FOOTER SECTION ===
            currentRow++;

            // Footer row 1
            const footerRow1 = worksheet.getRow(currentRow);
            footerRow1.getCell(4).value = "Người kiểm tra";
            footerRow1.getCell(4).alignment = {
                vertical: "middle",
                horizontal: "center",
            };
            footerRow1.getCell(4).font = { bold: true, size: 14 };
            footerRow1.getCell(4).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD3D3D3" },
            };

            // Điền màu nền cho các ô khác trong footer
            for (let i = 1; i <= 6; i++) {
                if (i !== 4) {
                    footerRow1.getCell(i).fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFD3D3D3" },
                    };
                }
            }

            currentRow++;

            // Footer row 2
            const footerRow2 = worksheet.getRow(currentRow);
            footerRow2.getCell(4).value =
                reportData?.NguoiTaoPhieu || "Chưa xác định";
            footerRow2.getCell(4).alignment = {
                vertical: "middle",
                horizontal: "center",
            };
            footerRow2.getCell(4).font = {
                bold: true,
                color: { argb: "FF0000FF" },
            };
            footerRow2.getCell(4).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD3D3D3" },
            };

            // Điền màu nền cho các ô khác trong footer
            for (let i = 1; i <= 6; i++) {
                if (i !== 4) {
                    footerRow2.getCell(i).fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFD3D3D3" },
                    };
                }
            }

            // === STYLING & BORDERS ===

            // Thêm border cho toàn bộ bảng
            const totalRows = currentRow;
            for (let row = 1; row <= totalRows; row++) {
                for (let col = 1; col <= 6; col++) {
                    const cell = worksheet.getCell(row, col);
                    cell.border = {
                        top: { style: "thin", color: { argb: "FF000000" } },
                        left: { style: "thin", color: { argb: "FF000000" } },
                        bottom: { style: "thin", color: { argb: "FF000000" } },
                        right: { style: "thin", color: { argb: "FF000000" } },
                    };
                }
            }

            // Thiết lập độ cao cho các hàng header và footer
            worksheet.getRow(1).height = 40;
            worksheet.getRow(2).height = 40;
            worksheet.getRow(3).height = 30;
            worksheet.getRow(4).height = 35;
            worksheet.getRow(currentRow - 1).height = 30;
            worksheet.getRow(currentRow).height = 30;

            // === EXPORT FILE ===

            // Tạo buffer và download file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            // Tạo tên file với timestamp
            const now = new Date();
            const timestamp = now.toISOString().slice(0, 19).replace(/:/g, "-");
            const fileName = `Bien_Ban_Kiem_Tra_Lo_Say_${timestamp}.xlsx`;

            // Download file
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log("Export Excel thành công!");
        } catch (error) {
            console.error("Lỗi khi export Excel:", error);
            alert("Có lỗi xảy ra khi export file Excel. Vui lòng thử lại!");
        }
    }, [reportData, kilnOptions]);

    const handleExportPDF = () => {
        toast("Chức năng xuất PDF đang được phát triển.");
    };

    const FactoryOption = ({ value, label }) => (
        <div
            className={`group hover:border-[#86ABBE] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-3xl border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all ${
                selectedFactory === value
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
                className={`${
                    selectedFactory === value
                        ? "text-[#17506B] font-medium"
                        : "text-gray-400 group-hover:text-[#17506B]"
                }`}
            >
                {label}
            </div>
        </div>
    );

    const handleGoBack = () => {
        navigate(-1);
    };
    return (
        <Layout>
            <div className="overflow-x-hidden min-h-[calc(100vh-80px)]">
                <div className="w-screen p-6 px-5 xl:p-5 xl:px-12 ">
                    {/* Title */}
                    <div className="flex items-center justify-between space-x-6 mb-3.5">
                        <div className="flex items-center space-x-4">
                            <div
                                className="p-2 hover:bg-gray-200 rounded-full cursor-pointer active:scale-[.87] active:duration-75 transition-all"
                                onClick={handleGoBack}
                            >
                                <FaArrowLeft className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex flex-col mb-0 pb-0">
                                <div className="text-sm text-[#17506B]">
                                    Báo cáo sấy phôi
                                </div>
                                <div className="serif text-3xl font-bold">
                                    Biên bản kiểm tra lò sấy
                                </div>
                            </div>
                        </div>

                        {/* Search & Export */}
                        <div className="w-1/2 flex items-center justify-between border-2 border-gray-300 p-2 px-4 pr-1  rounded-lg bg-[#F9FAFB]">
                            <div className="flex items-center space-x-3 w-2/3">
                                <IoSearch className="w-6 h-6 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tất cả..."
                                    className=" w-full focus:ring-transparent !outline-none bg-[#F9FAFB]  border-gray-30 ring-transparent border-transparent focus:border-transparent focus:ring-0"
                                />
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
                                {/* <div>
                                    <PiFilePdfBold
                                        className="mx-2.5 w-6 h-6 text-gray-300 hover:text-[#2e6782] cursor-pointer active:scale-[.92] active:duration-75 transition-all"
                                        onClick={handleExportPDF}
                                    />
                                </div> */}
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className=" bg-white rounded-xl py-2 pb-3">
                        {/* Filter */}
                        <div className="flex items-center space-x-3 divide-x-2 divide-gray-100 px-4 mt-1">
                            <div className="flex space-x-3 w-3/4 ">
                                <div className="col-span-1 w-full">
                                    <label
                                        htmlFor="indate"
                                        className="block mb-1 text-sm font-medium text-gray-900"
                                    >
                                        Chọn nhà máy
                                    </label>
                                    <FactoryOption
                                        value="TH"
                                        label="Thuận Hưng"
                                    />
                                </div>
                                <div className="col-span-1 w-full flex items-end">
                                    <FactoryOption value="YS" label="Yên Sơn" />
                                </div>
                                <div className="col-span-1 w-full flex items-end">
                                    <FactoryOption
                                        value="TB"
                                        label="Thái Bình"
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 w-1/4 pl-4">
                                <div className="col-span-1 w-full">
                                    <label
                                        htmlFor="indate"
                                        className="block mb-1 text-sm font-medium text-gray-900 "
                                    >
                                        Chọn lò đang hoạt động
                                    </label>
                                    <Select
                                        // defaulOptions={kilnOptions[0]}
                                        options={kilnOptions}
                                        isDisabled={isKilnLoading}
                                        onChange={(value) => {
                                            setSelectedKiln(value);
                                            console.log("Lò đã chọn:", value);
                                        }}
                                        placeholder="Chọn một lò sấy"
                                        className="w-full z-20 rounded-[12px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {isDataReportLoading ? (
                        <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center p-3 px-4 pr-1 rounded-lg ">
                            {/* <div>Đang tải dữ liệu</div> */}
                            <div class="dots"></div>
                        </div>
                    ) : (
                        <>
                            {reportData ? (
                                <div>
                                    <div className="serif w-full my-4 bg-gray-50 p-8 rounded-xl">
                                        <table className="w-full border-2 border-gray-400">
                                            <thead className="font-bold">
                                                {/* Header row 1 - Logo và Sổ tay COC */}
                                                <tr>
                                                    <th
                                                        rowSpan="2"
                                                        className="w-32 border-r border-b border-gray-400 p-2 bg-gray-200 mx-auto"
                                                    >
                                                        <img
                                                            src={logo}
                                                            alt="logo"
                                                            className="mx-auto flex items-center justify-center w-24 h-24"
                                                        ></img>
                                                    </th>
                                                    <td
                                                        colSpan="3"
                                                        className="h-[50px] border-b border-gray-400 bg-gray-200 p-2 text-center font-bold text-lg"
                                                    >
                                                        QUY TRÌNH SẤY GỖ
                                                    </td>
                                                    <td
                                                        rowSpan="3"
                                                        className="w-[200px] text-lg border-b border-l bg-gray-200 border-gray-400 p-2 px-4 text-right font-bold"
                                                    >
                                                        <div className="flex flex-col items-start">
                                                            <p>
                                                                Mã số:
                                                                QT-14/BM-02
                                                            </p>
                                                            <p>
                                                                Ngày BH:
                                                                19/08/2020
                                                            </p>
                                                            <p>Lần BH: 04</p>
                                                        </div>
                                                    </td>
                                                    <td
                                                        rowSpan="3"
                                                        className="w-[200px] text-lg border-b border-l bg-gray-200 border-gray-400 p-2 px-4 text-right font-bold"
                                                    ></td>
                                                </tr>

                                                {/* Header row 2 */}
                                                <tr>
                                                    <td
                                                        colSpan="3"
                                                        rowSpan="1"
                                                        className=" border-b text-xl font-bold bg-gray-200 border-gray-400 p-2  text-center"
                                                    >
                                                        BIÊN BẢN KIỂM TRA LÒ SẤY
                                                    </td>
                                                </tr>

                                                {/* Header row 3 - Thông tin chi tiết */}
                                                <tr>
                                                    <td
                                                        colSpan="1"
                                                        className="bg-gray-200 border-b text-lg font-bold border-gray-400 p-2 w-36"
                                                    >
                                                        {
                                                            kilnOptions.find(
                                                                (option) =>
                                                                    option.value ===
                                                                    reportData.Oven
                                                            )?.label
                                                        }
                                                    </td>
                                                    <td
                                                        colSpan="1"
                                                        className="bg-gray-200 text-lg font-bold border-b border-x border-gray-400 p-2 w-32"
                                                    ></td>
                                                    <td
                                                        colSpan="1"
                                                        className="bg-gray-200 border-b text-lg font-bold border-gray-400 p-2 w-36"
                                                    ></td>
                                                    <td
                                                        colSpan="1"
                                                        className="bg-gray-200 border-b border-l text-lg font-bold border-gray-400 p-2 w-32"
                                                    >
                                                        Ngày kiểm tra:{" "}
                                                        {reportData?.DateChecked ||
                                                            "Chưa xác định"}
                                                    </td>
                                                </tr>

                                                {/* Header row 4 - Tiêu đề cột của bảng dữ liệu */}
                                                <tr className="bg-blue-200">
                                                    <td className="w-[120px] border-r border-b border-gray-400 p-2 text-lg text-center font-bold">
                                                        TT
                                                    </td>
                                                    <td className="w-[200px] border-r border-b border-gray-400 p-2 text-lg font-bold">
                                                        Danh mục kiểm tra
                                                    </td>
                                                    <td className="w-[250px] border-r border-b border-gray-400 p-2 text-lg font-bold">
                                                        Yêu cầu
                                                    </td>
                                                    <td className="w-[220px] border-r border-b border-gray-400 p-2 text-lg font-bold">
                                                        Tình trạng
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2 text-lg font-bold">
                                                        Đánh giá
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2 text-lg font-bold">
                                                        Ghi chú
                                                    </td>
                                                </tr>
                                            </thead>

                                            <tbody className="text-[17px]">
                                                <tr>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center">
                                                        1
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Vệ sinh lò sấy
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Sạch sẽ, không có các
                                                        vật thể lạ trong lò.
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2"></td>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center text-blue-600">
                                                        <Checkbox
                                                            isDisabled
                                                            isChecked={
                                                                reportData?.CT1 ==
                                                                1
                                                            }
                                                            size="lg"
                                                        >
                                                            {reportData?.CT1 ==
                                                            1
                                                                ? "Đạt"
                                                                : "Chưa đạt"}
                                                        </Checkbox>
                                                    </td>
                                                    <td className="border-b border-gray-400 p-2"></td>
                                                </tr>
                                                <tr>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center">
                                                        2
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Không bị rò rỉ nước
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Gian nhiệt kin không bị
                                                        rò rỉ nước.
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2"></td>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center text-blue-600">
                                                        <Checkbox
                                                            isDisabled
                                                            isChecked={
                                                                reportData?.CT2 ==
                                                                1
                                                            }
                                                            size="lg"
                                                        >
                                                            {reportData?.CT2 ==
                                                            1
                                                                ? "Đạt"
                                                                : "Chưa đạt"}
                                                        </Checkbox>
                                                    </td>
                                                    <td className="border-b border-gray-400 p-2"></td>
                                                </tr>
                                                <tr>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center">
                                                        3
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Hệ thống gia nhiệt
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Van nhiệt động mở đúng
                                                        theo tín hiệu điện. Giàn
                                                        nhiệt không bị rò rỉ
                                                        nhiệt ra ngoài.
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2"></td>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center text-blue-600">
                                                        <Checkbox
                                                            isDisabled
                                                            isChecked={
                                                                reportData?.CT3 ==
                                                                1
                                                            }
                                                            size="lg"
                                                        >
                                                            {reportData?.CT3 ==
                                                            1
                                                                ? "Đạt"
                                                                : "Chưa đạt"}
                                                        </Checkbox>
                                                    </td>
                                                    <td className="border-b border-gray-400 p-2"></td>
                                                </tr>
                                                <tr>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center">
                                                        4
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Hệ thống điều tiết ẩm
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Ống phun ẩm phải ở dạng
                                                        sương, không được phun
                                                        thành tia.
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2"></td>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center text-blue-600">
                                                        <Checkbox
                                                            isDisabled
                                                            isChecked={
                                                                reportData?.CT4 ==
                                                                1
                                                            }
                                                            size="lg"
                                                        >
                                                            {reportData?.CT4 ==
                                                            1
                                                                ? "Đạt"
                                                                : "Chưa đạt"}
                                                        </Checkbox>
                                                    </td>
                                                    <td className="border-b border-gray-400 p-2"></td>
                                                </tr>
                                                <tr>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center">
                                                        5
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Đầu do độ ẩm gỗ
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Các đầu đo không bị đứt,
                                                        còn đầu gài vào thanh gỗ
                                                        mẫu.
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2"></td>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center text-blue-600">
                                                        <Checkbox
                                                            isDisabled
                                                            isChecked={
                                                                reportData?.CT5 ==
                                                                1
                                                            }
                                                            size="lg"
                                                        >
                                                            {reportData?.CT5 ==
                                                            1
                                                                ? "Đạt"
                                                                : "Chưa đạt"}
                                                        </Checkbox>
                                                    </td>
                                                    <td className="border-b border-gray-400 p-2"></td>
                                                </tr>
                                                <tr>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center">
                                                        6
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Cửa thoát ẩm
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Hoạt động đóng mở bằng
                                                        tay/tự động dễ dàng,
                                                        không bị kẹt.
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2"></td>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center text-blue-600">
                                                        <Checkbox
                                                            isDisabled
                                                            isChecked={
                                                                reportData?.CT6 ==
                                                                1
                                                            }
                                                            size="lg"
                                                        >
                                                            {reportData?.CT6 ==
                                                            1
                                                                ? "Đạt"
                                                                : "Chưa đạt"}
                                                        </Checkbox>
                                                    </td>
                                                    <td className="border-b border-gray-400 p-2"></td>
                                                </tr>
                                                <tr>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center">
                                                        7
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Giấy cam biến do EMC
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Tối đa 3 lượt sấy phải
                                                        thay giấy mới.
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Số lần:{" "}
                                                        {reportData?.SoLan || 0}
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center text-blue-600">
                                                        <Checkbox
                                                            isDisabled
                                                            isChecked={
                                                                reportData?.CT7 ==
                                                                1
                                                            }
                                                            size="lg"
                                                        >
                                                            {reportData?.CT7 ==
                                                            1
                                                                ? "Đạt"
                                                                : "Chưa đạt"}
                                                        </Checkbox>
                                                    </td>
                                                    <td className="border-b border-gray-400 p-2"></td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        rowSpan="2"
                                                        className="border-r border-b border-gray-400 p-2 text-center"
                                                    >
                                                        8
                                                    </td>
                                                    <td
                                                        rowSpan="2"
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Cảm biến nhiệt độ trong
                                                        lò sấy
                                                    </td>
                                                    <td
                                                        rowSpan="2"
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Không sai khác so với
                                                        nhiệt độ trong lò quá
                                                        2⁰C (Dùng súng bắn nhiệt
                                                        đo nhiệt độ thực tế
                                                        trong lò).
                                                    </td>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan={1}
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Cảm biến lò:{" "}
                                                        {reportData?.CBL || 0}
                                                    </td>
                                                    <td
                                                        rowSpan="2"
                                                        className="border-r border-b border-gray-400 p-2 text-center text-blue-600"
                                                    >
                                                        <Checkbox
                                                            isDisabled
                                                            isChecked={
                                                                reportData?.CT8 ==
                                                                1
                                                            }
                                                            size="lg"
                                                        >
                                                            {reportData?.CT8 ==
                                                            1
                                                                ? "Đạt"
                                                                : "Chưa đạt"}
                                                        </Checkbox>
                                                    </td>
                                                    <td
                                                        rowSpan="2"
                                                        className="border-b border-gray-400 p-2"
                                                    ></td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan={1}
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Đo thực tế:{" "}
                                                        {reportData?.DoThucTe ||
                                                            0}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center">
                                                        9
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Van hơi, Van nước hồi
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Kín, không bị rò rỉ.
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2"></td>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center text-blue-600">
                                                        <Checkbox
                                                            isDisabled
                                                            isChecked={
                                                                reportData?.CT9 ==
                                                                1
                                                            }
                                                            size="lg"
                                                        >
                                                            {reportData?.CT9 ==
                                                            1
                                                                ? "Đạt"
                                                                : "Chưa đạt"}
                                                        </Checkbox>
                                                    </td>
                                                    <td className="border-b border-gray-400 p-2"></td>
                                                </tr>
                                                <tr>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center">
                                                        10
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Đinh, dây đo độ ẩm
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2">
                                                        Hoạt động tốt.
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2"></td>
                                                    <td className="border-r border-b border-gray-400 p-2 text-center text-blue-600">
                                                        <Checkbox
                                                            isDisabled
                                                            isChecked={
                                                                reportData?.CT10 ==
                                                                1
                                                            }
                                                            size="lg"
                                                        >
                                                            {reportData?.CT10 ==
                                                            1
                                                                ? "Đạt"
                                                                : "Chưa đạt"}
                                                        </Checkbox>
                                                    </td>
                                                    <td className="border-b border-gray-400 p-2"></td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        rowSpan="5"
                                                        className="border-r border-b border-gray-400 p-2 text-center"
                                                    >
                                                        11
                                                    </td>
                                                    <td
                                                        rowSpan="5"
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Chiều dày thực tế
                                                    </td>
                                                    <td
                                                        rowSpan="5"
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Kiểm tra 5 palet ngẫu
                                                        nhiên,mỗi palet 5 thanh
                                                        ngẫu nhiên trong lò,dung
                                                        sai cho phép + 2(mm).
                                                    </td>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan={1}
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Mẫu 1:{" "}
                                                        {reportData?.ActualThickness[0]?.M1 ||
                                                            "Chưa ghi nhận"}{" "}
                                                    </td>
                                                    <td
                                                        rowSpan="5"
                                                        className="border-r border-b border-gray-400 p-2 text-center text-blue-600"
                                                    >
                                                        <Checkbox
                                                            isDisabled
                                                            isChecked={
                                                                reportData?.CT11 ==
                                                                1
                                                            }
                                                            size="lg"
                                                        >
                                                            {reportData?.CT11 ==
                                                            1
                                                                ? "Đạt"
                                                                : "Chưa đạt"}
                                                        </Checkbox>
                                                    </td>
                                                    <td
                                                        rowSpan="5"
                                                        className="border-b border-gray-400 p-2"
                                                    ></td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan={1}
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Mẫu 2:{" "}
                                                        {reportData?.ActualThickness[0]?.M2 ||
                                                            "Chưa ghi nhận"}{" "}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan={1}
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Mẫu 3:{" "}
                                                        {reportData?.ActualThickness[0]?.M3 ||
                                                            "Chưa ghi nhận"}{" "}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan={1}
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Mẫu 4:{" "}
                                                        {reportData?.ActualThickness[0]?.M4 ||
                                                            "Chưa ghi nhận"}{" "}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan={1}
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Mẫu 5:{" "}
                                                        {reportData?.ActualThickness[0]?.M5 ||
                                                            "Chưa ghi nhận"}{" "}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        rowSpan="8"
                                                        className="border-r border-b border-gray-400 p-2 text-center"
                                                    >
                                                        12
                                                    </td>
                                                    <td
                                                        rowSpan="8"
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Động cơ quạt gió/Tốc độ
                                                        gió quạt
                                                    </td>
                                                    <td
                                                        rowSpan="8"
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Tốc độ gió quạt đạt tối
                                                        thiểu 1m/s Các quạt quay
                                                        cùng chiều và ngược
                                                        chiều phải đồng đều.
                                                    </td>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan={1}
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Quạt 1:{" "}
                                                        {reportData?.FanSpeed[0]?.Q1 ||
                                                            "null"}{" "}
                                                        (m/s)
                                                    </td>
                                                    <td
                                                        rowSpan="8"
                                                        className="border-r border-b border-gray-400 p-2 text-center text-blue-600"
                                                    >
                                                        <Checkbox
                                                            isDisabled
                                                            isChecked={
                                                                reportData?.CT12 ==
                                                                1
                                                            }
                                                            size="lg"
                                                        >
                                                            {reportData?.CT12 ==
                                                            1
                                                                ? "Đạt"
                                                                : "Chưa đạt"}
                                                        </Checkbox>
                                                    </td>
                                                    <td
                                                        rowSpan="8"
                                                        className="border-b border-gray-400 p-2"
                                                    ></td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan={1}
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Quạt 2:{" "}
                                                        {reportData?.FanSpeed[0]?.Q2 ||
                                                            "null"}{" "}
                                                        (m/s)
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan={1}
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Quạt 3:{" "}
                                                        {reportData?.FanSpeed[0]?.Q3 ||
                                                            "null"}{" "}
                                                        (m/s)
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan={1}
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Quạt 4:{" "}
                                                        {reportData?.FanSpeed[0]?.Q4 ||
                                                            "null"}{" "}
                                                        (m/s)
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan={1}
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Quạt 5:{" "}
                                                        {reportData?.FanSpeed[0]?.Q5 ||
                                                            "null"}{" "}
                                                        (m/s)
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan={1}
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Quạt 6:{" "}
                                                        {reportData?.FanSpeed[0]?.Q6 ||
                                                            "null"}{" "}
                                                        (m/s)
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan={1}
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Quạt 7:{" "}
                                                        {reportData?.FanSpeed[0]?.Q7 ||
                                                            "null"}{" "}
                                                        (m/s)
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan={1}
                                                        className="border-r border-b border-gray-400 p-2"
                                                    >
                                                        Quạt 8:{" "}
                                                        {reportData?.FanSpeed[0]?.Q8 || "null"}{" "}
                                                        (m/s)
                                                    </td>
                                                </tr>
                                            </tbody>
                                            <tfoot className="bg-gray-200">
                                                {/* Footer rows for signatures */}
                                                <tr>
                                                    <td className="border-r border-b border-gray-400 p-2"></td>
                                                    <td className="border-r border-b border-gray-400 p-2"></td>
                                                    <td className="border-r border-b border-gray-400 p-2"></td>
                                                    <td className="border-r border-b border-gray-400 p-2 text-[18px] text-center font-bold">
                                                        Người kiểm tra
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2"></td>
                                                    <td className="border-b border-gray-400 p-2"></td>
                                                </tr>
                                                <tr>
                                                    <td className="border-r border-gray-400 p-2"></td>
                                                    <td className="border-r border-gray-400 p-2"></td>
                                                    <td className="border-r border-gray-400 p-2"></td>
                                                    <td className="border-r border-gray-400 p-2 text-center text-[18px] text-blue-700 font-semibold">
                                                        {reportData?.NguoiTaoPhieu ||
                                                            "Chưa xác định"}
                                                    </td>
                                                    <td className="border-r border-gray-400 p-2"></td>
                                                    <td className="p-2"></td>
                                                </tr>
                                            </tfoot>
                                        </table>
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

                {/* <div className="py-4"></div> */}
            </div>
        </Layout>
    );
}

export default KilnCheckingReport;
