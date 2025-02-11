import React, { useState, useMemo, useEffect, useCallback } from "react";
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
    Divider,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    PopoverAnchor,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Radio,
    RadioGroup,
    Stack,
    Spinner,
} from "@chakra-ui/react";
import {
    RiWaterPercentFill,
    FaPlus,
    FaInfoCircle,
    HiOutlineTrash,
    IoClose,
    BiSolidLike,
    BiSolidDislike,
} from "react-icons/all";
import {
    LuCalendarRange,
    LuFlagTriangleRight,
    LuWarehouse,
    LuKeyRound,
    LuStretchHorizontal,
} from "react-icons/lu";
import { MdWaterDrop, MdNoteAlt } from "react-icons/md";
import { HiMiniSparkles } from "react-icons/hi2";
import toast from "react-hot-toast";
import { format } from "date-fns";

const HumidityAnalysisTable = ({ data, reason }) => (
    <div className="xl:mx-auto xl:w-[60%] rounded-xl bg-[#22253d] divide-y-2 divide-[#2B384B] mb-3">
        <div className="flex gap-x-4 justify-between text-white rounded-xl items-center p-4 xl:px-8 lg:px-8 md:px-8">
            <div className="flex items-center gap-x-4">
                <MdWaterDrop className="w-8 h-8 text-blue-300" />
                <div className="text-xl font-semibold">Phân bố độ ẩm</div>
            </div>
            <div className="p-2 px-4 rounded-full bg-[#33395C]">{reason}</div>
        </div>
        <div>
            <table className="min-w-full divide-y-2 divide-[#2B384B]">
                <thead>
                    <tr>
                        <th className="px-6 py-3 text-left w-[40%] font-medium text-[#D2D6FF] uppercase">
                            Độ ẩm (MC%)
                        </th>
                        <th className="px-6 py-3 text-left w-[25%] font-medium text-[#D2D6FF] uppercase">
                            SL Mấu
                        </th>
                        <th className="px-4 py-3 text-left w-[35%] font-medium text-[#D2D6FF] uppercase">
                            Tỉ lệ
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr
                            key={index}
                            className={
                                index % 2 ? "bg-[#2d3254]" : "bg-[#22253d]"
                            }
                        >
                            <td className="px-6 py-3 whitespace-nowrap text-[#D2D6FF]">
                                {item.label}{" "}
                                {index === 1 && (
                                    <HiMiniSparkles className="ml-2 inline text-blue-300" />
                                )}
                            </td>
                            <td className="px-6 py-3 text-[#D2D6FF]">
                                {item.count}
                            </td>
                            <td className="px-4 py-3 text-[#D2D6FF]">
                                {item.percentage.toFixed(2)}%
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="p-1 rounded-b-xl bg-[#48519c]" />
        </div>
    </div>
);

const RecordModal = ({ isOpen, onClose, title, children, footer }) => (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
            <div className="sticky top-0 z-20 bg-white border-b-2 border-gray-200">
                <ModalHeader className="serif font-bold text-xl xl:text-2xl">
                    {title}
                </ModalHeader>
                <ModalCloseButton />
            </div>
            <ModalBody className="!p-3.5 !py-1 bg-[#FAFAFA]">
                {children}
            </ModalBody>
            {footer && (
                <ModalFooter className="sticky bottom-0 bg-white border-2 border-gray-200">
                    {footer}
                </ModalFooter>
            )}
        </ModalContent>
    </Modal>
);

function HumidityCheck(props) {
    const { planID, code, oven, reason, onCallback } = props;
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [humidityRecords, setHumidityRecords] = useState([]);
    const [recordsList, setRecordsList] = useState([]);
    const [humidityInput, setHumidityInput] = useState(0);
    const [selectedOption, setSelectedOption] = useState("0");
    const [anotherOption, setAnotherOption] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const calculateAnalysis = useCallback((records) => {
        const total = records.length || 1;
        const ranges = [
            { min: -Infinity, max: 7, label: "Thấp (nhỏ hơn 7)" },
            { min: 7, max: 9, label: "Đích (7-9)" },
            { min: 10, max: 15, label: "Cao (10-15)" },
            { min: 15, max: Infinity, label: "Rất cao (trên 15)" },
        ];

        return ranges.map(({ min, max, label }) => {
            const count = records.filter(
                (r) => r.value > min && r.value <= max
            ).length;
            return { label, count, percentage: (count / total) * 100 };
        });
    }, []);

    const humidityAnalysis = useMemo(
        () => calculateAnalysis(humidityRecords),
        [humidityRecords, calculateAnalysis]
    );
    const selectedAnalysis = useMemo(
        () => calculateAnalysis(selectedRecord?.detail || []),
        [selectedRecord, calculateAnalysis]
    );

    const checkHumidityRequirement = useCallback(() => {
        if (!humidityRecords.length) return false;
        return reason === "INDOOR"
            ? humidityAnalysis[0].percentage + humidityAnalysis[1].percentage >=
                  85
            : (humidityRecords.filter((r) => r.value <= 14).length /
                  humidityRecords.length) *
                  100 >=
                  85;
    }, [humidityRecords, reason, humidityAnalysis]);

    const loadRecords = useCallback(
        async (apiCall, setter) => {
            try {
                const response = await apiCall(planID);
                setter(response);
            } catch (error) {
                console.error("API Error:", error);
                toast.error("Lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        },
        [planID]
    );

    useEffect(() => {
        loadRecords(palletsApi.getTempHumidRecords, (data) =>
            setHumidityRecords(data.TempData)
        );
        loadRecords(palletsApi.getHumidListById, setRecordsList);
    }, [loadRecords]);

    const handleRecord = async () => {
        if (!humidityInput)
            return toast.error("Giá trị độ ẩm không được bỏ trống");

        try {
            const response = await palletsApi.addHumidRecord({
                PlanID: planID,
                value: humidityInput,
            });
            setHumidityRecords(response.humiditys);
            toast.success("Ghi nhận độ ẩm thành công");
            setHumidityInput(0);
        } catch (error) {
            console.error("Record Error:", error);
        }
    };

    const handleComplete = () => {
        if (humidityRecords.length < 50)
            return toast.error("Cần ít nhất 50 mẫu thử");
        onCompleteOpen();
    };

    const handleAPIRequest = async (body, successMessage) => {
        try {
            const response = await palletsApi.completeHumidRecord(body);
            if (response.message === "success") {
                toast.success(successMessage);
                onCallback?.();
                onClose();
                setHumidityRecords([]);
            }
        } catch (error) {
            console.error("Completion Error:", error);
            toast.error("Thao tác thất bại");
        } finally {
            onCompleteClose();
        }
    };

    const requirementMetHandle = () =>
        handleAPIRequest(
            {
                PlanID: planID,
                rate:
                    humidityAnalysis[0].percentage +
                    humidityAnalysis[1].percentage,
                option: "RL",
                note: "Đủ điều kiện ra lò.",
            },
            "Đã duyệt ra lò"
        );

    const requirementFailedHandle = () => {
        if (
            !selectedOption ||
            (selectedOption === "SL" && !anotherOption?.trim())
        )
            return toast.error("Vui lòng điền đầy đủ thông tin");

        handleAPIRequest(
            {
                PlanID: planID,
                rate:
                    humidityAnalysis[2].percentage +
                    humidityAnalysis[3].percentage,
                option: selectedOption,
                note: anotherOption || "Sấy lại",
            },
            "Xử lý thành công"
        );
    };

    const renderRecords = (records) =>
        records.map((record, index) => (
            <div
                key={record.id}
                className="flex justify-between items-center px-6 p-2 mx-4 rounded-full bg-gray-100"
            >
                <div className="xl:w-[40%]">Lần: {index + 1}</div>
                <div className="flex items-center xl:w-[26%]">
                    <span className="mr-3 text-gray-600">Độ ẩm:</span>
                    <span className="font-semibold">{record.value}</span>
                </div>
                <button onClick={() => handleDelete(record.id)}>
                    <IoClose className="w-7 h-7 p-1 hover:bg-gray-200 rounded-full" />
                </button>
            </div>
        ));

    return (
        <div className="bg-white rounded-xl border-2 border-gray-300">
            {/* Header and Main Modal */}
            <RecordModal
                isOpen={isOpen}
                onClose={onClose}
                title="Biểu mẫu kiểm tra độ ẩm gỗ sấy"
                footer={
                    <>
                        <Button onClick={onClose}>Đóng</Button>
                        <Button colorScheme="blue" onClick={handleComplete}>
                            Hoàn thành
                        </Button>
                    </>
                }
            >
                {/* Content Sections */}
                <HumidityAnalysisTable
                    data={humidityAnalysis}
                    reason={reason}
                />
                <div className="xl:mx-auto xl:w-[60%] space-y-4">
                    <NumberInput
                        value={humidityInput}
                        onChange={setHumidityInput}
                        min={0}
                    >
                        <NumberInputField placeholder="Nhập độ ẩm" />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                    <Button w="full" colorScheme="blue" onClick={handleRecord}>
                        Ghi nhận
                    </Button>
                    {loading ? <Spinner /> : renderRecords(humidityRecords)}
                </div>
            </RecordModal>

            {/* Completion Modal */}
            <Modal isOpen={isCompleteOpen} onClose={onCompleteClose} size="xs">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Kết quả</ModalHeader>
                    <ModalBody>
                        {checkHumidityRequirement() ? (
                            <>
                                <BiSolidLike className="mx-auto text-green-500 w-12 h-12" />
                                <p className="text-center font-semibold">
                                    Độ ẩm đạt yêu cầu
                                </p>
                            </>
                        ) : (
                            <>
                                <BiSolidDislike className="mx-auto text-red-500 w-12 h-12" />
                                <RadioGroup
                                    value={selectedOption}
                                    onChange={setSelectedOption}
                                    className="mt-4"
                                >
                                    <Stack>
                                        <Radio value="ST">Tiếp tục sấy</Radio>
                                        <Radio value="SL">Cách khác</Radio>
                                    </Stack>
                                </RadioGroup>
                                <textarea
                                    className="mt-2 w-full p-2 border rounded"
                                    disabled={selectedOption !== "SL"}
                                    value={anotherOption || ""}
                                    onChange={(e) =>
                                        setAnotherOption(e.target.value)
                                    }
                                />
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onCompleteClose}>Đóng</Button>
                        <Button
                            colorScheme="blue"
                            onClick={
                                checkHumidityRequirement()
                                    ? requirementMetHandle
                                    : requirementFailedHandle
                            }
                        >
                            {checkHumidityRequirement() ? "Duyệt" : "Xác nhận"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Records List */}
            <div className="p-4 max-h-[35rem] overflow-y-auto">
                {recordsList.length > 0 ? (
                    <Table variant="simple">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th>STT</Th>
                                <Th>Tỉ lệ</Th>
                                <Th>Ngày tạo</Th>
                                <Th>Tạo bởi</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {recordsList.map((item) => (
                                <Tr
                                    key={item.id}
                                    onClick={() => {
                                        setSelectedRecord(item);
                                        onDetailOpen();
                                    }}
                                >
                                    <Td>{item.id}</Td>
                                    <Td>{item.rate}%</Td>
                                    <Td>{item.created_at}</Td>
                                    <Td>Admin</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                ) : (
                    <div className="text-center py-3 text-gray-500">
                        Chưa có biên bản nào
                    </div>
                )}
            </div>
        </div>
    );
}

export default HumidityCheck;
