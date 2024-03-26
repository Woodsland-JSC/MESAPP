import React, { useEffect, useState, useRef } from "react";
import Layout from "../../layouts/layout";
import { Link, useNavigate } from "react-router-dom";
import { HiPlus, HiArrowLeft } from "react-icons/hi";
import {
    // Step,
    // StepDescription,
    // StepIcon,
    // StepIndicator,
    // StepNumber,
    // StepSeparator,
    // StepStatus,
    // StepTitle,
    // Stepper,
    // Box,
    // Modal,
    // ModalOverlay,
    // ModalContent,
    // ModalHeader,
    // ModalFooter,
    // ModalBody,
    // ModalCloseButton,
    // Button,
    // Card,
    // CardHeader,
    // CardBody,
    // CardFooter,
    // Heading,
    // Stack,
    // StackDivider,
    // NumberInput,
    // NumberInputField,
    // NumberInputStepper,
    // NumberIncrementStepper,
    // NumberDecrementStepper,
    // useSteps,
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
    SkeletonCircle,
    SkeletonText,
    Stack,
    useDisclosure,
} from "@chakra-ui/react";
import { HiMiniBellAlert } from "react-icons/hi2";
import Select, { components } from "react-select";
import AsyncSelect from "react-select/async";
import toast from "react-hot-toast";
import productionApi from "../../api/productionApi";
import FinishedGoodsIllustration from "../../assets/images/wood-receipt-illustration.png";
import Loader from "../../components/Loader";
import useAppContext from "../../store/AppContext";
import ItemInput from "../../components/ItemInput";
import AwaitingReception from "../../components/AwaitingReception";

const steps = [
    { title: "Bước 1", description: "Chọn loại sản phẩm" },
    { title: "Bước 2", description: "Kiểm tra thông tin" },
    { title: "Bước 3", description: "Nhập số lượng sản phẩm" },
];

var waitingReceiptNotifications = [
    {
        id: 70152702,
        subItemName: "TYBYN Bàn bar 74 đen - Mặt trên AD",
        thickness: 15,
        width: 367.5,
        length: 740,
        amount: 2,
        createdDate: new Date(),
        createdBy: {
            id: 54,
            last_name: "Nguyen",
            first_name: "An",
        },
        fromGroup: {
            id: "TH-X3SC",
            no: 3,
            name: "Tổ Sơ chế X3",
        },
    },
];

var exampleData = [
    {
        id: 1,
        itemName: "TYBYN bar table 74x74x102 acacia/black",
        previousGroup: null,
        fromGroup: {
            id: "TH-X3SC",
            no: 3,
            name: "Tổ Sơ chế X3",
        },
        nextGroup: {
            id: "TH-X3TC1",
            no: 4,
            name: "Tổ Tinh chế 1 X3",
        },
        itemDetails: [
            {
                id: 70152702,
                subItemName: "TYBYN Bàn bar 74 đen - Mặt trên AD",
                thickness: 15,
                width: 367.5,
                length: 740,
                stockQuantity: 420,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2344TP-01",
                        quantity: 960,
                        done: 719,
                        faults: 0,
                        processing: 241,
                    },
                    {
                        command: "TH2344TP-02",
                        quantity: 800,
                        done: 400,
                        faults: 2,
                        processing: 398,
                    },
                ],
                totalQuantity: 1760,
                totalDone: 1119,
                totalFaults: 2,
                totalProcessing: 641,
            },
            {
                id: 70152703,
                subItemName: "TYBYN Bàn bar 74 đen - Mặt dưới CD",
                thickness: 30,
                width: 35,
                length: 40,
                stockQuantity: 0,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2344TP-01",
                        quantity: 500,
                        done: 300,
                        faults: 1,
                        processing: 199,
                    },
                ],
                totalQuantity: 500,
                totalDone: 300,
                totalFaults: 1,
                totalProcessing: 199,
            },
        ],
    },
    {
        id: 2,
        itemName: "TJUSIG hanger 78",
        previousGroup: null,
        fromGroup: {
            id: "TH-X3SC",
            no: 3,
            name: "Tổ Sơ chế X3",
        },
        nextGroup: {
            id: "TH-X3TC2",
            no: 4,
            name: "Tổ Tinh chế 2 X3",
        },
        itemDetails: [
            {
                id: 70421102,
                subItemName: "TJUSIG Hanger 78 - Phần nối vào tường",
                thickness: 30,
                width: 35,
                length: 40,
                stockQuantity: 20,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2345TP-02",
                        quantity: 10800,
                        done: 4494,
                        faults: 0,
                        processing: 6306,
                    },
                    {
                        command: "TH2346TP-02",
                        quantity: 4800,
                        done: 0,
                        faults: 0,
                        processing: 4800,
                    },
                ],
                totalQuantity: 15600,
                totalDone: 4494,
                totalFaults: 0,
                totalProcessing: 11106,
            },
            {
                id: 70421103,
                subItemName: "TJUSIG Hanger 78 - Thân móc áo",
                thickness: 30,
                width: 30,
                length: 780,
                stockQuantity: 630,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2345TP-02",
                        quantity: 5400,
                        done: 1107,
                        faults: 0,
                        processing: 4293,
                    },
                    {
                        command: "TH2346TP-02",
                        quantity: 2400,
                        done: 0,
                        faults: 0,
                        processing: 2400,
                    },
                ],
                totalQuantity: 7800,
                totalDone: 1107,
                totalFaults: 0,
                totalProcessing: 6693,
            },
            {
                id: 70421104,
                subItemName: "TJUSIG Hanger 78 - Tay móc áo",
                thickness: 26,
                width: 26,
                length: 115,
                stockQuantity: 0,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2346TP-02",
                        quantity: 14400,
                        done: 0,
                        faults: 0,
                        processing: 14400,
                    },
                ],
                totalQuantity: 14400,
                totalDone: 0,
                totalFaults: 0,
                totalProcessing: 14400,
            },
        ],
    },
];

var exampleData1 = [
    {
        id: 1,
        itemName: "TYBYN bar table 74x74x102 acacia/black",
        previousGroup: {
            id: "TH-X3SC",
            no: 3,
            name: "Tổ Sơ chế X3",
        },
        fromGroup: {
            id: "TH-X3TC1",
            no: 4,
            name: "Tổ Tinh chế 1 X3",
        },
        nextGroup: {
            id: "TH-X3S",
            no: 6,
            name: "Tổ Sơn X3",
        },
        itemDetails: [
            {
                id: 70152702,
                subItemName: "TYBYN Bàn bar 74 đen - Mặt trên AD",
                thickness: 15,
                width: 367.5,
                length: 740,
                stockQuantity: 1000,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2344TP-01",
                        quantity: 960,
                        done: 719,
                        faults: 0,
                        processing: 241,
                    },
                    {
                        command: "TH2344TP-02",
                        quantity: 800,
                        done: 400,
                        faults: 2,
                        processing: 398,
                    },
                ],
                totalQuantity: 1760,
                totalDone: 1119,
                totalFaults: 2,
                totalProcessing: 641,
            },
            {
                id: 70152703,
                subItemName: "TYBYN Bàn bar 74 đen - Mặt dưới CD",
                thickness: 15,
                width: 367.5,
                length: 740,
                stockQuantity: 0,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2344TP-01",
                        quantity: 500,
                        done: 300,
                        faults: 1,
                        processing: 199,
                    },
                ],
                totalQuantity: 500,
                totalDone: 300,
                totalFaults: 1,
                totalProcessing: 199,
            },
        ],
    },
];

var exampleData2 = [
    {
        id: 2,
        itemName: "TJUSIG hanger 78",
        previousGroup: {
            id: "TH-X3SC",
            no: 3,
            name: "Tổ Sơ chế X3",
        },
        fromGroup: {
            id: "TH-X3TC2",
            no: 4,
            name: "Tổ Tinh chế 2 X3",
        },
        nextGroup: {
            id: "TH-X3S",
            no: 6,
            name: "Tổ Sơn X3",
        },
        itemDetails: [
            {
                id: 70421102,
                subItemName: "TJUSIG Hanger 78 - Phần nối vào tường",
                thickness: 30,
                width: 35,
                length: 40,
                stockQuantity: 1000,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2345TP-02",
                        quantity: 10800,
                        done: 4494,
                        faults: 0,
                        processing: 6306,
                    },
                    {
                        command: "TH2346TP-02",
                        quantity: 4800,
                        done: 0,
                        faults: 0,
                        processing: 4800,
                    },
                ],
                totalQuantity: 15600,
                totalDone: 4494,
                totalFaults: 0,
                totalProcessing: 11106,
            },
            {
                id: 70421103,
                subItemName: "TJUSIG Hanger 78 - Thân móc áo",
                thickness: 30,
                width: 30,
                length: 780,
                stockQuantity: 630,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2345TP-02",
                        quantity: 5400,
                        done: 1107,
                        faults: 0,
                        processing: 4293,
                    },
                    {
                        command: "TH2346TP-02",
                        quantity: 2400,
                        done: 0,
                        faults: 0,
                        processing: 2400,
                    },
                ],
                totalQuantity: 7800,
                totalDone: 1107,
                totalFaults: 0,
                totalProcessing: 6693,
            },
            {
                id: 70421104,
                subItemName: "TJUSIG Hanger 78 - Tay móc áo",
                thickness: 26,
                width: 26,
                length: 115,
                stockQuantity: 0,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2346TP-02",
                        quantity: 14400,
                        done: 0,
                        faults: 0,
                        processing: 14400,
                    },
                ],
                totalQuantity: 14400,
                totalDone: 0,
                totalFaults: 0,
                totalProcessing: 14400,
            },
        ],
    },
];

function FinishedGoodsReceipt() {
    const navigate = useNavigate();
    // const { loading, setLoading } = useAppContext();
    const groupSelectRef = useRef();

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

    // const { activeStep, setActiveStep } = useSteps({
    //     index: 0,
    //     count: steps.length,
    // });
    // const { isOpen, onOpen, onClose } = useDisclosure();

    // const [awaitingReception, setAwaitingReception] = useState({
    //     "TH-X3SC": [],
    //     "TH-X3TC1": [],
    //     "TH-X3TC2": [],
    //     "TH-X3S": [],
    // });
    const [awaitingReception, setAwaitingReception] = useState([]);

    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [finishedProductData, setFinishedProductData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(false);

    const [currentData, setCurrentData] = useState(exampleData);
    const [groupListOptions, setGroupListOptions] = useState([]);
    const [groupList, setGroupList] = useState([]);

    const [selectedGroup, setSelectedGroup] = useState(null);
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

    const handleConfirmReceipt = (id) => {
        if (selectedGroup) {
            setAwaitingReception((prev) =>
                prev.filter((item) => item.id !== id)
            );
            toast.success("Ghi nhận thành công.");
        }
        if (awaitingReception.length <= 0) {
            onModalClose();
        }
    };

    const handleRejectReceipt = (id) => {
        if (selectedGroup) {
            setAwaitingReception((prev) =>
                prev.filter((item) => item.id !== id)
            );
            toast.success("Huỷ bỏ & chuyển lại thành công.");
            // setAwaitingReception((prev) => {
            //     const groupKey = selectedGroup.value;
            //     const updatedGroup = awaitingReception[groupKey].filter(
            //         (item, i) => i !== index
            //     );
            //     return {
            //         ...prev,
            //         [groupKey]: updatedGroup,
            //     };
            // });
        }
        if (awaitingReception.length <= 0) {
            onModalClose();
        }
        // console.log("Ra index: ", index);
        // console.log("Thực hiện reject: ", reason);
        // console.log("Ra example data: ", exampleData);
    };

    const onFilterTextBoxChanged = async (e) => {
        const input = e.target.value;
        if (!input) {
            if (selectedGroup) {
                if (selectedGroup.value == "TH-X3SC") {
                    setCurrentData(exampleData);
                } else if (selectedGroup.value == "TH-X3TC1") {
                    setCurrentData(exampleData1);
                } else if (selectedGroup.value == "TH-X3TC2") {
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

    // useEffect(() => {
    //     const getAllGroup = async () => {
    //         setLoading(true);
    //         try {
    //             const res = await productionApi.getGroup();
    //             const options = res.map((item) => ({
    //                 value: item.Code,
    //                 label: item.Name + " - " + item.Code,
    //             }));
    //             setGroupList(res);
    //             setGroupListOptions(options);
    //             // setSelectedGroup(options[0]);
    //             groupSelectRef.current.setValue(options[0]);
    //         } catch (error) {
    //             toast.error("Có lỗi xảy ra khi load danh sách tổ.");
    //         }
    //         setLoading(false);
    //     };
    //     getAllGroup();
    //     document.title = "Woodsland - Nhập sản lượng chế biến gỗ";
    //     return () => {
    //         document.title = "Woodsland";
    //         document.body.classList.remove("body-no-scroll");
    //     };
    // }, []);

    // New Get All Group
    useEffect(() => {
        const getAllGroupWithoutQC = async () => {
            setLoading(true);
            try {
                const res = await productionApi.getAllGroupWithoutQC();
                const options = res.map((item) => ({
                    value: item.Code,
                    label: item.Name + " - " + item.Code,
                }));
                setGroupList(res);
                setGroupListOptions(options);
                console.log("New Get All Group: ", options);
                // setSelectedGroup(options[0]);
                groupSelectRef?.current?.setValue(options[0]);
            } catch (error) {
                toast.error("Có lỗi xảy ra khi load danh sách tổ.");
                console.error(error);
            }
            setLoading(false);
        };
        getAllGroupWithoutQC();
        document.title = "Woodsland - Nhập sản lượng ván công nghiệp";
        return () => {
            document.title = "Woodsland";
            document.body.classList.remove("body-no-scroll");
        };
    }, []);

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
            const res = await productionApi.getFinishedGoodsList(params);
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
                const isQC = groupList.find(
                    (group) => group.Code == selectedGroup.value
                )?.QC;
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

                if (selectedGroup.value == "TH-X3SC") {
                    setCurrentData(exampleData);
                } else if (selectedGroup.value == "TH-X3TC1") {
                    setCurrentData(exampleData1);
                } else if (selectedGroup.value == "TH-X3TC2") {
                    setCurrentData(exampleData2);
                } else {
                    setCurrentData([]);
                }
                // setLoadingData(false);
            }
        })();
    }, [selectedGroup]);

    // Search data
    // const searchItems = (data, searchTerm) => {
    //     if (!searchTerm) {
    //         return data;
    //     }

    //     const filteredData = [];

    //     for (const key in data) {
    //         const item = data[key];
    //         const filteredDetails = item.Details.filter((detail) => {
    //             const subitem = `${detail.ChildName} (${detail.CDay}*${detail.CRong}*${detail.CDai})`;
    //             return subitem.includes(searchTerm);
    //         });

    //         if (filteredDetails.length > 0) {
    //             filteredData[key] = { ...item, Details: filteredDetails };
    //         }
    //     }

    //     return filteredData;
    // };
    const searchItems = (data, searchTerm) => {
        if (!searchTerm) {
            return data;
        }
    
        const filteredData = [];
    
        for (const key in data) {
            const item = data[key];
            const filteredDetails = item.Details.filter((detail) => {
                const subitem = `${detail.ChildName} (${detail.CDay}*${detail.CRong}*${detail.CDai})`;
    
                // Chuyển đổi cả searchTerm và subitem về chữ thường hoặc chữ hoa trước khi so sánh
                const searchTermLower = searchTerm.toLowerCase();
                const subitemLower = subitem.toLowerCase();
    
                return subitemLower.includes(searchTermLower);
            });
    
            if (filteredDetails.length > 0) {
                filteredData[key] = { ...item, Details: filteredDetails };
            }
        }
    
        return filteredData;
    };

    const searchResult = searchItems(data, searchTerm);

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
                                            Workspace
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
                        <div className="text-3xl font-bold ">
                            Nhập sản lượng chế biến gỗ
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
                                            className="block w-full p-2 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Tìm kiếm"
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                {selectedGroup &&
                                    !loadingData &&
                                    awaitingReception?.length > 0 && (
                                        <button
                                            onClick={onModalOpen}
                                            className="!ml-0 mt-3 sm:mt-0 sm:!ml-4 w-full sm:w-fit backdrop:sm:w-fit h-full space-x-2 inline-flex items-center bg-green-500 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                        >
                                            <HiMiniBellAlert className="text-xl" />
                                            <div className="w-full whitespace-nowrap">
                                                Thông báo: Có phôi chờ xác nhận
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
                                defaultValue={selectedGroup}
                                onChange={(value) => {
                                    setSelectedGroup(value);
                                }}
                                placeholder="Tìm kiếm"
                                className="mt-3 mb-8"
                            />

                            <div className="flex flex-col gap-4 my-4">
                                {loadingData ? (
                                    <Stack>
                                        <Skeleton height="250px" />
                                        <Skeleton height="250px" />
                                    </Stack>
                                ) : searchResult.length > 0 ? (
                                    searchResult.map((item, index) => (
                                        <ItemInput
                                            data={item}
                                            index={index}
                                            key={index}
                                            selectedGroup={selectedGroup}
                                            searchTerm={searchTerm}
                                            // fatherCode={data}
                                            nextGroup={item.nextGroup}
                                            fromGroup={item.fromGroup}
                                            isQualityCheck={isQualityCheck}
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
                size="full"
                // size=""
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
                    <ModalBody className="!px-2">
                        <div className="flex gap-4 justify-center h-full">
                            {selectedGroup && awaitingReception?.length > 0 ? (
                                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 lg:grid-cols-3">
                                    {awaitingReception.map((item, index) => (
                                        <AwaitingReception
                                            type="wood-processing"
                                            data={item}
                                            key={index}
                                            variant="CBG"
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
                                <div className="flex w-full h-full justify-center items-center">
                                    Không có dữ liệu
                                </div>
                            )}
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

export default FinishedGoodsReceipt;
