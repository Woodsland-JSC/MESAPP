import React, { useEffect, useState, useRef } from "react";
import Layout from "../../layouts/layout";
import { Link } from "react-router-dom";
import PalletCard from "../../components/PalletCard";
import { HiPlus } from "react-icons/hi";
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
import { format } from "date-fns";
import BigSelect from "../../components/Select/BigSelect";
import Loader from "../../components/Loader";

function WoodSorting() {
    const [loading, setLoading] = useState(false);
    const [woodTypes, setWoodTypes] = useState([]);
    const [dryingMethods, setDryingMethods] = useState([]);
    const [dryingReasons, setDryingReasons] = useState([]);

    // Date picker
    const [startDate, setStartDate] = useState(new Date());
    const formattedStartDate = format(startDate, "yyyy-MM-dd");

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

    // const handleAddToList = async () => {
    //     if (validateData()) {
    //         try {
    //             setIsLoading(true);

    //             const data = {
    //                 woodType: selectedWoodType,
    //                 batchId: batchId,
    //                 dryingReason: selectedDryingReason,
    //                 dryingMethod: selectedDryingMethod,
    //                 startDate: formattedStartDate,
    //             };
    //             console.log("1.Dữ liệu từ form:", data);

    //             const response = await palletsApi.getStockByItem(
    //                 selectedDryingMethod.code,
    //                 selectedDryingReason.value,
    //                 selectedDryingMethod.batchNum
    //             );

    //             console.log("2. Get thông tin từ ItemCode:", response);

    //             if (response && response.length > 0) {
    //                 // Filter out existing items
    //                 const newItems = response.filter(
    //                     (item) =>
    //                         !isPalletCardExists(
    //                             item.WhsCode + item.BatchNum,
    //                             palletCards
    //                         )
    //                 );

    //                 // Check if any new items were found
    //                 if (newItems.length > 0) {
    //                     const newPalletCards = newItems.map((item) => (
    //                         <PalletCard
    //                             key={item.WhsCode + item.BatchNum}
    //                             itemCode={selectedDryingMethod.code}
    //                             itemName={selectedDryingMethod.label}
    //                             batchNum={item.BatchNum}
    //                             inStock={item.Quantity}
    //                             whsCode={item.WhsCode}
    //                             height={item.CDai}
    //                             width={item.CRong}
    //                             thickness={item.CDay}
    //                             isInvalidQuantity={isInvalidQuantity}
    //                             onDelete={() =>
    //                                 handleDeletePalletCard(
    //                                     item.WhsCode + item.BatchNum
    //                                 )
    //                             }
    //                             onQuantityChange={(quantity) => {
    //                                 handlePalletQuantityChange(
    //                                     item.WhsCode + item.BatchNum,
    //                                     quantity
    //                                 );
    //                             }}
    //                         />
    //                     ));

    //                     // Find the index to insert new items
    //                     const insertionIndex = palletCards.findIndex(
    //                         (card) => !isPalletCardExists(card.key, newItems)
    //                     );

    //                     // Insert new items at the calculated index
    //                     setPalletCards((prevPalletCards) => [
    //                         ...prevPalletCards,
    //                         ...newPalletCards,
    //                     ]);

    //                     toast.success("Đã thêm vào danh sách");
    //                 } else {
    //                     toast("Item đã tồn tại trong danh sách.");
    //                 }
    //             } else {
    //                 toast("Gỗ đã hết. Xin hãy chọn quy cách khác.");
    //                 return;
    //             }
    //         } catch (error) {
    //             console.error("Error fetching stock by item:", error);
    //             toast.error("Không tìm thấy thông tin. Vui lòng thử lại sau.");
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     }
    // };

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

    //     if (validateData()) {
    //         try {
    //             setIsLoading(true);

    //             const data = {
    //                 woodType: selectedWoodType,
    //                 batchId: batchId,
    //                 dryingReason: selectedDryingReason,
    //                 dryingMethod: selectedDryingMethod,
    //                 startDate: formattedStartDate,
    //             };
    //             console.log("1.Dữ liệu từ form:", data);

    //             const response = await palletsApi.getStockByItem(
    //                 selectedDryingMethod.code,
    //                 selectedDryingReason.value,
    //                 selectedDryingMethod.batchNum
    //             );

    //             console.log("2. Get thông tin từ ItemCode:", response);

    //             if (response && response.length > 0) {
    //                 const newPalletCards = response
    //                     .filter(
    //                         (item) =>
    //                             !isPalletCardExists(
    //                                 item.WhsCode + item.BatchNum,
    //                                 palletCards
    //                             )
    //                     )
    //                     .map((item) => (
    //                         <PalletCard
    //                             key={item.WhsCode + item.BatchNum}
    //                             itemCode={selectedDryingMethod.code}
    //                             itemName={selectedDryingMethod.label}
    //                             batchNum={item.BatchNum}
    //                             inStock={item.Quantity}
    //                             whsCode={item.WhsCode}
    //                             height={item.CDai}
    //                             width={item.CRong}
    //                             thickness={item.CDay}
    //                             isInvalidQuantity={isInvalidQuantity}
    //                             onDelete={() =>
    //                                 handleDeletePalletCard(
    //                                     item.WhsCode + item.BatchNum
    //                                 )
    //                             }
    //                             onQuantityChange={(quantity) => {
    //                                 handlePalletQuantityChange(
    //                                     item.WhsCode + item.BatchNum,
    //                                     quantity
    //                                 );
    //                             }}
    //                         />
    //                     ));

    //                 setPalletCards((prevPalletCards) => [
    //                     ...prevPalletCards,
    //                     ...newPalletCards,
    //                 ]);
    //             } else {
    //                 toast("Gỗ đã hết. Xin hãy chọn quy cách khác.");
    //                 return;
    //             }

    //             toast.success("Đã thêm vào danh sách");
    //         } catch (error) {
    //             console.error("Error fetching stock by item:", error);
    //             toast.error("Không tìm thấy thông tin. Vui lòng thử lại sau.");
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     }
    // };

    // const handleAddToList = async () => {
    //     if (validateData()) {
    //         try {
    //             setIsLoading(true);

    //             const data = {
    //                 woodType: selectedWoodType,
    //                 batchId: batchId,
    //                 dryingReason: selectedDryingReason,
    //                 dryingMethod: selectedDryingMethod,
    //                 startDate: formattedStartDate,
    //             };
    //             console.log("1.Dữ liệu từ form:", data);

    //             const response = await palletsApi.getStockByItem(
    //                 selectedDryingMethod.code,
    //                 selectedDryingReason.value,
    //                 selectedDryingMethod.batchNum
    //             );

    //             console.log("2. Get thông tin từ ItemCode:", response);

    //             if (response && response.length > 0) {
    //                 const newPalletCards = response
    //                     .filter(
    //                         (item) =>
    //                             !isPalletCardExists(
    //                                 item.WhsCode + item.BatchNum,
    //                                 palletCards
    //                             )
    //                     )
    //                     .map((item) => (
    //                         <PalletCard
    //                             key={item.WhsCode + item.BatchNum}
    //                             itemCode={selectedDryingMethod.code}
    //                             itemName={selectedDryingMethod.label}
    //                             batchNum={item.BatchNum}
    //                             inStock={item.Quantity}
    //                             whsCode={item.WhsCode}
    //                             height={item.CDai}
    //                             width={item.CRong}
    //                             thickness={item.CDay}
    //                             isInvalidQuantity={isInvalidQuantity}
    //                             onDelete={() =>
    //                                 handleDeletePalletCard(
    //                                     item.WhsCode + item.BatchNum
    //                                 )
    //                             }
    //                             onQuantityChange={(quantity) => {
    //                                 handlePalletQuantityChange(
    //                                     item.WhsCode + item.BatchNum,
    //                                     quantity
    //                                 );
    //                             }}
    //                         />
    //                     ));

    //                 setPalletCards((prevPalletCards) => {
    //                     // Check if the card already exists in the array
    //                     const newPalletCardKeys = newPalletCards.map(
    //                         (card) => card.key
    //                     );
    //                     const updatedPalletCards = [
    //                         ...prevPalletCards.filter(
    //                             (card) => !newPalletCardKeys.includes(card.key)
    //                         ),
    //                         ...newPalletCards,
    //                     ];

    //                     // Display toast if any existing items are found
    //                     if (updatedPalletCards.length !== prevPalletCards.length) {
    //                         toast("Một số mục đã tồn tại trong danh sách.");
    //                     }

    //                     return updatedPalletCards;
    //                 });
    //             } else {
    //                 toast("Gỗ đã hết. Xin hãy chọn quy cách khác.");
    //                 return;
    //             }

    //             toast.success("Đã thêm vào danh sách");
    //         } catch (error) {
    //             console.error("Error fetching stock by item:", error);
    //             toast.error("Không tìm thấy thông tin. Vui lòng thử lại sau.");
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     }
    // };

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
            toast.error("Giá trị nhập vào không hợp lệ.");
            return;
        }

        const palletObject = createPalletObject();
        console.log("2.5. Thông tin pallet sẽ được gửi đi:", palletObject);

        try {
            const response = await toast.promise(
                axios.post("/api/pallets/v2/create", palletObject),
                {
                    loading: "Đang tạo pallet...",
                    success: <p>Tạo pallet thành công!</p>,
                    error: <p>Có lỗi xảy ra, vui lòng thử lại</p>,
                }
            );

            console.log("3. Thông tin pallet:", palletObject);

            if (woodTypeSelectRef) {
                woodTypeSelectRef.clearValue();
            }
            if (dryingReasonSelectRef) {
                dryingReasonSelectRef.clearValue();
            }
            if (dryingMethodSelectRef) {
                dryingMethodSelectRef.clearValue();
            }

            setBatchId("");
            setStartDate(new Date());
            setPalletCards([]);
            setIsInvalidQuantity(false);
            setPalletQuantities({});

            console.log("4. Kết quả tạo pallet:", response.data);
        } catch (error) {
            console.error("Error creating pallet:", error);
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
                                            class="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            Workspace
                                        </a>
                                    </div>
                                </li>
                                <li aria-current="page">
                                    <div class="flex items-center">
                                        <svg
                                            class="w-3 h-3 text-gray-400 mx-1"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 6 10"
                                        >
                                            <path
                                                stroke="currentColor"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="m1 9 4-4-4-4"
                                            />
                                        </svg>
                                        <Link
                                            to="/workspace"
                                            class="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            <div>Quản lý sấy gỗ</div>
                                        </Link>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="text-3xl font-bold mb-6">
                        Tạo pallet xếp sấy
                    </div>

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
                                <HiPlus className="text-xl" />
                                Tạo pallet
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
