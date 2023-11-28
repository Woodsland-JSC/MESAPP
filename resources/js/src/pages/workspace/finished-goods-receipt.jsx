import React, { useEffect, useState, useRef } from "react";
import Layout from "../../layouts/layout";
import { Link, useNavigate } from "react-router-dom";
import { HiPlus, HiArrowLeft } from "react-icons/hi";
import {
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    Box,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Heading,
    Stack,
    StackDivider,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useSteps,
    useDisclosure,
} from "@chakra-ui/react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import productionApi from "../../api/productionApi";
import toast from "react-hot-toast";
import FinishedGoodsIllustration from "../../assets/images/wood-receipt-illustration.png";
import Loader from "../../components/Loader";
import useAppContext from "../../store/AppContext";

const steps = [
    { title: "Bước 1", description: "Chọn loại thành phẩm" },
    { title: "Bước 2", description: "Kiểm tra thông tin" },
    { title: "Bước 3", description: "Nhập số lượng thành phẩm" },
];

function FinishedGoodsReceipt() {
    const navigate = useNavigate();
    const { loading, setLoading } = useAppContext();
    const { activeStep, setActiveStep } = useSteps({
        index: 0,
        count: steps.length,
    });
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [goodsReceiptList, setGoodsReceiptList] = useState([]);
    const [goodsReceiptOptions, setGoodsReceiptOptions] = useState([]);

    const [selectedItem, setSelectedItem] = useState(null);
    const [amount, setAmount] = useState(1);

    const loadGoodsReceipt = (inputValue, callback) => {
        productionApi
            .getFinishedGoodsList()
            .then((data) => {
                const filteredOptions = data.filter((option) => {
                    return (
                        option.ItemName?.toLowerCase().includes(
                            inputValue.toLowerCase()
                        ) ||
                        option.ItemCode?.toLowerCase().includes(
                            inputValue.toLowerCase()
                        )
                    );
                });

                const asyncOptions = filteredOptions.map((item) => ({
                    value: item.ItemCode,
                    label: item.ItemCode + " - " + item.ItemName,
                }));

                callback(asyncOptions);
            })
            .catch((error) => {
                console.error("Error fetching sap id:", error);
                callback([]);
            });
    };

    const handleCompletion = () => {
        console.log("Selected Kiln:", selectedKiln.value);
        console.log(
            "Selected Drying Reasons Plan:",
            selectedDryingReasonsPlan.value
        );
        console.log("Selected Thickness:", selectedThickness);
    };

    const goBack = () => {
        setActiveStep(activeStep - 1);
    };

    const handleSubmit = async () => {
        if (selectedItem && amount) {
            setLoading(true);
            try {
                const data = {
                    ItemCode: selectedItem.value,
                    Qty: amount,
                }
                const res = await productionApi.enterFinishedGoodsAmount(data);
                toast.success("Ghi nhận thành công.");
                navigate(0);
                setLoading(false);
            } catch (error) {
                toast.error("Có lỗi xảy ra.");
                setLoading(false);
            }
        } else {
            toast("Vui lòng chọn thành phẩm.");
        }
    };

    useEffect(() => {
        const getFinishedGoods = async () => {
            try {
                const res = await productionApi.getFinishedGoodsList();
                setGoodsReceiptList(res);
                const options = res.map((item) => ({
                    value: item.ItemCode,
                    label: item.ItemCode + " - " + item.ItemName,
                }));
                console.log("Ra options: ", options);
                setGoodsReceiptOptions(options);
            } catch (error) {
                toast.error("Có lỗi xảy ra khi load danh sách thành phẩm.");
            }
        };
        getFinishedGoods();
        document.title = "Woodsland - Nhập thành phẩm";
        return () => {
            document.title = "Woodsland";
            document.body.classList.remove('body-no-scroll');
        };
    }, []);

    useEffect(() => {
        if (loading) {
            document.body.classList.add('body-no-scroll');
        } else {
            document.body.classList.remove('body-no-scroll');
        }
    }, [loading]);

    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center bg-[#F8F9F7] ">
                {/* Section */}
                <div className="w-screen mb-4 xl:mb-4 p-6 px-5 xl:p-12 xl:px-32">
                    {/* Breadcrumb */}
                    <div className="mb-4">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center">
                                        <a
                                            href="#"
                                            class="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            Workspace
                                        </a>
                                    </div>
                                </li>
                                <li aria-current="page">
                                    <div class="flex items-center">
                                        <svg
                                            class="w-3 h-3 text-gray-400 mx-1"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 6 10"
                                        >
                                            <path
                                                stroke="currentColor"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="m1 9 4-4-4-4"
                                            />
                                        </svg>
                                        <Link
                                            to="/workspace"
                                            class="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            <div>Quản lý sấy gỗ</div>
                                        </Link>
                                    </div>
                                </li>
                                <li aria-current="page">
                                    <div class="flex items-center">
                                        <svg
                                            class="w-3 h-3 text-gray-400 mx-1"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 6 10"
                                        >
                                            <path
                                                stroke="currentColor"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="m1 9 4-4-4-4"
                                            />
                                        </svg>
                                        <span class="ml-1 text-sm font-medium text-[#17506B] md:ml-2">
                                            <div>Nhập thành phẩm</div>
                                        </span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between mb-6 items-center">
                        <div className="text-3xl font-bold ">
                            Nhập thành phẩm
                        </div>
                    </div>

                    <Stepper index={activeStep}>
                        {steps.map((step, index) => (
                            <Step key={index}>
                                <StepIndicator>
                                    <StepStatus
                                        complete={<StepIcon />}
                                        incomplete={<StepNumber />}
                                        active={<StepNumber />}
                                    />
                                </StepIndicator>

                                <Box flexShrink="0">
                                    <StepTitle>{step.title}</StepTitle>
                                    <StepDescription className="hidden sm:block">
                                        {step.description}
                                    </StepDescription>
                                </Box>

                                <StepSeparator />
                            </Step>
                        ))}
                    </Stepper>

                    {/* Controller */}
                    {/* <div className="flex justify-between mb-6 items-center gap-4"> */}
                    {/* <div className="my-4 mb-6 p-4 w-full border rounded-md bg-white"> */}
                    <Card className="my-8">
                        <CardHeader className="flex items-center gap-4">
                            {activeStep != 0 && (
                                <button
                                    className="p-2 hover:bg-gray-200 rounded-full active:scale-[.95] active:duration-75 transition-all"
                                    onClick={goBack}
                                >
                                    <HiArrowLeft />
                                </button>
                            )}
                            {activeStep == 0 && (
                                <Heading size="md">
                                    Chọn loại thành phẩm
                                </Heading>
                            )}
                            {activeStep == 1 && (
                                <Heading size="md">Kiểm tra thông tin</Heading>
                            )}
                            {activeStep == 2 && (
                                <Heading size="md">
                                    Nhập số lượng thành phẩm
                                </Heading>
                            )}
                        </CardHeader>

                        {activeStep == 0 && (
                            <>
                                <CardBody>
                                    <Stack
                                        divider={<StackDivider />}
                                        spacing="4"
                                    >
                                        <Box>
                                            <Heading
                                                size="xs"
                                                textTransform="uppercase"
                                            >
                                                Tìm kiếm loại thành phẩm
                                            </Heading>
                                            <AsyncSelect
                                                cacheOptions
                                                options={goodsReceiptOptions}
                                                defaultOptions
                                                loadOptions={loadGoodsReceipt}
                                                defaultValue={
                                                    selectedItem || null
                                                }
                                                onChange={(value) =>
                                                    setSelectedItem(value)
                                                }
                                                placeholder="Tìm kiếm"
                                                className="mt-4"
                                            />
                                        </Box>
                                    </Stack>
                                </CardBody>
                                <CardFooter className="text-bold justify-end">
                                    <Button
                                        isDisabled={!selectedItem}
                                        onClick={() => setActiveStep(1)}
                                        variant="solid"
                                        colorScheme="blue"
                                        backgroundColor="#2b6cbo0 !important"

                                    >
                                        Tiếp tục
                                    </Button>
                                </CardFooter>
                            </>
                        )}
                        {activeStep == 1 && selectedItem && (
                            <>
                                <CardBody>
                                    <Stack
                                        divider={<StackDivider />}
                                        spacing="4"
                                    >
                                        <Box className="flex flex-col md:flex-row items-center justify-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-4 py-2">
                                                    <label className="font-semibold whitespace-nowrap">Mã thành phẩm</label>
                                                    <input
                                                        type="text"
                                                        disabled
                                                        value={
                                                            goodsReceiptList.find(
                                                                (item) =>
                                                                    item.ItemCode ==
                                                                    selectedItem.value
                                                            )?.ItemCode || ""
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4 py-2">
                                                    <label className="font-semibold whitespace-nowrap">
                                                        Tên thành phẩm
                                                    </label>
                                                    <input
                                                        type="text"
                                                        disabled
                                                        value={
                                                            goodsReceiptList.find(
                                                                (item) =>
                                                                    item.ItemCode ==
                                                                    selectedItem.value
                                                            )?.ItemName || ""
                                                        }
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4 py-2">
                                                    <label className="font-semibold whitespace-nowrap">Tổng số lượng</label>
                                                    <input
                                                        type="text"
                                                        disabled
                                                        value={
                                                            goodsReceiptList.find(
                                                                (item) =>
                                                                    item.ItemCode ==
                                                                    selectedItem.value
                                                            )?.Qty || ""
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <img alt="Hình minh hoạ thành phẩm gỗ" className="w-[400px] -mt-8" src={FinishedGoodsIllustration} />
                                        </Box>
                                    </Stack>
                                </CardBody>
                                <CardFooter className="text-bold justify-end">
                                    <Button
                                        // isDisabled={!selectedItem}
                                        onClick={() => setActiveStep(2)}
                                        variant="solid"
                                        colorScheme="blue"
                                        backgroundColor="#2b6cbo0 !important"
                                    >
                                        Tiếp tục
                                    </Button>
                                </CardFooter>
                            </>
                        )}
                        {activeStep == 2 && (
                            <>
                                <CardBody>
                                    <Stack
                                        divider={<StackDivider />}
                                        spacing="4"
                                    >
                                        <Box>
                                            <label>
                                                Số lượng ghi nhận thành phẩm
                                            </label>
                                            <NumberInput
                                                step={1}
                                                defaultValue={1}
                                                min={1}
                                                max={
                                                    goodsReceiptList.find(
                                                        (item) =>
                                                            item.ItemCode ==
                                                            selectedItem.value
                                                    )?.Qty || 0
                                                }
                                                className="mt-4"
                                                onChange={(value) => {
                                                    setAmount(value);
                                                }}
                                            >
                                                <NumberInputField />
                                                <NumberInputStepper>
                                                    <NumberIncrementStepper />
                                                    <NumberDecrementStepper />
                                                </NumberInputStepper>
                                            </NumberInput>
                                        </Box>
                                    </Stack>
                                </CardBody>
                                <CardFooter className="text-bold justify-end">
                                    <Button
                                        isDisabled={!selectedItem || !amount}
                                        onClick={handleSubmit}
                                        variant="solid"
                                        colorScheme="blue"
                                        backgroundColor="#2b6cbo0 !important"
                                    >
                                        Hoàn thành
                                    </Button>
                                </CardFooter>
                            </>
                        )}
                    </Card>
                    {/* <label className="block mb-2 text-md font-medium text-gray-900">
                            Tìm kiếm loại thành phẩm{" "}
                            <span className="text-red-600">*</span>
                        </label>
                        <AsyncSelect
                            cacheOptions
                            options={goodsReceiptOptions}
                            defaultOptions
                            loadOptions={loadGoodsReceipt}
                            onChange={(value) => setSelectedItem(value)}
                            placeholder="Tìm kiếm"
                            className="mt-4"
                        /> */}
                    {/* </div> */}
                    {/* </div> */}

                </div>
            </div>
            {
                loading && <Loader />
            }
        </Layout>
    );
}

export default FinishedGoodsReceipt;
