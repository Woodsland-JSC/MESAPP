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
import { FaCircleRight } from "react-icons/fa6";
import { FaExclamationCircle } from "react-icons/fa";
import { TbPlayerTrackNextFilled } from "react-icons/tb";
import { MdDangerous } from "react-icons/md";

const ItemInput = ({
    data,
    index,
    fromGroup,
    searchTerm,
    MaThiTruong,
    // isQualityCheck,
    nextGroup,
    onReceiptFromChild,
    onRejectFromChild,
}) => {
    const checkRef = useRef(null);
    const itemCheckRef = useRef(null);
    const subItemCheckRef = useRef(null);
    const receipInput = useRef(null);

    const filteredData = Array.isArray(data)
        ? data.filter((item) =>
              `${item.ChildName} (${item.CDay}*${item.CRong}*${item.CDai})`
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
          )
        : [];

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

    // Xóa ghi nhận QC
    const {
        isOpen: isDeleteQCLoggingOpen,
        onOpen: onDeleteQCLoggingOpen,
        onClose: onDeleteQCLoggingClose,
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
    const [selectedFaultItem, setSelectedFaultItem] = useState({
        ItemCode: "",
        ItemName: "",
        SubItemCode: "",
        SubItemName: "",
        SubItemBaseQty:"",
        OnHand: ""
    });
    const [isItemCodeDetech, setIsItemCodeDetech] = useState(false);
    const [amount, setAmount] = useState("");
    const [faultyAmount, setFaultyAmount] = useState("");
    const [choosenItem, setChoosenItem] = useState(null);
    const [faults, setFaults] = useState({});
    const [receipts, setReceipts] = useState({});
    const [selectedDelete, setSelectedDelete] = useState(null);
    const [selectedError, setSelectedError] = useState(null);
    const [dialogType, setDialogType] = useState(null);
    const [selectedQCLogging, setSelectedQCLogging] = useState(null);

    const openInputModal = async (item) => {
        setLoading(true);
        try {
            // console.log("Hello: ", item);
            const params = {
                SPDICH: data.SPDICH,
                ItemCode: item.ItemChild,
                TO: item.TO,
            };
            // console.log("Hi: ", params);
            const res = await productionApi.getFinishedGoodsDetail(params);
            console.log("Chi tiết thành phẩm: ", res);
            setSelectedItemDetails({
                ...item,
                ItemInfo: res.ItemInfo,
                stockQuantity: res.maxQuantity,
                totalProcessing: res.remainQty,
                CongDoan: res.CongDoan,
                SubItemWhs: res.SubItemWhs,
                factories: res.Factorys?.map((item) => ({
                    value: item.Factory,
                    label: item.FactoryName,
                })),
                notifications: res.notifications,
                stock: res.stock,
                maxQty: res.maxQty,
                WaitingConfirmQty: res.WaitingConfirmQty,
                
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
        if (amount < 0) {
            toast.error("Số lượng ghi nhận phải lớn hơn 0");
            onAlertDialogClose();
            return;
        } else if (
            amount >
            selectedItemDetails.maxQty - selectedItemDetails.WaitingConfirmQty
        ) {
            toast.error("Đã vượt quá số lượng có thể ghi nhận");
            onAlertDialogClose();
            return;
        } else if (faultyAmount < 0) {
            toast.error("Số lượng lỗi phải lớn hơn 0");
            onAlertDialogClose();
            return;
        } else if (selectedFaultItem.SubItemCode === "" && selectedFaultItem.ItemCode === "" && faultyAmount) {
            toast.error("Vui lòng chọn sản phẩm cần ghi nhận lỗi");
            onAlertDialogClose();
            return;
        }  else if (selectedFaultItem.SubItemCode !== "" && faultyAmount > selectedFaultItem.OnHand ) {
            toast.error("Đã vượt quá số lượng có thể ghi nhận lỗi");
            onAlertDialogClose();
            return;
        } else {
            setConfirmLoading(true);

            // Object chứa dữ liệu lỗi 
            const ErrorData = isItemCodeDetech
            ? {
                  SubItemWhs: selectedItemDetails.SubItemWhs,
                  SubItemQty: selectedItemDetails.stock.map((item) => ({
                      SubItemCode: item.SubItemCode,
                      BaseQty: item.BaseQty,
                  })),
              }
            : {
                SubItemWhs: selectedItemDetails.SubItemWhs,
                SubItemQty: {
                    SubItemCode: selectedFaultItem.SubItemCode,
                    BaseQty: selectedFaultItem.SubItemBaseQty,
                }
            };

            try {
                const payload = {
                    FatherCode: data.SPDICH,
                    ItemCode: selectedItemDetails.ItemChild,
                    ItemName: selectedItemDetails.ChildName,
                    SubItemName: selectedFaultItem.SubItemName,
                    SubItemCode: selectedFaultItem.SubItemCode,
                    MaThiTruong: MaThiTruong,
                    CDay: Number(selectedItemDetails.CDay),
                    CRong: Number(selectedItemDetails.CRong),
                    CDai: Number(selectedItemDetails.CDai),
                    Team: selectedItemDetails.TO,
                    CongDoan: selectedItemDetails.NameTO,
                    NexTeam: selectedItemDetails.TOTT,
                    ErrorData: ErrorData, 
                    Type: "CBG",
                    LSX: selectedItemDetails.LSX[0].LSX,
                    CompleQty: 0,
                    RejectQty: 0,
                };
                if (amount && amount > 0) {
                    payload.CompleQty = Number(amount);
                }
                if (faultyAmount && faultyAmount > 0) {
                    payload.RejectQty = Number(faultyAmount);
                }

                if (payload.FatherCode && payload.ItemCode) {
                    if (payload.CompleQty || payload.RejectQty) {
                        const res =
                            await productionApi.enterFinishedGoodsAmountCBG(
                                payload
                            );
                        toast.success("Ghi nhận & chuyển tiếp thành công!");
                        setSelectedFaultItem({
                            ItemCode: "",
                            ItemName: "",
                            SubItemCode: "",
                            SubItemName: "",
                            SubItemBaseQty: "",
                            OnHand: "", 
                        });
                        setIsItemCodeDetech(false);
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
        }
    };

    const handleDeleteProcessingReceipt = async (item) => {
        setDeleteProcessingLoading(true);
        try {
            const payload = {
                id: selectedDelete,
                SPDICH: data.SPDICH,
                ItemCode: choosenItem.ItemChild,
                TO: choosenItem.TO,
            };
            const res = await productionApi.deleteReceiptCBG(payload);
            toast.success("Thao tác thành công.");
            setSelectedItemDetails((prev) => ({
                ...prev,
                notifications: prev.notifications.filter(
                    (notification) => notification.id !== selectedDelete
                ),
                WaitingConfirmQty: res.WaitingConfirmQty,
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


    return (
        <>
            <div
                className="shadow-lg relative border bg-white border-indigo-100 z-1 before:absolute before:left-[-0.25rem] before:content-[''] before:h-7 before:w-7 before:rotate-[60deg] before:top-[2.6rem] before:bg-[#283593] before:z-[-1] after:absolute after:content-[attr(data-label)] after:w-fit after:text-[white] after:text-left after:shadow-[4px_4px_15px_rgba(26,35,126,0.2)] after:px-2 after:py-1.5 after:-left-2.5 after:top-[14.4px] after:bg-[#3949ab] after:whitespace-nowrap"
                data-label={data.NameSPDich}
            >
                <div className="w-full h-full flex flex-col gap-4 mb-4 mt-2 px-1 pt-11 z-[999] bg-white">
                    {data.Details.length > 0
                        ? data.Details.map((item, index) => (
                              <section
                                  onClick={() => {
                                      openInputModal(item);
                                      setChoosenItem(item);
                                      console.log("Item đã chọn:", item);
                                      console.log(
                                          "Mã Thị Trường của item:" +
                                              item.ChildName,
                                          MaThiTruong
                                      );
                                  }}
                                  className="my-2 cursor-pointer duration-200 ease-linear hover:opacity-80"
                                  key={index}
                              >
                                  <span className="ml-1">
                                      {index + 1}. {item.ChildName} ({item.CDay}
                                      *{item.CRong}*{item.CDai})
                                  </span>
                                  <div className="relative overflow-x-auto shadow-md sm:rounded-sm ml-0 mt-2 ">
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
                                                      Lỗi
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
                                                  item.LSX.filter(
                                                      (production) =>
                                                          production.ConLai > 0
                                                  )
                                                      .sort((a, b) => {
                                                          return a.LSX.localeCompare(
                                                              b.LSX
                                                          );
                                                      })
                                                      .map(
                                                          (
                                                              production,
                                                              index
                                                          ) => (
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
                                                              item.LSX.reduce(
                                                                  (acc, curr) =>
                                                                      acc +
                                                                      Number(
                                                                          curr.SanLuong
                                                                      ),
                                                                  0
                                                              )
                                                          )
                                                      )}
                                                  </td>
                                                  <td className="px-2 py-2 text-right font-bold">
                                                      {formatNumber(
                                                          Number(
                                                              item.LSX.reduce(
                                                                  (acc, curr) =>
                                                                      acc +
                                                                      Number(
                                                                          curr.DaLam
                                                                      ),
                                                                  0
                                                              )
                                                          )
                                                      )}
                                                  </td>
                                                  <td className="px-2 py-2 text-right font-bold">
                                                      {formatNumber(
                                                          Number(
                                                              item.LSX.reduce(
                                                                  (acc, curr) =>
                                                                      acc +
                                                                      Number(
                                                                          curr.Loi
                                                                      ),
                                                                  0
                                                              )
                                                          )
                                                      )}
                                                  </td>
                                                  <td className="px-2 py-2 text-right font-bold">
                                                      {formatNumber(
                                                          Number(
                                                              item.LSX.reduce(
                                                                  (acc, curr) =>
                                                                      acc +
                                                                      Number(
                                                                          curr.ConLai
                                                                      ),
                                                                  0
                                                              )
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
                        <div class="xl:ml-6 uppercase xl:text-xl ">
                            Ghi nhận sản lượng
                        </div>
                    </ModalHeader>
                    <ModalCloseButton />
                    <div className="border-b-2 border-gray-100"></div>
                    <ModalBody px={0} py={0}>
                        <div className="flex flex-col justify-center mb-4 ">
                            <div className="xl:mx-auto xl:px-8 text-base w-full xl:w-[55%] space-y-3 ">
                                {/* )} */}
                                <div className="flex flex-col md:flex-row justify-between pt-4 items-center xl:px-0 md:px-0 lg:px-0 px-4">
                                    <div className="flex flex-col  w-full">
                                        <label className="font-medium">
                                            Sản phẩm/Chi tiết
                                        </label>
                                        <span className="text-[#17506B] text-2xl font-bold">
                                            {selectedItemDetails?.ChildName}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between py-3 border-2 divide-x-2 border-gray-200 rounded-xl xl:mx-0 md:mx-0 lg:mx-0 mx-4">
                                    <div className="flex flex-col justify-start xl:pl-6 md:pl-6 lg:pl-6 pl-4 w-1/3">
                                        <label className="font-medium uppercase text-sm text-gray-400">
                                            Chiều Dày
                                        </label>
                                        <span className="text-[20px] font-bold">
                                            {selectedItemDetails?.CDay || 0}
                                        </span>
                                    </div>
                                    <div className="flex flex-col justify-start xl:pl-6 md:pl-6 lg:pl-6 pl-4 w-1/3">
                                        <label className="font-medium uppercase text-sm text-gray-400 ">
                                            Chiều Rộng
                                        </label>
                                        <span className="text-[20px] font-bold">
                                            {selectedItemDetails?.CRong || 0}
                                        </span>
                                    </div>
                                    <div className="flex flex-col justify-start xl:pl-6 md:pl-6 lg:pl-6 pl-4 w-1/3">
                                        <label className="font-medium uppercase text-sm text-gray-400">
                                            Chiều Dài
                                        </label>
                                        <span className="text-[20px] font-bold">
                                            {selectedItemDetails?.CDai || 0}
                                        </span>
                                    </div>
                                </div>

                                <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-4 p-4 border-2 border-gray-200 rounded-xl space-y-2">
                                    <div className="flex justify-between pb-3 ">
                                        <div className="flex items-center space-x-2">
                                            <FaCircleRight className="w-7 h-7 text-blue-700" />
                                            <div className="font-semibold text-lg ">
                                                Ghi nhận sản lượng
                                            </div>
                                        </div>
                                        <div className="text-blue-600 p-1.5 px-4 bg-blue-50 rounded-full border-2 border-blue-200">
                                            <span className="xl:inline-block lg:inline-block md:inline-block hidden">
                                                Công đoạn:{" "}
                                            </span>
                                            <span>
                                                {" "}
                                                {selectedItemDetails?.CongDoan}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 pb-3">
                                        <Text className="font-semibold px-2">
                                            Số lượng phôi đã nhận và phôi tồn
                                            tại tổ:
                                        </Text>
                                        {/* BOM Item Group */}
                                        {selectedItemDetails?.stock.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className={`${
                                                        item.OnHand <= 0
                                                            ? "bg-gray-100"
                                                            : "bg-blue-100"
                                                    } flex flex-col py-2  mb-6 rounded-xl`}
                                                >
                                                    <div className="flex items-center justify-between gap-4 px-4">
                                                        <div className=" max-w-[90%]">
                                                            <div className="text-xs text-[#647C9C]">
                                                                <span className="mr-1">
                                                                    [
                                                                    {
                                                                        item.BaseQty
                                                                    }
                                                                    {item.BaseQty.toString().includes(
                                                                        "."
                                                                    ) && (
                                                                        <span>
                                                                            {
                                                                                "-"
                                                                            }
                                                                            {Math.ceil(
                                                                                item.BaseQty
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                    ]
                                                                </span>
                                                                {
                                                                    item.SubItemCode
                                                                }
                                                            </div>
                                                            <div className="font-medium text-[15px] ">
                                                                {item.SubItemName === "Gỗ" ? "Nguyên liệu gỗ" : item.SubItemName === null || item.SubItemName === "" ? "Nguyên vật liệu chưa xác định" : item.SubItemName}
                                                            </div>
                                                        </div>
                                                        <span
                                                            className={`${
                                                                item.OnHand <= 0
                                                                    ? "bg-gray-500"
                                                                    : "bg-[#155979]"
                                                            } rounded-lg cursor-pointer px-3 py-1 text-white duration-300`}
                                                        >
                                                            {item.OnHand.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className="flex gap-2 items-center justify-between py-3 border-t px-2 pr-4">
                                        <Text className="font-semibold">
                                            Số lượng tối đa có thể xuất:
                                        </Text>
                                        <span className="rounded-lg cursor-pointer px-3  py-1 text-white bg-green-700 hover:bg-green-500 duration-300">
                                            {selectedItemDetails?.maxQty > 0
                                                ? (
                                                      selectedItemDetails?.maxQty -
                                                      selectedItemDetails?.WaitingConfirmQty
                                                  ).toLocaleString()
                                                : 0}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 items-center py-3 border-t border-b !mt-0 px-2 pr-4 justify-between">
                                        <Text className="font-semibold">
                                            Số lượng còn phải sản xuất:
                                        </Text>
                                        <span className="rounded-lg cursor-pointer px-3 py-1 text-white bg-yellow-700 hover:bg-yellow-500 duration-300">
                                            {formatNumber(
                                                Number(
                                                    selectedItemDetails?.totalProcessing
                                                )
                                            ) || 0}
                                        </span>
                                    </div>
                                    {/* Số lượng giao chờ xác nhận */}
                                    {selectedItemDetails?.notifications &&
                                        selectedItemDetails?.notifications.filter(
                                            (notif) =>
                                                notif.confirm == 0 &&
                                                notif.type == 0
                                        )?.length > 0 && (
                                        <div className="flex items-center justify-between w-full p-1 px-2 !mt-2 !mb-2">
                                            <Text className="font-semibold">
                                                Số lượng đã giao chờ xác nhận:{" "}
                                            </Text>{" "}
                                        </div>
                                    )}
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
                                            ?.map((item, index) => (
                                                <div className="border-b border-gray-200">
                                                    <div
                                                        key={"Processing_" + index}
                                                        className="flex justify-between items-center p-2.5 px-3 !mb-4  gap-2 bg-green-50 border border-green-300 rounded-xl"
                                                    >
                                                        
                                                        <div className="flex flex-col">
                                                            <div className="xl:hidden lg:hidden md:hidden block  text-green-700 text-2xl">
                                                                        {Number(item?.Quantity)}
                                                            </div>
                                                            <Text className="font-semibold text-[15px] ">
                                                                Người giao:{" "}
                                                                <span className="text-green-700">
                                                                {item?.last_name +
                                                                    " " +
                                                                    item?.first_name}
                                                                </span>
                                                                
                                                            </Text>
                                                            <div className="flex text-sm">
                                                                <Text className=" font-medium text-gray-600">
                                                                    Thời gian giao:{" "}
                                                                </Text>
                                                                <span className="ml-1 text-gray-600">
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
                                                        <div className="flex gap-x-6">
                                                            <div className="xl:block lg;block md:block hidden text-green-700 rounded-lg cursor-pointer px-3 py-1 bg-green-200 font-semibold">
                                                                    {Number(item?.Quantity)}
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    onDeleteProcessingDialogOpen();
                                                                    setSelectedDelete(
                                                                        item?.id
                                                                    );
                                                                    setDialogType(
                                                                        "product"
                                                                    );
                                                                }}
                                                                className="rounded-full  duration-200 ease hover:bg-slate-100 px-2"
                                                            >
                                                                <AiTwotoneDelete className="text-red-700 text-2xl" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    <Box className="px-2">
                                        <label className="mt-6  font-semibold">
                                            Số lượng ghi nhận sản phẩm:
                                        </label>
                                        {selectedItemDetails?.maxQty <= 0 ? (
                                            <div className="flex space-x-2 items-center px-4 py-3 bg-red-50 rounded-xl text-red-500 mt-2 mb-2">
                                                <MdDangerous className="w-6 h-6" />
                                                <div>
                                                    Không đủ số lượng để ghi
                                                    nhận
                                                </div>
                                            </div>
                                        ) : (
                                            <NumberInput
                                                ref={receipInput}
                                                step={1}
                                                min={1}
                                                value={amount}
                                                className="mt-4 mb-2"
                                                onChange={(value) => {
                                                    if (
                                                        value >
                                                        selectedItemDetails.stockQuantity
                                                    ) {
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
                                        )}
                                    </Box>

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
                                                    className="flex justify-between items-center p-3 py-2 my-4 mx-3 border bg-red-50 border-red-600 rounded-xl"
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
                                </div>
                                {selectedItemDetails?.CongDoan === "SC" ? (
                                    <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-4 p-4 mb-3 border-2 border-gray-200 rounded-xl space-y-2">
                                        <div className="text-center text-gray-400">
                                            Công đoạn sơ chế không có ghi nhận
                                            lỗi
                                        </div>
                                    </div>
                                ) : (
                                    <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-4 p-4 mb-3 border-2 border-gray-200 rounded-xl space-y-2">
                                        <div className="flex space-x-2 pb-3 items-center">
                                            <FaExclamationCircle className="w-7 h-7 text-red-700" />
                                            <div className="font-semibold text-lg ">
                                                Ghi nhận lỗi
                                            </div>
                                        </div>
                                        <Alert
                                            status="error"
                                            className="rounded-xl flex items-center !mb-3"
                                        >
                                            <div className="w-full flex items-center justify-between gap-3">
                                                <div className="">
                                                    Tổng số lượng ghi nhận lỗi:{" "}
                                                </div>
                                                <div className="rounded-lg cursor-pointer px-3 py-1 text-white bg-red-800 hover:bg-red-500 duration-300">
                                                    {formatNumber(
                                                        Number(
                                                            selectedItemDetails?.pendingErrors?.reduce(
                                                                (total, item) =>
                                                                    total +
                                                                    item.amount,
                                                                0
                                                            )
                                                        )
                                                    ) || 0}
                                                </div>
                                            </div>
                                        </Alert>
                                        <div className="border-b border-gray-200">

                                        {/* Số lượng ghi nhận lỗi */}
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
                                                ) && (
                                            <div className="flex items-center justify-between w-full p-1 px-2 !mb-2">
                                                <Text className="font-semibold">
                                                    Số lượng lỗi đã ghi nhận:{" "}
                                                </Text>{" "}
                                            </div>
                                        )}
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
                                                            className="flex justify-between items-center p-2.5 px-3 !mb-4  gap-2 bg-red-50 border border-red-300 rounded-xl"
                                                        >
                                                            
                                                            {/*  */}
                                                            <div className="flex flex-col">
                                                            <div className="xl:hidden lg:hidden md:hidden block  text-red-700 text-2xl">
                                                                        {Number(item?.Quantity)}
                                                            </div>
                                                            <div className="text-[15px] ">{item.SubItemName}</div>
                                                            <Text className="font-semibold text-[15px] ">
                                                                Người giao:{" "}
                                                                <span className="text-red-700">
                                                                {item?.last_name +
                                                                    " " +
                                                                    item?.first_name}
                                                                </span>
                                                                
                                                            </Text>
                                                            <div className="flex text-sm">
                                                                <Text className=" font-medium text-gray-600">
                                                                    Thời gian giao:{" "}
                                                                </Text>
                                                                <span className="ml-1 text-gray-600">
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
                                                        <div className="flex gap-x-6 items-center">
                                                            <div className="xl:block lg;block md:block hidden text-red-700 rounded-lg cursor-pointer px-3 py-1 bg-red-200 font-semibold h-fit">
                                                                    {Number(item?.Quantity)}
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    onDeleteProcessingDialogOpen();
                                                                    setSelectedDelete(
                                                                        item?.id
                                                                    );
                                                                    setDialogType(
                                                                        "qc"
                                                                    );
                                                                }}
                                                                    className="rounded-full p-2 duration-200 ease hover:bg-red-100"
                                                            >
                                                                    <AiTwotoneDelete className="text-red-700 text-2xl" />
                                                            </button>
                                                        </div>
                                                        </div>
                                                    
                                                ))}
                                        </div>
                                        <Box className="px-2 pt-2">
                                            <label className="font-semibold ">
                                                Số lượng ghi nhận lỗi
                                            </label>
                                            <NumberInput
                                                step={1}
                                                min={0}
                                                className="mt-2"
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
                                                        setSelectedFaultItem({
                                                            ItemCode: "",
                                                            ItemName: "",
                                                            SubItemCode:"",
                                                            SubItemName:"",
                                                            SubItemBaseQty: "",
                                                            OnHand: "",
                                                        });
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
                                            {!faultyAmount || faultyAmount > 0 && (
                                                <>
                                                    <div className="my-3 font-medium text-[15px] text-red-700">Lỗi thành phẩm:</div>
                                                        <div className={`mb-4 ml-3 text-gray-600 
                                                        ${selectedFaultItem.ItemCode === choosenItem.ItemChild ? 'font-semibold text-gray-800 ' : 'text-gray-600'}`} key={index}>
                                                            <Radio 
                                                                ref={checkRef}
                                                                value={choosenItem.ChildName} 
                                                                isChecked={selectedFaultItem.ItemCode === choosenItem.ItemChild}
                                                                onChange={() => {
                                                                    setSelectedFaultItem({
                                                                        ItemCode: choosenItem.ItemChild,
                                                                        ItemName: choosenItem.ChildName,
                                                                        SubItemCode:"",
                                                                        SubItemName:"",
                                                                        SubItemBaseQty: "",
                                                                        OnHand: "",
                                                                    });
                                                                    setIsItemCodeDetech(true);
                                                                    console.log("Giá trị đã chọn: ", selectedFaultItem);
                                                                }} 
                                                            >
                                                                {choosenItem.ChildName}
                                                            </Radio>   
                                                        </div>      
                                                    
                                                    <div className="my-3 font-medium text-[15px] text-red-700">Lỗi bán thành phẩm công đoạn trước:</div>
                                                    {selectedItemDetails?.stock.map((item, index) => (
                                                        <div className={`mb-4 ml-3  ${selectedFaultItem.SubItemCode === item.SubItemCode ? 'font-semibold text-gray-800 ' : 'text-gray-600'}`} key={index}>
                                                            
                                                            <Radio 
                                                                ref={checkRef}
                                                                value={item.SubItemCode} 
                                                                isChecked={selectedFaultItem.SubItemCode === item.SubItemCode}
                                                                onChange={() => {
                                                                    setSelectedFaultItem({
                                                                        ItemCode: "",
                                                                        ItemName: "",
                                                                        SubItemCode:item.SubItemCode,
                                                                        SubItemName:item.SubItemName,
                                                                        SubItemBaseQty: item.BaseQty,
                                                                        OnHand:item.OnHand
                                                                    });
                                                                    setIsItemCodeDetech(false);
                                                                    console.log("Giá trị đã chọn: ", selectedFaultItem);
                                                                }} 
                                                            >
                                                                {item.SubItemName}
                                                            </Radio>   
                                                        </div>      
                                                    ))}
                                                </>
                                            )}
                                        </Box>
                                        <Box className="px-2 pt-2">
                                            <label className="font-semibold">
                                                Lỗi phôi nhận từ nhà máy khác:
                                            </label>
                                            <Select
                                                className="mt-2 mb-2"
                                                placeholder="Lựa chọn"
                                                options={
                                                    selectedItemDetails?.factories
                                                }
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
                                    </div>
                                )}
                            </div>
                        </div>
                    </ModalBody>

                    <ModalFooter className="flex flex-col !p-0">
                        <Alert status="info">
                            <TbPlayerTrackNextFilled className="text-[#155979] xl:mr-2 lg:mr-2 md:mr-2 mr-4 xl:text-xl lg:text-xl md:text-xl text-2xl" />
                            <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col">
                                <span className="text-[15px] mr-1 sm:text-base">
                                    Công đoạn sản xuất tiếp theo:{"  "}
                                </span>
                                <span className="xl:text-[15px] lg:text-[15px] md:text-[15px] text-[17px] sm:text-base font-bold ml-1">
                                    {selectedItemDetails?.NameTOTT ||
                                        "Chưa được thiết lập ở SAP"}{" "}
                                    (
                                    {selectedItemDetails?.TOTT?.split("-")[0] ||
                                        ""}
                                    )
                                </span>
                            </div>
                        </Alert>

                        <div className="border-b-2 border-gray-100"></div>

                        <div className="flex items-item justify-end p-4 w-full gap-4">
                            <Button
                                className="bg-[#edf2f7]"
                                onClick={() => {
                                    closeInputModal()
                                    setSelectedFaultItem({
                                        ItemName:"",
                                        ItemCode:"",
                                        SubItemName:"",
                                        SubItemCode:"",
                                        SubItemBaseQty:"",
                                        OnHand: "",
                                    })
                                    setFaultyAmount(null);
                                    setIsItemCodeDetech(false);
                                }}
                            >
                                Đóng
                            </Button>
                            <Button
                                type="button"
                                isDisabled={
                                    !amount && amount==null &&
                                    amount <= 0 &&
                                    !faultyAmount && faultyAmount ==null &&
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
                closeOnOverlayClick={false}
                isCentered
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
                                    <span>
                                    {faults &&
                                        faults.ItemCode &&
                                        "từ " + faults.factory?.label}
                                    </span>
                                    {faults &&
                                        faults.factory &&
                                        "từ " + faults.factory?.label}
                                </div>
                            )}
                        </AlertDialogBody>
                        <AlertDialogFooter className="gap-4">
                            <Button onClick={onAlertDialogClose}>Huỷ bỏ</Button>
                            <button
                                disabled={confirmLoading}
                                className="w-fit bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
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

            {/* Xóa ghi nhận thành phẩm */}
            <AlertDialog
                isOpen={isDeleteProcessingDialogOpen}
                onClose={onDeleteProcessingDialogClose}
                closeOnOverlayClick={false}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>Xác nhận xoá</AlertDialogHeader>
                        <AlertDialogBody>
                            <div className="text-red-700">
                                {dialogType === "product"
                                    ? "Bạn chắc chắn muốn xoá số lượng đã giao chờ xác nhận?"
                                    : "Bạn chắc chắn muốn xóa ghi nhận lỗi chờ xác nhận?"}
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
                isCentered
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
