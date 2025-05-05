import React, { useState, useEffect, useRef, useContext } from "react";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Badge,
    Button,
    ButtonGroup,
    Box,
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
import Select from "react-select";
import { MdRefresh } from "react-icons/md";
import toast from "react-hot-toast";
import moment from "moment";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import productionApi from "../api/productionApi";
import "../assets/styles/index.css";
import useAppContext from "../store/AppContext";
import { TbClock } from "react-icons/tb";
import { id } from "date-fns/locale";

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

const weeks = [];

for (let i = 1; i <= 52; i++) {
    weeks.push({
        value: i,
        label: `Tuần ${i}`,
    });
}

const getCurrentWeekNumber = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const oneWeekInMilliseconds = 1000 * 60 * 60 * 24 * 7;
    const currentWeek = Math.floor(diff / oneWeekInMilliseconds);

    return currentWeek;
};
const AwaitingReception = ({
    data,
    type,
    index,
    errorType,
    solution,
    teamBack,
    rootCause,
    returnCode,
    isQualityCheck,
    onConfirmReceipt,
    onRejectReceipt,
    CongDoan,
    variant,
    Factory,
}) => {
    const errorTypeRef = useRef();
    const solutionRef = useRef();
    const teamBackRef = useRef();
    const rootCauseRef = useRef();
    const returnCodeRef = useRef();
    const [weekRef, setSelectedweekRef] = useState(null);
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
    const {
        isOpen: isStockCheckingOpen,
        onOpen: onStockCheckingOpen,
        onClose: onStockCheckingClose,
    } = useDisclosure();
    const [reason, setReason] = useState("");
    const [acceptLoading, setAcceptLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [checkingLoading, setCheckingLoading] = useState(false);

    const [isReturnSelect, setIsReturnSelect] = useState(false);

    const [errorTypeOptions, setErrorTypeOptions] = useState([]);
    const [solutionOptions, setSolutionOptions] = useState([]);
    const [teamBackOptions, setTeamBackOptions] = useState([]);
    const [rootCauseOptions, setRootCauseOptions] = useState([]);
    const [returnCodeOptions, setReturnCodeOptions] = useState([]);
    const [weekOptions, setWeekOptions] = useState(weeks);

    const { user } = useAppContext();

    const [faults, setFaults] = useState({
        errorType: null,
        solution: null,
        teamBack: null,
        rootCause: null,
        returnCode: null,
        Qty: null,
        Note: null,
        year: new Date().getFullYear(),
        week: {
            value: getCurrentWeekNumber(),
            label: `Tuần ${getCurrentWeekNumber()}`,
        },
    });

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
                confirmButtonColor: "#3085d6",
            });
        };

        const showRequireQuantityAlert = (
            message,
            productionOrder,
            itemCode
        ) => {
            Swal.fire({
                title: "Nguyên vật liệu không đủ.",
                html: `<p style="font-size: 16px; margin: 6px 0px; user-select: text;">Vui lòng bổ sung vật tư nguyên liệu cho lệnh sản xuất (<b>${productionOrder}</b>) để hoàn thành sản xuất sản phẩm <b>${itemCode}</b>.</p>`,
                icon: "error",
                zIndex: 50001,
                confirmButtonColor: "#3085d6",
                width: "500px",
                didOpen: () => {
                    window.copyToClipboard = (id, button) => {
                        const text = document.getElementById(id).innerText;
                        navigator.clipboard.writeText(text).then(() => {
                            button.querySelector(
                                ".copy-icon"
                            ).style.backgroundColor = "#d1e7dd";
                        });
                    };
                },
            });
        };

        const checkAndDisplayError = (errorMessage) => {
            toast.error(errorMessage);
            onInputAlertDialogClose();
        };

        console.log("Số lượng lỗi:", data);

        if ((!faults.Qty || faults.Qty <= 0) && variant === "QC") {
            checkAndDisplayError("Số lượng lỗi phải lớn hơn 0.");
        } else if (
            parseInt(faults.Qty) > parseInt(data?.Quantity) &&
            variant === "QC"
        ) {
            checkAndDisplayError(
                "Số lượng lỗi không được lớn hơn số lượng ghi nhận."
            );
        } else if (!faults.errorType && variant === "QC") {
            checkAndDisplayError("Loại lỗi không được bỏ trống.");
        } else if (!faults.solution && variant === "QC") {
            checkAndDisplayError("Hướng xử lý không được bỏ trống.");
        } else if (!faults.teamBack && variant === "QC") {
            checkAndDisplayError("Tổ chuyển về không được bỏ trống.");
        } else {
            setAcceptLoading(true);
            try {
                const payload = {
                    id: data?.id,
                    ItemCode: data?.ItemCode,
                    Quantity: data?.Quantity,
                    loailoi: faults.errorType || null,
                    huongxuly: faults.solution || null,
                    teamBack: faults.teamBack || null,
                    rootCause: faults.rootCause || null,
                    subCode: faults.returnCode || null,
                    Note: faults.Note || null,
                    Qty: faults.Qty,
                    CongDoan: CongDoan || null,
                    year: faults.year || null,
                    week: faults.week?.value || null,
                    Factory: Factory || null,
                };
                let res;
                if (payload.id) {
                    switch (type) {
                        case "plywood":
                            res = await (variant === "QC"
                                ? productionApi.acceptReceiptsVCNQC(payload)
                                : productionApi.acceptReceiptsVCN(payload));
                            break;
                        default:
                            res = await (variant === "QC"
                                ? productionApi.acceptReceiptsCBGQC(payload)
                                : productionApi.acceptReceiptsCBG(payload));
                            break;
                    }
                    setAcceptLoading(false);
                    onConfirmReceipt(data?.id);
                    onInputAlertDialogClose();
                } else {
                    showErrorAlert("Có lỗi xảy ra. Vui lòng thử lại");
                }
            } catch (error) {
                const errorMessage =
                    error.response?.data?.message ||
                    error.response?.data?.error?.message?.value ||
                    error.response?.data?.error ||
                    "Lỗi kết nối mạng, vui lòng thử lại sau.";

                if (error.response?.data?.status_code === 40001) {
                    showRequireQuantityAlert(
                        errorMessage,
                        error.response?.data?.production_order,
                        error.response?.data?.item_code
                    );
                } else {
                    showErrorAlert(errorMessage);
                }
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

    const handleCheckingReceipt = async () => {
        setCheckingLoading(true);
        const showstockCheckingInfo = () => {
            Swal.fire({
                title: "Đã có thể ghi nhận.",
                html: `
                    <p>Nguyên vật liệu đã đủ để đáp ứng ghi nhận.</p>
                `,
                icon: "success",
                zIndex: 50001,
                confirmButtonColor: "#3085d6",
            });
        };

        try {
            let res;
            switch (type) {
                case "plywood":
                    res = await productionApi.checkReceiptsVCN({
                        id: data?.id,
                        ItemCode: data?.ItemCode,
                        Quantity: data?.Quantity,
                        CongDoan: CongDoan || null,
                        Factory: Factory || null,
                    });
                    break;
                default:
                    res = await productionApi.checkReceiptsCBG({
                        id: data?.id,
                        ItemCode: data?.ItemCode,
                        Quantity: data?.Quantity,
                        CongDoan: CongDoan || null,
                        Factory: Factory || null,
                    });
                    break;
            }
            // console.log("Checking receipt successful", res);
            if(res?.requiredInventory?.length == 0) {
                showstockCheckingInfo();
                onStockCheckingClose();
            }
            setCheckingLoading(false);
        } catch (error) {
            const showRequireQuantityAlert = (requiredItems) => { 
                const tableRows = requiredItems.map((item, index) => 
                    `<tr style="font-size: 14px; max-height: 280px; overflow-y: auto;">
                        <td style="border: 1px solid #ddd; padding: 6px; user-select: text; text-align: center;">${item.SubItemCode}</td>
                        <td style="border: 1px solid #ddd; padding: 6px; text-align: right; user-select: text;">${item.requiredQuantity}</td>
                        <td style="border: 1px solid #ddd; padding: 6px; user-select: text;">${item.wareHouse}</td>
                    </tr>`
                ).join('');
            
                Swal.fire({
                    title: "Nguyên vật liệu không đủ.",
                    html: 
                        `<p style="font-size: 16px; margin: 6px 0px; user-select: text;">Vui lòng bổ sung nguyên vật liệu:</p>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; border: 1px solid #ddd; user-select: text;">
                            <thead>
                                <tr style="font-size: 14px;">
                                    <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; user-select: text;">Sản phẩm</th>
                                    <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; user-select: text;">Số lượng</th>
                                    <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2; user-select: text;">Kho</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>`,
                    zIndex: 50001,
                    confirmButtonColor: '#3085d6',
                    width: '500px',
                    didOpen: () => {
                        window.copyToClipboard = (id, button) => {
                            const text = document.getElementById(id).innerText;
                            navigator.clipboard.writeText(text).then(() => {
                                button.querySelector('.copy-icon').style.backgroundColor = '#d1e7dd';
                            });
                        };
                    }
                });
            };
            if (error.response?.data?.status_code === 40001) {
                showRequireQuantityAlert( error.response?.data?.requiredInventory || []);
            } else {
                toast.error("Có lỗi xảy ra khi kiểm tra.");
            }
            onStockCheckingClose();
            setCheckingLoading(false);
        }
    };

    useEffect(() => {
        if (selectedReason != "3") {
            setReason("");
        }
    }, [selectedReason]);

    useEffect(() => {
        if (!faults.errorType) {
            setFaults((prev) => ({ ...prev, solution: null }));
        }
    }, [faults.errorType]);

    // States:
    // errorTypeOptions, solutionOptions, teamBackOptions, rootCauseOptions, returnCodeOptions

    useEffect(() => {
        setErrorTypeOptions(
            errorType?.map((item) => ({
                value: item?.id || "",
                label: item?.name || "",
            }))
        );

        // console.log("errorTypeOptions: ",filteredErrorTypes);

        setSolutionOptions(
            solution?.map((item, index) => ({
                value: item?.id || "",
                label: item?.name || "",
            }))
        );
        setTeamBackOptions(
            teamBack?.map((item) => ({
                value: item?.Code || "",
                label: `${item?.Name} - ${item?.Code}` || "",
            }))
        );
        setRootCauseOptions(
            rootCause?.map((item, index) => ({
                value: item?.id || "",
                label: item?.name || "",
            }))
        );
        setReturnCodeOptions(
            returnCode?.map((item, index) => ({
                value: item?.ItemCode || "",
                label: item?.ItemName || "",
            }))
        );
    }, [type, errorType]);

    return (
        <>
            <div
                className={`bg-white rounded-xl ${
                    variant === "QC"
                        ? " border-2 border-gray-200 !shadow-md"
                        : " border-2 border-gray-200 !shadow-md"
                } `}
            >
                <div className="!px-5 !py-3.5">
                    <Stack mt="1" spacing="4.5px">
                        <div className="flex flex-col">
                            <span className="uppercase text-xs font-semibold text-gray-500">
                                {data?.SubItemName
                                    ? "Bán thành phẩm"
                                    : "Thành phẩm"}
                            </span>
                            <span className="font-bold text-[20px] text-[#155979]">
                                {variant === "QC"
                                    ? data?.SubItemName ||
                                      data?.ItemName ||
                                      "Sản phẩm không xác định"
                                    : data?.ItemName ||
                                      data?.CDay +
                                          "x" +
                                          data?.CRong +
                                          "x" +
                                          data?.CDai ||
                                      "Sản phẩm không xác định"}
                            </span>
                            <div className="flex gap-4">
                                <div className="flex grid-cols-1 items-center space-x-1">
                                    <TbClock className="w-5 h-5 text-gray-500" />
                                    <Text
                                        color="gray.500"
                                        fontWeight="600"
                                        fontSize="sm"
                                        className=""
                                    >
                                        {moment(
                                            data?.created_at,
                                            "YYYY-MM-DD HH:mm:ss"
                                        ).format("HH:mm:ss") || ""}
                                        {"  "}
                                        {moment(
                                            data?.created_at,
                                            "YYYY-MM-DD HH:mm:ss"
                                        ).format("DD/MM/YYYY") || ""}
                                    </Text>
                                </div>
                            </div>
                        </div>
                        <div className=""></div>
                        {type == "plywood" ? (
                            <div className="flex w-full gap-2">
                                <span className="xl:w-[35%] lg:w-[35%] md:w-[35%] w-[40%] text-gray-500">
                                    Mã thành phẩm:{" "}
                                </span>
                                <span className="w-[65%] font-bold">
                                    {data?.ItemCode || "????"}
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="flex">
                                    {data?.SubItemName ? (
                                        <>
                                            <span>Mã bán thành phẩm: </span>
                                            <span className="font-bold">
                                                {data?.SubItemCode || "Không xác định"}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="xl:w-[35%] lg:w-[35%] md:w-[35%] w-[40%] text-gray-600">
                                                Mã thành phẩm:{" "}
                                            </span>
                                            <span className="w-[65%] font-bold">
                                                {data?.ItemCode || "Không xác định"}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="flex ">
                            <span className="xl:w-[35%] lg:w-[35%] md:w-[35%] w-[40%] text-gray-600">
                                Quy cách:{" "}
                            </span>
                            <span className="w-[65%] font-bold">
                                {data?.QuyCach || "0*0*0"}
                            </span>
                        </div>

                        {CongDoan == "TP" && (
                            <div className="flex">
                                <span className="xl:w-[35%] lg:w-[35%] md:w-[35%] w-[40%] text-gray-600">
                                    Mã Thị Trường:{" "}
                                </span>
                                <span className="w-[65%] font-bold">
                                    {data?.MaThiTruong || "Chưa định nghĩa"}
                                </span>
                            </div>
                        )}

                        <div className="flex ">
                            <span className="xl:w-[35%] lg:w-[35%] md:w-[35%] w-[40%] text-gray-600">
                                Số lượng giao:{" "}
                            </span>
                            <span className="w-[65%] font-bold">
                                {Number(data?.Quantity) || 0}
                            </span>
                        </div>

                        {data?.SLDG && (
                            <div className="flex">
                                <span className="xl:w-[35%] lg:w-[35%] md:w-[35%] w-[40%] text-gray-600">
                                    Đã đóng gói:{" "}
                                </span>
                                <span className="w-[65%] font-bold">
                                    {Number(data?.SLDG) || 0}
                                </span>
                            </div>
                        )}

                        <div className="flex ">
                            <span className="xl:w-[35%] lg:w-[35%] md:w-[35%] w-[40%] text-gray-600">
                                Giao từ:{" "}
                            </span>
                            <span className="w-[65%] font-bold">
                                {data?.CongDoan || "Không xác định"}
                            </span>
                        </div>

                        <div className="w-full flex duration-300">
                            <span className="xl:w-[35%] lg:w-[35%] md:w-[35%] w-[40%] text-gray-600">
                                Người giao:
                            </span>
                            <span className="w-[65%] font-bold text-[#155979]">
                                {data?.last_name + " " + data?.first_name}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 space-x-3 mt-1">
                            <div className="items-center gap-x-4">
                                <label
                                    htmlFor="errorType"
                                    className="font-semibold"
                                >
                                    Năm
                                </label>
                                <input
                                    className="mt-1 border p-1.5 rounded-md border-gray-300 focus:border-indigo-600 focus:outline-none w-full px-3"
                                    id="yearInput"
                                    placeholder="yyyy"
                                    value={faults.year}
                                    onChange={(e) => {
                                        setFaults((prev) => ({
                                            ...prev,
                                            year: e.target.value,
                                        }));
                                    }}
                                />
                            </div>
                            <div className="items-center gap-x-4">
                                <label
                                    htmlFor="errorType"
                                    className="font-semibold"
                                >
                                    Tuần
                                </label>
                                <Select
                                    ref={rootCauseRef}
                                    className="w-full mt-1"
                                    placeholder="Lựa chọn"
                                    options={weekOptions}
                                    isSearchable
                                    value={faults.week}
                                    onChange={(value) => {
                                        setFaults((prev) => ({
                                            ...prev,
                                            week: value,
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                    </Stack>
                </div>

                {/*  */}
                {isQualityCheck && !isReturnSelect && (
                    <>
                        <Box className=" px-4">
                            <label
                                htmlFor="errorType"
                                className="font-semibold text-red-700"
                            >
                                QC ghi nhận số lượng lỗi *
                            </label>
                            <input
                                className="mt-1 border p-1.5 rounded-md border-gray-300 focus:border-indigo-600 focus:outline-none w-full px-3"
                                id="Qty"
                                type="number"
                                placeholder="Nhập số lượng"
                                onChange={(e) => {
                                    setFaults((prev) => ({
                                        ...prev,
                                        Qty: e.target.value,
                                    }));
                                }}
                            />
                        </Box>
                        <Box className="mt-3 px-4">
                            <label
                                htmlFor="errorType"
                                className="font-semibold text-red-700"
                            >
                                Loại lỗi *
                            </label>
                            <Select
                                ref={errorTypeRef}
                                className="mt-1"
                                placeholder="Lựa chọn"
                                options={errorTypeOptions}
                                isClearable
                                isSearchable
                                value={faults.errorType}
                                onChange={(value) => {
                                    setFaults((prev) => ({
                                        ...prev,
                                        errorType: value,
                                    }));
                                }}
                            />
                        </Box>
                        <Box className="mt-3 px-4">
                            <label
                                htmlFor="errorType"
                                className="font-semibold text-red-700"
                            >
                                Ghi chú
                            </label>
                            <input
                                className="mt-1 border p-1.5 rounded-md border-gray-300 focus:border-indigo-600 focus:outline-none w-full px-3"
                                id="Note"
                                placeholder="Nhập ghi chú"
                                onChange={(e) => {
                                    setFaults((prev) => ({
                                        ...prev,
                                        Note: e.target.value,
                                    }));
                                }}
                            />
                        </Box>
                        <Box className="px-4 mt-4 mb-4">
                            <label
                                htmlFor="solution"
                                className="font-semibold text-red-700"
                            >
                                Hướng xử lý *
                            </label>
                            <Select
                                ref={solutionRef}
                                className="mt-1"
                                placeholder="Lựa chọn"
                                options={solutionOptions}
                                isClearable
                                isSearchable
                                value={faults.solution}
                                onChange={(value) => {
                                    if (!faults.errorType) {
                                        setFaults((prev) => ({
                                            ...prev,
                                            solution: null,
                                        }));
                                        toast("Vui lòng chọn loại lỗi.");
                                    } else {
                                        setFaults((prev) => ({
                                            ...prev,
                                            solution: value,
                                        }));
                                    }
                                }}
                            />
                        </Box>
                        <Box className="px-4 mt-2 mb-4">
                            <label
                                htmlFor="teamBack"
                                className="font-semibold text-red-700"
                            >
                                Tổ chuyển về *
                            </label>
                            <Select
                                ref={teamBackRef}
                                className="mt-1"
                                placeholder="Lựa chọn"
                                options={teamBackOptions}
                                isClearable
                                isSearchable
                                value={faults.teamBack}
                                onChange={(value) => {
                                    setFaults((prev) => ({
                                        ...prev,
                                        teamBack: value,
                                    }));
                                }}
                            />
                        </Box>
                        <Box
                            className="px-4 mt-2 mb-4"
                            style={{ display: "flex", flexDirection: "column" }}
                        >
                            <div>
                                <div className="font-semibold text-red-700">
                                    Tổ gây ra lỗi
                                </div>
                                <Select
                                    ref={rootCauseRef}
                                    className="mt-1 w-full"
                                    placeholder="Lựa chọn"
                                    options={teamBackOptions}
                                    isClearable
                                    isSearchable
                                    value={faults.rootCause}
                                    onChange={(value) => {
                                        setFaults((prev) => ({
                                            ...prev,
                                            rootCause: value,
                                        }));
                                    }}
                                />
                            </div>
                            <div className="mt-4">
                                <div className="font-semibold text-red-700">
                                    Mã hạ cấp.
                                </div>
                                <Select
                                    ref={returnCodeRef}
                                    className="mt-1 w-full"
                                    placeholder="Lựa chọn"
                                    options={returnCodeOptions}
                                    isClearable
                                    isSearchable
                                    value={faults.returnCode}
                                    onChange={(value) => {
                                        setFaults((prev) => ({
                                            ...prev,
                                            returnCode: value,
                                        }));
                                    }}
                                />
                            </div>
                        </Box>
                    </>
                )}

                <Divider />
                <div className="!px-4 py-3">
                    <div className="flex flex-col">
                        <RadioGroup
                            onChange={(value) => {
                                setSelectedReason(value);
                                setIsReturnSelect(true);
                            }}
                            value={selectedReason}
                        >
                            <Stack direction="row">
                                {reasonOfReturn &&
                                    reasonOfReturn?.length > 0 &&
                                    reasonOfReturn.map((item, index) => (
                                        <div
                                            className="flex gap-2 cursor-pointer"
                                            key={index + item.value}
                                            onClick={() => {
                                                if (
                                                    item.value == selectedReason
                                                ) {
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
                                        </div>
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
                </div>

                <Divider />
                <div className="flex space-x-3 justify-center text-center w-full p-[20px]">
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
                        className="bg-[#e53e3e] w-full"
                        onClick={onDismissAlertDialogOpen}
                        backgroundColor="red !important"
                    >
                        Trả lại
                    </Button>
                    <Button
                        isDisabled={selectedReason}
                        variant="solid"
                        colorScheme="green"
                        className="bg-[#38a169] w-full"
                        onClick={onInputAlertDialogOpen}
                        backgroundColor="#2f855a !important"
                    >
                        Xác nhận
                    </Button>
                    {user?.role == 1 && variant !== "QC" && (
                        <Button
                            variant="solid"
                            colorScheme="blue"
                            className="bg-[#3854a1] w-full"
                            onClick={onStockCheckingOpen}
                            backgroundColor="#3854a1 !important"
                        >
                            Kiểm tra
                        </Button>
                    )}
                </div>
            </div>
            {/* Receipt Dialog */}
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
                                {variant == "QC" ? (
                                    <>
                                        ghi nhận{" "}
                                        <span className="font-bold">
                                            {Number(faults?.Qty) || ""}
                                        </span>{" "}
                                        lỗi từ{" "}
                                    </>
                                ) : (
                                    <>
                                        xác nhận{" "}
                                        <span className="font-bold">
                                            {Number(data?.Quantity) || ""}
                                        </span>{" "}
                                    </>
                                )}
                                sản phẩm{" "}
                                <span className="font-bold">
                                    {data?.SubItemName || data?.ItemName}
                                </span>
                                {faults && faults.errorType && (
                                    <span>
                                        {" "}
                                        với lý do{" "}
                                        <b>{faults.errorType.label}</b>
                                    </span>
                                )}
                                {faults && faults.solution && (
                                    <span>
                                        {" "}
                                        và hướng xử lý{" "}
                                        <b>{faults.solution.label}</b>
                                    </span>
                                )}
                                ?
                            </div>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <div className="flex gap-4">
                                <Button
                                    className="bg-[#edf2f7]"
                                    onClick={onInputAlertDialogClose}
                                    isDisabled={acceptLoading}
                                >
                                    Thoát
                                </Button>
                                <button
                                    disabled={acceptLoading}
                                    className="w-fit bg-[#38a169] p-2 font-semibold rounded-lg text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
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
            {/* Return Dialog */}
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
            {/* Stock Checking Dialog */}
            <Modal
                isOpen={isStockCheckingOpen}
                onClose={onStockCheckingClose}
                isCentered
                closeOnOverlayClick={false}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Kiểm tra nguyên vật liệu</ModalHeader>
                    <ModalBody>
                        Hệ thống sẽ kiểm tra nguyên vật liệu xem có đủ để ghi
                        nhận sản phẩm này hay không.
                    </ModalBody>

                    <ModalFooter>
                        <div className="flex gap-4">
                            <Button
                                className="bg-[#edf2f7]"
                                onClick={onStockCheckingClose}
                                isDisabled={checkingLoading}
                            >
                                Thoát
                            </Button>
                            <button
                                disabled={checkingLoading}
                                className="w-fit bg-black p-2 font-semibold rounded-lg text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                onClick={handleCheckingReceipt}
                            >
                                {checkingLoading ? (
                                    <div className="flex items-center space-x-4">
                                        <Spinner size="sm" color="white" />
                                        <div>Đang tải</div>
                                    </div>
                                ) : (
                                    "Xác nhận"
                                )}
                            </button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AwaitingReception;
