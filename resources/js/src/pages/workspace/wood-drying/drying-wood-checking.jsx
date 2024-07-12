import React, { useEffect, useState, useRef, useMemo } from "react";
import Layout from "../../../layouts/layout";
import { Link } from "react-router-dom";
import BOWCard from "../../../components/BOWCard";
import palletsApi from "../../../api/palletsApi";
import axios from "axios";
import toast from "react-hot-toast";
import moment from "moment";
import Loader from "../../../components/Loader";
import useAppContext from "../../../store/AppContext";
import { BiConfused } from "react-icons/bi";

function DryingWoodChecking() {
    const [loading, setLoading] = useState(true);
    const [bowCards, setBowCards] = useState([]);
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
            <div className="flex justify-center bg-transparent">
                {/* Section */}
                <div className="w-screen p-6 px-5 xl:p-12 xl:px-32 border-t border-gray-200">
                    {/* Breadcrumb */}
                    <div className="mb-2">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center">
                                        <a
                                            href="#"
                                            class="text-sm font-medium text-[#17506B] "
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
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth="2"
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
                        Đánh giá mẻ sấy
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
                    {(bowCards.Status === 4).length > 0 && (bowCards.Status === 3).length > 0 ? (
                    <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
                            {bowCards
                            ?.map(
                                (bowCard, index) =>
                                    ((bowCard.Status === 3 ||
                                        bowCard.Status === 4) && bowCard.plant === user.plant) && (
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
                                        Tiến trình hiện tại không có hoạt động nào.
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

export default DryingWoodChecking;
