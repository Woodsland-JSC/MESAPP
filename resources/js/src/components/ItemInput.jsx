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
    Spinner,
    useDisclosure,
} from "@chakra-ui/react";
import Select from "react-select";
import toast from "react-hot-toast";
import { AiTwotoneDelete } from "react-icons/ai";
import productionApi from "../api/productionApi";
import useAppContext from "../store/AppContext";
import FinishedGoodsIllustration from "../assets/images/wood-receipt-illustration.png";
import Loader from "./Loader";
import moment from "moment";
import { formatNumber } from "../utils/numberFormat";

// const factories = [
//     {
//         value: "YS1",
//         label: "Nhà máy chế biến gỗ Yên Sơn 1",
//     },
//     {
//         value: "TB",
//         label: "Nhà máy chế biến gỗ Thái Bình",
//     },
// ];

const ItemInput = ({
    data,
    index,
    fromGroup,
    // isQualityCheck,
    nextGroup,
    onReceiptFromChild,
    onRejectFromChild,
}) => {
    const checkRef = useRef(null);
    const receipInput = useRef(null);

    const { user } = useAppContext();
    // console.log("Ra input: ", data);
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

    const [selectedItemDetails, setSelectedItemDetails] = useState(null);
    const [amount, setAmount] = useState("");
    const [faults, setFaults] = useState({});
    const [receipts, setReceipts] = useState({});
    const [faultyAmount, setFaultyAmount] = useState("");
    const [selectedDelete, setSelectedDelete] = useState(null);
    const [selectedError, setSelectedError] = useState(null);

    // const [errorTypeOptions, setErrorTypeOptions] = useState([]);
    // const [solutionOptions, setSolutionOptions] = useState([]);

    const openInputModal = async (item) => {
        setLoading(true);
        try {
            // console.log("Hello: ", item);
            const params = {
                FatherCode: data.SPDICH,
                ItemCode: item.ItemChild,
                Team: item.TO,
            };
            // console.log("Hi: ", params);
            const res = await productionApi.getFinishedGoodsDetail(params);
            // console.log("Bye: ", res);
            setSelectedItemDetails({
                ...item,
                stockQuantity: res.maxQuantity,
                totalProcessing: res.remainQty,
                factories: res.Factorys?.map((item) => ({
                    value: item.Factory,
                    label: item.FactoryName,
                })),
                notifications: res.notifications,
            });
            onModalOpen();
        } catch (error) {
            toast.error("Có lỗi khi lấy dữ liệu item.");
            console.error(error);
        }
        setLoading(false);
    };

    const closeInputModal = () => {
        onModalClose();
        setAmount();
        setFaults({});
        setReceipts({});
        setSelectedItemDetails(null);
    };

    const handleSubmitQuantity = async () => {
        setConfirmLoading(true);
        try {
            // console.log("Làm ơn đi: ", selectedItemDetails);
            const payload = {
                FatherCode: data.SPDICH,
                ItemCode: selectedItemDetails.ItemChild,
                ItemName: selectedItemDetails.ChildName,
                CDay: Number(selectedItemDetails.CDay),
                CRong: Number(selectedItemDetails.CRong),
                CDai: Number(selectedItemDetails.CDai),
                Team: selectedItemDetails.TO,
                CongDoan: selectedItemDetails.NameTO,
                NexTeam: selectedItemDetails.TOTT,
                Type: "CBG",
                LSX: selectedItemDetails.LSX[0].LSX,
                CompleQty: 0,
                RejectQty: 0,
            };
            if (amount && amount > 0) {
                payload.CompleQty = Number(amount);
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
                // onReceiptFromChild(
                //     {
                //         id: selectedItemDetails.id,
                //         itemId: data?.id,
                //         subItemName: selectedItemDetails.subItemName,
                //         thickness: selectedItemDetails.thickness,
                //         width: selectedItemDetails.width,
                //         length: selectedItemDetails.length,
                //         amount: Number(amount),
                //         createdDate: new Date(),
                //         createdBy: {
                //             id: user.id,
                //             last_name: user.last_name,
                //             first_name: user.first_name,
                //         },
                //         fromGroup: fromGroup,
                //         nextGroup: nextGroup,
                //     },
                //     receipts
                // );
            }
            if (faultyAmount && faultyAmount > 0) {
                payload.RejectQty = Number(faultyAmount);
                // const result = {
                //     id: selectedItemDetails.id,
                //     itemId: data?.id,
                //     subItemName: selectedItemDetails.subItemName,
                //     thickness: selectedItemDetails.thickness,
                //     width: selectedItemDetails.width,
                //     length: selectedItemDetails.length,
                //     amount: Number(faultyAmount),
                //     createdDate: new Date(),
                //     createdBy: {
                //         id: user.id,
                //         last_name: user.last_name,
                //         first_name: user.first_name,
                //     },
                //     fromGroup: fromGroup,
                //     previousGroup: nextGroup,
                // };
                // onRejectFromChild(result, faults);
            }

            // if (isQualityCheck) {
            //     payload.LoaiLoi = faults.errorType || null;
            //     payload.HuongXuLy = faults.solution || null;
            // } else{
            //     payload.LoaiLoi = null;
            //     payload.HuongXuLy = null;
            // }

            if (payload.FatherCode && payload.ItemCode) {
                if (payload.CompleQty || payload.RejectQty) {
                    const res = await productionApi.enterFinishedGoodsAmountCBG(
                        payload
                    );
                    toast.success("Ghi nhận & chuyển tiếp thành công!");
                } else {
                    toast("Chưa nhập bất kì số lượng nào.");
                }
            } else {
                toast("Có lỗi xảy ra. Vui lòng thử lại");
            }
        } catch (error) {
            // Xử lý lỗi (nếu có)
            console.error("Đã xảy ra lỗi:", error);
            toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
        setConfirmLoading(false);
        onReceiptFromChild();
        setFaults({});
        setReceipts({});
        setAmount();
        setFaultyAmount();

        onAlertDialogClose();
        closeInputModal();
    };

    const handleDeleteProcessingReceipt = async () => {
        setDeleteProcessingLoading(true);
        try {
            const payload = {
                id: selectedDelete,
            };
            const res = await productionApi.deleteReceiptCBG(payload);
            toast.success("Thành công.");
            setSelectedItemDetails((prev) => ({
                ...prev,
                notifications: prev.notifications.filter(
                    (notification) => notification.id !== selectedDelete
                ),
            }));
        } catch (error) {
            toast.error("Có lỗi xảy ra. Vui lòng thử lại");
        }
        setSelectedDelete(null);
        onDeleteProcessingDialogClose();
        setDeleteProcessingLoading(false);
    };

    const handleDeleteErrorReceipt = async () => {
        setDeleteErrorLoading(true);
        try {
            const payload = {
                id: selectedError,
            };
            const res = await productionApi.deleteReceiptCBG(payload);
            toast.success("Thành công.");
            setSelectedItemDetails((prev) => ({
                ...prev,
                notifications: prev.notifications.filter(
                    (notification) => notification.id !== selectedDelete
                ),
            }));
        } catch (error) {
            toast.error("Có lỗi xảy ra. Vui lòng thử lại");
        }
        setSelectedError(null);
        onDeleteErrorDialogClose();
        setDeleteErrorLoading(false);
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
        } else {
            checkElement?.classList?.add("hidden");
            checkElement?.classList?.remove("block");
        }
    }, [faultyAmount]);

    // useEffect(() => {
    //     const getErrorTypeOptions = async () => {
    //         try {
    //             const res = await productionApi.getErrorTypes();
    //             const errorTypes = res.map((error, index) => ({
    //                 value: error?.id || "",
    //                 label: error?.name || "",
    //             }));
    //             console.log("Other side: ", errorTypes);
    //             setErrorTypeOptions(errorTypes);
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     };
    //     const getSolutionOptions = async () => {
    //         try {
    //             const res = await productionApi.getSolutions("CBG");
    //             const solutions = res.map((solution, index) => ({
    //                 value: solution?.id || "",
    //                 label: solution?.name || "",
    //             }));
    //             console.log("Other side 2: ", solutions);
    //             setSolutionOptions(solutions);
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     };
    //     getErrorTypeOptions();
    //     getSolutionOptions();
    // }, []);

    return (
        <>
            <div
                className="shadow-lg relative border bg-white border-indigo-100 z-1 before:absolute before:left-[-0.25rem] before:content-[''] before:h-7 before:w-7 before:rotate-[60deg] before:top-[2.6rem] before:bg-[#283593] before:z-[-1] after:absolute after:content-[attr(data-label)] after:w-fit after:text-[white] after:text-left after:shadow-[4px_4px_15px_rgba(26,35,126,0.2)] after:px-2 after:py-1.5 after:-left-2.5 after:top-[14.4px] after:bg-[#3949ab] after:whitespace-nowrap"
                data-label={data.NameSPDich}
            >
                {/* <span className="font-semibold absolute top-0-left-0 bg-green-500"></span> */}
                <div className="w-full h-full flex flex-col gap-4 mb-4 mt-2 px-1 pt-11 z-[999] bg-white">
                    {/* <span className="font-semibold">
                        TYBYN bar table 74x74x102 acacia/black
                    </span> */}
                    {data.Details.length > 0
                        ? data.Details.map((item, index) => (
                              <section
                                  onClick={() => openInputModal(item)}
                                  className="my-2 cursor-pointer duration-200 ease-linear hover:opacity-80"
                                  key={index}
                              >
                                  <span className="ml-1">
                                      {index + 1}. {item.ChildName} ({item.CDay}
                                      *{item.CRong}*{item.CDai})
                                  </span>
                                  <div className="relative overflow-x-auto shadow-md sm:rounded-lg ml-0 mt-2 ">
                                      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                                          <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                                              <tr>
                                                  <th
                                                      scope="col"
                                                      className="px-2 py-2"
                                                  >
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
                                              {item.LSX?.length > 0 ? (
                                                  item.LSX.map(
                                                      (production, index) =>
                                                          production.ConLai !==
                                                              0 && (
                                                              <tr
                                                                  className="bg-white border-b"
                                                                  key={index}
                                                              >
                                                                  <th
                                                                      scope="row"
                                                                      className="px-2 py-1 font-medium text-gray-900 whitespace-nowrap"
                                                                  >
                                                                      {
                                                                          production.LSX
                                                                      }
                                                                  </th>
                                                                  <td className="px-2 py-2 text-right">
                                                                      {formatNumber(
                                                                          Number(
                                                                              production.SanLuong
                                                                          )
                                                                      )}
                                                                  </td>
                                                                  <td className="px-2 py-2 text-right">
                                                                      {formatNumber(
                                                                          Number(
                                                                              production.DaLam
                                                                          )
                                                                      )}
                                                                  </td>
                                                                  <td className="px-2 py-2 text-right">
                                                                      {formatNumber(
                                                                          Number(
                                                                              production.Loi
                                                                          )
                                                                      )}
                                                                  </td>
                                                                  <td className="px-2 py-2 text-right">
                                                                      {formatNumber(
                                                                          Number(
                                                                              production.ConLai
                                                                          )
                                                                      )}
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
                                                  <td className="px-2 py-2">
                                                      Tổng
                                                  </td>
                                                  <td className="px-2 py-2 text-right font-bold">
                                                      {formatNumber(
                                                          Number(
                                                              item.totalsanluong
                                                          )
                                                      )}
                                                  </td>
                                                  <td className="px-2 py-2 text-right font-bold">
                                                      {formatNumber(
                                                          Number(
                                                              item.totalDaLam
                                                          )
                                                      )}
                                                  </td>
                                                  <td className="px-2 py-2 text-right font-bold">
                                                      {formatNumber(
                                                          Number(item.totalLoi)
                                                      )}
                                                  </td>
                                                  <td className="px-2 py-2 text-right font-bold">
                                                      {formatNumber(
                                                          Number(
                                                              item.totalConLai
                                                          )
                                                      )}
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
                                {/* {selectedItemDetails?.pendingErrors && */}
                                {/* selectedItemDetails?.pendingErrors.length > 0 && ( */}
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
                                            {formatNumber(
                                                Number(
                                                    selectedItemDetails?.pendingErrors?.reduce(
                                                        (total, item) =>
                                                            total + item.amount,
                                                        0
                                                    )
                                                )
                                            ) || 0}
                                        </Badge>
                                    </AlertDescription>
                                </Alert>
                                {/* )} */}
                                <div className="flex flex-col md:flex-row justify-between items-center">
                                    <div className="flex flex-col gap-4 w-full px-4">
                                        <label className="font-semibold">
                                            Sản phẩm/Chi tiết
                                        </label>
                                        <span>
                                            {selectedItemDetails?.ChildName}
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
                                            {selectedItemDetails?.CDay || 0}
                                        </span>
                                    </div>
                                    <div className="flex flex-col justify-start">
                                        <label className="font-semibold">
                                            Rộng
                                        </label>
                                        <span>
                                            {selectedItemDetails?.CRong || 0}
                                        </span>
                                    </div>
                                    <div className="flex flex-col justify-start">
                                        <label className="font-semibold">
                                            Dài
                                        </label>
                                        <span>
                                            {selectedItemDetails?.CDai || 0}
                                        </span>
                                    </div>
                                </div>
                                <Text className="font-semibold px-4">
                                    Số lượng phôi đã nhận và phôi tồn tại tổ
                                </Text>
                                <div className="flex flex-col py-4 bg-green-300 border-t-2 border-b-2 border-dashed">
                                    <div className="flex items-center gap-4 px-4">
                                        <span className="ml-2">
                                            {selectedItemDetails?.ChildName} (
                                            {selectedItemDetails?.CDay} *
                                            {selectedItemDetails?.CRong} *
                                            {selectedItemDetails?.CDai}) :{" "}
                                        </span>
                                        <span className="rounded-lg cursor-pointer px-2 py-1 text-white bg-[#155979] hover:bg-[#1A6D94] duration-300">
                                            {formatNumber(
                                                Number(
                                                    selectedItemDetails?.stockQuantity
                                                )
                                            ) || 0}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 items-center py-4 border-t px-4">
                                    <Text className="font-semibold">
                                        Số lượng tối đa có thể xuất
                                    </Text>
                                    <span className="rounded-lg cursor-pointer px-2 py-1 text-white bg-green-700 hover:bg-green-500 duration-300">
                                        {formatNumber(
                                            Number(
                                                selectedItemDetails?.stockQuantity
                                            )
                                        ) || 0}
                                    </span>
                                </div>
                                <div className="flex gap-2 items-center py-4 border-t border-b !mt-0 px-4">
                                    <Text className="font-semibold">
                                        Số lượng còn phải sản xuất
                                    </Text>
                                    <span className="rounded-lg cursor-pointer px-2 py-1 text-white bg-yellow-700 hover:bg-yellow-500 duration-300">
                                        {formatNumber(
                                            Number(
                                                selectedItemDetails?.totalProcessing
                                            )
                                        ) || 0}
                                    </span>
                                </div>
                                <Box className="px-4">
                                    <label className="font-semibold">
                                        Số lượng ghi nhận sản phẩm
                                    </label>
                                    <NumberInput
                                        ref={receipInput}
                                        step={1}
                                        min={1}
                                        // max={
                                        //     goodsReceiptList.find(
                                        //         (item) =>
                                        //             item.ItemCode ==
                                        //             selectedItem.value
                                        //     )?.Qty || 0
                                        // }
                                        value={amount}
                                        className="mt-4"
                                        // onInput={(value) => {
                                        // if (value > selectedItemDetails.stockQuantity) {
                                        //     setAmount(value)
                                        // }
                                        // console.log("Input: ", value);
                                        // }}
                                        onChange={(value) => {
                                            if (
                                                value >
                                                selectedItemDetails.stockQuantity
                                            ) {
                                                // console.log("Dô: ", selectedItemDetails.stockQuantity);
                                                // receipInput.current.querySelector(
                                                //         "input"
                                                //     ).value =
                                                //         selectedItemDetails.stockQuantity;
                                                setAmount(
                                                    selectedItemDetails.stockQuantity
                                                );
                                                setReceipts((prev) => ({
                                                    ...prev,
                                                    amount: selectedItemDetails.stockQuantity,
                                                }));
                                            } else {
                                                setAmount(value);
                                                setReceipts((prev) => ({
                                                    ...prev,
                                                    amount: value,
                                                }));
                                            }
                                        }}
                                    >
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </Box>
                                {selectedItemDetails?.notifications &&
                                    selectedItemDetails?.notifications.filter(
                                        (notif) =>
                                            notif.confirm == 0 &&
                                            notif.type == 0
                                    )?.length > 0 &&
                                    selectedItemDetails?.notifications
                                        .filter(
                                            (notif) =>
                                                notif.confirm == 0 &&
                                                notif.type == 0
                                        )
                                        /** Type = 0: Ghi nhận giao chờ xác nhận (Ghi nhận gửi đi công đoạn trên)
                                            Type = 1: Ghi nhận lỗi cho công đoạn trước chờ xác nhận (Reject gửi xuống công đoạn dưới thì phải)
                                            Type = 2: Công đoạn trên trả lại với lý do gì đó (thì phải)
                                         **/
                                        ?.map((item, index) => (
                                            <div
                                                key={"Processing_" + index}
                                                className="flex justify-between items-center p-3 my-4 mx-3 border border-green-600 rounded"
                                            >
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
                                                            {Number(
                                                                item?.Quantity
                                                            )}
                                                        </Badge>
                                                    </div>
                                                    <Text>
                                                        tạo bởi:{" "}
                                                        {item?.last_name +
                                                            " " +
                                                            item?.first_name}
                                                    </Text>
                                                    <div className="flex flex-col">
                                                        <Text className="font-semibold">
                                                            Thời gian giao:{" "}
                                                        </Text>
                                                        <span className="ml-1 text-violet-700">
                                                            {moment(
                                                                item?.created_at,
                                                                "YYYY-MM-DD HH:mm:ss"
                                                            ).format(
                                                                "DD/MM/YYYY"
                                                            ) || ""}{" "}
                                                            {moment(
                                                                item?.created_at,
                                                                "YYYY-MM-DD HH:mm:ss"
                                                            ).format(
                                                                "HH:mm:ss"
                                                            ) || ""}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() => {
                                                            onDeleteProcessingDialogOpen();
                                                            setSelectedDelete(
                                                                item?.id
                                                            );
                                                        }}
                                                        className="rounded-full p-2 duration-200 ease hover:bg-slate-100"
                                                    >
                                                        <AiTwotoneDelete className="text-red-700 text-2xl" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                {selectedItemDetails?.notifications &&
                                    selectedItemDetails?.notifications.filter(
                                        (notif) =>
                                            notif.confirm == 3 &&
                                            notif.type == 2
                                    )?.length > 0 &&
                                    selectedItemDetails?.notifications
                                        .filter(
                                            (notif) =>
                                                notif.confirm == 3 &&
                                                notif.type == 2
                                        )
                                        ?.map((item, index) => (
                                            <div
                                                key={"Return_" + index}
                                                className="flex justify-between items-center p-3 my-4 mx-3 border border-red-600 rounded"
                                            >
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-4">
                                                        <Text className="font-semibold">
                                                            Phôi trả lại:{" "}
                                                        </Text>{" "}
                                                        <Badge
                                                            colorScheme="red"
                                                            fontSize="1.2rem"
                                                        >
                                                            {formatNumber(
                                                                Number(
                                                                    item?.Quantity
                                                                )
                                                            )}
                                                        </Badge>
                                                    </div>
                                                    <Text>
                                                        tạo bởi:{" "}
                                                        {item?.last_name +
                                                            " " +
                                                            item?.first_name}
                                                    </Text>
                                                    <div className="flex flex-col">
                                                        <Text className="font-semibold">
                                                            Lý do:{" "}
                                                        </Text>
                                                        <span className="ml-1">
                                                            {item?.text}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() => {
                                                            onDeleteErrorDialogOpen();
                                                            setSelectedError(
                                                                item?.id
                                                            );
                                                        }}
                                                        className="rounded-full p-2 duration-200 ease hover:bg-slate-100"
                                                    >
                                                        <AiTwotoneDelete className="text-red-700 text-2xl" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                {selectedItemDetails?.notifications &&
                                    selectedItemDetails?.notifications.filter(
                                        (notif) =>
                                            notif.confirm == 0 &&
                                            notif.type == 1
                                    )?.length > 0 &&
                                    selectedItemDetails?.notifications
                                        .filter(
                                            (notif) =>
                                                notif.confirm == 0 &&
                                                notif.type == 1
                                        )
                                        .map((item, index) => (
                                            <div
                                                key={"Error_" + index}
                                                className="flex justify-between items-center p-3 my-4 mx-3 border border-red-600 rounded"
                                            >
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-4">
                                                        <Text className="font-semibold">
                                                            Số lượng ghi nhận
                                                            lỗi chờ xác nhận:{" "}
                                                        </Text>{" "}
                                                        <Badge
                                                            colorScheme="red"
                                                            fontSize="1.2rem"
                                                        >
                                                            {formatNumber(
                                                                Number(
                                                                    item?.Quantity
                                                                )
                                                            )}
                                                        </Badge>
                                                    </div>
                                                    <Text>
                                                        tạo bởi:{" "}
                                                        {item?.last_name +
                                                            " " +
                                                            item?.first_name}
                                                    </Text>
                                                    <div className="flex flex-col">
                                                        <Text className="font-semibold">
                                                            Thời gian giao:{" "}
                                                        </Text>
                                                        <span className="ml-1 text-violet-700">
                                                            {moment(
                                                                item?.created_at,
                                                                "YYYY-MM-DD HH:mm:ss"
                                                            ).format(
                                                                "DD/MM/YYYY"
                                                            ) || ""}{" "}
                                                            {moment(
                                                                item?.created_at,
                                                                "YYYY-MM-DD HH:mm:ss"
                                                            ).format(
                                                                "HH:mm:ss"
                                                            ) || ""}
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
                                        ))}
                                <Box className="px-3">
                                    <label className="font-semibold text-red-700">
                                        Khai báo số lượng lỗi
                                    </label>
                                    <NumberInput
                                        step={1}
                                        min={0}
                                        // max={
                                        //     goodsReceiptList.find(
                                        //         (item) =>
                                        //             item.ItemCode ==
                                        //             selectedItem.value
                                        //     )?.Qty || 0
                                        // }
                                        className="mt-4"
                                        value={faultyAmount}
                                        onChange={(value) => {
                                            if (
                                                value >
                                                selectedItemDetails.stockQuantity
                                            ) {
                                                setFaultyAmount(
                                                    selectedItemDetails.stockQuantity
                                                );
                                                setFaults((prev) => ({
                                                    ...prev,
                                                    amount: selectedItemDetails.stockQuantity,
                                                }));
                                            } else {
                                                setFaultyAmount(value);
                                                setFaults((prev) => ({
                                                    ...prev,
                                                    amount: value,
                                                }));
                                            }
                                            if (value == 0 || !value) {
                                                setFaults((prev) => ({
                                                    ...prev,
                                                    factory: null,
                                                }));
                                            }
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
                                        value="1"
                                    >
                                        <Radio value="1">
                                            {selectedItemDetails?.ChildName} (
                                            {selectedItemDetails?.CDay} *
                                            {selectedItemDetails?.CRong} *
                                            {selectedItemDetails?.CDai}){" "}
                                        </Radio>
                                    </RadioGroup>
                                </Box>
                                <Box className="px-3">
                                    <label className="font-semibold text-red-700">
                                        Lỗi phôi nhận từ nhà máy khác
                                    </label>
                                    <Select
                                        className="mt-4 mb-8"
                                        placeholder="Lựa chọn"
                                        options={selectedItemDetails?.factories}
                                        isClearable
                                        isSearchable
                                        value={faults.factory}
                                        onChange={(value) => {
                                            if (
                                                !faultyAmount ||
                                                faultyAmount < 1
                                            ) {
                                                toast(
                                                    "Vui lòng khai báo số lượng lỗi."
                                                );
                                                setFaults((prev) => ({
                                                    ...prev,
                                                    factory: null,
                                                }));
                                            } else {
                                                setFaults((prev) => ({
                                                    ...prev,
                                                    factory: value,
                                                }));
                                            }
                                        }}
                                    />
                                </Box>
                                {/* {isQualityCheck && (
                                    <>
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
                                                // onChange={(value) => {
                                                //     setFaults((prev) => ({
                                                //         ...prev,
                                                //         errorType: value,
                                                //     }));
                                                // }}
                                                value={faults.errorType}
                                                onChange={(value) => {
                                                    if (
                                                        !faultyAmount ||
                                                        faultyAmount < 1
                                                    ) {
                                                        toast(
                                                            "Vui lòng khai báo số lượng lỗi."
                                                        );
                                                        setFaults((prev) => ({
                                                            ...prev,
                                                            errorType: null,
                                                        }));
                                                    } else {
                                                        setFaults((prev) => ({
                                                            ...prev,
                                                            errorType: value,
                                                        }));
                                                    }
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
                                                // onChange={(value) => {
                                                //     setFaults((prev) => ({
                                                //         ...prev,
                                                //         solution: value,
                                                //     }));
                                                // }}
                                                value={faults.solution}
                                                onChange={(value) => {
                                                    if (
                                                        !faultyAmount ||
                                                        faultyAmount < 1
                                                    ) {
                                                        toast(
                                                            "Vui lòng khai báo số lượng lỗi."
                                                        );
                                                        setFaults((prev) => ({
                                                            ...prev,
                                                            solution: null,
                                                        }));
                                                    } else {
                                                        if (faults.errorType) {
                                                            setFaults((prev) => ({
                                                                ...prev,
                                                                solution: value,
                                                            }));
                                                        } else {
                                                            toast(
                                                                "Vui lòng chọn loại lỗi."
                                                            );
                                                            setFaults((prev) => ({
                                                                ...prev,
                                                                solution: null,
                                                            }));
                                                        }
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </>
                                )} */}
                            </div>
                        </div>
                    </ModalBody>

                    <ModalFooter className="flex flex-col !p-0">
                        <Alert status="info">
                            <AlertIcon />
                            <span className="text-[14px] sm:text-base">
                                Công đoạn sản xuất tiếp theo:{" "}
                            </span>
                            <span className="text-[14px] sm:text-base font-bold ml-1">
                                {selectedItemDetails?.TOTT || "chưa rõ"}
                            </span>
                        </Alert>
                        <div className="border-b-2 border-gray-100"></div>
                        <div className="flex items-item justify-end p-4 w-full gap-4">
                            <Button
                                className="bg-[#edf2f7]"
                                onClick={closeInputModal}
                            >
                                Đóng
                            </Button>
                            <Button
                                type="button"
                                isDisabled={
                                    !amount &&
                                    amount <= 0 &&
                                    !faultyAmount &&
                                    faultyAmount <= 0
                                }
                                className="bg-[#2f8558]"
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
                            {amount && amount > 0 && (
                                <div className="text-green-700">
                                    Ghi nhận sản lượng:{" "}
                                    <span className="font-bold">{amount}</span>{" "}
                                </div>
                            )}
                            {faultyAmount && faultyAmount > 0 && (
                                <div className="text-red-700">
                                    Ghi nhận lỗi:{" "}
                                    <span className="font-bold">
                                        {faultyAmount}
                                    </span>{" "}
                                    {faults &&
                                        faults.factory &&
                                        "từ " + faults.factory?.label}
                                </div>
                            )}
                        </AlertDialogBody>
                        <AlertDialogFooter className="gap-4">
                            <Button onClick={onAlertDialogClose}>Huỷ bỏ</Button>
                            {/* <Button
                                colorScheme="red"
                                onClick={handleSubmitQuantity}
                                ml={3}
                                backgroundColor="#c53030 !important"
                            >
                                Xác nhận
                            </Button> */}
                            <button
                                disabled={confirmLoading}
                                className="w-fit bg-[#c53030] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                onClick={handleSubmitQuantity}
                            >
                                {confirmLoading ? (
                                    <div className="flex items-center space-x-4">
                                        <Spinner size="sm" color="white" />
                                        <div>Đang tải</div>
                                    </div>
                                ) : (
                                    "Xác nhận"
                                )}
                            </button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            <AlertDialog
                isOpen={isDeleteProcessingDialogOpen}
                onClose={onDeleteProcessingDialogClose}
                closeOnOverlayClick={false}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            Xác nhận xoá chờ xác nhận
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            <div className="text-red-700">
                                Bạn chắc chắn muốn xoá số lượng đã giao chờ xác
                                nhận?
                            </div>
                        </AlertDialogBody>
                        <AlertDialogFooter className="gap-4">
                            <Button
                                onClick={() => {
                                    setSelectedDelete(null);
                                    onDeleteProcessingDialogClose();
                                }}
                            >
                                Huỷ bỏ
                            </Button>
                            <button
                                className="w-fit bg-[#c53030] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                onClick={handleDeleteProcessingReceipt}
                            >
                                {deleteProcessingLoading ? (
                                    <div className="flex items-center space-x-4">
                                        <Spinner size="sm" color="white" />
                                        <div>Đang tải</div>
                                    </div>
                                ) : (
                                    "Xác nhận"
                                )}
                            </button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            <AlertDialog
                isOpen={isDeleteErrorDialogOpen}
                onClose={onDeleteErrorDialogClose}
                closeOnOverlayClick={false}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            Xác nhận xoá phôi lỗi trả lại
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            <div className="text-red-700">
                                Bạn chắc chắn muốn xoá số lượng phôi lỗi trả
                                lại?
                            </div>
                        </AlertDialogBody>
                        <AlertDialogFooter className="gap-4">
                            <Button
                                onClick={() => {
                                    setSelectedError(null);
                                    onDeleteErrorDialogClose();
                                }}
                            >
                                Huỷ bỏ
                            </Button>
                            <button
                                className="w-fit bg-[#c53030] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                onClick={handleDeleteErrorReceipt}
                            >
                                {deleteErrorLoading ? (
                                    <div className="flex items-center space-x-4">
                                        <Spinner size="sm" color="white" />
                                        <div>Đang tải</div>
                                    </div>
                                ) : (
                                    "Xác nhận"
                                )}
                            </button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            {loading && <Loader />}
        </>
    );
};

export default ItemInput;
