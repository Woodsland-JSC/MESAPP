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
import { Divider } from '@chakra-ui/react'

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
                className={`flex h-[69px] bg-[#eaeaed] items-center ${
                    variant == "homepage"
                        ? "border-b-2 border-white"
                        : "border-b-2 border-none"
                } justify-between px-4 xl:px-32`}
            >
                {/* Logo */}
                <div className="flex space-x-3 items-center h-full ">
                    <img
                        src={logo}
                        alt="logo"
                        className="flex items-center w-14 h-14"
                    ></img>
                    <div className="h-[36px] border-r border-gray-400"></div>
                    <div className="flex flex-col">
                        <div className="text-xs !py-0 text-gray-500">
                            Chi nhánh{""}
                        </div>
                    <div className={`uppercase font-bold text-md !py-0 bg-gradient-to-r ${user.branch === "1" ? "from-green-800 via-[#17506B] to-[#512272]" : user.branch === "3" ? "from-black via-[#17506B] to-[#066B9C]" : user.branch === "4" ? "from-[#17506B] via-red-800 to-yellow-800" : "from-[#17506B] via-[#066B9C] to-[#17506B]"} bg-clip-text text-transparent`}>
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
                </div>

                {/* Navigator Menu */}
                <div className="hidden xl:flex lg:flex h-full">
                    <ul className="flex items-center flex-row space-x-4 ">
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
                <div className="flex items-center space-x-2 h-full min-w-1/3">
                    {isAuthenticated ? (
                        <>
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
                                                    : ""}
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

                            <div className="hidden xl:flex">
                                <Menu>
                                    <MenuButton righticon={<TbChevronDown />}>
                                        <Button
                                            variant="ghost"
                                            fontWeight="regular"
                                        >
                                            <div className="space-y-0">
                                                <div className="text-[16px] font-medium text-right">
                                                    {(user?.first_name
                                                        ? user?.first_name + " "
                                                        : "") +
                                                        (user?.last_name
                                                            ? user?.last_name
                                                            : "")}
                                                </div>
                                                <div className="text-xs text-right text-gray-600">
                                                    {user?.email ||
                                                        "Không xác định"}
                                                </div>
                                            </div>
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

                            <img
                                src={user?.avatar ? user.avatar : defaultUser}
                                alt="user"
                                className="w-8 h-8 rounded-full object-cover"
                            ></img>
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
