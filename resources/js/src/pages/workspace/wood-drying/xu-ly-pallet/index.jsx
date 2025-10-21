import { IoIosArrowBack } from "react-icons/io";
import Layout from "../../../../layouts/layout";
import { useNavigate } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import { useEffect, useState } from "react";
import { getAllPlantInPlanDrying, getPlanDryingByFactory } from "../../../../api/plan-drying.api";
import toast from "react-hot-toast";
import Select from 'react-select';
import { danhSachNhaMayCBG } from "../../../../api/MasterDataApi";
import BOWCard from "../../../../components/BOWCard";
import moment from "moment";

const XuLyDieuChuyenPallet = () => {
    const navigate = useNavigate();
    const [factories, setFactories] = useState([]);
    const [factory, setFactory] = useState(null);
    const [search, setSearch] = useState("");
    const [planDryings, setPlanDrying] = useState([]);

    const loadFactoriesInPlanDrying = async () => {
        try {
            let res = await danhSachNhaMayCBG();
            let options = [];
            res.data.factories.forEach((item) => {
                options.push({
                    label: item.Name,
                    value: item.U_FAC
                })
            })
            setFactories(options);
        } catch (error) {
            toast.error('Lấy nhà máy có lỗi!');
        }
    }

    const loadPlanDrying = async () => {
        if (!factory) return;
        try {
            let res = await getPlanDryingByFactory(factory.value);
            setPlanDrying(res.plants);
            console.log("res", res);
        } catch (error) {
            toast.error("Lấy dữ liệu kế hoạch sấy có lỗi!");
            console.log(error);
        }
    }

    useEffect(() => {
        loadPlanDrying();
    }, [factory])

    useEffect(() => {
        loadFactoriesInPlanDrying();
    }, [])

    return (
        <Layout>
            <div className="flex justify-center bg-transparent ">
                <div className="w-screen p-6 px-5 xl:p-12 xl:px-32 xl:pt-6 lg:pt-6 md:pt-6 pt-2 border-t border-gray-200">
                    <div className="flex items-top justify-between">
                        <div
                            className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B]"
                            onClick={() => navigate(`/workspace?tab=wood-drying`)}
                        >
                            <IoIosArrowBack />
                            <div>Quay lại</div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="flex space-x-4 mb-4">
                        <div className="serif text-4xl font-bold ">Xử lý Pallet trong lò</div>
                    </div>

                    <div className="flex xl:flex-row lg:flex-row md:flex-row flex-col xl:space-x-4 lg:space-x-4 md:space-x-4 space-x-0 bg-white p-4 pt-3 rounded-xl mb-4">
                        <div className="w-1/3">
                            <label
                                for="Tìm kiếm kế hoạch sấy"
                                className=" text-sm font-medium text-gray-900 mb-2"
                            >
                                Nhà máy
                            </label>
                            <div className="relative">
                                <Select
                                    options={factories}
                                    placeholder="Chọn nhà máy"
                                    className="mt-1 w-full"
                                    onChange={(factory) => {
                                        setFactory(factory);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="w-2/3">
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
                                    className="block w-full p-2.5 py-[6.2px] pl-12 text-[16px] text-gray-900 border border-gray-300 rounded-lg bg-gray-50 mt-1"
                                    placeholder="Tìm theo kế hoạch hoặc mã lò"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {
                        planDryings.length > 0 && (
                            <div className="mb-3 text-gray-600">
                                Có tất cả <b>{planDryings.length}</b> kế hoạch sấy
                            </div>
                        )
                    }

                    <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
                        {
                            planDryings.map((planDrying, i) => (
                                <BOWCard
                                    key={i}
                                    planID={planDrying.PlanID}
                                    status={planDrying.Status}
                                    batchNumber={planDrying.Code}
                                    kilnNumber={planDrying.Oven}
                                    thickness={planDrying.Method}
                                    purpose={planDrying.Reason}
                                    finishedDate={moment(
                                        planDrying?.created_at
                                    )
                                        .add(planDrying?.Time, "days")
                                        .format(
                                            "YYYY-MM-DD HH:mm:ss"
                                        )}
                                    palletQty={planDrying.TotalPallet}
                                    weight={planDrying.Mass}
                                    isChecked={planDrying.Checked}
                                    isReviewed={planDrying.Review}
                                />
                            ))
                        }
                    </div>
                </div>
            </div>
        </Layout>
    )
}
export default XuLyDieuChuyenPallet;