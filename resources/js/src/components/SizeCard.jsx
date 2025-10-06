import { useState, useEffect } from "react";
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
    Box,
} from "@chakra-ui/react";
import { IoScanCircleSharp } from "react-icons/io5";
import { TbMoodEmpty } from "react-icons/tb";
import palletsApi from "../api/palletsApi";
import { Spinner } from "@chakra-ui/react";
import "../assets/styles/index.css";
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
} from "@chakra-ui/react";
import Swal from "sweetalert2";
import { COMPLETE_PALLET_STATUS } from "../shared/data";

function SizeCard(props) {
    const { planID, reload, palletDatam, onReload, onReloadPalletList, reason, type } = props;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [sizeData, setSizeData] = useState([]);
    const [isPalletLoading, setPalletLoading] = useState(true);
    const [palletSelected, setPalletSelected] = useState([]);
    const [palletStatus, setPalletStatus] = useState(COMPLETE_PALLET_STATUS.ALL);

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

    const selectAllPallet = (selected) => {
        setPalletSelected([]);

        if (selected) {
            let p = [];
            sizeData.forEach(item => {
                p.push(item.pallet);
            })
            setPalletSelected(p);
        }
    }

    const selectPallet = (selected, pallet) => {
        if (selected) {
            setPalletSelected(prev => [...prev, pallet])
        } else {
            let pallets = palletSelected.filter(item => item != pallet);
            setPalletSelected(pallets)
        }
    }

    const completePallet = () => {
        if (type != 'ls') return;

        Swal.fire({
            title: `Xác nhận ra lò các Pallet đã chọn?`,
            text: "Hành động này sẽ không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ra lò',
            cancelButtonText: 'Hủy',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    let data = {
                        planId: planID,
                        palletIds: palletSelected,
                        result: 'SD'
                    };

                    let res = await palletsApi.completeByPallets(data);
                    loadSizeData();
                    setPalletSelected([]);

                    Swal.fire(
                        'Thành công',
                        'Ra lò các pallet thành công.',
                        'success'
                    );
                } catch (error) {
                    Swal.fire(
                        'Có lỗi',
                        'Ra lò các pallet có lỗi.',
                        'error'
                    )
                }
            }
        });
    }

    useEffect(() => {
        if (planID) {
            loadSizeData();
        }
    }, [planID, props.reload]);

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
                        <Box className="mb-3">
                            <label className="block mb-2 text-sm font-medium text-gray-900">Lọc theo trạng thái</label>
                            <select
                                value={palletStatus}
                                onChange={e => setPalletStatus(Number(e.target.value))}
                                name="pallet-status"
                                id="pallet-status"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 md:w-[300px]"
                            >
                                <option value={COMPLETE_PALLET_STATUS.ALL}>Tất cả</option>
                                <option value={COMPLETE_PALLET_STATUS.COMPLETE}>Đã ra lò</option>
                                <option value={COMPLETE_PALLET_STATUS.UN_COMPLETE}>Chưa ra lò</option>
                            </select>
                        </Box>
                        <TableContainer>
                            <Table variant="simple">
                                <Thead className="bg-gray-50 top-0 sticky z-40">
                                    <Tr>
                                        {
                                            (type == 'ls' && sizeData.filter(pallet => {
                                                if (palletStatus == COMPLETE_PALLET_STATUS.ALL) {
                                                    return pallet
                                                }
                                                else if (palletStatus == COMPLETE_PALLET_STATUS.COMPLETE) {
                                                    return pallet.CompletedBy != null
                                                } else {
                                                    return pallet.CompletedBy == null
                                                }
                                            }).filter(pl => pl.CompletedBy == null).length > 0) ? (
                                                <Th width={40}>
                                                    <input type="checkbox" checked={palletSelected.length == sizeData.length} className="cursor-pointer w-4 h-4" name="select-all-pallet" onChange={e => selectAllPallet(e.target.checked)} />
                                                </Th>
                                            ) : (
                                                <Td width={40}></Td>
                                            )
                                        }
                                        <Th>Pallet</Th>
                                        <Th>Mục đích sấy</Th>
                                        <Th>Kích thước</Th>
                                        <Th isNumeric>Số lượng</Th>
                                        <Th isNumeric>Khối lượng</Th>
                                    </Tr>
                                </Thead>
                                <Tbody className="">
                                    {
                                        sizeData.filter(pallet => {
                                            if (palletStatus == COMPLETE_PALLET_STATUS.ALL) {
                                                return pallet
                                            }
                                            else if (palletStatus == COMPLETE_PALLET_STATUS.COMPLETE) {
                                                return pallet.CompletedBy != null
                                            } else {
                                                return pallet.CompletedBy == null
                                            }
                                        }).map((item, index) => (
                                            <Tr key={index} className={`${item.CompletedBy ? 'bg-[#e5f3eb]' : ''}`}>
                                                {
                                                    (type == 'ls' && item.CompletedBy == null) ?
                                                    <Td width={40}><input checked={palletSelected.some(pallet => pallet == item.pallet)} type="checkbox" className="cursor-pointer w-4 h-4" name="select-pallet" onChange={e => selectPallet(e.target.checked, item.pallet)} />
                                                    </Td> : 
                                                    <Td width={40}></Td>
                                                }
                                                <Td>{item.Code}</Td>
                                                <Td>{item.LyDo}</Td>
                                                <Td>{item.size}</Td>
                                                <Td isNumeric>{item.Qty}</Td>
                                                <Td isNumeric>{Number(item.Mass).toFixed(4)}</Td>
                                            </Tr>
                                        ))
                                    }
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </ModalBody>
                    <ModalFooter>
                        <div className="flex gap-x-3">
                            {
                                palletSelected.length > 0 && (
                                    <button
                                        onClick={completePallet}
                                        className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit xl:w-fit lg:w-fit md:w-fit w-full active:duration-75 transition-all"
                                    >
                                        <span className="hidden sm:hidden md:block">Xác nhận ra lò các pallet được chọn</span>
                                        <span className="block sm:block md:hidden ">Ra lò</span>
                                    </button>
                                )
                            }

                            <button
                                onClick={() => {
                                    onClose()
                                    setPalletSelected([])
                                }}
                                className="bg-[#000000] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit xl:w-fit lg:w-fit md:w-fit w-full active:duration-75 transition-all"
                            >
                                Đóng
                            </button>
                        </div>

                    </ModalFooter>
                </ModalContent>
            </Modal>

            <div className="bg-white flex justify-center rounded-b-xl p-4  py-3 space-y-4">
                {isPalletLoading ? (
                    <div className="h=[10rem]">
                        <Spinner
                            thickness="7px"
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
                                    <TbMoodEmpty className="text-center text-gray-400 w-12 h-12 mb-2" />
                                    <div className="text-center text-gray-400">Hiện tại lò đang trống.</div>
                                </div>
                            ) : (
                                <>
                                    {sizeData.map((item, index) => (
                                        <SizeListItem
                                            planID={planID}
                                            reason={reason}
                                            id={item.pallet}
                                            code={item.Code}
                                            size={item.size}
                                            pallet={item.pallet}
                                            Qty={item.Qty}
                                            weight={item.Mass}
                                            method={item.LyDo}
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
