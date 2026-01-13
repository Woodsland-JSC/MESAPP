import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../layouts/layout";
import { Link } from "react-router-dom";
import PalletCard from "../../../components/PalletCard";
import { HiPlus, HiOutlineSearch, HiOutlineClock } from "react-icons/hi";
import { LuRotateCcw } from "react-icons/lu";
import axios from "axios";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import palletsApi from "../../../api/palletsApi";
import usersApi from "../../../api/userApi";
import toast from "react-hot-toast";
import { Spinner } from "@chakra-ui/react";
import moment from "moment";
import { Avatar } from "@chakra-ui/react";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../../assets/styles/datepicker.css";
import { format, startOfDay, endOfDay, set } from "date-fns";
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
import { BiConfused, BiSolidFactory } from "react-icons/bi";
import { SiConfluence, SiElasticstack, SiKoyeb } from "react-icons/si";
import { TbTrash } from "react-icons/tb";
import LoadedPallet from "../../../components/custom-icon/LoadedPallet";
import { FaRotateLeft } from "react-icons/fa6";
import { HiViewColumns } from "react-icons/hi2";
import { FaCheck, FaCircle } from "react-icons/fa";
import { getIndatesByItem } from "../../../api/MasterDataApi";

function WoodSorting() {
    const { user } = useAppContext();
    const navigate = useNavigate();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isPalletTracingOpen,
        onOpen: onPalletTracingOpen,
        onClose: onPalletTracingClose,
    } = useDisclosure();
    const {
        isOpen: isConfirmOpen,
        onOpen: onConfirmOpen,
        onClose: onConfirmClose,
    } = useDisclosure();
    const {
        isOpen: isDeletePalletConfirmOpen,
        onOpen: onDeletePalletConfirmOpen,
        onClose: onDeletePalletConfirmClose,
    } = useDisclosure();

    // States
    const [loading, setLoading] = useState(false);
    const [createPalletLoading, setCreatePalletLoading] = useState(false);
    const [deletePalletLoading, setDeletePalletLoading] = useState(false);
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
    const [selectedDeletePallet, setSelectedDeletePallet] = useState(null);
    const [palletOptions, setPalletOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
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
    const [selectedStartTime, setSelectedStartTime] = useState(new Date());
    const [selectedEndTime, setSelectedEndTime] = useState(new Date());

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
                            factory: user.plant,
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

    const loadPalletTrackings = async () => {
        try {
            setPalletListLoading(true);
            const response = await axios.get(
                "/api/pallets/get-pallet-trackings",
                {
                    params: {
                        fromDate: format(fromDateTracking, "yyyy-MM-dd"),
                        toDate: format(toDateTracking, "yyyy-MM-dd"),
                    },
                }
            );
            const data = response.data;

            const options = data.map((item) => ({
                value: item.palletID,
                label: item.Code,
            }));
            setPalletOptions(options);
            setPalletListLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Có lỗi trong quá trình load dữ liệu.");
            setPalletListLoading(false);
        }
    }

    // Date picker
    const [startDate, setStartDate] = useState(new Date());
    const [fromDate, setFromDate] = useState(new Date());
    const [fromDateTracking, setFromDateTracking] = useState(new Date());
    const [toDateTracking, setToDateTracking] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const defaultFromDate = startOfDay(fromDate);
    const defaultToDate = endOfDay(toDate);
    const formattedFromDate = format(defaultFromDate, "yyyy-MM-dd HH:mm:ss");
    const formattedToDate = format(defaultToDate, "yyyy-MM-dd HH:mm:ss");

    // Input
    const [batchId, setBatchId] = useState("");
    const [stackingTime, setStackingTime] = useState(0);

    // Validating
    const [selectedWoodType, setSelectedWoodType] = useState(null);
    const [selectedDryingReason, setSelectedDryingReason] = useState(null);
    const [selectedDryingMethod, setSelectedDryingMethod] = useState(null);
    const [selectedBatchInfo, setSelectedBatchInfo] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(false);

    const [palletCards, setPalletCards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isItemsLoading, setIsItemsLoading] = useState(false);
    const [isInvalidQuantity, setIsInvalidQuantity] = useState(false);

    const [palletQuantities, setPalletQuantities] = useState({});

    const [inDates, setInDates] = useState([]);
    const [inDate, setInDate] = useState(null);

    const getEmployee = async () => {
        try {
            const employeeData = await usersApi.getUsersByFactory(user.plant);
            const employeeOptions = employeeData.map((item) => ({
                value: item.id,
                label:
                    item.username +
                    " - " +
                    item.last_name +
                    " " +
                    item.first_name,
            }));
            setEmployeeOptions(employeeOptions);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    useEffect(() => {
        if (fromDateTracking && toDateTracking) {
            // loadPalletCallback();
            loadPalletTrackings();
        }
    }, [fromDateTracking, toDateTracking]);

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

            getEmployee();
            setLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (selectedDryingMethod) getInDateByItemCode();
    }, [selectedDryingMethod])

    const getInDateByItemCode = async () => {
        try {
            setInDate(null);
            console.log('selectedDryingMethod', selectedDryingMethod);

            let res = await getIndatesByItem({
                reason: selectedDryingReason.value,
                itemCode: selectedDryingMethod.code,
                batch: selectedDryingMethod.batchNum
            })

            res = res.sort((a, b) => new Date(b.DocDate) - new Date(a.DocDate));

            let data = [];

            res.forEach(item => {
                data.push({
                    value: moment(item.DocDate).format('yyyy-MM-DD'),
                    label: moment(item.DocDate).format('DD-MM-yyyy'),
                    itemCode: item.ItemCode
                })
            })

            setInDates(data);
        } catch (error) {
            console.log(error);
            toast.error("Có lỗi sảy ra.")
        }
    }

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

    const [BatchNums, setBatchNums] = useState([]);

    useEffect(() => {
        if (selectedDryingReason) {
            loadDryingMethodsData(selectedDryingReason.value);
        }
    }, [selectedDryingReason])

    const loadDryingMethodsData = async (dryingReasonValue) => {
        try {
            setIsItemsLoading(true);
            setBatchNums([]);
            const dryingMethodsData = await palletsApi.getDryingMethod(
                dryingReasonValue
            );

            const resData = dryingMethodsData.map(item => ({ ...item }));

            setBatchNums(resData);

            let data = [];

            dryingMethodsData.forEach(item => {
                let batchSplit = item.BatchNum.split('_');

                if (!data.some(d => d.BatchNum.split('_')[0] == batchSplit[0])) {
                    let currentName = item.ItemName.split('-');
                    item.ItemName = batchSplit[0] + " - " + currentName[1];
                    item.BatchNum = batchSplit[0]
                    data.push(item);
                }
            })



            const options = data.map((item) => ({
                value: `${item.ItemCode}-${item.BatchNum}`,
                label: item.ItemName,
                batchNum: item.BatchNum,
                code: item.ItemCode
            }));

            setDryingMethodsOptions(options);
            setIsItemsLoading(false);
        } catch (error) {
            console.error("Error fetching drying methods:", error);
            toast.error(
                "Không thể lấy dữ liệu quy cách thô. " +
                error?.response?.data?.message
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
        if (!inDate) {
            toast.error("Ngày nhập gỗ không được bỏ trống");
            return false;
        }
        if (!stackingTime || stackingTime.trim() === "") {
            toast.error("Thời gian thực hiện không được bỏ trống");
            return false;
        }
        if (stackingTime <= 0) {
            toast.error("Thời gian thực hiện phải lớn hơn 0");
            return false;
        }
        if (!selectedEmployee) {
            toast.error("Nhân viên xếp sấy không được bỏ trống");
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
                    startDate: inDate.value,
                };
                console.log("1. Dữ liệu từ form:", data);


                const date = new Date(inDate.value);
                const yy = String(date.getFullYear()).slice(2);
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const ymd = `${yy}${mm}${dd}`;

                const batch = selectedDryingMethod.batchNum + '_' + ymd;

                let find = BatchNums.find(item => item.BatchNum == batch);
                console.log("batch", batch);
                console.log("BatchNums", BatchNums);
                console.log("BatchNums", BatchNums.filter(item => item.BatchNum == batch));


                const response = await palletsApi.getStockByItem(
                    // selectedDryingMethod.code,
                    inDate.itemCode,
                    selectedDryingReason.value,
                    find ? batch : selectedDryingMethod.batchNum
                );

                console.log("2. Thông tin api trả về:", response);

                if (response && response.length > 0) {
                    response.map((item, index) => {
                        const quyCach = `${Number(item.CDay)}x${Number(
                            item.CRong
                        )}x${Number(item.CDai)}`;
                        const existingQuyCach = quyCachList.find(
                            (item) => item.key === quyCach
                        );

                        if (existingQuyCach) {
                            // Nếu đã tồn tại quy cách, kiểm tra BatchNum
                            if (
                                existingQuyCach.batchNums.includes(
                                    item.BatchNum
                                )
                            ) {
                                toast.error(
                                    "Quy cách đã tồn tại trong pallet."
                                );
                                return;
                            } else {
                                // Nếu chưa có BatchNum, thêm vào danh sách
                                existingQuyCach.batchNums.push(item.BatchNum);
                                console.log(
                                    "BatchNum mới đã được thêm vào quy cách:",
                                    quyCach
                                );
                            }
                        } else {
                            // Nếu chưa có quy cách, thêm quy cách mới với BatchNum
                            if (quyCachList.length >= 2) {
                                toast.error(
                                    "Một pallet chỉ chứa tối đa 2 quy cách."
                                );
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
                                itemCode={inDate.itemCode}
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
                                        `${Number(item.CDay)}x${Number(
                                            item.CRong
                                        )}x${Number(item.CDai)}`,
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
                    const batchNums = item.batchNums.filter(
                        (bn) => bn !== batchNum
                    );
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
        const formatTime = (date) => {
            if (!date) return null;
            return new Date(date).toTimeString().slice(0, 8);
        };

        const palletObject = {
            LoaiGo: selectedWoodType.value,
            MaLo: batchId,
            LyDo: selectedDryingReason.value,
            NgayNhap: inDate.value + ' 00:00:00',
            MaNhaMay: user?.plant,
            stackingTime: stackingTime,
            employee: selectedEmployee.value,
            Details: palletCards.map((card) => ({
                ItemCode: card.props.itemCode,
                ItemName: card.props.itemName,
                WhsCode: card.props.whsCode,
                BatchNum: card.props.batchNum,
                Qty: parseInt(palletQuantities[card.key]),
                CDai: formatNumber(card.props.height),
                CDay: formatNumber(card.props.thickness),
                CRong: formatNumber(card.props.width),
                QuyCach: `${formatNumber(card.props.thickness)}x${formatNumber(
                    card.props.width
                )}x${formatNumber(card.props.height)}`,
                qtyM3: palletQuantities[card.key]
            })),
        };
        return palletObject;
    };

    let woodTypeSelectRef = null;
    let dryingReasonSelectRef = null;
    let dryingMethodSelectRef = null;

    const handleCreatePallet = async () => {
        if (palletCards.length === 0) {
            toast.error("Gỗ chưa được chất lên pallet.");
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
                (quantity > Math.floor((inStock * 1000000000) / (height * width * thickness)) ||
                    quantity === 0 ||
                    quantity < 0 ||
                    quantity == "" ||
                    quantity == null)
            ) {
                hasInvalidQuantity = true;
                break;
            }

            if (selectedDryingReason.value === "SL" && (quantity > (height == 0 ? inStock : Math.floor(inStock * 1000000000 / (height * width * thickness))) ||
                quantity === 0 ||
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
                setInDate(null);
                setCreatePalletLoading(false);
                setQuyCachList([]);
                setBatchId("");
                setStackingTime(0);
                setStartDate(new Date());
                setPalletCards([]);
                setPalletQuantities({});
                getEmployee();
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
                        const qty = Number(item.Qty_T) || 0;
                        updatedResult.totalQty_T += qty;

                        const key = `${item.ItemName}_${Math.floor(
                            item.CDay
                        )}x${Math.floor(item.CRong)}x${Math.floor(item.CDai)}`;
                        if (itemInfo[key]) {
                            itemInfo[key].Qty_T += qty;
                        } else {
                            itemInfo[key] = {
                                ItemName: item.ItemName,
                                Qty_T: qty,
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

    // Delete pallet
    const handleDeletePallet = async () => {
        setDeletePalletLoading(true);

        if (selectedDeletePallet === null) {
            toast.error("Xin hãy chọn một pallet");
            setDeletePalletLoading(false);
            onDeletePalletConfirmClose();
            return;
        } else if (selectedDeletePallet.activeStatus == 1) {
            toast.error("Pallet này đã vào lò, không thể phân rã.");
            setDeletePalletLoading(false);
            onDeletePalletConfirmClose();
            return;
        }

        const deleteData = {
            palletID: selectedDeletePallet.pallet_id,
        };

        try {
            const res = await palletsApi.dismantlePallet(deleteData);
            toast.success("Phân rã pallet thành công.");
            handleSearch();
            setDeletePalletLoading(false);
            onDeletePalletConfirmClose();
            setSelectedDeletePallet(null);
        } catch (error) {
            console.error("Error deleting pallet:", error);
            toast.error("Không thể phân rã pallet, hãy thử lại sau.");
            setDeletePalletLoading(false);
            onDeletePalletConfirmClose();
        }
    };

    const handleResetPalletHistory = () => {
        setPalletHistory([]);
    };

    return (
        <Layout>
            {/* Container */}
            <div className="flex mb-4 xl:mb-0 justify-center bg-transparent">
                {/* Section */}
                <div className="w-screen px-4 xl:p-12 lg:p-12 md:p-12 p-4 xl:pt-4 lg:pt-4 md:pt-4 pt-2 xl:px-32">
                    {/* Go back */}
                    <div className="flex items-top justify-between">
                        <div
                            className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-1 text-sm font-medium text-[#17506B]"
                            onClick={() => navigate(-1)}
                        >
                            <IoIosArrowBack />
                            <div>Quay lại</div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between xl:mb-3 lg:mb-3 md:mb-3 mb-0 items-center">
                        <div className="flex space-x-4">
                            <div className="serif text-4xl font-bold">
                                Tạo pallet xếp sấy
                            </div>
                        </div>

                        <div className="flex gap-x-2 ">
                            <button
                                className="bg-gradient-to-r from-[#201527] to-[#350750]  font-medium rounded-xl p-2.5 px-4 text-white xl:flex items-center md:flex hidden active:scale-[.95] active:duration-75 transition-all disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                                onClick={onOpen}
                                disabled={createPalletLoading}
                            >
                                <HiOutlineClock className="text-xl mr-2" />
                                Xem lịch sử
                            </button>

                            <button
                                className="bg-gradient-to-r from-[#1e2737] to-[#072450] font-medium rounded-xl p-2.5 px-4 text-white xl:flex items-center md:flex hidden active:scale-[.95] active:duration-75 transition-all disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
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
                            className="bg-gradient-to-r from-[#201527] to-[#350750] font-medium rounded-xl p-2.5 px-4 pr-7 my-4 text-white  flex w-full justify-center items-center active:scale-[.95] active:duration-75 transition-all disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
                            onClick={onOpen}
                            disabled={createPalletLoading}
                        >
                            <HiOutlineClock className="text-xl mr-2" />
                            Xem lịch sử
                        </button>
                        <button
                            className="bg-gradient-to-r from-[#1e2737] to-[#072450] font-medium rounded-xl p-2.5 px-4 pr-7 my-4 text-white items-center  flex w-full justify-center active:scale-[.95] active:duration-75 transition-all disabled:bg-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none"
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
                            <ModalHeader className="!py-2.5 flex space-x-3 items-center !pl-4">
                                <HiOutlineClock className="text-3xl text-gray-400 ml-0 pl-0" />
                                <div className="serif font-bold text-[28px] ">
                                    Lịch sử xếp pallet
                                </div>
                            </ModalHeader>
                            <ModalBody className="!p-3.5 !pt-1">
                                {/* User Information */}
                                <div className=" mb-2 xl:w-full flex items-center space-x-2">
                                    <div className="text-sm ">Tạo bởi: </div>
                                    <div className="text-[15px] flex items-center gap-x-2">
                                        <div className="flex gap-x-3 rounded-full p-1.5 px-3 pl-[6px] bg-blue-100 text-[#17506B]">
                                            <img
                                                src={
                                                    user?.avatar
                                                        ? user.avatar
                                                        : defaultUser
                                                }
                                                alt="user"
                                                className="w-5 h-5 rounded-full object-cover"
                                            ></img>
                                            <div className="font-semibold text-sm">
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

                                {/* Controller */}
                                <div className="w-full xl:flex lg:flex md:flex xl:space-x-3 md:space-x-3 lg:space-x-3 xl:space-y-0 lg:space-y-0 md:space-y-0 space-y-4 items-end bg-gray-100 border border-gray-300 p-4 rounded-xl">
                                    <div className="xl:grid lg:grid md:grid xl:space-y-0 lg:space-y-0 md:space-y-0 space-y-3 grid-cols-2 w-full gap-x-4">
                                        <div className="col-span-1">
                                            <label
                                                htmlFor="indate"
                                                className="block mb-1 text-[14px] font-medium text-gray-900 "
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
                                                className="block mb-1 text-[14px]  font-medium text-gray-900 "
                                            >
                                                Đến ngày
                                            </label>
                                            { }
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

                                {/* Search Bar */}
                                {palletHistory.length !== 0 && (
                                    <div className=" mt-4 xl:w-full flex items-center space-x-2">
                                        <div className="w-full">
                                            <label
                                                htmlFor="search"
                                                className="mb-2 font-medium text-gray-900 sr-only"
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
                                                    className="block w-full p-2.5 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Tìm kiếm mã pallet"
                                                    onChange={(e) =>
                                                        setSearchTerm(
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <button
                                            className="p-3 rounded-lg bg-gray-200 hover:bg-gray-300 active:scale-[.92] h-fit active:duration-75 transition-all"
                                            onClick={handleResetPalletHistory}
                                        >
                                            <FaRotateLeft className=" w-5 h-5" />
                                        </button>
                                    </div>
                                )}

                                {/* Data */}
                                <div className="w-full mt-4">
                                    {palletHistory.length !== 0 && (
                                        <div className="mb-2 text-gray-600">
                                            Có tất cả{" "}
                                            <b>{palletHistory.length}</b> kết
                                            quả.
                                        </div>
                                    )}
                                    {palletHistoryLoading ? (
                                        <div className="mt-32 text-center">
                                            <Spinner
                                                thickness="8px"
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
                                                    `${pallet.thickness} ${pallet.width
                                                        } ${pallet.length} ${pallet.pallet_code
                                                        } ${pallet.sum_quantity
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
                                                .map((pallet, index) => (
                                                    <div className="relative border-gray-300 bg-gray-100 max-h-[14rem]  border-2 rounded-xl">
                                                        <div
                                                            className="absolute -right-2 -top-3 hover:cursor-pointer p-1.5 bg-black duration-200 ease hover:bg-red-600 rounded-full active:scale-[.95]  active:duration-75  transition-all"
                                                            onClick={() => {
                                                                setSelectedDeletePallet(
                                                                    pallet
                                                                );
                                                                onDeletePalletConfirmOpen();
                                                            }}
                                                        >
                                                            <TbTrash className="text-3xl text-white" />
                                                        </div>
                                                        <div className="p-2 pb-0">
                                                            <div className="flex items-center space-x-3 rounded-lg w-full px-3 py-2  text-[#155979] bg-[#E0E1E3]">
                                                                {pallet.activeStatus ==
                                                                    "1" ? (
                                                                    <LoadedPallet className="text-xl text-[#4d4d4d]" />
                                                                ) : (
                                                                    <SiElasticstack className="text-xl text-[#4d4d4d]" />
                                                                )}

                                                                <span className="text-xl font-semibold black">
                                                                    {
                                                                        pallet.pallet_code
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="p-4 pt-2 space-y-1">
                                                            <div className="text-md font-semibold">
                                                                Quy cách:{" "}
                                                                <span>
                                                                    {
                                                                        pallet.QuyCach
                                                                    }
                                                                </span>
                                                            </div>
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
                                        <div className="h-full my-32 flex flex-col items-center justify-center text-center">
                                            <BiConfused className="text-center text-gray-400 w-12 h-12 mb-2" />
                                            <div className="text-lg text-gray-400">
                                                Không tìm thấy dữ liệu để hiển
                                                thị.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ModalBody>
                            <ModalFooter className="!py-3 border-t shadow-md border-gray-300">
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

                    {/* Delete Pallet Confirmation Modal */}
                    <Modal
                        isCentered
                        isOpen={isDeletePalletConfirmOpen}
                        onClose={onDeletePalletConfirmClose}
                        size="xl"
                        blockScrollOnMount={false}
                        closeOnOverlayClick={false}
                    >
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>
                                Bạn chắc chắn muốn phân rã pallet này?
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <div>
                                        Sau khi xác nhận sẽ không thể thu hồi
                                        hành động.
                                    </div>
                                </div>
                            </ModalBody>

                            <ModalFooter>
                                <div className="flex w-full items-center xl:justify-end lg:justify-end md:justify-end  space-x-3">
                                    <button
                                        onClick={() => {
                                            onDeletePalletConfirmClose();
                                        }}
                                        className="bg-gray-300 p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-1/3 disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={deletePalletLoading}
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        className={`bg-gray-800 p-2 rounded-xl px-4 h-fit font-medium active:scale-[.95]  active:duration-75 transition-all xl:w-fit md:w-fit w-2/3 text-white ${deletePalletLoading
                                            ? "opacity-100 cursor-not-allowed"
                                            : ""
                                            }`}
                                        type="button"
                                        onClick={() => {
                                            handleDeletePallet();
                                        }}
                                        disabled={deletePalletLoading}
                                    >
                                        {deletePalletLoading ? (
                                            <div className="flex items-center justify-center w-full space-x-4">
                                                <Spinner
                                                    size="sm"
                                                    color="white"
                                                />
                                                <div>Đang thực hiện</div>
                                            </div>
                                        ) : (
                                            <>Xác nhận</>
                                        )}
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
                            <ModalHeader className="!py-2 flex space-x-3 items-center !pl-4">
                                <HiOutlineSearch className="text-3xl text-gray-400 ml-0 pl-0" />
                                <div className="serif text-[28px] font-bold">
                                    Truy nguyên pallet
                                </div>
                            </ModalHeader>
                            <ModalBody className="!p-3.5 !pt-1">
                                {/* Filter Section */}
                                <div className=" mt-1  mb-4 xl:w-full">
                                    <div className="items-center gap-x-2 bg-gray-100 p-4 border border-gray-300 rounded-xl">
                                        <div className="xl:flex lg:flex md:flex items-end sm:block w-full gap-x-3 ">
                                            {/* Select Filter */}
                                            <div className="w-full xl:grid lg:grid md:grid grid-cols-4 xl:space-y-0 lg:space-y-0 md:space-y-0 space-y-2 gap-x-3">
                                                <div className="col-span-1">
                                                    <label
                                                        htmlFor="indate"
                                                        className="block mb-1 text-[14px] font-medium text-gray-900 "
                                                    >
                                                        Từ ngày
                                                    </label>
                                                    <DatePicker
                                                        selected={fromDateTracking}
                                                        onChange={(date) =>
                                                            setFromDateTracking(date)
                                                        }
                                                        className=" pl-3 border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <label
                                                        htmlFor="indate"
                                                        className="block mb-1 text-[14px] font-medium text-gray-900 "
                                                    >
                                                        Đến ngày
                                                    </label>
                                                    <DatePicker
                                                        selected={toDateTracking}
                                                        onChange={(date) =>
                                                            setToDateTracking(date)
                                                        }
                                                        className=" pl-3 border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label
                                                        htmlFor="indate"
                                                        className="block mb-1 text-[14px]  font-medium text-gray-900 "
                                                    >
                                                        Chọn pallet
                                                    </label>
                                                    <Select
                                                        placeholder="Chọn pallet"
                                                        // id="pallet"
                                                        defaultOptions
                                                        options={palletOptions}
                                                        isDisabled={
                                                            palletListLoading
                                                        }
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
                                                className="xl:mt-0 lg:mt-0 md:mt-0  max-w-md bg-[#155979] p-2 rounded-xl xl:w-[20%] lg:w-[20%] md:w-[20%] text-[17px] sm:w-[20%] w-full text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all mt-3"
                                                onClick={handleCheckPallet}
                                            >
                                                Kiểm tra
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {palletTracingLoading ? (
                                    <div className="text-center mt-32">
                                        <Spinner
                                            thickness="8px"
                                            speed="0.65s"
                                            emptyColor="gray.200"
                                            color="#155979"
                                            size="xl"
                                        />
                                    </div>
                                ) : palletTracingData.Code ? (
                                    <>
                                        {/* Result */}
                                        <div className="mb-2 text-gray-600">
                                            Kết quả tra cứu:
                                        </div>

                                        <div className="border-2 border-gray-200 rounded-xl">
                                            <div className="  p-4 py-2 pt-3.5">
                                                <div className="w-full flex items-center justify-between uppercase">
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500">
                                                            Mã pallet:{" "}
                                                        </p>
                                                        <p className="font-semibold text-[#155979] text-2xl">
                                                            {
                                                                palletTracingData.Code
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="font-semibold p-1 px-3.5 text-blue-600 bg-blue-100 w-fit rounded-full">
                                                        {palletTracingData.LyDo}
                                                    </div>
                                                </div>
                                                <div className="mt-2.5 space-y-1 text-gray-600">
                                                    <div>
                                                        <p>
                                                            Loại gỗ:{" "}
                                                            <span className="font-semibold">
                                                                {
                                                                    palletTracingData
                                                                        .LoaiGo
                                                                        .Name
                                                                }
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p>
                                                            Mã lô:{" "}
                                                            <span className="font-semibold">
                                                                {
                                                                    palletTracingData.MaLo
                                                                }
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <hr className=" mt-1 border border-gray-200"></hr>
                                            <div className="bg-gray-50 p-2.5">
                                                <div className="flex items-center justify-between">
                                                    <p className="uppercase text-[15px] mb-2 font-semibold text-gray-700">
                                                        Thành phần{" "}
                                                        <span className="text-blue-600">
                                                            (
                                                            {result.data.length}
                                                            )
                                                        </span>
                                                    </p>
                                                    <p className="uppercase text-[15px] mb-2 font-semibold text-gray-700">
                                                        Tổng:{" "}
                                                        {result.totalQty_T || 0}{" "}
                                                        (T)
                                                    </p>
                                                </div>

                                                {/*  */}
                                                <div className="p-3 rounded-xl bg-white border-2 space-y-3 border-gray-200">
                                                    {result.data.map(
                                                        (item, index) => (
                                                            <div className="p-3 flex space-x-4 rounded-lg bg-[#edeeff] border">
                                                                <div className="p-2 bg-[#c3c8fc] rounded-lg w-fit h-fit ">
                                                                    <HiViewColumns className="w-8 h-8 text-gray-700" />
                                                                </div>
                                                                <div className="">
                                                                    <div className="font-medium xl:mb-0 mb-2">
                                                                        {
                                                                            item.ItemName
                                                                        }
                                                                    </div>
                                                                    <div className="text-[15px] xl:flex lg:flex md:flex xl:space-x-8">
                                                                        <div className="text-gray-600">
                                                                            Quy
                                                                            cách:{" "}
                                                                            <span className="font-medium">
                                                                                {
                                                                                    item.QuyCach
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <div className=" text-gray-600">
                                                                            <div className=" ">
                                                                                Số
                                                                                lượng:{" "}
                                                                                <span className="font-medium">
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
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                <p className="uppercase text-[15px] mt-5 mb-2 font-semibold text-gray-700">
                                                    Nhật ký hoạt động{" "}
                                                </p>
                                                {/* History Tracing */}
                                                <div className="my-4 mb-0 mt-2 p-4 pb-0 bg-white border-2 border-gray-200 rounded-xl">
                                                    <ol className="space-y-2 divide-y divide-gray-200">
                                                        <li className="">
                                                            <div>
                                                                <div className="p-0.5 px-3 text-sm bg-blue-100 rounded-full  text-blue-600 w-fit">
                                                                    Tạo pallet
                                                                    xếp sấy
                                                                </div>
                                                                <div className="flex space-x-4 mt-3">
                                                                    <Avatar
                                                                        name={
                                                                            palletTracingData.CreateBy
                                                                        }
                                                                        src="https://bit.ly/tioluwani-kolawole"
                                                                        size={
                                                                            "sm"
                                                                        }
                                                                    />
                                                                    <div>
                                                                        <p>
                                                                            <span className="font-medium">
                                                                                {
                                                                                    palletTracingData.CreateBy
                                                                                }
                                                                            </span>{" "}
                                                                            đã
                                                                            tạo
                                                                            pallet.
                                                                        </p>
                                                                        <p className="text-gray-500">
                                                                            {
                                                                                palletTracingData.ngaytao
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                        {palletTracingData.LoadedIntoKilnDate && (
                                                            <li className="py-4">
                                                                <div>
                                                                    <div className="p-0.5 px-3 text-sm bg-violet-100 rounded-full  text-violet-600 w-fit">
                                                                        Vào lò
                                                                    </div>
                                                                    <div className="flex space-x-4 mt-3">
                                                                        <Avatar
                                                                            name={
                                                                                palletTracingData.LoadedBy
                                                                            }
                                                                            src="https://bit.ly/tioluwani-kolawole"
                                                                            size={
                                                                                "sm"
                                                                            }
                                                                        />
                                                                        <div>
                                                                            <p>
                                                                                <span className="font-medium">
                                                                                    {
                                                                                        palletTracingData.LoadedBy
                                                                                    }
                                                                                </span>{" "}
                                                                                đã
                                                                                cho
                                                                                pallet
                                                                                vào
                                                                                lò.
                                                                            </p>
                                                                            <p className="text-gray-500">
                                                                                {
                                                                                    palletTracingData.LoadedIntoKilnDate
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        )}
                                                        {palletTracingData.runDate && (
                                                            <li className="py-4">
                                                                <div>
                                                                    <div className="p-0.5 px-3 text-sm bg-red-100 rounded-full  text-red-600 w-fit">
                                                                        Chạy lò
                                                                        sấy
                                                                    </div>
                                                                    <div className="flex space-x-4 mt-3">
                                                                        <Avatar
                                                                            name={
                                                                                palletTracingData.RunBy
                                                                            }
                                                                            src="https://bit.ly/tioluwani-kolawole"
                                                                            size={
                                                                                "sm"
                                                                            }
                                                                        />
                                                                        <div>
                                                                            <p>
                                                                                <span className="font-medium">
                                                                                    {
                                                                                        palletTracingData.RunBy
                                                                                    }
                                                                                </span>{" "}
                                                                                đã
                                                                                bắt
                                                                                đầu
                                                                                sấy
                                                                                pallet.
                                                                            </p>
                                                                            <p className="text-gray-500">
                                                                                {
                                                                                    palletTracingData.runDate
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        )}
                                                        {palletTracingData.CompleteDate && (
                                                            <li className="pt-4">
                                                                <div>
                                                                    <div className="p-0.5 px-3 text-sm bg-green-100 rounded-full  text-green-600 w-fit">
                                                                        Ra lò
                                                                    </div>
                                                                    <div className="flex space-x-4 mt-3">
                                                                        <Avatar
                                                                            name={
                                                                                palletTracingData.CompletedBy
                                                                            }
                                                                            src="https://bit.ly/tioluwani-kolawole"
                                                                            size={
                                                                                "sm"
                                                                            }
                                                                        />
                                                                        <div>
                                                                            <p>
                                                                                <span className="font-medium">
                                                                                    {
                                                                                        palletTracingData.CompletedBy
                                                                                    }
                                                                                </span>{" "}
                                                                                đã
                                                                                cho
                                                                                pallet
                                                                                ra
                                                                                lò.
                                                                            </p>
                                                                            <p className="text-gray-500">
                                                                                {
                                                                                    palletTracingData.CompletedDate
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        )}
                                                    </ol>
                                                    <div></div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full my-32 flex flex-col items-center justify-center text-center">
                                        <BiConfused className="text-center text-gray-400 w-12 h-12 mb-2" />
                                        <div className="text-lg text-gray-400">
                                            Không tìm thấy dữ liệu để hiển thị.
                                        </div>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter className="!py-3 border-t shadow-md border-gray-300">
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
                                <div className="xl:grid xl:space-y-0 space-y-4 gap-5 mb-6 xl:grid-cols-3">
                                    <div className="col-span-1">
                                        <label
                                            htmlFor="wood_type"
                                            className="block mb-1 text-md font-medium text-gray-900"
                                        >
                                            Loại gỗ{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
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
                                            className="block mb-1 text-md font-medium text-gray-900"
                                        >
                                            Mã lô gỗ{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            id="batch_id"
                                            value={batchId}
                                            placeholder="Nhập mã lô"
                                            onChange={(e) =>
                                                setBatchId(e.target.value)
                                            }
                                            className=" border border-gray-300 text-gray-900 pl-3  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label
                                            htmlFor="drying_reason"
                                            className="block mb-1 text-md font-medium text-gray-900 "
                                        >
                                            Mục đích sấy{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <Select
                                            ref={(ref) => {
                                                dryingReasonSelectRef = ref;
                                            }}
                                            placeholder="Chọn mục đích sấy"
                                            options={dryingReasons}
                                            onChange={(value) => {
                                                setSelectedDryingReason(value);
                                                // loadDryingMethodsData(
                                                //     value.value
                                                // );
                                            }}
                                            isDisabled={palletCards.length > 0}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label
                                            htmlFor="drying_method"
                                            className="block mb-1 text-md font-medium text-gray-900 "
                                        >
                                            Quy cách thô{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
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
                                                setSelectedDryingMethod(value);
                                            }}
                                        />
                                    </div>

                                    <div className="col-span-1">
                                        <label
                                            htmlFor="indate"
                                            className="block mb-1 text-md font-medium text-gray-900 "
                                        >
                                            Ngày nhập gỗ{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <Select
                                            placeholder="Chọn ngày nhập gỗ"
                                            options={inDates}
                                            value={inDate}
                                            onChange={(value) => {
                                                setInDate(value);
                                            }}
                                            isDisabled={!selectedDryingMethod}
                                        />
                                    </div>

                                    {/* Update */}
                                    <div className="col-span-1">
                                        <label
                                            htmlFor="drying_reason"
                                            className="block mb-1 text-md font-medium text-gray-900 "
                                        >
                                            Thời gian thực hiện (phút){" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            onWheel={(e) => e.target.blur()}
                                            value={stackingTime}
                                            placeholder="Nhập tổng thời gian "
                                            onChange={(e) =>
                                                setStackingTime(e.target.value)
                                            }
                                            className=" border border-gray-300 text-gray-900 pl-3 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label
                                            htmlFor="drying_reason"
                                            className="block mb-1 text-md font-medium text-gray-900 "
                                        >
                                            Nhân viên xếp sấy{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <Select
                                            placeholder="Chọn nhân viên xếp sấy"
                                            options={employeeOptions}
                                            onChange={(value) => {
                                                setSelectedEmployee(value);
                                            }}
                                            isDisabled={palletCards.length > 0}
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
                                </div>
                            </form>
                        </section>

                        <div className="my-4 border-b border-gray-200"></div>

                        {/* List */}
                        <div className="my-6 space-y-5">
                            {/* List of Pallet Cards */}
                            <div
                                className={`my-6 space-y-5 ${createPalletLoading
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
                                        Sau khi xác nhận sẽ không thể thu hồi
                                        hành động.
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
                                        className={`bg-gray-800 p-2 rounded-xl px-4 h-fit font-medium active:scale-[.95]  active:duration-75 transition-all xl:w-fit md:w-fit w-2/3 text-white ${createPalletLoading
                                            ? "cursor-not-allowed opacity-100"
                                            : ""
                                            }`}
                                        type="button"
                                        onClick={() => {
                                            handleCreatePallet();
                                        }}
                                        disabled={createPalletLoading}
                                    >
                                        {createPalletLoading ? (
                                            <div className="flex items-center justify-center w-full space-x-4 ">
                                                <Spinner
                                                    size="sm"
                                                    color="white"
                                                />
                                                <div>Đang thực hiện</div>
                                            </div>
                                        ) : (
                                            <>Xác nhận</>
                                        )}
                                    </button>
                                </div>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </div>
            </div>
            {loading && <Loader />}
        </Layout>
    );
}

export default WoodSorting;
