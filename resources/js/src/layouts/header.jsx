import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link, NavLink } from "react-router-dom";
import "../assets/styles/index.css";
import { Button } from "@chakra-ui/react";
import {
    TbCategory,
    TbSettings,
    TbUserSquareRounded,
    TbChevronDown,
    TbArrowRight,
    TbInfoSquareRounded,
    TbAnalyze,
    TbReportAnalytics,
    TbCircleKeyFilled,
} from "react-icons/tb";
import { RiArrowLeftRightLine } from "react-icons/ri";
import { FaCheck } from "react-icons/fa6";
import { SiSap } from "react-icons/si";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { HiMenuAlt3 } from "react-icons/hi";
import { Divider } from "@chakra-ui/react";
import useAppContext from "../store/AppContext";
import usersApi from "../api/userApi";
import logo from "../assets/images/WLorigin.svg";
import defaultUser from "../assets/images/default-user.png";
import {
    Fade,
    ScaleFade,
    Slide,
    SlideFade,
    useDisclosure,
    Box,
    IconButton,
    Tooltip,
    Spinner,
} from "@chakra-ui/react";
import { RiExpandUpDownLine } from "react-icons/ri";
import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuDivider,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from "@chakra-ui/react";
import { IoClose } from "react-icons/io5";
import { FaCircle, FaKey } from "react-icons/fa";
import { BiSolidTag } from "react-icons/bi";
import GoodNetwork from "../components/custom-icon/GoodNetwork";
import MediumNetwork from "../components/custom-icon/MediumNetwork";
import BadNetwork from "../components/custom-icon/BadNetwork";
import Offline from "../components/custom-icon/Offline";
import { set } from "date-fns";

function Header(props) {
    const { isOpen, onToggle } = useDisclosure();
    const {
        isOpen: isFactorySwitchOpen,
        onOpen: onFactorySwitchOpen,
        onClose: onFactorySwitchClose,
    } = useDisclosure();

    const { user, setUser, isAuthenticated, setIsAuthenticated } =
        useAppContext();

    const navigate = useNavigate();
    const { variant } = props;

    // Network Checking
    const [networkStatus, setNetworkStatus] = useState({
        speed: 0,
        status: "Đang kiểm tra...",
    });

    const [factoryList, setFactoryList] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [isFactoryLoading, setIsFactoryLoading] = useState(false);
    const [isFactorySwitchLoading, setIsFactorySwitchLoading] = useState(false);

    useEffect(() => {
        const updateNetworkStatus = () => {
            if (navigator.connection) {
                const { downlink } = navigator.connection;
                let status = "Tốt";

                if (!navigator.onLine || downlink === 0) {
                    status = "Không có mạng";
                } else if (downlink < 1.2) {
                    status = "Kém"; // Tương ứng 3G hoặc yếu hơn
                } else if (downlink >= 1.2 && downlink < 3.5) {
                    status = "Trung bình"; // Tương ứng Slow 4G
                } else {
                    status = "Tốt"; // Fast 4G hoặc No Throttling
                }

                setNetworkStatus({ speed: downlink, status });
            }
        };

        updateNetworkStatus();
        window.addEventListener("online", updateNetworkStatus);
        window.addEventListener("offline", () =>
            setNetworkStatus({ speed: 0, status: "Không có mạng" })
        );
        if (navigator.connection) {
            navigator.connection.addEventListener(
                "change",
                updateNetworkStatus
            );
        }

        return () => {
            window.removeEventListener("online", updateNetworkStatus);
            window.removeEventListener("offline", () =>
                setNetworkStatus({ speed: 0, status: "Không có mạng" })
            );
            if (navigator.connection) {
                navigator.connection.removeEventListener(
                    "change",
                    updateNetworkStatus
                );
            }
        };
    }, []);

    // console.log(user.permissions?.includes("monitor"))

    const handleSignOut = async () => {
        try {
            const res = await usersApi.signOut();
            localStorage.removeItem("userInfo");
            Cookies.remove("isAuthenticated");
            setUser(null);
            toast.success("Đã đăng xuất");
        } catch (error) {
            console.error(error);
            localStorage.removeItem("userInfo");
            Cookies.remove("isAuthenticated");
            setUser(null);
            toast.success("Đã đăng xuất");
        }
    };

    const loadFactoryByBranch = async () => {
        setIsFactoryLoading(true);
        try {
            const res = await usersApi.getFactoriesByBranchId(user.branch);
            setFactoryList(res);
            setIsFactoryLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách nhà máy. Vui lòng thử lại.");
            setIsFactoryLoading(false);
            onFactorySwitchClose();
        }
    };

    const handleFactorySwitchOpen = async () => {
        onFactorySwitchOpen();
        loadFactoryByBranch();
    };

    const handleFactorySelectClose = async () => {
        setSelectedFactory(null);
        onFactorySwitchClose();
    };

    const handleFactorySwitch = async () => {
        if (!selectedFactory) {
            toast.error("Vui lòng chọn nhà máy cần chuyển");
            return;
        }
        if (selectedFactory === user.plant) {
            toast.error("Vui lòng chọn nhà máy khác nhà máy hiện tại");
            return;
        }
        setIsFactorySwitchLoading(true);
        try {
            const res = await usersApi.changeUserFactory(selectedFactory);
            setIsFactorySwitchLoading(false);
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            userInfo.plant = selectedFactory;
            localStorage.setItem("userInfo", JSON.stringify(userInfo));
            setUser({
                ...user,
                plant: selectedFactory,
            });
            navigate(0);
            toast.success("Chuyển nhà máy thành công");
            onFactorySwitchClose();
            setSelectedFactory(null);
        } catch (error) {
            console.error(error);
            toast.error("Đã có lỗi xảy ra, vui lòng thử lại.");
            setIsFactorySwitchLoading(false);
            onFactorySwitchClose();
            setSelectedFactory(null);
        }
    };

    return (
        <div className="sticky top-0 z-50">
            <div
                className={`flex h-[69px] xl:bg-[#eaeaed]/30 lg:bg-[#eaeaed]/30 md:bg-[#eaeaed]/30 bg-[#eaeaed] xl:backdrop-blur-lg lg:backdrop-blur-lg md:backdrop-blur-lg items-center ${
                    variant == "homepage"
                        ? "border-b-2 border-white"
                        : "border-b-2 border-none"
                } justify-between px-4 xl:px-28`}
            >
                {/* Logo */}
                <div className="flex space-x-3 items-center h-full ">
                    <Link to="/workspace?tab=wood-drying">
                        <img
                            src={logo}
                            alt="logo"
                            className="flex items-center w-14 h-14"
                        ></img>
                    </Link>
                    <div className="h-[36px] border-r border-gray-400"></div>
                    <div className="flex flex-col justify-center !leading-0">
                        <div className="flex items-center space-x-2">
                            <div
                                className={` flex items-center uppercase font-bold text-md !py-0 bg-gradient-to-r ${
                                    user?.branch === "1"
                                        ? "from-green-800 via-[#17506B] to-[#512272]"
                                        : user?.branch === "3"
                                        ? "from-black via-[#17506B] to-[#066B9C]"
                                        : user?.branch === "4"
                                        ? "from-violet-800 via-red-800 to-yellow-800"
                                        : "from-[#17506B] via-[#066B9C] to-[#17506B]"
                                } bg-clip-text text-transparent`}
                            >
                                {user?.branch === "1"
                                    ? "Thuận Hưng"
                                    : user?.branch === "3"
                                    ? "Tuyên Quang"
                                    : user?.branch === "4"
                                    ? "Viforex"
                                    : user?.branch === ""
                                    ? "Không xác định"
                                    : ""}
                            </div>
                        </div>
                        <div className="text-xs !py-0 text-gray-700">
                            Nhà máy{" "}
                            {user?.plant === "TH"
                                ? "Thuận Hưng"
                                : user?.plant === "YS"
                                ? "Yên Sơn"
                                : user?.plant === "CH"
                                ? "Chiêm Hóa"
                                : user?.plant === "TB"
                                ? "Thái Bình"
                                : user?.plant === "VF"
                                ? "Hà Giang"
                                : "không xác định"}
                        </div>
                    </div>
                    <div>
                        {(user?.role == 1 || user?.role == 4) && (
                            <button
                                className="hidden xl:flex lg:flex bg-[#D9D9DB] rounded-full py-1.5 px-1.5 active:scale-[.92] active:duration-75 transition-all"
                                onClick={handleFactorySwitchOpen}
                            >
                                <RiArrowLeftRightLine />
                            </button>
                        )}

                        <Modal
                            blockScrollOnMount={false}
                            isOpen={isFactorySwitchOpen}
                            onClose={handleFactorySelectClose}
                            isCentered
                            closeOnOverlayClick={false}
                        >
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader>Chuyển đổi nhà máy</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody>
                                    <div className="mb-2">
                                        Chọn nhà máy cần chuyển:
                                    </div>
                                    {isFactoryLoading ? (
                                        <div className="flex items-center justify-center my-8">
                                            <Spinner
                                                thickness="7px"
                                                speed="0.65s"
                                                emptyColor="gray.200"
                                                color="blue.600"
                                                size="xl"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            {factoryList.length > 0 ? (
                                                <div className="space-y-2 mb-4">
                                                    {factoryList.map(
                                                        (item, index) => (
                                                            <div
                                                                className={`${item.Code == selectedFactory ? "bg-gray-200" : "bg-gray-50"} flex space-x-2 items-center justify-center text-center   rounded-full py-2 px-1.5 border-2 border-gray-200 hover:cursor-pointer hover:bg-black  hover:text-white hover:border-black active:scale-[.92] active:duration-75 transition-all`}
                                                                onClick={() => {
                                                                    setSelectedFactory(
                                                                        item.Code
                                                                    );
                                                                }}
                                                            >
                                                                <p>
                                                                    {item.Name}{" "}
                                                                    {item.Code ===
                                                                        user?.plant && (
                                                                        <span>
                                                                            (hiện
                                                                            tại)
                                                                        </span>
                                                                    )}
                                                                </p>

                                                                {item.Code ===
                                                                    selectedFactory && (
                                                                    <FaCheck className="text-lg text-green-500" />
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    Không tìm thấy danh sách nhà
                                                    máy
                                                </>
                                            )}
                                        </>
                                    )}

                                    <div>
                                        <b>Lưu ý:</b> Sau khi chuyển đổi nhà
                                        máy, trang sẽ được load lại.
                                    </div>
                                </ModalBody>

                                <ModalFooter className="flex justify-between space-x-2">
                                    <button
                                        onClick={handleFactorySelectClose}
                                        className="bg-gray-800 p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit xl:w-fit lg:w-fit md:w-fit w-full active:duration-75 transition-all"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        onClick={handleFactorySwitch}
                                        className="bg-[#155979] p-2 rounded-xl text-white px-4 active:scale-[.95] h-fit xl:w-fit lg:w-fit md:w-fit w-full active:duration-75 transition-all disabled:bg-gray-400"
                                        disabled={isFactoryLoading}
                                    >
                                        {isFactorySwitchLoading ? "Đang tải..." : "Xác nhận"}
                                    </button>
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                    </div>
                </div>

                {/* Navigator Menu */}
                <div className="hidden xl:flex lg:flex bg-[#F7F7F7] rounded-full py-1.5 px-1.5 ">
                    <ul className="flex  items-center flex-row space-x-2 ">
                        <NavLink to="/workspace" className="flex items-center">
                            {({ isActive }) => (
                                <li
                                    className={
                                        isActive
                                            ? "p-2 px-3 rounded-full bg-[#17506B] cursor-pointer active:scale-[.98] active:duration-75 transition-all"
                                            : "p-2 px-3 rounded-full hover:bg-gray-300 cursor-pointer active:scale-[.98] active:duration-75 transition-all"
                                    }
                                >
                                    <div
                                        className={
                                            isActive
                                                ? "flex items-center space-x-2 text-white"
                                                : "flex items-center space-x-2 font-medium text-gray-700"
                                        }
                                    >
                                        <TbCategory className="text-2xl" />
                                        <p>Workspace</p>
                                    </div>
                                </li>
                            )}
                        </NavLink>
                        <NavLink to="/users" className="flex items-center">
                            {({ isActive }) => (
                                <li
                                    className={
                                        isActive
                                            ? "p-2 px-3 rounded-full bg-[#17506B] cursor-pointer text-base"
                                            : "p-2 px-3 rounded-full hover:bg-gray-300 cursor-pointer active:scale-[.98] active:duration-75 transition-all"
                                    }
                                >
                                    <div
                                        className={
                                            isActive
                                                ? "flex items-center space-x-2 text-white"
                                                : "flex items-center space-x-2 font-medium text-gray-700"
                                        }
                                    >
                                        <TbUserSquareRounded className="text-2xl" />
                                        <p>Quản lý người dùng</p>
                                    </div>
                                </li>
                            )}
                        </NavLink>
                        <NavLink to="/reports" className="flex items-center">
                            {({ isActive }) => (
                                <li
                                    className={
                                        isActive
                                            ? "p-2 px-3 rounded-full bg-[#17506B] cursor-pointer"
                                            : "p-2 px-3 rounded-full hover:bg-gray-300 cursor-pointer active:scale-[.98] active:duration-75 transition-all"
                                    }
                                >
                                    <div
                                        className={
                                            isActive
                                                ? "flex items-center space-x-2 text-white"
                                                : "flex items-center space-x-2 font-medium text-gray-700"
                                        }
                                    >
                                        <TbReportAnalytics className="text-2xl" />
                                        <p>Báo cáo</p>
                                    </div>
                                </li>
                            )}
                        </NavLink>
                    </ul>
                </div>

                {/* Right*/}
                <div className="flex items-center h-full min-w-1/3">
                    {isAuthenticated ? (
                        <>
                            {/* Responsive Menu */}
                            <div className="flex xl:hidden">
                                <div
                                    className={`text-sm mx-2 mr-1 flex gap-x-2 font-medium items-center`}
                                >
                                    {networkStatus.status === "Tốt" && (
                                        <GoodNetwork
                                            className={"w-[22px] h-[22px]"}
                                        />
                                    )}
                                    {networkStatus.status === "Trung bình" && (
                                        <MediumNetwork
                                            className={"w-[22px] h-[22px]"}
                                        />
                                    )}
                                    {networkStatus.status === "Kém" && (
                                        <BadNetwork
                                            className={"w-[22px] h-[22px]"}
                                        />
                                    )}
                                    {networkStatus.status ===
                                        "Không có mạng" && (
                                        <Offline
                                            className={"w-[22px] h-[22px]"}
                                        />
                                    )}
                                </div>
                                <IconButton
                                    variant="ghost"
                                    onClick={onToggle}
                                    className="w-fit ml-2 mr-2"
                                >
                                    <HiMenuAlt3 className="text-2xl" />
                                </IconButton>
                                <Slide
                                    direction="bottom"
                                    in={isOpen}
                                    style={{ zIndex: 10 }}
                                >
                                    <Box
                                        p="40px"
                                        color="white"
                                        mt="4"
                                        bg="gray.800"
                                        rounded="md"
                                        shadow="md"
                                    >
                                        <div className=" px-2 border-b-2 border-gray-200 py-4 ">
                                            <div className="serif font-bold text-3xl">
                                                {user?.first_name +
                                                    " " +
                                                    user?.last_name}
                                            </div>
                                            <div className="font-light text-white">
                                                {user?.branch === "1"
                                                    ? "Woodsland Thuận Hưng"
                                                    : user?.branch === "3"
                                                    ? "Woodsland Tuyên Quang"
                                                    : user?.branch === "4"
                                                    ? "Viforex"
                                                    : user?.branch === ""
                                                    ? "Chưa có chi nhánh"
                                                    : ""}{" "}
                                                - {user?.plant}
                                            </div>
                                        </div>

                                        <div className="space-y-4 gap-y-2">
                                            <Link to="/profile">
                                                <div className="flex gap-x-4 my-1 mt-4 p-2 text-xl items-center rounded-xl hover:bg-gray-700 px-4">
                                                    <img
                                                        src={
                                                            user?.avatar
                                                                ? user.avatar
                                                                : defaultUser
                                                        }
                                                        alt="user"
                                                        className="w-6 h-6 rounded-full object-cover"
                                                    />
                                                    <div>Trang cá nhân</div>
                                                </div>
                                            </Link>
                                            <Link to="/workspace">
                                                <div className="flex gap-x-4 p-2 my-1 text-xl items-center rounded-xl hover:bg-gray-700 px-4">
                                                    <TbCategory className="text-2xl" />
                                                    <div>Workspace</div>
                                                </div>
                                            </Link>
                                            <Link to="/users">
                                                <div className="flex gap-x-4 p-2 my-1  text-xl items-center rounded-xl hover:bg-gray-700 px-4">
                                                    <TbUserSquareRounded className="text-2xl" />
                                                    <div>
                                                        Quản lý người dùng
                                                    </div>
                                                </div>
                                            </Link>
                                            <Link to="/reports">
                                                <div className="flex gap-x-4 p-2 my-1 text-xl items-center rounded-xl hover:bg-gray-700 px-4">
                                                    <TbReportAnalytics className="text-2xl" />
                                                    <div>Báo cáo</div>
                                                </div>
                                            </Link>
                                            <Link to="#">
                                                <div
                                                    className="flex cursor-pointer gap-x-4 p-2 text-xl items-center rounded-xl hover:bg-gray-700 px-4"
                                                    onClick={() =>
                                                        handleSignOut()
                                                    }
                                                >
                                                    <TbArrowRight className="text-2xl" />
                                                    <div>Đăng xuất</div>
                                                </div>
                                            </Link>
                                            <div>
                                                <div
                                                    className="flex justify-center cursor-pointer gap-x-4 p-2 text-xl items-center rounded-xl bg-gray-700 px-4"
                                                    onClick={onToggle}
                                                >
                                                    <div>Đóng</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Box>
                                </Slide>
                            </div>

                            <div className="hidden xl:flex ">
                                <Menu className="!mr-4 flex items-center ">
                                    <Tooltip
                                        hasArrow
                                        label={`Tín hiệu mạng: ${networkStatus.status}`}
                                        bg="black"
                                    >
                                        <div
                                            className={`text-sm flex gap-x-2 font-medium items-center p-2 px-[9px] bg-[#F7F7F7] rounded-full`}
                                        >
                                            {networkStatus.status === "Tốt" && (
                                                <GoodNetwork
                                                    className={
                                                        "w-[21px] h-[21px]"
                                                    }
                                                />
                                            )}
                                            {networkStatus.status ===
                                                "Trung bình" && (
                                                <MediumNetwork
                                                    className={
                                                        "w-[22px] h-[22px]"
                                                    }
                                                />
                                            )}
                                            {networkStatus.status === "Kém" && (
                                                <BadNetwork
                                                    className={
                                                        "w-[22px] h-[22px]"
                                                    }
                                                />
                                            )}
                                            {networkStatus.status ===
                                                "Không có mạng" && (
                                                <Offline
                                                    className={
                                                        "w-[22px] h-[22px]"
                                                    }
                                                />
                                            )}
                                        </div>
                                    </Tooltip>
                                    <MenuButton as={"div"} className="cursor-pointer">
                                        <Button
                                            variant="ghost"
                                            fontWeight="regular"
                                        >
                                            <div className="flex items-center space-x-4 bg-[#F7F7F7] p-1 px-3.5 pl-1 rounded-full font-medium">
                                                <div className="relative rounded-full border-white border-2 w-fit h-fit">
                                                    <img
                                                        src={
                                                            user?.avatar
                                                                ? user.avatar
                                                                : defaultUser
                                                        }
                                                        alt="user"
                                                        className=" w-8 h-8 rounded-full object-cover"
                                                    />
                                                    {user?.role == 1 && (
                                                        <Tooltip
                                                            hasArrow
                                                            label="Người quản trị"
                                                            bg="black"
                                                        >
                                                            <div className="absolute -bottom-1 -right-2 rounded-full bg-white w-fit h-fit">
                                                                <TbCircleKeyFilled className="w-5 h-5 text-[black]"></TbCircleKeyFilled>
                                                            </div>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                                <div className="space-y-0">
                                                    <div className="text-[15px] font-semibold text-left">
                                                        {(user?.last_name
                                                            ? user?.last_name +
                                                              " "
                                                            : "") +
                                                            (user?.first_name
                                                                ? user?.first_name
                                                                : "")}
                                                    </div>
                                                    <div className="text-xs font-regular text-right text-gray-500">
                                                        {user?.email ||
                                                            "Không xác định"}
                                                    </div>
                                                </div>
                                                <RiExpandUpDownLine className="text-lg" />
                                            </div>
                                        </Button>
                                    </MenuButton>

                                    <MenuList className="xl:relative lg:relative md:relative xl:!left-2 lg:!left-2 md:!left-2 !w-[150px] text-[15px]">
                                        {/* <div className="px-3 py-2">
                                            <div className="font-semibold">Nhà máy Yên Sơn</div>
                                        </div> */}
                                        <MenuItem>
                                            <Link to="/profile">
                                                Trang cá nhân
                                            </Link>
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => handleSignOut()}
                                        >
                                            Đăng xuất
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Đăng nhập</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Header;
