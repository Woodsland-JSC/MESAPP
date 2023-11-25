import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { MdDeleteOutline } from "react-icons/md";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import toast from "react-hot-toast";
import { Spinner } from "@chakra-ui/react";
import Layout from "../../layouts/layout";
import Loader from "../../components/Loader";
import TinyLoader from "../../components/TinyLoader";
import generateAvatar from "../../utils/generateAvatar";
import usersApi from "../../api/userApi";
import useAppContext from "../../store/AppContext";
import DefaultAvatar from "../../assets/images/Default-Avatar.png";
import PasswordIllustration from "../../assets/images/password-illustration.png";
import { areObjectsEqual } from "../../utils/objectFunctions";

const genderOptions = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
];

// const authorizationOptions = [
//     { value: "admin", label: "Admin" },
//     { value: "client", label: "Client" },
// ];

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

const SelectField = ({ options, name, setInput, ...props }) => {
    const [selectedOption, setSelectedOption] = useState();
    const { setFieldValue } = useFormikContext();

    const handleChange = (option) => {
        setSelectedOption(option);
        setFieldValue(props.name, option.value);
        setInput((prev) => ({
            ...prev,
            [name]: option?.value || "",
        }));
    };

    return (
        <Select
            {...props}
            options={options}
            value={selectedOption}
            onChange={handleChange}
            placeholder="Lựa chọn"
        />
    );
};

function Profile() {
    const fileInputRef = useRef(null);
    let oldPasswordRef = useRef(null);
    let newPasswordRef = useRef(null);
    let reNewPasswordRef = useRef(null);

    const [formKey, setFormKey] = useState(0);

    const { user, setUser } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [avatarLoading, setAvatarLoading] = useState(false);

    const [avatar, setAvatar] = useState({
        file: null,
        imgSrc: DefaultAvatar,
        autoImg: null,
    });

    const [branches, setBranches] = useState([]);
    const [factories, setFactories] = useState([]);

    const [selectedFile, setSelectedFile] = useState(null);

    const [input, setInput] = useState({
        firstName: "",
        lastName: "",
        email: "",
        gender: "male",
        factory: "",
        branch: "",
    });

    const [originalInfo, setOriginalInfo] = useState(null);

    const [changing, setChanging] = useState(false);
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

    const handleChangeInfo = async (values) => {
        const updatedValues = {
            firstName: values.firstName,
            lastName: values.lastName,
            gender: values.gender,
        };

        const previousValues = {
            firstName: originalInfo.firstName,
            lastName: originalInfo.lastName,
            gender: originalInfo.gender,
        };

        const previousAvatar = originalInfo.avatar;

        const isChanged = areObjectsEqual(updatedValues, previousValues);

        setSaving(true);

        if (!isChanged || previousAvatar != avatar.file) {
            if (selectedFile) {
                if (selectedFile instanceof File) {
                    updatedValues.avatar = selectedFile;
                }
            } else if (
                avatar.file == previousAvatar ||
                avatar.imgSrc == previousAvatar
            ) {
                updatedValues.avatar = "";
            } else {
                updatedValues.avatar = -1;
            }
        } else {
            toast("Thông tin chưa thay đổi.");
            setSaving(false);
            return;
        }

        const userResponse = await usersApi.updateProfile(
            user.id,
            updatedValues
        );

        toast.success("Thông tin đã được cập nhật.");

        setUser((prev) => ({
            ...prev,
            first_name: values.firstName,
            last_name: values.lastName,
            gender: values.gender,
            avatar: userResponse?.user?.avatar,
        }));

        setSelectedFile(null);

        setOriginalInfo((prev) => ({
            ...prev,
            firstName: values.firstName,
            lastName: values.lastName,
            gender: values.gender,
            avatar: userResponse?.user?.avatar,
        }));

        setSaving(false);

        const currentUser = JSON.parse(localStorage.getItem("userInfo"));

        currentUser.last_name = values.firstName;
        currentUser.first_name= values.firstName;
        currentUser.last_name= values.lastName;
        currentUser.gender= values.gender;
        currentUser.avatar= userResponse?.user?.avatar;

        localStorage.setItem("userInfo", JSON.stringify(currentUser));
        // console.log(currentUser);
    };

    const handleChangePassword = async (values, resetForm) => {
        setChanging(true);

        try {
            const res = await usersApi.changePassword(user.id, values);
            toast.success("Thay đổi mật khẩu thành công");
        } catch (error) {
            toast.error(error.response?.data?.error);
            return;
        }

        setPasswordInput({
            oldPassword: "",
            newPassword: "",
            reNewPassword: "",
        });

        setChanging(false);

        resetForm({
            values: {
                oldPassword: "",
                newPassword: "",
                reNewPassword: "",
            },
        });
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
        setAvatarLoading(true);
        if (input.lastName && input.firstName && !avatar.file) {
            const tempName =
                input.lastName.trim().charAt(0) +
                input.firstName.trim().charAt(0);
            getAutoAvatar(tempName);
        }

        if (!input.lastName && !input.firstName) {
            // console.log("Không có tên và họ");
            setAvatar({ ...avatar, autoImg: DefaultAvatar });
        }

        setAvatarLoading(false);
    }, [input]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const userResponse = await usersApi.getUserDetails(user.id);
                const userRes = userResponse.user;
                const userRoles = userResponse.UserRole;

                const userData = {
                    firstName: userRes.first_name,
                    lastName: userRes.last_name,
                    email: userRes.email,
                    gender: userRes.gender,
                    avatar: userRes.avatar,
                    branch: userRes.branch,
                    factory: userRes.plant,
                };

                setOriginalInfo(userData);

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

                const branchesResponse = await usersApi.getAllBranches();
                const branchOptions = branchesResponse.map((item) => ({
                    value: item.BPLId,
                    label: item.BPLName,
                }));

                setBranches(branchOptions);

                if (userData.branch) {
                    const factoriesResponse =
                        await usersApi.getFactoriesByBranchId(userData.branch);
                    const factoryOptions = factoriesResponse.map((item) => ({
                        value: item.Code,
                        label: item.Name,
                    }));
                    const selectedFactory = factoryOptions.filter(
                        (item) => item.value == userData.factory
                    );
                    const selectedBranch = branchOptions.filter(
                        (item) => item.value == userData.branch
                    );
                    setInput((prev) => ({
                        ...prev,
                        branch: selectedBranch,
                        factory: selectedFactory,
                    }));
                    setFactories(factoryOptions);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        document.title = "Woodsland - Thông tin cá nhân";

        return () => {
            document.title = "Woodsland";
            document.body.classList.remove("body-no-scroll");
        };
    }, [user.id]);

    useEffect(() => {
        if (loading) {
            document.body.classList.add("body-no-scroll");
        } else {
            document.body.classList.remove("body-no-scroll");
        }
    }, [loading]);

    return (
        <Layout>
            <div className="flex justify-center bg-[#F8F9F7] h-screen ">
                {/* Section */}
                <div className="w-screen xl:py-12  p-6 px-5 xl:p-12 xl:px-32 ">
                    {/* Breadcrumb */}
                    {/* <div className="mb-4">
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
                    </div> */}

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
                        // onValuesChange={(newValues) => {
                        //     // console.log("Hello An");
                        // }}
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
                                                        disabled={saving}
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
                                                        disabled={saving}
                                                        name="firstName"
                                                        className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                        onChange={(e) => {
                                                            setFieldValue(
                                                                "firstName",
                                                                e.target.value
                                                            );
                                                            setInput(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    firstName:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            );
                                                        }}
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
                                                        Email
                                                    </label>
                                                    <Field
                                                        disabled={true}
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
                                                        setInput={setInput}
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
                                                    <label className="block mb-2 text-md font-medium text-gray-900">
                                                        Chi nhánh{" "}
                                                    </label>
                                                    <Select
                                                        isDisabled={true}
                                                        options={values.branch}
                                                        value={values.branch[0]}
                                                        placeholder=""
                                                    />
                                                    <span className="block mt-[8px] h-[14.55px]"></span>
                                                </div>
                                                <div className="w-full">
                                                    <label className="block mb-2 text-md font-medium text-gray-900">
                                                        Nhà máy{" "}
                                                    </label>
                                                    <Select
                                                        isDisabled={true}
                                                        options={values.factory}
                                                        value={
                                                            values.factory[0]
                                                        }
                                                        placeholder=""
                                                    />
                                                    <span className="block mt-[8px] h-[14.55px]"></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center items-center md:w-5/12 lg:w-1/3 mb-6">
                                            <span className="mb-4">
                                                Ảnh đại diện
                                            </span>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                name="Avatar"
                                                id="avatar"
                                                onChange={handleChangeAvatar}
                                                className="hidden"
                                            />
                                            <figure className="w-1/2 relative aspect-square mb-4 rounded-full object-cover border-2 border-solid border-indigo-200 p-1">
                                                <img
                                                    id="avatar-display"
                                                    src={
                                                        avatar.imgSrc ||
                                                        avatar.autoImg
                                                    }
                                                    className="w-full aspect-square rounded-full object-cover self-center"
                                                    alt="Default-Avatar"
                                                />
                                                {avatarLoading && (
                                                    <>
                                                        <div className="absolute aspect-square rounded-full top-0 left-0 w-full h-full bg-black opacity-40"></div>
                                                        <TinyLoader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                    </>
                                                )}
                                            </figure>
                                            {/* <input
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
                                            /> */}

                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    disabled={saving}
                                                    onClick={() =>
                                                        fileInputRef.current.click()
                                                    }
                                                    type="button"
                                                    className={`text-white ${
                                                        saving
                                                            ? "cursor-not-allowed"
                                                            : "cursor-pointer"
                                                    }  bg-gray-800 hover:bg-ray-500 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center`}
                                                >
                                                    <label className="w-full cursor-pointer">
                                                        Cập nhật ảnh đại diện
                                                    </label>
                                                </button>
                                                {avatar.imgSrc &&
                                                avatar.imgSrc !=
                                                    DefaultAvatar ? (
                                                    <button
                                                        disabled={saving}
                                                        className={`flex justify-center items-center ${
                                                            !saving
                                                                ? "cursor-pointer hover:bg-red-500"
                                                                : "cursor-not-allowed"
                                                        } border rounded-lg border-red-600 px-3 group transition-all duration-150 ease-in`}
                                                        onClick={
                                                            handleDeleteAvatar
                                                        }
                                                    >
                                                        <MdDeleteOutline
                                                            className={`text-red-600 text-xl ${
                                                                !saving &&
                                                                "group-hover:text-white"
                                                            }`}
                                                        />
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    </section>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={`mt-0 self-end flex ${
                                            !saving
                                                ? "cursor-pointer"
                                                : "cursor-not-allowed"
                                        } items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center gap-x-2`}
                                    >
                                        {saving ? (
                                            <div className="flex items-center space-x-4">
                                                <Spinner
                                                    size="sm"
                                                    color="white"
                                                />
                                                <div>Đang lưu...</div>
                                            </div>
                                        ) : (
                                            "Lưu lại"
                                        )}
                                    </button>
                                </Form>
                            );
                        }}
                    </Formik>

                    <Formik
                        key="password-form"
                        initialValues={passwordInput}
                        validationSchema={passwordValidationSchema}
                        onSubmit={(values, { resetForm }) => {
                            handleChangePassword(values, resetForm);
                        }}
                    >
                        {({
                            errors,
                            touched,
                            values,
                            setFieldValue,
                            resetForm,
                        }) => {
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
                                                            // ref={oldPasswordRef}
                                                            disabled={changing}
                                                            name="oldPassword"
                                                            type="password"
                                                            className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "oldPassword",
                                                                    e.target
                                                                        .value
                                                                );
                                                                setPasswordInput(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        oldPassword:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                );
                                                            }}
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
                                                            // ref={newPasswordRef}
                                                            disabled={changing}
                                                            name="newPassword"
                                                            type="password"
                                                            className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "newPassword",
                                                                    e.target
                                                                        .value
                                                                );
                                                                setPasswordInput(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        newPassword:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                );
                                                            }}
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
                                                            // ref={reNewPasswordRef}
                                                            disabled={changing}
                                                            name="reNewPassword"
                                                            type="password"
                                                            className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "reNewPassword",
                                                                    e.target
                                                                        .value
                                                                );
                                                                setPasswordInput(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        reNewPassword:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                );
                                                            }}
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
                                            disabled={changing}
                                            type="submit"
                                            className=" self-end flex items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center gap-x-2"
                                        >
                                            {changing ? (
                                                <div className="flex items-center space-x-4">
                                                    <Spinner
                                                        size="sm"
                                                        color="white"
                                                    />
                                                    <div>Đang lưu...</div>
                                                </div>
                                            ) : (
                                                "Xác nhận"
                                            )}
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

export default Profile;
