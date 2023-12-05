import React, { useState, useMemo } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
} from "@chakra-ui/react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    PopoverAnchor,
} from "@chakra-ui/react";
import {
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from "@chakra-ui/react";
import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
} from "@chakra-ui/react";
import { RiWaterPercentFill } from "react-icons/ri";
import { FaPlus } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { LuCalendarRange } from "react-icons/lu";
import { LuFlagTriangleRight } from "react-icons/lu";
import { LuWarehouse } from "react-icons/lu";
import { LuKeyRound } from "react-icons/lu";
import { LuStretchHorizontal } from "react-icons/lu";
import { MdWaterDrop } from "react-icons/md";
import { HiMiniSparkles } from "react-icons/hi2";
import { MdNoteAlt } from "react-icons/md";
import { HiOutlineTrash } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";

function HumidityCheck() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [humidityRecords, setHumidityRecords] = useState([]);
    const [humidityInput, setHumidityInput] = useState(0);

    const humidityAnalysis = useMemo(() => {
        const total = humidityRecords.length;
        const low = humidityRecords.filter((value) => value < 7).length;
        const target = humidityRecords.filter(
            (value) => value >= 7 && value <= 9
        ).length;
        const high = humidityRecords.filter(
            (value) => value >= 10 && value <= 15
        ).length;
        const veryHigh = humidityRecords.filter((value) => value > 15).length;

        return [
            {
                label: "Thấp (nhỏ hơn 7)",
                count: low,
                percentage: (low / total) * 100,
            },
            {
                label: "Đích (7-9)",
                count: target,
                percentage: (target / total) * 100,
            },
            {
                label: "Cao (10-15)",
                count: high,
                percentage: (high / total) * 100,
            },
            {
                label: "Rất cao (trên 15)",
                count: veryHigh,
                percentage: (veryHigh / total) * 100,
            },
        ];
    }, [humidityRecords]);

    const handleRecord = () => {
        if (humidityInput === 0) {
            toast.error("Giá trị độ ẩm không được bỏ trống.");
        } else {
            setHumidityRecords([...humidityRecords, humidityInput]);
            setHumidityInput(0);
            toast.success("Giá trị độ ẩm đã được ghi nhận");
        }
    };

    const handleDelete = (index) => {
        setHumidityRecords(humidityRecords.filter((_, i) => i !== index));
        toast("Đã xóa khỏi danh sách");
    };

    return (
        <div className="bg-white rounded-xl border-2 border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 font-medium border-b border-gray-200">
                <div className="flex items-center gap-x-3">
                    <div className="w-8 h-8">
                        <RiWaterPercentFill className="w-full h-full text-[#17506B]" />
                    </div>
                    <div className="xl:text-xl xl:w-full w-[70%] text-lg">
                        Danh sách biên bản kiểm tra độ ẩm
                    </div>
                </div>
                <button
                    onClick={onOpen}
                    className="bg-gray-800 flex items-center space-x-3 p-2 rounded-xl text-white xl:px-4 active:scale-[.95] h-fit w-fit active:duration-75 transition-all"
                >
                    <FaPlus />
                    <div className="xl:flex hidden">Tạo mới</div>
                </button>
            </div>

            {/* Modal View all sizes */}
            <Modal
                closeOnOverlayClick={false}
                isOpen={isOpen}
                onClose={onClose}
                size="full"
            >
                <ModalOverlay />
                <ModalContent>
                    <div className="top-0 sticky z-20 bg-white border-b-2 border-gray-200">
                        <ModalHeader>
                            <div className="xl:ml-10 xl:text-center text-[#155979] text-lg uppercase xl:text-xl ">
                                Biểu mẫu kiểm tra độ ẩm gỗ sấy
                            </div>
                        </ModalHeader>
                        <ModalCloseButton />
                    </div>

                    <ModalBody className="my-4 ">
                        <div className="flex flex-col justify-center space-y-7 ">
                            {/* Infomation */}
                            <div className="xl:mx-auto text-base xl:w-[60%] border-2 border-gray-200 rounded-xl divide-y divide-gray-200 bg-white ">
                                <div className="flex gap-x-4 bg-gray-100 rounded-t-xl items-center p-4 px-8">
                                    <FaInfoCircle className="w-7 h-7 text-[]" />
                                    <div className="text-xl font-semibold">
                                        Thông tin chung
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 p-3 px-8">
                                    <div className=" flex font-semibold items-center">
                                        <LuCalendarRange className="w-5 h-5 mr-3" />
                                        Ngày kiểm tra:
                                    </div>
                                    <span className=" text-base ">
                                        02/12/2023 12:22:22
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 p-2.5 px-8">
                                    <div className="font-semibold flex items-center">
                                        <LuFlagTriangleRight className="w-5 h-5 mr-3" />
                                        Địa điểm:
                                    </div>
                                    <span className="font-normal text-base ">
                                        TQ
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 p-2.5 px-8">
                                    <div className="font-semibold flex items-center">
                                        <LuWarehouse className="w-5 h-5 mr-3" />
                                        Lò số:
                                    </div>
                                    <span className="font-normal text-base ">
                                        THL04
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 p-2.5 px-8">
                                    <div className="font-semibold flex items-center">
                                        <LuKeyRound className="w-5 h-5 mr-3" />
                                        Đơn vị quản lý:
                                    </div>
                                    <span className="font-normal text-base ">
                                        TQ
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 p-2.5 px-8">
                                    <div className="font-semibold flex items-center">
                                        <LuStretchHorizontal className="w-5 h-5 mr-3" />
                                        Mẻ sấy số:
                                    </div>
                                    <span className="font-normal text-base ">
                                        012
                                    </span>
                                </div>
                            </div>

                            {/* <div className="xl:mx-auto text-base xl:w-[60%]  border-b-2 border-gray-100 my-4"></div> */}

                            {/* Humid Range */}
                            <div className="xl:mx-auto xl:w-[60%] rounded-xl bg-[#22253d] divide-y-2 divide-[#2B384B] ">
                                <div className="flex gap-x-4 justify-between text-white rounded-xl items-center p-4 px-8">
                                    <div className="flex items-center gap-x-4">
                                        <MdWaterDrop className="w-8 h-8 text-blue-300" />
                                        <div className="text-xl font-semibold">
                                            Phân bố độ ẩm
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-x-4">
                                        <div className="p-2 px-4 rounded-full bg-[#33395C]">
                                            INDOOR
                                        </div>
                                    </div>
                                </div>
                                <div className="">
                                    {/* Header */}
                                    <div className="bg-[#22253d]">
                                        <table className="min-w-full divide-y-2 divide-[#2B384B]  ">
                                            <thead>
                                                <tr className="w-full">
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-start text-base w-[1/2] font-medium text-[#D2D6FF]  uppercase"
                                                    >
                                                        Độ ẩm (MC%)
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-start text-base w-[1/4] font-medium text-[#D2D6FF]  uppercase"
                                                    >
                                                        SL Mấu
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-start text-base w-[1/4]  font-medium text-[#D2D6FF]  uppercase"
                                                    >
                                                        Tỉ lệ
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className=" ">
                                                <tr className=" w-full bg-[#22253d]">
                                                    <td className="px-6 py-3 whitespace-nowrap w-[1/2] font-medium text-[#D2D6FF] ">
                                                        Thấp (nhỏ hơn 7)
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap w-[1/4] text-[#D2D6FF] ">
                                                        {humidityAnalysis[0].count}
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap w-[1/4] text-[#D2D6FF] ">
                                                        {humidityAnalysis[0].percentage.toFixed(2)}%
                                                    </td>
                                                </tr>

                                                <tr className="w-full p-2 bg-[#2d3254]">
                                                    <td className="px-6 py-3 whitespace-nowrap w-[1/2]  selection:font-medium text-[#D2D6FF] items-center flex">
                                                        Đích (7-9)
                                                        <HiMiniSparkles className="ml-2 text-blue-300" />
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap w-[1/4] font-medium text-[#D2D6FF] ">
                                                    {humidityAnalysis[1].count}
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap w-[1/4] font-medium text-[#D2D6FF] ">
                                                    {humidityAnalysis[1].percentage.toFixed(2)}%
                                                    </td>
                                                </tr>

                                                <tr className="w-full bg-[#3f4477]">
                                                    <td className="px-6 py-3 whitespace-nowrap w-[1/2]  font-medium  text-[#D2D6FF] ">
                                                        Cao (10-15)
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap w-[1/4] text-[#D2D6FF]">
                                                    {humidityAnalysis[2].count}
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap w-[1/4] text-[#D2D6FF]">
                                                    {humidityAnalysis[2].percentage.toFixed(2)}%
                                                    </td>
                                                </tr>

                                                <tr className="w-full bg-[#48519c]">
                                                    <td className="px-6 py-3 whitespace-nowrap w-[1/2]  font-medium text-[#D2D6FF] ">
                                                        Rất cao (trên 15)
                                                    </td>
                                                    <td className="px-6 py-3  whitespace-nowrap w-[1/4] text-[#D2D6FF] ">
                                                    {humidityAnalysis[3].count}
                                                    </td>
                                                    <td className="px-6 py-3  whitespace-nowrap w-[1/4] text-[#D2D6FF] ">
                                                    {humidityAnalysis[3].percentage.toFixed(2)}%
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-1 rounded-b-xl bg-[#48519c]"></div>
                                </div>
                            </div>

                            <div className="xl:mx-auto xl:w-[60%] text-gray-500 text-sm">
                                <span className="font-semibold">Chú ý:</span>{" "}
                                Đối với mẻ sấy INDOOR nếu MC% {`<`} 10 chiếm tỉ
                                lệ lớn hơn 85% thì cho ra lò. Đối với mẻ sấy
                                OUTDOOR nếu MC% {`>`} 14 chiếm tỉ lệ lớn hơn 85%
                                thì cho ra lò.
                            </div>

                            {/* Input */}
                            <div className="xl:mx-auto xl:w-[60%] border-2 border-gray-200 rounded-xl divide-y divide-gray-200 ">
                                <div className="flex gap-x-4 bg-gray-100 rounded-t-xl items-center p-4 px-8">
                                    <MdNoteAlt className="w-7 h-7 text-[]" />
                                    <div className="text-xl font-semibold">
                                        Ghi nhận độ ẩm
                                    </div>
                                </div>
                                <div className=" mx-auto  mb-4  ">
                                    {/* Header */}
                                    <div
                                        className="bg-white rounded-t-xl xl:flex md:flex justify-between items-center xl:space-y-0  lg:space-y-0 
                                    md:space-y-0 xl:space-x-4 md:space-x-4 border-b py-4 space-y-2 px-4 border-gray-300"
                                    >
                                        <NumberInput
                                            defaultValue={1}
                                            placeholder="Nhập độ ẩm"
                                            min={0}
                                            value={humidityInput}
                                            className="xl:w-[70%] w-full"
                                            onChange={(value) =>
                                                setHumidityInput(value)
                                            }
                                        >
                                            <NumberInputField />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                        <button
                                            className="bg-[#155979] p-2 rounded-xl xl:w-[30%] w-full text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                            onClick={handleRecord}
                                        >
                                            Ghi nhận
                                        </button>
                                    </div>

                                    <div className="bg-white py-4 rounded-b-xl text-base font-medium  space-y-3">
                                        {humidityRecords.map(
                                            (record, index) => (
                                                <div
                                                    className="flex justify-between items-center px-8 p-2.5 mx-4 rounded-full bg-[#dfe9ee]"
                                                    key={index}
                                                >
                                                    <div>
                                                        Lần:{" "}
                                                        <span>{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        Độ ẩm:{" "}
                                                        <span className="font-semibold">
                                                            {record}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(index)
                                                        }
                                                    >
                                                        <IoClose className="w-7 h-7 p-1 rounded-full hover:bg-[#c7d7de]" />
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <div className="text-gray-500 px-6">
                                        Tổng số lượng mẫu:{" "}
                                        <span>{humidityRecords.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ModalBody>

                    <ModalFooter className="bottom-0 sticky bg-white border-2 border-gray-200">
                        <div className=" flex justify-end gap-x-3 xl:px-10 md:px-10 w-full">
                            <button className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit lg:w-fit w-full">
                                Hoàn thành
                            </button>
                            <button
                                onClick={onClose}
                                className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit lg:w-fit w-full"
                            >
                                Đóng
                            </button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <div class="relative rounded-b-xl overflow-x-auto">
                <table class="w-full  text-left text-gray-500 ">
                    <thead class="font-semibold text-gray-700 px-4 xl:text-base text-sm bg-gray-50 ">
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
                                Tỉ lệ
                            </th>
                            <th
                                scope="col"
                                class="py-3 xl:text-left text-center xl:px-6"
                            >
                                Ngày tạo
                            </th>
                            <th
                                scope="col"
                                class="py-3 xl:text-left text-center xl:px-6"
                            >
                                Tạo bởi
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="bg-white xl:text-base text-sm border-b">
                            <th
                                scope="row"
                                class="py-3 xl:text-left text-center xl:px-6 font-medium text-gray-900 whitespace-nowrap "
                            >
                                106295
                            </th>
                            <td class="py-3 xl:text-left text-center xl:px-6">
                                12%
                            </td>
                            <td class="py-3 xl:text-left text-center xl:px-6">
                                OK
                            </td>
                            <td class="py-3 xl:text-left text-center xl:px-6">
                                Admin
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default HumidityCheck;
