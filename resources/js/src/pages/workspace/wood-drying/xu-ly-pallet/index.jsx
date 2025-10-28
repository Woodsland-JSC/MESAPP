import { IoIosArrowBack } from "react-icons/io";
import Layout from "../../../../layouts/layout";
import { useNavigate } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import { useEffect, useState } from "react";
import { getAllPlantInPlanDrying, getPalletsByPlanDrying, getPlanDryingByFactory, movePalletToPlanDrying, removePallets } from "../../../../api/plan-drying.api";
import toast from "react-hot-toast";
import Select from 'react-select';
import { danhSachNhaMayCBG } from "../../../../api/MasterDataApi";
import BOWCard from "../../../../components/BOWCard";
import moment from "moment";
import { Box, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useDisclosure } from "@chakra-ui/react";
import { COMPLETE_PALLET_STATUS, PALLET_LOG_TYPE } from "../../../../shared/data";
import { getOvensByFactory } from "../../../../api/oven.api";
import Swal from "sweetalert2";
import useAppContext from "../../../../store/AppContext";
import LoadingUI from '../../../../components/loading/Loading';

const XuLyDieuChuyenPallet = () => {
    const navigate = useNavigate();
    const [factories, setFactories] = useState([]);
    const [factory, setFactory] = useState(null);
    const [search, setSearch] = useState("");
    const [planDryings, setPlanDrying] = useState([]);
    const [loadingPallet, setLoadingPallet] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedPlanDrying, setSelectedPlanDrying] = useState(null);
    const [pallets, setPallets] = useState([]);
    const [palletStatus, setPalletStatus] = useState(COMPLETE_PALLET_STATUS.ALL);
    const [palletSelected, setPalletSelected] = useState([]);
    const [ovens, setOvens] = useState([]);
    const [oven, setOven] = useState(null);
    const [note, setNote] = useState("");

    const { user } = useAppContext();

    const {
        isOpen: isOpen,
        onOpen: onOpen,
        onClose: onClose,
    } = useDisclosure();

    const {
        isOpen: isOpenOven,
        onOpen: onOpenOven,
        onClose: onCloseOven,
    } = useDisclosure();

    const {
        isOpen: isOpenModalRemove,
        onOpen: onModalRemove,
        onClose: onCloseModalRemove,
    } = useDisclosure();

    const loadFactoriesInPlanDrying = async () => {
        try {
            let res = await danhSachNhaMayCBG();
            let options = [];

            res.data.factories.forEach((item) => {
                options.push({
                    label: item.Name,
                    value: item.U_FAC
                })
            })

            setFactories(options);
        } catch (error) {
            toast.error('Lấy nhà máy có lỗi!');
        }
    }

    const loadPlanDrying = async () => {
        try {
            setLoading(true);
            let res = await getPlanDryingByFactory(factory ? factory.value : user?.plant);
            setPlanDrying(res.plants);
            let ovens = [];
            res.plants.forEach(plan => {
                if (!ovens.some(o => o.value == plan.Oven)) {
                    ovens.push({
                        label: `Lò ${plan.Oven}`,
                        value: plan.Oven
                    })
                }
            })
            setOvens(ovens);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error("Lấy dữ liệu kế hoạch sấy có lỗi!");
        }
    }

    const loadPallets = async (planDrying) => {
        try {
            setSelectedPlanDrying(planDrying);
            setLoadingPallet(true);
            let res = await getPalletsByPlanDrying(planDrying.PlanID);
            setPallets(res.data.details)
            setLoadingPallet(false);
            onOpen();
        } catch (error) {
            toast.error('Lấy danh sách Pallet có lỗi!');
            setLoadingPallet(false);
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

    const onConfirmOven = () => {
        try {
            let p = pallets.filter(item => palletSelected.includes(item.pallet));
            let html = `Xác nhận chuyển các Pallet [${p.map(item => item.Code).join(", ")}] từ lò ${selectedPlanDrying.Oven} đến lò ${oven.value} - ${oven.label}`;

            let data = {
                planId: selectedPlanDrying.PlanID,
                currentOven: selectedPlanDrying.Oven,
                newOven: oven.value,
                pallets: palletSelected,
                log_type: PALLET_LOG_TYPE.MOVE,
                log_data: note,
                factory: factory.value
            }

            Swal.fire({
                title: 'Xác nhận điều chuyển pallet?',
                text: html,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Xác nhận',
                cancelButtonText: 'Huỷ'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await movePalletToPlanDrying(data);
                    loadPallets(selectedPlanDrying);
                    loadPlanDrying();
                    onCloseOven();
                    setOven(null);
                    setPalletSelected([]);
                    setNote("");
                    toast.success('Điều chuyền Pallet thành công!');
                }
            });
        } catch (error) {
            toast.error('Điều chuyền Pallet có lỗi');
        }
    }

    const removePallet = () => {
        try {
            let p = pallets.filter(item => palletSelected.includes(item.pallet));
            let html = `Xác nhận xóa các Pallet [${p.map(item => item.Code).join(", ")}] từ lò ${selectedPlanDrying.Oven}`;

            let data = {
                planId: selectedPlanDrying.PlanID,
                pallets: palletSelected,
                log_type: PALLET_LOG_TYPE.REMOVE,
                log_data: note,
                factory: factory ? factory.value : user?.plant
            }

            Swal.fire({
                title: 'Xác nhận xóa pallet?',
                text: html,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Xác nhận',
                cancelButtonText: 'Huỷ'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await removePallets(data);
                    loadPallets(selectedPlanDrying);
                    loadPlanDrying();
                    onCloseModalRemove();
                    setPalletSelected([]);
                    setNote("");
                    toast.success('Xóa Pallet thành công!');
                }
            });
        } catch (error) {
            toast.error('Xóa Pallet có lỗi');
        }
    }

    useEffect(() => {
        loadPlanDrying();
    }, [factory])

    useEffect(() => {
        loadFactoriesInPlanDrying();
    }, [])

    return (
        <Layout>
            <div className="flex justify-center bg-transparent ">
                <div className="w-screen p-6 px-5 xl:p-12 xl:px-32 xl:pt-6 lg:pt-6 md:pt-6 pt-2 border-t border-gray-200">
                    <div className="flex items-top justify-between">
                        <div
                            className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B]"
                            onClick={() => navigate(`/workspace?tab=wood-drying`)}
                        >
                            <IoIosArrowBack />
                            <div>Quay lại</div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="flex space-x-4 mb-4">
                        <div className="serif text-4xl font-bold ">Xử lý Pallet trong lò</div>
                    </div>

                    <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col xl:space-x-4 lg:space-x-4 md:space-x-4 space-x-0 bg-white p-4 pt-3 rounded-xl mb-4">
                        {
                            user?.role == 1 &&
                            <div className="md:w-1/3 w-full">
                                <label
                                    htmlFor="Tìm kiếm kế hoạch sấy"
                                    className=" text-sm font-medium text-gray-900 mb-2"
                                >
                                    Nhà máy
                                </label>
                                <div className="relative">
                                    <Select
                                        options={factories}
                                        placeholder="Chọn nhà máy"
                                        className="mt-1 w-full"
                                        onChange={(factory) => {
                                            setFactory(factory);
                                        }}
                                    />
                                </div>
                            </div>
                        }
                        <div className="md:w-2/3 w-full">
                            <label
                                for="Tìm kiếm kế hoạch sấy"
                                className=" text-sm font-medium text-gray-900 mb-2"
                            >
                                Tìm kiếm
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <IoSearch className="text-gray-500 ml-1 w-5 h-5" />
                                </div>
                                <input
                                    type="search"
                                    id="search"
                                    className="block w-full p-2.5 py-[6.2px] pl-12 text-[16px] text-gray-900 border border-gray-300 rounded-lg bg-gray-50 mt-1"
                                    placeholder="Tìm theo kế hoạch hoặc mã lò"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {
                        loading ? <LoadingUI></LoadingUI> : (
                            <>
                                {
                                    planDryings.filter(plan => {
                                        return plan.Code.includes(search) || plan.Oven.includes(search)
                                    }).length > 0 && (
                                        <div className="mb-3 text-gray-600">
                                            Có tất cả <b>{planDryings.filter(plan => {
                                                return plan.Code.includes(search) || plan.Oven.includes(search)
                                            }).length}</b> kế hoạch sấy
                                        </div>
                                    )
                                }
                                <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
                                    {
                                        planDryings.filter(plan => {
                                            return plan.Code.includes(search) || plan.Oven.includes(search)
                                        })
                                            .map((planDrying, i) => (
                                                <BOWCard
                                                    key={i}
                                                    planID={planDrying.PlanID}
                                                    status={planDrying.Status}
                                                    batchNumber={planDrying.Code}
                                                    kilnNumber={planDrying.Oven}
                                                    thickness={planDrying.Method}
                                                    purpose={planDrying.Reason}
                                                    finishedDate={moment(
                                                        planDrying?.created_at
                                                    )
                                                        .add(planDrying?.Time, "days")
                                                        .format(
                                                            "YYYY-MM-DD HH:mm:ss"
                                                        )}
                                                    palletQty={planDrying.TotalPallet}
                                                    weight={planDrying.Mass}
                                                    isChecked={planDrying.Checked}
                                                    isReviewed={planDrying.Review}
                                                    isHandlePallet={true}
                                                    openModalPallet={() => loadPallets(planDrying)}
                                                />
                                            ))
                                    }
                                </div>
                            </>
                        )
                    }


                </div>
            </div>

            <Modal
                isOpen={isOpen}
                size="full"
                scrollBehavior="inside"
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Danh sách Pallets</ModalHeader>
                    <ModalBody className="!px-4">
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
                                            (pallets.filter(pallet => {
                                                if (palletStatus == COMPLETE_PALLET_STATUS.ALL) {
                                                    return pallet
                                                }
                                                else if (palletStatus == COMPLETE_PALLET_STATUS.COMPLETE) {
                                                    return pallet.CompletedBy != null
                                                } else {
                                                    return pallet.CompletedBy == null
                                                }
                                            }).filter(pl => pl.CompletedBy == null).length > 0) ? (
                                                <Td width={40}></Td>
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
                                        pallets.filter(pallet => {
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
                                                <Td width={40}><input checked={palletSelected.some(pallet => pallet == item.pallet)} type="checkbox" className="cursor-pointer w-4 h-4" name="select-pallet" onChange={e => selectPallet(e.target.checked, item.pallet)} />
                                                </Td>
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
                                        onClick={onModalRemove}
                                        className="bg-[#ee6f6f] p-2 rounded-xl text-white px-4"
                                    >
                                        Xóa Pallet
                                    </button>
                                )
                            }

                            {/* {
                                palletSelected.length > 0 && (
                                    <button
                                        onClick={onOpenOven}
                                        className="bg-[#17506B] p-2 rounded-xl text-white px-4"
                                    >
                                        Điều chuyển
                                    </button>
                                )
                            } */}

                            <button onClick={() => {
                                onClose();
                                setPalletSelected([]);
                            }}
                                className=" bg-gray-800 p-2 rounded-xl text-white"
                            >
                                Đóng
                            </button>
                        </div>

                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal
                isOpen={isOpenOven}
                size="lg"
                blockScrollOnMount={false}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Điều chuyển Pallet</ModalHeader>
                    <hr />
                    <ModalBody className="!px-4">
                        <Select
                            options={ovens.filter(o => o.value != selectedPlanDrying?.Oven)}
                            placeholder="Chọn lò"
                            className="mt-1 w-full"
                            onChange={(oven) => {
                                setOven(oven);
                            }}
                        />
                        <div className="w-full mt-3">
                            <label className=" text-sm font-medium text-gray-900 mb-2">
                                Lý do
                            </label>
                            <div className="relative">
                                <input type="text"
                                    className="w-full p-2.5 py-[6.2px] text-[16px] border border-gray-300 rounded-lg mt-1"
                                    placeholder="Nhập lý do"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                />
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div className="flex gap-x-3">
                            {
                                oven && (
                                    <button
                                        onClick={onConfirmOven}
                                        className="bg-[#17506B] p-2 rounded-xl text-white px-4"
                                    >
                                        Xác nhận
                                    </button>
                                )
                            }

                            <button onClick={() => {
                                onCloseOven();
                                setOven();
                                setNote("");
                            }}
                                className=" bg-gray-800 p-2 rounded-xl text-white"
                            >
                                Đóng
                            </button>
                        </div>

                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal
                isOpen={isOpenModalRemove}
                size="sm"
                blockScrollOnMount={false}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Xóa Pallet Pallet</ModalHeader>
                    <hr />
                    <ModalBody className="!px-4">
                        <div className="w-full">
                            <label className=" text-sm font-medium text-gray-900 mb-2">
                                Lý do
                            </label>
                            <div className="relative">
                                <input type="text"
                                    className="w-full p-2.5 py-[6.2px] text-[16px] border border-gray-300 rounded-lg mt-1"
                                    placeholder="Nhập lý do"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                />
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <div className="flex gap-x-3">
                            <button
                                onClick={removePallet}
                                className="bg-[#17506B] p-2 rounded-xl text-white px-4"
                            >
                                Xác nhận
                            </button>

                            <button onClick={() => {
                                onCloseModalRemove();
                                setNote("");
                            }}
                                className=" bg-gray-800 p-2 rounded-xl text-white"
                            >
                                Đóng
                            </button>
                        </div>

                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Layout>
    )
}
export default XuLyDieuChuyenPallet;