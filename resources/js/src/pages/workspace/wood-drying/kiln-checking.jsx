import React, { useEffect, useState, useRef, useMemo } from "react";
import Layout from "../../../layouts/layout";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import BOWCard from "../../../components/BOWCard";
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
import { IoSearch } from "react-icons/io5";
import Select from "react-select";
import { removePlanDryingById } from "../../../api/plan-drying.api";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    useDisclosure
} from "@chakra-ui/react";
import Swal from "sweetalert2";

const sortOption = [
    { value: "desc", label: "Từ mới nhất đến cũ nhất" },
    { value: "asc", label: "Từ cũ nhất đến mới nhất" },
];

function KilnChecking() {
    const [loading, setLoading] = useState(true);
    const [bowCards, setBowCards] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("desc");
    const { user } = useAppContext();
    const navigate = useNavigate();

    const getBOWLists = () => {
        palletsApi
            .getBOWList(0, null, null, 0)

            .then((response) => {
                console.log("1. Load danh sách BOWCard:", response);

                setBowCards(response || []);
            })
            .catch((error) => {
                console.error("Error fetching BOWCard list:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        getBOWLists();
    }, []);

    const filteredBowCards = bowCards.filter((bowCard) =>
        bowCard.Oven.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedBowCards = useMemo(() => {
        const cards = [...filteredBowCards];
        return cards.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return sortBy === "asc" ? dateB - dateA : dateA - dateB;
        });
    }, [filteredBowCards, sortBy]);

    const {
        isOpen: isModalRemove,
        onOpen: onModalRemoveOpen,
        onClose: onModalRemoveClose,
    } = useDisclosure();

    const [planRemove, setPlanRemove] = useState({
        id: null,
        batchNumber: null,
        kilnNumber: null
    });

    const removePlanDrying = (planId, batchNumber, kilnNumber) => {
        setPlanRemove({
            id: planId,
            batchNumber,
            kilnNumber
        });
        onModalRemoveOpen();
    }

    const submitRemove = () => {
        try {
            Swal.fire({
                title: 'Xóa kế hoạch sấy?',
                text: "Hành động này không thể hoàn tác!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy',
            }).then((result) => {
                if (result.isConfirmed) {
                    removePlanDryingById(planRemove.id);
                    onModalRemoveClose();
                    setPlanRemove({
                        id: null,
                        batchNumber: null,
                        kilnNumber: null
                    });
                    getBOWLists();
                    toast.success('Xóa kế hoạch sấy thành công.')
                }
            })
        } catch (error) {
            toast.error('Xóa kế hoạch sấy có lỗi.');
        }
    }

    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center bg-transparent ">
                {/* Section */}
                <div className="w-screen mb-4 xl:mb-4 px-4 xl:p-12 lg:p-12 md:p-12 p-4 xl:pt-6 lg:pt-6 md:pt-6 pt-2 xl:px-32 border-t border-gray-200">
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
                    <div className="flex space-x-4 mb-4">
                        <div className="serif text-4xl font-bold ">
                            Kiểm tra lò sấy
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col xl:space-x-4 lg:space-x-4 md:space-x-4 space-x-0 bg-white p-4 pt-3 rounded-xl mb-4">
                        <div className="xl:w-2/3 lg:w-2/3 md:w-2/3 w-full">
                            <label
                                for="Tìm kiếm kế hoạch sấy"
                                className=" text-sm font-medium text-gray-900 mb-2"
                            >
                                Tìm kiếm
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <IoSearch className="text-gray-500 ml-1 w-5 h-5" />
                                </div>
                                <input
                                    type="search"
                                    id="search"
                                    className="block w-full p-2.5 py-[6.2px] pl-12 text-[16px] text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 mt-1"
                                    placeholder="Tìm kiếm kế hoạch sấy theo lò sấy"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="xl:w-1/3">
                            <label
                                for="Tìm kiếm kế hoạch sấy"
                                className=" text-sm font-medium text-gray-900 "
                            >
                                Sắp xếp
                            </label>
                            <div className="">
                                <Select
                                    options={sortOption}
                                    placeholder="Sắp xếp"
                                    className="mt-1 w-full"
                                    defaultValue={sortOption[0]}
                                    onChange={(value) => {
                                        setLoading(true);
                                        setSortBy(value.value);
                                        setTimeout(
                                            () => setLoading(false),
                                            300
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* BOW Card List */}
                    {filteredBowCards?.length > 0 && (
                        <div className="mb-3 text-gray-600">
                            Có tất cả <b>{filteredBowCards?.length}</b> kế hoạch
                            sấy
                        </div>
                    )}

                    {/* Content */}
                    {(filteredBowCards.some((card) => card.Status === 0) ||
                        (filteredBowCards.some((card) => card.Status === 0) &&
                            (filteredBowCards.some(
                                (card) => card.TotalPallet > 1
                            ) ||
                                filteredBowCards.some(
                                    (card) => card.TotalPallet === 0
                                ))) ||
                        (filteredBowCards.some((card) => card.Status === 0) &&
                            (filteredBowCards.some(
                                (card) => card.Checked === 1
                            ) ||
                                filteredBowCards.some(
                                    (card) => card.Checked === 0
                                )))) &&
                        filteredBowCards.some(
                            (card) => card?.plant === user?.plant
                        ) ? (
                        <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
                            {sortedBowCards
                                ?.map(
                                    (bowCard, index) =>
                                        bowCard.Status === 0 && (
                                            <BOWCard
                                                key={index}
                                                planID={bowCard.PlanID}
                                                status={bowCard.Status}
                                                batchNumber={bowCard.Code}
                                                kilnNumber={bowCard.Oven}
                                                thickness={bowCard.Method}
                                                purpose={bowCard.Reason}
                                                finishedDate={moment(
                                                    bowCard?.created_at
                                                )
                                                    .add(
                                                        bowCard?.Time,
                                                        "days"
                                                    )
                                                    .format(
                                                        "YYYY-MM-DD HH:mm:ss"
                                                    )}
                                                palletQty={
                                                    bowCard.TotalPallet
                                                }
                                                weight={bowCard.Mass}
                                                isChecked={bowCard.Checked}
                                                isReviewed={bowCard.Review}
                                                removePlanDrying={removePlanDrying}
                                            />
                                        )
                                )
                                .reverse()}
                        </div>
                    ) : (
                        <>
                            {!loading && (
                                <div className="h-full mt-20 flex flex-col items-center justify-center text-center">
                                    <BiConfused className="text-center text-gray-400 w-12 h-12 mb-2" />
                                    <div className="  text-xl text-gray-400">
                                        {filteredBowCards.length === 0 &&
                                            searchTerm !== ""
                                            ? "Không tìm thấy kết quả nào phù hợp"
                                            : "Tiến trình hiện tại của nhà máy không có hoạt động nào."}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            {loading && <Loader />}

            {
                planRemove.id && (
                    <Modal
                        isCentered
                        isOpen={isModalRemove}
                        size="lg"
                        scrollBehavior="inside"
                        trapFocus={false}
                    >
                        <ModalOverlay bg="blackAlpha.100" backdropFilter="blur(10px)" />
                        <ModalContent className="!px-0">
                            <ModalHeader className="h-[50px] flex items-center justify-center">
                                <div className="xl:ml-6 serif font-bold text-2xl  ">
                                    Xóa kế hoạch
                                </div>
                            </ModalHeader>
                            <div className="border-b-2 border-[#DADADA]"></div>
                            <ModalBody px={0} py={0}>
                                <div className="flex justify-center py-2">
                                    <div>Xác nhận xóa kế hoạch <span className="text-[#17506B] font-bold">{planRemove.batchNumber}</span> ở lò <span className="text-[#17506B] font-bold">{planRemove.kilnNumber}</span></div>
                                </div>
                            </ModalBody>

                            <ModalFooter className="flex flex-col !p-0 ">
                                <div className="border-b-2 border-gray-100"></div>
                                <div className="flex flex-row xl:px-6 lg-px-6 md:px-6 px-4 w-full items-center justify-end py-4 gap-x-3 ">
                                    <button
                                        onClick={() => {
                                            onModalRemoveClose();
                                            setPlanRemove({
                                                id: null,
                                                batchNumber: null,
                                                kilnNumber: null
                                            });
                                        }}
                                        className="bg-gray-300  p-2 rounded-xl px-4 active:scale-[.95] h-fit active:duration-75 font-medium transition-all xl:w-fit md:w-fit w-full"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        onClick={submitRemove}
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
        </Layout>
    );
}

export default KilnChecking;
