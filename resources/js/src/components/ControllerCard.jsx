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
import KilnCheck from "./KilnCheck";

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
            "Kiểm tra 5 pallet ngẫu nhiên,mỗi pallet 5 thanh ngẫu nhiên trong lò,dung sai cho phép + 2(mm).",
    },
    {
        value: 12,
        title: "12. Động cơ quạt & tốc độ gió quạt",
        description:
            "Tốc độ gió quạt đạt tối thiểu 1m/s Các quạt quay cùng chiều và ngược chiều phải đồng đều.",
    },
];

function ControllerCard(props) {
    const {
        progress,
        status,
        isChecked,
        isReviewed,
        reason,
        planID,
        checkData,
        CT11Data,
        CT12Data,
        checkboxData,
        loadedPalletList,
        onReload,
        onCallback,
        onReloadPalletList,
        palletOptions,
        palletListLoading,
    } = props;

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

    // State
    const [palletData, setPalletData] = useState([]);
    const [isPalletLoading, setPalletLoading] = useState([]);

    const [selectedPallet, setSelectedPallet] = useState(null);
    const [dryingInProgress, setDryingInProgress] = useState(false);
    const [isCompleteChecking, setIsCompleteChecking] = useState(false);
    const [isCompleteReviewing, setIsCompleteReviewing] = useState(false);
    const [disabledCheckbox, setDisabledCheckbox] = useState(false);

    // Mini Loading
    const [loadIntoKilnLoading, setLoadIntoKilnLoading] = useState(false);
    const [loadKilnCheckingLoading, setLoadKilnCheckingLoading] =
        useState(false);
    const [loadStartDryingLoading, setLoadStartDryingLoading] = useState(false);
    const [loadFinishDryingLoading, setLoadFinishDryingLoading] =
        useState(false);
    // Loading
    const [checkingDataLoading, setCheckingDataLoading] = useState(false);

    const [BOWData, setBOWData] = useState([]);

    // System Data
    // const [fixedStates, setFixedStates] = useState({
    //     CT1: 0,
    //     CT2: 0,
    //     CT3: 0,
    //     CT4: 0,
    //     CT5: 0,
    //     CT6: 0,
    //     CT7: 0,
    //     CT8: 0,
    //     CT9: 0,
    //     CT10: 0,
    //     CT11: 0,
    //     CT12: 0,
    // });

    // const [fixedSoLan, setFixedSoLan] = useState("");
    // const [fixedCBL, setFixedCBL] = useState("");
    // const [fixedDoThucTe, setFixedDoThucTe] = useState("");

    // const [fixedSamples, setFixedSamples] = useState({
    //     M1: "",
    //     M2: "",
    //     M3: "",
    //     M4: "",
    //     M5: "",
    // });

    // const [fixedFanValues, setFixedFanValues] = useState({
    //     Q1: "",
    //     Q2: "",
    //     Q3: "",
    //     Q4: "",
    //     Q5: "",
    //     Q6: "",
    //     Q7: "",
    //     Q8: "",
    // });

    //User Data
    const [checkboxStates, setCheckboxStates] = useState({
        CT1: 0,
        CT2: 0,
        CT3: 0,
        CT4: 0,
        CT5: 0,
        CT6: 0,
        CT7: 0,
        CT8: 0,
        CT9: 0,
        CT10: 0,
        CT11: 0,
        CT12: 0,
    });

    const [soLan, setSoLan] = useState("");
    const [CBL, setCBL] = useState("");
    const [doThucTe, setDoThucTe] = useState("");

    const [samples, setSamples] = useState({
        M1: "",
        M2: "",
        M3: "",
        M4: "",
        M5: "",
    });

    const [fanValues, setFanValues] = useState({
        Q1: "",
        Q2: "",
        Q3: "",
        Q4: "",
        Q5: "",
        Q6: "",
        Q7: "",
        Q8: "",
    });

    console.log("01. Dữ liệu checkbox nhận được từ detail là:", checkboxData);
    console.log("01. Dữ liệu pallet nhận được từ detail là:", palletData);

    const handleSoLanChange = (newSoLan) => {
        setSoLan(newSoLan);
        console.log("Giá trị số lần nhận được là:", newSoLan);
    };

    const handleCBLChange = (newCBL) => {
        setCBL(newCBL);
        console.log("Giá trị cảm biến lò nhận được là:", newCBL);
    };

    const handleDoThucTeChange = (newDoThucTe) => {
        setDoThucTe(newDoThucTe);
        console.log("Giá trị đo thực tế nhận được là:", newDoThucTe);
    };

    const handleSampleChange = (newSamples) => {
        setSamples(newSamples);
        console.log("Giá trị sample nhận được là:", newSamples);
    };

    const handleFanValuesChange = (newFanValues) => {
        setFanValues(newFanValues);
        console.log("Giá trị tốc độ quạt nhận được là:", newFanValues);
    };

    const [checkedCount, setCheckedCount] = useState(0);

    const handleCheckboxChange = (checkboxKey, isChecked) => {
        setCheckboxStates((prevStates) => ({
            ...prevStates,
            [checkboxKey]: isChecked ? 1 : 0,
        }));
    };

    useEffect(() => {
        const count = Object.values(checkboxStates).reduce(
            (acc, value) => acc + value,
            0
        );
        setCheckedCount(count);
    }, [checkboxStates]);

    // Get data Select
    useEffect(() => {
        // if(reason){
        //     loadPallets();
        // }

        setCheckboxStates({
            CT1: checkboxData.CT1 || 0,
            CT2: checkboxData.CT2 || 0,
            CT3: checkboxData.CT3 || 0,
            CT4: checkboxData.CT4 || 0,
            CT5: checkboxData.CT5 || 0,
            CT6: checkboxData.CT6 || 0,
            CT7: checkboxData.CT7 || 0,
            CT8: checkboxData.CT8 || 0,
            CT9: checkboxData.CT9 || 0,
            CT10: checkboxData.CT10 || 0,
            CT11: checkboxData.CT11 || 0,
            CT12: checkboxData.CT12 || 0,
        });
        // loadBOWData();
    }, [reason]);

    const handleSave = async () => {
        console.log("02. Dữ liệu checkbox: ", checkboxStates);
        const kilnCheckData = {
            PlanID: planID,
            CT1: checkboxStates.CT1,
            CT2: checkboxStates.CT2,
            CT3: checkboxStates.CT3,
            CT4: checkboxStates.CT4,
            CT5: checkboxStates.CT5,
            CT6: checkboxStates.CT6,
            CT7: checkboxStates.CT7,
            CT8: checkboxStates.CT8,
            CT9: checkboxStates.CT9,
            CT10: checkboxStates.CT10,
            CT11: checkboxStates.CT11,
            CT12: checkboxStates.CT12,
            SoLan: soLan,
            CBL: CBL,
            DoThucTe: doThucTe,
            CT11Detail: {
                M1: samples.M1,
                M2: samples.M2,
                M3: samples.M3,
                M4: samples.M4,
                M5: samples.M5,
            },
            CT12Detail: {
                Q1: fanValues.Q1,
                Q2: fanValues.Q2,
                Q3: fanValues.Q3,
                Q4: fanValues.Q4,
                Q5: fanValues.Q5,
                Q6: fanValues.Q6,
                Q7: fanValues.Q7,
                Q8: fanValues.Q8,
            },
        };

        console.log("02. Dữ liệu sẽ được đưa lên database: ", kilnCheckData);

        try {
            const response = await palletsApi.saveCheckingKiln(kilnCheckData);
            console.log("03. Kết quả trả về từ database: ", response);
            toast.success("Đã lưu thông tin.");
            if (typeof onCallback === "function") {
                onCallback();
            }
            // loadBOWData();
            console.log("04.Dữ liệu checkbox sau khi cập nhật:", checkboxData);
            onClose();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        const checkedCount = Object.values(checkboxStates).filter(
            (value) => value === 1
        ).length;

        console.log(checkedCount === 12 ? "Đạt" : "Không đạt");
    }, [checkboxStates]);

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
            props.onReload((prevState) => !prevState);

            toast.success("Vào lò thành công!");

            setSelectedPallet(null);

            // // Reload pallets
            onReloadPalletList(reason);
            if (typeof onCallback === "function") {
                onCallback();
            }

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
            console.log("06. Kết quả kiểm tra log sấy:", response);
            toast.success("Đã hoàn thành việc kiểm tra lò sấy!");
            setLoadKilnCheckingLoading(false);
            setIsCompleteChecking(true);
            if (typeof onCallback === "function") {
                onCallback();
            }
            onClose();
        } catch (error) {
            console.error("Error completing production check:", error);
            toast.error("Hiện không thể lưu thông tin. Hãy thử lại sau.");
            setLoadKilnCheckingLoading(false);
        }
    };

    const handleStartDrying = async () => {
        if (loadedPalletList.length === 0) {
            toast.error("Hãy cho pallet vào lò trước khi sấy.");
            onKilnClose();
        } else {
            try {
                setLoadStartDryingLoading(true);
                const response = await axios.patch(
                    "/api/ovens/production-run",
                    {
                        PlanID: planID,
                    }
                );
                onKilnClose();

                toast.success("Bắt đầu sấy thành công");
                console.log("Đã bắt đầu sấy gỗ!");
                setLoadStartDryingLoading(false);
                setDryingInProgress(true);
            } catch (error) {
                console.error("Error completing production check:", error);

                toast.error("Hiện không thể thực hiện hành động này.");
                setLoadStartDryingLoading(false);
            }
        }
    };

    const handleFinishDrying = async () => {
        try {
            setLoadFinishDryingLoading(true);
            const response = await axios.patch(
                "/api/ovens/production-completed",
                {
                    PlanID: planID,
                    result: "SD",
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
            ? "Đánh giá mẻ sấy"
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
                <div className="flex xl:flex-row flex-col xl:space-y-0 space-y-3 items-end gap-x-4 p-4">
                    <div className="pt-0 xl:w-[75%] w-full md:w-[85%]">
                        <label
                            htmlFor="company"
                            className="block mb-2 text-md font-medium text-gray-900 "
                        >
                            Chọn pallet
                        </label>
                        {/* <Select
                            placeholder="Chọn pallet"
                            // value={selectedPallet}
                            loadOptions={onReloadPalletList}
                            options={palletOptions}
                            onChange={(value) => {
                                console.log("Selected Pallet:", value);
                                setSelectedPallet(value);
                            }}
                            isLoading={palletListLoading}
                        /> */}
                        <Select
                            placeholder="Chọn pallet"
                            // value={selectedPallet}
                            loadOptions={onReloadPalletList}
                            options={palletOptions}
                            onChange={(value) => {
                                console.log("Selected Pallet:", value);
                                setSelectedPallet(value);
                            }}
                            isLoading={palletListLoading}
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
                {/* {status === 1 ? ( */}
                <div>
                    {/* {!isCompleteChecking ? ( */}
                    <div className="flex xl:flex-row flex-col xl:space-y-0 space-y-3 items-end gap-x-4 px-4 pt-6">
                        <div className="pt-0 xl:w-[85%] w-full md:w-[85%]">
                            <label
                                htmlFor="company"
                                className="block mb-2 text-md font-medium text-gray-900 "
                            >
                                Chọn pallet
                            </label>
                            <Select
                                placeholder="Chọn pallet"
                                // value={selectedPallet}
                                loadOptions={onReloadPalletList}
                                options={palletOptions}
                                onChange={(value) => {
                                    console.log("Selected Pallet:", value);
                                    setSelectedPallet(value);
                                }}
                                isLoading={palletListLoading}
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
                    {/* ) : null} */}
                </div>
                {/* ) : null} */}
                <div className="flex xl:flex-row flex-col items-end gap-x-4 p-4 xl:space-y-0 space-y-3">
                    <div className="space-y-1 xl:w-[75%]">
                        <div className="font-semibold">Chú ý:</div>
                        <div>
                            Lò sấy cần phải được kiểm tra trước khi bắt đầu sấy.
                        </div>
                    </div>
                    {isChecked === 1 ? (
                        <div className="flex bg-gray-200 text-gray-600 justify-center p-2 rounded-xl px-2 text-center gap-x-2 h-fit items-center xl:w-[25%] w-full">
                            <FaCheck className=" ml-2 text-xl" />
                            <div className="font-medium">Đã hoàn thành</div>
                        </div>
                    ) : (
                        <div className="xl:w-[25%] w-full">
                            {!isCompleteChecking ? (
                                <button
                                    className="bg-[#1F2937] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all items-end w-full"
                                    onClick={onOpen}
                                >
                                    Kiểm tra lò sấy
                                </button>
                            ) : (
                                <div className="flex bg-gray-200 text-gray-600 justify-center p-2 rounded-xl px-2 text-center h-fit items-center w-full gap-x-2 ">
                                    <FaCheck className=" ml-2 text-xl" />
                                    <div className="font-medium">
                                        Đã hoàn thành
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        ) : progress === "ls" ? (
            <div className="">
                {status === 2 ? (
                    !dryingInProgress ? (
                        <div className="flex xl:flex-row flex-col items-end gap-x-4 p-4 xl:space-y-0 space-y-3">
                            <div className="space-y-1 xl:w-[75%]">
                                <div className="font-semibold">Chú ý:</div>
                                <div>
                                    Thời gian sẽ bắt đầu được tính khi bấm bắt
                                    đầu sấy.
                                </div>
                            </div>
                            <button
                                className="bg-[#1F2937] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all items-end xl:w-[25%] w-full"
                                onClick={onKilnOpen}
                            >
                                Bắt đầu sấy
                            </button>
                        </div>
                    ) : (
                        <div className="flex xl:flex-row flex-col items-end gap-x-4 p-4 xl:space-y-0 space-y-3">
                            <div className="space-y-1 xl:w-[75%]">
                                <div className="font-semibold">Chú ý:</div>
                                <div>
                                    Thời gian sẽ bắt đầu được tính khi bấm bắt
                                    đầu sấy.
                                </div>
                            </div>
                            <div className="flex bg-gray-200 text-gray-600 justify-center p-2 rounded-xl  px-4 text-center h-fit items-center xl:w-[25%] w-full">
                                <CgSpinnerTwo className="animate-spin mr-2 text-xl" />
                                <div className="font-medium">Đang sấy...</div>
                            </div>
                        </div>
                    )
                ) : status === 3 && isReviewed === 0 ? (
                        <div className="flex xl:flex-row flex-col items-end gap-x-4 p-4 xl:space-y-0 space-y-3">
                            <div className="space-y-1 xl:w-[75%]">
                                <div className="font-semibold">Chú ý:</div>
                                <div>
                                    Thời gian sẽ bắt đầu được tính khi bấm bắt
                                    đầu sấy.
                                </div>
                            </div>
                            <div className="flex bg-gray-200 text-gray-600 justify-center p-2 rounded-xl  px-4 text-center h-fit items-center xl:w-[25%] w-full">
                                <CgSpinnerTwo className="animate-spin mr-2 text-xl" />
                                <div className="font-medium">Đang sấy...</div>
                            </div>
                        </div>
                ) : status === 3 && isReviewed === 1 ? (
                    <div className="flex xl:flex-row flex-col items-end gap-x-4 p-4 xl:space-y-0 space-y-3">
                            <div className=" space-y-1 w-full xl:w-[75%]">
                                <div className="font-semibold">
                                    Tình trạng mẻ sấy:
                                </div>
                                <div className="text-green-500">
                                    Mẻ sấy đã đủ điều kiện ra lò.
                                </div>
                            </div>
                            <button
                                className="bg-[#1F2937] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all items-end w-full xl:w-[25%]"
                                onClick={onFinalOpen}
                            >
                                Xác nhận ra lò
                            </button>
                        </div>
                ) : null}
            </div>
        ) : progress === "dg" ? (
            <div className="">
                <div className="flex xl:flex-row flex-col items-end gap-x-4 p-4 xl:space-y-0 space-y-3">
                    {isReviewed === 1 && status === 3 ? (
                        <>
                            <div className=" space-y-1 w-full xl:w-[75%]">
                                <div className="font-semibold">
                                    Tình trạng mẻ sấy:
                                </div>
                                <div className="text-green-500">
                                    Mẻ sấy đã đủ điều kiện ra lò.
                                </div>
                            </div>
                            {/* <button
                                className="bg-[#1F2937] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all items-end w-full xl:w-[25%]"
                                onClick={onFinalOpen}
                            >
                                Xác nhận ra lò
                            </button> */}
                        </>
                    ) : (
                        <>
                            <div className=" space-y-1 w-full xl:w-[75%]">
                                <div className="font-semibold">
                                    Tình trạng mẻ sấy:
                                </div>
                                <div className="text-red-500">
                                    Mẻ sấy chưa đủ điều kiện ra lò.
                                </div>
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
        <div className="bg-white border-2 border-gray-300 rounded-xl">
            {/* Header */}
            <div className="flex flex-col p-3 border-b border-gray-200">
                <div className="flex items-center gap-x-3 font-medium">
                    <PiCaretCircleDoubleRightFill className="text-2xl w-8 h-8 text-[#17506B]" />
                    <div className="serif font-bold xl:text-2xl xl:w-full w-[70%] text-[23px]">
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
                            {checkingDataLoading ? (
                                <div className="w-full h-full xl:pt-60 lg:pt-60 md:pt-60 pt-40 flex items-center justify-center">
                                    <Spinner
                                        thickness="4px"
                                        speed="0.65s"
                                        emptyColor="gray.200"
                                        color="#155979"
                                        size="xl"
                                    />
                                </div>
                            ) : (
                                <div className="w-full xl:px-10 xl:pb-4 grid xl:grid-cols-4 lg:grid-cols-4 mb-4 gap-6">
                                    {/* Hiển thị tất cả giá trị checkItems */}
                                    <>
                                        {checkItems.map((item, index) => (
                                            <CheckListItem
                                                key={`CT${index + 1}`}
                                                itemKey={`CT${index + 1}`}
                                                value={item.value}
                                                title={item.title}
                                                description={item.description}
                                                isChecked={
                                                    checkboxStates[
                                                        `CT${index + 1}`
                                                    ] === 1
                                                }
                                                onCheckboxChange={(isChecked) =>
                                                    handleCheckboxChange(
                                                        `CT${index + 1}`,
                                                        isChecked
                                                    )
                                                }
                                                isDisabled={
                                                    checkboxData[
                                                        `CT${item.value}`
                                                    ] === 1
                                                }
                                                defaultChecked={
                                                    checkboxData[
                                                        `CT${item.value}`
                                                    ] === 1
                                                }
                                                fixedSoLan={checkData.SoLan}
                                                fixedCBL={checkData.CBL}
                                                fixedDoThucTe={
                                                    checkData.DoThucTe
                                                }
                                                fixedSamples={CT11Data}
                                                fixedFanValues={CT12Data}
                                                onSoLanChange={
                                                    handleSoLanChange
                                                }
                                                onCBLChange={handleCBLChange}
                                                onDoThucTeChange={
                                                    handleDoThucTeChange
                                                }
                                                onSampleChange={
                                                    handleSampleChange
                                                }
                                                onFanValuesChange={
                                                    handleFanValuesChange
                                                }
                                            />
                                        ))}
                                    </>
                                </div>
                            )}
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
                                    className="bg-gray-300  p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit w-full"
                                >
                                    Đóng
                                </button>
                                {checkedCount === 12 ? (
                                    <button
                                        className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit w-full"
                                        onClick={handleCompleteCheckingKiln}
                                    >
                                        {loadKilnCheckingLoading ? (
                                            <div className="flex justify-center items-center space-x-4">
                                                <Spinner
                                                    size="sm"
                                                    color="white"
                                                />
                                                <div>Đang tải</div>
                                            </div>
                                        ) : (
                                            "Hoàn thành"
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSave}
                                        className="bg-gray-800 text-white p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full"
                                    >
                                        Lưu lại
                                    </button>
                                )}
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
                size="sm"
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Bạn chắc chắn muốn sấy?</ModalHeader>
                    <ModalBody pb={6}>
                        Sau khi bấm xác nhận sẽ không thể thu hồi hành động.
                    </ModalBody>

                    <ModalFooter>
                        <div className="flex w-full xl:justify-end lg:justify-end md:justify-end gap-x-3">
                            <button
                                onClick={onKilnClose}
                                className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit w-full active:duration-75 transition-all"
                            >
                                Đóng
                            </button>
                            <button
                                className="flex justify-center items-center bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit w-full active:duration-75 transition-all"
                                onClick={handleStartDrying}
                            >
                                {loadStartDryingLoading ? (
                                    <div className="flex  justify-center items-center space-x-4">
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
                size="sm"
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Bạn chắc chắn muốn ra lò?</ModalHeader>
                    <ModalBody pb={6}>
                        Bấm xác nhận để hoàn thành quy trình sấy gỗ.
                    </ModalBody>

                    <ModalFooter>
                        <div className="w-full flex xl:justify-end lg:justify-end md:justify-end gap-x-3">
                            <button
                                onClick={onFinalClose}
                                className="w-full bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                            >
                                Đóng
                            </button>
                            <button
                                className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit w-full active:duration-75 transition-all"
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
