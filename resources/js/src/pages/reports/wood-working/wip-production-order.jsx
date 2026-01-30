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
import Select from "react-select";
import productionApi from "../../../api/productionApi";
import usersApi from "../../../api/userApi";

function WipProductionOrderReport() {
    const navigate = useNavigate();

    const { user } = useAppContext();
    const gridRef = useRef();
    const [keyword, setKeyword] = useState("");
    const [factories, setFactories] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [groupListOptions, setGroupListOptions] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [groupList, setGroupList] = useState([]);
    const [data, setData] = useState([]);

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
            field: 'NameSPDich',
            headerName: 'Tên sản phẩm',
            rowGroup: true,
            filter: true
        },
        {
            field: 'ChildName',
            headerName: 'Chi tiết',
            filter: true
        },
        {
            field: 'NameTOTT',
            headerName: 'Công đoạn',
            filter: true
        },
        {
            field: 'LSX',
            headerName: 'Lệnh sản xuất',
            filter: true
        },
        {
            headerName: 'Quy cách',
            children: [
                { field: 'CDay', headerName: 'Dày', filter: true },
                { field: 'CRong', headerName: 'Rộng', filter: true },
                { field: 'CDai', headerName: 'Dài', filter: true },
            ]
        },
        {
            field: 'SanLuong',
            headerName: 'Sản lượng',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                return params.value ? Number(params.value).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) : 0
            }
        },
        {
            field: 'DaLam',
            headerName: 'Đã làm',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                return params.value ? Number(params.value).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) : 0
            }
        },
        {
            field: 'Loi',
            headerName: 'Lỗi',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                return params.value ? Number(params.value).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) : 0
            }
        },
        {
            field: 'ConLai',
            headerName: 'Còn lại',
            aggFunc: 'sum',
            valueFormatter: (params) => {
                return params.value ? Number(params.value).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }) : 0
            }
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

    const getDataFollowingGroup = async () => {
        setLoadingData(true);
        try {
            let params = {
                TO: selectedGroup?.value,
                CongDoan: selectedGroup?.CongDoan,
            }
            const res = await productionApi.getFinishedGoodsList(params);
            if (typeof res?.data === "object") {
                let data = [];
                Object.values(res.data).forEach(item => {
                    item?.Details.forEach(detail => {
                        detail?.LSX.forEach(lsx => {
                            data.push({
                                SPDICH: item.SPDICH,
                                NameSPDich: item.NameSPDich,
                                ItemChild: detail.ItemChild,
                                ChildName: detail.ChildName,
                                CDay: detail.CDay,
                                CRong: detail.CRong,
                                CDai: detail.CDai,
                                LSX: lsx.LSX,
                                SanLuong: Number(lsx.SanLuong),
                                DaLam: Number(lsx.DaLam),
                                Loi: Number(lsx.Loi),
                                ConLai: Number(lsx.ConLai),
                                TO: detail.TO,
                                NameTo: detail.NameTo,
                                TOTT: detail.TOTT,
                                NameTOTT: detail.NameTOTT
                            });
                        });
                    });
                })
                setData(data);
            } else {
                setData([]);
            }
        } catch (error) {
            console.log("Error fetching data: ", error);

            toast.error("Có lỗi trong quá trình lấy dữ liệu.");
        }
        setLoadingData(false);
    };

    useEffect(() => {
        if (selectedGroup) {
            const isQC = groupList.find(
                (group) => group.Code == selectedGroup.value
            )?.QC;
            if (!isQC) {
                getDataFollowingGroup();
            }
        }
    }, [selectedGroup]);

    useEffect(() => {
        const selectedBranch = user?.branch;
        const selectedDimension = "CBG";

        const getFactoriesByBranchId = async () => {
            try {
                if (selectedBranch) {
                    setFactories([]);
                    const res = await usersApi.getFactoriesByBranchId(
                        selectedBranch, selectedDimension
                    );

                    const options = res.map((item) => ({
                        value: item.Code,
                        label: item.Name,
                    }));

                    setFactories(options);
                } else {
                    setFactories([]);
                }
            } catch (error) {
                console.error(error);
            }
        };
        getFactoriesByBranchId();
    }, []);

    useEffect(() => {
        const getAllGroupWithoutQC = async () => {
            const KHOI = "CBG";
            const factory = selectedFactory?.value || user?.plant;
            setLoading(true);
            try {
                const res = await productionApi.getAllGroupWithoutQC(factory, KHOI);
                const options = res.map((item) => ({
                    value: item.Code,
                    label: item.Name + " - " + item.Code,
                    CongDoan: item.CongDoan,
                    Factory: item.Factory,
                }));
                setGroupList(res);

                options.sort((a, b) => a.label.localeCompare(b.label));
                setGroupListOptions(options);
            } catch (error) {
                toast.error("Có lỗi xảy ra khi load danh sách tổ.");
                console.error(error);
            }
            setLoading(false);
        };
        getAllGroupWithoutQC();
    }, [selectedFactory]);


    return (
        <Layout>
            <div className="">
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

                    <div className="border-2 border-gray-300 bg-white rounded-xl py-2 pb-3">
                        <div className="flex flex-col lg:flex-row flex-wrap 2xl:flex-nowrap items-center px-4 mt-1 gap-3">
                            <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col xl:space-x-3 lg:space-x-3 md:space-x-3 space-x-0 w-full">
                                {(user.role == 1) && (<div className="px-0 w-full">
                                    <div className="block xl:text-md lg:text-md md:text-md text-sm font-medium text-gray-900 ">
                                        Nhà máy sản xuất
                                    </div>
                                    <Select
                                        options={factories}
                                        defaultValue={factories}
                                        onChange={(value) => {
                                            setSelectedFactory(value);
                                            console.log("Selected factory: ", value);
                                        }}
                                        placeholder="Tìm kiếm"
                                        className="mt-1 mb-3 w-full"
                                    />
                                </div>)}

                                <div className="px-0 w-full">
                                    <div className="block xl:text-md lg:text-md md:text-md text-sm font-medium text-gray-900 ">
                                        Tổ & Xưởng sản xuất
                                    </div>
                                    <Select
                                        options={groupListOptions}
                                        defaultValue={selectedGroup}
                                        onChange={(value) => {
                                            setSelectedGroup(value);
                                            console.log("Selected group: ", value);
                                        }}
                                        placeholder="Tìm kiếm theo tổ"
                                        className="mt-1 mb-4 w-full "
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {loadingData ? (
                        <div className="mt-2 bg-[#dbdcdd] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                            <div class="dots"></div>
                        </div>
                    ) : (
                        <>
                            {data?.length > 0 ? (
                                <div>
                                    <div
                                        className="ag-theme-quartz border-2 border-gray-300 rounded-lg mt-2 "
                                        style={{
                                            height: 630,
                                            fontSize: 16,
                                        }}
                                        id="app-ag-grid"
                                    >
                                        <AgGridReact
                                            ref={gridRef}
                                            rowData={data}
                                            columnDefs={colDefs}
                                            autoGroupColumnDef={{
                                                headerName: 'Sản phẩm đích'
                                            }}
                                            rowGroupPanelShow={"always"}
                                            // groupDisplayType="groupRows"
                                            animateRows={true}
                                            suppressAggFuncInHeader
                                            getRowStyle={getRowStyle}
                                            excelStyles={excelStyles}
                                            grandTotalRow="bottom"
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