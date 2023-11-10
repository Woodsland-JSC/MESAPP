import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { MdDeleteOutline } from "react-icons/md";
import Select from "react-select";
import Layout from "../../layouts/layout";
import DefaultAvatar from "../../assets/images/Default-Avatar.png";
import generateAvatar from "../../utils/generateAvatar";

const genderOptions = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
];

const authorizationOptions = [
    { value: "admmin", label: "Admin" },
    { value: "client", label: "Client" },
];

const validationSchema = Yup.object().shape({
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
    password: Yup.string()
        .required("Mật khẩu là bắt buộc")
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
    authorization: Yup.string().required("Phân quyền là bắt buộc"),
    sapId: Yup.string().required("SAP ID là bắt buộc"),
    integrationId: Yup.string().required("Integration ID là bắt buộc"),
    factory: Yup.string().required("Nhà máy là bắt buộc"),
    branch: Yup.string().required("Chi nhánh là bắt buộc"),
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

function CreateUser() {
    
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
        gender: "0",
        password: "",
        authorization: "",
        sapId: "",
        integrationId: "",
        factory: "",
        branch: "",
    });

    const handleChangeAvatar = (event) => {
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

    const handleDeleteAvatar = () => {
        setAvatar({
            ...avatar,
            file: null,
            imgSrc: null,
        });
    };

    const handleFormSubmit = async (e) => {
        toast.info("Chưa phát triển submit form");
        console.log("Submit form nè: ", input);
    };

    useEffect(() => {
        const getAutoAvatar = async (name) => {
            try {
                const res = await generateAvatar(name);
                const base64 = await blobToBase64(res);
                const imgSrc = `data:image/png;base64,${base64}`;
                setAvatar({ ...avatar, imgSrc: null, autoImg: imgSrc });
            } catch (error) {
                console.error(error);
            }
        };

        if (input.lastName && input.firstName && !avatar.file) {
            const tempName =
                input.lastName.trim().charAt(0) +
                input.firstName.trim().charAt(0);
            getAutoAvatar(tempName);
        }
    }, [input]);

    useEffect(() => {});

    return (
        <Layout>
            <div className="flex justify-center bg-[#F8F9F7] h-screen ">
                {/* Section */}
                <div className="w-screen md:py-12 p-4 md:px-12 lg:px-40 border-t border-gray-200">
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
                                            <div>Tạo mới</div>
                                        </span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="text-3xl font-bold mb-12">Tạo mới</div>
                    {/* Main content */}
                    <Formik
                        initialValues={input}
                        validationSchema={validationSchema}
                        onSubmit={handleFormSubmit}
                    >
                        {({ errors, touched, values }) => {
                            setInput(values);

                            return (
                                <Form className="flex flex-col p-6 bg-white border-2 border-gray-200 rounded-xl">
                                    <h1 className="mb-4 text-xl text-center md:text-left">
                                        Thông tin cơ bản
                                    </h1>
                                    <section className="flex flex-col-reverse md:flex-row md:gap-4">
                                        <div className="md:w-2/3 mb-6">
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
                                                        className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
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
                                                        className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
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
                                                        className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
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
                                                <div className="w-full">
                                                    <label
                                                        htmlFor="password"
                                                        className="block mb-2 text-md font-medium text-gray-900"
                                                    >
                                                        Mật khẩu{" "}
                                                        <span className="text-red-600">
                                                            *
                                                        </span>
                                                    </label>
                                                    <Field
                                                        name="password"
                                                        type="password"
                                                        className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                    />
                                                    {errors.password &&
                                                    touched.password ? (
                                                        <span className="text-xs text-red-600">
                                                            <ErrorMessage name="password" />
                                                        </span>
                                                    ) : (
                                                        <span className="block mt-[8px] h-[14.55px]"></span>
                                                    )}
                                                </div>
                                                <div className="w-full">
                                                    <label
                                                        htmlFor="authorization"
                                                        className="block mb-2 text-md font-medium text-gray-900"
                                                    >
                                                        Phân quyền{" "}
                                                        <span className="text-red-600">
                                                            *
                                                        </span>
                                                    </label>
                                                    <SelectField
                                                        name="authorization"
                                                        options={
                                                            authorizationOptions
                                                        }
                                                    />
                                                    {errors.authorization &&
                                                    touched.authorization ? (
                                                        <span className="text-xs text-red-600">
                                                            <ErrorMessage name="authorization" />
                                                        </span>
                                                    ) : (
                                                        <span className="block mt-[8px] h-[14.55px]"></span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center items-center md:w-1/3 mb-6">
                                            <span className="mb-3">
                                                Ảnh đại diện
                                            </span>
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
                                                className="w-1/2 aspect-square mb-4 rounded-full object-cover"
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
                                    <div className="my-4 border-b border-gray-200"></div>
                                    <h1 className="mb-4 text-xl text-center md:text-left">
                                        Đồng bộ và tích hợp
                                    </h1>
                                    <div className="flex flex-col md:grid md:grid-cols-2 gap-y-2 gap-x-4 w-full justify-between items-center">
                                        <div className="w-full">
                                            <label
                                                htmlFor="sap-id"
                                                className="block mb-2 text-md font-medium text-gray-900"
                                            >
                                                SAP ID{" "}
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </label>
                                            <Field
                                                name="sapId"
                                                className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                            />
                                            {errors.sapId && touched.sapId ? (
                                                <span className="text-xs text-red-600">
                                                    <ErrorMessage name="sapId" />
                                                </span>
                                            ) : (
                                                <span className="block mt-[8px] h-[14.55px]"></span>
                                            )}
                                        </div>
                                        <div className="w-full">
                                            <label
                                                htmlFor="integration-id"
                                                className="block mb-2 text-md font-medium text-gray-900"
                                            >
                                                INTEGRATION ID{" "}
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </label>
                                            <Field
                                                name="integrationId"
                                                className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                            />
                                            {errors.integrationId &&
                                            touched.integrationId ? (
                                                <span className="text-xs text-red-600">
                                                    <ErrorMessage name="integrationId" />
                                                </span>
                                            ) : (
                                                <span className="block mt-[8px] h-[14.55px]"></span>
                                            )}
                                        </div>
                                        <div className="w-full">
                                            <label
                                                htmlFor="factory"
                                                className="block mb-2 text-md font-medium text-gray-900"
                                            >
                                                Nhà máy{" "}
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </label>
                                            <Field
                                                name="factory"
                                                className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                            />
                                            {errors.factory &&
                                            touched.factory ? (
                                                <span className="text-xs text-red-600">
                                                    <ErrorMessage name="factory" />
                                                </span>
                                            ) : (
                                                <span className="block mt-[8px] h-[14.55px]"></span>
                                            )}
                                        </div>
                                        <div className="w-full">
                                            <label
                                                htmlFor="branch"
                                                className="block mb-2 text-md font-medium text-gray-900"
                                            >
                                                Chi nhánh{" "}
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </label>
                                            <Field
                                                name="branch"
                                                className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                            />
                                            {errors.branch && touched.branch ? (
                                                <span className="text-xs text-red-600">
                                                    <ErrorMessage name="branch" />
                                                </span>
                                            ) : (
                                                <span className="block mt-[8px] h-[14.55px]"></span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="mt-5 self-end flex items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center gap-x-2"
                                    >
                                        Lưu lại
                                    </button>
                                </Form>
                            );
                        }}
                    </Formik>
                </div>
            </div>
        </Layout>
    );
}

export default CreateUser;
