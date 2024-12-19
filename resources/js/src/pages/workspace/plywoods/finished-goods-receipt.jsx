import React, { useEffect, useState, useRef } from "react";
import Layout from "../../../layouts/layout";
import { Link, useNavigate } from "react-router-dom";
import { HiPlus, HiArrowLeft } from "react-icons/hi";
import { Spinner } from "@chakra-ui/react";
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
    Stack,
    useDisclosure,
} from "@chakra-ui/react";
import { HiMiniBellAlert } from "react-icons/hi2";
import Select, { components } from "react-select";
import AsyncSelect from "react-select/async";
import toast from "react-hot-toast";
import productionApi from "../../../api/productionApi";
import usersApi from "../../../api/userApi";
import FinishedGoodsIllustration from "../../../assets/images/wood-receipt-illustration.png";
import Loader from "../../../components/Loader";
import useAppContext from "../../../store/AppContext";
import PlyWoodItemInput from "../../../components/PlyWoodItemInput";
import ItemInput from "../../../components/ItemInput";
import AwaitingReception from "../../../components/AwaitingReception";
import AwaitingErrorReception from "../../../components/AwaitingErrorReception";
import { BiConfused } from "react-icons/bi";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaArrowUp } from "react-icons/fa";

function PlywoodFinishedGoodsReceipt() {
    const { user } = useAppContext();
    const navigate = useNavigate();
    // const { loading, setLoading } = useAppContext();
    const groupSelectRef = useRef();
    const factorySelectRef = useRef();

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

    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [finishedProductData, setFinishedProductData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(false);

    const [groupListOptions, setGroupListOptions] = useState([]);
    const [groupList, setGroupList] = useState([]);
    const [factories, setFactories] = useState([]);

    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [isQualityCheck, setIsQualityCheck] = useState(false);

    const handleReceiptFromChild = (data, receipts) => {
        const params = {
            TO: selectedGroup.value,
        };
        getDataFollowingGroup(params);
    };

    const handleRejectFromChild = (data, faults) => {
        const params = {
            TO: selectedGroup.value,
        };
        getDataFollowingGroup(params);
    };

    const handleConfirmReceipt = (id) => {
        if (selectedGroup) {
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
        if (selectedGroup) {
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
      if (event.type === 'popstate') {
        navigate('/workspace?production=true');
      }
    };
  
    useEffect(() => {
      window.addEventListener('popstate', handleBackNavigation);
  
      return () => {
        window.removeEventListener('popstate', handleBackNavigation);
      };
    }, [navigate]);;


    useEffect(() => {
        const selectedBranch = user?.branch;
        const selectedDimension = "VCN";

    const getFactoriesByBranchId = async () => {
            // setFactoryLoading(true);
            try {
                if (selectedBranch) {
                    factorySelectRef.current.clearValue();
                    setFactories([]);
                    const res = await usersApi.getFactoriesByBranchId(
                        selectedBranch, selectedDimension
                    );

                    const options = res.map((item) => ({
                        value: item.Code,
                        label: item.Name,
                    }));

                    setFactories(options);
                } else {
                    setFactories([]);
                }
            } catch (error) {
                console.error(error);
            }
            // setFactoryLoading(false);
        };
        getFactoriesByBranchId();
        // }
    },[]);       

    // New Get All Group
    useEffect(() => {
        const getAllGroupWithoutQC = async () => {
            const KHOI = "VCN";
            const factory = selectedFactory?.value || null;
            setLoading(true);
            try {
                const res = await productionApi.getAllGroupWithoutQC(factory, KHOI);
                const options = res.map((item) => ({
                    value: item.Code,
                    label: item.Name + " - " + item.Code,
                    Factory: item.Factory,
                }));
                setGroupList(res);
                options.sort((a, b) => a.label.localeCompare(b.label));
                setGroupListOptions(options);
                groupSelectRef?.current?.setValue(options[0]);
            } catch (error) {
                toast.error("Có lỗi xảy ra khi load danh sách tổ.");
                console.error(error);
            }
            setLoading(false);
        };
        getAllGroupWithoutQC();
        document.title = "Woodsland - Nhập sản lượng ván công nghiệp";
        return () => {
            document.title = "Woodsland";
            document.body.classList.remove("body-no-scroll");
        };
    }, [selectedFactory]);

    useEffect(() => {
        if (loading) {
            document.body.classList.add("body-no-scroll");
        } else {
            document.body.classList.remove("body-no-scroll");
        }
    }, [loading]);

    const getDataFollowingGroup = async (params) => {
        setLoadingData(true);
        try {
            const res = await productionApi.getFinishedPlywoodGoodsList(params);
            if (typeof res?.data === "object") {
                setData(Object.values(res.data));
            } else {
                setData([]);
            }

            if (res?.noti_choxacnhan && res?.noti_choxacnhan.length > 0) {
                setAwaitingReception(res?.noti_choxacnhan);
            } else {
                setAwaitingReception([]);
            }
            console.log("Data: ", res?.data);
            // setData(res.data);
        } catch (error) {
            toast.error("Có lỗi trong quá trình lấy dữ liệu.");
        }
        setLoadingData(false);
    };

    useEffect(() => {
        (async () => {
            if (selectedGroup) {
                const isQC = groupList.find(
                    (group) => group.Code == selectedGroup.value
                )?.QC;
                if (isQC) {
                    setIsQualityCheck(true);
                } else {
                    setIsQualityCheck(false);
                }
                // setLoadingData(true);
                const params = {
                    TO: selectedGroup.value,
                };
                getDataFollowingGroup(params);

            }
        })();
    }, [selectedGroup]);

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
                <div className="w-screen mb-4 xl:mb-4 pt-2 px-0 xl:p-12 xl:pt-6 lg:pt-6 md:pt-6 lg:p-12 md:p-12 p-4 xl:px-32">
                    {/* Go back */}
                    <div 
                        className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B] xl:ml-0 lg:ml-0 md:ml-0 ml-4"
                        onClick={() => navigate(-1)}
                    >
                        <IoMdArrowRoundBack />
                        <div>Quay lại</div>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between px-4 xl:px-0 lg:px-0 md:px-0 items-center">
                        <div className="serif xl:text-4xl lg:text-4xl md:text-4xl text-3xl font-bold ">
                            Nhập sản lượng khối <span className=" text-[#402a62]">ván công nghiệp</span>
                        </div>
                    </div>

                    {/* Controller */}
                    <div className="flex flex-col justify-between mb-3 px-4 xl:px-0 lg:px-0 md:px-0 items-center gap-4">
                        <div className="my-4 mb-2 mt-3 w-full pb-4 rounded-xl bg-white ">
                            <div className="flex flex-col p-4 pb-0  w-full justify-end ">
                                <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col xl:space-x-3 lg:space-x-3 md:space-x-3 space-x-0 ">
                                    {user.role == 1 && (<div className="px-0 w-full">
                                        <div className="block xl:text-md lg:text-md md:text-md text-sm font-medium text-gray-900 ">
                                            Nhà máy sản xuất
                                        </div>
                                        <Select
                                            // isDisabled={true}
                                            ref={factorySelectRef}
                                            options={factories}
                                            defaultValue={factories}
                                            onChange={(value) => {
                                                setSelectedFactory(value);
                                                console.log("Selected factory: ", value);
                                            }}
                                            placeholder="Tìm kiếm"
                                            className="mt-1 mb-3 w-full"
                                        />
                                    </div>)} 

                                    <div className="px-0 w-full">
                                        <div className="block xl:text-md lg:text-md md:text-md text-sm font-medium text-gray-900">
                                            Tổ & Xưởng sản xuất
                                        </div>
                                        <Select
                                            isDisabled={loadingData}
                                            ref={groupSelectRef}
                                            options={groupListOptions}
                                            defaultValue={selectedGroup}
                                            onChange={(value) => {
                                                setSelectedGroup(value);
                                            }}
                                            placeholder="Tìm kiếm"
                                            className="mt-1 mb-4 w-full"
                                        />
                                    </div>
                                </div>

                                <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col pb-0 w-full justify-end space-x-4">
                                <div className="w-full">
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
                                            placeholder="Tìm kiếm bán thành phẩm"
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                {selectedGroup &&
                                    !loadingData &&
                                    awaitingReception?.length > 0 && (
                                        <button
                                            onClick={onModalOpen}
                                            className="!ml-0 mt-3 sm:mt-0 sm:!ml-4 w-full sm:w-fit backdrop:sm:w-fit h-full space-x-2 inline-flex items-center bg-green-500 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                        >
                                            <HiMiniBellAlert className="text-xl" />
                                            <div className="w-full whitespace-nowrap">
                                                Thông báo: Có phôi chờ xác nhận
                                            </div>
                                        </button>
                                    )}
                                </div>                            
                            </div>                                                  
                        </div>
                    </div>

                    <div className="w-full flex flex-col pb-2 gap-4 gap-y-4 sm:px-0">
                        {loadingData ? (
                            <div className="flex justify-center mt-12">
                                <div className="special-spinner"></div>
                            </div>
                        ) : searchResult.length > 0 ? (
                            searchResult.map((item, index) => (
                                <ItemInput
                                    data={item}
                                    MaThiTruong={item.MaThiTruong}
                                    index={index}
                                    key={index}
                                    selectedGroup={selectedGroup}
                                    searchTerm={searchTerm}
                                    variant="VCN"
                                    nextGroup={item.nextGroup}
                                    fromGroup={item.fromGroup}
                                    isQualityCheck={isQualityCheck}
                                    onReceiptFromChild={handleReceiptFromChild}
                                    onRejectFromChild={handleRejectFromChild}
                                />
                            ))
                        ) : (
                            <div className="h-full mt-10 flex flex-col items-center justify-center text-center">
                                <BiConfused className="text-center text-gray-400 w-12 h-12 mb-2" />
                                <div className="  text-lg text-gray-400">
                                    Không tìm thấy dữ liệu để hiển thị.
                                </div>
                            </div>
                        )}
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
                            Danh sách phôi chờ nhận
                        </h1>
                    </ModalHeader>
                    <ModalCloseButton />
                    <div className="border-b-2 border-gray-100"></div>
                    <ModalBody className="!p-4">
                        <div className="flex gap-4 justify-center h-full">
                            {selectedGroup && awaitingReception?.length > 0 ? (
                                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 lg:grid-cols-3">
                                    {awaitingReception.map((item, index) => (
                                        <AwaitingReception
                                            type="plywood"
                                            data={item}
                                            key={index}
                                            index={index}
                                            isQualityCheck={isQualityCheck}
                                            onConfirmReceipt={
                                                handleConfirmReceipt
                                            }
                                            onRejectReceipt={
                                                handleRejectReceipt
                                            }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 flex w-full h-full justify-center items-center">
                                    Không có dữ liệu để hiển thị.
                                </div>
                            )}
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <AlertDialog
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
                                // onClick={}
                                ml={3}
                            >
                                Xác nhận
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            <div
                className={`progress-wrap fixed right-12 bottom-12 h-14 w-14 cursor-pointer rounded-full shadow-inner transition-all duration-200 z-50 bg-[#17506B] ${
                    isActive
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
                <span className="absolute inset-0 flex items-center justify-center text-[18px]  text-white " >
                    <FaArrowUp className="w-6 h-6"/>
                </span>
            </div>
            {loading && <Loader />}
        </Layout>
    );
}

export default PlywoodFinishedGoodsReceipt;