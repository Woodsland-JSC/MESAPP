import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Formik, Field, Form, ErrorMessage, useFormikContext } from "formik";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import Layout from "../../../layouts/layout";
import useAppContext from "../../../store/AppContext";
import Loader from "../../../components/Loader";
import roleApi from "../../../api/roleApi";
import { BiSolidDryer } from "react-icons/bi";
import { FaWarehouse } from "react-icons/fa6";
import { FaUserGear } from "react-icons/fa6";
import { FaIndustry } from "react-icons/fa6";

const permissionsName = [
    {
        value: "sepsay",
        name: "Tạo pallet xếp sấy",
    },
    {
        value: "kehoachsay",
        name: "Tạo kế hoạch sấy",
    },
    {
        value: "vaolo",
        name: "Vào lò",
    },
    {
        value: "kiemtralo",
        name: "Kiểm tra lò sấy",
    },
    {
        value: "losay",
        name: "Lò sấy",
    },
    {
        value: "danhgiame",
        name: "Đánh giá mẻ sấy",
    },
    {
        value: "baocao",
        name: "Báo cáo",
    },
    {
        value: "CBG",
        name: "Sản xuất chế biến gỗ ",
    },
    {
        value: "CBGCX",
        name: "Sản xuất chế biến gỗ (Chỉ xem)",
    },
    {
        value: "VCN",
        name: "Ghi nhận ván công nghiệp",
    },
    {
        value: "VCNCX",
        name: "Ghi nhận ván công nghiệp",
    },
    {
        value: "ND",
        name: "Ghi nhận nội địa",
    },
    {
        value: "QCCBG",
        name: "Kiểm định chế biến gỗ",
    },
    {
        value: "QCVCN",
        name: "Kiểm định ván công nghiệp",
    },
    {
        value: "QCND",
        name: "Kiểm định nội địa",
    },
];

function CreateRole() {
    const { loading, setLoading } = useAppContext();
    const navigate = useNavigate();

    const nameInputRef = useRef();

    const [permissions, setPermissions] = useState(null);
    const [roleInfo, setRoleInfo] = useState({
        name: "",
        permission: [],
    });

    const handleCreateRole = async () => {
        if (!roleInfo.name) {
            toast("Vui lòng nhập thông tin cho role");
            nameInputRef?.current?.focus();
            return;
        }

        if (roleInfo.permission.length < 1) {
            toast("Role nên có ít nhất 1 quyền hạn.");
            return;
        }

        setLoading(true);

        try {
            const res = await roleApi.createRole(roleInfo);
            toast.success("Tạo role thành công");
            setRoleInfo({ name: "", permission: [] });
            setLoading(false);
            navigate("/users?roletab=true");
        } catch (error) {
            toast.error("Có lỗi xảy ra.");
            setLoading(false);
        }

        console.log("Role info: ", roleInfo);
    };

    useEffect(() => {
        setLoading(true);
        const getPermissions = async () => {
            try {
                const res = await roleApi.getAllPermission();
                // console.log(res);
                setPermissions(res);
            } catch (error) {
                // console.error(error);
                toast.error("Có lỗi xảy ra, đang tải lại trang.");
                navigate(0);
            }
        };

        getPermissions();
        setLoading(false);

        document.title = "Woodsland - Tạo mới role";
        const params = new URLSearchParams(window.location.search);

        if (params.get("roletab") === "true") {
            setTimeout(() => {
                roleTab.current.click();
            });
        }

        return () => {
            document.title = "Woodsland";
            document.body.classList.remove("body-no-scroll");
        };
    }, []);

    useEffect(() => {
        if (loading) {
            document.body.classList.add("body-no-scroll");
        } else {
            document.body.classList.remove("body-no-scroll");
        }
    }, [loading]);

    return (
        <Layout>
            <div className="flex justify-center bg-[#EAEAED] h-full">
                {/* Section */}
                <div className="w-screen xl:p-12 p-6 px-5 xl:px-32 border-t border-gray-200">
                    {/* Breadcrumb */}
                    <div className="mb-2">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center">
                                        <Link
                                            to="/users"
                                            class="text-sm font-medium text-[#17506B] "
                                        >
                                            Quản lý người dùng
                                        </Link>
                                    </div>
                                </li>
                                <li aria-current="page">
                                    <div class="flex items-center">
                                        <svg
                                            class="w-3 h-3 text-gray-400 mx-1"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 6 10"
                                        >
                                            <path
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="m1 9 4-4-4-4"
                                            />
                                        </svg>
                                        <span class="ml-1 text-sm font-medium text-[#17506B] md:ml-2">
                                            <div>Tạo mới role</div>
                                        </span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="serif text-3xl font-bold pb-3">Tạo mới role</div>
                    {/* Main content */}
                    <form className="flex flex-col p-4 space-y-4 bg-white border-2 border-gray-200 rounded-xl mb-6">
                        <div className="flex space-x-4 justify-center">
                            <label className="whitespace-nowrap flex items-center text-md font-medium text-gray-900 pb-1.5">
                                Tên role:{" "}
                            </label>
                            <input
                                ref={nameInputRef}
                                type="text"
                                className="border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2 text-[15px]"
                                onInput={(e) =>
                                    setRoleInfo((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="my-2 border-b border-gray-200"></div>
                        {/* <h1 className="mb-4 text-xl text-center font-semibold md:text-left">
                            Danh sách permission
                        </h1> */}
                        <div className="bg-[#e9f8ff] p-3 rounded-xl">
                            <div className="w-full flex items-center justify-between px-4">
                                <div className="flex items-center space-x-3 w-full uppercase py-2 font-bold text-lg">
                                    <div className="flex space-x-2">
                                        <FaIndustry className="w-6 h-6 text-[#17506B] " />
                                        <div>Chức năng sấy gỗ</div>
                                    </div>
                                    <span className="text-base text-gray-400">{""}/Vận hành</span>
                                </div>
                                <div className="w-full text-right pr-3">
                                    <Checkbox
                                        size="lg"
                                    >
                                            Chọn tất cả
                                    </Checkbox>
                                </div>
                            </div>
                            <div className="my-1 mb-2 border-b border-gray-200 "></div>
                            <div className="grid grid-cols-3 px-4">
                            {permissions?.length > 0 &&
                                permissions
                                .filter((item, index) => index >= 1 && index <= 6)
                                .map((item, index) => (
                                    <div key={index} className="flex w-full py-2">
                                        {/* <span className="w-1/12 sm:w-1/12">
                                            {index + 1}
                                        </span> */}
                                        <div className="flex  w-full ">
                                            <Checkbox
                                                className=""
                                                size="lg"
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    setRoleInfo((prev) => {
                                                        let updatedPermissions;
                                                        if (isChecked) {
                                                            updatedPermissions = [
                                                                ...prev.permission,
                                                                item.name,
                                                            ];
                                                        } else {
                                                            updatedPermissions = prev.permission.filter(
                                                                (permission) =>
                                                                    permission !== item.name
                                                            );
                                                        }
                                                        return {
                                                            ...prev,
                                                            permission: updatedPermissions,
                                                        };
                                                    });
                                                    console.log("roleInfo", roleInfo.permission);
                                                }}
                                            >
                                                {permissionsName.find(
                                                (permission) =>
                                                    permission.value ==
                                                    item.name
                                            )?.name || ""}
                                            </Checkbox>
                                        </div>
                                        <span className="w-2/3">
                                            
                                        </span>
                                        
                                    </div>
                                ))}
                        </div>
                        </div>

                        <div className="bg-[#e9f8ff] p-3 rounded-xl">
                            <div className="w-full flex items-center justify-between px-4">
                                <div className="flex items-end space-x-3 w-full uppercase py-2 font-bold text-lg">
                                    <div className="flex space-x-2">
                                        <FaWarehouse className="w-6 h-6 text-[#17506B]" />
                                        <div>Chức năng sản xuất</div>
                                    </div>
                                    <span className="text-base text-gray-400">{""}/Vận hành</span>
                                </div>
                                <div className="w-full text-right pr-3">
                                    <Checkbox
                                        size="lg"
                                    >
                                            Chọn tất cả
                                    </Checkbox>
                                </div>
                            </div>
                            <div className="my-1 mb-2 border-b border-gray-200 "></div>
                            <div className="grid grid-cols-3 px-4">
                            {permissions?.length > 0 &&
                                permissions
                                .filter((item, index) => index >= 7 && index <= 13)
                                .map((item, index) => (
                                    <div key={index} className="flex w-full py-2">
                                        {/* <span className="w-1/12 sm:w-1/12">
                                            {index + 1}
                                        </span> */}
                                        <div className="flex w-full ">
                                            <Checkbox
                                                className=""
                                                size="lg"
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    setRoleInfo((prev) => {
                                                        let updatedPermissions;
                                                        if (isChecked) {
                                                            updatedPermissions = [
                                                                ...prev.permission,
                                                                item.name,
                                                            ];
                                                        } else {
                                                            updatedPermissions = prev.permission.filter(
                                                                (permission) =>
                                                                    permission !== item.name
                                                            );
                                                        }
                                                        return {
                                                            ...prev,
                                                            permission: updatedPermissions,
                                                        };
                                                    });
                                                    console.log("roleInfo", roleInfo.permission);
                                                }}
                                            >
                                                {permissionsName.find(
                                                (permission) =>
                                                    permission.value ==
                                                    item.name
                                            )?.name || ""}
                                            </Checkbox>
                                        </div>
                                        
                                    </div>
                                ))}
                        </div>
                        </div>

                        <div className="bg-[#e9f8ff] p-3 rounded-xl">
                            <div className="w-full flex items-center justify-between px-4">
                                <div className="flex items-end space-x-3 w-full uppercase py-2 font-bold text-lg">
                                    <div className="flex space-x-2">
                                        <FaUserGear className="w-6 h-6 text-[#17506B] mx-1" />
                                        <div>Chức năng quản trị</div>
                                    </div>
                                    <span className="text-base text-gray-400">{""}/Quản trị</span>
                                </div>
                                <div className="w-full text-right pr-3">
                                    <Checkbox
                                        size="lg"
                                    >
                                            Chọn tất cả
                                    </Checkbox>
                                </div>
                            </div>
                            <div className="my-1 mb-2 border-b border-gray-200 "></div>
                            <div className="grid grid-cols-3 px-4">
                            {permissions?.length > 0 &&
                                permissions
                                .filter((item, index) => index >= 7 && index <= 13)
                                .map((item, index) => (
                                    <div key={index} className="flex w-full py-2">
                                        {/* <span className="w-1/12 sm:w-1/12">
                                            {index + 1}
                                        </span> */}
                                        <div className="flex w-full ">
                                            <Checkbox
                                                className=""
                                                size="lg"
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    setRoleInfo((prev) => {
                                                        let updatedPermissions;
                                                        if (isChecked) {
                                                            updatedPermissions = [
                                                                ...prev.permission,
                                                                item.name,
                                                            ];
                                                        } else {
                                                            updatedPermissions = prev.permission.filter(
                                                                (permission) =>
                                                                    permission !== item.name
                                                            );
                                                        }
                                                        return {
                                                            ...prev,
                                                            permission: updatedPermissions,
                                                        };
                                                    });
                                                    console.log("roleInfo", roleInfo.permission);
                                                }}
                                            >
                                                {permissionsName.find(
                                                (permission) =>
                                                    permission.value ==
                                                    item.name
                                            )?.name || ""}
                                            </Checkbox>
                                        </div>
                                        
                                    </div>
                                ))}
                        </div>
                        </div>

                        <button
                            type="button"
                            className="mt-5 self-end flex items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center gap-x-2"
                            onClick={handleCreateRole}
                        >
                            Lưu lại
                        </button>
                    </form>
                </div>
                <div className="py-3"></div>
            </div>
            {loading && <Loader />}
        </Layout>
    );
}

export default CreateRole;
