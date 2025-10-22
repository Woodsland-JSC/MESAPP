import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";

function BOWCard(props) {
    const {
        planID,
        status,
        batchNumber,
        kilnNumber,
        thickness,
        height,
        width,
        purpose,
        finishedDate,
        palletQty,
        weight,
        isReviewed,
        isChecked,
        type,
        isHandlePallet,
        openModalPallet,
        bowCard
    } = props;

    const location = useLocation();

    let detailLink = "/workspace/details";

    if (location.pathname === "/workspace/kiln/") {
        detailLink = "/workspace/details";
    } else if (location.pathname === "/workspace/load-into-kiln") {
        detailLink = `/workspace/details?id=${planID}&type=vl`;
    } else if (location.pathname === "/workspace/drying-wood-checking") {
        detailLink = `/workspace/details?id=${planID}&type=dg`;
    } else if (location.pathname === "/workspace/create-drying-plan") {
        detailLink = `/workspace/details?id=${planID}&type=kh`;
    } else if (location.pathname === "/workspace/kiln-checking") {
        detailLink = `/workspace/details?id=${planID}&type=kt`;
    } else if (location.pathname === "/workspace/kiln") {
        detailLink = `/workspace/details?id=${planID}&type=ls`;
    }

    const getStatusContent = () => {
        return status === 0 ? (
            <>
                {(isChecked === 1 && Number(palletQty) > 0) ? (
                    <div className="bow-status p-1 px-3 text-xs text-pink-600 font-semibold bg-pink-100 w-fit rounded-full justify-end my-4">
                        Đã vào lò và kiểm tra lò
                    </div>
                ) : isChecked === 1 ? (
                    <div className="bow-status p-1 px-3 text-xs text-orange-600 font-semibold bg-orange-100 w-fit rounded-full justify-end my-4">
                        Đã kiểm tra lò
                    </div>
                ) : palletQty > 0 ? (
                    <div className="bow-status p-1 px-3 text-xs text-violet-600 font-semibold bg-violet-100 w-fit rounded-full justify-end my-4">
                        Đã vào lò
                    </div>
                ) : (
                    <div className="bow-status p-1 px-3 text-xs text-[#1B75D0] font-semibold bg-[#EDF5FD] w-fit rounded-full justify-end my-4">
                        Tạo mới kế hoạch sấy
                    </div>
                )}
            </>
        ) : status === 1 ? (
            <>
                {isReviewed === 1 ? (
                    <div className="bow-status p-1 px-3 text-xs text-green-500 font-semibold bg-green-50 w-fit rounded-full justify-end my-4">
                        Đang sấy và đã đánh giá
                    </div>
                ) : (
                    <div className="bow-status p-1 px-3 text-xs text-red-500 font-semibold bg-red-100 w-fit rounded-full justify-end my-4">
                        Đang sấy chưa đánh giá
                    </div>
                )}
            </>
        ) : (
            <div className="bow-status p-1 px-3 text-xs text-gray-600 font-semibold bg-gray-200 w-fit rounded-full justify-end my-4">
                Trạng thái không xác định
            </div>
        );
    };

    return (
        <div className=" rounded-2xl bg-gray-50 h-[24rem] shadow-sm">
            {/* Header */}
            <div className="flex flex-col justify-start rounded-t-xl py-2 pt-0.5 px-4 h-[31%]">
                <div className="flex space-x-4 justify-between">
                    {getStatusContent()}
                    {
                        (!isHandlePallet && bowCard?.receiver_id) && (
                            <div className="bow-status p-1 px-3 text-xs text-[#17506B] font-semibold bg-gray-200 w-fit rounded-full justify-end my-4">Chờ xác nhận</div>
                        )
                    }
                </div>

                <div className="text-[1.25rem] font-bold px-1 text-[#17506B] ">
                    Mẻ sấy số:
                    <span className="ml-2">{batchNumber}</span>
                </div>
                <div className="text-lg font-semibold px-1 text-gray-700 ">
                    Lò số:
                    <span className="ml-2">{kilnNumber}</span>
                </div>
            </div>

            <div className="hidden"></div>

            <div className="border-b-2 border-gray-200 ml-6 w-[5rem] h-[2%]"></div>

            {/* Details */}
            <div className="space-y-2 py-2 px-6 pt-4 text-[15px]  h-[47%]">
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Chiều dày sấy:</div>
                    <div className="font-medium ">{thickness}</div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Mục đích sấy:</div>
                    <div className="font-medium ">{purpose}</div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Ngày dự kiến ra lò:</div>
                    <div className="font-medium truncate">{finishedDate}</div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Tổng số pallet:</div>
                    <div className="font-medium ">{palletQty}</div>
                </div>
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Khối lượng mẻ:</div>
                    <div className="font-medium ">{weight} (m3)</div>
                </div>
            </div>
            {
                isHandlePallet ? (
                    <div className="py-2 px-6 border-t-2 border-[#cedde4] flex items-center justify-end bg-[#f4f7fa] rounded-b-2xl h-[20%]" onClick={openModalPallet}>
                        <div className="flex items-center font-medium cursor-pointer border-2 border-[#8ab4c7] hover:border-[#17506B] px-4 text-[#17506B] hover:text-white bg-[#F8FAFC] hover:bg-[#17506B] w-fit p-2 rounded-full active:scale-[.95] h-fit active:duration-75 transition-all">
                            Xem Pallet
                            <HiArrowRight className="ml-2" />
                        </div>
                    </div>
                ) : (
                    <Link to={`${detailLink}`} className="">
                        <div className="py-2 px-6 border-t-2 border-[#cedde4] flex items-center justify-end bg-[#f4f7fa] rounded-b-2xl h-[20%]">
                            <div className="flex items-center font-medium cursor-pointer border-2 border-[#8ab4c7] hover:border-[#17506B] px-4 text-[#17506B] hover:text-white bg-[#F8FAFC] hover:bg-[#17506B] w-fit p-2 rounded-full active:scale-[.95] h-fit active:duration-75 transition-all">
                                Xem chi tiết
                                <HiArrowRight className="ml-2" />
                            </div>
                        </div>
                    </Link>
                )
            }
        </div>
    );
}

export default BOWCard;
