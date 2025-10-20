import { FaRegTrashCan } from "react-icons/fa6";

const QcDetailViewMobile = ({infoGetQCDetail = [], selectedNLGBQCD, deleteQc}) => {
    return (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
            {
                infoGetQCDetail.map((item, index) => {
                    return <div key={index} className="mb-3 flex bg-gray-50 border-2 border-[#84b0c5] rounded-xl p-4 mx-2 ">
                        <div className="flex-col w-full">
                            <div>
                                <div className="font-semibold text-[#17506B] mb-1">
                                    Quy cách kho: {selectedNLGBQCD?.quyCach}
                                </div>
                                <div className="font-semibold">
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Dày (CP): </span>
                                        <span className="font-normal">
                                            {item?.dayCP}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Rộng (CP): </span>
                                        <span className="font-normal">
                                            {item?.rongCP}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Dài (CP): </span>
                                        <span className="font-normal">
                                            {item?.daiCP}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3 mb-3">
                                    <hr />
                                </div>
                            </div>
                            <div>
                                <div className="font-semibold">
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Phân loại: </span>
                                        <span className="font-normal">
                                            {item?.phanLoai}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Quy cách QC: </span>
                                        <span className="font-normal">
                                            {item?.quyCach}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Dày: </span>
                                        <span className="font-normal">
                                            {item?.day}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Rộng: </span>
                                        <span className="font-normal">
                                            {item?.rong}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Dài: </span>
                                        <span className="font-normal">
                                            {item?.dai}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Số thanh KL mẫu: </span>
                                        <span className="font-normal">
                                            {item?.soThanhKLMau}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Đạt YC, Hạ cấp, Loại: </span>
                                        <span className="font-normal">
                                            {item?.datYeuCauHaCapLoai}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Tỉ lệ(%): </span>
                                        <span className="font-normal">
                                            {item?.tiLe}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Thể tích theo QC (m³): </span>
                                        <span className="font-normal">
                                            {item?.theTichTheoQC}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Thể tích theo kho (m³): </span>
                                        <span className="font-normal">
                                            {item?.theTichTheoKho}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Gấp đôi: </span>
                                        <span className="font-normal">
                                            {item?.gapDoi}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Ghi chú: </span>
                                        <span className="font-normal">
                                            {item?.ghiChu}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>Loại lỗi: </span>
                                        <span className="font-normal">
                                            {item?.loaiLoi}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 font-semibold text-sm">
                                        <span>ID: </span>
                                        <span className="font-normal">
                                            {item?.id}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-3 mb-3">
                                    <hr />
                                </div>
                            </div>
                            <div className="flex justify-around rounded-xl">
                                {/* <div>
                                                                                    <button
                                                                                        type="button"
                                                                                        className=" text-white bg-[#17506B] font-medium rounded-lg px-5 py-2.5 text-center">
                                                                                        <FaPencil />
                                                                                    </button>
                                                                                </div> */}
                                <div>
                                    <button
                                        onClick={() => deleteQc(item.id)}
                                        type="button"
                                        className="text-white bg-[#17506B] font-medium rounded-lg px-5 py-2.5 text-center"
                                    >
                                        <FaRegTrashCan />
                                    </button>
                                </div>
                                {/* <div>
                                                                                    <button type="button" className="text-white bg-[#17506B] font-medium rounded-lg px-5 py-2.5 text-center">
                                                                                        <FaArrowRotateLeft />
                                                                                    </button>
                                                                                </div> */}
                            </div>
                        </div>
                    </div>
                })
            }
        </div>
    )
}

export default QcDetailViewMobile;