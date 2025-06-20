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
import { PiFilePdfBold, PiPrinterBold } from "react-icons/pi";
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
import { format, startOfDay, endOfDay, set } from "date-fns";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import toast from "react-hot-toast";
import reportApi from "../../../api/reportApi";
import Select from "react-select";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
// import "ag-grid-charts-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import logo from "../../../assets/images/WLorigin.svg";

import useAppContext from "../../../store/AppContext";
import axios from "axios";

import ExcelJS from "exceljs";

function KilnLoading() {
    const navigate = useNavigate();

    const { user } = useAppContext();

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
        getLoadedKiln(factory);
    };

    const getLoadedKiln = async (factory) => {
        setSelectedKiln(null);
        setKilnOptions([]);
        setIsKilnLoading(true);
        try {
            const res = await axios.get("/api/get-loaded-kiln", {
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
            const res = await axios.get("/api/report/say-bienbanvaolo", {
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
        if (selectedKiln) {
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
            // Import ExcelJS dynamically để tránh lỗi bundle
            const ExcelJS = await import("exceljs");

            // Tạo workbook và worksheet
            const workbook = new ExcelJS.default.Workbook();
            const worksheet = workbook.addWorksheet("Biên bản vào lò");

            // Thiết lập thông tin workbook
            workbook.creator = "Hệ thống COC";
            workbook.created = new Date();

            // Header với merge cells và styling
            worksheet.mergeCells("B1:G1");
            worksheet.getCell("B1").value = "SỔ TAY COC";
            worksheet.getCell("B1").font = { bold: true, size: 18 };
            worksheet.getCell("B1").alignment = {
                horizontal: "center",
                vertical: "middle",
            };
            worksheet.getCell("B1").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD3D3D3" },
            };

            // Thông tin BM-COC-09
            worksheet.getCell("H1").value = "BM-COC-09";
            worksheet.getCell("H1").font = { bold: true, size: 14 };
            worksheet.getCell("H2").value = "Ngày BH: 05/09/2013";
            worksheet.getCell("H2").font = { bold: true, size: 12 };
            worksheet.getCell("H3").value = "Lần BH: 02";
            worksheet.getCell("H3").font = { bold: true, size: 12 };

            worksheet.mergeCells("B2:G2");
            worksheet.getCell("B2").value = "DANH MỤC THEO DÕI GỖ SẤY TRONG LÒ";
            worksheet.getCell("B2").font = { bold: true, size: 16 };
            worksheet.getCell("B2").alignment = {
                horizontal: "center",
                vertical: "middle",
            };
            worksheet.getCell("B2").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD3D3D3" },
            };

            // Thông tin chi tiết với error handling
            const factoryName =
                reportData?.Factory === "TH"
                    ? "Thuận Hưng"
                    : reportData?.Factory === "YS"
                    ? "Yên Sơn"
                    : reportData?.Factory === "TB"
                    ? "Thái Bình"
                    : "Không xác định";

            const kilnName =
                kilnOptions && Array.isArray(kilnOptions) && reportData?.Oven
                    ? kilnOptions.find(
                          (option) => option?.value === reportData.Oven
                      )?.label || reportData.Oven
                    : reportData?.Oven || "";

            // Row 4: Ngày vào lò và Địa điểm sấy gỗ
            const fillGray = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD3D3D3" },
            };

            worksheet.getCell("A4").value = "Ngày vào lò";
            worksheet.getCell("A4").font = { bold: true };
            worksheet.getCell("A4").fill = fillGray;

            worksheet.mergeCells("B4:C4");
            worksheet.getCell("B4").value =
                reportData?.LoadedIntoKilnDates || "";
            worksheet.getCell("B4").fill = fillGray;

            worksheet.mergeCells("D4:E4");
            worksheet.getCell("D4").value = "Địa điểm sấy gỗ";
            worksheet.getCell("D4").font = { bold: true };
            worksheet.getCell("D4").fill = fillGray;

            worksheet.mergeCells("F4:G4");
            worksheet.getCell("F4").value = factoryName;
            worksheet.getCell("F4").fill = fillGray;

            // Row 5: Lò số và Loại gỗ sấy
            worksheet.getCell("A5").value = "Lò số";
            worksheet.getCell("A5").font = { bold: true };
            worksheet.getCell("A5").fill = fillGray;

            worksheet.mergeCells("B5:C5");
            worksheet.getCell("B5").value = kilnName;
            worksheet.getCell("B5").fill = fillGray;

            worksheet.mergeCells("D5:E5");
            worksheet.getCell("D5").value = "Loại gỗ sấy";
            worksheet.getCell("D5").font = { bold: true };
            worksheet.getCell("D5").fill = fillGray;

            worksheet.mergeCells("F5:G5");
            worksheet.getCell("F5").value = "Acacia";
            worksheet.getCell("F5").fill = fillGray;

            // Row 6: Tổng số pallet, TTMT và Khối lượng
            worksheet.getCell("A6").value = "Tổng số pallet:";
            worksheet.getCell("A6").font = { bold: true };
            worksheet.getCell("A6").fill = fillGray;

            worksheet.mergeCells("B6:C6");
            worksheet.getCell("B6").value = reportData?.TotalPallet || "";
            worksheet.getCell("B6").fill = fillGray;

            worksheet.getCell("D6").value = "TTMT";
            worksheet.getCell("D6").font = { bold: true };
            worksheet.getCell("D6").fill = fillGray;

            worksheet.getCell("E6").value = "FSC 100%";
            worksheet.getCell("E6").fill = fillGray;

            worksheet.getCell("F6").value = "Khối lượng";
            worksheet.getCell("F6").font = { bold: true };
            worksheet.getCell("F6").fill = fillGray;

            worksheet.getCell("G6").value = `${
                reportData?.TotalMass || ""
            } (m3)`;
            worksheet.getCell("G6").fill = fillGray;

            // Header của bảng dữ liệu (Row 8)
            const headerRow = 8;
            const headers = [
                "Mã lô gỗ nhập",
                "Mã Pallet",
                "Dài",
                "Rộng",
                "Dày",
                "Số Lượng (T)",
                "Khối Lượng (m3)",
            ];

            headers.forEach((header, index) => {
                const cell = worksheet.getCell(headerRow, index + 1);
                cell.value = header;
                cell.font = { bold: true };
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFADD8E6" },
                };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
                cell.alignment = { horizontal: "center", vertical: "middle" };
            });

            // Thêm dữ liệu chi tiết với kiểm tra an toàn
            if (reportData?.Detail && Array.isArray(reportData.Detail)) {
                reportData.Detail.forEach((item, index) => {
                    const row = headerRow + 1 + index;
                    const rowData = [
                        item?.Size || "",
                        item?.PalletCode || "",
                        item?.CDai || "",
                        item?.CRong || "",
                        item?.CDay || "",
                        item?.Qty || "",
                        item?.Mass || "",
                    ];

                    rowData.forEach((data, colIndex) => {
                        const cell = worksheet.getCell(row, colIndex + 1);
                        cell.value = data;
                        cell.border = {
                            top: { style: "thin" },
                            left: { style: "thin" },
                            bottom: { style: "thin" },
                            right: { style: "thin" },
                        };

                        // Căn giữa cho các cột số
                        if (colIndex >= 2 && colIndex <= 6) {
                            cell.alignment = {
                                horizontal: "center",
                                vertical: "middle",
                            };
                        }
                    });
                });
            }

            // Thiết lập độ rộng cột
            worksheet.columns = [
                { width: 20 },
                { width: 15 },
                { width: 10 },
                { width: 10 },
                { width: 10 },
                { width: 15 },
                { width: 18 },
            ];

            // Xuất file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            const safeKilnName = kilnName
                ? kilnName.replace(/[^a-zA-Z0-9]/g, "_")
                : "Unknown";
            a.download = `Bien_ban_vao_lo_${reportData?.Oven}_${
                new Date().toISOString().split("T")[0]
            }.xlsx`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            toast.success("Xuất file Excel thành công!");
        } catch (error) {
            console.error("Lỗi khi xuất Excel:", error);
            toast.error("Có lỗi xảy ra khi xuất file Excel.");
        }
    }, [reportData, kilnOptions]);

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
                                    Biên bản vào lò
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

                            <div className="flex justify-end items-center divide-x-2 divide-gray-200 w-1/3">
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
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className=" bg-white rounded-xl py-2 pb-3">
                        {/* Filter */}
                        <div className="flex items-center space-x-3 divide-x-2 divide-gray-150 px-4 mt-1">
                            <div className="flex space-x-3 w-3/4">
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
                                        options={kilnOptions}
                                        isDisabled={isKilnLoading}
                                        onChange={(value) => {
                                            setSelectedKiln(value);
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
                        <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center  p-3 px-4 pr-1 rounded-lg ">
                            {/* <div>Đang tải dữ liệu</div> */}
                            <div class="dots"></div>
                        </div>
                    ) : (
                        <>
                            {reportData ? (
                                <div>
                                    <div className="serif w-full mt-4 bg-gray-50 p-8 rounded-xl">
                                        <table className="w-full border-2 border-gray-400">
                                            <thead className="font-bold">
                                                {/* Header row 1 - Logo và Sổ tay COC */}
                                                <tr>
                                                    <th
                                                        rowSpan="2"
                                                        colSpan="1"
                                                        className="w-48 border-r border-b border-gray-400 p-2 bg-gray-200 mx-auto"
                                                    >
                                                        <img
                                                            src={logo}
                                                            alt="logo"
                                                            className="mx-auto flex items-center justify-center w-24 h-24"
                                                        ></img>
                                                    </th>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan="6"
                                                        className="h-[50px] border-b border-gray-400 bg-gray-200 p-2 text-center font-bold text-lg"
                                                    >
                                                        SỔ TAY COC
                                                    </td>
                                                    <td
                                                        colSpan="1"
                                                        rowSpan="5"
                                                        className="w-[280px] text-lg border-b border-l bg-gray-200 border-gray-400 p-2 px-4 text-right font-bold"
                                                    >
                                                        <div className="flex flex-col items-start">
                                                            <p>BM-COC-09</p>
                                                            <p>
                                                                Ngày BH:
                                                                05/09/2013
                                                            </p>
                                                            <p>Lần BH: 02</p>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Header row 2 - Danh mục và BM-COC-09 */}
                                                <tr>
                                                    <td
                                                        rowSpan="1"
                                                        colSpan="6"
                                                        className="h-[50px] border-b text-xl font-bold bg-gray-200 border-gray-400 p-2  text-center"
                                                    >
                                                        DANH MỤC THEO DÕI GỖ SẤY
                                                        TRONG LÒ
                                                    </td>
                                                </tr>

                                                {/* Header row 3 - Thông tin chi tiết */}
                                                <tr>
                                                    <td
                                                        colSpan="1"
                                                        className="bg-gray-200 border-b text-lg font-bold border-gray-400 p-2 w-36"
                                                    >
                                                        Ngày vào lò
                                                    </td>
                                                    <td
                                                        colSpan="2"
                                                        className="bg-gray-200 text-lg font-bold border-b border-x border-gray-400 p-2 w-32"
                                                    >
                                                        {
                                                            reportData?.LoadedIntoKilnDates
                                                        }
                                                    </td>
                                                    <td
                                                        colSpan="2"
                                                        className="bg-gray-200 border-b text-lg font-bold border-gray-400 p-2 w-36"
                                                    >
                                                        Địa điểm sấy gỗ
                                                    </td>
                                                    <td
                                                        colSpan="2"
                                                        className="bg-gray-200 border-b border-l text-lg font-bold border-gray-400 p-2 w-32"
                                                    >
                                                        {reportData.Factory ==
                                                        "TH"
                                                            ? "Thuận Hưng"
                                                            : reportData.Factory ==
                                                              "YS"
                                                            ? "Yên Sơn"
                                                            : reportData.Factory ==
                                                              "TB"
                                                            ? "Thái Bình"
                                                            : "Không xác định"}
                                                    </td>
                                                </tr>

                                                {/* Header row 3 - Thông tin chi tiết */}
                                                <tr>
                                                    <td
                                                        colSpan="1"
                                                        className="bg-gray-200 border-b border-gray-400 p-2 text-lg font-bold w-36"
                                                    >
                                                        Lò số
                                                    </td>
                                                    <td
                                                        colSpan="2"
                                                        className="bg-gray-200 border-b border-x border-gray-400 p-2 text-lg font-bold w-32"
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
                                                        colSpan="2"
                                                        className="bg-gray-200 border-b border-gray-400 p-2 text-lg font-bold w-36"
                                                    >
                                                        Loại gỗ sấy
                                                    </td>
                                                    <td
                                                        colSpan="2"
                                                        className="bg-gray-200 border-b border-l border-gray-400 p-2 text-lg font-bold w-32"
                                                    >
                                                        Acacia
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td
                                                        colSpan="1"
                                                        className="bg-gray-200 border-b border-gray-400 p-2 text-lg font-bold w-36"
                                                    >
                                                        Tổng số pallet:
                                                    </td>
                                                    <td
                                                        colSpan="2"
                                                        className="bg-gray-200 border-b border-x border-gray-400 p-2 text-lg font-bold w-32"
                                                    >
                                                        {reportData.TotalPallet}
                                                    </td>
                                                    <td
                                                        colSpan="1"
                                                        className="bg-gray-200 border-b border-gray-400 p-2 text-lg font-bold w-36"
                                                    >
                                                        TTMT
                                                    </td>
                                                    <td
                                                        colSpan="1"
                                                        className="bg-gray-200 border-b border-x border-gray-400 p-2 text-lg font-bold w-32"
                                                    >
                                                        FSC 100%
                                                    </td>
                                                    <td
                                                        colSpan="1"
                                                        className="bg-gray-200 border-b border-gray-400 p-2 text-lg font-bold w-36"
                                                    >
                                                        Khối lượng
                                                    </td>
                                                    <td
                                                        colSpan="1"
                                                        className="bg-gray-200 border-b border-l border-gray-400 p-2 text-lg font-bold w-32"
                                                    >
                                                        {reportData.TotalMass}{" "}
                                                        (m3)
                                                    </td>
                                                </tr>

                                                {/* Header row 4 - Tiêu đề cột của bảng dữ liệu */}
                                                <tr className="bg-blue-200">
                                                    <td className="border-r border-b border-gray-400 p-2 text-lg font-bold">
                                                        Mã lô gỗ nhập
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2 text-lg font-bold">
                                                        Mã Pallet
                                                    </td>
                                                    <td className="w-[150px] border-r border-b border-gray-400 p-2 text-lg text-center font-bold">
                                                        Dài
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2 text-lg text-center font-bold">
                                                        Rộng
                                                    </td>
                                                    <td className="border-r border-b border-gray-400 p-2 text-lg text-center font-bold">
                                                        Dày
                                                    </td>
                                                    <td
                                                        colSpan="2"
                                                        className="w-[300px] border-r border-b border-gray-400 p-2 text-lg text-center font-bold"
                                                    >
                                                        Số Lượng (T)
                                                    </td>
                                                    <td
                                                        colSpan="3"
                                                        className="border-b border-gray-400 p-2 text-lg text-center font-bold"
                                                    >
                                                        Khối Lượng (m3)
                                                    </td>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {reportData?.Detail?.map(
                                                    (item, index) => (
                                                        <tr
                                                            key={index}
                                                            className="bg-white !text-[17px]"
                                                        >
                                                            <td className=" border-r border-b border-gray-400 p-2">
                                                                {item.Size}
                                                            </td>
                                                            <td className="border-r border-b border-gray-400 p-2">
                                                                {
                                                                    item.PalletCode
                                                                }
                                                            </td>
                                                            <td className="border-r border-b border-gray-400 p-2 text-center">
                                                                {item.CDai}
                                                            </td>
                                                            <td className="border-r border-b border-gray-400 p-2 text-center">
                                                                {item.CRong}
                                                            </td>
                                                            <td className="border-r border-b border-gray-400 p-2 text-center">
                                                                {item.CDay}
                                                            </td>
                                                            <td
                                                                colSpan="2"
                                                                className="border-r border-b border-gray-400 p-2 text-right"
                                                            >
                                                                {item.Qty}
                                                            </td>
                                                            <td
                                                                colSpan="1"
                                                                className="border-b border-gray-400 p-2 text-right"
                                                            >
                                                                {item.Mass}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
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
            </div>
        </Layout>
    );
}

export default KilnLoading;
