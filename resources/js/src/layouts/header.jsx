import React from "react";
import { Link, NavLink } from "react-router-dom";
import "../assets/styles/index.css";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import {
    TbCategory,
    TbSettings,
    TbUserSquareRounded,
    TbChevronDown,
} from "react-icons/tb";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

import useAppContext from "../store/AppContext";
import usersApi from "../api/userApi";

import logo from "../assets/images/woodsland.svg";
import defaultUser from "../assets/images/default-user.png";

function Header(props) {
    const { user, setUser, isAuthenticated, setIsAuthenticated } =
        useAppContext();

    const { variant } = props;

    const handleSignOut = async () => {
        try {
            const res = await usersApi.signOut();
            localStorage.removeItem("userInfo");
            Cookies.remove("isAuthenticated");
            setUser(null);
            toast.info("Đã đăng xuất");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="sticky top-0 z-50">
            <div className={`flex h-[69px] bg-white items-center ${variant == "homepage" ? "border-b border-white" : "border-b-2 border-gray-200"} justify-between px-32`}>
                {/* Logo */}
                <div className="flex items-center h-full">
                    <img src={logo} alt="logo" className="w-12 h-12 mr-2"></img>
                    <div>
                        <p className="font-bold text-xl mb-0 ">Woodsland</p>
                        <p className="text-[0.7rem] text-gray-500">WEB PORTAL</p>
                    </div>
                </div>

                {/* Navigator Menu */}
                <div className="hidden xl:flex lg:flex h-full">
                    <ul className="flex items-center flex-row space-x-4 ">
                        <NavLink to="/workspace" className='flex items-center'>
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
                        <NavLink to="/users" className='flex items-center'>
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
                        <NavLink to="/settings" className='flex items-center'>
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
                                        <TbSettings className="text-2xl" />
                                        <p>Cài đặt</p>
                                    </div>
                                </li>
                            )}
                        </NavLink>
                    </ul>
                </div>

                {/* User */}
                <div className="flex items-center h-full">
                    {isAuthenticated ? (
                        <>
                            <img
                                src={user?.avatar ? user.avatar : defaultUser}
                                alt="user"
                                className="w-8 h-8 rounded-full"
                            ></img>
                            <Menu>
                                <MenuButton rightIcon={<TbChevronDown />}>
                                    <Button
                                        variant="ghost"
                                        fontWeight="regular"
                                    >
                                        {user?.first_name +
                                            " " +
                                            user?.last_name}
                                    </Button>
                                </MenuButton>
                                <MenuList>
                                    <MenuItem>
                                        <Link to="/users">Trang cá nhân</Link>
                                    </MenuItem>
                                    <MenuItem onClick={() => handleSignOut()}>
                                        Đăng xuất
                                    </MenuItem>
                                </MenuList>
                            </Menu>
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
