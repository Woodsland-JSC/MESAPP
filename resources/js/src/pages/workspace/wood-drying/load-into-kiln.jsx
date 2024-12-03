import React, { useEffect, useState, useRef, useMemo } from "react";
import Layout from "../../../layouts/layout";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import BOWCard from "../../../components/BOWCard";
import palletsApi from "../../../api/palletsApi";
import toast from "react-hot-toast";
import moment from "moment";
import Loader from "../../../components/Loader";
import useAppContext from "../../../store/AppContext";
import { BiConfused } from "react-icons/bi";
import { IoIosArrowBack } from "react-icons/io";
import { BiSolidFactory } from "react-icons/bi";
import { IoMdArrowForward } from "react-icons/io";

function LoadIntoKiln() {
    const [loading, setLoading] = useState(false);
    const [bowCards, setBowCards] = useState([]);

    const { user } = useAppContext();
    const navigate = useNavigate();

    const getBOWLists = async () => {
        setLoading(true);
        try {
            const res = await palletsApi.getBOWList();
            console.log("Danh sách tại công đoạn vào lò: ", res);
            setBowCards(res);
        } catch (error) {
            toast.error("Có lỗi trong quá trình lấy dữ liệu.");
            console.error("Error fetching BOWCard list:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        getBOWLists();
    }, []);

    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center bg-transparent">
                {/* Section */}
                <div className="w-screen  px-4 xl:p-12 lg:p-12 md:p-12 p-4 xl:pt-6 lg:pt-6 md:pt-6 pt-2 xl:px-32">
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
                        <div className="serif text-4xl font-bold ">Vào lò</div>    
                        <div className="xl:inline-block lg:inline-block md:inline-block hidden text-[12px] p-0.5 px-2 bg-[#E1D0FF] text-[#6A1ED4] border-2 border-[#c6a3f7] font-semibold uppercase h-fit rounded-lg">
                                {user.plant === "TH" ? "Thuận Hưng"
                                : user.plant === "YS" ? "Yên Sơn"
                                : user.plant === "CH" ? "Chiêm Hóa"
                                : user.plant === "TB" ? "Thái Bình"
                                : user.plant === "HG" ? "Hà Giang"
                                : "UNKNOWN"}
                        </div>
                    </div>

                    {/* BOWCard List */}
                    {((bowCards.some(card => card.Status === 0) || bowCards.some(card => card.Status === 1)) && bowCards.some(card => card.plant === user.plant)) ? (
                        <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
                            {bowCards &&
                                bowCards.length > 0 &&
                                bowCards
                                    ?.map(
                                        (bowCard, index) =>
                                            ((bowCard.Status === 1 ||
                                                bowCard.Status === 0) && bowCard.plant === user.plant) && (
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

export default LoadIntoKiln;
