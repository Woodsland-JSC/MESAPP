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

const AwaitingReception = ({ data, onConfirmReceipt, onRejectReceipt }) => {
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
        onConfirmReceipt(data);
    };
    const handleRejectReceipt = async () => {
        onDismissAlertDialogClose();
        onConfirmReceipt(data);
        onRejectReceipt(data, reasonOfReturn.find(item => item.value == selectedReason));
    };

    console.log("Bên chờ phôi: ", data);
    return (
        <>
            <Card maxW="sm">
                <CardBody>
                    <Stack mt="2" spacing="2">
                        <div className="flex gap-2">
                            <span>Mã thành phẩm: </span>
                            <span className="font-bold">{data?.id || ""}</span>
                        </div>
                        <div className="flex gap-2">
                            <span>Tên: </span>
                            <span className="font-bold">
                                {data?.subItemName || ""}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <span>Công đoạn giao: </span>
                            <span className="font-bold">
                                {data?.fromGroup?.name || ""}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <span>Quy cách: </span>
                            <span className="font-bold">
                                {data?.thickness +
                                    "x" +
                                    data?.width +
                                    "x" +
                                    data?.length || ""}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <span>Số lượng: </span>
                            <span className="font-bold">
                                {data?.amount || ""}
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
                    <RadioGroup
                        onChange={(value) => {
                            if (value == selectedReason) {
                                console.log("Dô 1: ", value);
                                setSelectedReason(null);
                            } else {
                                setSelectedReason(value);
                            }
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
                                            if (item.value == selectedReason) {
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
                                                item.value === selectedReason
                                            }
                                        />
                                        {item.label}
                                    </label>
                                    // <Radio onClick={() => console.log("Dô")} value={item.value}>{item.label}</Radio>
                                ))}
                        </Stack>
                    </RadioGroup>
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
                        onClick={onDismissAlertDialogOpen}
                    >
                        Trả lại
                    </Button>
                    <Button
                        isDisabled={selectedReason}
                        variant="solid"
                        colorScheme="green"
                        onClick={onInputAlertDialogOpen}
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
                                Bạn có chắc chắn muốn nhận:{" "}
                                <span className="font-bold">
                                    {data?.amount || ""}
                                </span>{" "}
                                sản phẩm?
                            </div>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={onInputAlertDialogClose}>
                                Thoát
                            </Button>
                            <Button
                                colorScheme="green"
                                onClick={handleConfirmReceipt}
                                ml={3}
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
                                </span>{" "}
                                sản phẩm với lý do {" "} <span className="font-bold">{reasonOfReturn.find(item => item.value == selectedReason)?.label}</span> ?
                            </div>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={onDismissAlertDialogClose}>
                                Thoát
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleRejectReceipt}
                                ml={3}
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

export default AwaitingReception;
