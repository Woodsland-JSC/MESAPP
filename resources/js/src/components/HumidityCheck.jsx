import React from "react";
import { FaStumbleuponCircle   } from "react-icons/fa";

function HumidityCheck() {
    return (
        <div className="bg-white rounded-xl border-2 border-gray-200">
            <div className="text-xl flex items-center gap-x-3 px-6 py-4 font-medium border-b border-gray-200">
                <FaStumbleuponCircle  className="text-2xl text-[#17506B]"/>
                Danh sách biên bản kiểm tra độ ẩm
            </div>

            <div class="relative rounded-b-xl overflow-x-auto">
                <table class="w-full  text-left text-gray-500 ">
                    <thead class="font-semibold text-gray-700 bg-gray-50 ">
                        <tr>
                            <th scope="col" class="px-6 py-3">
                                STT
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Tỉ lệ
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Ngày tạo
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Tạo bởi
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="bg-white border-b">
                            <th
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                            >
                                106295
                            </th>
                            <td class="px-6 py-4">2023-10-12T07:59:28.050Z</td>
                            <td class="px-6 py-4">OK</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default HumidityCheck;
