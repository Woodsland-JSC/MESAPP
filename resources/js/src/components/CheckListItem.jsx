import React, { useState } from "react";
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

function CheckListItem(props) {
    const {
        value,
        title,
        description,
        onCheckboxChange,
        isChecked,
        onNo7Change,
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
    const [actualValue, setActualValue] = useState("");
    const [sample1, setSample1] = useState("");
    const [sample2, setSample2] = useState("");
    const [sample3, setSample3] = useState("");
    const [sample4, setSample4] = useState("");
    const [sample5, setSample5] = useState("");
    const [fanValues, setFanValues] = useState({
        q1: "",
        q2: "",
        q3: "",
        q4: "",
        q5: "",
        q6: "",
        q7: "",
        q8: "",
    });

    const handleCheckboxNo7Change = (value) => {
        if (soLan === 0) {
            toast.error("Giá trị không được bỏ trống.");
        } else {
            onCheckboxChange(!localIsChecked);
            setLocalIsChecked(!localIsChecked);
            onCheckboxChange(value ? 1 : 0);
            toast("Dữ liệu đã được lưu.");
            onNo7Close();
        }
    };

    const handleCheckboxNo8Change = (value) => {
        if (CBL === 0) {
            toast.error("Số cảm biến lò không được bỏ trống.");
        } else if (doThucTe === 0) {
            toast.error("Số đo thực tế không được bỏ trống.");
        } else {
            onCheckboxChange(!localIsChecked);
            setLocalIsChecked(!localIsChecked);
            onCheckboxChange(value ? 1 : 0);
            toast("Dữ liệu đã được lưu.");
            onNo8Close();
        }
    };

    const handleCheckboxNo11Change = () => {
        if (!sample1) {
            toast.error("Vui lòng nhập thông tin cho Mẫu 1.");
        } else if (!sample2) {
            toast.error("Vui lòng nhập thông tin cho Mẫu 2.");
        } else if (!sample3) {
            toast.error("Vui lòng nhập thông tin cho Mẫu 3.");
        } else if (!sample4) {
            toast.error("Vui lòng nhập thông tin cho Mẫu 4.");
        } else if (!sample5) {
            toast.error("Vui lòng nhập thông tin cho Mẫu 5.");
        } else {
            onCheckboxChange(!localIsChecked);
            setLocalIsChecked(!localIsChecked);
            onCheckboxChange(1);
            toast("Dữ liệu đã được lưu.");
            onNo11Close();
        }
    };

    const handleCheckboxNo12Change = () => {
        const isValid = Object.values(fanValues).every(
            (value) => value.trim() !== ""
        );

        if (isValid) {
            onCheckboxChange(!localIsChecked);
            setLocalIsChecked(!localIsChecked);
            onCheckboxChange(1); // Nếu checkbox đang mở Popover thì set giá trị là 1
            toast("Dữ liệu đã được lưu.");
            onNo12Close();
        } else {
            toast.error("Vui lòng nhập đầy đủ thông tin cho tất cả các quạt.");
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

    const handleSampleInputChange = (sampleNumber, value) => {
        switch (sampleNumber) {
            case 1:
                setSample1(value);
                break;
            case 2:
                setSample2(value);
                break;
            case 3:
                setSample3(value);
                break;
            case 4:
                setSample4(value);
                break;
            case 5:
                setSample5(value);
                break;
            default:
                break;
        }
    };

    const handleFanInputChange = (field, value) => {
        setFanValues((prevValues) => ({
            ...prevValues,
            [field]: value,
        }));
    };

    const handleFanSpeedInputChange = (sampleNumber, value) => {
        switch (sampleNumber) {
            case 1:
                setSample1(value);
                break;
            case 2:
                setSample2(value);
                break;
            case 3:
                setSample3(value);
                break;
            case 4:
                setSample4(value);
                break;
            case 5:
                setSample5(value);
                break;
            default:
                break;
        }
    };

    return (
        <div className="bg-[#F7FDFF] flex relative flex-col rounded-xl w-full h-fit xl:h-[13.5rem] hover:shadow-[rgba(7,_65,_210,_0.1)_0px_9px_30px] hover:border-[#99b4c1] border-2 border-gray-200">
            {/* <div className="absolute -top-1 -right-0.5 bg-green-500 shadow-sm shadow-black text-white w-4 h-4 flex items-center justify-center rounded-full" /> */}
            <div className="px-4 py-3 bg-[#F1F8FB] h-[30%] rounded-t-xl w-full flex items-center border-b border-gray-200">
                <Checkbox
                    value={value}
                    isChecked={isChecked}
                    onChange={() => onCheckboxChange(!isChecked)}
                    // onChange={handleCheckboxChange}
                    size="lg"
                    colorScheme="blue"
                    className="w-full"
                >
                    <div className="tx-[#155979] text-[1.05rem] ml-1 font-semibold">
                        {title}
                    </div>
                </Checkbox>
            </div>

            <div className="px-4 xl:h-[70%] lg:h-[70%] text-base py-2">
                <div className="xl:h-[70%] lg:h-[70%]">{description}</div>
                <div className="xl:h-[30%] lg:h-[30%]  flex justify-end ">
                    {value === 7 ? (
                        <>
                            <Popover>
                                <PopoverTrigger>
                                    <button className="bg-[#DBDFE1] h-fit px-4 py-1 rounded-lg my-1 xl:my-0 lg:my-0 cursor-pointer mr-3">
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
                                        Số lần : <span>{setSoLan}</span>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                            <div
                                className="h-fit bg-[#3182CE] text-white px-4 py-1 rounded-lg my-1 xl:my-0 lg:my-0 cursor-pointer active:scale-[.95] active:duration-75 transition-all"
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
                                                htmlFor="quantity"
                                                className="block mb-2 text-md font-medium text-gray-900 "
                                            >
                                                Số lần
                                            </label>
                                            <NumberInput
                                                min={1}
                                                onChange={handleSoLanOnChange}
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
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
                                            onClick={handleCheckboxNo7Change}
                                        >
                                            Xác nhận
                                        </button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                        </>
                    ) : value === 8 ? (
                        <>
                            <Popover>
                                <PopoverTrigger>
                                    <button className="bg-[#DBDFE1] px-4 h-fit py-1 rounded-lg my-2 xl:my-0 lg:my-0 mr-3">
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
                                                Cảm biến lò : <span>{CBL}</span>
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
                                className="h-fit bg-[#3182CE] text-white px-4 py-1 rounded-lg my-2 xl:my-0 lg:my-0 cursor-pointer active:scale-[.95] active:duration-75 transition-all"
                                onClick={onNo8Open}
                            >
                                Kiểm tra
                            </div>
                            <Modal
                                isOpen={isNo8Open}
                                isCentered
                                onClick={onNo8Close}
                                // className="xl:px-0 lg:px-0 md:px-0 px-4"
                                size="xs"
                            >
                                <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader>
                                        <div className="text-lg">
                                            Cảm biến nhiệt độ trong lò sấy
                                        </div>
                                    </ModalHeader>
                                    <ModalBody>
                                        <div>
                                            <label
                                                htmlFor="quantity"
                                                className="block mb-2 text-md font-medium text-gray-900 "
                                            >
                                                Cảm biến lò
                                            </label>
                                            <NumberInput
                                                defaultValue={1}
                                                min={1}
                                                onChange={handleCBLOnChange}
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </div>

                                        <div className="mt-4">
                                            <label
                                                htmlFor="quantity"
                                                className="block mb-2 text-md font-medium text-gray-900 "
                                            >
                                                Đo thực tế
                                            </label>
                                            <NumberInput
                                                defaultValue={1}
                                                min={1}
                                                onChange={
                                                    handleDoThucTeOnChange
                                                }
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
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
                                            onClick={handleCheckboxNo8Change}
                                        >
                                            Xác nhận
                                        </button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                        </>
                    ) : value === 11 ? (
                        <>
                            <Popover>
                                <PopoverTrigger>
                                    <button className="bg-[#DBDFE1] px-4 h-fit py-1 rounded-lg my-2 xl:my-0 lg:my-0 mr-3">
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
                                        </div>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                            <div
                                className="h-fit bg-[#3182CE] text-white px-4 py-1 rounded-lg my-2 xl:my-0 lg:my-0 cursor-pointer active:scale-[.95] active:duration-75 transition-all"
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
                                        <div>
                                            <label
                                                htmlFor="batch_id"
                                                className="block mb-2 text-md font-medium text-gray-900"
                                            >
                                                Mẫu 1
                                            </label>
                                            <input
                                                type="text"
                                                id="batch_id"
                                                className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                onChange={(e) =>
                                                    handleSampleInputChange(
                                                        1,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="batch_id"
                                                className="block mb-2 text-md font-medium text-gray-900"
                                            >
                                                Mẫu 2
                                            </label>
                                            <input
                                                type="text"
                                                id="batch_id"
                                                className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                onChange={(e) =>
                                                    handleSampleInputChange(
                                                        2,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="batch_id"
                                                className="block mb-2 text-md font-medium text-gray-900"
                                            >
                                                Mẫu 3
                                            </label>
                                            <input
                                                type="text"
                                                id="batch_id"
                                                className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                onChange={(e) =>
                                                    handleSampleInputChange(
                                                        3,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="batch_id"
                                                className="block mb-2 text-md font-medium text-gray-900"
                                            >
                                                Mẫu 4
                                            </label>
                                            <input
                                                type="text"
                                                id="batch_id"
                                                className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                onChange={(e) =>
                                                    handleSampleInputChange(
                                                        4,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="batch_id"
                                                className="block mb-2 text-md font-medium text-gray-900"
                                            >
                                                Mẫu 5
                                            </label>
                                            <input
                                                type="text"
                                                id="batch_id"
                                                className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                onChange={(e) =>
                                                    handleSampleInputChange(
                                                        5,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
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
                                            onClick={handleCheckboxNo11Change}
                                        >
                                            Xác nhận
                                        </button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                        </>
                    ) : value === 12 ? (
                        <>
                            <Popover placement="top">
                                <PopoverTrigger>
                                    <button className="bg-[#DBDFE1] h-fit px-4 py-1 rounded-lg my-2 xl:my-0 lg:my-0 mr-3">
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
                                            <div className="space-y-2">
                                                <div>
                                                    Quạt 1 : <span>{fanValues.q1}</span>
                                                </div>
                                                <div>
                                                    Quạt 2: <span>{fanValues.q2}</span>
                                                </div>
                                                <div>
                                                    Quạt 3: <span>{fanValues.q3}</span>
                                                </div>
                                                <div>
                                                    Quạt 4: <span>{fanValues.q4}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div>
                                                    Quạt 5: <span>{fanValues.q5}</span>
                                                </div>
                                                <div>
                                                    Quạt 6: <span>{fanValues.q6}</span>
                                                </div>
                                                <div>
                                                    Quạt 7: <span>{fanValues.q7}</span>
                                                </div>
                                                <div>
                                                    Quạt 8: <span>{fanValues.q8}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                            <div
                                className="bg-[#3182CE] text-white h-fit px-4 py-1 rounded-lg my-2 xl:my-0 lg:my-0 cursor-pointer active:scale-[.95] active:duration-75 transition-all"
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
                                            Động cơ quạt, tốc độ gió quạt
                                        </div>
                                    </ModalHeader>
                                    <ModalBody className="">
                                        <div className="max-h-[420px] overflow-y-scroll pr-5 xl:grid grid-cols-2 xl:space-y-0 lg:space-y-0 md:space-y-0 space-y-2">
                                            <div className="space-y-2 my-4">
                                                {Array.from({ length: 8 }).map(
                                                    (_, index) => (
                                                        <div key={index}>
                                                            <label
                                                                htmlFor={`q${
                                                                    index + 1
                                                                }`}
                                                                className="block mb-2 text-md font-medium text-gray-900"
                                                            >
                                                                {`Quạt ${
                                                                    index + 1
                                                                }`}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id={`q${
                                                                    index + 1
                                                                }`}
                                                                className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                                onChange={(e) =>
                                                                    handleFanInputChange(
                                                                        `q${
                                                                            index +
                                                                            1
                                                                        }`,
                                                                        e.target
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
                                            onClick={handleCheckboxNo12Change}
                                        >
                                            Xác nhận
                                        </button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default CheckListItem;
