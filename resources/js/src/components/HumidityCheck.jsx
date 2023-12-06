import React, { useState, useMemo, useEffect } from "react";
import palletsApi from "../api/palletsApi";
import axios from "axios";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
} from "@chakra-ui/react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    PopoverAnchor,
} from "@chakra-ui/react";
import {
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from "@chakra-ui/react";
import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
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

function HumidityCheck(props) {
    const { planID, code, oven, reason, humidList } = props;

    console.log("Hiển thị planID ở Humidity:", planID);
    console.log("Danh sách độ ẩm:", humidList);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isCompleteOpen,
        onOpen: onCompleteOpen,
        onClose: onCompleteClose,
    } = useDisclosure();

    const [loadCurrentRecord, setLoadCurrentRecord] = useState(true);
    const [humidityRecords, setHumidityRecords] = useState([]);
    const [recordsList, setRecordsList] = useState([]);
    const [humidityInput, setHumidityInput] = useState(0);
    const [selectedOption, setSelectedOption] = React.useState("0");
    const [anotherOption, setAnotherOption] = React.useState(null);

    const humidityAnalysis = useMemo(() => {
        const total = humidityRecords.length;
        const low = humidityRecords.filter((record) => record.value < 7).length;
        const target = humidityRecords.filter(
            (record) => record.value >= 7 && record.value <= 9
        ).length;
        const high = humidityRecords.filter(
            (record) => record.value >= 10 && record.value <= 15
        ).length;
        const veryHigh = humidityRecords.filter(
            (record) => record.value > 15
        ).length;

        return [
            {
                label: "Thấp (nhỏ hơn 7)",
                count: low,
                percentage: (low / total) * 100,
            },
            {
                label: "Đích (7-9)",
                count: target,
                percentage: (target / total) * 100,
            },
            {
                label: "Cao (10-15)",
                count: high,
                percentage: (high / total) * 100,
            },
            {
                label: "Rất cao (trên 15)",
                count: veryHigh,
                percentage: (veryHigh / total) * 100,
            },
        ];
    }, [humidityRecords]);

    useEffect(() => {
        loadCurrentHumidRecords();
        loadHumidRecordList();
    }, []);

    const loadHumidRecordList = async () => {
        palletsApi
            .getHumidListById(planID)
            .then((response) => {
                console.log("Dữ liệu từ API:", response);

                setRecordsList(response);
            })
            .catch((error) => {
                console.error("Lỗi khi gọi API:", error);
            });
    };

    const loadCurrentHumidRecords = async () => {
        try {
            const response = await palletsApi.getTempRecords(planID);   
            setHumidityRecords(response.TempData);
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        } finally {
            setLoadCurrentRecord(false);
        }
    };
    
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

    // const loadCurrentHumidRecords = async () => {
    //     setLoadCurrentRecord(true);

    //     palletsApi
    //         .getTempRecords(planID)
    //         .then((response) => {
    //             console.log("Dữ liệu từ API:", response);

    //             setHumidityRecords(response.TempData);
    //             setLoadCurrentRecord(false);
    //         })
    //         .catch((error) => {
    //             console.error("Lỗi khi gọi API:", error);
    //             setLoadCurrentRecord(false);
    //         });
    // };

    // const handleRecord = () => {
    //     const recordData = {
    //         PlanID: planID,
    //         value: humidityInput,
    //     };

    //     if (humidityInput === 0) {
    //         toast.error("Giá trị độ ẩm không được bỏ trống.");
    //     } else {
    //         palletsApi
    //             .addHumidRecord(recordData)
    //             .then((response) => {
    //                 console.log("Kết quả trả về từ api:", response);
    //                 loadCurrentHumidRecords();
    //                 // setHumidityRecords(response.humiditys);
    //                 toast.success("Giá trị độ ẩm đã được ghi nhận");
    //                 setHumidityInput(0);
    //             })
    //             .catch((error) => {
    //                 console.error("Error:", error);
    //             });
    //     }
    // };

    // const handleDelete = (recordId) => {
    //     const deleteData = {
    //         PlanID: planID,
    //         ID: recordId,
    //     };
    //     palletsApi
    //         .removeHumidRecord(deleteData)
    //         .then((response) => {
    //             loadCurrentHumidRecords();
    //             // setHumidityRecords(response.humiditys);
    //             toast("Đã xóa khỏi danh sách");
    //         })
    //         .catch((error) => {
    //             console.error("Error:", error);
    //         });
    // };

    const checkHumidityRequirement = () => {
        if (reason === "INDOOR") {
            return (
                humidityAnalysis[0].percentage +
                    humidityAnalysis[1].percentage >=
                85
            );
        } else if (reason === "OUTDOOR") {
            return (
                humidityAnalysis[2].percentage +
                    humidityAnalysis[3].percentage >=
                85
            );
        }
    };

    const handleComplete = () => {
        if (humidityRecords.length === 0) {
            toast.error("Hãy ghi nhận độ ẩm trước khi hoàn thành");
        } else if (humidityRecords.length < 3) {
            toast.error("Phải có ít nhất 3 mẫu thử trước khi hoàn thành.");
        } else {
            checkHumidityRequirement();
            onCompleteOpen();
        }
    };

    const result =
        reason === "INDOOR"
            ? humidityAnalysis[0].percentage + humidityAnalysis[1].percentage
            : reason === "OUTDOOR"
            ? humidityAnalysis[2].percentage + humidityAnalysis[3].percentage
            : "";

    const requirementMetHandle = () => {
        const body = {
            PlanID: planID,
            rate: result,
            option: "RL",
            note: "Đủ điều kiện ra lò.",
        };

        palletsApi
            .completeHumidRecord(body)
            .then((response) => {
                if (response.message === "success") {
                    console.log("Kết quả trả về: ", response);
                    setRecordsList(response.humiditys);
                    toast.success("Đã duyệt ra lò");
                    loadHumidRecordList();
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

    return (
        <div className="bg-white rounded-xl border-2 border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 font-medium border-b border-gray-200">
                <div className="flex items-center gap-x-3">
                    <div className="w-8 h-8">
                        <RiWaterPercentFill className="w-full h-full text-[#17506B]" />
                    </div>
                    <div className="xl:text-xl xl:w-full w-[70%] text-lg">
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

            {/* Modal View all sizes */}
            <Modal
                closeOnOverlayClick={false}
                isOpen={isOpen}
                onClose={onClose}
                scrollBehavior="inside"
                size="full"
            >
                <ModalOverlay />
                <ModalContent>
                    <div className="top-0 sticky z-20 bg-white border-b-2 border-gray-200">
                        <ModalHeader>
                            <div className="xl:ml-10 xl:text-center text-[#155979] text-lg uppercase xl:text-xl ">
                                Biểu mẫu kiểm tra độ ẩm gỗ sấy
                            </div>
                        </ModalHeader>
                        <ModalCloseButton />
                    </div>

                    <ModalBody className="py-4">
                        <section className="flex flex-col justify-center ">
                            {/* Infomation */}
                            <div className="xl:mx-auto text-base xl:w-[60%] border-2 mt-4 border-gray-200 rounded-xl divide-y divide-gray-200 bg-white mb-7">
                                <div className="flex gap-x-4 bg-gray-100 rounded-t-xl items-center p-4 px-8">
                                    <FaInfoCircle className="w-7 h-7 text-[]" />
                                    <div className="text-xl font-semibold">
                                        Thông tin chung
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 p-3 px-8">
                                    <div className=" flex font-semibold items-center">
                                        <LuCalendarRange className="w-5 h-5 mr-3" />
                                        Ngày kiểm tra:
                                    </div>
                                    <span className=" text-base ">
                                        {format(new Date(), "yyyy-MM-dd")}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 p-2.5 px-8">
                                    <div className="font-semibold flex items-center">
                                        <LuStretchHorizontal className="w-5 h-5 mr-3" />
                                        Mẻ sấy số:
                                    </div>
                                    <span className="font-normal text-base ">
                                        {code}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 p-2.5 px-8">
                                    <div className="font-semibold flex items-center">
                                        <LuWarehouse className="w-5 h-5 mr-3" />
                                        Địa điểm (Lò số):
                                    </div>
                                    <span className="font-normal text-base ">
                                        {oven}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 p-2.5 px-8">
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
                                <div className="flex gap-x-4 justify-between text-white rounded-xl items-center p-4 px-8">
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
                                                        className="px-6 py-3 text-left  text-base w-[35%] font-medium text-[#D2D6FF]  uppercase"
                                                    >
                                                        SL Mấu
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-left  text-base w-[25%]  font-medium text-[#D2D6FF]  uppercase"
                                                    >
                                                        Tỉ lệ
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className=" ">
                                                <tr className=" w-full bg-[#22253d]">
                                                    <td className="px-6 py-3 whitespace-nowrap w-[1/2] font-medium text-[#D2D6FF] text-left ">
                                                        Thấp (nhỏ hơn 7)
                                                    </td>
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/4] text-[#D2D6FF] ">
                                                        {
                                                            humidityAnalysis[0]
                                                                .count
                                                        }
                                                    </td>
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/4] text-[#D2D6FF] ">
                                                        {humidityAnalysis[0].percentage.toFixed(
                                                            2
                                                        )}
                                                        %
                                                    </td>
                                                </tr>

                                                <tr className="w-full p-2 bg-[#2d3254]">
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/2]  selection:font-medium text-[#D2D6FF] items-center flex">
                                                        Đích (7-9)
                                                        <HiMiniSparkles className="ml-2 text-blue-300" />
                                                    </td>
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/4] font-medium text-[#D2D6FF] ">
                                                        {
                                                            humidityAnalysis[1]
                                                                .count
                                                        }
                                                    </td>
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/4] font-medium text-[#D2D6FF] ">
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
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/4] text-[#D2D6FF]">
                                                        {humidityAnalysis[2].percentage.toFixed(
                                                            2
                                                        )}
                                                        %
                                                    </td>
                                                </tr>

                                                <tr className="w-full bg-[#48519c]">
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/2]  font-medium text-[#D2D6FF] ">
                                                        Rất cao (trên 15)
                                                    </td>
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/4] text-[#D2D6FF] ">
                                                        {
                                                            humidityAnalysis[3]
                                                                .count
                                                        }
                                                    </td>
                                                    <td className="px-6 py-3 text-left  whitespace-nowrap w-[1/4] text-[#D2D6FF] ">
                                                        {humidityAnalysis[3].percentage.toFixed(
                                                            2
                                                        )}
                                                        %
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-1 rounded-b-xl bg-[#48519c]"></div>
                                </div>
                            </div>

                            <div className="xl:mx-auto xl:w-[60%] text-gray-500 text-[15px] mb-7">
                                <span className="font-semibold">Chú ý:</span>{" "}
                                Đối với mẻ sấy INDOOR nếu MC% {`<`} 10 chiếm tỉ
                                lệ lớn hơn 85% thì cho ra lò. Đối với mẻ sấy
                                OUTDOOR nếu MC% {`>`} 14 chiếm tỉ lệ lớn hơn 85%
                                thì cho ra lò.
                            </div>

                            {/* Input */}
                            <div className="mb-4 xl:mx-auto xl:w-[60%] border-2 border-gray-200 rounded-xl divide-y divide-gray-200 ">
                                <div className="flex gap-x-4 bg-gray-100 rounded-t-xl items-center p-4 px-8">
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

                                    <div className="bg-white py-4 rounded-b-xl text-base font-medium  space-y-3">
                                        {loadCurrentRecord ? (
                                            <div className="text-center">
                                                <Spinner
                                                    thickness="4px"
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
                                                            className="flex items-center px-8 p-2.5 mx-4 rounded-full bg-gray-100"
                                                            key={record.id}
                                                        >
                                                            <div className="w-[40%]">
                                                                Lần:{" "}
                                                                <span>
                                                                    {index + 1}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-start w-[26%]">
                                                                <div className="text-gray-600 mr-3">
                                                                    Độ ẩm:{" "}
                                                                </div>
                                                                <span className="font-semibold">
                                                                    {
                                                                        record.value
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-end w-[33%]">
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
                                    <div className="text-gray-500 px-6">
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
                                className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit lg:w-fit w-full"
                                onClick={handleComplete}
                            >
                                Hoàn thành
                            </button>
                            <Modal
                                isOpen={isCompleteOpen}
                                onClose={onCompleteClose}
                                isCentered
                                size="sm"
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

                                    <ModalFooter>
                                        {checkHumidityRequirement() ? (
                                            <Button
                                                colorScheme="blue"
                                                mr={3}
                                                onClick={requirementMetHandle}
                                            >
                                                Duyệt ra lò
                                            </Button>
                                        ) : (
                                            <Button
                                                colorScheme="blue"
                                                mr={3}
                                                onClick={
                                                    requirementFailedHandle
                                                }
                                            >
                                                Xác nhận
                                            </Button>
                                        )}

                                        <Button
                                            colorScheme="gray"
                                            mr={3}
                                            onClick={onCompleteClose}
                                        >
                                            Đóng
                                        </Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                            <button
                                onClick={onClose}
                                className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit lg:w-fit w-full"
                            >
                                Đóng
                            </button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <div class="relative rounded-b-xl overflow-x-auto">
                <table class="w-full  text-left text-gray-500 ">
                    <thead class="font-semibold text-gray-700 px-4 xl:text-base text-base bg-gray-50 ">
                        <tr>
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
                            recordsList.map((item, index) => (
                                <tr class="bg-white hover:bg-gray-50 cursor-pointer xl:text-base text-[15px] border-b">
                                    <th
                                        scope="row"
                                        class="py-3 xl:text-left text-center xl:px-6 font-medium text-gray-900 whitespace-nowrap "
                                    >
                                        {item.id}
                                    </th>
                                    <td class="py-3 xl:text-left text-center xl:px-6">
                                        {item.rate}%
                                    </td>
                                    <td class="py-3 xl:text-left text-center xl:px-6">
                                        {item.created_at}
                                    </td>
                                    <td class="py-3 xl:text-left text-center xl:px-6">
                                        Admin
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default HumidityCheck;
