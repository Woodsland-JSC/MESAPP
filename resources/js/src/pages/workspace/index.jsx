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

function Workspace() {
    return (
        <Layout>
            {/* Container */}
            <div className="flex justify-center bg-[#F8F9F7] ">
                {/* Section */}
                <div className="w-screen  xl:p-12 p-6 px-5 xl:px-32 border-t border-gray-200">
                    {/* Breadcrumb */}
                    <div className="mb-4">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                <li>
                                    <div className="flex items-center">
                                        <a
                                            href="#"
                                            class="ml-1 text-sm font-medium text-[#17506B] md:ml-2"
                                        >
                                            Workspace
                                        </a>
                                    </div>
                                </li>
                                <li aria-current="page">
                                    <div class="flex items-center">
                                        <svg
                                            class="w-3 h-3 text-gray-400 mx-1"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 6 10"
                                        >
                                            <path
                                                stroke="currentColor"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="m1 9 4-4-4-4"
                                            />
                                        </svg>
                                        <span class="ml-1 text-sm font-medium text-[#17506B] md:ml-2 ">
                                            Quản lý sấy gỗ
                                        </span>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>

                    {/* Header */}
                    <div className="text-3xl font-bold mb-12">
                        Quản lý sấy gỗ
                    </div>

                    {/* Card Fields */}
                    <div className="flex justify-center">
                        <div className="grid grid-cols-3 xl:gap-x-7 gap-x-6 xl:gap-y-6 gap-y-6">
                            <Link to="/workspace/wood-sorting">
                                <div className="w-fit xl:flex xl:gap-x-6 max-w-sm items-center justify-center p-6 mr-0 xl:p-8 bg-white border-2 border-gray-200 rounded-3xl
                                xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                    <div className="text-xl flex justify-center h-fit w-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                                        <HiSquare3Stack3D className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                            Xếp sấy
                                        </h5>
                                        <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipisicing elit.
                                            Deserunt, vitae.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex xl:hidden justify-center text-center mt-2">Xếp sấy</div>
                            </Link>

                            <Link to="/workspace/create-drying-plan">
                                <div className="w-fit xl:flex xl:gap-x-6 max-w-sm items-center justify-center p-6 mr-0 xl:p-8 bg-white border-2 border-gray-200 rounded-3xl
                                xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                    <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                                        <HiClipboardDocumentList className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                            Tạo kế hoạch sấy
                                        </h5>
                                        <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipisicing elit.
                                            Deserunt, vitae.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex xl:hidden justify-center text-center mt-2">Tạo kế hoạch sấy</div>
                            </Link>

                            <Link to="/workspace/kiln-checking">
                                <div className="group w-fit xl:flex xl:gap-x-6 max-w-sm items-center justify-center p-6 mr-0 xl:p-8 bg-white border-2 border-gray-200 rounded-3xl
                                xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                    <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                                        <HiMagnifyingGlassCircle className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                            Kiểm tra lò sấy
                                        </h5>
                                        <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipisicing elit.
                                            Deserunt, vitae.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex xl:hidden justify-center text-center mt-2">Kiểm tra lò sấy</div>
                            </Link>

                            <Link to="/workspace/kiln">
                                <div className="w-fit xl:flex xl:gap-x-6 max-w-sm items-center justify-center p-6 mr-0 xl:p-8 bg-white border-2 border-gray-200 rounded-3xl
                                xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                    <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                                        <HiHomeModern className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                            Lò sấy
                                        </h5>
                                        <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipisicing elit.
                                            Deserunt, vitae.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex xl:hidden justify-center text-center mt-2">Lò sấy</div>
                            </Link>

                            <Link to="/workspace/load-into-kiln">
                                <div className="w-fit xl:flex xl:gap-x-6 max-w-sm items-center justify-center p-6 mr-0 xl:p-8 bg-white border-2 border-gray-200 rounded-3xl
                                xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                    <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                                        <HiRectangleStack className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                            Vào lò
                                        </h5>
                                        <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipisicing elit.
                                            Deserunt, vitae.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex xl:hidden justify-center text-center mt-2">Vào lò</div>
                            </Link>

                            <Link to="/workspace/drying-wood-checking">
                                <div className="w-fit xl:flex xl:gap-x-6 max-w-sm items-center justify-center p-6 mr-0 xl:p-8 bg-white border-2 border-gray-200 rounded-3xl
                                xl:rounded-xl hover:shadow-md transition-all duration-500 hover:scale-105">
                                    <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                                        <HiHandThumbUp className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h5 class="hidden xl:block mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                            Đánh giá mẻ sấy
                                        </h5>
                                        <p class="hidden xl:inline-block lg:inline-block text-[15px] font-normal text-gray-500 ">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipisicing elit.
                                            Deserunt, vitae.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex xl:hidden justify-center text-center mt-2">Đánh giá mẻ sấy</div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Workspace;
