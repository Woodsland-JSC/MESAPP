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

function FactoryTransfer() {
    const navigate = useNavigate();

    const { user } = useAppContext();
    const gridRef = useRef();
    const abortControllerRef = useRef(null);

    const getFirstDayOfCurrentMonth = () => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const [loading, setLoading] = useState(true);
    const [groupData, setGroupData] = useState([{
        value: "All",
        label: "Tất cả"
    },
    {
        value: "LP",
        label: "Lựa phôi"
    },
    {
        value: "SC",
        label: "Sơ chế"
    },
    {
        value: "TC",
        label: "Tinh chế"
    },
    {
        value: "HT",
        label: "Hoàn thiện"
    },
    {
        value: "DG",
        label: "Đóng gói"
    }]);
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
                field: "ItemCode",
                headerName: "Mã chi tiết/sản phẩm",
                width: 250,
                filter: true,
                suppressHeaderMenuButton: true,
                enableRowGroup: true,
                hide: false,
            },
            {
                headerName: "Tên chi tiết/sản phẩm",
                field: "ItemName",
                width: 350,
                suppressHeaderMenuButton: true,
                filter: true,
            },
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
                headerName: "Ngày điều chuyển",
                field: "DocDate",
                enableRowGroup: true,
                filter: true,
                width: 200,
                suppressHeaderMenuButton: true,
                hide: false,
                valueFormatter: (params) => {
                    if (params.value)
                        return format(parseISO(params.value), 'dd/MM/yyyy')
                },
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "center", backgroundColor: "#B9E0F6" }
                        : { textAlign: "center" },
            },
            {
                headerName: "Số lượng",
                field: "Quantity",
                filter: true,
                width: 150,
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
                headerName: "M3 sản phẩm",
                field: "M3SP",
                filter: true,
                width: 150,
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
                headerName: "Từ kho",
                field: 'FromWarehouse',
                enableRowGroup: true,
                filter: true,
                width: 250,
                suppressHeaderMenuButton: true,
                hide: false,
                // valueGetter: (params) => {
                //     const code = params.data?.FromWhsCode || '';
                //     const name = params.data?.FromWhsName || '';
                //     return `${code} - ${name}`;
                // },
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "left", backgroundColor: "#B9E0F6" }
                        : { textAlign: "left" },
            },
            {
                headerName: "Từ nhà máy",
                filter: true,
                width: 250,
                suppressHeaderMenuButton: true,
                valueGetter: (params) => {
                    const code = params.data?.FromFacCode || '';
                    const name = params.data?.FromFacName || '';
                    return `${code} - ${name}`;
                },
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "left", backgroundColor: "#B9E0F6" }
                        : { textAlign: "left" },
            },
            {
                headerName: "Đến kho",
                field: 'ToWarehouse',
                enableRowGroup: true,
                filter: true,
                width: 250,
                suppressHeaderMenuButton: true,
                hide: false,
                // valueGetter: (params) => {
                //     const code = params.data?.ToWhsCode || '';
                //     const name = params.data?.ToWhsName || '';
                //     return `${code} - ${name}`;
                // },
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "left", backgroundColor: "#B9E0F6" }
                        : { textAlign: "left" },
            },
            {
                headerName: "Đến nhà máy",
                filter: true,
                width: 250,
                suppressHeaderMenuButton: true,
                valueGetter: (params) => {
                    const code = params.data?.ToFacCode || '';
                    const name = params.data?.ToFacName || '';
                    return `${code} - ${name}`;
                },
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "left", backgroundColor: "#B9E0F6" }
                        : { textAlign: "left" },
            },
            {
                headerName: "Tổ nhận",
                field: "To",
                filter: true,
                width: 250,
                suppressHeaderMenuButton: true,
                cellStyle: (params) =>
                    params.node.rowPinned
                        ? { fontWeight: "bold", textAlign: "left", backgroundColor: "#B9E0F6" }
                        : { textAlign: "left" },
            }
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

    function processDataForGrouping(originalData) {
        const groupedData = [];
        const groupMap = new Map();

        originalData.forEach(row => {
            const groupKey = `${row.ItemCode}_${row.DocDate}_${row.FromWhsCode}_${row.ToWhsCode}`;

            if (groupMap.has(groupKey)) {
                const existingGroup = groupMap.get(groupKey);
                existingGroup.Quantity += row.Quantity;
            } else {
                const newGroup = { ...row };
                groupMap.set(groupKey, newGroup);
                groupedData.push(newGroup);
            }
        });

        return groupedData;
    }

    const getReportData = async () => {
        if (!fromDate && !toDate) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;

        let params = {
            fromDate: format(fromDate, "yyyy-MM-dd"),
            toDate: format(toDate, "yyyy-MM-dd"),
        };

        setIsDataReportLoading(true);

        try {
            let res = await reportApi.getFactoryTransfer(
                params.fromDate,
                params.toDate,
                { signal }
            );

            setReportData(res);

            // if (selectedFactory !== 'All') {
            //     res = res.filter(data => data.U_FAC === selectedFactory);
            //     if (!selectedGroup.some(group => group.value === 'All')) {
            //         res = res.filter(data => selectedGroup.some(group => group === data.U_To));
            //     }
            // }

            const formattedData = res.map((item) => {
                return {
                    ItemCode: item.ItemCode,
                    ItemName: item.ItemName,
                    length: item.U_CDai,
                    width: item.U_CRong,
                    thickness: item.U_CDay,
                    DocDate: item.DocDate,
                    Quantity: Number(item.Quantity),
                    M3SP: Number(item.M3SP),
                    FromFacCode: item.FromFacCode,
                    FromFacName: item.FromFacName,
                    FromWhsCode: item.FromWhsCode,
                    FromWhsName: item.FromWhsName,
                    FromWarehouse: `${item.FromWhsCode || ''} - ${item.FromWhsName || ''}`,
                    ToFacCode: item.ToFacCode,
                    ToFacName: item.ToFacName,
                    ToWhsCode: item.ToWhsCode,
                    ToWhsName: item.ToWhsName,
                    ToWarehouse: `${item.ToWhsCode || ''} - ${item.ToWhsName || ''}`,
                    To: item.To,
                }
            });

            setRowData(processDataForGrouping(formattedData));
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

    // DONE
    const handleGroupSelect = async (group) => {
        let currentGroups;
        if (group == "All") {
            if (selectedGroup?.length < groupData?.length) {
                currentGroups = [
                    ...groupData.map(group => group.value)
                ];
                setSelectedGroup(currentGroups)
            } else {
                currentGroups = []
                setSelectedGroup([])
            }
        } else {
            const exists = selectedGroup.includes(group);

            if (exists) {
                currentGroups = selectedGroup.filter((w) => (w !== group) && (w !== "All"));
            } else {
                const newValue = [...selectedGroup.filter((w) => w !== "All"), group]
                if (newValue.length == groupData.length - 1) {
                    currentGroups = [
                        ...groupData.map(group => group.value)
                    ]
                } else currentGroups = newValue;
            }

            setSelectedGroup(currentGroups);
        }

        let res = [...reportData];

        if (selectedFactory !== 'All') {
            res = reportData.filter(data => data.U_FAC === selectedFactory);
            if (!currentGroups.some(group => group.value === 'All')) {
                res = res.filter(data => currentGroups.some(group => group === data.U_To));
            }
        }

        let formattedData;


        formattedData = aggregateItemsByDay(res);
        formattedData = formattedData?.map((item) => ({
            factory: item.U_FAC,
            stage: convertStageName(item.U_CDOAN),
            targetProduct: item.NameSPdich,
            productCode: item.ItemCode,
            group_name: item.U_To,
            year: item.Years,
            week: item.WEEK,
            weekday: "Thứ 6",
            itemname: item.ItemName,
            category: item.CHUNGLOAI,
            thickness: item.U_CDay,
            width: item.U_CRong,
            length: item.U_CDai,
            unit: "Tấm",
            quantity: Number(item.SLThanh),
            volume: Number(item.M3)
        }));

        setRowData(formattedData);
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

    const GroupOption = ({ value, label }) => (
        <div
            className={`group hover:border-[#86ABBE] hover:bg-[#eaf8ff] flex items-center justify-center space-x-2 text-base text-center rounded-md border-2 p-1.5 px-3 pl-0 w-full cursor-pointer active:scale-[.92] active:duration-75 transition-all ${selectedGroup?.includes(value)
                ? "border-[#86ABBE] bg-[#eaf8ff]"
                : "border-gray-300"
                }`}
            onClick={() => handleGroupSelect(value)}
        >
            {selectedGroup?.includes(value) ? (
                <IoMdCheckbox className="w-5 h-6 text-[#17506B]" />
            ) : (
                <IoMdSquareOutline className="w-5 h-6 text-gray-400 group-hover:text-[#17506B]" />
            )}
            <div
                className={`${selectedGroup.includes(value)
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
        const formatDate = (date) => {
            if (!date) return '';
            try {
                const parsedDate = typeof date === 'string' ? parseISO(date) : date;
                return format(parsedDate, 'dd-MM-yyyy'); // Format to DD-MM-YYYY
            } catch (error) {
                return '';
            }
        };

        const from = formatDate(fromDate);
        const to = formatDate(toDate);
        const fileName = `Báo cáo điều chuyển các nhà máy_${from}_đến_${to}.xlsx`;

        gridRef.current.api.exportDataAsExcel({
            fileName,
        });
    }, [fromDate, toDate, selectedFactory]);

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

    const generateRandomData = (length, min, max) => {
        return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    };

    const convertStageName = (code) => {
        switch (code) {
            case 'LP':
                return 'Lựa phôi';
            case 'SC':
                return 'Sơ chế';
            case 'TC':
                return 'Tinh chế';
            case 'HT':
                return 'Hoàn thiện';
            case 'DG':
                return 'Đóng gói';
            case 'BTP':
                return 'Bán thành phẩm';
            case 'TP':
                return 'Thành phẩm';
            default:
                return code
        }
    }

    const getAllFactory = async () => {
        try {
            const response = await reportApi.getCBGFactory();
            // response.unshift({
            //     U_FAC: 'All',
            //     Name: 'Tất cả'
            // })
            // const response = await axios.get('/api/factories');
            setFactories(response);
            setSelectedFactory(response[0]?.U_FAC || '');
        } catch (error) {
            console.error(error);
            toast.error("Đã xảy ra lỗi khi lấy dữ liệu.");
        } finally {
            setLoading(false);
        }
    }

    // Tính tổng M3
    const totalM3 = useMemo(
        () => rowData.reduce((sum, r) => sum + (r.M3SP || 0), 0),
        [rowData]
    );

    const totalQty = useMemo(
        () => rowData.reduce((sum, r) => sum + (r.Quantity || 0), 0),
        [rowData]
    );

    useEffect(() => {
        getAllFactory();
    }, [])

    useEffect(() => {
        const allFieldsFilled = (fromDate && toDate && selectedFactory);
        if (allFieldsFilled) {
            getReportData();
        } else {
            console.log("Không thể gọi API vì không đủ thông tin");
        }
    }, [fromDate, toDate, selectedFactory]);

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
                                <div className="serif text-3xl font-bold">
                                    Báo cáo điều chuyển các nhà máy
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
                    <div className=" bg-white rounded-xl py-2 pb-3">
                        {/* Filter */}
                        <div className="flex flex-col lg:flex-row flex-wrap min-[1649px]:flex-nowrap items-center px-4 mt-1 gap-3">
                            <div className="flex gap-3 w-full lg:w-1/4">
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
                            </div>

                            {/* <div className="flex flex-col min-[1649px]:pl-3 w-full min-[1649px]:border-l-2 lg:border-gray-100 mb-3">
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
                            </div> */}

                        </div>
                        {/* {
                            selectedFactory && selectedFactory !== 'All' && (
                                <div className="flex flex-col lg:flex-row flex-wrap 2xl:flex-nowrap items-center px-4 mt-1 gap-3 mb-3">
                                    <div className="flex flex-col w-full mt-1">
                                        <label
                                            htmlFor="indate"
                                            className="block mb-1 text-sm font-medium whitespace-nowrap text-gray-900"
                                        >
                                            Chọn tổ
                                        </label>
                                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                                            {
                                                groupData && groupData.length > 0 && groupData.map(group => (
                                                    <div className="col-span-1 w-full sm:w-[200px]">
                                                        <GroupOption
                                                            value={group.value}
                                                            label={group.label}
                                                        />
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            )
                        } */}
                    </div>

                    {/* Content */}
                    {isDataReportLoading ? (
                        <div className="mt-4 bg-[#C2C2CB]  flex items-center justify-center p-3 px-4 pr-1 rounded-lg ">
                            <div className="dots"></div>
                        </div>
                    ) : (
                        <>
                            {rowData?.length > 0 ? (
                                <div>
                                    <div
                                        id="ag-grid-baocao-dieuchuyen"
                                        className="ag-theme-quartz border-2 border-gray-300 rounded-lg mt-2 h-[calc(100vh-320px)]"
                                        style={{
                                            // height: calc(window.innerHeight - 300),
                                            fontSize: 14,
                                        }}
                                    >

                                        <AgGridReact
                                            ref={gridRef}
                                            rowData={rowData}
                                            columnDefs={colDefs}
                                            excelStyles={excelStyles}
                                            rowGroupPanelShow={"always"}
                                            getRowStyle={getRowStyle}
                                            localeText={localeText}
                                            groupDefaultExpanded={-1}
                                            groupDisplayType={'multipleColumns'}
                                            onGridReady={(params) => {
                                                const columnsToShow = ['ItemCode', 'DocDate', 'FromWarehouse', 'ToWarehouse'];
                                                columnsToShow.forEach(colId => {
                                                    const column = params.api.getColumn(colId);
                                                    if (column) {
                                                        params.api.setColumnsVisible([colId], true);
                                                    }
                                                });

                                                params.api.refreshCells();
                                            }}
                                            grandTotalRow={"bottom"}
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

export default FactoryTransfer