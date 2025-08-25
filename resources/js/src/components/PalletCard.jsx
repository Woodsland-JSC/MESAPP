import React, { useState, useEffect } from "react";
import { AiFillCloseCircle } from "react-icons/ai";
import toast from "react-hot-toast";
import {
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from "@chakra-ui/react";
import useQuantityValidation from '../hook/useQuantityValidation';

function PalletCard(props) {
    const {
        itemCode,
        itemName,
        whsCode,
        inStock,
        batchNum,
        onDelete,
        flag,
        width,
        height,
        thickness,
        onQuantityChange,
        createPalletLoading,
        // isInvalidQuantity
    } = props;

    const [quantity, setQuantity] = useState(0);
    const [isInvalid, setIsInvalid] = useState(false);

    const handleQuantityChange = (value) => {
        setQuantity(value);

        if (flag === "SL" && (value < 0 || value === 0 || value > inStock)){
            setIsInvalid(true);
        } else if (flag !== "SL" && (value < 0 || value === 0 || value > Math.floor(inStock*1000000000/(height*width*thickness)))) {
            setIsInvalid(true);
        } else {
            setIsInvalid(false);
        }

        onQuantityChange(value);
    }

    return (
        <div className="relative border-2 border-[#c6d3da] rounded-xl">
            <div className="flex items-center justify-between    bg-[#F6F8F9] rounded-t-xl ">
                <div className="text-[#17506B] xl:text-xl flex flex-col font-semibold text-[17px] max-w-[98%] text-truncate px-4 py-3">
                    <span className="text-xs font-medium text-gray-500 ">{itemCode}</span>
                    <span>{itemName}</span>
                </div>
                <button
                    className="absolute -top-3 -right-3 text-black text-3xl cursor-pointer w-fit disabled:text-gray-400 disabled:cursor-auto disabled:transform-none disabled:transition-none active:scale-[.84] active:duration-75 hover:text-red-500"
                    onClick={onDelete}
                    disabled={createPalletLoading}
                >
                    <AiFillCloseCircle className="w-10 h-10"/>
                </button>
            </div>
            <div className=" pallet-line grid xl:grid-cols-2 md:grid-cols-2 grid-cols-2 gap-4 bg-white py-3 px-4 rounded-b-xl">
                <div className="hidden">
                    <label
                        htmlFor="company"
                        className="block mb-2 text-md font-medium text-gray-900 "
                    >
                        Mã kho
                    </label>
                    <input
                        type="text"
                        id="inStock"
                        className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                        placeholder="0"
                        readOnly={true}
                        required
                        value={whsCode}
                    />
                </div>
                <div className="hidden">
                    <label
                        htmlFor="company"
                        className="block mb-2 text-md font-medium text-gray-900 "
                    >
                        Batch Num
                    </label>
                    <input
                        type="text"
                        id="batchNum"
                        className="bg-gray-100 border border-gray-300 text-gray-900  rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                        placeholder="0"
                        readOnly={true}
                        required
                        value={batchNum}
                    />
                </div>
                {flag === "SL" ? (
                    <div>
                        <label
                            htmlFor="company"
                            className="block mb-2 text-md font-medium text-gray-900 "
                        >
                            Tồn kho (m<sup className="">3</sup>)
                        </label>
                        <input
                            type="text"
                            id="inStock"
                            className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                            placeholder="0"
                            readOnly={true}
                            required
                            value={inStock}
                        />
                    </div>                    
                ): (
                    <div>
                        <label
                            htmlFor="company"
                            className="block mb-2 text-md font-medium text-gray-900 "
                        >
                            Tồn kho (T)
                        </label>
                        <input
                            type="text"
                            id="inStock"
                            className="bg-gray-100 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                            placeholder="0"
                            readOnly={true}
                            required
                            value={Math.floor(inStock*1000000000/(height*width*thickness))}
                        />
                    </div>
                )}   
                
                <div>
                    <label
                        htmlFor="quantity"
                        className="block mb-2 text-md font-medium text-gray-900 "
                    >
                        Số lượng
                    </label>
                    <NumberInput
                        defaultValue={0}
                        isInvalid={isInvalid}
                        onChange={handleQuantityChange}
                    >
                        <NumberInputField/>
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </div>

                <div className="hidden">
                    <label
                        htmlFor="company"
                        className="block mb-2 text-md font-medium text-gray-900 "
                    >
                        Chiều rộng
                    </label>
                    <input
                        type="hidden"
                        id="width"
                        className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                        placeholder="0"
                        required
                        value={width}
                    />
                </div>
                <div className="hidden">
                    <label
                        htmlFor="company"
                        className="block mb-2 text-md font-medium text-gray-900 "
                    >
                        Chiều dài
                    </label>
                    <input
                        type="hidden"
                        id="height"
                        className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                        placeholder="0"
                        required
                        value={height}
                    />
                </div>
                <div className="hidden">
                    <label
                        htmlFor="company"
                        className="block mb-2 text-md font-medium text-gray-900 "
                    >
                        Chiều dày
                    </label>
                    <input
                        type="hidden"
                        id="thickness"
                        className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                        placeholder="0"
                        required
                        value={thickness}
                    />
                </div>
            </div>
        </div>
    );
}

export default PalletCard;
