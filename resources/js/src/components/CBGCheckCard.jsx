import React from "react";
import { Link } from "react-router-dom";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
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

function CBGCheckCard(props) {
    const {
        id,
        itemName,
        method,
        batchNo,
        Qty,
        defectCode,
    } = props;

    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <div className=" border-2 border-gray-300 rounded-2xl bg-white h-[21rem] shadow-sm">
            {/* Header */}
            <div className="flex flex-col rounded-t-xl py-2 px-6 h-[22%]">
                <div className="flex space-x-4">
                    <div className="bow-status p-1 px-3 text-xs text-gray-400 font-semibold bg-gray-100 w-fit rounded-full justify-end my-4 hidden">
                        PlanID: {id}
                    </div>
                </div>

                <div className=" text-[1.25rem] font-bold text-[#17506B] mt-2 ">
                    <span className="">{itemName}</span>
                </div>
            </div>

            <div className="hidden"></div>

            <div className="border-b-2 border-gray-200 ml-6 w-[5rem] h-[3%]"></div>

            {/* Details */}
            <div className="space-y-3 py-2 px-6 pt-4 text-[15px]  h-[55%]">
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Quy cách:</div>
                    <div className="font-medium ">{method}</div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="font-semibold">
                        Số lượng còn phải xử lý:
                    </div>
                    <div className="font-medium ">{Qty}T</div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="font-semibold">LSX:</div>
                    <div className="font-medium truncate">{batchNo}</div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Mã báo lỗi:</div>
                    <div className="font-medium ">{defectCode}</div>
                </div>
            </div>

            {/* Controller */}
            <div className="py-2 px-12 border-t-2 border-[#cedde4] flex items-center justify-between bg-[#fdfdfd] rounded-b-2xl h-[20%] gap-x-2">
                <button className="flex items-center font-medium cursor-pointer border-2 border-[#cacaca] hover:border-gray-700 px-4 text-gray-600hover:text-white bg-[#f8f8f8] hover:bg-gray-700 hover:text-white w-fit p-2 rounded-full active:scale-[.95] h-fit active:duration-75 transition-all" onClick={onOpen}>
                    Lịch sử lỗi
                </button>
                <Link to="/workspace/wood-producting-qc/detail" className="">
                    <div className="flex items-center font-medium cursor-pointer border-2 border-[#8ab4c7] hover:border-[#17506B] px-4 text-[#17506B] hover:text-white bg-[#F8FAFC] hover:bg-[#17506B] w-fit p-2 rounded-full active:scale-[.95] h-fit active:duration-75 transition-all">
                        Xử lý lỗi
                    </div>
                </Link>
            </div>
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
                                        <Th>STT</Th>
                                        <Th>Quy cách</Th>
                                        <Th isNumeric>Số lượng</Th>
                                        <Th isNumeric>Chuyển bởi</Th>
                                        <Th isNumeric>Ngày chuyển</Th>
                                    </Tr>
                                </Thead>
                                <Tbody className="">
                                            <Tr>
                                                <Td>1</Td>
                                                <Td>24x58x720</Td>
                                                <Td isNumeric>1465</Td>
                                                <Td isNumeric>Ma Thị Giang</Td>
                                                <Td isNumeric>2023-04-21T14:42:39.786Z
</Td>
                                            </Tr>

                                    </Tbody>
                            </Table>
                        </TableContainer>
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
        </div>
    );
}

export default CBGCheckCard;
