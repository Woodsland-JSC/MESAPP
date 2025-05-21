import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    forwardRef,
} from "react";
import { useDropzone } from "react-dropzone";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { MdDeleteOutline } from "react-icons/md";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import makeAnimated from "react-select/animated";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import Layout from "../../layouts/layout";
import generateAvatar from "../../utils/generateAvatar";
import useAppContext from "../../store/AppContext";
import Loader from "../../components/Loader";
import TinyLoader from "../../components/TinyLoader";
import usersApi from "../../api/userApi";
import roleApi from "../../api/roleApi";
import { areObjectsEqual } from "../../utils/objectFunctions";
import DefaultAvatar from "../../assets/images/Default-Avatar.png";
import { IoMdArrowRoundBack } from "react-icons/io";
import { RiEyeOffFill, RiEyeFill } from "react-icons/ri";
import { Input, InputGroup, InputRightElement, FormLabel, Box, Text } from "@chakra-ui/react";

const genderOptions = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
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
    // gender: Yup.string()
    //     .oneOf(["male", "female"], "Giá trị không hợp lệ")
    //     .required("Giới tính là bắt buộc"),
    password: Yup.string()
        .nullable()
        .transform((value) => {
            if (value === "") {
                return undefined;
            }
            return value;
        })
        .test("test-password", "Mật khẩu không hợp lệ", function (value) {
            if (!value) return true;

            let error;

            const upperCaseRegex = /[A-Z]/;
            const lowerCaseRegex = /[a-z]/;
            const numberRegex = /\d/;
            const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/]/;

            if (!upperCaseRegex.test(value)) {
                error = "Mật khẩu cần có ít nhất 1 kí tự in hoa";
            } else if (!lowerCaseRegex.test(value)) {
                error = "Mật khẩu cần có ít nhất 1 kí tự viết thường";
            } else if (!numberRegex.test(value)) {
                error = "Mật khẩu cần có ít nhất 1 chữ số";
            } else if (!specialCharRegex.test(value)) {
                error = "Mật khẩu cần có ít nhất 1 kí tự đặc biệt";
            } else if (value.length < 8 || value.length > 15) {
                error = "Mật khẩu phải có từ 8 - 15 ký tự";
            }

            if (error) {
                return this.createError({ message: error });
            }

            return true;
        }),
    authorization: Yup.string().required("Phân quyền là bắt buộc"),
    sapId: Yup.string().required("SAP ID là bắt buộc"),
    username: Yup.string().required("username là bắt buộc"),
    integrationId: Yup.string().required("Integration ID là bắt buộc"),
    factory: Yup.string().required("Nhà máy là bắt buộc"),
    branch: Yup.string().required("Chi nhánh là bắt buộc"),
});

const SelectField = forwardRef(
    ({ options, name, setInput, innerRef, ...props }, ref) => {
        const [selectedOption, setSelectedOption] = useState();
        const { setFieldValue } = useFormikContext();

        const handleChange = (option) => {
            setSelectedOption(option);
            setFieldValue(name, option?.value || "");
            setInput((prev) => ({
                ...prev,
                [name]: option?.value || "",
            }));
        };

        return (
            <Select
                {...props}
                ref={innerRef || ref}
                options={options}
                value={selectedOption}
                onChange={handleChange}
                placeholder="Lựa chọn"
            />
        );
    }
);

const AsyncSelectField = forwardRef(
    ({ options, loadOptions, name, setInput, innerRef, ...props }, ref) => {
        const [selectedOption, setSelectedOption] = useState();
        const { setFieldValue } = useFormikContext();

        const handleChange = (option) => {
            setSelectedOption(option);
            setFieldValue(name, option.value);
            setInput((prev) => ({
                ...prev,
                [name]: option.value,
            }));
        };

        return (
            <AsyncSelect
                {...props}
                ref={innerRef || ref}
                cacheOptions
                defaultOptions
                loadOptions={loadOptions}
                value={selectedOption}
                options={options}
                placeholder="Lựa chọn"
                onChange={handleChange}
            />
        );
    }
);

const animatedComponents = makeAnimated();

const AsyncMultiSelectField = forwardRef(
    ({ loadOptions, name, setInput, innerRef, ...props }, ref) => {
        const [selectedOption, setSelectedOption] = useState();
        const { setFieldValue } = useFormikContext();

        const handleChange = (option) => {
            setSelectedOption(option);
            setFieldValue(name, option ? option.map((opt) => opt.label) : []);
            setInput((prev) => ({
                ...prev,
                [name]: option ? option.map((opt) => opt.label) : [],
            }));
        };

        return (
            <Select
                {...props}
                ref={innerRef || ref}
                cacheOptions
                defaultOptions
                loadOptions={loadOptions}
                value={selectedOption}
                onChange={handleChange}
                components={animatedComponents}
                closeMenuOnSelect={false}
                isMulti
                placeholder="Lựa chọn"
            />
        );
    }
);

function User() {
    const { userId } = useParams();
    const navigate = useNavigate();

    // Ref
    const fileInputRef = useRef();
    const authorizationInputRef = useRef(null);
    const branchSelectRef = useRef(null);
    const sapIdSelectRef = useRef(null);
    const factorySelectRef = useRef(null);

    const [roles, setRoles] = useState([]);
    const [branches, setBranches] = useState([]);
    const [sapId, setSapId] = useState([]);
    const [factories, setFactories] = useState([]);
    const { user, setUser } = useAppContext();

    const [currentUser, setCurrentUser] = useState([]);

    const [originalInfo, setOriginalInfo] = useState(null);

    const [formKey, setFormKey] = useState(0);

    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [factoryLoading, setFactoryLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const [originalAvatar, setOriginalAvatar] = useState(null);
    const [avatar, setAvatar] = useState({
        file: null,
        imgSrc: DefaultAvatar,
        autoImg: null,
    });

    const [hasChanged, setHasChanged] = useState(false);

    const [selectedRoleOptions, setSelectedRoleOptions] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    const [input, setInput] = useState({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        gender: "",
        password: "",
        authorization: "",
        sapId: "",
        integrationId: "1",
        factory: "",
        branch: "",
    });

    const [signature, setSignature] = useState(null);
    const [previewSignature, setPreviewSignature] = useState(null);

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

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles, rejectedFiles) => {
            if (rejectedFiles && rejectedFiles.length > 0) {
                toast.error("Chỉ được upload file hình ảnh");
            } else {
                const imageFile = acceptedFiles[0];
                // Kiểm tra kích thước
                if (imageFile.size > 2 * 1024 * 1024) {
                    toast.error("Vui lòng chọn hình có kích thước <= 2MB.");
                    return;
                }
                setSignature(imageFile);
                const reader = new FileReader();
                reader.onload = () => {
                    const previewUrl = reader.result;
                    setPreviewSignature(previewUrl);
                };
                reader.readAsDataURL(imageFile);
            }
        },
        accept: "image/*",
        multiple: false,
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

    const handleDeleteAvatar = async () => {
        setAvatar({
            ...avatar,
            file: null,
            imgSrc: null,
        });

        if (selectedFile) {
            setSelectedFile(null);
        }

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

    const handleSignOut = async () => {
        try {
            const res = await usersApi.signOut();
            localStorage.removeItem("userInfo");
            Cookies.remove("isAuthenticated");
            setUser(null);
            toast.success("Vui lòng đăng nhập để tiếp tục");
        } catch (error) {
            console.error(error);
            localStorage.removeItem("userInfo");
            Cookies.remove("isAuthenticated");
            setUser(null);
            toast.success("Vui lòng đăng nhập để tiếp tục");
        }
    };

    const handleFormSubmit = async (values) => {
        const updatedValues = { ...values };
        const { password: newPassword, ...updatedInfo } = values;
        const { password: oldPassword, ...oldInfo } = originalInfo;
        const isChanged = areObjectsEqual(updatedInfo, oldInfo);

        console.log("Updated values: ", updatedValues);

        if (!isChanged || newPassword || originalAvatar != avatar.file) {
            setLoading(true);
            if (selectedFile) {
                if (selectedFile instanceof File) {
                    updatedValues.avatar = selectedFile;
                }
            } else if (
                avatar.file == originalAvatar ||
                avatar.imgSrc == originalAvatar
            ) {
                updatedValues.avatar = "";
                delete updatedValues.avatar;
            } else {
                updatedValues.avatar = -1;
            }

            try {
                const res = await usersApi.updateUser(userId, updatedValues);
                // console.log("Thành công: ", res);
                if (user.id != userId) {
                    toast.success("Điều chỉnh thông tin thành công.");
                }
                if (user.id == userId) {
                    handleSignOut();
                    setLoading(false);
                    toast.success("Điều chỉnh thông tin thành công.");
                    return;
                }
                getCurrentUser();
                setLoading(false);
            } catch (error) {
                console.error(error);
                toast.error("Có lỗi xảy ra, vui lòng thử lại.");
                setLoading(false);
            }
        } else {
            toast("Bạn chưa điều chỉnh thông tin.", {
                icon: ` ℹ️`,
            });
            return;
        }
    };

    const getAutoAvatar = async (name) => {
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
    };

    const getCurrentUser = useCallback(async () => {
        try {
            if (!userId) {
                navigate("/users");
                return;
            }
            const data = await usersApi.getUserDetails(userId);

            if (data.branches) {
                const options = data.branches.map((item) => ({
                    value: item.BPLId,
                    label: item.BPLName,
                }));

                setBranches(options);
            }

            if (data.roles) {
                const options = data.roles.map((item) => ({
                    value: item.id,
                    label: item.name,
                }));

                setRoles(options);
            }

            if (data.SAPUsers) {
                const options = data.SAPUsers.map((item) => ({
                    value: item.USER_CODE,
                    label: item.NAME + " - " + item.USER_CODE,
                }));

                setSapId(options);
            }

            if (data.branches) {
                const res = await usersApi.getFactoriesByBranchId(
                    data?.user?.branch
                );

                const options = res.map((item) => ({
                    value: item.Code,
                    label: item.Name,
                }));

                setFactories(options);
            }

            const {
                first_name: firstName,
                last_name: lastName,
                email,
                username: username,
                gender,
                sap_id: sapId,
                integration_id: integrationId,
                plant,
                branch,
                avatar,
                roles,
            } = data.user;

            const userData = {
                firstName: firstName || "",
                lastName: lastName || "",
                email: email || "",
                username: username || "",
                gender,
                password: "",
                authorization: data.user.role,
                sapId: sapId || "",
                integrationId: integrationId || "1",
                factory: plant || "",
                branch: branch || "",
            };

            setCurrentUser(data.user);

            setInput(userData);
            setOriginalInfo(userData);

            if (avatar) {
                setOriginalAvatar(avatar);
                setAvatar({
                    autoImg: null,
                    file: data.user.avatar,
                    imgSrc: data.user.avatar,
                });
            }
            setFormKey((prevKey) => prevKey + 1);
        } catch (error) {
            console.error(error);
            toast.error("Không tìm thấy user");
            if (error.response && error.response.status === 404) {
                navigate("/notfound", { replace: true });
            }
        }
    }, [userId]);

    // Load data cho avatar
    useEffect(() => {
        if (input.lastName && input.firstName && !avatar.file) {
            const tempName =
                input.lastName.trim().charAt(0) +
                input.firstName.trim().charAt(0);
            const res = (async () => {
                const base64 = await getAutoAvatar(tempName);
                // console.log("Auto ava: ", base64);
                setAvatar({ ...avatar, autoImg: base64 });
            })();
            setAvatarLoading(false);
        }

        if (!input.lastName && !input.firstName) {
            setAvatar({ ...avatar, imgSrc: null, autoImg: DefaultAvatar });
        }
    }, [input]);

    // Lấy data chi nhánh, role và SAP ID
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                await getCurrentUser();

                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchData();

        document.title = "Woodsland - Chi tiết người dùng";

        return () => {
            document.title = "Woodsland";
            document.body.classList.remove("body-no-scroll");
        };
    }, []);

    const [selectedSapUser, setSelectedSapUser] = useState(null);
    useEffect(() => {
        if (currentUser && sapId.length > 0) {
            const defaultUser = sapId.find(
                (id) => id.USER_CODE === currentUser.sap_id
            );
            if (defaultUser) {
                setSelectedSapUser(defaultUser);
            }
        }
    }, [currentUser, sapId]);

    // Thông báo dữ liệu chưa được lưu
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (hasChanged) {
                const message =
                    "Bạn có chắc chắn muốn rời đi? Các thay đổi chưa được lưu.";
                event.returnValue = message;
                return message;
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [hasChanged]);

    // Load danh sách nhà máy khi user chọn chi nhánh
    useEffect(() => {
        const selectedBranch = input.branch;

        const getFactoriesByBranchId = async () => {
            setFactoryLoading(true);
            try {
                if (selectedBranch) {
                    factorySelectRef.current.clearValue();
                    setFactories([]);
                    const res = await usersApi.getFactoriesByBranchId(
                        selectedBranch
                    );

                    const options = res.map((item) => ({
                        value: item.Code,
                        label: item.Name,
                    }));

                    setFactories(options);
                    setInput((prev) => ({ ...prev, factory: "" }));
                } else {
                    setFactories([]);
                }
            } catch (error) {
                console.error(error);
            }
            setFactoryLoading(false);
        };
        getFactoriesByBranchId();
        // }
    }, [input.branch]);

    useEffect(() => {
        if (loading) {
            document.body.classList.add("body-no-scroll");
        } else {
            document.body.classList.remove("body-no-scroll");
        }
    }, [loading]);

    return (
        <Layout>
            <div className="flex justify-center bg-transparent">
                {/* Section */}
                <div className="w-screen px-0 xl:p-12 lg:p-12 md:p-12 p-4 xl:pt-6 lg:pt-6 md:pt-6 xl:px-32 border-t border-gray-200">
                    {/* Go back */}
                    <div
                        className="flex items-center space-x-1 bg-[#DFDFE6] hover:cursor-pointer active:scale-[.95] active:duration-75 transition-all rounded-2xl p-1 w-fit px-3 mb-3 text-sm font-medium text-[#17506B] xl:mx-0 lg:mx-0 md:mx-0 mx-4"
                        onClick={() => navigate(-1)}
                    >
                        <IoMdArrowRoundBack />
                        <div>Quay lại</div>
                    </div>

                    {/* Header */}
                    <div className="serif text-4xl font-bold mb-4">
                        Thông tin người dùng
                    </div>
                    {/* Main content */}
                    <Formik
                        key={formKey}
                        initialValues={input}
                        validationSchema={validationSchema}
                        onSubmit={(values) => handleFormSubmit(values)}
                    >
                        {({ errors, touched, values, setFieldValue }) => {
                            return (
                                <Form className="flex flex-col p-6 bg-white border-2 border-gray-200 rounded-xl mb-6">
                                    <h1 className="mb-2 serif text-2xl text-center font-bold md:text-left">
                                        Thông tin cơ bản
                                    </h1>
                                    <section className="flex flex-col-reverse md:flex-row md:gap-4">
                                        <div className="md:w-2/3 mb-4">
                                            <div className="flex flex-col md:grid md:grid-cols-2 gap-x-4">
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
                                                        className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
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
                                                    <label className="block mb-2 text-md font-medium text-gray-900">
                                                        Tên{" "}
                                                        <span className="text-red-600">
                                                            *
                                                        </span>
                                                    </label>
                                                    <Field
                                                        name="firstName"
                                                        className="border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
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
                                                        Email{" "}
                                                        <span className="text-red-600">
                                                            *
                                                        </span>
                                                    </label>
                                                    <Field
                                                        name="email"
                                                        type="email"
                                                        className="border border-gray-300 text-gray-900  rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                        onChange={(e) => {
                                                            setFieldValue(
                                                                "email",
                                                                e.target.value
                                                            );
                                                            setInput(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    email: e
                                                                        .target
                                                                        .value,
                                                                })
                                                            );
                                                        }}
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
                                                        htmlFor="email"
                                                        className="block mb-2 text-md font-medium text-gray-900"
                                                    >
                                                        UserName(Mã NV){" "}
                                                        <span className="text-red-600">
                                                            *
                                                        </span>
                                                    </label>
                                                    <Field
                                                        name="username"
                                                        type="text"
                                                        className="border border-gray-300 text-gray-900 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                        onChange={(e) => {
                                                            setFieldValue(
                                                                "username",
                                                                e.target.value
                                                            );
                                                            setInput(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    username:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            );
                                                        }}
                                                    />
                                                    {errors.username &&
                                                    touched.username ? (
                                                        <span className="text-xs text-red-600">
                                                            <ErrorMessage name="username" />
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
                                                        {/* <span className="text-red-600">
                                                            *
                                                        </span> */}
                                                    </label>
                                                    <SelectField
                                                        name="gender"
                                                        options={genderOptions}
                                                        defaultValue={genderOptions.find(
                                                            (item) =>
                                                                item.value ==
                                                                values.gender
                                                        )}
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
                                                    <label
                                                        htmlFor="password"
                                                        className="block mb-2 text-md font-medium text-gray-900"
                                                    >
                                                        Mật khẩu{" "}
                                                    </label>
                                                    <InputGroup>
                                                        <Field
                                                            as={Input}
                                                            name="password"
                                                            id="password"
                                                            type={
                                                                showPassword
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            placeholder="********"
                                                            onChange={(e) => {
                                                                setFieldValue(
                                                                    "password",
                                                                    e.target
                                                                        .value
                                                                );
                                                                setInput(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        password:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                );
                                                            }}
                                                            borderColor="gray.300"
                                                            color="gray.900"
                                                            fontSize="sm"
                                                            borderRadius="md"
                                                            _focus={{
                                                                ring: 1,
                                                                ringColor:
                                                                    "blue.500",
                                                                borderColor:
                                                                    "blue.500",
                                                            }}
                                                        />
                                                        <InputRightElement
                                                            cursor="pointer"
                                                            onClick={
                                                                handleTogglePassword
                                                            }
                                                        >
                                                            {showPassword ? (
                                                                <RiEyeOffFill className="w-5 h-5 mr-2 text-gray-500"/>
                                                            ) : (
                                                                <RiEyeFill className="w-5 h-5 mr-2 text-gray-500"/>
                                                            )}
                                                        </InputRightElement>
                                                    </InputGroup>
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
                                                        Vai trò{" "}
                                                        <span className="text-red-600">
                                                            *
                                                        </span>
                                                    </label>
                                                    <SelectField
                                                        name="authorization"
                                                        placeholder="Chọn vai trò"
                                                        options={roles}
                                                        defaultValue={
                                                            roles.filter(
                                                                (item) =>
                                                                    values.authorization ==
                                                                    item.value
                                                            ) || null
                                                        }
                                                        onChange={(value) => {
                                                            setInput(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    authorization:
                                                                        value,
                                                                })
                                                            );
                                                        }}
                                                        setInput={setInput}
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
                                            {/* <div
                                                className="p-4 cursor-pointer border-dashed rounded-md border-2 border-sky-500 my-4"
                                                {...getRootProps()}
                                            >
                                                <input {...getInputProps()} />
                                                {isDragActive ? (
                                                    <p className="py-4">
                                                        Thả hình ảnh tại đây ...
                                                    </p>
                                                ) : (
                                                    <>
                                                        <div className="flex flex-col md:flex-row items-center gap-1">
                                                            <span className="sm:block hidden">
                                                                Kéo và thả hình
                                                                ảnh chữ ký vào
                                                                đây, hoặc
                                                            </span>
                                                            <span className="sm:hidden">
                                                                Upload chữ ký
                                                            </span>
                                                            <span class="rounded-lg cursor-pointer px-2 py-1 text-white bg-[#155979] hover:bg-[#1A6D94] duration-300">
                                                                chọn từ file
                                                            </span>
                                                        </div>
                                                        <span className="text-[12px] text-center w-full mt-4 sm:text-left md:text-sm text-red-600">
                                                            Lưu ý: Tỉ lệ ảnh nên
                                                            là 1:1 và ≤ 2MB
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            {previewSignature && (
                                                <div>
                                                    <div className="relative w-fit mx-auto">
                                                        <img
                                                            className="mt-2 h-[200px] w-[200px] object-contain shadow-xl rounded"
                                                            src={
                                                                previewSignature
                                                            }
                                                            alt="Signature-preview"
                                                        />
                                                        <span
                                                            onClick={
                                                                handleDeleteSignature
                                                            }
                                                            className="cursor-pointer absolute top-3 right-2 z-10"
                                                        >
                                                            <TiDeleteOutline className="text-2xl text-red-600" />
                                                        </span>
                                                    </div>
                                                </div>
                                            )} */}
                                        </div>
                                        <div className="flex flex-col justify-center items-center md:w-5/12 lg:w-1/3 mb-4">
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

                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    type="button"
                                                    className="text-white cursor-pointer bg-gray-800 hover:bg-ray-500 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg  w-full sm:w-auto px-5 py-2.5 text-center"
                                                    onClick={() =>
                                                        fileInputRef.current.click()
                                                    }
                                                >
                                                    <label className="w-full cursor-pointer">
                                                        Cập nhật ảnh đại diện
                                                    </label>
                                                </button>
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

                                    <h1 className="mb-4 serif text-2xl text-center font-bold md:text-left">
                                        Đồng bộ và tích hợp
                                    </h1>
                                    <div className="flex flex-col md:grid md:grid-cols-2 gap-x-4 w-full justify-between items-center">
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
                                            <SelectField
                                                innerRef={sapIdSelectRef}
                                                name="sapId"
                                                defaultValue={
                                                    sapId.find(
                                                        (item) =>
                                                            item.value ==
                                                            values.sapId
                                                    ) || null
                                                }
                                                options={sapId}
                                                onChange={(value) => {
                                                    setInput((prev) => ({
                                                        ...prev,
                                                        sapId: value,
                                                    }));
                                                }}
                                                setInput={setInput}
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
                                            </label>
                                            <Field
                                                name="integrationId"
                                                className="border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                                disabled
                                                value="1"
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
                                                htmlFor="branch"
                                                className="block mb-2 text-md font-medium text-gray-900"
                                            >
                                                Chi nhánh{" "}
                                                <span className="text-red-600">
                                                    *
                                                </span>
                                            </label>
                                            <SelectField
                                                innerRef={branchSelectRef}
                                                name="branch"
                                                options={branches}
                                                defaultValue={
                                                    branches.find(
                                                        (item) =>
                                                            item.value ==
                                                            values.branch
                                                    ) || null
                                                }
                                                setInput={setInput}
                                            />
                                            {errors.branch && touched.branch ? (
                                                <span className="text-xs text-red-600">
                                                    <ErrorMessage name="branch" />
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
                                            <SelectField
                                                innerRef={factorySelectRef}
                                                name="factory"
                                                defaultValue={
                                                    factories.find(
                                                        (item) =>
                                                            item.value ==
                                                            values.factory
                                                    ) || null
                                                }
                                                options={factories}
                                                isLoading={factoryLoading}
                                                setInput={setInput}
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
                                    </div>
                                    <button
                                        type="submit"
                                        className="mt-4 self-end flex items-center justify-center text-white bg-[#155979] hover:bg-[#1A6D94] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center gap-x-2"
                                    >
                                        Lưu lại
                                    </button>
                                </Form>
                            );
                        }}
                    </Formik>
                    <div className="pb-4"></div>
                </div>
            </div>
            {loading && <Loader />}
        </Layout>
    );
}

export default User;
