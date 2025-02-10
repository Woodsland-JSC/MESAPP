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
    FaRegImage,
    FaExpand,
    FaDownLeftAndUpRightToCenter
} from "react-icons/fa6";
import { IoMdRadioButtonOff, IoMdRadioButtonOn, IoMdCheckbox, IoMdSquareOutline } from "react-icons/io";
import DatePicker from "react-datepicker";
import { formatNumber } from "../../../utils/numberFormat";
import { format, startOfDay, endOfDay } from "date-fns";
import toast from "react-hot-toast";
import reportApi from "../../../api/reportApi";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
// import "ag-grid-charts-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import Chart from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import debounce from "../../../utils/debounce";

import useAppContext from "../../../store/AppContext";

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomFloat = (min, max, precision = 2) => {
    const factor = Math.pow(10, precision);
    return Math.floor(Math.random() * (max - min + 1) * factor) / factor;
};

const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

const generateFakeData = (numRecords = 100) => {
    const stages = ['1. Xếp ván PLY (YS3)', '2. Tạo Ván', '3. Hoàn thiện', '4. Kho thành phẩm'];
    const products = ['NACKANĀS chair acacia (TP)', 'Plywood xoan đào', 'Oak wood panel', 'Maple wood board'];
    const names = ['NACKANĀS Ghế - Tựa lưng', 'NACKANĀS Ghế - Chân sau', 'Plywood - Tấm lớn', 'Oak Panel - Tấm nhỏ'];
    const data = [];

    for (let i = 0; i < numRecords; i++) {
        const stage = getRandomElement(stages);
        const product = getRandomElement(products);
        const name = getRandomElement(names);

        data.push({
            productionOrder: `TH${getRandomInt(1000, 9999)}TP-${getRandomInt(1, 99)}`,
            stage: stage,
            product: product,
            barcode: getRandomInt(10000000, 99999999).toString(),
            id: getRandomInt(100000, 999999).toString(),
            name: name,
            height: getRandomInt(10, 50),
            width: getRandomInt(100, 1000),
            length: getRandomInt(100, 1000),
            plannedQuantity: getRandomInt(1000, 5000),
            completedQuantity: getRandomInt(0, 5000),
            completedArea: getRandomFloat(0, 10, 6),
            remainingQuantity: getRandomInt(0, 5000),
            remainingArea: getRandomFloat(0, 10, 6),
            completionRate: `${getRandomFloat(0, 100, 2).toFixed(2)}%`
        });
    }

    return data;
};

function WipProductionOrderReport() {
    const navigate = useNavigate();

    const { user } = useAppContext();
    const gridRef = useRef();

    const [selectedFactory, setSelectedFactory] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [isDataReportLoading, setIsDataReportLoading] = useState(false);
    const [rowData, setRowData] = useState(generateFakeData(100));

    const updateColumnDefs = (colDefs) => {
        return colDefs.map(colDef => {
            if (colDef.enableRowGroup) {
                return { ...colDef, hide: true };
            }
            return colDef;
        });
    };

    const colDefs = useMemo(() => updateColumnDefs([
        {
            field: 'productionOrder',
            headerName: 'Lệnh sản xuất',
            rowGroup: true,
            enableRowGroup: true,
            hide: true
        },
        {
            field: 'stage',
            headerName: 'Công đoạn',
            rowGroup: true,
            enableRowGroup: true,
            hide: true
        },
        {
            field: 'product',
            headerName: 'Sản phẩm',
            rowGroup: true,
            enableRowGroup: true,
            hide: true
        },
        {
            field: 'barcode',
            headerName: '(Bar code của Sản phẩm đích) Mã sản phẩm',
            minWidth: 200
        },
        { field: 'id', headerName: 'ID' },
        { field: 'name', headerName: 'Tên' },
        {
            headerName: 'Qui cách',
            children: [
                { field: 'height', headerName: 'Dày' },
                { field: 'width', headerName: 'Rộng' },
                { field: 'length', headerName: 'Dài' },
            ]
        },
        {
            field: 'plannedQuantity',
            headerName: 'Số lượng cần thực hiện',
            type: 'numericColumn'
        },
        {
            field: 'completedQuantity',
            headerName: 'Số lượng đã thực hiện',
            type: 'numericColumn'
        },
        {
            field: 'completedArea',
            headerName: 'M³ đã thực hiện',
            type: 'numericColumn'
        },
        {
            field: 'remainingQuantity',
            headerName: 'Số lượng còn phải thực hiện',
            type: 'numericColumn'
        },
        {
            field: 'remainingArea',
            headerName: 'M³ còn phải thực hiện',
            type: 'numericColumn'
        },
        {
            field: 'completionRate',
            headerName: 'Tỉ lệ thực hiện'
        },
    ]), []);

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

    const [reportData, setReportData] = useState(generateFakeData(100));

    const getRowStyle = (params) => {
        if (params.node.rowPinned) {
            return {
                backgroundColor: "#B9E0F6",
                fontWeight: "bold",
            };
        }
        return null;
    };

    const handleFactorySelect = async (factory) => {
        setSelectedFactory(factory);
        // Logic lấy theo factory
        const pickRandomRows = (data, n) => {
            const shuffled = data.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, n);
        };

        const randomRows = pickRandomRows(reportData, 3);
        setRowData(randomRows);
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

    const handleResetFilter = () => {
        setSelectedFactory(null);
        setReportData(null);

        toast.success("Đặt lại bộ lọc thành công.");
    };

    const handleExportExcel = useCallback(() => {
        gridRef.current.api.exportDataAsExcel();
    }, []);

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
                                <div className=" text-2xl font-semibold">
                                    Báo cáo lệnh sản xuất đang thực hiện
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
                    <div className="border-2 border-gray-300 bg-white rounded-xl py-2 pb-3">
                        {/* Filter */}
                        <div className="flex flex-col lg:flex-row flex-wrap 2xl:flex-nowrap items-center px-4 mt-1 gap-3">
                            <div className="flex flex-col lg:pl-3 w-full lg:w-[70%] 2xl:w-1/2 lg:border-l-2 lg:border-gray-100">
                                <label
                                    htmlFor="indate"
                                    className="block mb-1 text-sm font-medium whitespace-nowrap text-gray-900"
                                >
                                    Chọn nhà máy
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="col-span-1 w-full">
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
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {isDataReportLoading ? (
                        <div className="mt-2 bg-[#dbdcdd] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                            <div class="dots"></div>
                        </div>
                    ) : (
                        <>
                            {rowData?.length > 0 ? (
                                <div>
                                    <div
                                        className="ag-theme-quartz border-2 border-gray-300 rounded-lg mt-2 "
                                        style={{
                                            height: 630,
                                            fontSize: 16,
                                        }}
                                    >
                                        <AgGridReact
                                            ref={gridRef}
                                            rowData={generateFakeData()}
                                            columnDefs={colDefs}
                                            autoGroupColumnDef={{
                                                headerName: 'Nhóm'
                                            }}
                                            rowGroupPanelShow={"always"}
                                            // groupDisplayType="groupRows"
                                            animateRows={true}
                                            suppressAggFuncInHeader
                                            getRowStyle={getRowStyle}
                                            excelStyles={excelStyles}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 bg-[#dbdcdd] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                                    Không có dữ liệu để hiển thị.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default WipProductionOrderReport