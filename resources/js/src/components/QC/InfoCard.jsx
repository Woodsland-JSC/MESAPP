import React from "react";
import { FaCircleInfo } from "react-icons/fa6";

function InfoCard(props) {
    
    const { itemName, method, qty, batchNo, defectedProcess} = props;

    return (
        <div className="bg-white rounded-2xl border-2 border-gray-300 h-fit">
            <div className="flex items-center gap-x-3 font-medium border-b p-4 px-6 border-gray-200">
              <div className="w-8 h-8">
                <FaCircleInfo className="text-[#17506B] w-[85%] h-full"/>
              </div>
              
              <div className="xl:text-xl xl:w-full text-lg">Thông tin quy cách lỗi</div>
            </div>
            
            <div className="space-y-3 px-6 pb-5 pt-2">
                {/* <div className="grid grid-cols-2">
                    <div className="font-semibold">{itemName}</div>
                </div> */}
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Quy cách:</div>
                    <span>{method}</span>
                </div>
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Số lượng lỗi:</div>
                    <span>{qty}T</span>
                </div>
                <div className="grid grid-cols-2">
                    <div className="font-semibold">LSX:</div>
                    <span>{batchNo}</span>
                </div>
                <div className="grid grid-cols-2">
                    <div className="font-semibold">Nhận từ công đoạn:</div>
                    <div>
                        {defectedProcess}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InfoCard;
