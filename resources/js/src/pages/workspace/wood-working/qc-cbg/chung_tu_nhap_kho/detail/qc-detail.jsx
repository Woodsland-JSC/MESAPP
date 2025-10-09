const QcDetail = () => {
    return (
        <div>
            <table className="w-full border-2 border-gray-400">
                <thead class="font-bold">
                    {/* INFO report */}
                    <tr className="bg-blue-200">
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold">
                            ID
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold">
                            Phân loại
                        </td>
                        <td className="w-[150px] border-r border-b border-gray-400 p-2 text-lg font-bold">
                            Quy cách QC
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold">
                            Dày
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold">
                            Rộng
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold">
                            Dài
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold">
                            Số thanh KL mẫu
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold">
                            Đạt YC, Hạ Cấp, Loại
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold" >
                            Tỉ lệ (%)
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold" >
                            Thể tích theo QC
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold" >
                            Thể tích theo kho
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold" >
                            Gấp đôi
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold" >
                            Ghi chú
                        </td>
                        <td className="border-r border-b border-gray-400 p-2 text-lg font-bold" >
                            Loại lỗi
                        </td>
                    </tr>
                </thead>
            </table>
        </div>
    )
}

export default QcDetail;