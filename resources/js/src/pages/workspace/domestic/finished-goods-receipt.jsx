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
import Loader from "../../../components/Loader";
import { Spinner } from "@chakra-ui/react";
import EmptyData from "../../../assets/images/empty-data.svg";
import { set } from "date-fns";

const options = [
    { value: "SP01", label: "Solid wood furniture" },
    { value: "SP02", label: "Plywood" },
    { value: "SP03", label: "Medium-density fiberboard (MDF)" },
    { value: "SP04", label: "Laminated wood" },
    { value: "SP05", label: "Veneered wood" },
    { value: "SP06", label: "Wood pellets" },
];

const FinishedGoodsReceipt = () => {
    const navigate = useNavigate();
    const [selectedGroup, setSelectedGroup] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [productionOrderList, setProductionOrderList] = useState([]);
    const [selectedDocEntry, setSelectedDocEntry] = useState(null);
    const [selectedSPDich, setSelectedSPDich] = useState(null);
    const [productList, setProductList] = useState([]);
    const [inputValues, setInputValues] = useState([]);

    // Loading
    const [isProductionOrderLoading, setIsProductionOrderLoading] = useState(false);
    const [isProductsLoading, setIsProductsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getProductionOrderList = async () => {
        setIsProductionOrderLoading(true);
        try {
            const res = await domesticApi.getProductionOrderList();

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
            const res = await domesticApi.getProductsByProductionOrder(id);
            console.log(res);
            setIsProductsLoading(false);
            setProductList(res);

            const initialInputs = res.map(item => ({
                quantity: "", 
                boxCode: ""   
            }));
            setInputValues(initialInputs);
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi lấy dữ liệu");
            setIsProductsLoading(false);
        }
    };

    const handleInputChange = (index, field, value) => {
        const newInputValues = [...inputValues];
        newInputValues[index][field] = value;
        setInputValues(newInputValues);
    };
    
    const handleSubmit = async() => {
        setIsSubmitting(true);
        const submittedData = {
            "LSX": selectedDocEntry,
            "SPDich": selectedSPDich,
            "Detail": productList.map((item, index) => ({
                "MaCT": item.MACT,
                "SoLuong": inputValues[index].quantity ? parseInt(inputValues[index].quantity) : 0,
                "LineId": item.LineId,
                "MaHop": inputValues[index].boxCode || undefined 
            }))
        };

        console.log("Dữ liệu ghi nhận:", submittedData);
        toast.success("Dữ liệu đã được ghi nhận.");
        setIsSubmitting(false);
        onClose();
    };

    useEffect(() => {
        getProductionOrderList();
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
                            Nhập sản lượng{" "}
                            <span className=" text-[#622A2A]">
                                dự án nội địa
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-between mb-3 px-4 xl:px-0 lg:px-0 md:px-0 items-center gap-4">
                        <div className="my-4 mb-2 mt-3 w-full pb-4 rounded-xl bg-white ">
                            <div className="flex flex-col p-4 pb-0  w-full justify-end ">
                                <div className=" ">
                                    <div className="px-0 w-full">
                                        <div className="block xl:text-md lg:text-md md:text-md text-sm font-medium text-gray-900">
                                            Chọn sản phẩm đích
                                        </div>
                                        <Select
                                            options={productionOrderList}
                                            value={selectedDocEntry}
                                            onChange={(value) => {
                                                getProductsByProductionOrder(
                                                    value.value
                                                );
                                                setSelectedDocEntry(value.value);
                                                setSelectedSPDich(value.SPDich);
                                            }}
                                            placeholder="Tìm kiếm"
                                            className="mt-1 mb-4 w-full"
                                        />
                                    </div>

                                    {/* Table */}
                                    {isProductsLoading ? (
                                        <div className="flex justify-center items-center py-6">
                                            <Spinner
                                                thickness="6px"
                                                speed="0.65s"
                                                emptyColor="gray.200"
                                                color="blue.500"
                                                size="xl"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            {productList?.length > 0 ? (
                                                <div>
                                                    <div className="border border-gray-300 rounded-lg">
                                                        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
                                                            <thead>
                                                                <tr className="bg-gray-200 text-left">
                                                                    <th className="px-4 py-2 w-[300px] border border-gray-300">
                                                                        Chi tiết
                                                                    </th>
                                                                    <th className="px-4 py-2 w-[120px] border border-gray-300">
                                                                        Sản lượng
                                                                    </th>
                                                                    <th className="px-4 py-2 w-[120px] border border-gray-300">
                                                                        Đã làm
                                                                    </th>
                                                                    <th className="px-4 py-2 w-[120px] border border-gray-300">
                                                                        Còn lại
                                                                    </th>
                                                                    <th className="px-4 py-2 border border-gray-300">
                                                                        Số lượng
                                                                        ghi nhận
                                                                        <span className="text-red-500">
                                                                            {" "}
                                                                            *
                                                                        </span>
                                                                    </th>
                                                                    <th className="px-4 py-2 border border-gray-300">
                                                                        Mã hộp
                                                                        <span className="text-red-500">
                                                                            {" "}
                                                                            *
                                                                        </span>
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            {productList.map(
                                                                (item, index) => (
                                                                <tbody key={index}>
                                                                    <tr className={index % 2 === 0 ? "bg-gray-50" : ""}>
                                                                        <td className="px-4 py-3 border border-gray-300">
                                                                            <div className="uppercase text-sm text-gray-500">000000{item.MACT || "Không xác định"}</div>
                                                                            <div className="font-semibold truncate">Sản phẩm {item.NameCT || "Không xác định"}</div>
                                                                        </td>
                                                                        <td className="px-4 py-3 border border-gray-300">
                                                                            {item.PlanQty || 0}
                                                                        </td>
                                                                        <td className="px-4 py-3 border border-gray-300">
                                                                            {item.CompletedQty || 0}
                                                                        </td>
                                                                        <td className="px-4 py-3 border border-gray-300">
                                                                            {item.RemainQty || 0}
                                                                        </td>
                                                                        <td className="px-4 py-2 border border-gray-300">
                                                                            <input 
                                                                                className="w-full px-2 py-1 border border-gray-300 rounded-md" 
                                                                                value={inputValues[index]?.quantity || ""}
                                                                                onChange={(e) => handleInputChange(index, "quantity", e.target.value)}
                                                                            />
                                                                        </td>
                                                                        <td className="px-4 py-2 border border-gray-300">
                                                                            <input 
                                                                                className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                                                value={inputValues[index]?.boxCode || ""}
                                                                                onChange={(e) => handleInputChange(index, "boxCode", e.target.value)}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            ))}
                                                        </table>
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
                                                <div className="flex flex-col items-center py-6">
                                                    <img
                                                        src={EmptyData}
                                                        alt="No data"
                                                        className="w-[135px] h-[135px] opacity-60 object-contain mx-auto"
                                                    />
                                                    <div className="text-center">
                                                        {productList.length ===
                                                        0 ? (
                                                            <>
                                                                <div className="font-semibold text-xl">
                                                                    Chúng tôi không tìm thấy bất kỳ thông tin sản phẩm nào.
                                                                </div>
                                                                <div className="text-gray-500 mt-1">
                                                                    Hãy thử chọn một lệnh sản xuất khác.
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="font-semibold text-xl">
                                                                    Hiện tại không có bất kỳ thông tin sản phẩm nào.
                                                                </div>
                                                                <div className="text-gray-500 mt-1">
                                                                    Hãy chọn một lệnh sản xuất để bắt đầu.
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Execute Confirm Modal */}
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
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => {
                                            onClose();
                                        }}
                                        className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        className="bg-gray-800 p-2 rounded-xl px-4 h-fit font-medium active:scale-[.95]  active:duration-75  transition-all xl:w-fit md:w-fit w-full text-white"
                                        type="button"
                                        onClick={() => {
                                            handleSubmit();
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center space-x-4">
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

export default FinishedGoodsReceipt;
