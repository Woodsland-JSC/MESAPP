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

function CheckListItem(props) {
    const { value, title, description, onCheckboxChange, isChecked, onNo7Change } = props;

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

    // const [isChecked, setIsChecked] = useState(false);

    // const handleCheckboxChange = () => {
    //     setIsChecked((prev) => !prev);
    //     onCheckboxChange(!isChecked);
    // };

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
                                        Số lần : <span></span>
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
                                // className="xl:px-0 lg:px-0 md:px-0 px-4"
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
                                                
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </div>
                                    </ModalBody>

                                    <ModalFooter>
                                        <Button
                                            colorScheme="blue"
                                            mr={3}
                                            onClick={onNo7Close}
                                            className="text-lg"
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="text-lg"
                                        >
                                            Ghi lại
                                        </Button>
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
                                            <div>Cảm biến lò : <span></span></div>
                                            <div>Đo thực tế : <span></span></div>
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
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </div>
                                    </ModalBody>

                                    <ModalFooter>
                                        <Button
                                            colorScheme="blue"
                                            mr={3}
                                            onClick={onNo8Close}
                                            className="text-lg"
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="text-lg"
                                        >
                                            Ghi lại
                                        </Button>
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
                                            <div>Mẫu 1 : <span></span></div>
                                            <div>Mẫu 2: <span></span></div>
                                            <div>Mẫu 3: <span></span></div>
                                            <div>Mẫu 4: <span></span></div>
                                            <div>Mẫu 5: <span></span></div>
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
                                            />
                                        </div>
                                    </ModalBody>

                                    <ModalFooter>
                                        <Button
                                            colorScheme="blue"
                                            mr={3}
                                            onClick={onNo11Close}
                                            className="text-lg"
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="text-lg"
                                        >
                                            Ghi lại
                                        </Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                        </>
                    ) : value === 12 ? (
                        <>
                            <Popover placement='top'>
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
                                                <div>Quạt 1 : <span></span></div>
                                                <div>Quạt 2: <span></span></div>
                                                <div>Quạt 3: <span></span></div>
                                                <div>Quạt 4: <span></span></div>
                                            </div>
                                            <div className="space-y-2">
                                                <div>Quạt 5: <span></span></div>
                                                <div>Quạt 6: <span></span></div>
                                                <div>Quạt 7: <span></span></div>
                                                <div>Quạt 8: <span></span></div>
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
                                        <div className="overflow-y-auto h-[420px] space-y-3 ">
                                            <div>
                                                <label
                                                    htmlFor="q1"
                                                    className="block mb-2 text-md font-medium text-gray-900"
                                                >
                                                    Quạt 1
                                                </label>
                                                <input
                                                    type="text"
                                                    id="q1"
                                                    className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="q2"
                                                    className="block mb-2 text-md font-medium text-gray-900"
                                                >
                                                    Quạt 2
                                                </label>
                                                <input
                                                    type="text"
                                                    id="q2"
                                                    className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="q3"
                                                    className="block mb-2 text-md font-medium text-gray-900"
                                                >
                                                    Quạt 3
                                                </label>
                                                <input
                                                    type="text"
                                                    id="q3"
                                                    className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="q4"
                                                    className="block mb-2 text-md font-medium text-gray-900"
                                                >
                                                    Quạt 4
                                                </label>
                                                <input
                                                    type="text"
                                                    id="q4"
                                                    className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="q5"
                                                    className="block mb-2 text-md font-medium text-gray-900"
                                                >
                                                    Quạt 5
                                                </label>
                                                <input
                                                    type="text"
                                                    id="q5"
                                                    className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="q6"
                                                    className="block mb-2 text-md font-medium text-gray-900"
                                                >
                                                    Quạt 6
                                                </label>
                                                <input
                                                    type="text"
                                                    id="q6"
                                                    className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="q7"
                                                    className="block mb-2 text-md font-medium text-gray-900"
                                                >
                                                    Quạt 7
                                                </label>
                                                <input
                                                    type="text"
                                                    id="q7"
                                                    className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="q8"
                                                    className="block mb-2 text-md font-medium text-gray-900"
                                                >
                                                    Quạt 8
                                                </label>
                                                <input
                                                    type="text"
                                                    id="q8"
                                                    className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                                />
                                            </div>
                                        </div>
                                    </ModalBody>

                                    <ModalFooter>
                                        <Button
                                            colorScheme="blue"
                                            mr={3}
                                            onClick={onNo12Close}
                                            className="text-lg"
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="text-lg"
                                        >
                                            Ghi lại
                                        </Button>
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
