import { IoIosArrowBack } from "react-icons/io";
import { CiExport } from "react-icons/ci";
import Layout from "../../../layouts/layout";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { getFirstDayOfCurrentMonth } from "../../../utils/date.utils";
import { danhSachNhaMayCBG } from "../../../api/MasterDataApi";
import toast from "react-hot-toast";
import { getLogsByFactory } from "../../../api/pallet-log.api";
import moment from "moment/moment";
import { FaArrowDown, FaArrowUpRightFromSquare, FaCheck } from "react-icons/fa6";
import LoadingUI from "../../../components/loading/Loading";
import { AgGridReact } from "ag-grid-react";
import AG_GRID_LOCALE_VI from '../../../utils/locale.vi';

const BaoCaoDieuChuyenPallet = () => {
    const navigate = useNavigate();

    const gridRef = useRef();

    const [factories, setFactories] = useState([]);
    const [factory, setFactory] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filter, setFilter] = useState({
        fromDate: getFirstDayOfCurrentMonth(),
        toDate: new Date(),
    });

    const getFactories = async () => {
        try {
            let res = await danhSachNhaMayCBG();
            let options = [];
            res.data.factories.forEach(item => {
                options.push({
                    label: item.Name,
                    value: item.U_FAC
                })
            })
            setFactories(options);
        } catch (error) {
            toast.error('Lấy danh sách nhà máy có lỗi.');
        }
    }

    const getReportPallets = async () => {
        if (!factory) return;
        try {
            setLoading(true)
            let res = await getLogsByFactory({
                factory: factory.value,
                fromDate: moment(new Date(filter.fromDate)).format('yyyy-MM-DD'),
                toDate: moment(new Date(filter.toDate)).format('yyyy-MM-DD')
            });
            setReports(res.reports);
            setLoading(false)
        } catch (error) {
            setLoading(false)
        }
    }

    const getRowStyle = (params) => {
        if (params.node.rowIndex % 2 === 0) {
            return { background: "#F6F6F6" };
        }
        return { background: "#ffffff" };
    };

    const [colDefs] = useState([
        {
            headerName: "Lò điều chuyển",
            field: "old_oven",
            filter: true,
            width: 150,
            rowGroup: true,
            enableRowGroup: true,
            hide: true,
            sort: "asc",
            pinned: "left",
        },
        {
            headerName: "Lò nhận",
            field: "new_oven",
            filter: true,
            width: 150,
        },
        {
            headerName: "Quy cách",
            field: "QuyCach",
            filter: true,
            width: 150,
        },
        {
            headerName: "Mã KH điều chuyển",
            field: "OldPlanCode",
            filter: true,
            width: 200,
        },
        {
            headerName: "Mã KH nhận",
            field: "NewPlanCode",
            filter: true,
            width: 150,
        },
        {
            headerName: "Ngày điều chuyển",
            field: "created_at",
            valueFormatter: param => {
                if (param.node.id == 'rowGroupFooter_ROOT_NODE_ID' || param.node.group) return "";
                return moment(param.value).format('DD/MM/YYYY hh:mm:ss')
            },
            width: 170
        },
        {
            headerName: "Người thao tác",
            field: "username",
            filter: true,
            width: 150,
            valueGetter: (params) => {
                if (params.node.id == 'rowGroupFooter_ROOT_NODE_ID' || params.node.group) return "";
                return `${params?.data?.username}_${params?.data?.first_name} ${params?.data?.last_name}`
            },

        },
        {
            headerName: "Ghi chú",
            field: "log_data",
            filter: true,
            minWidth: 150,
            flex: 1
        },
    ]);

    const handleExportExcel = () => {
        const fileName = `Báo cáo điều chuyển pallet ${factory.value}.xlsx`;

        gridRef.current.api.exportDataAsExcel({
            fileName,
        });
    }

    useEffect(() => {
        getReportPallets();
    }, [factory])

    useEffect(() => {
        getFactories();
    }, [])

    return (
        <Layout>
            <div className="flex justify-center bg-transparent ">
                <div className="w-screen p-6 px-5 xl:p-12 xl:px-20 xl:pt-6 lg:pt-6 md:pt-6 pt-2 border-t border-gray-200">
                    <div className="flex items-top justify-between">
                        <div
                            className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B]"
                            onClick={() => navigate(`/reports?tab=wood-drying`)}
                        >
                            <IoIosArrowBack />
                            <div>Quay lại</div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="flex space-x-4 mb-4 justify-between">
                        <div className="serif text-xl md:text-4xl font-bold">Báo cáo Điều chuyển Pallet</div>
                        <div className="md:block hidden">
                            {
                                reports.length > 0 && (
                                    <button
                                        onClick={handleExportExcel}
                                        type="button"
                                        className={`mt-0 self-end flex cursor-pointer items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center gap-x-2`}
                                    >
                                        <FaArrowUpRightFromSquare /> Xuất Excel
                                    </button>)
                            }
                        </div>
                    </div>


                    <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col xl:space-x-4 lg:space-x-4 md:space-x-4 space-x-0 bg-white p-4 pt-3 rounded-xl mb-4 gap-x-2 gap-y-2 items-center">
                        <div className="md:w-1/3 w-full">
                            <label className=" text-sm font-medium text-gray-900">
                                Nhà máy
                            </label>
                            <Select
                                options={factories}
                                placeholder="Chọn nhà máy"
                                className="w-full mt-2"
                                onChange={(factory) => {
                                    setFactory(factory);
                                }}
                            />
                        </div>
                        <div className="md:w-2/3 w-full">
                            <div className="flex gap-x-3">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-900">
                                        Từ ngày
                                    </label>
                                    <DatePicker
                                        selected={filter.fromDate}
                                        dateFormat="dd/MM/yyyy"
                                        onChange={(date) => {
                                            setFilter(pre => ({ ...pre, fromDate: date }));
                                        }}
                                        className="mt-2 border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-900 ">
                                        Đến ngày
                                    </label>
                                    <DatePicker
                                        selected={filter.toDate}
                                        dateFormat="dd/MM/yyyy"
                                        onChange={(date) => {
                                            setFilter(pre => ({ ...pre, toDate: date }));
                                        }}
                                        className="mt-2 border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {
                        loading ? <LoadingUI /> : (
                            reports.length > 0 ? (
                                <>
                                    <div className="xl:display:block lg:block md:block hidden">
                                        <div
                                            className="ag-theme-quartz border-2 border-gray-300 rounded-lg mt-2"
                                            style={{
                                                height: 630,
                                                fontSize: 16,
                                            }}
                                            id="app-ag-grid"
                                        >
                                            <AgGridReact
                                                ref={gridRef}
                                                rowData={reports}
                                                columnDefs={colDefs}
                                                groupDisplayType={"multipleColumns"}
                                                getRowStyle={getRowStyle}
                                                // grandTotalRow={"bottom"}
                                                localeText={AG_GRID_LOCALE_VI}
                                            />
                                        </div>
                                    </div>

                                    <div className="xl:display:hidden lg:hidden md:hidden sm:block block mt-3 ">
                                        {
                                            reports.map((report, i) => (
                                                <div className="flex bg-gray-50 border-2 border-[#84b0c5] rounded-xl p-4 mt-4" key={i}>
                                                    <div className="flex-col w-full">
                                                        <div className="text-xl font-semibold text-[#17506B] mb-1">
                                                            {report.Code}
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Quy cách: </span>
                                                            <span className="font-normal">
                                                                {report.QuyCach}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Ghi chú: </span>
                                                            <span className="font-normal">
                                                                {report.log_data}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Ngày điều chuyển: </span>
                                                            <span className="font-normal">
                                                                {moment(report.created_at).format(`DD/MM/YYYY HH:mm:ss`)}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Người thao tác: </span>
                                                            <span className="font-normal">
                                                                {report.username}_{report.first_name} {report.last_name}
                                                            </span>
                                                        </div>


                                                        <div className="mt-3 flex items-center w-full pl-3 ">
                                                            <div className="space-y-3 border-l-2 border-dashed border-gray-400 w-full">
                                                                <div className="relative w-full">
                                                                    <FaArrowDown className="absolute -top-0.5 -ml-3.5 h-6 w-6 rounded-full text-white bg-blue-600 p-1" />
                                                                    <div className="ml-6 p-4 py-2 rounded-xl bg-gray-200">
                                                                        <div className="flex-col  ">
                                                                            <div className="font-medium text-[15px]">
                                                                                Lò điều chuyển
                                                                            </div>
                                                                            <div className="font-semibold text-[17px] text-[#1B536E]">
                                                                                {
                                                                                    report.old_oven
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-col  ">
                                                                            <div className="font-medium text-[15px]">
                                                                                Mã kế hoạch sấy
                                                                            </div>
                                                                            <div className="font-semibold text-[17px] text-[#1B536E]">
                                                                                {
                                                                                    report.OldPlanCode
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="relative w-full ">
                                                                    <FaCheck className="absolute -top-0.5 -ml-3.5 h-6 w-6 rounded-full text-white bg-green-500 p-1" />
                                                                    <div className="ml-6 p-4 py-2 rounded-xl bg-gray-200">
                                                                        <div className="flex-col ">
                                                                            <div className="font-medium text-[15px]">
                                                                                Lò nhận
                                                                            </div>
                                                                            <div className="font-semibold text-[17px] text-[#1B536E]">
                                                                                {
                                                                                    report.new_oven
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-col  ">
                                                                            <div className="font-medium text-[15px]">
                                                                                Mã kế hoạch sấy mới
                                                                            </div>
                                                                            <div className="font-semibold text-[17px] text-[#1B536E]">
                                                                                {
                                                                                    report.NewPlanCode
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </>
                            ) : (
                                (reports.length == 0 && factory) && (
                                    <div className="mt-4 bg-[#C2C2CB] items-center justify-center text-center p-2 px-4 pr-1 rounded-lg w-full">
                                        Không có dữ liệu để hiển thị.
                                    </div>
                                )
                            )
                        )
                    }
                </div>
            </div>
        </Layout>
    )
}

export default BaoCaoDieuChuyenPallet;