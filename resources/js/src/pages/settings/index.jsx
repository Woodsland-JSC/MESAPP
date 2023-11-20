import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { MdDeleteOutline } from "react-icons/md";
import Select from "react-select";
import toast from "react-hot-toast";
import Layout from "../../layouts/layout";
import Loader from "../../components/Loader";
import TinyLoader from "../../components/TinyLoader";
import generateAvatar from "../../utils/generateAvatar";
import usersApi from "../../api/userApi";
import useAppContext from "../../store/AppContext";
import DefaultAvatar from "../../assets/images/Default-Avatar.png";
import PasswordIllustration from "../../assets/images/password-illustration.png";

const genderOptions = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
];

const authorizationOptions = [
    { value: "admin", label: "Admin" },
    { value: "client", label: "Client" },
];

const inputValidationSchema = Yup.object().shape({
    lastName: Yup.string()
        .matches(/^[\p{L} ]+$/u, "Chỉ cho phép chữ cái và khoảng trắng")
        .max(30, "Họ không được quá 30 kí tự")
        .required("Họ là bắt buộc"),
    firstName: Yup.string()
        .matches(/^[\p{L} ]+$/u, "Chỉ cho phép chữ cái và khoảng trắng")
        .max(30, "Tên không được quá 30 kí tự")
        .required("Tên là bắt buộc"),
    email: Yup.string()
        .email("Email không hợp lệ")
        .required("Email là bắt buộc"),
    gender: Yup.string()
        .oneOf(["male", "female"], "Giá trị không hợp lệ")
        .required("Giới tính là bắt buộc"),
});

const passwordValidationSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Mật khẩu cũ là bắt buộc"),
    newPassword: Yup.string()
        .required("Mật khẩu mới là bắt buộc")
        .test("uppercase", "Mật khẩu cần có ít nhất 1 kí tự in hoa", (value) =>
            /[A-Z]/.test(value)
        )
        .test(
            "lowercase",
            "Mật khẩu cần có ít nhất 1 kí tự viết thường",
            (value) => /[a-z]/.test(value)
        )
        .test("digit", "Mật khẩu cần có ít nhất 1 chữ số", (value) =>
            /\d/.test(value)
        )
        .test(
            "specialChar",
            "Mật khẩu cần có ít nhất 1 kí tự đặc biệt",
            (value) => /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(value)
        )
        .test(
            "length",
            "Mật khẩu phải có từ 8 - 15 ký tự",
            (value) => value && value.length >= 8 && value.length <= 15
        ),
    reNewPassword: Yup.string()
        .required("Vui lòng nhập mật khẩu mới")
        .oneOf([Yup.ref("newPassword"), null], "Mật khẩu không khớp"),
});

const SelectField = ({ options, ...props }) => {
    const [selectedOption, setSelectedOption] = useState();
    const { setFieldValue } = useFormikContext();

    const handleChange = (option) => {
        setSelectedOption(option);
        setFieldValue(props.name, option.value);
    };

    return (
        <Select
            {...props}
            options={options}
            value={selectedOption}
            onChange={handleChange}
        />
    );
};

function Settings() {
    const [formKey, setFormKey] = useState(0);

    const { loading, setLoading } = useAppContext();

    const [avatarLoading, setAvatarLoading] = useState(false);

    const [avatar, setAvatar] = useState({
        file: null,
        imgSrc: DefaultAvatar,
        autoImg: null,
    });

    const [selectedFile, setSelectedFile] = useState(null);

    const [input, setInput] = useState({
        firstName: "",
        lastName: "",
        email: "",
        gender: "male",
    });

    const [passwordInput, setPasswordInput] = useState({
        oldPassword: "",
        newPassword: "",
        reNewPassword: "",
    });

    const handleChangeAvatar = (event) => {
        setAvatarLoading(true);
        const file = event.target.files[0];
        setSelectedFile(file);
        const reader = new FileReader();

        reader.onload = (event) => {
            const imgSrc = event.target.result;
            setAvatar({
                ...avatar,
                file: file,
                imgSrc: imgSrc,
            });
        };

        reader.readAsDataURL(file);
        setAvatarLoading(false);
    };

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

    const handleDeleteAvatar = async () => {
        setAvatar({
            ...avatar,
            file: null,
            imgSrc: null,
        });

        if (!avatar.autoImg) {
            if (input.lastName && input.firstName) {
                setAvatarLoading(true);
                const tempName =
                    input.lastName.trim().charAt(0) +
                    input.firstName.trim().charAt(0);
                const base64 = await getAutoAvatar(tempName);
                setAvatar({
                    autoImg: base64,
                    file: null,
                    imgSrc: null,
                });
                setAvatarLoading(false);
            }
        } else {
            setAvatar({
                autoImg: avatar.autoImg,
                file: null,
                imgSrc: null,
            });
        }
    };

    useEffect(() => {
        console.log("Avatar có sự thay đổi: ", avatar);
    }, [avatar]);

    const handleChangeInfo = async (values) => {
        toast("Chưa phát triển change info", {
            icon: ` ℹ️`,
        });
        console.log("Submit info nè: ", values);
    };

    const handleChangePassword = async (values) => {
        toast("Chưa phát triển change password", {
            icon: ` ℹ️`,
        });
        console.log("Submit password nè: ", values);
    };

    const getAutoAvatar = async (name) => {
        // setAvatarLoading(true);
        try {
            const res = await generateAvatar(name);
            const base64 = await blobToBase64(res);
            const imgSrc = `data:image/png;base64,${base64}`;
            // setAvatar({ ...avatar, imgSrc: null, autoImg: imgSrc });
            return imgSrc;
        } catch (error) {
            console.error(error);
            return null;
        }
        // setAvatarLoading(false);
    };

    useEffect(() => {
        console.log("User gì ta: ", input.lastName + " " + input.firstName);
        console.log(avatar.file);
        if (input.lastName && input.firstName && !avatar.file) {
            setAvatarLoading(true);

            const tempName =
                input.lastName.trim().charAt(0) +
                input.firstName.trim().charAt(0);
            getAutoAvatar(tempName);
        }

        if (!input.lastName && !input.firstName) {
            console.log("Không có tên và họ");
            setAvatar({ ...avatar, autoImg: DefaultAvatar });
        }
    }, [input]);

    useEffect(() => {
        console.log("Ban đầu");
        const getCurrentUser = async () => {
            try {
                setLoading(true);
                const res = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        const userData = {
                            firstName: "Nguyên",
                            lastName: "Nguyễn Thanh",
                            email: "ntnguyen0310@gmail.com",
                            gender: "male",
                            avatar: "https://hinhnen4k.com/wp-content/uploads/2022/12/avatar-doremon-9.jpg",
                        };
                        resolve(userData);
                    }, 1500);
                });

                const userData = await res;
                const clonedData = (({ avatar, ...rest }) => rest)(userData);
                setInput(clonedData);

                if (userData.avatar) {
                    setAvatar({
                        ...avatar,
                        file: userData.avatar,
                        imgSrc: userData.avatar,
                    });
                }
                setFormKey((prevKey) => prevKey + 1);
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        };

        getCurrentUser();
    }, []);

    return (
        <Layout>
            <div className="flex justify-center bg-[#F8F9F7] h-screen ">
                {/* Section */}
                <div className="w-screen xl:py-12  p-6 px-5 xl:p-12 xl:px-32 ">
                    {/* Breadcrumb */}
                    <div className="mb-4">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center">
                                        <Link
                                            to="/settings"
                                            className="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            Cài đặt
                                        </Link>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="text-3xl font-bold mb-6">Cài đặt</div>
                    {/* Main content */}
                    <Formik
                        key={formKey}
                        initialValues={input}
                        enableReinitialize
                        validationSchema={inputValidationSchema}
                        onSubmit={(values) => {
                            handleChangeInfo(values);
                        }}
                        onValuesChange={(newValues) => {
                            console.log("Hello An");
                        }}
                    >
                        {({ errors, touched, values, setFieldValue }) => {
                            return (
                                <Form className="flex flex-col p-6 bg-white border-2 border-gray-200 rounded-xl">
                                    <h1 className="mb-4 text-xl text-center font-semibold md:text-left">
                                        Thông tin cơ bản
                                    </h1>

                                    <section className="flex flex-col-reverse md:flex-row-reverse md:gap-4 mt-4 mb-0 sm:my-4">
                                        <div className="md:w-2/3 my-2 sm:mb-4">
                                            <div className="flex flex-col md:grid md:grid-cols-2 gap-y-2 gap-x-4">
                                                <div className="w-full">
                                                    <label
                                                        htmlFor="last_name"
                                                        className="block mb-2 text-md font-medium text-gray-900"
                                                    >
                                                        Họ{" "}
                                                        <span className="text-red-600">
                                                            *
                                                        </span>
                                                    </label>
                                                    <Field
                                                        name="lastName"
                                                        className="border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                        value={values.lastName}
                                                        onChange={(e) => {
                                                            setFieldValue(
                                                                "lastName",
                                                                e.target.value
                                                            );
                                                            setInput(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    lastName:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            );
                                                        }}
                                                    />
                                                    {errors.lastName &&
                                                    touched.lastName ? (
                                                        <span className="text-xs text-red-600">
                                                            <ErrorMessage name="lastName" />
                                                        </span>
                                                    ) : (
                                                        <span className="block mt-[8px] h-[14.55px]"></span>
                                                    )}
                                                </div>
                                                <div className="w-full">
                                                    <label
                                                        htmlFor="first_name"
                                                        className="block mb-2 text-md font-medium text-gray-900"
                                                    >
                                                        Tên{" "}
                                                        <span className="text-red-600">
                                                            *
                                                        </span>
                                                    </label>
                                                    <Field
                                                        name="firstName"
                                                        className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                    />
                                                    {errors.firstName &&
                                                    touched.firstName ? (
                                                        <span className="text-xs text-red-600">
                                                            <ErrorMessage name="firstName" />
                                                        </span>
                                                    ) : (
                                                        <span className="block mt-[8px] h-[14.55px]"></span>
                                                    )}
                                                </div>
                                                <div className="w-full">
                                                    <label
                                                        htmlFor="email"
                                                        className="block mb-2 text-md font-medium text-gray-900"
                                                    >
                                                        Email{" "}
                                                        <span className="text-red-600">
                                                            *
                                                        </span>
                                                    </label>
                                                    <Field
                                                        name="email"
                                                        type="email"
                                                        className="border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                    />
                                                    {errors.email &&
                                                    touched.email ? (
                                                        <span className="text-xs text-red-600">
                                                            <ErrorMessage name="email" />
                                                        </span>
                                                    ) : (
                                                        <span className="block mt-[8px] h-[14.55px]"></span>
                                                    )}
                                                </div>
                                                <div className="w-full">
                                                    <label
                                                        htmlFor="gender"
                                                        className="block mb-2 text-md font-medium text-gray-900"
                                                    >
                                                        Giới tính{" "}
                                                        <span className="text-red-600">
                                                            *
                                                        </span>
                                                    </label>
                                                    <SelectField
                                                        name="gender"
                                                        options={genderOptions}
                                                        defaultValue={
                                                            genderOptions.find(
                                                                (item) =>
                                                                    item.value ==
                                                                    values.gender
                                                            ) ||
                                                            genderOptions[0]
                                                        }
                                                    />
                                                    {errors.gender &&
                                                    touched.gender ? (
                                                        <span className="text-xs text-red-600">
                                                            <ErrorMessage name="gender" />
                                                        </span>
                                                    ) : (
                                                        <span className="block mt-[8px] h-[14.55px]"></span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center items-center md:w-5/12 lg:w-1/3 mb-6">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                name="Avatar"
                                                id="avatar"
                                                onChange={handleChangeAvatar}
                                                className="hidden"
                                            />
                                            <img
                                                id="avatar-display"
                                                src={
                                                    avatar.imgSrc ||
                                                    avatar.autoImg
                                                }
                                                className="xl:w-1/2 w-2/5 aspect-square mb-4 rounded-full object-cover"
                                                alt="Default-Avatar"
                                            />

                                            <div className="flex gap-2 justify-center">
                                                <span
                                                    type="button"
                                                    className="text-white cursor-pointer bg-gray-800 hover:bg-ray-500 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
                                                >
                                                    <label
                                                        htmlFor="avatar"
                                                        className="w-full cursor-pointer"
                                                    >
                                                        Cập nhật ảnh đại diện
                                                    </label>
                                                </span>
                                                {avatar.imgSrc &&
                                                avatar.imgSrc !=
                                                    DefaultAvatar ? (
                                                    <span
                                                        className="flex justify-center items-center cursor-pointer border rounded-lg border-red-600 px-3 group transition-all duration-150 ease-in hover:bg-red-500"
                                                        onClick={
                                                            handleDeleteAvatar
                                                        }
                                                    >
                                                        <MdDeleteOutline className="text-red-600 text-xl group-hover:text-white" />
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </section>

                                    <button
                                        type="submit"
                                        className="mt-0 self-end flex items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center gap-x-2"
                                    >
                                        Lưu lại
                                    </button>
                                </Form>
                            );
                        }}
                    </Formik>

                    <Formik
                        key="password-form"
                        initialValues={passwordInput}
                        validationSchema={passwordValidationSchema}
                        onSubmit={(values) => {
                            handleChangePassword(values);
                        }}
                    >
                        {({ errors, touched, values, setFieldValue }) => {
                            return (
                                <div className="pb-9">
                                    <Form className="flex flex-col mt-8 p-6 bg-white border-2 border-gray-200 rounded-xl">
                                        <h1 className="mb-0 text-xl font-semibold text-center md:text-left">
                                            Thay đổi mật khẩu
                                        </h1>
                                        <section className="flex flex-col-reverse  md:flex-row md:items-center md:gap-4 mt-4 mb-0 sm:my-4">
                                            <div className="md:w-2/5 my-2 sm:mb-6">
                                                <div className="flex flex-col gap-x-4">
                                                    <div className="w-full">
                                                        <label
                                                            htmlFor="oldPassword"
                                                            className="block mb-2 text-md font-medium text-gray-900"
                                                        >
                                                            Mật khẩu cũ{" "}
                                                            <span className="text-red-600">
                                                                *
                                                            </span>
                                                        </label>
                                                        <Field
                                                            name="oldPassword"
                                                            type="password"
                                                            className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                        />
                                                        {errors.oldPassword &&
                                                        touched.oldPassword ? (
                                                            <span className="text-xs text-red-600">
                                                                <ErrorMessage name="oldPassword" />
                                                            </span>
                                                        ) : (
                                                            <span className="block mt-[8px] h-[14.55px]"></span>
                                                        )}
                                                    </div>
                                                    <div className="w-full">
                                                        <label
                                                            htmlFor="newPassword"
                                                            className="block mb-2 text-md font-medium text-gray-900"
                                                        >
                                                            Mật khẩu mới{" "}
                                                            <span className="text-red-600">
                                                                *
                                                            </span>
                                                        </label>
                                                        <Field
                                                            name="newPassword"
                                                            type="password"
                                                            className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                        />
                                                        {errors.newPassword &&
                                                        touched.newPassword ? (
                                                            <span className="text-xs text-red-600">
                                                                <ErrorMessage name="newPassword" />
                                                            </span>
                                                        ) : (
                                                            <span className="block mt-[8px] h-[14.55px]"></span>
                                                        )}
                                                    </div>
                                                    <div className="w-full">
                                                        <label
                                                            htmlFor="reNewPassword"
                                                            className="block mb-2 text-md font-medium text-gray-900"
                                                        >
                                                            Nhập lại mật khẩu
                                                            mới{" "}
                                                            <span className="text-red-600">
                                                                *
                                                            </span>
                                                        </label>
                                                        <Field
                                                            name="reNewPassword"
                                                            type="password"
                                                            className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                        />
                                                        {errors.reNewPassword &&
                                                        touched.reNewPassword ? (
                                                            <span className="text-xs text-red-600">
                                                                <ErrorMessage name="reNewPassword" />
                                                            </span>
                                                        ) : (
                                                            <span className="block mt-[8px] h-[14.55px]"></span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-center items-center self-center place-items-center md:w-3/5">
                                                <img
                                                    id="password-display"
                                                    src={PasswordIllustration}
                                                    className="object-cover w-2/5 sm:w-1/2"
                                                    alt="Change-Password"
                                                />
                                            </div>
                                        </section>

                                        <button
                                            type="submit"
                                            className=" self-end flex items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center gap-x-2"
                                        >
                                            Xác nhận
                                        </button>
                                    </Form>
                                </div>
                            );
                        }}
                    </Formik>
                </div>
            </div>
            {loading && <Loader />}
        </Layout>
    );
}

export default Settings;
