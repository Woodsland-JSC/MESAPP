import React from "react";
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
} from "react-icons/tb";
import { SiSap } from "react-icons/si";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { HiMenuAlt3 } from "react-icons/hi";

import useAppContext from "../store/AppContext";
import usersApi from "../api/userApi";

import logo from "../assets/images/WLorigin.svg";
import defaultUser from "../assets/images/default-user.png";
import {
    Fade,
    ScaleFade,
    Slide,
    SlideFade,
    Collapse,
    useDisclosure,
    Box,
    IconButton,
} from "@chakra-ui/react";

import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuItemOption,
    MenuGroup,
    MenuOptionGroup,
    MenuDivider,
} from "@chakra-ui/react";
import { IoClose } from "react-icons/io5";

function Header(props) {
    const { isOpen, onToggle } = useDisclosure();

    const { user, setUser, isAuthenticated, setIsAuthenticated } =
        useAppContext();

    const { variant } = props;

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

    return (
        <div className="sticky top-0 z-50">
            <div
                className={`flex h-[69px] bg-white items-center ${
                    variant == "homepage"
                        ? "border-b-2 border-white"
                        : "border-b-2 border-gray-200"
                } justify-between px-4 xl:px-32`}
            >
                {/* Logo */}
                <div className="flex space-x-2 items-center h-full">
                    <img src={logo} alt="logo" className="flex items-center w-14 h-14"></img>
                    <div>
                        {/* <p className="font-bold text-xl mb-0 ">Woodsland</p> */}
                        {/* <p className="text-[0.7rem] text-gray-500">
                            WEB PORTAL
                        </p> */}
                    </div>
                </div>

                {/* Navigator Menu */}
                <div className="hidden xl:flex lg:flex h-full">
                    <ul className="flex items-center flex-row space-x-4 ">
                        <NavLink to="/workspace" className="flex items-center">
                            {({ isActive }) => (
                                <li
                                    className={
                                        isActive
                                            ? "p-2 px-3 rounded-full bg-[#155979] cursor-pointer active:scale-[.98] active:duration-75 transition-all"
                                            : "p-2 px-3 rounded-full hover:bg-gray-100 cursor-pointer active:scale-[.98] active:duration-75 transition-all"
                                    }
                                >
                                    <div
                                        className={
                                            isActive
                                                ? "flex items-center space-x-2 text-white"
                                                : "flex items-center space-x-2"
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
                                            ? "p-2 px-3 rounded-full bg-[#155979] cursor-pointer text-base"
                                            : "p-2 px-3 rounded-full hover:bg-gray-100 cursor-pointer active:scale-[.98] active:duration-75 transition-all"
                                    }
                                >
                                    <div
                                        className={
                                            isActive
                                                ? "flex items-center space-x-2 text-white"
                                                : "flex items-center space-x-2"
                                        }
                                    >
                                        <TbUserSquareRounded className="text-2xl" />
                                        <p>Quản lý người dùng</p>
                                    </div>
                                </li>
                            )}
                        </NavLink>
                        {user?.permissions?.includes("monitor") && (
                            <NavLink
                                to="/integration"
                                className="flex items-center"
                            >
                                {({ isActive }) => (
                                    <li
                                        className={
                                            isActive
                                                ? "p-2 px-3 rounded-full bg-[#155979] cursor-pointer"
                                                : "p-2 px-3 rounded-full hover:bg-gray-100 cursor-pointer active:scale-[.98] active:duration-75 transition-all"
                                        }
                                    >
                                        <div
                                            className={
                                                isActive
                                                    ? "flex items-center space-x-2 text-white"
                                                    : "flex items-center space-x-2"
                                            }
                                        >
                                            <TbAnalyze className="text-2xl" />
                                            <p>Tích hợp</p>
                                        </div>
                                    </li>
                                )}
                            </NavLink>
                        )}
                        {/* {user?.permissions?.includes("monitor") && */}
                        {/* ( */}
                        <NavLink to="/reports" className="flex items-center">
                            {({ isActive }) => (
                                <li
                                    className={
                                        isActive
                                            ? "p-2 px-3 rounded-full bg-[#155979] cursor-pointer"
                                            : "p-2 px-3 rounded-full hover:bg-gray-100 cursor-pointer active:scale-[.98] active:duration-75 transition-all"
                                    }
                                >
                                    <div
                                        className={
                                            isActive
                                                ? "flex items-center space-x-2 text-white"
                                                : "flex items-center space-x-2"
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
                <div className="flex items-center h-full">
                    {isAuthenticated ? (
                        <>
                            <img
                                src={user?.avatar ? user.avatar : defaultUser}
                                alt="user"
                                className="w-8 h-8 rounded-full object-cover"
                            ></img>

                            {/* Responsive Menu */}
                            <div className="flex xl:hidden">
                                <IconButton
                                    variant="ghost"
                                    onClick={onToggle}
                                    className="w-fit ml-2"
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
                                        <div className="px-2 border-b-2 border-gray-200 py-4 text-2xl font-semibold">
                                            {user?.first_name +
                                                " " +
                                                user?.last_name}
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
                                                    ></img>
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
                                            {user?.permissions?.includes(
                                                "monitor"
                                            ) && (
                                                <Link to="/integration">
                                                    <div className="flex gap-x-4 p-2 my-1 text-xl items-center rounded-xl hover:bg-gray-700 px-4">
                                                        <TbAnalyze className="text-2xl" />
                                                        <div>Tích hợp</div>
                                                    </div>
                                                </Link>
                                            )}
                                            {/* {user?.permissions?.includes(
                                            "monitor"
                                        ) && ( */}
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
                                            {/* )} */}
                                            {/* <Link to="/profile">
                                            <MenuItem
                                                icon={
                                                    <TbSettings className="text-2xl" />
                                                }
                                                minH="42px"
                                            >
                                                Thông tin cá nhân
                                            </MenuItem>
                                        </Link> */}
                                            <div>
                                                <div
                                                    className="flex justify-center cursor-pointer gap-x-4 p-2 text-xl items-center rounded-xl bg-gray-700 px-4"
                                                    onClick={onToggle}
                                                >
                                                    {/* <IoClose className="text-2xl" /> */}
                                                    <div>Đóng</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Box>
                                </Slide>
                            </div>

                            <div className="hidden xl:flex">
                                <Menu>
                                    <MenuButton righticon={<TbChevronDown />}>
                                        <Button
                                            variant="ghost"
                                            fontWeight="regular"
                                        >
                                            {(user?.first_name
                                                ? user?.first_name + " "
                                                : "") +
                                                (user?.last_name
                                                    ? user?.last_name
                                                    : "")}
                                        </Button>
                                    </MenuButton>
                                    <MenuList>
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
