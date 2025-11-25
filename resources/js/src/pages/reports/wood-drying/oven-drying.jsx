import { useNavigate } from "react-router-dom";
import Layout from "../../../layouts/layout";
import { IoIosArrowBack } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import moment from "moment";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { getFirstDayOfCurrentMonth } from "../../../utils/date.utils";
import Select from 'react-select';
import DatePicker from "react-datepicker";
import { danhSachNhaMayCBG } from "../../../api/MasterDataApi";
import { getOvenIsDrying } from "../../../api/plan-drying.api";
import LoadingUI from "../../../components/loading/Loading";
import { AgGridReact } from "ag-grid-react";
import AG_GRID_LOCALE_VI from '../../../utils/locale.vi';
import toast from "react-hot-toast";
import useAppContext from "../../../store/AppContext";

const OvenDrying = () => {
    const navigate = useNavigate();
    const { user } = useAppContext();
    const gridRef = useRef();

    console.log("user", user);


    const [factories, setFactories] = useState([]);
    const [factory, setFactory] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

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
            });
            setFactories(options);
        } catch (error) {
            toast.error('Lấy danh sách nhà máy có lỗi.');
        }
    }


    const handleExportExcel = () => {
        const fileName = `Báo cáo Pallet ra lò ${factory.value}-${moment(new Date(filter.fromDate)).format('yyyy-MM-DD')}-${moment(new Date(filter.toDate)).format('yyyy-MM-DD')}.xlsx`;
        gridRef.current.api.exportDataAsExcel({
            fileName,
        });
    }

    const getReports = async () => {
        try {
            setLoading(true)
            let res = await getOvenIsDrying(factory ? factory.value : null);
            let reports = res.reports;
            reports.forEach(item => {
                item.TotalPallet = Number(item.TotalPallet)
                item.Mass = Number(item.Mass);
                item.userRunOven = item.user_run_oven ? `${item.user_run_oven.username}_${item.user_run_oven.last_name} ${item.user_run_oven.first_name}` : '';
                item.userCheckOven = item.user_check_oven ? `${item.user_check_oven.username}_${item.user_check_oven.last_name} ${item.user_check_oven.first_name}` : '';
            });
            setReports(reports);
            setLoading(false)
        } catch (error) {
            setLoading(false)
            toast.error('Lấy lò sấy đang hoạt động có lỗi.');
        }
    }

    const [colDefs] = useState([
        {
            headerName: "Mã lò",
            field: "Oven",
            filter: true,
            width: 150,
            // rowGroup: true,
            // enableRowGroup: true,
        },
        {
            headerName: "Kế hoạch sấy",
            field: "Code",
            filter: true,
            width: 150,
        },
        {
            headerName: "Mục đích sấy",
            field: "Reason",
            filter: true,
            width: 150,
        },
        {
            headerName: "Chiều dày sấy",
            field: "Method",
            filter: true,
            width: 150,
        },
        {
            headerName: "Khối lượng",
            field: "Mass",
            filter: true,
            aggFunc: "sum",
            width: 150,
            valueFormatter: (params) => {
                return params.value ? Number(params.value).toFixed(6).toLocaleString() : "0";
            }
        },
        {
            headerName: "Số lượng Pallet",
            field: "TotalPallet",
            width: 150,
            aggFunc: "sum",
            headerComponentParams: { displayName: "Số lượng Pallet" },
        },
        {
            headerName: "MNV",
            field: "MNV",
            width: 150,
            filter: true
        },
        {
            headerName: "Người chạy lò",
            field: "user",
            width: 150,
            filter: true
        },
        {
            headerName: "Ngày chạy lò",
            field: "runDate",
            valueFormatter: (params) => {
                if (params.node.id == 'rowGroupFooter_ROOT_NODE_ID' || params.node.group) return "";
                return params.value ? moment(params.value).format('DD/MM/yyyy HH:mm:ss') : ""
            },
            minWidth: 170,
            flex: 1
        },
    ]);

    const getRowStyle = (params) => {
        if (params.node.rowIndex % 2 === 0) {
            return { background: "#F6F6F6" };
        }
        return { background: "#ffffff" };
    };

    useEffect(() => {
        getReports();
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
                        <div className="serif text-xl md:text-4xl font-bold">Báo cáo các lò đang sấy</div>
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

                    {
                        <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col xl:space-x-4 lg:space-x-4 md:space-x-4 space-x-0 bg-white p-4 pt-3 rounded-xl mb-4 gap-x-2 gap-y-2 items-center">
                            <div className="md:w-1/3 w-full">
                                <label className=" text-sm font-medium text-gray-900">
                                    Nhà máy
                                </label>
                                <Select
                                    options={factories.filter(f => {
                                        console.log(f);
                                        
                                        if(user?.role == 1) return f;
                                        else return f.value == user?.plant
                                    })}
                                    placeholder="Chọn nhà máy"
                                    className="w-full mt-2 cursor-pointer"
                                    onChange={(factory) => {
                                        setFactory({ ...factory });
                                    }}
                                />
                            </div>
                            {/* <div className="md:w-2/3 w-full">
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
                                        className="mt-2 border border-gray-300 text-gray-900 text-base rounded-md block w-full p-1.5"
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
                                        className="mt-2 border border-gray-300 text-gray-900 text-base rounded-md block w-full p-1.5"
                                    />
                                </div>
                            </div>
                        </div> */}
                        </div>
                    }


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
                                                grandTotalRow={"bottom"}
                                                localeText={AG_GRID_LOCALE_VI}
                                            />
                                        </div>
                                    </div>

                                    <div className="xl:display:hidden lg:hidden md:hidden sm:block block mt-3 ">
                                        <div className="w-full">
                                            <label
                                                htmlFor="search"
                                                className="mb-2 font-medium text-gray-900 sr-only"
                                            >
                                                Tìm kiếm
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <svg
                                                        className="w-4 h-4 text-gray-500"
                                                        aria-hidden="true"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            stroke="currentColor"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                                        />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="search"
                                                    id="search"
                                                    className="block w-full p-2 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Tìm theo mã lò"
                                                    onChange={e => setSearch(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        {
                                            reports.filter(report => {
                                                if (search == "") {
                                                    return report
                                                } else {
                                                    return report.Oven.includes(search.toUpperCase())
                                                }
                                            }).map((report, i) => (
                                                <div className="flex bg-gray-50 border-2 border-[#84b0c5] rounded-xl p-4 mt-4" key={i}>
                                                    <div className="flex-col w-full">
                                                        <div className="text-xl font-semibold text-[#17506B] mb-1">
                                                            {report.Oven}
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Mã lò: </span>
                                                            <span className="font-normal">
                                                                {report.Oven}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Kế hoạch sấy: </span>
                                                            <span className="font-normal">
                                                                {report.Code}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Mục đích sấy: </span>
                                                            <span className="font-normal">
                                                                {report.Reason}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Chiều dày sấy: </span>
                                                            <span className="font-normal">
                                                                {report.Method}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Tổng khối lượng: </span>
                                                            <span className="font-normal">
                                                                {report.Mass}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Tổng Pallet: </span>
                                                            <span className="font-normal">
                                                                {report.TotalPallet}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Ngày chạy lò: </span>
                                                            <span className="font-normal">
                                                                {report.runDate ? moment(report.runDate).format(`DD/MM/YYYY HH:mm:ss`) : ''}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Người chạy lò: </span>
                                                            <span className="font-normal">
                                                                {report.userRunOven ? report.userRunOven : ''}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 font-semibold mb-2">
                                                            <span>Người đánh giá: </span>
                                                            <span className="font-normal">
                                                                {report.userCheckOven ? report.userCheckOven : ''}
                                                            </span>
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

export default OvenDrying;