import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../../layouts/layout";
import { Link, Navigate } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import KilnCheck from "../../../components/KilnCheck";
import SizeCard from "../../../components/SizeCard";
import HumidityCheck from "../../../components/HumidityCheck";
import DisabledCheck from "../../../components/DisabledCheck";
import LoadController from "../../../components/ControllerCard";
import InfoCard from "../../../components/InfoCard";
import ControllerCard from "../../../components/ControllerCard";
import palletsApi from "../../../api/palletsApi";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";
import { Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import { addDays, format, add } from "date-fns";
import moment from "moment";

function Details() {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const type = searchParams.get("type");
    const id = searchParams.get("id");

    const navigate = useNavigate();

    // State
    const [BOWData, setBOWData] = useState([]);
    const [humidData, setHumidData] = useState([]);

    const [checkData, setCheckData] = useState({
        SoLan: "",
        CBL: "",
        DoThucTe: "",
        DateChecked: "",
        NoCheck: "",
    });

    const [checkboxData, setCheckboxData] = useState({
        CT1: 0,
        CT2: 0,
        CT3: 0,
        CT4: 0,
        CT5: 0,
        CT6: 0,
        CT7: 0,
        CT8: 0,
        CT9: 0,
        CT10: 0,
        CT11: 0,
        CT12: 0,
    });
    const [CT11Data, setCT11Data] = useState([]);
    const [CT12Data, setCT12Data] = useState([]);

    // State vào lò
    const [palletOptions, setPalletOptions] = useState([]);
    const [palletListLoading, setPalletListLoading] = useState(true);

    const [loadedPalletList, setLoadedPalletList] = useState([]);
    const [palletData, setPalletData] = useState([]);
    const [minThickness, setMinThickness] = useState("");
    const [maxThickness, setMaxThickness] = useState("");

    const [reload, setReload] = useState(false);

    const [loading, setLoading] = useState(true);

    const goBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        palletsApi
            .getBOWById(id)
            .then((response) => {
                console.log("Dữ liệu từ API:", response);

                setBOWData(response.plandrying);
                setCheckboxData({
                    CT1: response.plandrying.CT1 || 0,
                    CT2: response.plandrying.CT2 || 0,
                    CT3: response.plandrying.CT3 || 0,
                    CT4: response.plandrying.CT4 || 0,
                    CT5: response.plandrying.CT5 || 0,
                    CT6: response.plandrying.CT6 || 0,
                    CT7: response.plandrying.CT7 || 0,
                    CT8: response.plandrying.CT8 || 0,
                    CT9: response.plandrying.CT9 || 0,
                    CT10: response.plandrying.CT10 || 0,
                    CT11: response.plandrying.CT11 || 0,
                    CT12: response.plandrying.CT12 || 0,
                });
                setCheckData({
                    SoLan: response.plandrying.SoLan,
                    CBL: response.plandrying.CBL,
                    DoThucTe: response.plandrying.DoThucTe,
                    DateChecked: response.plandrying.DateChecked,
                    NoCheck: response.plandrying.NoCheck,
                });
                setLoadedPalletList(response.plandrying.details);
                setCT11Data(response.CT11Detail[0]);
                setCT12Data(response.CT12Detail[0]);
                setHumidData(response.Humidity);
                setMaxThickness(
                    response.plandrying?.Method?.substring(1).split(
                        /[-_]/
                    )[1] || ""
                );
                setMinThickness(
                    response.plandrying?.Method?.substring(1).split(
                        /[-_]/
                    )[0] || ""
                );
            })
            .catch((error) => {
                console.error("Lỗi khi gọi API:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (BOWData.Reason) {
            loadPallets(BOWData.Reason);
        }
    }, [BOWData.Reason]);

    const loadPallets = async (reason) => {
        setPalletListLoading(true);
        const data = await palletsApi.getPalletList(BOWData.Reason);
        const options = data.map((item) => ({
            value: item.palletID,
            label: `${item.Code} (${item.QuyCach}) - ${item.MaLo}`,
            thickness: item.QuyCach.split("x")[0],
        }));
        setPalletOptions(options);
        setPalletListLoading(false);
    };

    const updateData = async () => {
        palletsApi
            .getBOWById(id)
            .then((response) => {
                console.log("Dữ liệu từ API:", response);

                setBOWData(response.plandrying);
                setCheckboxData({
                    CT1: response.plandrying.CT1 || 0,
                    CT2: response.plandrying.CT2 || 0,
                    CT3: response.plandrying.CT3 || 0,
                    CT4: response.plandrying.CT4 || 0,
                    CT5: response.plandrying.CT5 || 0,
                    CT6: response.plandrying.CT6 || 0,
                    CT7: response.plandrying.CT7 || 0,
                    CT8: response.plandrying.CT8 || 0,
                    CT9: response.plandrying.CT9 || 0,
                    CT10: response.plandrying.CT10 || 0,
                    CT11: response.plandrying.CT11 || 0,
                    CT12: response.plandrying.CT12 || 0,
                });
                setCheckData({
                    SoLan: response.plandrying.SoLan,
                    CBL: response.plandrying.CBL,
                    DoThucTe: response.plandrying.DoThucTe,
                    DateChecked: response.plandrying.DateChecked,
                    NoCheck: response.plandrying.NoCheck,
                });
                setPalletData(response.plandrying.details);
                setCT11Data(response.CT11Detail[0]);
                setCT12Data(response.CT12Detail[0]);
                setHumidData(response.Humidity);
            })
            .catch((error) => {
                console.error("Lỗi khi recall API:", error);
            });
    };

    // const totalMass = BOWData.details.reduce((acc, detail) => acc + parseFloat(detail.Mass), 0);

    return (
        <Layout>
            <div>
                <div className="flex justify-center bg-transparent">
                    {/* Section */}
                    <div className="w-screen p-1 px-4 xl:p-3 xl:px-32 border-t border-gray-200">
                        {/* Header */}
                        <div className="flex items-center text-2xl font-bold mb-4 gap-x-4">
                            <button
                                className="p-3 bg-gray-300 rounded-full active:scale-[.95] active:duration-75 transition-all"
                                onClick={goBack}
                            >
                                <HiArrowLeft />
                            </button>

                            <SkeletonText
                                isLoaded={!loading}
                                mt="4"
                                noOfLines={2}
                                width="470px"
                                spacing="4"
                                skeletonHeight="5"
                                borderRadius="lg"
                            >
                                <div className="flex flex-col justify-center">
                                    <div className="serif xl:text-3xl text-[27px] font-bold text-[#17506B] ">
                                        <div className="text-gray-800 xl:inline-block lg:inline-block md:inline-block hidden">
                                            Chi tiết mẻ sấy:
                                        </div>
                                        <div className="xl:hidden lg:hidden md:hidden inline-block">
                                            Mẻ sấy:
                                        </div>{" "}
                                        <span>{BOWData.Code}</span>{" "}
                                    </div>

                                    <div className="xl:text-[1.15rem] text-lg font-semibold text-gray-700">
                                        Lò số: <span>{BOWData.Oven}</span>{" "}
                                    </div>
                                </div>
                            </SkeletonText>
                        </div>

                        {/* Content */}
                        <div className="gap-4">
                            <div className="xl:grid xl:grid-cols-3 xl:gap-4  xl:space-y-0 space-y-4">
                                <Skeleton
                                    isLoaded={!loading}
                                    borderRadius="2xl"
                                >
                                    <InfoCard
                                        purpose={BOWData.Reason}
                                        thickness={BOWData.Method}
                                        finishedDate={
                                            BOWData?.Time && BOWData?.created_at
                                                ? moment(BOWData.created_at)
                                                      .add(BOWData.Time, "days")
                                                      .format(
                                                          "YYYY-MM-DD HH:mm:ss"
                                                      )
                                                : "Invalid Date"
                                        }
                                        palletQty={BOWData.details?.length}
                                        weight={BOWData.Mass}
                                    />
                                </Skeleton>
                                <div className="col-span-2">
                                    {type === "kh" && (
                                        <div className="space-y-6">
                                            <Skeleton
                                                isLoaded={!loading}
                                                borderRadius="2xl"
                                            >
                                                <ControllerCard
                                                    progress="kh"
                                                    planID={BOWData.PlanID}
                                                    status={BOWData.Status}
                                                    isReviewed={BOWData.Review}
                                                    Checked={BOWData.Checked}
                                                    checkData={checkData}
                                                    checkboxData={checkboxData}
                                                    loadedPalletList={
                                                        loadedPalletList
                                                    }
                                                    reload={reload}
                                                    CT11Data={CT11Data}
                                                    CT12Data={CT12Data}
                                                    onReloadPalletList={
                                                        loadPallets
                                                    }
                                                    palletOptions={
                                                        palletOptions
                                                    }
                                                    palletListLoading={
                                                        palletListLoading
                                                    }
                                                />
                                            </Skeleton>
                                        </div>
                                    )}
                                    {type === "vl" && (
                                        <div className="space-y-6">
                                            <Skeleton
                                                isLoaded={!loading}
                                                borderRadius="2xl"
                                            >
                                                <ControllerCard
                                                    progress="vl"
                                                    planID={BOWData.PlanID}
                                                    reason={BOWData.Reason}
                                                    status={BOWData.Status}
                                                    minThickness={minThickness}
                                                    maxThickness={maxThickness}
                                                    isChecked={BOWData.Checked}
                                                    onReload={setReload}
                                                    onCallback={updateData}
                                                    Checked={BOWData.Checked}
                                                    loadedPalletList={
                                                        loadedPalletList
                                                    }
                                                    checkData={checkData}
                                                    checkboxData={checkboxData}
                                                    CT11Data={CT11Data}
                                                    CT12Data={CT12Data}
                                                    reload={reload}
                                                    onReloadPalletList={
                                                        loadPallets
                                                    }
                                                    palletOptions={
                                                        palletOptions
                                                    }
                                                    palletListLoading={
                                                        palletListLoading
                                                    }
                                                />
                                            </Skeleton>
                                            <Skeleton
                                                isLoaded={!loading}
                                                borderRadius="2xl"
                                            >
                                                <SizeCard
                                                    planID={BOWData.PlanID}
                                                    reason={BOWData.Reason}
                                                    reload={reload}
                                                    onReloadPalletList={
                                                        loadPallets
                                                    }
                                                    onReload={updateData}
                                                    palletData={palletData}
                                                />
                                            </Skeleton>
                                        </div>
                                    )}
                                    {type === "kt" && (
                                        <div className="space-y-6 pb-5">
                                            <Skeleton
                                                isLoaded={!loading}
                                                borderRadius="2xl"
                                            >
                                                <ControllerCard
                                                    progress="kt"
                                                    planID={BOWData.PlanID}
                                                    reason={BOWData.Reason}
                                                    isChecked={BOWData.Checked}
                                                    status={BOWData.Status}
                                                    minThickness={minThickness}
                                                    maxThickness={maxThickness}
                                                    onReload={setReload}
                                                    onCallback={updateData}
                                                    Checked={BOWData.Checked}
                                                    loadedPalletList={
                                                        loadedPalletList
                                                    }
                                                    checkData={checkData}
                                                    checkboxData={checkboxData}
                                                    CT11Data={CT11Data}
                                                    CT12Data={CT12Data}
                                                    onReloadPalletList={
                                                        loadPallets
                                                    }
                                                    palletOptions={
                                                        palletOptions
                                                    }
                                                    palletListLoading={
                                                        palletListLoading
                                                    }
                                                />
                                            </Skeleton>
                                            <Skeleton
                                                isLoaded={!loading}
                                                borderRadius="2xl"
                                            >
                                                <KilnCheck
                                                    Checked={BOWData.Checked}
                                                    checkData={checkData}
                                                    checkboxData={checkboxData}
                                                    CT11Data={CT11Data}
                                                    CT12Data={CT12Data}
                                                />
                                            </Skeleton>
                                            <Skeleton
                                                isLoaded={!loading}
                                                borderRadius="2xl"
                                            >
                                                <SizeCard
                                                    planID={BOWData.PlanID}
                                                    reason={BOWData.Reason}
                                                    reload={reload}
                                                    onReload={updateData}
                                                    onReloadPalletList={
                                                        loadPallets
                                                    }
                                                    palletData={palletData}
                                                />
                                            </Skeleton>
                                        </div>
                                    )}
                                    {type === "ls" && (
                                        <div className="space-y-6">
                                            <Skeleton
                                                isLoaded={!loading}
                                                borderRadius="2xl"
                                            >
                                                <ControllerCard
                                                    progress="ls"
                                                    planID={BOWData.PlanID}
                                                    reason={BOWData.Reason}
                                                    status={BOWData.Status}
                                                    isReviewed={BOWData.Review}
                                                    onCallback={updateData}
                                                    Checked={BOWData.Checked}
                                                    loadedPalletList={
                                                        loadedPalletList
                                                    }
                                                    checkData={checkData}
                                                    checkboxData={checkboxData}
                                                    CT11Data={CT11Data}
                                                    CT12Data={CT12Data}
                                                />
                                            </Skeleton>
                                            <Skeleton
                                                isLoaded={!loading}
                                                borderRadius="2xl"
                                            >
                                                <KilnCheck
                                                    Checked={BOWData.Checked}
                                                    checkData={checkData}
                                                    checkboxData={checkboxData}
                                                    CT11Data={CT11Data}
                                                    CT12Data={CT12Data}
                                                />
                                            </Skeleton>
                                            <Skeleton
                                                isLoaded={!loading}
                                                borderRadius="2xl"
                                            >
                                                <SizeCard
                                                    planID={BOWData.PlanID}
                                                    palletData={palletData}
                                                />
                                            </Skeleton>
                                        </div>
                                    )}
                                    {type === "dg" && (
                                        <div className="space-y-6">
                                            <Skeleton
                                                isLoaded={!loading}
                                                borderRadius="2xl"
                                            >
                                                <ControllerCard
                                                    progress="dg"
                                                    planID={BOWData.PlanID}
                                                    reason={BOWData.Reason}
                                                    status={BOWData.Status}
                                                    isReviewed={BOWData.Review}
                                                    onCallback={updateData}
                                                    Checked={BOWData.Checked}
                                                    loadedPalletList={
                                                        loadedPalletList
                                                    }
                                                    checkData={checkData}
                                                    checkboxData={checkboxData}
                                                    CT11Data={CT11Data}
                                                    CT12Data={CT12Data}
                                                />
                                            </Skeleton>
                                            <Skeleton
                                                isLoaded={!loading}
                                                borderRadius="2xl"
                                            >
                                                <KilnCheck
                                                    Checked={BOWData.Checked}
                                                    checkData={checkData}
                                                    checkboxData={checkboxData}
                                                    CT11Data={CT11Data}
                                                    CT12Data={CT12Data}
                                                />
                                            </Skeleton>
                                            <Skeleton
                                                isLoaded={!loading}
                                                borderRadius="2xl"
                                            >
                                                <HumidityCheck
                                                    reason={BOWData.Reason}
                                                    oven={BOWData.Oven}
                                                    code={BOWData.Code}
                                                    planID={BOWData.PlanID}
                                                    onCallback={updateData}
                                                />
                                            </Skeleton>
                                            <Skeleton
                                                isLoaded={!loading}
                                                borderRadius="2xl"
                                            >
                                                <DisabledCheck
                                                    planID={BOWData.PlanID}
                                                    reason={BOWData.Reason}
                                                    oven={BOWData.Oven}
                                                    code={BOWData.Code}
                                                    generalInfo={{
                                                        dryingBatch:
                                                            "2023.45.01",
                                                        factory: "Nhà máy A",
                                                    }}
                                                />
                                            </Skeleton>
                                            <Skeleton
                                                isLoaded={!loading}
                                                borderRadius="2xl"
                                            >
                                                <SizeCard
                                                    planID={BOWData.PlanID}
                                                    palletData={palletData}
                                                />
                                            </Skeleton>
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
