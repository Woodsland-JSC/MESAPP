const ViewDefault = ({ dataNLGBQCDetail, getInfoGetQCDetail }) => {
    return (
        <div className="serif w-full mt-4 bg-[#ffffff] p-8 rounded-xl">
            <table className="w-full border-2 border-gray-400">
                <thead class="font-bold">
                    {/* INFO report */}
                    <tr className="bg-blue-200">
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Quy cách
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Số bó
                        </td>
                        <td className="w-[150px] border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Số thanh
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Tổng thanh
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Khối lượng
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center">
                            Trả lại NCC
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold text-center w-[160px]">

                        </td>
                    </tr>
                </thead>
                <tbody>
                    {
                        dataNLGBQCDetail.map((item, index) => {
                            return (
                                <tr key={index} className="">
                                    <td className=" border-r border-b border-gray-400 p-2">
                                        {item.quyCach}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2 text-right">
                                        {item.soBo}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2 text-right">
                                        {item.soThanh}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2 text-right">
                                        {item.tongThanh}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2 text-right">
                                        {item.khoiLuong}
                                    </td>
                                    <td className=" border-r border-b border-gray-400 p-2 text-right">
                                        {item.traLaiNCC}
                                    </td>
                                    <td className="border-r border-b border-gray-400 p-2 text-center cursor-pointer underline">
                                        <div>
                                            <span
                                                onClick={() => getInfoGetQCDetail(item)}
                                                className="w-[150px] text-[#17506B] font-medium rounded-lg px-5 py-2.5 text-center">
                                                Chi tiết
                                            </span>
                                        </div>
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

export default ViewDefault;