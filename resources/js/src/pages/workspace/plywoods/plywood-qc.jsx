import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../layouts/layout";
import { Link } from "react-router-dom";
import CBGCheckCard from "../../../components/CBGCheckCard";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
} from "@chakra-ui/react";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import usersApi from "../../../api/userApi";
import Select from "react-select";
import useAppContext from "../../../store/AppContext";
import toast from "react-hot-toast";
import productionApi from "../../../api/productionApi";
import Loader from "../../../components/Loader";
import AwaitingReception from "../../../components/AwaitingReception";
import { BiConfused } from "react-icons/bi";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaArrowUp } from "react-icons/fa";

function PlywoodQC() {
    const navigate = useNavigate();
    const { user } = useAppContext();
    const groupSelectRef = useRef();
    const factorySelectRef = useRef();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    const [isQC, setIsQC] = useState(true);

    const [searchTerm, setSearchTerm] = useState(null);
    const [factories, setFactories] = useState([]);

    const [groupList, setGroupList] = useState([]);
    const [groupListOptions, setGroupListOptions] = useState([]);

    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedFactory, setSelectedFactory] = useState(null);

    const [awaitingReception, setAwaitingReception] = useState([]);
    const [isQualityCheck, setIsQualityCheck] = useState(false);

    // QC Data
    const [QCData, setQCData] = useState([]);

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
                        selectedBranch,
                        selectedDimension
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
    }, []);

    // New Get All Group
    useEffect(() => {
        const getAllGroupWithoutQC = async () => {
            setLoading(true);
            try {
                const factory = selectedFactory?.value || null;
                const KHOI = "VCN";
                const res = await productionApi.getAllGroupWithoutQC(
                    factory,
                    KHOI
                );
                const options = res.map((item) => ({
                    value: item.Code,
                    label: item.Name + " - " + item.Code,
                }));
                setGroupList(res);
                options.sort((a, b) => a.label.localeCompare(b.label));
                setGroupListOptions(options);
                setLoading(false);
            } catch (error) {
                toast.error("Có lỗi xảy ra khi load danh sách tổ.");
                console.error(error);
                setLoading(false);
            }
        };
        getAllGroupWithoutQC();
        document.title = "Woodsland - Nhập sản lượng ván công nghiệp";
        return () => {
            document.title = "Woodsland";
            document.body.classList.remove("body-no-scroll");
        };
    }, [selectedFactory]);

    const getDataFollowingGroup = async (param) => {
        setLoadingData(true);
        try {
            const res = await productionApi.getFinishedGoodsListByGroupPlywood(
                param
            );
            setQCData(res);
            if (typeof res?.data === "object") {
                setAwaitingReception(Object.values(res.data));
            } else {
                setAwaitingReception([]);
            }

            console.log("3.Dữ liệu QC: ", res.data);
        } catch (error) {
            toast.error("Có lỗi trong quá trình lấy dữ liệu.");
        }
        setLoadingData(false);
    };

    useEffect(() => {
        (async () => {
            if (selectedGroup) {
                if (isQC) {
                    setIsQualityCheck(true);
                } else {
                    setIsQualityCheck(false);
                }
                const param = {
                    TO: selectedGroup.value,
                };
                getDataFollowingGroup(param);
            }
        })();
    }, [selectedGroup]);

    const handleBackNavigation = (event) => {
        if (event.type === "popstate") {
            navigate("/workspace?production=true");
        }
    };

    useEffect(() => {
        window.addEventListener("popstate", handleBackNavigation);

        return () => {
            window.removeEventListener("popstate", handleBackNavigation);
        };
    }, [navigate]);

    const handleConfirmReceipt = (id) => {
        if (selectedGroup) {
            getDataFollowingGroup({ TO: selectedGroup.value });
            toast.success("Ghi nhận thành công.");
        }
        if (awaitingReception.length <= 0) {
            onModalClose();
        }
    };

    const handleRejectReceipt = (id) => {
        if (selectedGroup) {
            getDataFollowingGroup({ TO: selectedGroup.value });
            toast.success("Huỷ bỏ & chuyển lại thành công.");
        }
        if (awaitingReception.length <= 0) {
            onModalClose();
        }
    };

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

    const filteredData =
        searchTerm && typeof searchTerm === "string"
            ? awaitingReception.filter((item) => {
                  const searchString = `${item.ItemName} (${item.CDay}x${item.CRong}x${item.CDai})`;
                  return searchString
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase());
              })
            : awaitingReception;

    

    return (
        <Layout>
            <div className="flex justify-center bg-transparent ">
                {/* Section */}
                <div className="w-screen mb-4 xl:mb-4 pt-2 px-0 xl:p-12 lg:p-12 md:p-12 xl:pt-6 lg:pt-6 md:pt-6 p-4 xl:px-32">
                    {/* Go back */}
                    <div
                        className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B] xl:mx-0 lg:mx-0 md:mx-0 mx-4"
                        onClick={() => navigate(-1)}
                    >
                        <IoMdArrowRoundBack />
                        <div>Quay lại</div>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between px-4 xl:px-0 lg:px-0 md:px-0 items-center">
                        <div className="serif xl:text-4xl lg:text-4xl md:text-4xl text-3xl font-bold ">
                            Kiểm định chất lượng <span className=" text-[#402a62]">ván công nghiệp</span>
                        </div>
                    </div>

                    {/* Controller */}
                    <div className="flex flex-col justify-between mb-6 px-4 xl:px-0 lg:px-0 md:px-0 items-center gap-4">
                        <div className="my-4 mb-0 mt-3 w-full pb-4 rounded-xl bg-white">
                            <div className="flex flex-col p-4 pb-0  w-full justify-end">
                                {/* Select Progress*/}
                                <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col xl:space-x-3 lg:space-x-3 md:space-x-3 space-x-0 ">
                                    {user.role == 1 && (
                                        <div className="px-0 w-full">
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
                                                    console.log(
                                                        "Selected factory: ",
                                                        value
                                                    );
                                                }}
                                                placeholder="Tìm kiếm"
                                                className="mt-1 mb-3 w-full"
                                            />
                                        </div>
                                    )}

                                    <div className="px-0 w-full">
                                        <div className="block xl:text-md lg:text-md md:text-md text-sm font-medium text-gray-900 ">
                                            Tổ & Xưởng sản xuất
                                        </div>
                                        <Select
                                            options={groupListOptions}
                                            defaultValue={selectedGroup}
                                            onChange={(value) => {
                                                setSelectedGroup(value);
                                                console.log(
                                                    "2. Selected Group: ",
                                                    value
                                                );
                                            }}
                                            placeholder="Chọn tổ, xưởng sản xuất"
                                            className="mt-1 mb-4 w-full"
                                        />
                                    </div>
                                </div>

                                {/* Search */}
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
                                                placeholder="Tìm kiếm chi tiết lỗi"
                                                onChange={(value) => {
                                                    setSearchTerm(
                                                        value.target.value
                                                    );
                                                }}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Data */}
                        {filteredData.length > 0 && <div className="w-full text-gray-500">Có tất cả <b>{filteredData.length}</b> chi tiết lỗi </div>}
                        <div className="flex my-2 gap-4 justify-center h-full">
                            {loadingData ? (
                                <div className="flex justify-center mt-12">
                                    <div class="special-spinner"></div>
                                </div>
                            ) : (
                                <>
                                    {selectedGroup &&
                                    awaitingReception?.length > 0 ? (
                                        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 lg:grid-cols-3">
                                            {filteredData.map((item, index) => (
                                                <AwaitingReception
                                                    type="plywood"
                                                    data={item}
                                                    key={index}
                                                    index={index}
                                                    errorType={QCData.errorType}
                                                    solution={QCData.solution}
                                                    teamBack={QCData.teamBack}
                                                    rootCause={QCData.rootCause}
                                                    returnCode={
                                                        QCData.returnCode
                                                    }
                                                    variant="QC"
                                                    isQualityCheck={
                                                        isQualityCheck
                                                    }
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
                                        <div className="h-full mt-10 flex flex-col items-center justify-center text-center">
                                            <BiConfused className="text-center text-gray-400 w-12 h-12 mb-2" />
                                            <div className="  text-lg text-gray-400">
                                                Không tìm thấy dữ liệu để hiển
                                                thị.
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
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

export default PlywoodQC;
