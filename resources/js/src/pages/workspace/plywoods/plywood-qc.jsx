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
import { BiConfused } from "react-icons/bi";
import { IoMdArrowRoundBack } from "react-icons/io";

function PlywoodQC() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    const [isQC, setIsQC] = useState(true);

    const [searchTerm, setSearchTerm] = useState(null);
    // const [filteredData, setFilteredData] = useState(null);

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
            // setLoading(true);
            try {
                const res = await productionApi.getAllGroupWithoutQC();
                const options = res.map((item) => ({
                    value: item.Code,
                    label: item.Name + " - " + item.Code,
                }));
                setGroupList(res);
                setGroupListOptions(options);
                console.log("1. Get all group: ", options);
                // setSelectedGroup(options[0]);
            } catch (error) {
                toast.error("Có lỗi xảy ra khi load danh sách tổ.");
                console.error(error);
            }
            // setLoading(false);
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

    const navigate = useNavigate();

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
            // setAwaitingReception((prev) =>
            //     prev.filter((item) => item.id !== id)
            // );
            getDataFollowingGroup({ TO: selectedGroup.value });
            toast.success("Ghi nhận thành công.");
        }
        if (awaitingReception.length <= 0) {
            onModalClose();
        }
    };

    const handleRejectReceipt = (id) => {
        if (selectedGroup) {
            // setAwaitingReception((prev) =>
            //     prev.filter((item) => item.id !== id)
            // );
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
                    <div className="flex justify-between px-4 xl:px-0 lg:px-0 md:px-0 items-center">
                        <div className="serif xl:text-4xl lg:text-4xl md:text-4xl text-3xl font-bold ">
                            Kiểm định chất lượng ván công nghiệp
                        </div>
                    </div>

                    {/* Controller */}
                    <div className="flex flex-col justify-between mb-6 px-4 xl:px-0 lg:px-0 md:px-0 items-center gap-4">
                        <div className="my-4 mb-0 w-full  rounded-xl bg-white z-0">
                            <div className="flex flex-col p-4  w-full ">
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
                                                setSearchTerm(
                                                    value.target.value
                                                );
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
                                            // getDataFollowingGroup(value.value);
                                            console.log(
                                                "2. Selected Group: ",
                                                value
                                            );
                                        }}
                                        placeholder="Chọn tổ, xưởng sản xuất"
                                        className=""
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Data */}
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
                                                returnCode={QCData.returnCode}
                                                variant="QC"
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
                                    <div className="mt-10 flex flex-col items-center justify-center text-center">
                                        <BiConfused className="text-center text-gray-400 w-12 h-12 mb-2" />
                                        <div className="  text-lg text-gray-400">
                                            Không tìm thấy dữ liệu để hiển thị.
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default PlywoodQC;
