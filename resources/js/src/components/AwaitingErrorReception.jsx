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
    Heading,
    Text,
    Radio,
    RadioGroup,
    useDisclosure,
} from "@chakra-ui/react";
import { MdRefresh } from "react-icons/md";
import toast from "react-hot-toast";

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

const AwaitingErrorReception = ({
    data,
    type,
    index,
    onConfirmErrorReceipt,
    onRejectErrorReceipt,
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
        onInputAlertDialogClose();
        onConfirmErrorReceipt(index);
    };
    const handleRejectReceipt = async () => {
        onDismissAlertDialogClose();
        // const reason = reasonOfReturn.find(
        //     (item) => item.value == selectedReason
        // );
        onRejectErrorReceipt(index);
    };

    console.log("Huhu: ", data);

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
                                        {data?.id || ""}
                                    </span>
                                </div>
                            </>
                        )}

                        {type == "plywood" ? (
                            <>
                                <div className="flex gap-2">
                                    <span>Chi tiết/cụm: </span>
                                    <span className="font-bold">
                                        {data.itemName || ""} {" - " + data?.thickness +
                                    "x" +
                                    data?.width +
                                    "x" +
                                    data?.length || ""}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <></>
                        )}

                        {/* <div className="flex gap-2">
                            <span>Tên: </span>
                            <span className="font-bold">
                                {type == "plywood"
                                    ? data.itemName
                                    : data.data?.subItemName || ""}
                            </span>
                        </div> */}

                        <div className="flex gap-2">
                            <span>Số lượng: </span>
                            <span className="font-bold">
                                {data?.amount || ""}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <span>Loại lỗi: </span>
                            <span className="font-bold">
                                {data?.type || ""}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <span>Biện pháp xử lý: </span>
                            <span className="font-bold">
                                {data?.method || ""}
                            </span>
                        </div>

                        <span class="rounded-lg cursor-pointer px-2 py-1 text-white bg-[#155979] hover:bg-[#1A6D94] duration-300">
                            Người tạo:{" "}
                            {data?.createdBy?.last_name +
                                " " +
                                data?.createdBy?.first_name}
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
                                01/12/2023
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
                                14:35:10
                            </Text>
                        </div>
                    </Stack>
                </CardBody>

                <Divider />
                <CardFooter>
                    <Divider />
                    <ButtonGroup
                        spacing="2"
                        className="flex justify-end"
                    >
                        <Button
                            // isDisabled={!selectedReason}
                            variant="solid"
                            colorScheme="red"
                            className="bg-[#e53e3e]"
                            onClick={onDismissAlertDialogOpen}
                        >
                            Từ chối
                        </Button>
                        <Button
                            // isDisabled={selectedReason}
                            variant="solid"
                            colorScheme="green"
                            className="bg-[#38a169]"
                            onClick={onInputAlertDialogOpen}
                        >
                            Xác nhận
                        </Button>
                    </ButtonGroup>
                </CardFooter>
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
                                Bạn có chắc chắn muốn nhận:{" "}
                                <span className="font-bold">
                                    {data?.amount || ""}
                                </span>{" "}
                                sản phẩm?
                            </div>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button
                                className="bg-[#edf2f7]"
                                onClick={onInputAlertDialogClose}
                            >
                                Thoát
                            </Button>
                            <Button
                                colorScheme="green"
                                onClick={handleConfirmReceipt}
                                ml={3}
                                className="bg-[#38a169]"
                            >
                                Xác nhận
                            </Button>
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
                                    {data?.amount || ""}
                                </span>
                                ?
                            </div>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button
                                className="bg-[#edf2f7]"
                                onClick={onDismissAlertDialogClose}
                            >
                                Thoát
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleRejectReceipt}
                                ml={3}
                                className="bg-[#e53e3e]"
                            >
                                Xác nhận
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

export default AwaitingErrorReception;
