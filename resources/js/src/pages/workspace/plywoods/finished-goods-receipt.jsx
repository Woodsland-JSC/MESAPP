import React, { useEffect, useState, useRef, useMemo } from "react";
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
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon
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
import { layKetCauVCNTheoLSX } from "../../../api/vcn.api";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
// import "ag-grid-charts-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

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

    const {
        isOpen: isModalStructureOpen,
        onOpen: onModalStructureOpen,
        onClose: onModalStructureClose,
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
    const [viewedStructureLSX, setViewedStructureLSX] = useState({
        lsx: null,
        itemName: "",
        itemCode: "",
        detail: [],
        mobileViewData: [],
        sanLuong: 0
    });

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
        if (event.type === "popstate") {
            navigate("/workspace?tab=wood-working");
        }
    };

    useEffect(() => {
        window.addEventListener("popstate", handleBackNavigation);

        return () => {
            window.removeEventListener("popstate", handleBackNavigation);
        };
    }, [navigate]);

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
            const KHOI = "VCN";
            const factory = selectedFactory?.value || null;
            setLoading(true);
            try {
                const res = await productionApi.getAllGroupWithoutQC(
                    factory,
                    KHOI
                );
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
        const progressPath = document.querySelector(".progress-circle path");
        const pathLength = progressPath.getTotalLength();

        progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
        progressPath.style.strokeDashoffset = pathLength;

        const updateProgress = () => {
            const scroll = window.scrollY;
            const height =
                document.documentElement.scrollHeight - window.innerHeight;
            const progress = pathLength - (scroll * pathLength) / height;
            progressPath.style.strokeDashoffset = progress;

            setIsActive(scroll > 50);
        };

        updateProgress();
        window.addEventListener("scroll", updateProgress);

        return () => {
            window.removeEventListener("scroll", updateProgress);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const viewStructure = async (e, lsx, data) => {
        try {
            e.stopPropagation();
            let res = await layKetCauVCNTheoLSX(lsx);

            let dataKetCau = res?.data_ket_cau ?? [];
            let details = [];
            let formatData = [];

            let sanLuong = data?.Details[0]?.LSX.find(_lsx => _lsx.LSX == lsx);

            dataKetCau.forEach((item) => {
                let obj = {
                    code: item.Code,
                    date: item.U_Date.split(" ")[0],
                    name: item.Name,
                    itemCodeH: item.ItemCodeH,
                    itemNameH: item.ItemNameH,
                    dungSai: item.U_DungS,
                    details: []
                };

                if (!details.some(detail => detail.code == obj.code)) {
                    details.push(obj);
                }
            })

            details.forEach(detail => {
                let childItems = dataKetCau.filter(item => item.Code == detail.code);

                detail.details = childItems.sort((item1, item2) => item1.U_SoLop - item2.U_SoLop);
            })


            dataKetCau.forEach((item, index) => {
                const obj = {
                    code: item.Code,
                    name: item.Name,
                    uGridH: item.U_GRID_H,
                    uFac: item.U_FAC,
                    uLlsx: item.U_LLSX,
                    itemCodeH: item.ItemCodeH,
                    itemNameH: item.ItemNameH,
                    note: item.U_Notes,
                    date: item.U_Date,
                    itemCodeL: item.ItemCodeL,
                    itemNameL: item.ItemNameL,
                    uKetCau: item.U_KetCau,
                    uSoLop: item.U_SoLop,
                    uCachX: item.U_CachX,
                    uDoDay: item.U_DoDay,
                    uLoaiG: item.U_LoaiG,
                    uTiDay: item.U_TIDay,
                    uTiRong: item.U_TIRong,
                    uTiDai: item.U_TIDai,
                    dungSai: item.U_DungS
                };
                formatData.push(obj);
            })

            setViewedStructureLSX({
                lsx,
                detail: formatData,
                mobileViewData: details,
                itemName: data.NameSPDich,
                itemCode: data.SPDICH,
                sanLuong: sanLuong ? sanLuong.SanLuong : 0
            });
            onModalStructureOpen();
        } catch (error) {
            toast.error("Lỗi khi lấy kết cấu.")
            setViewedStructureLSX({
                lsx: null,
                detail: [],
                itemName: "",
                itemCode: "",
                mobileViewData: [],
                sanLuong: 0
            });
        }
    }

    const [agGridState] = useState({
        columns: [
            {
                headerName: "Mã kết cấu",
                field: "code",
                suppressHeaderMenuButton: true,
                rowGroup: true,
                filter: true,
                sort: "asc",
                pinned: "left",
                hide: true,
            },
            {
                headerName: "Ngày áp dụng",
                width: 140,
                field: "date",
                valueGetter: (params) => {
                    if (params.node.group) {
                        const firstLeaf = params.node.allLeafChildren?.[0];
                        return firstLeaf ? firstLeaf?.data?.date : "";
                    }
                    return ""
                },
                valueFormatter: (params) => {
                    if (!params.value) return "";
                    const d = new Date(params.value);
                    return d.toLocaleDateString("vi-VN");
                },
                suppressHeaderMenuButton: true,
            },
            {
                headerName: "Mã SP",
                field: "itemCodeH",
                suppressHeaderMenuButton: true,
                filter: true,
                valueGetter: (params) => {
                    if (params.node.group) {
                        const firstLeaf = params.node.allLeafChildren?.[0];
                        return firstLeaf ? firstLeaf?.data?.itemCodeH : "";
                    }
                    return ""
                },
            },
            {
                headerName: "Tên SP",
                field: "itemNameH",
                suppressHeaderMenuButton: true,
                filter: true,
                valueGetter: (params) => {
                    if (params.node.group) {
                        const firstLeaf = params.node.allLeafChildren?.[0];
                        return firstLeaf ? firstLeaf?.data?.itemNameH : "";
                    }
                    return ""
                },
            },
            {
                headerName: "Dung sai",
                field: "dungSai",
                width: 120,
                suppressHeaderMenuButton: true,
                valueGetter: (params) => {
                    if (params.node.group) {
                        const firstLeaf = params.node.allLeafChildren?.[0];
                        return firstLeaf ? firstLeaf?.data?.dungSai : "";
                    }
                    return ""
                },
                filter: true,
            },
            {
                headerName: "Ghi chú",
                field: "note",
                suppressHeaderMenuButton: true,
                valueGetter: (params) => {
                    if (params.node.group) {
                        const firstLeaf = params.node.allLeafChildren?.[0];
                        return firstLeaf ? firstLeaf?.data?.note : "";
                    }
                    return ""
                },
                filter: true,
            },
            {
                headerName: "Kết cấu",
                field: "uKetCau",
                suppressHeaderMenuButton: true,
                filter: true,
                width: 120
            },
            {
                headerName: "Số lớp",
                field: "uSoLop",
                suppressHeaderMenuButton: true,
                filter: true,
                width: 120
            },
            {
                headerName: "Cách xếp",
                field: "uCachX",
                suppressHeaderMenuButton: true,
                filter: true,
                width: 120
            },
            {
                headerName: "Độ dày",
                field: "uDoDay",
                suppressHeaderMenuButton: true,
                headerComponentParams: { displayName: "Độ dày" },
                aggFunc: "sum",
                filter: true,
                width: 120
            },
            {
                headerName: "Loại gỗ",
                field: "uLoaiG",
                suppressHeaderMenuButton: true,
                filter: true,
                flex: 1
            }
        ],
        groupDisplayType: "multipleColumns",
        getRowStyle: (params) => {
            if (params.node.group) {
                return { backgroundColor: "#ffffff" }; // màu group row
            }
            if (params.node.rowIndex % 2 === 0) {
                return { backgroundColor: "#ffffff" }; // zebra stripe
            }
            return { backgroundColor: "#ffffff" };
        },
        autoGroupColumnDef: {
            minWidth: 300,
        }
    });

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
                            Nhập sản lượng khối{" "}
                            <span className=" text-[#402a62]">
                                ván công nghiệp
                            </span>
                        </div>
                    </div>

                    {/* Controller */}
                    <div className="flex flex-col justify-between mb-3 px-4 xl:px-0 lg:px-0 md:px-0 items-center gap-4">
                        <div className="my-4 mb-2 mt-3 w-full pb-4 rounded-xl bg-white ">
                            <div className="flex flex-col p-4 pb-0  w-full justify-end ">
                                <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col xl:space-x-3 lg:space-x-3 md:space-x-3 space-x-0 ">
                                    {(user.role == 1 || user.role == 4) && (
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
                                                    setSearchTerm(
                                                        e.target.value
                                                    )
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
                                                    Thông báo: Có phôi chờ xác
                                                    nhận
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
                                    viewStructure={viewStructure}
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
                    <ModalHeader className="!p-2.5 ">
                        <h1 className="pl-4 text-xl lg:text-2xl serif font-bold ">
                            Danh sách phôi chờ nhận
                        </h1>
                    </ModalHeader>
                    <ModalCloseButton />
                    <div className="border-b-2 border-gray-200"></div>
                    <ModalBody className="bg-gray-100 !p-4">
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
                                <div className="flex w-full min-h-[80vh] justify-center items-center">
                                    <div className="text-center text-gray-600">
                                        <div className="text-xl font-semibold">
                                            Hệ thống chưa nhận được dữ liệu ghi
                                            nhận nào.
                                        </div>
                                        <div>
                                            Vui lòng ghi nhận và thử lại sau.
                                        </div>
                                    </div>
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
                className={`progress-wrap fixed xl:right-12 lg:right-12 md:right-12 right-8 xl:bottom-12 lg:bottom-12 md:bottom-12 bottom-8 h-14 w-14 cursor-pointer rounded-full shadow-inner transition-all duration-200 z-50 bg-[#17506B] ${isActive
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

            {/* Popup xem kết cấu ván công nghiệp theo lệnh sản xuất */}
            {
                viewedStructureLSX.lsx &&
                <Modal
                    isCentered
                    isOpen={isModalStructureOpen}
                    size="full"
                    onClose={() => {
                        setViewedStructureLSX({
                            detail: [],
                            lsx: null
                        });
                        onModalStructureClose();
                    }}
                    scrollBehavior="inside"
                >
                    <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                    <ModalContent>
                        <ModalHeader className="!p-2.5 ">
                            <div className="hidden md:block">
                                <h1 className="pl-4 text-xl lg:text-2xl serif font-bold ">
                                    Kết cấu ván công nghiệp theo lệnh sản xuất <span className="underline mb-1 text-[#17506B]">{viewedStructureLSX.lsx}</span> <br />
                                    <span className="mb-1 text-[19px]">MÃ SP: {viewedStructureLSX?.itemCode}</span> <br />
                                    <span className="mb-1 text-[19px]">TÊN SP: {viewedStructureLSX?.itemName}</span> <br />
                                    <span className="mb-1 text-[19px]">SẢN LƯỢNG: {Number(viewedStructureLSX?.sanLuong)}</span> <br />
                                </h1>
                            </div>
                            <div className="block sm:block md:hidden">
                                <h1 className="pl-4 serif font-bold">
                                    <span className="underline mb-1 text-[#17506B]">LSX: {viewedStructureLSX.lsx}</span> <br />
                                    <span className="mb-1 text-[19px]">MÃ SP: {viewedStructureLSX?.itemCode}</span> <br />
                                    <span className="mb-1 text-[19px]">TÊN SP: {viewedStructureLSX?.itemName}</span> <br />
                                    <span className="mb-1 text-[19px]">SẢN LƯỢNG: {Number(viewedStructureLSX?.sanLuong)}</span> <br />
                                </h1>
                            </div>
                        </ModalHeader>
                        <ModalCloseButton />
                        <div className="border-b-2 border-gray-200"></div>
                        <ModalBody className="bg-gray-100 flex flex-col">
                            {
                                viewedStructureLSX.detail.length > 0 ? (
                                    <>
                                        <div
                                            id="grid-ket-cau-vcn"
                                            style={{
                                                height: 630,
                                                fontSize: 16,
                                                width: "100%",
                                            }}
                                            className="ag-theme-quartz hidden md:hidden lg:block xl:block 2xl:block">
                                            <AgGridReact
                                                rowData={viewedStructureLSX.detail}
                                                columnDefs={agGridState.columns}
                                                autoGroupColumnDef={agGridState.autoGroupColumnDef}
                                                groupDisplayType={agGridState.groupDisplayType}
                                                getRowStyle={agGridState.getRowStyle}
                                            />
                                        </div>
                                        <Accordion background={"#FFFFFF"} allowToggle className="gap-y-3 block md:block lg:hidden xl:hidden 2xl:hidden" defaultIndex={0} id="accordion-ket-cau-vcn">
                                            {
                                                viewedStructureLSX.mobileViewData.map((item, i) => (
                                                    <AccordionItem borderColor={"bg-gray-100"} key={i}>
                                                        <h2>
                                                            <AccordionButton className="hover:!bg-[#17506B] hover:!text-[#FFFFFF] bg-[#17506B] text-[#FFFFFF]">
                                                                <Box as='span' flex='1' textAlign='left' fontSize={"small"}>
                                                                    {item.code} | {item.date}
                                                                </Box>
                                                                <AccordionIcon />
                                                            </AccordionButton>
                                                        </h2>
                                                        <AccordionPanel pb={4}>
                                                            <div className="bg-white border-2 border-gray-300 h-fit">
                                                                <div className="border-b bg-[#d6e4eb]">
                                                                    <div className="flex items-center gap-x-2 text-[14px] p-3 px-2 border-gray-200">
                                                                        <div className="w-8 h-8"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" className="text-[#17506B] w-[85%] h-full" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"></path>
                                                                        </svg>
                                                                        </div>
                                                                        <div className="serif text-[16px] font-bold">Thông tin kết cấu</div>
                                                                    </div>
                                                                    <div className="space-y-1 px-2 pb-2">
                                                                        <div className="grid grid-cols-3 gap-2">
                                                                            <div className="text-[13px] col-span-1">Tên KC:</div>
                                                                            <span className="text-[13px] col-span-2">{item.name}</span>
                                                                        </div>
                                                                        <div className="grid grid-cols-3 gap-2">
                                                                            <div className="text-[13px] col-span-1">Dung sai:</div>
                                                                            <span className="text-[13px] col-span-2">{item.dungSai}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="w-full">
                                                                    <table className="w-full">
                                                                        <tr className="text-[11px]">
                                                                            <th className='border-r border-b border-gray-200 text-center py-2 w-[60px]'>KC</th>
                                                                            <th className='border-r border-b border-gray-200 text-center py-2 w-[55px]'>Số lớp</th>
                                                                            <th className='border-r border-b border-gray-200 text-center py-2 w-[50px]'>Cách<br />xếp</th>
                                                                            <th className='border-r border-b border-gray-200 text-center py-2 w-[60px]'>Độ dày<br />(mm)</th>
                                                                            <th className='border-b text-center py-2 '>Loại gỗ</th>
                                                                        </tr>
                                                                        {
                                                                            item?.details.map((detail, index) => (
                                                                                <>
                                                                                    <tr className="text-[11px]" key={index}>
                                                                                        <td className='border-r border-gray-200 text-center py-2 '>{detail.U_KetCau ?? ""}</td>
                                                                                        <td className='border-r border-gray-200 text-center py-2 '>{detail.U_SoLop ?? ""}</td>
                                                                                        <td className='border-r border-gray-200 text-center py-2 '>{detail.U_CachX ?? ""}</td>
                                                                                        <td className='border-r border-gray-200 text-center py-2 '>{detail.U_DoDay ?? ""}</td>
                                                                                        <td className='text-center py-2 '>{detail.U_LoaiG ?? ""}</td>
                                                                                    </tr>
                                                                                </>
                                                                            ))
                                                                        }
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </AccordionPanel>
                                                    </AccordionItem>
                                                ))
                                            }
                                        </Accordion>
                                    </>
                                ) : (
                                    <div className="flex w-full h-full justify-center items-center text-[20px]">
                                        Không có dữ liệu
                                    </div>
                                )
                            }
                        </ModalBody>
                        <ModalFooter className="flex flex-col !p-0 ">
                            <div className="border-b-2 border-gray-100"></div>
                            <div className="flex flex-row xl:px-6 lg-px-6 md:px-6 px-4 w-full items-center justify-end py-4 gap-x-3 ">
                                <button
                                    onClick={() => {
                                        setViewedStructureLSX({
                                            detail: [],
                                            lsx: null,
                                            itemCode: "",
                                            itemName: "",
                                            mobileViewData: []
                                        });
                                        onModalStructureClose();
                                    }}
                                    className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full"
                                >
                                    Đóng
                                </button>
                            </div>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            }
        </Layout>
    );
}

export default PlywoodFinishedGoodsReceipt;
