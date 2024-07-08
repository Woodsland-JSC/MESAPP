import React, { useEffect, useState } from "react";
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
import { Spinner } from "@chakra-ui/react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import axios from "axios";
import toast from "react-hot-toast";
import { addDays, format, add } from "date-fns";
import moment from "moment";
import productionApi from "../../../api/productionApi";
import Loader from "../../../components/Loader";
import AwaitingReception from "../../../components/AwaitingReception";

function WoodProductingQC() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    const [isQC, setIsQC] = useState(true);

    const [searchTerm, setSearchTerm] = useState(null);

    const [groupList, setGroupList] = useState([]);
    const [groupListOptions, setGroupListOptions] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const [awaitingReception, setAwaitingReception] = useState([]);
    const [isQualityCheck, setIsQualityCheck] = useState(false);

    // QC Data
    const [QCData, setQCData] = useState([]);

    // New Get All Group
    useEffect(() => {
        const getAllGroupWithoutQC = async () => {
            try {
                const res = await productionApi.getAllGroupWithoutQC();
                const options = res.map((item) => ({
                    value: item.Code,
                    label: item.Name + " - " + item.Code,
                }));
                setGroupList(res);
                setGroupListOptions(options);
                console.log("1. Get all group: ", options);
            } catch (error) {
                toast.error("Có lỗi xảy ra khi load danh sách tổ.");
                console.error(error);
            }
        };
        getAllGroupWithoutQC();
        document.title = "Woodsland - Nhập sản lượng ván công nghiệp";
        return () => {
            document.title = "Woodsland";
            document.body.classList.remove("body-no-scroll");
        };
    }, []);

    const getDataFollowingGroup = async (param) => {
        setLoadingData(true);
        try {
            const res = await productionApi.getFinishedGoodsListByGroup(param);
            setQCData(res);

            if (typeof res?.data === "object") {
                setAwaitingReception(Object.values(res.data));
            } else {
                setAwaitingReception([]);
            }
            console.log("3.Dữ liệu QC: ", res.data);
            setLoadingData(false);
        } catch (error) {
            toast.error("Có lỗi trong quá trình lấy dữ liệu.");
            setLoadingData(false);
        } 
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

    const navigate = useNavigate();

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
                <div className="w-screen mb-4 xl:mb-4 p-6 px-3 xl:p-12 xl:px-32">
                    {/* Breadcrumb */}
                    <div className="mb-4">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="w-full inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center">
                                        <a
                                            href="#"
                                            className="xl:ml-0 lg:ml-0 md:ml-0 text-sm font-medium text-[#17506B]"
                                        >
                                            Workspace
                                        </a>
                                    </div>
                                </li>
                                <li aria-current="page">
                                    <div className="flex  items-center">
                                        <svg
                                            className="w-3 h-3 text-gray-400 mx-1"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 6 10"
                                        >
                                            <path
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="m1 9 4-4-4-4"
                                            />
                                        </svg>
                                        <Link
                                            to="/workspace?production=true"
                                            className="w-full flex-nowrap ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            <div className="">
                                                <div className="xl:w-full lg:w-full md:w-full w-[205px]">
                                                    Quản lý sản xuất
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div className="text-3xl font-bold ">
                            Kiểm định chất lượng chế biến gỗ
                        </div>
                    </div>

                    {/* Controller */}
                    <div className=" my-4 mb-6 xl:w-full p-4 w-full border-2 border-gray-300 rounded-xl bg-white z-0">
                        {/* Search */}
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
                                    className="block w-full p-2.5 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Tìm kiếm"
                                    onChange={(value) => {
                                        setSearchTerm(value.target.value);
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Select Progress*/}
                        <div className="mt-4">
                            <label
                                htmlFor="first_name"
                                className="block mb-2 text-md font-medium text-gray-900"
                            >
                                Tổ, xưởng sản xuất
                            </label>
                            <Select
                                options={groupListOptions}
                                defaultValue={selectedGroup}
                                onChange={(value) => {
                                    setSelectedGroup(value);
                                    console.log("2. Selected Group: ", value);
                                }}
                                placeholder="Chọn tổ, xưởng sản xuất"
                                className=""
                            />
                        </div>

                        {/* Data */}
                        <div className="flex my-5 gap-4 justify-center h-full">
                            {loadingData ? (
                                <div className="text-center mt-8">
                                    <Spinner
                                        thickness="4px"
                                        speed="0.65s"
                                        emptyColor="gray.200"
                                        color="#155979"
                                        size="xl"
                                    />
                                </div>
                            ) : (
                                <>
                                    {selectedGroup &&
                                    awaitingReception?.length > 0 ? (
                                        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 lg:grid-cols-3">
                                            {filteredData.map((item, index) => (
                                                <AwaitingReception
                                                    type="wood-processing"
                                                    data={item}
                                                    key={index}
                                                    index={index}
                                                    variant="QC"
                                                    errorType={QCData.errorType} 
                                                    solution={QCData.solution}
                                                    teamBack={QCData.teamBack}
                                                    rootCause={QCData.rootCause}
                                                    returnCode={QCData.returnCode}
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
                                        <div className="flex w-full h-full justify-center items-center">
                                            Không có dữ liệu
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default WoodProductingQC;
