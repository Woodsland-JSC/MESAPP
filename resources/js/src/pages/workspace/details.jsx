import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../layouts/layout";
import { Link, Navigate } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import KilnCheck from "../../components/KilnCheck";
import SizeCard from "../../components/SizeCard";
import HumidityCheck from "../../components/HumidityCheck";
import DisabledCheck from "../../components/DisabledCheck";
import LoadController from "../../components/ControllerCard";
import InfoCard from "../../components/InfoCard";
import ControllerCard from "../../components/ControllerCard";
import palletsApi from "../../api/palletsApi";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";

function Details() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const type = searchParams.get("type");
    const id = searchParams.get("id");

    const navigate = useNavigate();

    // State
    const [BOWData, setBOWData] = useState([]);

    const [loading, setLoading] = useState(true);

    const [disabledReports, setDisabledReports] = useState([
        {
            id: 106295,
            createdDate: "2023-10-12T07:59:28.050Z",
            avgDisabledRate: 12.25,
            avgCurvedRate: 50,
            dryingBatch: "2023.45.01",
            factory: "Bla bla",
            disabledDetails: [
                {
                    id: 1,
                    pallet: 10,
                    sample: 5,
                    disability: 2,
                    curve: 1,
                    disabledRate: 60,
                    curvedRate: 20,
                    note: "This is test",
                },
                {
                    id: 2,
                    pallet: 10,
                    sample: 5,
                    disability: 2,
                    curve: 1,
                    disabledRate: 60,
                    curvedRate: 20,
                    note: "This is test",
                },
                {
                    id: 3,
                    pallet: 10,
                    sample: 5,
                    disability: 2,
                    curve: 1,
                    disabledRate: 60,
                    curvedRate: 20,
                    note: "This is test",
                },
                {
                    id: 4,
                    pallet: 10,
                    sample: 5,
                    disability: 2,
                    curve: 1,
                    disabledRate: 60,
                    curvedRate: 20,
                    note: "This is test",
                },
            ],
        },
        {
            id: 106296,
            createdDate: "2023-10-12T07:59:28.050Z",
            avgDisabledRate: 12.25,
            avgCurvedRate: 50,
            dryingBatch: "2023.45.01",
            factory: "Bla bla",
            disabledDetails: [
                {
                    id: 1,
                    pallet: 10,
                    sample: 5,
                    disability: 2,
                    curve: 1,
                    disabledRate: 60,
                    curvedRate: 20,
                    note: "This is test",
                },
                {
                    id: 2,
                    pallet: 10,
                    sample: 5,
                    disability: 2,
                    curve: 1,
                    disabledRate: 60,
                    curvedRate: 20,
                    note: "This is test",
                },
                {
                    id: 3,
                    pallet: 10,
                    sample: 5,
                    disability: 2,
                    curve: 1,
                    disabledRate: 60,
                    curvedRate: 20,
                    note: "This is test",
                },
                {
                    id: 4,
                    pallet: 10,
                    sample: 5,
                    disability: 2,
                    curve: 1,
                    disabledRate: 60,
                    curvedRate: 20,
                    note: "This is test",
                },
            ],
        },
    ]);

    const goBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        palletsApi
            .getBOWById(id)
            .then((response) => {
                console.log("Dữ liệu từ API:", response);

                setBOWData(response.plandrying);
            })
            .catch((error) => {
                console.error("Lỗi khi gọi API:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // return id ? (
    return (
        <Layout>
            <div>
                <div className="flex justify-center bg-[#F8F9F7] ">
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

                            <div>
                                    <div className="xl:text-2xl text-xl font-bold text-[#17506B] ">
                                        Chi tiết mẻ sấy:{" "}
                                        <span>{BOWData.Code}</span>{" "}
                                    </div>
                                    <div className="xl:text-[1.15rem] text-lg font-semibold text-gray-700">
                                        Lò số: <span>{BOWData.Oven}</span>{" "}
                                    </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="gap-6">
                            <div className="xl:grid xl:grid-cols-3 xl:gap-6 xl:space-y-0 space-y-6">
                                <InfoCard
                                    purpose={BOWData.Reason}
                                    thickness={BOWData.Method}
                                    finishedDate={BOWData.Time}
                                    palletQty={BOWData.TotalPallet}
                                    weight={BOWData.Mass}
                                />
                                <div className="col-span-2">
                                    {type === "kh" && (
                                        <div className="space-y-6">
                                            <ControllerCard
                                                progress="kh"
                                                planID={BOWData.PlanID}
                                            />
                                        </div>
                                    )}
                                    {type === "vl" && (
                                        <div className="space-y-6">
                                            <ControllerCard
                                                progress="vl"
                                                planID={BOWData.PlanID}
                                                reason={BOWData.Reason}
                                            />
                                            <SizeCard />
                                        </div>
                                    )}
                                    {type === "kt" && (
                                        <div className="space-y-6">
                                            <ControllerCard
                                                progress="kt"
                                                planID={BOWData.PlanID}
                                            />
                                            <KilnCheck />
                                            <SizeCard />
                                        </div>
                                    )}
                                    {type === "ls" && (
                                        <div className="space-y-6">
                                            <ControllerCard
                                                progress="ls"
                                                planID={BOWData.PlanID}
                                            />
                                            <KilnCheck />
                                            <SizeCard />
                                        </div>
                                    )}
                                    {type === "dg" && (
                                        <div className="space-y-6">
                                            <ControllerCard
                                                progress="dg"
                                                planID={BOWData.PlanID}
                                            />
                                            <KilnCheck />
                                            <HumidityCheck />
                                            <DisabledCheck
                                                disabilityList={disabledReports}
                                                generalInfo={{
                                                    dryingBatch: "2023.45.01",
                                                    factory: "Nhà máy A",
                                                }}
                                            />
                                            <SizeCard />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
    // : (
    //     <Navigate to="/notfound" replace />
    // );
}

export default Details;
