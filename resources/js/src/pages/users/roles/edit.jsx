import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Formik, Field, Form, ErrorMessage, useFormikContext } from "formik";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import Layout from "../../../layouts/layout";
import useAppContext from "../../../store/AppContext";
import Loader from "../../../components/Loader";
import roleApi from "../../../api/roleApi";
import userApi from "../../../api/userApi";
import { Spinner } from "@chakra-ui/react";

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
        value: "quanlyuser",
        name: "Quản lý người dùng",
    },
    {
        value: "monitor",
        name: "Tích hợp",
    },
    {
        value: "CBG",
        name: "Ghi nhận chế biến gỗ",
    },
    {
        value: "VCN",
        name: "Ghi nhận ván công nghiệp",
    },
    {
        value: "QCCBG",
        name: "Kiểm định chế biến gỗ",
    },
    {
        value: "QCVCN",
        name: "Kiểm định ván công nghiệp",
    },
];

function EditRole() {
    const { loading, setLoading, user, setUser } = useAppContext();
    const navigate = useNavigate();

    const nameInputRef = useRef();

    const [permissions, setPermissions] = useState([]);
    const [checkedPermissions, setCheckedPermissions] = useState(null);
    const [permissionData, setPermissionData] = useState(null);
    const [updateData, setUpdateData] = useState(null);
    const [updateRoleLoading, setUpdateRoleLoading] = useState(false);
    const { roleId } = useParams();

    const [roleInfo, setRoleInfo] = useState({
        name: "",
        permission: [],
    });

    const updateUserData = async () => {
        try {
            const res = await userApi.getUserDetails(user?.id);
            const newPermissions = res.permissions;
            setUser(prevUser => ({
                ...prevUser,
                permissions: newPermissions
            }));
        } catch (error) {
            toast.error("Không thể đồng bộ dữ liệu user. Hãy đăng nhập lại.");
            console.log(error);
        }
    }

    const handleUpdate = async () => {
        if (!roleInfo.name) {
            toast.error("Vui lòng nhập thông tin cho role");
            nameInputRef?.current?.focus();
            return;
        }

        if (roleInfo.permission.length < 1) {
            toast.error("Role nên có ít nhất 1 quyền hạn.");
            return;
        }

        setUpdateRoleLoading(true);
        

        try {
            const res = await roleApi.updateRole(roleId, roleInfo);
            toast.success("Lưu thông tin thành công.");
            setUpdateRoleLoading(false);
            updateUserData();
            navigate("/users?roletab=true");
        } catch (error) {
            toast.error("Có lỗi xảy ra.");
            setUpdateRoleLoading(false);
        }

        console.log("Role info: ", roleInfo);
    };

    useEffect(() => {
        setLoading(true);
        const getPermissions = async () => {
            try {
                const res = await roleApi.getRoleById(roleId);
                setPermissions(res.allPermission);
                setPermissionData(res.details);
                setCheckedPermissions([]);
                if (res.details) {
                    setCheckedPermissions(res.details.permissions);
                    setRoleInfo({
                        name: res.details.name,
                        permission: res.details.permissions,
                    });
                }
                console.log("Permissions: ", res.details);
            } catch (error) {
                toast.error("Có lỗi xảy ra, đang tải lại trang.");
                navigate(0);
            }
        };

        getPermissions();
        setLoading(false);

        document.title = "Woodsland - Chi tiết quyền";
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

    const isPermissionActive = (permissionName) => {
        if (Array.isArray(permissionData)) {
            return permissionData.some((data) => data.name === permissionName);
        } else {
            return false; // Hoặc giá trị mặc định khác tùy thuộc vào logic của bạn
        }
    };

    return (
        <Layout>
            <div className="flex justify-center h-full">
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
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="m1 9 4-4-4-4"
                                            />
                                        </svg>
                                        <span class="ml-1 text-sm font-medium text-[#17506B] md:ml-2">
                                            <div>Thông tin role</div>
                                        </span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="serif text-4xl font-bold pb-4">
                        Thông tin role
                    </div>
                    {/* Main content */}
                    <form className="flex flex-col p-6 bg-white border-2 border-gray-200 rounded-xl mb-6">
                        <div className="flex gap-4">
                            <label className="whitespace-nowrap flex items-center text-md font-medium text-gray-900">
                                Tên role đã tạo:{" "}
                            </label>
                            <input
                                type="text"
                                className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                value={permissionData?.name || ""}
                                onChange={(e) => {
                                    setPermissionData;
                                }}
                                onInput={(e) =>
                                    setRoleInfo((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="my-4 border-b border-gray-200"></div>
                        <h1 className="mb-4 text-xl text-center font-semibold md:text-left">
                            Danh sách permission
                        </h1>

                        <div className="divide-y divide-slate-100 ...">
                            <div className="flex px-6 bg-gray-50 py-3">
                                <span className="w-1/12 font-bold">#</span>
                                <span className="w-2/3 font-bold">
                                    Tên permission
                                </span>
                                <span className="font-bold">Lựa chọn</span>
                            </div>
                            {permissions?.length > 0 &&
                                permissions.map((item, index) => (
                                    <div key={index} className="flex px-6 py-4">
                                        <span className="w-1/12 sm:w-1/12">
                                            {index + 1}
                                        </span>
                                        <span className="w-2/3">
                                            {permissionsName.find(
                                                (permission) =>
                                                    permission.value ===
                                                    item.name
                                            )?.name || ""}
                                        </span>
                                        <div className="flex justify-center w-[15%]">
                                            <Checkbox
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
                                                defaultChecked={checkedPermissions.includes(item.name)}
                                            ></Checkbox>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        <button
                            type="button"
                            className="mt-5 self-end flex items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center gap-x-2"
                            onClick={handleUpdate}
                        >
                            {updateRoleLoading ? (
                                    <div className="flex items-center space-x-4">
                                        <Spinner size="sm" color="white" />
                                        <div>Đang lưu thông tin</div>
                                    </div>
                            ) : (
                                    <>
                                        Lưu thông tin
                                    </>
                            )}
                        </button>
                    </form>
                </div>
                <div className="py-3"></div>
            </div>
            {loading && <Loader />}
        </Layout>
    );
}

export default EditRole;
