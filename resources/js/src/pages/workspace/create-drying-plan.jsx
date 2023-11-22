import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layouts/layout";
import { Link } from "react-router-dom";
import BOWCard from "../../components/BOWCard";
import { HiPlus } from "react-icons/hi";
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
import Select from "react-select";
import AsyncSelect from "react-select/async";
import palletsApi from "../../api/palletsApi";

function CreateDryingPlan() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [kiln, setKlin] = useState([]);
    const [dryingReasonsPlan, setDryingReasonsPlan] = useState([]);
    const [thickness, setThickness] = useState([]);

    // Validating
    const [selectedKiln, setSelectedKiln] = useState(null);
    const [selectedDryingReasonsPlan, setSelectedDryingReasonsPlan] =
        useState(null);
    const [selectedThickness, setSelectedThickness] = useState(null);

    useEffect(() => {
        palletsApi
            .getKiln()
            .then((data) => {
                const options = data.map((item) => ({
                    value: item.Code,
                    label: item.Name,
                }));
                setKlin(options);
            })
            .catch((error) => {
                console.error("Error fetching kiln list:", error);
            });

        palletsApi
            .getPlanDryingReason()
            .then((data) => {
                const options = data.map((item) => ({
                    value: item.Code,
                    label: item.Name,
                }));
                setDryingReasonsPlan(options);
            })
            .catch((error) => {
                console.error("Error fetching drying reasons:", error);
            });

        if (selectedDryingReasonsPlan) {
            palletsApi
                .getThickness({
                    reason: selectedDryingReasonsPlan.value,
                })
                .then((data) => {
                    const options = data.map((item) => ({
                        value: item.Code,
                        label: item.Name,
                    }));
                    setThickness(options);
                })
                .catch((error) => {
                    console.error("Error fetching thickness:", error);
                });
        }
    }, []);

    const handleCompletion = () => {
        console.log("Result:", {
            Lò: selectedKiln.value,
            "Mục đích": selectedDryingReasonsPlan.value,
            selectedThickness,
        });
    };

    const loadThicknessOptions = async (inputValue, callback) => {
        if (selectedDryingReasonsPlan) {
            try {
                const response = await palletsApi.getThickness({
                    reason: selectedDryingReasonsPlan.value,
                });

                const options = response.map((item) => ({
                    value: item.Code,
                    label: item.Name,
                }));
                callback(options);
            } catch (error) {
                console.error("Error fetching thickness:", error);
            }
        }
    };

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
                                            <div>Tạo kế hoạch sấy</div>
                                        </span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between mb-6 items-center">
                        <div className="text-3xl font-bold ">
                            Tạo kế hoạch sấy
                        </div>
                        <button
                            className="bg-[#1f2937] font-medium rounded-xl p-2.5 px-4 text-white xl:flex items-center md:flex hidden active:scale-[.95] active:duration-75 transition-all"
                            onClick={onOpen}
                        >
                            <HiPlus className="text-xl mr-2" />
                            Tạo mới
                        </button>
                    </div>

                    <Modal
                        closeOnOverlayClick={false}
                        onClose={onClose}
                        isOpen={isOpen}
                        isCentered
                    >
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Tạo kế hoạch sấy</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                <div className="flex flex-col space-y-5">
                                    <div className="">
                                        <label
                                            for="first_name"
                                            className="block mb-2 text-md font-medium text-gray-900"
                                        >
                                            Lò sấy
                                        </label>
                                        <Select
                                            options={kiln}
                                            onChange={(value) => {
                                                console.log(
                                                    "Selecte Kiln",
                                                    value
                                                );
                                                setSelectedKiln(value);
                                            }}
                                        />
                                    </div>
                                    <div className="">
                                        <label
                                            for="first_name"
                                            className="block mb-2 text-md font-medium text-gray-900"
                                        >
                                            Mục đích sấy
                                        </label>
                                        <Select
                                            options={dryingReasonsPlan}
                                            onChange={(value) => {
                                                console.log(
                                                    "Selected Drying Reason:",
                                                    value
                                                );
                                                setSelectedDryingReasonsPlan(
                                                    value
                                                );
                                            }}
                                        />
                                    </div>
                                    <div className="">
                                        <label
                                            for="first_name"
                                            className="block mb-2 text-md font-medium text-gray-900"
                                        >
                                            Chiều dày sấy
                                        </label>
                                        {/* <AsyncSelect
                                            options={thickness}
                                            onChange={(value) => {
                                                console.log(
                                                    "Selected Thickness:",
                                                    value
                                                );
                                                setSelectedThickness(value);
                                            }}
                                        /> */}
                                        {/* <AsyncSelect
                                            loadOptions={loadThicknessOptions}
                                            onChange={(value) => {
                                                console.log(
                                                    "Selected Thickness:",
                                                    value
                                                );
                                                setSelectedThickness(value);
                                            }}
                                        /> */}
                                        <Select
                                            options={thickness}
                                            onChange={(value) => {
                                                console.log(
                                                    "Selected Thickness:",
                                                    value
                                                );
                                                setSelectedThickness(value);
                                            }}
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <div className="flex gap-4">
                                    <Button onClick={onClose}>Đóng</Button>
                                    <Button
                                        colorScheme="facebook"
                                        onClick={handleCompletion}
                                    >
                                        Hoàn thành
                                    </Button>
                                </div>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                    {/* Controller */}
                    <div className=" my-4 mb-6 xl:w-full">
                        <label
                            for="search"
                            className="mb-2 text-sm font-medium text-gray-900 sr-only"
                        >
                            Search
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
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                    />
                                </svg>
                            </div>
                            <input
                                type="search"
                                id="search"
                                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search"
                                required
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
                        <BOWCard
                            status="Đang sấy và chưa đánh giá mẻ sấy"
                            batchNumber="2023.41.08"
                            kilnNumber="15 (TH)"
                            thickness="24-27"
                            height="24"
                            purpose="INDOOR"
                            finishedDate="2023-11-07 10:58:14"
                            palletQty="111"
                            weight="130.72 (m³)"
                        />
                        <BOWCard
                            status="Đang sấy và chưa đánh giá mẻ sấy"
                            batchNumber="2023.41.08"
                            kilnNumber="15 (TH)"
                            thickness="24-27"
                            height="24"
                            purpose="INDOOR"
                            finishedDate="2023-11-07 10:58:14"
                            palletQty="111"
                            weight="130.72 (m³)"
                        />
                        <BOWCard
                            status="Đang sấy và chưa đánh giá mẻ sấy"
                            batchNumber="2023.41.08"
                            kilnNumber="15 (TH)"
                            thickness="24-27"
                            height="24"
                            purpose="INDOOR"
                            finishedDate="2023-11-07 10:58:14"
                            palletQty="111"
                            weight="130.72 (m³)"
                        />
                        <BOWCard
                            status="Đang sấy và chưa đánh giá mẻ sấy"
                            batchNumber="2023.41.08"
                            kilnNumber="15 (TH)"
                            thickness="24-27"
                            height="24"
                            purpose="INDOOR"
                            finishedDate="2023-11-07 10:58:14"
                            palletQty="111"
                            weight="130.72 (m³)"
                        />
                    </div>

                    <div class="fixed bottom-7 right-8 xl:hidden md:hidden block">
                        <button
                            class="bg-[#1f2937] hover:bg-[#2d3b4e] text-white font-bold p-5 rounded-full shadow-lg"
                            onClick={onOpen}
                        >
                            <HiPlus className="text-2xl" />
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default CreateDryingPlan;
