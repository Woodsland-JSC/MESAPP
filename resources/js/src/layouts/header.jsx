import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/woodsland.svg";
import defaultUser from "../assets/default-user.png";
import "../index.css";
import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import {
    TbCategory,
    TbSettings,
    TbUserSquareRounded,
    TbChevronDown,
} from "react-icons/tb";

function Header() {
    return (
        <div className="flex justify-between items-center px-10 pr-12 h-[70px] py-4sticky z-50">
            {/* Logo */}
            <div className="flex items-center space-x-2">
                <img src={logo} alt="logo" className="w-12 h-12"></img>
                <div>
                    <p className="font-bold text-xl ">Woodsland</p>
                    <p className="text-xs text-gray-500">WEB PORTAL</p>
                </div>
            </div>

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
                <img
                    src={defaultUser}
                    alt="user"
                    className="w-9 h-9 rounded-full"
                ></img>
                <Menu>
                    <MenuButton rightIcon={<TbChevronDown />}>
                        <Button variant="ghost" fontWeight="regular">
                            Pedro Scott
                        </Button>
                    </MenuButton>
                    <MenuList>
                        <MenuItem>Trang cá nhân</MenuItem>
                        <MenuItem>Đăng xuất</MenuItem>
                    </MenuList>
                </Menu>
            </div>
        </div>
    );
}

export default Header;
