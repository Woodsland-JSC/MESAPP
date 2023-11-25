import React from "react";
import Layout from "../../layouts/layout";
import {
    HiSquare3Stack3D,
    HiMagnifyingGlassCircle,
    HiHomeModern,
    HiRectangleStack,
    HiHandThumbUp,
    HiClipboardDocumentList,
} from "react-icons/hi2";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import useAppContext from "../../store/AppContext";
import "../../assets/styles/customTabs.css"


function Workspace() {
    const { user, setUser, isAuthenticated, setIsAuthenticated } =
        useAppContext();

    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center bg-[#F8F9F7] ">
                {/* Section */}
                <div className="w-screen  xl:p-12 p-6 px-5 xl:px-32 ">
                    {/* Header */}
                    <div className="mb-12">
                        <div className="text-3xl font-bold mb-2">
                            Xin chào, {user?.first_name}! 👋
                        </div>
                        <div className="text-gray-500">
                            Chúc một ngày làm việc tốt lành.
                        </div>
                    </div>

                    {/* Card Fields */}
                    <Tabs
                        variant="soft-rounded"
                        colorScheme="blackAlpha"
                    >
                        <TabList>
                            <Tab>Quản lý sấy gỗ</Tab>
                            <Tab>Quản lý sản xuất</Tab>
                            <Tab>Quản lý bán hàng</Tab>
                        </TabList>
                        <TabPanels px="0" className="">
                            <TabPanel className="" style={{ padding: "1rem 0rem" }}>
                                {/* Cards List */}
                                <div className="cusTabs flex justify-center mt-1 xl:justify-normal">
                                    <div className="grid xl:grid-cols-3 xl:gap-x-7 gap-x-8 xl:gap-y-6 grid-cols-2 gap-y-7">
                                        {user.permissions?.includes("sepsay") && (<Link to="/workspace/wood-sorting">
                                            <div className="flex justify-center xl:h-full md:h-full">
                                                <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-200 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                    <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1 bg-[#DAEAF1] text-[#17506b]">
                                                        <HiSquare3Stack3D className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <h5 class="hidden xl:block lg:block  mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                            Xếp sấy
                                                        </h5>
                                                        <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                            Tạo và xếp pallet để
                                                            chuẩn bị cho vào lò.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex xl:hidden justify-center text-center mt-2">
                                                Xếp sấy
                                            </div>
                                        </Link>)}

                                        {user.permissions?.includes("kehoachsay") && (<Link to="/workspace/create-drying-plan">
                                            <div className="flex justify-center xl:h-full md:h-full">
                                                <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-200 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                    <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                                                        <HiClipboardDocumentList className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                            Tạo kế hoạch sấy
                                                        </h5>
                                                        <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                            Tạo kế hoạch sấy
                                                            trên danh sách lò
                                                            hiện có.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex xl:hidden justify-center text-center mt-2">
                                                Tạo kế hoạch sấy
                                            </div>
                                        </Link>)}

                                        {user.permissions?.includes("vaolo") && (<Link to="/workspace/load-into-kiln">
                                            <div className="flex justify-center xl:h-full md:h-full">
                                                <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-200 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                    <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                                                        <HiRectangleStack className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                            Vào lò
                                                        </h5>
                                                        <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                            Cho pallet đã tạo
                                                            vào lò để chuẩn bị
                                                            sấy.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex xl:hidden justify-center text-center mt-2">
                                                Vào lò
                                            </div>
                                        </Link>)}

                                        {user.permissions?.includes("kiemtralo") && (<Link to="/workspace/kiln-checking">
                                            <div className="flex justify-center xl:h-full md:h-full">
                                                <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-200 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                    <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                                                        <HiMagnifyingGlassCircle className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                            Kiểm tra lò sấy
                                                        </h5>
                                                        <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                            Kiểm tra lò sấy dựa
                                                            trên các tiêu chuẩn
                                                            hoạt động.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex xl:hidden justify-center text-center mt-2">
                                                Kiểm tra lò sấy
                                            </div>
                                        </Link>)}

                                        {user.permissions?.includes("losay") && (<Link to="/workspace/kiln">
                                            <div className="flex justify-center xl:h-full md:h-full">
                                                <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-200 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                    <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                                                        <HiHomeModern className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                            Lò sấy
                                                        </h5>
                                                        <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                            Tiến hành khởi động
                                                            quá trình sấy gỗ.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex xl:hidden justify-center text-center mt-2">
                                                Lò sấy
                                            </div>
                                        </Link>)}

                                        {user.permissions?.includes("danhgiame") && (<Link to="/workspace/drying-wood-checking">
                                            <div className="flex justify-center xl:h-full md:h-full">
                                                <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-200 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                    <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                                                        <HiHandThumbUp className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                            Đánh giá mẻ sấy
                                                        </h5>
                                                        <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                            Đánh giá mẻ gỗ sau
                                                            khi sấy và kết thúc
                                                            quy trình.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex xl:hidden justify-center text-center mt-2">
                                                Đánh giá mẻ sấy
                                            </div>
                                        </Link>)}
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel style={{ padding: "1rem 0rem" }}>
                                {/* Cards List */}
                                <div className="cusTabs flex justify-center mt-1 xl:justify-normal">
                                    <div className="grid xl:grid-cols-3 xl:gap-x-7 gap-x-8 xl:gap-y-6 grid-cols-2 gap-y-7">
                                        <Link to="/workspace/finished-goods-receipt">
                                            <div className="flex justify-center xl:h-full md:h-full">
                                                <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-200 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                    <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1 bg-[#DAEAF1] text-[#17506b]">
                                                        <HiSquare3Stack3D className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <h5 class="hidden xl:block lg:block  mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                            Nhập thành phẩm
                                                        </h5>
                                                        <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                            Lorem ipsum dolor
                                                            sit, amet
                                                            consectetur
                                                            adipisicing elit.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex xl:hidden justify-center text-center mt-2">
                                                Xếp sấy
                                            </div>
                                        </Link>

                                        <div className="flex justify-center xl:h-full md:h-full">
                                            <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-[#EDEEEC]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl"></div>
                                        </div>
                                        <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                            Tạo kế hoạch sấy
                                        </div>

                                        <div className="flex justify-center xl:h-full md:h-full">
                                            <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-[#EDEEEC]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl"></div>
                                        </div>
                                        <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                            Tạo kế hoạch sấy
                                        </div>

                                        <div className="flex justify-center xl:h-full md:h-full">
                                            <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-[#EDEEEC]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl"></div>
                                        </div>
                                        <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                            Tạo kế hoạch sấy
                                        </div>

                                        <div className="flex justify-center xl:h-full md:h-full">
                                            <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-[#EDEEEC]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl"></div>
                                        </div>
                                        <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                            Tạo kế hoạch sấy
                                        </div>

                                        <div className="flex justify-center xl:h-full md:h-full">
                                            <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-[#EDEEEC]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl"></div>
                                        </div>
                                        <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                            Tạo kế hoạch sấy
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel style={{ padding: "1rem 0rem" }}>
                                {/* Cards List */}
                                <div className="cusTabs flex justify-center mt-1 xl:justify-normal">
                                    <div className="grid xl:grid-cols-3 xl:gap-x-7 gap-x-8 xl:gap-y-6 grid-cols-2 gap-y-7">
                                        <Link to="/workspace/wood-sorting">
                                            <div className="flex justify-center xl:h-full md:h-full">
                                                <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-white border-2 border-gray-200 rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                                    <div className="text-xl flex h-fit justify-center w-fit rounded-full  p-4 m-1 bg-[#DAEAF1] text-[#17506b]">
                                                        <HiSquare3Stack3D className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <h5 class="hidden xl:block lg:block  mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                                            Giá thành kế hoạch
                                                        </h5>
                                                        <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                                            Lorem ipsum dolor
                                                            sit amet
                                                            consectetur,
                                                            adipisicing elit.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex xl:hidden justify-center text-center mt-2">
                                                Xếp sấy
                                            </div>
                                        </Link>

                                        <div className="flex justify-center xl:h-full md:h-full">
                                            <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-[#EDEEEC]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl"></div>
                                        </div>
                                        <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                            Tạo kế hoạch sấy
                                        </div>

                                        <div className="flex justify-center xl:h-full md:h-full">
                                            <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-[#EDEEEC]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl"></div>
                                        </div>
                                        <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                            Tạo kế hoạch sấy
                                        </div>

                                        <div className="flex justify-center xl:h-full md:h-full">
                                            <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-[#EDEEEC]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl"></div>
                                        </div>
                                        <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                            Tạo kế hoạch sấy
                                        </div>

                                        <div className="flex justify-center xl:h-full md:h-full">
                                            <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-[#EDEEEC]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl"></div>
                                        </div>
                                        <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                            Tạo kế hoạch sấy
                                        </div>

                                        <div className="flex justify-center xl:h-full md:h-full">
                                            <div className="xl:w-full w-fit flex xl:gap-x-6 max-w-sm items-center xl:justify-start md:justify-start justify-center p-6  mr-0 xl:p-8 md:p-8 bg-[#EDEEEC]  rounded-3xl xl:h-[10rem] md:h-[10rem] xl:rounded-xl"></div>
                                        </div>
                                        <div className="flex xl:hidden opacity-0 justify-center text-center mt-2">
                                            Tạo kế hoạch sấy
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>

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
