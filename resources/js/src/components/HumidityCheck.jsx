import React from "react";
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

function HumidityCheck() {
    const { isOpen, onOpen, onClose } = useDisclosure();

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
                    <ModalHeader>
                        <div className="xl:ml-10 xl:text-center text-lg uppercase xl:text-xl ">
                            Biểu mẫu kiểm tra độ ẩm gỗ sấy
                        </div>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <div className="flex flex-col justify-center space-y-7 ">
                            {/* Infomation */}
                            <div className="xl:mx-auto text-base xl:w-[60%] border-2 border-gray-200 rounded-xl divide-y divide-gray-200 ">
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
                            <div className="xl:mx-auto xl:w-[60%] rounded-xl bg-[#1E293B] divide-y-2 divide-[#2B384B] ">
                                <div className="flex gap-x-4  text-white rounded-xl items-center p-4 px-8">
                                    <MdWaterDrop className="w-8 h-8 text-blue-300" />
                                    <div className="text-xl font-semibold">
                                        Phân bố độ ẩm
                                    </div>
                                </div>
                                <div className="">
                                    {/* Header */}
                                    <div className="bg-[#1E293B]">
                                        <table className="min-w-full divide-y-2 divide-[#2B384B]  ">
                                            <thead>
                                                <tr>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-start text-base font-medium text-[#D2D6FF]  uppercase"
                                                    >
                                                        Độ ẩm (MC%)
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-start text-base  font-medium text-[#D2D6FF]  uppercase"
                                                    >
                                                        SL Mấu
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-start text-base   font-medium text-[#D2D6FF]  uppercase"
                                                    >
                                                        Tỉ lệ
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className=" ">
                                                <tr className=" bg-[#22253d]">
                                                    <td className="px-6 py-3 whitespace-nowrap font-medium text-[#D2D6FF] ">
                                                        Thấp (nhỏ hơn 7)
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap  text-[#D2D6FF] ">
                                                        0
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-[#D2D6FF] ">
                                                        -
                                                    </td>
                                                </tr>

                                                <tr className=" p-2 bg-[#2d3254]">
                                                    <td className="px-6 py-3 whitespace-nowrap font-medium text-[#D2D6FF] items-center flex">
                                                        Đích (7-9)
                                                        <HiMiniSparkles className="ml-2 text-blue-300" />
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap font-medium text-[#D2D6FF] ">
                                                        0
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap font-medium text-[#D2D6FF] ">
                                                        -
                                                    </td>
                                                </tr>

                                                <tr className="bg-[#3f4477]">
                                                    <td className="px-6 py-3 whitespace-nowrap font-medium  text-[#D2D6FF] ">
                                                        Cao (10-15)
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap  text-[#D2D6FF]">
                                                        0
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap  text-[#D2D6FF]">
                                                        -
                                                    </td>
                                                </tr>

                                                <tr className="bg-[#48519c]">
                                                    <td className="px-6 py-3 whitespace-nowrap  font-medium text-[#D2D6FF] ">
                                                        Rất cao (trên 15)
                                                    </td>
                                                    <td className="px-6 py-3  whitespace-nowrap text-[#D2D6FF] ">
                                                        0
                                                    </td>
                                                    <td className="px-6 py-3  whitespace-nowrap  text-[#D2D6FF] ">
                                                        -
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-1 rounded-b-xl bg-[#48519c]"></div>
                                </div>
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
                                    <div className="bg-white rounded-t-xl xl:flex md:flex justify-between items-center xl:space-y-0  lg:space-y-0 
                                    md:space-y-0 xl:space-x-4 md:space-x-4 border-b py-4 space-y-2 px-4 border-gray-300">
                                        <input
                                            type="text"
                                            id="company"
                                            placeholder="Nhập độ ẩm"
                                            className=" border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 xl:w-[70%] w-full"
                                            required
                                        />
                                        <button className="bg-[#155979] p-2 rounded-xl xl:w-[30%] w-full text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all">
                                            Ghi nhận
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-b-xl text-base font-medium  space-y-4">
                                        <TableContainer>
                                            <Table variant="simple">
                                                <Thead>
                                                    <Tr className="bg-gray-50">
                                                        <Th className=""><div className="text-base font-medium"></div>STT</Th>
                                                        <Th>Độ ẩm</Th>
                                                        <Th>Action</Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    <Tr>
                                                        <Td>0</Td>
                                                        <Td>0</Td>
                                                        <Td></Td>
                                                    </Tr>
                                                </Tbody>
                                            </Table>
                                        </TableContainer>
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
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default HumidityCheck;
