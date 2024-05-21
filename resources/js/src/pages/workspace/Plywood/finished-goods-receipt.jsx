import React, { useEffect, useState, useRef } from "react";
import Layout from "../../../layouts/layout";
import { Link, useNavigate } from "react-router-dom";
import { HiPlus, HiArrowLeft } from "react-icons/hi";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    AlertDialogCloseButton,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    ModalOverlay,
    Modal,
    ModalHeader,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Badge,
    Button,
    Box,
    Text,
    Skeleton,
    Stack,
    useDisclosure,
} from "@chakra-ui/react";
import { HiMiniBellAlert } from "react-icons/hi2";
import Select, { components } from "react-select";
import AsyncSelect from "react-select/async";
import toast from "react-hot-toast";
import productionApi from "../../../api/productionApi";
import FinishedGoodsIllustration from "../../../assets/images/wood-receipt-illustration.png";
import Loader from "../../../components/Loader";
import useAppContext from "../../../store/AppContext";
import PlyWoodItemInput from "../../../components/PlyWoodItemInput";
import ItemInput from "../../../components/ItemInput";
import AwaitingReception from "../../../components/AwaitingReception";
import AwaitingErrorReception from "../../../components/AwaitingErrorReception";

function PlywoodFinishedGoodsReceipt() {
    const navigate = useNavigate();
    const groupSelectRef = useRef();
    // const { loading, setLoading } = useAppContext();

    const {
        isOpen: isAlertDialogOpen,
        onOpen: onAlertDialogOpen,
        onClose: onAlertDialogClose,
    } = useDisclosure();

    const {
        isOpen: isModalOpen,
        onOpen: onModalOpen,
        onClose: onModalClose,
    } = useDisclosure();
    const {
        isOpen: isErrorModalOpen,
        onOpen: onErrorModalOpen,
        onClose: onErrorModalClose,
    } = useDisclosure();

    const [awaitingReception, setAwaitingReception] = useState([]);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(false);

    const [awaitingErrorReception, setAwaitingErrorReception] = useState({
        "CH-LVL-TV": [],
        "CH-PLY-XV": [],
        "CH-LVL-HT": [
            {
                itemName: "Ván LVL 34",
                command: "VCN-CH-LVL-04.5.23-LVL34.2m7",
                thickness: 15.2,
                width: 1220,
                length: 2440,
                amount: 1200,
                type: "Hàng chờ sửa",
                method: "Hàng chờ sửa",
                createdDate: "2023-12-11T00:48:22.854Z",
                createdBy: {
                    id: 1,
                    last_name: "Phạm Phương",
                    first_name: "Thảo",
                },
            },
            {
                itemName: "Ván cốt WN",
                command: "VCN-CH-WN-22.9.23-LVL34.2m7",
                thickness: 15,
                width: 1220,
                length: 2440,
                amount: 5,
                type: "Tách lớp",
                method: "Hạ cấp loại 2",
                createdDate: "2023-12-11T00:48:22.854Z",
                createdBy: {
                    id: 1,
                    last_name: "Hà Thị Bích",
                    first_name: "Thuỳ",
                },
            },
            {
                itemName: "Ván LVL 34",
                command: "VCN-CH-LVL-01.10.23-LVL34.2m7",
                thickness: 15,
                width: 1220,
                length: 2440,
                amount: 208,
                type: "Hàng chờ sửa",
                method: "Hàng chờ sửa",
                createdDate: "2023-12-11T00:48:22.854Z",
                createdBy: {
                    id: 1,
                    last_name: "Phạm Phương",
                    first_name: "Thảo",
                },
            },
        ],
        "CH-PLY-LL": [],
        "CH-PLY-TV": [],
        "CH-LVL-KTP": [],
        "CH-PLY-LV": [],
        "CH-PLY-KVC": [],
    });

    const [isQC, setIsQC] = useState([]);
    const [currentData, setCurrentData] = useState(exampleData);
    const [groupListOptions, setGroupListOptions] = useState([]);
    const [groupList, setGroupList] = useState([]);

    const [selectedGroup, setSelectedGroup] = useState(groupListOptions[0]);
    const [isQualityCheck, setIsQualityCheck] = useState(false);

    const handleReceiptFromChild = (data, receipts) => {
        const params = {
            TO: selectedGroup.value,
        };
        getDataFollowingGroup(params);
    };

    const handleRejectFromChild = (data, faults) => {
        const params = {
            TO: selectedGroup.value,
        };
        getDataFollowingGroup(params);
        
    };

    const handleConfirmReceipt = (index) => {
        if (selectedGroup) {
            
            setAwaitingReception((prev) => (
                prev.filter(item => item.id !== id)
            ));
            toast.success("Ghi nhận thành công.");
        }
        if (awaitingReception.length <= 0) {
            onModalClose();
        }
    };

    const handleConfirmErrorReceipt = (index) => {
        if (selectedGroup) {
            let receiptSubItem = awaitingErrorReception[selectedGroup.value][index];

            switch (selectedGroup.value) {
                case "CH-LVL-TV":
                    exampleData = exampleData.map((item) => {
                        if (item?.command === receiptSubItem?.command) {
                            return {
                                ...item,
                                
                                totalBackError:
                                    Number(item.totalBackError) +
                                    Number(receiptSubItem.amount),
                            };
                        }
                        return item;
                    });

                    setCurrentData(exampleData);
                    break;
                case "CH-LVL-HT":
                    exampleData1 = exampleData1.map((item) => {
                        if (item?.command === receiptSubItem?.command) {
                            return {
                                ...item,
                                
                                totalBackError:
                                    Number(item.totalBackError) +
                                    Number(receiptSubItem.amount),
                            };
                        }

                        return item;
                    });
                    console.log("Final: ", exampleData1);
                    setCurrentData(exampleData1);
                    break;
                case "CH-LVL-KTP":
                    exampleData2 = exampleData.map((item) => {
                        if (item?.command === receiptSubItem?.command) {
                            return {
                                ...item,
                                totalBackError:
                                    Number(item.totalBackError) +
                                    Number(receiptSubItem.amount),
                            };
                        }
                        return item;
                    });

                    setCurrentData(exampleData2);
                    break;
            }

            console.log("INdex: ", index)

            setAwaitingErrorReception((prev) => {
                const groupKey = selectedGroup.value;
                const updatedGroup = awaitingErrorReception[groupKey].filter(
                    (item, i) => i !== index
                );
                console.log("Chỗ này ra gì nhỉ? ", updatedGroup);
                return {
                    ...prev,
                    [groupKey]: updatedGroup,
                };
            });
        }
        toast.success("Xác nhận thành công.");
        onModalClose();
    };

    const handleRejectReceipt = (index, reason) => {
        if (selectedGroup) {
            
            setAwaitingReception((prev) => (
                prev.filter(item => item.id !== id)
            ));
            toast.success("Huỷ bỏ & chuyển lại thành công.");
        }
        if (awaitingReception.length <= 0) {
            onModalClose();
        }
    };

    const handleRejectErrorReceipt = (index) => {
        if (selectedGroup) {
            setAwaitingReception((prev) => {
                const groupKey = selectedGroup.value;
                const updatedGroup = awaitingErrorReception[groupKey].filter(
                    (item, i) => i !== index
                );
                return {
                    ...prev,
                    [groupKey]: updatedGroup,
                };
            });
        }
        toast.success("Huỷ bỏ & chuyển lại thành công.");
        onModalClose();
    };

    const onFilterTextBoxChanged = async (e) => {
        const input = e.target.value;
        if (!input) {
            if (selectedGroup) {
                if (selectedGroup.value == "CH-LVL-TV") {
                    setCurrentData(exampleData);
                } else if (selectedGroup.value == "CH-LVL-HT") {
                    setCurrentData(exampleData1);
                } else if (selectedGroup.value == "CH-LVL-KTP") {
                    setCurrentData(exampleData2);
                } else {
                    setCurrentData([]);
                }
            }
            return;
        }
        if (input) {
            var result = currentData.filter((item) => {
                if (item.itemName.toLowerCase().includes(input.toLowerCase())) {
                    return true;
                }

                const hasSubItem = item.itemDetails.some((detail) =>
                    detail.subItemName
                        .toLowerCase()
                        .includes(input.toLowerCase())
                );

                return hasSubItem;
            });

            setCurrentData(result);
        }
    };

    useEffect(() => {
        if (loading) {
            document.body.classList.add("body-no-scroll");
        } else {
            document.body.classList.remove("body-no-scroll");
        }
    }, [loading]);

    const getDataFollowingGroup = async (params) => {
        setLoadingData(true);
        try {
            const res = await productionApi.getFinishedPlywoodGoodsList(params);

            if (typeof res?.data === "object") {
                setData(Object.values(res.data));
            } else {
                setData([]);
            }

            if (res?.noti_choxacnhan && res?.noti_choxacnhan.length > 0) {
                setAwaitingReception(res?.noti_choxacnhan);
            } else {
                setAwaitingReception([]);
            }
            // setData(res.data);
        } catch (error) {
            toast.error("Có lỗi trong quá trình lấy dữ liệu.");
        }
        setLoadingData(false);
    };

    useEffect(() => {
        (async () => {
            if (selectedGroup) {
                const isQC = groupList.find((group) => group.Code == selectedGroup.value)?.QC;
                if (isQC) {
                    setIsQualityCheck(true);
                } else {
                    setIsQualityCheck(false);
                }
                // setLoadingData(true);
                const params = {
                    TO: selectedGroup.value,
                };
                getDataFollowingGroup(params);
                if (selectedGroup.value == "CH-LVL-TV") {
                    setCurrentData(exampleData);
                } else if (selectedGroup.value == "CH-LVL-HT") {
                    setCurrentData(exampleData1);
                } else if (selectedGroup.value == "CH-LVL-KTP") {
                    setCurrentData(exampleData2);
                } else {
                    setCurrentData([]);
                }
                // setLoadingData(false);
            } else {
                const params = {
                    TO: "TH-X1SC",
                };
                getDataFollowingGroup(params);
            }
        })();
    }, [selectedGroup]);


    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center bg-transparent ">
                {/* Section */}
                <div className="w-screen mb-4 xl:mb-4 p-6 px-0 xl:p-12 xl:px-32">
                    {/* Breadcrumb */}
                    <div className="mb-4 px-4">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center">
                                        <a
                                            href="#"
                                            className="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            Workspace EDIT
                                        </a>
                                    </div>
                                </li>
                                <li aria-current="page">
                                    <div className="flex items-center">
                                        <svg
                                            className="w-3 h-3 text-gray-400 mx-1"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 6 10"
                                        >
                                            <path
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="m1 9 4-4-4-4"
                                            />
                                        </svg>
                                        <Link
                                            to="/workspace"
                                            className="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            <div>Quản lý sản xuất</div>
                                        </Link>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between mb-6 items-center px-4">
                        <div className="text-3xl md:text-3xl font-bold">
                            Nhập sản lượng ván công nghiệp
                        </div>
                    </div>

                    {/* Controller */}
                    <div className="flex justify-between mb-6 items-center gap-4">
                        <div className="my-4 mb-6 p-4 w-full border rounded-md bg-white z-0">
                            <div className="flex flex-col sm:flex-row w-full justify-end space-x-4">
                                <div className="w-full">
                                    <label
                                        htmlFor="search"
                                        className="mb-2 font-medium text-gray-900 sr-only"
                                    >
                                        Tìm kiếm
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <svg
                                                className="w-4 h-4 text-gray-500"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            type="search"
                                            id="search"
                                            className="block w-full p-2.5 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Tìm kiếm"
                                            onInput={onFilterTextBoxChanged}
                                            required
                                        />
                                    </div>
                                </div>
                                {selectedGroup &&
                                    awaitingErrorReception[selectedGroup?.value]
                                        ?.length > 0 && (
                                        <button
                                            onClick={onErrorModalOpen}
                                            className="!ml-0 mt-3 sm:mt-0 sm:!ml-4 w-full sm:w-fit backdrop:sm:w-fit h-full space-x-2 inline-flex items-center bg-red-500 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                        >
                                            <HiMiniBellAlert className="text-xl" />
                                            <div className="w-full whitespace-nowrap">
                                                Thông báo: Có phôi lỗi chờ xử lý
                                            </div>
                                        </button>
                                    )}
                                {selectedGroup && !loadingData && 
                                    awaitingReception?.length > 0 && (
                                        <button
                                            onClick={onModalOpen}
                                            className="!ml-0 mt-3 sm:mt-0 sm:!ml-4 w-full sm:w-fit backdrop:sm:w-fit h-full space-x-2 inline-flex items-center bg-green-500 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                        >
                                            <HiMiniBellAlert className="text-xl" />
                                            <div className="w-full whitespace-nowrap">
                                                Thông báo: Có phôi chờ nhận
                                            </div>
                                        </button>
                                    )}
                            </div>

                            <label className="block mb-2 text-md font-medium text-gray-900 mt-4">
                                Tổ & Xưởng sản xuất
                            </label>
                            <Select
                                // isDisabled={true}
                                ref={groupSelectRef}
                                options={groupListOptions}
                                // defaultValue={groupListOptions[0]}
                                defaultValue={selectedGroup}
                                onChange={(value) => setSelectedGroup(value)}
                                placeholder="Tìm kiếm"
                                className="mt-3 mb-8"
                            />

                            <div className="flex flex-col gap-4 my-4">
                                {loadingData ? (
                                    <Stack>
                                        <Skeleton height="250px" />
                                        <Skeleton height="250px" />
                                    </Stack>
                                ) : data.length > 0 ? (
                                    data.map((item, index) => (
                                        <PlyWoodItemInput
                                            data={item}
                                            index={index}
                                            key={index}
                                            selectedGroup={selectedGroup}
                                            // fatherCode={data}
                                            nextGroup={item.nextGroup}
                                            fromGroup={item.fromGroup}
                                            // isQualityCheck={isQualityCheck}
                                            onReceiptFromChild={
                                                handleReceiptFromChild
                                            }
                                            onRejectFromChild={
                                                handleRejectFromChild
                                            }
                                        />
                                    ))
                                ) : (
                                    <span className="text-center">
                                        Không có dữ liệu
                                    </span>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                isCentered
                isOpen={isModalOpen}
                size="4xl"
                onClose={onModalClose}
                scrollBehavior="inside"
            >
                <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                <ModalContent>
                    <ModalHeader>
                        <h1 className="text-xl lg:text-2xl text-bold text-[#17506B]">
                            Danh sách phôi chờ nhận
                        </h1>
                    </ModalHeader>
                    <ModalCloseButton />
                    <div className="border-b-2 border-gray-100"></div>
                    <ModalBody>
                        <div className="flex flex-col sm:flex-row gap-6 sm:gap-4 justify-center ">
                            {selectedGroup && awaitingReception?.length > 0 ? (
                                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 lg:grid-cols-3">
                                    {awaitingReception.map((item, index) => (
                                        <AwaitingReception
                                            type="plywood"
                                            data={item}
                                            key={index}
                                            index={index}
                                            isQualityCheck={isQualityCheck}
                                            onConfirmReceipt={
                                                handleConfirmReceipt
                                            }
                                            onRejectReceipt={
                                                handleRejectReceipt
                                            }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex w-full h-full justify-center items-center">Không có dữ liệu</div>
                            )}
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <Modal
                isCentered
                isOpen={isErrorModalOpen}
                size="4xl"
                onClose={onErrorModalClose}
                scrollBehavior="inside"
            >
                <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                <ModalContent>
                    <ModalHeader>
                        <h1 className="text-xl lg:text-2xl text-bold text-[#17506B]">
                            Danh sách phôi lỗi chờ xử lý
                        </h1>
                    </ModalHeader>
                    <ModalCloseButton />
                    <div className="border-b-2 border-gray-100"></div>
                    <ModalBody>
                        <div className="flex flex-col sm:flex-row gap-6 sm:gap-4 justify-center ">
                            {selectedGroup &&
                                awaitingErrorReception[selectedGroup?.value]
                                    ?.length > 0 &&
                                awaitingErrorReception[
                                    selectedGroup?.value
                                ].map((item, index) => (
                                    <AwaitingErrorReception
                                        type="plywood"
                                        data={item}
                                        key={index}
                                        index={index}
                                        onConfirmErrorReceipt={
                                            handleConfirmErrorReceipt
                                        }
                                        onRejectErrorReceipt={
                                            handleRejectErrorReceipt
                                        }
                                    />
                                ))}
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <AlertDialog
                isOpen={isAlertDialogOpen}
                onClose={onAlertDialogClose}
                closeOnOverlayClick={false}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>Xác nhận </AlertDialogHeader>
                        <AlertDialogBody>
                            <div className="text-green-700">
                                Ghi nhận sản lượng:{" "}
                                <span className="font-bold">52</span>{" "}
                            </div>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={onAlertDialogClose}>Huỷ bỏ</Button>
                            <Button
                                colorScheme="red"
                                // onClick={}
                                ml={3}
                            >
                                Xác nhận
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            {loading && <Loader />}
        </Layout>
    );
}

export default PlywoodFinishedGoodsReceipt;