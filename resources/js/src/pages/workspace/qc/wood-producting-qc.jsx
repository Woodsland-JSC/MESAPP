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

const steps = [
    { title: "Bước 1", description: "Chọn loại sản phẩm" },
    { title: "Bước 2", description: "Kiểm tra thông tin" },
    { title: "Bước 3", description: "Nhập số lượng sản phẩm" },
];

var waitingReceiptNotifications = [
    {
        id: 70152702,
        subItemName: "TYBYN Bàn bar 74 đen - Mặt trên AD",
        thickness: 15,
        width: 367.5,
        length: 740,
        amount: 2,
        createdDate: new Date(),
        createdBy: {
            id: 54,
            last_name: "Nguyen",
            first_name: "An",
        },
        fromGroup: {
            id: "TH-X3SC",
            no: 3,
            name: "Tổ Sơ chế X3",
        },
    },
];

var exampleData = [
    {
        id: 1,
        itemName: "TYBYN bar table 74x74x102 acacia/black",
        previousGroup: null,
        fromGroup: {
            id: "TH-X3SC",
            no: 3,
            name: "Tổ Sơ chế X3",
        },
        nextGroup: {
            id: "TH-X3TC1",
            no: 4,
            name: "Tổ Tinh chế 1 X3",
        },
        itemDetails: [
            {
                id: 70152702,
                subItemName: "TYBYN Bàn bar 74 đen - Mặt trên AD",
                thickness: 15,
                width: 367.5,
                length: 740,
                stockQuantity: 420,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2344TP-01",
                        quantity: 960,
                        done: 719,
                        faults: 0,
                        processing: 241,
                    },
                    {
                        command: "TH2344TP-02",
                        quantity: 800,
                        done: 400,
                        faults: 2,
                        processing: 398,
                    },
                ],
                totalQuantity: 1760,
                totalDone: 1119,
                totalFaults: 2,
                totalProcessing: 641,
            },
            {
                id: 70152703,
                subItemName: "TYBYN Bàn bar 74 đen - Mặt dưới CD",
                thickness: 30,
                width: 35,
                length: 40,
                stockQuantity: 0,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2344TP-01",
                        quantity: 500,
                        done: 300,
                        faults: 1,
                        processing: 199,
                    },
                ],
                totalQuantity: 500,
                totalDone: 300,
                totalFaults: 1,
                totalProcessing: 199,
            },
        ],
    },
    {
        id: 2,
        itemName: "TJUSIG hanger 78",
        previousGroup: null,
        fromGroup: {
            id: "TH-X3SC",
            no: 3,
            name: "Tổ Sơ chế X3",
        },
        nextGroup: {
            id: "TH-X3TC2",
            no: 4,
            name: "Tổ Tinh chế 2 X3",
        },
        itemDetails: [
            {
                id: 70421102,
                subItemName: "TJUSIG Hanger 78 - Phần nối vào tường",
                thickness: 30,
                width: 35,
                length: 40,
                stockQuantity: 20,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2345TP-02",
                        quantity: 10800,
                        done: 4494,
                        faults: 0,
                        processing: 6306,
                    },
                    {
                        command: "TH2346TP-02",
                        quantity: 4800,
                        done: 0,
                        faults: 0,
                        processing: 4800,
                    },
                ],
                totalQuantity: 15600,
                totalDone: 4494,
                totalFaults: 0,
                totalProcessing: 11106,
            },
            {
                id: 70421103,
                subItemName: "TJUSIG Hanger 78 - Thân móc áo",
                thickness: 30,
                width: 30,
                length: 780,
                stockQuantity: 630,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2345TP-02",
                        quantity: 5400,
                        done: 1107,
                        faults: 0,
                        processing: 4293,
                    },
                    {
                        command: "TH2346TP-02",
                        quantity: 2400,
                        done: 0,
                        faults: 0,
                        processing: 2400,
                    },
                ],
                totalQuantity: 7800,
                totalDone: 1107,
                totalFaults: 0,
                totalProcessing: 6693,
            },
            {
                id: 70421104,
                subItemName: "TJUSIG Hanger 78 - Tay móc áo",
                thickness: 26,
                width: 26,
                length: 115,
                stockQuantity: 0,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2346TP-02",
                        quantity: 14400,
                        done: 0,
                        faults: 0,
                        processing: 14400,
                    },
                ],
                totalQuantity: 14400,
                totalDone: 0,
                totalFaults: 0,
                totalProcessing: 14400,
            },
        ],
    },
];

var exampleData1 = [
    {
        id: 1,
        itemName: "TYBYN bar table 74x74x102 acacia/black",
        previousGroup: {
            id: "TH-X3SC",
            no: 3,
            name: "Tổ Sơ chế X3",
        },
        fromGroup: {
            id: "TH-X3TC1",
            no: 4,
            name: "Tổ Tinh chế 1 X3",
        },
        nextGroup: {
            id: "TH-X3S",
            no: 6,
            name: "Tổ Sơn X3",
        },
        itemDetails: [
            {
                id: 70152702,
                subItemName: "TYBYN Bàn bar 74 đen - Mặt trên AD",
                thickness: 15,
                width: 367.5,
                length: 740,
                stockQuantity: 1000,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2344TP-01",
                        quantity: 960,
                        done: 719,
                        faults: 0,
                        processing: 241,
                    },
                    {
                        command: "TH2344TP-02",
                        quantity: 800,
                        done: 400,
                        faults: 2,
                        processing: 398,
                    },
                ],
                totalQuantity: 1760,
                totalDone: 1119,
                totalFaults: 2,
                totalProcessing: 641,
            },
            {
                id: 70152703,
                subItemName: "TYBYN Bàn bar 74 đen - Mặt dưới CD",
                thickness: 15,
                width: 367.5,
                length: 740,
                stockQuantity: 0,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2344TP-01",
                        quantity: 500,
                        done: 300,
                        faults: 1,
                        processing: 199,
                    },
                ],
                totalQuantity: 500,
                totalDone: 300,
                totalFaults: 1,
                totalProcessing: 199,
            },
        ],
    },
];

var exampleData2 = [
    {
        id: 2,
        itemName: "TJUSIG hanger 78",
        previousGroup: {
            id: "TH-X3SC",
            no: 3,
            name: "Tổ Sơ chế X3",
        },
        fromGroup: {
            id: "TH-X3TC2",
            no: 4,
            name: "Tổ Tinh chế 2 X3",
        },
        nextGroup: {
            id: "TH-X3S",
            no: 6,
            name: "Tổ Sơn X3",
        },
        itemDetails: [
            {
                id: 70421102,
                subItemName: "TJUSIG Hanger 78 - Phần nối vào tường",
                thickness: 30,
                width: 35,
                length: 40,
                stockQuantity: 1000,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2345TP-02",
                        quantity: 10800,
                        done: 4494,
                        faults: 0,
                        processing: 6306,
                    },
                    {
                        command: "TH2346TP-02",
                        quantity: 4800,
                        done: 0,
                        faults: 0,
                        processing: 4800,
                    },
                ],
                totalQuantity: 15600,
                totalDone: 4494,
                totalFaults: 0,
                totalProcessing: 11106,
            },
            {
                id: 70421103,
                subItemName: "TJUSIG Hanger 78 - Thân móc áo",
                thickness: 30,
                width: 30,
                length: 780,
                stockQuantity: 630,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2345TP-02",
                        quantity: 5400,
                        done: 1107,
                        faults: 0,
                        processing: 4293,
                    },
                    {
                        command: "TH2346TP-02",
                        quantity: 2400,
                        done: 0,
                        faults: 0,
                        processing: 2400,
                    },
                ],
                totalQuantity: 7800,
                totalDone: 1107,
                totalFaults: 0,
                totalProcessing: 6693,
            },
            {
                id: 70421104,
                subItemName: "TJUSIG Hanger 78 - Tay móc áo",
                thickness: 26,
                width: 26,
                length: 115,
                stockQuantity: 0,
                pendingErrors: [],
                pendingReceipts: [],
                returns: [],
                productionCommands: [
                    {
                        command: "TH2346TP-02",
                        quantity: 14400,
                        done: 0,
                        faults: 0,
                        processing: 14400,
                    },
                ],
                totalQuantity: 14400,
                totalDone: 0,
                totalFaults: 0,
                totalProcessing: 14400,
            },
        ],
    },
];

function WoodProductingQC() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);

    const [currentData, setCurrentData] = useState(exampleData);
    const [groupList, setGroupList] = useState([]);
    const [groupListOptions, setGroupListOptions] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const [awaitingReception, setAwaitingReception] = useState([]);
    const [isQualityCheck, setIsQualityCheck] = useState(false);

    // New Get All Group
    useEffect(() => {
        const getAllGroupWithoutQC = async () => {
            setLoading(true);
            try {
                const res = await productionApi.getAllGroupWithoutQC();
                const options = res.map((item) => ({
                    value: item.Code,
                    label: item.Name + " - " + item.Code,
                }));
                setGroupList(res);
                setGroupListOptions(options);
                console.log("New Get All Group: ", options);
                // setSelectedGroup(options[0]);
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
    }, []);

    const getDataFollowingGroup = async (params) => {
        setLoadingData(true);
        try {
            const res = await productionApi.getFinishedGoodsList(params);
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

                if (selectedGroup.value == "TH-X3SC") {
                    setCurrentData(exampleData);
                } else if (selectedGroup.value == "TH-X3TC1") {
                    setCurrentData(exampleData1);
                } else if (selectedGroup.value == "TH-X3TC2") {
                    setCurrentData(exampleData2);
                } else {
                    setCurrentData([]);
                }
                // setLoadingData(false);
            }
        })();
    }, [selectedGroup]);

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
                    <div className="flex justify-between mb-6 items-center">
                        <div className="text-3xl font-bold ">
                            Kiểm định chất lượng chế biến gỗ 
                        </div>
                    </div>

                    {/* Controller */}
                    <div className=" my-4 mb-6 xl:w-full p-4 w-full border rounded-md bg-white z-0">
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
                                    console.log("Selected Group: ", value);
                                }}
                                placeholder="Chọn tổ, xưởng sản xuất"
                                className=""
                            />
                        </div>

                        {/* Selection Review */}
                        <div className="mt-3">Selected Group: <strong>{selectedGroup !== null ? selectedGroup.value : ''}</strong></div>

                        {/* Data */}
                    <div className="flex gap-4 justify-center h-full">
                            {selectedGroup && awaitingReception?.length > 0 ? (
                                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 lg:grid-cols-3">
                                    {awaitingReception.map((item, index) => (
                                        <AwaitingReception
                                            type="wood-processing"
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
                                <div className="flex w-full h-full justify-center items-center">
                                    Không có dữ liệu
                                </div>
                            )}
                    </div>
                    </div>

                    
                </div>
            </div>
        </Layout>
    );
}

export default WoodProductingQC;
