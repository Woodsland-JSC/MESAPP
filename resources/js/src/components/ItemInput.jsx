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
import FinishedGoodsIllustration from "../assets/images/wood-receipt-illustration.png";

const factories = [
    {
        value: "YS1",
        label: "Nhà máy chế biến gỗ Yên Sơn 1",
    },
    {
        value: "TB",
        label: "Nhà máy chế biến gỗ Thái Bình",
    },
];

const ItemInput = ({ data, index, nextGroup, onReceiptFromChild }) => {
    const checkRef = useRef(null);
    console.log("Ra nè: ", nextGroup);
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

    const [selectedItemDetails, setSelectedItemDetails] = useState(null);
    const [amount, setAmount] = useState(null);
    const [faults, setFaults] = useState({});
    const [faultyAmount, setFaultyAmount] = useState(null);

    const openInputModal = (item) => {
        onModalOpen();
        setSelectedItemDetails(item);
    };

    const closeInputModal = () => {
        onModalClose();
        setAmount(null);
        setFaults({});
        setSelectedItemDetails(null);
    };

    const handleSubmitQuantity = async () => {
        try {
            if (amount && amount > 0) {
                onReceiptFromChild({
                    id: 70152702,
                    subItemName: "TYBYN Bàn bar 74 đen - Mặt trên AD",
                    thickness: 15,
                    width: 367.5,
                    length: 740,
                    amount: amount,
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
                    nextGroup: nextGroup
                });
            }
            toast.success("Ghi nhận thành công!");
            onAlertDialogClose();
            closeInputModal();
        } catch (error) {
            // Xử lý lỗi (nếu có)
            console.error("Đã xảy ra lỗi:", error);
            toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
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

    return (
        <>
            <div
                className="shadow-lg relative border bg-white border-indigo-100 z-1 before:absolute before:left-[-0.25rem] before:content-[''] before:h-7 before:w-7 before:rotate-[60deg] before:top-[2.6rem] before:bg-[#283593] before:z-[-1] after:absolute after:content-[attr(data-label)] after:w-fit after:text-[white] after:text-left after:shadow-[4px_4px_15px_rgba(26,35,126,0.2)] after:px-2 after:py-1.5 after:-left-2.5 after:top-[14.4px] after:bg-[#3949ab] after:whitespace-nowrap"
                data-label={data.itemName}
            >
                {/* <span className="font-semibold absolute top-0-left-0 bg-green-500"></span> */}
                <div className="w-full h-full flex flex-col gap-4 mb-4 mt-2 px-4 pt-12 z-[999] bg-white">
                    {/* <span className="font-semibold">
                        TYBYN bar table 74x74x102 acacia/black
                    </span> */}
                    {data.itemDetails.length > 0
                        ? data.itemDetails.map((item, index) => (
                              <section
                                  onClick={() => openInputModal(item)}
                                  className="my-2 cursor-pointer duration-200 ease-linear hover:opacity-80"
                                  key={index}
                              >
                                  <span className="ml-1">
                                      {index + 1}. {item.subItemName} (
                                      {item.thickness}*{item.width}*
                                      {item.length})
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
                                                      Sản lượng
                                                  </th>
                                                  <th
                                                      scope="col"
                                                      className="px-6 py-3 text-right"
                                                  >
                                                      Đã làm
                                                  </th>
                                                  <th
                                                      scope="col"
                                                      className="px-6 py-3 text-right"
                                                  >
                                                      Bị lỗi
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
                                              {item.productionCommands.length >
                                              0 ? (
                                                  item.productionCommands.map(
                                                      (production, index) => (
                                                          <tr
                                                              className="bg-white border-b"
                                                              key={index}
                                                          >
                                                              <th
                                                                  scope="row"
                                                                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                                              >
                                                                  {
                                                                      production.command
                                                                  }
                                                              </th>
                                                              <td className="px-6 py-4 text-right">
                                                                  {
                                                                      production.quantity
                                                                  }
                                                              </td>
                                                              <td className="px-6 py-4 text-right">
                                                                  {
                                                                      production.done
                                                                  }
                                                              </td>
                                                              <td className="px-6 py-4 text-right">
                                                                  {
                                                                      production.faults
                                                                  }
                                                              </td>
                                                              <td className="px-6 py-4 text-right">
                                                                  {
                                                                      production.processing
                                                                  }
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
                                                  <td className="px-6 py-3">
                                                      Tổng
                                                  </td>
                                                  <td className="px-6 py-3 text-right font-bold">
                                                      {item.totalQuantity}
                                                  </td>
                                                  <td className="px-6 py-3 text-right font-bold">
                                                      {item.totalDone}
                                                  </td>
                                                  <td className="px-6 py-3 text-right font-bold">
                                                      {item.totalFaults}
                                                  </td>
                                                  <td className="px-6 py-3 text-right font-bold">
                                                      {item.totalProcessing}
                                                  </td>
                                              </tr>
                                          </tfoot>
                                      </table>
                                  </div>
                              </section>
                          ))
                        : null}
                </div>
            </div>
            <Modal
                isCentered
                isOpen={isModalOpen}
                size="full"
                onClose={closeInputModal}
                scrollBehavior="inside"
            >
                <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                <ModalContent>
                    <ModalHeader>
                        <h1 className="text-xl lg:text-2xl text-center text-bold text-[#17506B]">
                            Ghi nhận sản lượng
                        </h1>
                    </ModalHeader>
                    <ModalCloseButton />
                    <div className="border-b-2 border-gray-100"></div>
                    <ModalBody>
                        <div className="flex flex-col justify-center ">
                            <div className="xl:mx-auto xl:px-8 text-base w-full xl:w-[55%] space-y-3 ">
                                <Alert status="error">
                                    <AlertIcon />
                                    <AlertDescription className="flex items-center gap-3">
                                        <span className="">
                                            Lỗi báo từ công đoạn trước:{" "}
                                        </span>
                                        <Badge
                                            colorScheme="red"
                                            fontSize="1.2rem"
                                        >
                                            125
                                        </Badge>
                                    </AlertDescription>
                                </Alert>
                                <div className="flex flex-col md:flex-row justify-between items-center">
                                    <div className="flex flex-col gap-4">
                                        <label className="font-semibold">
                                            Sản phẩm/Chi tiết
                                        </label>
                                        <span>
                                            {selectedItemDetails?.subItemName}
                                        </span>
                                    </div>
                                    <img
                                        alt="Hình minh hoạ sản phẩm gỗ"
                                        className="w-[350px] -mt-8"
                                        src={FinishedGoodsIllustration}
                                    />
                                </div>
                                <div className="flex justify-between py-4 border-t-2 border-b-2 border-dashed">
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
                                <Text className="font-semibold">
                                    Số lượng phôi đã nhận và phôi tồn tại tổ
                                </Text>
                                <div className="flex flex-col py-4 bg-green-300 border-t-2 border-b-2 border-dashed">
                                    <div className="flex items-center gap-4">
                                        <span className="ml-2">
                                            {selectedItemDetails?.subItemName} (
                                            {selectedItemDetails?.thickness} *
                                            {selectedItemDetails?.width} *
                                            {selectedItemDetails?.length}) :{" "}
                                        </span>
                                        <span class="rounded-lg cursor-pointer px-2 py-1 text-white bg-[#155979] hover:bg-[#1A6D94] duration-300">
                                            {selectedItemDetails?.stockQuantity ||
                                                0}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center py-4 border-t">
                                    <Text className="font-semibold">
                                        Số lượng tối đa có thể xuất
                                    </Text>
                                    <span class="rounded-lg cursor-pointer px-2 py-1 text-white bg-green-700 hover:bg-green-500 duration-300">
                                        {selectedItemDetails?.stockQuantity ||
                                            0}
                                    </span>
                                </div>
                                <div className="flex gap-2 items-center py-4 border-t border-b !mt-0">
                                    <Text className="font-semibold">
                                        Số lượng còn phải sản xuất
                                    </Text>
                                    <span class="rounded-lg cursor-pointer px-2 py-1 text-white bg-yellow-700 hover:bg-yellow-500 duration-300">
                                        {selectedItemDetails?.totalProcessing ||
                                            0}
                                    </span>
                                </div>
                                <Box>
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
                                        }}
                                    >
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </Box>
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
                                                125
                                            </Badge>
                                        </div>
                                        <div className="flex flex-col">
                                            <Text className="font-semibold">
                                                Lý do:{" "}
                                            </Text>
                                            <span className="ml-1">
                                                Số lượng chưa chuẩn
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <button className="rounded-full p-2 duration-200 ease hover:bg-slate-100">
                                            <AiTwotoneDelete className="text-red-700 text-2xl" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center p-3 my-4 border border-red-600 rounded">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-4">
                                            <Text className="font-semibold">
                                                Số lượng ghi nhận lỗi chờ xác
                                                nhận:{" "}
                                            </Text>{" "}
                                            <Badge
                                                colorScheme="red"
                                                fontSize="1.2rem"
                                            >
                                                1
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
                                        <button className="rounded-full p-2 duration-200 ease hover:bg-slate-100">
                                            <AiTwotoneDelete className="text-red-700 text-2xl" />
                                        </button>
                                    </div>
                                </div>
                                <Box>
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
                                    <RadioGroup
                                        ref={checkRef}
                                        className="hidden mt-4 ml-3"
                                    >
                                        <Radio value="1">
                                            {selectedItemDetails?.subItemName} (
                                            {selectedItemDetails?.thickness} *
                                            {selectedItemDetails?.width} *
                                            {selectedItemDetails?.length}) :{" "}
                                        </Radio>
                                    </RadioGroup>
                                </Box>
                                <Box>
                                    <label className="font-semibold text-red-700">
                                        Lỗi phôi nhận từ nhà máy khác
                                    </label>
                                    <Select
                                        className="mt-4 mb-12"
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
                            </div>
                        </div>
                    </ModalBody>

                    <ModalFooter className="flex flex-col !p-0">
                        <Alert status="info">
                            <AlertIcon />
                            Công đoạn sản xuất tiếp theo:{" "}
                            <span className="font-bold ml-1">
                                {nextGroup.name || "chưa rõ"}
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

export default ItemInput;
