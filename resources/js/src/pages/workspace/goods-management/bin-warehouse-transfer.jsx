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

    const [type, setType] = useState(null);

    const [BinStackingRecord, setBinStackingRecord] = useState({
        warehouse: "",
        item: "",
        batch: "",
        quantity: "",
        bin: "",
    });
    const [BinStackingIndex, setBinStackingIndex] = useState(null);

    const [BinTransferRecord, setBinTransferRecord] = useState({
        fromWarehouse: "",
        fromBin: "",
        item: "",
        batch: "",
        quantity: "",
        toWarehouse: "",
        toBin: "",
    });
    const [BinTransferIndex, setBinTransferIndex] = useState(null);

    const [BinStackingData, setBinStackingData] = useState([]);
    const [BinTransferData, setBinTransferData] = useState([]);

    const [initialLoading, setInitialLoading] = useState(false);

    const [fromWarehouseOptions, setFromWarehouseOptions] = useState([]);
    const [toWarehouseOptions, setToWarehouseOptions] = useState([]);
    const [itemOptions, setItemOptions] = useState([]);
    const [fromBinOptions, setFromBinOptions] = useState([]);
    const [toBinOptions, setToBinOptions] = useState([]);

    // Bin Stacking
    const saveBinStackingRecord = () => {
        const { warehouse, item, quantity, bin } = BinStackingRecord;

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

        // Lấy giá trị `onHand` của item đã chọn
        const selectedItem = items.find((i) => i.value === item);
        if (!selectedItem) {
            toast.error("Sản phẩm không hợp lệ.");
            return;
        }
        const { onHand } = selectedItem;

        // Kiểm tra nếu `quantity` vượt quá `onHand`
        if (quantity > onHand) {
            toast.error(
                `Số lượng không được lớn hơn số lượng tồn (${onHand}).`
            );
            return;
        }

        if (BinStackingIndex !== null && BinStackingIndex >= 0) {
            const updatedData = [...BinStackingData];
            updatedData[BinStackingIndex] = { ...BinStackingRecord };
            setBinStackingData(updatedData);
            toast.success("Cập nhật thông tin thành công!");
        } else {
            setBinStackingData([...BinStackingData, BinStackingRecord]);
            toast.success("Thêm bản ghi mới thành công!");
        }
        console.log(BinStackingRecord);
        setBinStackingIndex(null);
        setBinStackingRecord({
            warehouse: "",
            item: "",
            batch: "",
            quantity: "",
            bin: "",
        });
        onClose();
    };

    const changeBinStackingRecord = (field, value) => {
        setBinStackingRecord({ ...BinStackingRecord, [field]: value });
    };

    const deleteBinStackingRecord = (index) => {
        const updatedData = BinStackingData.filter((_, i) => i !== index);
        setBinStackingData(updatedData);
        toast.success("Bản ghi đã được xóa.");
    };

    const editBinStackingRecord = (index) => {
        setBinStackingIndex(index);
        setBinStackingRecord(BinStackingData[index]);
        onOpen();
    };

    // Bin Transfer
    const saveBinTransferRecord = () => {
        const { fromWarehouse, fromBin, item, quantity, toWarehouse, toBin } =
            BinTransferRecord;
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

        // Lấy giá trị `onHand` của item đã chọn
        const selectedItem = items.find((i) => i.value === item);
        if (!selectedItem) {
            toast.error("Sản phẩm không hợp lệ.");
            return;
        }
        const { onHand } = selectedItem;

        // Kiểm tra nếu `quantity` vượt quá `onHand`
        if (quantity > onHand) {
            toast.error(
                `Số lượng không được lớn hơn số lượng tồn (${onHand}).`
            );
            return;
        }

        if (BinTransferIndex !== null && BinTransferIndex >= 0) {
            const updatedData = [...BinTransferData];
            updatedData[BinTransferIndex] = { ...BinTransferRecord };
            setBinTransferData(updatedData);
            toast.success("Cập nhật thông tin thành công!");
        } else {
            setBinTransferData([...BinTransferData, BinTransferRecord]);
            toast.success("Thêm bản ghi mới thành công!");
        }

        console.log(BinTransferRecord);
        setBinTransferIndex(null);
        setBinTransferRecord({
            fromWarehouse: "",
            fromBin: "",
            item: "",
            batch: "",
            quantity: "",
            toWarehouse: "",
            toBin: "",
        });
        onClose();
    };

    const changeBinTransferRecord = (field, value) => {
        setBinTransferRecord({ ...BinTransferRecord, [field]: value });
    };

    const deleteBinTransferRecord = (index) => {
        const updatedData = BinTransferData.filter((_, i) => i !== index);
        setBinTransferData(updatedData);
        toast.success("Bản ghi đã được xóa.");
    };

    const editBinTransferRecord = (index) => {
        setBinTransferIndex(index);
        setBinTransferRecord(BinTransferData[index]);
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
        try {
            const res = await goodsManagementApi.getDefaultBinItemsByWarehouse(
                warehouse
            );
            console.log(res);
            const itemOptions =
                res.ItemData?.map((item) => ({
                    value: item.ItemCode,
                    label: `${item.ItemCode} - ${item.ItemName}`,
                })) || [];

            setItemOptions(itemOptions);
        } catch (error) {
            toast.error("Không thể tải dữ liệu, hãy thử lại sau.");
        }
    };

    const getFromBinByWarehouse = async (warehouse) => {
        try {
            const res = await goodsManagementApi.getBinByWarehouse(warehouse);

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
        } catch (error) {
            setInitialLoading(false);
            toast.error("Có lỗi trong quá trình lấy dữ liệu. Hãy thử lại sau.");
        }
    };

    const getToBinByWarehouse = async (warehouse) => {
        try {
            const res = await goodsManagementApi.getBinByWarehouse(warehouse);

            const toBinOptions =
                res?.map((item) => ({
                    value: item.AbsEntry,
                    label: item.BinCode,
                })) || [];

            setToBinOptions(toBinOptions);
        } catch (error) {
            setInitialLoading(false);
            toast.error("Có lỗi trong quá trình lấy dữ liệu. Hãy thử lại sau.");
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
                        onClick={() => navigate(-1)}
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
                        <Tabs className="" variant="enclosed">
                            <TabList className="bg-gray-100 rounded-t-lg">
                                <Tab>
                                    <div className="py-1 flex items-center space-x-2 font-medium">
                                        <BiSolidCabinet className="w-5 h-5" />
                                        <div className="font-semibold ">
                                            Xếp bin
                                        </div>
                                    </div>
                                </Tab>
                                <Tab className="py-2">
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
                                            <div className="flex gap-x-3 w-full">
                                                <div className="col-span-1 w-1/3 flex flex-col justify-between">
                                                    <div className="mb-1 text-[15px] font-medium">
                                                        Kho xếp bin{" "}
                                                        <span className="text-lg text-red-600">
                                                            {" "}
                                                            *
                                                        </span>
                                                    </div>
                                                    <Select
                                                        value={fromWarehouseOptions.find(
                                                            (warehouse) =>
                                                                warehouse.value ==
                                                                BinStackingRecord.warehouse
                                                        )}
                                                        placeholder="Chọn kho xếp bin"
                                                        className=" text-[15px]"
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
                                                            getToBinByWarehouse(
                                                                option?.value
                                                            );
                                                            changeBinStackingRecord(
                                                                "warehouse",
                                                                option?.value
                                                            );
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-span-1 w-2/3 flex flex-col justify-between">
                                                    <div className="mb-1 text-[15px] font-medium">
                                                        Sản phẩm điều chuyển{" "}
                                                        <span className="text-lg text-red-600">
                                                            {" "}
                                                            *
                                                        </span>
                                                    </div>
                                                    <Select
                                                        value={itemOptions.find(
                                                            (item) =>
                                                                item.value ==
                                                                BinStackingRecord.item
                                                        )}
                                                        placeholder="Chọn sản phẩm"
                                                        className=" text-[15px]"
                                                        options={itemOptions}
                                                        onChange={(option) => {
                                                            console.log(
                                                                "Selected Item:",
                                                                option
                                                            );
                                                            changeBinStackingRecord(
                                                                "item",
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
                                                        value={batch.find(
                                                            (batch) =>
                                                                batch.value ===
                                                                BinStackingRecord.batch
                                                        )}
                                                        placeholder="Chọn mã lô hàng"
                                                        className=" text-[15px]"
                                                        options={batch}
                                                        onChange={(option) => {
                                                            console.log(
                                                                "Selected Batch:",
                                                                option
                                                            );
                                                            changeBinStackingRecord(
                                                                "batch",
                                                                option?.value
                                                            );
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-span-1 w-full flex flex-col justify-between ">
                                                    <div className="mb-1 text-[15px] font-medium">
                                                        Số lượng{" "}
                                                        <span className="text-lg text-red-600">
                                                            {" "}
                                                            *
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="number"
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
                                                        value={toBinOptions.find(
                                                            (bin) =>
                                                                bin.value ===
                                                                BinStackingRecord.bin
                                                        )}
                                                        placeholder="Chọn bin chuyển đến"
                                                        options={toBinOptions}
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
                                            <div className="flex items-center space-x-3">
                                                {BinStackingRecord.item && (
                                                    <div className="flex items-start">
                                                        <div className=" text-red-500 text-[15px]">
                                                            Số lượng tồn:{" "}
                                                            {items.find(
                                                                (item) =>
                                                                    item.value ===
                                                                    BinStackingRecord.item
                                                            )?.onHand || 0}
                                                        </div>
                                                    </div>
                                                )}
                                                <button
                                                    className="w-fit h-full space-x-2 flex items-center bg-cyan-800 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                                    onClick={() => {
                                                        console.log(
                                                            BinStackingData
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
                                                    onOpen();
                                                    setType("bin_stacking");
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
                                                    <table className="min-w-full border border-gray-300 text-[15px] text-left text-gray-700">
                                                        <thead className="bg-gray-100">
                                                            <tr>
                                                                <th className="w-[180px] px-6 py-3 border border-gray-300">
                                                                    Kho xếp bin
                                                                </th>
                                                                <th className="px-6 py-3 border border-gray-300">
                                                                    Sản phẩm
                                                                    điều chuyển
                                                                </th>
                                                                <th className="px-6 py-3 border border-gray-300">
                                                                    Mã lô hàng
                                                                </th>
                                                                <th className="w-[120px] px-6 py-3 border border-gray-300">
                                                                    Số lượng
                                                                </th>
                                                                <th className="px-6 py-3 border border-gray-300">
                                                                    Bin chuyển
                                                                    đến
                                                                </th>
                                                                <th className="w-[120px] px-3 text-center py-3 border border-gray-300">
                                                                    Hành động
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {BinStackingData.map(
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
                                                                        <td className="text-bottom px-6 py-3 border border-gray-300">
                                                                            {
                                                                                row.warehouse
                                                                            }
                                                                        </td>
                                                                        <td className="px-6 py-3 border border-gray-300">
                                                                            <div className="flex flex-col justify-start gap-x-2">
                                                                                <div className="text-xs text-gray-500">
                                                                                    {
                                                                                        row.item
                                                                                    }
                                                                                </div>
                                                                                <div className="font-medium">
                                                                                    {items.find(
                                                                                        (
                                                                                            item
                                                                                        ) =>
                                                                                            item.value ===
                                                                                            row.item
                                                                                    )
                                                                                        ?.label ||
                                                                                        "Không tìm thấy"}
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-3 border border-gray-300">
                                                                            {row.batch ||
                                                                                "Không xác định"}
                                                                        </td>
                                                                        <td className="px-6 py-3 border text-center border-gray-300">
                                                                            {
                                                                                row.quantity
                                                                            }
                                                                        </td>
                                                                        <td className="px-6 py-3 border border-gray-300">
                                                                            {
                                                                                row.bin
                                                                            }
                                                                        </td>
                                                                        <td className="px-6 py-3 space-x-2 border border-gray-300 text-center">
                                                                            <button
                                                                                className="text-orange-500 py-1 rounded-md active:scale-[.95] active:duration-75 transition-all "
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
                                                                                className=" text-red-600 py-1 rounded-md active:scale-[.95] active:duration-75 transition-all"
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
                                                        value={fromWarehouseOptions.find(
                                                            (warehouse) =>
                                                                warehouse.value ===
                                                                BinTransferRecord.fromWarehouse
                                                        )}
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
                                                        value={bins.find(
                                                            (bin) =>
                                                                bin.value ===
                                                                BinTransferRecord.fromBin
                                                        )}
                                                        placeholder="Chọn bin"
                                                        className="text-[15px]"
                                                        options={bins}
                                                        onChange={(option) => {
                                                            console.log(
                                                                "Selected From Bin:",
                                                                option
                                                            );
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
                                                        value={items.find(
                                                            (item) =>
                                                                item.value ===
                                                                BinTransferRecord.item
                                                        )}
                                                        placeholder="Chọn sản phẩm"
                                                        className="text-[15px]"
                                                        options={items}
                                                        onChange={(option) => {
                                                            console.log(
                                                                "Selected Item:",
                                                                option
                                                            );
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
                                                        Số lượng{" "}
                                                        <span className="text-lg text-red-600">
                                                            {" "}
                                                            *
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="number"
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
                                                        value={toWarehouseOptions.find(
                                                            (warehouse) =>
                                                                warehouse.value ===
                                                                BinTransferRecord.toWarehouse
                                                        )}
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
                                                        value={bins.find(
                                                            (bin) =>
                                                                bin.value ===
                                                                BinTransferRecord.toBin
                                                        )}
                                                        placeholder="Chọn bin chuyển đến"
                                                        options={bins}
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

                                        <div className="flex pt-4">
                                            <div className=" items-center flex justify-between">
                                                <button
                                                    className="w-fit h-full space-x-2 flex items-center bg-gray-800 p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                                    onClick={() => {
                                                        onOpen();
                                                        setType("chuyenkhobin");
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
                                            <div className="overflow-x-auto">
                                                {BinTransferData.length > 0 ? (
                                                    <>
                                                        <table className="min-w-full border border-gray-300 text-[15px] text-left text-gray-700">
                                                            <thead className="bg-gray-100">
                                                                <tr>
                                                                    <th className="w-[150px] px-3 text-center py-3 border border-gray-300">
                                                                        Chuyển
                                                                        từ kho
                                                                    </th>
                                                                    <th className="w-[150px] px-3 text-center py-3 border border-gray-300">
                                                                        Chuyển
                                                                        từ bin
                                                                    </th>
                                                                    <th className="px-6 py-3 border border-gray-300">
                                                                        Sản phẩm
                                                                        điều
                                                                        chuyển
                                                                    </th>
                                                                    <th className="px-6 py-3 border border-gray-300">
                                                                        Mã lô
                                                                        hàng
                                                                    </th>
                                                                    <th className="px-6 py-3 border border-gray-300">
                                                                        Số lượng
                                                                    </th>
                                                                    <th className="w-[150px] px-3 text-center py-3 border border-gray-300">
                                                                        Chuyển
                                                                        tới kho
                                                                    </th>
                                                                    <th className="w-[150px] px-3 text-center py-3 border border-gray-300">
                                                                        Chuyển
                                                                        tới bin
                                                                    </th>
                                                                    <th className="w-[120px] px-3 text-center py-3 border border-gray-300">
                                                                        Hành
                                                                        động
                                                                    </th>
                                                                </tr>
                                                            </thead>
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
                                                                            <td className="px-6 py-3 border border-gray-300">
                                                                                {
                                                                                    row.fromWarehouse
                                                                                }
                                                                            </td>
                                                                            <td className="px-6 py-3 border border-gray-300">
                                                                                {
                                                                                    row.fromBin
                                                                                }
                                                                            </td>
                                                                            <td className="px-6 py-3 border border-gray-300">
                                                                                <div className="flex flex-col justify-start gap-x-2">
                                                                                    <div className="text-xs text-gray-500">
                                                                                        {
                                                                                            row.item
                                                                                        }
                                                                                    </div>
                                                                                    <div className="font-medium">
                                                                                        {items.find(
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
                                                                            <td className="px-6 py-3 border border-gray-300">
                                                                                {row.batch ||
                                                                                    "Không xác định"}
                                                                            </td>
                                                                            <td className="px-6 py-3 border border-gray-300">
                                                                                {
                                                                                    row.quantity
                                                                                }
                                                                            </td>
                                                                            <td className="px-6 py-3 border border-gray-300">
                                                                                {
                                                                                    row.toWarehouse
                                                                                }
                                                                            </td>
                                                                            <td className="px-6 py-3 border border-gray-300">
                                                                                {
                                                                                    row.toBin
                                                                                }
                                                                            </td>
                                                                            <td className="px-6 py-3 space-x-2 border border-gray-300 text-center">
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
                                                <span className="text-lg text-red-600">
                                                    {" "}
                                                    *
                                                </span>
                                            </div>
                                            <Select
                                                value={fromWarehouseOptions.find(
                                                    (warehouse) =>
                                                        warehouse.value ==
                                                        BinStackingRecord.warehouse
                                                )}
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
                                                    changeBinStackingRecord(
                                                        "warehouse",
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
                                                value={itemOptions.find(
                                                    (item) =>
                                                        item.value ==
                                                        BinStackingRecord.item
                                                )}
                                                placeholder="Chọn sản phẩm"
                                                className="w-[70%] text-[15px]"
                                                options={itemOptions}
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected Item:",
                                                        option
                                                    );
                                                    changeBinStackingRecord(
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
                                                        BinStackingRecord.batch
                                                )}
                                                placeholder="Chọn mã lô hàng"
                                                className="w-[70%] text-[15px]"
                                                options={batch}
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected Batch:",
                                                        option
                                                    );
                                                    changeBinStackingRecord(
                                                        "batch",
                                                        option?.value
                                                    );
                                                }}
                                            />
                                        </div>
                                        {BinStackingRecord.item && (
                                            <div className="flex items-center space-x-4">
                                                <div className="w-[30%] text-[15px] font-medium"></div>
                                                <div className="w-[70%] text-red-500 !mt-0 !pt-0 text-[15px]">
                                                    Số lượng tồn:{" "}
                                                    {items.find(
                                                        (item) =>
                                                            item.value ===
                                                            BinStackingRecord.item
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
                                                type="number"
                                                id="batch_id"
                                                placeholder="Nhập số lượng"
                                                className=" border border-gray-300 text-gray-900 text-[15px] rounded-md focus:ring-blue-500 focus:border-blue-500 block w-[70%] p-[7px] px-3"
                                                value={
                                                    BinStackingRecord.quantity
                                                }
                                                onChange={(e) => {
                                                    changeBinStackingRecord(
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
                                                        BinStackingRecord.bin
                                                )}
                                                placeholder="Chọn bin chuyển đến"
                                                options={toBinOptions}
                                                className="w-[70%] text-[15px]"
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
                                                        BinTransferRecord.fromWarehouse
                                                )}
                                                placeholder="Chọn kho"
                                                className="w-[70%] text-[15px]"
                                                options={fromWarehouseOptions}
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected From Warehouse:",
                                                        option
                                                    );
                                                    changeBinTransferRecord(
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
                                                value={bins.find(
                                                    (bin) =>
                                                        bin.value ===
                                                        BinTransferRecord.fromBin
                                                )}
                                                placeholder="Chọn bin"
                                                className="w-[70%] text-[15px]"
                                                options={bins}
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected From Bin:",
                                                        option
                                                    );
                                                    changeBinTransferRecord(
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
                                                value={items.find(
                                                    (item) =>
                                                        item.value ===
                                                        BinTransferRecord.item
                                                )}
                                                placeholder="Chọn sản phẩm"
                                                className="w-[70%] text-[15px]"
                                                options={items}
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected Item:",
                                                        option
                                                    );
                                                    changeBinTransferRecord(
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
                                                        BinTransferRecord.batch
                                                )}
                                                placeholder="Chọn mã lô hàng"
                                                className="w-[70%] text-[15px]"
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
                                                type="number"
                                                id="batch_id"
                                                placeholder="Nhập số lượng"
                                                className=" border border-gray-300 text-gray-900 text-[15px] rounded-md focus:ring-blue-500 focus:border-blue-500 block w-[70%] p-[7px] px-3"
                                                value={
                                                    BinTransferRecord.quantity
                                                }
                                                onChange={(e) => {
                                                    changeBinTransferRecord(
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
                                                        BinTransferRecord.toWarehouse
                                                )}
                                                placeholder="Chọn kho chuyến đến"
                                                options={toWarehouseOptions}
                                                className="w-[70%] text-[15px]"
                                                onChange={(option) => {
                                                    console.log(
                                                        "Selected To Warehouse:",
                                                        option
                                                    );
                                                    changeBinTransferRecord(
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
                                                value={bins.find(
                                                    (bin) =>
                                                        bin.value ===
                                                        BinTransferRecord.toBin
                                                )}
                                                placeholder="Chọn bin chuyển đến"
                                                options={bins}
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
                                                setBinStackingRecord({
                                                    warehouse: "",
                                                    item: "",
                                                    batch: "",
                                                    quantity: "",
                                                    bin: "",
                                                });
                                                setBinStackingIndex(null);
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
                                            {
                                                type === "bin_stacking"
                                                    ? saveBinStackingRecord()
                                                    : saveBinTransferRecord();
                                            }
                                        }}
                                    >
                                        Lưu lại
                                    </button>
                                </div>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

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
                                Bạn chắc chắn muốn thực hiện?
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
