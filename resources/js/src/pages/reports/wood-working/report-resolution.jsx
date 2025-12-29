import { FaArrowLeft } from "react-icons/fa6";
import Layout from "../../../layouts/layout"
import { useRef, useState } from "react";
import { IoMdRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";
import Select from "react-select";
import logo from "../../../assets/images/WLorigin.svg";
import reportApi from "../../../api/reportApi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import { Spinner } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
// import { FACTORIES } from "../../../shared/data";

const ReportResolution = () => {
    const navigate = useNavigate();
    // declare state
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [reportSolutions, setReportSolution] = useState([]);
    const [reportSolutionData, setReportSolutionData] = useState([]);
    const [currentReportSelected, setCurrentReportSelected] = useState(null);
    const [reports, setReports] = useState([]);
    const [isLoadingReport, setIsLoadingReport] = useState(false);

    const pdfRef = useRef();
    const [isExporting, setIsExport] = useState(false);

    const clear = () => {
        setReportSolution([]);
        setReportSolutionData([]);
        setReportSolutionData([]);
        setCurrentReportSelected(null)
        setReports([])
        setIsLoadingReport(false)
    }

    // features functions
    const handleFactorySelect = async (factory) => {
        setReportSolution([]);
        setSelectedFactory(factory);

        try {
            let res = await reportApi.getReportSolution(factory);

            if (res) {
                setReportSolutionData(res);

                let options = [];

                res.forEach(item => {
                    let value = item?.id;
                    let label = '' + factory + '-QC-' + Number(value).toString().padStart(6, '0') + ' | ' + item.created_at.split(" ")[0];

                    options.push({
                        value,
                        label
                    });
                });

                setReportSolution(options)
            }

        } catch {
            toast.error("Đã xảy ra lỗi lấy biên bản.", {
                duration: 3000
            });
        }
    };

    const FactoryOption = ({ value, label }) => (
        <div
            className={`group hover:border-[#86ABBE] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-3xl border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all ${selectedFactory === value
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

    const onChangeReportSolution = async (value) => {
        try {
            setIsLoadingReport(true)
            let res = await reportApi.getReportSolutionById(value);
            setReports(res);

            let report = reportSolutionData.find(item => item.id == value.value);

            setCurrentReportSelected({ ...report, label: value.label })
            setIsLoadingReport(false);
        } catch {
            toast.error("Đã xảy ra lỗi lấy biên bản.");
            setIsLoadingReport(false)
        }
    }

    const exportPDF = async () => {
        if (isExporting) return

        try {
            setIsExport(true)
            const element = pdfRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: "#f0f0f0"
            });

            const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

            const pageWidth = pdf.internal.pageSize.getWidth();  // 297mm
            const pageHeight = pdf.internal.pageSize.getHeight() - 10; // 210mm
            const padding = 10; // 10mm padding

            const usableWidth = pageWidth - padding * 2;
            const usableHeight = pageHeight - padding * 2;

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = usableWidth / imgWidth;

            const scaledWidth = usableWidth;
            const scaledHeight = imgHeight * ratio;

            const totalPages = Math.ceil(scaledHeight / usableHeight);

            for (let i = 0; i < totalPages; i++) {
                const sourceY = (i * usableHeight) / ratio;
                const pageCanvas = document.createElement("canvas");
                pageCanvas.width = imgWidth;
                pageCanvas.height = (usableHeight / ratio);

                const ctx = pageCanvas.getContext("2d");
                ctx.drawImage(
                    canvas,
                    0,
                    sourceY,
                    imgWidth,
                    pageCanvas.height,
                    0,
                    0,
                    imgWidth,
                    pageCanvas.height
                );

                const pageImgData = pageCanvas.toDataURL("image/png");
                if (i > 0) pdf.addPage();
                pdf.addImage(
                    pageImgData,
                    "PNG",
                    padding,
                    padding,
                    scaledWidth,
                    usableHeight
                );
            }

            let filename = currentReportSelected?.label || "BIÊN BẢN XỬ LÝ SẢN PHẨM KHÔNG PHÙ HỢP"

            pdf.save(filename);
            setIsExport(false)
        } catch {
            setIsExport(false)
            toast.error("Xuất PDF có lỗi");
        }
    }

    const exportPDF1 = () => {
        window.print();
    }

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleDate = (dateString) => {
        let date = "";

        let splitDate = dateString.split(" ");

        let year = splitDate[0].split("-")[0] ?? "";
        let month = splitDate[0].split("-")[1] ?? "";
        let day = splitDate[0].split("-")[2] ?? "";

        let hour = splitDate[1].split(":")[0] ?? "";
        let min = splitDate[1].split(":")[1] ?? "";

        date = `${hour} giờ ${min} phút, ngày ${day} tháng ${month} năm ${year}.`;

        return date;
    }

    const Signature = () => {
        return (
            <div className="flex justify-between mt-3" id="signature-qc">
                <div className="text-center">
                    <div>
                        <div>{handleDate(currentReportSelected.created_at)}</div>
                    </div>
                    <div>
                        <div>Giám đốc sản xuất</div>
                    </div>
                    <div className="mt-3 mb-3">
                        <img className="mx-auto" width="80" src={new URL(`../../../assets/signature/${currentReportSelected.idGD}.png`, import.meta.url).href} alt="giam-doc-sx-chu-ky" crossOrigin="anonymous" />
                    </div>
                    <div>
                        <div>{currentReportSelected?.lastNameGD + " " + currentReportSelected?.firstNameGD}</div>
                    </div>
                </div>
                <div className="text-center">
                    <div>
                        <div>{handleDate(currentReportSelected.created_at)}</div>
                    </div>
                    <div>
                        <div>Trưởng bộ phận QC</div>
                    </div>
                    <div className="mt-3 mb-3">
                        <img className="mx-auto" width="80" src={new URL(`../../../assets/signature/${currentReportSelected.idQC}.png`, import.meta.url).href} alt="truong-qc-chu-ky" crossOrigin="anonymous" />
                    </div>
                    <div>
                        <div>{currentReportSelected.lastNameQC + " " + currentReportSelected.firstNameQC }</div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Layout>
            <div className="w-screen p-6 px-5 xl:p-5 xl:px-12 ">
                {/* Title */}
                <div className="flex items-center justify-between space-x-6 mb-3.5">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 hover:bg-gray-200 rounded-full cursor-pointer active:scale-[.87] active:duration-75 transition-all" onClick={handleGoBack}>
                            <FaArrowLeft className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex flex-col mb-0 pb-0">
                            <div className="text-sm text-[#17506B]">
                                Báo cáo chế biến gỗ
                            </div>
                            <div className="serif text-3xl font-bold">
                                Biên bản xử lý sản phẩm không phù hợp
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className=" bg-white rounded-xl py-2 pb-3">
                    {/* Filter */}
                    <div className="flex items-center space-x-3 px-4 mt-1">
                        <div className="w-3/4">
                            <div className="w-full">
                                <label
                                    className="block mb-1 text-sm font-medium text-gray-900"
                                >
                                    Chọn nhà máy
                                </label>
                            </div>
                            <div className="flex gap-x-4">
                                <div className="w-[300px] flex items-end">
                                    <FactoryOption value="TH" label="Thuận Hưng" />
                                </div>
                                <div className="w-[300px] flex items-end">
                                    <FactoryOption value="YS" label="Yên Sơn" />
                                </div>
                                <div className="w-[300px] flex items-end">
                                    <FactoryOption value="TB" label="Thái Bình" />
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-3 w-1/4">
                            <div className="flex" style={{ marginLeft: 'auto' }}>
                                {
                                    (reports && reports.length > 0) &&
                                    <button
                                        type="button"
                                        onClick={() => exportPDF1()}
                                        disabled={isExporting}
                                        className={`mt-0 self-end flex cursor-pointer items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center gap-x-2`}
                                    >
                                        {isExporting ? (
                                            <div className="flex items-center space-x-4">
                                                <Spinner
                                                    size="sm"
                                                    color="white"
                                                />
                                                <div>Đang xuất PDF...</div>
                                            </div>
                                        ) : (
                                            "Xuất PDF"
                                        )}
                                    </button>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 px-4 mt-1">
                        <div className="flex space-x-3 w-1/4">
                            <div className="col-span-1 w-full">
                                <label
                                    htmlFor="indate"
                                    className="block mb-1 text-sm font-medium text-gray-900 "
                                >
                                    Chọn biên bản
                                </label>
                                <Select
                                    options={reportSolutions}
                                    isDisabled={!selectedFactory}
                                    onChange={(value) => {
                                        onChangeReportSolution(value);
                                    }}
                                    placeholder="Chọn biên bản"
                                    className="w-full z-20 rounded-[12px]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {
                    isLoadingReport ? (
                        <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center  p-3 px-4 pr-1 rounded-lg ">
                            {/* <div>Đang tải dữ liệu</div> */}
                            <div class="dots"></div>
                        </div>
                    ) :
                        (reports && reports.length > 0) ?
                            <div ref={pdfRef} className="bg-[#ffffff]" id='pdf-content'>
                                <div className="serif w-full mt-4 bg-[#ffffff] p-8 rounded-xl">
                                    <table className="w-full border-2 border-gray-400">
                                        <thead class="font-bold">
                                            <tr>
                                                <th rowspan="3" colspan="1" class="w-48 border-r border-b border-gray-400 bg-gray-200 mx-auto">
                                                    <img src={logo} alt="logo" class="mx-auto flex items-center justify-center w-24 h-24" />
                                                </th>
                                                <td rowspan="1" colspan="7" class="border-b border-gray-400 bg-gray-200 text-center font-bold">
                                                    QUY TRÌNH KIỂM SOÁT SẢN PHẨM KHÔNG PHÙ HỢP
                                                </td>
                                                <td colspan="1" rowspan="6" class="w-[280px] text-lg border-b border-l bg-gray-200 border-gray-400 px-4 text-right font-bold">
                                                    <div class="flex flex-col items-start">
                                                        <p>QT-05/BM-02</p>
                                                        <p>Ngày ban hành: 10/09/2018</p>
                                                        <p>Lần ban hành: 05</p>
                                                        <p>Trang: 1/1</p>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td rowspan="1" colspan="7" class="border-b font-bold bg-gray-200 border-gray-400  text-center">
                                                    BIÊN BẢN XỬ LÝ SẢN PHẨM KHÔNG PHÙ HỢP
                                                </td>
                                            </tr>
                                        </thead>
                                    </table>
                                    <div className="mt-3 mb-3 flex">
                                        <div className="w-1/3">
                                            <div>{handleDate(currentReportSelected.created_at)}</div>
                                            <div>Người tạo: {currentReportSelected ? (currentReportSelected.first_name + " " + currentReportSelected.last_name) : '-'}</div>
                                        </div>
                                        {
                                            currentReportSelected &&
                                            <div className="w-2/3 font-bold px-4">
                                                MÃ BIÊN BẢN: {currentReportSelected.label.split("|")[0]}
                                            </div>
                                        }
                                    </div>
                                    <div>
                                        <table className="w-full border-2 border-gray-400 border-collapse table-fixed">
                                            <thead class="font-bold">
                                                {/* INFO report */}
                                                <tr className="">
                                                    <td className="w-[110px] h-[48px] border-r border-b border-gray-400 p-2 text-center font-bold">
                                                        CĐ báo lỗi
                                                    </td>
                                                    <td className="w-[150px] h-[48px] border-r border-b border-gray-400 p-2 text-center font-bold">
                                                        Nguồn lỗi
                                                    </td>
                                                    <td className="w-[230px] h-[48px] border-r border-b border-gray-400 p-2 text-center font-bold">
                                                        Tên sản phẩm
                                                    </td>
                                                    <td className="w-[150px] h-[48px] border-r border-b border-gray-400 p-2 text-center font-bold">
                                                        Loại lỗi
                                                    </td>
                                                    <td className="w-[120px] h-[48px] border-r border-b border-gray-400 p-2 text-center font-bold">
                                                        Lệnh SX
                                                    </td>
                                                    <td className="w-[50px] h-[48px] border-r border-b border-gray-400 p-2 text-center font-bold">
                                                        ĐVT
                                                    </td>
                                                    <td className="w-[120px] h-[48px] border-r border-b border-gray-400 p-2 text-center font-bold">
                                                        Số Lượng (T)
                                                    </td>
                                                    <td className="w-[200px] h-[48px] border-r border-b border-gray-400 p-2 text-center font-bold">
                                                        Diễn giải
                                                    </td>
                                                    <td className="w-[250px] h-[48px] border-r border-b border-gray-400 p-2 text-center font-bold">
                                                        Cách xử lý
                                                    </td>
                                                    <td className="w-[110px] h-[48px] border-r border-b border-gray-400 p-2 text-center font-bold" >
                                                        CĐ xử lý
                                                    </td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    reports.map((item, index) => (
                                                        <tr key={index} className="bg-white !text-[13px]">
                                                            <td className="border border-gray-400 break-words p-1">{item.NoiBaoLoi}</td>
                                                            <td className="border border-gray-400 break-words p-1">{item.LoiNhaMay}</td>
                                                            <td className="border border-gray-400 break-words p-1">{item.ItemName}</td>
                                                            <td className="border border-gray-400 break-words p-1">{item.LoiLoai}</td>
                                                            <td className="border border-gray-400 break-words p-1">{item.LSX}</td>
                                                            <td className="border border-gray-400 break-words p-1 text-center">{item.DVT}</td>
                                                            <td className="border border-gray-400 break-words p-1 text-center">{item.Quantity}</td>
                                                            <td className="border border-gray-400 break-words p-1">{item?.note ?? ''}</td>
                                                            <td className="border border-gray-400 break-words p-1">{item.HXL}</td>
                                                            <td className="border border-gray-400 break-words p-1">{item.ToChuyenVe}</td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                    <Signature />
                                </div>
                            </div> :
                            <div className="mt-4 bg-[#C2C2CB] items-center justify-center  p-2 px-4 pr-1 rounded-lg flex">
                                Không có dữ liệu để hiển thị.
                            </div>
                }

            </div>
        </Layout>
    )
}

export default ReportResolution;