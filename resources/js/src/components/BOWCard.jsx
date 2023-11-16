import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";

function BOWCard(props) {
    
    const {
        status,
        batchNumber,
        kilnNumber,
        thickness,
        height,
        purpose,
        finishedDate,
        palletQty,
        weight,
        type,
    } = props;

    const location = useLocation();

    let detailLink = "/workspace/details";

    if (location.pathname === "/workspace/kiln") {
        detailLink = "/workspace/details?type=ls";
    } else if (location.pathname === "/workspace/load-into-kiln") {
        detailLink = "/workspace/details?type=vl";
    } else if (location.pathname === "/workspace/drying-wood-checking") {
        detailLink = "/workspace/details?id=1&type=dg";
    } else if (location.pathname === "/workspace/create-drying-plan") {
        detailLink = "/workspace/details?type=kh";
    } else if (location.pathname === "/workspace/kiln-checking") {
        detailLink = "/workspace/details?type=kt";
    }

    return (
        <div className=" border-2 border-gray-200 rounded-2xl bg-white h-[27rem] shadow-sm">
            {/* Header */}
            <div className="flex flex-col rounded-t-xl py-2 px-6 h-[30%]">
                <div className=" p-1 px-3 text-xs text-slate-600 font-semibold bg-slate-200 w-fit rounded-full justify-end my-4">
                    {status}
                </div>
                <div className=" text-[1.25rem] font-bold text-[#17506B] ">
                    Mẻ sấy số:
                    <span className="ml-2">{batchNumber}</span>
                </div>
                <div className="text-lg font-semibold text-gray-700 ">
                    Lò số:
                    <span className="ml-2">{kilnNumber}</span>
                </div>
            </div>

            <div className="border-b-2 border-gray-200 ml-6 w-[5rem] h-[1%]"></div>

            {/* Details */}
            <div className="space-y-2 py-2 px-6 pt-4 text-[15px]  h-[49%]">
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Chiều dày sấy:</div>
                    <div className="font-medium ">{thickness}</div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Chiều dài sấy:</div>
                    <div className="font-medium ">{height}</div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Mục đích sấy:</div>
                    <div className="font-medium ">{purpose}</div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Ngày dự kiến ra lò:</div>
                    <div className="font-medium ">{finishedDate}</div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Tổng số pallet:</div>
                    <div className="font-medium ">{palletQty}</div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Khối lượng mẻ:</div>
                    <div className="font-medium ">{weight}</div>
                </div>
            </div>

            {/* Controller */}
            <Link to={detailLink} className="">
                <div className="py-2 px-6 border-t-2 border-[#cedde4] flex items-center justify-end bg-[#F8FAFC] rounded-b-2xl h-[20%]">
                    <div className="flex items-center font-medium cursor-pointer border-2 border-[#8ab4c7] hover:border-[#17506B] px-4 text-[#17506B] hover:text-white bg-[#F8FAFC] hover:bg-[#17506B] w-fit p-2 rounded-full active:scale-[.95] h-fit active:duration-75 transition-all">
                        Xem chi tiết
                        <HiArrowRight className="ml-2" />
                    </div>
                    
                </div>
            </Link>
        </div>
    );
}

export default BOWCard;
