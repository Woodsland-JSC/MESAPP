import React from "react";
import SizeListItem from "./SizeListItem";
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
import { BsFilterCircleFill } from "react-icons/bs";

function SizeCard() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <div className="border-2 border-gray-200 rounded-xl">
            {/* Header */}
            <div className="bg-white  rounded-t-xl flex justify-between items-center border-b py-4 px-6  border-gray-300">
                <div className="flex items-center gap-x-3 font-medium">
                  <BsFilterCircleFill className="text-2xl text-[#17506B]" />
                  <div className="xl:text-xl xl:w-full  text-lg">Các kích thước pallet</div>
                </div>
                <button
                    onClick={onOpen}
                    className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                >
                    Xem tất cả
                </button>
            </div>

            {/* Modal View all sizes */}
            <Modal
                closeOnOverlayClick={false}
                isOpen={isOpen}
                onClose={onClose}
                size="6xl"
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Tất cả kích thước</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <div class="relative overflow-x-auto w-full">
                            <table class="w-full  text-left text-gray-500 ">
                                <thead class="font-semibold text-gray-700 bg-gray-50 ">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">
                                            Pallet
                                        </th>
                                        <th scope="col" class="px-6 py-3">
                                            Dày
                                        </th>
                                        <th scope="col" class="px-6 py-3">
                                            Rộng
                                        </th>
                                        <th scope="col" class="px-6 py-3">
                                            Dài
                                        </th>
                                        <th scope="col" class="px-6 py-3">
                                            SL
                                        </th>
                                        <th scope="col" class="px-6 py-3">
                                            KL
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
                                        <td class="px-6 py-4">
                                            2023-10-12T07:59:28.050Z
                                        </td>
                                        <td class="px-6 py-4">OK</td>
                                        <td class="px-6 py-4">OK</td>
                                        <td class="px-6 py-4">OK</td>
                                        <td class="px-6 py-4">OK</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </ModalBody>

                    <ModalFooter>
                        <button
                            onClick={onClose}
                            className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                        >
                            Đóng
                        </button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <div className="bg-white rounded-b-xl p-6 py-3 space-y-4">
                {/* List Items */}
                <div className="grid w-full py-1 overflow-x-auto">
                    <div className=" flex flex-row mb-2 space-x-4 w-full">
                        <SizeListItem size="35x92x1060" pallet="2340-0640" Qty="466" weight="1.5906"/>
                        <SizeListItem size="35x92x1060" pallet="2340-0640" Qty="466" weight="1.5906"/>
                        <SizeListItem size="35x92x1060" pallet="2340-0640" Qty="466" weight="1.5906"/>
                        <SizeListItem size="35x92x1060" pallet="2340-0640" Qty="466" weight="1.5906"/>
                        <SizeListItem size="35x92x1060" pallet="2340-0640" Qty="466" weight="1.5906"/>
                        <SizeListItem size="35x92x1060" pallet="2340-0640" Qty="466" weight="1.5906"/>
                        <SizeListItem size="35x92x1060" pallet="2340-0640" Qty="466" weight="1.5906"/>
                        <SizeListItem size="35x92x1060" pallet="2340-0640" Qty="466" weight="1.5906"/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SizeCard;
