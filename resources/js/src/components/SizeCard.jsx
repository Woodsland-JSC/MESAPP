import React from "react";
import { useState, useEffect, useRef } from "react";
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
import { IoScanCircleSharp } from "react-icons/io5";
import palletsApi from "../api/palletsApi";
import axios from "axios";
import toast from "react-hot-toast";
import { Spinner } from "@chakra-ui/react";
import "../assets/styles/index.css";
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

function SizeCard(props) {
    const { planID, reload } = props;
    console.log("Giá trị planID nhận được:", planID);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [sizeData, setSizeData] = useState([]);
    const [isPalletLoading, setPalletLoading] = useState(true);

    useEffect(() => {
        palletsApi
            .getBOWById(planID)
            .then((response) => {
                console.log("Dữ liệu trả về ở SizeCard:", response);

                setSizeData(response.plandrying.details);
                setPalletLoading(false);
            })
            .catch((error) => {
                console.error("Lỗi khi gọi API:", error);

                setPalletLoading(false);
            })
            .finally(() => {});
    }, [props.reload]);

    return (
        <div className="border-2 mb-4 border-gray-200 rounded-xl">
            {/* Header */}
            <div className="bg-white rounded-t-xl flex justify-between gap-x-3 items-center border-b py-4 px-6  border-gray-300">
                <div className="flex items-center gap-x-3 font-medium">
                    <div className="w-9 h-9">
                        <IoScanCircleSharp className="text-3xl w-full h-full text-[#17506B]" />
                    </div>
                    <div className="xl:text-xl xl:w-full text-lg">
                        Các kích thước pallet
                    </div>
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
                size="4xl"
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Tất cả kích thước</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <TableContainer>
                            <Table variant="simple">
                                <Thead className="bg-gray-50 top-0 sticky z-40">
                                    <Tr>
                                        <Th>Pallet</Th>
                                        <Th>Kích thước (Dày*Rộng*Dài)</Th>
                                        <Th isNumeric>Số lượng</Th>
                                        <Th isNumeric>Khối lượng</Th>
                                    </Tr>
                                </Thead>
                            </Table>
                        </TableContainer>
                        <div className="relative overflow-y-auto max-h-[450px]">
                            <TableContainer>
                                <Table variant="simple">
                                    <Tbody className="">
                                        {sizeData.map((item) => (
                                            <Tr>
                                                <Td>{item.pallet}</Td>
                                                <Td>{item.size}</Td>
                                                <Td isNumeric>{item.Qty}</Td>
                                                <Td isNumeric>{item.Mass}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
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

            <div className="bg-white flex justify-center rounded-b-xl p-6 py-3 space-y-4">
                {/* List Items */}
                {isPalletLoading ? (
                    <div className="">
                        <Spinner
                            thickness="4px"
                            speed="0.65s"
                            emptyColor="gray.200"
                            color="#155979"
                            size="xl"
                            className="my-4"
                        />
                    </div>
                ) : (
                    <div className="grid w-full py-1 overflow-x-auto">
                        <div className=" flex flex-row mb-2 space-x-4 w-full">
                            <>
                                {sizeData.map((item) => (
                                    <SizeListItem
                                        size={item.size}
                                        pallet={item.pallet}
                                        Qty={item.Qty}
                                        weight={item.Mass}
                                    />
                                ))}
                            </>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SizeCard;
