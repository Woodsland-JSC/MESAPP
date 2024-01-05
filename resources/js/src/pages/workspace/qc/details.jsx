import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../../layouts/layout";
import { useLocation, useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import moment from "moment";
import InfoCard from "../../../components/QC/InfoCard";
import WoodDefectHandling from "../../../components/QC/WoodDefectHandling";
import palletsApi from "../../../api/QCApi";

function WoodProductionQCDetail() {
    const location = useLocation();
    const navigate = useNavigate();
    const goBack = () => {
        navigate(-1);
    };
    return (
        <Layout>
            <div>
                <div className="flex justify-center bg-transparent">
                    {/* Section */}
                    <div className="w-screen p-6 px-5 xl:p-12 xl:px-32 border-t border-gray-200">
                        {/* Header */}
                        <div className="flex items-center text-2xl font-bold mb-6 gap-x-6">
                            <button
                                className="p-2 hover:bg-gray-200 rounded-full active:scale-[.95] active:duration-75 transition-all"
                                onClick={goBack}
                            >
                                <HiArrowLeft />
                            </button>

                            {/* <SkeletonText
                                isLoaded={!loading}
                                mt="4"
                                noOfLines={2}
                                width="470px"
                                spacing="4"
                                skeletonHeight="5"
                                borderRadius="lg"
                            > */}
                                <div>
                                    <div className="xl:text-2xl text-2xl font-bold text-[#17506B] ">
                                        <div className="xl:inline-block lg:inline-block md:inline-block hidden">Quy cách lỗi: <span>NAMM Bàn 200-Nan mặt ngoài </span></div>
                                        <div className="xl:hidden lg:hidden md:hidden inline-block">Mẻ sấy:</div>{" "}
                                        <span></span>{" "}
                                    </div>
                                </div>
                            {/* </SkeletonText> */}
                        </div>

                        {/* Content */}
                        <div className="gap-6">
                            <div className="xl:grid xl:grid-cols-3 xl:gap-6 xl:space-y-0 space-y-6">
                                {/* <Skeleton
                                    isLoaded={!loading}
                                    borderRadius="2xl"
                                > */}
                                    <InfoCard
                                        itemName="NAMM Bàn 200-Nan mặt ngoài" 
                                        method="24*58*720"
                                        qty="1660"
                                        batchNo="YS12315BTP-04" 
                                        defectedProcess="Tổ Lựa phôi X5"
                                    />
                                {/* </Skeleton> */}

                                <div className="col-span-2">
                                    <WoodDefectHandling />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default WoodProductionQCDetail;
