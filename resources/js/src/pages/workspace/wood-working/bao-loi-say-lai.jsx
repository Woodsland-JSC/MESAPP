import { useNavigate } from "react-router-dom";
import useAppContext from "../../../store/AppContext";
import { danhSachNhaMayCBG, getTeamsCBG } from "../../../api/MasterDataApi";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import Layout from "../../../layouts/layout";
import { IoIosArrowBack } from "react-icons/io";
import Select from 'react-select'

const BaoLoiSayLai = () => {
    const navigate = useNavigate();
    const { user } = useAppContext();
    const [factory, setFactory] = useState(null);
    const [factories, setFactories] = useState([]);
    const [teams, setTeams] = useState([]);
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(false);

    const getFactoriesCBG = async () => {
        try {
            setLoading(true)
            let res = await danhSachNhaMayCBG();
            setFactories(res.data.factories.map(item => (
                {
                    ...item,
                    label: item.Name,
                    value: item.U_FAC
                }
            )));
            setLoading(false)
        } catch (error) {
            setLoading(false)
            toast.error("Lấy danh sách nhà máy có lỗi.");
        }
    }

    const getTeams = async () => {
        try {
            let res = await getTeamsCBG(factory ? factory.value : user?.plant);
            let data = res.data.teams.sort((item1, item2) => item1.Name.localeCompare(item2.Name))
            setTeams(data.map(item => (
                {
                    ...item,
                    label: `${item.Name} - ${item.Code}`,
                    value: item.Code
                }
            )))
        } catch (error) {
            toast.error("Lấy danh sách tổ có lỗi.");
        }
    }

    useEffect(() => {
        getTeams();
    }, [factory])


    useEffect(() => {
        if (user?.role == 1) {
            getFactoriesCBG();
        }
        getTeams();
    }, [])

    return (
        <Layout>
            <div className="flex justify-center bg-transparent ">
                <div className="w-screen p-6 px-5 xl:p-12 xl:px-20 xl:pt-6 lg:pt-6 md:pt-6 pt-2 border-t border-gray-200">
                    <div className="flex items-top justify-between">
                        <div
                            className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B]"
                            onClick={() => navigate(`/workspace?tab=wood-working`)}
                        >
                            <IoIosArrowBack />
                            <div>Quay lại</div>
                        </div>
                    </div>
                    <div className="flex space-x-4 mb-4 justify-between">
                        <div className="serif text-xl md:text-4xl font-bold">Báo lỗi sấy ẩm</div>
                    </div>

                    <div className="flex justify-between xl:flex-row lg:flex-row md:flex-row flex-col xl:space-x-4 lg:space-x-4 md:space-x-4 space-x-0 bg-white p-4 pt-3 rounded-xl mb-4 gap-x-2 gap-y-2 items-center">
                        {
                            user?.role == 1 && (
                                <div className="md:w-1/4 w-full">
                                    <label className="text-sm font-medium text-gray-900">
                                        Chọn nhà máy
                                    </label>
                                    <Select
                                        options={factories}
                                        placeholder="Chọn nhà máy"
                                        className="w-full mt-2 cursor-pointer"
                                        onChange={(factory) => {
                                            setFactory(factory);
                                        }}
                                    />
                                </div>
                            )
                        }
                        <div className="md:w-3/4 w-full">
                            <label className="text-sm font-medium text-gray-900">
                                Chọn tổ
                            </label>
                            <Select
                                options={teams}
                                placeholder="Chọn tổ"
                                className="w-full mt-2 cursor-pointer"
                                onChange={(team) => {
                                    setTeam(team);
                                }}
                                isLoading={loading}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default BaoLoiSayLai;