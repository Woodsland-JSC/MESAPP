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
import { TbMoodEmpty } from "react-icons/tb";
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
    const { planID, reload, palletDatam, onReload, onReloadPalletList, reason } = props;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [sizeData, setSizeData] = useState([]);
    const [isPalletLoading, setPalletLoading] = useState(true);

    // useEffect(() => {
    //     palletsApi
    //         .getBOWById(planID)
    //         .then((response) => {
    //             console.log("Dữ liệu trả về ở SizeCard:", response);

    //             setSizeData(response.plandrying.details);
    //             setPalletLoading(false);
    //         })
    //         .catch((error) => {
    //             console.error("Lỗi khi gọi API:", error);

    //             setPalletLoading(false);
    //         })
    //         .finally(() => {});
    // }, [props.reload]);

    const loadSizeData = () => {
        palletsApi.getBOWById(planID)
            .then((response) => {
                setSizeData(response.plandrying.details);
                setPalletLoading(false);
            })
            .catch((error) => {
                console.error("Lỗi khi gọi API:", error);
                setPalletLoading(false);
            });
    };

    useEffect(() => {
        // setSizeData(palletData);
        if(planID){
            loadSizeData();
        }
    }, [planID, props.reload ]);

    return (
        <div className="border-2 mb-4 border-gray-300 rounded-xl">
            {/* Header */}
            <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col gap-2 bg-white rounded-t-xl justify-between gap-x-3 xl:items-center lg:items-center md:items-center border-b p-3 pr-4 border-gray-300">
                <div className="flex items-start gap-x-3 font-medium">
                    <div className="w-9 h-9">
                        <IoScanCircleSharp className="text-3xl w-full h-full text-[#17506B]" />
                    </div>
                    <div className="serif font-bold xl:text-2xl xl:w-full text-[23px]">
                        Các kích thước pallet
                    </div>
                </div>
                <button
                    onClick={onOpen}
                    className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all font-medium xl:mt-o lg:mt-0 md:mt-0 mt-2"
                >
                    Xem tất cả
                </button>
            </div>

            {/* Modal View all sizes */}
            <Modal
                closeOnOverlayClick={false}
                isOpen={isOpen}
                onClose={onClose}
                size="full"
                scrollBehavior="inside"
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
                                        <Th>Kích thước</Th>
                                        <Th isNumeric>Số lượng</Th>
                                        <Th isNumeric>Khối lượng</Th>
                                    </Tr>
                                </Thead>
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
                        {/* <div className="relative overflow-y-auto max-h-[450px]">
                            <TableContainer>
                                <Table variant="simple">
                                    
                                </Table>
                            </TableContainer>
                        </div> */}
                    </ModalBody>

                    <ModalFooter>
                        <button
                            onClick={onClose}
                            className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit xl:w-fit lg:w-fit md:w-fit w-full active:duration-75 transition-all"
                        >
                            Đóng
                        </button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <div className="bg-white flex justify-center rounded-b-xl p-4  py-3 space-y-4">
                {isPalletLoading ? (
                    <div className="h=[10rem]">
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
                        <div className=" flex flex-row mb-1 mt-2 space-x-4 w-full">
                        {sizeData.length === 0 ? (
                            <div className="h-[4.3rem] w-full flex flex-col justify-center items-center ">
                                <TbMoodEmpty className="text-center text-gray-400 w-12 h-12 mb-2"/>
                                <div className="text-center text-gray-400">Hiện tại lò đang trống.</div>
                            </div>
                        ) : (
                            <>
                                {sizeData.map((item) => (
                                    <SizeListItem
                                        planID={planID}
                                        reason={reason}
                                        id={item.pallet}
                                        size={item.size}
                                        pallet={item.pallet}
                                        Qty={item.Qty}
                                        weight={item.Mass}
                                        onDelete={loadSizeData}
                                        onReload={onReload}
                                        onReloadPalletList={onReloadPalletList}
                                    />
                                ))}
                            </>
                        )}
                            
                        </div>
                    </div>
                )}               
            </div>
            
        </div>
    );
}

export default SizeCard;
