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
    Badge,
    Button,
    ButtonGroup,
    Box,
    Card,
    CardBody,
    CardFooter,
    Divider,
    Image,
    Stack,
    Spinner,
    Heading,
    Text,
    Textarea,
    Radio,
    RadioGroup,
    useDisclosure,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from "@chakra-ui/react";
import Select from "react-select";
import { MdRefresh } from "react-icons/md";
import { TbCalendarFilled, TbClock } from "react-icons/tb";
import toast from "react-hot-toast";
import moment from "moment";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import productionApi from "../api/productionApi";
import "../assets/styles/index.css";
import { Input } from "postcss";

const reasonOfReturn = [
    {
        value: "1",
        label: "Số lượng chưa chuẩn",
    },
    {
        value: "2",
        label: "Chất lượng không đạt",
    },
    {
        value: "3",
        label: "Lý do khác",
    },
];
const DomesticAwaitingReception = ({
    data,
    type,
    index,
    onConfirmReceipt,
    onRejectReceipt,
    CongDoan,
    variant,
}) => {
    const [selectedReason, setSelectedReason] = useState(null);
    const {
        isOpen: isInputAlertDialogOpen,
        onOpen: onInputAlertDialogOpen,
        onClose: onInputAlertDialogClose,
    } = useDisclosure();
    const {
        isOpen: isDismissAlertDialogOpen,
        onOpen: onDismissAlertDialogOpen,
        onClose: onDismissAlertDialogClose,
    } = useDisclosure();

    const [detailsInfo, setDetailsInfo] = useState({
        receivedAmount: "",
        errorAmount: "",
        missingAmount: data.deliveredAmount,
    })

    // Hàm confirm từng chi tiết
    const handleConfirmReceipt = async () => {
        const showErrorAlert = (message) => {
            Swal.fire({
                title: "Có lỗi khi xác nhận.",
                html: `
                    <p>Chi tiết lỗi:<br></p>
                    <p>${message}</p>
                `,
                icon: "error",
                zIndex: 50001,
            });
        };

        const checkAndDisplayError = (errorMessage) => {
            toast.error(errorMessage);
            onInputAlertDialogClose();
        };


        if (1 !== 1) {
            checkAndDisplayError("Số lượng lỗi phải lớn hơn 0.");
        } else {
            setAcceptLoading(true);
            try {
                const payload = {
                    id: data?.id
                };
                let res;
                if (payload.id) {
                    switch (type) {
                        case "plywood":
                            res = await (variant === "QC" ? productionApi.acceptReceiptsVCNQC(payload) : productionApi.acceptReceiptsVCN(payload));
                            break;
                        default:
                            res = await (variant === "QC" ? productionApi.acceptReceiptsCBGQC(payload) : productionApi.acceptReceiptsCBG(payload));
                            break;
                    }
                    setAcceptLoading(false);
                    onConfirmReceipt(data?.id);
                    onInputAlertDialogClose();
                } else {
                    showErrorAlert("Có lỗi xảy ra. Vui lòng thử lại");
                }
            } catch (error) {
                const errorMessage = error.response?.data?.error?.message?.value || error.response?.data?.message;
                showErrorAlert(`${errorMessage ? errorMessage : "Lỗi kết nối mạng."}`);
                console.error("Error when confirming receipt:", error);
                setAcceptLoading(false);
                onInputAlertDialogClose();
            }
        }
    };

    const handleRejectReceipt = async () => {
        setRejectLoading(true);
        try {
            const payload = {
                id: data?.id,
                reason: "",
            };
            switch (selectedReason) {
                case "1":
                    // console.log("Dô đây");
                    payload.reason = reasonOfReturn.find(
                        (r) => r.value == 1
                    )?.label;
                    break;
                case "2":
                    payload.reason = reasonOfReturn.find(
                        (r) => r.value == 2
                    )?.label;
                    break;
                case "3":
                    if (reason) {
                        payload.reason = reason;
                    } else {
                        payload.reason = reasonOfReturn.find(
                            (r) => r.value == 3
                        )?.label;
                    }
                    break;

                default:
                    break;
            }
            // console.log("Payload: ", payload);
            if (payload?.id) {
                if (payload?.reason) {
                    switch (type) {
                        case "plywood":
                            const res1 = await productionApi.rejectReceiptsVCN(
                                payload
                            );
                            break;
                        default:
                            const res2 = await productionApi.rejectReceiptsCBG(
                                payload
                            );
                            break;
                    }
                    onRejectReceipt(payload?.id);
                    onDismissAlertDialogClose();
                    setRejectLoading(false);
                } else {
                    toast("Vui lòng chọn lý do");
                }
            } else {
                toast.error("Có lỗi xảy ra. Vui lòng thử lại");
                onDismissAlertDialogClose();
                setRejectLoading(false);
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi từ chối.");
            onDismissAlertDialogClose();
            setRejectLoading(false);
        }
        setRejectLoading(false);
    };

    const [reason, setReason] = useState("");
    const [acceptLoading, setAcceptLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);

    useEffect(() => {
        if (selectedReason != "3") {
            setReason("");
        }
    }, [selectedReason]);

    // States:
    // errorTypeOptions, solutionOptions, teamBackOptions, rootCauseOptions, returnCodeOptions

    useEffect(() => {
        setDetailsInfo((prev) => ({
            ...prev,
            missingAmount:
                data?.deliveredAmount -
                (prev.receivedAmount || 0) -
                (prev.errorAmount || 0),
        }));
    }, [detailsInfo.receivedAmount, detailsInfo.errorAmount, data?.deliveredAmount]);

    return (
        <>
            <div
                className={`bg-[#F7F7F7] rounded-xl sm:min-w-[400px] ${variant === "QC"
                    ? " border-2 border-gray-200 !shadow-md"
                    : " border-2 border-gray-200 !shadow-md"
                    } `}
            >
                <div className="!px-4 !py-3">
                    <Stack mt="1" spacing="1">
                        <div className="flex gap-2">
                            <span className="font-bold text-[19px] text-[#155979]">
                                Dự án {
                                    data?.projectName || ""}
                            </span>
                            <span></span>
                        </div>

                        {type == "CT" ? (
                            <div className="flex gap-2">
                                <span>Mã chi tiết: </span>
                                <span className="font-bold">
                                    {data?.detailsCode || "????"}
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <span>Mã đóng gói: </span>
                                    <span className="font-bold">
                                        {data?.detailsCode || "????"}
                                    </span>
                                    <span className="font-bold text-gray-500 pentagon-container">{data?.MaThiTruong ? "- " + data.MaThiTruong : ""}</span>
                                </div>
                            </>
                        )}

                        <div className="flex gap-2">
                            <span>Sơ đồ cắt: </span>
                            <span className="font-bold">
                                {data?.cuttingDiagram || "0*0*0"}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <span>Số lượng giao: </span>
                            <span className="font-bold">
                                {Number(data?.deliveredAmount) || 0}
                            </span>
                        </div>

                        {/* <span className="rounded-lg cursor-pointer px-2 py-2 text-white bg-[#155979] hover:bg-[#1A6D94] duration-300">
                            Người tạo:{" "}
                            <span className="font-medium">
                                {data?.last_name + " " + data?.first_name}
                            </span>
                        </span> */}

                        {/* <div className="grid grid-cols-2">
                            <div className="flex grid-cols-1 items-center space-x-2">
                                <TbCalendarFilled className="w-5 h-5 text-" />
                                <Text
                                    color="gray.700"
                                    fontWeight="700"
                                    fontSize="md"
                                >
                                    {moment(
                                        data?.created_at,
                                        "YYYY-MM-DD HH:mm:ss"
                                    ).format("DD/MM/YYYY") || ""}
                                </Text>
                            </div>

                            <div className="flex grid-cols-1 items-center space-x-2">
                                <TbClock className="w-5 h-5 text-" />
                                <Text
                                    color="gray.700"
                                    fontWeight="700"
                                    fontSize="md"
                                >
                                    {moment(
                                        data?.created_at,
                                        "YYYY-MM-DD HH:mm:ss"
                                    ).format("HH:mm:ss") || ""}
                                </Text>
                            </div>
                        </div> */}

                        <div className="items-center gap-x-4">
                            <label
                                htmlFor="errorType"
                                className="font-semibold"
                            >
                                Số lượng nhận
                            </label>
                            <NumberInput
                                step={1}
                                min={0}
                                max={data?.deliveredAmount}
                                value={detailsInfo?.receivedAmount}
                                onChange={(value) => setDetailsInfo(prev => ({ ...prev, receivedAmount: value }))}
                                className="mt-2 mb-2 bg-white"
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </div>
                        <div className="items-center gap-x-4">
                            <label
                                htmlFor="errorType"
                                className="font-semibold"
                            >
                                Số lượng lỗi
                            </label>
                            <NumberInput
                                step={1}
                                min={0}
                                max={detailsInfo?.receivedAmount}
                                value={detailsInfo?.errorAmount}
                                onChange={(value) => setDetailsInfo(prev => ({ ...prev, errorAmount: value }))}
                                className="mt-2 mb-2 bg-white"
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </div>
                        <div className="items-center gap-x-4">
                            <label
                                htmlFor="errorType"
                                className="font-semibold"
                            >
                                Số lượng thiếu
                            </label>
                            <NumberInput
                                step={1}
                                disabled
                                min={0}
                                max={data?.deliveredAmount}
                                value={detailsInfo?.missingAmount}
                                onChange={(value) => setDetailsInfo(prev => ({ ...prev, missingAmount: value }))}
                                className="mt-2 mb-2 bg-white"
                            >
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </div>
                    </Stack>
                </div>

                <Divider />
                <div className="flex space-x-3 justify-end p-[20px]">
                    <Button
                        className={`${selectedReason ? "!block" : "!hidden"}`}
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => {
                            setSelectedReason("");
                            setIsReturnSelect(false);
                        }}
                    >
                        <MdRefresh className="text-2xl" />
                    </Button>
                    <Button
                        isDisabled={!selectedReason}
                        variant="solid"
                        colorScheme="red"
                        className="bg-[#e53e3e]"
                        onClick={onDismissAlertDialogOpen}
                        backgroundColor="red !important"
                    >
                        Trả lại
                    </Button>
                    <Button
                        isDisabled={detailsInfo?.missingAmount == data?.deliveredAmount}
                        variant="solid"
                        colorScheme="green"
                        className="bg-[#38a169]"
                        onClick={onInputAlertDialogOpen}
                        backgroundColor="#2f855a !important"
                    >
                        Xác nhận
                    </Button>
                </div>
            </div>
            <AlertDialog
                isOpen={isInputAlertDialogOpen}
                onClose={onInputAlertDialogClose}
                isCentered={true}
                closeOnOverlayClick={false}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            Xác nhận ghi nhận{" "}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            <div className="text-green-700">
                                Bạn có chắc muốn{" "}
                                <>
                                    xác nhận <span className="font-bold">
                                        {Number(data?.Quantity) || ""}
                                    </span>{" "}
                                </>
                                sản lượng chi tiết <span className="font-bold">{data?.detailsCode}</span>
                                ?
                            </div>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <div className="flex gap-4">
                                <Button
                                    className="bg-[#edf2f7]"
                                    onClick={onInputAlertDialogClose}
                                >
                                    Thoát
                                </Button>
                                <button
                                    disabled={acceptLoading}
                                    className="w-fit bg-[#38a169] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                    onClick={handleConfirmReceipt}
                                >
                                    {acceptLoading ? (
                                        <div className="flex items-center space-x-4">
                                            <Spinner size="sm" color="white" />
                                            <div>Đang tải</div>
                                        </div>
                                    ) : (
                                        "Xác nhận"
                                    )}
                                </button>
                            </div>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            <AlertDialog
                isOpen={isDismissAlertDialogOpen}
                onClose={onDismissAlertDialogClose}
                isCentered={true}
                closeOnOverlayClick={false}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>Xác nhận trả lại </AlertDialogHeader>
                        <AlertDialogBody>
                            <div className="text-red-700">
                                Bạn có chắc chắn muốn trả lại:{" "}
                                <span className="font-bold">
                                    {Number(data?.Quantity) || ""}
                                </span>{" "}
                                sản phẩm với lý do{" "}
                                <span className="font-bold">
                                    {reason
                                        ? reason
                                        : reasonOfReturn.find(
                                            (item) =>
                                                item.value == selectedReason
                                        )?.label}
                                </span>{" "}
                                ?
                            </div>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <div className="flex gap-4">
                                <Button
                                    className="bg-[#edf2f7]"
                                    onClick={onDismissAlertDialogClose}
                                >
                                    Thoát
                                </Button>
                                <button
                                    disabled={rejectLoading}
                                    className="w-fit bg-[#e53e3e] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                    onClick={handleRejectReceipt}
                                >
                                    {rejectLoading ? (
                                        <div className="flex items-center space-x-4">
                                            <Spinner size="sm" color="white" />
                                            <div>Đang tải</div>
                                        </div>
                                    ) : (
                                        "Xác nhận"
                                    )}
                                </button>
                            </div>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

export default DomesticAwaitingReception;
