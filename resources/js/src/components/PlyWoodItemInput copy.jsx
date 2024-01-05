import React, { useState, useEffect, useRef } from "react";
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
    Radio,
    RadioGroup,
    useDisclosure,
} from "@chakra-ui/react";
import Select from "react-select";
import toast from "react-hot-toast";
import { AiTwotoneDelete } from "react-icons/ai";
import productionApi from "../api/productionApi";
import useAppContext from "../store/AppContext";
import FinishedGoodsIllustration from "../assets/images/wood-receipt-illustration.png";
import { formatNumber } from "../utils/numberFormat"

const factories = [
    {
        value: "YS2",
        label: "Nhà máy Yên Sơn 2",
    },
    {
        value: "Viforex",
        label: "Nhà máy Viforex",
    },
    {
        value: "YS3",
        label: "Nhà máy Yên Sơn 3",
    },
    {
        value: "CH",
        label: "Nhà máy Chiêm Hoá",
    },
];

const PlyWoodItemInput = ({
    data,
    index,
    fromGroup,
    nextGroup,
    onReceiptFromChild,
    onRejectFromChild,
}) => {
    const checkRef = useRef(null);
    const { user } = useAppContext();
    console.log("Ra nè: ", nextGroup);
    const {
        isOpen: isAlertDialogOpen,
        onOpen: onAlertDialogOpen,
        onClose: onAlertDialogClose,
    } = useDisclosure();

    const {
        isOpen: isDeleteProcessingDialogOpen,
        onOpen: onDeleteProcessingDialogOpen,
        onClose: onDeleteProcessingDialogClose,
    } = useDisclosure();

    const {
        isOpen: isDeleteErrorDialogOpen,
        onOpen: onDeleteErrorDialogOpen,
        onClose: onDeleteErrorDialogClose,
    } = useDisclosure();

    const {
        isOpen: isModalOpen,
        onOpen: onModalOpen,
        onClose: onModalClose,
    } = useDisclosure();

    const [loading, setLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [deleteProcessingLoading, setDeleteProcessingLoading] =
        useState(false);
    const [deleteErrorLoading, setDeleteErrorLoading] = useState(false);

    const [selectedItemDetails, setSelectedItemDetails] = useState(data);
    const [amount, setAmount] = useState(null);
    const [faults, setFaults] = useState({});
    const [receipts, setReceipts] = useState({});
    const [faultyAmount, setFaultyAmount] = useState(null);
    const [selectedDelete, setSelectedDelete] = useState(null);
    const [selectedError, setSelectedError] = useState(null);

    const [errorTypeOptions, setErrorTypeOptions] = useState([]);
    const [solutionOptions, setSolutionOptions] = useState([]);

    const openInputModal = async (item) => {
        onModalOpen();
        console.log("Moe: ", selectedItemDetails);
        setSelectedItemDetails(data);

        // setLoading(true);
        // try {
        //     // console.log("Hello: ", item);
        //     const params = {
        //         FatherCode: data.SPDICH,
        //         ItemCode: item.ItemChild,
        //         Team: item.TO,
        //     };
        //     // console.log("Hi: ", params);
        //     const res = await productionApi.getFinishedGoodsDetail(params);
        //     console.log("Bye: ", res);
        //     setSelectedItemDetails({
        //         ...item,
        //         stockQuantity: res.maxQuantity,
        //         totalProcessing: res.remainQty,
        //         factories: res.Factorys?.map((item) => ({
        //             value: item.Factory,
        //             label: item.FactoryName,
        //         })),
        //         notifications: res.notifications,
        //     });
        //     onModalOpen();
        // } catch (error) {
        //     toast.error("Có lỗi khi lấy dữ liệu item.");
        //     console.error(error);
        // }
        // setLoading(false);
    };

    const closeInputModal = () => {
        onModalClose();
        setAmount(null);
        setFaults({});
        setReceipts({});
        setSelectedItemDetails(null);
    };

    const handleSubmitQuantity = async () => {
        try {
            if (amount && amount > 0) {
                // onReceiptFromChild({
                //     id: 70152702,
                //     subItemName: "TYBYN Bàn bar 74 đen - Mặt trên AD",
                //     thickness: 15,
                //     width: 367.5,
                //     length: 740,
                //     amount: amount,
                //     createdDate: new Date(),
                //     createdBy: {
                //         id: 54,
                //         last_name: "Nguyen",
                //         first_name: "An",
                //     },
                //     fromGroup: {
                //         id: "TH-X3SC",
                //         no: 3,
                //         name: "Tổ Sơ chế X3",
                //     },
                //     nextGroup: nextGroup
                // });
                onReceiptFromChild(
                    {
                        // id: selectedItemDetails.id,
                        itemId: data?.id,
                        itemName: data?.itemName,
                        // command: selectedItemDetails.command,
                        thickness: selectedItemDetails.thickness,
                        width: selectedItemDetails.width,
                        length: selectedItemDetails.length,
                        amount: Number(amount),
                        createdDate: new Date(),
                        createdBy: {
                            id: user.id,
                            last_name: user.last_name,
                            first_name: user.first_name,
                        },
                        fromGroup: fromGroup,
                        nextGroup: nextGroup,
                    },
                    receipts
                );
            }
            if (faultyAmount && faultyAmount > 0) {
                const result = {
                    id: selectedItemDetails.id,
                    itemId: data?.id,
                    subItemName: selectedItemDetails.subItemName,
                    thickness: selectedItemDetails.thickness,
                    width: selectedItemDetails.width,
                    length: selectedItemDetails.length,
                    amount: Number(faultyAmount),
                    createdDate: new Date(),
                    createdBy: {
                        id: user.id,
                        last_name: user.last_name,
                        first_name: user.first_name,
                    },
                    fromGroup: fromGroup,
                    previousGroup: nextGroup,
                };
                onRejectFromChild(result, faults);
            }
            toast.success("Ghi nhận & chuyển tiếp thành công!");
        } catch (error) {
            // Xử lý lỗi (nếu có)
            console.error("Đã xảy ra lỗi:", error);
            toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
        setFaults({});
        setReceipts({});
        setAmount(null);
        setFaultyAmount(null);

        onAlertDialogClose();
        closeInputModal();
    };

    useEffect(() => {
        const checkElement = checkRef.current;
        if (faultyAmount && checkElement) {
            if (faultyAmount > 0) {
                checkElement.classList.add("block");
                checkElement.classList.remove("hidden");
            } else {
                checkElement.classList.add("hidden");
                checkElement.classList.remove("block");
            }
        }
    }, [faultyAmount]);

    useEffect(() => {
        const getErrorTypeOptions = async () => {
            try {
                const res = await productionApi.getErrorTypes();
                const errorTypes = res.map((error, index) => ({
                    value: error?.id || "",
                    label: error?.name || ""
                }));
                console.log("Other side: ", errorTypes);
                setErrorTypeOptions(errorTypes);
            } catch (error) {
                console.error(error);
            }
        }

        const getSolutionOptions = async () => {
            try {
                const res = await productionApi.getSolutions("VCN");
                const solutions = res.map((solution, index) => ({
                    value: solution?.id || "",
                    label: solution?.name || ""
                }));
                console.log("Other side 2: ", solutions);
                setSolutionOptions(solutions);
            } catch (error) {
                console.error(error);
            }
        }
        getErrorTypeOptions();
        getSolutionOptions();
    }, []);

    return (
        <div className="cursor-pointer" onClick={() => openInputModal()}>
            <div
                className="shadow-lg relative border bg-white border-indigo-100 z-1 before:absolute before:left-[-0.25rem] before:content-[''] before:h-7 before:w-7 before:rotate-[60deg] before:top-[2.6rem] before:bg-[#283593] before:z-[-1] after:absolute after:content-[attr(data-label)] after:w-fit after:text-[white] after:text-left after:shadow-[4px_4px_15px_rgba(26,35,126,0.2)] after:px-2 after:py-1.5 after:-left-2.5 after:top-[14.4px] after:bg-[#3949ab] after:whitespace-nowrap"
                data-label={
                    data.itemName +
                    " (" +
                    data.thickness +
                    "x" +
                    data.width +
                    "x" +
                    data.length +
                    ")"
                }
            >
                {/* <span className="font-semibold absolute top-0-left-0 bg-green-500"></span> */}
                {/* <div className="w-full h-full flex flex-col gap-4 mb-4 mt-2 px-4 pt-14 z-[999] bg-white"> */}
                {/* <span className="font-semibold">
                        TYBYN bar table 74x74x102 acacia/black
                    </span> */}
                {/* <div>
                        Lệnh sản xuất
                        <span className="bg-[#e4e4e4] rounded px-2 py-1 ml-2 font-semibold w-fit">
                            {data.command}
                        </span>
                    </div> */}
                {/* <div>
                        Công đoạn số:{" "}
                        <span className="bg-[#96bddf] rounded px-2 py-1 ml-2 font-semibold w-fit">
                            {data.fromGroup.no + ". " + data.fromGroup.name}
                        </span>{" "}
                    </div> */}
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg sm:mx-2 pt-14 mt-2 ">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                            <tr>
                                <th scope="col" className="px-2 py-2">
                                    Lệnh sản xuất
                                </th>
                                <th
                                    scope="col"
                                    className="px-2 py-2 text-right"
                                >
                                    Sản lượng
                                </th>
                                <th
                                    scope="col"
                                    className="px-2 py-2 text-right"
                                >
                                    Đã làm
                                </th>
                                <th
                                    scope="col"
                                    className="px-2 py-2 text-right"
                                >
                                    Bị lỗi
                                </th>
                                <th
                                    scope="col"
                                    className="px-2 py-2 text-right"
                                >
                                    Còn thực hiện
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.productionCommands?.length > 0 ? (
                                data?.productionCommands.map(
                                    (production, index) => (
                                        <tr
                                            className="bg-white border-b"
                                            key={index}
                                        >
                                            <th
                                                scope="row"
                                                className="px-2 py-1 font-medium text-gray-900 text-[12px] sm:text-md max-w-[20ch] overflow-hidden overflow-ellipsis"
                                            >
                                                {production.command}
                                            </th>
                                            <td className="px-2 py-2 text-right text-[12px] sm:text-md">
                                                {formatNumber(production.quantity)}
                                            </td>
                                            <td className="px-2 py-2 text-right text-[12px] sm:text-md">
                                                {formatNumber(production.done)}
                                            </td>
                                            <td className="px-2 py-2 text-right text-[12px] sm:text-md">
                                                {formatNumber(production.faults)}
                                            </td>
                                            <td className="px-2 py-2 text-right text-[12px] sm:text-md">
                                                {formatNumber(production.processing)}
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : (
                                <span>Không có dữ liệu</span>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td className="px-2 py-2">Tổng</td>
                                <td className="px-2 py-2 text-right font-bold">
                                    {formatNumber(data.totalQuantity) || 0}
                                </td>
                                <td className="px-2 py-2 text-right font-bold">
                                    {formatNumber(data.totalDone) || 0}
                                </td>
                                <td className="px-2 py-2 text-right font-bold">
                                    {formatNumber(data.totalFaults) || 0}
                                </td>
                                <td className="px-2 py-2 text-right font-bold">
                                    {formatNumber(data.totalProcessing) || 0}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {/* </div> */}
            </div>
            <Modal
                isCentered
                isOpen={isModalOpen}
                size="full"
                onClose={closeInputModal}
                scrollBehavior="inside"
            >
                <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                <ModalContent className="!px-0">
                    <ModalHeader>
                        <h1 className="text-xl lg:text-2xl text-center text-bold text-[#17506B]">
                            Ghi nhận sản lượng
                        </h1>
                    </ModalHeader>
                    <ModalCloseButton />
                    <div className="border-b-2 border-gray-100"></div>
                    <ModalBody px={0} py={0}>
                        <div className="flex flex-col justify-center ">
                            <div className="xl:mx-auto xl:px-8 text-base w-full xl:w-[55%] space-y-3 ">
                                {/* <Alert status="info">
                                    <AlertDescription className="flex items-center gap-3">
                                        <span className="text-center w-full">
                                            Lệnh sản xuất:{" "}
                                            <span className="font-semibold">
                                                {selectedItemDetails?.command ||
                                                    ""}
                                            </span>
                                        </span>
                                    </AlertDescription>
                                </Alert> */}
                                {/* )} */}
                                <div className="flex flex-col md:flex-row justify-between items-center">
                                    <div className="flex flex-col gap-4 w-full px-4">
                                        <label className="font-semibold">
                                            Sản phẩm/Chi tiết
                                        </label>
                                        <span>
                                            {selectedItemDetails?.itemName}
                                        </span>
                                    </div>
                                    <img
                                        alt="Hình minh hoạ sản phẩm gỗ"
                                        className="w-[350px] -mt-8"
                                        src={FinishedGoodsIllustration}
                                    />
                                </div>
                                <div className="flex justify-between py-4 border-t-2 border-b-2 border-dashed px-4">
                                    <div className="flex flex-col justify-start">
                                        <label className="font-semibold">
                                            Dày
                                        </label>
                                        <span>
                                            {selectedItemDetails?.thickness ||
                                                0}
                                        </span>
                                    </div>
                                    <div className="flex flex-col justify-start">
                                        <label className="font-semibold">
                                            Rộng
                                        </label>
                                        <span>
                                            {selectedItemDetails?.width || 0}
                                        </span>
                                    </div>
                                    <div className="flex flex-col justify-start">
                                        <label className="font-semibold">
                                            Dài
                                        </label>
                                        <span>
                                            {selectedItemDetails?.length || 0}
                                        </span>
                                    </div>
                                </div>
                                {/* <div className="flex gap-2 items-center py-4 border-t px-4">
                                    <Text className="font-semibold">
                                        Số lượng phôi đã nhận và phôi tồn tại
                                        tổ:
                                    </Text>
                                    <span className="rounded-lg cursor-pointer px-2 py-1 text-white bg-green-700 hover:bg-green-500 duration-300">
                                        {selectedItemDetails?.stockQuantity ||
                                            0}
                                    </span>
                                </div> */}
                                {/* <div className="flex flex-col py-4 bg-green-300 border-t-2 border-b-2 border-dashed">
                                    <div className="flex items-center gap-4 px-4">
                                        <span className="ml-2">
                                            {selectedItemDetails?.subItemName} (
                                            {selectedItemDetails?.thickness} *
                                            {selectedItemDetails?.width} *
                                            {selectedItemDetails?.length}) :{" "}
                                        </span>
                                        <span className="rounded-lg cursor-pointer px-2 py-1 text-white bg-[#155979] hover:bg-[#1A6D94] duration-300">
                                            {selectedItemDetails?.stockQuantity ||
                                                0}
                                        </span>
                                    </div>
                                </div> */}
                                <div className="flex gap-2 items-center py-4 border-t px-4">
                                    <Text className="font-semibold">
                                        Số lượng phôi có thể xuất:
                                    </Text>
                                    <span className="rounded-lg cursor-pointer px-2 py-1 text-white bg-green-700 hover:bg-green-500 duration-300">
                                        {selectedItemDetails?.stockQuantity ||
                                            0}
                                    </span>
                                </div>
                                <div className="flex gap-2 items-center py-4 border-t border-b !mt-0 px-4 text-yellow-700">
                                    <Text className="font-semibold">
                                        Số lượng còn phải sản xuất của lệnh xa
                                        nhất hiển thị:
                                    </Text>
                                    <span className="rounded-lg cursor-pointer px-2 py-1 text-white bg-yellow-700 hover:bg-yellow-500 duration-300">
                                        {selectedItemDetails?.furthestQuantity ||
                                            0}
                                    </span>
                                </div>
                                <div className="flex gap-2 items-center py-4 border-t border-b !mt-0 px-4 text-yellow-700">
                                    <Text className="font-semibold">
                                        Số lượng còn phải sản xuất tất cả lệnh
                                        sản xuất trên chuyền:
                                    </Text>
                                    <span className="rounded-lg cursor-pointer px-2 py-1 text-white bg-yellow-700 hover:bg-yellow-500 duration-300">
                                        {selectedItemDetails?.allCommandQuantity ||
                                            0}
                                    </span>
                                </div>
                                <Box className="px-4">
                                    <label className="font-semibold">
                                        Số lượng ghi nhận sản phẩm
                                    </label>
                                    <NumberInput
                                        step={1}
                                        min={1}
                                        // max={
                                        //     goodsReceiptList.find(
                                        //         (item) =>
                                        //             item.ItemCode ==
                                        //             selectedItem.value
                                        //     )?.Qty || 0
                                        // }
                                        className="mt-4"
                                        onChange={(value) => {
                                            setAmount(value);
                                            setReceipts((prev) => ({
                                                ...prev,
                                                amount: value,
                                            }));
                                        }}
                                    >
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </Box>
                                <div className="bg-blue-500 text-white p-3 items-center flex">
                                    Đã thực hiện
                                    <Badge
                                        className="ml-3"
                                        colorScheme="blue"
                                        fontSize="1.2rem"
                                    >
                                        {selectedItemDetails?.totalDone}
                                    </Badge>
                                </div>
                                {selectedItemDetails?.pendingReceipts &&
                                    selectedItemDetails?.pendingReceipts
                                        .length > 0 &&
                                    selectedItemDetails?.pendingReceipts.map(
                                        (item, index) => (
                                            <div className="flex justify-between items-center p-3 my-4 border border-green-600 rounded">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-4">
                                                        <Text className="font-semibold">
                                                            Số lượng đã giao chờ
                                                            xác nhận:{" "}
                                                        </Text>{" "}
                                                        <Badge
                                                            colorScheme="green"
                                                            fontSize="1.2rem"
                                                        >
                                                            {item?.amount}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <Text className="font-semibold">
                                                            Thời gian giao:{" "}
                                                        </Text>
                                                        <span className="ml-1 text-violet-700">
                                                            30/11/2023 14:12:23
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() =>
                                                            toast(
                                                                "Chức năng chưa phát triển"
                                                            )
                                                        }
                                                        className="rounded-full p-2 duration-200 ease hover:bg-slate-100"
                                                    >
                                                        <AiTwotoneDelete className="text-red-700 text-2xl" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                {selectedItemDetails?.returns &&
                                    selectedItemDetails?.returns.length > 0 &&
                                    selectedItemDetails?.returns.map(
                                        (item, index) => (
                                            <div className="flex justify-between items-center p-3 my-4 border border-red-600 rounded">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-4">
                                                        <Text className="font-semibold">
                                                            Phôi trả lại:{" "}
                                                        </Text>{" "}
                                                        <Badge
                                                            colorScheme="red"
                                                            fontSize="1.2rem"
                                                        >
                                                            {item?.amount}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <Text className="font-semibold">
                                                            Lý do:{" "}
                                                        </Text>
                                                        <span className="ml-1">
                                                            {item?.label}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() =>
                                                            toast(
                                                                "Chức năng chưa phát triển"
                                                            )
                                                        }
                                                        className="rounded-full p-2 duration-200 ease hover:bg-slate-100"
                                                    >
                                                        <AiTwotoneDelete className="text-red-700 text-2xl" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                {selectedItemDetails?.pendingErrors &&
                                    selectedItemDetails?.pendingErrors.length >
                                        0 &&
                                    selectedItemDetails?.pendingErrors.map(
                                        (item, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center p-3 my-4 border border-red-600 rounded"
                                            >
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-4 items-center">
                                                        <Text className="font-semibold">
                                                            Số lượng ghi nhận
                                                            lỗi chờ xác nhận:{" "}
                                                        </Text>{" "}
                                                        <Badge
                                                            colorScheme="red"
                                                            fontSize="1.2rem"
                                                        >
                                                            {item?.amount}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <Text className="font-semibold">
                                                            Thời gian giao:{" "}
                                                        </Text>
                                                        <span className="ml-1 text-violet-700">
                                                            30/11/2023 14:12:23
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() =>
                                                            toast(
                                                                "Chức năng chưa phát triển"
                                                            )
                                                        }
                                                        className="rounded-full p-2 duration-200 ease hover:bg-slate-100"
                                                    >
                                                        <AiTwotoneDelete className="text-red-700 text-2xl" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                <div className="px-3 flex flex-col gap-4 text-red-600 border-t border-b py-3 border-red-600 !my-4">
                                    <span>
                                        Lỗi báo từ công đoạn:{" "}
                                        <Badge
                                            colorScheme="red"
                                            fontSize="1.2rem"
                                        >
                                            {
                                                selectedItemDetails?.totalStageError
                                            }
                                        </Badge>{" "}
                                    </span>
                                    {/* <span>
                                        Lỗi chuyển về:{" "}
                                        <Badge
                                            colorScheme="red"
                                            fontSize="1.2rem"
                                        >
                                            {
                                                selectedItemDetails?.totalBackError
                                            }
                                        </Badge>{" "}
                                    </span>
                                    <span>
                                        Lỗi loại:{" "}
                                        <Badge
                                            colorScheme="red"
                                            fontSize="1.2rem"
                                        >
                                            {
                                                selectedItemDetails?.totalTypeError
                                            }
                                        </Badge>{" "}
                                    </span> */}
                                </div>
                                <Box className="px-3">
                                    <label className="font-semibold text-red-700">
                                        Khai báo số lượng lỗi
                                    </label>
                                    <NumberInput
                                        step={1}
                                        min={1}
                                        // max={
                                        //     goodsReceiptList.find(
                                        //         (item) =>
                                        //             item.ItemCode ==
                                        //             selectedItem.value
                                        //     )?.Qty || 0
                                        // }
                                        className="mt-4"
                                        onChange={(value) => {
                                            setFaultyAmount(value);
                                            setFaults((prev) => ({
                                                ...prev,
                                                amount: value,
                                            }));
                                        }}
                                    >
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                    {/* <RadioGroup
                                        ref={checkRef}
                                        className="hidden mt-4 ml-3"
                                    >
                                        <Radio value="1">
                                            {selectedItemDetails?.subItemName} (
                                            {selectedItemDetails?.thickness} *
                                            {selectedItemDetails?.width} *
                                            {selectedItemDetails?.length}) :{" "}
                                        </Radio>
                                    </RadioGroup> */}
                                </Box>
                                <Box className="px-3">
                                    <label className="font-semibold text-red-700">
                                        Lỗi phôi nhận từ nhà máy khác
                                    </label>
                                    <Select
                                        className="mt-4"
                                        placeholder="Lựa chọn"
                                        options={factories}
                                        isClearable
                                        isSearchable
                                        onChange={(value) => {
                                            setFaults((prev) => ({
                                                ...prev,
                                                factory: value,
                                            }));
                                        }}
                                    />
                                </Box>
                                <Box className="px-3">
                                    <label className="font-semibold text-red-700">
                                        Loại lỗi
                                    </label>
                                    <Select
                                        className="mt-4"
                                        placeholder="Lựa chọn"
                                        options={errorTypeOptions}
                                        isClearable
                                        isSearchable
                                        onChange={(value) => {
                                            setFaults((prev) => ({
                                                ...prev,
                                                errorType: value,
                                            }));
                                        }}
                                    />
                                </Box>
                                <Box className="px-3">
                                    <label className="font-semibold text-red-700">
                                        Hướng xử lý
                                    </label>
                                    <Select
                                        className="mt-4 mb-12"
                                        placeholder="Lựa chọn"
                                        options={solutionOptions}
                                        isClearable
                                        isSearchable
                                        onChange={(value) => {
                                            setFaults((prev) => ({
                                                ...prev,
                                                solution: value,
                                            }));
                                        }}
                                    />
                                </Box>
                            </div>
                        </div>
                    </ModalBody>

                    <ModalFooter className="flex flex-col !p-0">
                        <Alert status="info">
                            <AlertIcon />
                            Công đoạn tiếp theo:{" "}
                            <span className="font-bold ml-1">
                                {nextGroup.no + ". " + nextGroup.name ||
                                    "chưa có thông tin"}
                            </span>
                        </Alert>
                        <div className="border-b-2 border-gray-100"></div>
                        <div className="flex items-item justify-end p-4 w-full gap-4">
                            <Button onClick={closeInputModal}>Đóng</Button>
                            <Button
                                type="button"
                                isDisabled={
                                    !amount &&
                                    amount <= 0 &&
                                    !faultyAmount &&
                                    faultyAmount <= 0
                                }
                                colorScheme="green"
                                onClick={onAlertDialogOpen}
                                backgroundColor="#2f8558 !important"
                            >
                                Ghi nhận
                            </Button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <AlertDialog
                isOpen={isAlertDialogOpen}
                onClose={onAlertDialogClose}
                closeOnOverlayClick={false}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>Xác nhận ghi nhận</AlertDialogHeader>
                        <AlertDialogBody>
                            {amount && (
                                <div className="text-green-700">
                                    Ghi nhận sản lượng:{" "}
                                    <span className="font-bold">{amount}</span>{" "}
                                </div>
                            )}
                            {faultyAmount && (
                                <div className="text-red-700">
                                    Ghi nhận lỗi:{" "}
                                    <span className="font-bold">
                                        {faultyAmount}
                                    </span>
                                </div>
                            )}
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={onAlertDialogClose}>Huỷ bỏ</Button>
                            <Button
                                colorScheme="red"
                                onClick={handleSubmitQuantity}
                                ml={3}
                                backgroundColor="#c53030 !important"
                            >
                                Xác nhận
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </div>
    );
};

export default PlyWoodItemInput;
