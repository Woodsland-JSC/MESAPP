import React, { useState, useMemo, useEffect } from "react";
import palletsApi from "../api/palletsApi";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
} from "@chakra-ui/react";
import {
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from "@chakra-ui/react";
import { RiWaterPercentFill } from "react-icons/ri";
import { FaPlus } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { LuCalendarRange } from "react-icons/lu";
import { LuFlagTriangleRight } from "react-icons/lu";
import { LuWarehouse } from "react-icons/lu";
import { LuKeyRound } from "react-icons/lu";
import { LuStretchHorizontal } from "react-icons/lu";
import { MdWaterDrop } from "react-icons/md";
import { HiMiniSparkles } from "react-icons/hi2";
import { MdNoteAlt } from "react-icons/md";
import { HiOutlineTrash } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import { addDays, format, add } from "date-fns";
import compareDesc from "date-fns/compareDesc/index.js";
import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import { BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { Spinner } from "@chakra-ui/react";
import { bg } from "date-fns/locale";
import { use } from "react";

function HumidityCheck(props) {
    const { planID, code, oven, reason, humidList, onCallback } = props;
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isCompleteOpen,
        onOpen: onCompleteOpen,
        onClose: onCompleteClose,
    } = useDisclosure();
    const {
        isOpen: isDetailOpen,
        onOpen: onDetailOpen,
        onClose: onDetailClose,
    } = useDisclosure();

    const [loadCurrentRecord, setLoadCurrentRecord] = useState(true);
    const [humidityRecords, setHumidityRecords] = useState([]);
    const [recordsList, setRecordsList] = useState([]);
    const [humidityInput, setHumidityInput] = useState(0);
    const [selectedOption, setSelectedOption] = React.useState("0");
    const [anotherOption, setAnotherOption] = React.useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isCheckingComplete, setIsCheckingComplete] = useState(false);

    const handleRecordClick = (record) => {
        setSelectedRecord(record);
        onDetailOpen();
    };

    const checkHumidityRequirement = () => {
        if (reason === "INDOOR") {
            return (
                humidityAnalysis[0].percentage +
                humidityAnalysis[1].percentage >=
                85
            );
        } else if (reason === "OUTDOOR") {
            const outdoorHighCount = humidityRecords.filter((record) => record.value < 14).length;
            const outdoorHighPercentage = (outdoorHighCount / humidityRecords?.length) * 100;
            return outdoorHighPercentage >= 85;
        }

        if (reason && reason.substring(0, 2) == 'SL') {
            if (reason == 'SLIN') {
                return (humidityAnalysis[0].percentage + humidityAnalysis[1].percentage >= 85);
            } else {
                const outdoorHighCount = humidityRecords.filter((record) => record.value < 14).length;
                const outdoorHighPercentage = (outdoorHighCount / humidityRecords?.length) * 100;
                return outdoorHighPercentage >= 85;
            }
        }

        return false
    };

    const getHumidityRanges = (reason) => {
        if (reason === "OUTDOOR") {
            return {
                low: { min: -Infinity, max: 8, label: "Thấp (<8)" },
                target: { min: 8, max: 13, label: "Đích (8-13)" },
                high: { min: 14, max: 17, label: "Cao (14-17)" },
                veryHigh: {
                    min: 17,
                    max: Infinity,
                    label: "Rất cao (>17)",
                },
            };
        }
        return {
            low: { min: -Infinity, max: 7, label: "Thấp (<7)" },
            target: { min: 7, max: 9, label: "Đích (7-9)" },
            high: { min: 10, max: 15, label: "Cao (10-15)" },
            veryHigh: { min: 15, max: Infinity, label: "Rất cao (>15)" },
        };
    };

    const analyzeHumidity = (records, reason) => {
        const ranges = getHumidityRanges(reason);
        const total = records.length;

        const low = records?.filter(
            (record) => record.value < ranges.low.max
        ).length;
        const target = records?.filter(
            (record) =>
                record.value >= ranges.target.min &&
                record.value <= ranges.target.max
        ).length;
        const high = records?.filter(
            (record) =>
                record.value >= ranges.high.min &&
                record.value <= ranges.high.max
        ).length;
        const veryHigh = records?.filter(
            (record) => record?.value > ranges.veryHigh.min
        ).length;

        return [
            {
                label: ranges.low.label,
                shortLabel: `(<${ranges.low.max})`,
                count: low,
                percentage: (low / total) * 100,
                bgColor: "#22253d",
            },
            {
                label: ranges.target.label,
                shortLabel: `(${ranges.target.min}-${ranges.target.max})`,
                count: target,
                percentage: (target / total) * 100,
                bgColor: "#2d3254",
            },
            {
                label: ranges.high.label,
                shortLabel: `(${ranges.high.min}-${ranges.high.max})`,
                count: high,
                percentage: (high / total) * 100,
                bgColor: "#3f4477",
            },
            {
                label: ranges.veryHigh.label,
                shortLabel: `(>${ranges.veryHigh.min})`,
                count: veryHigh,
                percentage: (veryHigh / total) * 100,
                bgColor: "#48519c",
            },
        ];
    };

    // Updated useMemo hooks
    const humidityAnalysis = useMemo(() => {
        return analyzeHumidity(humidityRecords, reason);
    }, [humidityRecords, reason]);

    const selectedAnalysis = useMemo(() => {
        if (!selectedRecord || !selectedRecord.detail) {
            return [];
        }
        return analyzeHumidity(selectedRecord.detail, reason);
    }, [selectedRecord, reason]);

    const loadHumidRecordList = async () => {
        palletsApi
            .getHumidListById(planID)
            .then((response) => {
                setRecordsList(response);
            })
            .catch((error) => {
                console.error("Lỗi khi gọi API:", error);
            });
    };

    const loadCurrentHumidRecords = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const planID = queryParams.get("id");
        try {
            const response = await palletsApi.getTempHumidRecords(planID, "DA");
            setHumidityRecords(response.TempData);
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        } finally {
            setLoadCurrentRecord(false);
        }
    };

    useEffect(() => {
        loadHumidRecordList();
        loadCurrentHumidRecords();
    }, []);

    const handleRecord = async () => {
        const recordData = {
            PlanID: planID,
            value: humidityInput,
        };

        if (humidityInput === 0) {
            toast.error("Giá trị độ ẩm không được bỏ trống.");
            return;
        }

        try {
            const response = await palletsApi.addHumidRecord(recordData);
            await setHumidityRecords(response.humiditys);
            toast.success("Giá trị độ ẩm đã được ghi nhận");
            setHumidityInput(0);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleDelete = async (recordId) => {
        const deleteData = {
            PlanID: planID,
            ID: recordId,
        };

        try {
            const response = await palletsApi.removeHumidRecord(deleteData);
            await setHumidityRecords(response.humiditys);
            toast("Đã xóa khỏi danh sách");
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleComplete = () => {
        if (humidityRecords.length === 0) {
            toast.error("Hãy ghi nhận độ ẩm trước khi hoàn thành");
        } else if (humidityRecords.length < 50) {
            toast.error("Phải có ít nhất 50 mẫu thử trước khi hoàn thành.");
        } else {
            checkHumidityRequirement();
            onCompleteOpen();
        }
    };

    const result =
        reason === "INDOOR"
            ? humidityAnalysis[0].percentage + humidityAnalysis[1].percentage
            : reason === "OUTDOOR"
                ? humidityAnalysis[0].percentage + humidityAnalysis[1].percentage
                : "";

    const requirementMetHandle = () => {
        const body = {
            PlanID: planID,
            rate: "",
            option: "RL",
            note: "Đủ điều kiện ra lò.",
        };

        let result = "";
        if (reason && reason.substring(0, 2) == 'SL') {
            if (reason == 'SLIN') {
                result = (humidityAnalysis[0].percentage + humidityAnalysis[1].percentage);
            } else {
                result = humidityAnalysis[0].percentage + humidityAnalysis[1].percentage;
            }
        } else {
            result = (reason === "INDOOR" ? humidityAnalysis[0].percentage + humidityAnalysis[1].percentage
                : reason === "OUTDOOR" ? humidityAnalysis[0].percentage + humidityAnalysis[1].percentage : "");
        }

        body.rate = result;

        if(!result || result == ''){
            toast.error("Thiếu tỉ lệ");
            return;
        }

        palletsApi
            .completeHumidRecord(body)
            .then((response) => {
                if (response.message === "success") {
                    setRecordsList(response.humiditys);
                    toast.success("Đã duyệt ra lò");
                    loadHumidRecordList();
                    if (typeof onCallback === "function") {
                        onCallback();
                    }
                    onCompleteClose();
                    onClose();
                } else {
                    toast.error("Hệ thống đang gặp vấn đề. Không thể ra lò.");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    const validateFailed = () => {
        if (selectedOption === "") {
            toast.error("Hãy chọn một phương án giải quyết.");
            return false;
        } else if (
            selectedOption === "SL" &&
            (anotherOption === null ||
                anotherOption === undefined ||
                anotherOption.trim() === "")
        ) {
            toast.error("Hãy nhập ghi chú trước khi xác nhận.");
            return false;
        } else {
            return true;
        }
    };

    const requirementFailedHandle = () => {
        if (validateFailed()) {
            const body = {
                PlanID: planID,
                rate: result,
                option: selectedOption,
                note: !anotherOption ? anotherOption : "Sấy lại",
            };

            palletsApi
                .completeHumidRecord(body)
                .then((response) => {
                    if (response.message === "success") {
                        console.log("Kết quả trả về: ", response);
                        setRecordsList(response.humiditys);
                        toast.success("Lưu lại giá trị thành công.");
                        setSelectedOption("");
                        setAnotherOption("");
                        setHumidityRecords([]);
                        loadHumidRecordList();
                        if (typeof onCallback === "function") {
                            onCallback();
                        }
                        onCompleteClose();
                        onClose();
                    } else {
                        toast.error(
                            "Hệ thống đang gặp vấn đề. Hãy thử lại sau"
                        );
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        }
    };

    useEffect(() => {
        console.log("Mục đích sấy hiện tại là: ", reason)
    }, [reason]);

    return (
        <div className="bg-white rounded-xl border-2 border-gray-300">
            {/* Header */}
            <div className="flex justify-between items-center px-3 pr-4 py-3 font-medium border-b border-gray-200">
                <div className="flex items-center gap-x-3">
                    <div className="w-8 h-8">
                        <RiWaterPercentFill className="w-full h-full text-[#17506B]" />
                    </div>
                    <div className="serif font-bold leading-[26px] xl:text-2xl xl:w-full w-[70%] text-[23px]">
                        Danh sách biên bản kiểm tra độ ẩm
                    </div>
                </div>
                <button
                    onClick={onOpen}
                    className="bg-gray-800 flex items-center space-x-3 p-2 rounded-xl text-white xl:px-4 active:scale-[.95] h-fit w-fit active:duration-75 transition-all"
                >
                    <FaPlus />
                    <div className="xl:flex hidden">Tạo mới</div>
                </button>
            </div>

            {/* Create Modal */}
            <Modal
                closeOnOverlayClick={false}
                isOpen={isOpen}
                onClose={onClose}
                scrollBehavior="inside"
                size="full"
                className=""
            >
                <ModalOverlay />
                <ModalContent>
                    <div className="top-0 sticky z-20 bg-white border-b-2 border-gray-200">
                        <ModalHeader>
                            <div className=" serif font-bold text-xl xl:text-2xl ">
                                Biểu mẫu kiểm tra độ ẩm gỗ sấy
                            </div>
                        </ModalHeader>
                        <ModalCloseButton />
                    </div>

                    <ModalBody className="!p-3.5 !py-1 bg-[#FAFAFA]">
                        <section className="flex flex-col justify-center ">
                            {/* Infomation */}
                            <div className="xl:mx-auto text-base xl:w-[60%] border-2 mt-4 border-gray-200 rounded-xl divide-y divide-gray-200 bg-white mb-4">
                                <div className="flex gap-x-4 bg-gray-100 rounded-t-xl items-center p-4 xl:px-3 lg:px-3 md:px-3">
                                    <FaInfoCircle className="w-7 h-7 text-[]" />
                                    <div className="text-xl font-semibold">
                                        Thông tin chung
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 p-3 xl:px-8 lg:px-8 md:px-8">
                                    <div className=" flex font-semibold items-center">
                                        <LuCalendarRange className="w-5 h-5 mr-3" />
                                        Ngày kiểm tra:
                                    </div>
                                    <span className=" text-base ">
                                        {format(new Date(), "yyyy-MM-dd")}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 p-3 xl:px-8 lg:px-8 md:px-8">
                                    <div className="font-semibold flex items-center">
                                        <LuStretchHorizontal className="w-5 h-5 mr-3" />
                                        Mẻ sấy số:
                                    </div>
                                    <span className="font-normal text-base ">
                                        {code}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 p-3 xl:px-8 lg:px-8 md:px-8">
                                    <div className="font-semibold flex items-center">
                                        <LuWarehouse className="w-5 h-5 mr-3" />
                                        Địa điểm:
                                    </div>
                                    <span className="font-normal text-base ">
                                        {oven}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 p-3 xl:px-8 lg:px-8 md:px-8">
                                    <div className="font-semibold flex items-center">
                                        <LuKeyRound className="w-5 h-5 mr-3" />
                                        Đơn vị quản lý:
                                    </div>
                                    <span className="font-normal text-base ">
                                        TQ
                                    </span>
                                </div>
                            </div>

                            {/* <div className="xl:mx-auto text-base xl:w-[60%]  border-b-2 border-gray-100 my-4"></div> */}

                            {/* Humid Range */}
                            <div className="xl:mx-auto xl:w-[60%] rounded-xl bg-[#22253d] divide-y-2 divide-[#2B384B] mb-3">
                                <div className="flex gap-x-4 justify-between text-white rounded-xl items-center p-3 xl:px-4 lg:px-4 md:px-4">
                                    <div className="flex items-center gap-x-4">
                                        <MdWaterDrop className="w-8 h-8 text-blue-300" />
                                        <div className="text-xl font-semibold">
                                            Phân bố độ ẩm
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-x-4">
                                        <div className="p-2 px-4 rounded-full bg-[#33395C]">
                                            {reason}
                                        </div>
                                    </div>
                                </div>
                                <div className="">
                                    {/* Header */}
                                    <div className="bg-[#22253d]">
                                        <table className="min-w-full divide-y-2 divide-[#2B384B]  ">
                                            <thead>
                                                <tr className="w-full">
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left  text-base w-[40%] font-medium text-[#D2D6FF]  uppercase"
                                                    >
                                                        Độ ẩm (MC%)
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left  text-base w-[25%] font-medium text-[#D2D6FF]  uppercase"
                                                    >
                                                        SL Mấu
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left  text-base xl:w-[35%] w-fit font-medium text-[#D2D6FF]  uppercase"
                                                    >
                                                        Tỉ lệ
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className=" ">
                                                {humidityAnalysis?.map(
                                                    (data, index) => (
                                                        <tr
                                                            className={`w-full bg-[${data.bgColor}]`}
                                                        >
                                                            <td className="flex px-6 py-3 whitespace-nowrap w-[40%] font-medium text-[#D2D6FF] text-left">
                                                                {
                                                                    data?.label.split(
                                                                        "("
                                                                    )[0]
                                                                }{" "}
                                                                {/* <span className="xl:inline-block hidden">
                                                                    ({data.label.split("(")[1]})
                                                                </span> */}
                                                                <span className="inline-block ml-1 ">
                                                                    {
                                                                        data?.shortLabel
                                                                    }
                                                                </span>
                                                                {data?.label.includes(
                                                                    "Đích"
                                                                ) && (
                                                                        <HiMiniSparkles className="ml-2 text-blue-300" />
                                                                    )}
                                                            </td>
                                                            <td className="px-6 py-3 text-left whitespace-nowrap w-[35%] text-[#D2D6FF]">
                                                                {data?.count ||
                                                                    0}
                                                            </td>
                                                            <td className="px-4 py-3 text-left whitespace-nowrap w-[25%] text-[#D2D6FF]">
                                                                {`${data?.percentage.toFixed(
                                                                    2
                                                                )}%` || "0.00%"}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}

                                                {/* <tr className=" w-full bg-[#22253d]">
                                                    <td className="px-6 py-3 whitespace-nowrap w-[40%]font-medium text-[#D2D6FF] text-left ">
                                                        Thấp{" "}
                                                        <span className="xl:inline-block hidden">
                                                            (nhỏ hơn 7)
                                                        </span>
                                                        <span className="inline-block xl:hidden">
                                                            ({`<`} 7)
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[35%] text-[#D2D6FF] ">
                                                        {
                                                            humidityAnalysis[0]
                                                                .count
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3 text-left  whitespace-nowrap w-[25%] text-[#D2D6FF] ">
                                                        {humidityAnalysis[0].percentage.toFixed(
                                                            2
                                                        )}
                                                        %
                                                    </td>
                                                </tr>

                                                <tr className="w-full p-2 bg-[#2d3254]">
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[50 %]  selection:font-medium text-[#D2D6FF] items-center flex">
                                                        Đích (7-9)
                                                        <HiMiniSparkles className="ml-2 text-blue-300" />
                                                    </td>
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[25%] font-medium text-[#D2D6FF] ">
                                                        {
                                                            humidityAnalysis[1]
                                                                .count
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3 text-left  whitespace-nowrap w-[35%] font-medium text-[#D2D6FF] ">
                                                        {humidityAnalysis[1].percentage.toFixed(
                                                            2
                                                        )}
                                                        %
                                                    </td>
                                                </tr>

                                                <tr className="w-full bg-[#3f4477]">
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/2]  font-medium  text-[#D2D6FF] ">
                                                        Cao (10-15)
                                                    </td>
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/4] text-[#D2D6FF]">
                                                        {
                                                            humidityAnalysis[2]
                                                                .count
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3 text-left  whitespace-nowrap w-[1/4] text-[#D2D6FF]">
                                                        {humidityAnalysis[2].percentage.toFixed(
                                                            2
                                                        )}
                                                        %
                                                    </td>
                                                </tr>

                                                <tr className="w-full bg-[#48519c]">
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/2]  font-medium text-[#D2D6FF] ">
                                                        Rất cao{" "}
                                                        <span className="xl:inline-block hidden">
                                                            (trên 15)
                                                        </span>
                                                        <span className="inline-block xl:hidden">
                                                            ({`>`} 15)
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/4] text-[#D2D6FF] ">
                                                        {
                                                            humidityAnalysis[3]
                                                                .count
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3 text-left  whitespace-nowrap w-[1/4] text-[#D2D6FF] ">
                                                        {humidityAnalysis[3].percentage.toFixed(
                                                            2
                                                        )}
                                                        %
                                                    </td>
                                                </tr> */}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-1 rounded-b-xl bg-[#48519c]"></div>
                                </div>
                            </div>

                            <div className="xl:mx-auto xl:w-[60%] text-gray-500 text-[15px] mb-7">
                                <span className="font-semibold">Chú ý:</span>{" "}
                                Đối với mẻ sấy INDOOR nếu MC% {`<`} 10 chiếm tỉ
                                lệ từ 85% trở lên thì cho ra lò. Đối với mẻ sấy
                                OUTDOOR nếu MC% {`<`} 14 chiếm tỉ lệ từ 85% trở
                                lên thì cho ra lò.
                            </div>

                            {/* Input */}
                            <div className="mb-4 xl:mx-auto xl:w-[60%] border-2 border-gray-200 rounded-xl divide-y divide-gray-200 ">
                                <div className="flex gap-x-4 bg-gray-100 rounded-t-xl items-center p-2.5 xl:px-4 lg:px-4 md:px-4">
                                    <MdNoteAlt className="w-8 h-8 text-[]" />
                                    <div className="text-xl font-semibold">
                                        Ghi nhận độ ẩm
                                    </div>
                                </div>
                                <div className=" mx-auto  mb-4  ">
                                    {/* Header */}
                                    <div
                                        className="bg-white rounded-t-xl xl:flex md:flex justify-between items-center xl:space-y-0  lg:space-y-0 
                                                            md:space-y-0 xl:space-x-4 md:space-x-4 border-b py-4 space-y-2 px-4 border-gray-300"
                                    >
                                        <NumberInput
                                            defaultValue={1}
                                            placeholder="Nhập độ ẩm"
                                            min={0}
                                            value={humidityInput}
                                            className="xl:w-[70%] w-full"
                                            onChange={(value) =>
                                                setHumidityInput(value)
                                            }
                                        >
                                            <NumberInputField />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                        <button
                                            className="bg-[#155979] p-2 rounded-xl xl:w-[30%] w-full text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                            onClick={handleRecord}
                                        >
                                            Ghi nhận
                                        </button>
                                    </div>

                                    <div className="w-full my-4 rounded-b-xl text-base font-medium  space-y-3 max-h-[400px] overflow-auto">
                                        {loadCurrentRecord ? (
                                            <div className=" py-4 text-center overflow-hidden">
                                                <Spinner
                                                    thickness="8px"
                                                    speed="0.65s"
                                                    emptyColor="gray.200"
                                                    color="#155979"
                                                    size="xl"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                {humidityRecords.map(
                                                    (record, index) => (
                                                        <div
                                                            className="flex justify-between items-center px-6 xl:px-8 lg:px-8 md:px-8 p-2 mx-4 rounded-full bg-gray-100"
                                                            key={record.id}
                                                        >
                                                            <div className="xl:w-[40%] lg:w-[40%]">
                                                                Lần:{" "}
                                                                <span>
                                                                    {index + 1}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-start xl:w-[26%] lg:w-[26%] md:w-[26%]">
                                                                <div className="text-gray-600 mr-3">
                                                                    Độ ẩm:{" "}
                                                                </div>
                                                                <span className="font-semibold">
                                                                    {
                                                                        record.value
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-end xl:w-[33%] lg:w-[33%] md:w-[33%]">
                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            record.id
                                                                        )
                                                                    }
                                                                >
                                                                    <IoClose className="w-7 h-7 p-1 rounded-full hover:bg-gray-200" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div className="text-gray-500 mt-3a px-6">
                                        Tổng số lượng mẫu:{" "}
                                        <span>{humidityRecords.length}</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </ModalBody>

                    <ModalFooter className="bottom-0 sticky bg-white border-2 border-gray-200">
                        <div className=" flex justify-end gap-x-3 xl:px-10 md:px-10 w-full">
                            <button
                                onClick={onClose}
                                className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit lg:w-fit w-full"
                            >
                                Đóng
                            </button>
                            <button
                                className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit lg:w-fit w-full"
                                onClick={handleComplete}
                            >
                                Hoàn thành
                            </button>
                            <Modal
                                isOpen={isCompleteOpen}
                                onClose={onCompleteClose}
                                isCentered
                                size="xs"
                                blockScrollOnMount={false}
                                closeOnOverlayClick={false}
                            >
                                <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader>Kết quả:</ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>
                                        <div className="result-div"></div>
                                        {checkHumidityRequirement() ? (
                                            <div>
                                                <div className="flex justify-center w-full mb-3">
                                                    <BiSolidLike className="text-center text-green-500 w-12 h-12" />
                                                </div>
                                                <div className="text-center text-lg font-semibold">
                                                    Độ ẩm đạt yêu cầu.
                                                </div>
                                                <div className="text-center text-gray-500 mb-2">
                                                    Mẻ sấy có thể được ra lò.
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex justify-center w-full mb-3">
                                                    <BiSolidDislike className="text-center text-red-500 w-12 h-12" />
                                                </div>
                                                <div className="text-center text-lg font-semibold">
                                                    Độ ẩm chưa đạt yêu cầu.
                                                </div>
                                                <div className="text-center text-gray-500 mb-4">
                                                    Chọn phương án giải quyết:
                                                </div>
                                                <RadioGroup
                                                    onChange={setSelectedOption}
                                                    value={selectedOption}
                                                >
                                                    <Stack direction="column">
                                                        <Radio value="ST">
                                                            Tiếp tục sấy
                                                        </Radio>
                                                        <Radio value="SL">
                                                            Cách khác
                                                        </Radio>
                                                    </Stack>
                                                </RadioGroup>
                                                <label
                                                    htmlFor="wood_type"
                                                    className="block mt-4 text-md font-medium text-gray-900"
                                                >
                                                    Ghi chú
                                                </label>
                                                <textarea
                                                    className="mt-1 border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                    disabled={
                                                        selectedOption !== "SL"
                                                    }
                                                    rows={2}
                                                    value={anotherOption}
                                                    onChange={(e) =>
                                                        setAnotherOption(
                                                            e.target.value
                                                        )
                                                    }
                                                ></textarea>
                                            </div>
                                        )}
                                    </ModalBody>

                                    <ModalFooter className="space-x-3">
                                        <button
                                            onClick={onCompleteClose}
                                            className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit lg:w-fit w-full"
                                        >
                                            Đóng
                                        </button>

                                        {checkHumidityRequirement() ? (
                                            <button
                                                className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit lg:w-fit w-full"
                                                onClick={requirementMetHandle}
                                            >
                                                Duyệt ra lò
                                            </button>
                                        ) : (
                                            <button
                                                className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit lg:w-fit w-full"
                                                onClick={
                                                    requirementFailedHandle
                                                }
                                            >
                                                Xác nhận
                                            </button>
                                        )}
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* View Modal */}
            <div class="bg-white xl:p-0 lg:p-0 md:p-0 p-4 relative rounded-b-xl max-h-[35rem] overflow-y-auto ">
                <div class="xl:hidden lg:hidden md:hidden">
                    {recordsList.length > 0 ? (
                        <div className="space-y-4">
                            {Array.isArray(recordsList) &&
                                recordsList.map((item, index) => (
                                    <div
                                        className="rounded-xl bg-blue-50 hover:bg-gray-50 cursor-pointer xl:text-base  border border-blue-200"
                                        onClick={() => handleRecordClick(item)}
                                    >
                                        <div className="px-4 py-2.5 flex justify-between items-center border-b border-blue-200">
                                            <div className="">
                                                <span className="text-lg font-semibold">
                                                    #{item.id}
                                                </span>
                                            </div>
                                            <div className="p-1 px-3 bg-blue-200 rounded-xl">
                                                <span className="font-semibold">
                                                    {item.rate}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="px-4 divide-y divide-blue-200">
                                            <div className="flex justify-between py-2">
                                                <div className="">
                                                    Ngày tạo:
                                                </div>
                                                <span className="font-semibold">
                                                    {item.created_at}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <div className="">Tạo bởi:</div>
                                                <span className="font-semibold">
                                                    Admin
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center w-full py-3 text-gray-500">
                            Chưa có biên bản nào được ghi nhận
                        </div>
                    )}
                </div>
                <table class="w-full xl:inline-table lg:inline-table md:inline-table hidden text-left text-gray-500 ">
                    <thead class="font-semibold text-gray-700 px-4 xl:text-base text-base bg-gray-50 ">
                        <tr className="">
                            <th
                                scope="col"
                                class="py-3 xl:text-left text-center xl:px-6"
                            >
                                STT
                            </th>
                            <th
                                scope="col"
                                class="py-3 xl:text-left text-center xl:px-6"
                            >
                                Tỉ lệ
                            </th>
                            <th
                                scope="col"
                                class="py-3 xl:text-left text-center xl:px-6"
                            >
                                Ngày tạo
                            </th>
                            <th
                                scope="col"
                                class="py-3 xl:text-left text-center xl:px-6"
                            >
                                Tạo bởi
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(recordsList) &&
                            recordsList.length > 0 ? (
                            <>
                                {recordsList.map((item, index) => (
                                    <tr
                                        class="bg-white hover:bg-gray-50 cursor-pointer xl:text-base text-[15px] border-b "
                                        onClick={() => handleRecordClick(item)}
                                    >
                                        <th
                                            scope="row"
                                            class="py-4 xl:text-left text-center xl:px-6 font-medium text-gray-900 whitespace-nowrap "
                                        >
                                            {item.id}
                                        </th>
                                        <td class="py-4 xl:text-left text-center xl:px-6">
                                            {item.rate}%
                                        </td>
                                        <td class="py-4 xl:text-left text-center xl:px-6">
                                            {item.created_at}
                                        </td>
                                        <td class="py-4 xl:text-left text-center xl:px-6">
                                            Admin
                                        </td>
                                    </tr>
                                ))}
                            </>
                        ) : (
                            <td
                                class="w-full bg-white text-gray-500 cursor-pointer xl:text-base border-b "
                                colSpan={4}
                            >
                                <div className="flex justify-center  py-3">
                                    {" "}
                                    Chưa có biên bản nào được ghi nhận
                                </div>
                            </td>
                        )}
                    </tbody>
                </table>
            </div>
            {Array.isArray(recordsList) &&
                recordsList.map((item, index) => (
                    <Modal
                        closeOnOverlayClick={false}
                        isOpen={isDetailOpen}
                        onClose={onDetailClose}
                        scrollBehavior="inside"
                        size="full"
                        blockScrollOnMount={false}
                    >
                        <ModalOverlay />
                        <ModalContent>
                            <div className="top-0 sticky z-20 bg-white border-b-2 border-gray-200">
                                <ModalHeader>
                                    <div className="xl:ml-10 xl:text-center text-lg uppercase xl:text-xl ">
                                        Biểu mẫu kiểm tra độ ẩm gỗ sấy
                                    </div>
                                </ModalHeader>
                                <ModalCloseButton />
                            </div>

                            <ModalBody className="py-4 overscroll-y-auto">
                                {selectedRecord && (
                                    <section className="flex flex-col justify-center ">
                                        {/* Infomation */}
                                        <div className="xl:mx-auto text-base xl:w-[60%] border-2 mt-4 border-gray-200 rounded-xl divide-y divide-gray-200 bg-white mb-7">
                                            <div className="flex gap-x-4 bg-gray-100 rounded-t-xl items-center p-4 xl:px-8 lg:px-8 md:px-8">
                                                <FaInfoCircle className="w-7 h-7 text-[]" />
                                                <div className="text-xl font-semibold">
                                                    Thông tin chung
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 p-3 xl:px-8 lg:px-8 md:px-8">
                                                <div className=" flex font-semibold items-center">
                                                    <LuCalendarRange className="w-5 h-5 mr-3" />
                                                    Ngày kiểm tra:
                                                </div>
                                                <span className=" text-base ">
                                                    {format(
                                                        new Date(
                                                            selectedRecord.created_at
                                                        ),
                                                        "yyyy-MM-dd"
                                                    )}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 p-3 xl:px-8 lg:px-8 md:px-8">
                                                <div className="font-semibold flex items-center">
                                                    <LuStretchHorizontal className="w-5 h-5 mr-3" />
                                                    Mẻ sấy số:
                                                </div>
                                                <span className="font-normal text-base ">
                                                    {code}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 p-3 xl:px-8 lg:px-8 md:px-8">
                                                <div className="font-semibold flex items-center">
                                                    <LuWarehouse className="w-5 h-5 mr-3" />
                                                    Địa điểm:
                                                </div>
                                                <span className="font-normal text-base ">
                                                    {oven}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 p-3 xl:px-8 lg:px-8 md:px-8">
                                                <div className="font-semibold flex items-center">
                                                    <LuKeyRound className="w-5 h-5 mr-3" />
                                                    Đơn vị quản lý:
                                                </div>
                                                <span className="font-normal text-base ">
                                                    TQ
                                                </span>
                                            </div>
                                        </div>

                                        {/* Humid Range */}
                                        <div className="xl:mx-auto xl:w-[60%] rounded-xl bg-[#22253d] divide-y-2 divide-[#2B384B] mb-3">
                                            <div className="flex gap-x-4 justify-between text-white rounded-xl items-center p-4 xl:px-8 lg:px-8 md:px-8">
                                                <div className="flex items-center gap-x-4">
                                                    <MdWaterDrop className="w-8 h-8 text-blue-300" />
                                                    <div className="text-xl font-semibold">
                                                        Phân bố độ ẩm
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-x-4">
                                                    <div className="p-2 px-4 rounded-full bg-[#33395C]">
                                                        {reason}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="">
                                                {/* Header */}
                                                <div className="bg-[#22253d]">
                                                    <table className="min-w-full divide-y-2 divide-[#2B384B]  ">
                                                        <thead>
                                                            <tr className="w-full">
                                                                <th
                                                                    scope="col"
                                                                    className="px-6 py-3 text-left  text-base w-[40%] font-medium text-[#D2D6FF]  uppercase"
                                                                >
                                                                    Độ ẩm (MC%)
                                                                </th>
                                                                <th
                                                                    scope="col"
                                                                    className="px-6 py-3 text-left  text-base w-[25%] font-medium text-[#D2D6FF]  uppercase"
                                                                >
                                                                    SL Mấu
                                                                </th>
                                                                <th
                                                                    scope="col"
                                                                    className="px-4 py-3 text-left  text-base xl:w-[35%] w-fit font-medium text-[#D2D6FF]  uppercase"
                                                                >
                                                                    Tỉ lệ
                                                                </th>
                                                            </tr>
                                                        </thead>

                                                        <tbody className=" ">
                                                            {selectedAnalysis?.map(
                                                                (
                                                                    data,
                                                                    index
                                                                ) => (
                                                                    <tr
                                                                        className={`w-full bg-[${data?.bgColor}]`}
                                                                    >
                                                                        <td className="flex px-6 py-3 whitespace-nowrap w-[40%] font-medium text-[#D2D6FF] text-left">
                                                                            {
                                                                                data?.label.split(
                                                                                    "("
                                                                                )[0]
                                                                            }{" "}
                                                                            {/* <span className="xl:inline-block hidden">
                                                                                ({data.label.split("(")[1]})
                                                                            </span> */}
                                                                            <span className="inline-block ml-1 ">
                                                                                {
                                                                                    data?.shortLabel
                                                                                }
                                                                            </span>
                                                                            {data.label.includes(
                                                                                "Đích"
                                                                            ) && (
                                                                                    <HiMiniSparkles className="ml-2 text-blue-300" />
                                                                                )}
                                                                        </td>
                                                                        <td className="px-6 py-3 text-left whitespace-nowrap w-[35%] text-[#D2D6FF]">
                                                                            {data?.count ||
                                                                                0}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-left whitespace-nowrap w-[25%] text-[#D2D6FF]">
                                                                            {`${data?.percentage.toFixed(
                                                                                2
                                                                            )}%` || "0.00%"}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                            {/* <tr className=" w-full bg-[#22253d]">
                                                                <td className="px-6 py-3 whitespace-nowrap w-[40%]font-medium text-[#D2D6FF] text-left ">
                                                                    Thấp{" "}
                                                                    <span className="xl:inline-block hidden">
                                                                        (nhỏ hơn
                                                                        7)
                                                                    </span>
                                                                    <span className="inline-block xl:hidden">
                                                                        ({`<`}{" "}
                                                                        7)
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-3 text-left  whitespace-nowrap w-[35%] text-[#D2D6FF] ">
                                                                    {
                                                                        selectedAnalysis[0]
                                                                            .count
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-left  whitespace-nowrap w-[25%] text-[#D2D6FF] ">
                                                                    {selectedAnalysis[0].percentage.toFixed(
                                                                        2
                                                                    )}
                                                                    %
                                                                </td>
                                                            </tr>

                                                            <tr className="w-full p-2 bg-[#2d3254]">
                                                                <td className="px-6 py-3 text-left  whitespace-nowrap w-[50 %]  selection:font-medium text-[#D2D6FF] items-center flex">
                                                                    Đích (7-9)
                                                                    <HiMiniSparkles className="ml-2 text-blue-300" />
                                                                </td>
                                                                <td className="px-6 py-3 text-left  whitespace-nowrap w-[25%] font-medium text-[#D2D6FF] ">
                                                                    {
                                                                        selectedAnalysis[1]
                                                                            .count
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-left  whitespace-nowrap w-[35%] font-medium text-[#D2D6FF] ">
                                                                    {selectedAnalysis[1].percentage.toFixed(
                                                                        2
                                                                    )}
                                                                    %
                                                                </td>
                                                            </tr>

                                                            <tr className="w-full bg-[#3f4477]">
                                                                <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/2]  font-medium  text-[#D2D6FF] ">
                                                                    Cao (10-15)
                                                                </td>
                                                                <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/4] text-[#D2D6FF]">
                                                                    {
                                                                        selectedAnalysis[2]
                                                                            .count
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-left  whitespace-nowrap w-[1/4] text-[#D2D6FF]">
                                                                    {selectedAnalysis[2].percentage.toFixed(
                                                                        2
                                                                    )}
                                                                    %
                                                                </td>
                                                            </tr>

                                                            <tr className="w-full bg-[#48519c]">
                                                                <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/2]  font-medium text-[#D2D6FF] ">
                                                                    Rất cao{" "}
                                                                    <span className="xl:inline-block hidden">
                                                                        (trên
                                                                        15)
                                                                    </span>
                                                                    <span className="inline-block xl:hidden">
                                                                        ({`>`}{" "}
                                                                        15)
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/4] text-[#D2D6FF] ">
                                                                    {
                                                                        selectedAnalysis[3]
                                                                            .count
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-left  whitespace-nowrap w-[1/4] text-[#D2D6FF] ">
                                                                    {selectedAnalysis[3].percentage.toFixed(
                                                                        2
                                                                    )}
                                                                    %
                                                                </td>
                                                            </tr> */}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="p-1 rounded-b-xl bg-[#48519c]"></div>
                                            </div>
                                        </div>

                                        <div className="xl:mx-auto xl:w-[60%] text-gray-500 text-[15px] mb-7">
                                            <span className="font-semibold">
                                                Chú ý:
                                            </span>{" "}
                                            Đối với mẻ sấy INDOOR nếu MC% {`<`}{" "}
                                            10 chiếm tỉ lệ lớn hơn 85% thì cho
                                            ra lò. Đối với mẻ sấy OUTDOOR nếu
                                            MC% {`>`} 14 chiếm tỉ lệ lớn hơn 85%
                                            thì cho ra lò.
                                        </div>

                                        {/* Input */}
                                        <div className="mb-4 xl:mx-auto xl:w-[60%] border-2 border-gray-200 rounded-xl divide-y divide-gray-200 ">
                                            <div className="flex gap-x-4 bg-gray-100 rounded-t-xl items-center p-4 xl:px-8 lg:px-8 md:px-8">
                                                <MdNoteAlt className="w-8 h-8 text-[]" />
                                                <div className="text-xl font-semibold">
                                                    Ghi nhận độ ẩm
                                                </div>
                                            </div>
                                            <div className=" mx-auto  mb-4  ">
                                                <div className="bg-white my-4 rounded-b-xl text-base font-medium  space-y-3 max-h-[400px] overflow-auto">
                                                    {selectedRecord.detail.map(
                                                        (record, index) => (
                                                            <div
                                                                className="flex justify-between items-center px-6 xl:px-8 lg:px-8 md:px-8 p-2.5 mx-4 rounded-full bg-gray-100"
                                                                key={record.id}
                                                            >
                                                                <div className="xl:w-[40%] lg:w-[40%]">
                                                                    Lần:{" "}
                                                                    <span>
                                                                        {index +
                                                                            1}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center justify-start xl:w-[26%] lg:w-[26%] md:w-[26%]">
                                                                    <div className="text-gray-600 mr-3">
                                                                        Độ ẩm:{" "}
                                                                    </div>
                                                                    <span className="font-semibold">
                                                                        {
                                                                            record.value
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-end xl:w-[33%] lg:w-[33%] md:w-[33%]">
                                                                    <button>
                                                                        <IoClose className="w-7 h-7 p-1 rounded-full hover:bg-gray-200" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                                <div className="text-gray-500 px-6">
                                                    Tổng số lượng mẫu:{" "}
                                                    <span>
                                                        {
                                                            selectedRecord
                                                                .detail.length
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )}
                            </ModalBody>

                            <ModalFooter className="bottom-0 sticky bg-white border-2 border-gray-200">
                                <div className=" flex justify-end gap-x-3 xl:px-10 md:px-10 w-full">
                                    <button
                                        onClick={onDetailClose}
                                        className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit lg:w-fit w-full"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                ))}
        </div>
    );
}

export default HumidityCheck;
