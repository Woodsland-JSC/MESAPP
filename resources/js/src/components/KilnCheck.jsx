import React from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";
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
import CheckCard from "./CheckCard";

function KilnCheck() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <div className="bg-white  rounded-xl border-2 border-gray-200 ">
            <div className="bg-white flex items-center gap-x-3 text-xl px-6 border-b rounded-t-xl border-gray-200 font-medium py-4">
                <BsFillCheckCircleFill className="text-2xl text-[#17506B]" />
                Biên bản kiểm tra lò sấy
            </div>

            <div className="bg-white rounded-b-xl">
                <div class="relative rounded-b-xl overflow-x-auto">
                    <table class="w-full  text-left text-gray-500 ">
                        <thead class="font-semibold text-gray-700 bg-gray-50 ">
                            <tr>
                                <th scope="col" class="px-6 py-3">
                                    Số biên bản
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Ngày kiểm tra
                                </th>
                                <th scope="col" class="px-6 py-3">
                                    Kết luận
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
                                <td class="px-6 py-4">
                                    2023-10-12T07:59:28.050Z
                                </td>
                                <td class="px-6 py-4">OK</td>
                                <td
                                    class="px-6 font-semibold text-[#17506B] cursor-pointer"
                                    onClick={onOpen}
                                >
                                    Xem
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
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
                        <div className="xl:ml-10">Biên bản đánh giá lò sấy</div>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <div className="xl:px-10 grid xl:grid-cols-4 lg:grid-cols-3 gap-6">
                            <CheckCard />
                            <CheckCard />
                            <CheckCard />
                            <CheckCard />
                            <CheckCard />
                            <CheckCard />
                            <CheckCard />
                            <CheckCard />
                            <CheckCard />
                            <CheckCard />
                            <CheckCard />
                            <CheckCard />                           
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
        </div>
    );
}

export default KilnCheck;
