import React from "react";
import { BsWrenchAdjustableCircleFill } from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";

function DisabledCheck() {
    return (
        <div className="bg-white rounded-xl border-2 border-gray-200">
            <div className="flex justify-between items-center gap-x-3 font-medium border-b px-6 p-4 border-gray-200">
                <div className="flex items-center gap-x-3">
                    <BsWrenchAdjustableCircleFill className="text-2xl text-[#17506B]" />
                    <div className="xl:text-xl xl:w-full w-[80%] text-lg">
                        Biên bản khảo sát tỉ lệ khuyết tật
                    </div>
                </div>
                <button
                    // onClick={onOpen}
                    className="bg-gray-800 flex items-center space-x-3 p-2 rounded-xl text-white xl:px-4 active:scale-[.95] h-fit w-fit active:duration-75 transition-all"
                >
                    <FaPlus />
                    <div className="xl:flex hidden">Tạo mới</div>
                </button>
            </div>
            {/* <div className="border-b-2 border-gray-100"></div> */}

            <div class="rounded-b-xl relative overflow-x-auto">
                <table class="w-full  text-left text-gray-500 ">
                    <thead class="font-medium xl:text-base text-sm text-gray-700 bg-gray-50 ">
                        <tr>
                            <th
                                scope="col"
                                class="py-3 xl:text-left text-center xl:px-6"
                            >
                                STT
                            </th>
                            <th
                                scope="col"
                                class="py-3 xl:text-left text-center xl:px-6"
                            >
                                TL mo, tóp
                            </th>
                            <th
                                scope="col"
                                class="py-3 xl:text-left text-center xl:px-6"
                            >
                                TL cong
                            </th>
                            <th
                                scope="col"
                                class="py-3 xl:text-left text-center xl:px-6"
                            >
                                Tổng SL kiểm tra
                            </th>
                            <th
                                scope="col"
                                class="py-3 xl:text-left text-center xl:px-6"
                            >
                                Ngày tạo
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="bg-white xl:text-base text-sm border-b">
                            <th
                                scope="row"
                                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                            >
                                106295
                            </th>
                            <td class="px-6 py-4">12</td>
                            <td class="px-6 py-4">OK</td>
                            <td class="px-6 py-4">OK</td>
                            <td class="px-6 py-4">OK</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DisabledCheck;
