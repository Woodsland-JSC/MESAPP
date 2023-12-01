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
                        <div className="flex flex-col justify-center ">
                            {/* Infomation */}
                            <div className="xl:mx-auto xl:px-8 text-base xl:w-[55%] space-y-3 ">
                                {/* <div className="bg-white  rounded-t-xl flex justify-between items-center ">
                                    <div className="flex items-center gap-x-3 font-semibold">
                                        <div className="text-xl xl:w-full">
                                            Thông tin biểu mẫu
                                        </div>
                                    </div>
                                </div> */}
                                <div className="grid grid-cols-2">
                                    <div className="font-medium">
                                        Ngày kiểm tra:
                                    </div>
                                    <span className="font-normal"></span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <div className="font-medium">Địa điểm:</div>
                                    <span></span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <div className="font-medium">Lò số:</div>
                                    <span></span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <div className="font-medium">
                                        Đơn vị quản lý:
                                    </div>
                                    <span></span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <div className="font-medium">
                                        Mẻ sấy số:
                                    </div>
                                    <span></span>
                                </div>
                            </div>

                            <div className="xl:mx-auto text-base xl:w-[55%]  border-b-2 border-gray-100 my-4"></div>

                            {/* Humid Range */}
                            <div className="xl:mx-auto xl:w-[55%]">
                                <div className="bg-white  rounded-t-xl flex justify-between items-center pb-3">
                                    <div className="flex items-center gap-x-3 font-semibold">
                                        <div className="xl:text-xl text-lg xl:w-full">
                                            Phân bố độ ẩm
                                        </div>
                                    </div>
                                </div>
                                <div className=" mx-auto  mb-4 border-2 border-gray-200 rounded-xl">
                                    {/* Header */}
                                    <div className="bg-white rounded-lg">
                                        <table className="min-w-full divide-y-2 divide-gray-200 rounded-b-xl ">
                                            <thead>
                                                <tr>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-start text-sm font-medium text-gray-500 uppercase"
                                                    >
                                                        Độ ẩm (MC%)
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-start text-sm  font-medium text-gray-500 uppercase"
                                                    >
                                                        SL Mấu
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-start text-sm  font-medium text-gray-500 uppercase"
                                                    >
                                                        Tỉ lệ
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="rounded-b-xl ">
                                                <tr className="rounded-xl">
                                                    <td className="px-6 py-3 whitespace-nowrap text-[15px]   font-medium text-gray-800 ">
                                                        {/* <div className="bg-gray-100 text-gray-700 p-1.5 rounded-full w-fit px-4 font-medium text-[15px]">Thấp (nhỏ hơn 7)</div> */}
                                                        Thấp (nhỏ hơn 7)
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-[15px]   text-gray-800 ">
                                                        0
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-[15px]   text-gray-800 ">
                                                        -
                                                    </td>
                                                </tr>

                                                <tr className="rounded-xl p-2 bg-[#FDEFDA]">
                                                    <td className="px-6 py-3 whitespace-nowrap text-[15px]   font-medium text-gray-800 ">
                                                        Đích (7-9)
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-[15px]  text-gray-800 ">
                                                        0
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-[15px]  text-gray-800 ">
                                                        -
                                                    </td>
                                                </tr>

                                                <tr className="bg-[#FDCB7C]">
                                                    <td className="px-6 py-3 whitespace-nowrap text-[15px] font-medium text-gray-800 ">
                                                        Cao (10-15)
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-[15px]  text-gray-800 ">
                                                        0
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-[15px] text-gray-800 ">
                                                        -
                                                    </td>
                                                </tr>

                                                <tr className="bg-[#F5A38E] rounded-b-xl">
                                                    <td className="px-6  pt-3 text-bottom whitespace-nowrap  font-medium text-gray-800 ">
                                                        Rất cao (trên 15)
                                                    </td>
                                                    <td className="px-6 pt-3 text-bottom  whitespace-nowrap text-[15px] text-gray-800 ">
                                                        0
                                                    </td>
                                                    <td className="px-6 pt-3 text-bottom  whitespace-nowrap text-[15px]  text-gray-800 ">
                                                        -
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div className="bg-[#F5A38E] rounded-b-lg h-3"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="xl:mx-auto text-base xl:w-[55%]  border-b-2 border-gray-100 my-4"></div>

                            {/* Input */}
                            <div className="xl:mx-auto xl:w-[55%]">
                                <div className="bg-white  rounded-t-xl flex justify-between items-center pb-3">
                                    <div className="flex items-center gap-x-3 font-semibold">
                                        <div className="xl:text-xl text-lg xl:w-full">
                                            Ghi nhận độ ẩm
                                        </div>
                                    </div>
                                </div>
                                <div className=" mx-auto  mb-4 border-2 border-gray-200 rounded-xl">
                                    {/* Header */}
                                    <div className="bg-white rounded-t-xl xl:flex md:flex justify-between items-center border-b py-4 space-y-2 px-4 border-gray-300">
                                        <label
                                            for="company"
                                            className="font-medium text-gray-900 "
                                        >
                                            Nhập độ ẩm:
                                        </label>
                                        <input
                                            type="text"
                                            id="company"
                                            className=" border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 xl:w-[70%] w-full"
                                            required
                                        />
                                        <button className="bg-[#155979] p-2 rounded-xl xl:w-fit w-full text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all">
                                            Ghi nhận 
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-b-xl  space-y-4">
                                        <TableContainer>
                                            <Table variant="simple">
                                                <Thead>
                                                    <Tr>
                                                        <Th>STT</Th>
                                                        <Th>Độ ẩm</Th>
                                                        <Th></Th>
                                                    </Tr>
                                                </Thead>
                                                <Tbody>
                                                    <Tr>
                                                        <Td>0</Td>
                                                        <Td>0</Td>
                                                        <Td></Td>
                                                    </Tr>
                                                    <Tr>
                                                        <Td>Đích (7-9)</Td>
                                                        <Td>0</Td>
                                                        <Td>30.48</Td>
                                                    </Tr>
                                                </Tbody>
                                            </Table>
                                        </TableContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ModalBody>

                    <ModalFooter>
                        <div className="flex justify-end gap-x-3 xl:px-10 md:px-10 w-full">
                            <button className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all">
                                Hoàn thành
                            </button>
                            <button
                                onClick={onClose}
                                className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
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
