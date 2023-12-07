import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import { PiCaretCircleDoubleRightFill } from "react-icons/pi";
import { CgSpinnerTwo } from "react-icons/cg";
import { FaCheck } from "react-icons/fa6";
import {
    Step,
    Box,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    useSteps,
} from "@chakra-ui/react";
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
import { Spinner } from "@chakra-ui/react";
import CheckListItem from "./CheckListItem";
import palletsApi from "../api/palletsApi";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { MdFormatColorReset } from "react-icons/md";

const checkItems = [
    {
        value: 1,
        title: "1. Vệ sinh lò sấy",
        description: "Sạch sẽ, không có các vật thể lạ trong lò.",
    },
    {
        value: 2,
        title: "2. Không bị rò rỉ nước",
        description: "Giàn nhiệt kín không bị rò rỉ nước.",
    },
    {
        value: 3,
        title: "3. Hệ thống gia nhiệt",
        description:
            "Van nhiệt đóng mở đúng theo tín hiệu điện Giàn nhiệt không bị rò rỉ nhiệt ra ngoài.",
    },
    {
        value: 4,
        title: "4. Hệ thống điều tiết ẩm",
        description:
            "Ống phun ầm phải ở dạng sương, không được phun thành tia.",
    },
    {
        value: 5,
        title: "5. Đầu đo đo độ ẩm gỗ",
        description: "Các đầu đo không bị đứt, còn đầu gài vào thanh gỗ mẫu.",
    },
    {
        value: 6,
        title: "6. Cửa thoát ẩm",
        description:
            "Hoạt động đóng mở bằng tay/tự động dễ dàng, không bị kẹt.",
    },
    {
        value: 7,
        title: "7. Giấy cảm biến đo EMC",
        description: "Tối đa 3 lượt sấy phải thay giấy mới.",
    },
    {
        value: 8,
        title: "8. Cảm biến nhiệt độ trong lò sấy",
        description:
            "Không sai khác so với nhiệt độ trong lò quá 2⁰C (Đo bằng súng bắn nhiệt).",
    },
    {
        value: 9,
        title: "9. Van hơi, van nước hồi",
        description: "Kín, không bị rò rỉ.",
    },
    {
        value: 10,
        title: "10. Đinh, dây đo độ ẩm",
        description: "Hoạt động tốt.",
    },
    {
        value: 11,
        title: "11. Chiều dày thực tế",
        description:
            "Kiểm tra 5 palet ngẫu nhiên,mỗi palet 5 thanh ngẫu nhiên trong lò,dung sai cho phép + 2(mm).",
    },
    {
        value: 12,
        title: "12. Động cơ quạt & tốc độ gió quạt",
        description:
            "Tốc độ gió quạt đạt tối thiểu 1m/s Các quạt quay cùng chiều và ngược chiều phải đồng đều.",
    },
];

function ControllerCard(props) {
    const { progress, status, isChecked, isReviewed, reason, planID, onReload } = props;

    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isKilnOpen,
        onOpen: onKilnOpen,
        onClose: onKilnClose,
    } = useDisclosure();
    const {
        isOpen: isFinalOpen,
        onOpen: onFinalOpen,
        onClose: onFinalClose,
    } = useDisclosure();

    let navigate = useNavigate();

    // console.log("Plan ID: ", planID);

    // State
    const [palletData, setPalletData] = useState([]);
    const [isPalletLoading, setPalletLoading] = useState([]);

    const [selectedPallet, setSelectedPallet] = useState(null);
    const [dryingInProgress, setDryingInProgress] = useState(false);
    const [isCompleteChecking, setIsCompleteChecking] = useState(false);

    // Mini Loading
    const [loadIntoKilnLoading, setLoadIntoKilnLoading] = useState(false);
    const [loadKilnCheckingLoading, setLoadKilnCheckingLoading] =
        useState(false);
    const [loadStartDryingLoading, setLoadStartDryingLoading] = useState(false);
    const [loadFinishDryingLoading, setLoadFinishDryingLoading] =
        useState(false);

    // Kiln Check Handle
    // No 7 Handle
    const [no7Count, setNo7Count] = useState(0);

    // Check Checklist Items
    const [checkedCount, setCheckedCount] = useState(0);
    const handleCheckboxChange = (isChecked) => {
        setCheckedCount((prevCount) =>
            isChecked ? prevCount + 1 : prevCount - 1
        );
    };

    // Get data Select
    useEffect(() => {
        loadPallets();
    }, []);

    const loadPallets = async () => {
        setPalletLoading(true);
        const data = await palletsApi.getPalletList(reason);
        const options = data.map((item) => ({
            value: item.palletID,
            label: `${item.Code}-${item.MaLo}-${item.LyDo}`,
        }));
        console.log("Danh sách pallet:", data);
        setPalletData(options);
        setPalletLoading(false);
    };

    const handleLoadIntoKiln = async (reason, callback) => {
        try {
            if (!selectedPallet || !selectedPallet.value) {
                toast.error("Hãy chọn pallet trước khi vào lò.");
                return;
            }
            setLoadIntoKilnLoading(true);

            const requestData = {
                PlanID: planID,
                PalletID: selectedPallet.value,
            };

            await axios.post("/api/ovens/production-batch", requestData);
            props.onReload(prevState => !prevState);

            toast.success("Vào lò thành công!");

            setSelectedPallet(null);

            // Reload pallets
            await loadPallets();

            setLoadIntoKilnLoading(false);
        } catch (error) {
            console.error("Error loading into kiln:", error);
            toast.error("Đã xảy ra lỗi khi vào lò.");
            setLoadIntoKilnLoading(false);
        }
    };

    const handleCompleteCheckingKiln = async () => {
        try {
            setLoadKilnCheckingLoading(true);
            const response = await axios.patch("/api/ovens/production-check", {
                PlanID: planID,
            });
            if (response.status === 200) {
                onClose();

                toast.success("Thông tin đã được lưu lại");
                console.log("Hoàn thành việc kiểm tra lò sấy!");
                setLoadKilnCheckingLoading(false);
                setIsCompleteChecking(true);
                // window.location.reload();
            } else {
                toast.error("Có lỗi xảy ra khi thực hiện kiểm tra lò sấy");
                setLoadKilnCheckingLoading(false);
            }
        } catch (error) {
            console.error("Error completing production check:", error);
            toast.error("Hiện không thể lưu thông tin. Hãy thử lại sau.");
            setLoadKilnCheckingLoading(false);
        }
    };

    const handleStartDrying = async () => {
        try {
            setLoadStartDryingLoading(true);
            const response = await axios.patch("/api/ovens/production-run", {
                PlanID: planID,
            });
            if (response.status === 200) {
                onKilnClose();

                toast.success("Bắt đầu sấy thành công");
                console.log("Đã bắt đầu sấy gỗ!");
                setLoadStartDryingLoading(false);
                setDryingInProgress(true);
            } else {
                toast.error("Không thể sấy lúc này");
                setLoadStartDryingLoading(false);
            }
        } catch (error) {
            console.error("Error completing production check:", error);

            toast.error("Hiện không thể thực hiện hành động này.");
            setLoadStartDryingLoading(false);
        }
    };

    const handleFinishDrying = async () => {
        try {
            setLoadFinishDryingLoading(true);
            const response = await axios.patch(
                "/api/ovens/production-completed",
                {
                    PlanID: planID,
                }
            );
            if (response.status === 200) {
                onFinalClose();

                toast.success("Ra lò thành công");
                console.log("Hoàn thành quy trình sấy gỗ");
                setLoadFinishDryingLoading(false);
                navigate("/workspace/drying-wood-checking");
            } else {
                toast.error("Không thể ra lò lúc này");
                setLoadFinishDryingLoading(false);
            }
        } catch (error) {
            console.error("Error completing production check:", error);

            toast.error("Hiện không thể thực hiện hành động này.");
            setLoadFinishDryingLoading(false);
        }
    };

    const progressTitle =
        progress === "kh"
            ? "Tạo kế hoạch sấy"
            : progress === "vl"
            ? "Vào lò"
            : progress === "kt"
            ? "Kiểm tra lò sấy"
            : progress === "ls"
            ? "Chạy lò sấy"
            : progress === "dg"
            ? "Đánh giá mẻ sấy và xác nhận ra lò"
            : "";

    const content =
        progress === "kh" ? (
            <div>
                <div className="flex xl:flex-row flex-col xl:space-y-0 space-y-3 items-end gap-x-4 px-6 py-6">
                    <div className="pt-0 space-y-1">
                        <div className="font-semibold">
                            Kế hoạch sấy đã được tạo.
                        </div>
                        <div>Hãy tiếp tục công việc tại công đoạn Vào lò.</div>
                    </div>
                </div>
            </div>
        ) : progress === "vl" ? (
            <div>
                <div className="flex xl:flex-row flex-col xl:space-y-0 space-y-3 items-end gap-x-4 px-6 py-6">
                    <div className="pt-0 xl:w-[75%] w-full md:w-[85%]">
                        <label
                            for="company"
                            className="block mb-2 text-md font-medium text-gray-900 "
                        >
                            Chọn pallet
                        </label>
                        <Select
                            placeholder="Chọn pallet"
                            value={selectedPallet}
                            loadOptions={loadPallets}
                            options={palletData}
                            onChange={(value) => {
                                console.log("Selected Pallet:", value);
                                setSelectedPallet(value);
                            }}
                            isLoading={isPalletLoading}
                        />
                    </div>
                    <button
                        className="bg-[#1F2937] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all items-end justify-end w-full xl:max-w-[25%]"
                        onClick={handleLoadIntoKiln}
                    >
                        {loadIntoKilnLoading ? (
                            <div className="flex justify-center items-center space-x-4">
                                <Spinner size="sm" color="white" />
                                <div>Đang tải</div>
                            </div>
                        ) : (
                            "Vào lò"
                        )}
                    </button>
                </div>
            </div>
        ) : progress === "kt" ? (
            <div>
                {status === 1 ? (
                    <div>
                        {!isCompleteChecking ? (
                            <div className="flex xl:flex-row flex-col xl:space-y-0 space-y-3 items-end gap-x-4 px-6 pt-6">
                                <div className="pt-0 xl:w-[85%] w-full md:w-[85%]">
                                    <label
                                        for="company"
                                        className="block mb-2 text-md font-medium text-gray-900 "
                                    >
                                        Chọn pallet
                                    </label>
                                    <Select
                                        placeholder="Chọn pallet"
                                        value={selectedPallet}
                                        loadOptions={loadPallets}
                                        options={palletData}
                                        onChange={(value) => {
                                            console.log(
                                                "Selected Pallet:",
                                                value
                                            );
                                            setSelectedPallet(value);
                                        }}
                                        isLoading={isPalletLoading}
                                    />
                                </div>
                                <button
                                    className="bg-[#1F2937] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all items-end justify-end w-full xl:max-w-[25%]"
                                    onClick={handleLoadIntoKiln}
                                >
                                    {loadIntoKilnLoading ? (
                                        <div className="flex justify-center items-center space-x-4">
                                            <Spinner size="sm" color="white" />
                                            <div>Đang tải</div>
                                        </div>
                                    ) : (
                                        "Vào lò"
                                    )}
                                </button>
                            </div>
                        ) : null}
                    </div>
                ) : null}
                <div className="flex xl:flex-row flex-col items-end gap-x-4 px-6 py-6 xl:space-y-0 space-y-3">
                    <div className="space-y-1 xl:w-[75%]">
                        <div className="font-semibold">Chú ý:</div>
                        <div>
                            Lò sấy cần phải được kiểm tra trước khi bắt đầu sấy.
                        </div>
                    </div>
                    {status === 2 ? (
                        <div className="flex bg-gray-200 text-gray-600 justify-center p-2 rounded-xl  px-4 text-center h-fit items-center xl:w-[25%] w-full">
                            <div className="font-medium">Đã kiểm tra</div>
                            <FaCheck className=" ml-2 text-xl" />
                        </div>
                    ) : (
                        <div className="xl:w-[25%]">
                            {!isCompleteChecking ? (
                                <button
                                    className="bg-[#1F2937] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all items-end w-full"
                                    onClick={onOpen}
                                >
                                    Kiểm tra lò sấy
                                </button>
                            ) : (
                                <div className="flex bg-gray-200 text-gray-600 justify-center p-2 rounded-xl  px-4 text-center h-fit items-center  w-full">
                                    <div className="font-medium">
                                        Đã kiểm tra
                                    </div>
                                    <FaCheck className=" ml-2 text-xl" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        ) : progress === "ls" ? (
            <div className="">
                {/* Step 3: Bắt đầu sấy */}
                <div className="flex xl:flex-row flex-col items-end gap-x-4 px-6 py-6 xl:space-y-0 space-y-3">
                    <div className="space-y-1 xl:w-[75%]">
                        <div className="font-semibold">Chú ý:</div>
                        <div>
                            Thời gian sẽ bắt đầu được tính khi bấm bắt đầu sấy.
                        </div>
                    </div>
                    {status === 2 ? (
                        !dryingInProgress ? (
                            <button
                                className="bg-[#1F2937] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all items-end xl:w-[25%] w-full"
                                onClick={onKilnOpen}
                            >
                                Bắt đầu sấy
                            </button>
                        ) : (
                            <div className="flex bg-gray-200 text-gray-600 justify-center p-2 rounded-xl  px-4 text-center h-fit items-center xl:w-[25%] w-full">
                                <CgSpinnerTwo className="animate-spin mr-2 text-xl" />
                                <div className="font-medium">Đang sấy...</div>
                            </div>
                        )
                    ) : (
                        (dryingInProgress || status === 3) && (
                            <div className="flex bg-gray-200 text-gray-600 justify-center p-2 rounded-xl  px-4 text-center h-fit items-center xl:w-[25%] w-full">
                                <CgSpinnerTwo className="animate-spin mr-2 text-xl" />
                                <div className="font-medium">Đang sấy...</div>
                            </div>
                        )
                    )}
                </div>
            </div>
        ) : progress === "dg" ? (
            <div className="">
                <div className="flex xl:flex-row flex-col items-end gap-x-4 px-6 py-6 xl:space-y-0 space-y-3">
                    
                    {isReviewed === 1 ? (
                        <>
                            <div className=" space-y-1 w-full xl:w-[75%]">
                                <div className="font-semibold">Tình trạng mẻ sấy:</div>
                                <div className="text-green-500">Mẻ sấy đã đủ điều kiện ra lò.</div>
                            </div>
                            <button
                                className="bg-[#1F2937] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all items-end w-full xl:w-[25%]"
                                onClick={onFinalOpen}
                            >
                                Xác nhận ra lò
                            </button>
                        </>
                    ) : (
                        <>
                            <div className=" space-y-1 w-full xl:w-[75%]">
                                <div className="font-semibold">Tình trạng mẻ sấy:</div>
                                <div className="text-red-500">Mẻ sấy chưa đủ điều kiện ra lò.</div>
                            </div>
                            <div className="flex bg-gray-200 text-gray-600 justify-center p-2 rounded-xl  px-4 text-center h-fit items-center xl:w-[25%] w-full">
                                <CgSpinnerTwo className="animate-spin mr-2 text-xl" />
                                <div className="font-medium">Đang sấy...</div>
                            </div>
                        </>
                        
                    )}
                </div>
            </div>
        ) : null;

    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl">
            {/* Header */}
            <div className="flex flex-col px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-x-3 font-medium">
                    <PiCaretCircleDoubleRightFill className="text-2xl w-8 h-8 text-[#17506B]" />
                    <div className="xl:text-xl xl:w-full w-[70%] text-lg">
                        Tiến trình: <span>{progressTitle}</span>
                    </div>
                </div>
                <div className="w-full"></div>
            </div>

            {/* Content */}
            <div className="">{content}</div>

            {/* Kiểm tra lò sấy */}
            <Modal
                closeOnOverlayClick={false}
                isOpen={isOpen}
                onClose={onClose}
                size="full"
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <div className="xl:ml-6 uppercase xl:text-xl ">
                            Kiểm tra lò sấy
                        </div>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <div className="h-full">
                            <div className="xl:px-6 pb-2 text-[16px] text-gray-500 ">
                                <strong>Ghi chú: </strong>Lò sấy chỉ đủ tiêu
                                chuẩn hoạt động khi đã đáp ứng tất cả nhu cầu
                                dưới đây
                            </div>
                            <div className="xl:px-10 xl:pb-4 grid xl:grid-cols-4 lg:grid-cols-4 gap-6">
                                {/* Hiển thị tất cả giá trị checkItems */}
                                {checkItems.map((item) => (
                                    <CheckListItem
                                        value={item.value}
                                        title={item.title}
                                        description={item.description}
                                        onCheckboxChange={handleCheckboxChange}
                                    />
                                ))}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter className="bg-white border-t-2 border-gray-200 w-full sticky bottom-0">
                        <div className=" xl:flex items-center justify-between xl:px-6 md:px-6 w-full">
                            <div className="flex text-lg ">
                                <strong className="hidden xl:flex md:flex">
                                    Kết luận:{" "}
                                </strong>
                                <p
                                    className={`ml-2  ${
                                        checkedCount === 12
                                            ? "text-[#0E8E59]"
                                            : "text-[#961717]"
                                    }`}
                                >
                                    {checkedCount === 12
                                        ? "Mẻ sấy đã đủ điều kiện hoạt động."
                                        : "Mẻ sấy chưa đủ điều kiện hoạt động."}
                                </p>
                                <p className="ml-2">
                                    (<span>{checkedCount}</span>/12)
                                </p>
                            </div>
                            <div className="flex xl:w-fit md:w-fit w-full items-center justify-end py-4 xl:py-0 lg:py-0 md:py-0 gap-x-3 ">
                                <button
                                    onClick={onClose}
                                    className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit w-full"
                                >
                                    Đóng
                                </button>
                                <button
                                    className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit w-full"
                                    onClick={handleCompleteCheckingKiln}
                                >
                                    {loadKilnCheckingLoading ? (
                                        <div className="flex justify-center items-center space-x-4">
                                            <Spinner size="sm" color="white" />
                                            <div>Đang tải</div>
                                        </div>
                                    ) : (
                                        "Hoàn thành"
                                    )}
                                </button>
                            </div>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Step 3: Bắt đầu sấy*/}
            <Modal
                closeOnOverlayClick={false}
                isOpen={isKilnOpen}
                onClose={onKilnClose}
                isCentered
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Bạn chắc chắn muốn sấy?</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        Sau khi bấm xác nhận sẽ không thể thu hồi hành động.
                    </ModalBody>

                    <ModalFooter>
                        <div className="flex justify-end gap-x-3">
                            <button
                                onClick={onKilnClose}
                                className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                            >
                                Đóng
                            </button>
                            <button
                                className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                onClick={handleStartDrying}
                            >
                                {loadStartDryingLoading ? (
                                    <div className="flex justify-center items-center space-x-4">
                                        <Spinner size="sm" color="white" />
                                        <div>Đang tải</div>
                                    </div>
                                ) : (
                                    "Bắt đầu sấy"
                                )}
                            </button>
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Step 4: Xác nhận ra lò*/}
            <Modal
                closeOnOverlayClick={false}
                isOpen={isFinalOpen}
                onClose={onFinalClose}
                isCentered
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Bạn chắc chắn muốn ra lò?</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        Bấm xác nhận để hoàn thành quy trình sấy gỗ.
                    </ModalBody>

                    <ModalFooter>
                        <div className="flex justify-end gap-x-3">
                            <button
                                onClick={onFinalClose}
                                className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                            >
                                Đóng
                            </button>
                            <button
                                className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                onClick={handleFinishDrying}
                            >
                                {loadFinishDryingLoading ? (
                                    <div className="flex justify-center items-center space-x-4">
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
        </div>
    );
}

export default ControllerCard;
