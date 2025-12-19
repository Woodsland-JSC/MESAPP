import moment from "moment/moment";

const ViewMobileNhapKhoQC = ({ data, navigate, selecteNLG, filter, loaiChungTu }) => {
    const {factory, fromDate, toDate} = filter;

    return (
        // lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-x-2 gap-y-2">
            {
                data.map((item, index) => (
                    <div key={index} className="bg-gray-50 border-2 border-[#84b0c5] rounded-xl p-4">
                        <div className="flex-col w-full">
                            <div className="text-xl font-semibold text-[#17506B] mb-1">
                                {item.lotEntryId}
                            </div>
                            <div className="flex font-semibold justify-between">
                                <span>Mã SAP: </span>
                                <span className="font-normal">
                                    {item.sapId}
                                </span>
                            </div>

                            <div className="flex font-semibold justify-between">
                                <span>Ngày nhập:</span>
                                <span className="font-normal">
                                    {item.dateEntry.split(" ")[0]}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center w-full">
                                <div className="space-y-3 w-full">
                                    <div className="relative w-full">
                                        <div className="p-4 py-2 rounded-xl bg-gray-200 mb-2">
                                            <div className="flex-col  ">
                                                <div className="font-bold text-[15px] ">
                                                    Đơn vị giao hàng
                                                </div>
                                                <div className="font-semibold text-[13px] text-[#1B536E]" title={item.deliveryName}>
                                                    {item.deliveryName ?? '-'}
                                                </div>
                                                <div className="text-[13px] mt-2" title={item.deliveryAddress}>
                                                    {item.deliveryAddress ?? '-'}
                                                </div>
                                                <div className="text-[13px]">
                                                    Biển số xe: {item.plateNumber ?? '-'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 py-2 rounded-xl bg-gray-200 mb-2 ">
                                            <div className="flex-col  ">
                                                <div className="font-bold text-[15px]">
                                                    Trạng thái MT
                                                </div>
                                                <div className="text-[13px]">
                                                    {item.statusMT ?? '-'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 py-2 rounded-xl bg-gray-200 mb-2">
                                            <div className="flex-col  ">
                                                <div className="font-bold text-[15px]">
                                                    Loại gỗ
                                                </div>
                                                <div className="text-[13px]">
                                                    {item.woodType ?? '-'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 py-2 rounded-xl bg-gray-200 mb-2">
                                            <div className="flex-col  ">
                                                <div className="font-bold text-[15px]">
                                                    Số chứng từ
                                                </div>
                                                <div className="text-[13px]">
                                                    {item.certNumber ?? '-'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 py-2 rounded-xl bg-gray-200 mb-2">
                                            <div className="flex-col  ">
                                                <div className="font-bold text-[15px]">
                                                    Nhà cung cấp
                                                </div>
                                                <div className="text-[13px]">
                                                    Mã: {item.suplierId ?? '-'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 py-2 rounded-xl bg-gray-200 mb-2">
                                            <div className="flex-col  ">
                                                <div className="font-bold text-[15px]">
                                                    Kho nhập
                                                </div>
                                                <div className="text-[13px]">
                                                    Mã: {item.wareHouseId ?? '-'}
                                                </div>
                                                <div className="text-[13px]">
                                                    {item.wareHouseName ?? '-'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between rounded-xl mb-2">
                                            <div>
                                                <button
                                                    onClick={() => selecteNLG(item)}
                                                    type="button" 
                                                    className="w-[150px] text-white bg-[#e6264f] font-medium rounded-lg px-5 py-2.5 text-center"
                                                >
                                                    Trả lại NCC
                                                </button>
                                            </div>
                                            <div>
                                                <button
                                                    onClick={() => navigate(`/workspace/qc-che-bien-go/${item.sapId}?factory=${factory}&fromDate=${moment(fromDate).format('YYYY-MM-DD')}&toDate=${moment(toDate).format('YYYY-MM-DD')}&loaiChungTu=${loaiChungTu}`)}
                                                    type="button"
                                                    className="w-[150px] text-white bg-[#17506B] font-medium rounded-lg px-5 py-2.5 text-center">
                                                    Add
                                                </button>
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
    );
}

export default ViewMobileNhapKhoQC;