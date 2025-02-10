import React, { useEffect, useState } from "react";
import Layout from "../../../layouts/layout";
import { Link, useNavigate } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { BiSolidCabinet } from "react-icons/bi";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import { MdWarehouse } from "react-icons/md";
import Select from "react-select";
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
    Tooltip,
} from "@chakra-ui/react";
import toast from "react-hot-toast";
// import  EmptyState  from "../../../assets/images/empty-data.svg";
import EmptyState from "../../../assets/images/empty-state.svg";
import {
    HiExclamationCircle,
    HiEye,
    HiOutlinePencilAlt,
    HiOutlineTrash,
} from "react-icons/hi";
import goodsManagementApi from "../../../api/goodsManagementApi";
import Loader from "../../../components/Loader";
import useAppContext from "../../../store/AppContext";
import { set } from "date-fns";
import { is } from "date-fns/locale";

const warehouses = [
    { value: "WTH.001", label: "Warehouse 1" },
    { value: "WTH.002", label: "Warehouse 2" },
    { value: "WTH.003", label: "Warehouse 3" },
    { value: "WTH.004", label: "Warehouse 4" },
    { value: "WTH.005", label: "Warehouse 5" },
    { value: "WTH.006", label: "Warehouse 6" },
    { value: "WTH.007", label: "Warehouse 7" },
    { value: "WTH.008", label: "Warehouse 8" },
];

const bins = [
    { value: "BIN.001", label: "Bin 1" },
    { value: "BIN.002", label: "Bin 2" },
    { value: "BIN.003", label: "Bin 3" },
    { value: "BIN.004", label: "Bin 4" },
    { value: "BIN.005", label: "Bin 5" },
    { value: "BIN.006", label: "Bin 6" },
    { value: "BIN.007", label: "Bin 7" },
    { value: "BIN.008", label: "Bin 8" },
];

const batch = [
    { value: "2025-01-01", label: "2025-01-01" },
    { value: "2025-01-02", label: "2025-01-02" },
];

const items = [
    { value: "ITEM.001", label: "Luxury Table", onHand: 14 },
    { value: "ITEM.002", label: "Ergonomic Chair", onHand: 73 },
    { value: "ITEM.003", label: "Modern Bench", onHand: 28 },
    { value: "ITEM.004", label: "Minimalist Stool", onHand: 0 },
    { value: "ITEM.005", label: "Designer Coffee Table", onHand: 91 },
    { value: "ITEM.006", label: "Dining Table Set", onHand: 19 },
    { value: "ITEM.007", label: "Vintage Rocking Chair", onHand: 85 },
    { value: "ITEM.008", label: "Executive Armchair", onHand: 67 },
];

function BinWarehouseTransfer() {
    const navigate = useNavigate();
    const { user } = useAppContext();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isConfirmOpen,
        onOpen: onConfirmOpen,
        onClose: onConfirmClose,
    } = useDisclosure();

    const {
        isOpen: isExitConfirmOpen,
        onOpen: onExitConfirmOpen,
        onClose: onExitConfirmClose,
    } = useDisclosure();

    const {
        isOpen: isChangeTabOpen,
        onOpen: onChangeTabOpen,
        onClose: onChangeTabClose,
    } = useDisclosure();

    const [type, setType] = useState(null);

    const [BinStackingRecord, setBinStackingRecord] = useState({
        warehouse: "",
        item: "",
        batch: "",
        quantity: "",
        bin: "",
    });
    const [editingBinStackingRecord, setEditingBinStackingRecord] = useState({
        warehouse: "",
        item: "",
        batch: "",
        quantity: "",
        bin: "",
    });
    const [editingBinStackingIndex, setEditingBinStackingIndex] = useState(null);

    const [BinTransferRecord, setBinTransferRecord] = useState({
        fromWarehouse: "",
        fromBin: "",
        item: "",
        batch: "",
        quantity: "",
        toWarehouse: "",
        toBin: "",
    });
    const [editingBinTransferRecord, setEditingBinTransferRecord] = useState({
        fromWarehouse: "",
        fromBin: "",
        item: "",
        batch: "",
        quantity: "",
        toWarehouse: "",
        toBin: "",
    });
    const [editingBinTransferIndex, setEditingBinTransferIndex] = useState(null);

    const [BinStackingData, setBinStackingData] = useState([]);
    const [BinTransferData, setBinTransferData] = useState([]);

    const [initialLoading, setInitialLoading] = useState(false);

    const [fromWarehouseOptions, setFromWarehouseOptions] = useState([]);
    const [toWarehouseOptions, setToWarehouseOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);
    const [tempItemOptions, setTempItemOptions] = useState([]);
    const [batchOptions, setBatchOptions] = useState([]);
    const [updatedBatchOptions, setUpdatedBatchOptions] = useState([]);

    const [stackBinOptions, setStackBinOptions] = useState([]);
    const [fromBinOptions, setFromBinOptions] = useState([]);
    const [toBinOptions, setToBinOptions] = useState([]);

    const [currentStock, setCurrentStock] = useState(0);
    const [updatedCurrentStock, setUpdatedCurrentStock] = useState(0);

    // Tabs
    const [tabIndex, setTabIndex] = useState(0);
    const [nextTabIndex, setNextTabIndex] = useState(null);

    // Loadings
    const [isDefaultBinItemsLoading, setIsDefaultBinItemsLoading] =
        useState(false);
    const [isBatchByItemDefaultBinLoading, setIsBatchByItemDefaultBinLoading] =
        useState(false);
    const [isBatchByItemLoading, setIsBatchByItemLoading] = useState(false);

    const [isFromBinByWarehouseLoading, setIsFromBinByWarehouseLoading] = useState(false);
    const [isToBinByWarehouseLoading, setIsToBinByWarehouseLoading] = useState(false);
    const [isGetItemByBinLoading, setIsGetItemByBinLoading] = useState(false);

    const handleTabChange = (index) => {
        const hasData =
            tabIndex === 0
                ? BinStackingData.length > 0 || BinStackingRecord.item !== "" || BinStackingRecord.warehouse !== "" || BinStackingRecord.batch !== "" || BinStackingRecord.quantity !== "" || BinStackingRecord.bin !== ""
                : BinTransferData.length > 0 || BinTransferRecord.item !== "" || BinTransferRecord.fromWarehouse !== "" || BinTransferRecord.fromBin !== "" || BinTransferRecord.quantity !== "" || BinTransferRecord.toWarehouse !== "" || BinTransferRecord.toBin !== "";

        if (hasData) {
            setNextTabIndex(index);
            onChangeTabOpen();
        } else {
            setTabIndex(index);
        }
    };

    // Bin Stacking
    const saveBinStackingRecord = async () => {
        const isEditing = editingBinStackingIndex !== null;
        const recordToSave = isEditing ? editingBinStackingRecord : BinStackingRecord;
        
        const { warehouse, item, quantity, bin } = recordToSave;

        // Validation checks
        if (!warehouse) {
            toast.error("Kho xếp bin không được để trống.");
            return;
        }
        if (!item) {
            toast.error("Sản phẩm điều chuyển không được để trống.");
            return;
        }
        if (!quantity) {
            toast.error("Số lượng không được để trống.");
            return;
        }
        if (!bin) {
            toast.error("Bin chuyển đến không được để trống.");
            return;
        }
        if (isNaN(quantity) || quantity <= 0) {
            toast.error("Số lượng phải lớn hơn 0.");
            return;
        }
        if (currentStock < quantity) {
            toast.error(
                `Số lượng điều chuyển không được lớn hơn số lượng tồn kho hiện có (${currentStock}).`
            );
            return;
        }
        if( isEditing && updatedCurrentStock < quantity) {
            toast.error(
                `Số lượng điều chuyển không được lớn hơn số lượng tồn kho hiện có (${updatedCurrentStock}).`
            );
            return;
        }

        try {
            if (isEditing) {
                const updatedData = [...BinStackingData];
                updatedData[editingBinStackingIndex] = { ...recordToSave };
                setBinStackingData(updatedData);
                toast.success("Cập nhật thông tin thành công!");
                // Reset editing state
                setEditingBinStackingIndex(null);
                setEditingBinStackingRecord({
                    warehouse: "",
                    item: "",
                    batch: "",
                    quantity: "",
                    bin: "",
                });
                onClose();
            } else {
                // Thêm mới từ BinStackingRecord
                setBinStackingData([...BinStackingData, BinStackingRecord]);
                toast.success("Thêm bản ghi mới thành công!");
                setItemOptions([]);
                setBatchOptions([]);
                // Reset form
                const inheritedWarehouse = BinStackingData.length > 0 ? BinStackingData[0].warehouse : warehouse;
                setBinStackingRecord({
                    warehouse: inheritedWarehouse,
                    item: "",
                    batch: "",
                    quantity: "",
                    bin: "",
                });
                await getDefaultBinItemsByWarehouse(inheritedWarehouse);
            }
        } catch (error) {
            console.error("Error in saveBinStackingRecord:", error);
            toast.error("Có lỗi xảy ra khi lưu dữ liệu!");
        }
    };

    const changeBinStackingRecord = (field, value) => {
        setBinStackingRecord({ ...BinStackingRecord, [field]: value });
    };

    const changeEditingBinStackingRecord = (field, value) => {
        setEditingBinStackingRecord(prev => ({ ...prev, [field]: value }));
    };

    const editBinStackingRecord = (index) => {
        setEditingBinStackingIndex(index);
        getBatchByItemDefaultBin(BinStackingData[index].item);
        setEditingBinStackingRecord(BinStackingData[index]);
        onOpen();
    };

    const deleteBinStackingRecord = (index) => {
        const updatedData = BinStackingData.filter((_, i) => i !== index);
        setBinStackingData(updatedData);

        if (updatedData.length === 0) {
            setBinStackingRecord((prev) => ({
                ...prev,
                warehouse: "",
                item: "",
                batch: "",
                quantity: "",
                bin: "",
            }));
            // Reset các options liên quan
            setItemOptions([]);
            setToBinOptions([]);
        }

        toast.success("Xóa bản ghi thành công!");
    };

    const handleExecuteBinStacking = (e) => {
        const data = {
            fromWarehouse: BinStackingData[0].warehouse,
            toWarehouse: BinStackingData[0].warehouse,
            body: BinStackingData.map((item) => ({
                item: item.item,
                batch: item.batch,
                quantity: item.quantity,
                bin: item.bin,
            })),
        }
        console.log(data);
    };

    // Bin Transfer
    const saveBinTransferRecord = async () => {
        const isEditing = editingBinTransferIndex !== null;
        const recordToSave = isEditing ? editingBinTransferRecord : BinTransferRecord;
        
        const { fromWarehouse, fromBin, item, quantity, toWarehouse, toBin } = recordToSave;
        if (!fromWarehouse) {
            toast.error("Kho điều chuyển không được để trống.");
            return;
        }
        if (!fromBin) {
            toast.error("Bin điều chuyển không được để trống.");
            return;
        }
        if (!item) {
            toast.error("Sản phẩm điều chuyển không được để trống.");
            return;
        }
        if (!quantity) {
            toast.error("Số lượng không được để trống.");
            return;
        }
        if (!toWarehouse) {
            toast.error("Kho chuyển đến không được để trống.");
            return;
        }
        if (!toBin) {
            toast.error("Bin chuyển đến không được để trống.");
            return;
        }

        try {
            if (isEditing) {
                const updatedData = [...BinTransferData];
                updatedData[editingBinTransferIndex] = { ...recordToSave };
                setBinTransferData(updatedData);
                toast.success("Cập nhật thông tin thành công!");
                // Reset editing state
                setEditingBinTransferIndex(null);
                setEditingBinTransferRecord({
                    fromWarehouse: "",
                    fromBin: "",
                    item: "",
                    quantity: "",
                    toWarehouse: "",
                    toBin: "",
                });
                onClose();
            } else {
                // Thêm mới từ BinTransferRecord
                setBinTransferData([...BinTransferData, BinTransferRecord]);
                toast.success("Thêm bản ghi mới thành công!");
                setItemOptions([]);
                setBatchOptions([]);
                // Reset form
                const inheritedFromWarehouse = BinTransferData.length > 0 ? BinTransferData[0].fromWarehouse : fromWarehouse;
                const inheritedToWarehouse = BinTransferData.length > 0 ? BinTransferData[0].toWarehouse : toWarehouse;
                setBinTransferRecord({
                    fromWarehouse: inheritedFromWarehouse,
                    fromBin: "",
                    item: "",
                    quantity: "",
                    toWarehouse: inheritedToWarehouse,
                    toBin: "",
                });
                await getFromBinByWarehouse(inheritedFromWarehouse);
                await getToBinByWarehouse(inheritedToWarehouse);
            }
        } catch (error) {
            console.error("Error in saveBinTransferRecord:", error);
            toast.error("Có lỗi xảy ra khi lưu dữ liệu!");
        }
    };

    const changeBinTransferRecord = (field, value) => {
        setBinTransferRecord({ ...BinTransferRecord, [field]: value });
    };

    const changeEditingBinTransferRecord = (field, value) => {
        setEditingBinTransferRecord(prev => ({ ...prev, [field]: value }));
    };

    const deleteBinTransferRecord = (index) => {
        const updatedData = BinTransferData.filter((_, i) => i !== index);
        setBinTransferData(updatedData);
        toast.success("Bản ghi và được xóa.");
    };

    const editBinTransferRecord = (index) => {
        setEditingBinTransferIndex(index);
        getBatchByItem(BinTransferData[index].item);
        setEditingBinTransferRecord(BinTransferData[index]);
        onOpen();
    };

    const getBinManagedWarehouse = async () => {
        setInitialLoading(true);
        try {
            const res = await goodsManagementApi.getBinManagedWarehouse();

            const fromWarehouseOptions =
                res
                    ?.filter((item) => item.U_FAC === user.plant)
                    .map((item) => ({
                        value: item.WhsCode,
                        label: item.WhsName,
                    })) || [];

            const toWarehouseOptions =
                res?.map((item) => ({
                    value: item.WhsCode,
                    label: item.WhsName,
                })) || [];

            setFromWarehouseOptions(fromWarehouseOptions);
            setToWarehouseOptions(toWarehouseOptions);
            setInitialLoading(false);
        } catch (error) {
            setInitialLoading(false);
            toast.error("Không thể tải dữ liệu, hãy thử lại sau.");
        }
    };

    const getDefaultBinItemsByWarehouse = async (warehouse) => {
        setIsDefaultBinItemsLoading(true);
        try {
            const res = await goodsManagementApi.getDefaultBinItemsByWarehouse(
                warehouse
            );
            console.log(res);
            const itemOptions =
                res.ItemData?.map((item) => ({
                    value: item.ItemCode,
                    label: `${item.ItemCode} - ${item.ItemName}`,
                    name: item.ItemName,
                })) || [];

            setItemOptions(itemOptions);
            setTempItemOptions(itemOptions);
            setIsDefaultBinItemsLoading(false);
        } catch (error) {
            console.log(error);
            toast.error("Không thể tải dữ liệu, hãy thử lại sau.");
            setIsDefaultBinItemsLoading(false);
        }
    };

    const getBatchByItemDefaultBin = async (item) => {
        const isBinStackingEditing = editingBinStackingRecord.item !== null;
        console.log(isBinStackingEditing);
        setIsBatchByItemDefaultBinLoading(true);
        try {
            const res = await goodsManagementApi.getBatchByItemDefaultBin(
                BinStackingRecord.warehouse,
                item
            );

            if (res.BatchData.length > 0) {
                setBatchOptions(
                    res.BatchData.map((batch) => ({
                        value: batch.batchNum,
                        label: `${batch.batchNum}`,
                        onHand: batch.onHand,
                    }))
                );
                setCurrentStock(0);
            } else {
                setBatchOptions([]);
                setCurrentStock(res.OnHand);
            }

            if (isBinStackingEditing) {
                if (res.BatchData.length > 0) {
                    setUpdatedBatchOptions(
                        res.BatchData.map((batch) => ({
                            value: batch.batchNum,
                            label: `${batch.batchNum}`,
                            onHand: batch.onHand,
                        }))
                    );
                    setUpdatedCurrentStock(0);
                } else {
                    setUpdatedBatchOptions([]);
                    setUpdatedCurrentStock(res.OnHand);
                }
            }
            setIsBatchByItemDefaultBinLoading(false);
        } catch (error) {
            console.log(error);
            toast.error("Không thể tải dữ liệu, hãy thử lại sau.");
            setIsBatchByItemDefaultBinLoading(false);
        }
    };

    const getStackBinByWarehouse = async (warehouse) => {
        try {
            const res = await goodsManagementApi.getBinByWarehouse(warehouse);

            const stackBinOptions =
                res?.map((item) => ({
                    value: item.AbsEntry,
                    label: item.BinCode,
                })) || [];

            setStackBinOptions(stackBinOptions);
        } catch (error) {
            setInitialLoading(false);
            toast.error("Có lỗi trong quá trình lấy dữ liệu. Hãy thử lại sau.");
        }
    };


    const getFromBinByWarehouse = async (warehouse) => {
        setIsFromBinByWarehouseLoading(true);
        try {
            // const res = await goodsManagementApi.getBinByWarehouse(warehouse);
            const res = await goodsManagementApi.getAllBinByWarehouse(warehouse);

            const fromBinOptions =
            res?.map((item) => ({
                value: item.AbsEntry,
                label: item.BinCode,
            })) || [];

            setFromBinOptions(fromBinOptions);
            setIsFromBinByWarehouseLoading(false);
        } catch (error) {
            setIsFromBinByWarehouseLoading(false);
            toast.error("Có lỗi trong quá trình lấy dữ liệu. Hãy thử lại sau.");
        }
    };

    const getToBinByWarehouse = async (warehouse) => {
        setIsToBinByWarehouseLoading(true);
        try {
            const res = await goodsManagementApi.getBinByWarehouse(warehouse);
            // setBinTransferRecord({ ...BinTransferRecord, toBin: "" });
            const toBinOptions =
                res?.map((item) => ({
                    value: item.AbsEntry,
                    label: item.BinCode,
                })) || [];

            setIsToBinByWarehouseLoading(false);
            setToBinOptions(toBinOptions);
        } catch (error) {
            setIsToBinByWarehouseLoading(false);
            toast.error("Có lỗi trong quá trình lấy dữ liệu. Hãy thử lại sau.");
        }
    };

    const getItemsByBin= async (bin) => {
        setIsGetItemByBinLoading(true);
        try {
            const res = await goodsManagementApi.getItemsByBin(
                BinTransferRecord.fromWarehouse,
                bin
            );
            console.log(res);
            const itemOptions =
                res.ItemData?.map((item) => ({
                    value: item.ItemCode,
                    label: `${item.ItemCode} - ${item.ItemName}`,
                    name: item.ItemName,
                })) || [];

            setItemOptions(itemOptions);
            setTempItemOptions(itemOptions);
            setIsGetItemByBinLoading(false);
        } catch (error) {
            console.log(error);
            toast.error("Không thể tải dữ liệu, hãy thử lại sau.");
            setIsGetItemByBinLoading(false);
        }
    };

    const getBatchByItem = async (item) => {
        const isBinTransferEditing = editingBinStackingRecord.item !== null;
        setIsBatchByItemLoading(true);
        const bin = isBinTransferEditing
            ? fromBinOptions.find((bin) => bin.value === editingBinTransferRecord.fromBin)?.label
            : fromBinOptions.find((bin) => bin.value === BinTransferRecord.fromBin)?.label;
        console.log(bin);
        try {
            const res = await goodsManagementApi.getBatchByItem(
                BinTransferRecord.fromWarehouse,
                bin,
                item
            );

            if (res.BatchData.length > 0) {
                setBatchOptions(
                    res.BatchData.map((batch) => ({
                        value: batch.batchNum,
                        label: `${batch.batchNum}`,
                        onHand: batch.onHand,
                    }))
                );
                setCurrentStock(0);
            } else {
                setBatchOptions([]);
                setCurrentStock(res.OnHand);
            }

            if (isBinTransferEditing) {
                if (res.BatchData.length > 0) {
                    setUpdatedBatchOptions(
                        res.BatchData.map((batch) => ({
                            value: batch.batchNum,
                            label: `${batch.batchNum}`,
                            onHand: batch.onHand,
                        }))
                    );
                    setUpdatedCurrentStock(0);
                } else {
                    setUpdatedBatchOptions([]);
                    setUpdatedCurrentStock(res.OnHand);
                }
            }
            setIsBatchByItemLoading(false);
        } catch (error) {
            console.log(error);
            toast.error("Không thể tải dữ liệu, hãy thử lại sau.");
            setIsBatchByItemLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (isMounted) {
                await getBinManagedWarehouse();
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center bg-transparent ">
                {/* Section */}
                <div className="w-screen mb-4 xl:mb-4 pt-2 px-0 xl:p-12 xl:pt-4 lg:pt-4 md:pt-4 lg:p-12 md:p-12 p-4 xl:px-24">
                    {/* Go back */}
                    <div
                        className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B] xl:ml-0 lg:ml-0 md:ml-0 ml-4"
                        onClick={() =>
                            BinStackingData?.length === 0 &&
                            BinTransferData?.length === 0
                                ? navigate(-1)
                                : onExitConfirmOpen()
                        }
                    >
                        <IoMdArrowRoundBack />
                        <div>Quay lại</div>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between px-4 xl:px-0 lg:px-0 md:px-0 items-center">
                        <div className="serif xl:text-4xl lg:text-4xl md:text-4xl text-3xl font-bold ">
                            Điều chuyển hàng hóa{" "}
                        </div>
                    </div>

                    <div className="mt-2 my-3 bg-white rounded-lg ">
                        <Tabs
                            variant="enclosed"
                            index={tabIndex}
                        >
                            <TabList className="bg-gray-100 rounded-t-lg">
                                <Tab onClick={() => handleTabChange(0)}>
                                    <div className="py-1 flex items-center space-x-2 font-medium">
                                        <BiSolidCabinet className="w-5 h-5" />
                                        <div className="font-semibold ">
                                            Xếp bin
                                        </div>
                                    </div>
                                </Tab>
                                <Tab onClick={() => handleTabChange(1)} className="py-2">
                                    <div className="py-1 flex items-center space-x-2 font-medium">
                                        <MdWarehouse className="w-5 h-5" />
                                        <div className="font-semibold">
                                            Chuyển bin, kho
                                        </div>
                                    </div>
                                </Tab>
                            </TabList>
                            <TabPanels className="!px-0">
                                <TabPanel>
                                    <div className="px-2 ">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-3 gap-x-3 w-full">
                                                <div className="col-span-1 flex flex-col justify-between">
                                                    <div className="mb-1 text-[15px] font-medium">
                                                        Kho xếp bin{" "}
                                                        <span className="text-lg text-red-600">
                                                            {" "}
                                                            *
                                                        </span>
                                                    </div>
                                                    <Select
                                                        value={
                                                            fromWarehouseOptions.find(
                                                                (warehouse) =>
                                                                    warehouse.value ===
                                                                    BinStackingRecord.warehouse
                                                            ) || null
                                                        }
                                                        placeholder="Chọn kho xếp bin"
                                                        className="text-[15px]"
                                                        isDisabled={
                                                            BinStackingData.length >
                                                            0
                                                        }
                                                        options={
                                                            fromWarehouseOptions
                                                        }
                                                        onChange={(option) => {
                                                            console.log(
                                                                "Selected Warehouse:",
                                                                option
                                                            );
                                                            getDefaultBinItemsByWarehouse(
                                                                option?.value
                                                            );
                                                            getStackBinByWarehouse(
                                                                option?.value
                                                            );
                                                            changeBinStackingRecord(
                                                                "warehouse",
                                                                option?.value
                                                            );
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-span-2 flex flex-col justify-between">
                                                    <div className="mb-1 text-[15px] font-medium">
                                                        Sản phẩm điều chuyển{" "}
                                                        <span className="text-lg text-red-600">
                                                            {" "}
                                                            *
                                                        </span>
                                                    </div>
                                                    <Select
                                                        value={
                                                            itemOptions.find(
                                                                (item) =>
                                                                    item.value ==
                                                                    BinStackingRecord.item
                                                            ) || null
                                                        }
                                                        placeholder="Chọn sản phẩm"
                                                        className=" text-[15px]"
                                                        options={itemOptions}
                                                        isDisabled={
                                                            isDefaultBinItemsLoading
                                                        }
                                                        onChange={(option) => {
                                                            console.log(
                                                                "Selected Item:",
                                                                option
                                                            );
                                                            changeBinStackingRecord(
                                                                "item",
                                                                option?.value
                                                            );
                                                            getBatchByItemDefaultBin(
                                                                option?.value
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-x-3">
                                                <div className="col-span-1 w-full flex flex-col justify-between">
                                                    <div className="mb-1 text-[15px] font-medium">
                                                        Mã lô hàng
                                                    </div>
                                                    <Select
                                                        value={
                                                            batchOptions.find(
                                                                (batch) =>
                                                                    batchOptions.value ===
                                                                    BinStackingRecord.batch
                                                            ) || null
                                                        }
                                                        isDisabled={
                                                            batchOptions.length ===
                                                            0 || BinStackingRecord.item !== null
                                                        }
                                                        placeholder="Chọn mã lô hàng"
                                                        className=" text-[15px]"
                                                        options={batchOptions}
                                                        onChange={(option) => {
                                                            console.log(
                                                                "Selected Batch:",
                                                                option
                                                            );
                                                            changeBinStackingRecord(
                                                                "batch",
                                                                option?.value
                                                            );
                                                            setCurrentStock(
                                                                option?.onHand ||
                                                                    0
                                                            );
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-span-1 w-full flex flex-col justify-between ">
                                                    <div className="mb-1 text-[15px] font-medium">
                                                        Số lượng điều chuyển{" "}
                                                        <span className="text-lg text-red-600">
                                                            {" "}
                                                            *
                                                        </span>
                                                    </div>
                                                    <input
                                                        id="batch_id"
                                                        placeholder="Nhập số lượng"
                                                        className=" border border-gray-300 text-gray-900 text-[15px] rounded-md focus:ring-blue-500 focus:border-blue-500 block  p-[7px] px-3"
                                                        value={
                                                            BinStackingRecord.quantity
                                                        }
                                                        onChange={(e) => {
                                                            changeBinStackingRecord(
                                                                "quantity",
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                )
                                                            );
                                                        }}
                                                    />
                                                </div>

                                                <div className="col-span-1 w-full flex flex-col justify-between">
                                                    <div className="mb-1 text-[15px] font-medium">
                                                        Chuyển đến bin{" "}
                                                        <span className="text-lg text-red-600">
                                                            {" "}
                                                            *
                                                        </span>
                                                    </div>
                                                    <Select
                                                        value={
                                                            stackBinOptions.find(
                                                                (bin) =>
                                                                    bin.value ===
                                                                    BinStackingRecord.bin
                                                            ) || null
                                                        }
                                                        placeholder="Chọn bin chuyển đến"
                                                        options={stackBinOptions}
                                                        className="text-[15px]"
                                                        onChange={(option) => {
                                                            console.log(
                                                                "Selected Bin:",
                                                                option
                                                            );
                                                            changeBinStackingRecord(
                                                                "bin",
                                                                option?.value
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 items-center flex justify-between">
                                            <div className="flex items-center space-x-6">
                                                {BinStackingRecord.item &&
                                                    !isBatchByItemDefaultBinLoading && (
                                                        <div className="flex flex-col items-start mt-2">
                                                            {batchOptions.length ===
                                                            0 ? (
                                                                <div className="text-red-500 font-semibold text-[15px]">
                                                                    Sản phẩm
                                                                    hiện tại
                                                                    không có lô
                                                                    hàng nào.
                                                                </div>
                                                            ) : (
                                                                <div className="text-green-500 font-semibold text-[15px]">
                                                                    Vui lòng
                                                                    chọn mã lô.
                                                                </div>
                                                            )}
                                                            <div className="text-red-500 text-[15px]">
                                                                Tồn kho hiện có
                                                                :{" "}
                                                                {currentStock?.toLocaleString(
                                                                    "en-US"
                                                                ) || 0}
                                                            </div>
                                                        </div>
                                                    )}
                                                <button
                                                    className="w-fit h-full space-x-2 flex items-center bg-cyan-800 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                                    onClick={() => {
                                                        console.log(
                                                            "Thống tin xếp bin",
                                                            BinStackingRecord
                                                        );
                                                        console.log(
                                                            "Danh sách kho đi",
                                                            fromWarehouseOptions
                                                        );
                                                        console.log(
                                                            "Danh sách kho đến",
                                                            toWarehouseOptions
                                                        );
                                                    }}
                                                >
                                                    <div className="text-[15px]">
                                                        In ra dữ liệu
                                                    </div>
                                                </button>
                                            </div>

                                            <button
                                                className="w-fit h-full space-x-2 flex items-center bg-gray-800 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                                onClick={() => {
                                                    saveBinStackingRecord();
                                                }}
                                            >
                                                <FaPlus className="w-3 h-3" />
                                                <p className="text-[15px]">
                                                    Thêm thông tin
                                                </p>
                                            </button>
                                        </div>

                                        <div className="my-4 border-b border-gray-200"></div>

                                        <div className="overflow-x-auto">
                                            {BinStackingData.length > 0 ? (
                                                <>
                                                    <div className="min-w-full border border-gray-300 text-[15px] text-left text-gray-700">
                                                        <table className="w-full table-fixed">
                                                            <thead className="bg-gray-100">
                                                                <tr>
                                                                    <th className="!w-[180px] px-6 py-3 border border-gray-300">
                                                                        Kho xếp
                                                                        bin
                                                                    </th>
                                                                    <th className="!w-[420px] px-6 py-3 border border-gray-300">
                                                                        Sản phẩm
                                                                        điều
                                                                        chuyển
                                                                    </th>
                                                                    <th className="w-[200px] px-6 py-3 border border-gray-300">
                                                                        Mã lô
                                                                        hàng
                                                                    </th>
                                                                    <th className="w-[100px] px-3 text-center py-3 border border-gray-300">
                                                                        Số lượng
                                                                    </th>
                                                                    <th className="w-[240px] px-6 py-3 border border-gray-300">
                                                                        Bin
                                                                        chuyển
                                                                        đến
                                                                    </th>
                                                                    <th className="max-w-[200px] px-3 text-center py-3 border border-gray-300 pr-[17px]">
                                                                        Hành
                                                                        động
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                        </table>
                                                        <div className="max-h-[500px] overflow-y-auto">
                                                            <table className="w-full table-fixed">
                                                                <tbody>
                                                                    {BinStackingData.map(
                                                                        (
                                                                            row,
                                                                            index
                                                                        ) => (
                                                                            <tr
                                                                                key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}
                                                                            >
                                                                                <td className="w-[180px] text-bottom px-6 py-3 border border-gray-300">
                                                                                    {
                                                                                        row.warehouse
                                                                                    }
                                                                                </td>
                                                                                <td className="!w-[420px] px-6 py-3 border border-gray-300">
                                                                                    <div className="flex flex-col justify-start gap-x-2">
                                                                                        <div className="text-xs  text-gray-500">
                                                                                            {
                                                                                                row.item
                                                                                            }
                                                                                        </div>
                                                                                        <div className="font-semibold">
                                                                                            {tempItemOptions.find(
                                                                                                (
                                                                                                    item
                                                                                                ) =>
                                                                                                    item.value ===
                                                                                                    row.item
                                                                                            )
                                                                                                ?.name ||
                                                                                                "Không tìm thấy"}
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="w-[200px] px-6 py-3 border border-gray-300">
                                                                                    {row.batch ||
                                                                                        "Không xác định"}
                                                                                </td>
                                                                                <td className="w-[100px] px-3 py-3 border text-center border-gray-300">
                                                                                    {
                                                                                        row.quantity
                                                                                    }
                                                                                </td>
                                                                                <td className="w-[240px] px-6 py-3 border border-gray-300">
                                                                                    {toBinOptions.find(
                                                                                        (
                                                                                            item
                                                                                        ) =>
                                                                                            item.value ===
                                                                                            row.bin
                                                                                    )
                                                                                        ?.label ||
                                                                                        "Không tìm thấy"}
                                                                                </td>
                                                                                <td className="px-6 py-3 space-x-2 border border-gray-300 text-center">
                                                                                    <button
                                                                                        className="text-orange-500 py-1 rounded-md active:scale-[.95] active:duration-75 transition-all"
                                                                                        onClick={() => {
                                                                                            setType(
                                                                                                "bin_stacking"
                                                                                            ),
                                                                                                editBinStackingRecord(
                                                                                                    index
                                                                                                );
                                                                                        }}
                                                                                    >
                                                                                        <HiOutlinePencilAlt className="w-6 h-6" />
                                                                                    </button>
                                                                                    <button
                                                                                        className="text-red-600 py-1 rounded-md active:scale-[.95] active:duration-75 transition-all"
                                                                                        onClick={() => {
                                                                                            setType(
                                                                                                "bin_stacking"
                                                                                            ),
                                                                                                deleteBinStackingRecord(
                                                                                                    index
                                                                                                );
                                                                                        }}
                                                                                    >
                                                                                        <HiOutlineTrash className="w-6 h-6" />
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 w-full flex items-center justify-between">
                                                        <div className="text-gray-500">
                                                            Tổng:{" "}
                                                            {
                                                                BinStackingData?.length || 0
                                                            }{" "}
                                                        </div>
                                                        <button
                                                            className="w-fit h-full space-x-2 flex items-center bg-[#17506B] p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                                            onClick={() => {
                                                                onConfirmOpen();
                                                            }}
                                                        >
                                                            <p className="text-[15px]">
                                                                Xếp bin
                                                            </p>
                                                            <FaArrowRight className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-4 pb-8 gap-y-3">
                                                    <img
                                                        src={EmptyState}
                                                        alt="EmptyState"
                                                        className="w-[135px] h-[135px] opacity-60 object-contain"
                                                    />
                                                    <div className="text-center">
                                                        <div className="font-semibold text-xl">
                                                            Hiện tại không có
                                                            thông tin ghi nhận
                                                            nào.
                                                        </div>
                                                        <div className="text-gray-500 mt-1">
                                                            Khi bạn thêm mới
                                                            thông tin xếp bin,
                                                            dữ liệu sẽ được hiển
                                                            thị tại đây.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabPanel>
                                <TabPanel>
                                    <div className="px-2">
                                        {/* Bin Transfrom Input */}
                                        <div className=" space-y-3">
                                            <div className="grid grid-cols-2 gap-x-3">
                                                <div className="col-span-1 w-full flex flex-col justify-between">
                                                    <div className="mb-1 text-[15px] font-medium">
                                                        Chuyển từ kho{" "}
                                                        <span className="text-lg text-red-600">
                                                            {" "}
                                                            *
                                                        </span>
                                                    </div>
                                                    <Select
                                                        value={fromWarehouseOptions?.find(
                                                            (warehouse) =>
                                                                warehouse.value ===
                                                                BinTransferRecord.fromWarehouse
                                                        ) || null}
                                                        isDisabled={BinTransferData.length > 0}
                                                        placeholder="Chọn kho"
                                                        className="text-[15px]"
                                                        options={
                                                            fromWarehouseOptions
                                                        }
                                                        onChange={(option) => {
                                                            console.log(
                                                                "Selected From Warehouse:",
                                                                option
                                                            );
                                                            getFromBinByWarehouse(
                                                                option?.value
                                                            );
                                                            changeBinTransferRecord(
                                                                "fromWarehouse",
                                                                option?.value
                                                            );
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-span-1 w-full flex flex-col justify-between">
                                                    <div className="mb-1 text-[15px] font-medium">
                                                        Chuyển từ bin{" "}
                                                        <span className="text-lg text-red-600">
                                                            {" "}
                                                            *
                                                        </span>
                                                    </div>
                                                    <Select
                                                        value={fromBinOptions?.find(
                                                            (bin) =>
                                                                bin.value ===
                                                                BinTransferRecord.fromBin
                                                        ) || null}
                                                        isDisabled={
                                                            BinTransferRecord.fromWarehouse !== "" && isFromBinByWarehouseLoading
                                                        }
                                                        placeholder="Chọn bin"
                                                        className="text-[15px]"
                                                        options={fromBinOptions}
                                                        onChange={(option) => {
                                                            console.log(
                                                                "Selected From Bin:",
                                                                option
                                                            );
                                                            getItemsByBin(option?.label);
                                                            changeBinTransferRecord(
                                                                "fromBin",
                                                                option?.value
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1">
                                                <div className="col-span-1 w-full flex flex-col justify-between">
                                                    <div className="mb-1 text-[15px] font-medium">
                                                        Sản phẩm điều chuyển{" "}
                                                        <span className="text-lg text-red-600">
                                                            {" "}
                                                            *
                                                        </span>
                                                    </div>
                                                    <Select
                                                        value={itemOptions?.find(
                                                            (item) =>
                                                                item.value ===
                                                                BinTransferRecord.item
                                                        ) || null}
                                                        placeholder="Chọn sản phẩm"
                                                        className="text-[15px]"
                                                        isDisabled={
                                                            BinTransferRecord.fromBin !== "" && isGetItemByBinLoading
                                                        }
                                                        options={itemOptions}
                                                        onChange={(option) => {
                                                            console.log(
                                                                "Selected Item:",
                                                                option
                                                            );
                                                            getBatchByItem(
                                                                option?.value
                                                            )
                                                            changeBinTransferRecord(
                                                                "item",
                                                                option?.value
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex w-full gap-x-3">
                                                <div className="col-span-1 w-1/2 flex flex-col justify-between">
                                                    <div className=" text-[15px] font-medium">
                                                        Mã lô hàng
                                                    </div>
                                                    <Select
                                                        value={batch.find(
                                                            (batch) =>
                                                                batch.value ===
                                                                BinTransferRecord.batch
                                                        )}
                                                        placeholder="Chọn mã lô hàng"
                                                        isDisabled={
                                                            batchOptions.length === 0 || BinTransferRecord.item === ""
                                                        }
                                                        className="mt-1 text-[15px]"
                                                        options={batch}
                                                        onChange={(option) => {
                                                            console.log(
                                                                "Selected Batch:",
                                                                option
                                                            );
                                                            changeBinTransferRecord(
                                                                "batch",
                                                                option?.value
                                                            );
                                                        }}
                                                    />
                                                </div>

                                                <div className="col-span-1 w-1/2 flex flex-col justify-between">
                                                    <div className="mb-1 text-[15px] font-medium">
                                                        Số lượng điều chuyển{" "}
                                                        <span className="text-lg text-red-600">
                                                            {" "}
                                                            *
                                                        </span>
                                                    </div>
                                                    <input
                                                        id="batch_id"
                                                        placeholder="Nhập số lượng"
                                                        className=" border border-gray-300 text-gray-900 text-[15px] rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-[7px] px-3"
                                                        value={
                                                            BinTransferRecord.quantity
                                                        }
                                                        onChange={(e) => {
                                                            changeBinTransferRecord(
                                                                "quantity",
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                )
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-3 ">
                                                <div className="">
                                                    <div className="mb-1 text-[15px] font-medium">
                                                        Chuyển đến kho{" "}
                                                        <span className="text-lg text-red-600">
                                                            {" "}
                                                            *
                                                        </span>
                                                    </div>
                                                    <Select
                                                        value={toWarehouseOptions?.find(
                                                            (warehouse) =>
                                                                warehouse.value ===
                                                                BinTransferRecord.toWarehouse
                                                        ) || null}
                                                        isDisabled={BinTransferData.length > 0}
                                                        placeholder="Chọn kho chuyến đến"
                                                        options={
                                                            toWarehouseOptions
                                                        }
                                                        className="text-[15px]"
                                                        onChange={(option) => {
                                                            console.log(
                                                                "Selected To Warehouse:",
                                                                option
                                                            );
                                                            getToBinByWarehouse(
                                                                option?.value
                                                            )
                                                            changeBinTransferRecord(
                                                                "toWarehouse",
                                                                option?.value
                                                            );
                                                        }}
                                                    />
                                                </div>
                                                <div className="">
                                                    <div className="mb-1 text-[15px] font-medium">
                                                        Chuyển đến bin{" "}
                                                        <span className="text-lg text-red-600">
                                                            {" "}
                                                            *
                                                        </span>
                                                    </div>                                 
                                                    <Select
                                                        value={toBinOptions?.find(
                                                            (bin) =>
                                                                bin.value ===
                                                                BinTransferRecord.toBin
                                                        ) || null}
                                                        isDisabled={
                                                            BinTransferRecord.toWarehouse !== "" && isToBinByWarehouseLoading
                                                        }
                                                        placeholder="Chọn bin chuyển đến"
                                                        options={toBinOptions}
                                                        className="text-[15px]"
                                                        onChange={(option) => {
                                                            console.log(
                                                                "Selected To Bin:",
                                                                option
                                                            );
                                                            changeBinTransferRecord(
                                                                "toBin",
                                                                option?.value
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between pt-4">
                                            <div className="flex items-center  space-x-3">
                                                {BinTransferRecord.item &&
                                                    !isBatchByItemLoading && (
                                                        <div className="flex flex-col items-start mt-2">
                                                            {batchOptions.length ===
                                                            0 ? (
                                                                <div className="text-red-500 font-semibold text-[15px]">
                                                                    Sản phẩm
                                                                    hiện tại
                                                                    không có lô
                                                                    hàng nào.
                                                                </div>
                                                            ) : (
                                                                <div className="text-green-500 font-semibold text-[15px]">
                                                                    Vui lòng
                                                                    chọn mã lô.
                                                                </div>
                                                            )}
                                                            <div className="text-red-500 text-[15px]">
                                                                Tồn kho hiện có
                                                                :{" "}
                                                                {currentStock?.toLocaleString(
                                                                    "en-US"
                                                                ) || 0}
                                                            </div>
                                                        </div>
                                                    )}
                                                <button
                                                    className="w-fit h-full space-x-2 flex items-center bg-cyan-800 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                                    onClick={() => {
                                                        console.log(
                                                            BinTransferRecord
                                                        );
                                                        console.log(
                                                            "Danh sách kho đi",
                                                            fromWarehouseOptions
                                                        );
                                                        console.log(
                                                            "Danh sách kho đến",
                                                            toWarehouseOptions
                                                        );
                                                    }}
                                                >
                                                    <div className="text-[15px]">
                                                        In ra dữ liệu
                                                    </div>
                                                </button>
                                            </div>
                                            <div className=" items-center flex justify-between">
                                                <button
                                                    className="w-fit h-full space-x-2 flex items-center bg-gray-800 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                                    onClick={() => {
                                                        saveBinTransferRecord();
                                                    }}
                                                >
                                                    <FaPlus className="w-3 h-3" />
                                                    <p className="text-[15px]">
                                                        Thêm thông tin
                                                    </p>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="my-4 border-b border-gray-200"></div>

                                        {/* Bin Transfrom Records*/}
                                        <div className="">
                                            <div className="overflow-x-auto">
                                                {BinTransferData.length > 0 ? (
                                                    <>
                                                        <div className="min-w-full border border-b-0 border-gray-300 text-[15px] text-left text-gray-700">
                                                            <table className="w-full table-fixed">
                                                                <thead className="bg-gray-100">
                                                                    <tr>
                                                                        <th className="w-[140px] px-2 text-center py-3 border border-gray-300">
                                                                            Chuyển
                                                                            từ kho
                                                                        </th>
                                                                        <th className="w-[140px] px-2 text-center py-3 border border-gray-300">
                                                                            Chuyển
                                                                            từ bin
                                                                        </th>
                                                                        <th className="w-[350px] px-2 py-3 text-center border border-gray-300">
                                                                            Sản phẩm
                                                                            điều
                                                                            chuyển
                                                                        </th>
                                                                        <th className="w-[130px] px-3 text-center py-3 border border-gray-300">
                                                                            Mã lô
                                                                            hàng
                                                                        </th>
                                                                        <th className="w-[100px] px-2 text-center py-3 border border-gray-300">
                                                                            Số lượng
                                                                        </th>
                                                                        <th className="w-[140px] px-2 text-center py-3 border border-gray-300">
                                                                            Chuyển
                                                                            tới kho
                                                                        </th>
                                                                        <th className="w-[140px] px-3 text-center py-3 border border-gray-300">
                                                                            Chuyển
                                                                            tới bin
                                                                        </th>
                                                                        <th className="max-w-[150px] px-2 text-center py-3 border border-gray-300">
                                                                            Hành
                                                                            động
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                            </table>
                                                        </div>
                                                        <div className="max-h-[520px] overflow-y-auto">
                                                            <table className="min-w-full border border-gray-300 border-t-0 text-[15px] text-left text-gray-700">
                                                                <tbody>
                                                                    {BinTransferData.map(
                                                                        (
                                                                            row,
                                                                            index
                                                                        ) => (
                                                                            <tr
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className={
                                                                                    index %
                                                                                        2 ===
                                                                                    0
                                                                                        ? "bg-gray-50"
                                                                                        : ""
                                                                                }
                                                                            >
                                                                                <td className="w-[140px] px-2 py-3 text-center border border-gray-300">
                                                                                    {
                                                                                        row.fromWarehouse
                                                                                    }
                                                                                </td>
                                                                                <td className="w-[140px] px-2 py-3 text-center border border-gray-300">
                                                                                    {fromBinOptions.find( ({value}) => value === row.fromBin )?.label || "Không tìm thấy"}
                                                                                </td>
                                                                                <td className="w-[350px] px-4 py-3 border border-gray-300">
                                                                                    <div className="flex flex-col justify-start gap-x-2">
                                                                                        <div className="text-xs text-gray-500">
                                                                                            {
                                                                                                row.item
                                                                                            }
                                                                                        </div>
                                                                                        <div className="font-semibold">
                                                                                            {tempItemOptions?.find(
                                                                                                ({
                                                                                                    value,
                                                                                                }) =>
                                                                                                    value ===
                                                                                                    row.item
                                                                                            )
                                                                                                ?.label ||
                                                                                                "Không tìm thấy"}
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="w-[130px] px-2 py-3 text-center border border-gray-300">
                                                                                    {row.batch ||
                                                                                        "Không xác định"}
                                                                                </td>
                                                                                <td className="w-[100px] px-2 py-3 text-center border border-gray-300">
                                                                                    {
                                                                                        row.quantity
                                                                                    }
                                                                                </td>
                                                                                <td className="w-[140px] px-2 text-center py-3 border border-gray-300">
                                                                                    {
                                                                                        row.toWarehouse
                                                                                    }
                                                                                </td>
                                                                                <td className="w-[140px] px-2 text-center py-3 border border-gray-300">
                                                                                    {toBinOptions.find( ({value}) => value === row.toBin )?.label || "Không tìm thấy"}
                                                                                </td>
                                                                                <td className=" px-6 py-3 space-x-2 border border-gray-300 text-center">
                                                                                    <button
                                                                                        className="text-orange-500 py-1 rounded-md active:scale-[.95] active:duration-75 transition-all"
                                                                                        onClick={() =>
                                                                                            editBinTransferRecord(
                                                                                                index
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <HiOutlinePencilAlt className="w-6 h-6" />
                                                                                    </button>
                                                                                    <button
                                                                                        className="text-red-600 py-1 rounded-md active:scale-[.95] active:duration-75 transition-all"
                                                                                        onClick={() =>
                                                                                            deleteBinTransferRecord(
                                                                                                index
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <HiOutlineTrash className="w-6 h-6" />
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        )
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className="flex justify-between items-center w-full mt-4 ">
                                                            <div className="text-gray-500">
                                                                Tổng:{" "}
                                                                {
                                                                    BinTransferData?.length || 0
                                                                }{" "}
                                                            </div>
                                                            <button
                                                                className="w-fit h-full space-x-2 flex items-center bg-[#17506B] p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                                                onClick={() => {
                                                                    onConfirmOpen();
                                                                }}
                                                            >
                                                                <p className="text-[15px]">
                                                                    Điều chuyển
                                                                </p>
                                                                <FaArrowRight className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-4 pb-8 gap-y-3">
                                                        <img
                                                            src={EmptyState}
                                                            alt="EmptyState"
                                                            className="w-[135px] h-[135px] opacity-60 object-contain pointer-events-none"
                                                        />
                                                        <div className="text-center">
                                                            <div className="font-semibold text-xl">
                                                                Hiện tại không
                                                                có thông tin ghi
                                                                nhận nào.
                                                            </div>
                                                            <div className="text-gray-500 mt-1">
                                                                Khi bạn thêm mới
                                                                thông tin điều
                                                                chuyển, dữ liệu
                                                                sẽ được hiển thị
                                                                tại đây.
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </div>

                    {/* Information Modal */}
                    <Modal
                        isCentered
                        isOpen={isOpen}
                        onClose={onClose}
                        size="2xl"
                        blockScrollOnMount={false}
                        closeOnOverlayClick={false}
                    >
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>
                                Thông tin{" "}
                                {type == "bin_stacking"
                                    ? "xếp bin"
                                    : "điều chuyển"}
                            </ModalHeader>
                            <ModalBody>
                                {type == "bin_stacking" ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="mb-2 w-[30%] text-[15px] font-medium">
                                                Kho xếp bin{" "}
                                            </div>
                                            <Select
                                                value={fromWarehouseOptions.find(
                                                    (warehouse) =>
                                                        warehouse.value ==
                                                    editingBinStackingRecord.warehouse
                                                )}
                                                isDisabled={true}
                                                placeholder="Chọn kho xếp bin"
                                                className="w-[70%] text-[15px]"
                                                options={fromWarehouseOptions}
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected Warehouse:",
                                                        option
                                                    );
                                                    getDefaultBinItemsByWarehouse(
                                                        option?.value
                                                    );
                                                    getToBinByWarehouse(
                                                        option?.value
                                                    );
                                                    changeEditingBinStackingRecord(
                                                        "warehouse",
                                                        option?.value
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="mb-2 w-[30%] text-[15px] font-medium">
                                                Sản phẩm điều chuyển{" "}
                                            </div>
                                            <Select
                                                value={tempItemOptions?.find(
                                                    (item) =>
                                                        item.value ==
                                                    editingBinStackingRecord.item
                                                ) || null}
                                                isDisabled={true}
                                                placeholder="Chọn sản phẩm"
                                                className="w-[70%] text-[15px]"
                                                options={itemOptions}
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected Item:",
                                                        option
                                                    );
                                                    changeEditingBinStackingRecord(
                                                        "item",
                                                        option?.value
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="mb-2 w-[30%] text-[15px] font-medium">
                                                Mã lô hàng
                                            </div>
                                            <Select
                                                value={batch.find(
                                                    (batch) =>
                                                        batch.value ===
                                                    editingBinStackingRecord.batch
                                                )}
                                                isDisabled={true}
                                                placeholder="Chọn mã lô hàng"
                                                className="w-[70%] text-[15px]"
                                                options={batch}
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected Batch:",
                                                        option
                                                    );
                                                    changeEditingBinStackingRecord(
                                                        "batch",
                                                        option?.value
                                                    );
                                                    setUpdatedCurrentStock(
                                                        option?.onHand || 0
                                                    )
                                                }}
                                            />
                                        </div>
                                        {editingBinStackingRecord.item &&
                                                    !isBatchByItemDefaultBinLoading && (
                                                        <div className="flex flex-col items-start mt-2">
                                                            {updatedBatchOptions.length ===
                                                            0 ? (
                                                                <div className="text-red-500 font-semibold text-[15px]">
                                                                    Sản phẩm
                                                                    hiện tại
                                                                    không có lô
                                                                    hàng nào.
                                                                </div>
                                                            ) : (
                                                                <div className="text-green-500 font-semibold text-[15px]">
                                                                    Vui lòng
                                                                    chọn mã lô.
                                                                </div>
                                                            )}
                                                            <div className="text-red-500 text-[15px]">
                                                                Tồn kho hiện có
                                                                :{" "}
                                                                {updatedCurrentStock?.toLocaleString(
                                                                    "en-US"
                                                                ) || 0}
                                                            </div>
                                                        </div>
                                        )}
                                        <div className="flex items-center space-x-4">
                                            <div className="mb-2 w-[30%] text-[15px] font-medium">
                                                Số lượng điều chuyển{" "}
                                                <span className="text-lg text-red-600">
                                                    {" "}
                                                    *
                                                </span>
                                            </div>
                                            <input
                                                id="batch_id"
                                                placeholder="Nhập số lượng"
                                                className=" border border-gray-300 text-gray-900 text-[15px] rounded-md focus:ring-blue-500 focus:border-blue-500 block w-[70%] p-[7px] px-3"
                                                value={
                                                    editingBinStackingRecord.quantity
                                                }
                                                onChange={(e) => {
                                                    changeEditingBinStackingRecord(
                                                        "quantity",
                                                        Number(e.target.value)
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="mb-2 w-[30%] text-[15px] font-medium">
                                                Chuyển đến bin{" "}
                                                <span className="text-lg text-red-600">
                                                    {" "}
                                                    *
                                                </span>
                                            </div>
                                            <Select
                                                value={toBinOptions.find(
                                                    (bin) =>
                                                        bin.value ===
                                                    editingBinStackingRecord.bin
                                                )}
                                                // isDisabled={true}
                                                placeholder="Chọn bin chuyển đến"
                                                options={toBinOptions}
                                                className="w-[70%] text-[15px]"
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected Bin:",
                                                        option
                                                    );
                                                    changeEditingBinStackingRecord(
                                                        "bin",
                                                        option?.value
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="mb-2 w-[30%] text-[15px] font-medium">
                                                Chuyển từ kho{" "}
                                                <span className="text-lg text-red-600">
                                                    {" "}
                                                    *
                                                </span>
                                            </div>
                                            <Select
                                                value={fromWarehouseOptions.find(
                                                    (warehouse) =>
                                                        warehouse.value ===
                                                        editingBinTransferRecord.fromWarehouse
                                                )}
                                                isDisabled={true}
                                                placeholder="Chọn kho"
                                                className="w-[70%] text-[15px]"
                                                options={fromWarehouseOptions}
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected From Warehouse:",
                                                        option
                                                    );
                                                    changeEditingBinTransferRecord(
                                                        "fromWarehouse",
                                                        option?.value
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="mb-2 w-[30%] text-[15px] font-medium">
                                                Chuyển từ bin{" "}
                                                <span className="text-lg text-red-600">
                                                    {" "}
                                                    *
                                                </span>
                                            </div>
                                            <Select
                                                value={fromBinOptions.find(
                                                    (bin) =>
                                                        bin.value ===
                                                        editingBinTransferRecord.fromBin
                                                )}
                                                placeholder="Chọn bin"
                                                className="w-[70%] text-[15px]"
                                                options={fromBinOptions}
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected From Bin:",
                                                        option
                                                    );
                                                    changeEditingBinTransferRecord(
                                                        "fromBin",
                                                        option?.value
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="mb-2 w-[30%] text-[15px] font-medium">
                                                Sản phẩm điều chuyển{" "}
                                                <span className="text-lg text-red-600">
                                                    {" "}
                                                    *
                                                </span>
                                            </div>
                                            <Select
                                                value={tempItemOptions?.find(
                                                    (item) =>
                                                        item.value ===
                                                        editingBinTransferRecord.item
                                                ) || null}
                                                placeholder="Chọn sản phẩm"
                                                className="w-[70%] text-[15px]"
                                                options={itemOptions}
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected Item:",
                                                        option
                                                    );
                                                    changeEditingBinTransferRecord(
                                                        "item",
                                                        option?.value
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="mb-2 w-[30%] text-[15px] font-medium">
                                                Mã lô hàng
                                            </div>
                                            <Select
                                                value={batchOptions.find(
                                                    (batch) =>
                                                        batch.value ===
                                                        editingBinTransferRecord.batch
                                                )}
                                                isDisabled={true}
                                                placeholder="Chọn mã lô hàng"
                                                className="w-[70%] text-[15px]"
                                                options={batchOptions}
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected Batch:",
                                                        option
                                                    );
                                                    changeEditingBinTransferRecord(
                                                        "batch",
                                                        option?.value
                                                    );
                                                }}
                                            />
                                        </div>
                                        {BinTransferRecord.item && (
                                            <div className="flex items-center space-x-4">
                                                <div className="w-[30%] text-[15px] font-medium"></div>
                                                <div className="w-[70%] text-red-500 !mt-0 !pt-0 text-[15px]">
                                                    Số lượng tồn:{" "}
                                                    {items.find(
                                                        (item) =>
                                                            item.value ===
                                                            BinTransferRecord.item
                                                    )?.onHand || 0}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-4">
                                            <div className="mb-2 w-[30%] text-[15px] font-medium">
                                                Số lượng{" "}
                                                <span className="text-lg text-red-600">
                                                    {" "}
                                                    *
                                                </span>
                                            </div>
                                            <input
                                                id="batch_id"
                                                placeholder="Nhập số lượng"
                                                className=" border border-gray-300 text-gray-900 text-[15px] rounded-md focus:ring-blue-500 focus:border-blue-500 block w-[70%] p-[7px] px-3"
                                                value={
                                                    editingBinTransferRecord.quantity
                                                }
                                                onChange={(e) => {
                                                    changeEditingBinTransferRecord(
                                                        "quantity",
                                                        Number(e.target.value)
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="mb-2 w-[30%] text-[15px] font-medium">
                                                Chuyển đến kho{" "}
                                                <span className="text-lg text-red-600">
                                                    {" "}
                                                    *
                                                </span>
                                            </div>
                                            <Select
                                                value={toWarehouseOptions.find(
                                                    (warehouse) =>
                                                        warehouse.value ===
                                                        editingBinTransferRecord.toWarehouse
                                                )}
                                                placeholder="Chọn kho chuyến đến"
                                                isDisabled={true}
                                                options={toWarehouseOptions}
                                                className="w-[70%] text-[15px]"
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected To Warehouse:",
                                                        option
                                                    );
                                                    changeEditingBinTransferRecord(
                                                        "toWarehouse",
                                                        option?.value
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="mb-2 w-[30%] text-[15px] font-medium">
                                                Chuyển đến bin{" "}
                                                <span className="text-lg text-red-600">
                                                    {" "}
                                                    *
                                                </span>
                                            </div>
                                            <Select
                                                value={toBinOptions.find(
                                                    (bin) =>
                                                        bin.value ===
                                                        BinTransferRecord.toBin
                                                )}
                                                placeholder="Chọn bin chuyển đến"
                                                options={toBinOptions}
                                                className="w-[70%] text-[15px]"
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected To Bin:",
                                                        option
                                                    );
                                                    changeBinTransferRecord(
                                                        "toBin",
                                                        option?.value
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </ModalBody>

                            <ModalFooter>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => {
                                            if (type === "bin_stacking") {
                                                setEditingBinStackingIndex(null);
                                                setEditingBinStackingRecord({
                                                    warehouse: "",
                                                    item: "",
                                                    batch: "",
                                                    quantity: "",
                                                    bin: "",
                                                });
                                                setUpdatedBatchOptions([]);
                                                setUpdatedCurrentStock(0);
                                                onClose();
                                            } else {
                                                setBinTransferRecord({
                                                    fromWarehouse: "",
                                                    fromBin: "",
                                                    item: "",
                                                    quantity: "",
                                                    toWarehouse: "",
                                                    toBin: "",
                                                });
                                                setBinTransferIndex(null);
                                            }
                                            onClose();
                                        }}
                                        className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        className="bg-gray-800 p-2 rounded-xl px-4 h-fit font-medium active:scale-[.95]  active:duration-75  transition-all xl:w-fit md:w-fit w-full text-white"
                                        type="button"
                                        onClick={() => {
                                            if (type === "bin_stacking") {
                                                saveBinStackingRecord();
                                                setUpdatedBatchOptions([]);
                                                setUpdatedCurrentStock(0);
                                            } else {
                                                saveBinTransferRecord();
                                            }
                                            onClose();
                                        }}
                                    >
                                        Lưu lại
                                    </button>
                                </div>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                    {/* Execute Confirm Modal */}
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
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => {
                                            onConfirmClose();
                                        }}
                                        className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        className="bg-gray-800 p-2 rounded-xl px-4 h-fit font-medium active:scale-[.95]  active:duration-75  transition-all xl:w-fit md:w-fit w-full text-white"
                                        type="button"
                                        onClick={() => {
                                            if(type === "bin_stacking"){
                                                handleExecuteBinStacking();
                                            }else{
                                                handleExecuteBinTransfer();
                                            }
                                            onConfirmClose();
                                        }}
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                    {/* Exit Confirm Modal */}
                    <Modal
                        isCentered
                        isOpen={isExitConfirmOpen}
                        onClose={onExitConfirmClose}
                        size="xl"
                        blockScrollOnMount={false}
                        closeOnOverlayClick={false}
                    >
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Bạn chắn chắn muốn thoát?</ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <div>
                                        Sau khi thoát toàn bộ dữ liệu hiện tại
                                        sẽ bị xóa.
                                    </div>
                                </div>
                            </ModalBody>

                            <ModalFooter>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => {
                                            onExitConfirmClose();
                                        }}
                                        className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        className="bg-gray-800 p-2 rounded-xl px-4 h-fit font-medium active:scale-[.95]  active:duration-75  transition-all xl:w-fit md:w-fit w-full text-white"
                                        type="button"
                                        onClick={() => {
                                            navigate(-1);
                                            setBinStackingData([]);
                                            setBinTransferData([]);
                                            onExitConfirmClose();
                                        }}
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                    {/* Change Tab Modal */}
                    <Modal
                        isCentered
                        isOpen={isChangeTabOpen}
                        onClose={onChangeTabClose}
                        size="xl"
                        blockScrollOnMount={false}
                        closeOnOverlayClick={false}
                    >
                        <ModalOverlay />

                        <ModalContent>
                            <ModalHeader>
                                Bạn chắn chắn muốn chuyển trang?
                            </ModalHeader>
                            <ModalBody>
                                <div className="space-y-4">
                                    <div>
                                        Sau khi chuyển trang toàn bộ dữ liệu
                                        điều chuyển hiện tại sẽ bị mất.
                                    </div>
                                </div>
                            </ModalBody>

                            <ModalFooter>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => {
                                            setNextTabIndex(null);
                                            onChangeTabClose();
                                        }}
                                        className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        className="bg-gray-800 p-2 rounded-xl px-4 h-fit font-medium active:scale-[.95]  active:duration-75  transition-all xl:w-fit md:w-fit w-full text-white"
                                        type="button"
                                        onClick={() => {
                                            setFromBinOptions([]);
                                            setToBinOptions([]);
                                            setItemOptions([]);
                                            setTabIndex(nextTabIndex);
                                            setBinStackingRecord({
                                                warehouse: "",
                                                item: "",
                                                batch: "",
                                                quantity: "",
                                                bin: "",
                                            });
                                            setBinTransferRecord({
                                                fromWarehouse: "",
                                                fromBin: "",
                                                item: "",
                                                quantity: "",
                                                toWarehouse: "",
                                                toBin: "",
                                            });
                                            if (tabIndex === 0) setBinStackingData([]);
                                            if (tabIndex === 1) setBinTransferData([]);
                                            setCurrentStock(0);
                                            setBatchOptions([]);
                                            setUpdatedBatchOptions([]);
                                            setUpdatedCurrentStock(0);
                                            onChangeTabClose();
                                            setNextTabIndex(null);
                                        }}
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </div>
            </div>
            {initialLoading && <Loader />}
        </Layout>
    );
}

export default BinWarehouseTransfer;
