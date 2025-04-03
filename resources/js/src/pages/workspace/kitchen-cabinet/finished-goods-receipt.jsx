import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../layouts/layout";
import Select from "react-select";
import { IoMdArrowRoundBack } from "react-icons/io";
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
import domesticApi from "../../../api/domesticApi";
import kitchenCabinetApi from "../../../api/kitchenCabinetApi";
import Loader from "../../../components/Loader";
import { Spinner } from "@chakra-ui/react";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import EmptyData from "../../../assets/images/empty-data.svg";
import { set } from "date-fns";

const KitchenCabinetFinishedGoodsReceipt = () => {
    const navigate = useNavigate();
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [progressOptions, setProgressOptions] = useState([])
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isExeAssemblyDiagramsOpen, onOpen: onExeAssemblyDiagramsOpen, onClose: onExeAssemblyDiagramsClose } = useDisclosure();

    const [productionOrderList, setProductionOrderList] = useState([]);
    const [selectedDocEntry, setSelectedDocEntry] = useState(null);
    const [selectedSPDich, setSelectedSPDich] = useState(null);
    const [selectedProgress, setSelectedProgress] = useState(null);
    const [productList, setProductList] = useState([]);
    const [inputValues, setInputValues] = useState([]);
    const [assemblyDiagramList, setAssemblyDiagramList] = useState([]);
    const [selectedAssemblyDiagrams, setSelectedAssemblyDiagrams] = useState(
        []
    );

    // Loading
    const [isProductionOrderLoading, setIsProductionOrderLoading] =
        useState(false);
    const [isProductsLoading, setIsProductsLoading] = useState(false);
    const [isAssemblyDiagramsLoading, setIsAssemblyDiagramsLoading] =
        useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [exeAssemblyDiagramsLoading, setExeAssemblyDiagramsLoading] =
        useState(false);

    const getAllStage = async () => {
        // setIsProductionOrderLoading(true);
        try {
            const res = await kitchenCabinetApi.getAllStage();

            const productionOrderOptions =
                res.map((item) => ({
                    value: item.code,
                    label: item.value,
                })) || [];

            setProgressOptions(productionOrderOptions);
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi lấy dữ liệu");
        } finally {
            setIsProductionOrderLoading(false);
        }
    };


    const getProductionOrderList = async () => {
        setIsProductionOrderLoading(true);
        try {
            const res = await kitchenCabinetApi.getProductionOrderList();

            const productionOrderOptions =
                res.map((item) => ({
                    value: item.DocEntry,
                    label: item.SPDich + " - " + item.DocEntry,
                    SPDich: item.SPDich,
                })) || [];

            setProductionOrderList(productionOrderOptions);
            setIsProductionOrderLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi lấy dữ liệu");
            setIsProductionOrderLoading(false);
        }
    };

    const getProductsByProductionOrder = async (id) => {
        setIsProductsLoading(true);
        try {
            const res = await kitchenCabinetApi.getProductsByProductionOrder(id, selectedProgress.value);
            console.log(res);
            setProductList(res);

            const initialInputs = res.map((item) => ({
                quantity: "",
                boxCode: "",
            }));
            setInputValues(initialInputs);
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi lấy dữ liệu");
        } finally {
            setIsProductsLoading(false);
        }
    };

    const handleInputChange = (index, field, value) => {
        const newInputValues = [...inputValues];
        newInputValues[index][field] = value;
        setInputValues(newInputValues);
    };

    const handleCheckboxChange = (value) => {
        setSelectedAssemblyDiagrams((prev) => {
            if (prev.includes(value)) {
                return prev.filter((item) => item !== value); // Loại bỏ nếu đã tồn tại
            } else {
                return [...prev, value]; // Thêm nếu chưa có
            }
        });
    };

    const validateArrayQuantity = (arr) => {
        if (arr.length === 0) return false;

        return arr.every(item => {
            const quantity = Number(item.quantity);

            return !isNaN(quantity) && quantity > 0;
        });
    }


    const handleSubmit = async () => {
        for (let i = 0; i < productList.length; i++) {
            const item = productList[i];
            const soLuong = inputValues[i].quantity
                ? parseInt(inputValues[i].quantity)
                : 0;

            // if (soLuong > item.RemainQty) {
            //     toast.error(
            //         `Số lượng ghi nhận của ${item.MACT} không được lớn hơn số lượng còn lại phải sản xuất (${item.RemainQty}).`
            //     );
            //     setIsSubmitting(false);
            //     onClose();
            //     return;
            // }

            if (soLuong <= 0) {
                toast.error(
                    `Số lượng ghi nhận của ${item.MACT} phải lớn hơn 0.`
                );
                setIsSubmitting(false);
                onClose();
                return;
            }
        }

        const submittedData = {
            LSX: Number(selectedDocEntry.value),
            SPDich: selectedSPDich,
            CD: selectedProgress.value,
            Detail: productList.map((item, index) => ({
                MaCT: item.MACT,
                SoLuong: inputValues[index].quantity
                    ? parseInt(inputValues[index].quantity)
                    : 0,
                LineId: item.LineId,
                BANGKE: item.BANGKE,
                MaHop: inputValues[index].boxCode || "Không có mã hộp",
            })),
        };
        console.log("Dữ liệu ghi nhận:", submittedData);
        setIsSubmitting(true);

        try {
            await kitchenCabinetApi.handleReceipt(submittedData);

            toast.success("Dữ liệu đã được ghi nhận.");
            setInputValues([]);
            setProductionOrderList([]);
            setProductList([]);
            setSelectedDocEntry(null);
            setSelectedSPDich(null);
            getProductionOrderList();
            setIsSubmitting(false);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi ghi nhận dữ liệu");
            setIsSubmitting(false);
            onClose();
        }
    };

    // const executeAssemblyDiagrams = async () => {
    //     setExeAssemblyDiagramsLoading(true);
    //     if (selectedAssemblyDiagrams.length == 0) {
    //         toast("Vui lòng chọn dữ liệu để bắt đầu.");
    //     }
    //     const MASD = selectedAssemblyDiagrams;
    //     try {
    //         console.log(selectedAssemblyDiagrams);
    //         await domesticApi.executeAssemblyDiagrams({ MASD });
    //         toast.success("Ghi nhận thành công.");
    //         onExeAssemblyDiagramsClose();
    //         setExeAssemblyDiagramsLoading(false);
    //         getAllAssemblyDiagrams();
    //     } catch (error) {
    //         console.error(error);
    //         toast.error("Lỗi khi thực hành dữ liệu");
    //         onExeAssemblyDiagramsClose();
    //         setExeAssemblyDiagramsLoading(false);
    //     }
    // };

    useEffect(() => {
        getAllStage();
        getProductionOrderList();
    }, []);

    useEffect(() => {
        if (selectedDocEntry) {
            getProductsByProductionOrder(selectedDocEntry.value);
        }
    }, [selectedProgress])

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
                            Nhập sản lượng{" "}
                            <span className=" text-[#622A2A]">
                                tủ bếp
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-between mb-3 px-4 xl:px-0 lg:px-0 md:px-0 items-center gap-4">
                        <div className="my-4 mb-2 mt-3 w-full pb-4 rounded-xl bg-white ">
                            <div className="flex flex-col  pb-0  w-full justify-end ">
                                <div className=" ">
                                    <div className="p-4 rounded-tl-xl rounded-tr-xl pb-1 w-full bg-[#F6F6F6] border-b border-gray-200">
                                        <div className="">
                                            <div className="block xl:text-md lg:text-md md:text-md text-sm font-medium text-gray-900">
                                                Chọn công đoạn thực hiện
                                            </div>
                                            <Select
                                                options={progressOptions}
                                                value={selectedProgress}
                                                onChange={(value) => {
                                                    setSelectedProgress(value);
                                                    // if (
                                                    //     value.value === "TC-DG"
                                                    // ) {
                                                    //     setAssemblyDiagramList(
                                                    //         []
                                                    //     );
                                                    //     setSelectedAssemblyDiagrams(
                                                    //         []
                                                    //     );
                                                    //     getProductionOrderList();
                                                    // } else {
                                                    //     setProductionOrderList(
                                                    //         []
                                                    //     );
                                                    //     setSelectedAssemblyDiagrams(
                                                    //         []
                                                    //     );
                                                    //     getAllAssemblyDiagrams();
                                                    // }
                                                }}
                                                placeholder="Tìm kiếm"
                                                className="mt-1 mb-4 w-full text-[15px]"
                                            />
                                        </div>
                                        {selectedProgress && (
                                            <div className="">
                                                <div className="block xl:text-md lg:text-md md:text-md text-sm font-medium text-gray-900">
                                                    Chọn lệnh sản xuất
                                                </div>
                                                <Select
                                                    isDisabled={
                                                        isProductionOrderLoading
                                                    }
                                                    options={
                                                        productionOrderList
                                                    }
                                                    value={selectedDocEntry}
                                                    onChange={(value) => {
                                                        getProductsByProductionOrder(
                                                            value.value
                                                        );
                                                        setSelectedDocEntry(
                                                            value
                                                        );
                                                        setSelectedSPDich(
                                                            value.SPDich
                                                        );
                                                    }}
                                                    placeholder="Tìm kiếm"
                                                    className="mt-1 mb-4 w-full text-[15px]"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {isProductsLoading ? (
                                        <div className="p-6 flex justify-center items-center py-6">
                                            <Spinner
                                                thickness="7px"
                                                className="mt-3"
                                                speed="0.65s"
                                                emptyColor="gray.200"
                                                color="blue.500"
                                                size="xl"
                                            />
                                        </div>
                                    ) : <>
                                        {productList?.length > 0 ? (
                                            <div className="p-4 pb-0">
                                                <div className=" pb-3">
                                                    <div className="text-sm text-gray-500 uppercase font-medium">
                                                        Mã lệnh:{" "}
                                                        {
                                                            selectedDocEntry.value
                                                        }
                                                    </div>
                                                    <div className="text-lg font-bold text-[#17506B]">
                                                        Sản phẩm:{" "}
                                                        {
                                                            selectedSPDich
                                                        }
                                                    </div>
                                                </div>
                                                <div className="border border-gray-300 rounded-lg xl:block lg:block md:block hidden">
                                                    <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                                                        <thead>
                                                            <tr className="bg-gray-200 text-left">
                                                                <th className="px-4 py-2 w-[300px] border border-gray-300">
                                                                    Chi
                                                                    tiết
                                                                </th>
                                                                <th className="px-4 py-2 w-[150px] border border-gray-300">
                                                                    Bảng kê
                                                                </th>
                                                                <th className="px-4 py-2 w-[120px] border border-gray-300">
                                                                    Sản
                                                                    lượng
                                                                </th>
                                                                <th className="px-4 py-2 w-[140px] border border-gray-300">
                                                                    Khối lượng
                                                                </th>
                                                                <th className="px-4 py-2 w-[120px] border border-gray-300">
                                                                    Đã
                                                                    làm
                                                                </th>
                                                                <th className="px-4 py-2 w-[120px] border border-gray-300">
                                                                    Còn
                                                                    lại
                                                                </th>
                                                                <th className="px-4 py-2 border border-gray-300">
                                                                    Số
                                                                    lượng
                                                                    ghi
                                                                    nhận
                                                                    <span className="text-red-500">
                                                                        {" "}
                                                                        *
                                                                    </span>
                                                                </th>
                                                                <th className="px-4 py-2 border border-gray-300">
                                                                    Mã
                                                                    hộp
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        {productList.map(
                                                            (
                                                                item,
                                                                index
                                                            ) => (
                                                                <tbody
                                                                    key={
                                                                        index
                                                                    }
                                                                >
                                                                    <tr
                                                                        className={
                                                                            index %
                                                                                2 ===
                                                                                0
                                                                                ? "bg-gray-50"
                                                                                : ""
                                                                        }
                                                                    >
                                                                        <td className="px-4 py-3 border border-gray-300">
                                                                            <div className="uppercase text-sm text-gray-500">
                                                                                {item.MACT ||
                                                                                    "Không xác định"}
                                                                            </div>
                                                                            <div className="font-semibold truncate">
                                                                                {item.NameCT ? `${item.NameCT} (${item.Dai}x${item.Rong}x${item.Day}) ` : "Không xác định"}

                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-3 border border-gray-300">
                                                                            {item.BANGKE ||
                                                                                0}
                                                                        </td>
                                                                        <td className="px-4 py-3 border border-gray-300">
                                                                            {item.PlanQty ||
                                                                                0}
                                                                        </td>
                                                                        <td className="px-4 py-3 border border-gray-300">
                                                                            {item.KHOILUONG ||
                                                                                0}
                                                                        </td>
                                                                        <td className="px-4 py-3 border border-gray-300">
                                                                            {item.CompletedQty ||
                                                                                0}
                                                                        </td>
                                                                        <td className="px-4 py-3 border border-gray-300">
                                                                            {item.RemainQty ||
                                                                                0}
                                                                        </td>
                                                                        <td className="px-4 py-2 border border-gray-300">
                                                                            <input
                                                                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                                                value={
                                                                                    inputValues[
                                                                                        index
                                                                                    ]
                                                                                        ?.quantity ||
                                                                                    ""
                                                                                }
                                                                                type="number"
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    handleInputChange(
                                                                                        index,
                                                                                        "quantity",
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td className="px-4 py-2 border border-gray-300">
                                                                            <input
                                                                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                                                value={
                                                                                    inputValues[
                                                                                        index
                                                                                    ]
                                                                                        ?.boxCode ||
                                                                                    ""
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    handleInputChange(
                                                                                        index,
                                                                                        "boxCode",
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            )
                                                        )}
                                                    </table>
                                                </div>

                                                <div className="space-y-3">
                                                    {productList.map(
                                                        (
                                                            item,
                                                            index
                                                        ) => (
                                                            <div className="border border-gray-300 bg-gray-50 rounded-lg xl:hidden lg:hidden md:hidden flex flex-col p-3 gap-y-2">
                                                                <div className="flex flex-col">
                                                                    <span className="uppercase text-xs font-medium text-gray-500">
                                                                        [{item.MACT ||
                                                                            "Không xác định"}]
                                                                    </span>
                                                                    <span className="text-lg font-bold">
                                                                        {item.NameCT ||
                                                                            "Không xác định"}
                                                                    </span>
                                                                </div>

                                                                <div className="flex flex-col gap-y-1">
                                                                    <div className=" grid grid-cols-2">
                                                                        <span className="">
                                                                            Bảng kê:
                                                                        </span>
                                                                        <span className=" font-bold">
                                                                            {item.BANGKE ||
                                                                                0}
                                                                        </span>
                                                                    </div>
                                                                    <div className=" grid grid-cols-2">
                                                                        <span className="">
                                                                            Sản
                                                                            lượng:
                                                                        </span>
                                                                        <span className=" font-bold">
                                                                            {item.PlanQty ||
                                                                                0}
                                                                        </span>
                                                                    </div>
                                                                    <div className=" grid grid-cols-2">
                                                                        <span className="">
                                                                            Khối
                                                                            lượng:
                                                                        </span>
                                                                        <span className=" font-bold">
                                                                            {item.KHOILUONG ||
                                                                                0}
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2">
                                                                        <span className="">
                                                                            Đã
                                                                            làm:
                                                                        </span>
                                                                        <span className="font-bold">
                                                                            {item.CompletedQty ||
                                                                                0}
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2">
                                                                        <span className="grid grid-cols-2">
                                                                            Còn
                                                                            lại:
                                                                        </span>
                                                                        <span className="font-bold">
                                                                            {item.RemainQty ||
                                                                                0}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="w-full border-b border-gray-200"></div>

                                                                <div className="flex flex-col">
                                                                    <span className="pb-1 font-medium text-gray-800">
                                                                        Số
                                                                        lượng
                                                                        ghi
                                                                        nhận
                                                                    </span>
                                                                    <input
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                                        value={
                                                                            inputValues[
                                                                                index
                                                                            ]
                                                                                ?.quantity ||
                                                                            ""
                                                                        }
                                                                        type="number"
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleInputChange(
                                                                                index,
                                                                                "quantity",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="pb-1 font-medium text-gray-800">
                                                                        Mã
                                                                        hộp
                                                                    </span>
                                                                    <input
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                                        value={
                                                                            inputValues[
                                                                                index
                                                                            ]
                                                                                ?.boxCode ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleInputChange(
                                                                                index,
                                                                                "boxCode",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                {/* <div className="space-y-3">
                                                        {productList.map(
                                                            (
                                                                item,
                                                                index
                                                            ) => (
                                                                <div className="border border-gray-300 bg-gray-50 rounded-lg xl:hidden lg:hidden md:hidden flex flex-col p-3 gap-y-2">
                                                                    <div className="flex flex-col">
                                                                        <span className="uppercase text-xs font-medium text-gray-500">
                                                                            [{item.MACT ||
                                                                                "Không xác định"}]
                                                                        </span>
                                                                        <span className="text-lg font-bold">
                                                                            {item.NameCT ||
                                                                                "Không xác định"}
                                                                        </span>
                                                                    </div>
    
                                                                    <div className="flex flex-col gap-y-1">
                                                                        <div className=" grid grid-cols-2">
                                                                            <span className="">
                                                                                Sản
                                                                                lượng:
                                                                            </span>
                                                                            <span className=" font-bold">
                                                                                {item.PlanQty ||
                                                                                    0}
                                                                            </span>
                                                                        </div>
                                                                        <div className="grid grid-cols-2">
                                                                            <span className="">
                                                                                Đã
                                                                                làm:
                                                                            </span>
                                                                            <span className="font-bold">
                                                                                {item.CompletedQty ||
                                                                                    0}
                                                                            </span>
                                                                        </div>
                                                                        <div className="grid grid-cols-2">
                                                                            <span className="grid grid-cols-2">
                                                                                Còn
                                                                                lại:
                                                                            </span>
                                                                            <span className="font-bold">
                                                                                {item.RemainQty ||
                                                                                    0}
                                                                            </span>
                                                                        </div>
                                                                    </div>
    
                                                                    <div className="w-full border-b border-gray-200"></div>
    
                                                                    <div className="flex flex-col">
                                                                        <span className="pb-1 font-medium text-gray-800">
                                                                            Số
                                                                            lượng
                                                                            ghi
                                                                            nhận
                                                                        </span>
                                                                        <input
                                                                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                                            value={
                                                                                inputValues[
                                                                                    index
                                                                                ]
                                                                                    ?.quantity ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                handleInputChange(
                                                                                    index,
                                                                                    "quantity",
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="pb-1 font-medium text-gray-800">
                                                                            Mã
                                                                            hộp
                                                                        </span>
                                                                        <input
                                                                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                                            value={
                                                                                inputValues[
                                                                                    index
                                                                                ]
                                                                                    ?.boxCode ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                handleInputChange(
                                                                                    index,
                                                                                    "boxCode",
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div> */}

                                                <div className="flex justify-end mt-4">
                                                    <button
                                                        className="w-fit h-full space-x-2 flex items-center bg-[#17506B] p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                                        onClick={() => {
                                                            onOpen();
                                                        }}
                                                        disabled={!validateArrayQuantity(inputValues)}
                                                    >
                                                        <p className="text-[15px]">
                                                            Ghi nhận
                                                        </p>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center py-8">
                                                <img
                                                    src={EmptyData}
                                                    alt="No data"
                                                    className="w-[135px] h-[135px] opacity-60 object-contain mx-auto"
                                                />
                                                <div className="p-6 text-center">
                                                    {productList.length ===
                                                        0 ? (
                                                        <>
                                                            <div className="font-semibold xl:text-xl lg:text-xl md:text-lg text-lg">
                                                                Chúng
                                                                tôi
                                                                không
                                                                tìm
                                                                thấy
                                                                bất
                                                                kỳ
                                                                thông
                                                                tin
                                                                sản
                                                                phẩm
                                                                nào.
                                                            </div>
                                                            <div className="text-gray-500 mt-1">
                                                                Hãy
                                                                thử
                                                                chọn
                                                                một
                                                                lệnh
                                                                sản
                                                                xuất
                                                                khác.
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="font-semibold text-xl">
                                                                Hiện
                                                                tại
                                                                không
                                                                có
                                                                bất
                                                                kỳ
                                                                thông
                                                                tin
                                                                sản
                                                                phẩm
                                                                nào.
                                                            </div>
                                                            <div className="text-gray-500 mt-1">
                                                                Hãy
                                                                chọn
                                                                một
                                                                lệnh
                                                                sản
                                                                xuất
                                                                để
                                                                bắt
                                                                đầu.
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>}


                                    {/* {selectedProgress?.value === "SC" ? (
                                        <>
                                            {isAssemblyDiagramsLoading ? (
                                                <div className="p-6 flex justify-center items-center py-6">
                                                    <Spinner
                                                        thickness="7px"
                                                        className="mt-3"
                                                        speed="0.65s"
                                                        emptyColor="gray.200"
                                                        color="blue.500"
                                                        size="xl"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    {assemblyDiagramList.length >
                                                        0 ? (
                                                        <div className="p-4 pb-0">
                                                            <div className="pb-2">
                                                                Chọn các mã sơ
                                                                đồ cắt cần thực
                                                                hiện:
                                                            </div>
                                                            <div className="space-y-3">
                                                                {assemblyDiagramList?.map(
                                                                    (
                                                                        item,
                                                                        index
                                                                    ) => {
                                                                        const isChecked =
                                                                            selectedAssemblyDiagrams.includes(
                                                                                item.value
                                                                            );
                                                                        return (
                                                                            <Checkbox
                                                                                key={
                                                                                    index
                                                                                }
                                                                                value={
                                                                                    item.value
                                                                                }
                                                                                className={`p-2 py-3 pl-4 rounded-lg w-full font-medium ${isChecked
                                                                                        ? "bg-blue-100 hover:bg-blue-300"
                                                                                        : "bg-gray-100 hover:bg-gray-200 "
                                                                                    }`}
                                                                                size={
                                                                                    "lg"
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    handleCheckboxChange(
                                                                                        item?.value
                                                                                    )
                                                                                }
                                                                                checked={
                                                                                    isChecked
                                                                                }
                                                                            >
                                                                                {item.value ||
                                                                                    "Không xác định"}
                                                                            </Checkbox>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                            <div className="mt-4 w-full flex justify-between items-center">
                                                                <div className="text-gray-500">
                                                                    Đã chọn:{" "}
                                                                    {selectedAssemblyDiagrams?.length ||
                                                                        0}
                                                                </div>
                                                                <button
                                                                    className="w-fit h-full space-x-2 flex items-center bg-[#17506B] p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                                                    onClick={() => {
                                                                        onExeAssemblyDiagramsOpen();
                                                                    }}
                                                                >
                                                                    <p className="text-[15px]">
                                                                        Ghi nhận
                                                                    </p>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center py-8">
                                                            <img
                                                                src={EmptyData}
                                                                alt="No data"
                                                                className="w-[135px] h-[135px] opacity-60 object-contain mx-auto"
                                                            />
                                                            <div className="p-6 text-center">
                                                                {productList.length ===
                                                                    0 ? (
                                                                    <>
                                                                        <div className="font-semibold xl:text-xl lg:text-xl md:text-lg text-lg">
                                                                            Chúng
                                                                            tôi
                                                                            không
                                                                            tìm
                                                                            thấy
                                                                            bất
                                                                            kỳ
                                                                            thông
                                                                            tin
                                                                            sản
                                                                            phẩm
                                                                            nào.
                                                                        </div>
                                                                        <div className="text-gray-500 mt-1">
                                                                            Hãy
                                                                            thử
                                                                            chọn
                                                                            một
                                                                            lệnh
                                                                            sản
                                                                            xuất
                                                                            khác.
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="font-semibold text-xl">
                                                                            Hiện
                                                                            tại
                                                                            không
                                                                            có
                                                                            bất
                                                                            kỳ
                                                                            thông
                                                                            tin
                                                                            sản
                                                                            phẩm
                                                                            nào.
                                                                        </div>
                                                                        <div className="text-gray-500 mt-1">
                                                                            Hãy
                                                                            chọn
                                                                            một
                                                                            lệnh
                                                                            sản
                                                                            xuất
                                                                            để
                                                                            bắt
                                                                            đầu.
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    ) : selectedProgress?.value === "TC-DG" ? (
                                        <>
                                            {isProductsLoading ? (
                                                <div className="p-6 flex justify-center items-center py-6">
                                                    <Spinner
                                                        thickness="7px"
                                                        className="mt-3"
                                                        speed="0.65s"
                                                        emptyColor="gray.200"
                                                        color="blue.500"
                                                        size="xl"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    {productList?.length > 0 ? (
                                                        <div className="p-4 pb-0">
                                                            <div className=" pb-3">
                                                                <div className="text-sm text-gray-500 uppercase font-medium">
                                                                    Mã lệnh:{" "}
                                                                    {
                                                                        selectedDocEntry
                                                                    }
                                                                </div>
                                                                <div className="text-lg font-bold text-[#17506B]">
                                                                    Sản phẩm:{" "}
                                                                    {
                                                                        selectedSPDich
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="border border-gray-300 rounded-lg xl:block lg:block md:block hidden">
                                                                <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                                                                    <thead>
                                                                        <tr className="bg-gray-200 text-left">
                                                                            <th className="px-4 py-2 w-[300px] border border-gray-300">
                                                                                Chi
                                                                                tiết
                                                                            </th>
                                                                            <th className="px-4 py-2 w-[120px] border border-gray-300">
                                                                                Sản
                                                                                lượng
                                                                            </th>
                                                                            <th className="px-4 py-2 w-[120px] border border-gray-300">
                                                                                Đã
                                                                                làm
                                                                            </th>
                                                                            <th className="px-4 py-2 w-[120px] border border-gray-300">
                                                                                Còn
                                                                                lại
                                                                            </th>
                                                                            <th className="px-4 py-2 border border-gray-300">
                                                                                Số
                                                                                lượng
                                                                                ghi
                                                                                nhận
                                                                                <span className="text-red-500">
                                                                                    {" "}
                                                                                    *
                                                                                </span>
                                                                            </th>
                                                                            <th className="px-4 py-2 border border-gray-300">
                                                                                Mã
                                                                                hộp
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    {productList.map(
                                                                        (
                                                                            item,
                                                                            index
                                                                        ) => (
                                                                            <tbody
                                                                                key={
                                                                                    index
                                                                                }
                                                                            >
                                                                                <tr
                                                                                    className={
                                                                                        index %
                                                                                            2 ===
                                                                                            0
                                                                                            ? "bg-gray-50"
                                                                                            : ""
                                                                                    }
                                                                                >
                                                                                    <td className="px-4 py-3 border border-gray-300">
                                                                                        <div className="uppercase text-sm text-gray-500">
                                                                                            {item.MACT ||
                                                                                                "Không xác định"}
                                                                                        </div>
                                                                                        <div className="font-semibold truncate">
                                                                                            {item.NameCT ||
                                                                                                "Không xác định"}
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="px-4 py-3 border border-gray-300">
                                                                                        {item.PlanQty ||
                                                                                            0}
                                                                                    </td>
                                                                                    <td className="px-4 py-3 border border-gray-300">
                                                                                        {item.CompletedQty ||
                                                                                            0}
                                                                                    </td>
                                                                                    <td className="px-4 py-3 border border-gray-300">
                                                                                        {item.RemainQty ||
                                                                                            0}
                                                                                    </td>
                                                                                    <td className="px-4 py-2 border border-gray-300">
                                                                                        <input
                                                                                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                                                            value={
                                                                                                inputValues[
                                                                                                    index
                                                                                                ]
                                                                                                    ?.quantity ||
                                                                                                ""
                                                                                            }
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleInputChange(
                                                                                                    index,
                                                                                                    "quantity",
                                                                                                    e
                                                                                                        .target
                                                                                                        .value
                                                                                                )
                                                                                            }
                                                                                        />
                                                                                    </td>
                                                                                    <td className="px-4 py-2 border border-gray-300">
                                                                                        <input
                                                                                            className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                                                            value={
                                                                                                inputValues[
                                                                                                    index
                                                                                                ]
                                                                                                    ?.boxCode ||
                                                                                                ""
                                                                                            }
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleInputChange(
                                                                                                    index,
                                                                                                    "boxCode",
                                                                                                    e
                                                                                                        .target
                                                                                                        .value
                                                                                                )
                                                                                            }
                                                                                        />
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        )
                                                                    )}
                                                                </table>
                                                            </div>

                                                            <div className="space-y-3">
                                                                {productList.map(
                                                                    (
                                                                        item,
                                                                        index
                                                                    ) => (
                                                                        <div className="border border-gray-300 bg-gray-50 rounded-lg xl:hidden lg:hidden md:hidden flex flex-col p-3 gap-y-2">
                                                                            <div className="flex flex-col">
                                                                                <span className="uppercase text-xs font-medium text-gray-500">
                                                                                    [{item.MACT ||
                                                                                        "Không xác định"}]
                                                                                </span>
                                                                                <span className="text-lg font-bold">
                                                                                    {item.NameCT ||
                                                                                        "Không xác định"}
                                                                                </span>
                                                                            </div>

                                                                            <div className="flex flex-col gap-y-1">
                                                                                <div className=" grid grid-cols-2">
                                                                                    <span className="">
                                                                                        Sản
                                                                                        lượng:
                                                                                    </span>
                                                                                    <span className=" font-bold">
                                                                                        {item.PlanQty ||
                                                                                            0}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="grid grid-cols-2">
                                                                                    <span className="">
                                                                                        Đã
                                                                                        làm:
                                                                                    </span>
                                                                                    <span className="font-bold">
                                                                                        {item.CompletedQty ||
                                                                                            0}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="grid grid-cols-2">
                                                                                    <span className="grid grid-cols-2">
                                                                                        Còn
                                                                                        lại:
                                                                                    </span>
                                                                                    <span className="font-bold">
                                                                                        {item.RemainQty ||
                                                                                            0}
                                                                                    </span>
                                                                                </div>
                                                                            </div>

                                                                            <div className="w-full border-b border-gray-200"></div>

                                                                            <div className="flex flex-col">
                                                                                <span className="pb-1 font-medium text-gray-800">
                                                                                    Số
                                                                                    lượng
                                                                                    ghi
                                                                                    nhận
                                                                                </span>
                                                                                <input
                                                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                                                    value={
                                                                                        inputValues[
                                                                                            index
                                                                                        ]
                                                                                            ?.quantity ||
                                                                                        ""
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        handleInputChange(
                                                                                            index,
                                                                                            "quantity",
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className="pb-1 font-medium text-gray-800">
                                                                                    Mã
                                                                                    hộp
                                                                                </span>
                                                                                <input
                                                                                    className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                                                    value={
                                                                                        inputValues[
                                                                                            index
                                                                                        ]
                                                                                            ?.boxCode ||
                                                                                        ""
                                                                                    }
                                                                                    onChange={(
                                                                                        e
                                                                                    ) =>
                                                                                        handleInputChange(
                                                                                            index,
                                                                                            "boxCode",
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>

                                                            <div className="flex justify-end mt-4">
                                                                <button
                                                                    className="w-fit h-full space-x-2 flex items-center bg-[#17506B] p-2.5 rounded-xl text-white px-4 active:scale-[.95] active:duration-75 transition-all"
                                                                    onClick={() => {
                                                                        onOpen();
                                                                    }}
                                                                >
                                                                    <p className="text-[15px]">
                                                                        Ghi nhận
                                                                    </p>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center py-8">
                                                            <img
                                                                src={EmptyData}
                                                                alt="No data"
                                                                className="w-[135px] h-[135px] opacity-60 object-contain mx-auto"
                                                            />
                                                            <div className="p-6 text-center">
                                                                {productList.length ===
                                                                    0 ? (
                                                                    <>
                                                                        <div className="font-semibold xl:text-xl lg:text-xl md:text-lg text-lg">
                                                                            Chúng
                                                                            tôi
                                                                            không
                                                                            tìm
                                                                            thấy
                                                                            bất
                                                                            kỳ
                                                                            thông
                                                                            tin
                                                                            sản
                                                                            phẩm
                                                                            nào.
                                                                        </div>
                                                                        <div className="text-gray-500 mt-1">
                                                                            Hãy
                                                                            thử
                                                                            chọn
                                                                            một
                                                                            lệnh
                                                                            sản
                                                                            xuất
                                                                            khác.
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="font-semibold text-xl">
                                                                            Hiện
                                                                            tại
                                                                            không
                                                                            có
                                                                            bất
                                                                            kỳ
                                                                            thông
                                                                            tin
                                                                            sản
                                                                            phẩm
                                                                            nào.
                                                                        </div>
                                                                        <div className="text-gray-500 mt-1">
                                                                            Hãy
                                                                            chọn
                                                                            một
                                                                            lệnh
                                                                            sản
                                                                            xuất
                                                                            để
                                                                            bắt
                                                                            đầu.
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center py-8">
                                            <img
                                                src={EmptyData}
                                                alt="No data"
                                                className="w-[135px] h-[135px] opacity-60 object-contain mx-auto"
                                            />
                                            <div className="p-6 text-center">
                                                {productList.length ===
                                                    0 ? (
                                                    <>
                                                        <div className="font-semibold xl:text-xl lg:text-xl md:text-lg text-lg">
                                                            Chúng
                                                            tôi
                                                            không
                                                            tìm
                                                            thấy
                                                            bất
                                                            kỳ
                                                            thông
                                                            tin
                                                            sản
                                                            phẩm
                                                            nào.
                                                        </div>
                                                        <div className="text-gray-500 mt-1">
                                                            Hãy
                                                            thử
                                                            chọn
                                                            một
                                                            công đoạn để bắt đầu.
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="font-semibold text-xl">
                                                            Hiện
                                                            tại
                                                            không
                                                            có
                                                            bất
                                                            kỳ
                                                            thông
                                                            tin
                                                            sản
                                                            phẩm
                                                            nào.
                                                        </div>
                                                        <div className="text-gray-500 mt-1">
                                                            Hãy
                                                            chọn
                                                            một
                                                            lệnh
                                                            sản
                                                            xuất
                                                            để
                                                            bắt
                                                            đầu.
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )} */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Execute Assembly Diagrams */}
                    {/* <Modal
                        isCentered
                        isOpen={isExeAssemblyDiagramsOpen}
                        onClose={onExeAssemblyDiagramsClose}
                        size="xl"
                        blockScrollOnMount={false}
                        closeOnOverlayClick={false}
                    >
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>
                                Bạn chắc chắn muốn ghi nhận?
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
                                <div className="flex w-full items-center space-x-3">
                                    <button
                                        onClick={() => {
                                            onExeAssemblyDiagramsClose();
                                        }}
                                        className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-1/3 disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={exeAssemblyDiagramsLoading}
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        className="flex items-center justify-center bg-gray-800 p-2 rounded-xl px-4 h-fit font-medium active:scale-[.95]  active:duration-75 transition-all xl:w-fit md:w-fit w-2/3 text-white"
                                        type="button"
                                        onClick={() => {
                                            executeAssemblyDiagrams();
                                        }}
                                    >
                                        {exeAssemblyDiagramsLoading ? (
                                            <div className="flex w-full items-center justify-center space-x-4">
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
                    </Modal> */}

                    {/* Execute TC-DG Confirm Modal */}
                    <Modal
                        isCentered
                        isOpen={isOpen}
                        onClose={onClose}
                        size="xl"
                        blockScrollOnMount={false}
                        closeOnOverlayClick={false}
                    >
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>
                                Bạn chắc chắn muốn ghi nhận?
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
                                <div className="flex w-full items-center space-x-3">
                                    <button
                                        onClick={() => {
                                            onClose();
                                        }}
                                        className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-1/3 disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        className="flex items-center justify-center bg-gray-800 p-2 rounded-xl px-4 h-fit font-medium active:scale-[.95]  active:duration-75 transition-all xl:w-fit md:w-fit w-2/3 text-white"
                                        type="button"
                                        onClick={() => {
                                            handleSubmit();
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex w-full items-center justify-center space-x-4">
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
            {isProductionOrderLoading && <Loader />}
        </Layout>
    );
};

export default KitchenCabinetFinishedGoodsReceipt;
