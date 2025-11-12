import { useNavigate } from "react-router-dom";
import Layout from "../../../layouts/layout";
import { IoIosArrowDown, IoMdArrowRoundBack } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import useAppContext from "../../../store/AppContext";
import Select from 'react-select';
import usersApi from "../../../api/userApi";
import { NOI_DIA, TU_BEP, VAN_CONG_NGHIEP } from "../../../shared/data";
import toast from "react-hot-toast";
import productionApi from "../../../api/productionApi";
import { formatNumber } from "../../../utils/numberFormat";
import { BiConfused, BiSolidBadgeCheck } from "react-icons/bi";
import { getFactoryUTub, getTeamUTub } from "../../../api/MasterDataApi";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    AlertDialogCloseButton,
    Alert,
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
    Radio,
    RadioGroup,
    Spinner,
    useDisclosure,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuDivider,
} from "@chakra-ui/react";
import { FaBox, FaCircleRight, FaClock, FaDiceD6, FaInstalod } from "react-icons/fa6";
import { MdDangerous } from "react-icons/md";
import { FaExclamationCircle } from "react-icons/fa";
import { TbPlayerTrackNextFilled, TbTrash } from "react-icons/tb";
import { acceptReceiptTB, sanLuongTB, viewDetail } from "../../../api/tb.api";
import Loading from '../../../components/loading/Loading';
import { HiMiniBellAlert } from "react-icons/hi2";
import AwaitingReception from "../../../components/AwaitingReception";
import moment from "moment";

const TuBep = () => {
    const { user } = useAppContext();

    const navigate = useNavigate();

    const groupSelectRef = useRef();
    const factorySelectRef = useRef();

    const [khoi, setKhoi] = useState(TU_BEP)
    const [factories, setFactories] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [groupListOptions, setGroupListOptions] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState([]);
    const [groupList, setGroupList] = useState([]);
    const [amount, setAmount] = useState("");
    const [isItemCodeDetech, setIsItemCodeDetech] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [packagedAmount, setPackagedAmount] = useState("");
    const [isQualityCheck, setIsQualityCheck] = useState(false);

    const [loadingData, setLoadingData] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedItemDetails, setSelectedItemDetails] = useState(null);
    const [selectedFaultItem, setSelectedFaultItem] = useState({
        ItemCode: "",
        ItemName: "",
        SubItemCode: "",
        SubItemName: "",
        SubItemBaseQty: "",
        OnHand: "",
    });
    const [faultyAmount, setFaultyAmount] = useState();
    const [faults, setFaults] = useState({});
    const [choosenItem, setChoosenItem] = useState(null);
    const [awaitingReception, setAwaitingReception] = useState([]);
    const [lsxSelected, setLsxSelected] = useState({
        lsx: null,
        itemTB: null,
        itemDetail: null
    });

    const {
        isOpen: isModalOpen,
        onOpen: onModalOpen,
        onClose: onModalClose,
    } = useDisclosure();

    const {
        isOpen: isModalNotiOpen,
        onOpen: onModalNotiOpen,
        onClose: onModalNotiClose,
    } = useDisclosure();

    const {
        isOpen: isAlertDialogOpen,
        onOpen: onAlertDialogOpen,
        onClose: onAlertDialogClose,
    } = useDisclosure();

    const getDataTB = async () => {
        try {
            setLoadingData(true);
            const res = await sanLuongTB({
                TO: selectedGroup.value
            });

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
            setLoadingData(false);
        } catch (error) {
            setLoadingData(false);
            toast.error("Có lỗi trong quá trình lấy dữ liệu.");
        }
    };

    const viewProductionsDetails = async (itemTB, itemDetail, lsx) => {
        console.log("itemTB", itemTB);

        setLsxSelected({
            lsx,
            itemDetail,
            itemTB
        });

        loadItemByLSX(itemTB, itemDetail, lsx);
    };

    const loadItemByLSX = async (itemTB, itemDetail, lsx) => {
        try {
            setLoading(true);
            const params = {
                SPDICH: itemTB.SPDICH,
                ItemCode: itemDetail.ItemChild,
                TO: itemDetail.TO,
                Version: itemDetail.Version,
                ProdType: itemDetail.ProdType,
                LSX: lsx
            };

            let res = await viewDetail(params);
            console.log("res", res);

            setSelectedItemDetails({
                ...itemDetail,
                ItemInfo: res.ItemInfo,
                stockQuantity: res.maxQuantity,
                remainQty: res.remainQty,
                CongDoan: res.CongDoan,
                ProdType: res.ProdType,
                SubItemWhs: res.SubItemWhs,
                factories: res.Factorys?.filter(
                    (item) => item.Factory !== user.plant
                ).map((item) => ({
                    value: item.Factory,
                    label: item.FactoryName,
                })),
                notifications: res.notifications,
                stocks: res.stocks,
                maxQty: res.maxQty,
                WaitingConfirmQty: res.WaitingConfirmQty,
                WaitingQCItemQty: res.WaitingQCItemQty,
                returnedData: res.returnData
            });
            onModalOpen();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            toast.error(
                error.response?.data?.error ||
                "Có lỗi khi lấy dữ liệu item."
            );
        }
    };

    const clearData = () => {
        setSelectedItemDetails(null);
        setLsxSelected({
            lsx: null,
            itemDetail: null,
            itemTB: null
        });

        setIsItemCodeDetech(false);
        setConfirmLoading(false);
        setFaults({});
        setAmount();
        setFaultyAmount();
        onAlertDialogClose();
        onModalClose();
    }

    const handleSubmitQuantity = async () => {
        console.log("selectedItemDetails", selectedItemDetails);
        console.log("lsxselected", lsxSelected);
        console.log("selectedFaultItem", selectedFaultItem);

        if (amount < 0) {
            toast.error("Số lượng ghi nhận phải lớn hơn 0");
            onAlertDialogClose();
            return;
        }

        if (amount > selectedItemDetails.maxQty) {
            toast.error("Đã vượt quá số lượng tối đa có thể xuất");
            onAlertDialogClose();
            return;
        }

        if (amount > selectedItemDetails.remainQty - selectedItemDetails.WaitingConfirmQty) {
            toast.error(
                <span>
                    Số lượng ghi nhận (
                    <span style={{ fontWeight: "bold" }}>{amount}</span>) đã
                    vượt quá số lượng còn lại phải sản xuất (
                    <span style={{ fontWeight: "bold" }}>
                        {selectedItemDetails.remainQty -
                            selectedItemDetails.WaitingConfirmQty}
                    </span>
                    )
                </span>
            );
            onAlertDialogClose();
            return;
        }

        if (faultyAmount < 0) {
            toast.error("Số lượng lỗi phải lớn hơn 0");
            onAlertDialogClose();
            return;
        }

        if (faultyAmount > selectedItemDetails.maxQty) {
            toast.error("Đã vượt quá số lượng lỗi có thể ghi nhận");
            onAlertDialogClose();
            return;
        }

        if (selectedFaultItem.SubItemCode === "" && selectedFaultItem.ItemCode === "" && faultyAmount) {
            toast.error("Vui lòng chọn sản phẩm cần ghi nhận lỗi");
            onAlertDialogClose();
            return;
        }

        if (selectedFaultItem.ItemCode !== "" && parseInt(faultyAmount) + parseInt(amount) > parseInt(selectedItemDetails.maxQty)) {
            toast.error(
                <span>
                    Tổng số lượng ghi nhận (
                    <span style={{ fontWeight: "bold" }}>
                        {parseInt(faultyAmount) + parseInt(amount)}
                    </span>
                    ) đã vượt quá số lượng tối đa có thể xuất (
                    <span style={{ fontWeight: "bold" }}>
                        {selectedItemDetails.maxQty}
                    </span>
                    )
                </span>
            );
            return;
        }
        const Data = isItemCodeDetech
            ? {
                SubItemWhs: selectedItemDetails.SubItemWhs,
                SubItemQty: selectedItemDetails.stocks.map((item) => ({
                    SubItemCode: item.SubItemCode,
                    BaseQty: item.BaseQty,
                })),
            }
            : {
                SubItemWhs: selectedItemDetails.SubItemWhs,
                SubItemQty: selectedItemDetails.stocks.map((item) => ({
                    SubItemCode: item.SubItemCode,
                    BaseQty: item.BaseQty,
                })),
            };

        try {
            setConfirmLoading(true);
            const payload = {
                FatherCode: lsxSelected.itemTB.SPDICH,
                ItemCode: selectedItemDetails.ItemChild,
                ItemName: selectedItemDetails.ChildName,
                SubItemName: selectedFaultItem.SubItemName,
                SubItemCode: selectedFaultItem.SubItemCode,
                MaThiTruong: lsxSelected.itemTB.MaThiTruong,
                CDay: selectedItemDetails.CDay,
                CRong: selectedItemDetails.CRong,
                CDai: selectedItemDetails.CDai,
                Team: selectedItemDetails.TO,
                CongDoan: selectedItemDetails.NameTO,
                NexTeam: selectedItemDetails.TOTT,
                Data: Data,
                Type: "TUBEP",
                version: choosenItem.Version || "",
                ProdType: selectedItemDetails.ProdType || "",
                LSX: lsxSelected.lsx,
                CompleQty: 0,
                RejectQty: 0,
                PackagedQty: 0,
                KHOI: "CBG" || "",
                loinhamay: faults?.factory?.value || user.plant || "",
                Factory: selectedFactory || "",
            };


            if (amount && amount > 0) {
                payload.CompleQty = Number(amount);
            }
            if (faultyAmount && faultyAmount > 0) {
                payload.RejectQty = Number(faultyAmount);
            }
            if (packagedAmount && packagedAmount > 0) {
                payload.PackagedQty = Number(packagedAmount);
            }
            if (payload.FatherCode && payload.ItemCode) {
                if (payload.CompleQty || payload.RejectQty) {
                    console.log("payload", payload);
                    let res = await acceptReceiptTB(payload);
                    console.log("res", res);
                    toast.success("Ghi nhận & chuyển tiếp thành công!");
                    setSelectedFaultItem({
                        ItemCode: "",
                        ItemName: "",
                        SubItemCode: "",
                        SubItemName: "",
                        SubItemBaseQty: "",
                        OnHand: "",
                    });

                    setIsItemCodeDetech(false);
                    setConfirmLoading(false);
                    setFaults({});
                    setAmount();
                    setFaultyAmount();
                    onAlertDialogClose();
                    onModalClose();
                } else {
                    toast("Chưa nhập bất kì số lượng nào.");
                }
            } else {
                toast("Có lỗi xảy ra. Vui lòng thử lại");
            }
        } catch (error) {
            // Xử lý lỗi (nếu có)
            console.error("Đã xảy ra lỗi:", error);
            toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
            setConfirmLoading(false);
        }

    };

    const handleConfirmReceipt = (id) => {
        if (selectedGroup) {
            setAwaitingReception((prev) =>
                prev.filter((item) => item.id !== id)
            );
            toast.success("Ghi nhận thành công.");
        }
        if (awaitingReception.length <= 0) {
            onModalNotiClose();
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
            onModalNotiClose();
        }
    };

    useEffect(() => {
        if (!selectedGroup) return;
        getDataTB();
    }, [selectedGroup])

    useEffect(() => {
        const getAllGroupWithoutQC = async () => {
            const factory = selectedFactory?.value;
            if (!factory) return;

            setLoading(true);
            try {
                const res = await getTeamUTub(factory);

                const options = res.data.teams.map((item) => ({
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
    }, [selectedFactory]);

    useEffect(() => {
        const getFactoriesByBranchId = async () => {
            let selectedBranch = user?.branch;

            try {
                if (selectedBranch) {
                    factorySelectRef.current.clearValue();
                    setFactories([]);
                    let res = await getFactoryUTub(selectedBranch);

                    let options = res.data.factories.map((item) => ({
                        value: item.U_FAC,
                        label: item.Name,
                    }));

                    setFactories(options);
                } else {
                    setFactories([]);
                }
            } catch (error) {
                toast.error("Lấy danh sách nhà máy có lỗi.");
            }
        };
        getFactoriesByBranchId();
    }, [])

    return (
        <Layout>
            <div className="flex justify-center bg-transparent ">
                <div className="w-screen mb-4 xl:mb-4 pt-2 px-0 xl:p-12 xl:pt-6 lg:pt-6 md:pt-6 lg:p-12 md:p-12 p-4 xl:px-32">
                    <div
                        className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B] xl:ml-0 lg:ml-0 md:ml-0 ml-4"
                        onClick={() => navigate(`/workspace?tab=wood-working`)}
                    >
                        <IoMdArrowRoundBack />
                        <div>Quay lại</div>
                    </div>

                    <div className="flex justify-between px-4 xl:px-0 lg:px-0 md:px-0 items-center">
                        <div className="serif xl:text-4xl lg:text-4xl md:text-4xl text-3xl font-bold ">
                            Nhập sản lượng khối{" "}
                            <span className=" text-[#402a62]">
                                Tủ bếp
                            </span>
                        </div>
                    </div>

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
                                                ref={factorySelectRef}
                                                options={factories}
                                                onChange={(value) => {
                                                    setSelectedFactory(value);
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
                                                className="block w-full p-2 pl-10 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 "
                                                placeholder="Tìm kiếm dự án"
                                                onChange={(e) =>
                                                    setSearchTerm(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    {selectedGroup &&
                                        !loadingData &&
                                        awaitingReception?.length > 0 && (
                                            <button
                                                onClick={onModalNotiOpen}
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
                        {
                            loadingData ? (
                                <Loading />
                            ) : data.length > 0 ? (
                                data.map((itemTB, index) => (
                                    <div className="shadow-md relative  rounded-lg bg-white/30 z-1" key={index}>
                                        <div
                                            className=" uppercase text-[18px] font-medium pl-3 bg-[#2A2C31] text-[white] p-2 py-1.5 xl:rounded-t-lg lg:rounded-t-lg md:rounded-t-lg"
                                        >
                                            {itemTB.NameSPDich || "Sản phẩm không xác định"}
                                        </div>
                                        <div className="gap-y-2 w-full h-full rounded-b-xl flex flex-col pt-1 pb-1 bg-white ">
                                            {
                                                itemTB?.Details.length > 0
                                                && itemTB.Details.map((item, index) => (
                                                    <section
                                                        className="rounded-b-xl cursor-pointer duration-200 ease-linear"
                                                        key={index}
                                                    >
                                                        <div className="text-[#17506B] xl:flex lg:flex md:flex  items-center space-x-2 pt-2 px-4 font-medium ">
                                                            <div className="flex items-center">
                                                                <span>
                                                                    <IoIosArrowDown className="inline-block text-gray-500" />{" "}
                                                                    {item.ChildName}{" "}
                                                                    {item.CDOAN === "RO" ? (
                                                                        <span className="text-[#0da0ea]">
                                                                            {item.QuyCach2 || ""}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="">
                                                                            ({item.CDay}*{item.CRong}*{item.CDai})
                                                                        </span>
                                                                    )}
                                                                    {item.Version && (
                                                                        <span className="pl-2 font-medium text-[#17506b]">
                                                                            V.
                                                                            <span>
                                                                                {item.Version}
                                                                            </span>
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="mb-2 mt-1 overflow-hidden rounded-lg border-2 border-[#c4cfe7] mx-1.5 ">
                                                            <table className="w-full divide-y divide-[#c4cfe7] border-collapse bg-[#ECEFF5] text-left text-sm text-gray-500">
                                                                <thead className="bg-[#dae0ec] ">
                                                                    <tr>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-2 py-2 text-xs font-medium uppercase text-gray-500 "
                                                                        >
                                                                            LSX
                                                                        </th>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-1 py-2 text-xs font-medium uppercase text-gray-500 text-right"
                                                                        >
                                                                            <span className="xl:block lg:block md:block hidden">
                                                                                Sản lượng
                                                                            </span>
                                                                            <span className="xl:hidden lg:hidden md:hidden block">
                                                                                SL
                                                                            </span>
                                                                        </th>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-2 py-2 text-xs font-medium uppercase  text-right text-gray-500"
                                                                        >
                                                                            <span className="xl:block lg:block md:block hidden">
                                                                                Đã làm
                                                                            </span>
                                                                            <span className="xl:hidden lg:hidden md:hidden block">
                                                                                ĐL
                                                                            </span>
                                                                        </th>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-2 py-2 text-xs font-medium uppercase text-right text-gray-500"
                                                                        >
                                                                            Lỗi
                                                                        </th>
                                                                        <th
                                                                            scope="col"
                                                                            className="px-2 py-2 text-xs text-right font-medium uppercase text-gray-500"
                                                                        >
                                                                            <span className="xl:block lg:block md:block hidden">
                                                                                Còn lại
                                                                            </span>
                                                                            <span className="xl:hidden lg:hidden md:hidden block">
                                                                                CL
                                                                            </span>
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className=" border-t border-[#c4cfe7]  ">
                                                                    {item.LSX?.length > 0 ? (
                                                                        item.LSX.filter(
                                                                            (production) =>
                                                                                production.ConLai > 0
                                                                        )
                                                                            .sort((a, b) => {
                                                                                return a.LSX.localeCompare(
                                                                                    b.LSX
                                                                                );
                                                                            })
                                                                            .map(
                                                                                (
                                                                                    production,
                                                                                    index
                                                                                ) => (
                                                                                    <tr onClick={
                                                                                        () => {
                                                                                            viewProductionsDetails(itemTB, item, production.LSX);
                                                                                            setChoosenItem(item);
                                                                                        }
                                                                                    }
                                                                                        className="bg-[#ECEFF5] border-[#c4cfe7] border-b !text-[13px]"
                                                                                        key={index}
                                                                                    >
                                                                                        <th

                                                                                            scope="row"
                                                                                            className="px-2 py-1 font-medium text-[#17506B] whitespace-nowrap hover:underline"
                                                                                        >
                                                                                            {
                                                                                                production.LSX
                                                                                            }
                                                                                        </th>
                                                                                        <td className="px-2 py-2 text-right text-gray-800">
                                                                                            {formatNumber(
                                                                                                Number(
                                                                                                    production.SanLuong
                                                                                                )
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="px-2 py-2 text-right text-gray-900">
                                                                                            {formatNumber(
                                                                                                Number(
                                                                                                    production.DaLam
                                                                                                )
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="px-2 py-2 text-right text-gray-900">
                                                                                            {formatNumber(
                                                                                                Number(
                                                                                                    production.Loi
                                                                                                )
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="px-2  py-2 text-right text-gray-800">
                                                                                            {formatNumber(
                                                                                                Number(
                                                                                                    production.ConLai
                                                                                                )
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                )
                                                                            )
                                                                    ) : (
                                                                        <span>Không có dữ liệu</span>
                                                                    )}
                                                                </tbody>
                                                                <tfoot className="!text-[12px]">
                                                                    <tr>
                                                                        <td className="font-bold  text-gray-700 px-2 py-2">
                                                                            Tổng
                                                                        </td>
                                                                        <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                            {
                                                                                formatNumber(Number(item.LSX.reduce((acc, curr) => acc + Number(curr.SanLuong), 0)))
                                                                            }
                                                                        </td>
                                                                        <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                            {
                                                                                formatNumber(Number(item.LSX.reduce((acc, curr) => acc + Number(curr.DaLam), 0)))
                                                                            }
                                                                        </td>
                                                                        <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                            {formatNumber(
                                                                                Number(
                                                                                    item.LSX.reduce(
                                                                                        (acc, curr) =>
                                                                                            acc +
                                                                                            Number(
                                                                                                curr.Loi
                                                                                            ),
                                                                                        0
                                                                                    )
                                                                                )
                                                                            )}
                                                                        </td>
                                                                        <td className="px-2 py-2 text-right font-bold text-gray-700">
                                                                            {formatNumber(
                                                                                Number(
                                                                                    item.LSX.reduce(
                                                                                        (acc, curr) =>
                                                                                            acc +
                                                                                            Number(
                                                                                                curr.ConLai
                                                                                            ),
                                                                                        0
                                                                                    )
                                                                                )
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                </tfoot>
                                                            </table>
                                                        </div>
                                                    </section>
                                                ))
                                            }
                                        </div >
                                    </div >
                                ))
                            ) : (
                                <div className="h-full mt-10 flex flex-col items-center justify-center text-center">
                                    <BiConfused className="text-center text-gray-400 w-12 h-12 mb-2" />
                                    <div className="  text-lg text-gray-400">
                                        Không tìm thấy dữ liệu để hiển thị.
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>

            {
                lsxSelected.lsx && (
                    <Modal
                        isCentered
                        isOpen={isModalOpen}
                        size="full"
                        scrollBehavior="inside"
                        trapFocus={false}
                    >
                        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
                        <ModalContent className="!px-0">
                            <ModalHeader className="h-[50px] flex items-center justify-center">
                                <div className="xl:ml-6 serif font-bold text-2xl  ">
                                    Ghi nhận sản lượng
                                </div>
                            </ModalHeader>
                            <div className="border-b-2 border-[#DADADA]"></div>
                            <ModalBody px={0} py={0}>
                                <div className="flex flex-col justify-center pb-4 bg-[#FAFAFA] ">
                                    <div className="xl:mx-auto xl:px-8 text-base w-full xl:w-[55%] space-y-3 ">
                                        <div className="flex flex-col md:flex-row justify-between pt-2 items-center xl:px-0 md:px-0 lg:px-0 px-3">
                                            <div className="flex flex-col  w-full">
                                                <label className="font-medium">
                                                    Sản phẩm/Chi tiết
                                                </label>
                                                <span className="text-[#17506B] text-2xl font-bold">
                                                    {
                                                        selectedItemDetails?.ChildName
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between py-3 border-2 divide-x-2 border-[#DADADA] shadow-sm rounded-xl xl:mx-0 md:mx-0 lg:mx-0 mx-3 bg-white">
                                            <div className="flex flex-col justify-start xl:pl-6 md:pl-6 lg:pl-6 pl-4 w-1/3">
                                                <label className="font-medium uppercase text-sm text-gray-400">
                                                    Chiều Dày
                                                </label>
                                                <span className="text-[20px] font-bold">
                                                    {selectedItemDetails?.CDay ||
                                                        0}
                                                </span>
                                            </div>
                                            <div className="flex flex-col justify-start xl:pl-6 md:pl-6 lg:pl-6 pl-4 w-1/3">
                                                <label className="font-medium uppercase text-sm text-gray-400 ">
                                                    Chiều Rộng
                                                </label>
                                                <span className="text-[20px] font-bold">
                                                    {selectedItemDetails?.CRong ||
                                                        0}
                                                </span>
                                            </div>
                                            <div className="flex flex-col justify-start xl:pl-6 md:pl-6 lg:pl-6 pl-4 w-1/3">
                                                <label className="font-medium uppercase text-sm text-gray-400">
                                                    Chiều Dài
                                                </label>
                                                <span className="text-[20px] font-bold">
                                                    {selectedItemDetails?.CDai ||
                                                        0}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Nguyên vật liệu */}
                                        <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 border-2 border-[#DADADA] shadow-sm rounded-xl space-y-2 bg-white">
                                            <div className="flex justify-between pb-1 ">
                                                <div className="flex items-center space-x-2">
                                                    <FaDiceD6 className="w-7 h-7 text-amber-700" />
                                                    <div className="font-semibold text-lg ">
                                                        Nguyên vật liệu
                                                    </div>
                                                </div>
                                                <div className="text-blue-600 p-1.5 px-4 bg-blue-50 rounded-full border-2 border-blue-200">
                                                    <span className="xl:inline-block lg:inline-block md:inline-block hidden">
                                                        Công đoạn:{" "}
                                                    </span>
                                                    <span>
                                                        {" "}
                                                        {
                                                            selectedItemDetails?.CongDoan
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2 pb-3">
                                                <Text className="font-semibold px-2">
                                                    Số lượng tồn nguyên vật liệu:
                                                </Text>

                                                {
                                                    selectedItemDetails?.stocks
                                                        .sort((a, b) => a.SubItemCode.localeCompare(b.SubItemCode))
                                                        .map((item, index) => (
                                                            <div
                                                                key={index}
                                                                className={`${parseInt(
                                                                    item.OnHand ||
                                                                    0
                                                                ) <= 0
                                                                    ? "bg-gray-200"
                                                                    : "bg-blue-100"
                                                                    } flex flex-col py-2  mb-6 rounded-xl`}
                                                            >
                                                                <div className="flex items-center justify-between gap-4 px-4">
                                                                    <div className="xl:max-w-[90%] lg:max-w-[90%] md:max-w-[80%] max-w-[65%]">
                                                                        <div className="text-xs text-[#647C9C]">
                                                                            <span className="mr-1">
                                                                                [
                                                                                {
                                                                                    item.BaseQty
                                                                                }
                                                                                {
                                                                                    item.BaseQty.toString().includes(".") && (
                                                                                        <span>
                                                                                            {"-"}{Math.ceil(item.BaseQty)}
                                                                                        </span>
                                                                                    )
                                                                                }
                                                                                ]
                                                                            </span>
                                                                            {
                                                                                item.SubItemCode
                                                                            }
                                                                        </div>
                                                                        <div className="font-medium text-[15px]">
                                                                            {
                                                                                item.SubItemName === "Gỗ" ? "Nguyên liệu gỗ" : item.SubItemName === null || item.SubItemName === "" ? "Nguyên vật liệu chưa xác định" : item.SubItemName
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    <span
                                                                        className={`${parseInt(item.OnHand || 0) <= 0 ? "bg-gray-500" : "bg-[#155979]"} rounded-lg cursor-pointer px-3 py-1 text-white duration-300`}
                                                                    >
                                                                        {
                                                                            parseInt(item.OnHand || 0).toLocaleString()
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )
                                                        )
                                                }
                                            </div>

                                            <div className="flex gap-2 items-center justify-between py-3 border-t px-0 pr-2 ">
                                                <Text className="font-semibold">
                                                    Số lượng tối đa có thể xuất:
                                                </Text>
                                                <span className="rounded-lg cursor-pointer px-3 py-1 text-white bg-green-700 hover:bg-green-500 duration-300">
                                                    {
                                                        selectedItemDetails?.maxQty > 0 ? parseInt(selectedItemDetails?.maxQty || 0).toLocaleString() : 0
                                                    }
                                                </span>
                                            </div>

                                            <div className="flex gap-2 items-center py-3 border-t border-b !mt-0 px-0 pr-2 justify-between">
                                                <Text className="font-semibold">
                                                    Số lượng còn phải sản xuất:
                                                </Text>
                                                <span className="rounded-lg cursor-pointer px-3 py-1 text-white bg-yellow-700 hover:bg-yellow-500 duration-300">
                                                    {
                                                        formatNumber(Number(selectedItemDetails?.remainQty - selectedItemDetails?.WaitingConfirmQty)) || 0
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* Ghi nhận sản lượng */}
                                        <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 border-2 border-[#DADADA] shadow-sm rounded-xl space-y-2 bg-white">
                                            <div className="flex justify-between pb-1 ">
                                                <div className="flex items-center space-x-2">
                                                    <FaCircleRight className="w-7 h-7 text-blue-700" />
                                                    <div className="font-semibold text-lg ">
                                                        Ghi nhận sản lượng
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Số lượng giao chờ xác nhận */}
                                            {
                                                selectedItemDetails?.notifications &&
                                                selectedItemDetails?.notifications.filter((notif) => notif.confirm == 0 && notif.type == 0)?.length > 0 && (
                                                    <div className="flex items-center justify-between w-full p-1 px-0 !mt-2 !mb-1">
                                                        <Text className="font-semibold">
                                                            Số lượng đã giao chờ xác nhận:{" "}
                                                        </Text>{" "}
                                                    </div>
                                                )
                                            }
                                            {
                                                selectedItemDetails?.notifications &&
                                                selectedItemDetails?.notifications.filter((notif) => notif.confirm == 0 && notif.type == 0)?.length > 0 &&
                                                selectedItemDetails?.notifications.filter((notif) => notif.confirm == 0 && notif.type == 0)?.map((item, index) => (
                                                    <div className="" key={"Processing_" + index}>
                                                        <div key={"Processing_" + index}
                                                            className="relative flex justify-between items-center p-2.5 px-3 !mb-4  gap-2 bg-green-50 border border-green-300 rounded-xl"
                                                        >
                                                            <div className="flex flex-col">
                                                                <div className="xl:hidden lg:hidden md:hidden block  text-green-700 text-2xl">
                                                                    {
                                                                        Number(item?.Quantity)
                                                                    }
                                                                </div>
                                                                <Text className="font-semibold text-[15px] ">
                                                                    Người giao:{" "}
                                                                    <span className="text-green-700">
                                                                        {
                                                                            item?.last_name + " " + item?.first_name
                                                                        }
                                                                    </span>
                                                                </Text>
                                                                {
                                                                    selectedItemDetails?.CongDoan == "DG" && (
                                                                        <div className="flex text-sm">
                                                                            <Text className="xl:block lg:block md:block hidden font-medium text-gray-600">
                                                                                Số lượng đã đóng gói chờ giao:{" "}
                                                                            </Text>
                                                                            <Text className="xl:hidden lg:hidden md:hidden  block font-medium text-gray-600">
                                                                                Đã đóng gói chờ giao:{" "}
                                                                            </Text>
                                                                            <span className="ml-1 text-gray-600">
                                                                                {
                                                                                    Number(item?.SLDG || 0)
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                <div className="flex text-sm">
                                                                    <Text className=" font-medium text-gray-600">
                                                                        Thời gian  giao:{" "}
                                                                    </Text>
                                                                    <span className="ml-1 text-gray-600">
                                                                        {
                                                                            moment(item?.created_at).format("DD/MM/YYYY HH:mm:ss") || ""
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-x-6">
                                                                <div className="xl:block lg:block md:block hidden text-green-700 rounded-lg cursor-pointer px-3 py-1 bg-green-200 font-semibold !mr-6">
                                                                    {
                                                                        Number(item?.Quantity)
                                                                    }
                                                                </div>

                                                                <button
                                                                    onClick={() => {
                                                                        // onDeleteProcessingDialogOpen();
                                                                        // setSelectedDelete(
                                                                        //     item?.id
                                                                        // );
                                                                        // setDialogType(
                                                                        //     "product"
                                                                        // );
                                                                    }}
                                                                    className="absolute -top-2 -right-2 rounded-full p-1.5 bg-black duration-200 ease hover:bg-red-600"
                                                                >
                                                                    <TbTrash className="text-white text-2xl" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                            {
                                                selectedItemDetails?.CongDoan === "DG" && selectedItemDetails?.maxQty > 0 && (
                                                    <div className="">
                                                        <Box className="px-0">
                                                            <label className="mt-6 font-semibold">
                                                                Số lượng đã đóng gói chờ giao:
                                                            </label>

                                                            <NumberInput
                                                                step={1}
                                                                min={1}
                                                                className="mt-2 mb-2"
                                                                onChange={(
                                                                    value
                                                                ) => {

                                                                }}
                                                            >
                                                                <NumberInputField />
                                                                <NumberInputStepper>
                                                                    <NumberIncrementStepper />
                                                                    <NumberDecrementStepper />
                                                                </NumberInputStepper>
                                                            </NumberInput>
                                                        </Box>
                                                        <div className="border-b pt-2"></div>
                                                    </div>
                                                )
                                            }

                                            <Box className="px-0">
                                                <label className="mt-6 font-semibold">
                                                    Số lượng ghi nhận sản phẩm:
                                                </label>
                                                <span className="font-bold text-red-500">
                                                    {" "} *
                                                </span>
                                                {selectedItemDetails?.CongDoan !== "SC" && selectedItemDetails?.CongDoan !== "XV" && selectedItemDetails?.maxQty <= 0 &&
                                                    (selectedItemDetails?.stocks?.length !== 1 || selectedItemDetails?.stocks[0]?.SubItemCode !== "MM010000178") ? (
                                                    <div className="flex space-x-2 items-center px-4 py-3 bg-red-50 rounded-xl text-red-500 mt-2 mb-2">
                                                        <MdDangerous className="w-6 h-6" />
                                                        <div>
                                                            Không đủ số lượng để  ghi nhận
                                                        </div>
                                                    </div>
                                                ) : selectedItemDetails?.remainQty - selectedItemDetails?.WaitingConfirmQty <= 0 ? (
                                                    <div className="flex space-x-2 items-center px-4 py-3 bg-gray-800 rounded-xl text-green-500 mt-2 mb-2">
                                                        <BiSolidBadgeCheck className="w-6 h-6" />
                                                        <div className="text-white">
                                                            Đã đủ số lượng hoàn thành của lệnh.
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <NumberInput
                                                        step={1}
                                                        min={1}
                                                        className="mt-2 mb-2"
                                                        onChange={(value) => {
                                                            if (
                                                                value >
                                                                selectedItemDetails.stockQuantity
                                                            ) {
                                                                setAmount(
                                                                    selectedItemDetails.stockQuantity
                                                                );
                                                            } else {
                                                                setAmount(
                                                                    value
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <NumberInputField />
                                                        <NumberInputStepper>
                                                            <NumberIncrementStepper />
                                                            <NumberDecrementStepper />
                                                        </NumberInputStepper>
                                                    </NumberInput>
                                                )}
                                            </Box>
                                        </div>

                                        {/* Ghi nhận lỗi */}
                                        <div className="xl:mx-0 md:mx-0 lg:mx-0 mx-3 p-4 mb-3 border-2 border-[#DADADA] shadow-sm rounded-xl space-y-2 bg-white">
                                            <div className="flex space-x-2 pb-1 items-center">
                                                <FaExclamationCircle className="w-7 h-7 text-red-700" />
                                                <div className="font-semibold text-lg ">
                                                    Ghi nhận lỗi
                                                </div>
                                            </div>
                                            <Alert
                                                status="error"
                                                className="rounded-xl flex items-center !mb-3"
                                            >
                                                <div className="w-full flex items-center justify-between gap-3">
                                                    <div className="">
                                                        Tổng số lượng ghi nhận lỗi:{" "}
                                                    </div>
                                                    <div className="rounded-lg cursor-pointer px-3 py-1 text-white bg-red-800 hover:bg-red-500 duration-300">
                                                        {
                                                            formatNumber(Number(selectedItemDetails?.notifications.filter((notif) => notif.confirm === 0 && notif.type === 1).length || 0))
                                                        }
                                                    </div>
                                                </div>
                                            </Alert>
                                            <div className="border-b border-gray-200">
                                                {/* Số lượng ghi nhận lỗi */}
                                                {
                                                    selectedItemDetails?.notifications &&
                                                    selectedItemDetails?.notifications.filter((notif) => notif.confirm == 0 && notif.type == 1)?.length > 0 &&
                                                    selectedItemDetails?.notifications.filter((notif) => notif.confirm == 0 && notif.type == 1) && (
                                                        <div className="flex items-center justify-between w-full p-1 px-2 !mb-2">
                                                            <Text className="font-semibold">
                                                                Số lượng lỗi đã ghi nhận:{" "}
                                                            </Text>{" "}
                                                        </div>
                                                    )
                                                }
                                                {
                                                    selectedItemDetails?.notifications &&
                                                    selectedItemDetails?.notifications.filter((notif) => notif.confirm == 0 && notif.type == 1)?.length > 0 &&
                                                    selectedItemDetails?.notifications.filter((notif) => notif.confirm == 0 && notif.type == 1).map((item, index) => (
                                                        <div key={"Error_" + index}
                                                            className="relative flex justify-between items-center p-2.5 px-3 !mb-4  gap-2 bg-red-50 border border-red-300 rounded-xl"
                                                        >
                                                            {/*  */}
                                                            <div className="flex flex-col">
                                                                <div className="xl:hidden lg:hidden md:hidden block  text-red-700 text-2xl">
                                                                    {
                                                                        Number(item?.Quantity)
                                                                    }
                                                                </div>
                                                                {
                                                                    item?.loinhamay !== null && item?.loinhamay !== user.plant && (
                                                                        <Text className="flex space-x-1 font-medium text-xs text-red-500 mb-1">
                                                                            <MdOutlineSubdirectoryArrowRight />
                                                                            <span className=" ">
                                                                                Lỗi nhận từ  nhà máy{" "}
                                                                                {
                                                                                    item?.loinhamay == "YS" ?
                                                                                        "Yên Sơn" : item?.loinhamay == "TH" ?
                                                                                            "Thuận Hưng" : item?.loinhamay == "TB" ?
                                                                                                "Thái Bình" : item?.loinhamay == "CH" ?
                                                                                                    "Chiêm Hóa" : item?.loinhamay == "VF" ?
                                                                                                        "Viforex" : "không xác định"
                                                                                }
                                                                            </span>
                                                                        </Text>
                                                                    )}

                                                                <div className="text-[15px] font-semibold ">
                                                                    {item.SubItemName || item.ItemName}
                                                                </div>
                                                                <Text className="font-medium text-sm ">
                                                                    Người giao:{" "}
                                                                    <span className="font-semibold text-red-700">
                                                                        {item?.last_name + " " + item?.first_name}
                                                                    </span>
                                                                </Text>
                                                                <div className="flex text-sm">
                                                                    <Text className=" font-medium text-gray-600">
                                                                        Thời gian giao:{" "}
                                                                    </Text>
                                                                    <span className="ml-1 text-gray-600">
                                                                        {moment(item?.created_at).format("DD/MM/YYYY") || ""}
                                                                        {" "}
                                                                        {moment(item?.created_at).format("HH:mm:ss") || ""}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-x-6 items-center">
                                                                <div className="xl:block lg;block md:block hidden text-red-700 rounded-lg cursor-pointer px-3 py-1 bg-red-200 font-semibold h-fit mr-6">
                                                                    {Number(item?.Quantity)}
                                                                </div>
                                                                <button
                                                                    // onClick={() => {
                                                                    //     onDeleteProcessingDialogOpen();
                                                                    //     setSelectedDelete(
                                                                    //         item?.id
                                                                    //     );
                                                                    //     setDialogType(
                                                                    //         "qc"
                                                                    //     );
                                                                    // }}
                                                                    className="absolute -top-2 -right-2 rounded-full p-1.5 bg-black duration-200 ease hover:bg-red-600"
                                                                >
                                                                    <TbTrash className="text-white text-2xl" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                            <Box className="px-0 pt-2">
                                                <label className="font-semibold ">
                                                    Số lượng ghi nhận lỗi:{" "}
                                                    <span className="text-red-600">
                                                        *
                                                    </span>
                                                </label>
                                                {/*  */}
                                                <NumberInput
                                                    step={1}
                                                    min={0}
                                                    className="mt-2"
                                                    onChange={(value) => {
                                                        if (
                                                            value >
                                                            selectedItemDetails.stockQuantity
                                                        ) {
                                                            setFaultyAmount(
                                                                selectedItemDetails.stockQuantity
                                                            );
                                                            setFaults(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    amount: selectedItemDetails.stockQuantity,
                                                                })
                                                            );
                                                        } else {
                                                            setFaultyAmount(
                                                                value
                                                            );
                                                            setFaults(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    amount: value,
                                                                })
                                                            );
                                                        }
                                                        if (
                                                            value == 0 ||
                                                            !value
                                                        ) {
                                                            setSelectedFaultItem(
                                                                {
                                                                    ItemCode:
                                                                        "",
                                                                    ItemName:
                                                                        "",
                                                                    SubItemCode:
                                                                        "",
                                                                    SubItemName:
                                                                        "",
                                                                    SubItemBaseQty:
                                                                        "",
                                                                    OnHand: "",
                                                                }
                                                            );
                                                            setFaults(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    factory:
                                                                        null,
                                                                })
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <NumberInputField />
                                                    <NumberInputStepper>
                                                        <NumberIncrementStepper />
                                                        <NumberDecrementStepper />
                                                    </NumberInputStepper>
                                                </NumberInput>

                                                {!faultyAmount ||
                                                    (faultyAmount > 0 && (
                                                        <>
                                                            <div className="my-3 font-medium text-[15px] text-red-700">
                                                                Lỗi thành phẩm:
                                                            </div>
                                                            <div
                                                                className={`mb-4 ml-3 text-gray-600  ${selectedFaultItem.ItemCode === choosenItem.ItemChild
                                                                    ? "font-semibold text-gray-800 "
                                                                    : "text-gray-600"
                                                                    }`}
                                                            // key={index}
                                                            >
                                                                <Radio
                                                                    value={
                                                                        choosenItem.ChildName
                                                                    }
                                                                    isChecked={
                                                                        selectedFaultItem.ItemCode === choosenItem.ItemChild
                                                                    }
                                                                    onChange={() => {
                                                                        setSelectedFaultItem(
                                                                            {
                                                                                ItemCode:
                                                                                    choosenItem.ItemChild,
                                                                                ItemName:
                                                                                    choosenItem.ChildName,
                                                                                SubItemCode:
                                                                                    "",
                                                                                SubItemName:
                                                                                    "",
                                                                                SubItemBaseQty:
                                                                                    "",
                                                                                OnHand: "",
                                                                            }
                                                                        );
                                                                        setIsItemCodeDetech(
                                                                            true
                                                                        );
                                                                    }}
                                                                >
                                                                    {
                                                                        choosenItem.ChildName
                                                                    }
                                                                </Radio>
                                                            </div>
                                                            {/* {
                                                        selectedItemDetails?.CongDoan !== "SC" && selectedItemDetails?.CongDoan !== "XV" && (
                                                            <>
                                                                {" "}
                                                                <div className="my-3 font-medium text-[15px] text-red-700">
                                                                    Lỗi bán thành phẩm công đoạn trước:
                                                                </div>
                                                                {selectedItemDetails?.stocks.map(
                                                                    (
                                                                        item,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            className={`mb-4 ml-3  ${selectedFaultItem.SubItemCode ===
                                                                                item.SubItemCode
                                                                                ? "font-semibold text-gray-800 "
                                                                                : "text-gray-600"
                                                                                }`}
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            <Radio
                                                                                ref={
                                                                                    checkRef
                                                                                }
                                                                                value={
                                                                                    item.SubItemCode
                                                                                }
                                                                                isChecked={
                                                                                    selectedFaultItem.SubItemCode ===
                                                                                    item.SubItemCode
                                                                                }
                                                                                onChange={() => {
                                                                                    setSelectedFaultItem(
                                                                                        {
                                                                                            ItemCode:
                                                                                                "",
                                                                                            ItemName:
                                                                                                "",
                                                                                            SubItemCode:
                                                                                                item.SubItemCode,
                                                                                            SubItemName:
                                                                                                item.SubItemName,
                                                                                            SubItemBaseQty:
                                                                                                item.BaseQty,
                                                                                            OnHand: item.OnHand,
                                                                                        }
                                                                                    );
                                                                                    setIsItemCodeDetech(
                                                                                        false
                                                                                    );
                                                                                }}
                                                                            >
                                                                                {
                                                                                    item.SubItemName
                                                                                }
                                                                            </Radio>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </>
                                                        )} */}
                                                        </>
                                                    ))}
                                            </Box>
                                            {/* <Box className="px-0 pt-2">
                                                <label className="font-semibold">
                                                    Lỗi phôi nhận từ nhà máy  khác:
                                                </label>
                                                <Select
                                                    className="mt-2 mb-2"
                                                    placeholder="Lựa chọn"
                                                    options={
                                                        selectedItemDetails?.factories
                                                    }
                                                    isClearable
                                                    isSearchable
                                                    value={faults.factory}
                                                    onChange={(value) => {
                                                        if (
                                                            !faultyAmount ||
                                                            faultyAmount < 1
                                                        ) {
                                                            toast(
                                                                "Vui lòng khai báo số lượng lỗi."
                                                            );
                                                            setFaults(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    factory:
                                                                        null,
                                                                })
                                                            );
                                                        } else {
                                                            setFaults(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    factory:
                                                                        value,
                                                                })
                                                            );
                                                        }
                                                    }}
                                                />
                                                <p className="text-sm text-gray-500 mb-1">
                                                    *Bỏ qua phần này nếu lỗi ghi
                                                    nhận là của nhà máy hiện
                                                    tại.
                                                </p>
                                            </Box> */}
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>

                            <ModalFooter className="flex flex-col !p-0 ">
                                <Alert status="info" className="!py-2 !bg-[#A3DEFF]">
                                    <TbPlayerTrackNextFilled className="text-[#155979] xl:mr-2 lg:mr-2 md:mr-2 mr-4 xl:text-xl lg:text-xl md:text-xl text-2xl" />
                                    <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col">
                                        <span className="text-[15px] mr-1 sm:text-base">
                                            Công đoạn sản xuất tiếp theo:{"  "}
                                        </span>
                                        <span className="xl:text-[15px] lg:text-[15px] md:text-[15px] text-[17px] sm:text-base font-bold xl:ml-1 lg:ml-1 md:ml-1 ml-0">
                                            {selectedItemDetails?.NameTOTT ||
                                                "Chưa được thiết lập ở SAP"}{" "}
                                            (
                                            {selectedItemDetails?.TOTT?.split("-")[0] ||
                                                ""}
                                            )
                                        </span>
                                    </div>
                                </Alert>

                                <div className="border-b-2 border-gray-100"></div>
                                <div className="flex flex-row xl:px-6 lg-px-6 md:px-6 px-4 w-full items-center justify-end py-4 gap-x-3 ">
                                    <button
                                        onClick={() => {
                                            clearData();
                                            onModalClose();


                                        }}
                                        className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        onClick={onAlertDialogOpen}
                                        className="bg-gray-800 p-2 rounded-xl px-4 h-fit font-medium active:scale-[.95]  active:duration-75  transition-all xl:w-fit md:w-fit w-full text-white"
                                        type="button"
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                )
            }

            <AlertDialog
                isOpen={isAlertDialogOpen}
                closeOnOverlayClick={false}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader>Xác nhận ghi nhận</AlertDialogHeader>
                        <AlertDialogBody>
                            {(amount && amount !== "") ||
                                (faultyAmount && faultyAmount !== "") ? (
                                <div className="space-y-1">
                                    {packagedAmount && (
                                        <div className="text-yellow-700">
                                            Số lượng đã đóng gói chờ giao:{" "}
                                            <span className="font-bold">
                                                {packagedAmount || 0}
                                            </span>
                                        </div>
                                    )}
                                    {amount && (
                                        <div className="text-green-700">
                                            Ghi nhận sản lượng:{" "}
                                            <span className="font-bold">
                                                {amount}
                                            </span>
                                        </div>
                                    )}
                                    {faultyAmount && (
                                        <div className="text-red-700">
                                            Ghi nhận lỗi:{" "}
                                            <span className="font-bold">
                                                {faultyAmount}
                                            </span>
                                            {faults &&
                                                faults.ItemCode &&
                                                faults.factory && (
                                                    <span>
                                                        {" "}
                                                        từ{" "}
                                                        {
                                                            faults
                                                                .factory
                                                                .label
                                                        }
                                                    </span>
                                                )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p>
                                    Bạn chưa ghi nhận bất kỳ giá trị
                                    nào.
                                </p>
                            )}
                        </AlertDialogBody>
                        <AlertDialogFooter className="gap-4">
                            <Button onClick={onAlertDialogClose}>Hủy bỏ</Button>
                            <button
                                disabled={confirmLoading}
                                className="w-fit bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                onClick={handleSubmitQuantity}
                            >
                                {confirmLoading ? (
                                    <div className="flex items-center space-x-4">
                                        <Spinner size="sm" color="white" />
                                        <div>Đang tải</div>
                                    </div>
                                ) : (
                                    "Xác nhận"
                                )}
                            </button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            <Modal
                isCentered
                isOpen={isModalNotiOpen}
                size="full"
                onClose={onModalNotiClose}
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
                                            type="CBG-TUBEP"
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
                                            lsxSelect={lsxSelected}
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
        </Layout >
    );
}

export default TuBep;