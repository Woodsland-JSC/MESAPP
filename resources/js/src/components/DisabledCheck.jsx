import React from "react";
import { BsWrenchAdjustableCircleFill } from "react-icons/bs";

function DisabledCheck() {
    return (
        <div className="bg-white rounded-xl border-2 border-gray-200">
            <div className="text-xl flex items-center gap-x-3 font-medium border-b px-6 p-4 border-gray-200">
                <BsWrenchAdjustableCircleFill  className="text-2xl text-[#17506B]"/>
                Biên bản khảo sát tỉ lệ khuyết tật
            </div>
            {/* <div className="border-b-2 border-gray-100"></div> */}

            <div class="rounded-b-xl relative overflow-x-auto">
                <table class="w-full  text-left text-gray-500 ">
                    <thead class="font-medium text-gray-700 bg-gray-50 ">
                        <tr>
                            <th scope="col" class="px-6 py-3">
                                STT
                            </th>
                            <th scope="col" class="px-6 py-3">
                                TL mo, tóp
                            </th>
                            <th scope="col" class="px-6 py-3">
                                TL cong
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Tổng SL kiểm tra
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Ngày tạo
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

export default DisabledCheck;
