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
import Select from "react-select";
import { MdRefresh } from "react-icons/md";
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
    isQualityCheck,
    onConfirmReceipt,
    onRejectReceipt,
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

    const handleConfirmReceipt = async () => {
        setAcceptLoading(true);
        try {
            const payload = {
                id: data?.id,
                loailoi: faults.errorType || null,
                huongxuly: faults.solution || null,
                teamBack: faults.teamBack || null,
                rootCause: faults.rootCause || null,
                subCode: faults.subCode || null,
                year: faults.year || null,
                week: faults.week?.value || null,
            };
            if (payload.id) {
                switch (type) {
                    case "plywood":
                        const res1 = await productionApi.acceptReceiptsVCN(
                            payload
                        );
                        break;
                    default:
                        const res2 = await productionApi.acceptReceiptsCBG(
                            payload
                        );
                        break;
                }
                onConfirmReceipt(data?.id);
                onInputAlertDialogClose();
                // toast.success("Xác nhận thành công.");
            } else {
                toast.error("Có lỗi xảy ra. Vui lòng thử lại");
            }
        } catch (error) {
            // toast.error("Có lỗi xảy ra khi xác nhận.");
            console.log("Error when confirming receipt:", error);
            console.log("Chi tiết lỗi:", error.response.data.error.message.value);     
            onInputAlertDialogClose();
            Swal.fire({
                title: "Có lỗi khi xác nhận.",
                html: `
                <p>Chi tiết lỗi:<br></p>
                    <p> 
                        ${error.response.data.error.message.value ? "<li> Lỗi từ SAP: " + error.response.data.error.message.value + "</li>" : "<li> Lỗi từ SAP: " + error.response.data.message + "</li>"}
                    </p>
                `,
                icon: "error",
                zIndex: 50001,
            });
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
                            const res1 = await productionApi.rejectReceiptsCBG(
                                payload
                            );
                            break;
                        default:
                            const res2 = await productionApi.rejectReceiptsVCN(
                                payload
                            );
                            break;
                    }

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

    const [isReturnSelect, setIsReturnSelect] = useState(false);

    const [errorTypeOptions, setErrorTypeOptions] = useState([]);
    const [solutionOptions, setSolutionOptions] = useState([]);
    const [teamBackOptions, setTeamBackOptions] = useState([]);
    const [rootCauseOptions, setRootCauseOptions] = useState([]);
    const [returnCodeOptions, setReturnCodeOptions] = useState([]);
    const [weekOptions, setWeekOptions] = useState(weeks);

    const [faults, setFaults] = useState({
        errorType: null,
        solution: null,
        teamBack: null,
        rootCause: null,
        returnCode: null,
        year: new Date().getFullYear(),
        week: {
            value: getCurrentWeekNumber(),
            label: `Tuần ${getCurrentWeekNumber()}`,
        },
    });

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

    useEffect(() => {
        const getErrorTypeOptions = async () => {
            try {
                const res = await productionApi.getErrorTypes();
                const errorTypes = res.map((error, index) => ({
                    value: error?.id || "",
                    label: error?.name || "",
                }));
                // console.log("Other side: ", errorTypes);
                setErrorTypeOptions(errorTypes);
            } catch (error) {
                console.error(error);
            }
        };
        const getSolutionOptions = async () => {
            try {
                const res = await productionApi.getSolutions("CBG");
                const solutions = res.map((solution, index) => ({
                    value: solution?.id || "",
                    label: solution?.name || "",
                }));
                // console.log("Other side 2: ", solutions);
                setSolutionOptions(solutions);
            } catch (error) {
                console.error(error);
            }
        };
        const getTeamBackOptions = async () => {
            try {
                const res = await productionApi.getTeamBacks();
                const teamBacks = res.map((teamBack, index) => ({
                    value: teamBack?.Code || "",
                    label: teamBack?.Name || "",
                }));
                setTeamBackOptions(teamBacks);
            } catch (error) {
                console.error(error);
            }
        };
        const getRootCauseOptions = async () => {
            try {
                const res = await productionApi.getRootCauses();
                const rootCauses = res.map((rootCause, index) => ({
                    value: rootCause?.id || "",
                    label: rootCause?.name || "",
                }));
                setRootCauseOptions(rootCauses);
            } catch (error) {
                console.error(error);
            }
        };
        const getReturnCode = async () => {
            try {
                const res = await productionApi.getReturnCode();
                const returnCodes = res.map((returnCode, index) => ({
                    value: returnCode?.ItemCode || "",
                    label: returnCode?.ItemName || "",
                }));
                setReturnCodeOptions(returnCodes);
            } catch (error) {
                console.error(error);
            }
        };

        getErrorTypeOptions();
        getSolutionOptions();
        getTeamBackOptions();
        getRootCauseOptions();
        getReturnCode();
    }, []);

    return (
        <>
            <Card maxW="sm" className="!shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
                <CardBody className="!px-4 !pb-3">
                    <Stack mt="2" spacing="2.5">
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

                        <span className="rounded-lg cursor-pointer px-2 py-2 text-white bg-[#155979] hover:bg-[#1A6D94] duration-300">
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
                        <div className="flex items-center gap-x-4">
                            <Text color="blue.600" fontSize="md">
                                Năm:
                            </Text>
                            <input
                                className="border p-1 rounded-md border-indigo-600 focus:border-indigo-600 focus:outline-none w-2/5 px-3"
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
                        <div className="flex items-center gap-x-4">
                                <Text color="blue.600" fontSize="md">
                                    Tuần:
                                </Text>
                                <Select
                                    ref={rootCauseRef}
                                    className="w-full"
                                    placeholder="Lựa chọn"
                                    options={weekOptions}
                                    isClearable
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
                    </Stack>
                </CardBody>

                {isQualityCheck && !isReturnSelect && (
                    <>
                        <Box className="mt-2 px-4">
                            <label
                                htmlFor="errorType"
                                className="font-semibold text-red-700"
                            >
                                Loại lỗi
                            </label>
                            <Select
                                ref={errorTypeRef}
                                className="mt-2"
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
                                    setFaults((prev) => ({
                                        ...prev,
                                        errorType: value,
                                    }));
                                }}
                            />
                        </Box>
                        <Box className="px-4 mt-4 mb-4">
                            <label
                                htmlFor="solution"
                                className="font-semibold text-red-700"
                            >
                                Hướng xử lý
                            </label>
                            <Select
                                ref={solutionRef}
                                className="mt-2"
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
                                Tổ chuyển về.
                            </label>
                            <Select
                                ref={teamBackRef}
                                className="mt-2"
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
                                    Nguồn lỗi.
                                </div>
                                <Select
                                    ref={rootCauseRef}
                                    className="mt-2 w-full"
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
                                    className="mt-2 w-full"
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
                <CardFooter className="!px-4">
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
                                                    // console.log(
                                                    //     "Dô 2",
                                                    //     selectedReason
                                                    // );
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
                </CardFooter>

                <Divider />
                <ButtonGroup spacing="2" className="flex justify-end p-[20px]">
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
                                sản phẩm
                                {/* {faults &&
                                    (
                                        faults.errorType &&
                                        ` với lý do ` + <b>{faults.errorType.label}</b>
                                    )} */}
                                {faults && faults.errorType && (
                                    <span>
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
