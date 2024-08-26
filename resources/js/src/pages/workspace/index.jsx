import React, { useState, useEffect, useRef } from "react";
import Layout from "../../layouts/layout";
import { MdPlaylistAddCheckCircle } from "react-icons/md";
import { FaPallet } from "react-icons/fa";
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
import { LuLayers } from "react-icons/lu";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import useAppContext from "../../store/AppContext";
import "../../assets/styles/customTabs.css";
import "../../assets/styles/index.css";

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
                <div className="w-screen  xl:p-12 lg:p-12 md:p-10 p-6 py-4 px-5 xl:px-32 ">
                    {/* Header */}
                    <div className="xl:mb-8 lg:mb-8 md:mb-8 mb-5">
                        <div className="text-gray-600">Xin chào,</div>
                        <div className="xl:text-4xl lg:text-3xl md:text-3xl text-4xl  xl:mb-2 lg:mb-2 md:mb-2">
                            <span className="serif font-bold">
                                {user?.last_name}!
                            </span>
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

                            <TabPanels
                                px="0"
                                className="w-full flex justify-center"
                            >
                                <TabPanel
                                    className="xl:p-4 lg:p-4 md:p-4 p-0"
                                    style={{ padding: "1rem 0rem" }}
                                >
                                    {/* Cards List */}
                                    <div className="cusTabs w-full flex justify-center mt-1 xl:justify-normal">
                                        <div className="grid xl:grid-cols-3 xl:gap-x-6 gap-2 xl:gap-y-6 grid-cols-2">
                                            {[
                                                {
                                                    permission: "sepsay",
                                                    link: "/workspace/wood-sorting",
                                                    icon: <HiSquare3Stack3D />,
                                                    title: "Xếp sấy",
                                                    description:
                                                        "Tạo và xếp pallet để chuẩn bị cho vào lò.",
                                                },
                                                {
                                                    permission: "kehoachsay",
                                                    link: "/workspace/create-drying-plan",
                                                    icon: (
                                                        <HiClipboardDocumentList />
                                                    ),
                                                    title: "Tạo kế hoạch sấy",
                                                    description:
                                                        "Tạo kế hoạch sấy trên danh sách lò hiện có.",
                                                },
                                                {
                                                    permission: "vaolo",
                                                    link: "/workspace/load-into-kiln",
                                                    icon: <HiRectangleStack />,
                                                    title: "Vào lò",
                                                    description:
                                                        "Cho pallet đã tạo vào lò để chuẩn bị sấy.",
                                                },
                                                {
                                                    permission: "kiemtralo",
                                                    link: "/workspace/kiln-checking",
                                                    icon: <HiSearchCircle />,
                                                    title: "Kiểm tra lò sấy",
                                                    description:
                                                        "Kiểm tra lò sấy dựa trên các tiêu chuẩn hoạt động.",
                                                },
                                                {
                                                    permission: "losay",
                                                    link: "/workspace/kiln",
                                                    icon: <HiHomeModern />,
                                                    title: "Lò sấy",
                                                    description:
                                                        "Tiến hành khởi động quá trình sấy gỗ.",
                                                },
                                                {
                                                    permission: "danhgiame",
                                                    link: "/workspace/drying-wood-checking",
                                                    icon: <HiHandThumbUp />,
                                                    title: "Đánh giá mẻ sấy",
                                                    description:
                                                        "Đánh giá mẻ gỗ sau khi sấy và kết thúc quy trình.",
                                                },
                                            ].map(
                                                ({
                                                    permission,
                                                    link,
                                                    icon,
                                                    title,
                                                    description,
                                                }) =>
                                                    user.permissions?.includes(
                                                        permission
                                                    ) ? (
                                                        <Link
                                                            to={link}
                                                            key={permission}
                                                        >
                                                            <div className="z-10 flex justify-center xl:h-full lg:h-full md:h-full h-[12rem] w-full">
                                                                <div className="xl:w-full w-full flex xl:flex-row ml:flex-row md:flex-row flex-col xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center mr-0 xl:p-7 md:p-8 p-4 bg-white rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 xl:hover:scale-105">
                                                                    <div className="xl:h-full lg:h-full md:h-full h-[60%] w-full">
                                                                        <h5 className="serif mb-2 xl:text-2xl lg:text-2xl md:text-2xl text-[22px] text-left font-bold tracking-tight text-gray-900">
                                                                            {
                                                                                title
                                                                            }
                                                                        </h5>
                                                                        <p className="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500">
                                                                            {
                                                                                description
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex xl:items-start h-[40%] xl:h-full lg:h-full md:h-full xl:w-fit lg:w-fit md:w-fit w-full ">
                                                                        <div className=" text-3xl h-fit rounded-full m-1 p-3 bg-[#DAEAF1] text-[#17506b]">
                                                                            {
                                                                                icon
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ) : (
                                                        <div key={permission}>
                                                            <div className="flex justify-center w-full h-[12rem] xl:h-full lg:h-full md:h-full">
                                                                <div className="xl:w-full w-full h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5 mr-0 xl:p-8 md:p-8 bg-[#D5D5DB] rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                                    <div className="text-xl flex h-fit justify-center w-fit rounded-full p-4 m-1 text-[transparent]">
                                                                        <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                        </div>
                                                    )
                                            )}
                                        </div>
                                    </div>
                                </TabPanel>
                                <TabPanel
                                    className="xl:p-4 lg:p-4 md:p-4 p-0"
                                    style={{ padding: "1rem 0rem" }}
                                >
                                    {/* Cards List */}
                                    <div className="cusTabs w-full  flex justify-center mt-1 xl:justify-normal">
                                        <div className="grid xl:grid-cols-3 xl:gap-x-6 gap-2 xl:gap-y-6 grid-cols-2">
                                            {[
                                                {
                                                    permission: "CBG",
                                                    link: "/workspace/wood-working/finished-goods-receipt",
                                                    icon: (
                                                        <HiArchiveBoxArrowDown />
                                                    ),
                                                    title: "Sản lượng chế biến gỗ",
                                                    description:
                                                        "Nhập sản lượng theo công đoạn",
                                                    type: "CBG",
                                                },
                                                {
                                                    permission: "QCCBG",
                                                    link: "/workspace/wood-working/qc",
                                                    icon: <HiBadgeCheck />,
                                                    title: "Kiểm định chất lượng chế biến gỗ",
                                                    description:
                                                        "Xử lý lỗi nhập thành phẩm.",
                                                    type: "CBG",
                                                },
                                                {
                                                    permission: "VCN",
                                                    link: "/workspace/plywood/finished-goods-receipt",
                                                    icon: (
                                                        <HiArchiveBoxArrowDown />
                                                    ),
                                                    title: "Sản lượng ván công nghiệp",
                                                    description:
                                                        "Nhập sản lượng theo công đoạn",
                                                    type: "VCN",
                                                },
                                                {
                                                    permission: "QCVCN",
                                                    link: "/workspace/plywood/qc",
                                                    icon: <HiBadgeCheck />,
                                                    title: "Kiểm định chất lượng ván công nghiệp",
                                                    description:
                                                        "Xử lý lỗi nhập thành phẩm.",
                                                    type: "VCN",
                                                },
                                                {
                                                    permission: "ND",
                                                    link: "/workspace/kiln",
                                                    icon: <HiHomeModern />,
                                                    title: "Sản lượng nội địa",
                                                    description:
                                                        "Nhập sản lượng lắp đặt khối nội địa",
                                                    type: "ND",
                                                },
                                                {
                                                    permission: "QCND",
                                                    link: "/workspace/drying-wood-checking",
                                                    icon: <HiHandThumbUp />,
                                                    title: "Kiểm định chất lượng nội địa",
                                                    description:
                                                        "Đánh giá mẻ gỗ sau khi sấy và kết thúc quy trình.",
                                                    type: "ND",
                                                },
                                            ].map(
                                                ({
                                                    permission,
                                                    link,
                                                    icon,
                                                    title,
                                                    description,
                                                    type,
                                                }) =>
                                                    user.permissions?.includes(
                                                        permission
                                                    ) ? (
                                                        <Link
                                                            to={link}
                                                            key={permission}
                                                        >
                                                            <div className="z-10 flex justify-center xl:h-full lg:h-full md:h-full h-[12rem] w-full">
                                                                <div className="xl:w-full w-fit flex xl:flex-row ml:flex-row md:flex-row flex-col xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center mr-0 xl:p-7 md:p-8 p-4 bg-white rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 xl:hover:scale-105">
                                                                    <div className="xl:h-full lg:h-full md:h-full h-[60%] w-full">
                                                                        <h5 className="serif mb-2 xl:text-2xl lg:text-2xl md:text-2xl text-[21px] font-bold tracking-tight text-gray-900">
                                                                            {
                                                                                title
                                                                            }
                                                                        </h5>
                                                                        <p className="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500">
                                                                            {
                                                                                description
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex xl:items-start h-[40%] xl:h-full lg:h-full md:h-full xl:w-fit lg:w-fit md:w-fit w-full ">
                                                                        <div className={`text-3xl h-fit rounded-full m-1 p-3  ${type === "CBG" ? "bg-[#DAF1E8] text-green-900" : type === "VCN" ? "bg-[#f9eeff] text-violet-900" : type === "ND" ? "bg-[#ffeef2] text-red-900" : "bg-[#F5F5F5]"}`} >
                                                                            {
                                                                                icon
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ) : (
                                                        <div key={permission}>
                                                            <div className="flex justify-center w-full h-[12rem] xl:h-full lg:h-full md:h-full">
                                                                <div className="xl:w-full w-full h-full flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-5 mr-0 xl:p-8 md:p-8 bg-[#D5D5DB] rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl">
                                                                    <div className="text-xl flex h-fit justify-center w-fit rounded-full p-4 m-1 text-[transparent]">
                                                                        <HiArchiveBoxArrowDown className="xl:w-8 xl:h-8 lg:w-8 lg:h-8 md:w-8 md:h-8 w-10 h-10" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            </div>
                                                    )
                                            )}
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
