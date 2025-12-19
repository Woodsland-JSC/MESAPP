import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import DatePicker from "react-datepicker";
import Select from "react-select";
import QCApi from "../../../../../api/QCApi";
import toast from "react-hot-toast";
import ViewMobileChungTuTraLaiNCC from "./ViewMobileTraLaiNCC";

const ChungTuTraLaiNCC = ({ factories }) => {
    const navigate = useNavigate();
    const [queryParam] = useSearchParams();

    const firstDayOfMonth = useMemo(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));

    const [filter, setFilter] = useState({
        fromDate: queryParam.get('fromDate') ? new Date(queryParam.get('fromDate')) : firstDayOfMonth,
        toDate: queryParam.get('toDate') ? new Date(queryParam.get('toDate')) : new Date(),
        factory: queryParam.get('factory') ? queryParam.get('factory') : null
    });

    const [data, setData] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    const getChungTuTraLaiNCC = async () => {
        if (!filter.factory) return;
        if (loadingData) return;

        let dataFilter = {
            fromDate: convertDateTime(filter.fromDate),
            toDate: convertDateTime(filter.toDate),
            factory: filter.factory
        }

        try {
            setLoadingData(true);
            let res = await QCApi.getChungTuTraLaiQC(dataFilter);
            let sorted = res.sort((a, b) => b.sapId - a.sapId);
            setData(sorted);
            setLoadingData(false);
        } catch (error) {
            toast.error("Lỗi khi lấy dữ liệu", {
                duration: 3000
            });
            setLoadingData(false);
        }
    }

    const convertDateTime = (_date) => {
        let date = new Date(_date);

        let yyyy = date.getFullYear();
        let mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        let dd = String(date.getDate()).padStart(2, '0');

        let formatted = `${yyyy}-${mm}-${dd}`;

        return formatted
    }

    const checkValidFilter = () => {
        return filter.factory ? true : false
    }

    useEffect(() => {
        getChungTuTraLaiNCC();
    }, [filter])

    return (
        <>
            <div className="border-2 border-gray-300 bg-white rounded-xl py-2 pb-3 block">
                <div className="px-4">
                    {/* Date Filter */}
                    <div className="flex flex-col gap-y-3 md:flex-row md:space-y-0 md:gap-x-3">
                        <div className="w-full">
                            <label
                                htmlFor="select-fac"
                                className="block mb-1 font-medium text-gray-900"
                            >
                                Chọn nhà máy
                            </label>
                            <Select
                                id="select-fac"
                                className="cursor-pointer"
                                placeholder="Chọn nhà máy..."
                                options={factories}
                                value={factories.find(item => item.value == filter.factory)}
                                onChange={(selected) => {
                                    setFilter({ ...filter, factory: selected.value })
                                }}
                            />
                        </div>
                        <div className="w-full">
                            <label
                                htmlFor=""
                                className="block mb-1 font-medium text-gray-900 "
                            >
                                Từ ngày
                            </label>
                            <DatePicker
                                selected={filter.fromDate}
                                dateFormat="dd/MM/yyyy"
                                onChange={(date) => {
                                    setFilter({ ...filter, fromDate: date })
                                }}
                                className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                            />
                        </div>
                        <div className="w-full">
                            <label
                                htmlFor=""
                                className="block mb-1 font-medium text-gray-900 "
                            >
                                Đến ngày
                            </label>
                            <DatePicker
                                selected={filter.toDate}
                                dateFormat="dd/MM/yyyy"
                                onChange={(date) => {
                                    setFilter({ ...filter, toDate: date })
                                }}
                                className=" border border-gray-300 text-gray-900 text-base rounded-md focus:ring-whites cursor-pointer focus:border-none block w-full p-1.5"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-3 w-full">

                    </div>
                </div>
            </div>
            <div className="block mb-2 mt-2">
                {
                    checkValidFilter() && (
                        <div className="text-left text-sm text-gray-500 ">
                            {data.length} kết quả
                        </div>
                    )
                }
            </div>
            <div>
                {
                    loadingData ? (
                        <div className="mt-4 bg-[#C2C2CB] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                            <div className="dots my-1"></div>
                        </div>
                    ) : (
                        (data.length == 0 && checkValidFilter()) ? (
                            <div className="w-full mt-4 bg-[#C2C2CB] flex items-center justify-center  p-2 px-4 pr-1 rounded-lg ">
                                Không có dữ liệu để hiển thị.
                            </div>
                        ) : (
                            <div>
                                <div className="">
                                    <ViewMobileChungTuTraLaiNCC data={data} filter={filter} />
                                </div>
                                {/* <div className="xl:block">
                            <ViewTableNhapKhoQc data={data} navigate={navigate}/>
                        </div> */}
                            </div>
                        )
                    )
                }
            </div>
        </>
    )
}

export default ChungTuTraLaiNCC;