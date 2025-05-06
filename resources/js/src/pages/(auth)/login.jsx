import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import useAppContext from "../../store/AppContext";
import usersApi from "../../api/userApi";
import Loader from "../../components/Loader";
import Logo from "../../assets/images/WLorigin.svg";
import generateAvatar from "../../utils/generateAvatar";
import axios from "axios";
import { FaCircle } from "react-icons/fa";
import GoodNetwork from "../../components/custom-icon/GoodNetwork";
import MediumNetwork from "../../components/custom-icon/MediumNetwork";
import BadNetwork from "../../components/custom-icon/BadNetwork";
import Offline from "../../components/custom-icon/Offline";

function Login() {
    const emailInputRef = useRef();
    const passwordInputRef = useRef();
    const navigate = useNavigate();
    const { setUser, loading, setLoading, isAuthenticated } = useAppContext();

    const [status, setStatus] = useState(null);

    const [info, setInfo] = useState({
        email: "",
        password: "",
        remember: false,
    });

    const [inputError, setInputError] = useState({
        email: "",
        password: "",
    });

    // Network Checking
    const [networkStatus, setNetworkStatus] = useState({ speed: 0, status: "Đang kiểm tra..." });

    useEffect(() => {
        const updateNetworkStatus = () => {
            const downlink = navigator.connection?.downlink || 0;
            const isOnline = navigator.onLine;
    
            let status = "Tốt";

            if (!isOnline || downlink === 0) {
                status = "Không có mạng";
            } else if (downlink < 1.2) {
                status = "Kém"; // 3G trở xuống
            } else if (downlink >= 1.2 && downlink < 3.5) {
                status = "Trung bình"; // Slow 4G
            } else {
                status = "Tốt"; // Fast 4G / No throttling
            }
    
            setNetworkStatus({ speed: downlink, status });
        };
    
        updateNetworkStatus();
    
        window.addEventListener("online", updateNetworkStatus);
        window.addEventListener("offline", () =>
            setNetworkStatus({ speed: 0, status: "Không có mạng" })
        );
    
        if (navigator.connection) {
            navigator.connection.addEventListener("change", updateNetworkStatus);
        }
    
        return () => {
            window.removeEventListener("online", updateNetworkStatus);
            window.removeEventListener("offline", () =>
                setNetworkStatus({ speed: 0, status: "Không có mạng" })
            );
    
            if (navigator.connection) {
                navigator.connection.removeEventListener("change", updateNetworkStatus);
            }
        };
    }, []);

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result.split(",")[1];
                resolve(base64String);
            };
            reader.onerror = () => {
                reject(new Error("Chuyển đổi Blob thành Base64 thất bại."));
            };
            reader.readAsDataURL(blob);
        });
    };

    const getAutoAvatar = async (name) => {
        try {
            const res = await generateAvatar(name);
            const base64 = await blobToBase64(res);
            const imgSrc = `data:image/png;base64,${base64}`;
            return imgSrc;
        } catch (error) {
            // console.error(error);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        console.log("submit called");
        e.preventDefault();

        setLoading(true);
        try {
            const response = await usersApi.login(info.email, info.password);
            Cookies.set("isAuthenticated", "true", { expires: 1 });
            let {
                id,
                email,
                first_name,
                last_name,
                access_token,
                avatar,
                plant,
                sap_id,
                role,
                branch,
                permissions,
            } = response;
            if (!avatar) {
                const tempName =
                    first_name?.trim().charAt(0) +
                    (last_name ? last_name.trim().charAt(0) : "");
                avatar = await getAutoAvatar(tempName);
            }
            const savedUserInfo = {
                id,
                email,
                first_name,
                last_name,
                avatar,
                plant,
                sap_id,
                role,
                branch,
                permissions,
            };
            localStorage.setItem("userInfo", JSON.stringify(savedUserInfo));
            const currentUser = {
                ...savedUserInfo,
                access_token,
            };
            setUser(currentUser);
            toast.success("Đăng nhập thành công");
            navigate("/workspace");
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Đã xảy ra lỗi khi đăng nhập."
            );
            console.error("Login failed:", error);
        }
        setLoading(false);
    };

    return isAuthenticated ? (
        <Navigate to="/workspace" replace />
    ) : (
        <section className="h-screen !overflow-y-hidden">
            <div className="relative xl:pt-0 pt-20">
                <div className="absolute top-2 left-0 right-0 px-4 py-2 flex items-center justify-between" style={{ borderColor: networkStatus.status === "Tốt" ? "green" : "red" }}>   
                    <div className={`text-sm flex gap-x-2 font-medium items-center  rounded-full ${networkStatus.status === "Tốt" ? " text-green-700" : networkStatus.status === "Trung bình" ? " text-orange-600" : networkStatus.status === "Kém" ? " text-red-600" : " text-gray-600"}`}>
                        {networkStatus.status === "Tốt" && <GoodNetwork className={"w-4 h-4"} />}
                        {networkStatus.status === "Trung bình" && <MediumNetwork className={"w-4 h-4"} />}
                        {networkStatus.status === "Kém" && <BadNetwork className={"w-4 h-4"} />}
                        {networkStatus.status === "Không có mạng" && <Offline className={"w-4 h-4"} />}
                        <div>Kết nối: {networkStatus.status}</div>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center px-6 mx-auto md:h-screen lg:py-0">
                    <Link
                        to="/"
                        className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
                    >
                        <img className="w-20 h-20 mr-2" src={Logo} alt="logo" />
                    </Link>
                    <div className="w-full bg-white rounded-2xl shadow  md:mt-0 sm:max-w-md xl:p-0 ">
                        <div className="p-5 space-y-3 md:space-y-6 sm:p-8">
                            <div className="space-y-2 pb-4">
                                <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                                    Đăng nhập
                                </h1>
                                <p className=" text-center leading-tight tracking-tight text-gray-500  ">
                                    Vui lòng đăng nhập để sử dụng ứng dụng
                                </p>
                            </div>

                            
                            <form className="space-y-2">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block mb-2 text-sm font-medium text-gray-900"
                                    >
                                        {" "}
                                        Email{" "}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5  "
                                        placeholder="Nhập mã nhân viên hoặc email"
                                        required=""
                                        onChange={(e) =>
                                            setInfo({
                                                ...info,
                                                email: e.target.value.trim(),
                                            })
                                        }
                                    />
                                    {inputError.email ? (
                                        <span className="text-xs text-red-600">
                                            {inputError.email}
                                        </span>
                                    ) : (
                                        <span className="block mt-[8px] h-[14.55px]"></span>
                                    )}
                                </div>
                                <div className="!mt-2">
                                    <label
                                        htmlFor="password"
                                        className="block mb-2 text-sm font-medium text-gray-900 "
                                    >
                                        Mật khẩu
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        placeholder="••••••••"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
                                        required=""
                                        onChange={(e) =>
                                            setInfo({
                                                ...info,
                                                password: e.target.value.trim(),
                                            })
                                        }
                                    />
                                    {inputError.password ? (
                                        <span className="text-xs text-red-600">
                                            {inputError.password}
                                        </span>
                                    ) : (
                                        <span className="block mt-[8px] h-[14.55px]"></span>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    className="w-full text-white bg-[#17506B] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg px-5 py-2.5 text-center "
                                >
                                    Xác nhận
                                </button>
                                <p className="text-center text-md font-medium text-gray-500 ">
                                    {status}
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {loading && <Loader />}
        </section>
    );
}

export default Login;
