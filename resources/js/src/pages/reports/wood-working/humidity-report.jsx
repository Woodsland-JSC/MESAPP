import { useEffect, useRef, useState } from "react";
import { danhSachNhaMayCBG } from "../../../api/MasterDataApi";
import Layout from "../../../layouts/layout";
import { IoIosArrowBack } from "react-icons/io";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import { getDataByFactory } from "../../../api/humidity-error.api";
import Loader from "../../../components/Loader";
import { AgGridReact } from "ag-grid-react";

const HumidityReport = () => {
    const navigate = useNavigate();

    const gridRef = useRef();

    const [factories, setFactories] = useState([]);
    const [factory, setFactory] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const getReports = async () => {
        try {
            setLoading(true);
            let res = await getDataByFactory(factory.value);
            setReports(res);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error('Lấy dữ liệu báo cáo có lỗi.');
        }
    }

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        {
            headerName: "Mã sản phẩm",
            field: "ItemCode",
            width: 200,
            suppressHeaderMenuButton: true,
            filter: true,
            rowGroup: true,
        },
        {
            headerName: "Dày",
            field: "CDay",
            width: 200,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Rộng",
            field: "CRong",
            width: 200,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Dài",
            field: "CDai",
            width: 200,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Khối lượng",
            field: "Quantity",
            width: 200,
            valueFormatter: p => Number(p.value).toFixed(5),
            aggFunc: "sum",
            headerComponentParams: { displayName: "Khối lượng" },
        },
        {
            headerName: "Số lượng (T)",
            field: "QuantityT",
            width: 150,
            suppressHeaderMenuButton: true,
            aggFunc: "sum",
            valueFormatter: (params) => {
                return params.value ? params.value.toLocaleString() : "0";
            },
            headerComponentParams: { displayName: "Số lượng (T)" },
        },
        {
            headerName: "Kho đi",
            field: "Warehouse",
            width: 200,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Kho đến",
            field: "ToWarehouse",
            width: 200,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Tổ",
            field: "Team",
            width: 200,
            suppressHeaderMenuButton: true,
            filter: true,
        },
        {
            headerName: "Nhà máy",
            field: "Factory",
            width: 200,
            suppressHeaderMenuButton: true,
            filter: true,
        },
    ]);


    useEffect(() => {
        if (factory) getReports();
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
                        <div className="serif text-xl md:text-4xl font-bold">Báo cáo sẩy ẩm</div>
                        <div className="md:block hidden">
                            {/* {
                                reports.length > 0 && (
                                    <button
                                        onClick={handleExportExcel}
                                        type="button"
                                        className={`mt-0 self-end flex cursor-pointer items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center gap-x-2`}
                                    >
                                        <FaArrowUpRightFromSquare /> Xuất Excel
                                    </button>)
                            } */}
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
                                className="w-full mt-2 cursor-pointer"
                                onChange={(factory) => {
                                    setFactory({ ...factory });
                                }}
                            />
                        </div>
                    </div>

                    <>
                        {reports?.length > 0 ? (
                            <div>
                                <div
                                    className="ag-theme-quartz border-2 border-gray-300 rounded-lg mt-2 "
                                    style={{
                                        height: 630,
                                        fontSize: 16,
                                        lineHeight: 1.5,
                                    }}
                                    id="app-ag-grid"
                                >
                                    <AgGridReact
                                        ref={gridRef}
                                        rowData={reports}
                                        columnDefs={colDefs}
                                        groupDisplayType={"multipleColumns"}
                                        grandTotalRow={"bottom"}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                                Không có dữ liệu để hiển thị.
                            </div>
                        )}
                    </>
                </div>
            </div>
            {loading && <Loader></Loader>}
        </Layout>
    )
}

export default HumidityReport;