import React from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import MenuList from "./MenuList";
import Option from "./Option";

// const BigSelect = ({ options, value, onChange, placeholder, ...props }) => {
const BigSelect = ({
    options,
    value,
    loadOptions,
    onChange,
    placeholder,
    ...props
}) => {
    return (
        <Select
            {...props}
            options={options}
            value={value && [value]}
            onChange={onChange}
            classNamePrefix="react-select"
            placeholder={placeholder}
            components={{
                MenuList,
                Option,
            }}
        />
        // <AsyncSelect
        //     {...props}
        //     cacheOptions
        //     defaultOptions
        //     loadOptions={loadOptions}
        //     options={options}
        //     onChange={onChange}
        //     components={{
        //         MenuList,
        //         Option,
        //     }}
        // />
    );
};

export default BigSelect;
