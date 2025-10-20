const ViewMobile = ({ dataNLGBQCDetail, getInfoGetQCDetail }) => {
    // md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4
    return (<div className="mt-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2">
        {
            dataNLGBQCDetail.map((item, index) => {
                return (
                    <div key={index} className="flex bg-gray-50 border-2 border-[#84b0c5] rounded-xl p-4 mx-2 mb-3">
                        <div className="flex-col w-full">
                            <div className="text-xl font-semibold text-[#17506B] mb-1">
                                Mã SAP: {item.sapId}
                            </div>
                            <div className="grid grid-cols-2 font-semibold">
                                <span>Quy cách: </span>
                                <span className="font-normal">
                                    {item.quyCach}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 font-semibold">
                                <span>Số bó: </span>
                                <span className="font-normal">
                                    {item.soBo}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 font-semibold">
                                <span>Số thanh: </span>
                                <span className="font-normal">
                                    {item.soThanh}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 font-semibold">
                                <span>Tổng thanh: </span>
                                <span className="font-normal">
                                    {item.tongThanh}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 font-semibold">
                                <span>Khối lượng: </span>
                                <span className="font-normal">
                                    {item.khoiLuong}
                                </span>
                            </div>


                            <div className="grid grid-cols-2 font-semibold">
                                <span>Trả lại NCC: </span>
                                <span className="font-normal">
                                    {item.traLaiNCC}
                                </span>
                            </div>
                            <div className="mt-3 mb-3">
                                <hr />
                            </div>

                            <div className="flex justify-end rounded-xl">
                                <div>
                                    <button
                                        onClick={() => getInfoGetQCDetail(item)}
                                        type="button"
                                        className="w-[150px] text-white bg-[#17506B] font-medium rounded-lg px-5 py-2.5 text-center">
                                        Chi tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        }
    </div>)
}

export default ViewMobile;