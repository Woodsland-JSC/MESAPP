import Layout from "../../../../layouts/layout"
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";
import { useState } from "react";
import ChungTuNhapKho from "./chung_tu_nhap_kho";
import ChungTuQc from "./chung_tu_qc";
import ChungTuTraLaiNCC from "./chung_tu_tra_lai_ncc";
import { LOAI_CHUNG_TU } from "../../../../shared/data";

const QCCBG = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const [loaiChungTu, setLoaiChungTu] = useState(params.get('loaiChungTu') ? LOAI_CHUNG_TU.find(item => item.value == params.get('loaiChungTu')) : LOAI_CHUNG_TU[0]);

    const factories = [
        {
            value: "TH",
            label: "Thuận Hưng"
        },
        {
            value: "YS",
            label: "Yên Sơn"
        },
        {
            value: "TB",
            label: "Thái Bình"
        }
    ];

    return (
        <Layout>
            <div className="">
                <div className="p-6 px-5 xl:p-5 xl:px-12 ">
                    {/* Title */}
                    <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col items-center justify-between xL:space-x-6 lg:space-x-6 md:space-x-6 space-x-0 xL:space-y-0 lg:space-y-0 md:space-y-0 space-y-4 mb-3.5">
                        <div className="flex items-center space-x-4">
                            <div
                                className="p-2 hover:bg-gray-200 rounded-full cursor-pointer active:scale-[.87] active:duration-75 transition-all"
                                onClick={() => navigate(`/workspace?tab=wood-working`)}
                            >
                                <FaArrowLeft className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex flex-col mb-0 pb-0">
                                <div className="text-sm  text-[#17506B]">
                                    Quản lý sản xuất
                                </div>
                                <div className="serif text-3xl font-bold">
                                    QC Chế biến gỗ
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-2 border-2 border-gray-300 bg-white rounded-xl py-2 pb-3 xl:w-full lg:w-full md:w-full block">
                        <div className="flex-col items-center space-y-3 px-4 mt-1 mb-1">
                            <div className="flex space-x-3 w-full">
                                <div className="w-full">
                                    <label
                                        htmlFor=""
                                        className="mb-1 font-medium text-gray-900"
                                    >
                                        Chọn loại chứng từ
                                    </label>
                                    <Select
                                        className="cursor-pointer"
                                        placeholder="Chọn loại chứng từ..."
                                        options={LOAI_CHUNG_TU}
                                        defaultOptions
                                        onChange={(selected) => {
                                            setLoaiChungTu(selected);
                                            navigate(location.pathname, { replace: true });
                                        }}
                                        value={loaiChungTu}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {
                        (loaiChungTu && loaiChungTu.value == 1) &&
                        <ChungTuNhapKho factories={factories} loaiChungTu={loaiChungTu}/>
                    }
                    {
                        (loaiChungTu && loaiChungTu.value == 2) &&
                        <ChungTuQc factories={factories} loaiChungTu={loaiChungTu}/>
                    }
                    {
                        (loaiChungTu && loaiChungTu.value == 3) &&
                        <ChungTuTraLaiNCC factories={factories} loaiChungTu={loaiChungTu}/>
                    }
                </div>
            </div>
        </Layout>
    )
}

export default QCCBG;