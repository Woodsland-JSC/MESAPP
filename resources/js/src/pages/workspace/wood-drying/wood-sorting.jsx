import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../layouts/layout";
import { Link } from "react-router-dom";
import PalletCard from "../../../components/PalletCard";
import { HiPlus, HiOutlineSearch, HiOutlineClock } from "react-icons/hi";
import { RiInboxArchiveFill } from "react-icons/ri";
import axios from "axios";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import palletsApi from "../../../api/palletsApi";
import toast from "react-hot-toast";
import { Spinner } from "@chakra-ui/react";
import moment from "moment";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../../assets/styles/datepicker.css";
import { format, startOfDay, endOfDay } from "date-fns";
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import BigSelect from "../../../components/Select/BigSelect";
import Loader from "../../../components/Loader";
import useAppContext from "../../../store/AppContext";
import { IoIosArrowBack } from "react-icons/io";
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
import { BiSolidFactory } from "react-icons/bi";

function WoodSorting() {
    const { user } = useAppContext();
    const navigate = useNavigate();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isPalletTracingOpen,
        onOpen: onPalletTracingOpen,
        onClose: onPalletTracingClose,
    } = useDisclosure();
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();

    // States
    const [loading, setLoading] = useState(false);
    const [createPalletLoading, setCreatePalletLoading] = useState(false);
    const [palletHistoryLoading, setPalletHistoryLoading] = useState(false);
    const [palletListLoading, setPalletListLoading] = useState(false);
    const [palletTracingLoading, setPalletTracingLoading] = useState(false);

    const [woodTypes, setWoodTypes] = useState([]);
    const [dryingMethodsOptions, setDryingMethodsOptions] = useState([]);
    const [dryingReasons, setDryingReasons] = useState([]);
    const [palletCode, setPalletCode] = useState(null);
    const [palletHistory, setPalletHistory] = useState([]);
    const [palletTracingData, setPalletTracingData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedPallet, setSelectedPallet] = useState(null);
    const [palletOptions, setPalletOptions] = useState([]);
    const [reloadAsyncSelectKey, setReloadAsyncSelectKey] = useState(0);
    const [reloadDryingMethodsKey, setReloadDryingMethodsKey] = useState(0);

    const years = [];
    const currentYear = moment().year();
    for (let year = currentYear - 10; year <= currentYear; year++) {
        years.push({ value: year, label: `Năm ${year.toString()}` });
    }
    years.reverse();
    const defaultYear = {
        value: currentYear,
        label: `Năm ${currentYear.toString()}`,
    };

    const weeks = [];
    const currentWeek = moment().isoWeek();
    const totalWeeks = moment().isoWeeksInYear(currentYear);
    for (let week = 1; week <= totalWeeks; week++) {
        weeks.push({ value: week, label: `Tuần ${week}` });
    }
    const defaultWeek = { value: currentWeek, label: `Tuần ${currentWeek}` };

    const [selectedWeek, setSelectedWeek] = useState(defaultWeek);
    const [selectedYear, setSelectedYear] = useState(defaultYear);

    const asyncSelectKey = useMemo(
        () => reloadAsyncSelectKey,
        [reloadAsyncSelectKey]
    );

    const asyncDryingMethodsKey = useMemo(
        () => reloadDryingMethodsKey,
        [reloadDryingMethodsKey]
    );

    const loadPalletCallback = async (inputValue, callback) => {
        setPalletListLoading(true);
        if (selectedYear && selectedWeek) {
            try {
                const response = await axios.get(
                    "/api/pallets/get-pallet-by-year-week",
                    {
                        params: {
                            year: selectedYear.value,
                            week: selectedWeek.value,
                        },
                    }
                );
                const data = response.data;
                if (Array.isArray(data)) {
                    const options = data.map((item) => ({
                        value: item.palletID,
                        label: item.Code,
                    }));
                    setPalletOptions(options);

                    if (callback) {
                        callback(options);
                    }
                } else {
                    console.error(
                        "Error fetching pallets: Invalid response format"
                    );
                }
                setPalletListLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Có lỗi trong quá trình load dữ liệu.");
                setPalletListLoading(false);
            }
        }
    };

    const loadPalletOptions = (inputValue, callback) => {
        loadPalletCallback(inputValue, callback);
    };

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
    const [isItemsLoading, setIsItemsLoading] = useState(false);
    const [isInvalidQuantity, setIsInvalidQuantity] = useState(false);

    const [palletQuantities, setPalletQuantities] = useState({});

    const isPalletCardExists = (id, palletCards) => {
        return palletCards.some((card) => card.key === id);
    };

    useEffect(() => {
        if (selectedYear && selectedWeek) {
            loadPalletCallback();
        }
    }, [selectedYear, selectedWeek]);

    useEffect(() => {
        setSelectedWoodType({
            value: "01",
            label: "Keo tai tượng - Acacia Magium",
        });
        const fetchData = async () => {
            setLoading(true);
            try {
                const woodTypesData = await palletsApi.getTypeOfWood();
                const woodTypesOptions = woodTypesData.map((item) => ({
                    value: item.Code,
                    label: item.Name,
                }));
                setWoodTypes(woodTypesOptions);
                console.log(woodTypes);
            } catch (error) {
                console.error("Error fetching wood types:", error);
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

    const formatNumber = (num) => {
        const number = parseFloat(num); // Chuyển đổi sang số
        if (isNaN(number)) {
            return ""; // Xử lý trường hợp không phải là số, trả về chuỗi rỗng
        }
        if (Number.isInteger(number)) {
            return number.toString(); // Hiển thị số nguyên
        } else {
            return number.toFixed(2); // Hiển thị tối đa 2 chữ số thập phân
        }
    };

    const loadDryingMethodsData = async (dryingReasonValue) => {
        setIsItemsLoading(true);
        try {
            const dryingMethodsData = await palletsApi.getDryingMethod(
                dryingReasonValue
            );
            const options = dryingMethodsData.map((item) => ({
                value: `${item.ItemCode}-${item.BatchNum}`,
                label: item.ItemName,
                batchNum: item.BatchNum,
                code: item.ItemCode,
            }));

            setDryingMethodsOptions(options);
            setIsItemsLoading(false);
        } catch (error) {
            console.error("Error fetching drying methods:", error);
            toast.error(
                "Không thể lấy dữ liệu quy cách thô. " + error?.response?.data?.message
            );
            setIsItemsLoading(false);
            setDryingMethodsOptions([]);
        }
    };

    // Hàm filter options dựa trên input value - không gọi API
    const loadDryingMethods = async (inputValue, callback) => {
        return dryingMethodsOptions.filter((method) =>
            method.label.toLowerCase().includes(inputValue.toLowerCase())
        );
    };

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

    const [quyCachList, setQuyCachList] = useState([]);

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
                console.log("1. Dữ liệu từ form:", data);

                const response = await palletsApi.getStockByItem(
                    selectedDryingMethod.code,
                    selectedDryingReason.value,
                    selectedDryingMethod.batchNum
                );

                console.log("2. Thông tin api trả về:", response);

                // Quy ước validate quy cách:
                // - Một pallet chỉ chứa tối đa 2 quy cách khác nhau

                if (response && response.length > 0) {
                    response.map((item, index) => {
                        
                        const quyCach = `${Number(item.CDay)}x${Number(item.CRong)}x${Number(item.CDai)}`;
                        const existingQuyCach = quyCachList.find((item) => item.key === quyCach);

                        if (existingQuyCach) {
                            // Nếu đã tồn tại quy cách, kiểm tra BatchNum
                            if (existingQuyCach.batchNums.includes(item.BatchNum)) {
                                toast.error("Quy cách đã tồn tại trong pallet.");
                                return; 
                            } else {
                                // Nếu chưa có BatchNum, thêm vào danh sách
                                existingQuyCach.batchNums.push(item.BatchNum);
                                console.log("BatchNum mới đã được thêm vào quy cách:", quyCach);
                            }
                        } else {
                            // Nếu chưa có quy cách, thêm quy cách mới với BatchNum
                            if (quyCachList.length >= 2) {
                                toast.error("Một pallet chỉ chứa tối đa 2 quy cách.");
                                return; // Dừng nếu vượt quá 2 quy cách
                            }
                        
                            quyCachList.push({
                                key: quyCach,
                                batchNums: [item.BatchNum],
                            });
                            console.log("Quy cách mới đã được thêm:", quyCach);
                        }
                            console.log(
                                "3.Danh sách item trong pallet: ",
                                quyCachList
                            );
                            const newPalletCard = (
                                <PalletCard
                                    key={item.WhsCode + item.BatchNum}
                                    itemCode={selectedDryingMethod.code}
                                    itemName={selectedDryingMethod.label}
                                    batchNum={item.BatchNum}
                                    inStock={item.Quantity}
                                    whsCode={item.WhsCode}
                                    height={item.CDai}
                                    width={item.CRong}
                                    flag={item.Flag}
                                    thickness={item.CDay}
                                    isInvalidQuantity={isInvalidQuantity}
                                    createPalletLoading={createPalletLoading}
                                    onDelete={() =>
                                        handleDeletePalletCard(
                                            item.WhsCode + item.BatchNum,
                                            `${Number(item.CDay)}x${Number(item.CRong)}x${Number(item.CDai)}`,
                                            item.BatchNum
                                        )
                                    }
                                    onQuantityChange={(quantity) => {
                                        handlePalletQuantityChange(
                                            item.WhsCode + item.BatchNum,
                                            quantity
                                        );
                                    }}
                                />
                            );
                            setPalletCards((prevPalletCards) => [
                                ...prevPalletCards,
                                newPalletCard,
                            ]);
                            
                            toast.success("Quy cách gỗ đã được chất lên pallet.");

                    });
                } else {
                    toast("Gỗ đã hết. Xin hãy chọn quy cách khác.");
                    return;
                }
            } catch (error) {
                console.error("Error fetching stock by item:", error);
                toast.error("Không tìm thấy thông tin. Vui lòng thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDeletePalletCard = (id, quyCach, batchNum) => {
        setQuyCachList((prevList) => {
            // Tìm quy cách trong danh sách
            const updatedList = prevList.map((item) => {
                if (item.key === quyCach) {
                    const batchNums = item.batchNums.filter((bn) => bn !== batchNum);
                    if (batchNums.length === 0) {
                        return null;
                    }
                    return { ...item, batchNums };
                }
                return item;
            });
            return updatedList.filter((item) => item !== null);
        });
        console.log("Cập nhật Danh sách Quy Cach sau khi xóa: ", quyCachList);
        setPalletCards((prevPalletCards) =>
            prevPalletCards.filter((card) => card.key !== id)
        );
        toast("Quy cách đã được xóa khỏi pallet.");
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
            MaNhaMay: user?.plant,
            Details: palletCards.map((card) => ({
                ItemCode: card.props.itemCode,
                ItemName: card.props.itemName,
                WhsCode: card.props.whsCode,
                BatchNum: card.props.batchNum,
                Qty: parseInt(palletQuantities[card.key]),
                CDai: formatNumber(card.props.height),
                CDay: formatNumber(card.props.thickness),
                CRong: formatNumber(card.props.width),
                QuyCach: `${formatNumber(card.props.thickness)}x${formatNumber(card.props.width)}x${formatNumber(card.props.height)}`,
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
            onConfirmClose();
            return;
        }

        let hasInvalidQuantity = false;

        for (const card of palletCards) {
            var inStock = parseFloat(card.props.inStock);
            var height = parseFloat(card.props.height);
            var width = parseFloat(card.props.width);
            var thickness = parseFloat(card.props.thickness);
            var quantity = parseFloat(palletQuantities[card.key] || 0);

            if (
                selectedDryingReason.value !== "SL" &&
                (quantity >
                    Math.floor(
                        (inStock * 1000000000) / (height * width * thickness)
                    ) ||
                    quantity === 0 ||
                    quantity < 0 ||
                    quantity == "" ||
                    quantity == null)
            ) {
                hasInvalidQuantity = true;
                break;
            }
            if (
                selectedDryingReason.value === "SL" &&
                (quantity > inStock ||
                    quantity === 0 ||
                    quantity < 0 ||
                    quantity == "" ||
                    quantity == null)
            ) {
                hasInvalidQuantity = true;
                break;
            }
        }

        if (hasInvalidQuantity) {
            setIsInvalidQuantity(true);
            toast.error("Giá trị số lượng không hợp lệ.");
            onConfirmClose();
            return;
        } else {
            setIsInvalidQuantity(false);
        }

        const palletObject = createPalletObject();
        setCreatePalletLoading(true);

        try {
            const response = await axios.post(
                "/api/pallets/v2/create",
                palletObject
            );
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
                onConfirmClose();

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
                setQuyCachList([]);
                setBatchId("");
                setStartDate(new Date());
                setPalletCards([]);

                setPalletQuantities({});
            }
        } catch (error) {
            console.error("Error creating pallet:", error);
            const errorMessage =
                error?.response?.data?.res1?.error?.message?.value;
            const systemError = error?.response?.data?.error;
            const displayError = errorMessage
                ? errorMessage
                : systemError
                ? systemError
                : "";
            setCreatePalletLoading(false);
            onConfirmClose();
            Swal.fire({
                title: "Có lỗi khi tạo pallet.",
                html: `
                    <p>Chi tiết lỗi:<br></p>
                    <p>
                        ${displayError ? "<li>" + displayError + "</li>" : ""}

                    </p>
                `,
                icon: "error",
            });
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

    const [result, setResult] = useState({
        totalQty_T: 0,
        data: [],
    });

    // Hàm handleCheckPallet
    const handleCheckPallet = async () => {
        if (!selectedPallet) {
            toast.error("Xin hãy chọn một pallet");
            return;
        } else {
            setPalletTracingLoading(true);
            try {
                const response = await axios.get(
                    "/api/pallets/pallet-lifecyle",
                    {
                        params: {
                            palletID: selectedPallet.value,
                        },
                    }
                );
                if (
                    response.data === "" ||
                    response.data === null ||
                    response.data.length === 0
                ) {
                    toast("Không tìm thấy kết quả phù hợp.");
                    setPalletHistoryLoading(false);
                } else {
                    console.log("Kết quả truy xuất lịch sử pallet :", response);
                    toast.success("Tra cứu thành công.");
                    setPalletTracingData(response.data.data[0]);
                    const updatedResult = {
                        totalQty_T: 0,
                        data: [],
                    };
                    const itemInfo = {};
                    response.data.data.forEach((item) => {
                        updatedResult.totalQty_T += item.Qty_T;
                        const key = `${item.ItemName}_${Math.floor(
                            item.CDay
                        )}x${Math.floor(item.CRong)}x${Math.floor(item.CDai)}`;
                        if (itemInfo[key]) {
                            itemInfo[key].Qty_T += item.Qty_T;
                        } else {
                            itemInfo[key] = {
                                ItemName: item.ItemName,
                                Qty_T: item.Qty_T,
                                QuyCach: `${Math.floor(item.CDay)}x${Math.floor(
                                    item.CRong
                                )}x${Math.floor(item.CDai)}`,
                            };
                        }
                    });

                    updatedResult.data = Object.values(itemInfo);
                    setResult(updatedResult);

                    console.log(result);
                    console.log(
                        "Kết quả truy xuất lịch sử pallet :",
                        palletTracingData
                    );
                    setPalletTracingLoading(false);
                }
            } catch (error) {
                console.error("Error creating pallet:", error);
                toast.error("Lỗi kết nối hệ thống. Vui lòng thử lại sau.");
                setPalletTracingLoading(false);
            }
        }
    };

    return (
        <Layout>
            {/* Container */}
            <div className="flex mb-4 xl:mb-0 justify-center bg-transparent">
                {/* Section */}
                <div className="w-screen px-4 xl:p-12 lg:p-12 md:p-12 p-4 xl:pt-6 lg:pt-6 md:pt-6 pt-2 xl:px-32">
                    {/* Go back */}
                    <div className="flex items-top justify-between">
                        <div
                            className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B]"
                            onClick={() => navigate(-1)}
                        >
                            <IoIosArrowBack />
                            <div>Quay lại</div>
                        </div>
                    </div>
                    
                    {/* Header */}
                    <div className="flex justify-between xl:mb-4 lg:mb-4 md:mb-4 mb-0 items-center">
                        <div className="flex space-x-4">
                            <div className="serif text-4xl font-bold">Tạo pallet xếp sấy</div>
                        </div>

                        <div className="flex gap-x-2 ">
                            <button
                                className="bg-[#10151c] font-medium rounded-xl p-2.5 px-4 text-white xl:flex items-center md:flex hidden active:scale-[.95] active:duration-75 transition-all disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                onClick={onOpen}
                                disabled={createPalletLoading}
                            >
                                <HiOutlineClock className="text-xl mr-2" />
                                Xem lịch sử
                            </button>

                            <button
                                className="bg-[#040507] font-medium rounded-xl p-2.5 px-4 text-white xl:flex items-center md:flex hidden active:scale-[.95] active:duration-75 transition-all disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                onClick={onPalletTracingOpen}
                                disabled={createPalletLoading}
                            >
                                <HiOutlineSearch className="text-xl mr-2" />
                                Truy nguyên
                            </button>
                        </div>
                    </div>

                    {/* History In Mobile View */}
                    <div className="flex space-x-2 xl:hidden lg:hidden md:hidden">
                        <button
                            className="bg-[#1f2937] font-medium rounded-xl p-2.5 px-4 pr-7 my-4 text-white  flex w-full justify-center items-center active:scale-[.95] active:duration-75 transition-all disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                            onClick={onOpen}
                            disabled={createPalletLoading}
                        >
                            <HiOutlineClock className="text-xl mr-2" />
                            Xem lịch sử
                        </button>
                        <button
                            className="bg-[#1f2937] font-medium rounded-xl p-2.5 px-4 pr-7 my-4 text-white items-center  flex w-full justify-center active:scale-[.95] active:duration-75 transition-all disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                            onClick={onPalletTracingOpen}
                            disabled={createPalletLoading}
                        >
                            <HiOutlineSearch className="text-xl mr-2" />
                            Truy nguyên
                        </button>
                    </div>

                    {/*Pallets Loading History Modals */}
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
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
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
                                            {palletHistory
                                                .filter((pallet) =>
                                                    `${pallet.thickness} ${
                                                        pallet.width
                                                    } ${pallet.length} ${
                                                        pallet.pallet_code
                                                    } ${
                                                        pallet.sum_quantity
                                                    } ${format(
                                                        new Date(
                                                            pallet.created_date
                                                        ),
                                                        "dd/MM/yyyy"
                                                    )}`
                                                        .toLowerCase()
                                                        .includes(
                                                            searchTerm.toLowerCase()
                                                        )
                                                )
                                                .map((pallet) => (
                                                    <div className="border-gray-300 bg-gray-100 max-h-[14rem]  border-2 rounded-xl">
                                                        <div className="p-4 pt-2 pb-0">
                                                            <div className="rounded-md my-2 w-fit px-3 text-white bg-[#335b6f]">
                                                                Pallet:{" "}
                                                                <span>
                                                                    {
                                                                        pallet.pallet_code
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="text-lg font-semibold">
                                                                Quy cách:{" "}
                                                                <span>
                                                                    {
                                                                        pallet.QuyCach
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
                                                                    <span>
                                                                        {" "}
                                                                        {pallet.LyDo ===
                                                                        "SL"
                                                                            ? "(m3)"
                                                                            : ""}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2">
                                                                <div>
                                                                    Ngày tạo:{" "}
                                                                </div>
                                                                <div className="font-semibold">
                                                                    {format(
                                                                        new Date(
                                                                            pallet.created_date
                                                                        ),
                                                                        "dd/MM/yyyy"
                                                                    )}
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

                    {/*Pallet Tracing Back Modals */}
                    <Modal
                        onClose={onPalletTracingClose}
                        isOpen={isPalletTracingOpen}
                        size="full"
                        scrollBehavior="inside"
                        isCentered
                    >
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader className="border-b border-gray-200 shadow-sm">
                                <div className="serif text-2xl font-bold">
                                    Truy nguyên pallet
                                </div>
                            </ModalHeader>
                            <ModalCloseButton />
                            <ModalBody className="py-6">
                                {/* Filter Section */}
                                <div className=" mt-4  mb-4 xl:w-full">
                                    <div className="items-center gap-x-2 bg-gray-100 p-3 border border-gray-200 shadow-md rounded-lg">
                                        <div className="text-lg font-medium mb-4 ">
                                            Tra cứu pallet{" "}
                                        </div>
                                        <div className="xl:flex lg:flex md:flex sm:block w-full gap-x-3 ">
                                            {/* Select Filter */}
                                            <div className="w-full xl:grid lg:grid md:grid grid-cols-4 xl:space-y-0 lg:space-y-0 md:space-y-0 space-y-3 gap-x-3">
                                                <div>
                                                    <Select
                                                        placeholder="Chọn năm"
                                                        options={years}
                                                        defaultValue={
                                                            selectedYear
                                                        }
                                                        onChange={(value) => {
                                                            console.log(
                                                                "Selected Year:",
                                                                value
                                                            );
                                                            setSelectedYear(
                                                                value
                                                            );
                                                            setReloadAsyncSelectKey(
                                                                (prevKey) =>
                                                                    prevKey + 1
                                                            );
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <Select
                                                        placeholder="Chọn tuần"
                                                        options={weeks}
                                                        onChange={(value) => {
                                                            console.log(
                                                                "Selected Week:",
                                                                value
                                                            );
                                                            setSelectedWeek(
                                                                value
                                                            );
                                                            setReloadAsyncSelectKey(
                                                                (prevKey) =>
                                                                    prevKey + 1
                                                            );
                                                        }}
                                                        defaultValue={
                                                            selectedWeek
                                                        }
                                                    />
                                                </div>
                                                <div className="col-span-2 3">
                                                    <Select
                                                        placeholder="Chọn pallet"
                                                        // id="pallet"
                                                        defaultOptions
                                                        options={palletOptions}
                                                        isDisabled={palletListLoading}
                                                        onChange={(value) => {
                                                            console.log(
                                                                "Selected Pallet:",
                                                                value
                                                            );
                                                            setSelectedPallet(
                                                                value
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                className="xl:mt-0 lg:mt-0 md:mt-0  max-w-md bg-[#155979] p-2 rounded-xl xl:w-[20%] lg:w-[20%] md:w-[20%]  sm:w-[20%] w-full text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all mt-3"
                                                onClick={handleCheckPallet}
                                            >
                                                Kiểm tra
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Result */}
                                <div className="mb-4 text-lg font-semibold text-[#155979]">
                                    Kết quả tra cứu:
                                </div>

                                {palletTracingLoading ? (
                                    <div className="text-center">
                                        <Spinner
                                            thickness="4px"
                                            speed="0.65s"
                                            emptyColor="gray.200"
                                            color="#155979"
                                            size="xl"
                                        />
                                    </div>
                                ) : palletTracingData.Code ? (
                                    <div className=" shadow-md my-1 p-3 border border-gray-300 rounded-lg">
                                        <div className="uppercase font-semibold">
                                            Thông tin pallet{" "}
                                            <span>
                                                {palletTracingData.Code}
                                            </span>
                                        </div>

                                        <hr className="mb-3 mt-1 border-2 border-[#237399]"></hr>

                                        {result.data.map((item, index) => (
                                            <div className="space-y-1 mb-3">
                                                <div className="w-full xl:flex lg:flex md:flex">
                                                    <div className="w-1/4 font-semibold xl:block lg:block md:block hidden">
                                                        Quy cách:
                                                    </div>
                                                    <div className="xl:block md:block lg:block xl:w-3/4 lg:w-3/4 md:w-3/4 hidden w-full">
                                                        {item.ItemName} (
                                                        {item.QuyCach})
                                                    </div>
                                                    <div className="xl:hidden lg:hidden md:hidden  w-full font-semibold text-lg text-[#155979]">
                                                        {item.ItemName} (
                                                        {item.QuyCach})
                                                    </div>
                                                </div>
                                                <div className="w-full flex">
                                                    <div className="w-1/4 font-semibold">
                                                        Số lượng:
                                                    </div>
                                                    <div className="w-3/4">
                                                        {palletTracingData.LyDo ==
                                                        "SL" ? (
                                                            <span>
                                                                <span>
                                                                    {
                                                                        palletTracingData.Qty
                                                                    }
                                                                </span>{" "}
                                                                (m3)
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                <span>
                                                                    {
                                                                        palletTracingData.Qty_T
                                                                    }
                                                                </span>{" "}
                                                                (T)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* COC Information */}
                                        <div className="my-1 mt-4 border border-gray-300 shadow-sm rounded-lg">
                                            <div className="my-2 px-3 font-semibold">
                                                Thông tin COC
                                            </div>
                                            <div className="relative overflow-x-auto sm:rounded-b-md border border-gray-200">
                                                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                                                    <thead className="text-xs text-gray-700 uppercase bg-[#E5E7EB] ">
                                                        <tr>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-2.5"
                                                            >
                                                                Loại Gỗ
                                                            </th>
                                                            <th
                                                                scope="col"
                                                                className="px-6 py-2.5"
                                                            >
                                                                Mã lô gỗ
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-[15px] text-gray-900 font-medium  ">
                                                        <tr className="text-md odd:bg-white even:bg-gray-50 border-b ">
                                                            <td
                                                                scope="row"
                                                                className="px-6 py-3 whitespace-nowrap "
                                                            >
                                                                {
                                                                    palletTracingData
                                                                        .LoaiGo
                                                                        .Name
                                                                }
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                {
                                                                    palletTracingData.MaLo
                                                                }
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* History Tracing */}
                                        <div className="my-4  mt-4 border border-gray-200 rounded-lg">
                                            <div className="my-3 mb-4 px-3 font-semibold">
                                                Lịch sử pallet
                                            </div>
                                            <ol className="xl:px-8 lg:px-8 md:px-8 px-4 ">
                                                <li className="border-l-2 border-blue-600">
                                                    <div className="md:flex flex-start">
                                                        <div className="bg-blue-600 xl:w-9 md:w-9 lg:w-9 w-6 xl:h-9 md:h-9 lg:h-9 h-6 xl:flex lg:flex md:flex hidden items-center justify-center rounded-full xl:-ml-4 lg:-ml-4 md:-ml-4 ml-0">
                                                            <svg
                                                                aria-hidden="true"
                                                                focusable="false"
                                                                data-prefix="fas"
                                                                className="text-white w-4 h-4 xl:blocl lg:block md:block hidden"
                                                                role="img"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 448 512"
                                                            >
                                                                <path
                                                                    fill="currentColor"
                                                                    d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm64-192c0-8.8 7.2-16 16-16h288c8.8 0 16 7.2 16 16v64c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16v-64zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"
                                                                ></path>
                                                            </svg>
                                                        </div>
                                                        <div className="block xl:px-6 lg:px-6 md:px-6  px-4 py-4 rounded-lg shadow-lg bg-gray-100 w-full xl:ml-6 lg:ml-6 md:ml-6 ml-0 mb-8">
                                                            <div className="flex  items-center justify-between mb-2">
                                                                <a className="font-semibold text-blue-600 hover:text-blue-700 focus:text-blue-800 duration-300 transition ease-in-out text-lg">
                                                                    Chờ sấy
                                                                </a>
                                                                {palletTracingData.LyDo ===
                                                                "SL" ? (
                                                                    <a
                                                                        href="#!"
                                                                        className="font-medium text-blue-600 hover:text-blue-700 focus:text-blue-800 duration-300 transition ease-in-out xl:text-lg lg:text-lg md-text-lg text-md"
                                                                    >
                                                                        Số
                                                                        lượng:{" "}
                                                                        {
                                                                            palletTracingData.Qty
                                                                        }{" "}
                                                                        (m3)
                                                                    </a>
                                                                ) : (
                                                                    <a
                                                                        href="#!"
                                                                        className="font-medium text-blue-600 hover:text-blue-700 focus:text-blue-800 duration-300 transition ease-in-out xl:text-lg lg:text-lg md-text-lg text-md"
                                                                    >
                                                                        Số
                                                                        lượng:{" "}
                                                                        {
                                                                            palletTracingData.Qty_T
                                                                        }{" "}
                                                                        (T)
                                                                    </a>
                                                                )}
                                                            </div>
                                                            <div className="space-y-1 max-w-lg ">
                                                                <div className="xl:grid lg:grid md:grid grid-cols-2">
                                                                    <div className="font-semibold">
                                                                        Ngày làm
                                                                        việc:
                                                                    </div>
                                                                    <div>
                                                                        {
                                                                            palletTracingData.ngaytao
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div className="xl:grid lg:grid md:grid grid-cols-2">
                                                                    <div className="font-semibold">
                                                                        Người
                                                                        thực
                                                                        hiện:
                                                                    </div>
                                                                    <div>
                                                                        {
                                                                            palletTracingData.CreateBy
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div className="xl:grid lg:grid md:grid grid-cols-2">
                                                                    <div className="font-semibold">
                                                                        Xuất
                                                                        đến:
                                                                    </div>
                                                                    <div>
                                                                        Kho sấy
                                                                    </div>
                                                                </div>
                                                                <div className="xl:grid lg:grid md:grid grid-cols-2">
                                                                    <div className="font-semibold">
                                                                        Ngày
                                                                        nhận:
                                                                    </div>
                                                                    <div>
                                                                        {
                                                                            palletTracingData.LoadedIntoKilnDate
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                                {palletTracingData.LoadedIntoKilnDate && (
                                                    <li className="border-l-2 border-purple-600">
                                                        <div className="md:flex flex-start">
                                                            <div className="bg-purple-600 xl:w-9 md:w-9 lg:w-9 w-6 xl:h-9 md:h-9 lg:h-9 h-6 xl:flex lg:flex md:flex hidden items-center justify-center rounded-full xl:-ml-4 lg:-ml-4 md:-ml-4 ml-0">
                                                                <svg
                                                                    aria-hidden="true"
                                                                    focusable="false"
                                                                    data-prefix="fas"
                                                                    className="text-white w-4 h-4 xl:blocl lg:block md:block hidden"
                                                                    role="img"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 448 512"
                                                                >
                                                                    <path
                                                                        fill="currentColor"
                                                                        d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm64-192c0-8.8 7.2-16 16-16h288c8.8 0 16 7.2 16 16v64c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16v-64zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"
                                                                    ></path>
                                                                </svg>
                                                            </div>
                                                            <div className="block xl:px-6 lg:px-6 md:px-6  px-4 py-4 rounded-lg shadow-lg bg-gray-100 w-full xl:ml-6 lg:ml-6 md:ml-6 ml-0 mb-8">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <a className="font-semibold text-purple-600 hover:text-purple-700 focus:text-purple-800 duration-300 transition ease-in-out text-lg">
                                                                        Đã vào
                                                                        lò
                                                                    </a>
                                                                    {palletTracingData.LyDo ===
                                                                    "SL" ? (
                                                                        <a
                                                                            href="#!"
                                                                            className="font-medium text-purple-600 hover:text-purple-700 focus:text-purple-800 duration-300 transition ease-in-out xl:text-lg lg:text-lg md-text-lg text-md"
                                                                        >
                                                                            Số
                                                                            lượng:{" "}
                                                                            {
                                                                                palletTracingData.Qty
                                                                            }{" "}
                                                                            (m3)
                                                                        </a>
                                                                    ) : (
                                                                        <a
                                                                            href="#!"
                                                                            className="font-medium text-purple-600 hover:text-purple-700 focus:text-purple-800 duration-300 transition ease-in-out xl:text-lg lg:text-lg md-text-lg text-md"
                                                                        >
                                                                            Số
                                                                            lượng:{" "}
                                                                            {
                                                                                palletTracingData.Qty_T
                                                                            }{" "}
                                                                            (T)
                                                                        </a>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1 max-w-lg">
                                                                    <div className="xl:grid lg:grid md:grid grid-cols-2">
                                                                        <div className="font-semibold">
                                                                            Ngày
                                                                            làm
                                                                            việc:
                                                                        </div>
                                                                        <div>
                                                                            {
                                                                                palletTracingData.LoadedIntoKilnDate
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    <div className="xl:grid lg:grid md:grid grid-cols-2">
                                                                        <div className="font-semibold">
                                                                            Người
                                                                            thực
                                                                            hiện:
                                                                        </div>
                                                                        <div>
                                                                            {
                                                                                palletTracingData.LoadedBy
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                )}
                                                {palletTracingData.runDate && (
                                                    <li className="border-l-2 border-red-600">
                                                        <div className="md:flex flex-start">
                                                            <div className="bg-red-600 xl:w-9 md:w-9 lg:w-9 w-6 xl:h-9 md:h-9 lg:h-9 h-6 xl:flex lg:flex md:flex hidden items-center justify-center rounded-full xl:-ml-4 lg:-ml-4 md:-ml-4 ml-0">
                                                                <svg
                                                                    aria-hidden="true"
                                                                    focusable="false"
                                                                    data-prefix="fas"
                                                                    className="text-white w-4 h-4 xl:blocl lg:block md:block hidden"
                                                                    role="img"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 448 512"
                                                                >
                                                                    <path
                                                                        fill="currentColor"
                                                                        d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm64-192c0-8.8 7.2-16 16-16h288c8.8 0 16 7.2 16 16v64c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16v-64zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"
                                                                    ></path>
                                                                </svg>
                                                            </div>
                                                            <div className="block xl:px-6 lg:px-6 md:px-6  px-4 py-4 rounded-lg shadow-lg bg-gray-100 w-full xl:ml-6 lg:ml-6 md:ml-6 ml-0 mb-8">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <a className="font-semibold text-red-600 hover:text-blue-700 focus:text-red-800 duration-300 transition ease-in-out text-lg">
                                                                        Đang sấy
                                                                    </a>
                                                                    <a
                                                                        href="#!"
                                                                        className="font-medium text-red-600 hover:text-red-700 focus:text-red-800 duration-300 transition ease-in-out xl:text-lg lg:text-lg md-text-lg text-md"
                                                                    >
                                                                        Số
                                                                        lượng:{" "}
                                                                        {
                                                                            result.totalQty_T
                                                                        }{" "}
                                                                        (T)
                                                                    </a>
                                                                    {palletTracingData.LyDo ===
                                                                    "SL" ? (
                                                                        <a
                                                                            href="#!"
                                                                            className="font-medium text-red-600 hover:text-red-700 focus:text-red-800 duration-300 transition ease-in-out xl:text-lg lg:text-lg md-text-lg text-md"
                                                                        >
                                                                            Số
                                                                            lượng:{" "}
                                                                            {
                                                                                palletTracingData.Qty
                                                                            }{" "}
                                                                            (m3)
                                                                        </a>
                                                                    ) : (
                                                                        <a
                                                                            href="#!"
                                                                            className="font-medium text-red-600 hover:text-red-700 focus:text-red-800 duration-300 transition ease-in-out xl:text-lg lg:text-lg md-text-lg text-md"
                                                                        >
                                                                            Số
                                                                            lượng:{" "}
                                                                            {
                                                                                palletTracingData.Qty_T
                                                                            }{" "}
                                                                            (T)
                                                                        </a>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1 max-w-lg">
                                                                    <div className="xl:grid lg:grid md:grid grid-cols-2">
                                                                        <div className="font-semibold">
                                                                            Ngày
                                                                            làm
                                                                            việc:
                                                                        </div>
                                                                        <div>
                                                                            {
                                                                                palletTracingData.runDate
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    <div className="xl:grid lg:grid md:grid grid-cols-2">
                                                                        <div className="font-semibold">
                                                                            Người
                                                                            thực
                                                                            hiện:
                                                                        </div>
                                                                        <div>
                                                                            {
                                                                                palletTracingData.RunBy
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    <div className="xl:grid lg:grid md:grid grid-cols-2">
                                                                        <div className="font-semibold">
                                                                            Xuất
                                                                            đến:
                                                                        </div>
                                                                        <div>
                                                                            Kho
                                                                            sấy
                                                                        </div>
                                                                    </div>
                                                                    <div className="xl:grid lg:grid md:grid grid-cols-2">
                                                                        <div className="font-semibold">
                                                                            Ngày
                                                                            nhận:
                                                                        </div>
                                                                        <div>
                                                                            {
                                                                                palletTracingData.CompletedDate
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                )}
                                                {palletTracingData.CompleteDate && (
                                                    <li className="border-l-2 border-green-600">
                                                        <div className="md:flex flex-start">
                                                            <div className="bg-green-600 xl:w-9 md:w-9 lg:w-9 w-6 xl:h-9 md:h-9 lg:h-9 h-6 xl:flex lg:flex md:flex hidden items-center justify-center rounded-full xl:-ml-4 lg:-ml-4 md:-ml-4 ml-0">
                                                                <svg
                                                                    aria-hidden="true"
                                                                    focusable="false"
                                                                    data-prefix="fas"
                                                                    className="text-white w-4 h-4 xl:blocl lg:block md:block hidden"
                                                                    role="img"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 448 512"
                                                                >
                                                                    <path
                                                                        fill="currentColor"
                                                                        d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm64-192c0-8.8 7.2-16 16-16h288c8.8 0 16 7.2 16 16v64c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16v-64zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z"
                                                                    ></path>
                                                                </svg>
                                                            </div>
                                                            <div className="block xl:px-6 lg:px-6 md:px-6  px-4 py-4 rounded-lg shadow-lg bg-gray-100 w-full xl:ml-6 lg:ml-6 md:ml-6 ml-0 mb-8">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <a className="font-semibold text-green-600 hover:text-green-700 focus:text-green-800 duration-300 transition ease-in-out text-lg">
                                                                        Đã ra lò
                                                                    </a>
                                                                    <a
                                                                        href="#!"
                                                                        className="font-medium text-green-600 hover:text-green-700 focus:text-green-800 duration-300 transition ease-in-out xl:text-lg lg:text-lg md-text-lg text-md"
                                                                    >
                                                                        Số
                                                                        lượng:{" "}
                                                                        {
                                                                            result.totalQty_T
                                                                        }{" "}
                                                                        (T)
                                                                    </a>
                                                                    {palletTracingData.LyDo ===
                                                                    "SL" ? (
                                                                        <a
                                                                            href="#!"
                                                                            className="font-medium text-green-600 hover:text-green-700 focus:text-green-800 duration-300 transition ease-in-out xl:text-lg lg:text-lg md-text-lg text-md"
                                                                        >
                                                                            Số
                                                                            lượng:{" "}
                                                                            {
                                                                                palletTracingData.Qty
                                                                            }{" "}
                                                                            (m3)
                                                                        </a>
                                                                    ) : (
                                                                        <a
                                                                            href="#!"
                                                                            className="font-medium text-green-600 hover:text-green-700 focus:text-green-800 duration-300 transition ease-in-out xl:text-lg lg:text-lg md-text-lg text-md"
                                                                        >
                                                                            Số
                                                                            lượng:{" "}
                                                                            {
                                                                                palletTracingData.Qty_T
                                                                            }{" "}
                                                                            (T)
                                                                        </a>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1 max-w-lg">
                                                                    <div className="xl:grid lg:grid md:grid grid-cols-2">
                                                                        <div className="font-semibold">
                                                                            Ngày
                                                                            làm
                                                                            việc:
                                                                        </div>
                                                                        <div>
                                                                            {
                                                                                palletTracingData.runDate
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    <div className="xl:grid lg:grid md:grid grid-cols-2">
                                                                        <div className="font-semibold">
                                                                            Người
                                                                            thực
                                                                            hiện:
                                                                        </div>
                                                                        <div>
                                                                            {
                                                                                palletTracingData.CompleteBy
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    <div className="xl:grid lg:grid md:grid grid-cols-2">
                                                                        <div className="font-semibold">
                                                                            Xuất
                                                                            đến:
                                                                        </div>
                                                                        <div>
                                                                            Kho
                                                                            sau
                                                                            sấy
                                                                        </div>
                                                                    </div>
                                                                    {/* <div className="xl:grid lg:grid md:grid grid-cols-2">
                                                                        <div className="font-semibold">
                                                                            Ngày
                                                                            nhận:
                                                                        </div>
                                                                        <div>
                                                                            {
                                                                                palletTracingData.CompletedDate
                                                                            }
                                                                        </div>
                                                                    </div> */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                )}
                                            </ol>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col justify-center text-center text-gray-400">
                                        <div>
                                            Không có thông tin để hiển thị.
                                        </div>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter className="border-t shadow-md border-gray-300">
                                <div className=" flex justify-end gap-x-3  w-full">
                                    <button
                                        onClick={onPalletTracingClose}
                                        className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all xl:w-fit md:w-fit lg:w-fit w-full"
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                    {/* Components */}
                    <div className="xl:p-6 lg:p-6 md:p-6 p-4 bg-white  shadow-sm rounded-xl">
                        <section>
                            <form>
                                <div className="xl:grid xl:space-y-0 space-y-3 gap-5 mb-6 xl:grid-cols-3">
                                    <div className="col-span-1">
                                        <label
                                            htmlFor="wood_type"
                                            className="block mb-2 text-md font-medium text-gray-900"
                                        >
                                            Loại gỗ
                                        </label>
                                        <Select
                                            placeholder="Chọn loại gỗ"
                                            defaultValue={{
                                                value: "01",
                                                label: "Keo tai tượng - Acacia Magium",
                                            }}
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
                                            placeholder="Nhập mã lô"
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
                                            onChange={(value) => {
                                                setSelectedDryingReason(value);
                                                console.log(
                                                    "Selected Drying Reason:",
                                                    value
                                                );
                                                loadDryingMethodsData(
                                                    value.value
                                                );
                                            }}
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
                                        <AsyncSelect
                                            loadingMessage={() => "Đang tải..."}
                                            ref={(ref) => {
                                                dryingMethodSelectRef = ref;
                                            }}
                                            cacheOptions
                                            isDisabled={isItemsLoading}
                                            defaultOptions={
                                                dryingMethodsOptions
                                            } // Sử dụng options đã load sẵn
                                            placeholder="Chọn quy cách thô"
                                            loadOptions={loadDryingMethods}
                                            onChange={(value) => {
                                                console.log(
                                                    "Selected Drying Method:",
                                                    value
                                                );
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
                                        disabled={createPalletLoading}
                                    >
                                        Thêm vào pallet
                                    </button>
                                    {/* <button
                                        type="button"
                                        onClick={() => {
                                            console.log("Pallet hiện tại đang có: ", quyCachList)
                                        } }
                                        className="text-white bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center active:scale-[.95] active:duration-75 transition-all cursor-pointer disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                        disabled={createPalletLoading}
                                    >
                                        Kiểm tra
                                    </button> */}
                                </div>
                            </form>
                        </section>

                        <div className="my-4 border-b border-gray-200"></div>

                        {/* List */}
                        <div className="my-6 space-y-5">
                            {/* List of Pallet Cards */}
                            <div
                                className={`my-6 space-y-5 ${
                                    createPalletLoading
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                }`}
                            >
                                {isLoading ? (
                                    <div className="text-center">
                                        <Spinner
                                            thickness="7px"
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
                                onClick={onConfirmOpen}
                                className="flex items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl  w-full sm:w-auto px-5 py-2.5 text-center gap-x-2 active:scale-[.95] active:duration-75 transition-all"
                            >
                                <HiPlus className="text-xl" />
                                Tạo pallet
                            </button>
                        </div>
                    </div>

                    {/* Confirm Modal */}
                    <Modal
                        isCentered
                        isOpen={isConfirmOpen}
                        onClose={onConfirmClose}
                        size="xl"
                        blockScrollOnMount={false}
                        closeOnOverlayClick={false}
                    >
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>
                                Bạn chắc chắn muốn thực hiện hành động này?
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <div>
                                        Sau khi xác nhận sẽ không thể thu hồi hành động.
                                    </div>
                                </div>
                            </ModalBody>

                            <ModalFooter>
                                <div className="flex w-full items-center xl:justify-end lg:justify-end md:justify-end  space-x-3">
                                    <button
                                        onClick={() => {
                                            onConfirmClose();
                                        }}
                                        className="bg-gray-300 p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-1/3 disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={createPalletLoading}
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        className="bg-gray-800 p-2 rounded-xl px-4 h-fit font-medium active:scale-[.95]  active:duration-75 transition-all xl:w-fit md:w-fit w-2/3 text-white"
                                        type="button"
                                        onClick={() => {
                                            handleCreatePallet();
                                        }}
                                    >
                                        {createPalletLoading? (
                                            <div className="flex items-center justify-center w-full space-x-4">
                                                <Spinner size="sm" color="white" />
                                                <div>Đang thực hiện</div>
                                            </div>
                                        ) : (
                                            <>
                                                Xác nhận
                                            </>
                                        )}
                                    </button>
                                </div>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>                    
                </div>
            </div>
            {
                loading && <Loader />
            }
        </Layout>
    );
}

export default WoodSorting;
