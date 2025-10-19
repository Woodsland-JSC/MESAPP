import React, { useState, useEffect } from "react";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
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
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
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
import toast from "react-hot-toast";
import "../assets/styles/index.css";
import { set } from "date-fns";

function CheckListItem(props) {
    const {
        value,
        title,
        description,
        onCheckboxChange,
        isChecked,
        isDisabled,
        defaultChecked,
        fixedSoLan,
        fixedCBL,
        fixedDoThucTe,
        fixedSamples,
        fixedFanValues,
        onSoLanChange,
        onCBLChange,
        onDoThucTeChange,
        onSampleChange,
        onFanValuesChange,
    } = props;

    const {
        isOpen: isNo7Open,
        onOpen: onNo7Open,
        onClose: onNo7Close,
    } = useDisclosure();
    const {
        isOpen: isNo8Open,
        onOpen: onNo8Open,
        onClose: onNo8Close,
    } = useDisclosure();
    const {
        isOpen: isNo11Open,
        onOpen: onNo11Open,
        onClose: onNo11Close,
    } = useDisclosure();
    const {
        isOpen: isNo12Open,
        onOpen: onNo12Open,
        onClose: onNo12Close,
    } = useDisclosure();

    const [localIsChecked, setLocalIsChecked] = useState(false);

    const [soLan, setSoLan] = useState("");
    const [note, setNote] = useState("");
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

    useEffect(() => {}, [fixedSamples]);

    useEffect(() => {
        if (fixedSoLan) {
            setSoLan(fixedSoLan);
        }
        if (fixedCBL) {
            setCBL(fixedCBL);
        }
        if (fixedDoThucTe) {
            setDoThucTe(fixedDoThucTe);
        }

        if (fixedSamples) {
            setSamples((prevSamples) => ({
                ...prevSamples,
                ...fixedSamples,
            }));
        }

        if (fixedFanValues) {
            setFanValues(fixedFanValues);
        }
    }, [fixedSoLan, fixedCBL, fixedDoThucTe, fixedSamples, fixedFanValues]);

    const handleCheckboxNo7Change = (value) => {
        if (soLan === 0 || soLan === "") {
            toast.error("Giá trị không được bỏ trống.");
        } else if (soLan < 1) {
            toast.error("Số lần phải lớn hơn 1.");
        } else if (soLan > 3) {
            // let _soLan = `${soLan}_${note}`;
            // onSoLanChange(_soLan);
            // toast.success("Dữ liệu đã được cập nhật.");
            // onNo7Close();
            toast.error("Số lần phải nhỏ hơn 3.");
        } else {
            onCheckboxChange(!localIsChecked);
            setLocalIsChecked(!localIsChecked);
            onCheckboxChange(1);
            let _soLan = `${soLan}_${note}`;
            onSoLanChange(_soLan);
            toast.success("Dữ liệu đã được cập nhật.");
            onNo7Close();
        }
    };


    const handleCheckboxNo8Change = (value) => {
        if (CBL === 0) {
            toast.error("Số cảm biến lò không được bỏ trống.");
        } else if (doThucTe === 0) {
            toast.error("Số đo thực tế không được bỏ trống.");
        } else if (CBL <= 1 || doThucTe <= 1) {
            toast.error("Giá trị cảm biến lò và số đo thực tế phải lớn hơn 1.");
        } else if (Math.abs(CBL - doThucTe) > 2) {
            toast.error(
                "Cảm biến lò không được sai khác quá 2 độ so với số đo thực tế."
            );
        } else {
            onCheckboxChange(!localIsChecked);
            setLocalIsChecked(!localIsChecked);
            onCheckboxChange(1);
            onCBLChange(CBL);
            onDoThucTeChange(doThucTe);
            toast.success("Dữ liệu đã được lưu.");
            onNo8Close();
        }
    };

    const handleCheckboxNo11Change = () => {
        console.log("Dữ liệu đã ghi nhận", samples);
        if (Object.values(samples).some((sample) => !sample)) {
            toast.error("Vui lòng nhập đầy đủ thông tin mẫu.");
            return;
        }

        const invalidSample = Object.values(samples).some((sample) =>
            sample.includes(" ")
        );

        if (invalidSample) {
            toast.error(
                'Các kích thước phải được cách nhau bằng dấu "/". (Ví dụ: 21/21/22/21/22)'
            );
            return;
        }

        const wrongCount = Object.values(samples).some((sample) => {
            const parts = sample.split("/");
            return parts.length !== 5;
        });

        if (wrongCount) {
            toast.error(
                "Bạn phải nhập đúng 5 kích thước, ví dụ: 21/21/22/21/22"
            );
            return;
        }

        onCheckboxChange(!localIsChecked);
        setLocalIsChecked(!localIsChecked);
        onCheckboxChange(1);

        onSampleChange(samples);
        toast.success("Dữ liệu đã được lưu.");
        onNo11Close();
    };

    const handleCheckboxNo12Change = () => {
        const entries = Object.entries(fanValues || {});

        // Chỉ lấy NHỮNG MẪU ĐÃ NHẬP
        const isFilled = (v) =>
            v !== null && v !== undefined && String(v).trim() !== "";
        const filled = entries.filter(([_, v]) => isFilled(v));

        // 1) Kiểm tra đủ số lượng tối thiểu (>= 4 mẫu đã nhập)
        if (filled.length < 4) {
            // (tuỳ chọn) gợi ý một vài key đang trống để người dùng biết nên nhập thêm
            const emptyKeys = entries
                .filter(([_, v]) => !isFilled(v))
                .map(([k]) => k);

            toast.error(
                `Vui lòng nhập tối thiểu 4 mẫu thử. (hiện có ${filled.length} mẫu)`
            );
            return;
        }

        // 2) Kiểm tra giá trị (chỉ kiểm tra TRÊN NHỮNG MẪU ĐÃ NHẬP)
        const firstInvalid = filled.find(([key, v]) => {
            const num = Number(v);
            return !(num && num >= 1);
        });

        if (firstInvalid) {
            const [key, v] = firstInvalid;
            toast.error(
                `Mẫu "${key}" có giá trị "${v}" không hợp lệ (phải là số nguyên > 1).`
            );
            return;
        }

        // 3) Hợp lệ -> lưu
        onCheckboxChange(!localIsChecked);
        setLocalIsChecked(!localIsChecked);
        onCheckboxChange(1);
        onFanValuesChange(fanValues);
        toast.success("Dữ liệu đã được lưu.");
        onNo12Close();
    };

    const handleSoLanOnChange = (value) => {
        setSoLan(value);
    };

    const handleCBLOnChange = (value) => {
        setCBL(value);
    };

    const handleDoThucTeOnChange = (value) => {
        setDoThucTe(value);
    };

    const handleSampleInputChange = (sampleKey, value) => {
        setSamples((prevSamples) => ({ ...prevSamples, [sampleKey]: value }));
    };

    const handleFanInputChange = (field, value) => {
        setFanValues((prevValues) => ({
            ...prevValues,
            [field]: value,
        }));
    };

    return (
        <div
            className={` flex relative flex-col rounded-2xl w-full h-fit xl:h-[14rem] lg:h-[14rem] md:h-[14rem] border-2  ${
                isDisabled
                    ? "border-gray-200 bg-gray-50"
                    : "border-[#99b4c1] hover:shadow-[rgba(7,_65,_210,_0.1)_0px_9px_30px] hover:border-[#96d1ed] bg-[#f9feff] "
            }`}
        >
            {/* <div className="absolute -top-1 -right-0.5 bg-green-500 shadow-sm shadow-black text-white w-4 h-4 flex items-center justify-center rounded-full" /> */}
            <div
                className={`px-4 py-3  h-[30%] rounded-t-2xl w-full flex items-center border-b border-gray-200 ${
                    isDisabled ? "bg-gray-100" : " bg-[#eef9fe] "
                }`}
            >
                <Checkbox
                    value={value}
                    isChecked={isChecked}
                    onChange={() => onCheckboxChange(!isChecked)}
                    isDisabled={isDisabled ? true : false}
                    defaultChecked={defaultChecked ? true : false}
                    // onChange={handleCheckboxChange}
                    size="lg"
                    colorScheme="blue"
                    className="w-full disabled:text-gray-600"
                >
                    <div
                        className={`tx-[#155979] text-[1.05rem] ml-1 font-semibold ${
                            isDisabled ? "disabled:text-gray-600" : null
                        }`}
                    >
                        {title}
                    </div>
                </Checkbox>
            </div>

            <div className="px-4 xl:h-[70%] lg:h-[70%] text-base py-3">
                <div
                    className={`xl:h-[65%] lg:h-[65%] ${
                        isDisabled ? "text-gray-500" : null
                    }`}
                >
                    {description}
                </div>
                <div className="xl:h-[35%] lg:h-[35%]  flex w-full ">
                    {value === 7 ? (
                        <>
                            {isDisabled ? (
                                <Popover placement="auto-start">
                                    <PopoverTrigger>
                                        <button className="bg-[#DBDFE1] w-full h-fit px-4 py-2 rounded-2xl mt-2 xl:my-0 lg:my-0 cursor-pointer ">
                                            Lịch sử ghi nhận
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverHeader className="font-semibold !py-3">
                                            Lịch sử ghi nhận
                                        </PopoverHeader>
                                        <PopoverBody>
                                            Số lần :{" "}
                                            <span>
                                                {fixedSoLan || "Chưa kiểm tra"}
                                            </span>
                                        </PopoverBody>
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <div className="flex w-full">
                                    <Popover placement="auto-start">
                                        <PopoverTrigger>
                                            <button className="bg-[#DBDFE1] h-fit px-4 py-2 rounded-xl mt-4 xl:my-0 lg:my-0 cursor-pointer mr-3 w-full">
                                                Lịch sử
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverHeader className="font-semibold !py-3">
                                                Lịch sử ghi nhận
                                            </PopoverHeader>
                                            <PopoverBody>
                                                <span className="font-medium text-gray-700">
                                                    Số lần :{" "}
                                                </span>
                                                <span>
                                                    {soLan || "Chưa ghi nhận"}
                                                </span>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>
                                    <button
                                        className="h-fit bg-gray-700 text-white px-4 py-2 rounded-xl mt-4 xl:my-0 lg:my-0 md:my-0 cursor-pointer active:scale-[.95] active:duration-75 transition-all w-full text-center"
                                        onClick={onNo7Open}
                                    >
                                        Kiểm tra
                                    </button>
                                    <Modal
                                        isOpen={isNo7Open}
                                        isCentered
                                        onClick={onNo7Close}
                                        size="xs"
                                        className="rounded-xl"
                                    >
                                        <ModalOverlay />
                                        <ModalContent>
                                            <ModalHeader>
                                                <div className="text-lg">
                                                    Giấy cảm biến đo EMC
                                                </div>
                                            </ModalHeader>
                                            <ModalBody>
                                                <div className="mb-2">
                                                    <label
                                                        htmlFor="soLan"
                                                        className="block mb-2 text-md font-medium text-gray-900 "
                                                    >
                                                        Số lần
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="soLan"
                                                        className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                        value={soLan}
                                                        placeholder="Nhập số lần"
                                                        onChange={(e) =>
                                                            handleSoLanOnChange(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="note"
                                                        className="block mb-2 text-md font-medium text-gray-900 "
                                                    >
                                                        Ghi chú
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="note"
                                                        className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                        value={note}
                                                        placeholder="Nhập ghi chú"
                                                        onChange={(e) =>
                                                            setNote(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </ModalBody>

                                            <ModalFooter className="flex gap-x-4 w-full ">
                                                <button
                                                    type="button"
                                                    onClick={onNo7Close}
                                                    className="text-gray-800 bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl w-full px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    type="button"
                                                    className="text-white bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                                    onClick={
                                                        handleCheckboxNo7Change
                                                    }
                                                >
                                                    Xác nhận
                                                </button>
                                            </ModalFooter>
                                        </ModalContent>
                                    </Modal>
                                </div>
                            )}
                        </>
                    ) : value === 8 ? (
                        <>
                            {isDisabled ? (
                                <Popover placement="auto-start">
                                    <PopoverTrigger>
                                        <button className="w-full bg-[#DBDFE1] px-4 h-fit py-2 rounded-xl mt-4 xl:my-0 lg:my-0">
                                            Lịch sử
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverHeader className="font-semibold !py-3">
                                            Lịch sử ghi nhận
                                        </PopoverHeader>
                                        <PopoverBody>
                                            <div className="space-y-2">
                                                <div>
                                                    Cảm biến lò :{" "}
                                                    <span>{fixedCBL}</span>
                                                </div>
                                                <div>
                                                    Đo thực tế :{" "}
                                                    <span>{fixedDoThucTe}</span>
                                                </div>
                                            </div>
                                        </PopoverBody>
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <>
                                    <Popover placement="auto-start">
                                        <PopoverTrigger>
                                            <button className="w-full text-center bg-[#DBDFE1] px-4 h-full py-2 rounded-xl mt-4 xl:my-0 lg:my-0 mr-3">
                                                Lịch sử
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverHeader className="font-semibold !py-3">
                                                Lịch sử ghi nhận
                                            </PopoverHeader>
                                            <PopoverBody>
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="font-semibold text-gray-700">
                                                            Cảm biến lò :{" "}
                                                        </span>
                                                        <span>
                                                            {CBL ||
                                                                "Chưa kiểm tra"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-700">
                                                            Đo thực tế :{" "}
                                                        </span>
                                                        <span>
                                                            {doThucTe ||
                                                                "Chưa kiểm tra"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>
                                    <button
                                        className="h-fit w-full bg-gray-700 text-white px-4 py-2 rounded-xl mt-4 xl:my-0 lg:my-0 cursor-pointer active:scale-[.95] active:duration-75 transition-all"
                                        onClick={onNo8Open}
                                    >
                                        Kiểm tra
                                    </button>
                                    <Modal
                                        isOpen={isNo8Open}
                                        isCentered
                                        onClick={onNo8Close}
                                        size="xs"
                                    >
                                        <ModalOverlay />
                                        <ModalContent>
                                            <ModalHeader>
                                                <div className="text-lg">
                                                    Cảm biến nhiệt độ trong lò
                                                    sấy
                                                </div>
                                            </ModalHeader>
                                            <ModalBody>
                                                <div>
                                                    <label
                                                        htmlFor="CBL"
                                                        className="block mb-2 text-md font-medium text-gray-900 "
                                                    >
                                                        Cảm biến lò{" "}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="CBL"
                                                        className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                        value={fixedCBL}
                                                        placeholder="Nhập số cảm biến lò"
                                                        onChange={(e) =>
                                                            handleCBLOnChange(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="mt-4">
                                                    <label
                                                        htmlFor="quantity"
                                                        className="block mb-2 text-md font-medium text-gray-900 "
                                                    >
                                                        Đo thực tế{" "}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="doThucTe"
                                                        className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                        value={fixedDoThucTe}
                                                        placeholder="Nhập số đo thực tế"
                                                        onChange={(e) =>
                                                            handleDoThucTeOnChange(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </ModalBody>

                                            <ModalFooter className="flex gap-x-4">
                                                <button
                                                    type="button"
                                                    onClick={onNo8Close}
                                                    className="text-gray-800 bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    type="button"
                                                    className="text-white bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                                    onClick={
                                                        handleCheckboxNo8Change
                                                    }
                                                >
                                                    Xác nhận
                                                </button>
                                            </ModalFooter>
                                        </ModalContent>
                                    </Modal>
                                </>
                            )}
                        </>
                    ) : value === 11 ? (
                        <>
                            {isDisabled ? (
                                <Popover placement="auto-start">
                                    <PopoverTrigger>
                                        <button className="w-full bg-[#DBDFE1] px-4 h-fit py-2 rounded-xl mt-4 xl:my-0 lg:my-0">
                                            Lịch sử
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverHeader className="font-semibold !py-3">
                                            Lịch sử ghi nhận
                                        </PopoverHeader>
                                        <PopoverBody>
                                            <div className="space-y-2">
                                                {Object.entries(
                                                    fixedSamples || {}
                                                ).map(([key, value], index) => (
                                                    <div key={key}>
                                                        Mẫu {index + 1} :{" "}
                                                        <span>{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </PopoverBody>
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <>
                                    <Popover placement="auto-start">
                                        <PopoverTrigger>
                                            <button className="w-full bg-[#DBDFE1] px-4 h-fit py-2 rounded-xl mt-4 xl:my-0 lg:my-0 mr-3">
                                                Lịch sử
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverHeader className="font-semibold !py-3">
                                                Lịch sử ghi nhận
                                            </PopoverHeader>
                                            <PopoverBody>
                                                <div className="space-y-2">
                                                    {Object.entries(
                                                        samples
                                                    ).map(
                                                        (
                                                            [key, value],
                                                            index
                                                        ) => (
                                                            <div key={key}>
                                                                <span className="text-gray-700 font-semibold">
                                                                    Mẫu{" "}
                                                                    {index + 1}{" "}
                                                                    :{" "}
                                                                </span>
                                                                <span>
                                                                    {value ||
                                                                        "Chưa kiểm tra"}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>
                                    <button
                                        className="w-full h-fit bg-gray-700 text-white px-4  py-2 rounded-xl mt-4 xl:my-0 lg:my-0 cursor-pointer active:scale-[.95] active:duration-75 transition-all"
                                        onClick={onNo11Open}
                                    >
                                        Kiểm tra
                                    </button>
                                    <Modal
                                        isOpen={isNo11Open}
                                        isCentered
                                        onClick={onNo11Close}
                                        // className="xl:px-0 lg:px-0 md:px-0 px-4"
                                        size="xs"
                                    >
                                        <ModalOverlay />
                                        <ModalContent>
                                            <ModalHeader>
                                                <div className="">
                                                    <p className="text-lg">
                                                        Chiều dày thực tế
                                                    </p>
                                                </div>
                                            </ModalHeader>
                                            <ModalBody className="space-y-4">
                                                {Object.entries(samples).map(
                                                    ([key, value], index) => (
                                                        <div key={key}>
                                                            <label
                                                                htmlFor={`batch_id_${key}`}
                                                                className="block mb-2 text-md font-medium text-gray-900"
                                                            >
                                                                Mẫu {index + 1}{" "}
                                                                <span className="text-red-500">
                                                                    *
                                                                </span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id={`batch_id_${key}`}
                                                                className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                                value={value}
                                                                placeholder="xx/xx/xx/xx/xx"
                                                                onChange={(e) =>
                                                                    handleSampleInputChange(
                                                                        key,
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    )
                                                )}
                                            </ModalBody>

                                            <ModalFooter className="flex space-x-4">
                                                <button
                                                    type="button"
                                                    onClick={onNo11Close}
                                                    className="text-gray-800 bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    type="button"
                                                    className="text-white bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                                    onClick={
                                                        handleCheckboxNo11Change
                                                    }
                                                >
                                                    Xác nhận
                                                </button>
                                            </ModalFooter>
                                        </ModalContent>
                                    </Modal>
                                </>
                            )}
                        </>
                    ) : value === 12 ? (
                        <>
                            {isDisabled ? (
                                <Popover placement="auto-start">
                                    <PopoverTrigger>
                                        <button className="w-full bg-[#DBDFE1] h-fit px-4 py-2 rounded-xl mt-4 xl:my-0 lg:my-0">
                                            Ghi nhận
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverHeader className="font-semibold !py-3">
                                            Lịch sử ghi nhận
                                        </PopoverHeader>
                                        <PopoverBody>
                                            <div className="xl:grid grid-cols-2 xl:space-y-0 lg:space-y-0 md:space-y-0 gap-2 space-y-2">
                                                {Object.entries(
                                                    fixedFanValues || {}
                                                ).map(([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="gap-2 col-span-2"
                                                    >
                                                        <div>
                                                            <span className="text-gray-700 font-semibold">
                                                                {`Quạt ${key.substring(
                                                                    1
                                                                )} : `}
                                                            </span>
                                                            <span>{value ? value + " " + "m/s" : "Chưa ghi nhận"}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </PopoverBody>
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <>
                                    <Popover placement="auto-start">
                                        <PopoverTrigger>
                                            <button className="w-full bg-[#DBDFE1] h-fit px-4 py-2 rounded-xl mt-4 xl:my-0 lg:my-0 mr-3">
                                                Lịch sử
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverHeader className="font-semibold !py-3">
                                                Lịch sử ghi nhận
                                            </PopoverHeader>
                                            <PopoverBody className="!shadown-xl">
                                                <div className=" xl:grid grid-cols-2 xl:space-y-0 lg:space-y-0 md:space-y-0 gap-y-2">
                                                    {Object.entries(
                                                        fanValues
                                                    ).map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="space-y-3 gap-y-3 col-span-2"
                                                        >
                                                            <div>
                                                                <span className="font-medium text-gray-700">
                                                                    {`Quạt ${key.substring(
                                                                        1
                                                                    )} : `}
                                                                </span>
                                                                <span>
                                                                    {value
                                                                        ? value +
                                                                          "m/s"
                                                                        : "Chưa kiểm tra"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>
                                    <button
                                        className="w-full bg-gray-700 text-white h-fit px-4 py-2 rounded-xl mt-4 xl:my-0 lg:my-0 cursor-pointer active:scale-[.95] active:duration-75 transition-all"
                                        onClick={onNo12Open}
                                    >
                                        Kiểm tra
                                    </button>
                                    <Modal
                                        isOpen={isNo12Open}
                                        isCentered
                                        onClick={onNo12Close}
                                        // className="xl:px-0 lg:px-0 md:px-0 px-4"
                                        size="xs"
                                    >
                                        <ModalOverlay />
                                        <ModalContent>
                                            <ModalHeader>
                                                <div className="text-lg">
                                                    Động cơ quạt, tốc độ gió
                                                    quạt
                                                    <p className="!font-normal text-[16px] text-red-500">
                                                        Nhập tối thiểu 4 mẫu
                                                        thử.
                                                    </p>
                                                </div>
                                            </ModalHeader>
                                            <ModalBody
                                                className="!rounded-xl"
                                                borderRadius={"xl"}
                                            >
                                                <div className="max-h-[420px] w-full overflow-y-scroll pr-5 xl:space-y-0 lg:space-y-0 md:space-y-0 space-y-2">
                                                    <div className="space-y-2">
                                                        {Object.entries(
                                                            fanValues
                                                        ).map(
                                                            ([key, value]) => (
                                                                <div key={key}>
                                                                    <label
                                                                        htmlFor={
                                                                            key
                                                                        }
                                                                        className="block mb-2 text-md font-medium text-gray-900"
                                                                    >
                                                                        {`Quạt ${key.substring(
                                                                            1
                                                                        )}`}
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        id={key}
                                                                        className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                                        placeholder="Nhập tốc độ gió (m/s)"
                                                                        value={
                                                                            value
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleFanInputChange(
                                                                                key,
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </ModalBody>

                                            <ModalFooter className="flex space-x-4">
                                                <button
                                                    type="button"
                                                    onClick={onNo12Close}
                                                    className="text-gray-800 bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    type="button"
                                                    className="text-white bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                                    onClick={
                                                        handleCheckboxNo12Change
                                                    }
                                                >
                                                    Xác nhận
                                                </button>
                                            </ModalFooter>
                                        </ModalContent>
                                    </Modal>
                                </>
                            )}
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default CheckListItem;
