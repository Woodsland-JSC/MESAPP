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
} from "@chakra-ui/react";
import { MdRefresh } from "react-icons/md";
import toast from "react-hot-toast";
import moment from "moment";
import productionApi from "../api/productionApi";

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

const AwaitingReception = ({
    data,
    type,
    index,
    onConfirmReceipt,
    onRejectReceipt,
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

    const handleConfirmReceipt = async () => {
        setAcceptLoading(true);
        try {
            const payload = {
                id: data?.id,
            };
            if (payload.id) {
                const res = await productionApi.acceptReceiptsCBG(payload);
                onConfirmReceipt(data?.id);
                onInputAlertDialogClose();
                // toast.success("Xác nhận thành công.");
            } else {
                toast.error("Có lỗi xảy ra. Vui lòng thử lại");
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xác nhận.");
        }
        setAcceptLoading(false);
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
                    console.log("Dô đây");
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
            console.log("Payload: ", payload);
            if (payload?.id) {
                if (payload?.reason) {
                    const res = await productionApi.rejectReceiptsCBG(payload);
                    onRejectReceipt(payload?.id);
                    onDismissAlertDialogClose();
                } else {
                    toast("Vui lòng chọn lý do");
                }
            } else {
                toast.error("Có lỗi xảy ra. Vui lòng thử lại");
            }
            // onInputAlertDialogClose();
        } catch (error) {
            toast.error("Có lỗi xảy ra khi từ chối.");
        }
        setRejectLoading(false);
        // const reason = reasonOfReturn.find(
        //     (item) => item.value == selectedReason
        // );
        // onRejectReceipt(index, reason);
    };

    const [reason, setReason] = useState("");
    const [acceptLoading, setAcceptLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);

    console.log("Huhu: ", data);

    useEffect(() => {
        if (selectedReason != "3") {
            setReason("");
        }
    }, [selectedReason]);

    return (
        <>
            <Card maxW="sm">
                <CardBody>
                    <Stack mt="2" spacing="2">
                        {type == "plywood" ? (
                            <>
                                <div className="flex gap-2">
                                    <span>Lệnh sản xuất: </span>
                                    <span className="font-bold">
                                        {data?.command || ""}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <span>Mã thành phẩm: </span>
                                    <span className="font-bold">
                                        {data?.FatherCode || ""}
                                    </span>
                                </div>
                            </>
                        )}

                        <div className="flex gap-2">
                            <span>Tên: </span>
                            <span className="font-bold">
                                {/* {type == "plywood" ? data.itemName : data.data?.ItemName || ""} */}
                                {data?.ItemName || ""}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <span>Công đoạn giao: </span>
                            <span className="font-bold">
                                {data?.CongDoan || ""}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <span>Quy cách: </span>
                            <span className="font-bold">
                                {data?.CDay +
                                    " x " +
                                    data?.CRong +
                                    " x " +
                                    data?.CDai || ""}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <span>Số lượng: </span>
                            <span className="font-bold">
                                {Number(data?.Quantity) || ""}
                            </span>
                        </div>

                        <span className="rounded-lg cursor-pointer px-2 py-1 text-white bg-[#155979] hover:bg-[#1A6D94] duration-300">
                            Người tạo:{" "}
                            {data?.last_name + " " + data?.first_name}
                        </span>

                        <div className="flex">
                            <Text
                                className="w-2/5"
                                color="blue.600"
                                fontSize="md"
                            >
                                Ngày tạo:
                            </Text>
                            <Text
                                color="blue.600"
                                fontWeight="500"
                                fontSize="md"
                            >
                                {moment(
                                    data?.created_at,
                                    "YYYY-MM-DD HH:mm:ss"
                                ).format("DD/MM/YYYY") || ""}
                            </Text>
                        </div>
                        <div className="flex">
                            <Text
                                className="w-2/5"
                                color="blue.600"
                                fontSize="md"
                            >
                                Thời gian tạo:
                            </Text>
                            <Text
                                color="blue.600"
                                fontWeight="500"
                                fontSize="md"
                            >
                                {moment(
                                    data?.created_at,
                                    "YYYY-MM-DD HH:mm:ss"
                                ).format("HH:mm:ss") || ""}
                            </Text>
                        </div>
                    </Stack>
                </CardBody>

                <Divider />
                <CardFooter>
                    <div className="flex flex-col">
                        <RadioGroup
                            onChange={(value) => {
                                // if (value == selectedReason) {
                                //     console.log("Dô 1: ", value);
                                //     setSelectedReason(null);
                                // } else {
                                    setSelectedReason(value);
                                // }
                            }}
                            value={selectedReason}
                        >
                            <Stack direction="row">
                                {reasonOfReturn &&
                                    reasonOfReturn?.length > 0 &&
                                    reasonOfReturn.map((item, index) => (
                                        <label
                                            className="flex gap-2 cursor-pointer"
                                            key={index + item.value}
                                            onClick={() => {
                                                if (
                                                    item.value == selectedReason
                                                ) {
                                                    console.log(
                                                        "Dô 2",
                                                        selectedReason
                                                    );
                                                    setSelectedReason(null);
                                                }
                                            }}
                                        >
                                            <Radio
                                                value={item.value}
                                                isChecked={
                                                    item.value ===
                                                    selectedReason
                                                }
                                                borderColor="darkgrey !important"
                                            />
                                            {item.label}
                                        </label>
                                        // <Radio onClick={() => console.log("Dô")} value={item.value}>{item.label}</Radio>
                                    ))}
                            </Stack>
                        </RadioGroup>
                        {selectedReason == "3" && (
                            <Textarea
                                value={reason}
                                className="w-fit mt-3"
                                placeholder="Nhập lý do"
                                onChange={(e) => {
                                    setReason(e.target.value);
                                }}
                            />
                        )}
                    </div>
                </CardFooter>

                <Divider />
                <ButtonGroup spacing="2" className="flex justify-end p-[20px]">
                    <Button
                        className={`${selectedReason ? "!block" : "!hidden"}`}
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => setSelectedReason("")}
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
                        isDisabled={selectedReason}
                        variant="solid"
                        colorScheme="green"
                        className="bg-[#38a169]"
                        onClick={onInputAlertDialogOpen}
                        backgroundColor="#2f855a !important"
                    >
                        Xác nhận
                    </Button>
                </ButtonGroup>
            </Card>
            <AlertDialog
                isOpen={isInputAlertDialogOpen}
                onClose={onInputAlertDialogClose}
                closeOnOverlayClick={false}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            Xác nhận ghi nhận{" "}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            <div className="text-green-700">
                                Bạn có chắc chắn muốn xác nhận:{" "}
                                <span className="font-bold">
                                    {Number(data?.Quantity) || ""}
                                </span>{" "}
                                sản phẩm?
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
                                {/* <Button
                                colorScheme="green"
                                onClick={handleConfirmReceipt}
                                ml={3}
                                className="bg-[#38a169]"
                            >
                                Xác nhận
                            </Button> */}
                            </div>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            <AlertDialog
                isOpen={isDismissAlertDialogOpen}
                onClose={onDismissAlertDialogClose}
                closeOnOverlayClick={false}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>Xác nhận huỷ bỏ </AlertDialogHeader>
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
                            {/* <Button
                                colorScheme="red"
                                onClick={handleRejectReceipt}
                                ml={3}
                                className="bg-[#e53e3e]"
                            >
                                Xác nhận
                            </Button> */}
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

export default AwaitingReception;
