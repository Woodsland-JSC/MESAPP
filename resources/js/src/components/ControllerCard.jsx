import React from "react";
import Select from "react-select";
import { BsFillSkipForwardCircleFill } from "react-icons/bs";
import {
    Step,
    Box,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    useSteps,
} from "@chakra-ui/react";

const steps = [
    { status: "1", description: "Vào lò" },
    { status: "2", description: "Bắt đầu sấy" },
    { status: "3", description: "Xác nhận ra lò" },
];

const options = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
];

function ControllerCard(props) {
    const { status } = props;

    const { activeStep } = useSteps({
        index: 1,
        count: steps.length,
    });

    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl">
            {/* Header */}
            <div className="flex flex-col gap-x-3 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-x-3 font-medium text-xl">
                    <BsFillSkipForwardCircleFill className="text-2xl text-[#17506B]" />
                    Tiến trình: 
                    <span> Vào lò</span>
                </div>
                <div className="w-full">
                </div>
            </div>

            {/* Content */}

            

            {/* Step 1: Vào lò */}
            <div className="flex xl:flex-row flex-col xl:space-y-0 space-y-3 items-end gap-x-4 px-6 py-3">
                <div className="pt-2 xl:w-[85%] w-full md:w-[85%]">
                    <label
                        for="company"
                        className="block mb-2 text-md font-medium text-gray-900 "
                    >
                        Chọn pallet
                    </label>
                    <Select options={options} />
                </div>
                <button className="bg-[#1F2937] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all items-end justify-end w-full xl:w-[15%]">
                    Vào lò
                </button>
            </div>

            {/* Step 2: Kiểm tra lò sấy*/}
            <div className="flex xl:flex-row flex-col xl:space-y-0 space-y-3 items-end gap-x-4 px-6 py-3">
                <div className="pt-2 xl:w-[85%] w-full md:w-[85%]">
                    <label
                        for="company"
                        className="block mb-2 text-md font-medium text-gray-900 "
                    >
                        Chọn pallet
                    </label>
                    <Select options={options} />
                </div>
                <button className="bg-[#1F2937] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all items-end justify-end w-full xl:w-[15%]">
                    Vào lò
                </button>
            </div>

            {/* Step 2: Bắt đầu sấy */}
            <div className="flex xl:flex-row flex-col items-end gap-x-4 px-6 pb-5 xl:space-y-0 space-y-3">
                <div className="pt-2 space-y-1 xl:w-[75%]">
                    <div className="font-semibold">Chú ý:</div>
                    <div>
                        Thời gian sẽ bắt đầu được tính khi bấm bắt đầu sấy.
                    </div>
                </div>
                <button className="bg-[#1F2937] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all items-end xl:w-[25%] w-full">
                    Bắt đầu sấy
                </button>
            </div>

            {/* Step 3: Xác nhận ra lò (Sấy xong) */}
            <div className="flex xl:flex-row flex-col items-end gap-x-4 px-6 pb-5 xl:space-y-0 space-y-3">
                <div className="pt-2 space-y-1 w-full xl:w-[75%]">
                    <div className="font-semibold">Tình trạng mẻ sấy:</div>
                    <div>Mẻ sấy đã đủ điều kiện ra lò.</div>
                </div>
                <button className="bg-[#1F2937] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit active:duration-75 transition-all items-end w-full xl:w-[25%]">
                    Xác nhận ra lò
                </button>
            </div>
        </div>
    );
}

export default ControllerCard;
