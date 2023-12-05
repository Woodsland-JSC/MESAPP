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
    useDisclosure,
} from "@chakra-ui/react";
import { HiMiniBellAlert } from "react-icons/hi2";
import Select, { components } from "react-select";
import AsyncSelect from "react-select/async";
import productionApi from "../../api/productionApi";
import toast from "react-hot-toast";
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

const groupList = [
    {
        id: "TH-X3SC",
        no: 3,
        name: "Tổ Sơ chế X3",
    },
    {
        id: "TH-X3TC1",
        no: 4,
        name: "Tổ Tinh chế 1 X3",
    },
    {
        id: "TH-X3TC2",
        no: 4,
        name: "Tổ Tinh chế 2 X3",
    },
    {
        id: "TH-X3S",
        no: 6,
        name: "Tổ Sơn X3",
    },
    // {
    //     id: "TH-X3ĐG",
    //     no: 7,
    //     name: "Tổ Đóng gói X3",
    // },
];

const groupListOptions = [
    {
        value: "TH-X3SC",
        label: "3. Tổ Sơ chế X3 - TH-X3SC",
    },
    {
        value: "TH-X3TC1",
        label: "4. Tổ Tinh chế 1 X3 - TH-X3TC1",
    },
    {
        value: "TH-X3TC2",
        label: "4. Tổ Tinh chế 2 X3 - TH-X3TC2",
    },
    {
        value: "TH-X3S",
        label: "6. Tổ Sơn X3 - TH-X3S",
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

    // const { activeStep, setActiveStep } = useSteps({
    //     index: 0,
    //     count: steps.length,
    // });
    // const { isOpen, onOpen, onClose } = useDisclosure();

    const [awaitingReception, setAwaitingReception] = useState({
        "TH-X3SC": [],
        "TH-X3TC1": [],
        "TH-X3TC2": [],
        "TH-X3S": [],
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

    const handleReceiptFromChild = (data) => {
        const groupId = data?.nextGroup?.id;
        if (groupId) {
            setAwaitingReception((prev) => ({
                ...prev,
                [groupId]: [...prev[groupId], data],
            }));
        }
        const currentGroupId = data?.fromGroup?.id;

        switch (currentGroupId) {
            case "TH-X3SC":
                exampleData = exampleData.map((item) => {
                    if (item.id === data.itemId) {
                        return {
                            ...item,
                            itemDetails: item.itemDetails.map((detail) => {
                                if (detail.id === data.id) {
                                    return {
                                        ...detail,
                                        stockQuantity:
                                            Number(detail.stockQuantity) -
                                            Number(data.amount),
                                    };
                                }
                                return detail;
                            }),
                        };
                    }
                    return item;
                });
                setCurrentData(exampleData);
                break;
            case "TH-X3TC1":
                exampleData1 = exampleData1.map((item) => {
                    if (item.id === data.itemId) {
                        return {
                            ...item,
                            itemDetails: item.itemDetails.map((detail) => {
                                if (detail.id === data.id) {
                                    return {
                                        ...detail,
                                        stockQuantity:
                                            Number(detail.stockQuantity) -
                                            Number(data.amount),
                                    };
                                }
                                return detail;
                            }),
                        };
                    }
                    return item;
                });
                console.log("Final: ", exampleData1);
                setCurrentData(exampleData1);
                break;
            case "TH-X3TC2":
                exampleData2 = exampleData.map((item) => {
                    if (item.id === data.itemId) {
                        return {
                            ...item,
                            itemDetails: item.itemDetails.map((detail) => {
                                if (detail.id === data.id) {
                                    return {
                                        ...detail,
                                        stockQuantity:
                                            Number(detail.stockQuantity) -
                                            Number(data.amount),
                                    };
                                }
                                return detail;
                            }),
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
            case "TH-X3SC":
                exampleData = exampleData.map((item) => {
                    if (item.id === data.itemId) {
                        return {
                            ...item,
                            itemDetails: item.itemDetails.map((detail) => {
                                if (detail.id === data.id) {
                                    return {
                                        ...detail,
                                        pendingErrors: [
                                            ...detail.pendingErrors,
                                            faults,
                                        ],
                                        stockQuantity:
                                            Number(detail.stockQuantity) -
                                            Number(data.amount),
                                    };
                                }
                                return detail;
                            }),
                        };
                    }
                    return item;
                });
                setCurrentData(exampleData);
                console.log("hm ra nhiều: ", exampleData);
                break;
            case "TH-X3TC1":
                exampleData1 = exampleData1.map((item) => {
                    if (item.id === data.itemId) {
                        return {
                            ...item,
                            itemDetails: item.itemDetails.map((detail) => {
                                if (detail.id === data.id) {
                                    return {
                                        ...detail,
                                        pendingErrors: [
                                            ...detail.pendingErrors,
                                            faults,
                                        ],
                                        stockQuantity:
                                            Number(detail.stockQuantity) -
                                            Number(data.amount),
                                    };
                                }
                                return detail;
                            }),
                        };
                    }
                    return item;
                });
                console.log("Final: ", exampleData1);
                setCurrentData(exampleData1);
                break;
            case "TH-X3TC2":
                exampleData2 = exampleData.map((item) => {
                    if (item.id === data.itemId) {
                        return {
                            ...item,
                            itemDetails: item.itemDetails.map((detail) => {
                                if (detail.id === data.id) {
                                    return {
                                        ...detail,
                                        pendingErrors: [
                                            ...detail.pendingErrors,
                                            faults,
                                        ],
                                        stockQuantity:
                                            Number(detail.stockQuantity) -
                                            Number(data.amount),
                                    };
                                }
                                return detail;
                            }),
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
                case "TH-X3SC":
                    exampleData = exampleData.map((item) => {
                        if (item.id === receiptSubItem.itemId) {
                            return {
                                ...item,
                                itemDetails: item.itemDetails.map((detail) => {
                                    if (detail.id === receiptSubItem.id) {
                                        return {
                                            ...detail,
                                            stockQuantity:
                                                Number(detail.stockQuantity) +
                                                Number(receiptSubItem.amount),
                                        };
                                    }
                                    return detail;
                                }),
                            };
                        }
                        return item;
                    });
                    setCurrentData(exampleData);
                    break;
                case "TH-X3TC1":
                    exampleData1 = exampleData1.map((item) => {
                        if (item.id === receiptSubItem.itemId) {
                            return {
                                ...item,
                                itemDetails: item.itemDetails.map((detail) => {
                                    if (detail.id === receiptSubItem.id) {
                                        return {
                                            ...detail,
                                            stockQuantity:
                                                Number(detail.stockQuantity) +
                                                Number(receiptSubItem.amount),
                                        };
                                    }
                                    return detail;
                                }),
                            };
                        }
                        return item;
                    });
                    console.log("Final: ", exampleData1);
                    setCurrentData(exampleData1);
                    break;
                case "TH-X3TC2":
                    exampleData2 = exampleData.map((item) => {
                        if (item.id === receiptSubItem.itemId) {
                            return {
                                ...item,
                                itemDetails: item.itemDetails.map((detail) => {
                                    if (detail.id === receiptSubItem.id) {
                                        return {
                                            ...detail,
                                            stockQuantity:
                                                Number(detail.stockQuantity) +
                                                Number(receiptSubItem.amount),
                                        };
                                    }
                                    return detail;
                                }),
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

    const handleRejectReceipt = (index, reason) => {
        if (selectedGroup) {
            let receiptSubItem = awaitingReception[selectedGroup.value][index];

            switch (receiptSubItem?.fromGroup?.id) {
                case "TH-X3SC":
                    exampleData = exampleData.map((item) => {
                        if (item.id === receiptSubItem.itemId) {
                            return {
                                ...item,
                                itemDetails: item.itemDetails.map((detail) => {
                                    if (detail.id === receiptSubItem.id) {
                                        return {
                                            ...detail,
                                            returns: [...detail.returns, {...reason, amount: Number(receiptSubItem.amount)}],
                                        };
                                    }
                                    return detail;
                                }),
                            };
                        }
                        return item;
                    });
                    // setCurrentData(exampleData);
                    break;
                case "TH-X3TC1":
                    exampleData1 = exampleData1.map((item) => {
                        if (item.id === receiptSubItem.itemId) {
                            return {
                                ...item,
                                itemDetails: item.itemDetails.map((detail) => {
                                    if (detail.id === receiptSubItem.id) {
                                        return {
                                            ...detail,
                                            returns: [...detail.returns, {...reason, amount: Number(receiptSubItem.amount)}],
                                        };
                                    }
                                    return detail;
                                }),
                            };
                        }
                        return item;
                    });
                    // setCurrentData(exampleData1);
                    break;
                case "TH-X3TC2":
                    exampleData2 = exampleData.map((item) => {
                        if (item.id === receiptSubItem.itemId) {
                            return {
                                ...item,
                                itemDetails: item.itemDetails.map((detail) => {
                                    if (detail.id === receiptSubItem.id) {
                                        return {
                                            ...detail,
                                            returns: [...detail.returns, {...reason, amount: Number(receiptSubItem.amount)}],
                                        };
                                    }
                                    return detail;
                                }),
                            };
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
            
                const hasSubItem = item.itemDetails.some(
                    (detail) => detail.subItemName.toLowerCase().includes(input.toLowerCase())
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
        document.title = "Woodsland - Nhập sản lượng";
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
    }, [selectedGroup]);

    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center bg-[#F8F9F7] ">
                {/* Section */}
                <div className="w-screen mb-4 xl:mb-4 p-6 px-5 xl:p-12 xl:px-32">
                    {/* Breadcrumb */}
                    <div className="mb-4">
                        <nav className="flex" ariaLabel="Breadcrumb">
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
                                            class="w-3 h-3 text-gray-400 mx-1"
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
                                            class="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            <div>Quản lý sản xuất</div>
                                        </Link>
                                    </div>
                                </li>
                                {/* <li aria-current="page">
                                    <div class="flex items-center">
                                        <svg
                                            class="w-3 h-3 text-gray-400 mx-1"
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
                                        <span class="ml-1 text-sm font-medium text-[#17506B] md:ml-2">
                                            <div>Nhập sản lượng</div>
                                        </span>
                                    </div>
                                </li> */}
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between mb-6 items-center">
                        <div className="text-3xl font-bold ">
                            Nhập sản lượng
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
                            <div className="flex w-full justify-end space-x-4">
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
                                            onInput={
                                                onFilterTextBoxChanged
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                {selectedGroup &&
                                    awaitingReception[selectedGroup?.value]
                                        ?.length > 0 && (
                                        <button
                                            onClick={onModalOpen}
                                            className="w-fit h-full space-x-2 inline-flex items-center bg-red-500 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
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
                                        <ItemInput
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
                        <div className="flex gap-4 justify-center ">
                            {selectedGroup &&
                                awaitingReception[selectedGroup?.value]
                                    ?.length > 0 &&
                                awaitingReception[selectedGroup?.value].map(
                                    (item, index) => (
                                        <AwaitingReception
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
