import React, { useState, useEffect, useRef } from "react";
import Layout from "../../layouts/layout";
import { MdPlaylistAddCheckCircle } from "react-icons/md";
import { FaPallet} from "react-icons/fa";
import { FaCalendarCheck } from "react-icons/fa6";
import { HiSearchCircle, HiBadgeCheck } from "react-icons/hi";
import {
    HiSquare3Stack3D,
    HiMiniMagnifyingGlassCircle,
    HiClipboardDocumentList,
    HiHomeModern,
    HiRectangleStack,
    HiHandThumbUp,
    HiMiniArchiveBoxArrowDown,
    HiMiniBanknotes,
    HiArchiveBoxArrowDown,
} from "react-icons/hi2";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import useAppContext from "../../store/AppContext";
import "../../assets/styles/customTabs.css";

function Workspace() {
    const { user, setUser, isAuthenticated, setIsAuthenticated } =
        useAppContext();

    const FirstTab = useRef();
    const SecondTab = useRef();

    const handleTabClick = (isSecondTab) => {
        const params = new URLSearchParams(window.location.search);

        if (isSecondTab) {
            params.set("production", "true");
        } else {
            params.delete("production");
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", newUrl);
    };

    useEffect(() => {
        document.title = "Woodsland - Workspace";
        const params = new URLSearchParams(window.location.search);

        if (params.get("production") === "true") {
            setTimeout(() => {
                SecondTab.current.click();
            });
        }

        return () => {
            document.title = "Woodsland";
        };
    }, []);

    return (
        <Layout>
            {/* Container */}
            <div className="flex overflow-x-hidden justify-center bg-transparent ">
                {/* Section */}
                <div className="w-screen  xl:p-12 p-6 px-5 xl:px-32 ">
                    {/* Header */}
                    <div className="xl:mb-12 lg:mb-12 md:mb-12 mb-5">
                        <div className="xl:text-3xl lg:text-3xl md:text-3xl text-[1.75rem] font-bold xl:mb-2 lg:mb-2 md:mb-2">
                            Xin chào, {user?.first_name}! 👋
                        </div>
                        <div className="text-gray-500">
                            Chúc một ngày làm việc tốt lành.
                        </div>
                    </div>

                    {/* Card Fields */}
                    <div className="w-full overflow-x-hidden">
                        <Tabs
                            className="gap-x-1"
                            variant="soft-rounded"
                            colorScheme="blackAlpha"
                        >
                            <TabList className="xl:overflow-x-hidden lg:overflow-x-hidden md:overflow-hidden overflow-x-scroll overscroll-x-contain xl:pb-0 lg-pb-0 md:pb-0 pb-3 max-w-sm w-full">
                                <Tab 
                                    className="xl:w-fit md:w-full lg:w-full xl:h-fit md:h-fit lg:h-fit flex-nowrap "
                                    ref={FirstTab}
                                    onClick={() => handleTabClick(false)}
                                >
                                    <div className="w-[135px]">
                                        Quản lý sấy gỗ
                                    </div>
                                </Tab>
                                <Tab 
                                    className="xl:w-fit md:w-full lg:w-full xl:h-fit md:h-fit lg:h-fit flex-nowrap h-fit "
                                    ref={SecondTab}
                                    onClick={() => handleTabClick(true)}
                                >
                                    <div className="w-[137px]">
                                        Quản lý sản xuất
                                    </div>
                                </Tab>
                            </TabList>

                            <TabPanels px="0" className="w-full flex justify-center">
                                <TabPanel
                                    className="xl:p-4 lg:p-4 md:p-4 p-1 w-full"
                                    // style={{ padding: "1rem 1rem" }}
                                >
                                    {/* Cards List */}
                                    <div className="cusTabs w-full flex justify-center mt-1 xl:justify-normal">
                                        <div className="grid xl:grid-cols-3 xl:gap-x-7 gap-x-8 xl:gap-y-6 grid-cols-2 gap-y-6 w-full">
                                            {/* Xep say */}
                                            {user.permissions?.includes(
                                                "sepsay"
                                            ) ? (
                                                <Link to="/workspace/wood-sorting">
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-4 mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-300 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                            <div className="text-xl flex h-fit justify-center w-fit rounded-full p-5 m-1 bg-[#DAEAF1] text-[#17506b]">
                                                                <HiSquare3Stack3D className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                            <div>
                                                                <h5 class="hidden xl:block lg:block  mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                                    Xếp sấy
                                                                </h5>
                                                                <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                                    Tạo và xếp
                                                                    pallet để
                                                                    chuẩn bị cho
                                                                    vào lò.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex xl:hidden justify-center text-center mt-2">
                                                        Xếp sấy
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div>
                                                    <div className="flex justify-center w-fit xl:h-full md:h-full">
                                                        <div className="xl:w-full w-full h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                            <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                                <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tao ke hoach say */}
                                            {user.permissions?.includes(
                                                "kehoachsay"
                                            ) ? (
                                                <Link to="/workspace/create-drying-plan">
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-4  mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-300 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                            <div className="text-xl h-fit rounded-full m-1 p-5 bg-[#DAEAF1] text-[#17506b]">
                                                                <HiClipboardDocumentList className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                            <div>
                                                                <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                                    Tạo kế hoạch
                                                                    sấy
                                                                </h5>
                                                                <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                                    Tạo kế hoạch
                                                                    sấy trên
                                                                    danh sách lò
                                                                    hiện có.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex xl:hidden justify-center text-center mt-2">
                                                        Tạo kế hoạch sấy
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div>
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-full h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                            <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                                <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                        Tạo kế hoạch sấy
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Vao lo */}
                                            {user.permissions?.includes(
                                                "vaolo"
                                            ) ? (
                                                <Link to="/workspace/load-into-kiln">
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-4  mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-300 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                            <div className="text-xl h-fit rounded-full m-1 p-5 bg-[#DAEAF1] text-[#17506b]">
                                                                <HiRectangleStack className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                            <div>
                                                                <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                                    Vào lò
                                                                </h5>
                                                                <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                                    Cho pallet
                                                                    đã tạo vào
                                                                    lò để chuẩn
                                                                    bị sấy.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex xl:hidden justify-center text-center mt-2">
                                                        Vào lò
                                                    </div>
                                                </Link>
                                            ):(
                                                <div>
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-full h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                            <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                                <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                        Tạo kế hoạch sấy
                                                    </div>
                                                </div>
                                            )}

                                            {/* Kiem tra lo say */}
                                            {user.permissions?.includes(
                                                "kiemtralo"
                                            ) ? (
                                                <Link to="/workspace/kiln-checking">
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-4  mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-300 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                            <div className="text-xl h-fit rounded-full m-1 p-5 bg-[#DAEAF1] text-[#17506b]">
                                                                <HiSearchCircle className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                            <div>
                                                                <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                                    Kiểm tra lò
                                                                    sấy
                                                                </h5>
                                                                <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                                    Kiểm tra lò
                                                                    sấy dựa trên
                                                                    các tiêu
                                                                    chuẩn hoạt
                                                                    động.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex xl:hidden justify-center text-center mt-2">
                                                        Kiểm tra lò sấy
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div>
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-full h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                            <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                                <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                        Tạo kế hoạch sấy
                                                    </div>
                                                </div>
                                            )}

                                            {user.permissions?.includes(
                                                "losay"
                                            ) ? (
                                                <Link to="/workspace/kiln">
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-4 mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-300 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                            <div className="text-xl h-fit rounded-full m-1 p-5 bg-[#DAEAF1] text-[#17506b]">
                                                                <HiHomeModern className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                            <div>
                                                                <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                                    Lò sấy
                                                                </h5>
                                                                <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                                    Tiến hành
                                                                    khởi động
                                                                    quá trình
                                                                    sấy gỗ.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex xl:hidden justify-center text-center mt-2">
                                                        Lò sấy
                                                    </div>
                                                </Link>
                                            ):(
                                                <div>
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-full h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                            <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                                <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                        Tạo kế hoạch sấy
                                                    </div>
                                                </div>
                                            )}

                                            {user.permissions?.includes(
                                                "danhgiame"
                                            ) ? (
                                                <Link to="/workspace/drying-wood-checking">
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-4 mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-300 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                            <div className="text-xl h-fit rounded-full m-1 p-5 bg-[#DAEAF1] text-[#17506b]">
                                                                <HiHandThumbUp className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                            <div>
                                                                <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                                    Đánh giá mẻ
                                                                    sấy
                                                                </h5>
                                                                <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                                    Đánh giá mẻ
                                                                    gỗ sau khi
                                                                    sấy và kết
                                                                    thúc quy
                                                                    trình.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex xl:hidden justify-center text-center mt-2">
                                                        Đánh giá mẻ sấy
                                                    </div>
                                                </Link>
                                            ): (
                                                <div>
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-full h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                            <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                                <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                        Tạo kế hoạch sấy
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabPanel>
                                <TabPanel style={{ padding: "1rem 1rem" }}>
                                    {/* Cards List */}
                                    <div className="cusTabs flex justify-center mt-1 xl:justify-normal">
                                        <div className="grid xl:grid-cols-3 xl:gap-x-7 gap-x-8 xl:gap-y-6 grid-cols-2 gap-y-6">
                                            {user.permissions?.includes(
                                                "CBG"
                                            ) ? (
                                                <Link to="/workspace/wood-working/finished-goods-receipt">
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-4 mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-300 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                            <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-5 m-1 bg-[#DAEAF1] text-[#17506b]">
                                                                <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                                
                                                            </div>
                                                            <div>
                                                                <h5 class="hidden xl:block lg:block  mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                                    Nhập thành phẩm chế biến gỗ
                                                                </h5>
                                                                <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                                    Nhập thành phẩm chế biến.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex xl:hidden justify-center text-center mt-2">
                                                        Nhập thành phẩm chế biến gỗ
                                                    </div>
                                                </Link>
                                            ):(
                                                <div>
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-full h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                            <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                                <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                        Tạo kế hoạch sấy
                                                    </div>
                                                </div>
                                            )}

                                            {user.permissions?.includes(
                                                "QCCBG"
                                            ) ? (
                                                <Link to="/workspace/wood-working/qc">
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-4 mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-300 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                            <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-5 m-1 bg-[#DAEAF1] text-[#17506b]">
                                                                <HiBadgeCheck className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                            <div>
                                                                <h5 class="hidden xl:block lg:block  mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                                    Kiểm định chất lượng chế biến gỗ
                                                                </h5>
                                                                <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                                    Kiểm định chất lượng thành phẩm chế biến gỗ.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex xl:hidden justify-center text-center mt-2">
                                                        QC Chế biến gỗ
                                                    </div>
                                                </Link>
                                            ):(
                                                <div>
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-full h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                            <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                                <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                        Tạo kế hoạch sấy
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {user.permissions?.includes(
                                                "VCN"
                                            ) ? (
                                                <Link to="/workspace/plywood/finished-good-receipts">
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-4 mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-300 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                            <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-5 m-1 bg-[#eae7ff] text-violet-600">
                                                                <FaPallet className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                            <div>
                                                                <h5 class="hidden xl:block lg:block  mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                                    Nhập thành phẩm ván công nghiệp
                                                                </h5>
                                                                <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                                    Nhập thành phẩm ván.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex xl:hidden justify-center text-center mt-2">
                                                        Nhập thành phẩm ván công nghiệp
                                                    </div>
                                                </Link>
                                            ):(
                                                <div>
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-full h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                            <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                                <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                        Tạo kế hoạch sấy
                                                    </div>
                                                </div>
                                            )}

                                            {user.permissions?.includes(
                                                "QCVCN"
                                            ) ? (
                                                <Link to="/workspace/plywood/qc">
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-4 mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-300 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                            <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-5 m-1 bg-[#eae7ff] text-violet-600">
                                                                <HiBadgeCheck  className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                            <div>
                                                                <h5 class="hidden xl:block lg:block  mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                                    Kiểm định chất lượng ván công nghiệp
                                                                </h5>
                                                                <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                                    Kiểm định ván công nghiệp
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex xl:hidden justify-center text-center mt-2">
                                                        QC VCN
                                                    </div>
                                                </Link>
                                            ):(
                                                <div>
                                                    <div className="flex justify-center xl:h-full md:h-full">
                                                        <div className="xl:w-full w-full h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                            <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                                <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                        Tạo kế hoạch sấy
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <div className="flex justify-center xl:h-full md:h-full">
                                                    <div className="xl:w-full w-full h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                        <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                            <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                    Tạo kế hoạch sấy
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-center xl:h-full md:h-full">
                                                    <div className="xl:w-full w-full h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                        <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                            <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                    Tạo kế hoạch sấy
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabPanel>                          
                                <TabPanel style={{ padding: "1rem 1rem" }}>
                                    {/* Cards List */}
                                    <div className="cusTabs flex justify-center mt-1 xl:justify-normal">
                                        <div className="grid xl:grid-cols-3 xl:gap-x-7 gap-x-8 xl:gap-y-6 grid-cols-2 gap-y-6">
                                            <Link to="/workspace/wood-producting-qc">
                                                <div className="flex justify-center xl:h-full md:h-full">
                                                    <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-4  mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-300 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                        <div className="text-xl flex h-fit justify-center w-fit rounded-full p-5 m-1 bg-[#DAEAF1] text-[#17506b]">
                                                            {/* <HiMiniBanknotes className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10"/> */}
                                                            <MdPlaylistAddCheckCircle className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                        </div>
                                                        <div>
                                                            <h5 class="hidden xl:block lg:block  mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                                Chế biến gỗ
                                                            </h5>
                                                            <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                                Lorem ipsum
                                                                dolor sit amet
                                                                consectetur,
                                                                adipisicing
                                                                elit.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex xl:hidden justify-center text-center mt-2">
                                                    Chế biến gỗ
                                                </div>
                                            </Link>

                                            <Link to="/workspace/wood-producting-qc">
                                                <div className="flex justify-center xl:h-full md:h-full">
                                                    <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-4  mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-300 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                        <div className="text-xl flex h-fit justify-center w-fit rounded-full p-5 m-1 bg-[#DAEAF1] text-[#17506b]">
                                                            {/* <HiMiniBanknotes className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10"/> */}
                                                            <MdPlaylistAddCheckCircle className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                        </div>
                                                        <div>
                                                            <h5 class="hidden xl:block lg:block  mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                                Ván công nghiệp
                                                            </h5>
                                                            <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                                Lorem ipsum
                                                                dolor sit amet
                                                                consectetur,
                                                                adipisicing
                                                                elit.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex xl:hidden justify-center text-center mt-2">
                                                    Ván công nghiệp
                                                </div>
                                            </Link>

                                            <div>
                                                <div className="flex justify-center xl:h-full md:h-full">
                                                    <div className="xl:w-full w-fit h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada] rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                        <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                            <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                    Tạo kế hoạch sấy
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-center xl:h-full md:h-full">
                                                    <div className="xl:w-full w-fit h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada] rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                        <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                            <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                    Tạo kế hoạch sấy
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <div className="flex justify-center xl:h-full md:h-full">
                                                    <div className="xl:w-full w-fit h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada] rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                        <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                            <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                    Tạo kế hoạch sấy
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-center xl:h-full md:h-full">
                                                    <div className="xl:w-full w-fit h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5  mr-0 xl:p-8 md:p-8 bg-[#dadada] rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                        <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1  text-[transparent]">
                                                            <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                                    Tạo kế hoạch sấy
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </div>

                    {/* <div className="flex gap-x-3">
                        <div className="cursor-pointer text-base font-medium p-2 px-4 border-2 border-gray-200 bg-[#222222] text-white w-fit rounded-full  my-5">
                            Quản lý sấy gỗ
                        </div>
                        <div className="cursor-pointer text-base font-medium p-2 px-4 border-2 border-gray-200 bg-white w-fit rounded-full text-gray-500 my-5">
                            Quản lý sản xuất
                        </div>
                        <div className=" cursor-pointer text-base font-medium p-2 px-4 border-2 border-gray-200 bg-white w-fit rounded-full text-gray-500 my-5">
                            Quản lý bán hàng
                        </div>
                    </div> */}
                </div>
            </div>
        </Layout>
    );
}

export default Workspace;
