import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../layouts/layout";
import Select from "react-select";
import { IoMdArrowRoundBack } from "react-icons/io";
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
    Tooltip,
} from "@chakra-ui/react";

const options = [
    { value: "SP01", label: "Solid wood furniture" },
    { value: "SP02", label: "Plywood" },
    { value: "SP03", label: "Medium-density fiberboard (MDF)" },
    { value: "SP04", label: "Laminated wood" },
    { value: "SP05", label: "Veneered wood" },
    { value: "SP06", label: "Wood pellets" },
];

const FinishedGoodsReceipt = () => {
    const navigate = useNavigate();
    const [selectedGroup, setSelectedGroup] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center bg-transparent ">
                {/* Section */}
                <div className="w-screen mb-4 xl:mb-4 pt-2 px-0 xl:p-12 xl:pt-4 lg:pt-4 md:pt-4 lg:p-12 md:p-12 p-4 xl:px-24">
                    {/* Go back */}
                    <div
                        className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B] xl:ml-0 lg:ml-0 md:ml-0 ml-4"
                        onClick={() => navigate(-1)}
                    >
                        <IoMdArrowRoundBack />
                        <div>Quay lại</div>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between px-4 xl:px-0 lg:px-0 md:px-0 items-center">
                        <div className="serif xl:text-4xl lg:text-4xl md:text-4xl text-3xl font-bold ">
                            Nhập sản lượng{" "}
                            <span className=" text-[#622A2A]">
                                dự án nội địa
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-between mb-3 px-4 xl:px-0 lg:px-0 md:px-0 items-center gap-4">
                        <div className="my-4 mb-2 mt-3 w-full pb-4 rounded-xl bg-white ">
                            <div className="flex flex-col p-4 pb-0  w-full justify-end ">
                                <div className=" ">
                                    <div className="px-0 w-full">
                                        <div className="block xl:text-md lg:text-md md:text-md text-sm font-medium text-gray-900">
                                            Chọn sản phẩm đích
                                        </div>
                                        <Select
                                            options={options}
                                            defaultValue={selectedGroup}
                                            onChange={(value) => {
                                                setSelectedGroup(value);
                                            }}
                                            placeholder="Tìm kiếm"
                                            className="mt-1 mb-4 w-full"
                                        />
                                    </div>

                                    <div className="border border-gray-300 rounded-lg">
                                        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                                            <thead>
                                                <tr className="bg-gray-200 text-left">
                                                    <th className="px-4 py-2 w-[160px] border border-gray-300">
                                                        Item Code
                                                    </th>
                                                    <th className="px-4 py-2 w-[200px] border border-gray-300">
                                                        Số lượng kế hoạch
                                                    </th>
                                                    <th className="px-4 py-2 w-[200px] border border-gray-300">
                                                        Số lượng còn lại
                                                    </th>
                                                    <th className="px-4 py-2 border border-gray-300">
                                                        Số lượng ghi nhận
                                                        <span className="text-red-500">{" "}*</span>
                                                    </th>
                                                    <th className="px-4 py-2 border border-gray-300">
                                                        Mã hộp
                                                        <span className="text-red-500">{" "}*</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="bg-white">
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        ITEM001
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        100
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        50
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        <input className="w-full px-2 py-1 border border-gray-300 rounded-md" />
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        <input className="w-full px-2 py-1 border border-gray-300 rounded-md" />
                                                    </td>
                                                </tr>
                                                <tr className="bg-gray-50">
                                                    <td className="px-4 py-3 border border-gray-300">
                                                    ITEM001
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        Jane Doe
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        jane@example.com
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        <input className="w-full px-2 py-1 border border-gray-300 rounded-md" />
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        <input className="w-full px-2 py-1 border border-gray-300 rounded-md" />
                                                    </td>
                                                </tr>
                                                <tr className="bg-gray-50">
                                                    <td className="px-4 py-3 border border-gray-300">
                                                    ITEM001
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        Jane Doe
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        jane@example.com
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        <input className="w-full px-2 py-1 border border-gray-300 rounded-md" />
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        <input className="w-full px-2 py-1 border border-gray-300 rounded-md" />
                                                    </td>
                                                </tr>
                                                <tr className="bg-gray-50">
                                                    <td className="px-4 py-3 border border-gray-300">
                                                    ITEM001
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        Jane Doe
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        jane@example.com
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        <input className="w-full px-2 py-1 border border-gray-300 rounded-md" />
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-300">
                                                        <input className="w-full px-2 py-1 border border-gray-300 rounded-md" />
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex justify-end mt-4">
                                        <button
                                            className="w-fit h-full space-x-2 flex items-center bg-[#17506B] p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                            onClick={() => {
                                                onOpen();
                                            }}
                                        >
                                            <p className="text-[15px]">
                                                Ghi nhận
                                            </p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Execute Confirm Modal */}
                    <Modal
                        isCentered
                        isOpen={isOpen}
                        onClose={onClose}
                        size="xl"
                        blockScrollOnMount={false}
                        closeOnOverlayClick={false}
                    >
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>
                                Bạn chắc chắn muốn ghi nhận?
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <div>
                                        Sau khi xác nhận sẽ không thể thu hồi
                                        hành động.
                                    </div>
                                </div>
                            </ModalBody>

                            <ModalFooter>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => {
                                            onClose();
                                        }}
                                        className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full disabled:cursor-not-allowed disabled:opacity-50"
                                        // disabled={
                                        //     isBinStackingLoading ||
                                        //     isBinTransferLoading
                                        // }
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        className="bg-gray-800 p-2 rounded-xl px-4 h-fit font-medium active:scale-[.95]  active:duration-75  transition-all xl:w-fit md:w-fit w-full text-white"
                                        type="button"
                                        onClick={() => {
                                            // if (BinStackingData.length > 0) {
                                            //     handleExecuteBinStacking();
                                            // } else {
                                            //     handleExecuteBinTransfer();
                                            // }
                                        }}
                                    >
                                        {/* {isBinStackingLoading ||
                                        isBinTransferLoading ? (
                                            <div className="flex items-center space-x-4">
                                                <Spinner
                                                    size="sm"
                                                    color="white"
                                                />
                                                <div>Đang thực hiện</div>
                                            </div>
                                        ) : (
                                            <>Xác nhận</>
                                        )} */}
                                        Xác nhận
                                    </button>
                                </div>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </div>
            </div>
        </Layout>
    );
};

export default FinishedGoodsReceipt;
