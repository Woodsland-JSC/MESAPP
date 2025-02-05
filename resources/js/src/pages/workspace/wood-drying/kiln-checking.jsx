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

function KilnChecking() {
    const [loading, setLoading] = useState(true);
    const [bowCards, setBowCards] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        palletsApi
            .getBOWList()

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
    }, []);

    const filteredBowCards = bowCards.filter(bowCard =>
        bowCard.Oven.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <div className=" my-2 mb-6 xl:w-full">
                        <label
                            for="Tìm kiếm kế hoạch sấy"
                            className="mb-2 text-sm font-medium text-gray-900 sr-only"
                        >
                            Search
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <IoSearch className="text-gray-500 ml-1 w-5 h-5" />
                            </div>
                            <input
                                type="search"
                                id="search"
                                className="block w-full p-2.5 pl-12 text-[16px] text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Tìm kiếm kế hoạch sấy theo lò sấy"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    {(filteredBowCards.some((card) => card.Status === 0) ||
                        filteredBowCards.some((card) => card.TotalPallet > 1) ||
                        filteredBowCards.some((card) => card.isChecked === 1)) &&
                        filteredBowCards.some((card) => card.plant === user.plant) ? (
                        <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
                            {filteredBowCards &&
                                filteredBowCards?.length > 0 &&
                                filteredBowCards
                                    ?.map(
                                        (bowCard, index) => (
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
                                        {filteredBowCards.length === 0 && searchTerm !== "" ? "Không tìm thấy kết quả nào phù hợp" : "Tiến trình hiện tại của nhà máy không có hoạt động nào."}
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

export default KilnChecking;
