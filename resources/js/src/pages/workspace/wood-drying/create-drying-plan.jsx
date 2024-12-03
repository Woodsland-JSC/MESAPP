import React, { useEffect, useState, useRef, useMemo } from "react";
import Layout from "../../../layouts/layout";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import BOWCard from "../../../components/BOWCard";
import { HiPlus } from "react-icons/hi";
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
} from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import palletsApi from "../../../api/palletsApi";
import axios from "axios";
import toast from "react-hot-toast";
import { addDays, format, add } from "date-fns";
import moment from "moment";
import Loader from "../../../components/Loader";
import useAppContext from "../../../store/AppContext";
import { BiConfused } from "react-icons/bi";
import { IoIosArrowBack } from "react-icons/io";
import { BiSolidFactory } from "react-icons/bi";

function CreateDryingPlan() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(false);
    const [isKilnLoading, setIsKilnLoading] = useState(false);

    const { user } = useAppContext();
    const navigate = useNavigate();

    const [kiln, setKiln] = useState([]);
    const [dryingReasonsPlan, setDryingReasonsPlan] = useState([]);
    const [thicknessOptions, setThicknessOptions] = useState([]);

    // Validating
    const [selectedKiln, setSelectedKiln] = useState(null);
    const [selectedDryingReasonsPlan, setSelectedDryingReasonsPlan] =
        useState(null);
    const [selectedThickness, setSelectedThickness] = useState(null);

    const [reloadAsyncSelectKey, setReloadAsyncSelectKey] = useState(0);

    // Mini Loading When Creating Drying Plan
    const [isLoading, setIsLoading] = useState(false);

    const [createdBowCards, setCreatedBowCards] = useState([]);
    const [bowCards, setBowCards] = useState([]);

    const getBOWLists = async () => {
        setLoading(true);
        try {
            const res = await palletsApi.getBOWList();
            setBowCards(res || []);

        } catch (error) {
            toast.error("Có lỗi trong quá trình lấy dữ liệu.");
            console.error("Error fetching BOWCard list:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        getBOWLists();
    }, []);

    useEffect(() => {
        loadKilns();
        palletsApi
            .getPlanDryingReason()
            .then((data) => {
                const options = data.map((item) => ({
                    value: item.Code,
                    label: item.Name,
                }));
                setDryingReasonsPlan(options);
            })
            .catch((error) => {
                console.error("Error fetching drying reasons:", error);
            });

        if (selectedDryingReasonsPlan) {
            loadThicknessOptions(selectedDryingReasonsPlan.value, (options) => {
                setThicknessOptions(options);
            });
            setReloadAsyncSelectKey((prevKey) => prevKey + 1);
        }
    }, [selectedDryingReasonsPlan]);

    const loadKilns = async () => {
        setIsKilnLoading(true);
        const data = await palletsApi.getKiln();
        const options = data.map((item) => ({
            value: item.Code,
            label: item.Name,
        }));
        setKiln(options);
        setIsKilnLoading(false);
    };

    const filteredBowCards = bowCards.filter((bowCard) => bowCard.Status === 0 && bowCard.plant === user.plant);

    const asyncSelectKey = useMemo(
        () => reloadAsyncSelectKey,
        [reloadAsyncSelectKey]
    );

    const filter = (inputValue, options) =>
        options.filter((option) =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
        );

    const loadOptionsCallback = (inputValue, callback) => {
        if (selectedDryingReasonsPlan) {
            palletsApi
                .getThickness(selectedDryingReasonsPlan.value)
                .then((response) => {
                    const options = response.map((item) => ({
                        value: item.Code,
                        label: item.Name,
                        U_Time: item.U_Time,
                        U_Type: item.U_Type,
                    }));
                    callback(options);
                })
                .catch((error) => {
                    console.error("Error fetching thickness:", error);
                });
        }
    };

    const loadThicknessOptions = (inputValue, callback) => {
        loadOptionsCallback(inputValue, callback);
    };

    // Validating
    const validateData = () => {
        if (!selectedKiln || selectedKiln.value === "") {
            toast.error("Lò sấy không được bỏ trống.");
            return false;
        }
        if (
            !selectedDryingReasonsPlan ||
            selectedDryingReasonsPlan.value === ""
        ) {
            toast.error("Mục đích sấy không được bỏ trống");
            return false;
        }
        if (!selectedThickness || selectedThickness.value === "") {
            toast.error("Chiều dày sấy không được bỏ trống");
            return false;
        }

        return true;
    };

    const handleCompletion = () => {
        if (validateData()) {
            console.log("1. Dữ liệu thu thập được:", {
                "Mã Lò": selectedKiln.value,
                "Mục đích sấy": selectedDryingReasonsPlan.value,
                "Chiều dày sấy": selectedThickness.value,
                "Thời gian sấy dự kiến:": selectedThickness.U_Time,
            });

            setIsLoading(true);

            const postData = {
                Oven: selectedKiln.value,
                Reason: selectedDryingReasonsPlan.value,
                Method: selectedThickness.value,
                Time: selectedThickness.U_Time,
            };

            axios
                .post("/api/ovens/create", postData)
                .then((response) => {
                    console.log("2. Kết quả từ API:", response);

                    const A = response.data.Time;
                    const B = new Date();

                    const result = format(
                        add(B, { days: A }),
                        "yyyy-MM-dd HH:mm:ss"
                    );

                    const newBowCard = {
                        planID: response.data.PlanID,
                        status: 0,
                        batchNumber: response.data.Code,
                        kilnNumber: response.data.Oven,
                        thickness: response.data.Method,
                        height: "0",
                        purpose: response.data.Reason,
                        finishedDate: result,
                        palletQty: 0,
                        weight: 0,
                    };

                    setCreatedBowCards([newBowCard, ...createdBowCards]);

                    toast.success("Tạo kế hoạch sấy thành công.");

                    setSelectedKiln(null);
                    loadKilns();

                    setIsLoading(false);

                    onClose();
                })
                .catch((error) => {
                    console.error(
                        "Error calling API:",
                        error.response.data.error
                    );
                    toast.error(error.response.data.error);
                    setIsLoading(false);
                });
        }
    };

    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center bg-transparent ">
                {/* Section */}
                <div className="w-screen mb-4 xl:mb-4  px-5 xl:p-12 lg:p-12 md:p-12 p-4 xl:pt-6 lg:pt-6 md:pt-6 pt-2 xl:px-32">
                    {/* Go back */}
                    <div className="flex items-top justify-between">
                        <div
                            className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B]"
                            onClick={() => navigate(-1)}
                        >
                            <IoIosArrowBack />
                            <div>Quay lại</div>
                        </div>
                        <div className="flex space-x-2 items-center xl:hidden lg:hidden md:hidden text-xs p-1 px-2 bg-[#E1D0FF] text-[#6A1ED4] border-2 border-[#c6a3f7] font-semibold h-fit rounded-lg ">
                            <BiSolidFactory />
                            {user.plant === "TH" ? "Thuận Hưng"
                                : user.plant === "YS" ? "Yên Sơn"
                                : user.plant === "CH" ? "Chiêm Hóa"
                                : user.plant === "TB" ? "Thái Bình"
                                : user.plant === "HG" ? "Hà Giang"
                                : "UNKNOWN"}
                        </div>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between mb-6 items-center">
                        <div className="flex space-x-4">
                            <div className="serif text-4xl font-bold">Tạo kế hoạch sấy</div>
                            <div className="xl:inline-block lg:inline-block md:inline-block hidden text-[12px] p-0.5 px-2 bg-[#E1D0FF] text-[#6A1ED4] border-2 border-[#c6a3f7] font-semibold uppercase h-fit rounded-lg">
                                {user.plant === "TH" ? "Thuận Hưng"
                                : user.plant === "YS" ? "Yên Sơn"
                                : user.plant === "CH" ? "Chiêm Hóa"
                                : user.plant === "TB" ? "Thái Bình"
                                : user.plant === "HG" ? "Hà Giang"
                                : "UNKNOWN"}
                            </div>
                        </div>
                        <button
                            className="bg-[#1f2937] font-medium rounded-xl p-2.5 px-4 text-white xl:flex items-center md:flex hidden active:scale-[.95] active:duration-75 transition-all"
                            onClick={onOpen}
                        >
                            <HiPlus className="text-xl mr-2" />
                            Tạo mới
                        </button>
                    </div>

                    <Modal
                        closeOnOverlayClick={false}
                        onClose={onClose}
                        isOpen={isOpen}
                        size="xs"
                        isCentered
                    >
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Tạo kế hoạch sấy</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                <div></div>
                                <div className="flex flex-col space-y-4">
                                    <div className="">
                                        <label
                                            for="first_name"
                                            className="block mb-2 text-md font-medium text-gray-900"
                                        >
                                            Lò sấy
                                        </label>
                                        <Select
                                            value={selectedKiln}
                                            options={kiln}
                                            onChange={(value) => {
                                                console.log(
                                                    "Selecte Kiln",
                                                    value
                                                );
                                                setSelectedKiln(value);
                                            }}
                                        />
                                    </div>
                                    <div className="">
                                        <label
                                            for="first_name"
                                            className="block mb-2 text-md font-medium text-gray-900"
                                        >
                                            Mục đích sấy
                                        </label>
                                        <Select
                                            options={dryingReasonsPlan}
                                            onChange={(value) => {
                                                console.log(
                                                    "Selected Drying Reason:",
                                                    value
                                                );
                                                setSelectedDryingReasonsPlan(
                                                    value
                                                );
                                            }}
                                        />
                                    </div>
                                    <div className="">
                                        <label
                                            for="first_name"
                                            className="block mb-2 text-md font-medium text-gray-900"
                                        >
                                            Chiều dày sấy
                                        </label>

                                        <AsyncSelect
                                            key={asyncSelectKey}
                                            loadingMessage={() => "Đang tải..."}
                                            id="thickness"
                                            loadOptions={loadThicknessOptions}
                                            defaultOptions
                                            onChange={(value) => {
                                                setSelectedThickness(value);
                                            }}
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <div className="flex xl:justify-end lg:justify-end md:justify-end gap-x-3 mt-3">
                                    <button
                                        onClick={onClose}
                                        className=" bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        className="w-full bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all"
                                        onClick={handleCompletion}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center space-x-4">
                                                <Spinner
                                                    size="sm"
                                                    color="white"
                                                />
                                                <div>Đang tải</div>
                                            </div>
                                        ) : (
                                            "Hoàn thành"
                                        )}
                                    </button>
                                </div>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>

                    {/* BOW Card List */}
                    {((createdBowCards || bowCards.length > 0) && bowCards.some(card => card.plant === user.plant)) ? (
                    <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
                        {createdBowCards.map((createdbowCard, index) => (
                            <BOWCard key={index} {...createdbowCard} />
                        ))}
                        {bowCards
                            ?.map((bowCard, index) => ((
                                bowCard.Status === 0) && bowCard.plant === user.plant) && (
                                <BOWCard
                                    key={index}
                                    planID={bowCard.PlanID}
                                    status={bowCard.Status}
                                    batchNumber={bowCard.Code}
                                    kilnNumber={bowCard.Oven}
                                    thickness={bowCard.Method}
                                    purpose={bowCard.Reason}
                                    finishedDate={moment(bowCard?.created_at)
                                        .add(bowCard?.Time, "days")
                                        .format("YYYY-MM-DD HH:mm:ss")}
                                    palletQty={bowCard.TotalPallet}
                                    weight={bowCard.Mass}
                                    isChecked={bowCard.Checked}
                                    isReviewed={bowCard.Review}
                                />
                            ))
                            .reverse()}
                    </div>
                    ) : (
                        <>
                            {!loading && (
                                <div className="h-full mt-20 flex flex-col items-center justify-center text-center">
                                    <BiConfused className="text-center text-gray-400 w-12 h-12 mb-2"/>
                                    <div className="  text-xl text-gray-400"> 
                                        Tiến trình hiện tại của nhà máy không có hoạt động nào.
                                    </div>
                                </div>
                            )}        
                        </>
                    )}
                    <div className="fixed bottom-7 right-8 xl:hidden md:hidden block">
                        <button
                            className="bg-[#1f2937] hover:bg-[#2d3b4e] text-white font-bold p-5 rounded-full shadow-lg"
                            onClick={onOpen}
                        >
                            <HiPlus className="text-2xl" />
                        </button>
                    </div>
                </div>
            </div>
            {loading && <Loader />}
        </Layout>
    );
}

export default CreateDryingPlan;
