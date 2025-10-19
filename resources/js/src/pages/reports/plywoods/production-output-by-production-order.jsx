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
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";
import reportApi from "../../../api/reportApi";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import debounce from "../../../utils/debounce";
import useAppContext from "../../../store/AppContext";
import Loader from "../../../components/Loader";

function ProductionOutputByProductionOrderVCN() {
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

    const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth());
    const [toDate, setToDate] = useState(new Date());
    const [factories, setFactories] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState([]);

    const [isDataReportLoading, setIsDataReportLoading] = useState(false);
    const [rowData, setRowData] = useState([]);

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
                field: 'productionOrder',
                headerName: 'Lệnh sản xuất',
                rowGroup: true,
                enableRowGroup: true,
                suppressHeaderMenuButton: true,
                filter: true,
                pinned: "left"
            },
            {
                field: "stage",
                headerName: "Công đoạn",
                rowGroup: true,
                enableRowGroup: true,
                width: 180,
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
            // {
            //     headerName: "Mã thị trường",
            //     field: "SPD_MTT",
            //     width: 170,
            //     suppressHeaderMenuButton: true,
            //     filter: true,
            // },
            {
                headerName: 'Quy cách',
                children: [
                    {
                        headerName: "Dài",
                        field: "length",
                        width: 100,
                        suppressHeaderMenuButton: true,
                        filter: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                                : { textAlign: "center" },
                    },
                    {
                        headerName: "Rộng",
                        field: "width",
                        width: 100,
                        suppressHeaderMenuButton: true,
                        filter: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                                : { textAlign: "center" },
                    },
                    {
                        headerName: "Dày",
                        field: "thickness",
                        width: 100,
                        suppressHeaderMenuButton: true,
                        filter: true,
                        valueFormatter: (params) => formatNumber(Number(params.value) || 0),
                        cellStyle: (params) =>
                            params.node.rowPinned
                                ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                                : { textAlign: "center" },
                    },
                ]
            },
            {
                headerName: "Số lượng kế hoạch",
                field: "plannedQty",
                filter: true,
                width: 220,
                suppressHeaderMenuButton: true,
                valueFormatter: (params) => {
                    return formatNumber(Number(params.value) || 0)
                },
                aggFunc: "sum",
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                        : { textAlign: "right" },
            },
            {
                headerName: "Lỗi công đoạn",
                field: "errorQty",
                filter: true,
                width: 220,
                suppressHeaderMenuButton: true,
                valueFormatter: (params) => {
                    return formatNumber(Number(params.value) || 0)
                },
                aggFunc: "sum",
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                        : { textAlign: "right" },
            },
            {
                headerName: "Số lượng đã thực hiện",
                field: "completedQty",
                filter: true,
                width: 220,
                suppressHeaderMenuButton: true,
                valueFormatter: (params) => {
                    return formatNumber(Number(params.value) || 0)
                },
                aggFunc: "sum",
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                        : { textAlign: "right" },
            },
            {
                headerName: "M3 đã thực hiện",
                field: "completedQtyM3",
                filter: true,
                width: 220,
                suppressHeaderMenuButton: true,
                valueFormatter: (params) => {
                    return formatNumber(Number(params.value) || 0)
                },
                aggFunc: "sum",
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                        : { textAlign: "right" },
            },
            {
                headerName: "Số lượng còn thực hiện",
                field: "remainingQty",
                filter: true,
                width: 220,
                suppressHeaderMenuButton: true,
                valueFormatter: (params) => {
                    return formatNumber(Number(params.value) || 0)
                },
                aggFunc: "sum",
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                        : { textAlign: "right" },
            },
            {
                headerName: "M3 còn thực hiện",
                field: "remainingQtyM3",
                filter: true,
                width: 220,
                suppressHeaderMenuButton: true,
                valueFormatter: (params) => {
                    return formatNumber(Number(params.value) || 0)
                },
                aggFunc: "sum",
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                        : { textAlign: "right" },
            },
            {
                headerName: "Tỉ lệ hoàn thành (%)",
                field: "completion",
                filter: true,
                width: 220,
                suppressHeaderMenuButton: true,
                valueFormatter: (params) => {
                    return formatNumber(Number(params.value) || 0) + '%'
                },
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "right", backgroundColor: "#B9E0F6" }
                        : { textAlign: "right" },
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

    const getRowStyle = (params) => {
        if (params.node.rowPinned) {
            return {
                backgroundColor: "#B9E0F6",
                fontWeight: "bold",
            };
        }
        return null;
    };

    const getReportData = async () => {
        if (!selectedFactory) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        let params = {
            factory: selectedFactory || '',
        };

        setIsDataReportLoading(true);

        try {
            let res = await reportApi.getProductionOutputByProductionOrder(
                params.factory,
                'VCN',
                { signal }
            );

            setReportData(res);

            // if (selectedFactory !== 'All') {
            //     res = res.filter(data => data.U_FAC === selectedFactory);
            //     if (!selectedGroup.some(group => group?.value === 'All')) {
            //         res = res.filter(data => selectedGroup.some(group => group === data.U_To));
            //     }
            // }

            const stageOrder = groupData.reduce((acc, cur) => {
                acc[cur.Code] = Number(cur.U_Order);
                return acc;
            }, {});

            const formattedData = res
                .slice()
                .sort((a, b) => (stageOrder[a.U_CDOAN] || 999) - (stageOrder[b.U_CDOAN] || 999))
                .reduce((acc, item) => {
                    const completion = Number(item.Completion);
                    if (completion < 100) {
                        acc.push({
                            productionOrder: item.LSX,
                            stage: convertStageName(item.U_CDOAN),
                            ItemName: item.ItemName,
                            SPD_MTT: item.SPD_MTT,
                            length: item.U_CDai,
                            width: item.U_CRong,
                            thickness: item.U_CDay,
                            plannedQty: Math.abs(Number(item.PlannedQty)),
                            errorQty: Number(item.ErrorQty),
                            completedQty: Number(item.CompletedQty),
                            completedQtyM3: Number(item.CompletedM3),
                            remainingQty: Number(item.RemainingQty),
                            remainingQtyM3: Number(item.RemainingM3),
                            completion,
                        });
                    }
                    return acc;
                }, []);

            setRowData(formattedData);
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
        setSelectedGroup([]);
        setSelectedUnit("")
        setFromDate(getFirstDayOfCurrentMonth());
        setToDate(new Date());

        setReportData(null);

        toast.success("Đặt lại bộ lọc thành công.");
    };

    const handleExportExcel = useCallback(() => {
        const factory = selectedFactory || 'Tất cả';
        const fileName = `Báo cáo sản lượng theo lệnh sản xuất_${factory}.xlsx`;

        gridRef.current.api.exportDataAsExcel({
            fileName,
        });
    }, [selectedFactory]);

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

    const convertStageName = (code) => {
        const stage = groupData.find(stage => stage.value === code);
        if (stage) { return stage.label }
        else return code
    }

    const getAllFactory = async () => {
        try {
            const response = await reportApi.getVCNFactory();
            setFactories(response);
            setSelectedFactory(response[0]?.U_FAC || '');
        } catch (error) {
            console.error(error);
            // toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
        }
    }

    const getAllStage = async () => {
        try {
            const response = await reportApi.getStageByDivision('VCN');
            const formattedResponse = response.map(stage => ({
                value: stage.Code,
                label: stage.Name,
                order: stage.U_Order,
            }))
            setGroupData(formattedResponse);
        } catch (error) {
            console.error(error);
            // toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    getAllStage(),
                    getAllFactory()
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error("Đã xảy ra lỗi khi tải dữ liệu.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const allFieldsFilled = (selectedFactory && groupData.length > 0);
        if (allFieldsFilled) {
            getReportData();
        } else {
            console.log("Không thể gọi API vì không đủ thông tin");
        }
    }, [selectedFactory, groupData]);

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
                                    Báo cáo ván công nghiệp
                                </div>
                                <div className="serif text-3xl font-bold">
                                    Báo cáo sản lượng theo lệnh sản xuất
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
                    <div className="bg-white rounded-xl py-2 pb-3">
                        {/* Filter */}
                        <div className="flex flex-col lg:flex-row flex-wrap min-[1649px]:flex-nowrap items-center px-4 mt-1 gap-3">
                            {/* <div className="flex gap-3 w-full lg:w-1/4">
                                <div className="col-span-1 w-full">
                                    <label
                                        htmlFor="indate"
                                        className="block mb-1 text-sm t font-medium text-gray-900 "
                                    >
                                        Từ ngày
                                    </label>
                                    <DatePicker
                                        selected={fromDate}
                                        dateFormat="dd/MM/yyyy"
                                        // locale="vi"
                                        onChange={(date) => {
                                            setFromDate(date);
                                            if (
                                                fromDate &&
                                                toDate &&
                                                selectedFactory
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
                                        Đến ngày
                                    </label>
                                    <DatePicker
                                        selected={toDate}
                                        dateFormat="dd/MM/yyyy"
                                        onChange={(date) => {
                                            setToDate(date);
                                            if (
                                                fromDate &&
                                                toDate &&
                                                selectedFactory
                                            ) {
                                                // getReportData();
                                            }
                                        }}
                                        // showWeekNumbers
                                        showWeekPicker
                                        className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                    />
                                </div>
                            </div> */}

                            <div className="flex flex-col min-[1649px]:pl-3 w-full mb-3">
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
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Content */}
                    {isDataReportLoading ? (
                        <div className="mt-4 bg-[#C2C2CB]  flex items-center justify-center  p-3 px-4 pr-1 rounded-lg ">
                            <div className="dots"></div>
                        </div>
                    ) : (
                        <>
                            {rowData?.length > 0 ? (
                                <div>
                                    <div
                                        className="ag-theme-quartz border-2 border-gray-300 rounded-lg mt-2 h-[calc(100vh-320px)]"
                                        style={{
                                            // height: calc(window.innerHeight - 300),
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
                                            grandTotalRow={"top"}
                                            localeText={localeText}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 bg-[#C2C2CB]  flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
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

export default ProductionOutputByProductionOrderVCN