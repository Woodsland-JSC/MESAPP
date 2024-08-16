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
import { IoIosArrowDown } from "react-icons/io";
import { VscCircleFilled } from "react-icons/vsc";
import { FaExclamationCircle, FaCaretRight } from "react-icons/fa";
import { TbPlayerTrackNextFilled } from "react-icons/tb";
import { MdDangerous } from "react-icons/md";
import { HiChevronDoubleDown } from "react-icons/hi";
import { PiArrowFatLinesDownFill } from "react-icons/pi";

const ItemInput = ({
    data,
    index,
    fromGroup,
    searchTerm,
    MaThiTruong,
    variant,
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
    const [selectedFaultItem, setSelectedFaultItem] = useState({
        ItemCode: "",
        ItemName: "",
        SubItemCode: "",
        SubItemName: "",
        SubItemBaseQty: "",
        OnHand: "",
    });
    const [rongData, setRongData] = useState(null);
    const [RONGInputQty, setRONGInputQty] = useState("");
    // const [selectedItem, setSelectedItem] = useState(null);
    const [isItemCodeDetech, setIsItemCodeDetech] = useState(false);
    const [amount, setAmount] = useState("");
    const [faultyAmount, setFaultyAmount] = useState("");
    const [choosenItem, setChoosenItem] = useState(null);

    const [faults, setFaults] = useState({});
    const [selectedDelete, setSelectedDelete] = useState(null);
    const [selectedError, setSelectedError] = useState(null);
    const [dialogType, setDialogType] = useState(null);
    const [selectedQCLogging, setSelectedQCLogging] = useState(null);

    const openInputModal = async (item) => {
        console.log("Item đã chọn: ", item);
        if (variant === "CBG") {
            setLoading(true);
            const params = {
                SPDICH: data.SPDICH,
                ItemCode: item.ItemChild,
                TO: item.TO,
            };
            try {
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
                    stocks: res.stocks,
                    maxQty: res.maxQty,
                    remainQty: res.remainQty,
                    WaitingConfirmQty: res.WaitingConfirmQty,
                    WaitingQCItemQty: res.WaitingQCItemQty,
                });
                onModalOpen();
            } catch (error) {
                toast.error(
                    error.response.data.error || "Có lỗi khi lấy dữ liệu item."
                );
                console.error(error);
            }
            setLoading(false);
        } else {
            if (item.CDOAN === "RO") {
                setLoading(true);
                try {
                    const params = {
                        FatherCode: item.ItemChild,
                        TO: item.TO,
                        version: item.Version,
                    };
                    const res =
                        await productionApi.getFinishedRongPlywoodGoodsDetail(
                            params
                        );
                    // console.log("Chi tiết thành phẩm: ", res);
                    console.log("Thông tin thành phẩm: ", res.stocks);
                    setSelectedItemDetails({
                        ...item,
                        CongDoan: res.CongDoan,
                        FatherStock: res.FatherStock,
                        factories: res.Factorys?.map((item) => ({
                            value: item.Factory,
                            label: item.FactoryName,
                        })),
                        notifications: res.notifications,
                        stocks: res.stocks,
                        SubItemCode: item.ChildName,
                        SubItemName: item.ItemChild,
                    });

                    // Tạo mảng lưu dữ liệu rong
                    const RONGReceiptData = res.stocks.map((stock, key) => ({
                        ItemCode: stock.ItemCode,
                        ItemName: stock.ItemName,
                        CompleQty: "",
                        RejectQty: "",
                        CDay: stock.CDay,
                        CRong: stock.CRong,
                        CDai: stock.CDai,
                        factories: "",
                    }));
                    console.log("Kết quả tạo mảng rong: ", RONGReceiptData);
                    setRongData(RONGReceiptData);
                    onModalOpen();
                } catch (error) {
                    toast.error(
                        error.response.data.error ||
                            "Có lỗi khi lấy dữ liệu item."
                    );
                    console.error(error);
                }
                setLoading(false);
            } else {
                setLoading(true);
                try {
                    const params = {
                        SPDICH: data.SPDICH,
                        ItemCode: item.ItemChild,
                        TO: item.TO,
                        Version: item.Version,
                    };
                    const res =
                        await productionApi.getFinishedPlywoodGoodsDetail(
                            params
                        );
                    console.log("Chi tiết thành phẩm: ", res);
                    setSelectedItemDetails({
                        ...item,
                        ItemInfo: res.ItemInfo,
                        stockQuantity: res.maxQuantity,
                        totalProcessing: res.remainQty,
                        CongDoan: res.CongDoan,
                        ProdType: res.ProdType,
                        SubItemWhs: res.SubItemWhs,
                        factories: res.Factorys?.map((item) => ({
                            value: item.Factory,
                            label: item.FactoryName,
                        })),
                        notifications: res.notifications,
                        stocks: res.stocks,
                        maxQty: res.maxQty,
                        WaitingConfirmQty: res.WaitingConfirmQty,
                        WaitingQCItemQty: res.WaitingQCItemQty,
                    });
                    onModalOpen();
                } catch (error) {
                    toast.error(
                        error.response.data.error ||
                            "Có lỗi khi lấy dữ liệu item."
                    );
                    console.error(error);
                }
                setLoading(false);
            }
        }
    };

    const closeInputModal = () => {
        onModalClose();
        setAmount();
        setFaults({});
        setRongData(null);
        setSelectedItemDetails(null);
    };

    const handleSubmitQuantityRong = async () => {
        let isValid = true;
        for (let i = 0; i < rongData.length; i++) {
            const item = rongData[i];
            const allEmpty = rongData.every(
                (item) => item.CompleQty === "" && item.RejectQty === ""
            );

            if (RONGInputQty === "" && allEmpty) {
                toast.error("Vui lòng ghi nhận trước khi xác nhận!");
                onAlertDialogClose();
                return;
            }
            if (RONGInputQty === "" || RONGInputQty === null) {
                toast.error("Vui lòng nhập số lượng ghi nhận bán thành phẩm.");
                onAlertDialogClose();
                return;
            }
            if (
                (RONGInputQty !== "" || RONGInputQty !== null) &&
                RONGInputQty === "0"
            ) {
                toast.error("Số lượng ghi nhận bán thành phẩm phải lớn hơn 0.");
                onAlertDialogClose();
                return;
            }
            if (RONGInputQty > selectedItemDetails.FatherStock) {
                toast.error(
                    <span>
                        Số lượng ghi nhận bán thành phẩm{" "}
                        <span style={{ fontWeight: "bold" }}>
                            {selectedItemDetails.ChildName}
                        </span>{" "}
                        không được vượt quá {selectedItemDetails.FatherStock}.
                    </span>
                );
                onAlertDialogClose();
                return;
            }
            if (
                RONGInputQty === "" &&
                (item.CompleQty === "" || item.CompleQty === null)
            ) {
                toast.error(
                    <span>
                        Số lượng ghi nhận{" "}
                        <span style={{ fontWeight: "bold" }}>
                            {item.ItemName}
                        </span>{" "}
                        không được bỏ trống.
                    </span>
                );
                onAlertDialogClose();
                return;
            }
            if (item.CompleQty <= 0) {
                toast.error(
                    <span>
                        Số lượng ghi nhận{" "}
                        <span style={{ fontWeight: "bold" }}>
                            {item.ItemName}
                        </span>{" "}
                        phải lớn hơn 0
                    </span>
                );
                onAlertDialogClose();
                return;
            }
            if (item.RejectQty !== "" && item.RejectQty !== null) {
                if (item.RejectQty <= 0) {
                    toast.error(
                        <span>
                            Số lượng lỗi{" "}
                            <span style={{ fontWeight: "bold" }}>
                                {item.ItemName}
                            </span>{" "}
                            phải lớn hơn 0
                        </span>
                    );
                    onAlertDialogClose();
                    return;
                }
            }
        }
        if ((isValid = false)) {
            onAlertDialogClose();
        } else {
            setConfirmLoading(true);

            try {
                const Data = {
                    LSX: choosenItem.LSX[0].LSX,
                    QtyIssue: RONGInputQty,
                    CongDoan: choosenItem.CDOAN,
                    version: choosenItem.Version,
                    ProdType: "LVL",
                    SubItemCode: choosenItem.ItemChild,
                    SubItemName: choosenItem.ChildName,
                    team: choosenItem.TO,
                    NextTeam: choosenItem.TOTT,
                    Data: rongData,
                };
                console.log("Dữ liệu sẽ được gửi đi: ", Data);
                const res = await productionApi.enterFinishedRongAmountVCN(
                    Data
                );
                toast.success("Ghi nhận & chuyển tiếp thành công!");
            } catch (error) {
                // Xử lý lỗi (nếu có)
                console.error("Đã xảy ra lỗi:", error);
                toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
            }
            setConfirmLoading(false);
            onReceiptFromChild();
            setRongData(null);

            onAlertDialogClose();
            closeInputModal();
        }
    };

    const handleSubmitQuantity = async () => {
        if (
            selectedItemDetails.CongDoan !== "SC" &&
            selectedItemDetails.CongDoan !== "XV" &&
            amount < 0
        ) {
            toast.error("Số lượng ghi nhận phải lớn hơn 0");
            onAlertDialogClose();
            return;
        } else if (
            selectedItemDetails.CongDoan !== "SC" &&
            selectedItemDetails.CongDoan !== "XV" &&
            amount > selectedItemDetails.maxQty
        ) {
            toast.error("Đã vượt quá số lượng có thể ghi nhận");
            onAlertDialogClose();
            return;
        } else if (
            selectedItemDetails.CongDoan !== "SC" &&
            selectedItemDetails.CongDoan !== "XV" &&
            amount >
                selectedItemDetails.remainQty -
                    selectedItemDetails.WaitingConfirmQty
        ) {
            toast.error(
                <span>
                    Số lượng ghi nhận (
                    <span style={{ fontWeight: "bold" }}>{amount}</span>) đã
                    vượt quá số lượng còn lại phải sản xuất (
                    <span style={{ fontWeight: "bold" }}>
                        {selectedItemDetails.remainQty -
                            selectedItemDetails.WaitingConfirmQty}
                    </span>
                    )
                </span>
            );
            onAlertDialogClose();
            return;
        } else if (
            selectedItemDetails.CongDoan !== "SC" &&
            selectedItemDetails.CongDoan !== "XV" &&
            faultyAmount < 0
        ) {
            toast.error("Số lượng lỗi phải lớn hơn 0");
            onAlertDialogClose();
            return;
        } else if (
            selectedItemDetails.CongDoan !== "SC" &&
            selectedItemDetails.CongDoan !== "XV" &&
            selectedFaultItem.ItemCode !== "" &&
            faultyAmount > selectedItemDetails.maxQty
        ) {
            toast.error("Đã vượt quá số lượng lỗi có thể ghi nhận");
            onAlertDialogClose();
            return;
        } else if (
            selectedItemDetails.CongDoan !== "SC" &&
            selectedItemDetails.CongDoan !== "XV" &&
            selectedFaultItem.SubItemCode === "" &&
            selectedFaultItem.ItemCode === "" &&
            faultyAmount
        ) {
            toast.error("Vui lòng chọn sản phẩm cần ghi nhận lỗi");
            onAlertDialogClose();
            return;
        } else if (
            selectedItemDetails.CongDoan !== "SC" &&
            selectedItemDetails.CongDoan !== "XV" &&
            selectedFaultItem.SubItemCode !== "" &&
            faultyAmount > parseInt(selectedFaultItem.OnHand || 0)
        ) {
            toast.error("Đã vượt quá số lượng lỗi có thể ghi nhận");
            onAlertDialogClose();
            return;
        } else if (
            selectedItemDetails.CongDoan !== "SC" &&
            selectedItemDetails.CongDoan !== "XV" &&
            selectedFaultItem.ItemCode !== "" &&
            parseInt(faultyAmount) + parseInt(amount) >
                parseInt(selectedItemDetails.maxQty)
        ) {
            toast.error(
                <span>
                    Tổng số lượng ghi nhận (
                    <span style={{ fontWeight: "bold" }}>
                        {parseInt(faultyAmount) + parseInt(amount)}
                    </span>
                    ) đã vượt quá số lượng tối đa có thể xuất (
                    <span style={{ fontWeight: "bold" }}>
                        {selectedItemDetails.maxQty}
                    </span>
                    )
                </span>
            );
            return;
        } else {
            setConfirmLoading(true);

            // Object chứa dữ liệu lỗi
            const ErrorData = isItemCodeDetech
                ? {
                      SubItemWhs: selectedItemDetails.SubItemWhs,
                      SubItemQty: selectedItemDetails.stocks.map((item) => ({
                          SubItemCode: item.SubItemCode,
                          BaseQty: item.BaseQty,
                      })),
                  }
                : {
                      SubItemWhs: selectedItemDetails.SubItemWhs,
                      SubItemQty: selectedItemDetails.stocks.map((item) => ({
                          SubItemCode: item.SubItemCode,
                          BaseQty: item.BaseQty,
                      })),
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
                    version: choosenItem.Version || "",
                    ProdType: selectedItemDetails.ProdType || "",
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
                        if (variant === "CBG") {
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
                            const res =
                                await productionApi.enterFinishedGoodsAmountVCN(
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
                        }
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
            setAmount();
            setFaultyAmount();

            onAlertDialogClose();
            closeInputModal();
        }
    };

    function transformDetail(details) {
        const result = [];
    
        details.forEach(item => {
            let existingItem = result.find(detail => detail.ItemCode === item.ItemCode && detail.ItemName === item.ItemName);
            
            if (!existingItem) {
                existingItem = {
                    ItemCode: item.ItemCode,
                    ItemName: item.ItemName
                };
                result.push(existingItem);
            }
    
            if (item.Type === 0) {
                existingItem.Qty_Type0 = item.Qty;
            } else if (item.Type === 1) {
                existingItem.Qty_Type1 = item.Qty;
            }
        });
    
        return result;
    }
    

    const handleDeleteProcessingReceipt = async (item) => {
        setDeleteProcessingLoading(true);
        if (variant === "CBG") {
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
                    stocks: res.stocks,
                    WaitingConfirmQty: res.WaitingConfirmQty,
                    WaitingQCItemQty: res.WaitingQCItemQty,
                    maxQty: res.maxQty,
                }));
            } catch (error) {
                toast.error("Có lỗi xảy ra. Vui lòng thử lại");
            }
            setSelectedDelete(null);
            onDeleteProcessingDialogClose();
            setDeleteProcessingLoading(false);
        } else {
            console.log("Công đoạn hiện tại", choosenItem.CDOAN);
            if (choosenItem.CDOAN === "RO") {
                try {
                    const payload = {
                        id: selectedDelete,
                        SPDICH: data.SPDICH,
                        ItemCode: choosenItem.ItemChild,
                        TO: choosenItem.TO,
                        FatherCode: choosenItem.ItemChild,
                        version: choosenItem.Version,
                    };
                    console.log("Dữ liệu sẽ được gửi đi", payload);
                    const res = await productionApi.deleteReceiptVCNRong(
                        payload
                    );
                    toast.success("Thao tác thành công.");
                    setSelectedItemDetails((prev) => ({
                        ...prev,
                        stocks: res.stocks.map((stock) => ({
                            ...stock,
                            notifications: stock.notifications.filter(
                                (notification) => notification.id !== payload.id
                            ),
                        })),
                    }));
                } catch (error) {
                    toast.error("Có lỗi xảy ra. Vui lòng thử lại");
                }
                setSelectedDelete(null);
                onDeleteProcessingDialogClose();
                setDeleteProcessingLoading(false);
            } else {
                try {
                    const payload = {
                        id: selectedDelete,
                        SPDICH: data.SPDICH,
                        ItemCode: choosenItem.ItemChild,
                        TO: choosenItem.TO,
                    };
                    const res = await productionApi.deleteReceiptVCN(payload);
                    toast.success("Thao tác thành công.");
                    setSelectedItemDetails((prev) => ({
                        ...prev,
                        notifications: prev.notifications.filter(
                            (notification) => notification.id !== selectedDelete
                        ),
                        stocks: res.stocks,
                        WaitingConfirmQty: res.WaitingConfirmQty,
                        WaitingQCItemQty: res.WaitingQCItemQty,
                        maxQty: res.maxQty,
                    }));
                } catch (error) {
                    toast.error("Có lỗi xảy ra. Vui lòng thử lại");
                }
                setSelectedDelete(null);
                onDeleteProcessingDialogClose();
                setDeleteProcessingLoading(false);
            }
        }
    };

    const handleDeleteErrorReceipt = async () => {
        setDeleteProcessingLoading(true);
        if (variant === "CBG") {
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
                    stocks: res.stocks,
                    WaitingConfirmQty: res.WaitingConfirmQty,
                    WaitingQCItemQty: res.WaitingQCItemQty,
                }));
            } catch (error) {
                toast.error("Có lỗi xảy ra. Vui lòng thử lại");
            }
            setSelectedDelete(null);
            onDeleteProcessingDialogClose();
            setDeleteProcessingLoading(false);
        } else {
            console.log("Công đoạn hiện tại", choosenItem.CDOAN);
            if (choosenItem.CDOAN === "RO") {
                try {
                    const payload = {
                        id: selectedDelete,
                        SPDICH: data.SPDICH,
                        ItemCode: choosenItem.ItemChild,
                        TO: choosenItem.TO,
                        FatherCode: choosenItem.ItemChild,
                        version: choosenItem.Version,
                    };
                    console.log("Dữ liệu sẽ được gửi đi", payload);
                    const res = await productionApi.deleteReceiptVCNRong(
                        payload
                    );
                    toast.success("Thao tác thành công.");
                    setSelectedItemDetails((prev) => ({
                        ...prev,
                        stocks: res.stocks.map((stock) => ({
                            ...stock,
                        })),
                        notifications: res.notifications.filter(
                            (notification) => notification.id !== payload.id
                        ),
                    }));
                } catch (error) {
                    toast.error("Có lỗi xảy ra. Vui lòng thử lại");
                }
                setSelectedDelete(null);
                onDeleteProcessingDialogClose();
                setDeleteProcessingLoading(false);
            } else {
                try {
                    const payload = {
                        id: selectedDelete,
                        SPDICH: data.SPDICH,
                        ItemCode: choosenItem.ItemChild,
                        TO: choosenItem.TO,
                    };
                    const res = await productionApi.deleteReceiptVCN(payload);
                    toast.success("Thao tác thành công.");
                    setSelectedItemDetails((prev) => ({
                        ...prev,
                        stocks: res.stocks,
                    }));
                } catch (error) {
                    toast.error("Có lỗi xảy ra. Vui lòng thử lại");
                }
                setSelectedDelete(null);
                onDeleteProcessingDialogClose();
                setDeleteProcessingLoading(false);
            }
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
        } else {
            checkElement?.classList?.add("hidden");
            checkElement?.classList?.remove("block");
        }
    }, [faultyAmount]);

    return (
        <>
            <div className="shadow-lg relative border-2 rounded-t-md bg-white border-indigo-100 z-1">
                <div
                    className=" pl-3 text-[18px] font-medium bg-[#1A222F] text-[white] p-2 py-1.5
                 rounded-t-md"
                >
                    {data.NameSPDich}
                </div>
                <div className="w-full h-full rounded-t-lg flex flex-col gap-4 pt-0 z-[999] bg-white">
                    {data.Details.length > 0
                        ? data.Details.map((item, index) => (
                              <section
                                  onClick={() => {
                                      openInputModal(item);
                                      setChoosenItem(item);
                                      console.log("Item đã chọn:", item);
                                      console.log("Item:", choosenItem);
                                      console.log(
                                          "Mã Thị Trường của item:" +
                                              item.ChildName,
                                          MaThiTruong
                                      );
                                  }}
                                  className="cursor-pointer duration-200 ease-linear hover:opacity-80"
                                  key={index}
                              >
                                  <div className="flex items-center pt-2 pb-1 pl-2 font-medium ">
                                      <span className="text-[#17506b] p-1 rounded-full font-semibold">
                                          {index + 1}.
                                      </span>

                                      {item.ChildName}
                                      <div>
                                          <span>
                                              ({item.CDay}*{item.CRong}*
                                              {item.CDai})
                                          </span>
                                      </div>
                                      {item.Version && (
                                          <span className="pl-2 font-medium text-[#2A7BA1]">
                                              V.<span>{item.Version}</span>
                                          </span>
                                      )}
                                  </div>
                                  <div className="relative overflow-x-auto shadow-md ml-0 ">
                                      <table className=" w-full text-sm text-left rtl:text-right text-gray-500">
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
                                                      Còn lại
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
                                {selectedItemDetails?.CongDoan === "RO" ? (
                                    <div className="xl:mx-0 lg:mx-0 md:mx-0 mx-3">
                                        <div className="flex md:flex-row pt-3 items-center xl:px-0 md:px-0 lg:px-0 ">
                                           <div className="w-full h-fit space-y-2">
                                                <div className="font-bold text-xl text-[#155979]">
                                                    Bán thành phẩm rong
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-2 pb-2 ">
                                            {/* <div className="font-semibold pb-2">
                                                    Số lượng tồn tại tổ:
                                            </div> */}
                                            <div className="w-full flex items-center justify-between rounded-xl p-3 bg-blue-100">
                                                <div className="w-[90%]">
                                                    <div className="text-xs m-0 text-[#647C9C]">
                                                        <span className="mr-1">
                                                            {
                                                                selectedItemDetails?.SubItemName
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="font-medium text-[17px] ">
                                                        {
                                                            selectedItemDetails?.SubItemCode
                                                        }
                                                    </div>
                                                </div>
                                                <div className="flex justify-end text-right rounded-lg cursor-pointer px-3 py-1 text-white duration-300 bg-[#155979]">
                                                    {selectedItemDetails?.FatherStock ||
                                                        0}
                                                </div>
                                            </div>
                                        </div>

                                        <Box className=" pt-2 pb-1">
                                            <label className="mt-6 font-semibold">
                                                Số lượng ghi nhận bán thành
                                                phẩm:
                                            </label>
                                            {selectedItemDetails?.FatherStock <=
                                            0 ? (
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
                                                    className="mt-2 mb-2"
                                                    value={RONGInputQty}
                                                    onChange={(value) => {
                                                        if (
                                                            value === 0 ||
                                                            !value ||
                                                            value === NaN
                                                        ) {
                                                            setRONGInputQty("");
                                                            console.log(
                                                                "Số lượng BTP đem đi RONG",
                                                                RONGInputQty
                                                            );
                                                        } else {
                                                            setRONGInputQty(
                                                                value
                                                            );
                                                            console.log(
                                                                "Số lượng BTP đem đi RONG",
                                                                RONGInputQty
                                                            );
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

                                        <div className="border-t-2 border-dashed border-gray-300 mt-3"></div>
                                        
                                        <div className="flex md:flex-row pt-3 items-center xl:px-0 md:px-0 lg:px-0 ">
                                           <div className="w-full h-fit space-y-2">
                                                <div className="font-bold text-xl text-[#155979]">
                                                    Thành phẩm rong
                                                </div>
                                            </div>
                                        </div>

                                        {/* Thành phẩm rong */}
                                        {selectedItemDetails?.stocks.map(
                                            (stockItem, stockIndex) => (
                                                <div
                                                    className="my-3 mt-2 "
                                                    key={stockIndex}
                                                >
                                                    <div className="flex items-center bg-gray-900 border-[#DADADA]  rounded-t-xl p-3 py-2.5 border-b-0 ">
                                                        {/* <VscCircleFilled className="text-blue-200 mr-2 w-3 h-3" /> */}
                                                        {/* <div className="text-white font-semibold text-xl mr-2">{stockIndex + 1 }.</div> */}
                                                        <div className="pl-2 text-white font-semibold text-xl">
                                                            {stockItem?.ItemName ||
                                                                "Thành phẩm không xác định"}
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-900">
                                                        <div className="flex items-center border-[#DADADA] border-2 !p-1 border-b-0 border-t-0 pb-0 rounded-t-xl bg-white">
                                                            <div className="w-full flex justify-between m-2 py-2 rounded-xl bg-[#DADADA]">
                                                                <div className="flex flex-col w-1/3 items-center">
                                                                    <div className="text-xl font-bold text-[#1F2937]">
                                                                        {parseInt(
                                                                            stockItem?.SanLuong ||
                                                                                0
                                                                        )}
                                                                    </div>
                                                                    <div className="uppercase font-semibold text-[13px] text-gray-500">
                                                                        Sản
                                                                        lượng
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col w-1/3 items-center">
                                                                    <div className="text-xl font-bold text-[#1F2937]">
                                                                        {parseInt(
                                                                            stockItem?.DaLam ||
                                                                                0
                                                                        )}
                                                                    </div>
                                                                    <div className="uppercase font-semibold text-[13px] text-gray-500">
                                                                        Đã làm
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col w-1/3 items-center">
                                                                    <div className="text-xl font-bold text-[#1F2937]">
                                                                        {parseInt(
                                                                            stockItem?.Loi ||
                                                                                0
                                                                        )}
                                                                    </div>
                                                                    <div className="uppercase font-semibold text-[13px] text-gray-500">
                                                                        Lỗi
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white border-t-0 !mb-4 border-[#DADADA] border-2 rounded-b-xl shadow-md ">
                                                        <div className="space-y-1">
                                                            {/* Ghi nhận sản lượng */}
                                                            <div className="p-4 py-4 pt-2 ">
                                                                <div className="flex items-center space-x-2 pb-4">
                                                                    <FaCircleRight className="w-7 h-7 text-blue-700" />
                                                                    <div className="font-semibold text-lg ">
                                                                        Ghi nhận
                                                                        sản
                                                                        lượng
                                                                    </div>
                                                                </div>

                                                                <div className="flex gap-2 items-center py-3 border-t border-b !mt-0 px-2 pr-4 justify-between">
                                                                    <Text className="font-semibold">
                                                                        Số lượng
                                                                        còn lại
                                                                        phải sản
                                                                        xuất:
                                                                    </Text>
                                                                    <span className="rounded-lg cursor-pointer px-3 py-1 text-white bg-green-700 hover:bg-green-500 duration-300">
                                                                        {formatNumber(
                                                                            Number(
                                                                                stockItem.ConLai
                                                                            )
                                                                        ) || 0}
                                                                    </span>
                                                                </div>

                                                                <Box className="px-2 pt-2">
                                                                    <label className="mt-7 font-semibold">
                                                                        Số lượng
                                                                        ghi nhận
                                                                        sản
                                                                        phẩm:
                                                                    </label>
                                                                    {selectedItemDetails?.FatherStock <=
                                                                    0 ? (
                                                                        <div className="flex space-x-2 items-center px-4 py-3 bg-red-50 rounded-xl text-red-500 mt-2 mb-2">
                                                                            <MdDangerous className="w-6 h-6" />
                                                                            <div>
                                                                                Không
                                                                                đủ
                                                                                số
                                                                                lượng
                                                                                để
                                                                                ghi
                                                                                nhận
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <NumberInput
                                                                            ref={
                                                                                receipInput
                                                                            }
                                                                            step={
                                                                                1
                                                                            }
                                                                            value={
                                                                                rongData[
                                                                                    stockIndex
                                                                                ]
                                                                                    .CompleQty
                                                                            }
                                                                            className="mt-2 mb-2"
                                                                            onChange={(
                                                                                value
                                                                            ) => {
                                                                                if (
                                                                                    value ===
                                                                                        0 ||
                                                                                    !value ||
                                                                                    value ===
                                                                                        NaN
                                                                                ) {
                                                                                    setRongData(
                                                                                        (
                                                                                            prevData
                                                                                        ) => {
                                                                                            const newData =
                                                                                                [
                                                                                                    ...prevData,
                                                                                                ];
                                                                                            newData[
                                                                                                stockIndex
                                                                                            ].CompleQty =
                                                                                                "";
                                                                                            return newData;
                                                                                        }
                                                                                    );
                                                                                } else {
                                                                                    setRongData(
                                                                                        (
                                                                                            prevData
                                                                                        ) => {
                                                                                            const newData =
                                                                                                [
                                                                                                    ...prevData,
                                                                                                ];
                                                                                            newData[
                                                                                                stockIndex
                                                                                            ].CompleQty =
                                                                                                value;
                                                                                            return newData;
                                                                                        }
                                                                                    );
                                                                                    console.log(
                                                                                        "dữ liệu cập nhật:",
                                                                                        rongData
                                                                                    );
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
                                                            </div>
                                                            <div className="border-gray-300 border"></div>

                                                            {/* Ghi nhận lỗi */}
                                                            <div className="p-4 pb-4">
                                                                <div className="flex space-x-2 pb-4 items-center">
                                                                    <FaExclamationCircle className="w-7 h-7 text-red-700" />
                                                                    <div className="font-semibold text-lg ">
                                                                        Ghi nhận
                                                                        lỗi
                                                                    </div>
                                                                </div>
                                                                <Box className="px-2 pt-2">
                                                                    <label className="font-semibold ">
                                                                        Số lượng
                                                                        ghi nhận
                                                                        lỗi
                                                                    </label>
                                                                    <NumberInput
                                                                        step={1}
                                                                        className="mt-2"
                                                                        value={
                                                                            rongData[
                                                                                stockIndex
                                                                            ]
                                                                                .RejectQty
                                                                        }
                                                                        onChange={(
                                                                            value
                                                                        ) => {
                                                                            if (
                                                                                value ===
                                                                                    0 ||
                                                                                !value ||
                                                                                value ===
                                                                                    NaN
                                                                            ) {
                                                                                setRongData(
                                                                                    (
                                                                                        prevData
                                                                                    ) => {
                                                                                        const newData =
                                                                                            [
                                                                                                ...prevData,
                                                                                            ];
                                                                                        newData[
                                                                                            stockIndex
                                                                                        ].RejectQty =
                                                                                            "";
                                                                                        newData[
                                                                                            stockIndex
                                                                                        ].factories =
                                                                                            "";
                                                                                        return newData;
                                                                                    }
                                                                                );
                                                                                console.log(
                                                                                    "dữ liệu cập nhật:",
                                                                                    rongData
                                                                                );
                                                                            } else {
                                                                                setRongData(
                                                                                    (
                                                                                        prevData
                                                                                    ) => {
                                                                                        const newData =
                                                                                            [
                                                                                                ...prevData,
                                                                                            ];
                                                                                        newData[
                                                                                            stockIndex
                                                                                        ].RejectQty =
                                                                                            value;
                                                                                        return newData;
                                                                                    }
                                                                                );
                                                                                console.log(
                                                                                    "dữ liệu cập nhật:",
                                                                                    rongData
                                                                                );
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
                                                                <Box className="px-2 pt-3">
                                                                    <label className="font-semibold">
                                                                        Lỗi phôi
                                                                        nhận từ
                                                                        nhà máy
                                                                        khác:
                                                                    </label>
                                                                    <Select
                                                                        className="mt-2 mb-2"
                                                                        placeholder="Lựa chọn"
                                                                        options={
                                                                            selectedItemDetails?.factories
                                                                        }
                                                                        isClearable
                                                                        isSearchable
                                                                        value={
                                                                            rongData[
                                                                                stockIndex
                                                                            ]
                                                                                .factories ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            value
                                                                        ) => {
                                                                            if (
                                                                                !rongData[
                                                                                    stockIndex
                                                                                ]
                                                                                    .RejectQty ||
                                                                                rongData[
                                                                                    stockIndex
                                                                                ]
                                                                                    .RejectQty <
                                                                                    1
                                                                            ) {
                                                                                toast.error(
                                                                                    "Vui lòng khai báo số lượng lỗi."
                                                                                );
                                                                                setRongData(
                                                                                    (
                                                                                        prevData
                                                                                    ) => {
                                                                                        const newData =
                                                                                            [
                                                                                                ...prevData,
                                                                                            ];
                                                                                        newData[
                                                                                            stockIndex
                                                                                        ].factories =
                                                                                            "";
                                                                                        return newData;
                                                                                    }
                                                                                );
                                                                            } else {
                                                                                setRongData(
                                                                                    (
                                                                                        prevData
                                                                                    ) => {
                                                                                        const newData =
                                                                                            [
                                                                                                ...prevData,
                                                                                            ];
                                                                                        newData[
                                                                                            stockIndex
                                                                                        ].factories =
                                                                                            value;
                                                                                        return newData;
                                                                                    }
                                                                                );
                                                                            }
                                                                        }}
                                                                    />
                                                                </Box>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            )
                                        )}
                                        {selectedItemDetails?.notifications?.length > 0 && (
                                            <>
                                                <div className="border-t-2 border-dashed border-gray-300 mt-3"></div>
                                                <div> 
                                                    <div className="text-[#17506B] text-xl font-bold my-3">Lịch sử ghi nhận</div>
                                                    <div className="space-y-4">
                                                        {selectedItemDetails?.notifications?.map((item, index) => (
                                                            <div className="p-2 px-4 rounded-lg bg-gray-50 border border-gray-300">
                                                                <div className="">
                                                                    <div className="text-[#235973] text-lg font-semibold">{item.QtyIssueRong}</div>
                                                                    <div className="font-medium">{item.SubItemName}</div>
                                                                </div>

                                                                <div className="flex space-x-5">
                                                                    <div className="text-sm">Tạo bởi: <span className="font-medium text-[#235973]">{item.fullname}</span></div>
                                                                    <div className="text-sm">Ngày giờ tạo: <span className="font-medium text-[#235973]">{item.CreatedAt}</span></div>
                                                                </div>
                                                                
                                                                <div className="my-2 border-b border-gray-300"></div>
                                                                
                                                                <div className="space-y-2">
                                                                    {transformDetail(item.detail).map((detailItem, detailIndex) => (
                                                                        <div className="">
                                                                            <div className="font-semibold">{detailItem.ItemName}</div>
                                                                            <div className="text-gray-500 flex justify-between">
                                                                                <div>Số lượng ghi nhận sản lượng:</div>
                                                                                <div>{parseInt(detailItem.Qty_Type0)}</div> 
                                                                            </div>
                                                                            {detailItem.Qty_Type1 && (
                                                                                <div className="text-gray-500 flex justify-between">
                                                                                    <div>Số lượng ghi nhận lỗi:</div>
                                                                                    <div>{parseInt(detailItem.Qty_Type1)}</div> 
                                                                                </div>
                                                                            )}
                                                                            
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                
                                                                
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col md:flex-row justify-between pt-4 items-center xl:px-0 md:px-0 lg:px-0 px-4">
                                            <div className="flex flex-col  w-full">
                                                <label className="font-medium">
                                                    Sản phẩm/Chi tiết
                                                </label>
                                                <span className="text-[#17506B] text-2xl font-bold">
                                                    {
                                                        selectedItemDetails?.ChildName
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between py-3 border-2 divide-x-2 border-[#DADADA] shadow-md rounded-xl xl:mx-0 md:mx-0 lg:mx-0 mx-4">
                                            <div className="flex flex-col justify-start xl:pl-6 md:pl-6 lg:pl-6 pl-4 w-1/3">
                                                <label className="font-medium uppercase text-sm text-gray-400">
                                                    Chiều Dày
                                                </label>
                                                <span className="text-[20px] font-bold">
                                                    {selectedItemDetails?.CDay ||
                                                        0}
                                                </span>
                                            </div>
                                            <div className="flex flex-col justify-start xl:pl-6 md:pl-6 lg:pl-6 pl-4 w-1/3">
                                                <label className="font-medium uppercase text-sm text-gray-400 ">
                                                    Chiều Rộng
                                                </label>
                                                <span className="text-[20px] font-bold">
                                                    {selectedItemDetails?.CRong ||
                                                        0}
                                                </span>
                                            </div>
                                            <div className="flex flex-col justify-start xl:pl-6 md:pl-6 lg:pl-6 pl-4 w-1/3">
                                                <label className="font-medium uppercase text-sm text-gray-400">
                                                    Chiều Dài
                                                </label>
                                                <span className="text-[20px] font-bold">
                                                    {selectedItemDetails?.CDai ||
                                                        0}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-4 p-4 border-2 border-[#DADADA] shadow-md rounded-xl space-y-2">
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
                                                        {
                                                            selectedItemDetails?.CongDoan
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2 pb-3">
                                                <Text className="font-semibold px-2">
                                                    Số phôi đã nhận và phôi tồn
                                                    tại tổ:
                                                </Text>
                                                {/* BOM Item Group */}
                                                {selectedItemDetails?.stocks
                                                    .sort((a, b) =>
                                                        a.SubItemCode.localeCompare(
                                                            b.SubItemCode
                                                        )
                                                    )
                                                    .map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className={`${
                                                                parseInt(
                                                                    item.OnHand ||
                                                                        0
                                                                ) <= 0
                                                                    ? "bg-gray-200"
                                                                    : "bg-blue-100"
                                                            } flex flex-col py-2  mb-6 rounded-xl`}
                                                        >
                                                            <div className="flex items-center justify-between gap-4 px-4">
                                                                <div className="xl:max-w-[90%] lg:max-w-[90%] md:max-w-[80%] max-w-[65%]">
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
                                                                    <div className="font-medium text-[15px]">
                                                                        {item.SubItemName ===
                                                                        "Gỗ"
                                                                            ? "Nguyên liệu gỗ"
                                                                            : item.SubItemName ===
                                                                                  null ||
                                                                              item.SubItemName ===
                                                                                  ""
                                                                            ? "Nguyên vật liệu chưa xác định"
                                                                            : item.SubItemName}
                                                                    </div>
                                                                </div>
                                                                <span
                                                                    className={`${
                                                                        parseInt(
                                                                            item.OnHand ||
                                                                                0
                                                                        ) <= 0
                                                                            ? "bg-gray-500"
                                                                            : "bg-[#155979]"
                                                                    } rounded-lg cursor-pointer px-3 py-1 text-white duration-300`}
                                                                >
                                                                    {parseInt(
                                                                        item.OnHand ||
                                                                            0
                                                                    ).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>

                                            <div className="flex gap-2 items-center justify-between py-3 border-t px-2 pr-4 ">
                                                <Text className="font-semibold">
                                                    Số lượng tối đa có thể xuất:
                                                </Text>
                                                <span className="rounded-lg cursor-pointer px-3 py-1 text-white bg-green-700 hover:bg-green-500 duration-300">
                                                    {selectedItemDetails?.maxQty >
                                                    0
                                                        ? parseInt(
                                                              selectedItemDetails?.maxQty ||
                                                                  0
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
                                                            Số lượng đã giao chờ
                                                            xác nhận:{" "}
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
                                                            notif.confirm ==
                                                                0 &&
                                                            notif.type == 0
                                                    )
                                                    ?.map((item, index) => (
                                                        <>
                                                            <div className="">
                                                                <div
                                                                    key={
                                                                        "Processing_" +
                                                                        index
                                                                    }
                                                                    className="flex justify-between items-center p-2.5 px-3 !mb-4  gap-2 bg-green-50 border border-green-300 rounded-xl"
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <div className="xl:hidden lg:hidden md:hidden block  text-green-700 text-2xl">
                                                                            {Number(
                                                                                item?.Quantity
                                                                            )}
                                                                        </div>
                                                                        <Text className="font-semibold text-[15px] ">
                                                                            Người
                                                                            giao:{" "}
                                                                            <span className="text-green-700">
                                                                                {item?.last_name +
                                                                                    " " +
                                                                                    item?.first_name}
                                                                            </span>
                                                                        </Text>
                                                                        <div className="flex text-sm">
                                                                            <Text className=" font-medium text-gray-600">
                                                                                Thời
                                                                                gian
                                                                                giao:{" "}
                                                                            </Text>
                                                                            <span className="ml-1 text-gray-600">
                                                                                {moment(
                                                                                    item?.created_at,
                                                                                    "YYYY-MM-DD HH:mm:ss"
                                                                                ).format(
                                                                                    "DD/MM/YYYY"
                                                                                ) ||
                                                                                    ""}{" "}
                                                                                {moment(
                                                                                    item?.created_at,
                                                                                    "YYYY-MM-DD HH:mm:ss"
                                                                                ).format(
                                                                                    "HH:mm:ss"
                                                                                ) ||
                                                                                    ""}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-x-6">
                                                                        <div className="xl:block lg;block md:block hidden text-green-700 rounded-lg cursor-pointer px-3 py-1 bg-green-200 font-semibold">
                                                                            {Number(
                                                                                item?.Quantity
                                                                            )}
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
                                                        </>
                                                    ))}

                                            <Box className="px-2">
                                                <label className="mt-6 font-semibold">
                                                    Số lượng ghi nhận sản phẩm:
                                                </label>
                                                {/* selectedItemDetails.CongDoan != "SC" && */}
                                                {selectedItemDetails?.CongDoan !==
                                                    "SC" &&
                                                selectedItemDetails?.CongDoan !==
                                                    "XV" &&
                                                selectedItemDetails?.maxQty <=
                                                    0 ? (
                                                    <div className="flex space-x-2 items-center px-4 py-3 bg-red-50 rounded-xl text-red-500 mt-2 mb-2">
                                                        <MdDangerous className="w-6 h-6" />
                                                        <div>
                                                            Không đủ số lượng để
                                                            ghi nhận
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <NumberInput
                                                        ref={receipInput}
                                                        step={1}
                                                        min={1}
                                                        value={amount}
                                                        className="mt-2 mb-2"
                                                        onChange={(value) => {
                                                            if (
                                                                value >
                                                                selectedItemDetails.stockQuantity
                                                            ) {
                                                                setAmount(
                                                                    selectedItemDetails.stockQuantity
                                                                );
                                                            } else {
                                                                setAmount(
                                                                    value
                                                                );
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
                                                            notif.confirm ==
                                                                3 &&
                                                            notif.type == 2
                                                    )
                                                    ?.map((item, index) => (
                                                        <div
                                                            key={
                                                                "Return_" +
                                                                index
                                                            }
                                                            className="flex justify-between items-center p-3 py-2 my-4 mx-3 border bg-red-50 border-red-600 rounded-xl"
                                                        >
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex gap-4">
                                                                    <Text className="font-semibold">
                                                                        Phôi trả
                                                                        lại:{" "}
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
                                                                        {
                                                                            item?.text
                                                                        }
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
                                        <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-4 p-4 mb-3 border-2 border-[#DADADA] shadow-md rounded-xl space-y-2">
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
                                                        Tổng số lượng ghi nhận
                                                        lỗi:{" "}
                                                    </div>
                                                    <div className="rounded-lg cursor-pointer px-3 py-1 text-white bg-red-800 hover:bg-red-500 duration-300">
                                                        {formatNumber(
                                                            Number(
                                                                selectedItemDetails?.pendingErrors?.reduce(
                                                                    (
                                                                        total,
                                                                        item
                                                                    ) =>
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
                                                            notif.confirm ==
                                                                0 &&
                                                            notif.type == 1
                                                    )?.length > 0 &&
                                                    selectedItemDetails?.notifications.filter(
                                                        (notif) =>
                                                            notif.confirm ==
                                                                0 &&
                                                            notif.type == 1
                                                    ) && (
                                                        <div className="flex items-center justify-between w-full p-1 px-2 !mb-2">
                                                            <Text className="font-semibold">
                                                                Số lượng lỗi đã
                                                                ghi nhận:{" "}
                                                            </Text>{" "}
                                                        </div>
                                                    )}
                                                {selectedItemDetails?.notifications &&
                                                    selectedItemDetails?.notifications.filter(
                                                        (notif) =>
                                                            notif.confirm ==
                                                                0 &&
                                                            notif.type == 1
                                                    )?.length > 0 &&
                                                    selectedItemDetails?.notifications
                                                        .filter(
                                                            (notif) =>
                                                                notif.confirm ==
                                                                    0 &&
                                                                notif.type == 1
                                                        )
                                                        .map((item, index) => (
                                                            <div
                                                                key={
                                                                    "Error_" +
                                                                    index
                                                                }
                                                                className="flex justify-between items-center p-2.5 px-3 !mb-4  gap-2 bg-red-50 border border-red-300 rounded-xl"
                                                            >
                                                                {/*  */}
                                                                <div className="flex flex-col">
                                                                    <div className="xl:hidden lg:hidden md:hidden block  text-red-700 text-2xl">
                                                                        {Number(
                                                                            item?.Quantity
                                                                        )}
                                                                    </div>
                                                                    <div className="text-[15px] ">
                                                                        {item.SubItemName ||
                                                                            item.ItemName}
                                                                    </div>
                                                                    <Text className="font-semibold text-[15px] ">
                                                                        Người
                                                                        giao:{" "}
                                                                        <span className="text-red-700">
                                                                            {item?.last_name +
                                                                                " " +
                                                                                item?.first_name}
                                                                        </span>
                                                                    </Text>
                                                                    <div className="flex text-sm">
                                                                        <Text className=" font-medium text-gray-600">
                                                                            Thời
                                                                            gian
                                                                            giao:{" "}
                                                                        </Text>
                                                                        <span className="ml-1 text-gray-600">
                                                                            {moment(
                                                                                item?.created_at,
                                                                                "YYYY-MM-DD HH:mm:ss"
                                                                            ).format(
                                                                                "DD/MM/YYYY"
                                                                            ) ||
                                                                                ""}{" "}
                                                                            {moment(
                                                                                item?.created_at,
                                                                                "YYYY-MM-DD HH:mm:ss"
                                                                            ).format(
                                                                                "HH:mm:ss"
                                                                            ) ||
                                                                                ""}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-x-6 items-center">
                                                                    <div className="xl:block lg;block md:block hidden text-red-700 rounded-lg cursor-pointer px-3 py-1 bg-red-200 font-semibold h-fit">
                                                                        {Number(
                                                                            item?.Quantity
                                                                        )}
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
                                                    Số lượng ghi nhận lỗi:
                                                </label>
                                                {/*  */}
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
                                                            setFaults(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    amount: selectedItemDetails.stockQuantity,
                                                                })
                                                            );
                                                        } else {
                                                            setFaultyAmount(
                                                                value
                                                            );
                                                            setFaults(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    amount: value,
                                                                })
                                                            );
                                                        }
                                                        if (
                                                            value == 0 ||
                                                            !value
                                                        ) {
                                                            setSelectedFaultItem(
                                                                {
                                                                    ItemCode:
                                                                        "",
                                                                    ItemName:
                                                                        "",
                                                                    SubItemCode:
                                                                        "",
                                                                    SubItemName:
                                                                        "",
                                                                    SubItemBaseQty:
                                                                        "",
                                                                    OnHand: "",
                                                                }
                                                            );
                                                            setFaults(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    factory:
                                                                        null,
                                                                })
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <NumberInputField />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>

                                                {!faultyAmount ||
                                                    (faultyAmount > 0 && (
                                                        <>
                                                            <div className="my-3 font-medium text-[15px] text-red-700">
                                                                Lỗi thành phẩm:
                                                            </div>
                                                            <div
                                                                className={`mb-4 ml-3 text-gray-600 
                                                                ${
                                                                    selectedFaultItem.ItemCode ===
                                                                    choosenItem.ItemChild
                                                                        ? "font-semibold text-gray-800 "
                                                                        : "text-gray-600"
                                                                }`}
                                                                key={index}
                                                            >
                                                                <Radio
                                                                    ref={
                                                                        checkRef
                                                                    }
                                                                    value={
                                                                        choosenItem.ChildName
                                                                    }
                                                                    isChecked={
                                                                        selectedFaultItem.ItemCode ===
                                                                        choosenItem.ItemChild
                                                                    }
                                                                    onChange={() => {
                                                                        setSelectedFaultItem(
                                                                            {
                                                                                ItemCode:
                                                                                    choosenItem.ItemChild,
                                                                                ItemName:
                                                                                    choosenItem.ChildName,
                                                                                SubItemCode:
                                                                                    "",
                                                                                SubItemName:
                                                                                    "",
                                                                                SubItemBaseQty:
                                                                                    "",
                                                                                OnHand: "",
                                                                            }
                                                                        );
                                                                        setIsItemCodeDetech(
                                                                            true
                                                                        );
                                                                        console.log(
                                                                            "Giá trị đã chọn: ",
                                                                            selectedFaultItem
                                                                        );
                                                                    }}
                                                                >
                                                                    {
                                                                        choosenItem.ChildName
                                                                    }
                                                                </Radio>
                                                            </div>
                                                            {selectedItemDetails?.CongDoan !==
                                                                "SC" &&
                                                                selectedItemDetails?.CongDoan !==
                                                                    "XV" && (
                                                                    <>
                                                                        {" "}
                                                                        <div className="my-3 font-medium text-[15pxtext-red-700">
                                                                            Lỗi
                                                                            bán
                                                                            thành
                                                                            phẩm
                                                                            công
                                                                            đoạn
                                                                            trước:
                                                                        </div>
                                                                        {selectedItemDetails?.stocks.map(
                                                                            (
                                                                                item,
                                                                                index
                                                                            ) => (
                                                                                <div
                                                                                    className={`mb-4 ml-3  ${
                                                                                        selectedFaultItem.SubItemCode ===
                                                                                        item.SubItemCode
                                                                                            ? "font-semibold text-gray-800 "
                                                                                            : "text-gray-600"
                                                                                    }`}
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                >
                                                                                    <Radio
                                                                                        ref={
                                                                                            checkRef
                                                                                        }
                                                                                        value={
                                                                                            item.SubItemCode
                                                                                        }
                                                                                        isChecked={
                                                                                            selectedFaultItem.SubItemCode ===
                                                                                            item.SubItemCode
                                                                                        }
                                                                                        onChange={() => {
                                                                                            setSelectedFaultItem(
                                                                                                {
                                                                                                    ItemCode:
                                                                                                        "",
                                                                                                    ItemName:
                                                                                                        "",
                                                                                                    SubItemCode:
                                                                                                        item.SubItemCode,
                                                                                                    SubItemName:
                                                                                                        item.SubItemName,
                                                                                                    SubItemBaseQty:
                                                                                                        item.BaseQty,
                                                                                                    OnHand: item.OnHand,
                                                                                                }
                                                                                            );
                                                                                            setIsItemCodeDetech(
                                                                                                false
                                                                                            );
                                                                                            console.log(
                                                                                                "Giá trị đã chọn: ",
                                                                                                selectedFaultItem
                                                                                            );
                                                                                        }}
                                                                                    >
                                                                                        {
                                                                                            item.SubItemName
                                                                                        }
                                                                                    </Radio>
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </>
                                                                )}
                                                        </>
                                                    ))}
                                            </Box>
                                            <Box className="px-2 pt-2">
                                                <label className="font-semibold">
                                                    Lỗi phôi nhận từ nhà máy
                                                    khác:
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
                                                            setFaults(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    factory:
                                                                        null,
                                                                })
                                                            );
                                                        } else {
                                                            setFaults(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    factory:
                                                                        value,
                                                                })
                                                            );
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </div>
                                    </>
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
                                <span className="xl:text-[15px] lg:text-[15px] md:text-[15px] text-[17px] sm:text-base font-bold xl:ml-1 lg:ml-1 md:ml-1 ml-0">
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
                        <div className="flex flex-row xl:px-6 lg-px-6 md:px-6 px-4 w-full items-center justify-end py-4 gap-x-3 ">
                            <button
                                onClick={() => {
                                    closeInputModal();
                                    setSelectedFaultItem({
                                        ItemName: "",
                                        ItemCode: "",
                                        SubItemName: "",
                                        SubItemCode: "",
                                        SubItemBaseQty: "",
                                        OnHand: "",
                                    });
                                    setFaultyAmount("");
                                    setIsItemCodeDetech(false);
                                    setRongData(null);
                                }}
                                className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full"
                            >
                                Đóng
                            </button>
                            <button
                                className="bg-gray-800 p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full text-white"
                                type="button"
                                onClick={onAlertDialogOpen}
                            >
                                Xác nhận
                            </button>
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
                            {selectedItemDetails?.CongDoan === "RO" ? (
                                <>
                                    <div className="p-2 rounded-lg bg-blue-50 border-2 border-blue-200 border-dashed ">
                                        <div>
                                            <div className="font-semibold">
                                                Bán thành phẩm được rong:{" "}
                                            </div>
                                            <div className="font-bold text-lg text-[#155979]">
                                                {selectedItemDetails?.ChildName}
                                            </div>
                                        </div>
                                        <div className="">
                                            Số lượng đem đi rong:{" "}
                                            {RONGInputQty || 0}
                                        </div>
                                    </div>
                                    <IoIosArrowDown className="my-2 w-full text-center text-3xl text-[#155979]" />
                                    <div className="px-2 rounded-lg bg-gray-50 border-2 border-gray-300 border-dashed divide-y divide-gray-200">
                                        {rongData.length > 0 ? (
                                            rongData.filter(
                                                (data) =>
                                                    data.CompleQty !== "" ||
                                                    data.RejectQty !== ""
                                            ).length > 0 ? (
                                                rongData
                                                    .filter(
                                                        (data) =>
                                                            data.CompleQty !==
                                                                "" ||
                                                            data.RejectQty !==
                                                                ""
                                                    )
                                                    .map((data, index) => (
                                                        <div className="">
                                                            <div
                                                                key={index}
                                                                className="py-2 "
                                                            >
                                                                <p className="font-bold text-lg">
                                                                    {
                                                                        data.ItemName
                                                                    }
                                                                </p>
                                                                {data.CompleQty && (
                                                                    <p className="text-green-700">
                                                                        Số lượng
                                                                        ghi
                                                                        nhận:{" "}
                                                                        {
                                                                            data.CompleQty
                                                                        }
                                                                    </p>
                                                                )}
                                                                {data.RejectQty && (
                                                                    <p className="text-red-700">
                                                                        Số lượng
                                                                        lỗi:{" "}
                                                                        {
                                                                            data.RejectQty
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                            {/* <div className="border-b border-gray-200"></div> */}
                                                        </div>
                                                    ))
                                            ) : (
                                                <p className="py-2">
                                                    Chưa có giá trị nào được ghi
                                                    nhận.
                                                </p>
                                            )
                                        ) : (
                                            <p className="py-2">
                                                Chưa có giá trị nào được ghi
                                                nhận.
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {(amount && amount !== "") ||
                                    (faultyAmount && faultyAmount !== "") ? (
                                        <>
                                            {amount && (
                                                <div className="text-green-700">
                                                    Ghi nhận sản lượng:{" "}
                                                    <span className="font-bold">
                                                        {amount}
                                                    </span>
                                                </div>
                                            )}
                                            {faultyAmount && (
                                                <div className="text-red-700">
                                                    Ghi nhận lỗi:{" "}
                                                    <span className="font-bold">
                                                        {faultyAmount}
                                                    </span>
                                                    {faults &&
                                                        faults.ItemCode &&
                                                        faults.factory && (
                                                            <span>
                                                                {" "}
                                                                từ{" "}
                                                                {
                                                                    faults
                                                                        .factory
                                                                        .label
                                                                }
                                                            </span>
                                                        )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p>
                                            Bạn chưa ghi nhận bất kỳ giá trị
                                            nào.
                                        </p>
                                    )}
                                </>
                            )}
                        </AlertDialogBody>
                        <AlertDialogFooter className="gap-4">
                            <Button onClick={onAlertDialogClose}>Huỷ bỏ</Button>
                            <button
                                disabled={confirmLoading}
                                className="w-fit bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                onClick={
                                    selectedItemDetails?.CongDoan === "RO"
                                        ? handleSubmitQuantityRong
                                        : handleSubmitQuantity
                                }
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
