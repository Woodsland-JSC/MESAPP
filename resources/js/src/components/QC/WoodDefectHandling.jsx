import React, { useEffect, useState } from "react";
import { FaScrewdriverWrench } from "react-icons/fa6";
import QCApi from "../../api/QCApi";
import Select from "react-select";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";

function WoodDefectHandling() {
    // Set Data
    const [woodDefectType, setWoodDefectType] = useState("");
    const [woodDefectQty, setWoodDefectQty] = useState("");
    const [isEditable, setIsEditable] = useState(false);
    const [defectSolving, setDefectSolving] = useState("");
    const [defectProcess, setDefectProcess] = useState("");
    const [note, setNote] = useState("");

    // Get Data
    const [selectedWoodDefectType, setSelectedWoodDefectType] = useState("");
    const [selectedWoodDefectQty, setSelectedWoodDefectQty] = useState("");
    const [selecteddefectSolving, setSelectedDefectSolving] = useState("");
    const [selectedDefectProcess, setSelectedDefectProcess] = useState("");

    useEffect(() => {
        QCApi.getCBGDefects()
            .then((response) => {
                const options = response.map((item) => ({
                    value: item.id,
                    label: item.name,
                }));
                setWoodDefectType(options);
            })
            .catch((error) => {
                console.error("Error fetching CBG Defect list:", error);
                setLoading(false);
            });
    }, []);

    return (
        <div className="bg-white rounded-2xl border-2 border-gray-300 h-fit">
            {/* Header */}
            <div className="flex items-center gap-x-3 font-medium border-b p-4 px-6 border-gray-200">
                <div className="w-7 h-7">
                    <FaScrewdriverWrench className="text-[#17506B] w-[85%] h-full" />
                </div>

                <div className="xl:text-xl xl:w-full text-lg">
                    Xử lý hàng lỗi
                </div>
            </div>

            {/* Content */}
            <div className="xl:p-6 lg:p-6 md:p-6 p-4 pt-2 space-y-5">
                <div className="">
                    <label
                        htmlFor="woodDefect"
                        className="block mb-2 text-md font-medium text-gray-900"
                    >
                        Chọn loại lỗi
                    </label>

                    <Select
                        placeholder="Chọn loại lỗi"
                        options={woodDefectType}
                        onChange={(value) => {
                            setSelectedWoodDefectType(value);
                            console.log("Loại lỗi đã chọn:", value);
                        }}
                    />
                </div>

                <div className="">
                    <label
                        htmlFor="quantity"
                        className="block mb-2 text-md font-medium text-gray-900"
                    >
                        Số lượng lỗi
                    </label>
                    <input
                        type="text"
                        id="quantity"
                        onChange={(e) => setWoodDefectQty(e.target.value)}
                        className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 mb-2"
                    />
                    <Checkbox
                        size="lg"
                        onChange={(e) => {
                            setIsEditable([e.target.checked]);
                            console.log(isEditable);
                        }}
                    >
                        <div className="text-base ml-1"> Sửa được về chính chi tiết báo lỗi</div>
                    </Checkbox>
                </div>

                <div className="">
                    <label
                        htmlFor="woodDefect"
                        className="block mb-2 text-md font-medium text-gray-900"
                    >
                        Chọn giải pháp
                    </label>

                    <Select
                        placeholder="Chọn giải pháp"
                        options={woodDefectType}
                        onChange={(value) => {
                            setSelectedWoodDefectType(value);
                            console.log("Loại lỗi đã chọn:", value);
                        }}
                    />
                </div>

                <div className="">
                    <label
                        htmlFor="woodDefect"
                        className="block mb-2 text-md font-medium text-gray-900"
                    >
                        Chọn công đoạn xuất
                    </label>

                    <Select
                        placeholder="Chọn công đoạn xuất"
                        options={woodDefectType}
                        onChange={(value) => {
                            setSelectedWoodDefectType(value);
                            console.log("Loại lỗi đã chọn:", value);
                        }}
                    />
                </div>

                <div className="">
                    <label
                        htmlFor="woodDefect"
                        className="block mb-2 text-md font-medium text-gray-900"
                    >
                        Chọn công đoạn gây ra lỗi
                    </label>

                    <Select
                        placeholder="Chọn công đoạn gây ra lỗi"
                        options={woodDefectType}
                        onChange={(value) => {
                            setSelectedWoodDefectType(value);
                            console.log("Loại lỗi đã chọn:", value);
                        }}
                    />
                </div>

                <div className="">
                    <label
                        htmlFor="quantity"
                        className="block mb-2 text-md font-medium text-gray-900"
                    >
                        Ghi chú
                    </label>
                    <textarea
                        type="text"
                        rows={3}
                        id="quantity"
                        onChange={(e) => setWoodDefectQty(e.target.value)}
                        className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 mb-2"
                    />
                </div>
                <div className="flex w-full justify-end items-end">
                    <button
                        type="button"
                        className="text-white bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                    >
                        Lưu lại
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WoodDefectHandling;
