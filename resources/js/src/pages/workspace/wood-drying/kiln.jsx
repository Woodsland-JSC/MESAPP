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
import { BiSolidFactory } from "react-icons/bi";

function Kiln() {
    const [loading, setLoading] = useState(true);
    const [bowCards, setBowCards] = useState([]);

    const navigate = useNavigate();

    const { user } = useAppContext();

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
                    <div className="flex space-x-4 mb-6">
                        <div className="serif text-4xl font-bold ">Lò sấy</div>   
                        <div className="xl:inline-block lg:inline-block md:inline-block hidden text-[12px] p-0.5 px-2 bg-[#E1D0FF] text-[#6A1ED4] border-2 border-[#c6a3f7] font-semibold uppercase h-fit rounded-lg">
                                {user.plant === "TH" ? "Thuận Hưng"
                                : user.plant === "YS" ? "Yên Sơn"
                                : user.plant === "CH" ? "Chiêm Hóa"
                                : user.plant === "TB" ? "Thái Bình"
                                : user.plant === "HG" ? "Hà Giang"
                                : "UNKNOWN"}
                        </div>
                    </div>

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

                    {/* Content */}
                    {((bowCards.some(card => card.Status === 2) || bowCards.some(card => card.Status === 3)) && bowCards.some(card => card.plant === user.plant)) ?  (
                        <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
                        {bowCards
                            ?.map(
                                (bowCard, index) =>
                                    (bowCard.Status === 2 || bowCard.Status === 3 ||
                                        (bowCard.Status === 3 &&
                                            bowCard.Review === 0) ||
                                        (bowCard.Status === 3 &&
                                            bowCard.Review === 1)) &&
                                    bowCard.plant === user.plant && (
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
                                                .format("YYYY-MM-DD HH:mm:ss")}
                                            palletQty={bowCard.TotalPallet}
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
                                    <BiConfused className="text-center text-gray-400 w-12 h-12 mb-2"/>
                                    <div className="  text-xl text-gray-400"> 
                                        Tiến trình hiện tại của nhà máy không có hoạt động nào.
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
