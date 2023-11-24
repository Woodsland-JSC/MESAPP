import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import useAppContext from "../../store/AppContext";
import usersApi from "../../api/userApi";
import Loader from "../../components/Loader";
import Logo from "../../assets/images/woodsland-logo.svg";
import generateAvatar from "../../utils/generateAvatar";

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
                branch,
                permissions,
            } = response;
            if (!avatar) {
                const tempName =
                    first_name.trim().charAt(0) + last_name.trim().charAt(0);
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
            navigate("/");
        } catch (error) {
            toast.error("Đăng nhập thất bại");
            // console.error("Login failed:", error);
        }
        setLoading(false);
    };

    return isAuthenticated ? (
        <Navigate to="/" replace />
    ) : (
        <section className="h-screen bg-gray-50 dark:bg-gray-900">
            <div className="xl:pt-0 pt-20">
                <div className="flex flex-col items-center justify-center px-6 py-4 md:pt-10 mx-auto md:h-screen lg:py-0">
                    <Link
                        to="/"
                        className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
                    >
                        <img className="w-20 h-20 mr-2" src={Logo} alt="logo" />
                    </Link>
                    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                                Đăng nhập
                            </h1>
                            <form className="space-y-4 md:space-y-6" action="#">
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        {" "}
                                        Email{" "}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="name@company.com"
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
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                    >
                                        Mật khẩu
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        placeholder="••••••••"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                                <div className="flex items-center justify-between !mt-2">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="remember"
                                                aria-describedby="remember"
                                                type="checkbox"
                                                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                                                disabled
                                                onClick={() =>
                                                    toast(
                                                        "Chưa phát triển chức năng."
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label
                                                htmlFor="remember"
                                                className="text-gray-500 dark:text-gray-300"
                                            >
                                                Ghi nhớ đăng nhập
                                            </label>
                                        </div>
                                    </div>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-medium text-primary-600 hover:underline dark:text-[#2A779C]"
                                    >
                                        Quên mật khẩu
                                    </Link>
                                </div>
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    className="w-full text-white bg-[#17506B] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-[] dark:hover:bg-primary-700 dark:focus:ring-blue-200"
                                >
                                    Đăng nhập
                                </button>
                                <p className="text-center text-md font-medium text-gray-500 dark:text-gray-300">
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
