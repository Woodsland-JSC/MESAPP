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

    useEffect(() => {
        if (fixedSamples) {
            setSamples((prevSamples) => ({
                ...prevSamples,
                ...fixedSamples,
            }));
        }
    }, [fixedSamples]);

    useEffect(() => {
        if (fixedFanValues) {
            setFanValues(fixedFanValues);
        }
    }, [fixedFanValues]);

    const handleCheckboxNo7Change = (value) => {
        if (soLan === 0 || soLan === "") {
            toast.error("Giá trị không được bỏ trống.");
        } else if (soLan > 3) {
            onSoLanChange(soLan);
            toast("Dữ liệu đã được lưu.");
            onNo7Close();
        } else {
            onCheckboxChange(!localIsChecked);
            setLocalIsChecked(!localIsChecked);
            onCheckboxChange(value ? 1 : 0);
            onSoLanChange(soLan);
            toast("Dữ liệu đã được lưu.");
            onNo7Close();
        }
    };

    const handleCheckboxNo8Change = (value) => {
        if (CBL === 0) {
            toast.error("Số cảm biến lò không được bỏ trống.");
        } else if (doThucTe === 0) {
            toast.error("Số đo thực tế không được bỏ trống.");
        } else if (Math.abs(CBL - doThucTe) > 3) {
            onCBLChange(CBL);
            onDoThucTeChange(doThucTe);
            toast("Dữ liệu đã được lưu.");
            onNo8Close();
        } else {
            onCheckboxChange(!localIsChecked);
            setLocalIsChecked(!localIsChecked);
            onCheckboxChange(value ? 1 : 0);
            onCBLChange(CBL);
            onDoThucTeChange(doThucTe);
            toast("Dữ liệu đã được lưu.");
            onNo8Close();
        }

    };

    const handleCheckboxNo11Change = () => {
        if (Object.values(samples).some((sample) => !sample)) {
            toast.error("Vui lòng nhập đầy đủ thông tin mẫu.");
        } else {
            onCheckboxChange(!localIsChecked);
            setLocalIsChecked(!localIsChecked);
            onCheckboxChange(1);

            onSampleChange(samples);
            toast("Dữ liệu đã được lưu.");
            onNo11Close();
        }
    };

    const handleCheckboxNo12Change = () => {
        if (Object.values(fanValues).some((value) => !value)) {
            toast.error("Vui lòng nhập đầy đủ thông tin cho tất cả các quạt");
        } else {
            onCheckboxChange(!localIsChecked);
            setLocalIsChecked(!localIsChecked);
            onCheckboxChange(1);
            onFanValuesChange(fanValues);
            toast("Dữ liệu đã được lưu.");
            onNo12Close();
        }
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
            className={` flex relative flex-col rounded-xl w-full h-fit xl:h-[13.5rem] lg:h-[13.5rem] md:h-[13.5rem] border-2  ${
                isDisabled
                    ? "border-gray-200 bg-gray-50"
                    : "border-[#99b4c1] hover:shadow-[rgba(7,_65,_210,_0.1)_0px_9px_30px] hover:border-[#96d1ed] bg-[#f6feff] "
            }`}
        >
            {/* <div className="absolute -top-1 -right-0.5 bg-green-500 shadow-sm shadow-black text-white w-4 h-4 flex items-center justify-center rounded-full" /> */}
            <div
                className={`px-4 py-3  h-[30%] rounded-t-xl w-full flex items-center border-b border-gray-200 ${
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
                    className={`xl:h-[70%] lg:h-[70%] ${
                        isDisabled ? "text-gray-500" : null
                    }`}
                >
                    {description}
                </div>
                <div className="xl:h-[30%] lg:h-[30%]  flex justify-end ">
                    {value === 7 ? (
                        <>
                            {isDisabled ? (
                                <Popover>
                                    <PopoverTrigger>
                                        <button className="bg-[#DBDFE1] h-fit px-4 py-1 rounded-lg mt-4 xl:my-0 lg:my-0 cursor-pointer">
                                            Ghi nhận
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverHeader>
                                            Ghi nhận tình trạng
                                        </PopoverHeader>
                                        <PopoverBody>
                                            Số lần : <span>{fixedSoLan}</span>
                                        </PopoverBody>
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <>
                                    <Popover>
                                        <PopoverTrigger>
                                            <button className="bg-[#DBDFE1] h-fit px-4 py-1 rounded-lg mt-4 xl:my-0 lg:my-0 cursor-pointer mr-3">
                                                Ghi nhận
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverHeader>
                                                Ghi nhận tình trạng
                                            </PopoverHeader>
                                            <PopoverBody>
                                                Số lần : <span>{soLan}</span>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>
                                    <div
                                        className="h-fit bg-gray-700 text-white px-4 py-1 rounded-lg mt-4 xl:my-0 lg:my-0 md:my-0 cursor-pointer active:scale-[.95] active:duration-75 transition-all"
                                        onClick={onNo7Open}
                                    >
                                        Kiểm tra
                                    </div>
                                    <Modal
                                        isOpen={isNo7Open}
                                        isCentered
                                        onClick={onNo7Close}
                                        size="xs"
                                    >
                                        <ModalOverlay />
                                        <ModalContent>
                                            <ModalHeader>
                                                <div className="text-lg">
                                                    Giấy cảm biến đo EMC
                                                </div>
                                            </ModalHeader>
                                            <ModalBody>
                                                <div>
                                                    <label
                                                        htmlFor="soLan"
                                                        className="block mb-2 text-md font-medium text-gray-900 "
                                                    >
                                                        Số lần
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="soLan"
                                                        className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                        value={fixedSoLan}
                                                        onChange={(e) =>
                                                            handleSoLanOnChange(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </ModalBody>

                                            <ModalFooter className="flex gap-x-4 ">
                                                <button
                                                    type="button"
                                                    onClick={onNo7Close}
                                                    className="text-white bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    type="button"
                                                    className="text-white bg-[#3182CE] focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                                    onClick={
                                                        handleCheckboxNo7Change
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
                    ) : value === 8 ? (
                        <>
                            {isDisabled ? (
                                <Popover>
                                    <PopoverTrigger>
                                        <button className="bg-[#DBDFE1] px-4 h-fit py-1 rounded-lg mt-4 xl:my-0 lg:my-0">
                                            Ghi nhận
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverHeader>
                                            Ghi nhận tình trạng
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
                                    <Popover>
                                        <PopoverTrigger>
                                            <button className="bg-[#DBDFE1] px-4 h-fit py-1 rounded-lg mt-4 xl:my-0 lg:my-0 mr-3">
                                                Ghi nhận
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverHeader>
                                                Ghi nhận tình trạng
                                            </PopoverHeader>
                                            <PopoverBody>
                                                <div className="space-y-2">
                                                    <div>
                                                        Cảm biến lò :{" "}
                                                        <span>{CBL}</span>
                                                    </div>
                                                    <div>
                                                        Đo thực tế :{" "}
                                                        <span>{doThucTe}</span>
                                                    </div>
                                                </div>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>
                                    <div
                                        className="h-fit bg-gray-700 text-white px-4 py-1 rounded-lg mt-4 xl:my-0 lg:my-0 cursor-pointer active:scale-[.95] active:duration-75 transition-all"
                                        onClick={onNo8Open}
                                    >
                                        Kiểm tra
                                    </div>
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
                                                        Cảm biến lò
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="CBL"
                                                        className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                        value={fixedCBL}
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
                                                        Đo thực tế
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="doThucTe"
                                                        className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                        value={fixedDoThucTe}
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
                                                    className="text-white bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    type="button"
                                                    className="text-white bg-[#3182CE] focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
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
                                <Popover>
                                    <PopoverTrigger>
                                        <button className="bg-[#DBDFE1] px-4 h-fit py-1 rounded-lg mt-4 xl:my-0 lg:my-0">
                                            Ghi nhận
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverHeader>
                                            Ghi nhận tình trạng
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
                                    <Popover>
                                        <PopoverTrigger>
                                            <button className="bg-[#DBDFE1] px-4 h-fit py-1 rounded-lg mt-4 xl:my-0 lg:my-0 mr-3">
                                                Ghi nhận
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverHeader>
                                                Ghi nhận tình trạng
                                            </PopoverHeader>
                                            <PopoverBody>
                                                {/* <div className="space-y-2">
                                            <div>
                                                Mẫu 1 : <span>{sample1}</span>
                                            </div>
                                            <div>
                                                Mẫu 2 : <span>{sample2}</span>
                                            </div>
                                            <div>
                                                Mẫu 3 : <span>{sample3}</span>
                                            </div>
                                            <div>
                                                Mẫu 4 : <span>{sample4}</span>
                                            </div>
                                            <div>
                                                Mẫu 5 : <span>{sample5}</span>
                                            </div>
                                        </div> */}
                                                <div className="space-y-2">
                                                    {Object.entries(
                                                        samples
                                                    ).map(
                                                        (
                                                            [key, value],
                                                            index
                                                        ) => (
                                                            <div key={key}>
                                                                Mẫu {index + 1}{" "}
                                                                :{" "}
                                                                <span>
                                                                    {value}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>
                                    <div
                                        className="h-fit bg-gray-700 text-white px-4 py-1 rounded-lg mt-4 xl:my-0 lg:my-0 cursor-pointer active:scale-[.95] active:duration-75 transition-all"
                                        onClick={onNo11Open}
                                    >
                                        Kiểm tra
                                    </div>
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
                                                <div className="text-lg">
                                                    Chiều dày thực tế
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
                                                                Mẫu {index + 1}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id={`batch_id_${key}`}
                                                                className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                                value={value}
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
                                                    className="text-white bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    type="button"
                                                    className="text-white bg-[#3182CE] focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
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
                                <Popover placement="top">
                                    <PopoverTrigger>
                                        <button className="bg-[#DBDFE1] h-fit px-4 py-1 rounded-lg mt-4 xl:my-0 lg:my-0">
                                            Ghi nhận
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverHeader>
                                            Ghi nhận tình trạng
                                        </PopoverHeader>
                                        <PopoverBody>
                                            <div className="xl:grid grid-cols-2 xl:space-y-0 lg:space-y-0 md:space-y-0 gap-2 space-y-2">
                                                {Object.entries(fixedFanValues || {}).map(
                                                    ([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="gap-2"
                                                        >
                                                            <div>
                                                                {`Quạt ${key.substring(
                                                                    1
                                                                )} : `}
                                                                <span>
                                                                    {value}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </PopoverBody>
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <>
                                    <Popover placement="top">
                                        <PopoverTrigger>
                                            <button className="bg-[#DBDFE1] h-fit px-4 py-1 rounded-lg mt-4 xl:my-0 lg:my-0 mr-3">
                                                Ghi nhận
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverHeader>
                                                Ghi nhận tình trạng
                                            </PopoverHeader>
                                            <PopoverBody>
                                                <div className="xl:grid grid-cols-2 xl:space-y-0 lg:space-y-0 md:space-y-0 space-y-2">
                                                    {Object.entries(
                                                        fanValues
                                                    ).map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="space-y-3 gap-y-3"
                                                        >
                                                            <div>
                                                                {`Quạt ${key.substring(
                                                                    1
                                                                )} : `}
                                                                <span>
                                                                    {value}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>
                                    <div
                                        className="bg-gray-700 text-white h-fit px-4 py-1 rounded-lg mt-4 xl:my-0 lg:my-0 cursor-pointer active:scale-[.95] active:duration-75 transition-all"
                                        onClick={onNo12Open}
                                    >
                                        Kiểm tra
                                    </div>
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
                                                </div>
                                            </ModalHeader>
                                            <ModalBody className="">
                                                <div className="max-h-[420px] w-full overflow-y-scroll pr-5 xl:space-y-0 lg:space-y-0 md:space-y-0 space-y-2">
                                                    <div className="space-y-2 my-4">
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
                                                                        type="text"
                                                                        id={key}
                                                                        className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
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
                                                    className="text-white bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    type="button"
                                                    className="text-white bg-[#3182CE] focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
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
