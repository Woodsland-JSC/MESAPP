import React, { useEffect, useState, useRef } from "react";
import Layout from "../../layouts/layout";
import { Link } from "react-router-dom";
import PalletCard from "../../components/PalletCard";
import { HiPlus, HiOutlineSearch } from "react-icons/hi";
import { RiInboxArchiveFill } from "react-icons/ri";
import axios from "axios";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import palletsApi from "../../api/palletsApi";
import toast from "react-hot-toast";
import { Spinner } from "@chakra-ui/react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../assets/styles/datepicker.css";
import { format, startOfDay, endOfDay } from "date-fns";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import BigSelect from "../../components/Select/BigSelect";
import Loader from "../../components/Loader";
import useAppContext from "../../store/AppContext";
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

function WoodSorting() {
    const { user } = useAppContext();

    const { isOpen, onOpen, onClose } = useDisclosure();

    // States
    const [loading, setLoading] = useState(false);
    const [createPalletLoading, setCreatePalletLoading] = useState(false);
    const [palletHistoryLoading, setPalletHistoryLoading] = useState(false);

    const [woodTypes, setWoodTypes] = useState([]);
    const [dryingMethods, setDryingMethods] = useState([]);
    const [dryingReasons, setDryingReasons] = useState([]);
    const [palletCode, setPalletCode] = useState(null);
    const [palletHistory, setPalletHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Date picker
    const [startDate, setStartDate] = useState(new Date());
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const defaultFromDate = startOfDay(fromDate);
    const defaultToDate = endOfDay(toDate);
    const formattedFromDate = format(defaultFromDate, "yyyy-MM-dd HH:mm:ss");
    const formattedToDate = format(defaultToDate, "yyyy-MM-dd HH:mm:ss");

    // Input
    const [batchId, setBatchId] = useState("");

    // Validating
    const [selectedWoodType, setSelectedWoodType] = useState(null);
    const [selectedDryingReason, setSelectedDryingReason] = useState(null);
    const [selectedDryingMethod, setSelectedDryingMethod] = useState(null);
    const [selectedBatchInfo, setSelectedBatchInfo] = useState(null);

    const [palletCards, setPalletCards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInvalidQuantity, setIsInvalidQuantity] = useState(false);

    const [palletQuantities, setPalletQuantities] = useState({});

    const isPalletCardExists = (id, palletCards) => {
        return palletCards.some((card) => card.key === id);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const woodTypesData = await palletsApi.getTypeOfWood();
                const woodTypesOptions = woodTypesData.map((item) => ({
                    value: item.Code,
                    label: item.Name,
                }));
                setWoodTypes(woodTypesOptions);
            } catch (error) {
                console.error("Error fetching wood types:", error);
            }

            try {
                const dryingMethodsData = await palletsApi.getDryingMethod();
                const dryingMethodsOptions = dryingMethodsData.map((item) => ({
                    value: item.ItemCode + "-" + item.BatchNum,
                    label: item.ItemName,
                    batchNum: item.BatchNum,
                    code: item.ItemCode,
                }));
                console.log(dryingMethodsOptions);
                setDryingMethods(dryingMethodsOptions);
            } catch (error) {
                console.error("Error fetching drying methods:", error);
            }

            try {
                const dryingReasonsData = await palletsApi.getDryingReason();
                const dryingReasonsOptions = dryingReasonsData.map((item) => ({
                    value: item.Code,
                    label: item.Name,
                }));
                setDryingReasons(dryingReasonsOptions);
            } catch (error) {
                console.error("Error fetching drying reasons:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    // Validating
    const validateData = () => {
        if (!selectedWoodType || selectedWoodType.value === "") {
            toast.error("Loại gỗ không được bỏ trống");
            return false;
        }
        if (!batchId.trim()) {
            toast.error("Mã lô gỗ không được bỏ trống");
            return false;
        }
        if (!selectedDryingReason || selectedDryingReason.value === "") {
            toast.error("Mục đích sấy không được bỏ trống");
            return false;
        }
        if (!selectedDryingMethod || selectedDryingMethod.value === "") {
            toast.error("Quy cách thô không được bỏ trống");
            return false;
        }
        if (!startDate) {
            toast.error("Ngày nhập gỗ không được bỏ trống");
            return false;
        }

        return true;
    };

    const handleAddToList = async () => {
        if (validateData()) {
            try {
                setIsLoading(true);

                const data = {
                    woodType: selectedWoodType,
                    batchId: batchId,
                    dryingReason: selectedDryingReason,
                    dryingMethod: selectedDryingMethod,
                    startDate: formattedStartDate,
                };
                console.log("1.Dữ liệu từ form:", data);

                const response = await palletsApi.getStockByItem(
                    selectedDryingMethod.code,
                    selectedDryingReason.value,
                    selectedDryingMethod.batchNum
                );

                console.log("2. Get thông tin từ ItemCode:", response);

                if (response && response.length > 0) {
                    const newPalletCards = response
                        .filter(
                            (item) =>
                                !isPalletCardExists(
                                    item.WhsCode + item.BatchNum,
                                    palletCards
                                )
                        )
                        .map((item) => (
                            <PalletCard
                                key={item.WhsCode + item.BatchNum}
                                itemCode={selectedDryingMethod.code}
                                itemName={selectedDryingMethod.label}
                                batchNum={item.BatchNum}
                                inStock={item.Quantity}
                                whsCode={item.WhsCode}
                                height={item.CDai}
                                width={item.CRong}
                                thickness={item.CDay}
                                isInvalidQuantity={isInvalidQuantity}
                                onDelete={() =>
                                    handleDeletePalletCard(
                                        item.WhsCode + item.BatchNum
                                    )
                                }
                                onQuantityChange={(quantity) => {
                                    handlePalletQuantityChange(
                                        item.WhsCode + item.BatchNum,
                                        quantity
                                    );
                                }}
                            />
                        ));

                    setPalletCards((prevPalletCards) => [
                        ...prevPalletCards,
                        ...newPalletCards,
                    ]);
                } else {
                    toast("Gỗ đã hết. Xin hãy chọn quy cách khác.");
                    return;
                }

                toast.success("Đã thêm vào danh sách");
            } catch (error) {
                console.error("Error fetching stock by item:", error);
                toast.error("Không tìm thấy thông tin. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDeletePalletCard = (id) => {
        setPalletCards((prevPalletCards) =>
            prevPalletCards.filter((card) => card.key !== id)
        );
        toast("Đã xóa khỏi danh sách");
    };

    const handlePalletQuantityChange = (id, quantity) => {
        setPalletQuantities((prevQuantities) => ({
            ...prevQuantities,
            [id]: quantity,
        }));

        setPalletCards((prevPalletCards) => {
            return prevPalletCards.map((card) => {
                if (card.key === id) {
                    const inStock = parseFloat(card.props.inStock);
                    const newIsInvalidQuantity =
                        quantity > inStock ||
                        quantity == 0 ||
                        quantity <= 0 ||
                        quantity == "" ||
                        quantity == null;
                    return React.cloneElement(card, {
                        isInvalidQuantity: newIsInvalidQuantity,
                    });
                }
                return card;
            });
        });
    };

    // Creating pallets
    const createPalletObject = () => {
        const palletObject = {
            LoaiGo: selectedWoodType.value,
            MaLo: batchId,
            LyDo: selectedDryingReason.value,
            NgayNhap: formattedStartDate,
            MaNhaMay: user.plant,
            Details: palletCards.map((card) => ({
                ItemCode: card.props.itemCode,
                WhsCode: card.props.whsCode,
                BatchNum: card.props.batchNum,
                Qty: parseInt(palletQuantities[card.key]),
                CDai: card.props.height,
                CDay: card.props.thickness,
                CRong: card.props.width,
            })),
        };
        return palletObject;
    };

    let woodTypeSelectRef = null;
    let dryingReasonSelectRef = null;
    let dryingMethodSelectRef = null;

    const handleCreatePallet = async () => {
        if (palletCards.length === 0) {
            toast.error("Danh sách không được để trống.");
            return;
        }

        let hasInvalidQuantity = false;

        for (const card of palletCards) {
            var inStock = parseFloat(card.props.inStock);
            var quantity = parseFloat(palletQuantities[card.key] || 0);

            console.log("Lấy giá trị tồn kho:", inStock);
            console.log("Lấy giá trị số lượng:", quantity);

            if (
                quantity > inStock ||
                quantity === 0 ||
                quantity < 0 ||
                quantity == "" ||
                quantity == null
            ) {
                console.log("Giá trị Invalid Quantity:", isInvalidQuantity);
                hasInvalidQuantity = true;
                break;
            }
        }

        if (hasInvalidQuantity) {
            toast.error("Giá trị số lượng không hợp lệ.");
            return;
        }

        const palletObject = createPalletObject();
        console.log("2.5. Thông tin pallet sẽ được gửi đi:", palletObject);

        setCreatePalletLoading(true);

        try {
            const response = await axios.post(
                "/api/pallets/v2/create",
                palletObject
            );

            // if (response.data === "" || response.data === null){ {
            //     console.log("4. Kết quả tạo pallet:", response);
            //     Swal.fire({
            //         title: response.data.data.pallet.Code,
            //         text: "Mã pallet không là tạo!",
            //         icon: "success",
            //     });
            // } else {
            //     console.log("4. Kết quả tạo pallet:", response);
            //     Swal.fire({
            //         title: response.data.data.pallet.Code,
            //         text: "Mã pallet đã được tạo!",
            //         icon: "success",
            //     });

            //     if (woodTypeSelectRef) {
            //         woodTypeSelectRef.clearValue();
            //     }
            //     if (dryingReasonSelectRef) {
            //         dryingReasonSelectRef.clearValue();
            //     }
            //     if (dryingMethodSelectRef) {
            //         dryingMethodSelectRef.clearValue();
            //     }

            //     setBatchId("");
            //     setStartDate(new Date());
            //     setPalletCards([]);
            //     setIsInvalidQuantity(false);
            //     setPalletQuantities({});
            // }

            if (response.data === "" || response.data === null) {
                toast.error("Gỗ đã hết. Xin hãy chọn quy cách khác.");
                setCreatePalletLoading(false);
            } else {
                console.log("4. Kết quả tạo pallet:", response);
                Swal.fire({
                    title: response.data.data.pallet.Code,
                    text: "Mã pallet đã được tạo!",
                    icon: "success",
                });

                if (woodTypeSelectRef) {
                    woodTypeSelectRef.clearValue();
                }
                if (dryingReasonSelectRef) {
                    dryingReasonSelectRef.clearValue();
                }
                if (dryingMethodSelectRef) {
                    dryingMethodSelectRef.clearValue();
                }

                setCreatePalletLoading(false);

                setBatchId("");
                setStartDate(new Date());
                setPalletCards([]);
                setIsInvalidQuantity(false);
                setPalletQuantities({});
            }
        } catch (error) {
            console.error("Error creating pallet:", error);
            setCreatePalletLoading(false);
        }
    };

    const handleSearch = async () => {
        setSearchTerm("");
        setPalletHistoryLoading(true);

        try {
            const response = await axios.get("/api/pallets/pallet-history", {
                params: {
                    userID: user.id,
                    fromDate: formattedFromDate,
                    toDate: formattedToDate,
                },
            });
            if (
                response.data === "" ||
                response.data === null ||
                response.data.length === 0
            ) {
                setPalletHistory(response.data);
                toast("Không tìm thấy kết quả phù hợp.");
                setPalletHistoryLoading(false);
            } else {
                console.log("Kết quả truy xuất lịch sử pallet :", response);
                toast.success("Tìm kiếm thành công.");
                setPalletHistory(response.data);
                setPalletHistoryLoading(false);
            }
        } catch (error) {
            console.error("Error creating pallet:", error);
            toast.error("Lỗi kết nối hệ thống. Vui lòng thử lại sau.");
            setPalletHistoryLoading(false);
        }
    };

    return (
        <Layout>
            {/* Container */}
            <div className="flex mb-4 xl:mb-0 justify-center h-full bg-transparent">
                {/* Section */}
                <div className="w-screen p-6 px-5 xl:p-12 xl:px-32">
                    {/* Breadcrumb */}
                    <div className="mb-4">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center">
                                        <a
                                            href="#"
                                            className="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            Workspace
                                        </a>
                                    </div>
                                </li>
                                <li aria-current="page">
                                    <div className="flex items-center">
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
                                            to="/workspace"
                                            className="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            <div>Quản lý sấy gỗ</div>
                                        </Link>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between mb-6 items-center">
                        <div className="text-3xl font-bold ">
                            Tạo pallet xếp sấy
                        </div>
                        <button
                            className="bg-[#1f2937] font-medium rounded-xl p-2.5 px-4 text-white xl:flex items-center md:flex hidden active:scale-[.95] active:duration-75 transition-all"
                            onClick={onOpen}
                        >
                            <HiOutlineSearch className="text-xl mr-2" />
                            Tra cứu lịch sử
                        </button>
                    </div>

                    {/* History In Mobile View */}
                    <button
                        className="bg-[#1f2937] font-medium rounded-xl p-2.5 px-4 pr-7 my-4 text-white xl:hidden items-center md:hidden flex w-full justify-center active:scale-[.95] active:duration-75 transition-all"
                        onClick={onOpen}
                    >
                        <HiOutlineSearch className="text-xl mr-2" />
                        Tra cứu lịch sử
                    </button>

                    {/* Modals */}
                    <Modal
                        onClose={onClose}
                        isOpen={isOpen}
                        size="full"
                        scrollBehavior="inside"
                        isCentered
                    >
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>
                                <div className="uppercase">
                                    Lịch sử xếp pallet
                                </div>
                            </ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                {/* User Information */}
                                <div className=" mb-4 xl:w-full">
                                    <div className="flex items-center gap-x-2">
                                        <div>Tạo bởi: </div>
                                        <div className="flex gap-x-3 rounded-full p-2 px-3 pl-2 bg-gray-100">
                                            <img
                                                src={
                                                    user?.avatar
                                                        ? user.avatar
                                                        : defaultUser
                                                }
                                                alt="user"
                                                className="w-6 h-6 rounded-full object-cover"
                                            ></img>
                                            <div className="">
                                                {(user?.first_name
                                                    ? user?.first_name + " "
                                                    : "") +
                                                    (user?.last_name
                                                        ? user?.last_name
                                                        : "")}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div className=" mb-4 xl:w-full">
                                    <label
                                        htmlFor="search"
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
                                            className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Search"
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Controller */}
                                <div className="w-full xl:flex lg:flex md:flex xl:space-x-3 md:space-x-3 lg:space-x-3 xl:space-y-0 lg:space-y-0 md:space-y-0 space-y-4 items-end">
                                    <div className="xl:grid lg:grid md:grid xl:space-y-0 lg:space-y-0 md:space-y-0 space-y-4 grid-cols-2 w-full gap-x-4">
                                        <div className="col-span-1">
                                            <label
                                                htmlFor="indate"
                                                className="block mb-2 text-md font-medium text-gray-900 "
                                            >
                                                Từ ngày
                                            </label>
                                            <DatePicker
                                                selected={fromDate}
                                                onChange={(date) =>
                                                    setFromDate(date)
                                                }
                                                className=" pl-3 border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                            />
                                        </div>

                                        <div className="col-span-1">
                                            <label
                                                htmlFor="indate"
                                                className="block mb-2 text-md font-medium text-gray-900 "
                                            >
                                                Đến ngày
                                            </label>
                                            {}
                                            <DatePicker
                                                selected={toDate}
                                                onChange={(date) =>
                                                    setToDate(date)
                                                }
                                                className=" pl-3 border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        className="bg-[#155979] p-2 rounded-xl xl:w-[20%] w-full text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                        onClick={handleSearch}
                                    >
                                        Tìm kiếm
                                    </button>
                                </div>

                                {/* Data */}
                                <div className="w-full mt-8">
                                        {palletHistoryLoading ? (
                                            <div className="mt-20 text-center">
                                                <Spinner
                                                    thickness="4px"
                                                    speed="0.65s"
                                                    emptyColor="gray.200"
                                                    color="#155979"
                                                    size="xl"
                                                />
                                            </div>
                                        ) : palletHistory.length > 0 ? (
                                            <div className="xl:grid lg:grid md:grid grid-cols-4 xl:space-y-0 lg:space-y-0 md:space-y-0 space-y-4 gap-4">
                                                {palletHistory.filter((pallet) =>
                                                    `${pallet.thickness} ${pallet.width} ${pallet.length} ${pallet.pallet_code} ${pallet.sum_quantity} ${format(new Date(pallet.created_date), 'dd/MM/yyyy')}`
                                                    .toLowerCase()
                                                    .includes(searchTerm.toLowerCase())
                                                )
                                                .map((pallet) => (
                                                    <div className="border-gray-300 bg-gray-100 max-h-[14rem]  border-2 rounded-xl">
                                                        <div className="p-4 pb-0">
                                                            <div className="text-xl font-semibold">
                                                                Quy cách:{" "}
                                                                <span>
                                                                    {
                                                                        parseInt(pallet.thickness)
                                                                    }
                                                                    *
                                                                    {
                                                                        parseInt(pallet.width)
                                                                    }
                                                                    *
                                                                    {
                                                                        parseInt(pallet.length)
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="rounded-md p-1 my-2 w-fit px-3 text-white bg-[#335b6f]">
                                                                Pallet:{" "}
                                                                <span>
                                                                    {
                                                                        pallet.pallet_code
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="p-4 pt-2 space-y-1">
                                                            <div className="grid grid-cols-2">
                                                                <div>
                                                                    Số lượng:{" "}
                                                                </div>
                                                                <div className="font-semibold">
                                                                    {
                                                                        pallet.sum_quantity
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2">
                                                                <div>
                                                                    Ngày tạo:{" "}
                                                                </div>
                                                                <div className="font-semibold">
                                                                    {format(new Date(pallet.created_date), 'dd/MM/yyyy')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex justify-center mt-20 w-full h-full text-gray-400">
                                                Không tìm thấy dữ liệu.
                                            </div>
                                        )}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <div className=" flex justify-end gap-x-3  w-full">
                                    <button
                                        onClick={onClose}
                                        className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit lg:w-fit w-full"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                    {/* Components */}
                    <div className="p-6 bg-white border-2 border-gray-300 shadow-sm rounded-xl">
                        <section>
                            <form>
                                <div className="xl:grid xl:space-y-0 space-y-5 gap-5 mb-6 xl:grid-cols-3">
                                    <div className="col-span-1">
                                        <label
                                            htmlFor="wood_type"
                                            className="block mb-2 text-md font-medium text-gray-900"
                                        >
                                            Loại gỗ
                                        </label>

                                        <Select
                                            placeholder="Chọn loại gỗ"
                                            ref={(ref) => {
                                                woodTypeSelectRef = ref;
                                            }}
                                            options={woodTypes}
                                            onChange={(value) =>
                                                setSelectedWoodType(value)
                                            }
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label
                                            htmlFor="batch_id"
                                            className="block mb-2 text-md font-medium text-gray-900"
                                        >
                                            Mã lô gỗ
                                        </label>
                                        <input
                                            type="text"
                                            id="batch_id"
                                            value={batchId}
                                            onChange={(e) =>
                                                setBatchId(e.target.value)
                                            }
                                            className=" border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label
                                            htmlFor="drying_reason"
                                            className="block mb-2 text-md font-medium text-gray-900 "
                                        >
                                            Mục đích sấy
                                        </label>
                                        <Select
                                            ref={(ref) => {
                                                dryingReasonSelectRef = ref;
                                            }}
                                            placeholder="Chọn mục đích sấy"
                                            options={dryingReasons}
                                            onChange={(value) =>
                                                setSelectedDryingReason(value)
                                            }
                                            isDisabled={palletCards.length > 0}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label
                                            htmlFor="drying_method"
                                            className="block mb-2 text-md font-medium text-gray-900 "
                                        >
                                            Quy cách thô
                                        </label>
                                        <Select
                                            ref={(ref) => {
                                                dryingMethodSelectRef = ref;
                                            }}
                                            placeholder="Chọn quy cách thô"
                                            options={dryingMethods}
                                            onChange={(value) => {
                                                setSelectedDryingMethod(value);
                                            }}
                                        />
                                    </div>

                                    <div className="col-span-1">
                                        <label
                                            htmlFor="indate"
                                            className="block mb-2 text-md font-medium text-gray-900 "
                                        >
                                            Ngày nhập gỗ
                                        </label>
                                        <DatePicker
                                            selected={startDate}
                                            onChange={(date) =>
                                                setStartDate(date)
                                            }
                                            className=" pl-3 border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                        />
                                    </div>
                                </div>
                                <div className="flex w-full justify-end items-end">
                                    <button
                                        type="button"
                                        onClick={handleAddToList}
                                        className="text-white bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                        // disabled={(palletCards.length) > 0 ? true : false}
                                    >
                                        Thêm vào danh sách
                                    </button>
                                </div>
                            </form>
                        </section>

                        <div className="my-4 border-b border-gray-200"></div>

                        {/* List */}
                        <div className="my-6 space-y-5">
                            {/* List of Pallet Cards */}
                            <div className="my-6 space-y-5">
                                {isLoading ? (
                                    <div className="text-center">
                                        <Spinner
                                            thickness="4px"
                                            speed="0.65s"
                                            emptyColor="gray.200"
                                            color="#155979"
                                            size="xl"
                                        />
                                    </div>
                                ) : palletCards.length > 0 ? (
                                    palletCards
                                ) : (
                                    <div className="flex flex-col justify-center text-center text-gray-400">
                                        <div>Danh sách hiện đang trống.</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="xl:flex w-full justify-between items-center">
                            <div className="xl:my-0 my-2 text-gray-500">
                                Tổng: <span>{palletCards.length}</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleCreatePallet}
                                className="flex items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center gap-x-2 active:scale-[.95] active:duration-75 transition-all"
                            >
                                {createPalletLoading ? (
                                    <div className="flex items-center space-x-4">
                                        <Spinner size="sm" color="white" />
                                        <div>Đang tạo pallet</div>
                                    </div>
                                ) : (
                                    <>
                                        <HiPlus className="text-xl" />
                                        Tạo pallet
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* {
                loading && <Loader />
            } */}
        </Layout>
    );
}

export default WoodSorting;
