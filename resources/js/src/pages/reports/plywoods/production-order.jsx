import { FaArrowLeft } from "react-icons/fa6";
import Layout from "../../../layouts/layout";
import { useNavigate } from "react-router-dom";
import ProductionOrderApi from "../../../api/productionOrderApi";
import { useEffect, useRef, useState } from "react";
import Select from 'react-select'
import toast from "react-hot-toast";
import logo from "../../../assets/images/WLorigin.svg";
import moment from "moment/moment";
import { Spinner } from "@chakra-ui/react";


const ProductionOrder = () => {
    const navigate = useNavigate();

    const [productionOrders, setProductionOrders] = useState([]);
    const [productionOrderOptions, setProductionOrderOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isExporting, setIsExport] = useState(false);
    const [productionOrderDetail, setProductionDetail] = useState([]);
    const [productionSelected, setProductionSelected] = useState(null);

    const exportPdf = useRef()

    const getProductionOrder = async () => {
        try {
            let res = await ProductionOrderApi.getProductionOrders();
            setProductionOrders(res);

            let options = [];

            res.forEach((item) => {
                let option = {
                    value: item.productionOrderCode,
                    label: item.productionOrderCode
                }
                options.push(option)
            })

            setProductionOrderOptions(options);
        } catch (error) {
            toast.error("Lỗi khi lấy danh sách Lệnh SX", {
                duration: 3000
            })
        }
    }

    const onChangeProductionOrder = async (productionOrderItem) => {
        try {
            let productionOrder = productionOrders.find(item => item.productionOrderCode == productionOrderItem.value)
            if (productionOrder) {
                setLoading(true);
                setProductionSelected(productionOrder);

                let res = await ProductionOrderApi.getProductionOrderDetail(productionOrderItem.value);
                setProductionDetail(res)
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            toast.error("Lỗi lấy dữ liệu chi tiết của LSX", {
                duration: 3000
            })
        }
    }

    const exportPDF = async () => {
        window.print()
    }

    useEffect(() => {
        getProductionOrder();
    }, [])

    return (
        <Layout>
            <div className="">
                <div className="p-6 px-5 xl:p-5 xl:px-12">
                    <div className="flex flex-col tablet:flex-row items-center justify-between gap-3 mb-3.5">
                        <div className="flex w-full tablet:w-auto items-center space-x-4">
                            <div
                                className="p-2 hover:bg-gray-200 rounded-full cursor-pointer active:scale-[.87] active:duration-75 transition-all"
                                onClick={() => navigate(-1)}
                            >
                                <FaArrowLeft className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex flex-col mb-0 pb-0">
                                <div className="text-sm text-[#17506B]">
                                    Báo cáo lệnh sản xuất
                                </div>
                                <div className="serif text-3xl font-bold">
                                    Báo cáo lệnh sản xuất
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl py-2 pb-3">
                        <div className="flex flex-col lg:flex-row flex-wrap min-[1649px]:flex-nowrap items-center px-4 mt-1 gap-3">
                            <div className="w-full mb-3">
                                <div>
                                    <label className="block mb-1 text-sm font-medium whitespace-nowrap text-gray-900">
                                        Chọn Lệnh sản xuất
                                    </label>
                                </div>
                                <div className="flex justify-between">
                                    <div className="w-1/4">
                                        <Select
                                            id="production-order-select"
                                            placeholder="Chọn Lệnh sản xuất"
                                            options={productionOrderOptions}
                                            onChange={(item) => onChangeProductionOrder(item)}
                                            className=""
                                        />
                                    </div>
                                    <div>
                                        {
                                            (productionSelected && productionOrderDetail.length > 0) && (
                                                <button
                                                    type="button"
                                                    onClick={() => exportPDF()}
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
                                            )
                                        }
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center p-3 px-4 pr-1 rounded-lg ">
                            {/* <div>Đang tải dữ liệu</div> */}
                            <div class="dots"></div>
                        </div>
                    ) : (
                        <>
                            {(productionSelected && productionOrderDetail.length > 0) && (
                                <div id="pdf-content" ref={exportPdf} className="serif w-full mt-4 bg-[#ffffff] p-8 rounded-xl box-border">
                                    <div className="mb-3">
                                        <table className="w-full border-2 border-gray-400 border-collapse table-fixed">
                                            <thead class="font-bold">
                                                <tr>
                                                    <td className="border border-gray-400 w-[150px] break-words p-2" rowSpan={3}>
                                                        <img src={logo} alt="Logo" className="mx-auto flex items-center justify-center w-24 h-24" />
                                                    </td>
                                                    <td className="border border-gray-400 w-[950px] text-center break-words p-2" rowSpan={1}>
                                                        <strong>QUY TRÌNH KHỞI ĐỘNG SẢN PHẨM</strong>
                                                    </td>
                                                    <td className="border border-gray-400 w-[300px] px-2 break-words p-2" rowSpan={3}>
                                                        Số LSX: &nbsp;{productionSelected?.productionOrderCode ?? "-"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td rowSpan={2} className="text-center">
                                                        LỆNH SẢN XUẤT <br /> KIỂM PHIÊU XUẤT KHO NGUYÊN LIỆU - VẬT TƯ
                                                    </td>
                                                </tr>
                                            </thead>
                                            <tr>
                                                <td colSpan={2} className="border border-gray-400 text-center break-words p-2 w-full">
                                                </td>
                                                <td colSpan={1} className="border border-gray-400 text-left font-bold px-2 break-words p-2 w-full">
                                                    Ngày viết: {moment(new Date()).format("DD/MM/YYYY")}
                                                </td>
                                            </tr>
                                        </table>
                                    </div>

                                    <div>
                                        <div>
                                            <strong>I. NGUYÊN LIỆU - VẬT TƯ</strong>
                                        </div>
                                        <div className="mt-3">
                                            <table className="w-full border-2 border-gray-400 border-collapse table-fixed">
                                                <tr>
                                                    <td className="border border-gray-400 h-[48px] text-center font-bold w-[150px] break-words p-1">
                                                        Nhóm
                                                    </td>
                                                    <td className="border border-gray-400 h-[48px] text-center font-bold w-[600px] break-words p-1">
                                                        Tên NL, VT
                                                    </td>
                                                    <td className="border border-gray-400 h-[48px] text-center font-bold w-[250px] break-words p-1">
                                                        Quy cách(mm)
                                                    </td>
                                                    <td className="border border-gray-400 h-[48px] text-center font-bold w-[200px] break-words p-1">
                                                        ĐVT
                                                    </td>
                                                    <td className="border border-gray-400 h-[48px] text-center font-bold w-[200px] break-words p-1">
                                                        SL
                                                    </td>
                                                </tr>
                                                {
                                                    productionOrderDetail.map((item, index) => {
                                                        return (
                                                            <tr className="" key={index}>
                                                                <td className="border border-gray-400 text-center break-words p-1">
                                                                    {item.U_CDOAN ?? ""}
                                                                </td>
                                                                <td className="border border-gray-400 text-center break-words p-1 ">
                                                                    {item.ItemName ?? ""}
                                                                </td>
                                                                <td className="border border-gray-400 text-center break-words p-1">
                                                                    {Number(item.U_CDay) ?? ""}x{Number(item.U_CRong) ?? ""}x{Number(item.U_CDai) ?? ""}
                                                                </td>
                                                                <td className="border border-gray-400 text-center break-words p-1">
                                                                    {item.UomCode ?? ""}
                                                                </td>
                                                                <td className="border border-gray-400 text-center break-words p-1">
                                                                    {Number(item.BaseQty) ?? ""}
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </table>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex justify-between">
                                        <div className="w-full flex flex-col justify-center items-center">
                                            <div>Người viết lệnh</div>
                                            <div>
                                                <img src="" alt="Không có chữ ký số" />
                                            </div>
                                        </div>
                                        <div className="w-full flex flex-col justify-center items-center">
                                            <div>Phòng kinh doanh</div>
                                            <img src="" alt="Không có chữ ký số" />
                                        </div>
                                        <div className="w-full flex flex-col justify-center items-center">
                                            <div>Phòng NL</div>
                                            <img src="" alt="Không có chữ ký số" />
                                        </div>
                                        <div className="w-full flex flex-col justify-center items-center">
                                            <div>GĐSX</div>
                                            <img src="" alt="Không có chữ ký số" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {
                                productionSelected && productionOrderDetail.length == 0 && (
                                    <div className="mt-4 bg-[#C2C2CB] items-center justify-center  p-2 px-4 pr-1 rounded-lg flex">
                                        Không có dữ liệu để hiển thị.
                                    </div>
                                )
                            }
                        </>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default ProductionOrder;