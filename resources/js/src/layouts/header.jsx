import React from "react";
import { Link } from "react-router-dom";
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

function Header() {
    const { user, setUser, isAuthenticated, setIsAuthenticated } = useAppContext();

    const handleSignOut = async () => {
        try {
            const res = await usersApi.signOut();
            localStorage.removeItem("userInfo");
            Cookies.remove('isAuthenticated');
            setUser(null);
            toast.info("Đã đăng xuất");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex justify-between items-center px-10 pr-12 h-[70px] py-4sticky z-50">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
                <img src={logo} alt="logo" className="w-12 h-12"></img>
                <div>
                    <p className="font-bold text-xl ">Woodsland</p>
                    <p className="text-xs text-gray-500">WEB PORTAL</p>
                </div>
            </Link>

            {/* Navigator Menu */}
            <div className="">
                <ul className="flex flex-row space-x-4">
                    <Link to="/workspace">
                        <li className="p-2 px-3 rounded-full hover:bg-gray-100 cursor-pointer active:scale-[.98] active:duration-75 transition-all">
                            <div className="flex items-center space-x-2">
                                <TbCategory className="text-2xl" />
                                <p>Workspace</p>
                            </div>
                        </li>
                    </Link>
                    <Link to="/users">
                        <li className=" p-2 px-3 rounded-full hover:bg-gray-100 cursor-pointer active:scale-[.98] active:duration-75 transition-all">
                            <div className="flex items-center space-x-2">
                                <TbUserSquareRounded className="text-2xl" />
                                <p>Quản lý người dùng</p>
                            </div>
                        </li>
                    </Link>
                    <Link to="/settings">
                        <li className="p-2 px-3 rounded-full hover:bg-gray-100 cursor-pointer active:scale-[.98] active:duration-75 transition-all">
                            <div className="flex items-center space-x-2">
                                <TbSettings className="text-2xl" />
                                <p>Cài đặt</p>
                            </div>
                        </li>
                    </Link>
                </ul>
            </div>

            {/* User */}
            <div className="flex items-center">
                {isAuthenticated ? (
                    <>
                        <img
                            src={user?.avatar ? user.avatar : defaultUser}
                            alt="user"
                            className="w-9 h-9 rounded-full"
                        ></img>
                        <Menu>
                            <MenuButton rightIcon={<TbChevronDown />}>
                                <Button variant="ghost" fontWeight="regular">
                                    {user?.first_name + " " + user?.last_name}
                                </Button>
                            </MenuButton>
                            <MenuList>
                                <MenuItem><Link to="/users">Trang cá nhân</Link></MenuItem>
                                <MenuItem onClick={() => handleSignOut()}>Đăng xuất</MenuItem>
                            </MenuList>
                        </Menu>
                    </>
                ) : <>
                    <Link to="/login">Đăng nhập</Link>
                </>}
            </div>
        </div>
    );
}

export default Header;
