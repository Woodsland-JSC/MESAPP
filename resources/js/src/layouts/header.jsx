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
} from "react-icons/tb";
import { SiSap } from "react-icons/si";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { HiMenuAlt3 } from "react-icons/hi";

import useAppContext from "../store/AppContext";
import usersApi from "../api/userApi";

import logo from "../assets/images/woodsland.svg";
import defaultUser from "../assets/images/default-user.png";

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

function Header(props) {
    const { user, setUser, isAuthenticated, setIsAuthenticated } =
        useAppContext();

    const { variant } = props;

    console.log(user.permissions?.includes("monitor"))

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
                <div className="flex items-center h-full">
                    <img src={logo} alt="logo" className="w-12 h-12 mr-2"></img>
                    <div>
                        <p className="font-bold text-xl mb-0 ">Woodsland</p>
                        <p className="text-[0.7rem] text-gray-500">
                            WEB PORTAL
                        </p>
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
                        {user.permissions?.includes("monitor") && (<NavLink to="/integration" className="flex items-center">
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
                                        <TbAnalyze className="text-2xl"/>
                                        <p>Tích hợp</p>
                                    </div>
                                </li>
                            )}
                        </NavLink>)}
                        {/* <NavLink to="/profile" className="flex items-center">
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
                                        <TbSettings className="text-2xl"/>
                                        <p>Cài đặt</p>
                                    </div>
                                </li>
                            )}
                        </NavLink> */}
                    </ul>
                </div>

                {/* User */}
                <div className="flex items-center h-full">
                    {isAuthenticated ? (
                        <>
                            <img
                                src={user?.avatar ? user.avatar : defaultUser}
                                alt="user"
                                className="w-8 h-8 rounded-full object-cover"
                            ></img>
                            <div className="flex xl:hidden">
                                <Menu>
                                    <MenuButton
                                        aria-label="Options"
                                        variant="outline"
                                    >
                                        <Button
                                            variant="ghost"
                                            fontWeight="regular"
                                            data-collapse-toggle="navbar-sticky"
                                        >
                                            <HiMenuAlt3 className="text-2xl" />
                                        </Button>
                                    </MenuButton>
                                    <MenuList minWidth="400px" className="shadow-md z-10 mt-4">
                                        <div className="px-4 py-2 text-lg font-semibold">
                                            {user?.first_name +
                                                " " +
                                                user?.last_name}
                                        </div>
                                        <MenuDivider />
                                        <Link to="/profile">
                                            <MenuItem
                                                icon={
                                                    <TbInfoSquareRounded className="text-2xl" />
                                                }
                                                minH="42px"
                                            >
                                                Trang cá nhân
                                            </MenuItem>
                                        </Link>
                                        <Link to="/workspace">
                                            <MenuItem
                                                icon={
                                                    <TbCategory className="text-2xl" />
                                                }
                                                minH="42px"
                                            >
                                                Workspace
                                            </MenuItem>
                                        </Link>
                                        <Link to="/users">
                                            <MenuItem
                                                icon={
                                                    <TbUserSquareRounded className="text-2xl" />
                                                }
                                                minH="42px"
                                            >
                                                Quản lý người dùng
                                            </MenuItem>
                                        </Link>
                                        {user.permissions?.includes("monitor") && (<Link to="/integration">
                                            <MenuItem
                                                icon={
                                                    <SiSap className="text-2xl"/>
                                                }
                                                minH="42px"
                                            >
                                                Tích hợp
                                            </MenuItem>
                                        </Link>)}
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
                                        <MenuItem
                                            icon={
                                                <TbArrowRight className="text-2xl" />
                                            }
                                            minH="42px"
                                            onClick={() => handleSignOut()}
                                        >
                                            Đăng xuất
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            </div>
                            <div className="hidden xl:flex">
                                <Menu>
                                    <MenuButton rightIcon={<TbChevronDown />}>
                                        <Button
                                            variant="ghost"
                                            fontWeight="regular"
                                        >
                                            {(user?.first_name ? user?.first_name + " " : "") +
                                                (user?.last_name ? user?.last_name : "")}
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
