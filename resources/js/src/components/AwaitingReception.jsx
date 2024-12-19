import React, { useState, useEffect, useRef } from "react";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
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
            });
        };
    
        const checkAndDisplayError = (errorMessage) => {
            toast.error(errorMessage);
            onInputAlertDialogClose();
        };

        console.log("Số lượng lỗi:", faults.Qty, data?.Quantity, variant);
    
        if ((!faults.Qty || faults.Qty <= 0) && variant === "QC") {
            checkAndDisplayError("Số lượng lỗi phải lớn hơn 0.");
        } else if ((parseInt(faults.Qty) > parseInt(data?.Quantity)) && variant === "QC") {
            checkAndDisplayError("Số lượng lỗi không được lớn hơn số lượng ghi nhận.");
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
                const errorMessage = error.response?.data?.error?.message?.value || error.response?.data?.message || error.response?.data?.error;
                showErrorAlert(`${errorMessage? errorMessage : "Lỗi kết nối mạng."}`);
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

    const [isReturnSelect, setIsReturnSelect] = useState(false);

    const [errorTypeOptions, setErrorTypeOptions] = useState([]);
    const [solutionOptions, setSolutionOptions] = useState([]);
    const [teamBackOptions, setTeamBackOptions] = useState([]);
    const [rootCauseOptions, setRootCauseOptions] = useState([]);
    const [returnCodeOptions, setReturnCodeOptions] = useState([]);
    const [weekOptions, setWeekOptions] = useState(weeks);

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
        setErrorTypeOptions(errorType?.map((item) => ({
            value: item?.id || "",
            label: item?.name || "",
        })));

        // console.log("errorTypeOptions: ",filteredErrorTypes);

        setSolutionOptions(solution?.map((item, index) => ({
            value: item?.id || "",
            label: item?.name || "",
        })));
        setTeamBackOptions(teamBack?.map((item, index) => ({
            value: item?.Code || "",
            label: item?.Name || "",
        })));
        setRootCauseOptions(rootCause?.map((item, index) => ({
            value: item?.id || "",
            label: item?.name || "",
        })));
        setReturnCodeOptions(returnCode?.map((item, index) => ({
            value: item?.ItemCode || "",
            label: item?.ItemName || "",
        })));
    }, [type, errorType]);

    return (
        <>
            <div
                className={`bg-[#F7F7F7] rounded-xl ${
                    variant === "QC"
                        ? " border-2 border-gray-200 !shadow-md"
                        : " border-2 border-gray-200 !shadow-md"
                } `}
            >
                <div className="!px-4 !py-3">
                    <Stack mt="1" spacing="1">
                        <div className="flex gap-2">
                            {/* <span>Tên: </span> */}
                            <span className="font-bold text-[19px] text-[#155979]">
                                {variant === "QC" ? (
                                    data?.SubItemName || data?.ItemName || "Sản phẩm không xác định"
                                ) : (
                                    data?.ItemName || (data?.CDay + "x" + data?.CRong + "x" + data?.CDai) || "Sản phẩm không xác định"
                                )}
                            </span>
                            <span></span>
                        </div>

                        {type == "plywood" ? (
                            <div className="flex gap-2">
                                <span>Mã thành phẩm: </span>
                                <span className="font-bold">
                                    {data?.ItemCode || "????"}
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    {data?.SubItemName ? (
                                        <>
                                            <span>Mã bán thành phẩm: </span>
                                            <span className="font-bold">
                                                {data?.SubItemCode || "???"}
                                            </span>
                                        </>
                                        
                                    ) : (
                                        <>
                                            <span>Mã thành phẩm: </span>
                                            <span className="font-bold">
                                                {data?.ItemCode || "????"}
                                            </span>
                                        </>
                                    )} 
                                    <span className="font-bold text-gray-500 pentagon-container">{data?.MaThiTruong? "- " + data.MaThiTruong : ""}</span>
                                </div>
                            </>
                        )}

                        <div className="flex gap-2">
                            <span>Quy cách: </span>
                            <span className="font-bold">
                                {data?.QuyCach || "0*0*0"}
                            </span>
                        </div>

                        {CongDoan == "TP" && (<div className="flex gap-2">
                            <span>Mã Thị Trường: </span>
                            <span className="font-bold">
                                {data?.MaThiTruong || "Chưa định nghĩa"}
                            </span>
                        </div>)}

                        <div className="flex gap-2">
                            <span>Công đoạn giao: </span>
                            <span className="font-bold">
                                {data?.CongDoan || "Không xác định"}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <span>Số lượng giao: </span>
                            <span className="font-bold">
                                {Number(data?.Quantity) || 0}
                            </span>
                        </div>

                        {data?.SLDG && (<div className="flex gap-2">
                            <span>Số lượng đã đóng gói chờ giao: </span>
                            <span className="font-bold">
                                {Number(data?.SLDG) || 0}
                            </span>
                        </div>)}

                        <span className="rounded-lg cursor-pointer px-2 py-2 text-white bg-[#155979] hover:bg-[#1A6D94] duration-300">
                            Người tạo:{" "}
                            <span className="font-medium">
                                {data?.last_name + " " + data?.first_name}
                            </span>
                        </span>

                        <div className="grid grid-cols-2">
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
                        </div>

                        <div className="grid grid-cols-2 space-x-3">
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
                                    Nguồn lỗi
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
                                // if (value == selectedReason) {
                                //     console.log("Dô 1: ", value);
                                //     setSelectedReason(null);
                                // } else {
                                setSelectedReason(value);
                                setIsReturnSelect(true);
                                // }
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
                        isDisabled={selectedReason}
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
                                {variant == "QC" ? (
                                    <>
                                        ghi nhận <span className="font-bold">
                                        {Number(faults?.Qty) || ""}
                                        </span>{" "} lỗi từ {" "}
                                    </>
                                ) : (
                                    <>
                                        xác nhận <span className="font-bold">
                                            {Number(data?.Quantity) || ""}
                                        </span>{" "}
                                    </> 
                                )}
                                sản phẩm <span className="font-bold">{data?.SubItemName || data?.ItemName}</span>
                                {faults && faults.errorType && (
                                    <span>
                                         {" "}với lý do{" "}
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
