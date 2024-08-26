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

function CreateDryingPlan() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        palletsApi
            .getBOWList()

            .then((response) => {
                console.log("1. Load danh sách BOWCard:", response);

                setBowCards(response || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching BOWCard list:", error);
                setLoading(false);
            });
        // .finally(() => {

        // });
    }, []);

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
                <div className="w-screen mb-4 xl:mb-4  px-5 xl:p-12 lg:p-12 md:p-12 p-4 xl:px-32">
                    {/* Go back */}
                    <div 
                        className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B] "
                        onClick={() => navigate(-1)}
                    >
                        <IoIosArrowBack />
                        <div>Quay lại</div>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between mb-6 items-center">
                        <div className="serif text-4xl font-bold ">
                            Tạo kế hoạch sấy
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

                    {/* Controller */}
                    {/* <div className=" my-4 mb-6 xl:w-full">
                        <label
                            for="search"
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
                                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search"
                                required
                            />
                        </div>
                    </div> */}

                    {/* BOW Card List */}
                    {createdBowCards && bowCards.length > 0 ? (
                    <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
                        {createdBowCards.map((createdbowCard, index) => (
                            <BOWCard key={index} {...createdbowCard} />
                        ))}
                        {bowCards
                            ?.map((bowCard, index) => (
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
                                        Tiến trình hiện tại không có hoạt động nào.
                                    </div>
                                </div>
                            )}        
                        </>
                    )}
                    <div class="fixed bottom-7 right-8 xl:hidden md:hidden block">
                        <button
                            class="bg-[#1f2937] hover:bg-[#2d3b4e] text-white font-bold p-5 rounded-full shadow-lg"
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
