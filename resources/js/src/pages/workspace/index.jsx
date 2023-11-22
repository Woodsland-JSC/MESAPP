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
import { Link } from "react-router-dom";
import useAppContext from "../../store/AppContext";

function Workspace() {

    const { user, setUser, isAuthenticated, setIsAuthenticated } =
        useAppContext();

    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center bg-[#F8F9F7] ">
                {/* Section */}
                <div className="w-screen  xl:p-12 p-6 px-5 xl:px-32 ">
                    {/* Breadcrumb */}
                    {/* <div className="mb-4 ">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center opacity-0">
                                        <a
                                            href="#"
                                            class="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            Workspace
                                        </a>
                                    </div>
                                </li>
                                
                            </ol>
                        </nav>
                    </div> */}

                    {/* Header */}
                    <div className="mb-10">
                        <div className="text-3xl font-bold mb-2">
                            Xin chào, {user?.first_name}! 👋
                        </div>
                        <div className="text-gray-500">Mọi thứ đã sẵn sàng cho công việc của bạn.</div>
                    </div>
                    

                    {/* Card Fields */}
                    <div className="text-xl font-semibold my-5">Quản lý sấy gỗ</div>
                    <div className="flex justify-center xl:justify-normal">
                        <div className="grid xl:grid-cols-3 xl:gap-x-7 gap-x-8 xl:gap-y-6 grid-cols-2 gap-y-7">
                            <Link to="/workspace/wood-sorting">
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
                                                Tạo và xếp pallet để chuẩn bị
                                                cho vào lò.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex xl:hidden justify-center text-center mt-2">
                                    Xếp sấy
                                </div>
                            </Link>

                            <Link to="/workspace/create-drying-plan">
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
                                                Tạo kế hoạch sấy trên danh sách
                                                lò hiện có.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex xl:hidden justify-center text-center mt-2">
                                    Tạo kế hoạch sấy
                                </div>
                            </Link>

                            <Link to="/workspace/load-into-kiln">
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
                                                Cho pallet đã tạo vào lò để
                                                chuẩn bị sấy.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex xl:hidden justify-center text-center mt-2">
                                    Vào lò
                                </div>
                            </Link>

                            <Link to="/workspace/kiln-checking">
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
                                                Kiểm tra lò sấy dựa trên các
                                                tiêu chuẩn hoạt động.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex xl:hidden justify-center text-center mt-2">
                                    Kiểm tra lò sấy
                                </div>
                            </Link>

                            <Link to="/workspace/kiln">
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
                                                Tiến hành khởi động quá trình sấy gỗ.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex xl:hidden justify-center text-center mt-2">
                                    Lò sấy
                                </div>
                            </Link>

                            <Link to="/workspace/drying-wood-checking">
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
                                                Đánh giá thành phẩm sau khi sấy
                                                và hoàn thành quy trình sấy gỗ.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex xl:hidden justify-center text-center mt-2">
                                    Đánh giá mẻ sấy
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Workspace;
