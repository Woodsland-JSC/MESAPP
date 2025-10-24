import React, { useEffect, useState, useRef, useMemo } from "react";
import Layout from "../../../layouts/layout";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import BOWCard from "../../../components/BOWCard";
import palletsApi from "../../../api/palletsApi";
import axios from "axios";
import toast from "react-hot-toast";
import moment from "moment";
import Loader from "../../../components/Loader";
import useAppContext from "../../../store/AppContext";
import { BiConfused } from "react-icons/bi";
import { IoIosArrowBack } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import Select from "react-select";

const sortOption = [
    { value: "desc", label: "Thời gian mới nhất" },
    { value: "asc", label: "Thời gian cũ nhất" },
];

function Kiln() {
    const [loading, setLoading] = useState(true);
    const [bowCards, setBowCards] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("desc");

    const navigate = useNavigate();

    const { user } = useAppContext();

    const isThuKhoXacNhan = useMemo(() => {
        return user?.permissions.some(p => p == 'xacnhanlosay');
    }, [user])

    useEffect(() => {
        palletsApi
            .getBOWList([0, 1], 1, 1, null)
            .then((response) => {
                setBowCards(response || []);
            })
            .catch((error) => {
                console.error("Error fetching BOWCard list:", error);
            })
            .finally(() => {
                setLoading(false);
            });
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

    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center bg-transparent ">
                {/* Section */}
                <div className="w-screen p-6 px-5 xl:p-12 xl:px-32 xl:pt-6 lg:pt-6 md:pt-6 pt-2 border-t border-gray-200">
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
                        <div className="serif text-4xl font-bold ">Lò sấy</div>
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
                    {((filteredBowCards.some((card) => card.Status === 0) &&
                        filteredBowCards.some((card) => card.TotalPallet > 0) &&
                        filteredBowCards.some((card) => card.Checked === 1)) ||
                        (filteredBowCards.some((card) => card.Status === 1) &&
                            (filteredBowCards.some(
                                (card) => card.Review === 0
                            ) ||
                                filteredBowCards.some(
                                    (card) => card.Review === 1
                                )))) &&
                        bowCards.some((card) => card?.plant === user?.plant) ? (
                        <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
                            {sortedBowCards.filter(item => {
                                if (user?.role == 1) {
                                    return item
                                } else {
                                    if (isThuKhoXacNhan) {
                                        return item.receiver_id;
                                    } else {
                                        return item
                                    }
                                }
                            })?.map(
                                (bowCard, index) =>
                                (
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
                                            .add(bowCard?.Time, "days")
                                            .format(
                                                "YYYY-MM-DD HH:mm:ss"
                                            )}
                                        palletQty={bowCard.TotalPallet}
                                        weight={bowCard.Mass}
                                        isChecked={bowCard.Checked}
                                        isReviewed={bowCard.Review}
                                        bowCard={bowCard}
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
        </Layout>
    );
}

export default Kiln;
