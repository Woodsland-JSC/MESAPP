const ViewTableNhapKhoQc = ({ data, navigate }) => {
    return (
        <div className="overflow-x-auto serif w-full mt-4 bg-[#ffffff] p-8 rounded-xl">
            <table className="w-full border-2 border-gray-400">
                <thead class="font-bold">
                    {/* INFO report */}
                    <tr className="bg-blue-200">
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">

                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">

                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Mã SAP
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            QC ghi chú
                        </td>
                        <td className="w-[150px] border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Ngày nhập
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Mã lô gỗ nhập
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Đơn vị giao hàng
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Địa chỉ
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Trạng thái MT
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Loại gỗ
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Số chứng từ
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Biển số xe
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Nhà cung cấp
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Số phiếu
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Kho nhập
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Tên Kho nhập
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {
                        data.map((item, index) => {
                            return (
                                <tr key={index} className="">
                                    <td className=" border-r border-b border-gray-400 p-2 truncate">
                                        Add
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2 truncate">
                                        Trả lại NCC
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2">
                                        {item.sapId}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2">
                                        {item.qcNote}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2">
                                        {item.dateEntry.split(" ")[0]}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2">
                                        {item.lotEntryId}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2">
                                        {item.deliveryName}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2">
                                        {item.deliveryAddress}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2">
                                        {item.statusMT}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2">
                                        {item.woodType}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2">
                                        {item.certNumber}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2">
                                        {item.plateNumber}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2">
                                        {item.suplierId}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2">
                                        {item.ticketNumber}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2">
                                        {item.wareHouseId}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2">
                                        {item.wareHouseName}
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}

export default ViewTableNhapKhoQc;