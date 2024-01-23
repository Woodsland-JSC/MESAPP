import React, { useEffect, useState } from "react";
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
import { Checkbox, CheckboxGroup } from '@chakra-ui/react'
import { Spinner } from "@chakra-ui/react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import palletsApi from "../../../api/QCApi";
import axios from "axios";
import toast from "react-hot-toast";
import { addDays, format, add } from "date-fns";
import moment from "moment";
import Loader from "../../../components/Loader";

// Sample data
const processListSample = [
  {
      value: "TH-X5LP",
      label: "Tổ Lựa phôi X5"
  },
  {
      value: "TH-X3LP",
      label: "Tổ Lựa phôi X3 mới"
  },
  {
      value: "TH-RN",
      label: "Tổ Runnen"
  },
  {
      value: "TH-YSVGT",
      label: "Tổ VGT nội địa YS"
  },
  {
      value: "TH-X3SC",
      label: "Tổ Sơ chế X3"
  },
  {
      value: "TH-X7HT",
      label: "Tổ Hoàn thiện X7"
  }
]

function WoodProductingQC() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [processList, setProcessList] = useState(null);
    const [selectedProcess, setSelectedProcess] = useState(null);

    // useEffect(() => {
    //   palletsApi
    //       .getCBGProcesses()
    //       .then((response) => {
    //         //   console.log("1. Load danh sách tổ công đoạn:", response);
    //           const processOptions = response.map((item) => ({
    //               value: item.Code,
    //               label: item.Name,
    //           }));

    //           setProcessList(processOptions);
    //       })
    //       .catch((error) => {
    //           console.error("Error fetching Process List:", error);
    //       });
    // }, []);

    return (
        <Layout>
            <div className="flex justify-center bg-transparent ">
                {/* Section */}
                <div className="w-screen mb-4 xl:mb-4 p-6 px-5 xl:p-12 xl:px-32">
                    {/* Breadcrumb */}
                    <div className="mb-4">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="w-full inline-flex items-center space-x-1 md:space-x-3">
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
                                    <div class="flex  items-center">
                                        <svg
                                            class="w-3 h-3 text-gray-400 mx-1"
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
                                            to="/workspace"
                                            class="w-full flex-nowrap ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            <div className="">
                                                <div className="xl:w-full lg:w-full md:w-full w-[205px]">
                                                    Kiểm định chất lượng
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between mb-6 items-center">
                        <div className="text-3xl font-bold ">Chế biến gỗ</div>
                    </div>

                    {/* Controller */}
                    <div className=" my-4 mb-6 xl:w-full">
                        {/* Select Progress*/}
                        <div className="mb-4">
                            <label
                                htmlFor="first_name"
                                className="block mb-2 text-md font-medium text-gray-900"
                            >
                                Chọn công đoạn 
                            </label>
                            <Select
                                options={processListSample}
                                onChange={(value) => {
                                    console.log(
                                        "Công đoạn đã chọn:",
                                        value
                                    );
                                    setSelectedProcess(value);
                                }}
                            />
                        </div>

                        {/* Search */}
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
                                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Tìm kiếm theo quy cách"
                                required
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
                        <CBGCheckCard 
                            id="1"
                            itemName="NAMM Bàn 200-Nan mặt ngoài"
                            method="24*58*720"
                            Qty="1465"
                            batchNo="YS12315BTP-04"
                            defectCode="924253"
                        />
                        <CBGCheckCard 
                            id="1"
                            itemName="NAMM Bàn 200-Nan mặt ngoài"
                            method="24*58*720"
                            Qty="1465"
                            batchNo="YS12315BTP-04"
                            defectCode="924253"
                        />
                        <CBGCheckCard 
                            id="1"
                            itemName="NAMM Bàn 200-Nan mặt ngoài"
                            method="24*58*720"
                            Qty="1465"
                            batchNo="YS12315BTP-04"
                            defectCode="924253"
                        />
                        <CBGCheckCard 
                            id="1"
                            itemName="NAMM Bàn 200-Nan mặt ngoài"
                            method="24*58*720"
                            Qty="1465"
                            batchNo="YS12315BTP-04"
                            defectCode="924253"
                        />
                        <CBGCheckCard 
                            id="1"
                            itemName="NAMM Bàn 200-Nan mặt ngoài"
                            method="24*58*720"
                            Qty="1465"
                            batchNo="YS12315BTP-04"
                            defectCode="924253"
                        />
                        <CBGCheckCard 
                            id="1"
                            itemName="NAMM Bàn 200-Nan mặt ngoài"
                            method="24*58*720"
                            Qty="1465"
                            batchNo="YS12315BTP-04"
                            defectCode="924253"
                        />
                        
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default WoodProductingQC;
