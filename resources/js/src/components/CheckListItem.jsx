import React, { useState } from "react";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";

function CheckListItem(props) {
    const { value, title, description, onCheckboxChange } = props;

    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = () => {
      setIsChecked((prev) => !prev);
      onCheckboxChange(!isChecked);
    };

    return (
        <div className="bg-[#F7FDFF] rounded-xl w-full h-fit xl:h-[9.9rem] hover:shadow-[rgba(7,_65,_210,_0.1)_0px_9px_30px] hover:border-[#99b4c1] border-2 border-gray-200">
            <div className="px-4 py-3 bg-[#F1F8FB] h-[40%] rounded-t-xl  flex justify-between items-center border-b border-gray-200">
                <div className="tx-[#155979] font-semibold w-[70%]">{title}</div>
                <Checkbox value={value} isChecked={isChecked} onChange={handleCheckboxChange} size='lg' colorScheme="blue">
                    ĐẠT
                </Checkbox>
            </div>

            <div className=" px-4 py-2">{description}</div>
        </div>
    );
}

export default CheckListItem;
