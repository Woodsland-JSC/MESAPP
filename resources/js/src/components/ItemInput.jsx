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
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuDivider,
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
import { FaCircleRight, FaDiceD6 } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import { FaCheckCircle, FaDollyFlatbed, FaInstalod } from "react-icons/fa";
import { FaExclamationCircle, FaCaretRight } from "react-icons/fa";
import { TbDotsVertical, TbMenu, TbMenu2, TbPencil, TbPlayerTrackNextFilled } from "react-icons/tb";
import {
    MdAssignmentReturn,
    MdDangerous,
    MdOutlineSubdirectoryArrowRight,
} from "react-icons/md";
import { TbTrash } from "react-icons/tb";
import { FaBox } from "react-icons/fa";
import { FaClock } from "react-icons/fa";
import { FaDotCircle } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../assets/styles/datepicker.css";
import { BiSolidBadgeCheck } from "react-icons/bi";
import { VAN_CONG_NGHIEP } from "../shared/data";
import { set } from "date-fns";

const ItemInput = ({
    data,
    index,
    fromGroup,
    searchTerm,
    MaThiTruong,
    variant,
    selectedFactory,
    nextGroup,

    // Hàm xem kết cấu ván công nghiệp
    viewStructure,
    // Xem vật tư
    viewMaterial
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

    // New disclosure hooks for confirmation modals
    const {
        isOpen: isCancelOrderModalOpen,
        onOpen: onCancelOrderModalOpen,
        onClose: onCancelOrderModalClose,
    } = useDisclosure();

    const {
        isOpen: isCloseOrderModalOpen,
        onOpen: onCloseOrderModalOpen,
        onClose: onCloseOrderModalClose,
    } = useDisclosure();

    // New disclosure hook for adjust rong quantity modal
    const {
        isOpen: isAdjustRongQuantityModalOpen,
        onOpen: onAdjustRongQuantityModalOpen,
        onClose: onAdjustRongQuantityModalClose,
    } = useDisclosure();

    const [loading, setLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [deleteProcessingLoading, setDeleteProcessingLoading] =
        useState(false);
    const [deleteErrorLoading, setDeleteErrorLoading] = useState(false);
    const [cancelDisassemblyOrderLoading, setCancelDisassemblyOrderLoading] = useState(false);
    const [closeDisassemblyOrderLoading, setCloseDisassemblyOrderLoading] = useState(false);
    const [adjustRongQuantityLoading, setAdjustRongQuantityLoading] = useState(false);

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
    const [packagedAmount, setPackagedAmount] = useState("");
    const [faultyAmount, setFaultyAmount] = useState("");
    const [choosenItem, setChoosenItem] = useState(null);

    const [faults, setFaults] = useState({});
    const [selectedDelete, setSelectedDelete] = useState(null);
    const [selectedError, setSelectedError] = useState(null);
    const [dialogType, setDialogType] = useState(null);
    const [selectedQCLogging, setSelectedQCLogging] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null); 
    const [selectedNotification, setSelectedNotification] = useState({
        ItemCode: "",
        ItemName: "",
        Quantity: "",
    }); 
    const [adjustQuantity, setAdjustQuantity] = useState(""); 

    const [fromDate, setFromDate] = useState(new Date().setHours(0, 0, 0, 0));
    const [toDate, setToDate] = useState(new Date().setHours(23, 59, 59, 999));

    const loadCBGItemDetails = async (item) => {
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
                CDay: item.CDay,
                CRong: item.CRong,
                CDai: item.CDai,
                ItemInfo: res.ItemInfo,
                stockQuantity: res.maxQuantity,
                CongDoan: res.CongDoan,
                SubItemWhs: res.SubItemWhs,
                factories: res.Factorys?.filter(
                    (item) => item.Factory !== user.plant
                ).map((item) => ({
                    value: item.Factory,
                    label: item.FactoryName,
                })),
                notifications: res.notifications,
                stocks: res.stocks,
                maxQty: res.maxQty,
                remainQty: res.remainQty,
                WaitingConfirmQty: res.WaitingConfirmQty,
                WaitingQCItemQty: res.WaitingQCItemQty,
                returnedData: res.returnedHistory,
            });
            onModalOpen();
        } catch (error) {
            toast.error(
                error.response?.data?.error || "Có lỗi khi lấy dữ liệu item."
            );
            console.error(error);
        }
        setLoading(false);
    };

    const loadRongItemDetails = async (item) => {
        setLoading(true);
        try {
            const params = {
                FatherCode: item.ItemChild,
                TO: item.TO,
                version: item.Version,
                ProdType: item.ProdType,
            };
            const res =
                await productionApi.getFinishedRongPlywoodGoodsDetail(
                    params
                );
            console.log(
                "Thông tin lệnh phân rã rong: ",
                res.disassemblyOrders
            );
            setSelectedItemDetails({
                ...item,
                CongDoan: res.CongDoan,
                FatherStock: res.FatherStock,
                factories: res.Factorys?.map((item) => ({
                    value: item.Factory,
                    label: item.FactoryName,
                })),
                disassemblyOrders: res.disassemblyOrders,
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
                ConLai: parseInt(stock.ConLai),
                CDay: stock.CDay,
                CRong: stock.CRong,
                CDai: stock.CDai,
                factories: "",
            }));
            setRongData(RONGReceiptData);
            onModalOpen();
        } catch (error) {
            toast.error(
                error.response?.data?.error ||
                    "Có lỗi khi lấy dữ liệu item."
            );
            console.error(error);
        }
        setLoading(false);
    };

    const loadPlywoodItemDetails = async (item) => {
        setLoading(true);
        try {
            const params = {
                SPDICH: data.SPDICH,
                ItemCode: item.ItemChild,
                TO: item.TO,
                Version: item.Version,
                ProdType: item.ProdType,
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
                remainQty: res.remainQty,
                CongDoan: res.CongDoan,
                ProdType: res.ProdType,
                SubItemWhs: res.SubItemWhs,
                factories: res.Factorys?.filter(
                    (item) => item.Factory !== user.plant
                ).map((item) => ({
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
                error.response?.data?.error ||
                    "Có lỗi khi lấy dữ liệu item."
            );
            console.error(error);
        }
        setLoading(false);
    };

    const cancelOrder = async (order) => {
        try {
            const payload = {
                id: order.id,
            };
            setCancelDisassemblyOrderLoading(true);
            
            const res = await productionApi.cancelDisassemblyOrder(payload);
            toast.success("Hủy lệnh thành công!");
            
            if (choosenItem) {
                if (choosenItem.CDOAN === "RO") {
                    await loadRongItemDetails(choosenItem);
                }
            }

            setCancelDisassemblyOrderLoading(false);
            
            onCancelOrderModalClose();
        } catch (error) {
            toast.error(
                error.response?.data?.error ||
                    "Đã xảy ra lỗi khi hủy lệnh. Vui lòng thử lại sau."
            );
            setCancelDisassemblyOrderLoading(false);
            console.error(error);
        }
    };

    const closeOrder = async (order) => {
        try {
            const payload = {
                id: order.id,
            };

            setCloseDisassemblyOrderLoading(true);
            
            const res = await productionApi.closeDisassemblyOrder(payload);
            toast.success("Đóng lệnh thành công!");
            
            if (choosenItem) {
                if (choosenItem.CDOAN === "RO") {
                    await loadRongItemDetails(choosenItem);
                }
            }

            setCloseDisassemblyOrderLoading(false);
            
            onCloseOrderModalClose();
        } catch (error) {
            toast.error(
                error.response?.data?.error ||
                    "Đã xảy ra lỗi khi đóng lệnh. Vui lòng thử lại sau."
            );
            setCloseDisassemblyOrderLoading(false);
            console.error(error);
        }
    };

    const openInputModal = async (item) => {
        console.log("Item đã chọn: ", item);
        console.log("Nhà máy hiện tại: ", selectedFactory);
        if (variant === "CBG") {
            await loadCBGItemDetails(item);
        } else {
            if (item.CDOAN === "RO") {
                await loadRongItemDetails(item);
            } else {
                await loadPlywoodItemDetails(item);
            }
        }
    };

    const closeInputModal = () => {
        onModalClose();
        setAmount();
        setFaults({});
        setRongData(null);
        setSelectedItemDetails(null);
        setFromDate(new Date().setHours(0, 0, 0, 0));
        setToDate(new Date().setHours(23, 59, 59, 999));
        setFilteredReturnedData([]);
    };

    // Function to handle adjust rong quantity
    const handleAdjustRongQuantity = async () => {
        if (!adjustQuantity || adjustQuantity === "" || isNaN(adjustQuantity)) {
            toast.error("Vui lòng nhập số lượng hợp lệ");
            return;
        }

        if (adjustQuantity <= 0) {
            toast.error("Số lượng phải lớn hơn 0");
            return;
        }

        // Check if adjustQuantity exceeds ConLai value
        if (selectedItemDetails && rongData) {
            const selectedItem = rongData.find(item => item.ItemCode === selectedNotification.ItemCode);
            if (selectedItem && Number(adjustQuantity) > selectedItem.ConLai) {
                toast.error(`Số lượng điều chỉnh không được vượt quá số lượng còn lại (${selectedItem.ConLai})`);
                return;
            }
        }

        try {
            const data = {
                id: selectedNotification?.id,
                Qty: adjustQuantity
            };

            setAdjustRongQuantityLoading(true);

            const res = await productionApi.adjustRongQuantity(data);
            toast.success("Cập nhật số lượng thành công!");
            
            // Close modal and reset state
            setAdjustRongQuantityLoading(false);
            onAdjustRongQuantityModalClose();
            setAdjustQuantity("");
            setSelectedNotification({
                ItemCode: "",
                ItemName: "",
                Quantity: "",
            });
            
            // Refresh the data
            if (selectedItemDetails) {
                openInputModal(selectedItemDetails);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.error || "Có lỗi xảy ra khi cập nhật số lượng."
            );
            setAdjustRongQuantityLoading(false);
            console.error(error);
        }
    };

    const handleSubmitQuantityRong = async () => {
        console.log("Dữ liệu: ", rongData, RONGInputQty);

        // Validate RONGInputQty
        if (!RONGInputQty || RONGInputQty === "" || RONGInputQty === null) {
            toast.error("Vui lòng nhập số lượng ghi nhận bán thành phẩm.");
            onAlertDialogClose();
            return;
        }

        if (Number(RONGInputQty) <= 0) {
            toast.error("Số lượng ghi nhận bán thành phẩm phải lớn hơn 0.");
            onAlertDialogClose();
            return;
        }

        if (Number(RONGInputQty) > selectedItemDetails.FatherStock) {
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

        for (let i = 0; i < rongData.length; i++) {
            const item = rongData[i];

            // CompleQty là bắt buộc
            if (
                item.CompleQty === undefined ||
                item.CompleQty === null ||
                item.CompleQty === "" ||
                isNaN(Number(item.CompleQty))
            ) {
                toast.error(
                    <span>
                        Vui lòng nhập số lượng ghi nhận cho{" "}
                        <span style={{ fontWeight: "bold" }}>
                            {item.ItemName}
                        </span>
                        .
                    </span>
                );
                onAlertDialogClose();
                return;
            }

            const comple = Number(item.CompleQty);
            const conLai = Number(item.ConLai);

            if (comple <= 0) {
                toast.error(
                    <span>
                        Số lượng ghi nhận{" "}
                        <span style={{ fontWeight: "bold" }}>
                            {item.ItemName}
                        </span>{" "}
                        phải lớn hơn 0.
                    </span>
                );
                onAlertDialogClose();
                return;
            }

            if (comple > conLai) {
                toast.error(
                    <span>
                        Số lượng ghi nhận{" "}
                        <span style={{ fontWeight: "bold" }}>
                            {item.ItemName}
                        </span>{" "}
                        không được vượt quá {item.ConLai}.
                    </span>
                );
                onAlertDialogClose();
                return;
            }

            if (item.RejectQty !== undefined && item.RejectQty !== "") {
                const reject = Number(item.RejectQty);
                if (isNaN(reject) || reject <= 0) {
                    toast.error(
                        <span>
                            Số lượng lỗi{" "}
                            <span style={{ fontWeight: "bold" }}>
                                {item.ItemName}
                            </span>{" "}
                            phải lớn hơn 0.
                        </span>
                    );
                    onAlertDialogClose();
                    return;
                }
                if (reject > conLai) {
                    toast.error(
                        <span>
                            Số lượng lỗi{" "}
                            <span style={{ fontWeight: "bold" }}>
                                {item.ItemName}
                            </span>{" "}
                            không được vượt quá {item.ConLai}.
                        </span>
                    );
                    onAlertDialogClose();
                    return;
                }
            }
        }

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
                KHOI: "VCN",
            };
            console.log("Dữ liệu sẽ được gửi đi: ", Data);
            const res = await productionApi.enterFinishedRongAmountVCN(Data);
            toast.success("Ghi nhận & chuyển tiếp thành công!");
        } catch (error) {
            console.error("Đã xảy ra lỗi:", error);
            toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
        setConfirmLoading(false);
        setRONGInputQty("");
        setRongData(null);
        onAlertDialogClose();
        closeInputModal();
    };

    const handleSubmitQuantity = async () => {
        if (
            selectedItemDetails.CongDoan !== "SC" &&
            selectedItemDetails.CongDoan !== "XV" &&
            (selectedItemDetails?.stocks?.length !== 1 ||
                selectedItemDetails?.stocks[0]?.SubItemCode !==
                "MM010000178") &&
            amount < 0
        ) {
            toast.error("Số lượng ghi nhận phải lớn hơn 0");
            onAlertDialogClose();
            return;
        } else if (
            selectedItemDetails.CongDoan !== "SC" &&
            selectedItemDetails.CongDoan !== "XV" &&
            (selectedItemDetails?.stocks?.length !== 1 ||
                selectedItemDetails?.stocks[0]?.SubItemCode !==
                "MM010000178") &&
            amount > selectedItemDetails.maxQty
        ) {
            toast.error("Đã vượt quá số lượng tối đa có thể xuất");
            onAlertDialogClose();
            return;
        } else if (
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
            (selectedItemDetails?.stocks?.length !== 1 ||
                selectedItemDetails?.stocks[0]?.SubItemCode !==
                "MM010000178") &&
            faultyAmount < 0
        ) {
            toast.error("Số lượng lỗi phải lớn hơn 0");
            onAlertDialogClose();
            return;
        } else if (
            selectedItemDetails.CongDoan !== "SC" &&
            selectedItemDetails.CongDoan !== "XV" &&
            selectedFaultItem.ItemCode !== "" &&
            (selectedItemDetails?.stocks?.length !== 1 ||
                selectedItemDetails?.stocks[0]?.SubItemCode !==
                "MM010000178") &&
            faultyAmount > selectedItemDetails.maxQty
        ) {
            toast.error("Đã vượt quá số lượng lỗi có thể ghi nhận");
            onAlertDialogClose();
            return;
        } else if (
            selectedItemDetails.CongDoan !== "SC" &&
            selectedItemDetails.CongDoan !== "XV" &&
            (selectedItemDetails?.stocks?.length !== 1 ||
                selectedItemDetails?.stocks[0]?.SubItemCode !==
                "MM010000178") &&
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
            (selectedItemDetails?.stocks?.length !== 1 ||
                selectedItemDetails?.stocks[0]?.SubItemCode !==
                "MM010000178") &&
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
                    CDay: selectedItemDetails.CDay,
                    CRong: selectedItemDetails.CRong,
                    CDai: selectedItemDetails.CDai,
                    Team: selectedItemDetails.TO,
                    CongDoan: selectedItemDetails.NameTO,
                    NexTeam: selectedItemDetails.TOTT,
                    ErrorData: ErrorData,
                    Type: variant,
                    version: choosenItem.Version || "",
                    ProdType: selectedItemDetails.ProdType || "",
                    LSX: selectedItemDetails.LSX[0].LSX,
                    CompleQty: 0,
                    RejectQty: 0,
                    PackagedQty: 0,
                    KHOI: variant || "",
                    loinhamay: faults?.factory?.value || user.plant || "",
                    Factory: selectedFactory || "",
                };
                if (amount && amount > 0) {
                    payload.CompleQty = Number(amount);
                }
                if (faultyAmount && faultyAmount > 0) {
                    payload.RejectQty = Number(faultyAmount);
                }
                if (packagedAmount && packagedAmount > 0) {
                    payload.PackagedQty = Number(packagedAmount);
                }
                if (payload.FatherCode && payload.ItemCode) {
                    if (payload.CompleQty || payload.RejectQty) {
                        if (variant === "CBG") {
                            console.log("Dữ liệu sẽ được gửi đi:", payload);
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
            setIsItemCodeDetech(false);
            setConfirmLoading(false);
            setFaults({});
            setAmount();
            setFaultyAmount();

            onAlertDialogClose();
            closeInputModal();
        }
    };

    function transformDetail(details, type) {
        const result = [];

        details?.forEach((item) => {
            let existingItem = result.find(
                (detail) =>
                    detail.ItemCode === item.ItemCode &&
                    detail.ItemName === item.ItemName
            );

            if (!existingItem) {
                existingItem = {
                    ItemCode: item.ItemCode,
                    ItemName: item.ItemName,
                };
                result.push(existingItem);
            }

            if (type == 0) {
                existingItem.Qty_Type0 = item.Qty || 0;
            } else if (type == 1) {
                existingItem.Qty_Type1 = item.Qty || 0;
            }
        });

        console.log("Kết quả transformDetail: ", result);
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
                setSelectedItemDetails((prev) => ({
                    ...prev,
                    notifications: prev.notifications?.filter(
                        (notification) => notification?.id !== selectedDelete
                    ),
                    returnedData: res.returnedHistory,
                    stocks: res.stocks,
                    WaitingConfirmQty: res.WaitingConfirmQty,
                    WaitingQCItemQty: res.WaitingQCItemQty,
                    maxQty: res.maxQty,
                }));
                setFilteredReturnedData((prev) =>
                    prev.filter((item) => item.id !== selectedDelete)
                );
                toast.success("Thao tác thành công.");
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
                        CongDoan: res.CongDoan,
                        FatherStock: res.FatherStock,
                        notifications: prev.notifications.filter(
                            (notification) =>
                                notification.notiID !== selectedDelete
                        ),
                        factories: res.Factorys?.map((factoryItem) => ({
                            value: factoryItem.Factory,
                            label: factoryItem.FactoryName,
                        })),
                        stocks: res.stocks,
                        // SubItemCode: item.ChildName,
                        // SubItemName: item.ItemChild,
                    }));
                    console.log("Dữ liệu sau khi xóa", selectedItemDetails);
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
                    setRongData(RONGReceiptData);
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
                    returnedData: res.returnedHistory,
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

    // Lọc hàng trả về
    const [filteredReturnedData, setFilteredReturnedData] = useState([]);
    const [returnedFilterLoading, setReturnedFilterLoading] = useState(false);

    // Định dạng ngày giờ
    const handleFromDateChange = (date) => {
        if (date) {
            const fromDateTime = new Date(date);
            fromDateTime.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00
            setFromDate(fromDateTime);
        } else {
            setFromDate(null);
        }
    };

    const handleToDateChange = (date) => {
        if (date) {
            const toDateTime = new Date(date);
            toDateTime.setHours(23, 59, 59, 999); // Đặt thời gian về 23:59:59
            setToDate(toDateTime);
        } else {
            setToDate(null);
        }
    };

    const handleSearch = () => {
        if (!fromDate || !toDate) {
            toast.error("Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc.");
            return;
        }

        if (fromDate > toDate) {
            toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
            return;
        }

        // Bắt đầu loading
        setReturnedFilterLoading(true);

        // Đặt thời gian 1 giây để loading kết thúc
        setTimeout(() => {
            if (selectedItemDetails?.returnedData) {
                const filtered = selectedItemDetails.returnedData.filter(
                    (item) => {
                        const confirmDate = new Date(item.confirm_at);
                        return confirmDate >= fromDate && confirmDate <= toDate;
                    }
                );
                setFilteredReturnedData(filtered);
            } else {
                setFilteredReturnedData([]);
            }

            // Kết thúc loading sau 1 giây
            setReturnedFilterLoading(false);
        }, 1000);
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

    const MenuView = ({actionKetCau, actionVatTu}) => {
        return (
            <Menu>
                <MenuButton as={Button} background={"unset"} backgroundColor={"unset"} className="!text-[#17506B] !font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
                    </svg>
                </MenuButton>
                <MenuList className="z-50">
                    <MenuItem onClick={() => viewStructure(actionKetCau.LSX, actionKetCau.data)}>Xem kết cấu</MenuItem>
                    <MenuItem onClick={() => viewMaterial(actionKetCau.LSX, actionKetCau.data)}>Xem vật tư</MenuItem>
                </MenuList>
            </Menu>
        )
    }

    return (
        <>
            <div className="shadow-md relative  rounded-lg bg-white/30 z-1">
                <div
                    className=" uppercase text-[18px] font-medium pl-3 bg-[#2A2C31] text-[white] p-2 py-1.5
                 xl:rounded-t-lg lg:rounded-t-lg md:rounded-t-lg"
                >
                    {data.NameSPDich || "Sản phẩm không xác định"}
                </div>
                <div className="gap-y-2 w-full h-full rounded-b-xl flex flex-col pt-1 pb-1 bg-white ">
                    {data.Details.length > 0
                        ? data.Details.map((item, index) => (
                              <section
                                  onClick={() => {
                                      openInputModal(item);
                                      setChoosenItem(item);
                                  }}
                                  className="rounded-b-xl cursor-pointer duration-200 ease-linear hover:opacity-80"
                                  key={index}
                              >
                                  <div className="text-[#17506B] xl:flex lg:flex md:flex  items-center space-x-2 pt-2 px-4 font-medium ">
                                      <div className="flex items-center">
                                          <span>
                                              <IoIosArrowDown className="inline-block text-gray-500" />{" "}
                                              {item.ChildName}{" "}
                                              {item.CDOAN === "RO" ? (
                                                  <span className="text-[#0da0ea]">
                                                      {item.QuyCach2 || ""}
                                                  </span>
                                              ) : (
                                                  <span className="">
                                                      ({item.CDay}*{item.CRong}*
                                                      {item.CDai})
                                                  </span>
                                              )}
                                              {item.Version && (
                                                  <span className="pl-2 font-medium text-[#17506b]">
                                                      V.
                                                      <span>
                                                          {item.Version}
                                                      </span>
                                                  </span>
                                              )}
                                          </span>
                                      </div>
                                  </div>
                                  <div className="mb-2 mt-1 overflow-hidden rounded-lg border-2 border-[#c4cfe7] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] mx-1.5 ">
                                      <table className="w-full divide-y divide-[#c4cfe7] border-collapse bg-[#ECEFF5] text-left text-sm text-gray-500">
                                          <thead className="bg-[#dae0ec] ">
                                              <tr>
                                                  <th
                                                      scope="col"
                                                      className="px-2 py-2 text-xs font-medium uppercase text-gray-500 "
                                                  >
                                                      LSX
                                                  </th>
                                                  <th
                                                      scope="col"
                                                      className="px-1 py-2 text-xs font-medium uppercase text-gray-500 text-right"
                                                  >
                                                      <span className="xl:block lg:block md:block hidden">
                                                          Sản lượng
                                                      </span>
                                                      <span className="xl:hidden lg:hidden md:hidden block">
                                                          SL
                                                      </span>
                                                  </th>
                                                  <th
                                                      scope="col"
                                                      className="px-2 py-2 text-xs font-medium uppercase  text-right text-gray-500"
                                                  >
                                                      <span className="xl:block lg:block md:block hidden">
                                                          Đã làm
                                                      </span>
                                                      <span className="xl:hidden lg:hidden md:hidden block">
                                                          ĐL
                                                      </span>
                                                  </th>
                                                  <th
                                                      scope="col"
                                                      className="px-2 py-2 text-xs font-medium uppercase text-right text-gray-500"
                                                  >
                                                      Lỗi
                                                  </th>
                                                  <th
                                                      scope="col"
                                                      className="px-2 py-2 text-xs text-right font-medium uppercase text-gray-500"
                                                  >
                                                      <span className="xl:block lg:block md:block hidden">
                                                          Còn lại
                                                      </span>
                                                      <span className="xl:hidden lg:hidden md:hidden block">
                                                          CL
                                                      </span>
                                                  </th>
                                                  {variant ==
                                                      VAN_CONG_NGHIEP && (
                                                      <th
                                                          scope="col"
                                                          className="px-2 py-2 text-xs text-right font-medium uppercase text-gray-500"
                                                      >
                                                          <span className="xl:block lg:block md:block hidden"></span>
                                                          <span className="xl:hidden lg:hidden md:hidden block"></span>
                                                      </th>
                                                  )}
                                              </tr>
                                          </thead>
                                          <tbody className=" border-t border-[#c4cfe7]  ">
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
                                                                  className="bg-[#ECEFF5] border-[#c4cfe7] border-b !text-[13px]"
                                                                  key={index}
                                                              >
                                                                  <th
                                                                      scope="row"
                                                                      className="px-2 py-1 font-medium text-[#17506B] whitespace-nowrap"
                                                                  >
                                                                      {
                                                                          production.LSX
                                                                      }
                                                                  </th>
                                                                  <td className="px-2 py-2 text-right text-gray-800">
                                                                      {formatNumber(
                                                                          Number(
                                                                              production.SanLuong
                                                                          )
                                                                      )}
                                                                  </td>
                                                                  <td className="px-2 py-2 text-right text-gray-900">
                                                                      {formatNumber(
                                                                          Number(
                                                                              production.DaLam
                                                                          )
                                                                      )}
                                                                  </td>
                                                                  <td className="px-2 py-2 text-right text-gray-900">
                                                                      {formatNumber(
                                                                          Number(
                                                                              production.Loi
                                                                          )
                                                                      )}
                                                                  </td>
                                                                  <td className="px-2  py-2 text-right text-gray-800">
                                                                      {formatNumber(
                                                                          Number(
                                                                              production.ConLai
                                                                          )
                                                                      )}
                                                                  </td>
                                                                  {/* {variant ==
                                                                      VAN_CONG_NGHIEP && (
                                                                      <td
                                                                          className="px-2 py-2 text-right text-[#17506B] underline"
                                                                          onClick={(
                                                                              e
                                                                          ) =>
                                                                              viewStructure(
                                                                                  e,
                                                                                  production.LSX
                                                                              )
                                                                          }
                                                                      >
                                                                          Xem
                                                                          kết
                                                                          cấu
                                                                      </td>
                                                                  )} */}
                                                              </tr>
                                                          )
                                                      )
                                              ) : (
                                                  <span>Không có dữ liệu</span>
                                              )}
                                          </tbody>
                                          <tfoot className="!text-[12px]">
                                              <tr>
                                                  <td className="font-bold  text-gray-700 px-2 py-2">
                                                      Tổng
                                                  </td>
                                                  <td className="px-2 py-2 text-right font-bold text-gray-700">
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
                                                  <td className="px-2 py-2 text-right font-bold text-gray-700">
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
                                                  <td className="px-2 py-2 text-right font-bold text-gray-700">
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
                                                  <td className="px-2 py-2 text-right font-bold text-gray-700">
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
                trapFocus={false}
            >
                <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                <ModalContent className="!px-0">
                    <ModalHeader className="h-[50px] flex items-center justify-center">
                        <div class="xl:ml-6 serif font-bold text-2xl  ">
                            Ghi nhận sản lượng
                        </div>
                    </ModalHeader>
                    <div className="border-b-2 border-[#DADADA]"></div>
                    <ModalBody px={0} py={0}>
                        <div className="flex flex-col justify-center pb-4 bg-[#FAFAFA] ">
                            <div className="xl:mx-auto xl:px-8 text-base w-full xl:w-[55%] space-y-3 ">
                                {selectedItemDetails?.CongDoan === "RO" ? (
                                    <div className="xl:mx-0 lg:mx-0 md:mx-0 mx-3">
                                        <div className="flex md:flex-row pt-3 pb-2 items-center xl:px-0 md:px-0 lg:px-0 ">
                                            <div className="flex items-center space-x-1">
                                                <div className="px-1 rounded-xl">
                                                    <FaInstalod className="text-[#5777ae] w-6 h-6" />
                                                </div>
                                                <div className="uppercase font-bold text-lg">
                                                    Bán thành phẩm rong{" "}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 border-2 border-[#DADADA] bg-white rounded-xl shadow-sm">
                                            <div className="">
                                                <div
                                                    className={`w-full flex items-center justify-between rounded-xl p-3 ${selectedItemDetails?.FatherStock <=
                                                        0
                                                        ? "bg-gray-200"
                                                        : "bg-blue-100"
                                                        }`}
                                                >
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
                                                    <div
                                                        className={`flex justify-end text-right rounded-lg cursor-pointer px-3 py-1 text-white duration-300 ${selectedItemDetails?.FatherStock <=
                                                            0
                                                            ? "bg-gray-500"
                                                            : "bg-[#155979]"
                                                            } `}
                                                    >
                                                        {selectedItemDetails?.FatherStock ||
                                                            0}
                                                    </div>
                                                </div>
                                            </div>
                                            <Box className=" pt-2">
                                                <label className="mt-6 font-semibold">
                                                    Số lượng ghi nhận bán thành
                                                    phẩm:
                                                </label>
                                                {selectedItemDetails?.FatherStock <=
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
                                                        className="mt-2"
                                                        value={RONGInputQty}
                                                        onChange={(value) => {
                                                            const newValue =
                                                                value || "";
                                                            setRONGInputQty(
                                                                newValue
                                                            );
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

                                        {/* <div className="border-t-2 border-dashed border-gray-300 mt-3"></div> */}

                                        <div className="flex md:flex-row pt-6 items-center xl:px-0 md:px-0 lg:px-0 ">
                                            <div className="flex items-center space-x-1">
                                                <div className="px-1 rounded-xl">
                                                    <FaBox className="text-[#5777ae] w-5 h-5" />
                                                </div>
                                                <div className="uppercase font-bold text-lg">
                                                    Thành phẩm rong{" "}
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
                                                        <div className="pl-2 text-white text-lg">
                                                            <div className="text-xs font-medium text-gray-400">
                                                                [
                                                                {Math.abs(
                                                                    stockItem?.BaseQty ||
                                                                        0
                                                                )}
                                                                ]{" "}
                                                                {stockItem?.ItemCode ||
                                                                    ""}
                                                            </div>
                                                            <p className="font-semibold">
                                                                {stockItem?.ItemName ||
                                                                    "Thành phẩm không xác định"}
                                                            </p>
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

                                                    <div className="bg-white border-t-0 !mb-4 border-[#DADADA] border-2 rounded-b-xl shadow-sm">
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

                                                                <div className="flex gap-2 items-center py-3 border-t border-b !mt-0 px-0 pr-2 justify-between">
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

                                                                <Box className="px-0 pt-2">
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
                                                                                    isNaN(
                                                                                        value
                                                                                    )
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
                                                            <div className="border-[#e4e6e8] border"></div>

                                                            {/* Ghi nhận lỗi */}
                                                            <div className="p-4 pb-4">
                                                                <div className="flex space-x-2 pb-1 items-center">
                                                                    <FaExclamationCircle className="w-7 h-7 text-red-700" />
                                                                    <div className="font-semibold text-lg ">
                                                                        Ghi nhận
                                                                        lỗi
                                                                    </div>
                                                                </div>
                                                                <Box className="px-0 pt-2">
                                                                    <label className="font-semibold ">
                                                                        Số lượng
                                                                        ghi nhận
                                                                        lỗi:
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
                                                                                isNaN(
                                                                                    value
                                                                                )
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
                                                                <Box className="px-0 pt-3">
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
                                                                                console.log(
                                                                                    value
                                                                                );
                                                                                setSelectedFactory(
                                                                                    value.value
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
                                        {selectedItemDetails?.disassemblyOrders
                                            ?.length > 0 && (
                                            <>
                                                <div>
                                                    <div className="flex items-center justify-between space-x-1 text-gray-800 font-bold text-lg mt-6 mb-2">
                                                        <div className="flex items-center space-x-1">
                                                            <div className="px-1 rounded-xl">
                                                                <FaClock className="text-[#5777ae] w-5 h-5" />
                                                            </div>
                                                            <div className="uppercase">
                                                                Lịch sử ghi nhận{" "}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {selectedItemDetails?.disassemblyOrders?.map(
                                                            (order, index) => (
                                                                <div className="bg-gray-100 border border-gray-300 py-4 pb-2 rounded-xl ">
                                                                    <div className="px-3">
                                                                        <div className=" flex items-center justify-between">
                                                                            <div className="w-[85%]">
                                                                                <div className="text-[#898c90] font-medium text-xs uppercase">
                                                                                    Bán
                                                                                    thành
                                                                                    phẩm
                                                                                    rong
                                                                                </div>
                                                                                <p className="text-[#185B7B] font-semibold text-[17px] truncate">
                                                                                    {
                                                                                        selectedItemDetails?.SubItemCode
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            <p className="text-2xl mr-1 text-[#185B7B] font-medium">
                                                                                {
                                                                                    order.quantity
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex flex-col  mt-3 text-sm text-gray-600">
                                                                            <p className="w-full xl: flex justify-between">
                                                                                Thời
                                                                                gian:{" "}
                                                                                <span className="font-semibold">
                                                                                    {
                                                                                        order.created_at
                                                                                    }
                                                                                </span>
                                                                            </p>
                                                                            <p className="w-full flex justify-between">
                                                                                Người
                                                                                thực
                                                                                hiện:{" "}
                                                                                <span className="font-semibold">
                                                                                    {
                                                                                        order.created_by
                                                                                    }
                                                                                </span>
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="my-2 mb-1 border-b-2 border-dashed border-gray-300"></div>

                                                                    <div className="px-3 text-[#898c90] my-3 mb-2 font-medium text-xs uppercase">
                                                                        Thành
                                                                        phẩm
                                                                        rong
                                                                    </div>
                                                                    <div className="px-1 space-y-1.5 bg-gray-100 ">
                                                                        {order.notifications?.map(
                                                                            (
                                                                                item,
                                                                                index
                                                                            ) => (
                                                                                <div>
                                                                                    {item?.Type ===
                                                                                    0 ? (
                                                                                        <div className=" p-2 px-3 rounded-2xl bg-[#ffffff] border border-gray-300">
                                                                                            {/* Sản lượng */}
                                                                                            <div className="">
                                                                                                {transformDetail(
                                                                                                    item?.detail,
                                                                                                    item?.Type
                                                                                                ).map(
                                                                                                    (
                                                                                                        detailItem,
                                                                                                        detailIndex
                                                                                                    ) => (
                                                                                                        <div className=" flex items-center justify-between">
                                                                                                            <div className="w-[85%]">
                                                                                                                <p className="text-xs text-gray-500">
                                                                                                                    Sản
                                                                                                                    lượng <span>({item?.confirm == 0 ? 'đã giao' :item?.confirm == 1 ?  'đã nhận' : 'đã bị trả lại'})</span>
                                                                                                                </p>
                                                                                                                <div className="font-medium truncate ">
                                                                                                                    {
                                                                                                                        detailItem.ItemName
                                                                                                                    }
                                                                                                                </div>
                                                                                                                <div className="font-semibold text-lg text-green-600">
                                                                                                                +{parseInt(
                                                                                                                    detailItem.Qty_Type0
                                                                                                                ) ||
                                                                                                                    0}
                                                                                                            </div>
                                                                                                            </div>
                                                                                                            
                                                                                                            <div className="flex items-center ">
                                                                                                                {item.confirm == "2" ? (
                                                                                                                // Adjust Rong Quantity
                                                                                                                <button
                                                                                                                    onClick={() => {
                                                                                                                        // Set the selected notification and open the adjust modal
                                                                                                                        setSelectedNotification({
                                                                                                                            ItemCode: detailItem.ItemCode || "",
                                                                                                                            ItemName: detailItem.ItemName || "",
                                                                                                                            Quantity: detailItem.Qty_Type0 || detailItem.Qty_Type1 || 0,
                                                                                                                            id: item.id || item.notiID || ""
                                                                                                                        });
                                                                                                                        setAdjustQuantity(item.Quantity || "");
                                                                                                                        onAdjustRongQuantityModalOpen();
                                                                                                                    }}
                                                                                                                    className="flex text-white text-sm rounded-full duration-200 ease bg-black hover:bg-orange-700 p-1.5"
                                                                                                                >
                                                                                                                    <TbPencil className="text-white text-2xl h-fit" />
                                                                                                                </button>) :
                                                                                                                (<button className="flex text-black text-sm rounded-full duration-200 ease bg-gray-100 hover:bg-gray-200 p-1.5">
                                                                                                                    <TbDotsVertical className=" text-xl h-fit"/>
                                                                                                                </button>)}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : item?.Type ===
                                                                                      1 ? (
                                                                                        <div className=" p-2 px-3 rounded-2xl bg-[#ffffff] border border-gray-300">
                                                                                            {/* Lỗi */}
                                                                                            <div className="">
                                                                                                {transformDetail(
                                                                                                    item?.detail,
                                                                                                    item?.Type
                                                                                                ).map(
                                                                                                    (
                                                                                                        detailItem,
                                                                                                        detailIndex
                                                                                                    ) => (
                                                                                                        <div className=" flex items-center justify-between">
                                                                                                            <div className="w-[85%]">
                                                                                                                <p className="text-xs text-gray-500">
                                                                                                                    Lỗi thành phẩm
                                                                                                                </p>
                                                                                                                <div className="font-medium truncate ">
                                                                                                                    {
                                                                                                                        detailItem.ItemName
                                                                                                                    }
                                                                                                                </div>
                                                                                                                <div className="font-semibold text-lg text-red-600">
                                                                                                                +{parseInt(
                                                                                                                    detailItem.Qty_Type1
                                                                                                                ) ||
                                                                                                                    0}
                                                                                                            </div>
                                                                                                            </div>
                                                                                                            
                                                                                                            <div className="flex items-center gap-x-6">
                                                                                                                {/* <button
                                                                                                                    onClick={() => {
                                                                                                                        onDeleteProcessingDialogOpen();
                                                                                                                        console.log(
                                                                                                                            "Id Noti bị xóa:",
                                                                                                                            item?.notiID
                                                                                                                        );
                                                                                                                        setSelectedDelete(
                                                                                                                            item?.notiID
                                                                                                                        );
                                                                                                                        setDialogType(
                                                                                                                            "product"
                                                                                                                        );
                                                                                                                    }}
                                                                                                                    className="flex text-white text-sm rounded-full duration-200 ease bg-black hover:bg-red-700 p-1.5"
                                                                                                                >
                                                                                                                    <TbPencil className="text-white text-2xl h-fit" />
                                                                                                                </button> */}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : null}
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                    <div className="w-full px-3 space-x-3 flex items-center justify-end mt-3">
                                                                        {order.status == "new" && (
                                                                            <button
                                                                                className="p-2 px-4 hover:bg-red-200 bg-red-100 rounded-full font-medium text-red-600"
                                                                                onClick={() => {
                                                                                    setSelectedOrder(order);
                                                                                    onCancelOrderModalOpen();
                                                                                }}
                                                                            >
                                                                                Hủy lệnh
                                                                            </button>
                                                                        )}
                                                                        {order.status == "complete" && (
                                                                            <button
                                                                                className="p-2 px-4 bg-blue-900 hover:bg-blue-800 rounded-full font-medium text-blue-100"
                                                                                onClick={() => {
                                                                                    setSelectedOrder(order);
                                                                                    onCloseOrderModalOpen();
                                                                                }}
                                                                            >
                                                                                Đóng lệnh
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                    
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col md:flex-row justify-between pt-2 items-center xl:px-0 md:px-0 lg:px-0 px-3">
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
                                        <div className="flex justify-between py-3 border-2 divide-x-2 border-[#DADADA] shadow-sm rounded-xl xl:mx-0 md:mx-0 lg:mx-0 mx-3 bg-white">
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

                                        {/* Nguyên vật liệu */}
                                        <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 border-2 border-[#DADADA] shadow-sm rounded-xl space-y-2 bg-white">
                                            <div className="flex justify-between pb-1 ">
                                                <div className="flex items-center space-x-2">
                                                    <FaDiceD6 className="w-7 h-7 text-amber-700" />
                                                    <div className="font-semibold text-lg ">
                                                        Nguyên vật liệu
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
                                                    Số lượng tồn nguyên vật
                                                    liệu:
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
                                                            className={`${parseInt(
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
                                                                    className={`${parseInt(
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

                                            <div className="flex gap-2 items-center justify-between py-3 border-t px-0 pr-2 ">
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

                                            <div className="flex gap-2 items-center py-3 border-t border-b !mt-0 px-0 pr-2 justify-between">
                                                <Text className="font-semibold">
                                                    Số lượng còn phải sản xuất:
                                                </Text>
                                                <span className="rounded-lg cursor-pointer px-3 py-1 text-white bg-yellow-700 hover:bg-yellow-500 duration-300">
                                                    {formatNumber(
                                                        Number(
                                                            selectedItemDetails?.remainQty -
                                                            selectedItemDetails?.WaitingConfirmQty
                                                        )
                                                    ) || 0}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Ghi nhận sản lượng */}
                                        <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 border-2 border-[#DADADA] shadow-sm rounded-xl space-y-2 bg-white">
                                            <div className="flex justify-between pb-1 ">
                                                <div className="flex items-center space-x-2">
                                                    <FaCircleRight className="w-7 h-7 text-blue-700" />
                                                    <div className="font-semibold text-lg ">
                                                        Ghi nhận sản lượng
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Số lượng giao chờ xác nhận */}
                                            {selectedItemDetails?.notifications &&
                                                selectedItemDetails?.notifications.filter(
                                                    (notif) =>
                                                        notif.confirm == 0 &&
                                                        notif.type == 0
                                                )?.length > 0 && (
                                                    <div className="flex items-center justify-between w-full p-1 px-0 !mt-2 !mb-1">
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
                                                                    className="relative flex justify-between items-center p-2.5 px-3 !mb-4  gap-2 bg-green-50 border border-green-300 rounded-xl"
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
                                                                        {selectedItemDetails?.CongDoan ==
                                                                            "DG" && (
                                                                                <div className="flex text-sm">
                                                                                    <Text className="xl:block lg:block md:block hidden font-medium text-gray-600">
                                                                                        Số
                                                                                        lượng
                                                                                        đã
                                                                                        đóng
                                                                                        gói
                                                                                        chờ
                                                                                        giao:{" "}
                                                                                    </Text>
                                                                                    <Text className="xl:hidden lg:hidden md:hidden  block font-medium text-gray-600">
                                                                                        Đã
                                                                                        đóng
                                                                                        gói
                                                                                        chờ
                                                                                        giao:{" "}
                                                                                    </Text>
                                                                                    <span className="ml-1 text-gray-600">
                                                                                        {Number(
                                                                                            item?.SLDG ||
                                                                                            0
                                                                                        )}
                                                                                    </span>
                                                                                </div>
                                                                            )}
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
                                                                        <div className="xl:block lg:block md:block hidden text-green-700 rounded-lg cursor-pointer px-3 py-1 bg-green-200 font-semibold !mr-6">
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
                                                                            className="absolute -top-2 -right-2 rounded-full p-1.5 bg-black duration-200 ease hover:bg-red-600"
                                                                        >
                                                                            <TbTrash className="text-white text-2xl" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ))}

                                            {selectedItemDetails?.CongDoan ===
                                                "DG" &&
                                                selectedItemDetails?.maxQty >
                                                0 && (
                                                    <div className="">
                                                        <Box className="px-0">
                                                            <label className="mt-6 font-semibold">
                                                                Số lượng đã đóng
                                                                gói chờ giao:
                                                            </label>

                                                            <NumberInput
                                                                ref={
                                                                    receipInput
                                                                }
                                                                step={1}
                                                                min={1}
                                                                value={
                                                                    packagedAmount
                                                                }
                                                                className="mt-2 mb-2"
                                                                onChange={(
                                                                    value
                                                                ) => {
                                                                    setPackagedAmount(
                                                                        value
                                                                    );
                                                                }}
                                                            >
                                                                <NumberInputField />
                                                                <NumberInputStepper>
                                                                    <NumberIncrementStepper />
                                                                    <NumberDecrementStepper />
                                                                </NumberInputStepper>
                                                            </NumberInput>
                                                        </Box>
                                                        <div className="border-b pt-2"></div>
                                                    </div>
                                                )}

                                            <Box className="px-0">
                                                <label className="mt-6 font-semibold">
                                                    Số lượng ghi nhận sản phẩm:
                                                </label>
                                                <span className="font-bold text-red-500">
                                                    {" "}
                                                    *
                                                </span>
                                                {selectedItemDetails?.CongDoan !==
                                                    "SC" &&
                                                    selectedItemDetails?.CongDoan !==
                                                    "XV" &&
                                                    selectedItemDetails?.maxQty <=
                                                    0 &&
                                                    (selectedItemDetails?.stocks
                                                        ?.length !== 1 ||
                                                        selectedItemDetails
                                                            ?.stocks[0]
                                                            ?.SubItemCode !==
                                                        "MM010000178") ? (
                                                    <div className="flex space-x-2 items-center px-4 py-3 bg-red-50 rounded-xl text-red-500 mt-2 mb-2">
                                                        <MdDangerous className="w-6 h-6" />
                                                        <div>
                                                            Không đủ số lượng để
                                                            ghi nhận
                                                        </div>
                                                    </div>
                                                ) : selectedItemDetails?.remainQty -
                                                    selectedItemDetails?.WaitingConfirmQty <=
                                                    0 ? (
                                                    <div className="flex space-x-2 items-center px-4 py-3 bg-gray-800 rounded-xl text-green-500 mt-2 mb-2">
                                                        <BiSolidBadgeCheck className="w-6 h-6" />
                                                        <div className="text-white">
                                                            Đã đủ số lượng hoàn
                                                            thành của lệnh.
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
                                        </div>

                                        {/* Ghi nhận lỗi */}
                                        <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 mb-3 border-2 border-[#DADADA] shadow-sm rounded-xl space-y-2 bg-white">
                                            <div className="flex space-x-2 pb-1 items-center">
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
                                                                selectedItemDetails?.notifications.filter(
                                                                    (notif) =>
                                                                        notif.confirm ===
                                                                        0 &&
                                                                        notif.type ===
                                                                        1
                                                                ).length || 0 // Đóng đúng cặp ở đây
                                                            )
                                                        )}
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
                                                                className="relative flex justify-between items-center p-2.5 px-3 !mb-4  gap-2 bg-red-50 border border-red-300 rounded-xl"
                                                            >
                                                                {/*  */}
                                                                <div className="flex flex-col">
                                                                    <div className="xl:hidden lg:hidden md:hidden block  text-red-700 text-2xl">
                                                                        {Number(
                                                                            item?.Quantity
                                                                        )}
                                                                    </div>
                                                                    {item?.loinhamay !==
                                                                        null &&
                                                                        item?.loinhamay !==
                                                                        user.plant && (
                                                                            <Text className="flex space-x-1 font-medium text-xs text-red-500 mb-1">
                                                                                <MdOutlineSubdirectoryArrowRight />
                                                                                <span className=" ">
                                                                                    Lỗi
                                                                                    nhận
                                                                                    từ
                                                                                    nhà
                                                                                    máy{" "}
                                                                                    {item?.loinhamay ==
                                                                                        "YS"
                                                                                        ? "Yên Sơn"
                                                                                        : item?.loinhamay ==
                                                                                            "TH"
                                                                                            ? "Thuận Hưng"
                                                                                            : item?.loinhamay ==
                                                                                                "TB"
                                                                                                ? "Thái Bình"
                                                                                                : item?.loinhamay ==
                                                                                                    "CH"
                                                                                                    ? "Chiêm Hóa"
                                                                                                    : item?.loinhamay ==
                                                                                                        "VF"
                                                                                                        ? "Viforex"
                                                                                                        : "không xác định"}
                                                                                </span>
                                                                            </Text>
                                                                        )}

                                                                    <div className="text-[15px] font-semibold ">
                                                                        {item.SubItemName ||
                                                                            item.ItemName}
                                                                    </div>
                                                                    <Text className="font-medium text-sm ">
                                                                        Người
                                                                        giao:{" "}
                                                                        <span className="font-semibold text-red-700">
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
                                                                    <div className="xl:block lg;block md:block hidden text-red-700 rounded-lg cursor-pointer px-3 py-1 bg-red-200 font-semibold h-fit mr-6">
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
                                                                        className="absolute -top-2 -right-2 rounded-full p-1.5 bg-black duration-200 ease hover:bg-red-600"
                                                                    >
                                                                        <TbTrash className="text-white text-2xl" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                            </div>
                                            <Box className="px-0 pt-2">
                                                <label className="font-semibold ">
                                                    Số lượng ghi nhận lỗi:{" "}
                                                    <span className="text-red-600">
                                                        *
                                                    </span>
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
                                                                ${selectedFaultItem.ItemCode ===
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
                                                                        <div className="my-3 font-medium text-[15px] text-red-700">
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
                                                                                    className={`mb-4 ml-3  ${selectedFaultItem.SubItemCode ===
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
                                            <Box className="px-0 pt-2">
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
                                                <p className="text-sm text-gray-500 mb-1">
                                                    *Bỏ qua phần này nếu lỗi ghi
                                                    nhận là của nhà máy hiện
                                                    tại.
                                                </p>
                                            </Box>
                                        </div>

                                        {/* Lịch sử trả lại */}
                                        <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 pb-2 mb-3 border-2 border-[#DADADA] shadow-sm rounded-xl space-y-2 bg-white">
                                            <div className="flex space-x-2 pb-1 items-center">
                                                <MdAssignmentReturn className="w-8 h-8 text-orange-600" />
                                                <div className="font-semibold text-lg ">
                                                    Lịch sử trả hàng
                                                </div>
                                            </div>

                                            {/* Date Filter*/}
                                            <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col items-end  space-x-3 pb-2">
                                                <div className="flex w-full space-x-3 w-f">
                                                    <div className="w-full">
                                                        <label
                                                            htmlFor="indate"
                                                            className="block mb-1 text-md font-medium text-gray-900 "
                                                        >
                                                            Từ ngày
                                                        </label>
                                                        <DatePicker
                                                            selected={fromDate}
                                                            onChange={(date) =>
                                                                handleFromDateChange(
                                                                    date
                                                                )
                                                            }
                                                            className=" pl-3 border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                                        />
                                                    </div>

                                                    <div className="w-full">
                                                        <label
                                                            htmlFor="indate"
                                                            className="block mb-1 text-md font-medium text-gray-900 "
                                                        >
                                                            Đến ngày
                                                        </label>
                                                        <DatePicker
                                                            selected={toDate}
                                                            onChange={(date) =>
                                                                handleToDateChange(
                                                                    date
                                                                )
                                                            }
                                                            className=" pl-3 border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    className="flex justify-center items-end text-white rounded-lg h-fit p-[7px] px-3 bg-orange-700 xl:w-1/3 lg:w-1/3 md:w-1/3 w-full xl:mt-0 lg:mt-0 md:mt-0 mt-2 active:scale-[.95]  active:duration-75  transition-all"
                                                    onClick={handleSearch}
                                                >
                                                    Tìm kiếm{" "}
                                                </button>
                                            </div>

                                            {/* Thông báo kết quả */}
                                            {returnedFilterLoading ? (
                                                <div className="flex justify-center space-x-3 py-3">
                                                    <Spinner
                                                        thickness="4px"
                                                        speed="0.65s"
                                                        emptyColor="gray.200"
                                                        color="#155979"
                                                    />
                                                    <div>Đang tải </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {filteredReturnedData.length >
                                                        0 ? (
                                                        <div>
                                                            <div className="text-orange-600 text-sm pb-2">
                                                                Có{" "}
                                                                {
                                                                    filteredReturnedData.length
                                                                }{" "}
                                                                kết quả
                                                            </div>
                                                            {filteredReturnedData.map(
                                                                (
                                                                    item,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="relative bg-orange-50 px-4 py-2 rounded-xl flex items-center border-orange-200 border mb-3"
                                                                    >
                                                                        <div className="w-full flex items-center text-[15px] justify-between gap-3">
                                                                            <div>
                                                                                <div className="xl:hidden lg:hidden md:hidden block  text-orange-700 text-2xl">
                                                                                    {Number(
                                                                                        item.Quantity
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex space-x-1 font-semibold">
                                                                                    <div>
                                                                                        Người
                                                                                        trả
                                                                                        lại:
                                                                                    </div>
                                                                                    <div className="text-orange-700">
                                                                                        {
                                                                                            item.last_name
                                                                                        }{" "}
                                                                                        {
                                                                                            item.first_name
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex text-sm">
                                                                                    <span className="font-medium text-gray-600">
                                                                                        Thời
                                                                                        gian
                                                                                        trả:
                                                                                    </span>
                                                                                    <span className="ml-1 text-gray-600">
                                                                                        {
                                                                                            item.confirm_at
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex text-sm">
                                                                                    <span className="font-medium text-gray-600">
                                                                                        Lý
                                                                                        do
                                                                                        trả:
                                                                                    </span>
                                                                                    <span className="ml-1 text-gray-600">
                                                                                        {
                                                                                            item.text
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="xl:block lg:block md:block hidden  rounded-lg cursor-pointer px-3 py-1 font-semibold bg-orange-200 text-orange-700 hover:bg-orange-500 duration-300 !mr-6">
                                                                                {Number(
                                                                                    item.Quantity
                                                                                )}
                                                                            </div>
                                                                            <button
                                                                                onClick={() => {
                                                                                    onDeleteProcessingDialogOpen();
                                                                                    setSelectedDelete(
                                                                                        item?.id
                                                                                    );
                                                                                    setDialogType(
                                                                                        "return"
                                                                                    );
                                                                                }}
                                                                                className="absolute -top-2 -right-2 rounded-full p-1.5 bg-black duration-200 ease hover:bg-red-600"
                                                                            >
                                                                                <TbTrash className="text-white text-2xl" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center text-gray-600 py-3">
                                                            Không tìm thấy kết
                                                            quả.
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </ModalBody>

                    <ModalFooter className="flex flex-col !p-0 ">
                        <Alert status="info" className="!py-2 !bg-[#A3DEFF]">
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
                            {["CBG", "VCN", "DAND"].some((permission) =>
                                user.permissions.includes(permission)
                            ) && (
                                    <button
                                        className="bg-gray-800 p-2 rounded-xl px-4 h-fit font-medium active:scale-[.95]  active:duration-75  transition-all xl:w-fit md:w-fit w-full text-white"
                                        type="button"
                                        onClick={onAlertDialogOpen}
                                    >
                                        Xác nhận
                                    </button>
                                )}
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
                                        <div className="space-y-1">
                                            {packagedAmount && (
                                                <div className="text-yellow-700">
                                                    Số lượng đã đóng gói chờ
                                                    giao:{" "}
                                                    <span className="font-bold">
                                                        {packagedAmount || 0}
                                                    </span>
                                                </div>
                                            )}
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
                                        </div>
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
                            <Button onClick={onAlertDialogClose}>Hủy bỏ</Button>
                            {(amount ||
                                faultyAmount ||
                                (RONGInputQty && rongData)) && (
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
                                )}
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
                                    : dialogType === "qc"
                                        ? "Bạn chắc chắn muốn xóa ghi nhận lỗi chờ xác nhận?"
                                        : "Bạn chắc chắn muốn xóa thông tin lịch sử trả lại?"}
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

            {/* Confirmation Modal for Cancel Order */}
            <AlertDialog
                isOpen={isCancelOrderModalOpen}
                onClose={onCancelOrderModalClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>Xác nhận hủy lệnh</AlertDialogHeader>
                        <AlertDialogBody>
                            Bạn có chắc chắn muốn hủy lệnh này không?
                        </AlertDialogBody>
                        <AlertDialogFooter className="gap-4">
                            <Button onClick={onCancelOrderModalClose} isDisabled={cancelDisassemblyOrderLoading}>Hủy bỏ</Button>
                            <Button
                                colorScheme="red"
                                isLoading={cancelDisassemblyOrderLoading}
                                onClick={() => {
                                    if (selectedOrder) {
                                        cancelOrder(selectedOrder);
                                    }
                                }}
                            >
                                {cancelDisassemblyOrderLoading ? (
                                    <div className="flex items-center space-x-4">
                                        <Spinner size="sm" color="white" />
                                        <div>Đang tải</div>
                                    </div>
                                ) : (
                                    "Xác nhận"
                                )}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Confirmation Modal for Close Order */}
            <AlertDialog
                isOpen={isCloseOrderModalOpen}
                onClose={onCloseOrderModalClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>Xác nhận đóng lệnh</AlertDialogHeader>
                        <AlertDialogBody>
                            Bạn có chắc chắn muốn đóng lệnh này không?
                        </AlertDialogBody>
                        <AlertDialogFooter className="gap-4">
                            <Button onClick={onCloseOrderModalClose} isDisabled={closeDisassemblyOrderLoading}>Hủy bỏ</Button>
                            <Button
                                colorScheme="blue"
                                isDisabled={closeDisassemblyOrderLoading}
                                onClick={() => {
                                    if (selectedOrder) {
                                        closeOrder(selectedOrder);
                                    }
                                }}
                            >
                                {closeDisassemblyOrderLoading ? (
                                    <div className="flex items-center space-x-4">
                                        <Spinner size="sm" color="white" />
                                        <div>Đang tải</div>
                                    </div>
                                ) : (
                                    "Xác nhận"
                                )}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Adjust Rong Quantity Modal */}
            <Modal
                isCentered
                isOpen={isAdjustRongQuantityModalOpen}
                onClose={onAdjustRongQuantityModalClose}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Điều chỉnh số lượng rong</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedNotification && (
                            <div className="space-y-4">
                                <div className=" rounded-lg">
                                    <div className="font-medium">Thông tin sản phẩm:</div>
                                    <div className="text-lg font-semibold text-blue-600">
                                        {selectedNotification.ItemName}
                                    </div>
                                </div>
                                
                                <div className=" rounded-lg">
                                    <div className="font-medium">Số lượng hiện tại:</div>
                                    <div className="text-lg font-semibold">
                                        {Number(selectedNotification.Quantity)}
                                    </div>
                                </div>
                                
                                <Box>
                                    <label className="font-semibold">
                                        Số lượng điều chỉnh: <span className="text-red-500">*</span>
                                    </label>
                                    <NumberInput
                                        value={adjustQuantity}
                                        onChange={(value) => setAdjustQuantity(value)}
                                        min={0}
                                        className="mt-2"
                                    >
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                    </NumberInput>
                                </Box>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter className="gap-3">
                        <Button 
                            onClick={onAdjustRongQuantityModalClose}
                            isDisabled={adjustRongQuantityLoading}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleAdjustRongQuantity}
                            isDisabled={!adjustQuantity || adjustQuantity === "" || isNaN(adjustQuantity)}
                        >
                            {adjustRongQuantityLoading ? (
                                <div className="flex items-center space-x-4">
                                    <Spinner size="sm" color="white" />
                                    <div>Đang tải</div>
                                </div>
                            ) : (
                                "Xác nhận"
                            )}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {loading && <Loader />}
        </>
    );
};

export default ItemInput;
