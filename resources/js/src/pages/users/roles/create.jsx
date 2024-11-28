import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Formik, Field, Form, ErrorMessage, useFormikContext } from "formik";
import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import Layout from "../../../layouts/layout";
import useAppContext from "../../../store/AppContext";
import Loader from "../../../components/Loader";
import roleApi from "../../../api/roleApi";
import { BiSolidDryer } from "react-icons/bi";
import { FaWarehouse } from "react-icons/fa6";
import { FaUserGear } from "react-icons/fa6";
import { FaIndustry } from "react-icons/fa6";
import { BiSolidReport } from "react-icons/bi";
import { FaDiamond } from "react-icons/fa6";
import { Select } from "@chakra-ui/react";
import { is } from "date-fns/locale";
import { IoMdArrowRoundBack } from "react-icons/io";

const dryingPermissions = [
    {
        value: "xepsay",
        name: "Tạo pallet xếp sấy",
        description: "Chất gỗ lên pallet để chuẩn bị đưa vào lò",
    },
    {
        value: "kehoachsay",
        name: "Tạo kế hoạch sấy",
        description: "Chọn lò và đặt một kế hoạch sấy",
    },
    {
        value: "vaolo",
        name: "Vào lò",
        description: "Cho pallet vào lò để chuẩn bị sấy",
    },
    {
        value: "kiemtralo",
        name: "Kiểm tra lò sấy",
        description: "Kiểm tra lò trước khi bắt đầu sấy",
    },
    {
        value: "losay",
        name: "Lò sấy",
        description: "Bắt đầu giai đoạn sấy",
    },
    {
        value: "danhgiame",
        name: "Đánh giá mẻ sấy",
        description: "Đánh giá mẻ sấy trong lò",
    },
];

const managementPermissions = [
    {
        value: "quanlyuser",
        name: "Quản lý người dùng",
        description: "Tạo mới, chỉnh sửa và hạn chế người dùng",
    },
    {
        value: "quanlyrole",
        name: "Quản lý quyền và vai trò",
        description: "Tạo mới, chỉnh sửa và xóa vai trò",
    },
];

const reportPermissions = {
    SAY: [
        {
            value: "BCSAY_bienbanvaolo",
            name: "Biên bản vào lò",
        },
        {
            value: "BCSAY_bienbanlichsuvaolo",
            name: "Biên bản lịch sử vào lò",
        },
        {
            value: "BCSAY_bienbankiemtralosay",
            name: "Biên bản kiểm tra lò sấy",
        },
        {
            value: "BCSAY_kehoachsay",
            name: "Báo cáo kế hoạch sấy",
        },
        {
            value: "BCSAY_lodangsay",
            name: "Báo cáo lò đang sấy",
        },
        {
            value: "BCSAY_tonsaylua",
            name: "Báo cáo tồn sấy lựa",
        },
        {
            value: "BCSAY_xepsay",
            name: "Báo cáo xếp sấy",
        },
        {
            value: "BCSAY_xepchosay",
            name: "Biên bản xếp chờ sấy",
        },
    ],
    CBG: [
        {
            value: "BCCBG_chitietgiaonhan",
            name: "Báo cáo thông tin chi tiết giao nhận",
        },
        {
            value: "BCCBG_bienphapxulyloi",
            name: "Báo cáo biện pháp xử lý lỗi",
        },
    ],
    VCN: [
        {
            value: "BCVCN_chitietgiaonhan",
            name: "Báo cáo thông tin chi tiết giao nhận",
        },
        {
            value: "BCVCN_bienphapxulyloi",
            name: "Báo cáo biện pháp xử lý lỗi",
        },
    ],
    DAND: [
        {
            value: "BCDAND_chitietgiaonhan",
            name: "Báo cáo thông tin chi tiết giao nhận",
        },
        {
            value: "BCDAND_bienphapxulyloi",
            name: "Báo cáo biện pháp xử lý lỗi",
        },
    ],
};

function CreateRole() {
    const { loading, setLoading } = useAppContext();
    const navigate = useNavigate();

    const nameInputRef = useRef();

    const [permissions, setPermissions] = useState(null);
    const [roleInfo, setRoleInfo] = useState({
        name: "",
        permission: [],
    });

    const [isUsingCBG, setIsUsingCBG] = useState(false);
    const [isUsingVCN, setIsUsingVCN] = useState(false);
    const [isUsingDAND, setIsUsingDAND] = useState(false);

    const [selectedCBGPermission, setSelectedCBGPermission] = useState("");
    const [selectedVCNPermission, setSelectedVCNPermission] = useState("");
    const [selectedDANDPermission, setSelectedDANDPermission] = useState("");

    const handlePermissionChange = (e, permissionValue) => {
        if (e.target.checked) {
            setPermissions((prev) => [...prev, permissionValue]);
            console.log("Danh sách quyền đã chọn:", permissions);
        } else {
            setPermissions((prev) =>
                prev.filter((value) => value !== permissionValue)
            );
            console.log("Danh sách quyền đã chọn:", permissions);
        }
    };

    const handleSelectCBGPermissionChange = (e, permissionValue) => {
        if (permissionValue === "CBG" || permissionValue === "CBG(CX)") {
            setPermissions((prev) => {
                const filteredList = prev.filter((value) => value !== "CBG" && value !== "CBG(CX)");
                return [...filteredList, permissionValue];
            });
        }
    };

    const handleToggleIsUsingCBG = () => {
        setIsUsingCBG((prev) => {
            const newIsUsingCBG = !prev;
            // Nếu chuyển sang !isUsingCBG, loại bỏ CBG hoặc CBG(CX) khỏi permissions
            if (!newIsUsingCBG) {
                setSelectedCBGPermission("");
                setPermissions((prevList) =>
                    prevList.filter((value) => value !== "CBG" && value !== "CBG(CX)")
                );
            }
            return newIsUsingCBG;
        });
    };

    const handleSelectVCNPermissionChange = (e, permissionValue) => {
        if (permissionValue === "VCN" || permissionValue === "VCN(CX)") {
            setPermissions((prev) => {
                const filteredList = prev.filter((value) => value !== "VCN" && value !== "VCN(CX)");
                return [...filteredList, permissionValue];
            });
        }
    };

    const handleToggleIsUsingVCN = () => {
        setIsUsingVCN((prev) => {
            const newIsUsingVCN = !prev;
            if (!newIsUsingVCN) {
                setSelectedVCNPermission("");
                setPermissions((prevList) =>
                    prevList.filter((value) => value !== "VCN" && value !== "VCN(CX)")
                );
            }
            return newIsUsingVCN;
        });
    };

    const handleSelectDANDPermissionChange = (e, permissionValue) => {
        if (permissionValue === "DAND" || permissionValue === "DAND(CX)") {
            setPermissions((prev) => {
                const filteredList = prev.filter((value) => value !== "DAND" && value !== "DAND(CX)");
                return [...filteredList, permissionValue];
            });
        }
    };

    const handleToggleIsUsingDAND = () => {
        setIsUsingDAND((prev) => {
            const newIsUsingDAND = !prev;
            if (!newIsUsingDAND) {
                setSelectedDANDPermission("");
                setPermissions((prevList) =>
                    prevList.filter((value) => value !== "DAND" && value !== "DAND(CX)")
                );
            }
            return newIsUsingDAND;
        });
    };

    const handleCreateRole = async () => {
        setRoleInfo({ ...roleInfo, permission: permissions });
        console.log("Role info: ", roleInfo);
        if (!roleInfo.name) {
            toast.error("Vui lòng nhập thông tin vai trò");
            nameInputRef?.current?.focus();
            return;
        }

        if (permissions.length < 1) {
            toast("Role nên có ít nhất 1 quyền hạn.");
            return;
        }

        setLoading(true);

        try {
            const res = await roleApi.createRole(roleInfo);
            toast.success("Vai trò được tạo thành công");
            setRoleInfo({ name: "", permission: [] });
            setLoading(false);
            navigate("/users?roletab=true");
        } catch (error) {
            toast.error("Có lỗi xảy ra.");
            setLoading(false);
        }
    };

    useEffect(() => {
        // setLoading(true);
        // const getPermissions = async () => {
        //     try {
        //         const res = await roleApi.getAllPermission();
        //         // console.log(res);
        //         setPermissions(res);
        //     } catch (error) {
        //         // console.error(error);
        //         toast.error("Có lỗi xảy ra, đang tải lại trang.");
        //         navigate(0);
        //     }
        // };

        // getPermissions();
        // setLoading(false);

        document.title = "Woodsland - Tạo mới vai trò";
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
                <div className="w-screen xl:p-12 p-6 px-5 xl:pt-6 lg:pt-6 md:pt-6 pt-2 xl:px-52 border-t border-gray-200">

                    {/* Go back */}
                    <div 
                        className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B] xl:ml-0 lg:ml-0 md:ml-0 ml-4"
                        onClick={() => navigate(-1)}
                    >
                        <IoMdArrowRoundBack />
                        <div>Quay lại</div>
                    </div>                    

                    {/* Header */}
                    <div className="serif text-3xl font-bold pb-3">
                        Tạo mới vai trò
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-xl">
                        {/* Content Header */}
                        <div className="flex flex-col p-3 space-y-4 py-4 mb-2">
                            <div className="flex items-center space-x-4">
                                <label className="pl-2 uppercase whitespace-nowrap flex items-center text-md font-medium text-gray-900 py-1">
                                    Tên vai trò:{" "}
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
                        </div>

                        {/* Content Body */}
                        <div className="">
                            {/* Wood Drying */}
                            <div className="mb-3">
                                <div className="w-full flex bg-[#F8FAFC] border-gray-200 border-t-2 border-b-2 py-1.5 items-center justify-between px-6">
                                    <div className="flex items-center space-x-3 w-[70%] uppercase py-1 font-bold text-lg">
                                        <div className="flex space-x-3">
                                            <FaIndustry className="w-6 h-6 text-[#17506B] " />
                                            <div>Chức năng sấy gỗ</div>
                                        </div>
                                        <span className="text-base text-gray-400">
                                            {""}/Vận hành
                                        </span>
                                    </div>

                                    <div className="text-left  w-[20%] rounded-lg">
                                        {/* <Checkbox size="lg">
                                            Chọn tất cả
                                        </Checkbox> */}
                                    </div>
                                </div>

                                <div className="py-2">
                                    {dryingPermissions?.map((item, index) => (
                                        <div className="flex px-6 py-3">
                                            <div className="font-medium w-[40%] pl-8">
                                                {item.name}
                                            </div>
                                            <div className="w-[40%] text-[16px]">
                                                {item.description}
                                            </div>
                                            <Checkbox
                                                className=" w-[20%]"
                                                size="lg"
                                                value={item.value}
                                                isChecked={permissions?.includes(
                                                    item.value
                                                )}
                                                onChange={(e) =>
                                                    handlePermissionChange(
                                                        e,
                                                        item.value
                                                    )
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Wood Working */}
                            <div className="mb-3">
                                <div className="w-full flex bg-[#F8FAFC] border-gray-200 border-t-2 border-b-2 py-1.5 items-center justify-between px-6">
                                    <div className="flex items-center space-x-3 w-[40%] uppercase py-1 font-bold text-lg">
                                        <div className="flex space-x-3">
                                            <FaWarehouse className="w-6 h-6 text-[#17506B]" />
                                            <div>Chức năng sản xuất</div>
                                        </div>
                                        <span className="text-base text-gray-400">
                                            {""}/Vận hành
                                        </span>
                                    </div>

                                    {/* <div className="flex text-left w-[60%] rounded-lg">
                                        <div className="w-2/3">Sản xuất</div>
                                        <div className="w-1/3">
                                            Kiểm định chất lượng
                                        </div>
                                    </div> */}
                                </div>

                                <div className="py-2">
                                    <div className="flex px-6 py-3">
                                        <div className="font-medium w-[40%] pl-8">
                                            Sản xuất chế biến gỗ
                                        </div>

                                        <div className="flex space-x-6 w-[40%]">
                                            <Checkbox
                                                className=" "
                                                size="lg"
                                                value="open"
                                                onChange={handleToggleIsUsingCBG}
                                            />
                                            <Select
                                                width={"60%"}
                                                disabled={!isUsingCBG}
                                                placeholder="Chọn quyền"
                                                value={selectedCBGPermission}
                                                onChange={(e) => {
                                                    setSelectedCBGPermission(e.target.value);
                                                    if(isUsingCBG){
                                                        handleSelectCBGPermissionChange(
                                                            e, e.target.value
                                                        )
                                                    } 
                                                }}
                                            >
                                                <option value="CBG(CX)">
                                                    Chỉ xem
                                                </option>
                                                <option value="CBG">
                                                    Ghi nhận
                                                </option>
                                            </Select>
                                        </div>
                                        <Checkbox
                                            className=" w-[20%]"
                                            size="lg"
                                            onChange={(e) =>
                                                handlePermissionChange(
                                                    e, "QCCBG"
                                                )
                                            }
                                        >
                                            {" "}<p className="text-[16px] font-medium">Kiểm định</p>
                                        </Checkbox>
                                    </div>
                                    <div className="flex px-6 py-3">
                                        <div className="font-medium w-[40%] pl-8">
                                            Sản xuất ván công nghiệp
                                        </div>

                                        <div className="flex space-x-6 w-[40%]">
                                            <Checkbox
                                                className=" "
                                                size="lg"
                                                value="open"
                                                onChange={handleToggleIsUsingVCN}
                                            />
                                            <Select
                                                width={"60%"}
                                                disabled={!isUsingVCN}
                                                placeholder="Chọn quyền"
                                                value={selectedVCNPermission}
                                                onChange={(e) => {
                                                    setSelectedVCNPermission(e.target.value);
                                                    if(isUsingVCN){
                                                        handleSelectVCNPermissionChange(
                                                            e, e.target.value
                                                        )
                                                    } 
                                                }}
                                            >
                                                <option value="VCN(CX)">
                                                    Chỉ xem
                                                </option>
                                                <option value="VCN">
                                                    Ghi nhận
                                                </option>
                                            </Select>
                                        </div>
                                        <Checkbox
                                            className=" w-[20%]"
                                            size="lg"
                                            onChange={(e) =>
                                                handlePermissionChange(
                                                    e, "QCVCN"
                                                )
                                            }
                                        >
                                            {" "}<p className="text-[16px] font-medium">Kiểm định</p>
                                        </Checkbox>
                                    </div>
                                    <div className="flex px-6 py-3">
                                        <div className="font-medium w-[40%] pl-8">
                                            Sản xuất dự án nội địa
                                        </div>

                                        <div className="flex space-x-6 w-[40%]">
                                            <Checkbox
                                                className=" "
                                                size="lg"
                                                value="open"
                                                onChange={handleToggleIsUsingDAND}
                                            />
                                            <Select
                                                width={"60%"}
                                                disabled={!isUsingDAND}
                                                placeholder="Chọn quyền"
                                                value={selectedDANDPermission}
                                                onChange={(e) => {
                                                    setSelectedDANDPermission(e.target.value);
                                                    if(isUsingDAND){
                                                        handleSelectDANDPermissionChange(
                                                            e, e.target.value
                                                        )
                                                    } 
                                                }}
                                            >
                                                <option value="DAND(CX)">
                                                    Chỉ xem
                                                </option>
                                                <option value="DAND">
                                                    Ghi nhận
                                                </option>
                                            </Select>
                                        </div>
                                        <Checkbox
                                            className=" w-[20%]"
                                            size="lg"
                                            onChange={(e) =>
                                                handlePermissionChange(
                                                    e, "TDLDND"
                                                )
                                            }
                                        >
                                            {" "}<p className="text-[16px] font-medium">Tiến độ lắp đặt</p>
                                        </Checkbox>
                                    </div>
                                </div>
                            </div>

                            {/* Management */}
                            <div className="mb-3">
                                <div className="w-full flex bg-[#F8FAFC] border-gray-200 border-t-2 border-b-2 py-1.5 items-center justify-between px-6">
                                    <div className="flex items-center space-x-3 w-[40%] uppercase py-1 font-bold text-lg">
                                        <div className="flex space-x-3">
                                            <FaUserGear className="w-6 h-6 text-[#17506B]" />
                                            <div>Chức năng quản trị</div>
                                        </div>
                                        <span className="text-base text-gray-400">
                                            {""}/QUẢN TRỊ
                                        </span>
                                    </div>

                                    <div className="text-left  w-[20%] rounded-lg">
                                        {/* <Checkbox size="lg">
                                            Chọn tất cả
                                        </Checkbox> */}
                                    </div>
                                </div>

                                <div className="py-2">
                                    {managementPermissions?.map(
                                        (item, index) => (
                                            <div className="flex px-6 py-3">
                                                <div className="font-medium w-[40%] pl-8">
                                                    {item.name}
                                                </div>
                                                <div className="w-[40%] text-[16px]">
                                                    {item.description}
                                                </div>
                                                <Checkbox
                                                    className=" w-[20%]"
                                                    size="lg"
                                                    value={item.value}
                                                    isChecked={permissions?.includes(
                                                        item.value
                                                    )}
                                                    onChange={(e) =>
                                                        handlePermissionChange(
                                                            e,
                                                            item.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Reports */}
                            <div className="mb-1">
                                <div className="w-full flex bg-[#F8FAFC] border-gray-200 border-t-2 border-b-2 py-1.5 items-center justify-between px-6">
                                    <div className="flex items-center space-x-3 w-[40%] uppercase py-1 font-bold text-lg">
                                        <div className="flex space-x-3">
                                            <BiSolidReport className="w-6 h-6 text-[#17506B]" />
                                            <div>Danh mục báo cáo</div>
                                        </div>
                                        <span className="text-base text-gray-400">
                                            {""}/Báo cáo
                                        </span>
                                    </div>
                                </div>

                                <div className="py-3 divide-y divide-gray-200">
                                    <div className="flex items-center justify-between px-8 py-2.5 ">
                                        <div className="flex items-center space-x-2 font-semibold">
                                            <FaDiamond className="w-4 h-4 text-[#17506B]" />
                                            <div>BÁO CÁO SẤY PHÔI</div>
                                        </div>
                                        <div className="text-left  w-[20%] rounded-lg">
                                            {/* <Checkbox size="lg">
                                                Chọn tất cả
                                            </Checkbox> */}
                                        </div>
                                    </div>
                                    {reportPermissions?.SAY?.map(
                                        (item, index) => (
                                            <div className="flex px-6 py-3">
                                                <div className="font-medium w-[40%] pl-8">
                                                    {item.name}
                                                </div>
                                                <div className="w-[40%] text-[16px]">
                                                    {item.description}
                                                </div>
                                                <Checkbox
                                                    className=" w-[20%]"
                                                    size="lg"
                                                    value={item.value}
                                                    isChecked={permissions?.includes(
                                                        item.value
                                                    )}
                                                    onChange={(e) =>
                                                        handlePermissionChange(
                                                            e,
                                                            item.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="py-3 divide-y divide-gray-200">
                                    <div className="flex items-center justify-between px-6 py-2 ">
                                        <div className="flex items-center space-x-2 font-semibold">
                                            <FaDiamond className="w-4 h-4 text-[#14532D]" />
                                            <div>BÁO CÁO CHẾ BIẾN GỖ</div>
                                        </div>
                                        <div className="text-left  w-[20%] rounded-lg">
                                            {/* <Checkbox size="lg">
                                                Chọn tất cả
                                            </Checkbox> */}
                                        </div>
                                    </div>
                                    {reportPermissions?.CBG?.map(
                                        (item, index) => (
                                            <div className="flex px-6 py-3">
                                                <div className="font-medium w-[40%] pl-8">
                                                    {item.name}
                                                </div>
                                                <div className="w-[40%] text-[16px]">
                                                    {item.description}
                                                </div>
                                                <Checkbox
                                                    className=" w-[20%]"
                                                    size="lg"
                                                    value={item.value}
                                                    isChecked={permissions?.includes(
                                                        item.value
                                                    )}
                                                    onChange={(e) =>
                                                        handlePermissionChange(
                                                            e,
                                                            item.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="py-3 divide-y divide-gray-200">
                                    <div className="flex items-center justify-between px-6 py-2 ">
                                        <div className="flex items-center space-x-2 font-semibold">
                                            <FaDiamond className="w-4 h-4 text-[#4C1D95]" />
                                            <div>BÁO CÁO VÁN CÔNG NGHIỆP</div>
                                        </div>
                                        <div className="text-left  w-[20%] rounded-lg">
                                            {/* <Checkbox size="lg">
                                                Chọn tất cả
                                            </Checkbox> */}
                                        </div>
                                    </div>
                                    {reportPermissions?.VCN?.map(
                                        (item, index) => (
                                            <div className="flex px-6 py-3">
                                                <div className="font-medium w-[40%] pl-8">
                                                    {item.name}
                                                </div>
                                                <div className="w-[40%] text-[16px]">
                                                    {item.description}
                                                </div>
                                                <Checkbox
                                                    className=" w-[20%]"
                                                    size="lg"
                                                    value={item.value}
                                                    isChecked={permissions?.includes(
                                                        item.value
                                                    )}
                                                    onChange={(e) =>
                                                        handlePermissionChange(
                                                            e,
                                                            item.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="py-3 divide-y divide-gray-200">
                                    <div className="flex items-center justify-between px-6 py-2 ">
                                        <div className="flex items-center space-x-2 font-semibold">
                                            <FaDiamond className="w-4h-4 text-[#6C0C0C]" />
                                            <div>BÁO CÁO DỰ ÁN NỘI ĐỊA</div>
                                        </div>
                                        <div className="text-left w-[20%] rounded-lg">
                                            {/* <Checkbox size="lg">
                                                Chọn tất cả
                                            </Checkbox> */}
                                        </div>
                                    </div>
                                    {reportPermissions?.DAND?.map(
                                        (item, index) => (
                                            <div className="flex px-6 py-3">
                                                <div className="font-medium w-[40%] pl-8">
                                                    {item.name}
                                                </div>
                                                <div className="w-[40%] text-[16px]">
                                                    {item.description}
                                                </div>
                                                <Checkbox
                                                    className=" w-[20%]"
                                                    size="lg"
                                                    value={item.value}
                                                    isChecked={permissions?.includes(
                                                        item.value
                                                    )}
                                                    onChange={(e) =>
                                                        handlePermissionChange(
                                                            e,
                                                            item.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content Footer */}
                        <div className="p-4 pt-0 w-full flex justify-end">
                            <button
                                type="button"
                                className="mt-5 self-end flex items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg w-full sm:w-auto px-5 py-2.5 text-center gap-x-2"
                                onClick={handleCreateRole}
                            >
                                Lưu lại
                            </button>
                        </div>
                    </div>
                </div>
                <div className="py-3"></div>
            </div>
            {loading && <Loader />}
        </Layout>
    );
}

export default CreateRole;
