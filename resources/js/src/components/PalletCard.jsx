import React from "react";
import { AiFillCloseCircle} from "react-icons/ai";
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'

function PalletCard(props) {
    const { name, inStock, batchNum } = props;

    return (
        <div className="border-2 border-[#c6d3da] rounded-xl">
            <div className="flex items-center justify-between px-2 pr-4 bg-[#F6F8F9] rounded-t-xl ">
                <div className="text-[#17506B] text-xl font-semibold px-4 py-3">
                    {name}
                </div>
                <div className="text-[#17506B] text-2xl cursor-pointer">
                  <AiFillCloseCircle />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-x-4 bg-white py-4 px-4 rounded-b-xl">
                <div>
                    <label
                        for="company"
                        className="block mb-2 text-md font-medium text-gray-900 "
                    >
                        Số lượng
                    </label>
                    <NumberInput defaultValue={0}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                </div>
                <div>
                    <label
                        for="company"
                        className="block mb-2 text-md font-medium text-gray-900 "
                    >
                        Tồn kho
                    </label>
                    <input
                        type="number"
                        id="quantity"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        placeholder="0"
                        required
                        value={inStock}
                    />
                </div>
                <div>
                    <label
                        for="company"
                        className="block mb-2 text-md font-medium text-gray-900 "
                    >
                        Batch Num
                    </label>
                    <input
                        type="number"
                        id="quantity"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        placeholder="0"
                        required
                        value={batchNum}
                    />
                </div>
            </div>
        </div>
    );
}

export default PalletCard;
