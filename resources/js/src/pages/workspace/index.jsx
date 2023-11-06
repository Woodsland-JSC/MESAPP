import React from "react";
import Layout from "../../layouts/layout";
import { 
  HiSquare3Stack3D,
  HiMagnifyingGlassCircle,
  HiHomeModern,
  HiRectangleStack,
  HiHandThumbUp,
  HiClipboardDocumentList
 } from "react-icons/hi2";

function Workspace() {
    return (
        <Layout>
            <div className="flex justify-center bg-white h-full border-t border-gray-200">
                <div className="p-16 px-40">
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
                    <div className="text-3xl font-bold">Quản lý sấy gỗ</div>

                    {/* Card Fields */}
                    <div className="grid grid-cols-3 gap-4 mt-12">
                        <a href="#" className="flex gap-x-6 max-w-sm p-6 bg-white border-2 border-gray-200 rounded-lg hover:shadow-md transition-all duration-500 hover:scale-105"
                        >
                            <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                              <HiSquare3Stack3D className="w-7 h-7" />
                            </div>
                            <div>
                              <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                  Xếp sấy
                              </h5>
                              <p class="text-[15px] font-normal text-gray-500 ">
                                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt, vitae.
                              </p>
                            </div>    
                        </a>

                        <a href="#" className="flex gap-x-6 max-w-sm p-6 bg-white border-2 border-gray-200 rounded-lg hover:shadow-md transition-all duration-500 hover:scale-105"
                        >
                            <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                              <HiHomeModern className="w-7 h-7" />
                            </div>
                            <div>
                              <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                  Lò sấy
                              </h5>
                              <p class="text-[15px] font-normal text-gray-500 ">
                                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt, vitae.
                              </p>
                            </div>
                            
                        </a>

                        <a href="#" className="card2 flex gap-x-6 max-w-sm p-6 bg-white border-2 border-gray-200 rounded-lg hover:shadow-md transition-all duration-500 hover:scale-105"
                        >
                            <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                              <HiRectangleStack className="w-7 h-7" />
                            </div>
                            <div>
                              <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                  Vào lò
                              </h5>
                              <p class="text-[15px] font-normal text-gray-500 ">
                                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt, vitae.
                              </p>
                            </div>       
                        </a>

                        <a href="#" className="flex gap-x-6 max-w-sm p-6 bg-white border-2 border-gray-200 rounded-lg hover:shadow-md transition-all duration-500 hover:scale-105"
                        >
                            <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                              <HiHandThumbUp className="w-7 h-7" />
                            </div>
                            <div>
                              <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                  Đánh giá mẻ sấy
                              </h5>
                              <p class="text-[15px] font-normal text-gray-500 ">
                                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt, vitae.
                              </p>
                            </div>
                        </a>

                        <a href="#" className="flex gap-x-6 max-w-sm p-6 bg-white border-2 border-gray-200 rounded-lg hover:shadow-md transition-all duration-500 hover:scale-105">
                            <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                              <HiClipboardDocumentList className="w-7 h-7" />
                            </div>
                            <div>
                              <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                  Tạo kế hoạch sấy
                              </h5>
                              <p class="text-[15px] font-normal text-gray-500 ">
                                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt, vitae.
                              </p>
                            </div>     
                        </a>

                        <a href="#" className="flex gap-x-6 max-w-sm p-6 bg-white border-2 border-gray-200 rounded-lg hover:shadow-md transition-all duration-500 hover:scale-105" >
                            <div className="text-xl h-fit rounded-full m-1 p-4 bg-[#DAEAF1] text-[#17506b]">
                              <HiMagnifyingGlassCircle className="w-7 h-7" />
                            </div>
                            <div>
                              <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 ">
                                  Kiểm tra lò sấy
                              </h5>
                              <p class="text-[15px] font-normal text-gray-500 ">
                                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt, vitae.
                              </p>
                            </div>
                            
                        </a>
                        
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Workspace;
