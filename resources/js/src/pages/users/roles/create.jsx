import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Formik, Field, Form, ErrorMessage, useFormikContext } from "formik";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import Layout from "../../../layouts/layout";
import useAppContext from "../../../store/AppContext";
import Loader from "../../../components/Loader";
import roleApi from "../../../api/roleApi";

function CreateRole() {
    const { loading, setLoading } = useAppContext();
    const navigate = useNavigate();

    const [permissions, setPermissions] = useState(null);
    const [roleInfo, setRoleInfo] = useState({
        name: "",
        permissions: [],
    });

    const handleCreateRole = () => {
        if (!roleInfo.name) {
            toast.info("Vui lòng nhập thông tin cho role");
            return;
        }

        toast.success("API chưa hoàn thiện!");

        console.log("Role info: ", roleInfo);
    };

    useEffect(() => {
        setLoading(true);
        const getPermissions = async () => {
            try {
                const res = await roleApi.getAllPermission();
                console.log(res);
                setPermissions(res);
            } catch (error) {
                console.error(error);
                toast.error("Có lỗi xảy ra, đang tải lại trang.");
                navigate(0);
            }
        };

        getPermissions();
        setLoading(false);
    }, []);

    return (
        <Layout>
            <div className="flex justify-center bg-[#F8F9F7] h-screen ">
                {/* Section */}
                <div className="w-screen xl:p-12 p-6 px-5 xl:px-32 border-t border-gray-200">
                    {/* Breadcrumb */}
                    <div className="mb-4">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center">
                                        <Link
                                            to="/users"
                                            class="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
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
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
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
                    <div className="text-3xl font-bold mb-6">Tạo mới role</div>
                    {/* Main content */}
                    <form className="flex flex-col p-6 bg-white border-2 border-gray-200 rounded-xl">
                        <div className="flex gap-4">
                            <label className="whitespace-nowrap flex items-center text-md font-medium text-gray-900">
                                Tên vai trò{" "}
                                <span className="text-red-600 ml-1"> *</span>
                            </label>
                            <input
                                type="text"
                                className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                onInput={(e) =>
                                    setRoleInfo((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="my-4 border-b border-gray-200"></div>
                        <h1 className="mb-4 text-xl text-center md:text-left">
                            Quyền hạn
                        </h1>

                        <div className="divide-y divide-slate-100 ...">
                            <div className="flex py-3">
                                <span className="w-1/12 text-bold">STT</span>
                                <span className="w-2/3 text-bold">
                                    Tên permission
                                </span>
                                <span className="text-bold">Lựa chọn</span>
                            </div>
                            {permissions?.length > 0 &&
                                permissions.map((item, index) => (
                                    <div key={index} className="flex py-4">
                                        <span className="w-1/12">
                                            {index + 1}
                                        </span>
                                        <span className="w-2/3">
                                            {item.name}
                                        </span>
                                        <Checkbox
                                            onChange={(e) => {
                                                const isExisted =
                                                    roleInfo.permissions.includes(
                                                        item.id
                                                    );
                                                
                                                setRoleInfo((prev) => {
                                                    if (isExisted) {
                                                        return {
                                                            ...prev,
                                                            permissions:
                                                                prev.permissions.filter(
                                                                    (
                                                                        permission
                                                                    ) =>
                                                                        permission ==
                                                                        item.id
                                                                ),
                                                        };
                                                    } else {
                                                        return {
                                                            ...prev,
                                                            permissions: [...prev.permissions, item.id]
                                                                
                                                        };
                                                    }
                                                });

                                            }}
                                        />
                                    </div>
                                ))}
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
            </div>
            {loading && <Loader />}
        </Layout>
    );
}

export default CreateRole;
