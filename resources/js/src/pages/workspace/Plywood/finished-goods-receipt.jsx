import React, { useEffect, useState, useRef } from "react";
import Layout from "../../../layouts/layout";
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
import AwaitingReception from "../../../components/AwaitingReception";
import AwaitingErrorReception from "../../../components/AwaitingErrorReception";

const steps = [
    { title: "Bước 1", description: "Chọn loại sản phẩm" },
    { title: "Bước 2", description: "Kiểm tra thông tin" },
    { title: "Bước 3", description: "Nhập số lượng sản phẩm" },
];

const groupList = [
    {
        id: "CH-LVL-TV",
        no: 1,
        name: "Tạo ván (CH)",
    },
    {
        id: "CH-PLY-XV",
        no: 1,
        name: "Xếp ván PLY (CH)",
    },
    {
        id: "CH-LVL-HT",
        no: 2,
        name: "Hoàn thiện LVL (CH)",
    },
    {
        id: "CH-PLY-LL",
        no: 2,
        name: "Lên lớp PLY (CH)",
    },
    {
        id: "CH-PLY-TV",
        no: 2,
        name: "Tạo ván PLY (CH)",
    },
    {
        id: "CH-LVL-KTP",
        no: 3,
        name: "Kho thành phẩm LVL (CH)",
    },
    {
        id: "CH-PLY-LV",
        no: 3,
        name: "Lọc ván PLY (CH)",
    },
    {
        id: "CH-PLY-KVC",
        no: 4,
        name: "Kho ván cốt PLY (CH)",
    },
    // {
    //     id: "TH-X3ĐG",
    //     no: 7,
    //     name: "Tổ Đóng gói X3",
    // },
];

const groupListOptions = [
    {
        value: "CH-LVL-TV",
        label: "1. Tạo ván (CH) - CH-LVL-TV",
    },
    {
        value: "CH-PLY-XV",
        label: "1. Xếp ván PLY (CH) - CH-PLY-XV",
    },
    {
        value: "CH-LVL-HT",
        label: "2. Hoàn thiện LVL (CH) - CH-LVL-HT",
    },
    {
        value: "CH-PLY-LL",
        label: "2. Lên lớp PLY (CH) - CH-PLY-LL",
    },
    {
        value: "CH-PLY-TV",
        label: "2. Tạo ván PLY (CH) - CH-PLY-TV",
    },
    {
        value: "CH-LVL-KTP",
        label: "3. Kho thành phẩm LVL (CH) - CH-LVL-KTP",
    },
    {
        value: "CH-PLY-LV",
        label: "3. Lọc ván PLY (CH) - CH-PLY-LV",
    },
    {
        value: "CH-PLY-KVC",
        label: "4. Kho ván cốt PLY (CH) - CH-PLY-KVC",
    },
    // {
    //     value: "TH-X3ĐG",
    //     label: "7. Tổ Đóng gói X3 - TH-X3ĐG",
    // },
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
        command: "VCN-CH-PLY-08.09.23-C15.2Bi",
        itemId: 10025,
        itemName: "Ván cốt 18 chờ lên lớp CH",
        previousGroup: null,
        fromGroup: {
            id: "CH-LVL-TV",
            no: 1,
            name: "Tạo ván (CH)",
        },
        nextGroup: {
            id: "CH-LVL-HT",
            no: 2,
            name: "Hoàn thiện LVL (CH)",
        },
        thickness: 15.2,
        width: 1220,
        length: 2440,
        stockQuantity: 4,
        furthestQuantity: 1322,
        allCommandQuantity: 0,
        pendingErrors: [],
        pendingReceipts: [],
        returns: [],
        totalDone: 2026,
        totalStageError: 12,
        totalBackError: 0,
        totalTypeError: 0,
    },
    {
        command: "VCN-CH-PLY-07.10.23-C15WN",
        itemId: 10027,
        itemName: "Ván cốt 15 WANEK",
        previousGroup: null,
        fromGroup: {
            id: "CH-LVL-TV",
            no: 1,
            name: "Tạo ván (CH)",
        },
        nextGroup: {
            id: "CH-LVL-HT",
            no: 2,
            name: "Hoàn thiện LVL (CH)",
        },
        thickness: 15,
        width: 1220,
        length: 2440,
        stockQuantity: 4,
        furthestQuantity: 2502,
        allCommandQuantity: 5,
        pendingErrors: [],
        pendingReceipts: [],
        returns: [],
        totalStageError: 1,
        totalBackError: 0,
        totalTypeError: 0,
    },
    {
        command: "VCN-CH-PLY-09.10.23-C15WN",
        itemId: 10027,
        itemName: "Ván cốt 15 WANEK",
        previousGroup: null,
        fromGroup: {
            id: "CH-LVL-TV",
            no: 1,
            name: "Tạo ván (CH)",
        },
        nextGroup: {
            id: "CH-LVL-HT",
            no: 2,
            name: "Hoàn thiện LVL (CH)",
        },
        thickness: 15,
        width: 1220,
        length: 2440,
        stockQuantity: 4,
        furthestQuantity: 1002,
        allCommandQuantity: 142,
        pendingErrors: [],
        pendingReceipts: [],
        returns: [],
        totalStageError: 0,
        totalBackError: 0,
        totalTypeError: 0,
    },
    {
        command: "VCN-CH-PLY-10.10.23-C15WN",
        itemId: 10027,
        itemName: "Ván cốt 15 WANEK",
        previousGroup: null,
        fromGroup: {
            id: "CH-LVL-TV",
            no: 1,
            name: "Tạo ván (CH)",
        },
        nextGroup: {
            id: "CH-LVL-HT",
            no: 2,
            name: "Hoàn thiện LVL (CH)",
        },
        thickness: 15,
        width: 1220,
        length: 2440,
        stockQuantity: 4,
        furthestQuantity: 3256,
        allCommandQuantity: 175,
        pendingErrors: [],
        pendingReceipts: [],
        returns: [],
        totalStageError: 3,
        totalBackError: 7,
        totalTypeError: 5,
    },
];

var exampleData1 = [
    {
        command: "VCN-CH-PLY-08.09.23-C15.2Bi",
        itemId: 10025,
        itemName: "Ván cốt 18 chờ lên lớp CH",
        previousGroup: {
            id: "CH-LVL-TV",
            no: 1,
            name: "Tạo ván (CH)",
        },
        fromGroup: {
            id: "CH-LVL-HT",
            no: 2,
            name: "Hoàn thiện LVL (CH)",
        },
        nextGroup: {
            id: "CH-LVL-KTP",
            no: 3,
            name: "Kho thành phẩm LVL (CH)",
        },
        thickness: 15.2,
        width: 1220,
        length: 2440,
        stockQuantity: 4,
        furthestQuantity: 2014,
        allCommandQuantity: 0,
        pendingErrors: [],
        pendingReceipts: [],
        returns: [],
        totalDone: 1785,
        totalStageError: 30,
        totalBackError: 15,
        totalTypeError: 14,
    },
];

var exampleData2 = [
    {
        command: "VCN-CH-PLY-07.10.23-C15WN",
        itemId: 10027,
        itemName: "Ván cốt 15 WANEK",
        previousGroup: null,
        fromGroup: {
            id: "CH-LVL-TV",
            no: 1,
            name: "Tạo ván (CH)",
        },
        nextGroup: {
            id: "CH-LVL-HT",
            no: 2,
            name: "Hoàn thiện LVL (CH)",
        },
        thickness: 15,
        width: 1220,
        length: 2440,
        stockQuantity: 4,
        furthestQuantity: 1120,
        allCommandQuantity: 15,
        pendingErrors: [],
        pendingReceipts: [],
        returns: [],
        totalStageError: 0,
        totalBackError: 0,
        totalTypeError: 0,
    },
];

function PlywoodFinishedGoodsReceipt() {
    const navigate = useNavigate();
    const { loading, setLoading } = useAppContext();

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

    // const { activeStep, setActiveStep } = useSteps({
    //     index: 0,
    //     count: steps.length,
    // });
    // const { isOpen, onOpen, onClose } = useDisclosure();

    const [awaitingReception, setAwaitingReception] = useState({
        "CH-LVL-TV": [],
        "CH-PLY-XV": [],
        "CH-LVL-HT": [],
        "CH-PLY-LL": [],
        "CH-PLY-TV": [],
        "CH-LVL-KTP": [],
        "CH-PLY-LV": [],
        "CH-PLY-KVC": [],
    });

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

    const [currentData, setCurrentData] = useState(exampleData);

    // const [goodsReceiptList, setGoodsReceiptList] = useState([]);
    // const [goodsReceiptOptions, setGoodsReceiptOptions] = useState([]);

    // const [selectedItem, setSelectedItem] = useState(null);
    // const [amount, setAmount] = useState(1);

    // const loadGoodsReceipt = (inputValue, callback) => {
    //     productionApi
    //         .getFinishedGoodsList()
    //         .then((data) => {
    //             const filteredOptions = data.filter((option) => {
    //                 return (
    //                     option.ItemName?.toLowerCase().includes(
    //                         inputValue.toLowerCase()
    //                     ) ||
    //                     option.ItemCode?.toLowerCase().includes(
    //                         inputValue.toLowerCase()
    //                     )
    //                 );
    //             });

    //             const asyncOptions = filteredOptions.map((item) => ({
    //                 value: item.ItemCode,
    //                 label: item.ItemCode + " - " + item.ItemName,
    //             }));

    //             callback(asyncOptions);
    //         })
    //         .catch((error) => {
    //             console.error("Error fetching sap id:", error);
    //             callback([]);
    //         });
    // };

    // const handleCompletion = () => {
    //     console.log("Selected Kiln:", selectedKiln.value);
    //     console.log(
    //         "Selected Drying Reasons Plan:",
    //         selectedDryingReasonsPlan.value
    //     );
    //     console.log("Selected Thickness:", selectedThickness);
    // };

    // const goBack = () => {
    //     setActiveStep(activeStep - 1);
    // };

    // const handleSubmit = async () => {
    //     if (selectedItem && amount) {
    //         setLoading(true);
    //         try {
    //             const data = {
    //                 ItemCode: selectedItem.value,
    //                 Qty: amount,
    //             };
    //             const res = await productionApi.enterFinishedGoodsAmount(data);
    //             toast.success("Ghi nhận thành công.");
    //             navigate(0);
    //             setLoading(false);
    //         } catch (error) {
    //             toast.error("Có lỗi xảy ra.");
    //             setLoading(false);
    //         }
    //     } else {
    //         toast("Vui lòng chọn sản phẩm.");
    //     }
    // };

    const [selectedGroup, setSelectedGroup] = useState(groupListOptions[0]);

    const handleReceiptFromChild = (data, receipts) => {
        const groupId = data?.nextGroup?.id;
        if (groupId) {
            setAwaitingReception((prev) => ({
                ...prev,
                [groupId]: [...prev[groupId], data],
            }));
        }
        const currentGroupId = data?.fromGroup?.id;

        switch (currentGroupId) {
            case "CH-LVL-TV":
                exampleData = exampleData.map((item) => {
                    if (item.command === data.command) {
                        return {
                            ...item,
                            // itemDetails: item.map((detail) => {
                            //     if (detail.id === data.id) {
                            //         return {
                            //             ...detail,
                            //             pendingReceipts: [
                            //                 ...detail.pendingReceipts,
                            //                 receipts,
                            //             ],
                            //             stockQuantity:
                            //                 Number(detail.stockQuantity) -
                            //                 Number(data.amount),
                            //         };
                            //     }
                            //     return detail;
                            // }),
                            pendingReceipts: [
                                ...item.pendingReceipts,
                                receipts,
                            ],
                            stockQuantity:
                                Number(item.stockQuantity) -
                                Number(data.amount),
                        };
                    }
                    return item;
                });
                setCurrentData(exampleData);
                break;
            case "CH-LVL-HT":
                exampleData1 = exampleData1.map((item) => {
                    if (item.id === data.itemId) {
                        return {
                            ...item,
                            // itemDetails: item.itemDetails.map((detail) => {
                            //     if (detail.id === data.id) {
                            //         return {
                            //             ...detail,
                            //             pendingReceipts: [
                            //                 ...detail.pendingReceipts,
                            //                 receipts,
                            //             ],
                            //             stockQuantity:
                            //                 Number(detail.stockQuantity) -
                            //                 Number(data.amount),
                            //         };
                            //     }
                            //     return detail;
                            // }),
                            pendingReceipts: [
                                ...item.pendingReceipts,
                                receipts,
                            ],
                            stockQuantity:
                                Number(item.stockQuantity) -
                                Number(data.amount),
                        };
                    }
                    return item;
                });
                console.log("Final: ", exampleData1);
                setCurrentData(exampleData1);
                break;
            case "CH-LVL-KTP":
                exampleData2 = exampleData.map((item) => {
                    if (item.id === data.itemId) {
                        return {
                            ...item,
                            // itemDetails: item.itemDetails.map((detail) => {
                            //     if (detail.id === data.id) {
                            //         return {
                            //             ...detail,
                            //             pendingReceipts: [
                            //                 ...detail.pendingReceipts,
                            //                 receipts,
                            //             ],
                            //             stockQuantity:
                            //                 Number(detail.stockQuantity) -
                            //                 Number(data.amount),
                            //         };
                            //     }
                            //     return detail;
                            // }),
                            pendingReceipts: [
                                ...item.pendingReceipts,
                                receipts,
                            ],
                            stockQuantity:
                                Number(item.stockQuantity) -
                                Number(data.amount),
                        };
                    }
                    return item;
                });
                setCurrentData(exampleData2);
                break;
        }
        console.log("Dữ liệu nhận từ con:", data);
        // setDataFromChild(data);
    };

    const handleRejectFromChild = (data, faults) => {
        const currentGroupId = data?.fromGroup?.id;

        switch (currentGroupId) {
            case "CH-LVL-TV":
                exampleData = exampleData.map((item) => {
                    if (item.id === data.itemId) {
                        return {
                            ...item,
                            pendingErrors: [...item.pendingErrors, faults],
                            stockQuantity:
                                Number(item.stockQuantity) -
                                Number(data.amount),
                            // ...item,
                            // itemDetails: item.itemDetails.map((detail) => {
                            //     if (detail.id === data.id) {
                            //         return {
                            //             ...detail,
                            //             pendingErrors: [
                            //                 ...detail.pendingErrors,
                            //                 faults,
                            //             ],
                            //             stockQuantity:
                            //                 Number(detail.stockQuantity) -
                            //                 Number(data.amount),
                            //         };
                            //     }
                            //     return detail;
                            // }),
                        };
                    }
                    return item;
                });
                setCurrentData(exampleData);
                // console.log("hm ra nhiều: ", exampleData);
                break;
            case "CH-LVL-HT":
                exampleData1 = exampleData1.map((item) => {
                    if (item.id === data.itemId) {
                        return {
                            ...item,
                            pendingErrors: [...item.pendingErrors, faults],
                            stockQuantity:
                                Number(item.stockQuantity) -
                                Number(data.amount),
                            // ...item,
                            // itemDetails: item.itemDetails.map((detail) => {
                            //     if (detail.id === data.id) {
                            //         return {
                            //             ...detail,
                            //             pendingErrors: [
                            //                 ...detail.pendingErrors,
                            //                 faults,
                            //             ],
                            //             stockQuantity:
                            //                 Number(detail.stockQuantity) -
                            //                 Number(data.amount),
                            //         };
                            //     }
                            //     return detail;
                            // }),
                        };
                    }
                    return item;
                });
                console.log("Final: ", exampleData1);
                setCurrentData(exampleData1);
                break;
            case "CH-LVL-KTP":
                exampleData2 = exampleData.map((item) => {
                    if (item.id === data.itemId) {
                        return {
                            ...item,
                            pendingErrors: [...item.pendingErrors, faults],
                            stockQuantity:
                                Number(item.stockQuantity) -
                                Number(data.amount),
                            // itemDetails: item.itemDetails.map((detail) => {
                            //     if (detail.id === data.id) {
                            //         return {
                            //             ...detail,
                            //             pendingErrors: [
                            //                 ...detail.pendingErrors,
                            //                 faults,
                            //             ],
                            //             stockQuantity:
                            //                 Number(detail.stockQuantity) -
                            //                 Number(data.amount),
                            //         };
                            //     }
                            //     return detail;
                            // }),
                        };
                    }
                    return item;
                });
                setCurrentData(exampleData2);
                break;
        }
        console.log("Data nè: ", data);
        console.log("Faults nè: ", faults);
    };

    const handleConfirmReceipt = (index) => {
        if (selectedGroup) {
            let receiptSubItem = awaitingReception[selectedGroup.value][index];

            switch (selectedGroup.value) {
                case "CH-LVL-TV":
                    exampleData = exampleData.map((item) => {
                        if (item.id === receiptSubItem.itemId) {
                            return {
                                ...item,
                                // itemDetails: item.itemDetails.map((detail) => {
                                //     if (detail.id === receiptSubItem.id) {
                                //         return {
                                //             ...detail,
                                //             stockQuantity:
                                //                 Number(detail.stockQuantity) +
                                //                 Number(receiptSubItem.amount),
                                //         };
                                //     }
                                //     return detail;
                                // }),
                                stockQuantity:
                                    Number(item.stockQuantity) +
                                    Number(receiptSubItem.amount),
                            };
                        }
                        return item;
                    });
                    setCurrentData(exampleData);
                    break;
                case "CH-LVL-HT":
                    exampleData1 = exampleData1.map((item) => {
                        if (item.id === receiptSubItem.itemId) {
                            return {
                                ...item,
                                // itemDetails: item.itemDetails.map((detail) => {
                                //     if (detail.id === receiptSubItem.id) {
                                //         return {
                                //             ...detail,
                                //             stockQuantity:
                                //                 Number(detail.stockQuantity) +
                                //                 Number(receiptSubItem.amount),
                                //         };
                                //     }
                                //     return detail;
                                // }),
                                stockQuantity:
                                    Number(item.stockQuantity) +
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
                        if (item.id === receiptSubItem.itemId) {
                            return {
                                ...item,
                                // itemDetails: item.itemDetails.map((detail) => {
                                //     if (detail.id === receiptSubItem.id) {
                                //         return {
                                //             ...detail,
                                //             stockQuantity:
                                //                 Number(detail.stockQuantity) +
                                //                 Number(receiptSubItem.amount),
                                //         };
                                //     }
                                //     return detail;
                                // }),
                                stockQuantity:
                                    Number(item.stockQuantity) +
                                    Number(receiptSubItem.amount),
                            };
                        }
                        return item;
                    });
                    setCurrentData(exampleData2);
                    break;
            }
            setAwaitingReception((prev) => {
                const groupKey = selectedGroup.value;
                const updatedGroup = awaitingReception[groupKey].filter(
                    (item, i) => i !== index
                );
                return {
                    ...prev,
                    [groupKey]: updatedGroup,
                };
            });
        }
        toast.success("Ghi nhận thành công.");
        onModalClose();
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
                                // itemDetails: item.itemDetails.map((detail) => {
                                //     if (detail.id === receiptSubItem.id) {
                                //         return {
                                //             ...detail,
                                //             stockQuantity:
                                //                 Number(detail.stockQuantity) +
                                //                 Number(receiptSubItem.amount),
                                //         };
                                //     }
                                //     return detail;
                                // }),
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
                                // itemDetails: item.itemDetails.map((detail) => {
                                //     if (detail.id === receiptSubItem.id) {
                                //         return {
                                //             ...detail,
                                //             stockQuantity:
                                //                 Number(detail.stockQuantity) +
                                //                 Number(receiptSubItem.amount),
                                //         };
                                //     }
                                //     return detail;
                                // }),
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
                                // itemDetails: item.itemDetails.map((detail) => {
                                //     if (detail.id === receiptSubItem.id) {
                                //         return {
                                //             ...detail,
                                //             stockQuantity:
                                //                 Number(detail.stockQuantity) +
                                //                 Number(receiptSubItem.amount),
                                //         };
                                //     }
                                //     return detail;
                                // }),
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
            let receiptSubItem = awaitingReception[selectedGroup.value][index];

            switch (receiptSubItem?.fromGroup?.id) {
                case "CH-LVL-TV":
                    exampleData = exampleData.map((item) => {
                        if (item?.id === receiptSubItem?.itemId) {
                            return {
                                ...item,
                                returns: [
                                    ...item.returns,
                                    {
                                        ...reason,
                                        amount: Number(receiptSubItem.amount),
                                    },
                                ],
                                // itemDetails: item.itemDetails.map((detail) => {
                                //     if (detail.id === receiptSubItem.id) {
                                //         return {
                                //             ...detail,
                                //             returns: [
                                //                 ...detail.returns,
                                //                 {
                                //                     ...reason,
                                //                     amount: Number(
                                //                         receiptSubItem.amount
                                //                     ),
                                //                 },
                                //             ],
                                //         };
                                //     }
                                //     return detail;
                                // }),
                            };
                        }
                        return item;
                    });
                    // setCurrentData(exampleData);
                    break;
                case "CH-LVL-HT":
                    exampleData1 = exampleData1.map((item) => {
                        if (item?.id === receiptSubItem?.itemId) {
                            return {
                                ...item,
                                returns: [
                                    ...item.returns,
                                    {
                                        ...reason,
                                        amount: Number(receiptSubItem.amount),
                                    },
                                ],
                            };
                            // return {
                            //     ...item,
                            //     itemDetails: item.itemDetails.map((detail) => {
                            //         if (detail.id === receiptSubItem.id) {
                            //             return {
                            //                 ...detail,
                            //                 returns: [
                            //                     ...detail.returns,
                            //                     {
                            //                         ...reason,
                            //                         amount: Number(
                            //                             receiptSubItem.amount
                            //                         ),
                            //                     },
                            //                 ],
                            //             };
                            //         }
                            //         return detail;
                            //     }),
                            // };
                        }
                        return item;
                    });
                    // setCurrentData(exampleData1);
                    break;
                case "CH-LVL-KTP":
                    exampleData2 = exampleData.map((item) => {
                        if (item.id === receiptSubItem.itemId) {
                            return {
                                ...item,
                                returns: [
                                    ...item.returns,
                                    {
                                        ...reason,
                                        amount: Number(receiptSubItem.amount),
                                    },
                                ],
                            };
                            // return {
                            //     ...item,
                            //     itemDetails: item.map((detail) => {
                            //         if (detail.id === receiptSubItem.id) {
                            //             return {
                            //                 ...detail,
                            //                 returns: [
                            //                     ...detail.returns,
                            //                     {
                            //                         ...reason,
                            //                         amount: Number(
                            //                             receiptSubItem.amount
                            //                         ),
                            //                     },
                            //                 ],
                            //             };
                            //         }
                            //         return detail;
                            //     }),
                            // };
                        }
                        return item;
                    });
                    // setCurrentData(exampleData2);
                    break;
            }
            setAwaitingReception((prev) => {
                const groupKey = selectedGroup.value;
                const updatedGroup = awaitingReception[groupKey].filter(
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
        // console.log("Ra index: ", index);
        // console.log("Thực hiện reject: ", reason);
        console.log("Ra example data: ", exampleData);
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
        // console.log("Ra index: ", index);
        // console.log("Thực hiện reject: ", reason);
        console.log("Ra example data: ", exampleData);
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

    // useEffect(() => {
    //     console.log("Log phôi chờ: ", awaitingReception);
    // }, [awaitingReception]);

    useEffect(() => {
        // const getFinishedGoods = async () => {
        //     try {
        //         const res = await productionApi.getFinishedGoodsList();
        //         setGoodsReceiptList(res);
        //         const options = res.map((item) => ({
        //             value: item.ItemCode,
        //             label: item.ItemCode + " - " + item.ItemName,
        //         }));
        //         // console.log("Ra options: ", options);
        //         setGoodsReceiptOptions(options);
        //     } catch (error) {
        //         toast.error("Có lỗi xảy ra khi load danh sách sản phẩm.");
        //     }
        // };
        // getFinishedGoods();
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

    useEffect(() => {
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
    }, [selectedGroup]);

    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center bg-[#F8F9F7] ">
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
                                {/* <li aria-current="page">
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
                                        <span className="ml-1 text-sm font-medium text-[#17506B] md:ml-2">
                                            <div>Nhập sản lượng</div>
                                        </span>
                                    </div>
                                </li> */}
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between mb-6 items-center px-4">
                        <div className="text-3xl md:text-3xl font-bold">
                            Nhập sản lượng ván công nghiệp
                        </div>
                    </div>

                    {/* <Stepper index={activeStep}>
                        {steps.map((step, index) => (
                            <Step key={index}>
                                <StepIndicator>
                                    <StepStatus
                                        complete={<StepIcon />}
                                        incomplete={<StepNumber />}
                                        active={<StepNumber />}
                                    />
                                </StepIndicator>

                                <Box flexShrink="0">
                                    <StepTitle>{step.title}</StepTitle>
                                    <StepDescription className="hidden sm:block">
                                        {step.description}
                                    </StepDescription>
                                </Box>

                                <StepSeparator />
                            </Step>
                        ))}
                    </Stepper> */}

                    {/* Controller */}
                    <div className="flex justify-between mb-6 items-center gap-4">
                        <div className="my-4 mb-6 p-4 w-full border rounded-md bg-white z-0">
                            {/* <Card className="my-8">
                            <CardHeader className="flex items-center gap-4">
                                {activeStep != 0 && (
                                    <button
                                        className="p-2 hover:bg-gray-200 rounded-full active:scale-[.95] active:duration-75 transition-all"
                                        onClick={goBack}
                                    >
                                        <HiArrowLeft />
                                    </button>
                                )}
                                {activeStep == 0 && (
                                    <Heading size="md">
                                        Chọn sản phẩm
                                    </Heading>
                                )}
                                {activeStep == 1 && (
                                    <Heading size="md">Kiểm tra thông tin</Heading>
                                )}
                                {activeStep == 2 && (
                                    <Heading size="md">
                                        Nhập sản lượng
                                    </Heading>
                                )}
                            </CardHeader>

                        {activeStep == 0 && (
                            <>
                                <CardBody>
                                    <Stack
                                        divider={<StackDivider />}
                                        spacing="4"
                                    >
                                        <Box>
                                            <Heading
                                                size="xs"
                                                textTransform="uppercase"
                                            >
                                                Tìm kiếm sản phẩm
                                            </Heading>
                                            <AsyncSelect
                                                cacheOptions
                                                options={goodsReceiptOptions}
                                                defaultOptions
                                                loadOptions={loadGoodsReceipt}
                                                defaultValue={
                                                    selectedItem || null
                                                }
                                                onChange={(value) =>
                                                    setSelectedItem(value)
                                                }
                                                placeholder="Tìm kiếm"
                                                className="mt-4"
                                            />
                                        </Box>
                                    </Stack>
                                </CardBody>
                                <CardFooter className="text-bold justify-end">
                                    <Button
                                        isDisabled={!selectedItem}
                                        onClick={() => setActiveStep(1)}
                                        variant="solid"
                                        colorScheme="blue"
                                        backgroundColor="#2b6cb0 !important"

                                    >
                                        Tiếp tục
                                    </Button>
                                </CardFooter>
                            </>
                        )}
                        {activeStep == 1 && selectedItem && (
                            <>
                                <CardBody>
                                    <Stack
                                        divider={<StackDivider />}
                                        spacing="4"
                                    >
                                        <Box className="flex flex-col md:flex-row items-center justify-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-4 py-2">
                                                    <label className="font-semibold whitespace-nowrap">Mã sản phẩm</label>
                                                    <input
                                                        type="text"
                                                        disabled
                                                        value={
                                                            goodsReceiptList.find(
                                                                (item) =>
                                                                    item.ItemCode ==
                                                                    selectedItem.value
                                                            )?.ItemCode || ""
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4 py-2">
                                                    <label className="font-semibold whitespace-nowrap">
                                                        Tên sản phẩm
                                                    </label>
                                                    <input
                                                        type="text"
                                                        disabled
                                                        value={
                                                            goodsReceiptList.find(
                                                                (item) =>
                                                                    item.ItemCode ==
                                                                    selectedItem.value
                                                            )?.ItemName || ""
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4 py-2">
                                                    <label className="font-semibold whitespace-nowrap">Tổng số lượng</label>
                                                    <input
                                                        type="text"
                                                        disabled
                                                        value={
                                                            goodsReceiptList.find(
                                                                (item) =>
                                                                    item.ItemCode ==
                                                                    selectedItem.value
                                                            )?.Qty || ""
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <img alt="Hình minh hoạ sản phẩm gỗ" className="w-[400px] -mt-8" src={FinishedGoodsIllustration}/>
                                        </Box>
                                    </Stack>
                                </CardBody>
                                <CardFooter className="text-bold justify-end">
                                    <Button
                                        // isDisabled={!selectedItem}
                                        onClick={() => setActiveStep(2)}
                                        variant="solid"
                                        colorScheme="blue"
                                        backgroundColor="#2b6cb0 !important"
                                    >
                                        Tiếp tục
                                    </Button>
                                </CardFooter>
                            </>
                        )}
                        {activeStep == 2 && (
                            <>
                                <CardBody>
                                    <Stack
                                        divider={<StackDivider />}
                                        spacing="4"
                                    >
                                        <Box>
                                            <label>
                                                Số lượng ghi nhận sản phẩm
                                            </label>
                                            <NumberInput
                                                step={1}
                                                defaultValue={1}
                                                min={1}
                                                max={
                                                    goodsReceiptList.find(
                                                        (item) =>
                                                            item.ItemCode ==
                                                            selectedItem.value
                                                    )?.Qty || 0
                                                }
                                                className="mt-4"
                                                onChange={(value) => {
                                                    setAmount(value);
                                                }}
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </Box>
                                    </Stack>
                                </CardBody>
                                <CardFooter className="text-bold justify-end">
                                    <Button
                                        isDisabled={!selectedItem || !amount}
                                        onClick={handleSubmit}
                                        variant="solid"
                                        colorScheme="blue"
                                        backgroundColor="#2b6cb0 !important"
                                    >
                                        Hoàn thành
                                    </Button>
                                </CardFooter>
                            </>
                        )}
                            </Card> */}

                            {/* <label className="block mb-2 text-md font-medium text-gray-900">
                                    Tìm kiếm loại sản phẩm{" "}
                                    <span className="text-red-600">*</span>
                                </label>
                                <AsyncSelect
                                    cacheOptions
                                    options={goodsReceiptOptions}
                                    defaultOptions
                                    loadOptions={loadGoodsReceipt}
                                    onChange={(value) => setSelectedItem(value)}
                                    placeholder="Tìm kiếm"
                                    className="mt-4"
                            /> */}
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
                                {selectedGroup &&
                                    awaitingReception[selectedGroup?.value]
                                        ?.length > 0 && (
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
                                options={groupListOptions}
                                defaultValue={groupListOptions[0]}
                                onChange={(value) => setSelectedGroup(value)}
                                placeholder="Tìm kiếm"
                                className="mt-3 mb-8"
                            />

                            <div className="flex flex-col gap-4 my-4">
                                {/* <div
                                    className="shadow-lg relative border bg-white border-indigo-100 z-1 before:absolute before:left-[-0.25rem] before:content-[''] before:h-7 before:w-7 before:rotate-[60deg] before:top-[2.6rem] before:bg-[#283593] before:z-[-1] after:absolute after:content-[attr(data-label)] after:w-fit after:text-[white] after:text-left after:shadow-[4px_4px_15px_rgba(26,35,126,0.2)] after:px-2 after:py-1.5 after:-left-2.5 after:top-[14.4px] after:bg-[#3949ab] after:whitespace-nowrap"
                                    data-label="TYBYN bar table 74x74x102 acacia/black"
                                >
                                    <div className="w-full h-full flex flex-col gap-4 mb-4 mt-2 px-4 pt-12 z-[999] bg-white">
                                        <section className="my-2 cursor-pointer duration-200 ease-linear hover:opacity-80">
                                            <span className="ml-1">
                                                1. TYBYN Bàn bar 74 đen - Mặt
                                                trên AD (15*367.5*740)
                                            </span>
                                            <div className="relative overflow-x-auto shadow-md sm:rounded-lg ml-3 mt-2">
                                                <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
                                                    <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                                                        <tr>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-3"
                                                            >
                                                                Lệnh sản xuất
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-3 text-right"
                                                            >
                                                                (Tính tổng)
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-3 text-right"
                                                            >
                                                                (Tính tổng)
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-3 text-right"
                                                            >
                                                                (Tính tổng)
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-3 text-right"
                                                            >
                                                                Còn thực hiện
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="bg-white border-b">
                                                            <th
                                                                scope="row"
                                                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                                            >
                                                                TH2344TP-01
                                                            </th>
                                                            <td className="px-6 py-4 text-right">
                                                                960
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                719
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                0
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                241
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-white border-b">
                                                            <th
                                                                scope="row"
                                                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                                            >
                                                                TH2344TP-02
                                                            </th>
                                                            <td className="px-6 py-4 text-right">
                                                                960
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                719
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                0
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                241
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-white border-b">
                                                            <th
                                                                scope="row"
                                                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                                            >
                                                                TH2344TP-03
                                                            </th>
                                                            <td className="px-6 py-4 text-right">
                                                                960
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                719
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                0
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                241
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </section>

                                        <section className="my-2 cursor-pointer duration-200 ease-linear hover:opacity-80">
                                            <span className="ml-1">
                                                2. TYBYN Bàn bar 74 đen - Mặt
                                                trên AD (15*367.5*740)
                                            </span>
                                            <div className="relative overflow-x-auto shadow-md sm:rounded-lg ml-6 mt-2">
                                                <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
                                                    <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                                                        <tr>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-3"
                                                            >
                                                                Lệnh sản xuất
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-3 text-right"
                                                            >
                                                                (Tính tổng)
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-3 text-right"
                                                            >
                                                                (Tính tổng)
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-3 text-right"
                                                            >
                                                                (Tính tổng)
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-3 text-right"
                                                            >
                                                                Còn thực hiện
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="bg-white border-b">
                                                            <th
                                                                scope="row"
                                                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                                            >
                                                                TH2344TP-01
                                                            </th>
                                                            <td className="px-6 py-4 text-right">
                                                                960
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                719
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                0
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                241
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-white border-b">
                                                            <th
                                                                scope="row"
                                                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                                            >
                                                                TH2344TP-02
                                                            </th>
                                                            <td className="px-6 py-4 text-right">
                                                                960
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                719
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                0
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                241
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-white border-b">
                                                            <th
                                                                scope="row"
                                                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                                            >
                                                                TH2344TP-03
                                                            </th>
                                                            <td className="px-6 py-4 text-right">
                                                                960
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                719
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                0
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                241
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </section>
                                    </div>
                                </div> */}

                                {currentData.length > 0 ? (
                                    currentData.map((item, index) => (
                                        <PlyWoodItemInput
                                            data={item}
                                            index={index}
                                            key={index}
                                            selectedGroup={selectedGroup}
                                            nextGroup={item.nextGroup}
                                            fromGroup={item.fromGroup}
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

                                {/* <ItemInput />
                                <ItemInput /> */}
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
                            {selectedGroup &&
                                awaitingReception[selectedGroup?.value]
                                    ?.length > 0 &&
                                awaitingReception[selectedGroup?.value].map(
                                    (item, index) => (
                                        <AwaitingReception
                                            type="plywood"
                                            data={item}
                                            key={index}
                                            index={index}
                                            onConfirmReceipt={
                                                handleConfirmReceipt
                                            }
                                            onRejectReceipt={
                                                handleRejectReceipt
                                            }
                                        />
                                    )
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
