import React, { useEffect, useState, useRef } from "react";
import Layout from "../../../layouts/layout";
import { Link, useNavigate } from "react-router-dom";
import { HiPlus, HiArrowLeft } from "react-icons/hi";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    AlertDialogCloseButton,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    ModalOverlay,
    Modal,
    ModalHeader,
    ModalContent,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Badge,
    Button,
    Box,
    Text,
    Skeleton,
    SkeletonCircle,
    SkeletonText,
    Stack,
    useDisclosure,
} from "@chakra-ui/react";
import { HiMiniBellAlert } from "react-icons/hi2";
import Select, { components } from "react-select";
import { Spinner } from "@chakra-ui/react";
import toast from "react-hot-toast";
import productionApi from "../../../api/productionApi";
import Loader from "../../../components/Loader";
import useAppContext from "../../../store/AppContext";
import ItemInput from "../../../components/ItemInput";
import DomesticAwaitingReception from "../../../components/DomesticAwaitingReception";
import DomesticOutputCard from "../../../components/DomesticOutputCard";
import { BiConfused, BiSearchAlt } from "react-icons/bi";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaArrowUp } from "react-icons/fa";

// IMPORTANT: Fake data
const fakeDomesticDetails = [
    {
        id: 1,
        detailsCode: "001",
        projectName: "Chung cư 1",
        cuttingDiagram: "Test 1",
        plannedAmount: 10009,
        receivedAmount: 80,
        currentStageId: 1,
        nextStageId: 2
    },
    {
        id: 2,
        detailsCode: "002",
        projectName: "Chung cư 1",
        cuttingDiagram: "Test 2",
        plannedAmount: 121,
        receivedAmount: 45,
        currentStageId: 1,
        nextStageId: 2
    },
    {
        id: 3,
        detailsCode: "003",
        projectName: "Chung cư 2",
        cuttingDiagram: "Test 3",
        plannedAmount: 56,
        receivedAmount: 6,
        currentStageId: 2,
        nextStageId: 3
    },
    {
        id: 4,
        detailsCode: "004",
        projectName: "Chung cư 2",
        cuttingDiagram: "Test 4",
        plannedAmount: 100,
        receivedAmount: 80,
        currentStageId: 1,
        nextStageId: 2
    },
];

const fakeDomesticDetailsAwaitingReception = [
    {
        id: 1,
        projectId: 1,
        projectName: "Chung cư ABC",
        detailsCode: "ABC",
        cuttingDiagram: "Test",
        deliveredAmount: 10,
    },
    {
        id: 2,
        projectId: 2,
        projectName: "Chung cư CBA",
        detailsCode: "CBA",
        cuttingDiagram: "Test 2",
        deliveredAmount: 5,
    },
    {
        id: 3,
        projectId: 2,
        projectName: "Chung cư CBA",
        detailsCode: "XYZ",
        cuttingDiagram: "Test 3",
        deliveredAmount: 5,
    },
    {
        id: 4,
        projectId: 2,
        projectName: "Chung cư CBA",
        detailsCode: "ZYX",
        cuttingDiagram: "Test 4",
        deliveredAmount: 5,
    },
];

const fakeProjects = [
    {
        id: 1,
        code: "1",
        name: "Chung cư ABC",
    },
    {
        id: 2,
        code: "2",
        name: "Chung cư CBA",
    },
    {
        id: 3,
        code: "3",
        name: "Chung cư XYZ",
    },
    {
        id: 4,
        code: "4",
        name: "Chung cư ZYX",
    },
];

const fakeCuttingDiagrams = [
    {
        id: 1,
        code: "1",
        name: "Cắt 1",
    },
    {
        id: 2,
        code: "2",
        name: "Cắt 2",
    },
    {
        id: 3,
        code: "3",
        name: "Cắt 3",
    },
    {
        id: 4,
        code: "4",
        name: "Cắt 4",
    },
]

function FinishedDetailsReceipt() {
    const navigate = useNavigate();
    // const { loading, setLoading } = useAppContext();
    const stageSelectRef = useRef();
    const projectSelectRef = useRef();
    const cuttingDiagramSelectRef = useRef();

    const {
        isOpen: isAlertDialogOpen,
        onOpen: onAlertDialogOpen,
        onClose: onAlertDialogClose,
    } = useDisclosure();

    const {
        isOpen: isModalOpen,
        onOpen: onModalOpen,
        onClose: onModalClose,
    } = useDisclosure();

    const [awaitingReception, setAwaitingReception] = useState([]);

    const [data, setData] = useState(fakeDomesticDetails || []);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [finishedDetailsData, setFinishedDetailsData] = useState(fakeDomesticDetails || []);
    const [loading, setLoading] = useState(true);
    const [isFirstTime, setIsFirstTime] = useState(true);
    const [loadingData, setLoadingData] = useState(false);

    const [stageListOptions, setStageListOptions] = useState([]);
    const [stageList, setStageList] = useState([]);
    const [selectedStage, setSelectedStage] = useState(null);

    const [projectListOptions, setProjectListOptions] = useState([]);
    const [projectList, setProjectList] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    const [cuttingDiagramListOptions, setCuttingDiagramListOptions] = useState([]);
    const [cuttingDiagramList, setCuttingDiagramList] = useState([]);
    const [selectedCuttingDiagram, setSelectedCuttingDiagram] = useState(null);

    const [productionOrderListOptions, setProductionOrderListOptions] = useState([]);
    const [productionOrderList, setProductionOrderList] = useState([]);
    const [selectedProductionOrder, setSelectedProductionOrder] = useState(null);

    const [selectedDetailsCode, setSelectedDetailsCode] = useState(null);


    const [isQualityCheck, setIsQualityCheck] = useState(false);

    const handleRejectFromChild = (data, faults) => {
        getDataFollowingGroup(params);
    };

    const handleConfirmReceipt = (id) => {
        if (selectedStage) {
            setAwaitingReception((prev) =>
                prev.filter((item) => item.id !== id)
            );
            toast.success("Ghi nhận thành công.");
        }
        if (awaitingReception.length <= 0) {
            onModalClose();
        }
    };

    const handleRejectReceipt = (id) => {
        if (selectedStage) {
            setAwaitingReception((prev) =>
                prev.filter((item) => item.id !== id)
            );
            toast.success("Huỷ bỏ & chuyển lại thành công.");
        }
        if (awaitingReception.length <= 0) {
            onModalClose();
        }
    };

    const handleBackNavigation = (event) => {
        if (event.type === "popstate") {
            navigate("/workspace?tab=wood-working");
        }
    };

    const handleConfirmAll = async () => {
        onModalClose();
    }

    useEffect(() => {
        window.addEventListener("popstate", handleBackNavigation);

        return () => {
            window.removeEventListener("popstate", handleBackNavigation);
        };
    }, [navigate]);

    // Get All Stage, Cutting Diagram, Production Order, Details Code
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // const [stageRes, cuttingDiagramRes, productionOrderRes, detailsCodeRes] = await Promise.all([
                //     productionApi.getAllStage(),
                //     productionApi.getCuttingDiagram(),
                //     productionApi.getProductionOrders(),
                //     productionApi.getDetailsCode(),
                // ]);

                const stageRes = await productionApi.getAllGroupWithoutQC();

                // Process All Stage
                const stageOptions = stageRes.map((item) => ({
                    value: item.Code,
                    label: item.Name + " - " + item.Code,
                    CongDoan: item.CongDoan,
                }));
                setStageList(stageRes);
                stageOptions.sort((a, b) => a.label.localeCompare(b.label));
                setStageListOptions(stageOptions);
                stageSelectRef?.current?.setValue(stageOptions[0]);

                // Process Cutting Diagram
                const cuttingDiagramRes = [...fakeCuttingDiagrams];
                const cuttingDiagramOptions = cuttingDiagramRes.map((item) => ({
                    value: item.id,
                    label: item.name,
                }));
                setCuttingDiagramList(cuttingDiagramRes);
                setCuttingDiagramListOptions(cuttingDiagramOptions);
                cuttingDiagramSelectRef?.current?.setValue(cuttingDiagramOptions[0]);

                // Process Project
                const projectRes = [...fakeProjects];
                const projectOptions = projectRes.map((item) => ({
                    value: item.id,
                    label: item.name,
                }));
                setProjectList(projectRes);
                setProjectListOptions(projectOptions);
                projectSelectRef?.current?.setValue(projectOptions[0]);

                // // Process Details Code
                // const detailsCodeOptions = detailsCodeRes.map((item) => ({
                //     value: item.CodeId,
                //     label: item.CodeName,
                // }));
                // setDetailsCodeList(detailsCodeRes);
                // setDetailsCodeOptions(detailsCodeOptions);

                // Set notification cho tổ tiếp theo
                if (fakeDomesticDetailsAwaitingReception && fakeDomesticDetailsAwaitingReception.length > 0)
                    setAwaitingReception(fakeDomesticDetailsAwaitingReception);
            } catch (error) {
                toast.error("Có lỗi xảy ra khi load dữ liệu.");
                console.error(error);
            }
            setLoading(false);
        };

        fetchData();

        document.title = "Woodsland - Nhập sản lượng chi tiết nội địa";
        return () => {
            document.title = "Woodsland";
            document.body.classList.remove("body-no-scroll");
        };
    }, []);

    useEffect(() => {
        if (loading) {
            document.body.classList.add("body-no-scroll");
        } else {
            document.body.classList.remove("body-no-scroll");
        }
    }, [loading]);

    const getDataFollowingGroup = async (params) => {
        // setLoadingData(true);
        try {
            let params = {
                TO: selectedStage?.value,
                CongDoan: selectedStage?.CongDoan,
            }
            const res = await productionApi.getFinishedGoodsList(params);
            if (typeof res?.data === "object") {
                setData(Object.values(res.data));
            } else {
                setData([]);
            }

            // if (res?.noti_choxacnhan && res?.noti_choxacnhan.length > 0) {
            //     setAwaitingReception(res?.noti_choxacnhan);
            // } else {
            //     setAwaitingReception([]);
            // }
            console.log("Data: ", res?.data);
            // setData(res.data);
        } catch (error) {
            toast.error("Có lỗi trong quá trình lấy dữ liệu.");
        }
        // setLoadingData(false);
    };

    useEffect(() => {
        (async () => {
            if (selectedStage) {
                const isQC = stageList.find(
                    (group) => group.Code == selectedStage.value
                )?.QC;
                if (isQC) {
                    setIsQualityCheck(true);
                } else {
                    setIsQualityCheck(false);
                }
                // setLoadingData(true);
                const params = {
                    TO: selectedStage.value,
                };
                getDataFollowingGroup(params);
            }
        })();
    }, [selectedStage]);

    const handleSearchFinishedDetails = () => {
        setLoadingData(true)
        // Hàm handle filter, fetch,... ra data rồi
        setTimeout(() => {
            setSearchResults(fakeDomesticDetails);
            setLoadingData(false);
        }, 3000)
    }

    const searchItems = (data, searchTerm) => {
        if (!searchTerm) {
            return data;
        }

        const filteredData = [];

        for (const key in data) {
            const item = data[key];
            const filteredDetails = item.Details.filter((detail) => {
                const subitem = `${detail.ChildName} (${detail.CDay}*${detail.CRong}*${detail.CDai})`;

                // Chuyển đổi cả searchTerm và subitem về chữ thường hoặc chữ hoa trước khi so sánh
                const searchTermLower = searchTerm.toLowerCase();
                const subitemLower = subitem.toLowerCase();

                return subitemLower.includes(searchTermLower);
            });

            if (filteredDetails.length > 0) {
                filteredData[key] = { ...item, Details: filteredDetails };
            }
        }

        return filteredData;
    };

    const searchResult = searchItems(data, searchTerm);

    const [progress, setProgress] = useState(0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const progressPath = document.querySelector('.progress-circle path');
        const pathLength = progressPath.getTotalLength();

        progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
        progressPath.style.strokeDashoffset = pathLength;

        const updateProgress = () => {
            const scroll = window.scrollY;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const progress = pathLength - (scroll * pathLength) / height;
            progressPath.style.strokeDashoffset = progress;

            setIsActive(scroll > 50);
        };

        updateProgress();
        window.addEventListener('scroll', updateProgress);

        return () => {
            window.removeEventListener('scroll', updateProgress);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center bg-transparent ">
                {/* Section */}
                <div className="w-screen mb-4 xl:mb-4 pt-2 px-0 xl:p-12 lg:p-12 md:p-12 p-4 xl:px-32">
                    {/* Go back */}
                    <div
                        className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B] xl:mx-0 lg:mx-0 md:mx-0 mx-4"
                        onClick={() => navigate(-1)}
                    >
                        <IoMdArrowRoundBack />
                        <div>Quay lại</div>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between px-4 xl:px-0 lg:px-0 md:px-0 items-center ">
                        <div className="serif xl:text-4xl lg:text-4xl md:text-4xl text-3xl font-bold ">
                            Nhập sản lượng chi tiết
                        </div>
                    </div>

                    {/* Controller */}
                    <div className="flex flex-col justify-between mb-3 px-4 xl:px-0 lg:px-0 md:px-0 items-center gap-4">
                        <div className="my-4 mb-2 w-full pb-4 rounded-xl bg-white ">
                            <div className="flex flex-col p-4 pb-0  w-full justify-end ">
                                <div className="px-0">
                                    <div className="block text-md font-medium text-gray-900 ">
                                        Công đoạn
                                    </div>
                                    <Select
                                        // isDisabled={true}
                                        ref={stageSelectRef}
                                        options={stageListOptions}
                                        defaultValue={selectedStage}
                                        onChange={(value) => {
                                            setSelectedStage(value);
                                        }}
                                        placeholder="Tìm kiếm"
                                        className="mt-2 mb-4 "
                                    />
                                </div>
                                <div className="px-0">
                                    <div className="block text-md font-medium text-gray-900 ">
                                        Mã dự án
                                    </div>
                                    <Select
                                        ref={projectSelectRef}
                                        options={projectListOptions}
                                        defaultValue={selectedProject}
                                        onChange={(value) => {
                                            setSelectedProject(value);
                                        }}
                                        placeholder="Chọn dự án"
                                        className="mt-2 mb-4 "
                                    />
                                </div>
                                <div className="px-0">
                                    <div className="block text-md font-medium text-gray-900 ">
                                        Sơ đồ cắt
                                    </div>
                                    <Select
                                        ref={cuttingDiagramSelectRef}
                                        options={cuttingDiagramListOptions}
                                        defaultValue={selectedCuttingDiagram}
                                        onChange={(value) => {
                                            setSelectedCuttingDiagram(value);
                                        }}
                                        placeholder="Chọn sơ đồ cắt"
                                        className="mt-2 mb-4 "
                                    />
                                </div>
                                <div className="px-0 flex flex-col gap-2">
                                    <div className="block text-md font-medium text-gray-900 ">
                                        Mã chi tiết
                                    </div>

                                    <input
                                        placeholder="Nhập mã chi tiết"
                                        type="text"
                                        id="details-input"
                                        value={selectedDetailsCode}
                                        onChange={(e) => setSelectedDetailsCode(e.target.value)}
                                        className="border pl-3 border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                    />

                                </div>
                                <div className="flex sm:flex-row flex-col-reverse pb-0 w-full justify-between gap-4 mt-4">
                                    {/* <div className="w-full">
                                        <label
                                            htmlFor="search"
                                            className="mb-2 font-medium text-gray-900 sr-only"
                                        >
                                            Tìm kiếm
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <svg
                                                    className="w-4 h-4 text-gray-500"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        stroke="currentColor"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                                    />
                                                </svg>
                                            </div>
                                            <input
                                                type="search"
                                                id="search"
                                                className="block w-full p-2 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Tìm kiếm"
                                                onChange={(e) =>
                                                    setSearchTerm(
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                    </div> */}
                                    {selectedStage &&
                                        !loading &&
                                        awaitingReception?.length > 0 && (
                                            <button
                                                onClick={onModalOpen}
                                                className="!ml-0 mt-0 w-full sm:w-fit backdrop:sm:w-fit h-full space-x-2 inline-flex items-center bg-green-500 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                            >
                                                <HiMiniBellAlert className="text-xl" />
                                                <div className="w-full whitespace-nowrap">
                                                    <span className="hidden sm:inline-block">Thông báo:</span> Có sản lượng chờ xác
                                                    nhận
                                                </div>
                                            </button>
                                        )}
                                    <div className="flex w-full justify-end items-end">
                                        <button
                                            type="button"
                                            disabled={loadingData}
                                            onClick={handleSearchFinishedDetails}
                                            className={`text-white bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none 
                                                ${loadingData ? "bg-gray-100" : " bg-[#eef9fe]"}`}
                                        >
                                            Tìm kiếm
                                        </button>
                                    </div>

                                </div>
                                <div className="my-4 border-b border-gray-200"></div>
                                <div className="flex flex-col gap-4">
                                    {loadingData ? (
                                        <div className="flex justify-center my-6">
                                            <div className="special-spinner"></div>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map((item, index) => (
                                            // Đổi ID
                                            <DomesticOutputCard key={index} detailsData={item} type="CT" />
                                        ))
                                    ) : isFirstTime ? (
                                        <div className="h-full my-6 flex flex-col items-center justify-center text-center">
                                            <BiSearchAlt className="text-center text-gray-400 w-12 h-12 mb-2" />
                                            <div className="text-lg text-gray-400">
                                                Tìm kiếm chi tiết cần nhập sản lượng.
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full my-6 flex flex-col items-center justify-center text-center">
                                            <BiConfused className="text-center text-gray-400 w-12 h-12 mb-2" />
                                            <div className="text-lg text-gray-400">
                                                Không tìm thấy dữ liệu để hiển thị.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                isCentered
                isOpen={isModalOpen}
                size="full"
                // size=""
                onClose={onModalClose}
                scrollBehavior="inside"
            >
                <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                <ModalContent>
                    <ModalHeader>
                        <h1 className="text-xl lg:text-2xl text-bold text-[#17506B]">
                            Danh sách chi tiết chờ nhận
                        </h1>
                    </ModalHeader>
                    <ModalCloseButton />
                    <div className="border-b-2 border-gray-100"></div>
                    <ModalBody className="!p-4">
                        <div className="flex gap-4 justify-center h-full">
                            {awaitingReception?.length > 0 ? (
                                <div className="flex flex-col w-full sm:w-auto sm:grid sm:grid-cols-2 gap-4 lg:grid-cols-3">
                                    {awaitingReception.map((item, index) => (
                                        <DomesticAwaitingReception
                                            type="CT"
                                            data={item}
                                            key={item.id || index}
                                        // index={index}
                                        // CongDoan={item.CongDoan}
                                        // isQualityCheck={isQualityCheck}
                                        // onConfirmReceipt={
                                        //     handleConfirmReceipt
                                        // }
                                        // onRejectReceipt={
                                        //     handleRejectReceipt
                                        // }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex w-full h-full justify-center items-center">
                                    Không có dữ liệu
                                </div>
                            )}
                        </div>
                    </ModalBody>
                    <ModalFooter className="flex flex-col !p-0">
                        <div className="border-b-2 border-gray-100"></div>
                        <div className="flex flex-row xl:px-6 lg-px-6 md:px-6 px-4 w-full items-center justify-end py-4 gap-x-3 ">
                            {
                                awaitingReception?.length > 0 && (<button
                                    className="bg-gray-800 p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full text-white"
                                    type="button"
                                    onClick={handleConfirmAll}
                                >
                                    Xác nhận tất cả
                                </button>)
                            }
                            <button
                                onClick={() => onModalClose()}
                                className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full"
                            >
                                Đóng
                            </button>

                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            {/* <AlertDialog
                isOpen={isAlertDialogOpen}
                onClose={onAlertDialogClose}
                closeOnOverlayClick={false}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>Xác nhận </AlertDialogHeader>
                        <AlertDialogBody>
                            <div className="text-green-700">
                                Ghi nhận sản lượng:{" "}
                                <span className="font-bold">52</span>{" "}
                            </div>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={onAlertDialogClose}>Huỷ bỏ</Button>
                            <Button
                                colorScheme="red"
                                ml={3}
                            >
                                Xác nhận
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog> */}
            <div
                className={`progress-wrap fixed right-12 bottom-12 h-14 w-14 cursor-pointer rounded-full shadow-inner transition-all duration-200 z-50 bg-[#17506B] ${isActive
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible translate-y-4"
                    }`}
                onClick={scrollToTop}
            >
                <svg
                    className="progress-circle svg-content w-full h-full p-1"
                    viewBox="-1 -1 102 102"
                >
                    <path
                        d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
                        className="stroke-[#ABC8D6] stroke-[4] fill-none transition-all duration-200"
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[18px]  text-white ">
                    <FaArrowUp className="w-6 h-6" />
                </span>
            </div>
            {loading && <Loader />}
        </Layout>
    );
}

export default FinishedDetailsReceipt;
